import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // Debug logging
  console.log('🔧 API URL Configuration:', {
    isDev: import.meta.env.DEV,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    NODE_ENV: import.meta.env.MODE,
    envApiUrl: import.meta.env.VITE_REACT_APP_API_URL
  });

  // Check for environment variable first
  if (import.meta.env.VITE_REACT_APP_API_URL) {
    const envUrl = import.meta.env.VITE_REACT_APP_API_URL;
    console.log('✅ Using environment API URL:', envUrl);
    return envUrl;
  }

  // For development, always use localhost
  if (import.meta.env.DEV || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' ||
      window.location.port === '5190') {
    const devUrl = 'http://localhost:4015/api/v1';
    console.log('✅ Using development API URL:', devUrl);
    return devUrl;
  }
  
  // Production fallback
  const prodUrl = 'https://api.the4g.live/api/v1';
  console.log('🌐 Using production API URL:', prodUrl);
  return prodUrl;
};

const BASE_URL = getBaseUrl();

console.log('🚀 Axios Instance Created with BASE_URL:', BASE_URL);

// Create axios instance with proper CORS configuration
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Keep this for authentication
    timeout: 30000, // 30 second timeout
    headers: {
        'Accept': 'application/json'
        // Note: Removed 'Content-Type' to let axios automatically set it
        // For FormData uploads, axios will set 'multipart/form-data' automatically
        // For JSON requests, axios will set 'application/json' automatically
    }
});

// Add request interceptor to include device info in headers for cross-domain requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Handle FormData requests properly
        if (config.data instanceof FormData) {
            // Remove Content-Type header to let browser set it with boundary
            delete config.headers['Content-Type'];
            console.log('📤 FormData request detected - letting browser set Content-Type');
        }
        
        // Add device info to headers for cross-domain requests
        if (!import.meta.env.DEV && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                // Generate basic device info for cross-domain requests
                const deviceInfo = {
                    platform: navigator.platform || 'unknown',
                    screenResolution: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    userAgent: navigator.userAgent
                };
                
                config.headers['x-device-info'] = JSON.stringify(deviceInfo);
            } catch (error) {
                console.log('Failed to add device info to headers:', error);
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process queue of failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Add response interceptor for better error handling and automatic token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle device authorization errors
        if (error.response?.status === 403 && error.response?.data?.message?.includes('DEVICE_NOT_AUTHORIZED')) {
            console.error('Device not authorized:', error.response.data);
            // You could redirect to login or show a device authorization message
            return Promise.reject(error);
        }

        // Handle token expiration (401) - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token by making direct API call
                const refreshResponse = await axiosInstance.post("/users/refresh-token");

                // Process queued requests with new access token from cookies
                processQueue(null, null); // The new access token is already in cookies

                // Retry the original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh failed, redirect to login
                processQueue(refreshError, null);

                // Clear localStorage and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('data');
                    localStorage.removeItem('role');
                    localStorage.removeItem('isLoggedIn');
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
