import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeftSide.scss';

const LeftSide = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleAddStalker = () => {
    navigate('/add-stalker');
  };

  const handleArchiveStalkers = () => {
    navigate('/stalker-archive');
  };

  const handleIncomeExpense = () => {
    navigate('/income-expense');
  };

  const handleFinances = () => {
    navigate('/finances');
  };

  const handleAddWanted = () => {
    navigate('/add-wanted');
  };

  const handleWantedArchive = () => {
    navigate('/wanted-archive');
  };

  const handleUserManagement = () => {
    navigate('/user-management');
  };

  useEffect(() => {
    // Получаем информацию о пользователе из localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } catch (error) {
        console.error('Ошибка парсинга токена:', error);
      }
    }
  }, []);

  return (
    <div className="left-side">
      <div className="left-side-content">
        <div className="stalker-buttons">
          <button className="stalker-btn archive-btn" onClick={handleArchiveStalkers}>
            <div className="btn-icon">
              <span className="list-icon">☰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Архив сталкеров</span>
          </button>
          
          <button className="stalker-btn add-btn" onClick={handleAddStalker}>
            <div className="btn-icon">
              <span className="plus-icon">+</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь сталкеров</span>
          </button>
          
          <button className="stalker-btn income-expense-btn" onClick={handleIncomeExpense}>
            <div className="btn-icon">
              <span className="money-icon">💰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Приход-расход</span>
          </button>
          
          
          <button className="stalker-btn add-wanted-btn" onClick={handleAddWanted}>
            <div className="btn-icon">
              <span className="add-wanted-icon">⚠</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь в розыск</span>
          </button>
          
          <button className="stalker-btn wanted-archive-btn" onClick={handleWantedArchive}>
            <div className="btn-icon">
              <span className="wanted-archive-icon">🔍</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">База розыска</span>
          </button>
          
          {user && user.role === 'Admin' && (
            <button className="stalker-btn user-management-btn" onClick={handleUserManagement}>
              <div className="btn-icon">
                <span className="user-management-icon">👥</span>
                <span className="radiation-icon">☢</span>
              </div>
              <span className="btn-text">Добавить пользователя</span>
            </button>
          )}
          
          <button className="stalker-btn finances-btn" onClick={handleFinances}>
            <div className="btn-icon">
              <span className="chart-icon">📊</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Финансы</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
