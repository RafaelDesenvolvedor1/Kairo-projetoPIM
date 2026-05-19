import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const horariosService = {
  async getHorarios() {
    try {
      const response = await axios.get(`${API_BASE_URL}/horarios`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async createHorario(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/horarios`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async updateHorario(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/horarios/${id}`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  async deleteHorario(id) {
    try {
      await axios.delete(`${API_BASE_URL}/horarios/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
};

export default horariosService;
