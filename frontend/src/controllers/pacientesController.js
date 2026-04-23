import axios from "axios";

const host = import.meta.env.VITE_API_HOST || "localhost";
const port = import.meta.env.VITE_API_PORT || "3000";

const api = axios.create({
  baseURL: `http://${host}:${port}`
});

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
