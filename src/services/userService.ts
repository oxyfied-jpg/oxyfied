import api from './api';
import type { User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users?limit=1000');
    if (response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  updateProfile: async (data: UpdateProfilePayload | string, phoneParam?: string): Promise<User> => {
    let payload: UpdateProfilePayload = {};
    if (typeof data === 'string') {
      payload = { name: data, phone: phoneParam };
    } else {
      payload = data;
    }
    const response = await api.put('/users/profile', payload);
    return response.data;
  }
};
