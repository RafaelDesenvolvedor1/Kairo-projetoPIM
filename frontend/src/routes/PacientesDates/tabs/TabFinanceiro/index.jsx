import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Tag, Modal, Form, DatePicker, message, Checkbox, Switch, Spin } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { FinanceiroContainer, MonthSection, TransactionItem, ActionBanner } from './styles';
import financeirosService from '../../../../services/financeirosService';

dayjs.locale('pt-br');
const { Text } = Typography;

export default function TabFinanceiro({ idPaciente }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  const fetchLancamentosPaciente = async () => {
    if (!idPaciente) return;
    
    setLoadingData(true);
    try {
      // 1. Busca todos os lançamentos financeiros do usuário logado
      const resultado = await financeirosService.getLancamentos();
      
      if (resultado.success) {
        // 2. Filtra os lançamentos pertencentes especificamente a este paciente
        const lancamentosFiltrados = (resultado.data || []).filter(
          (lancamento) => lancamento.id_paciente === parseInt(idPaciente)
        );

        // 3. Formata e padroniza a estrutura para o componente visual da tela
        const dadosFormatados = lancamentosFiltrados.map((l) => {
          const dataOriginal = dayjs(l.data_lancamento);
          
          return {
            id: l.id_lancamento,
            // Ex: "maio de 2026"
            month: dataOriginal.format('MMMM [de] YYYY').toLowerCase(), 
            // Ex: "12/05/2026"
            date: dataOriginal.format('DD/MM/YYYY'), 
            // Converte o status do banco ('Pendente'/'Pago') para as tags do componente ('PREVISTO'/'REALIZADO')
            status: l.status === 'Pago' ? 'REALIZADO' : 'PREVISTO', 
            amount: `R$ ${parseFloat(l.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            patient: l.paciente?.nomePaciente || 'Paciente',
          };
        });

        setData(dadosFormatados);
      } else {
        message.error("Erro ao carregar dados financeiros: " + resultado.message);
      }
    } catch (error) {
      console.error("Erro na requisição financeira:", error);
      message.error("Erro interno ao carregar financeiro do paciente");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLancamentosPaciente();
  }, [idPaciente]);

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Processa a baixa de pagamento dos lançamentos selecionados no backend
  const handleConfirmPayment = async (values) => {
    setLoading(true);
    try {
      const dataPagamentoFormatada = values.dataRecebimento.format('YYYY-MM-DD');

      // Executa as requisições em paralelo no backend para atualizar o status para 'Pago'
      const promessas = selectedIds.map(id => 
        financeirosService.updateLancamento(id, {
          status: 'Pago',
          data_pagamento: dataPagamentoFormatada
        })
      );

      const resultados = await Promise.all(promessas);
      const falhas = resultados.filter(r => !r.success);

      if (falhas.length === 0) {
        message.success(`${selectedIds.length} lançamento(s) quitado(s) com sucesso!`);
        setSelectedIds([]);
        setIsModalOpen(false);
        // Recarrega a listagem atualizada direto do banco de dados
        fetchLancamentosPaciente(); 
      } else {
        message.error("Ocorreu um erro ao atualizar um ou mais lançamentos.");
      }
    } catch (error) {
      console.error("Erro ao dar baixa nos pagamentos:", error);
      message.error("Não foi possível processar a baixa financeira");
    } finally {
      setLoading(false);
    }
  };

  // Agrupamento cronológico por mês dos dados vindos da API
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = [];
    acc[item.month].push(item);
    return acc;
  }, {});

  if (loadingData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Carregando histórico financeiro do paciente..." />
      </div>
    );
  }

  return (
    <FinanceiroContainer>
      <Space style={{ marginBottom: 20 }} size="large">
        <Button type="link" onClick={() => setSelectedIds(data.map(i => i.id))}>Selecionar todos</Button>
        {/* <Space>
          <Switch size="small" />
          <Text>Ocultar lançamentos futuros</Text>
        </Space> */}
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
              <Checkbox checked={selectedIds.includes(item.id)} onChange={() => {}} />
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