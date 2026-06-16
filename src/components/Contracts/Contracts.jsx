import React, { useState, useEffect, useMemo } from 'react';
import { contractsAPI } from '../../services/api';
import Modal from '../Modal/Modal';
import './Contracts.scss';

const STATUS_LABELS = {
  open: 'Открыт',
  inwork: 'В работе',
  closed: 'Закрыт',
};

const EMPTY_FORM = {
  title: '',
  amount: '',
  goal: '',
  details: '',
  notes: '',
  link: '',
  status: 'open',
};

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [expandedId, setExpandedId] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isAdmin = user.role === 'Admin';

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contractsAPI.getAll();
      setContracts(data.contracts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки контрактов');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = useMemo(() => {
    if (statusFilter === 'all') return contracts;
    return contracts.filter((c) => c.status === statusFilter);
  }, [contracts, statusFilter]);

  const openCreateForm = () => {
    setEditingContract(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (contract) => {
    setEditingContract(contract);
    setFormData({
      title: contract.title,
      amount: String(contract.amount),
      goal: contract.goal,
      details: contract.details || '',
      notes: contract.notes || '',
      link: contract.link || '',
      status: contract.status,
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
      if (editingContract) {
        await contractsAPI.update(editingContract.id, formData);
        showModal('Успех', 'Контракт обновлён', 'success');
      } else {
        await contractsAPI.create(formData);
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

  const handleTake = async (contract) => {
    try {
      setError('');
      await contractsAPI.take(contract.id);
      showModal('Успех', 'Контракт взят вашей группой', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось взять контракт', 'error');
    }
  };

  const handleComplete = async (contract) => {
    if (!window.confirm(`Отметить контракт «${contract.title}» как выполненный?`)) return;

    try {
      setError('');
      await contractsAPI.complete(contract.id);
      showModal('Успех', 'Контракт выполнен', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось выполнить контракт', 'error');
    }
  };

  const handleCancel = async (contract) => {
    if (!window.confirm(`Отменить контракт «${contract.title}»? Он снова станет открытым для всех групп.`)) return;

    try {
      setError('');
      await contractsAPI.cancel(contract.id);
      showModal('Успех', 'Контракт отменён и снова открыт', 'success');
      await loadContracts();
    } catch (err) {
      showModal('Ошибка', err.response?.data?.message || 'Не удалось отменить контракт', 'error');
    }
  };

  const handleDelete = async (contract) => {
    if (!window.confirm(`Удалить контракт «${contract.title}»?`)) return;

    try {
      await contractsAPI.delete(contract.id);
      showModal('Успех', 'Контракт удалён', 'success');
      await loadContracts();
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

  const isGroupUser = !isAdmin && user.role && user.role !== 'Admin';

  const canTake = (contract) =>
    isGroupUser &&
    contract.status === 'open' &&
    !contract.assignedGroupCode;

  const canManageInwork = (contract) =>
    isGroupUser &&
    contract.status === 'inwork' &&
    contract.assignedGroupCode === user.role;

  const formatAmount = (amount) =>
    parseFloat(amount || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });

  return (
    <div className="contracts">
      <div className="contracts-header">
        <h2>Контракты общие</h2>
        <p>Контракты организации — видны всем группировкам</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="contracts-toolbar">
        <div className="status-filter">
          <span className="toolbar-label">Статус</span>
          <div className="type-filter-buttons">
            {[
              { id: 'all', label: 'Все' },
              { id: 'open', label: 'Открыт' },
              { id: 'inwork', label: 'В работе' },
              { id: 'closed', label: 'Закрыт' },
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

        {isAdmin && (
          <button type="button" className="btn-add-contract" onClick={openCreateForm}>
            + Добавить контракт
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="contract-form-panel">
          <h3>{editingContract ? 'Редактировать контракт' : 'Новый контракт'}</h3>
          <form onSubmit={handleFormSubmit} className="contract-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Название *</label>
                <input id="title" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Сумма *</label>
                <input
                  id="amount"
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
              <label htmlFor="goal">Общая цель *</label>
              <textarea id="goal" name="goal" value={formData.goal} onChange={handleFormChange} required rows={2} />
            </div>

            <div className="form-group">
              <label htmlFor="details">Детали</label>
              <textarea id="details" name="details" value={formData.details} onChange={handleFormChange} rows={3} />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Заметки</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} rows={2} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="link">Ссылка</label>
                <input id="link" name="link" type="url" value={formData.link} onChange={handleFormChange} placeholder="https://..." />
              </div>
              {editingContract && (
                <div className="form-group">
                  <label htmlFor="status">Статус</label>
                  <select id="status" name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="open">Открыт</option>
                    <option value="inwork">В работе</option>
                    <option value="closed">Закрыт</option>
                  </select>
                </div>
              )}
            </div>

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

      <div className="contracts-list-section">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка контрактов...</p>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="contracts-table-wrap">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Группа</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <React.Fragment key={contract.id}>
                    <tr className={`contract-row status-${contract.status}`}>
                      <td className="col-title">
                        <button
                          type="button"
                          className="expand-btn"
                          onClick={() => setExpandedId(expandedId === contract.id ? null : contract.id)}
                        >
                          {expandedId === contract.id ? '▼' : '▶'}
                        </button>
                        {contract.title}
                      </td>
                      <td className="col-amount">{formatAmount(contract.amount)} ₽</td>
                      <td>
                        <span className={`contract-status status-${contract.status}`}>
                          {STATUS_LABELS[contract.status]}
                        </span>
                      </td>
                      <td className="col-group">
                        {contract.assignedGroupName || contract.assignedGroupCode || '—'}
                      </td>
                      <td className="col-actions">
                        {canTake(contract) && (
                          <button type="button" className="btn-take" onClick={() => handleTake(contract)}>
                            Взять
                          </button>
                        )}
                        {canManageInwork(contract) && (
                          <>
                            <button type="button" className="btn-complete" onClick={() => handleComplete(contract)}>
                              Выполнить
                            </button>
                            <button type="button" className="btn-cancel-contract" onClick={() => handleCancel(contract)}>
                              Отменить
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <>
                            <button type="button" className="btn-edit" onClick={() => openEditForm(contract)}>
                              Изм.
                            </button>
                            <button type="button" className="btn-delete" onClick={() => handleDelete(contract)}>
                              Удал.
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedId === contract.id && (
                      <tr className="contract-details-row">
                        <td colSpan={5}>
                          <div className="contract-details">
                            <div><strong>Цель:</strong> {contract.goal}</div>
                            {contract.details && <div><strong>Детали:</strong> {contract.details}</div>}
                            {contract.notes && <div><strong>Заметки:</strong> {contract.notes}</div>}
                            {contract.link && (
                              <div>
                                <strong>Ссылка:</strong>{' '}
                                <a href={contract.link} target="_blank" rel="noopener noreferrer">{contract.link}</a>
                              </div>
                            )}
                            <div className="contract-meta">
                              Создал: {contract.createdByUsername || '—'}
                              {contract.assignedByUsername && (
                                <> · Взял: {contract.assignedByUsername}</>
                              )}
                              {contract.createdAt && (
                                <> · {new Date(contract.createdAt).toLocaleString('ru-RU')}</>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-operations">
            <p>Контрактов не найдено</p>
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

export default Contracts;
