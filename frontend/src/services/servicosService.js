import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const servicosService = {
  async getServicos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/servicos`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async createServico(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/servicos`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async updateServico(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/servicos/${id}`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async deleteServico(id) {
    try {
      await axios.delete(`${API_BASE_URL}/servicos/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
};

export default servicosService;
