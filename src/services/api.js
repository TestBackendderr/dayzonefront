import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

// API для сталкеров
export const stalkersAPI = {
  getAll: async (searchBy = '', searchTerm = '') => {
    const params = {};
    if (searchBy && searchTerm) {
      params.searchBy = searchBy;
      params.searchTerm = searchTerm;
    }
    const response = await api.get('/stalkers', { params });
    return response.data;
  },

  // Получить сталкеров конкретной роли
  getByRole: async (role, searchBy = '', searchTerm = '') => {
    const params = {};
    if (searchBy && searchTerm) {
      params.searchBy = searchBy;
      params.searchTerm = searchTerm;
    }
    const response = await api.get(`/stalkers/role/${role}`, { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/stalkers/${id}`);
    return response.data;
  },
  
  create: async (stalkerData) => {
    const formData = new FormData();
    formData.append('callsign', stalkerData.callsign);
    formData.append('fullName', stalkerData.fullName);
    formData.append('faceId', stalkerData.faceId);
    formData.append('note', stalkerData.note);
    
    if (stalkerData.photo) {
      formData.append('photo', stalkerData.photo);
    }
    
    const response = await api.post('/stalkers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id, stalkerData) => {
    const formData = new FormData();
    formData.append('callsign', stalkerData.callsign);
    formData.append('fullName', stalkerData.fullName);
    formData.append('faceId', stalkerData.faceId);
    formData.append('note', stalkerData.note);
    
    if (stalkerData.photo) {
      formData.append('photo', stalkerData.photo);
    }
    
    const response = await api.put(`/stalkers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/stalkers/${id}`);
    return response.data;
  },

  // Получить все доступные роли
  getRoles: async () => {
    const response = await api.get('/stalkers/roles/list');
    return response.data;
  }
};

// API для финансовых операций
export const financesAPI = {
  getOperations: async (page = 1, limit = 20, type = '', currency = '') => {
    const params = { page, limit };
    if (type) params.type = type;
    if (currency) params.currency = currency;
    
    const response = await api.get('/finances/operations', { params });
    return response.data;
  },
  
  getBalance: async () => {
    const response = await api.get('/finances/balance');
    return response.data;
  },
  
  createOperation: async (operationData) => {
    const response = await api.post('/finances/operations', operationData);
    return response.data;
  },
  
  getOperation: async (id) => {
    const response = await api.get(`/finances/operations/${id}`);
    return response.data;
  },
  
  updateOperation: async (id, operationData) => {
    const response = await api.put(`/finances/operations/${id}`, operationData);
    return response.data;
  },
  
  deleteOperation: async (id) => {
    const response = await api.delete(`/finances/operations/${id}`);
    return response.data;
  },
  
  getStatistics: async (period = 'month') => {
    const response = await api.get('/finances/statistics', { 
      params: { period } 
    });
    return response.data;
  }
};

// API для розыска сталкеров
export const wantedAPI = {
  getAll: async (searchBy = '', searchTerm = '') => {
    const params = {};
    if (searchBy && searchTerm) {
      params.searchBy = searchBy;
      params.searchTerm = searchTerm;
    }
    const response = await api.get('/wanted', { params });
    return response.data;
  },

  // Получить разыскиваемых конкретной роли
  getByRole: async (role, searchBy = '', searchTerm = '') => {
    const params = {};
    if (searchBy && searchTerm) {
      params.searchBy = searchBy;
      params.searchTerm = searchTerm;
    }
    const response = await api.get(`/wanted/role/${role}`, { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/wanted/${id}`);
    return response.data;
  },
  
  create: async (wantedData) => {
    const formData = new FormData();
    formData.append('callsign', wantedData.callsign);
    formData.append('fullName', wantedData.fullName);
    formData.append('faceId', wantedData.faceId);
    formData.append('reward', wantedData.reward);
    formData.append('lastSeen', wantedData.lastSeen);
    formData.append('reason', wantedData.reason);
    
    if (wantedData.photo) {
      formData.append('photo', wantedData.photo);
    }
    
    const response = await api.post('/wanted', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id, wantedData) => {
    const formData = new FormData();
    formData.append('callsign', wantedData.callsign);
    formData.append('fullName', wantedData.fullName);
    formData.append('faceId', wantedData.faceId);
    formData.append('reward', wantedData.reward);
    formData.append('lastSeen', wantedData.lastSeen);
    formData.append('reason', wantedData.reason);
    
    if (wantedData.photo) {
      formData.append('photo', wantedData.photo);
    }
    
    const response = await api.put(`/wanted/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/wanted/${id}`);
    return response.data;
  },

  // Получить все доступные роли
  getRoles: async () => {
    const response = await api.get('/wanted/roles/list');
    return response.data;
  }
};

// API для управления пользователями (только для админов)
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  }
};

