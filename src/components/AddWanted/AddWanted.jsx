import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wantedAPI } from '../../services/api';
import LeftSide from '../LeftSide/LeftSide';
import './AddWanted.scss';

const AddWanted = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    callsign: '',
    fullName: '',
    faceId: '',
    reward: '',
    lastSeen: '',
    reason: '',
    photo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await wantedAPI.create(formData);
      navigate('/wanted-archive');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении в розыск');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-wanted">
      <LeftSide />
      <div className="add-wanted-container">
        <h2 className="add-wanted-title">Добавить в розыск</h2>
        
        <form onSubmit={handleSubmit} className="add-wanted-form">
          <div className="form-group">
            <label htmlFor="callsign">Позывной *</label>
            <input
              type="text"
              id="callsign"
              name="callsign"
              value={formData.callsign}
              onChange={handleInputChange}
              required
              placeholder="Введите позывной"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">ФИО *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Введите полное имя"
            />
          </div>

          <div className="form-group">
            <label htmlFor="faceId">ID лица *</label>
            <input
              type="text"
              id="faceId"
              name="faceId"
              value={formData.faceId}
              onChange={handleInputChange}
              required
              placeholder="Введите ID лица"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reward">Награда *</label>
            <input
              type="number"
              id="reward"
              name="reward"
              value={formData.reward}
              onChange={handleInputChange}
              required
              placeholder="Введите размер награды"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastSeen">Последний раз видели *</label>
            <input
              type="text"
              id="lastSeen"
              name="lastSeen"
              value={formData.lastSeen}
              onChange={handleInputChange}
              required
              placeholder="Где и когда последний раз видели"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Причина розыска *</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="Опишите причину розыска"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">Фото</label>
            <input
              type="file"
              id="photo"
              name="photo"
              onChange={handlePhotoChange}
              accept="image/*"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/wanted-archive')} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Добавление...' : 'Добавить в розыск'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWanted;
