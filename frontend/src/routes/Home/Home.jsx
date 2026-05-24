import React, { useState, useEffect } from 'react';
import { Space, Row, Col, Typography, Spin } from 'antd';
import { Title as CustomTitle } from "../../components/Title";
import CardFastAcess from "../../components/CardFastAcess";
import FinanceChart from "../../components/FinanceChart";
import CardAgendasDia from "../../components/CardAgendasDia";
import { SummaryCard, Label, Value, IconCircle } from "../../components/DashBoardCards/styles";
import { FaUserGroup, FaMoneyBillTrendUp, FaCalendar, FaHeart, FaCheck, FaDollarSign } from "react-icons/fa6";
import { Link } from "react-router";
import agendamentosService from '../../services/agendamentosService';

const { Text } = Typography;

const getIniciais = (nome) => {
  if (!nome) return 'P';
  const partes = nome.trim().split(' ');
  if (partes.length > 1) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

const formatarHora = (dataString) => {
  if (!dataString) return '--:--';
  const data = new Date(dataString);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function Home() {
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarAgendamentosDoDia = async () => {
      try {
        // Consumindo o método centralizado do seu Service
        const resultado = await agendamentosService.listarAgendamentosHoje();

        if (resultado.success && resultado.data) {
          const dadosFormatados = resultado.data.map(agendamento => {
            const nomePaciente = agendamento.paciente?.nomePaciente || 'Paciente';
            return {
              iniciais: getIniciais(nomePaciente),
              nome: nomePaciente,
              horario: formatarHora(agendamento.data_hora_inicio)
            };
          });
          setAgendamentosHoje(dadosFormatados);
        }
      } catch (error) {
        console.error("Erro ao processar agendamentos na Home:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarAgendamentosDoDia();
  }, []);

  const dashCards = [
    {
      id: 'agendas_dia',
      component: CardAgendasDia,
      data: agendamentosHoje
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '20px' }} size={32}>
      <CustomTitle>Bem vindo, Rafael!</CustomTitle>

      {/* Seção 1: Acesso Rápido */}
      <Row gutter={[24, 24]} justify="start">
        <Col><Link to="/pacientes"><CardFastAcess title="Pacientes"><FaUserGroup size={40} /></CardFastAcess></Link></Col>
        <Col><Link to="/financeiro"><CardFastAcess title="Financeiro"><FaMoneyBillTrendUp size={40} /></CardFastAcess></Link></Col>
        <Col><Link to="/agendamentos"><CardFastAcess title="Agendamentos"><FaCalendar size={40} /></CardFastAcess></Link></Col>
      </Row>

      {/* Seção 2: Resumos Superiores */}
      <Row gutter={[24, 24]} justify="start">
        <Col>
          <SummaryCard>
            <IconCircle><FaHeart /></IconCircle>
            <Label>Pacientes atendidos</Label>
            <Value>0</Value>
            <Text type="secondary" style={{ fontSize: '10px' }}>mês passado: 0</Text>
          </SummaryCard>
        </Col>
        <Col>
          <SummaryCard>
            <IconCircle><FaCheck /></IconCircle>
            <Label>Sessões realizadas</Label>
            <Value>0</Value>
            <Text type="secondary" style={{ fontSize: '10px' }}>mês passado: 0</Text>
          </SummaryCard>
        </Col>
        <Col>
          <SummaryCard>
            <IconCircle><FaDollarSign /></IconCircle>
            <Label>Faturamento</Label>
            <Value>R$ 0,00</Value>
            <Text type="secondary" style={{ fontSize: '10px' }}>mês passado: R$ 0,00</Text>
          </SummaryCard>
        </Col>
      </Row>

      {/* Renderização Dinâmica dos Cards */}
      <Row gutter={[24, 24]}>
        {dashCards.map((card) => {
          const ComponenteCard = card.component;
          return (
            <Col xs={24} md={12} lg={8} key={card.id}>
              <Spin spinning={loading}>
                <ComponenteCard agendamentos={card.data} />
              </Spin>
            </Col>
          );
        })}
      </Row>

      {/* Seção 3: Gráficos */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <FinanceChart />
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0', height: '100%', boxShadow: '10px 10px 20px 0px rgba(0, 0, 0, 0.75)' }}>
            <CustomTitle level={4}>Lançamentos em Aberto</CustomTitle>
            <Text type="secondary">Nenhum lançamento pendente.</Text>
          </div>
        </Col>
      </Row>
    </Space>
  );
}