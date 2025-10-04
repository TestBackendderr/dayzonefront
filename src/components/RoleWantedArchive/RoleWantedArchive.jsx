import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { wantedAPI } from '../../services/api';
import WantedGrid from '../WantedGrid/WantedGrid';
import WantedRoleNavigation from '../WantedRoleNavigation/WantedRoleNavigation';
import './RoleWantedArchive.scss';

const RoleWantedArchive = () => {
  const { role } = useParams(); // Получаем роль из URL
  const [wanted, setWanted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('callsign');

  const loadWanted = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wantedAPI.getByRole(role, searchBy, searchTerm);
      setWanted(response.wanted);
    } catch (err) {
      setError('Ошибка при загрузке розыска: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [role, searchBy, searchTerm]);

  useEffect(() => {
    loadWanted();
  }, [loadWanted]);

  const handleSearch = (newSearchBy, newSearchTerm) => {
    setSearchBy(newSearchBy);
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className="role-wanted-archive">
      <WantedRoleNavigation /> {/* Навигация по ролям */}
      
      <div className="role-wanted-archive-header">
        <h2>База розыска: {role}</h2>
        <p>Список разыскиваемых, принадлежащих к фракции "{role}"</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <WantedGrid
        wanted={wanted}
        loading={loading}
        onSearch={handleSearch}
        searchBy={searchBy}
        searchTerm={searchTerm}
        onRefresh={loadWanted}
        showRoleFilter={false}
      />

      {wanted.length === 0 && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">☢</div>
          <h3>База розыска пуста</h3>
          <p>Разыскиваемые фракции "{role}" не найдены</p>
        </div>
      )}
    </div>
  );
};

export default RoleWantedArchive;
