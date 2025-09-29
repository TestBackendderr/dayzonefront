import React, { useState, useEffect } from 'react';
import { wantedAPI } from '../../services/api';
import LeftSide from '../LeftSide/LeftSide';
import Modal from '../Modal/Modal';
import './WantedArchive.scss';

const WantedArchive = () => {
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');
  const [wantedStalkers, setWantedStalkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

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
      setWantedStalkers(response.wanted || []);
    } catch (error) {
      setError('Ошибка загрузки базы розыска: ' + (error.response?.data?.message || error.message));
      setWantedStalkers([]);
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

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteWanted = async (id) => {
    showModal(
      'Подтверждение удаления',
      'Вы уверены, что хотите удалить этого разыскиваемого сталкера?',
      'confirm'
    );
    
    // Сохраняем ID для последующего удаления
    setModal(prev => ({ ...prev, onConfirm: () => performDelete(id) }));
  };

  const performDelete = async (id) => {
    try {
      await wantedAPI.delete(id);
      // Обновляем список разыскиваемых сталкеров
      loadWantedStalkers();
      showModal('Успех', 'Разыскиваемый сталкер успешно удален', 'success');
    } catch (error) {
      showModal('Ошибка', 'Ошибка удаления: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  return (
    <div className="wanted-archive">
      <LeftSide />
      <div className="archive-header">
        <h2>База розыска</h2>
        <p>База данных всех разыскиваемых сталкеров зоны</p>
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

      <div className="wanted-grid">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner">☢</div>
            <p>Загрузка базы розыска...</p>
          </div>
        ) : wantedStalkers && wantedStalkers.length > 0 ? (
          wantedStalkers.map(wanted => (
            <div key={wanted.id} className="wanted-card">
              <div className="wanted-photo">
                <img 
                  src={wanted.photo ? `http://localhost:5000${wanted.photo}` : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="#ff6b6b"/>
                      <text x="100" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${wanted.callsign}</text>
                    </svg>
                  `)}`} 
                  alt={wanted.callsign} 
                />
                <div className="radiation-overlay">☢</div>
                <div className="wanted-badge">РАЗЫСКИВАЕТСЯ</div>
              </div>
              
              <div className="wanted-info">
                <div className="wanted-callsign">
                  <span className="callsign-label">Позывной:</span>
                  <span className="callsign-value">{wanted.callsign}</span>
                </div>
                
                <div className="wanted-details">
                  <div className="detail-row">
                    <span className="detail-label">ФИО:</span>
                    <span className="detail-value">{wanted.full_name}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ID лица:</span>
                    <span className="detail-value face-id">{wanted.face_id}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Награда:</span>
                    <span className="detail-value reward">{wanted.reward} руб.</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Последний раз видели:</span>
                    <span className="detail-value">{wanted.last_seen}</span>
                  </div>
                  
                  {wanted.reason && (
                    <div className="detail-row note-row">
                      <span className="detail-label">Причина розыска:</span>
                      <span className="detail-value note-text">{wanted.reason}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="wanted-actions">
                <button className="action-btn edit-btn">
                  <span>✏️</span>
                  Редактировать
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteWanted(wanted.id)}
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
            <h3>Разыскиваемые сталкеры не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.type === 'confirm'}
      />
    </div>
  );
};

export default WantedArchive;
