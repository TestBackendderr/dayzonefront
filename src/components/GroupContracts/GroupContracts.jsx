import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { groupContractsAPI } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import Modal from '../Modal/Modal';
import './GroupContracts.scss';

const STATUS_TABS = [
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Выполненные' },
  { id: 'cancelled', label: 'Отменённые' },
];

const STATUS_LABELS = {
  active: 'Активный',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const EMPTY_FORM = {
  title: '',
  amount: '',
  goal: '',
  details: '',
  docxLink: '',
  photo: null,
  photoPreview: null,
  removePhoto: false,
};

const GroupContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [expandedId, setExpandedId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [noteLoading, setNoteLoading] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isAdmin = user.role === 'Admin';
  const canEdit = !isAdmin && user.role;

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await groupContractsAPI.getAll(statusFilter);
      setContracts(data.contracts || []);
      setDetailsCache({});
      setExpandedId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки контрактов');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const loadContractDetail = async (id) => {
    try {
      setDetailsLoading(id);
      const data = await groupContractsAPI.getById(id);
      setDetailsCache((prev) => ({ ...prev, [id]: data.contract }));
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось загрузить детали', 'error');
    } finally {
      setDetailsLoading(null);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailsCache[id]) {
      await loadContractDetail(id);
    }
  };

  const openCreateForm = () => {
    setEditingContract(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (contract) => {
    const detail = detailsCache[contract.id] || contract;
    setEditingContract(contract);
    setFormData({
      title: detail.title,
      amount: String(detail.amount),
      goal: detail.goal,
      details: detail.details || '',
      docxLink: detail.docxLink || '',
      photo: null,
      photoPreview: detail.photo ? `${API_CONFIG.FILE_BASE_URL}${detail.photo}` : null,
      removePhoto: false,
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
      removePhoto: false,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        amount: formData.amount,
        goal: formData.goal,
        details: formData.details,
        docxLink: formData.docxLink,
        photo: formData.photo,
        removePhoto: formData.removePhoto,
      };

      if (editingContract) {
        await groupContractsAPI.update(editingContract.id, payload);
        showModal('Успех', 'Контракт обновлён', 'success');
      } else {
        await groupContractsAPI.create(payload);
        showModal('Успех', 'Контракт добавлен', 'success');
      }
      setShowForm(false);
      await loadContracts();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения контракта');
    } finally {
      setFormLoading(false);
    }
  };

  const handleComplete = async (contract) => {
    if (!window.confirm(`Отметить «${contract.title}» как выполненный?`)) return;
    try {
      await groupContractsAPI.complete(contract.id);
      showModal('Успех', 'Контракт перенесён в выполненные', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const handleCancel = async (contract) => {
    if (!window.confirm(`Отменить «${contract.title}»? Контракт перейдёт в отменённые.`)) return;
    try {
      await groupContractsAPI.cancel(contract.id);
      showModal('Успех', 'Контракт перенесён в отменённые', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const handleDelete = async (contract) => {
    if (!window.confirm(`Удалить контракт «${contract.title}»?`)) return;
    try {
      await groupContractsAPI.delete(contract.id);
      showModal('Успех', 'Контракт удалён', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Ошибка удаления', 'error');
    }
  };

  const handleAddNote = async (contractId) => {
    const message = (noteInputs[contractId] || '').trim();
    if (!message) return;

    try {
      setNoteLoading(contractId);
      const data = await groupContractsAPI.addNote(contractId, message);
      setDetailsCache((prev) => ({
        ...prev,
        [contractId]: {
          ...prev[contractId],
          notes: [...(prev[contractId]?.notes || []), data.note],
        },
      }));
      setNoteInputs((prev) => ({ ...prev, [contractId]: '' }));
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось отправить заметку', 'error');
    } finally {
      setNoteLoading(null);
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const formatAmount = (amount) =>
    parseFloat(amount || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

  const renderChat = (contractId) => {
    const detail = detailsCache[contractId];
    const notes = detail?.notes || [];

    if (detailsLoading === contractId) {
      return <div className="gc-chat-empty">Загрузка заметок...</div>;
    }

    return (
      <div className="gc-chat">
        <div className="gc-chat-title">Заметки (чат)</div>
        <div className="gc-chat-messages">
          {notes.length === 0 ? (
            <div className="gc-chat-empty">Заметок пока нет — добавьте первую</div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="gc-chat-msg">
                <div className="gc-chat-author">{note.username}</div>
                <div className="gc-chat-text">{note.message}</div>
                <div className="gc-chat-time">
                  {note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU') : ''}
                </div>
              </div>
            ))
          )}
        </div>
        {canEdit && (
          <div className="gc-chat-input">
            <textarea
              value={noteInputs[contractId] || ''}
              onChange={(e) => setNoteInputs((prev) => ({ ...prev, [contractId]: e.target.value }))}
              placeholder="Дополнить заметку..."
              rows={2}
            />
            <button
              type="button"
              onClick={() => handleAddNote(contractId)}
              disabled={noteLoading === contractId}
            >
              {noteLoading === contractId ? '...' : 'Отправить'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDetails = (contract) => {
    const detail = detailsCache[contract.id] || contract;
    const photoUrl = detail.photo ? `${API_CONFIG.FILE_BASE_URL}${detail.photo}` : null;

    return (
      <div className="gc-details">
        <div><strong>Цель:</strong> {detail.goal}</div>
        {detail.details && <div><strong>Детали:</strong> {detail.details}</div>}
        {detail.docxLink && (
          <div>
            <strong>DOCX:</strong>{' '}
            <a href={detail.docxLink} target="_blank" rel="noopener noreferrer">{detail.docxLink}</a>
          </div>
        )}
        {photoUrl && (
          <div className="gc-photo">
            <img src={photoUrl} alt={detail.title} />
          </div>
        )}
        <div className="gc-meta">
          Создал: {detail.createdByUsername || '—'}
          {detail.createdAt && <> · {new Date(detail.createdAt).toLocaleString('ru-RU')}</>}
        </div>
        {renderChat(contract.id)}
      </div>
    );
  };

  return (
    <div className="group-contracts">
      <div className="gc-header">
        <h2>Контракты группы</h2>
        <p>Внутренние контракты вашей группировки</p>
      </div>

      {isAdmin && (
        <div className="admin-hint">
          Режим просмотра: администратор видит контракты всех групп без возможности редактирования.
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="gc-toolbar">
        <div className="status-filter">
          <span className="toolbar-label">Раздел</span>
          <div className="type-filter-buttons">
            {STATUS_TABS.map((item) => (
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

        {canEdit && statusFilter === 'active' && (
          <button type="button" className="btn-add-gc" onClick={openCreateForm}>
            + Добавить контракт
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="gc-form-panel">
          <h3>{editingContract ? 'Редактировать контракт' : 'Новый контракт группы'}</h3>
          <form onSubmit={handleFormSubmit} className="contract-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gc-title">Название *</label>
                <input id="gc-title" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="gc-amount">Сумма *</label>
                <input
                  id="gc-amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gc-goal">Общая цель *</label>
              <textarea id="gc-goal" name="goal" value={formData.goal} onChange={handleFormChange} required rows={2} />
            </div>

            <div className="form-group">
              <label htmlFor="gc-details">Детали</label>
              <textarea id="gc-details" name="details" value={formData.details} onChange={handleFormChange} rows={3} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gc-docx">Ссылка на DOCX</label>
                <input
                  id="gc-docx"
                  name="docxLink"
                  type="url"
                  value={formData.docxLink}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="gc-photo">Фото</label>
                <input id="gc-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
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
                {formLoading ? 'Сохранение...' : editingContract ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="gc-list-section">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка контрактов...</p>
          </div>
        ) : contracts.length > 0 ? (
          <div className="gc-table-wrap">
            <table className="gc-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  {isAdmin && <th>Группа</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <React.Fragment key={contract.id}>
                    <tr className={`gc-row status-${contract.status}`}>
                      <td className="col-title">
                        <button
                          type="button"
                          className="expand-btn"
                          onClick={() => toggleExpand(contract.id)}
                        >
                          {expandedId === contract.id ? '▼' : '▶'}
                        </button>
                        {contract.title}
                      </td>
                      <td className="col-amount">{formatAmount(contract.amount)} ₽</td>
                      <td>
                        <span className={`gc-status status-${contract.status}`}>
                          {STATUS_LABELS[contract.status]}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="col-group">{contract.groupName || contract.groupCode}</td>
                      )}
                      <td className="col-actions">
                        {canEdit && contract.status === 'active' && (
                          <>
                            <button type="button" className="btn-complete" onClick={() => handleComplete(contract)}>
                              Выполнен
                            </button>
                            <button type="button" className="btn-cancel-gc" onClick={() => handleCancel(contract)}>
                              Отмена
                            </button>
                            <button type="button" className="btn-edit-gc" onClick={() => openEditForm(contract)}>
                              Изм.
                            </button>
                            <button type="button" className="btn-delete-gc" onClick={() => handleDelete(contract)}>
                              Удал.
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedId === contract.id && (
                      <tr className="gc-details-row">
                        <td colSpan={isAdmin ? 5 : 4}>{renderDetails(contract)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-operations">
            <p>Контрактов в этом разделе нет</p>
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

export default GroupContracts;
