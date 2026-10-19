import api from './api';
import {
  ApiResponse,
  PagedResponse,
  AdminDashboardStatsDto,
  ModerationReportDto,
  UserAdminDto,
  AuditLogDto,
  ClaimResponse,
} from '../types';

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStatsDto> => {
    const response = await api.get<ApiResponse<AdminDashboardStatsDto>>('/admin/stats');
    return response.data.data;
  },

  getModerationQueue: async (
    status?: string,
    page = 0,
    size = 10
  ): Promise<PagedResponse<ModerationReportDto>> => {
    const response = await api.get<ApiResponse<PagedResponse<ModerationReportDto>>>('/admin/moderation', {
      params: { status, page, size },
    });
    return response.data.data;
  },

  takeModerationAction: async (
    id: number,
    action: 'APPROVE_ITEM' | 'REJECT_ITEM' | 'DISMISS_REPORT',
    notes?: string
  ): Promise<void> => {
    await api.post(`/admin/moderation/${id}/action`, { action, notes });
  },

  getUsers: async (search?: string, page = 0, size = 15): Promise<PagedResponse<UserAdminDto>> => {
    const response = await api.get<ApiResponse<PagedResponse<UserAdminDto>>>('/admin/users', {
      params: { search, page, size },
    });
    return response.data.data;
  },

  toggleUserStatus: async (id: number): Promise<void> => {
    await api.patch(`/admin/users/${id}/toggle-status`);
  },

  updateUserRole: async (id: number, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<void> => {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  getAllClaims: async (page = 0, size = 15): Promise<PagedResponse<ClaimResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ClaimResponse>>>('/admin/claims', {
      params: { page, size },
    });
    return response.data.data;
  },

  getAuditLogs: async (page = 0, size = 20): Promise<PagedResponse<AuditLogDto>> => {
    const response = await api.get<ApiResponse<PagedResponse<AuditLogDto>>>('/admin/audit-logs', {
      params: { page, size },
    });
    return response.data.data;
  },
};
