import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  }
};

export default api;
