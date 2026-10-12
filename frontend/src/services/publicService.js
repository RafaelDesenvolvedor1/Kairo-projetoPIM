import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const publicService = {
  async getPerfilPublico(slug) {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/perfil/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Perfil não encontrado.',
      };
    }
  },

  async getMeuSlug() {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/slug`, {
        headers: getAuthHeader(),
      });
      return { success: true, slug: response.data.slug };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao carregar slug.',
      };
    }
  },

  async getHorariosDisponiveis(slug, data) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/public/horarios-disponiveis/${slug}?data=${data}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao carregar horários vagos.',
      };
    }
  },

  async verificarPaciente(email, id_usuario) {
    try {
      const response = await axios.post(`${API_BASE_URL}/public/verificar-paciente`, {
        email,
        id_usuario,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao verificar paciente.',
      };
    }
  },

  async criarAgendamento(dados) {
    try {
      const response = await axios.post(`${API_BASE_URL}/public/agendamento`, dados);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao confirmar agendamento.',
      };
    }
  },

};

export default publicService;