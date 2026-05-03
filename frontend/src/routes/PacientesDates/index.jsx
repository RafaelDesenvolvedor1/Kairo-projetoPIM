import React, { useState, useEffect } from 'react'; // Adicionado useState e useEffect
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
  
  // Criamos um estado local para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('1');

  // Esse useEffect garante que, se você vier de um Link externo (do CardPaciente),
  // a aba mude para a que foi enviada no state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const items = [
    { key: '1', label: 'Perfil', children: <TabPerfil /> },
    { key: '2', label: 'Instrumentos', children: <div>Em breve</div> },
    { key: '3', label: 'Prontuário', children: <TabProntuario /> },
    { key: '4', label: 'Anotações de Sessão', children: <TabNotasSessao /> },
    { key: '5', label: 'Agenda', children: <TabAgenda /> },
    { key: '6', label: 'Financeiro', children: <TabFinanceiro /> },
    { key: '7', label: 'Diário de Bordo', children: <div>Em breve</div> },
    { key: '8', label: 'Documentos', children: <div>Em breve</div> },
    { key: '9', label: 'Anexos', children: <div>Em breve</div> },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '24px' }} size={24}>
      <header>
        <Title level={2}>aaaa</Title>
      </header>

      <Tabs 
        activeKey={activeTab} // Agora as abas obedecem ao estado local
        onChange={(key) => setActiveTab(key)} // Permite que o usuário clique e mude de aba manualmente
        items={items} 
      />
    </Space>
  );
}