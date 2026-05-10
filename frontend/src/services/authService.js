import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || 3000}`;

console.log('API_BASE_URL configurada:', API_BASE_URL);

const authService = {
  // Login function
  async login(email, senha) {
    try {
      if (!email || !senha) {
        return { success: false, message: 'Email e senha são obrigatórios' };
      }
      const response = await axios.post(`${API_BASE_URL}/token`, { email, senha });
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        return { success: true };
      }
      return { success: false, message: 'Token não recebido do servidor' };
    } catch (error) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao conectar com servidor';
      return { success: false, message };
    }
  },

  // Register function
  async register(nome, email, senha) {
    try {
      if (!nome || !email || !senha) {
        return { success: false, message: 'Nome, email e senha são obrigatórios' };
      }
      const response = await axios.post(`${API_BASE_URL}/users`, { nome, email, senha_hash: senha });
      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const message = error.response?.data?.msg || error.response?.data?.message || error.message || 'Erro ao cadastrar';
      return { success: false, message };
    }
  },

  // Logout function
  logout() {
    localStorage.removeItem('token');
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    // Optionally, decode and check expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }
};

export default authService;