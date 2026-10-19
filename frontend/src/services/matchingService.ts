import api from './api';
import { ApiResponse, MatchResultDto } from '../types';

export const matchingService = {
  getMatchesForItem: async (itemId: number): Promise<MatchResultDto[]> => {
    const response = await api.get<ApiResponse<MatchResultDto[]>>(`/matches/item/${itemId}`);
    return response.data.data;
  },
};
