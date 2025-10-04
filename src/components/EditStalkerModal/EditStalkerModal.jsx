import React, { useState, useEffect } from 'react';
import { stalkersAPI } from '../../services/api';
import './EditStalkerModal.scss';

const EditStalkerModal = ({ isOpen, onClose, stalker, onUpdate }) => {
  const [formData, setFormData] = useState({
    callsign: '',
    fullName: '',
    faceId: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stalker && isOpen) {
      setFormData({
        callsign: stalker.callsign || '',
        fullName: stalker.full_name || '',
        faceId: stalker.face_id || '',
        note: stalker.note || ''
      });
      setError('');
    }
  }, [stalker, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await stalkersAPI.update(stalker.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при обновлении сталкера');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-stalker-modal-overlay">
      <div className="edit-stalker-modal">
        <div className="modal-header">
          <h2>Редактировать сталкера</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="callsign">Позывной *</label>
            <input
              type="text"
              id="callsign"
              name="callsign"
              value={formData.callsign}
              onChange={handleInputChange}
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Заметка</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="4"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={`btn-save ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner">☢</span>
                  Сохранение...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStalkerModal;
