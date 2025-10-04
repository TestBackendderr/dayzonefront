import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stalkersAPI } from '../../services/api';
import StalkerGrid from '../StalkerGrid/StalkerGrid';
import RoleNavigation from '../RoleNavigation/RoleNavigation';
import '../StalkerGrid/StalkerGrid.scss';
import './RoleStalkerArchive.scss';

const RoleStalkerArchive = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [stalkers, setStalkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (role) {
      fetchStalkers();
    }
  }, [role, searchBy, searchTerm]);

  const fetchRoles = async () => {
    try {
      const response = await stalkersAPI.getRoles();
      setRoles(response.roles);
    } catch (error) {
      console.error('Ошибка получения ролей:', error);
    }
  };

  const fetchStalkers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stalkersAPI.getByRole(role, searchBy, searchTerm);
      setStalkers(response.stalkers);
    } catch (error) {
      console.error('Ошибка получения сталкеров:', error);
      setError('Ошибка загрузки списка сталкеров');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newSearchBy, newSearchTerm) => {
    setSearchBy(newSearchBy);
    setSearchTerm(newSearchTerm);
  };

  const handleAddStalker = () => {
    navigate('/add-stalker');
  };

  const getCurrentRoleInfo = () => {
    return roles.find(r => r.value.toLowerCase() === role?.toLowerCase());
  };

  const roleInfo = getCurrentRoleInfo();

  if (loading && stalkers.length === 0) {
    return (
      <div className="role-stalker-archive">
        <div className="loading">Загрузка архива сталкеров...</div>
      </div>
    );
  }

  return (
    <div className="role-stalker-archive">
      <RoleNavigation />
      
      {roleInfo && (
        <div 
          className="archive-header"
          style={{ '--role-color': roleInfo.color }}
        >
          <div className="header-content">
            <h1 className="archive-title">
              <span className="role-icon">☢</span>
              Архив сталкеров: {roleInfo.label}
            </h1>
            <p className="archive-description">
              Управление базой данных сталкеров фракции {roleInfo.label}
            </p>
          </div>
          <button 
            className="add-stalker-btn"
            onClick={handleAddStalker}
          >
            <span className="btn-icon">+</span>
            Добавить сталкера
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <StalkerGrid
        stalkers={stalkers}
        loading={loading}
        onSearch={handleSearch}
        searchBy={searchBy}
        searchTerm={searchTerm}
        onRefresh={fetchStalkers}
        showRoleFilter={false}
      />

      {stalkers.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">☢</div>
          <h3>Архив пуст</h3>
          <p>В архиве фракции {roleInfo?.label || role} пока нет сталкеров</p>
          <button 
            className="add-first-btn"
            onClick={handleAddStalker}
          >
            Добавить первого сталкера
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleStalkerArchive;
