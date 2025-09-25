import React, { useState, useEffect } from 'react';
import { financesAPI, stalkersAPI } from '../../services/api';
import './Finances.scss';

const Finances = () => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [operations, setOperations] = useState([]);
  const [usersStats, setUsersStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyType, setHistoryType] = useState('all'); // 'all' или 'week'
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const operationsPerPage = 10;

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadFinancesData();
  }, []);

  const loadFinancesData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем операции и всех сталкеров
      const [operationsResponse, stalkersResponse] = await Promise.all([
        financesAPI.getOperations(1, 100), // Загружаем больше операций для статистики
        stalkersAPI.getAll()
      ]);
      
      setOperations(operationsResponse.operations);
      
      // Создаем статистику пользователей на основе операций
      const stats = createUsersStats(operationsResponse.operations, stalkersResponse);
      setUsersStats(stats);
      
      // Создаем список доступных недель
      const weeks = createAvailableWeeks(operationsResponse.operations);
      setAvailableWeeks(weeks);
      
      // Устанавливаем текущую неделю как выбранную по умолчанию
      if (weeks.length > 0) {
        setSelectedWeek(weeks[0]);
      }
      
    } catch (error) {
      setError('Ошибка загрузки финансовых данных: ' + (error.response?.data?.message || error.message));
      setOperations([]);
      setUsersStats([]);
      setAvailableWeeks([]);
    } finally {
      setLoading(false);
    }
  };

  const createUsersStats = (operations, stalkers) => {
    // Группируем операции по пользователям
    const userOperations = {};
    
    operations.forEach(op => {
      const username = op.stalker_login;
      if (!userOperations[username]) {
        userOperations[username] = {
          rubles: 0,
          dollars: 0,
          euro: 0,
          operations: []
        };
      }
      
      userOperations[username].operations.push(op);
      
      if (op.operation_type === '+') {
        if (op.currency === 'рубли') userOperations[username].rubles += parseFloat(op.amount);
        else if (op.currency === '$') userOperations[username].dollars += parseFloat(op.amount);
        else if (op.currency === 'евро') userOperations[username].euro += parseFloat(op.amount);
      } else {
        if (op.currency === 'рубли') userOperations[username].rubles -= parseFloat(op.amount);
        else if (op.currency === '$') userOperations[username].dollars -= parseFloat(op.amount);
        else if (op.currency === 'евро') userOperations[username].euro -= parseFloat(op.amount);
      }
    });

    // Создаем массив статистики пользователей
    const stats = Object.keys(userOperations).map(username => {
      const userData = userOperations[username];
      return {
        id: username,
        login: username,
        rubles: userData.rubles,
        dollars: userData.dollars,
        euro: userData.euro
      };
    });

    // Добавляем "Все пользователи" с общей статистикой
    const totalStats = stats.reduce((acc, user) => ({
      rubles: acc.rubles + user.rubles,
      dollars: acc.dollars + user.dollars,
      euro: acc.euro + user.euro
    }), { rubles: 0, dollars: 0, euro: 0 });

    return [
      {
        id: 'all',
        login: 'Все пользователи',
        rubles: totalStats.rubles,
        dollars: totalStats.dollars,
        euro: totalStats.euro
      },
      ...stats
    ];
  };

  // Функция для создания списка доступных недель
  const createAvailableWeeks = (operations) => {
    const weekMap = new Map();
    
    operations.forEach(operation => {
      const operationDate = new Date(operation.created_at);
      const weekStart = getWeekStart(operationDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          key: weekKey,
          start: weekStart,
          end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          label: `${weekStart.toLocaleDateString('ru-RU')} - ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}`
        });
      }
    });
    
    // Сортируем недели по дате (новые сверху)
    return Array.from(weekMap.values()).sort((a, b) => b.start - a.start);
  };

  // Функция для получения начала недели (понедельник)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Функция для фильтрации операций по типу истории
  const getFilteredOperations = () => {
    let filteredOps = operations;
    
    // Фильтр по пользователю
    if (selectedUser !== 'all') {
      filteredOps = filteredOps.filter(op => {
        const user = usersStats.find(u => u.id === selectedUser);
        return user && op.stalker_login === user.login;
      });
    }
    
    // Фильтр по типу истории
    if (historyType === 'week' && selectedWeek) {
      filteredOps = filteredOps.filter(op => {
        const operationDate = new Date(op.created_at);
        return operationDate >= selectedWeek.start && operationDate <= selectedWeek.end;
      });
    }
    
    return filteredOps;
  };

  // Моковые данные пользователей с общей статистикой
  const [mockUsersStats] = useState([
    {
      id: 'all',
      login: 'Все пользователи',
      rubles: 12500,
      dollars: 1200,
      totalRubles: 15000,
      totalDollars: 1500
    },
    {
      id: 'sniper',
      login: 'Снайпер',
      rubles: 8500,
      dollars: 800,
      totalRubles: 10000,
      totalDollars: 1000
    },
    {
      id: 'wolf',
      login: 'Волк',
      rubles: 2000,
      dollars: 200,
      totalRubles: 3000,
      totalDollars: 300
    },
    {
      id: 'shadow',
      login: 'Тень',
      rubles: 1500,
      dollars: 150,
      totalRubles: 1500,
      totalDollars: 150
    },
    {
      id: 'hunter',
      login: 'Охотник',
      rubles: 500,
      dollars: 50,
      totalRubles: 500,
      totalDollars: 50
    }
  ]);

  // Моковые данные всех операций
  const [allOperations] = useState([
    { id: 1, login: 'Снайпер', type: '+', amount: 5000, currency: 'рубли', source: 'Продажа артефактов', date: '2024-01-15' },
    { id: 2, login: 'Волк', type: '-', amount: 1500, currency: 'рубли', source: 'Покупка снаряжения', date: '2024-01-15' },
    { id: 3, login: 'Тень', type: '+', amount: 200, currency: '$', source: 'Заказ на разведку', date: '2024-01-14' },
    { id: 4, login: 'Охотник', type: '-', amount: 3000, currency: 'рубли', source: 'Ремонт оборудования', date: '2024-01-14' },
    { id: 5, login: 'Снайпер', type: '+', amount: 800, currency: '$', source: 'Награда за задание', date: '2024-01-13' },
    { id: 6, login: 'Волк', type: '+', amount: 2500, currency: 'рубли', source: 'Торговля', date: '2024-01-13' },
    { id: 7, login: 'Тень', type: '-', amount: 100, currency: '$', source: 'Покупка боеприпасов', date: '2024-01-12' },
    { id: 8, login: 'Охотник', type: '+', amount: 1500, currency: 'рубли', source: 'Найденный артефакт', date: '2024-01-12' },
    { id: 9, login: 'Снайпер', type: '-', amount: 2000, currency: 'рубли', source: 'Аренда транспорта', date: '2024-01-11' },
    { id: 10, login: 'Волк', type: '+', amount: 300, currency: '$', source: 'Контракт', date: '2024-01-11' },
    { id: 11, login: 'Тень', type: '+', amount: 800, currency: 'рубли', source: 'Информация', date: '2024-01-10' },
    { id: 12, login: 'Охотник', type: '-', amount: 500, currency: 'рубли', source: 'Медикаменты', date: '2024-01-10' },
    { id: 13, login: 'Снайпер', type: '+', amount: 1200, currency: '$', source: 'Спецзадание', date: '2024-01-09' },
    { id: 14, login: 'Волк', type: '-', amount: 800, currency: 'рубли', source: 'Топливо', date: '2024-01-09' },
    { id: 15, login: 'Тень', type: '+', amount: 1500, currency: 'рубли', source: 'Разведка', date: '2024-01-08' },
    { id: 16, login: 'Охотник', type: '+', amount: 200, currency: '$', source: 'Артефакт', date: '2024-01-08' },
    { id: 17, login: 'Снайпер', type: '-', amount: 300, currency: '$', source: 'Оружие', date: '2024-01-07' },
    { id: 18, login: 'Волк', type: '+', amount: 4000, currency: 'рубли', source: 'Торговля', date: '2024-01-07' },
    { id: 19, login: 'Тень', type: '-', amount: 600, currency: 'рубли', source: 'Снаряжение', date: '2024-01-06' },
    { id: 20, login: 'Охотник', type: '+', amount: 100, currency: '$', source: 'Информация', date: '2024-01-06' }
  ]);

  // Фильтрация операций по выбранному пользователю и типу истории
  const filteredOperations = getFilteredOperations();

  // Пагинация
  const totalPages = Math.ceil(filteredOperations.length / operationsPerPage);
  const startIndex = (currentPage - 1) * operationsPerPage;
  const endIndex = startIndex + operationsPerPage;
  const currentOperations = filteredOperations.slice(startIndex, endIndex);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleHistoryTypeChange = (type) => {
    setHistoryType(type);
    setCurrentPage(1);
  };

  const handleWeekChange = (weekKey) => {
    const week = availableWeeks.find(w => w.key === weekKey);
    setSelectedWeek(week);
    setCurrentPage(1);
  };

  const selectedUserStats = usersStats.find(user => user.id === selectedUser) || usersStats[0];

  return (
    <div className="finances">
      <div className="finances-header">
        <h2>Финансы</h2>
        <p>Общая финансовая статистика и детальный просмотр операций</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="users-overview">
        <h3>Все пользователи</h3>
        <div className="users-stats">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner">📊</div>
              <p>Загрузка статистики пользователей...</p>
            </div>
          ) : usersStats.length > 0 ? (
            usersStats.map(user => (
              <div key={user.id} className={`user-stat-card ${selectedUser === user.id ? 'selected' : ''}`}>
                <div className="user-info">
                  <span className="user-login">{user.login}</span>
                </div>
                <div className="user-balance">
                  <div className="balance-item">
                    <span className="currency-label">Рубли:</span>
                    <span className={`balance-value ${user.rubles >= 0 ? 'positive' : 'negative'}`}>
                      {user.rubles >= 0 ? '+' : ''}{user.rubles.toLocaleString()}
                    </span>
                  </div>
                  <div className="balance-item">
                    <span className="currency-label">Доллары:</span>
                    <span className={`balance-value ${user.dollars >= 0 ? 'positive' : 'negative'}`}>
                      {user.dollars >= 0 ? '+' : ''}{user.dollars.toLocaleString()}
                    </span>
                  </div>
                  {/*  */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <div className="no-data-icon">📊</div>
              <p>Нет финансовых данных</p>
            </div>
          )}
        </div>
      </div>

      <div className="operations-section">
        <div className="operations-controls">
          <div className="history-type-selector">
            <label>Тип истории:</label>
            <div className="history-type-buttons">
              <button 
                className={`history-type-btn ${historyType === 'all' ? 'active' : ''}`}
                onClick={() => handleHistoryTypeChange('all')}
              >
                📊 Общая история
              </button>
              <button 
                className={`history-type-btn ${historyType === 'week' ? 'active' : ''}`}
                onClick={() => handleHistoryTypeChange('week')}
              >
                📅 По неделям
              </button>
            </div>
          </div>

          {historyType === 'week' && (
            <div className="week-selector">
              <label>Выберите неделю:</label>
              <select 
                value={selectedWeek?.key || ''} 
                onChange={(e) => handleWeekChange(e.target.value)}
              >
                <option value="">Выберите неделю</option>
                {availableWeeks.map(week => (
                  <option key={week.key} value={week.key}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="user-selector">
            <label>Выберите пользователя:</label>
            <select value={selectedUser} onChange={handleUserChange}>
              {usersStats.map(user => (
                <option key={user.id} value={user.id}>
                  {user.login}
                </option>
              ))}
            </select>
          </div>
          
          <div className="operations-info">
            <span>Показано: {currentOperations.length} из {filteredOperations.length} операций</span>
          </div>
        </div>

        <div className="operations-list">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner">📊</div>
              <p>Загрузка операций...</p>
            </div>
          ) : (() => {
            const totalPages = Math.max(1, Math.ceil(currentOperations.length / operationsPerPage));
            const safeCurrentPage = Math.min(currentPage, totalPages);
            const startIndex = (safeCurrentPage - 1) * operationsPerPage;
            const endIndex = startIndex + operationsPerPage;
            const paginatedOperations = currentOperations.slice(startIndex, endIndex);

            return paginatedOperations.length > 0 ? (
              <>
                {paginatedOperations.map(operation => (
                  <div key={operation.id} className={`operation-item ${operation.operation_type === '+' ? 'income' : 'expense'}`}>
                    <div className="operation-date">
                      <span className="date-text">{new Date(operation.created_at).toLocaleDateString('ru-RU')}</span>
                      <span className="time-text">{new Date(operation.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="operation-login">
                      <span className="login-name">{operation.stalker_login}</span>
                    </div>
                    <div className="operation-amount">
                      <span className={`amount-sign ${operation.operation_type === '+' ? 'positive' : 'negative'}`}>
                        {operation.operation_type}
                      </span>
                      <span className="amount-value">{parseFloat(operation.amount).toLocaleString()}</span>
                      <span className="amount-currency">{operation.currency}</span>
                    </div>
                    <div className="operation-source">
                      <span className="source-text">{operation.source}</span>
                    </div>
                  </div>
                ))}
                
                {totalPages > 1 && (
                  <div className="finances-pagination">
                    <button
                      className="f-page-btn f-prev-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      ← Назад
                    </button>
                    
                    <div className="f-page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`f-page-number ${page === safeCurrentPage ? 'f-active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      className="f-page-btn f-next-btn"
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
                <div className="no-operations-icon">📊</div>
                <p>Операций не найдено</p>
              </div>
            );
          })()}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Предыдущая
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Следующая →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finances;

