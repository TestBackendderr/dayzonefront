import React, { useState } from 'react';
import './Search.scss';

const Search = () => {
  const [searchBy, setSearchBy] = useState('callsign');
  const [searchTerm, setSearchTerm] = useState('');

  // Моковые данные розыска
  const [wantedStalkers] = useState([
    {
      id: 1,
      callsign: 'Бандит',
      fullName: 'Смирнов Алексей Владимирович',
      faceId: 'WT001',
      note: 'Разыскивается за грабежи в зоне, вооружен и опасен',
      photo: 'https://via.placeholder.com/200x200/e74c3c/ffffff?text=Бандит',
      reward: '50000',
      lastSeen: 'Припять'
    },
    {
      id: 2,
      callsign: 'Предатель',
      fullName: 'Кузнецов Дмитрий Сергеевич',
      faceId: 'WT002',
      note: 'Разыскивается за убийство сталкера, скрывается в подземельях',
      photo: 'https://via.placeholder.com/200x200/c0392b/ffffff?text=Предатель',
      reward: '75000',
      lastSeen: 'Лаборатория X-18'
    },
    {
      id: 3,
      callsign: 'Маньяк',
      fullName: 'Попов Игорь Николаевич',
      faceId: 'WT003',
      note: 'Сериальный убийца сталкеров, крайне опасен',
      photo: 'https://via.placeholder.com/200x200/8e44ad/ffffff?text=Маньяк',
      reward: '100000',
      lastSeen: 'Рыжий лес'
    },
    {
      id: 4,
      callsign: 'Двойной агент',
      fullName: 'Васильев Андрей Петрович',
      faceId: 'WT004',
      note: 'Работает на военных и бандитов одновременно',
      photo: 'https://via.placeholder.com/200x200/f39c12/ffffff?text=Двойной агент',
      reward: '30000',
      lastSeen: 'Армейские склады'
    }
  ]);

  const filteredWanted = wantedStalkers.filter(wanted => {
    if (!searchTerm) return true;
    
    if (searchBy === 'callsign') {
      return wanted.callsign.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'faceId') {
      return wanted.faceId.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'fullName') {
      return wanted.fullName.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="wanted-search">
      <div className="search-header">
        <h2>Розыск</h2>
        <p>База данных разыскиваемых сталкеров зоны</p>
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

      <div className="wanted-grid">
        {filteredWanted.length > 0 ? (
          filteredWanted.map(wanted => (
            <div key={wanted.id} className="wanted-card">
              <div className="wanted-photo">
                <img src={wanted.photo} alt={wanted.callsign} />
                <div className="danger-overlay">⚠</div>
              </div>
              
              <div className="wanted-info">
                <div className="wanted-callsign">
                  <span className="callsign-label">Позывной:</span>
                  <span className="callsign-value">{wanted.callsign}</span>
                </div>
                
                <div className="wanted-details">
                  <div className="detail-row">
                    <span className="detail-label">ФИО:</span>
                    <span className="detail-value">{wanted.fullName}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ID лица:</span>
                    <span className="detail-value face-id">{wanted.faceId}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Награда:</span>
                    <span className="detail-value reward-value">{wanted.reward} руб.</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Последний раз видели:</span>
                    <span className="detail-value last-seen">{wanted.lastSeen}</span>
                  </div>
                  
                  {wanted.note && (
                    <div className="detail-row note-row">
                      <span className="detail-label">Причина розыска:</span>
                      <span className="detail-value note-text">{wanted.note}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="wanted-actions">
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
            <div className="no-results-icon">⚠</div>
            <h3>Разыскиваемые не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
