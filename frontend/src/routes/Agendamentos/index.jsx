import React, { useState, useEffect } from "react";
import { Calendar, Drawer, Form, Input, TimePicker, Select, Spin, notification } from "antd";
import dayjs from "dayjs";
import ButtonSubmit from '../../components/ButtonSubmit';
import agendamentosService from '../../services/agendamentosService'; // Ajustado de agendamentosService para agendamentoService
import pacientesService from '../../services/pacientesService';
import locaisService from '../../services/locaisService';
import servicosService from '../../services/servicosService';
import { useMessage } from "../../context/MessageProvider";
import './style.css';

export default function Agendamentos() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const messageApi = useMessage();

  // Dados
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [locais, setLocais] = useState([]);
  const [servicos, setServicos] = useState([]);

  // Modo de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Buscar dados ao carregar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoadingData(true);
    try {
      const [agendRes, pacRes, locRes, servRes] = await Promise.all([
        agendamentosService.listarAgendamentos(),
        pacientesService.listarPacientes(),
        locaisService.getLocais(),
        servicosService.getServicos()
      ]);

      if (agendRes.success) {
        setAgendamentos(agendRes.data || []);
      }
      if (pacRes.success) {
        setPacientes(pacRes.data || []);
      }
      if (locRes.success) {
        setLocais((locRes.data || []).filter((l) => l.ativo !== false));
      }
      if (servRes.success) {
        setServicos(servRes.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      messageApi.error('Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  // Clique em um dia do calendário
  const onSelect = (date) => {
    setSelectedDate(date);
    setIsEditing(false);
    setEditingId(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  // Editar agendamento
  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingId(record.id_agendamento);
    setSelectedDate(dayjs(record.data_hora_inicio));
    form.setFieldsValue({
      id_paciente: record.id_paciente,
      hora: dayjs(record.data_hora_inicio),
      local: record.id_local,
      servico: record.id_servico,
      observacoes: record.observacoes,
      status: record.status,
    });
    setDrawerOpen(true);
  };

  // Fechar drawer
  const onClose = () => {
    setDrawerOpen(false);
    form.resetFields();
    setIsEditing(false);
    setEditingId(null);
  };

  // Salvar agendamento (criar ou editar)
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Construir a data e hora completas
      const dataHoraInicio = selectedDate
        .set('hour', values.hora.hour())
        .set('minute', values.hora.minute())
        .set('second', 0);

      // Definir a hora fim (30 minutos depois)
      const dataHoraFim = dataHoraInicio.clone().add(30, 'minutes');

      // Preparar payload
      const payload = {
        id_paciente: parseInt(values.id_paciente),
        data_hora_inicio: dataHoraInicio.toISOString(),
        data_hora_fim: dataHoraFim.toISOString(),
        status: values.status || 'agendado',
        observacoes: values.observacoes || '',
      };

      let result;

      if (isEditing) {
        result = await agendamentosService.atualizarAgendamento(editingId, payload);
        
        if (result.success) {
          if (result.data?.sincronizadoGoogle) {
            notification.success({
              message: 'Agendamento Atualizado!',
              description: 'As alterações foram salvas e sincronizadas com o seu Google Agenda.',
              placement: 'topRight',
              duration: 4
            });
          } else {
            messageApi.success('Agendamento updated com sucesso!');
          }

          const pacienteSelecionado = pacientes.find(p => p.id === parseInt(values.id_paciente));
          setAgendamentos(agendamentos.map(a => 
            a.id_agendamento === editingId 
              ? {
                  ...result.data.agendamento,
                  paciente: pacienteSelecionado
                }
              : a
          ));
          setDrawerOpen(false);
          form.resetFields();
          setIsEditing(false);
          setEditingId(null);
        } else {
          const errorMessage = result.message || 'Erro ao atualizar agendamento';
          if (errorMessage.toLowerCase().includes('já existe') || errorMessage.toLowerCase().includes('horário')) {
            messageApi.error('Conflito de horário: escolha outro horário ou verifique a agenda.');
          } else {
            messageApi.error(errorMessage);
          }
        }
      } else {
        result = await agendamentosService.criarAgendamento(payload);

        if (result.success) {
          if (result.data?.sincronizadoGoogle) {
            notification.success({
              message: 'Agendamento Confirmado!',
              description: 'A consulta foi registrada no sistema e sincronizada no seu Google Agenda.',
              placement: 'topRight',
              duration: 4.5
            });
          } else {
            messageApi.success('Agendamento criado com sucesso!');
          }

          const pacienteSelecionado = pacientes.find(p => p.id === parseInt(values.id_paciente));
          setAgendamentos([...agendamentos, {
            ...result.data.agendamento,
            paciente: pacienteSelecionado
          }]);
          setDrawerOpen(false);
          form.resetFields();
        } else {
          const errorMessage = result.message || 'Erro ao criar agendamento';
          if (errorMessage.toLowerCase().includes('já existe') || errorMessage.toLowerCase().includes('horário')) {
            messageApi.error('Conflito de horário: escolha outro horário ou verifique a agenda.');
          } else {
            messageApi.error(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      messageApi.error('Erro inesperado ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar eventos no calendário com as suas classes CSS originais
  const dateCellRender = (date) => {
    const eventosDoDia = agendamentos.filter((e) =>
      dayjs(e.data_hora_inicio).isSame(date, "day")
    );

    if (eventosDoDia.length === 0) return null;

    return (
      <div className="event-cell">
        {eventosDoDia.map((evento, index) => {
          // Extrai e formata o horário local de início usando o DayJS
          const horaFormatada = dayjs(evento.data_hora_inicio).format("HH:mm");
          
          return (
            <div key={index} className="event-item" onClick={() => handleEdit(evento)}>
              <span className="dot" />
              <span className="event-name">
                <strong>{horaFormatada}</strong> - {evento.paciente?.nomePaciente || 'Sem paciente'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loadingData) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }} />;
  }

  return (
    <>
      <Calendar
        fullscreen
        onSelect={onSelect}
        dateCellRender={dateCellRender}
      />

      <Drawer
        title={
          selectedDate
            ? `${isEditing ? 'Editar' : 'Novo'} agendamento - ${selectedDate.format("DD/MM/YYYY")}`
            : `${isEditing ? 'Editar' : 'Novo'} agendamento`
        }
        placement="right"
        width={400}
        onClose={onClose}
        open={drawerOpen}
      >
        <Spin spinning={loading}>
          <Form 
            layout="vertical" 
            onFinish={handleSubmit}
            form={form}
          >
            <Form.Item
              label="Paciente"
              name="id_paciente"
              rules={[{ required: true, message: "Informe o paciente" }]}
            >
              <Select
                placeholder="Selecione um paciente"
                options={pacientes.map(p => ({ label: p.nomePaciente, value: p.id }))}
              />
            </Form.Item>

            <Form.Item
              label="Horário"
              name="hora"
              rules={[{ required: true, message: "Informe o horário" }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Local"
              name="local"
            >
              <Select
                placeholder="Selecione um local (opcional)"
                options={locais.map(l => ({ label: l.nome, value: l.id_local }))}
              />
            </Form.Item>

            <Form.Item
              label="Serviço"
              name="servico"
            >
              <Select
                placeholder="Selecione um serviço (opcional)"
                options={servicos.map(s => ({ label: s.nome, value: s.id_servico }))}
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              initialValue="agendado"
            >
              <Select
                options={[
                  { label: 'Agendado', value: 'agendado' },
                  { label: 'Concluído', value: 'concluido' },
                  { label: 'Cancelado', value: 'cancelado' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Observações" name="observacoes">
              <Input.TextArea rows={3} placeholder="Observações adicionais" />
            </Form.Item>

            <ButtonSubmit block>
              {isEditing ? 'Atualizar' : 'Salvar'}
            </ButtonSubmit>
          </Form>
        </Spin>
      </Drawer>
    </>
  );
}