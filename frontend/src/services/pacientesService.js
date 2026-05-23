import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const pacientesService = {
  /**
   * Listar todos os pacientes do usuário
   * @returns {object} Resposta do servidor
   */
  async listarPacientes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pacientes`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar pacientes:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message 
      };
    }
  },

  /**
   * Buscar paciente por ID
   * @param {number} idPaciente - ID do paciente
   * @returns {object} Resposta do servidor
   */
  async buscarPaciente(idPaciente) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pacientes/${idPaciente}`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message 
      };
    }
  },

  /**
   * Criar novo paciente
   * @param {object} data - Dados do paciente
   * @returns {object} Resposta do servidor
   */
  async criarPaciente(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/pacientes`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message 
      };
    }
  },

  /**
   * Atualizar paciente
   * @param {number} idPaciente - ID do paciente
   * @param {object} data - Dados a atualizar
   * @returns {object} Resposta do servidor
   */
  async atualizarPaciente(idPaciente, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/pacientes/${idPaciente}`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message 
      };
    }
  },

  /**
   * Deletar paciente
   * @param {number} idPaciente - ID do paciente
   * @returns {object} Resposta do servidor
   */
  async deletarPaciente(idPaciente) {
    try {
      await axios.delete(`${API_BASE_URL}/pacientes/${idPaciente}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message 
      };
    }
  }
};

export default pacientesService;
