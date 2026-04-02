import React, { useState } from 'react';
import { Typography, Form, Space, TimePicker, Select } from 'antd';
import MyDrawer from '../../components/MyDrawer';
import ButtonSubmit from '../../components/ButtonSubmit';
import CardDia from '../../components/CardDia';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [form] = Form.useForm();

  const diasSemana = [
    'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'
  ];

  const handleOpenDrawer = (dia) => {
    setDiaSelecionado(dia);
    setIsDrawerOpen(true);
  };

  const handleSave = (values) => {
    console.log(`Salvando horários para ${diaSelecionado}:`, values);
    setIsDrawerOpen(false);
    form.resetFields();
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: "100%", padding: "24px" }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Horário de Atendimento</Title>
          <Paragraph type="secondary">
            Cadastre sua disponibilidade, locais e serviços para a agenda.
          </Paragraph>
        </header>

        {/* Lista de dias conforme o mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {diasSemana.map((dia) => (
            <CardDia 
              key={dia} 
              dia={dia} 
              onAdd={handleOpenDrawer} 
            />
          ))}
        </div>
      </Space>

      <MyDrawer 
        title={`Configurar ${diaSelecionado}`} 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="intervalo"
            label="Período de Atendimento"
            rules={[{ required: true, message: 'Selecione o horário' }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="local"
            label="Local de Atendimento"
          >
            <Select placeholder="Selecione o local" size="large">
              <Option value="consultorio">Consultório São Caetano</Option>
              <Option value="online">Vídeo Conferência</Option>
            </Select>
          </Form.Item>

          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>
              Salvar Horário
            </ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};