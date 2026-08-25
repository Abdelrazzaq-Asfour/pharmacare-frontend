import axiosClient from './axiosClient';

export const authApi = {
  login: async (username, password) => {
    // Matches POST /api/v1/auth/login
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
  }
};