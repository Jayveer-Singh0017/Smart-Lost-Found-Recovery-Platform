import api from './api';
import { ApiResponse, PagedResponse, ItemSummaryResponse, ItemReportResponse, ItemImageDto, ItemReportUpdateRequest } from '../types';

export const itemService = {
  createReport: async (data: any): Promise<ItemReportResponse> => {
    const response = await api.post<ApiResponse<ItemReportResponse>>('/items', data);
    return response.data.data;
  },

  updateReport: async (id: number, data: ItemReportUpdateRequest): Promise<ItemReportResponse> => {
    const response = await api.put<ApiResponse<ItemReportResponse>>(`/items/${id}`, data);
    return response.data.data;
  },

  withdrawReport: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  getReportById: async (id: number): Promise<ItemReportResponse> => {
    const response = await api.get<ApiResponse<ItemReportResponse>>(`/items/${id}`);
    return response.data.data;
  },

  searchReports: async (params: any): Promise<PagedResponse<ItemSummaryResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ItemSummaryResponse>>>('/items/search', { params });
    return response.data.data;
  },

  getMyReports: async (page = 0, size = 10): Promise<PagedResponse<ItemSummaryResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ItemSummaryResponse>>>('/items/my', {
      params: { page, size },
    });
    return response.data.data;
  },

  getRecentItems: async (): Promise<ItemSummaryResponse[]> => {
    const response = await api.get<ApiResponse<ItemSummaryResponse[]>>('/items/recent');
    return response.data.data;
  },

  uploadImage: async (itemId: number, file: File): Promise<ItemImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<ItemImageDto>>(`/items/${itemId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  deleteImage: async (itemId: number, imageId: number): Promise<void> => {
    await api.delete(`/items/${itemId}/images/${imageId}`);
  },

  flagReport: async (itemId: number, reason: string, details?: string): Promise<void> => {
    await api.post(`/items/${itemId}/flag`, { reason, details });
  },
};
