import React from 'react';
import { Row, Col, Typography, Switch } from 'antd';
import { CardStyle, TextoPrimario, TextoSecundario, TextoDestaque } from './styles';

const { Text } = Typography;

export default function CardServico({ nome, modalidade, agendamento, ativo, onChangeStatus, ...props }) {
  return (
    <CardStyle ativo={ativo} {...props}>
      <Row align="middle" gutter={16}>
        {/* Nome do Serviço */}
        <Col span={6}>
          <TextoPrimario>{nome}</TextoPrimario>
        </Col>

        {/* Modalidade */}
        <Col span={6}>
          <TextoSecundario>{modalidade}</TextoSecundario>
        </Col>

        {/* Agendamento */}
        <Col span={6}>
          <TextoDestaque>{agendamento}</TextoDestaque>
        </Col>

        {/* Status Interativo (Switch) */}
        <Col span={6} style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <Text strong style={{ fontSize: '10px', color: '#595959', textTransform: 'uppercase' }}>
              Status (ativo ou não)
            </Text>
            <Switch 
              checked={ativo} 
              onChange={onChangeStatus} 
              size="small"
            />
          </div>
        </Col>
      </Row>
    </CardStyle>
  );
}