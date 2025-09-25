import React, { useState } from 'react';
import './AddStalker.scss';

const AddStalker = () => {
  const [stalkerData, setStalkerData] = useState({
    callsign: '',
    fullName: '',
    faceId: '',
    note: '',
    photo: null
  });

  const [preview, setPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStalkerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStalkerData(prev => ({
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
    console.log('Добавление сталкера:', stalkerData);
    // Здесь будет логика отправки данных
    alert('Сталкер добавлен в базу данных!');
  };

  return (
    <div className="add-stalker">
      <div className="add-stalker-header">
        <h2>Добавление нового сталкера</h2>
        <p>Заполните информацию о сталкере для внесения в базу данных</p>
      </div>

      <form className="stalker-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="callsign">Позывной *</label>
          <input
            type="text"
            id="callsign"
            name="callsign"
            value={stalkerData.callsign}
            onChange={handleInputChange}
            placeholder="Введите позывной сталкера"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">ФИО *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={stalkerData.fullName}
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
            value={stalkerData.faceId}
            onChange={handleInputChange}
            placeholder="Введите ID лица"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Заметка</label>
          <textarea
            id="note"
            name="note"
            value={stalkerData.note}
            onChange={handleInputChange}
            placeholder="Дополнительная информация о сталкере"
            rows="4"
          />
        </div>

        <div className="form-group photo-group">
          <label htmlFor="photo">Фото сталкера</label>
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
            <span className="btn-icon">☢</span>
            Добавить сталкера
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStalker;
