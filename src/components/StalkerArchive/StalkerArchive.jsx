import React, { useState, useEffect } from 'react';
import { stalkersAPI } from '../../services/api';
import StalkerGrid from '../StalkerGrid/StalkerGrid';
import '../StalkerGrid/StalkerGrid.scss';
import './StalkerArchive.scss';

const StalkerArchive = () => {
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');
  const [stalkers, setStalkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка сталкеров при монтировании компонента
  useEffect(() => {
    loadStalkers();
  }, []);

  // Загрузка сталкеров при изменении поиска
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStalkers();
    }, 500); // Задержка для поиска

    return () => clearTimeout(timeoutId);
  }, [searchBy, searchTerm]);

  const loadStalkers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await stalkersAPI.getAll(searchBy, searchTerm);
      setStalkers(response.stalkers);
    } catch (error) {
      setError('Ошибка загрузки сталкеров: ' + (error.response?.data?.message || error.message));
      setStalkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newSearchBy, newSearchTerm) => {
    setSearchBy(newSearchBy);
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className="stalker-archive">
      <div className="archive-header">
        <h2>Архив сталкеров</h2>
        <p>База данных   всех зарегистрированных сталкеров зоны</p>
      </div>

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
        onRefresh={loadStalkers}
        showRoleFilter={true}
      />
    </div>
  );
};

export default StalkerArchive;