// API для группировок
export const groupingsAPI = {
  getAll: async () => {
    const response = await api.get('/groupings');
    return response.data;
  },

  create: async (groupData) => {
    const response = await api.post('/groupings', groupData);
    return response.data;
  },

  update: async (id, groupData) => {
    const response = await api.put(`/groupings/${id}`, groupData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/groupings/${id}`);
    return response.data;
  },

  assignUsers: async (id, userIds) => {
    const response = await api.post(`/groupings/${id}/assign-users`, { userIds });
    return response.data;
  },
};

// API для общих контрактов
export const contractsAPI = {
  getAll: async (status) => {
    const params = status && status !== 'all' ? { status } : {};
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/contracts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  take: async (id) => {
    const response = await api.post(`/contracts/${id}/take`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.post(`/contracts/${id}/complete`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/contracts/${id}/cancel`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },
};

// API для контрактов группы
export const groupContractsAPI = {
  getAll: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/group-contracts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/group-contracts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', data.amount);
    formData.append('goal', data.goal);
    formData.append('details', data.details || '');
    formData.append('docxLink', data.docxLink || '');
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    const response = await api.post('/group-contracts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', data.amount);
    formData.append('goal', data.goal);
    formData.append('details', data.details || '');
    formData.append('docxLink', data.docxLink || '');
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.removePhoto) {
      formData.append('removePhoto', 'true');
    }
    const response = await api.put(`/group-contracts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addNote: async (id, message) => {
    const response = await api.post(`/group-contracts/${id}/notes`, { message });
    return response.data;
  },

  complete: async (id) => {
    const response = await api.post(`/group-contracts/${id}/complete`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/group-contracts/${id}/cancel`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/group-contracts/${id}`);
    return response.data;
  },
};

// API чата КПК группы
export const groupChatAPI = {
  getMessages: async (groupCode, after) => {
    const params = {};
    if (groupCode) params.groupCode = groupCode;
    if (after) params.after = after;
    const response = await api.get('/group-chat', { params });
    return response.data;
  },

  sendMessage: async (message, groupCode, photo) => {
    const formData = new FormData();
    formData.append('message', message || '');
    if (groupCode) formData.append('groupCode', groupCode);
    if (photo) formData.append('photo', photo);

    const response = await api.post('/group-chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// API общего чата КПК организации
export const orgChatAPI = {
  getMessages: async (after) => {
    const params = {};
    if (after) params.after = after;
    const response = await api.get('/org-chat', { params });
    return response.data;
  },

  sendMessage: async (message, photo) => {
    const formData = new FormData();
    formData.append('message', message || '');
    if (photo) formData.append('photo', photo);

    const response = await api.post('/org-chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// API альтерэго группы
export const alterEgosAPI = {
  getAll: async (searchBy = '', searchTerm = '', status = '') => {
    const params = {};
    if (searchBy && searchTerm) {
      params.searchBy = searchBy;
      params.searchTerm = searchTerm;
    }
    if (status && status !== 'all') params.status = status;
    const response = await api.get('/alter-egos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/alter-egos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/alter-egos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/alter-egos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/alter-egos/${id}`);
    return response.data;
  },
};

// API карт группы
export const groupMapsAPI = {
  getAll: async (searchTerm = '') => {
    const params = {};
    if (searchTerm) params.searchTerm = searchTerm;
    const response = await api.get('/group-maps', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/group-maps/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.initialNote) formData.append('initialNote', data.initialNote);
    if (data.photo) formData.append('photo', data.photo);
    const response = await api.post('/group-maps', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.photo) formData.append('photo', data.photo);
    if (data.removePhoto) formData.append('removePhoto', 'true');
    const response = await api.put(`/group-maps/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addNote: async (id, message) => {
    const response = await api.post(`/group-maps/${id}/notes`, { message });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/group-maps/${id}`);
    return response.data;
  },
};

// API информации группы
export const groupInfoAPI = {
  getAll: async (searchTerm = '') => {
    const params = {};
    if (searchTerm) params.searchTerm = searchTerm;
    const response = await api.get('/group-info', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/group-info/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('body', data.body);
    if (data.photo) formData.append('photo', data.photo);
    const response = await api.post('/group-info', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('body', data.body);
    if (data.photo) formData.append('photo', data.photo);
    if (data.removePhoto) formData.append('removePhoto', 'true');
    const response = await api.put(`/group-info/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addNote: async (id, message) => {
    const response = await api.post(`/group-info/${id}/notes`, { message });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/group-info/${id}`);
    return response.data;
  },
};

export default api;
