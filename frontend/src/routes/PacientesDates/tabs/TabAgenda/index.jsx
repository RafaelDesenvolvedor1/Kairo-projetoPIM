import React, { useState, useEffect } from 'react';
// Adicionado o Divider na lista de importações abaixo
import { Typography, List, Space, Tag, Empty, Spin, Divider } from 'antd'; 
import { CalendarOutlined, ClockCircleOutlined, SwapRightOutlined } from '@ant-design/icons';
import { AgendaContainer, AppointmentItem, DateBadge, AppointmentInfo } from './styles';

const { Text, Title } = Typography;

export default function TabAgenda() {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const staticData = [
    {
      id: 1,
      date: '13',
      monthYear: 'MAI.26',
      startTime: '16:42',
      endTime: '17:42',
      value: 'R$ 0',
      status: 'PREVISTO',
      patient: 'Cleiton Santos'
    },
    {
      id: 2,
      date: '03',
      monthYear: 'ABR.26',
      startTime: '12:38',
      endTime: '14:37',
      value: 'R$ 0',
      status: 'PREVISTO',
      patient: 'Cleiton Santos'
    }
  ];

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Simulação de carregamento do backend
      setTimeout(() => {
        setAppointments(staticData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
        locale={{ emptyText: <Empty description="Nenhum agendamento encontrado" /> }}
        renderItem={(item) => (
          <AppointmentItem key={item.id}>
            <DateBadge>
              <span className="day">{item.date}</span>
              <span className="month-year">{item.monthYear}</span>
            </DateBadge>

            <AppointmentInfo>
              <div className="time-row">
                {/* O Divider agora está definido e funcionará corretamente aqui */}
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {item.startTime} <SwapRightOutlined /> {item.endTime}
                  </Text>
                  <Text type="secondary">{item.value}</Text>
                  <Tag color="default" style={{ border: 'none', background: '#f0f0f0', color: '#8c8c8c' }}>
                    {item.status}
                  </Tag>
                </Space>
              </div>
              <div className="patient-name">{item.patient}</div>
            </AppointmentInfo>
          </AppointmentItem>
        )}
      />
    </AgendaContainer>
  );
}