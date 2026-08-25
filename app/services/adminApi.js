// // Admin API Service - Handles administrative oversight and return request resolutions
import axiosClient from './axiosClient';

export const adminApi = {
  // Matches POST /api/v1/admin/returns/request
  requestReturn: async (returnDto) => {
    const response = await axiosClient.post('/admin/returns/request', returnDto);
    return response.data;
  },

  // Matches PUT /api/v1/admin/returns/{id}/resolve?approved=...
  resolveReturn: async (id, approved) => {
    const response = await axiosClient.put(`/admin/returns/${id}/resolve?approved=${approved}`);
    return response.data;
  }
};