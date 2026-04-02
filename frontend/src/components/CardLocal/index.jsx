import React from 'react';
import { Typography, Switch, Row, Col } from 'antd';
import { EnvironmentOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { CardStyle, IconWrapper, TextContent } from './styles';

const { Text, Title } = Typography;

export default ({ titulo, endereco, ativo, isVideo, onChangeStatus, ...props }) => {
  return (
    <CardStyle ativo={ativo} {...props}>
      <Row align="middle" gutter={16}>
        {/* Lado Esquerdo: Ícone e Textos */}
        <Col span={18} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconWrapper>
            {isVideo ? <VideoCameraOutlined /> : <EnvironmentOutlined />}
          </IconWrapper>
          
          <TextContent>
            <Title level={5} style={{ color: '#001529', margin: 0 }}>
              {titulo}
            </Title>
            {endereco && <Text type="secondary">{endereco}</Text>}
          </TextContent>
        </Col>

        {/* Lado Direito: Controle de Status */}
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
};