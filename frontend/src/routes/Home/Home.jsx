import React, { useState, useEffect } from 'react';
import { Space, Row, Col, Typography, Spin, List, Tag } from 'antd';
import { Title as CustomTitle } from "../../components/Title";
import CardFastAcess from "../../components/CardFastAcess";
import FinanceChart from "../../components/FinanceChart";
import CardAgendasDia from "../../components/CardAgendasDia";
import { SummaryCard, Label, Value, IconCircle } from "../../components/DashBoardCards/styles";
import { FaUserGroup, FaMoneyBillTrendUp, FaCalendar, FaHeart, FaCheck, FaDollarSign, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { Link } from "react-router";
import agendamentosService from '../../services/agendamentosService';
import financeirosService from '../../services/financeirosService';
import SharePublicLink from '../../components/SharePublicLink';
import authService from '../../services/authService';

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
  
  // Se vier no formato "2026-10-12 14:30:00" ou "2026-10-12T14:30:00"
  if (typeof dataString === 'string') {
    const horaMatch = dataString.match(/(\d{2}):(\d{2})/);
    // Se for formato ISO com T ou espaço, pega o trecho de hora direto para evitar distorção de fuso
    const partes = dataString.split(/[T ]/);
    if (partes[1]) {
      return partes[1].substring(0, 5); // Retorna "HH:mm" exato sem mudar timezone
    }
  }

  const data = new Date(dataString);
  return isNaN(data.getTime())
    ? '--:--'
    : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
};

const formatarData = (dataString) => {
  if (!dataString) return '--/--';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}`;
};

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
};

export default function Home() {
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [sessoesMesAtual, setSessoesMesAtual] = useState(0);
  const [sessoesMesPassado, setSessoesMesPassado] = useState(0);
  const [faturamentoMesAtual, setFaturamentoMesAtual] = useState(0);
  const [faturamentoMesPassado, setFaturamentoMesPassado] = useState(0);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [lancamentosEmAberto, setLancamentosEmAberto] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();


  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        setLoading(true);

        // Dispara as requisições em paralelo para ganhar performance na página
        const [resHoje, resMesAtual, resMesPassado, resFaturamento, resGrafico, resEmAberto] = await Promise.all([
          agendamentosService.listarAgendamentosHoje(),
          agendamentosService.obterTotalMesCorrente(),
          agendamentosService.obterTotalMesAnterior(),
          financeirosService.getFaturamento(),
          financeirosService.getHistoricoGrafico(),
          financeirosService.getLancamentosEmAberto()
        ]);

       // 1. Processa agendamentos de hoje
        if (resHoje.success && resHoje.data) {
          const dadosFormatados = resHoje.data.map(agendamento => {
            const nomePaciente =
              agendamento.paciente?.nomePaciente ||
              agendamento.paciente?.nome ||
              agendamento.nomePaciente ||
              'Paciente';

            const rawHorario =
              agendamento.data_hora_inicio ||
              agendamento.horario ||
              agendamento.hora_inicio;

            return {
              iniciais: getIniciais(nomePaciente),
              nome: nomePaciente,
              horario: formatarHora(rawHorario)
            };
          });
          setAgendamentosHoje(dadosFormatados);
        }

        // 2. Processa indicador de Sessões do Mês Atual
        if (resMesAtual.success && resMesAtual.data) {
          setSessoesMesAtual(resMesAtual.data.total_agendamentos);
        }

        // 3. Processa indicador de Sessões do Mês Anterior
        if (resMesPassado.success && resMesPassado.data) {
          setSessoesMesPassado(resMesPassado.data.total_agendamentos);
        }

        // 4. Processa indicador de Faturamento
        if (resFaturamento.success && resFaturamento.data) {
          setFaturamentoMesAtual(resFaturamento.data.faturamentoAtual);
          setFaturamentoMesPassado(resFaturamento.data.faturamentoAnterior);
        }

        // 5. Processa dados do Gráfico Histórico
        if (resGrafico.success && resGrafico.data) {
          setDadosGrafico(resGrafico.data);
        }

        // 6. Processa lançamentos em aberto
        if (resEmAberto.success && resEmAberto.data) {
          setLancamentosEmAberto(resEmAberto.data);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDashboard();
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
      <CustomTitle>Bem vindo, {currentUser?.nome || 'usuário'}!</CustomTitle>

      <SharePublicLink />

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
            <Label>Pacientes atendidos esse mês</Label>
            <Value>{sessoesMesAtual}</Value>
            <Text type="secondary" style={{ fontSize: '10px' }}>mês passado: {sessoesMesPassado}</Text>
          </SummaryCard>
        </Col>

        <Col>
          <SummaryCard>
            <IconCircle><FaDollarSign /></IconCircle>
            <Label>Faturamento este mês</Label>
            <Value>{formatarMoeda(faturamentoMesAtual)}</Value>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              mês passado: {formatarMoeda(faturamentoMesPassado)}
            </Text>
          </SummaryCard>
        </Col>
      </Row>

        {/* Renderização Dinâmica dos Cards */}
      <Row gutter={[24, 24]}>
        {dashCards.map((card) => {
          const ComponenteCard = card.component;
          return (
            <Col xs={24} md={24} lg={12} key={card.id}>
              <Spin spinning={loading}>
                <ComponenteCard agendamentos={card.data} />
              </Spin>
            </Col>
          );
        })}
      </Row>

      {/* Seção 3: Gráficos e Pendências */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Spin spinning={loading}>
            <FinanceChart chartData={dadosGrafico} />
          </Spin>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0', height: '100%', boxShadow: '10px 10px 20px 0px rgba(0, 0, 0, 0.75)' }}>
            <CustomTitle level={4} style={{ marginBottom: '16px' }}>Lançamentos em Aberto</CustomTitle>
            
            <Spin spinning={loading}>
              {lancamentosEmAberto.length === 0 ? (
                <Text type="secondary">Nenhum lançamento pendente.</Text>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={lancamentosEmAberto}
                  renderItem={(item) => {
                    const isReceita = item.tipo === 'RECEITA';
                    const titulo = item.paciente?.nomePaciente || item.descricao || item.categoria;

                    return (
                      <List.Item style={{ padding: '8px 0' }}>
                        <List.Item.Meta
                          avatar={
                            isReceita ? (
                              <FaArrowUp style={{ color: '#52c41a', marginTop: '4px' }} />
                            ) : (
                              <FaArrowDown style={{ color: '#f5222d', marginTop: '4px' }} />
                            )
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: '13px' }}>{titulo}</Text>
                              <Text style={{ fontSize: '13px', color: isReceita ? '#52c41a' : '#f5222d' }}>
                                {formatarMoeda(item.valor)}
                              </Text>
                            </div>
                          }
                          description={
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                              <span>{item.categoria}</span>
                              <span>Venc: {formatarData(item.data_lancamento)}</span>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Spin>
          </div>
        </Col>
      </Row>
    </Space>
  );
}