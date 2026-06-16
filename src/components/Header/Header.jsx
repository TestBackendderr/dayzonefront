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
      <div className="header-content">
        <div className="header-left">
          <span className="user-welcome">
            Добро пожаловать, {user.username || 'Пользователь'}
          </span>
        </div>
        <div className="header-center">
          {user.role && (
            <span className="user-role">
              [{user.role}]
            </span>
          )}
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
