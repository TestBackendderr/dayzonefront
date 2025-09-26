import React, { useState, useEffect } from 'react';
import { stalkersAPI } from '../../services/api';
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchBy(e.target.value);
    setSearchTerm('');
  };

  const handleDeleteStalker = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого сталкера?')) {
      return;
    }

    try {
      await stalkersAPI.delete(id);
      // Обновляем список сталкеров
      loadStalkers();
      alert('Сталкер успешно удален');
    } catch (error) {
      alert('Ошибка удаления сталкера: ' + (error.response?.data?.message || error.message));
    }
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

      <div className="search-section">
        <div className="search-controls">
          <div className="search-type">
            <label>Поиск по:</label>
            <select value={searchBy} onChange={handleSearchTypeChange}>
              <option value="callsign">Позывному</option>
              <option value="faceId">ID лица</option>
              <option value="fullName">ФИО</option>
            </select>
          </div>
          
          <div className="search-input">
            <input
              type="text"
              placeholder={`Введите ${searchBy === 'callsign' ? 'позывной' : searchBy === 'faceId' ? 'ID лица' : 'ФИО'} для поиска`}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="stalkers-grid">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner">☢</div>
            <p>Загрузка сталкеров...</p>
          </div>
        ) : stalkers.length > 0 ? (
          stalkers.map(stalker => (
            <div key={stalker.id} className="stalker-card">
              <div className="stalker-photo">
                <img 
                  src={stalker.photo ? `http://localhost:5000${stalker.photo}` : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="#ff6b6b"/>
                      <text x="100" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${stalker.callsign}</text>
                    </svg>
                  `)}`} 
                  alt={stalker.callsign} 
                />
                <div className="radiation-overlay">☢</div>
              </div>
              
              <div className="stalker-info">
                <div className="stalker-callsign">
                  <span className="callsign-label">Позывной:</span>
                  <span className="callsign-value">{stalker.callsign}</span>
                </div>
                
                <div className="stalker-details">
                  <div className="detail-row">
                    <span className="detail-label">ФИО:</span>
                    <span className="detail-value">{stalker.full_name}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ID лица:</span>
                    <span className="detail-value face-id">{stalker.face_id}</span>
                  </div>
                  
                  {stalker.note && (
                    <div className="detail-row note-row">
                      <span className="detail-label">Заметка:</span>
                      <span className="detail-value note-text">{stalker.note}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="stalker-actions">
                <button className="action-btn edit-btn">
                  <span>✏️</span>
                  Редактировать
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteStalker(stalker.id)}
                >
                  <span>🗑️</span>
                  Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">☢</div>
            <h3>Сталкеры не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StalkerArchive;