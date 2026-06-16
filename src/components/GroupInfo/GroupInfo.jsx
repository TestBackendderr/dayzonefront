import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { groupInfoAPI } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import Modal from '../Modal/Modal';
import './GroupInfo.scss';

const EMPTY_FORM = {
  title: '',
  body: '',
  photo: null,
  photoPreview: null,
};

const InfoNotesChat = ({ item, canEdit, noteInput, onInputChange, onSend, sending }) => {
  const notes = item.notes || [];

  return (
    <div className="info-chat">
      <div className="info-chat-title">Заметки (чат)</div>
      <div className="info-chat-messages">
        {notes.length === 0 ? (
          <div className="info-chat-empty">Заметок пока нет</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="info-chat-msg">
              <div className="info-chat-author">{note.username}</div>
              <div className="info-chat-text">{note.message}</div>
              <div className="info-chat-time">
                {note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU') : ''}
              </div>
            </div>
          ))
        )}
      </div>
      {canEdit && (
        <div className="info-chat-input">
          <textarea
            value={noteInput}
            onChange={(e) => onInputChange(item.id, e.target.value)}
            placeholder="Дополнить в чате..."
            rows={2}
          />
          <button type="button" onClick={() => onSend(item.id)} disabled={sending}>
            {sending ? '...' : 'Отправить'}
          </button>
        </div>
      )}
    </div>
  );
};

const GroupInfo = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [noteInputs, setNoteInputs] = useState({});
  const [noteSaving, setNoteSaving] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isAdmin = user.role === 'Admin';
  const canEdit = !isAdmin && user.role;

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await groupInfoAPI.getAll(searchTerm);
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const t = setTimeout(loadItems, searchTerm ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadItems, searchTerm]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      body: item.body || '',
      photo: null,
      photoPreview: item.photo ? `${API_CONFIG.FILE_BASE_URL}${item.photo}` : null,
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      photo: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        photo: formData.photo,
      };

      if (editingItem) {
        await groupInfoAPI.update(editingItem.id, payload);
        showModal('Успех', 'Запись обновлена', 'success');
      } else {
        await groupInfoAPI.create(payload);
        showModal('Успех', 'Запись добавлена', 'success');
      }
      setShowForm(false);
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddNote = async (itemId) => {
    const message = (noteInputs[itemId] || '').trim();
    if (!message) return;

    try {
      setNoteSaving(itemId);
      const data = await groupInfoAPI.addNote(itemId, message);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, notes: [...(item.notes || []), data.note] }
            : item
        )
      );
      setNoteInputs((prev) => ({ ...prev, [itemId]: '' }));
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось отправить', 'error');
    } finally {
      setNoteSaving(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Удалить «${item.title}»?`)) return;
    try {
      await groupInfoAPI.delete(item.id);
      showModal('Успех', 'Запись удалена', 'success');
      await loadItems();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Ошибка удаления', 'error');
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  return (
    <div className="group-info-page">
      <div className="info-header">
        <h2>Информация</h2>
        <p>Справочные материалы и заметки группировки</p>
      </div>

      {isAdmin && (
        <div className="admin-hint">
          Режим просмотра: администратор видит информацию всех групп без редактирования.
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="info-toolbar">
        <div className="search-input-wrap">
          <label htmlFor="info-search">Поиск</label>
          <input
            id="info-search"
            type="text"
            placeholder="Название или текст..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canEdit && (
          <button type="button" className="btn-add-info" onClick={openCreateForm}>
            + Добавить запись
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="info-form-panel">
          <h3>{editingItem ? 'Редактировать' : 'Новая запись'}</h3>
          <form onSubmit={handleFormSubmit} className="contract-form">
            <div className="form-group">
              <label htmlFor="info-title">Название *</label>
              <input
                id="info-title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="info-body">Текст заметки *</label>
              <textarea
                id="info-body"
                name="body"
                value={formData.body}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="info-photo">Фото (необязательно)</label>
              <input id="info-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
            {formData.photoPreview && (
              <div className="photo-preview">
                <img src={formData.photoPreview} alt="Превью" />
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={formLoading}>
                Отмена
              </button>
              <button type="submit" className="btn-submit" disabled={formLoading}>
                {formLoading ? 'Сохранение...' : editingItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="info-list-wrap">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="info-grid">
            {items.map((item) => (
              <div key={item.id} className="info-card">
                {item.photo && (
                  <div className="info-photo-wrap">
                    <a
                      href={`${API_CONFIG.FILE_BASE_URL}${item.photo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={`${API_CONFIG.FILE_BASE_URL}${item.photo}`} alt={item.title} />
                    </a>
                  </div>
                )}
                <div className="info-card-body">
                  {isAdmin && <div className="info-group-tag">{item.groupName}</div>}
                  <div className="info-title">{item.title}</div>
                  <div className="info-body">{item.body}</div>
                  <InfoNotesChat
                    item={item}
                    canEdit={canEdit}
                    noteInput={noteInputs[item.id] || ''}
                    onInputChange={(id, val) => setNoteInputs((prev) => ({ ...prev, [id]: val }))}
                    onSend={handleAddNote}
                    sending={noteSaving === item.id}
                  />
                </div>
                {canEdit && (
                  <div className="info-actions">
                    <button type="button" className="action-btn" onClick={() => openEditForm(item)}>
                      ✏️ Изм.
                    </button>
                    <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(item)}>
                      🗑️ Удал.
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-operations">
            <p>Записей не найдено</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default GroupInfo;
