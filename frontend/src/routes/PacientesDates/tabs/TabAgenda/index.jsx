import React, { useState, useEffect } from 'react';
import { Typography, List, Space, Tag, Empty, Spin, Divider, Button, Popconfirm, Tooltip, message } from 'antd'; 
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
        // Mapeia e trata os dados vindos da API
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
      // CORREÇÃO: Alterado de messageApi.error para o message.error do AntD estático importado
      message.error('Erro ao processar agenda do paciente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [idPaciente]);

  // Função para lidar com a exclusão
  const handleDeletar = async (id) => {
    try {
      const resultado = await agendamentosService.deletarAgendamento(id);
      if (resultado.success) {
        message.success("Agendamento excluído com sucesso!");
        fetchAppointments(); // Recarrega a listagem local
      } else {
        message.error("Erro ao excluir: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      message.error("Erro ao tentar excluir o registro");
    }
  };

  // Funções para ações futuras
  const handleEditar = (item) => {
    message.info(`Editar agendamento #${item.id} (Disparar Drawer ou Modal da Agenda geral)`);
  };

  const handleMudarStatus = (id, novoStatus) => {
    message.info(`Mudar status do agendamento #${id} para '${novoStatus}' (Em breve)`);
  };

  // Define as cores das tags baseado no status
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

            {/* Seção de Botões de Ação */}
            <Space size="middle" style={{ paddingRight: '10px' }}>
              <Tooltip title="Marcar como Atendido">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                  disabled 
                  onClick={() => handleMudarStatus(item.id, 'concluido')}
                />
              </Tooltip>

              <Tooltip title="Cancelar Atendimento">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} 
                  disabled 
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
    </AgendaContainer>
  );
}