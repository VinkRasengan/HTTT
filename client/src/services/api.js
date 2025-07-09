import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để handle responses và errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Emulator service
export const emulatorService = {
  // Lấy tất cả emulators
  async getAll() {
    const response = await apiClient.get('/emulators');
    return response.data;
  },

  // Tạo emulator mới
  async create(emulatorData) {
    const response = await apiClient.post('/emulators', emulatorData);
    return response.data;
  },

  // Xóa emulator
  async delete(emulatorId) {
    const response = await apiClient.delete(`/emulators/${emulatorId}`);
    return response.data;
  },

  // Lấy emulator theo ID
  async getById(emulatorId) {
    const response = await apiClient.get(`/emulators/${emulatorId}`);
    return response.data;
  }
};

// Message service
export const messageService = {
  // Lấy lịch sử tin nhắn
  async getHistory(fromId = null, toId = null) {
    const params = {};
    if (fromId) params.fromId = fromId;
    if (toId) params.toId = toId;
    
    const response = await apiClient.get('/messages', { params });
    return response.data;
  },

  // Gửi tin nhắn
  async send(messageData) {
    const response = await apiClient.post('/messages', messageData);
    return response.data;
  }
};

// Call service
export const callService = {
  // Thực hiện cuộc gọi
  async initiate(callData) {
    const response = await apiClient.post('/calls', callData);
    return response.data;
  }
};

// Health check service
export const healthService = {
  // Kiểm tra trạng thái server
  async check() {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.error || data.message || 'Có lỗi xảy ra',
        details: data.details || null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Không thể kết nối đến server',
        details: null
      };
    } else {
      // Something else happened
      return {
        status: -1,
        message: error.message || 'Lỗi không xác định',
        details: null
      };
    }
  },

  // Format error message for display
  formatErrorMessage(error) {
    const errorInfo = this.handleError(error);
    return errorInfo.message;
  }
};

export default apiClient;
