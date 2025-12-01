import { createContext, useState } from "react";

export const PacienteContext = createContext(null);

export const PacienteProvider = ({ children}) => {
    const [pacientesList, setPacientesList] = useState([]);

    function addPaciente(paciente) {
        setPacientesList([...pacientesList, paciente]);
    }

    function removePaciente(id) {
        setPacientesList(pacientesList.filter(paciente => paciente.id !== id));
    }

    function updatePaciente(updatedPaciente) {
        setPacientesList(pacientesList.map(paciente => paciente.id === updatedPaciente.id ? updatedPaciente : paciente));
    }


  return (
    <PacienteContext.Provider value={{ pacientesList, addPaciente, removePaciente, updatePaciente }}> 
        {children}
    </PacienteContext.Provider>
  );
};