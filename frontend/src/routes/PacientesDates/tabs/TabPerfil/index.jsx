import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Card, Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export default function TabPerfil({ idPaciente }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    // Exemplo de requisição disparada apenas quando a aba monta
    // fetch(`/api/pacientes/${idPaciente}/perfil`).then(...)
  }, [idPaciente]);

  return (
    <div style={{ padding: '20px 0' }}>
      <Card title="Dados Pessoais" bordered={false} style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <Row gutter={[32, 24]}>
          <Col span={12}>
            <Space><UserOutlined /><Text>Nome Completo: aaaa</Text></Space>
          </Col>
          <Col span={12}>
            <Space><PhoneOutlined /><Text>Telefone: +5511991427214</Text></Space>
          </Col>
          <Col span={12}>
            <Space><MailOutlined /><Text>E-mail: rafadev2001@gmail.com</Text></Space>
          </Col>
        </Row>
      </Card>

      <Card title="Dados Adicionais" bordered={false}>
        {/* Adicione os campos de Profissão, Escolaridade, etc. */}
      </Card>
    </div>
  );
}