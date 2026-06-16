import React, { useState, useEffect, useMemo } from 'react';
import { financesAPI } from '../../services/api';
import './Finances.scss';

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

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const createAvailableWeeks = (operations) => {
  const weekMap = new Map();

  operations.forEach((operation) => {
    const weekStart = getWeekStart(new Date(operation.created_at));
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) {
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      weekMap.set(weekKey, {
        key: weekKey,
        start: weekStart,
        end: weekEnd,
        label: `${weekStart.toLocaleDateString('ru-RU')} — ${weekEnd.toLocaleDateString('ru-RU')}`,
      });
    }
  });

  return Array.from(weekMap.values()).sort((a, b) => b.start - a.start);
};

const filterByPeriod = (operations, periodFilter, selectedWeek) => {
  if (periodFilter === 'all') return operations;

  if (periodFilter === 'current_week') {
    const range = getCurrentWeekRange();
    return operations.filter((op) => {
      const date = new Date(op.created_at);
      return date >= range.start && date <= range.end;
    });
  }

  if (periodFilter === 'custom_week' && selectedWeek) {
    return operations.filter((op) => {
      const date = new Date(op.created_at);
      return date >= selectedWeek.start && date <= selectedWeek.end;
    });
  }

  return operations;
};

const createUsersStats = (operations) => {
  const userOperations = {};

  operations.forEach((op) => {
    const username = op.stalker_login;
    if (!userOperations[username]) {
      userOperations[username] = { rubles: 0, dollars: 0, euro: 0 };
    }

    const amount = parseFloat(op.amount);
    const sign = op.operation_type === '+' ? 1 : -1;

    if (op.currency === 'рубли') userOperations[username].rubles += sign * amount;
    else if (op.currency === '$') userOperations[username].dollars += sign * amount;
    else if (op.currency === 'евро') userOperations[username].euro += sign * amount;
  });

  const stats = Object.keys(userOperations).map((username) => ({
    id: username,
    login: username,
    ...userOperations[username],
  }));

  const total = stats.reduce(
    (acc, user) => ({
      rubles: acc.rubles + user.rubles,
      dollars: acc.dollars + user.dollars,
      euro: acc.euro + user.euro,
    }),
    { rubles: 0, dollars: 0, euro: 0 }
  );

  return [
    { id: 'all', login: 'Все наёмники', ...total },
    ...stats.sort((a, b) => a.login.localeCompare(b.login, 'ru')),
  ];
};

const formatAmount = (amount) => parseFloat(amount).toLocaleString('ru-RU');

const formatCurrencyLabel = (currency) => {
  if (currency === '$') return 'USD';
  if (currency === 'евро') return 'EUR';
  return '₽';
};

