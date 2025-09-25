import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="header">
      <div className="logo">
        <h1>DayZone</h1>
      </div>
      <div className="header-actions">
        <span className="user-info">
          Добро пожаловать, {user.username || 'Пользователь'}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;
