import axios from 'axios';

import { JWT_HOST_API } from 'configs/auth.config';


const axiosInstance = axios.create({
  baseURL: JWT_HOST_API,
  headers: {
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errData = error.response && error.response.data;

    // If the server returns an HTML page (like a 408 Timeout or 502 Bad Gateway)
    if (typeof errData === 'string' && errData.trim().startsWith('<')) {
      if (error.response.status === 408 || errData.includes('408')) {
        errData = 'Request Time-out. The server is taking too long to respond. Please try again later.';
      } else {
        errData = 'A server error occurred. Please try again later.';
      }
    }

    // Auto clear session and redirect on 401 Unauthorized (unless on login request)
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('user');
      localStorage.removeItem('finyear');
      localStorage.removeItem('userId');

      if (window.location.pathname !== '/login') {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(errData || 'Something went wrong');
  }
);

export default axiosInstance;
