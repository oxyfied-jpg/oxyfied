import api from './api';

const getClientTelemetry = () => {
  if (typeof window === 'undefined') return {};
  return {
    screenWidth: window.screen?.width || 0,
    screenHeight: window.screen?.height || 0,
    viewportWidth: window.innerWidth || 0,
    viewportHeight: window.innerHeight || 0,
    devicePixelRatio: window.devicePixelRatio || 1,
    touchSupport: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
    platform: navigator.platform || 'Unknown'
  };
};

export const authService = {
  login: async (email: string, password: string) => {
    const telemetry = getClientTelemetry();
    const response = await api.post('/auth/login', { 
      email, 
      password,
      ...telemetry 
    });
    return response.data;
  },

  register: async (name: string, email: string, phone: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, phone, password });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
