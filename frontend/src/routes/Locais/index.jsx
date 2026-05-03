import React, { useState } from 'react';
import { Typography, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardLocal from '../../components/CardLocal';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';

const { Title, Paragraph } = Typography;

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [locais, setLocais] = useState([
    { id: 1, titulo: 'Video Conferencia', endereco: 'Atendimento Online', ativo: true, isVideo: true },
    { id: 2, titulo: 'Consultório São Caetano', endereco: 'Rua das Flores, 123', ativo: true, isVideo: false },
  ]);

  const handleToggleStatus = (id) => {
    setLocais(prev => prev.map(item => 
      item.id === id ? { ...item, ativo: !item.ativo } : item
    ));
  };

  const handleSave = (values) => {
    setLocais([...locais, { ...values, id: Date.now(), ativo: true, isVideo: false, titulo: values.nome }]);
    form.resetFields();
    setIsDrawerOpen(false);
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: "100%", padding: "24px" }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Locais de Atendimento</Title>
          <Paragraph type="secondary">Principais locais de atendimento:</Paragraph>
          {locais.length > 0 && (
            <ButtonPrimary onClick={() => setIsDrawerOpen(true)}><PlusOutlined /> Adicionar Local</ButtonPrimary>
          )}
        </header>

        {locais.length > 0 ? (
          locais.map(local => (
            <CardLocal 
              key={local.id}
              {...local}
              onChangeStatus={() => handleToggleStatus(local.id)}
            />
          ))
        ) : (
          <EmptyComponent showDrawer={() => setIsDrawerOpen(true)} btnText="Adicionar Local" />
        )}
      </Space>

      <MyDrawer title="Adicionar Local" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="nome" label="Nome do Local" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Digite o nome" size="large" />
          </Form.Item>
          <Form.Item name="endereco" label="Endereço" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input.TextArea rows={4} placeholder="Endereço completo" size="large" />
          </Form.Item>
          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>Salvar Local</ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};