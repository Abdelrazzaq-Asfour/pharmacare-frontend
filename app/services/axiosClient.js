// // Configured Axios instance with production-grade interceptors for zero-trust token management and robust error boundaries
import axios from 'axios';

/**
 * Enterprise Axios Client instance optimized for resilient network operations,
 * strict header encapsulation, and defense-in-depth token injection.
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Request interceptor: Inject secure bearer token if present in persistent session storage under strict zero-trust boundaries
axiosClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('pharmacare_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed?.token) {
          // Attach cryptographic JWT bearer token to outbound transport header
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (parseErr) {
        console.error('Failed to parse active user session payload safely.', parseErr);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // Response interceptor: Granular error management safeguarding against unauthorized access leaks (401/403)
// // Response interceptor: Temporary diagnostic override to inspect exact backend failure without redirecting
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('--- DETAILED API ERROR ---');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;