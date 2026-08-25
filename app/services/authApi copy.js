// // Auth API module - Handles enterprise authentication endpoints
import { MOCK_USERS } from '../utils/mockData';

export const authApi = {
  // Simulate secure login with Zero-Trust credential validation
  login: async (username, password) => {
    // // Artificial network latency to simulate realistic enterprise server response
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = MOCK_USERS.find(u => u.username === username);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials or unauthorized account access.');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled. Contact system administrator.');
    }

    // // Return structured token and user RBAC details
    return {
      accessToken: 'jwt-sec-token-' + Math.random().toString(36).substring(2),
      username: user.username,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }
};