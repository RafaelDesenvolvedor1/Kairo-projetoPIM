import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  Typography,
  Card,
  Tag,
  Button,
  Spin,
  Row,
  Col,
  Space,
  Empty,
  Modal,
  DatePicker,
  Input,
  Alert,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import publicService from '../../services/publicService';
import { useMessage } from '../../context/MessageProvider'; // ou do seu contexto de feedback

const { Title, Paragraph, Text } = Typography;
const TALLY_FORM_ID = import.meta.env.VITE_TALLY_FORM_ID || 'rjMeoX';

export default () => {
  const { slug } = useParams();
  const messageApi = useMessage();

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState(null);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [horarioEscolhido, setHorarioEscolhido] = useState(null);

  // Estados de Identificação e Submissão
  const [emailPaciente, setEmailPaciente] = useState('');
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);
  const [pacienteIdentificado, setPacienteIdentificado] = useState(null);
  const [etapa, setEtapa] = useState('data_hora');

  useEffect(() => {
    carregarPerfil();
  }, [slug]);

  const carregarPerfil = async () => {
    setLoading(true);
    const response = await publicService.getPerfilPublico(slug);
    if (response.success) {
      setPerfil(response.data);
    } else {
      setErro(response.message);
    }
    setLoading(false);
  };

  const abrirModalAgendamento = (servico = null) => {
    setServicoSelecionado(servico);
    setDataSelecionada(null);
    setHorariosDisponiveis([]);
    setHorarioEscolhido(null);
    setEmailPaciente('');
    setPacienteIdentificado(null);
    setEtapa('data_hora');
    setModalAberto(true);
  };

  const handleDataChange = async (date) => {
    setDataSelecionada(date);
    setHorarioEscolhido(null);
    if (!date) {
      setHorariosDisponiveis([]);
      return;
    }

    setCarregandoHorarios(true);
    const dataFormatada = date.format('YYYY-MM-DD');
    const res = await publicService.getHorariosDisponiveis(slug, dataFormatada);

    if (res.success) {
      setHorariosDisponiveis(res.data.horarios || []);
    } else {
      messageApi.open({ type: 'error', content: res.message });
      setHorariosDisponiveis([]);
    }
    setCarregandoHorarios(false);
  };

  const handleVerificarPaciente = async () => {
    if (!emailPaciente || !emailPaciente.includes('@')) {
      messageApi.open({ type: 'warning', content: 'Por favor, informe um e-mail válido.' });
      return;
    }

    setVerificandoEmail(true);
    const res = await publicService.verificarPaciente(
      emailPaciente,
      perfil.profissional.id_usuario
    );

    if (res.success) {
      if (res.data.existe) {
        // Garante a leitura correta do nome independentemente de como o objeto é retornado
        const pac = res.data.paciente;
        setPacienteIdentificado({
          id_paciente: pac.id_paciente || pac.id,
          nome: pac.nome || pac.nome_paciente || 'Paciente',
          email: pac.email,
        });
        setEtapa('confirmacao');
      } else {
        abrirTallyNovoPaciente();
      }
    } else {
      messageApi.open({ type: 'error', content: res.message });
    }
    setVerificandoEmail(false);
  };

  const abrirTallyNovoPaciente = () => {
    const usuarioId = perfil?.profissional?.id_usuario;
    const hiddenFields = {
      usuario_id: usuarioId,
      servico: servicoSelecionado?.nome || '',
      data: dataSelecionada ? dataSelecionada.format('YYYY-MM-DD') : '',
      hora: horarioEscolhido || '',
      email: emailPaciente,
    };

    if (window.Tally) {
      window.Tally.openPopup(TALLY_FORM_ID, {
        layout: 'modal',
        width: 700,
        hiddenFields,
      });
    } else {
      const params = new URLSearchParams(hiddenFields);
      window.open(`https://tally.so/r/${TALLY_FORM_ID}?${params.toString()}`, '_blank');
    }
    setModalAberto(false);
  };

  const confirmarPacienteRecorrente = async () => {
    setSalvandoAgendamento(true);

    const dadosEnvio = {
      id_usuario: perfil.profissional.id_usuario,
      id_paciente: pacienteIdentificado.id_paciente,
      id_servico: servicoSelecionado?.id_servico || null,
      id_local: perfil.locais?.[0]?.id_local || null,
      data: dataSelecionada.format('YYYY-MM-DD'),
      hora_inicio: horarioEscolhido,
    };

    const res = await publicService.criarAgendamento(dadosEnvio);

    if (res.success) {
      messageApi.open({
        type: 'success',
        content: `Consulta agendada para ${pacienteIdentificado.nome} no dia ${dataSelecionada.format('DD/MM/YYYY')} às ${horarioEscolhido}!`,
        duration: 4,
      });
      setModalAberto(false);
    } else {
      messageApi.open({
        type: 'error',
        content: res.message,
      });
    }
    setSalvandoAgendamento(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="A carregar perfil..." />
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <Empty description={erro || 'Profissional não encontrado'} />
      </div>
    );
  }

  const { profissional, servicos = [], locais = [], horarios = [] } = perfil;

  const diasSemanaOrdem = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
  const horariosAgrupados = diasSemanaOrdem
    .map((dia) => ({
      dia,
      itens: horarios.filter((h) => h.dia_semana === dia),
    }))
    .filter((grupo) => grupo.itens.length > 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        
        {/* Cabeçalho */}
        <Card style={{ borderRadius: 12, marginBottom: 24, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              backgroundColor: '#1677ff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 'bold',
              margin: '0 auto 16px auto',
            }}
          >
            {profissional.nome?.charAt(0).toUpperCase()}
          </div>
          <Title level={2} style={{ marginBottom: 4 }}>{profissional.nome}</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Atendimento Clínico & Especializado
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            onClick={() => abrirModalAgendamento()}
            style={{ borderRadius: 8, height: 44, padding: '0 28px', fontSize: 16 }}
          >
            Agendar Consulta
          </Button>
        </Card>

        {/* Serviços */}
        <Card title={<Space><CheckCircleOutlined /> Serviços Ofertados</Space>} style={{ borderRadius: 12, marginBottom: 24 }}>
          {servicos.length > 0 ? (
            <Row gutter={[16, 16]}>
              {servicos.map((servico) => (
                <Col xs={24} sm={12} key={servico.id_servico}>
                  <Card size="small" style={{ borderRadius: 8, height: '100%', border: '1px solid #e8e8e8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong style={{ fontSize: 16 }}>{servico.nome}</Text>
                      <Tag color={servico.modalidade === 'Online' ? 'blue' : servico.modalidade === 'Presencial' ? 'green' : 'purple'}>
                        {servico.modalidade}
                      </Tag>
                    </div>
                    {servico.agendamento && (
                      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 12, fontSize: 13 }}>
                        {servico.agendamento}
                      </Paragraph>
                    )}
                    <Button
                      type="link"
                      size="small"
                      style={{ paddingLeft: 0, marginTop: 8 }}
                      onClick={() => abrirModalAgendamento(servico)}
                    >
                      Escolher este serviço →
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Paragraph type="secondary">Nenhum serviço disponível no momento.</Paragraph>
          )}
        </Card>

        {/* Locais */}
        <Card title={<Space><EnvironmentOutlined /> Locais de Atendimento</Space>} style={{ borderRadius: 12, marginBottom: 24 }}>
          {locais.length > 0 ? (
            <Row gutter={[16, 16]}>
              {locais.map((local) => (
                <Col xs={24} sm={12} key={local.id_local}>
                  <Card size="small" style={{ borderRadius: 8, height: '100%', border: '1px solid #e8e8e8' }}>
                    <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>
                      {local.nome}
                    </Text>
                    {local.is_video ? (
                      <Tag icon={<VideoCameraOutlined />} color="cyan">Atendimento Online (Vídeo)</Tag>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {local.endereco
                          ? `${local.endereco.logradouro}, ${local.endereco.numero} - ${local.endereco.bairro}, ${local.endereco.cidade}/${local.endereco.estado}`
                          : 'Atendimento presencial'}
                      </Text>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Paragraph type="secondary">Nenhum local registado.</Paragraph>
          )}
        </Card>

        {/* Horários */}
        <Card title={<Space><ClockCircleOutlined /> Disponibilidade Semanal</Space>} style={{ borderRadius: 12, marginBottom: 24 }}>
          {horariosAgrupados.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {horariosAgrupados.map((grupo) => (
                <div key={grupo.dia} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  <Text strong style={{ width: 100 }}>{grupo.dia}</Text>
                  <Space wrap>
                    {grupo.itens.map((h) => (
                      <Tag key={h.id_horario} color="default" style={{ fontSize: 13, padding: '2px 8px' }}>
                        {h.hora_inicio?.substring(0, 5)} - {h.hora_fim?.substring(0, 5)}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ))}
            </Space>
          ) : (
            <Paragraph type="secondary">Nenhum horário registado no momento.</Paragraph>
          )}
        </Card>

      </div>

      {/* Modal Interativo de Agendamento */}
      <Modal
        title={`Agendar com ${profissional.nome}`}
        open={modalAberto}
        onCancel={() => setModalAberto(false)}
        footer={null}
        destroyOnClose
      >
        {servicoSelecionado && (
          <Alert
            message={`Serviço selecionado: ${servicoSelecionado.nome}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Etapa 1: Data e Hora */}
        {etapa === 'data_hora' && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              1. Escolha o dia da consulta:
            </Text>
            <DatePicker
              style={{ width: '100%', marginBottom: 16 }}
              format="DD/MM/YYYY"
              placeholder="Selecione uma data"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              onChange={handleDataChange}
            />

            {carregandoHorarios && <Spin tip="A procurar vagas disponíveis..." style={{ display: 'block', margin: '16px 0' }} />}

            {dataSelecionada && !carregandoHorarios && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  2. Horários livres encontrados:
                </Text>
                {horariosDisponiveis.length > 0 ? (
                  <Row gutter={[8, 8]}>
                    {horariosDisponiveis.map((h) => (
                      <Col span={8} key={h.id_horario}>
                        <Button
                          type={horarioEscolhido === h.hora_inicio ? 'primary' : 'default'}
                          block
                          onClick={() => setHorarioEscolhido(h.hora_inicio)}
                        >
                          {h.hora_inicio}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert message="Não há horários disponíveis para esta data." type="warning" showIcon />
                )}
              </div>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <Button
              type="primary"
              block
              disabled={!dataSelecionada || !horarioEscolhido}
              onClick={() => setEtapa('identificacao')}
            >
              Avançar para Identificação
            </Button>
          </div>
        )}

        {/* Etapa 2: Identificação do Paciente */}
        {etapa === 'identificacao' && (
          <div>
            <Paragraph type="secondary">
              Informe o seu e-mail para localizarmos o seu registo ou iniciar o cadastro.
            </Paragraph>
            <Input
              prefix={<UserOutlined />}
              placeholder="exemplo@email.com"
              size="large"
              value={emailPaciente}
              onChange={(e) => setEmailPaciente(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={() => setEtapa('data_hora')}>Voltar</Button>
              <Button
                type="primary"
                loading={verificandoEmail}
                onClick={handleVerificarPaciente}
              >
                Continuar
              </Button>
            </Space>
          </div>
        )}

        {/* Etapa 3: Confirmação e Registo */}
        {etapa === 'confirmacao' && pacienteIdentificado && (
          <div>
            <Alert
              message={`Bem-vindo(a) de volta, ${pacienteIdentificado.nome}!`}
              description={`Identificámos o seu registo. Confirma a consulta para o dia ${dataSelecionada?.format('DD/MM/YYYY')} às ${horarioEscolhido}?`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={() => setEtapa('identificacao')}>Alterar e-mail</Button>
              <Button
                type="primary"
                loading={salvandoAgendamento}
                onClick={confirmarPacienteRecorrente}
              >
                Confirmar Agendamento
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};