// Конфигурация API
const getApiBaseUrl = () => {
  // Сначала проверяем переменную окружения
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback на Traefik домен
  return 'https://dayzone2-backend-gobqh3-cf2a4b-85-215-53-87.traefik.me/api';
};

const getFileBaseUrl = () => {
  // Для файлов убираем /api из URL
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  FILE_BASE_URL: getFileBaseUrl(),
};

export default API_CONFIG;
