import React, { useState } from 'react';
import { Typography, Form, Input, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardServico from '../../components/CardServico';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';

const { Title, Paragraph } = Typography;

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [servicos, setServicos] = useState([
    { id: 1, nome: 'Consulta Psicológica', modalidade: 'Presencial', agendamento: 'Online', ativo: true },
  ]);

  const handleToggleStatus = (id) => {
    setServicos(prev => prev.map(s => 
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ));
  };

  const handleSave = (values) => {
    setServicos([...servicos, { ...values, id: Date.now(), ativo: true }]);
    form.resetFields();
    setIsDrawerOpen(false);
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: "100%", padding: "24px" }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Serviços Ofertados</Title>
          <Paragraph type="secondary">Crie os serviços profissionais que você oferece</Paragraph>
          {servicos.length > 0 && (
            <ButtonPrimary onClick={() => setIsDrawerOpen(true)}><PlusOutlined /> Novo Serviço</ButtonPrimary>
          )}
        </header>

        {servicos.length > 0 ? (
          servicos.map(servico => (
            <CardServico 
              key={servico.id}
              {...servico}
              onChangeStatus={() => handleToggleStatus(servico.id)}
            />
          ))
        ) : (
          <EmptyComponent showDrawer={() => setIsDrawerOpen(true)} btnText="Novo Serviço" />
        )}
      </Space>

     <MyDrawer title="Cadastrar Novo Serviço" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="nome" label="Nome do Serviço" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Ex: Terapia" size="large" />
          </Form.Item>
          <Form.Item name="modalidade" label="Modalidade" rules={[{ required: true }]}>
            <Select placeholder="Selecione" size="large">
              <Option value="Presencial">Presencial</Option>
              <Option value="Online">Online</Option>
            </Select>
          </Form.Item>
          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>Salvar Serviço</ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};