import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const userService = {
  async getUsuarioAtual() {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: getAuthHeader(),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return {
        success: false,
        message: error.response?.data?.msg || 'Erro ao carregar dados do usuário',
      };
    }
  },
};

export default userService;