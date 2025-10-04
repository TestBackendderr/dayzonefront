import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { wantedAPI } from '../../services/api';
import './WantedRoleNavigation.scss';

const WantedRoleNavigation = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await wantedAPI.getRoles();
        setRoles(response.roles);
      } catch (err) {
        setError('Ошибка при загрузке ролей: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) return <div className="wanted-role-navigation-loading">Загрузка ролей...</div>;
  if (error) return <div className="wanted-role-navigation-error">{error}</div>;

  return (
    <nav className="wanted-role-navigation">
      <ul className="role-list">
        {roles.map(role => (
          <li key={role.value} className="role-item">
            <NavLink
              to={`/wanted-archive/role/${role.value}`}
              className={({ isActive }) => `role-link ${isActive ? 'active' : ''}`}
              style={{ '--role-color': role.color }}
            >
              {role.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default WantedRoleNavigation;
