import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { groupMapsAPI } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import Modal from '../Modal/Modal';
import './GroupMaps.scss';

const EMPTY_FORM = {
  title: '',
  initialNote: '',
  photo: null,
  photoPreview: null,
};

const MapNotesChat = ({ map, canEdit, noteInput, onInputChange, onSend, sending }) => {
  const notes = map.notes || [];

  return (
    <div className="map-chat">
      <div className="map-chat-title">Заметки (чат)</div>
      <div className="map-chat-messages">
        {notes.length === 0 ? (
          <div className="map-chat-empty">Заметок пока нет</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="map-chat-msg">
              <div className="map-chat-author">{note.username}</div>
              <div className="map-chat-text">{note.message}</div>
              <div className="map-chat-time">
                {note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU') : ''}
              </div>
            </div>
          ))
        )}
      </div>
      {canEdit && (
        <div className="map-chat-input">
          <textarea
            value={noteInput}
            onChange={(e) => onInputChange(map.id, e.target.value)}
            placeholder="Дополнить заметку..."
            rows={2}
          />
          <button type="button" onClick={() => onSend(map.id)} disabled={sending}>
            {sending ? '...' : 'Отправить'}
          </button>
        </div>
      )}
    </div>
  );
};

const GroupMaps = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMap, setEditingMap] = useState(null);
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

  const loadMaps = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await groupMapsAPI.getAll(searchTerm);
      setMaps(data.maps || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки карт');
      setMaps([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const t = setTimeout(loadMaps, searchTerm ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadMaps, searchTerm]);

  const openCreateForm = () => {
    setEditingMap(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (map) => {
    setEditingMap(map);
    setFormData({
      title: map.title,
      initialNote: '',
      photo: null,
      photoPreview: map.photo ? `${API_CONFIG.FILE_BASE_URL}${map.photo}` : null,
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
      if (editingMap) {
        await groupMapsAPI.update(editingMap.id, {
          title: formData.title,
          photo: formData.photo,
        });
        showModal('Успех', 'Карта обновлена', 'success');
      } else {
        if (!formData.photo) {
          setError('Выберите фото карты');
          setFormLoading(false);
          return;
        }
        await groupMapsAPI.create({
          title: formData.title,
          initialNote: formData.initialNote,
          photo: formData.photo,
        });
        showModal('Успех', 'Карта добавлена', 'success');
      }
      setShowForm(false);
      await loadMaps();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddNote = async (mapId) => {
    const message = (noteInputs[mapId] || '').trim();
    if (!message) return;

    try {
      setNoteSaving(mapId);
      const data = await groupMapsAPI.addNote(mapId, message);
      setMaps((prev) =>
        prev.map((m) =>
          m.id === mapId
            ? { ...m, notes: [...(m.notes || []), data.note] }
            : m
        )
      );
      setNoteInputs((prev) => ({ ...prev, [mapId]: '' }));
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось отправить заметку', 'error');
    } finally {
      setNoteSaving(null);
    }
  };

  const handleDelete = async (map) => {
    if (!window.confirm(`Удалить карту «${map.title}»?`)) return;
    try {
      await groupMapsAPI.delete(map.id);
      showModal('Успех', 'Карта удалена', 'success');
      await loadMaps();
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
    <div className="group-maps">
      <div className="maps-header">
        <h2>Карты</h2>
        <p>Картографические материалы группировки</p>
      </div>

      {isAdmin && (
        <div className="admin-hint">
          Режим просмотра: администратор видит карты всех групп без редактирования.
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="maps-toolbar">
        <div className="search-input-wrap">
          <label htmlFor="map-search">Поиск по названию</label>
          <input
            id="map-search"
            type="text"
            placeholder="Название карты..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canEdit && (
          <button type="button" className="btn-add-map" onClick={openCreateForm}>
            + Добавить карту
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="map-form-panel">
          <h3>{editingMap ? 'Редактировать карту' : 'Новая карта'}</h3>
          <form onSubmit={handleFormSubmit} className="contract-form">
            <div className="form-group">
              <label htmlFor="map-title">Название *</label>
              <input
                id="map-title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
            {!editingMap && (
              <div className="form-group">
                <label htmlFor="map-initial-note">Первая заметка</label>
                <textarea
                  id="map-initial-note"
                  name="initialNote"
                  value={formData.initialNote}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Необязательно — можно добавить позже в чате"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="map-photo">Фото карты *</label>
              <input
                id="map-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required={!editingMap}
              />
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
                {formLoading ? 'Сохранение...' : editingMap ? 'Сохранить' : 'Загрузить'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="maps-list-wrap">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка карт...</p>
          </div>
        ) : maps.length > 0 ? (
          <div className="maps-grid">
            {maps.map((map) => (
              <div key={map.id} className="map-card">
                <div className="map-photo-wrap">
                  {map.photo ? (
                    <a
                      href={`${API_CONFIG.FILE_BASE_URL}${map.photo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={`${API_CONFIG.FILE_BASE_URL}${map.photo}`} alt={map.title} />
                    </a>
                  ) : (
                    <div className="map-chat-empty">Нет фото</div>
                  )}
                </div>
                <div className="map-card-body">
                  {isAdmin && <div className="map-group-tag">{map.groupName}</div>}
                  <div className="map-title">{map.title}</div>
                  <MapNotesChat
                    map={map}
                    canEdit={canEdit}
                    noteInput={noteInputs[map.id] || ''}
                    onInputChange={(id, val) => setNoteInputs((prev) => ({ ...prev, [id]: val }))}
                    onSend={handleAddNote}
                    sending={noteSaving === map.id}
                  />
                </div>
                {canEdit && (
                  <div className="map-actions">
                    <button type="button" className="action-btn" onClick={() => openEditForm(map)}>
                      ✏️ Изм.
                    </button>
                    <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(map)}>
                      🗑️ Удал.
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-operations">
            <p>Карт не найдено</p>
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

export default GroupMaps;
