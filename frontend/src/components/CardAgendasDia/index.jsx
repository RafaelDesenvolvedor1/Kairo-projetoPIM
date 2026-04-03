import React from 'react';
import { Avatar, Typography, Empty } from 'antd'; // Importamos o Empty do AntD
import { RightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { Title } from '../Title';
import { 
  Container, 
  Header, 
  LinkText, 
  AgendamentoItem, 
  PacienteInfo,
  EmptyStateWrapper // Novo estilo
} from './styles';

const { Text } = Typography;

export default function CardAgendasDia({ agendamentos }) {
  const temAgendamentos = agendamentos && agendamentos.length > 0;

  return (
    <Container>
      <Header>
        <Title  style={{ margin: 0, fontSize: '18px' }}>Agendas do dia</Title>
        <Link to="/agendamentos">
          <LinkText>Ir para agenda <RightOutlined style={{ fontSize: '12px' }} /></LinkText>
        </Link>
      </Header>

      {temAgendamentos ? (
        agendamentos.map((item, index) => (
          <AgendamentoItem key={index}>
            <PacienteInfo>
              <Avatar 
                style={{ backgroundColor: '#ff7875', verticalAlign: 'middle' }} 
                size="small"
              >
                {item.iniciais}
              </Avatar>
              <Text style={{ color: '#8c8c8c' }}>{item.nome}</Text>
            </PacienteInfo>
            <Text strong style={{ color: '#8c8c8c' }}>{item.horario}</Text>
          </AgendamentoItem>
        ))
      ) : (
        /* Mensagem de estado vazio personalizada */
        <EmptyStateWrapper>
          <CalendarOutlined style={{ fontSize: '32px', color: '#bfbfbf', marginBottom: '8px' }} />
          <Text type="secondary">Você não possui agendamentos para hoje.</Text>
          <Text style={{ fontSize: '12px', color: '#d9d9d9' }}>Que tal revisar sua lista de pacientes?</Text>
        </EmptyStateWrapper>
      )}
    </Container>
  );
}