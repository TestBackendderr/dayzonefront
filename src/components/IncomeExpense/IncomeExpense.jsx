import React, { useState, useEffect } from 'react';
import { financesAPI } from '../../services/api';
import './IncomeExpense.scss';

const IncomeExpense = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: '+',
    amount: '',
    currency: 'рубли',
    source: ''
  });

  const [operations, setOperations] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [weekRange, setWeekRange] = useState({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(1);
  const operationsPerPage = 10;

  // Загрузка операций и баланса при монтировании компонента
  useEffect(() => {
    loadCurrentUser();
    loadData();
  }, []);

  const loadCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  };

  // Функция для получения диапазона текущей недели (понедельник - воскресенье)
  const getCurrentWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Если воскресенье, то 6 дней назад
    
    // Начало текущей недели (понедельник)
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - daysFromMonday);
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    
    // Конец текущей недели (воскресенье)
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    };
  };

  // Функция для фильтрации операций по недельному диапазону
  const filterOperationsByWeek = (operations) => {
    if (!weekRange.start || !weekRange.end) return [];
    
    return operations.filter(operation => {
      const operationDate = new Date(operation.created_at);
      return operationDate >= weekRange.start && operationDate <= weekRange.end;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Устанавливаем недельный диапазон
      const weekRangeData = getCurrentWeekRange();
      setWeekRange(weekRangeData);
      
      // Загружаем операции и баланс параллельно
      const [operationsResponse, balanceResponse] = await Promise.all([
        financesAPI.getOperations(1, 50), // Загружаем больше операций для недельного фильтра
        financesAPI.getBalance()
      ]);
      
      setOperations(operationsResponse.operations);
      setBalances(balanceResponse.balances);
      setCurrentPage(1);
    } catch (error) {
      setError('Ошибка загрузки данных: ' + (error.response?.data?.message || error.message));
      setOperations([]);
      setBalances([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOperations = async () => {
    await loadData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOperation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Пользователь не найден. Пожалуйста, войдите в систему заново.');
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
        source: newOperation.source
      });
      
      alert('Операция успешно добавлена!');
      setNewOperation({
        type: '+',
        amount: '',
        currency: 'рубли',
        source: ''
      });
      setShowAddForm(false);
      
      // Обновляем список операций
      loadOperations();
    } catch (error) {
      setError('Ошибка добавления операции: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="income-expense">
      <div className="income-expense-header">
        <h2>Приход-расход</h2>
        <p>Управление финансовыми операциями сталкеров</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="recent-operations">
        <div className="operations-header">
          <h3>Операции за текущую неделю</h3>
          {weekRange.start && weekRange.end && (
            <div className="week-range">
              <span className="range-label">Период:</span>
              <span className="range-dates">
                {weekRange.start.toLocaleDateString('ru-RU')} - {weekRange.end.toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>
        <div className="operations-list">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner">💰</div>
              <p>Загрузка операций...</p>
            </div>
          ) : (() => {
            const weekOperations = filterOperationsByWeek(operations);
            const totalPages = Math.max(1, Math.ceil(weekOperations.length / operationsPerPage));
            const safeCurrentPage = Math.min(currentPage, totalPages);
            const startIndex = (safeCurrentPage - 1) * operationsPerPage;
            const endIndex = startIndex + operationsPerPage;
            const currentOperations = weekOperations.slice(startIndex, endIndex);

            return currentOperations.length > 0 ? (
              <>
                {currentOperations.map(operation => (
                  <div key={operation.id} className={`operation-item ${operation.operation_type === '+' ? 'income' : 'expense'}`}>
                    <div className="operation-login">
                      <span className="login-name">{operation.stalker_login}</span>
                    </div>
                    <div className="operation-amount">
                      <span className={`amount-sign ${operation.operation_type === '+' ? 'positive' : 'negative'}`}>
                        {operation.operation_type}
                      </span>
                      <span className="amount-value">{operation.amount}</span>
                      <span className="amount-currency">{operation.currency}</span>
                    </div>
                    <div className="operation-source">
                      <span className="source-text">{operation.source}</span>
                      <span className="datetime-text">
                        {new Date(operation.created_at).toLocaleDateString('ru-RU')} {new Date(operation.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {totalPages > 1 && (
                  <div className="income-expense-pagination">
                    <button
                      className="ie-page-btn ie-prev-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      ← Назад
                    </button>
                    
                    <div className="ie-page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`ie-page-number ${page === safeCurrentPage ? 'ie-active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      className="ie-page-btn ie-next-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage === totalPages}
                    >
                      Вперёд →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-operations">
                <div className="no-operations-icon">💰</div>
                <p>Операций за текущую неделю нет</p>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="add-operation-section">
        <button className="add-operation-btn" onClick={toggleAddForm}>
          <span className="btn-icon">💰</span>
          <span>Добавить приход-расход</span>
        </button>

        {showAddForm && (
          <div className="add-operation-form">
            <div className="current-user-info">
              <span className="user-label">Пользователь:</span>
              <span className="user-name">{currentUser?.username || 'Не определен'}</span>
            </div>
            <form onSubmit={handleSubmit}>

              <div className="form-row">
                <div className="form-group">
                  <label>Тип операции</label>
                  <div className="type-buttons">
                    <button
                      type="button"
                      className={`type-btn ${newOperation.type === '+' ? 'active' : ''}`}
                      onClick={() => setNewOperation(prev => ({ ...prev, type: '+' }))}
                    >
                      <span className="type-icon">+</span>
                      Приход
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${newOperation.type === '-' ? 'active' : ''}`}
                      onClick={() => setNewOperation(prev => ({ ...prev, type: '-' }))}
                    >
                      <span className="type-icon">-</span>
                      Расход
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Сумма</label>
                  <input
                    type="number"
                    name="amount"
                    value={newOperation.amount}
                    onChange={handleInputChange}
                    placeholder="Введите сумму"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Валюта</label>
                  <select
                    name="currency"
                    value={newOperation.currency}
                    onChange={handleInputChange}
                  >
                    <option value="рубли">Рубли</option>
                    <option value="$">Доллары</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Источник</label>
                <input
                  type="text"
                  name="source"
                  value={newOperation.source}
                  onChange={handleInputChange}
                  placeholder="Укажите источник операции"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className={`btn-submit ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner">☢</span>
                      Добавление...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">☢</span>
                      Добавить операцию
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpense;

