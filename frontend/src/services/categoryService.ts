import api from './api';
import { ApiResponse, CategoryDto } from '../types';

export const categoryService = {
  getActiveCategories: async (): Promise<CategoryDto[]> => {
    const response = await api.get<ApiResponse<CategoryDto[]>>('/categories');
    return response.data.data;
  },

  getAllCategoriesAdmin: async (): Promise<CategoryDto[]> => {
    const response = await api.get<ApiResponse<CategoryDto[]>>('/categories/all');
    return response.data.data;
  },

  createCategory: async (data: { name: string; description?: string; icon?: string }): Promise<CategoryDto> => {
    const response = await api.post<ApiResponse<CategoryDto>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: { name: string; description?: string; icon?: string }): Promise<CategoryDto> => {
    const response = await api.put<ApiResponse<CategoryDto>>(`/categories/${id}`, data);
    return response.data.data;
  },

  toggleCategory: async (id: number): Promise<void> => {
    await api.patch(`/categories/${id}/toggle`);
  },
};
