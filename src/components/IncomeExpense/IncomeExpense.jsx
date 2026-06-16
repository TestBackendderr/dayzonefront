import React, { useState, useEffect, useMemo } from 'react';
import { financesAPI } from '../../services/api';
import Modal from '../Modal/Modal';
import './IncomeExpense.scss';

const getCurrentWeekRange = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

  const start = new Date(today);
  start.setDate(today.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString('ru-RU');

const formatCurrencyLabel = (currency) => {
  if (currency === '$') return 'USD';
  if (currency === 'евро') return 'EUR';
  return '₽';
};

const IncomeExpense = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: '+',
    amount: '',
    currency: 'рубли',
    source: '',
  });

  const [operations, setOperations] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [weekRange] = useState(getCurrentWeekRange);
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const operationsPerPage = 15;
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [operationsResponse, balanceResponse] = await Promise.all([
        financesAPI.getOperations(1, 200),
        financesAPI.getBalance(),
      ]);

      setOperations(operationsResponse.operations || []);
      setBalances(balanceResponse.balances || []);
      setCurrentPage(1);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
      setOperations([]);
      setBalances([]);
    } finally {
      setLoading(false);
    }
  };

  const weekOperations = useMemo(() => {
    return operations.filter((op) => {
      const date = new Date(op.created_at);
      return date >= weekRange.start && date <= weekRange.end;
    });
  }, [operations, weekRange]);

  const filteredOperations = useMemo(() => {
    if (operationTypeFilter === 'income') {
      return weekOperations.filter((op) => op.operation_type === '+');
    }
    if (operationTypeFilter === 'expense') {
      return weekOperations.filter((op) => op.operation_type === '-');
    }
    return weekOperations;
  }, [weekOperations, operationTypeFilter]);

  const weekTotals = useMemo(() => {
    const totals = { rubles: { income: 0, expense: 0 }, dollars: { income: 0, expense: 0 } };

    weekOperations.forEach((op) => {
      const amount = parseFloat(op.amount);
      const key = op.currency === '$' ? 'dollars' : 'rubles';
      if (op.operation_type === '+') totals[key].income += amount;
      else totals[key].expense += amount;
    });

    return totals;
  }, [weekOperations]);

  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / operationsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOperations = filteredOperations.slice(
    (safePage - 1) * operationsPerPage,
    safePage * operationsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOperation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Пользователь не найден. Войдите в систему заново.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await financesAPI.createOperation({
        stalkerLogin: currentUser.username,
        operationType: newOperation.type,
        amount: parseFloat(newOperation.amount),
        currency: newOperation.currency,
        source: newOperation.source,
      });

      showModal('Успех', 'Операция успешно добавлена', 'success');
      setNewOperation({ type: '+', amount: '', currency: 'рубли', source: '' });
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      setError('Ошибка добавления операции: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  return (
    <div className="income-expense">
      <div className="income-expense-header">
        <h2>Приход-расход</h2>
        <p>Учёт операций группировки за текущую неделю</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="week-overview">
        <div className="overview-top">
          <div>
            <h3>Текущая неделя</h3>
            <p className="week-period">
              {weekRange.start.toLocaleDateString('ru-RU')} — {weekRange.end.toLocaleDateString('ru-RU')}
            </p>
          </div>
          <button type="button" className="btn-add-operation" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Скрыть форму' : '+ Добавить операцию'}
          </button>
        </div>

        <div className="balance-cards">
          {balances.length > 0 ? (
            balances.map((item) => (
              <div key={item.currency} className="balance-card">
                <span className="balance-currency">{formatCurrencyLabel(item.currency)}</span>
                <span className={`balance-total ${item.balance >= 0 ? 'positive' : 'negative'}`}>
                  {item.balance >= 0 ? '+' : ''}{formatAmount(item.balance)}
                </span>
                <div className="balance-breakdown">
                  <span className="income">приход: {formatAmount(item.income)}</span>
                  <span className="expense">расход: {formatAmount(item.expense)}</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="balance-card">
                <span className="balance-currency">₽</span>
                <span className={`balance-total ${weekTotals.rubles.income - weekTotals.rubles.expense >= 0 ? 'positive' : 'negative'}`}>
                  {weekTotals.rubles.income - weekTotals.rubles.expense >= 0 ? '+' : ''}
                  {formatAmount(weekTotals.rubles.income - weekTotals.rubles.expense)}
                </span>
                <div className="balance-breakdown">
                  <span className="income">приход: {formatAmount(weekTotals.rubles.income)}</span>
                  <span className="expense">расход: {formatAmount(weekTotals.rubles.expense)}</span>
                </div>
                <span className="balance-hint">за неделю</span>
              </div>
              <div className="balance-card">
                <span className="balance-currency">USD</span>
                <span className={`balance-total ${weekTotals.dollars.income - weekTotals.dollars.expense >= 0 ? 'positive' : 'negative'}`}>
                  {weekTotals.dollars.income - weekTotals.dollars.expense >= 0 ? '+' : ''}
                  {formatAmount(weekTotals.dollars.income - weekTotals.dollars.expense)}
                </span>
                <div className="balance-breakdown">
                  <span className="income">приход: {formatAmount(weekTotals.dollars.income)}</span>
                  <span className="expense">расход: {formatAmount(weekTotals.dollars.expense)}</span>
                </div>
                <span className="balance-hint">за неделю</span>
              </div>
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="add-operation-form">
          <h3>Новая операция</h3>
          <p className="form-hint">
            Операция будет записана на: <strong>{currentUser?.username || '—'}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Тип операции</label>
              <div className="type-buttons">
                <button
                  type="button"
                  className={`type-btn income ${newOperation.type === '+' ? 'active' : ''}`}
                  onClick={() => setNewOperation((prev) => ({ ...prev, type: '+' }))}
                >
                  Приход
                </button>
                <button
                  type="button"
                  className={`type-btn expense ${newOperation.type === '-' ? 'active' : ''}`}
                  onClick={() => setNewOperation((prev) => ({ ...prev, type: '-' }))}
                >
                  Расход
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Сумма</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={newOperation.amount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Валюта</label>
                <select
                  id="currency"
                  name="currency"
                  value={newOperation.currency}
                  onChange={handleInputChange}
                >
                  <option value="рубли">Рубли (₽)</option>
                  <option value="$">Доллары ($)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="source">Источник</label>
              <input
                id="source"
                type="text"
                name="source"
                value={newOperation.source}
                onChange={handleInputChange}
                placeholder="Например: продажа артефактов, покупка снаряжения"
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)} disabled={loading}>
                Отмена
              </button>
              <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить операцию'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="operations-section">
        <div className="operations-toolbar">
          <h3>Операции за неделю</h3>
          <div className="toolbar-controls">
            <div className="type-filter">
              <span className="toolbar-label">Тип операции</span>
              <div className="type-filter-buttons">
                <button
                  type="button"
                  className={`type-filter-btn ${operationTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => { setOperationTypeFilter('all'); setCurrentPage(1); }}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`type-filter-btn income ${operationTypeFilter === 'income' ? 'active' : ''}`}
                  onClick={() => { setOperationTypeFilter('income'); setCurrentPage(1); }}
                >
                  Приход
                </button>
                <button
                  type="button"
                  className={`type-filter-btn expense ${operationTypeFilter === 'expense' ? 'active' : ''}`}
                  onClick={() => { setOperationTypeFilter('expense'); setCurrentPage(1); }}
                >
                  Расход
                </button>
              </div>
            </div>
            <span className="operations-info">
              {filteredOperations.length} {filteredOperations.length === 1 ? 'операция' : 'операций'}
            </span>
          </div>
        </div>

        <div className="operations-list">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner" />
              <p>Загрузка операций...</p>
            </div>
          ) : paginatedOperations.length > 0 ? (
            <>
              <div className="operations-table-wrap">
                <table className="operations-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Тип</th>
                      <th>Кто</th>
                      <th>Сумма</th>
                      <th>Источник</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOperations.map((operation) => {
                      const isIncome = operation.operation_type === '+';
                      return (
                        <tr key={operation.id} className={isIncome ? 'row-income' : 'row-expense'}>
                          <td className="col-date">
                            <span className="date-text">
                              {new Date(operation.created_at).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="time-text">
                              {new Date(operation.created_at).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="col-type">
                            <span className={`type-badge ${isIncome ? 'income' : 'expense'}`}>
                              {isIncome ? 'Приход' : 'Расход'}
                            </span>
                          </td>
                          <td className="col-who">
                            <span className="who-name">{operation.stalker_login}</span>
                            {operation.username && operation.username !== operation.stalker_login && (
                              <span className="who-recorded">внёс: {operation.username}</span>
                            )}
                          </td>
                          <td className="col-amount">
                            <span className={`amount-value ${isIncome ? 'positive' : 'negative'}`}>
                              {isIncome ? '+' : '−'}{formatAmount(operation.amount)}
                            </span>
                            <span className="amount-currency">{formatCurrencyLabel(operation.currency)}</span>
                          </td>
                          <td className="col-source">{operation.source}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="ie-pagination">
                  <button
                    type="button"
                    className="ie-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    ← Назад
                  </button>
                  <span className="ie-page-info">{safePage} / {totalPages}</span>
                  <button
                    type="button"
                    className="ie-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    Вперёд →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-operations">
              <p>Операций за текущую неделю нет</p>
              <span className="no-operations-hint">Нажмите «Добавить операцию», чтобы создать первую запись</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.type === 'confirm'}
      />
    </div>
  );
};

export default IncomeExpense;
