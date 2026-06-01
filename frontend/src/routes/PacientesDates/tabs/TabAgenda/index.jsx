import React, { useState, useEffect } from 'react';
import { Typography, List, Space, Tag, Empty, Spin, Divider, Button, Popconfirm, Tooltip, message, Modal, DatePicker, TimePicker, Form } from 'antd'; 
import { ClockCircleOutlined, SwapRightOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AgendaContainer, AppointmentItem, DateBadge, AppointmentInfo } from './styles';
import agendamentosService from '../../../../services/agendamentosService';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');
const { Text } = Typography;

export default function TabAgenda({ idPaciente }) {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  
  // States para o Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const fetchAppointments = async () => {
    if (!idPaciente) {
        console.warn("TabAgenda: idPaciente não foi fornecido ou é inválido:", idPaciente);
        return;
    }
    
    console.log("TabAgenda: Disparando busca para o paciente ID:", idPaciente);
    
    setLoading(true);
    try {
      const resultado = await agendamentosService.listarAgendamentosPorPaciente(idPaciente);
      
      if (resultado.success) {
        const dadosFormatados = (resultado.data || []).map(agendamento => {
          const inicio = dayjs(agendamento.data_hora_inicio);
          const fim = dayjs(agendamento.data_hora_fim);
          
          return {
            id: agendamento.id_agendamento,
            dia: inicio.format('DD'),
            mesAno: inicio.format('MMM.YY').toUpperCase(),
            startTime: inicio.format('HH:mm'),
            endTime: fim.format('HH:mm'),
            value: 'R$ 0', 
            status: agendamento.status ? agendamento.status.toUpperCase() : 'AGENDADO',
            patient: agendamento.paciente?.nomePaciente || 'Paciente',
            raw: agendamento 
          };
        });
        
        setAppointments(dadosFormatados);
      } else {
        message.error("Erro ao carregar agendamentos: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
      message.error('Erro ao processar agenda do paciente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [idPaciente]);

  const handleDeletar = async (id) => {
    try {
      const resultado = await agendamentosService.deletarAgendamento(id);
      if (resultado.success) {
        message.success("Agendamento excluído com sucesso!");
        fetchAppointments();
      } else {
        message.error("Erro ao excluir: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      message.error("Erro ao tentar excluir o registro");
    }
  };

  // Abre o modal carregando os horários atuais do agendamento
  const handleEditar = (item) => {
    setEditingItem(item);
    
    const dataHoraInicio = dayjs(item.raw.data_hora_inicio);
    const dataHoraFim = dayjs(item.raw.data_hora_fim);

    form.setFieldsValue({
      data: dataHoraInicio,
      horarios: [dataHoraInicio, dataHoraFim]
    });
    
    setIsEditModalOpen(true);
  };

  // Salva a alteração da data e hora efetuada no Modal
  const handleSalvarEdicao = async (values) => {
    try {
      const novaDataBase = values.data;
      const seletorInicio = values.horarios[0];
      const seletorFim = values.horarios[1];

      // CORREÇÃO DEFINITIVA: Clona e utiliza o método .set() para isolar os estados e evitar mutações cruzadas do objeto original
      const dataHoraInicioObjeto = novaDataBase
        .clone()
        .set('hour', seletorInicio.hour())
        .set('minute', seletorInicio.minute())
        .set('second', 0);

      const dataHoraFimObjeto = novaDataBase
        .clone()
        .set('hour', seletorFim.hour())
        .set('minute', seletorFim.minute())
        .set('second', 0);

      // Gera as strings no padrão ISO esperado pelas queries do Sequelize no backend
      const payload = {
        data_hora_inicio: dataHoraInicioObjeto.toISOString(),
        data_hora_fim: dataHoraFimObjeto.toISOString(),
      };

      console.log("Kairo TabAgenda Reagendamento - Payload construído com sucesso:", payload);

      const resultado = await agendamentosService.atualizarAgendamento(editingItem.id, payload);

      if (resultado.success) {
        message.success("Horário do agendamento atualizado!");
        setIsEditModalOpen(false);
        fetchAppointments(); 
      } else {
        message.error("Não foi possível reagendar: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar horário:", error);
      message.error("Erro ao processar a alteração de horário");
    }
  };

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const resultado = await agendamentosService.atualizarAgendamento(id, {
        status: novoStatus
      });

      if (resultado.success) {
        message.success(`Agendamento atualizado para ${novoStatus.toUpperCase()}!`);
        fetchAppointments();
      } else {
        message.error("Erro ao mudar status: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      message.error("Erro ao tentar atualizar o status");
    }
  };

  const getTagColor = (status) => {
    switch (status) {
      case 'CONCLUIDO': return 'success';
      case 'ATENDIDO': return 'success';
      case 'CANCELADO': return 'error';
      default: return 'processing';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Carregando agendamentos..." />
      </div>
    );
  }

  return (
    <AgendaContainer>
      <List
        dataSource={appointments}
        locale={{ emptyText: <Empty description="Nenhum agendamento encontrado para este paciente" /> }}
        renderItem={(item) => (
          <AppointmentItem key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <DateBadge>
                <span className="day">{item.dia}</span>
                <span className="month-year">{item.mesAno}</span>
              </DateBadge>

              <AppointmentInfo>
                <div className="time-row">
                  <Space split={<Divider type="vertical" />}>
                    <Text type="secondary">
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.startTime} <SwapRightOutlined /> {item.endTime}
                    </Text>
                    <Text type="secondary">{item.value}</Text>
                    <Tag color={getTagColor(item.status)}>
                      {item.status}
                    </Tag>
                  </Space>
                </div>
                <div className="patient-name">{item.patient}</div>
              </AppointmentInfo>
            </div>

            <Space size="middle" style={{ paddingRight: '10px' }}>
              <Tooltip title="Marcar como Atendido">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<CheckCircleOutlined style={{ color: item.status === 'CONCLUIDO' ? '#bfbfbf' : '#52c41a' }} />} 
                  disabled={item.status === 'CONCLUIDO' || item.status === 'CANCELADO'} 
                  onClick={() => handleMudarStatus(item.id, 'concluido')}
                />
              </Tooltip>

              <Tooltip title="Cancelar Atendimento">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<CloseCircleOutlined style={{ color: item.status === 'CANCELADO' ? '#bfbfbf' : '#ff4d4f' }} />} 
                  disabled={item.status === 'CANCELADO' || item.status === 'CONCLUIDO'} 
                  onClick={() => handleMudarStatus(item.id, 'cancelado')}
                />
              </Tooltip>

              <Tooltip title="Editar Horário">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                  onClick={() => handleEditar(item)}
                />
              </Tooltip>

              <Tooltip title="Excluir Agendamento">
                <Popconfirm
                  title="Tem certeza que deseja excluir este agendamento?"
                  onConfirm={() => handleDeletar(item.id)}
                  okText="Sim"
                  cancelText="Não"
                  placement="topRight"
                >
                  <Button 
                    type="text" 
                    shape="circle" 
                    danger 
                    icon={<DeleteOutlined />} 
                  />
                </Popconfirm>
              </Tooltip>
            </Space>
          </AppointmentItem>
        )}
      />

      <Modal
        title="Reagendar Atendimento"
        open={isEditModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Salvar Alterações"
        cancelText="Voltar"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSalvarEdicao}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="data"
            label="Selecione o Dia"
            rules={[{ required: true, message: 'Selecione a data do atendimento!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="horarios"
            label="Horário de Início e Fim"
            rules={[{ required: true, message: 'Defina os horários do atendimento!' }]}
          >
            <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" order={true} />
          </Form.Item>
        </Form>
      </Modal>
    </AgendaContainer>
  );
}