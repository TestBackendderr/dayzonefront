import React, { useState } from 'react';
import Modal from '../Modal/Modal';

const WantedGrid = ({ 
  wanted, 
  loading, 
  onSearch, 
  searchBy, 
  searchTerm, 
  onRefresh,
  showRoleFilter = true 
}) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteWanted = async (id) => {
    showModal(
      'Подтверждение удаления',
      'Вы уверены, что хотите удалить этого разыскиваемого?',
      'confirm'
    );
    
    // Сохраняем ID для последующего удаления
    setModal(prev => ({ ...prev, onConfirm: () => performDelete(id) }));
  };

  const performDelete = async (id) => {
    try {
      const { wantedAPI } = await import('../../services/api');
      await wantedAPI.delete(id);
      // Обновляем список разыскиваемых
      onRefresh();
      showModal('Успех', 'Разыскиваемый успешно удален', 'success');
    } catch (error) {
      showModal('Ошибка', 'Ошибка удаления разыскиваемого: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const formatReward = (reward) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(reward);
  };

  return (
    <>
      {showRoleFilter && (
        <div className="search-section">
          <div className="search-controls">
            <div className="search-type">
              <label>Поиск по:</label>
              <select value={searchBy} onChange={(e) => onSearch(e.target.value, searchTerm)}>
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
                onChange={(e) => onSearch(searchBy, e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>
      )}

      <div className="wanted-grid">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner">☢</div>
            <p>Загрузка розыска...</p>
          </div>
        ) : wanted.length > 0 ? (
          wanted.map(person => (
            <div key={person.id} className="wanted-card">
              <div className="wanted-photo">
                <img 
                  src={person.photo ? `http://localhost:5000${person.photo}` : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="#ff6b6b"/>
                      <text x="100" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${person.callsign}</text>
                    </svg>
                  `)}`} 
                  alt={person.callsign} 
                />
                <div className="radiation-overlay">☢</div>
                <div className="reward-badge">
                  {formatReward(person.reward)}
                </div>
              </div>
              
              <div className="wanted-info">
                <div className="wanted-callsign">
                  <span className="callsign-label">Позывной:</span>
                  <span className="callsign-value">{person.callsign}</span>
                </div>
                
                <div className="wanted-details">
                  <div className="detail-row">
                    <span className="detail-label">ФИО:</span>
                    <span className="detail-value">{person.full_name}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ID лица:</span>
                    <span className="detail-value face-id">{person.face_id}</span>
                  </div>

                  {person.role && (
                    <div className="detail-row">
                      <span className="detail-label">Фракция:</span>
                      <span className="detail-value role-value">{person.role}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Последнее место:</span>
                    <span className="detail-value location">{person.last_seen}</span>
                  </div>
                  
                  {person.reason && (
                    <div className="detail-row reason-row">
                      <span className="detail-label">Причина:</span>
                      <span className="detail-value reason-text">{person.reason}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="wanted-actions">
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteWanted(person.id)}
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
            <h3>Разыскиваемые не найдены</h3>
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
    </>
  );
};

export default WantedGrid;