const Finances = () => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const operationsPerPage = 15;

  useEffect(() => {
    loadFinancesData();
  }, []);

  const loadFinancesData = async () => {
    try {
      setLoading(true);
      setError('');

      const operationsResponse = await financesAPI.getOperations(1, 500);
      const loaded = operationsResponse.operations || [];

      setOperations(loaded);

      const weeks = createAvailableWeeks(loaded);
      setAvailableWeeks(weeks);
      if (weeks.length > 0) {
        setSelectedWeek(weeks[0]);
      }
    } catch (err) {
      setError('Ошибка загрузки финансовых данных: ' + (err.response?.data?.message || err.message));
      setOperations([]);
      setAvailableWeeks([]);
    } finally {
      setLoading(false);
    }
  };

  const periodOperations = useMemo(
    () => filterByPeriod(operations, periodFilter, selectedWeek),
    [operations, periodFilter, selectedWeek]
  );

  const usersStats = useMemo(() => createUsersStats(periodOperations), [periodOperations]);

  const filteredOperations = useMemo(() => {
    let result = periodOperations;

    if (selectedUser !== 'all') {
      const user = usersStats.find((u) => u.id === selectedUser);
      if (user) {
        result = result.filter((op) => op.stalker_login === user.login);
      }
    }

    if (operationTypeFilter === 'income') {
      result = result.filter((op) => op.operation_type === '+');
    } else if (operationTypeFilter === 'expense') {
      result = result.filter((op) => op.operation_type === '-');
    }

    return result;
  }, [periodOperations, selectedUser, operationTypeFilter, usersStats]);

  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / operationsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOperations = filteredOperations.slice(
    (safePage - 1) * operationsPerPage,
    safePage * operationsPerPage
  );

  const handlePeriodChange = (value) => {
    setPeriodFilter(value);
    setCurrentPage(1);
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (type) => {
    setOperationTypeFilter(type);
    setCurrentPage(1);
  };

  return (
    <div className="finances">
      <div className="finances-header">
        <h2>Финансы</h2>
        <p>История приходов и расходов группировки</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="users-overview">
        <div className="overview-header">
          <h3>Баланс по наёмникам</h3>
          <div className="finances-filters">
            <div className="period-selector">
              <label htmlFor="period-filter">Период</label>
              <select
                id="period-filter"
                value={periodFilter}
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <option value="all">За всё время</option>
                <option value="current_week">Текущая неделя</option>
                <option value="custom_week">Выбрать неделю</option>
              </select>
            </div>

            {periodFilter === 'custom_week' && availableWeeks.length > 0 && (
              <div className="week-selector">
                <label htmlFor="week-filter">Неделя</label>
                <select
                  id="week-filter"
                  value={selectedWeek?.key || ''}
                  onChange={(e) => {
                    const week = availableWeeks.find((w) => w.key === e.target.value);
                    setSelectedWeek(week);
                    setCurrentPage(1);
                  }}
                >
                  {availableWeeks.map((week) => (
                    <option key={week.key} value={week.key}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="users-stats">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner" />
              <p>Загрузка статистики...</p>
            </div>
          ) : usersStats.length > 0 ? (
            usersStats.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`user-stat-card ${selectedUser === user.id ? 'selected' : ''}`}
                onClick={() => handleUserChange(user.id)}
              >
                <span className="user-login">{user.login}</span>
                <div className="user-balance">
                  <span className={`balance-value ${user.rubles >= 0 ? 'positive' : 'negative'}`}>
                    {user.rubles >= 0 ? '+' : ''}{formatAmount(user.rubles)} ₽
                  </span>
                  <span className={`balance-value ${user.dollars >= 0 ? 'positive' : 'negative'}`}>
                    {user.dollars >= 0 ? '+' : ''}{formatAmount(user.dollars)} $
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="no-data">
              <p>Нет финансовых данных за выбранный период</p>
            </div>
          )}
        </div>
      </div>

      <div className="operations-section">
        <div className="operations-toolbar">
          <h3>История операций</h3>

          <div className="toolbar-controls">
            <div className="type-filter">
              <span className="toolbar-label">Тип операции</span>
              <div className="type-filter-buttons">
                <button
                  type="button"
                  className={`type-filter-btn ${operationTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleTypeFilterChange('all')}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`type-filter-btn income ${operationTypeFilter === 'income' ? 'active' : ''}`}
                  onClick={() => handleTypeFilterChange('income')}
                >
                  Приход
                </button>
                <button
                  type="button"
                  className={`type-filter-btn expense ${operationTypeFilter === 'expense' ? 'active' : ''}`}
                  onClick={() => handleTypeFilterChange('expense')}
                >
                  Расход
                </button>
              </div>
            </div>

            <div className="operations-info">
              {filteredOperations.length} {filteredOperations.length === 1 ? 'операция' : 'операций'}
            </div>
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
                        <tr
                          key={operation.id}
                          className={isIncome ? 'row-income' : 'row-expense'}
                        >
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
                              <span className="who-recorded">
                                внёс: {operation.username}
                              </span>
                            )}
                          </td>
                          <td className="col-amount">
                            <span className={`amount-value ${isIncome ? 'positive' : 'negative'}`}>
                              {isIncome ? '+' : '−'}{formatAmount(operation.amount)}
                            </span>
                            <span className="amount-currency">
                              {formatCurrencyLabel(operation.currency)}
                            </span>
                          </td>
                          <td className="col-source">{operation.source}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="finances-pagination">
                  <button
                    type="button"
                    className="f-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    ← Назад
                  </button>
                  <span className="f-page-info">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="f-page-btn"
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
              <p>Операций не найдено</p>
              <span className="no-operations-hint">Попробуйте изменить период или фильтры</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finances;
