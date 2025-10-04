import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { stalkersAPI } from '../../services/api';
import './RoleNavigation.scss';

const RoleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await stalkersAPI.getRoles();
      setRoles(response.roles);
    } catch (error) {
      console.error('Ошибка получения ролей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (roleValue) => {
    navigate(`/stalkers/${roleValue.toLowerCase()}`);
  };

  const getCurrentRole = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'stalkers' && pathParts[2]) {
      return pathParts[2].toLowerCase();
    }
    return null;
  };

  if (loading) {
    return (
      <div className="role-navigation">
        <div className="loading">Загрузка ролей...</div>
      </div>
    );
  }

  return (
    <div className="role-navigation">
      <h3 className="navigation-title">Архивы сталкеров</h3>
      <div className="roles-grid">
        {roles.map((role) => {
          const isActive = getCurrentRole() === role.value.toLowerCase();
          return (
            <div
              key={role.value}
              className={`role-card ${isActive ? 'active' : ''}`}
              onClick={() => handleRoleClick(role.value)}
              style={{ '--role-color': role.color }}
            >
              <div className="role-icon">
                <span>☢</span>
              </div>
              <div className="role-info">
                <h4 className="role-name">{role.label}</h4>
                <p className="role-description">
                  Архив сталкеров фракции {role.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleNavigation;
