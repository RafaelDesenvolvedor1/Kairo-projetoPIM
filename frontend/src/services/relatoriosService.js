import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const relatoriosService = {
  // Busca a timeline completa do prontuário do paciente
  async getProntuarioPaciente(idPaciente) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pacientes/${idPaciente}/prontuario`, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar prontuário:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Criar nova anotação/relatório (Sessão, Laudo, Atestado, etc)
  async createRelatorio(dados) {
    try {
      const response = await axios.post(`${API_BASE_URL}/relatorios`, dados, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Atualizar relatório existente
  async updateRelatorio(id, dados) {
    try {
      const response = await axios.put(`${API_BASE_URL}/relatorios/${id}`, dados, {
        headers: getAuthHeader(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Deletar relatório
  async deleteRelatorio(id) {
    try {
      await axios.delete(`${API_BASE_URL}/relatorios/${id}`, {
        headers: getAuthHeader(),
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
};

export default relatoriosService;