import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.90.166.240/api/xss';
const AUTH_BASE_URL = 'http://52.90.166.240/api/fortress_auth';

// Types for API responses
export interface XSSScanLog {
  id: number;
  alert: string;
  risk: string;
  url: string;
  description: string;
  solution: string;
  created_at: string;
  updated_at: string;
}

export interface ScanResponse {
  message: string;
  scan_id?: string;
  status: 'success' | 'error';
}

export interface ApiError {
  message: string;
  status: number;
  isConnectionError?: boolean;
}

export interface ScanStatus {
  scan_id: string;
  target_url: string;
  status: string;
  spider_progress: number;
  scan_progress: number;
  total_progress: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface ScannerConfig {
  scan_depth: number;
  timeout: number;
  exclude_urls: string;
  enable_alerts: boolean;
  enable_toast: boolean;
  enable_email: boolean;
  updated_at: string;
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorDetails = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      isConnectionError: !error.response,
      errorType: error.code || 'UNKNOWN',
    };
    
    console.error('[API Response Error]', errorDetails);
    
    // Provide more specific error messages
    let userMessage = 'An error occurred';
    if (!error.response) {
      if (error.code === 'ECONNREFUSED') {
        userMessage = 'Backend server is not running. Please start the Django server.';
      } else if (error.code === 'NETWORK_ERROR') {
        userMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'TIMEOUT') {
        userMessage = 'Request timed out. Please try again.';
      } else {
        userMessage = 'Cannot connect to backend server. Please ensure the Django server is running on http://localhost:8000';
      }
    } else {
      userMessage = error.response?.data?.message || error.message || 'Server error occurred';
    }
    
    const apiError: ApiError = {
      message: userMessage,
      status: error.response?.status || 0,
      isConnectionError: !error.response,
    };
    
    return Promise.reject(apiError);
  }
);

const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Trigger an XSS scan for the specified URL
 * @param url - The target URL to scan
 * @returns Promise with scan response
 */
export const triggerScan = async (url: string): Promise<ScanResponse> => {
  try {
    const response: AxiosResponse<ScanResponse> = await apiClient.post('/scan/', { url });
    return response.data;
  } catch (error: any) {
    throw error; // Let the interceptor handle the error formatting
  }
};

/**
 * Fetch all XSS scan logs
 * @returns Promise with array of scan logs
 */
export const fetchScanLogs = async (): Promise<XSSScanLog[]> => {
  try {
    const response: AxiosResponse<XSSScanLog[]> = await apiClient.get('/logs/');
    return response.data;
  } catch (error: any) {
    throw error; // Let the interceptor handle the error formatting
  }
};

/**
 * Fetch a specific scan log by ID
 * @param id - The scan log ID
 * @returns Promise with scan log details
 */
export const fetchScanLogById = async (id: number): Promise<XSSScanLog> => {
  try {
    const response: AxiosResponse<XSSScanLog> = await apiClient.get(`/logs/${id}/`);
    return response.data;
  } catch (error: any) {
    throw error; // Let the interceptor handle the error formatting
  }
};

/**
 * Delete a scan log by ID
 * @param id - The scan log ID to delete
 * @returns Promise with deletion response
 */
export const deleteScanLog = async (id: number): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete(`/logs/${id}/`);
    return response.data;
  } catch (error: any) {
    throw error; // Let the interceptor handle the error formatting
  }
};

/**
 * Get scan statistics
 * @returns Promise with scan statistics
 */
export const getScanStats = async (): Promise<{
  total_scans: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  risk_counts_over_time: { date: string; high: number; medium: number; low: number }[];
  top_vulnerable_urls: { url: string; high_count: number }[];
  scan_durations: { scan_id: string; target_url: string; duration_seconds: number; started_at: string; ended_at: string }[];
}> => {
  try {
    const response: AxiosResponse = await apiClient.get('/stats/');
    return response.data;
  } catch (error: any) {
    throw error; // Let the interceptor handle the error formatting
  }
};

export const fetchScanStatus = async (scanId: string): Promise<ScanStatus> => {
  try {
    const response: AxiosResponse<ScanStatus> = await apiClient.get(`/scan-status/${scanId}/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getScannerConfig = async (): Promise<ScannerConfig> => {
  const res = await apiClient.get('/scanner-config/');
  return res.data;
};

export const updateScannerConfig = async (data: Partial<ScannerConfig>): Promise<ScannerConfig> => {
  const res = await apiClient.put('/scanner-config/', data);
  return res.data;
};

export const resetScannerConfig = async (): Promise<ScannerConfig> => {
  const res = await apiClient.post('/scanner-config/reset/');
  return res.data;
};

export const exportLogs = async (type: 'csv' | 'json'): Promise<Blob> => {
  const res = await apiClient.get(`/logs/export/?type=${type}`, { responseType: 'blob' });
  return res.data;
};

// --- JWT Token Handling ---
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getAccessToken = () => {
  // Try cookies first, then localStorage
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/access_token=([^;]+)/);
    if (match) return match[1];
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Attach JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth API ---
export const login = async (username: string, password: string) => {
  const res = await authClient.post('/login/', { username, password });
  if (res.data.access && res.data.refresh) {
    setTokens(res.data.access, res.data.refresh);
  }
  return res.data;
};

export const register = async (username: string, password: string) => {
  const res = await authClient.post('/register/', { username, password });
  return res.data;
};

export const resetPassword = async (username: string, new_password: string) => {
  const res = await authClient.post('/reset-password/', { username, new_password });
  return res.data;
};

// Export the apiClient for custom requests
export { apiClient };

// Fetch all threat logs
export async function fetchThreatLogs() {
  const response = await apiClient.get('http://localhost:8000/api/threats/logs/');
  return response.data;
}

// Create a new threat log
export async function createThreatLog(data: { type: string; source_ip: string; description: string }) {
  const response = await apiClient.post('http://localhost:8000/api/threats/logs/', data);
  return response.data;
}
