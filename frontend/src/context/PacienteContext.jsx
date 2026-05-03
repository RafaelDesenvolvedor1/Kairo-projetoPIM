import {
  getPacientes,
  postPacientes,
  putPaciente,
  deletePaciente,
} from "../controllers/pacientesController";
import { createContext, useEffect, useState } from "react";

export const PacienteContext = createContext(null);

export const PacienteProvider = ({ children }) => {
  const [pacientesList, setPacientesList] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const dadosPacientes = await getPacientes();
        setPacientesList(dadosPacientes);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      }
    };

    fetchPacientes();
  }, []);

  async function addPaciente(paciente) {
    try {
      const novoPaciente = await postPacientes(paciente);
      setPacientesList((prevList) => [...prevList, novoPaciente]);
      return novoPaciente;
    } catch (err) {
      console.error("Falha ao tentar cadastrar o paciente: ", err);
      throw err;
    }
  }

  async function removePaciente(id) {
    try {
      await deletePaciente(id);
      setPacientesList(prevList => prevList.filter((paciente) => paciente.id !== id));
      return true;
    } catch (err) {
        console.error('falha ao remover paciente' + id, err);
        throw err;
    }
  }

  async function updatePaciente(updatedPaciente) {
    try {
      const pacienteRetornado = await putPaciente(
        updatePaciente.id,
        updatePaciente
      );
      setPacientesList((prevList) =>
        prevList.map((paciente) =>
          paciente.id === updatedPaciente.id ? updatedPaciente : paciente
        )
      );
      return pacienteRetornado;
    } catch (err) {
      console.error("Falha o atualizar paciente:", err);
      throw err;
    }
  }

  return (
    <PacienteContext.Provider
      value={{ pacientesList, addPaciente, removePaciente, updatePaciente }}
    >
      {children}
    </PacienteContext.Provider>
  );
};
