import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url && config.url.startsWith('/service/')) {
    const key = process.env.REACT_APP_SERVICE_API_KEY;
    if (!key) {
      console.warn('SERVICE_API_KEY не задан в переменных окружения!');
    } else {
      config.headers['X-API-Key'] = key;
    }
  }

  return config;
});

export default api;