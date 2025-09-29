import React from 'react';
import './Modal.scss';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, showCancel = false }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'modal-success';
      case 'error':
        return 'modal-error';
      case 'warning':
        return 'modal-warning';
      case 'confirm':
        return 'modal-confirm';
      default:
        return 'modal-info';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal ${getTypeClass()}`}>
        <div className="modal-header">
          <div className="modal-icon">
            {getIcon()}
          </div>
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              Отмена
            </button>
          )}
          <button 
            className={`modal-btn modal-btn-primary ${type === 'confirm' ? 'modal-btn-confirm' : ''}`}
            onClick={handleConfirm}
          >
            {type === 'confirm' ? 'Подтвердить' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
