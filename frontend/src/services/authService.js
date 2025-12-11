import axiosInstance from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import { AUTH_TOKEN_KEY } from '../utils/constants';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  getCurrentUser: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    const decoded = authService.decodeToken(token);
    if (!decoded) return null;

    return {
      id: parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
      nombreCompleto: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      carnet: parseInt(decoded.Carnet),
      rol: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    const decoded = authService.decodeToken(token);
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  },

  saveToken: (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
};
