import React, { useState } from 'react';
import './AddSearch.scss';

const AddSearch = () => {
  const [wantedData, setWantedData] = useState({
    callsign: '',
    fullName: '',
    faceId: '',
    note: '',
    reward: '',
    lastSeen: '',
    photo: null
  });

  const [preview, setPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWantedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWantedData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Добавление в розыск:', wantedData);
    // Здесь будет логика отправки данных
    alert('Сталкер добавлен в розыск!');
  };

  return (
    <div className="add-search">
      <div className="add-search-header">
        <h2>Добавление в розыск</h2>
        <p>Заполните информацию о разыскиваемом сталкере</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="callsign">Позывной *</label>
          <input
            type="text"
            id="callsign"
            name="callsign"
            value={wantedData.callsign}
            onChange={handleInputChange}
            placeholder="Введите позывной разыскиваемого"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">ФИО *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={wantedData.fullName}
            onChange={handleInputChange}
            placeholder="Введите полное имя"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="faceId">ID лица *</label>
          <input
            type="text"
            id="faceId"
            name="faceId"
            value={wantedData.faceId}
            onChange={handleInputChange}
            placeholder="Введите ID лица"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reward">Награда *</label>
          <input
            type="number"
            id="reward"
            name="reward"
            value={wantedData.reward}
            onChange={handleInputChange}
            placeholder="Введите размер награды в рублях"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastSeen">Последний раз видели *</label>
          <input
            type="text"
            id="lastSeen"
            name="lastSeen"
            value={wantedData.lastSeen}
            onChange={handleInputChange}
            placeholder="Например: Припять, Лаборатория X-18"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Причина розыска *</label>
          <textarea
            id="note"
            name="note"
            value={wantedData.note}
            onChange={handleInputChange}
            placeholder="Опишите преступления или причины розыска"
            rows="4"
            required
          />
        </div>

        <div className="form-group photo-group">
          <label htmlFor="photo">Фото разыскиваемого</label>
          <div className="photo-upload">
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
            <label htmlFor="photo" className="photo-label">
              {preview ? (
                <img src={preview} alt="Preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <span className="photo-icon">📷</span>
                  <span>Выберите фото</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel">
            Отмена
          </button>
          <button type="submit" className="btn-submit">
            <span className="btn-icon">⚠</span>
            Добавить в розыск
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSearch;
