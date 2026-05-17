import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const financeirosService = {
  // Get pacientes do usuário para dropdown
  async getPacientes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/lancamentos/pacientes/lista`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Get consolidado por período
  async getConsolidado(mes = null) {
    try {
      const params = mes ? { mes } : {};
      const response = await axios.get(`${API_BASE_URL}/lancamentos/consolidado/periodo`, {
        params,
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar consolidado:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Get lançamentos com filtro opcional de mês
  async getLancamentos(mes = null) {
    try {
      const params = mes ? { mes } : {};
      const response = await axios.get(`${API_BASE_URL}/lancamentos`, {
        params,
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Get lançamento específico
  async getLancamento(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/lancamentos/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Create novo lançamento
  async createLancamento(dados) {
    try {
      const response = await axios.post(`${API_BASE_URL}/lancamentos`, dados, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Update lançamento
  async updateLancamento(id, dados) {
    try {
      const response = await axios.put(`${API_BASE_URL}/lancamentos/${id}`, dados, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Delete lançamento
  async deleteLancamento(id) {
    try {
      await axios.delete(`${API_BASE_URL}/lancamentos/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
};

export default financeirosService;
