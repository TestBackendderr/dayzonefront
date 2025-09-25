import React, { useState } from 'react';
import './StalkerArchive.scss';

const StalkerArchive = () => {
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');

  // Моковые данные сталкеров
  const [stalkers] = useState([
    {
      id: 1,
      callsign: 'Снайпер',
      fullName: 'Иванов Иван Иванович',
      faceId: 'ST001',
      note: 'Опытный сталкер, специализируется на дальних переходах',
      photo: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Снайпер'
    },
    {
      id: 2,
      callsign: 'Волк',
      fullName: 'Петров Петр Петрович',
      faceId: 'ST002',
      note: 'Бывший военный, знает зону как свои пять пальцев',
      photo: 'https://via.placeholder.com/200x200/ee5a24/ffffff?text=Волк'
    },
    {
      id: 3,
      callsign: 'Тень',
      fullName: 'Сидоров Сидор Сидорович',
      faceId: 'ST003',
      note: 'Мастер скрытности, работает в одиночку',
      photo: 'https://via.placeholder.com/200x200/2c3e50/ffffff?text=Тень'
    },
    {
      id: 4,
      callsign: 'Охотник',
      fullName: 'Козлов Козел Козлович',
      faceId: 'ST004',
      note: 'Специалист по артефактам, имеет связи с учеными',
      photo: 'https://via.placeholder.com/200x200/34495e/ffffff?text=Охотник'
    }
  ]);

  const filteredStalkers = stalkers.filter(stalker => {
    if (!searchTerm) return true;
    
    if (searchBy === 'callsign') {
      return stalker.callsign.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'faceId') {
      return stalker.faceId.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'fullName') {
      return stalker.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchBy(e.target.value);
    setSearchTerm('');
  };

  return (
    <div className="stalker-archive">
      <div className="archive-header">
        <h2>Архив сталкеров</h2>
        <p>База данных всех зарегистрированных сталкеров зоны</p>
      </div>

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
        {filteredStalkers.length > 0 ? (
          filteredStalkers.map(stalker => (
            <div key={stalker.id} className="stalker-card">
              <div className="stalker-photo">
                <img src={stalker.photo} alt={stalker.callsign} />
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
                    <span className="detail-value">{stalker.fullName}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ID лица:</span>
                    <span className="detail-value face-id">{stalker.faceId}</span>
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
                <button className="action-btn delete-btn">
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
