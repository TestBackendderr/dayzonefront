import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { alterEgosAPI } from '../../services/api';
import Modal from '../Modal/Modal';
import './AlterEgo.scss';

const STATUS_LABELS = {
  active: 'Активно',
  inactive: 'Неактивно',
};

const EMPTY_FORM = {
  realCallsign: '',
  alterEgo: '',
  shortHistory: '',
  status: 'active',
  notes: '',
};

const AlterEgo = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchBy, setSearchBy] = useState('realCallsign');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
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
      const data = await alterEgosAPI.getAll(searchBy, searchTerm, statusFilter);
      setItems(data.alterEgos || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки альтерэго');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchBy, searchTerm, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(loadItems, searchTerm ? 400 : 0);
    return () => clearTimeout(timeoutId);
  }, [loadItems, searchTerm]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      realCallsign: item.realCallsign,
      alterEgo: item.alterEgo,
      shortHistory: item.shortHistory || '',
      status: item.status,
      notes: item.notes || '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingItem) {
        await alterEgosAPI.update(editingItem.id, formData);
        showModal('Успех', 'Альтерэго обновлено', 'success');
      } else {
        await alterEgosAPI.create(formData);
        showModal('Успех', 'Альтерэго добавлено', 'success');
      }
      setShowForm(false);
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Удалить альтерэго «${item.alterEgo}»?`)) return;
    try {
      await alterEgosAPI.delete(item.id);
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
    <div className="alter-ego-archive">
      <div className="archive-header">
        <h2>Альтерэго</h2>
        <p>База прикрытий и легенд группировки</p>
      </div>

      {isAdmin && (
        <div className="admin-hint">
          Режим просмотра: администратор видит альтерэго всех групп без редактирования.
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="search-section">
        <div className="search-controls">
          <div>
            <label htmlFor="ae-search-by">Поиск по</label>
            <select
              id="ae-search-by"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="realCallsign">Реальному позывному</option>
              <option value="alterEgo">Альтерэго</option>
            </select>
          </div>
          <div>
            <label htmlFor="ae-search-term">Запрос</label>
            <input
              id="ae-search-term"
              type="text"
              placeholder={searchBy === 'alterEgo' ? 'Альтерэго...' : 'Позывной...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ae-toolbar">
        <div className="status-filter">
          <span className="toolbar-label">Статус</span>
          <div className="type-filter-buttons">
            {[
              { id: 'all', label: 'Все' },
              { id: 'active', label: 'Активно' },
              { id: 'inactive', label: 'Неактивно' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`type-filter-btn ${statusFilter === item.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {canEdit && (
          <button type="button" className="btn-add-ae" onClick={openCreateForm}>
            + Добавить альтерэго
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="ae-form-panel">
          <h3>{editingItem ? 'Редактировать альтерэго' : 'Новое альтерэго'}</h3>
          <form onSubmit={handleFormSubmit} className="contract-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="realCallsign">Реальный позывной *</label>
                <input
                  id="realCallsign"
                  name="realCallsign"
                  value={formData.realCallsign}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="alterEgo">Альтерэго *</label>
                <input
                  id="alterEgo"
                  name="alterEgo"
                  value={formData.alterEgo}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="shortHistory">Короткая история</label>
              <textarea
                id="shortHistory"
                name="shortHistory"
                value={formData.shortHistory}
                onChange={handleFormChange}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Статус</label>
                <select id="status" name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="active">Активно</option>
                  <option value="inactive">Неактивно</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Заметки</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows={2}
              />
            </div>

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

      <div className="ae-list-wrap">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="alter-ego-grid">
            {items.map((item) => (
              <div key={item.id} className="alter-ego-card">
                {isAdmin && (
                  <div className="ae-group-tag">Группа: {item.groupName}</div>
                )}
                <div className="ae-card-header">
                  <div>
                    <div className="ae-real-callsign">{item.realCallsign}</div>
                    <div className="ae-alter-ego">→ {item.alterEgo}</div>
                  </div>
                  <span className={`ae-status status-${item.status}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <div className="ae-details">
                  {item.shortHistory && (
                    <div className="ae-detail-block">
                      <span className="ae-label">Короткая история</span>
                      {item.shortHistory}
                    </div>
                  )}
                  {item.notes && (
                    <div className="ae-detail-block">
                      <span className="ae-label">Заметки</span>
                      {item.notes}
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div className="ae-actions">
                    <button type="button" className="action-btn" onClick={() => openEditForm(item)}>
                      ✏️ Редактировать
                    </button>
                    <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(item)}>
                      🗑️ Удалить
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

export default AlterEgo;
