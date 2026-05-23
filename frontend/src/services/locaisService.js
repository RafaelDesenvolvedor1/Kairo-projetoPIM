import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const locaisService = {
  async getLocais() {
    try {
      const response = await axios.get(`${API_BASE_URL}/locais`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async listarLocais() {
    try {
      const response = await axios.get(`${API_BASE_URL}/locais`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async createLocal(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/locais`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async updateLocal(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/locais/${id}`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async deleteLocal(id) {
    try {
      await axios.delete(`${API_BASE_URL}/locais/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
};

export default locaisService;
