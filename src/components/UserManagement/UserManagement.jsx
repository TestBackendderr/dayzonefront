import React, { useState, useEffect, useMemo } from 'react';
import { usersAPI, groupingsAPI } from '../../services/api';
import Modal from '../Modal/Modal';
import './UserManagement.scss';

const ADMIN_ROLE = {
  value: 'Admin',
  label: 'Администратор',
  color: '#ff6b6b',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [createModal, setCreateModal] = useState({ isOpen: false });
  const [createGroupModal, setCreateGroupModal] = useState({ isOpen: false });
  const [assignModal, setAssignModal] = useState({ isOpen: false, group: null });

  const roleOptions = useMemo(
    () => [
      ADMIN_ROLE,
      ...groups.map((group) => ({
        value: group.code,
        label: group.name,
        color: group.color,
      })),
    ],
    [groups]
  );

  const filteredUsers = useMemo(() => {
    if (selectedGroup === 'all') {
      return users;
    }
    if (selectedGroup === 'Admin') {
      return users.filter((user) => user.role === 'Admin');
    }
    return users.filter((user) => user.role === selectedGroup);
  }, [users, selectedGroup]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersResponse, groupsResponse] = await Promise.all([
        usersAPI.getAll(),
        groupingsAPI.getAll(),
      ]);
      setUsers(usersResponse.users);
      setGroups(groupsResponse.groups);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
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

  const getRoleInfo = (role) => {
    if (role === ADMIN_ROLE.value) {
      return ADMIN_ROLE;
    }
    const group = groups.find((item) => item.code === role);
    if (group) {
      return { label: group.name, color: group.color };
    }
    return { label: role || 'Без группы', color: '#666666' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteUser = (id, username) => {
    showModal(
      'Подтверждение удаления',
      `Вы уверены, что хотите удалить пользователя "${username}"?`,
      'confirm'
    );
    setModal((prev) => ({ ...prev, onConfirm: () => performDelete(id) }));
  };

  const performDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      await loadData();
      showModal('Успех', 'Пользователь успешно удален', 'success');
    } catch (err) {
      showModal('Ошибка', 'Ошибка удаления пользователя: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteGroup = (group) => {
    showModal(
      'Подтверждение удаления',
      `Удалить группу "${group.name}"?`,
      'confirm'
    );
    setModal((prev) => ({
      ...prev,
      onConfirm: async () => {
        try {
          await groupingsAPI.delete(group.id);
          if (selectedGroup === group.code) {
            setSelectedGroup('all');
          }
          await loadData();
          showModal('Успех', 'Группа удалена', 'success');
        } catch (err) {
          showModal('Ошибка', err.response?.data?.message || err.message, 'error');
        }
      },
    }));
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>Управление пользователями</h2>
        <p>Создание групп и назначение пользователей</p>
      </div>

      <div className="role-filter-section">
        <div className="filter-header">
          <span className="filter-icon">▣</span>
          <span className="filter-title">Группировки:</span>
          <button className="btn-create-group" onClick={() => setCreateGroupModal({ isOpen: true })}>
            + Добавить группу
          </button>
        </div>
        <div className="role-filters">
          <button
            className={`role-filter-btn ${selectedGroup === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('all')}
          >
            <span className="role-icon">●</span>
            Все пользователи
          </button>
          <button
            className={`role-filter-btn ${selectedGroup === 'Admin' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('Admin')}
            style={{ borderColor: ADMIN_ROLE.color }}
          >
            <span className="role-icon" style={{ color: ADMIN_ROLE.color }}>●</span>
            {ADMIN_ROLE.label}
          </button>
          {groups.map((group) => (
            <div key={group.id} className="group-filter-item">
              <button
                className={`role-filter-btn ${selectedGroup === group.code ? 'active' : ''}`}
                onClick={() => setSelectedGroup(group.code)}
                style={{ borderColor: group.color }}
              >
                <span className="role-icon" style={{ color: group.color }}>●</span>
                {group.name}
                <span className="group-code">({group.code})</span>
              </button>
              <button
                className="btn-assign-group"
                title="Добавить пользователей в группу"
                onClick={() => setAssignModal({ isOpen: true, group })}
              >
                +
              </button>
              <button
                className="btn-delete-group"
                title="Удалить группу"
                onClick={() => handleDeleteGroup(group)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="add-user-section">
        <button className="btn-create-user" onClick={() => setCreateModal({ isOpen: true })}>
          <span className="btn-icon">👤</span>
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
            <div className="loading-spinner" />
            <p>Загрузка пользователей...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Позывной</th>
                <th>Группа</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id}>
                    <td className="username-cell">
                      <span className="user-icon">👤</span>
                      {user.username}
                    </td>
                    <td className="role-cell">
                      <span className="role-badge" style={{ backgroundColor: roleInfo.color }}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => setEditModal({ isOpen: true, user })}>
                        ✏️
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteUser(user.id, user.username)}>
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
            <div className="no-users-icon" />
            <h3>Пользователи не найдены</h3>
            <p>Создайте группу и добавьте пользователя</p>
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

      <CreateGroupModal
        isOpen={createGroupModal.isOpen}
        onClose={() => setCreateGroupModal({ isOpen: false })}
        onCreated={loadData}
      />

      <AssignUsersModal
        isOpen={assignModal.isOpen}
        group={assignModal.group}
        users={users}
        onClose={() => setAssignModal({ isOpen: false, group: null })}
        onAssigned={loadData}
      />

      <CreateUserModal
        isOpen={createModal.isOpen}
        onClose={() => setCreateModal({ isOpen: false })}
        onUserCreated={loadData}
        roleOptions={roleOptions}
        groups={groups}
      />

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        user={editModal.user}
        onUserUpdated={loadData}
        roleOptions={roleOptions}
      />
    </div>
  );
};

const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', code: '' });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await groupingsAPI.create(formData);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании группы');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Добавить группу</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="group-name">Название группы *</label>
            <input
              id="group-name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
              placeholder="Например: Альфа"
            />
          </div>
          <div className="form-group">
            <label htmlFor="group-code">ID группы *</label>
            <input
              id="group-code"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              required
              disabled={loading}
              placeholder="Например: alpha"
            />
          </div>
          {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>Создать группу</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignUsersModal = ({ isOpen, group, users, onClose, onAssigned }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && group) {
      setSelectedUserIds(
        users.filter((user) => user.role === group.code).map((user) => user.id)
      );
      setError('');
    }
  }, [isOpen, group, users]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!group) return;

    setLoading(true);
    setError('');

    try {
      await groupingsAPI.assignUsers(group.id, selectedUserIds);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка назначения пользователей');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !group) return null;

  const availableUsers = users.filter((user) => user.role !== 'Admin');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Добавить в группу: {group.name}</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="user-form">
          <p className="form-hint">Выберите пользователей, которых нужно включить в группу</p>
          <div className="users-checklist">
            {availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <label key={user.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    disabled={loading}
                  />
                  <span>{user.username}</span>
                  <span className="user-current-group">{user.role || 'без группы'}</span>
                </label>
              ))
            ) : (
              <p>Нет пользователей для назначения</p>
            )}
          </div>
          {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading || availableUsers.length === 0}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateUserModal = ({ isOpen, onClose, onUserCreated, roleOptions, groups }) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: '',
        password: '',
        role: groups[0]?.code || ADMIN_ROLE.value,
      });
      setError('');
    }
  }, [isOpen, groups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await usersAPI.create(formData);
      onUserCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Добавить пользователя</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Позывной *</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Группа *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              required
              disabled={loading}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated, roleOptions }) => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        password: '',
        role: user.role || roleOptions[0]?.value || '',
      });
      setError('');
    }
  }, [user, isOpen, roleOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = { username: formData.username, role: formData.role };
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      await usersAPI.update(user.id, updateData);
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Редактировать пользователя</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">Позывной *</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Новый пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              disabled={loading}
              placeholder="Оставьте пустым, чтобы не изменять"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Группа *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              required
              disabled={loading}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-save" disabled={loading}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
