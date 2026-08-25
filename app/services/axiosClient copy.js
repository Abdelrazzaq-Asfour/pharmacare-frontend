// // Configured Axios instance with interceptors for JWT injection and auto-logout on 401
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Request interceptor: Inject secure bearer token if present in session storage
axiosClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('pharmacare_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // Response interceptor: Zero-Trust defense against unauthorized access (401 / 403)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // // Destroy compromised or expired session and force redirect to login
      localStorage.removeItem('pharmacare_session');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;