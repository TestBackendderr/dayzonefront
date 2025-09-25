import React, { useState } from 'react';
import './Finances.scss';

const Finances = () => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const operationsPerPage = 40;

  // Моковые данные пользователей с общей статистикой
  const [usersStats] = useState([
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

  // Фильтрация операций по выбранному пользователю
  const filteredOperations = selectedUser === 'all' 
    ? allOperations 
    : allOperations.filter(op => {
        const user = usersStats.find(u => u.id === selectedUser);
        return user && op.login === user.login;
      });

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

  const selectedUserStats = usersStats.find(user => user.id === selectedUser) || usersStats[0];

  return (
    <div className="finances">
      <div className="finances-header">
        <h2>Финансы</h2>
        <p>Общая финансовая статистика и детальный просмотр операций</p>
      </div>

      <div className="users-overview">
        <h3>Все пользователи</h3>
        <div className="users-stats">
          {usersStats.map(user => (
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="operations-section">
        <div className="operations-controls">
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
          {currentOperations.map(operation => (
            <div key={operation.id} className={`operation-item ${operation.type === '+' ? 'income' : 'expense'}`}>
              <div className="operation-date">
                <span>{new Date(operation.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="operation-login">
                <span className="login-name">{operation.login}</span>
              </div>
              <div className="operation-amount">
                <span className={`amount-sign ${operation.type === '+' ? 'positive' : 'negative'}`}>
                  {operation.type}
                </span>
                <span className="amount-value">{operation.amount.toLocaleString()}</span>
                <span className="amount-currency">{operation.currency}</span>
              </div>
              <div className="operation-source">
                <span className="source-text">{operation.source}</span>
              </div>
            </div>
          ))}
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

