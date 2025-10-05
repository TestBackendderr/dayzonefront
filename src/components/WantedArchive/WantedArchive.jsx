import React, { useState, useEffect } from 'react';
import { wantedAPI } from '../../services/api';
import LeftSide from '../LeftSide/LeftSide';
import WantedGrid from '../WantedGrid/WantedGrid';
import '../WantedGrid/WantedGrid.scss';
import './WantedArchive.scss';

const WantedArchive = () => {
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');
  const [wantedStalkers, setWantedStalkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка разыскиваемых сталкеров при монтировании компонента
  useEffect(() => {
    loadWantedStalkers();
  }, []);

  // Загрузка разыскиваемых сталкеров при изменении поиска
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadWantedStalkers();
    }, 500); // Задержка для поиска

    return () => clearTimeout(timeoutId);
  }, [searchBy, searchTerm]);

  const loadWantedStalkers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wantedAPI.getAll(searchBy, searchTerm);
      setWantedStalkers(response.wanted);
    } catch (error) {
      setError('Ошибка загрузки базы розыска: ' + (error.response?.data?.message || error.message));
      setWantedStalkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newSearchBy, newSearchTerm) => {
    setSearchBy(newSearchBy);
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className="wanted-archive">
      <LeftSide />
      <div className="archive-header">
        <h2>
          <span className="radiation-icon">☢</span>
          База розыска
        </h2>
        <p>База данных всех разыскиваемых сталкеров зоны</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <WantedGrid
        wanted={wantedStalkers}
        loading={loading}
        onSearch={handleSearch}
        searchBy={searchBy}
        searchTerm={searchTerm}
        onRefresh={loadWantedStalkers}
        showRoleFilter={true}
      />
    </div>
  );
};

export default WantedArchive;