import api from './api';
import { ApiResponse, AuthResponse, UserProfileDto } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<UserProfileDto> => {
    const response = await api.get<ApiResponse<UserProfileDto>>('/auth/me');
    return response.data.data;
  },
};
