import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const agendamentosService = {
  /**
   * Criar novo agendamento
   * @param {object} data - Dados do agendamento
   * @returns {object} Resposta do servidor
   */
  async criarAgendamento(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/agendamentos`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Listar todos os agendamentos do usuário
   * @returns {object} Resposta do servidor
   */
  async listarAgendamentos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/agendamentos`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Buscar agendamento por ID
   * @param {number} idAgendamento - ID do agendamento
   * @returns {object} Resposta do servidor
   */
  async buscarAgendamento(idAgendamento) {
    try {
      const response = await axios.get(`${API_BASE_URL}/agendamentos/${idAgendamento}`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Listar agendamentos de um paciente específico
   * @param {number} idPaciente - ID do paciente
   * @returns {object} Resposta do servidor
   */
  async listarAgendamentosPorPaciente(idPaciente) {
    try {
      const response = await axios.get(`${API_BASE_URL}/agendamentos/paciente/${idPaciente}`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar agendamentos do paciente:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Atualizar agendamento
   * @param {number} idAgendamento - ID do agendamento
   * @param {object} data - Dados a atualizar
   * @returns {object} Resposta do servidor
   */
  async atualizarAgendamento(idAgendamento, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/agendamentos/${idAgendamento}`, data, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Deletar agendamento
   * @param {number} idAgendamento - ID do agendamento
   * @returns {object} Resposta do servidor
   */
  async deletarAgendamento(idAgendamento) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/agendamentos/${idAgendamento}`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Listar agendamentos do dia atual (Hoje)
   * @returns {object} Resposta do servidor
   */
  async listarAgendamentosHoje() {
    try {
      const response = await axios.get(`${API_BASE_URL}/agendamentos/hoje`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar agendamentos de hoje:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }
};

export default agendamentosService;