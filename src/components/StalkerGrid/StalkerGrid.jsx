import React, { useState } from 'react';
import EditStalkerModal from '../EditStalkerModal/EditStalkerModal';
import Modal from '../Modal/Modal';
import { API_CONFIG } from '../../config/api';

const StalkerGrid = ({ 
  stalkers, 
  loading, 
  onSearch, 
  searchBy, 
  searchTerm, 
  onRefresh,
  showRoleFilter = true 
}) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [editModal, setEditModal] = useState({ isOpen: false, stalker: null });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteStalker = async (id) => {
    showModal(
      'Подтверждение удаления',
      'Вы уверены, что хотите удалить этого сталкера?',
      'confirm'
    );
    
    // Сохраняем ID для последующего удаления
    setModal(prev => ({ ...prev, onConfirm: () => performDelete(id) }));
  };

  const performDelete = async (id) => {
    try {
      const { stalkersAPI } = await import('../../services/api');
      await stalkersAPI.delete(id);
      // Обновляем список сталкеров
      onRefresh();
      showModal('Успех', 'Сталкер успешно удален', 'success');
    } catch (error) {
      showModal('Ошибка', 'Ошибка удаления сталкера: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleEditStalker = (stalker) => {
    setEditModal({ isOpen: true, stalker });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, stalker: null });
  };

  const handleUpdateStalker = () => {
    // Обновляем список сталкеров после редактирования
    onRefresh();
    showModal('Успех', 'Сталкер успешно обновлен', 'success');
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
              {/* <span className="search-icon">🔍</span> */}
            </div>
          </div>
        </div>
      )}

      <div className="stalkers-grid">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner" />
            <p>Загрузка сталкеров...</p>
          </div>
        ) : stalkers.length > 0 ? (
          stalkers.map(stalker => (
            <div key={stalker.id} className="stalker-card">
              <div className="stalker-photo">
                <img 
                  src={stalker.photo ? `${API_CONFIG.FILE_BASE_URL}${stalker.photo}` : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="#ff6b6b"/>
                      <text x="100" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${stalker.callsign}</text>
                    </svg>
                  `)}`} 
                  alt={stalker.callsign} 
                />
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
                  
                  {stalker.role && (
                    <div className="detail-row">
                      <span className="detail-label">Бд фракции :</span>
                      <span className="detail-value role-value">{stalker.role}</span>
                    </div>
                  )}
                  
                  {stalker.note && (
                    <div className="detail-row note-row">
                      <span className="detail-label">Заметка:</span>
                      <span className="detail-value note-text">{stalker.note}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="stalker-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEditStalker(stalker)}
                >
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
            <div className="no-results-icon" />
            <h3>Сталкеры не найдены</h3>
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

      <EditStalkerModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        stalker={editModal.stalker}
        onUpdate={handleUpdateStalker}
      />
    </>
  );
};

export default StalkerGrid;
