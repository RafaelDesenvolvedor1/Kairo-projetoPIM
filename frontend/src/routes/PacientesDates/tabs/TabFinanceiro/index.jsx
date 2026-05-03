import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Tag, Modal, Form, DatePicker, message, Checkbox, Switch } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FinanceiroContainer, MonthSection, TransactionItem, ActionBanner } from './styles';

const { Text, Title } = Typography;

export default function TabFinanceiro() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  // Mock de dados estáticos baseado no vídeo
  const staticData = [
    { id: 1, month: 'maio de 2026', date: '12/05/2026', status: 'PREVISTO', amount: 'R$ 0', patient: 'Cleiton Santos' },
    { id: 2, month: 'abril de 2026', date: '03/04/2026', status: 'PREVISTO', amount: 'R$ 0', patient: 'Cleiton Santos' },
    { id: 3, month: 'janeiro de 2026', date: '08/01/2026', status: 'PREVISTO', amount: 'R$ 0,33', patient: 'Rafael Santos' },
  ];

  useEffect(() => {
    // Simulação de carregamento do backend
    setData(staticData);
  }, []);

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmPayment = (values) => {
    setLoading(true);
    // Simulação de chamada de API para o backend
    setTimeout(() => {
      setData(prev => prev.map(item => 
        selectedIds.includes(item.id) 
          ? { ...item, status: 'REALIZADO' } 
          : item
      ));
      message.success(`${selectedIds.length} lançamento(s) processado(s) com sucesso!`);
      setSelectedIds([]);
      setIsModalOpen(false);
      setLoading(false);
    }, 1000);
  };

  // Agrupamento por mês
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <FinanceiroContainer>
      <Space style={{ marginBottom: 20 }} size="large">
        <Button type="link" onClick={() => setSelectedIds(data.map(i => i.id))}>Selecionar todos</Button>
        <Space>
          <Switch size="small" />
          <Text>Ocultar lançamentos futuros</Text>
        </Space>
      </Space>

      {selectedIds.length > 0 && (
        <ActionBanner>
          <Text strong>{selectedIds.length} lançamento(s) selecionado(s)</Text>
          <Space>
            <Button type="link" onClick={() => setSelectedIds([])}>Desselecionar todos</Button>
            <Button 
              type="primary" 
              style={{ background: '#2e3192' }} 
              onClick={() => setIsModalOpen(true)}
            >
              Marcar como Pago
            </Button>
          </Space>
        </ActionBanner>
      )}

      {Object.keys(groupedData).map(month => (
        <MonthSection key={month}>
          <div className="month-title">{month}</div>
          {groupedData[month].map(item => (
            <TransactionItem 
              key={item.id} 
              isSelected={selectedIds.includes(item.id)}
              onClick={() => handleSelect(item.id)}
            >
              <Checkbox checked={selectedIds.includes(item.id)} />
              <Text>{item.patient}</Text>
              <Text type="secondary">{item.date}</Text>
              <div className="status-tag">
                <Tag color={item.status === 'REALIZADO' ? 'success' : 'default'}>
                  {item.status}
                </Tag>
              </div>
              <Text className="amount">{item.amount}</Text>
            </TransactionItem>
          ))}
        </MonthSection>
      ))}

      <Modal
        title="Confirmar Pagamento"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>Cancelar</Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={() => form.submit()}
            style={{ background: '#2e3192' }}
          >
            Confirmar
          </Button>
        ]}
      >
        <Form 
          form={form} 
          layout="vertical" 
          initialValues={{ dataRecebimento: dayjs() }}
          onFinish={handleConfirmPayment}
        >
          <Text>Deseja realmente marcar {selectedIds.length} lançamento(s) como pago?</Text>
          <Form.Item 
            name="dataRecebimento" 
            label="Data de Recebimento" 
            style={{ marginTop: 16 }}
            rules={[{ required: true, message: 'Selecione a data' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </FinanceiroContainer>
  );
}