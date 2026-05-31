import React, { useState, useEffect } from 'react';
import { Tabs, Space } from 'antd';
import { Title } from '../../components/Title';
import { useLocation } from 'react-router'; 

// Importação dos sub-componentes (sessões)
import TabPerfil from './tabs/TabPerfil';
import TabProntuario from './tabs/TabProntuario';
import TabNotasSessao from './tabs/TabNotasSessao';
import TabAgenda from './tabs/TabAgenda';
import TabFinanceiro from './tabs/TabFinanceiro';

export default () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('1');
  
// 1. Tenta pegar o objeto 'paciente' se ele vier aninhado, ou assume o state inteiro
  const stateData = location.state || {};
  const paciente = stateData.paciente || stateData; 

  // 2. Busca o ID vasculhando todas as chaves possíveis onde ele possa estar escondido
  const idPaciente = stateData.id || 
                     stateData.id_paciente || 
                     paciente.id || 
                     paciente.id_paciente || 
                     paciente.id_usuario;

  // LOG de depuração para você ver no console do navegador o que o roteador recebeu
  console.log("Kairo Router State completo:", stateData);
  console.log("ID do Paciente extraído com sucesso:", idPaciente);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const items = [
    { key: '1', label: 'Perfil', children: <TabPerfil idPaciente={idPaciente} /> },
    { key: '2', label: 'Instrumentos', children: <div>Em breve</div> },
    { key: '3', label: 'Prontuário', children: <TabProntuario idPaciente={idPaciente} /> },
    { key: '4', label: 'Anotações de Sessão', children: <TabNotasSessao idPaciente={idPaciente} /> },
    { key: '5', label: 'Agenda', children: <TabAgenda idPaciente={idPaciente} /> }, // Passando o ID aqui!
    { key: '6', label: 'Financeiro', children: <TabFinanceiro idPaciente={idPaciente} /> },
    { key: '7', label: 'Diário de Bordo', children: <div>Em breve</div> },
    { key: '8', label: 'Documentos', children: <div>Em breve</div> },
    { key: '9', label: 'Anexos', children: <div>Em breve</div> },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '24px' }} size={24}>
      <header>
        {/* Exibe dinamicamente o nome do paciente selecionado */}
        <Title level={2}>{paciente.nomePaciente || 'Detalhes do Paciente'}</Title>
      </header>

      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key)} 
        items={items} 
      />
    </Space>
  );
}