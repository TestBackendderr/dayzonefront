import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LeftSide.scss';

const LeftSide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Функция для определения активной кнопки
  const isActive = (path) => {
    return location.pathname === path;
  };

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
          <button className={`stalker-btn archive-btn ${isActive('/stalker-archive') ? 'active' : ''}`} onClick={handleArchiveStalkers}>
            <div className="btn-icon">
              <span className="list-icon">☰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Архив сталкеров</span>
          </button>
          
          <button className={`stalker-btn add-btn ${isActive('/add-stalker') ? 'active' : ''}`} onClick={handleAddStalker}>
            <div className="btn-icon">
              <span className="plus-icon">+</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь сталкеров</span>
          </button>
          
          <button className={`stalker-btn income-expense-btn ${isActive('/income-expense') ? 'active' : ''}`} onClick={handleIncomeExpense}>
            <div className="btn-icon">
              <span className="money-icon">💰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Приход-расход</span>
          </button>
          
          
          <button className={`stalker-btn add-wanted-btn ${isActive('/add-wanted') ? 'active' : ''}`} onClick={handleAddWanted}>
            <div className="btn-icon">
              <span className="add-wanted-icon">🎯</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь в розыск</span>
          </button>
          
          <button className={`stalker-btn wanted-archive-btn ${isActive('/wanted-archive') ? 'active' : ''}`} onClick={handleWantedArchive}>
            <div className="btn-icon">
              <span className="wanted-archive-icon">📋</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">База розыска</span>
          </button>
          
          {user && user.role === 'Admin' && (
            <button className={`stalker-btn user-management-btn ${isActive('/user-management') ? 'active' : ''}`} onClick={handleUserManagement}>
              <div className="btn-icon">
                <span className="user-management-icon">👥</span>
                <span className="radiation-icon">☢</span>
              </div>
              <span className="btn-text">Добавить пользователя</span>
            </button>
          )}
          
          <button className={`stalker-btn finances-btn ${isActive('/finances') ? 'active' : ''}`} onClick={handleFinances}>
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
