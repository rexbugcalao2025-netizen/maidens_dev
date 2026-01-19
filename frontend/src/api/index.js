import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 🔑 REQUIRED: Without this, /auth/refresh will never receive the refresh cookie.
});


// 🔥 ATTACH TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) =>{
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];  
}

api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    if (!originalRequest){
      return Promise.reject(error);
    }

    // 🚫 If refresh itself fails → logout
    if (originalRequest?.url?.includes('/auth/refresh')){
      localStorage.removeItem('accessToken');
      router.push('/login');
      return Promise.reject(error);
    }

    // 🔐 Access token expired
    if (error.response?.status === 403 && !originalRequest._retry){
      if (isRefreshing){

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })

        }).then(token => {

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);

        })
      }    

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken = res.data.accessToken;
        
        localStorage.setItem('accessToken', newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {

        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        router.push('/login');
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

export default api
