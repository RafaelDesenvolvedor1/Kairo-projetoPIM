import axios from "axios";
import authService from "../services/authService.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || "3000"}`;

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado, redirecionar para login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getPacientes = async () => {
  try {
    const res = await api.get("/pacientes");
    return res.data;
  } catch (err) {
    console.log("Erro na requisição", err);
    return [];
  }
};

export const postPacientes = async (novoPaciente) => {
  try {
    const res = await api.post("/pacientes", novoPaciente);
    return res.data;
  } catch (err) {
    console.log("Erro ao cadastrar");
    throw err;
  }
};

export const putPaciente = async (id, dadosAtualizados) => {
  try {
    // O endpoint PUT deve ser, por padrão, /pacientes/:id
    const res = await api.put(`/pacientes/${id}`, dadosAtualizados); 
    return res.data;
  } catch (err) {
    console.error(
      `Erro ao atualizar paciente ${id}:`,
      err.response?.data || err.message
    );
    throw err;
  }
};

// Espera apenas o ID do paciente (para a URL)
export const deletePaciente = async (id) => {
  try {
    // O endpoint DELETE deve ser, por padrão, /pacientes/:id
    await api.delete(`/pacientes/${id}`); 
    return id;
  } catch (err) {
    console.error(
      `Erro ao deletar paciente ${id}:`,
      err.response?.data || err.message
    );
    throw err;
  }
};
