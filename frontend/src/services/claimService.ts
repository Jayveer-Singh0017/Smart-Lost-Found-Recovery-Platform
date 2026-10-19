import api from './api';
import { ApiResponse, PagedResponse, ClaimResponse } from '../types';

export const claimService = {
  submitClaim: async (data: {
    itemReportId: number;
    proofDescription: string;
    secretIdentifiers?: string;
    contactPhone?: string;
  }): Promise<ClaimResponse> => {
    const response = await api.post<ApiResponse<ClaimResponse>>('/claims', data);
    return response.data.data;
  },

  getClaimById: async (id: number): Promise<ClaimResponse> => {
    const response = await api.get<ApiResponse<ClaimResponse>>(`/claims/${id}`);
    return response.data.data;
  },

  reviewClaim: async (id: number, decision: { approved: boolean; reviewerNotes?: string }): Promise<ClaimResponse> => {
    const response = await api.post<ApiResponse<ClaimResponse>>(`/claims/${id}/review`, decision);
    return response.data.data;
  },

  withdrawClaim: async (id: number): Promise<void> => {
    await api.post(`/claims/${id}/withdraw`);
  },

  getMyClaims: async (page = 0, size = 10): Promise<PagedResponse<ClaimResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ClaimResponse>>>('/claims/my-claims', {
      params: { page, size },
    });
    return response.data.data;
  },

  getClaimsOnMyItems: async (page = 0, size = 10): Promise<PagedResponse<ClaimResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ClaimResponse>>>('/claims/on-my-items', {
      params: { page, size },
    });
    return response.data.data;
  },

  getClaimsForItem: async (itemId: number, page = 0, size = 10): Promise<PagedResponse<ClaimResponse>> => {
    const response = await api.get<ApiResponse<PagedResponse<ClaimResponse>>>(`/claims/item/${itemId}`, {
      params: { page, size },
    });
    return response.data.data;
  },
};
