import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LeftSide.scss';

const NAV_ITEMS = [
  { path: '/stalker-archive', label: 'Архив сталкеров' },
  { path: '/add-stalker', label: 'Добавить сталкера' },
  { path: '/income-expense', label: 'Приход-расход' },
  { path: '/add-wanted', label: 'Добавить в розыск' },
  { path: '/wanted-archive', label: 'База розыска' },
  { path: '/finances', label: 'Финансы' },
  { path: '/contracts', label: 'Контракты общие' },
  { path: '/group-contracts', label: 'Контракты группы' },
  { path: '/group-kpk-chat', label: 'Чат КПК группы' },
  { path: '/org-kpk-chat', label: 'Чат КПК организации' },
  { path: '/alter-ego', label: 'Альтерэго' },
  { path: '/group-maps', label: 'Карты' },
  { path: '/group-info', label: 'Информация' },
];

const LeftSide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        return;
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error);
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        setUser(JSON.parse(atob(token.split('.')[1])));
      } catch (error) {
        console.error('Ошибка парсинга токена:', error);
      }
    }
  }, []);

  const isAdmin = user && ['Admin', 'admin', 'ADMIN'].includes(user.role);

  return (
    <div className="left-side">
      <div className="left-side-content">
        <div className="nav-section-label">Наёмники</div>
        <div className="stalker-buttons">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`stalker-btn ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="btn-text">{item.label}</span>
            </button>
          ))}

          {isAdmin && (
            <button
              type="button"
              className={`stalker-btn ${isActive('/user-management') ? 'active' : ''}`}
              onClick={() => navigate('/user-management')}
            >
              <span className="btn-text">Управление группами</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
