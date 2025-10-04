import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Modal from '../Modal/Modal';
import './UserManagement.scss';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [createModal, setCreateModal] = useState({ isOpen: false });

  const roles = [
    { value: 'Admin', label: 'Администратор', color: '#ff6b6b' },
    { value: 'Duty', label: 'Долг', color: '#ff0000' },
    { value: 'Freedom', label: 'Свобода', color: '#00ff00' },
    { value: 'Neutral', label: 'Нейтральный', color: '#ffff00' },
    { value: 'Mercenary', label: 'Наемник', color: '#ff6600' },
    { value: 'Bandit', label: 'Бандит', color: '#ff0066' },
    { value: 'Monolith', label: 'Монолит', color: '#6600ff' },
    { value: 'ClearSky', label: 'Чистое небо', color: '#00ffff' },
    { value: 'Loner', label: 'Одиночка', color: '#666666' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getAll();
      setUsers(response.users);
    } catch (error) {
      setError('Ошибка загрузки пользователей: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteUser = async (id, username) => {
    showModal(
      'Подтверждение удаления',
      `Вы уверены, что хотите удалить пользователя "${username}"?`,
      'confirm'
    );
    
    setModal(prev => ({ ...prev, onConfirm: () => performDelete(id) }));
  };

  const performDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      loadUsers();
      showModal('Успех', 'Пользователь успешно удален', 'success');
    } catch (error) {
      showModal('Ошибка', 'Ошибка удаления пользователя: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditModal({ isOpen: true, user });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, user: null });
  };

  const handleCreateUser = () => {
    setCreateModal({ isOpen: true });
  };

  const closeCreateModal = () => {
    setCreateModal({ isOpen: false });
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || { label: role, color: '#666666' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>Управление пользователями</h2>
        <p>Создание и управление пользователями системы</p>
        <button className="btn-create-user" onClick={handleCreateUser}>
          <span>👤</span>
          Добавить пользователя
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="users-table">
        {loading ? (
          <div className="loading-message">
            <div className="loading-spinner">☢</div>
            <p>Загрузка пользователей...</p>
          </div>
        ) : users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Позывной</th>
                <th>Роль</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id}>
                    <td className="username-cell">
                      <span className="user-icon">👤</span>
                      {user.username}
                    </td>
                    <td className="role-cell">
                      <span 
                        className="role-badge" 
                        style={{ backgroundColor: roleInfo.color }}
                      >
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditUser(user)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h3>Пользователи не найдены</h3>
            <p>Создайте первого пользователя</p>
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

      <CreateUserModal
        isOpen={createModal.isOpen}
        onClose={closeCreateModal}
        onUserCreated={loadUsers}
        roles={roles}
      />

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        user={editModal.user}
        onUserUpdated={loadUsers}
        roles={roles}
      />
    </div>
  );
};

// Компонент для создания пользователя
const CreateUserModal = ({ isOpen, onClose, onUserCreated, roles }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Duty'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', password: '', role: 'Duty' });
      setError('');
    }
  }, [isOpen]);

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
      await usersAPI.create(formData);
      onUserCreated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при создании пользователя');
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Добавить пользователя</h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Позывной *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Введите позывной"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Введите пароль"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Роль *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={`btn-save ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner">☢</span>
                  Создание...
                </>
              ) : (
                <>
                  <span className="btn-icon">👤</span>
                  Создать
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для редактирования пользователя
const EditUserModal = ({ isOpen, onClose, user, onUserUpdated, roles }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Duty'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        password: '',
        role: user.role || 'Duty'
      });
      setError('');
    }
  }, [user, isOpen]);

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
      const updateData = {
        username: formData.username,
        role: formData.role
      };
      
      // Добавляем пароль только если он указан
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await usersAPI.update(user.id, updateData);
      onUserUpdated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при обновлении пользователя');
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Редактировать пользователя</h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Позывной *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Новый пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Оставьте пустым, чтобы не изменять"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Роль *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={`btn-save ${loading ? 'loading' : ''}`} disabled={loading}>
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

export default UserManagement;
