import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Space, Select, Button, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardServico from '../../components/CardServico';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';
import servicosService from '../../services/servicosService';
import { useMessage } from '../../context/MessageProvider';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const normalizeServico = (item) => ({
  ...item,
  id: item.id_servico,
  ativo: Boolean(item.ativo),
});

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [servicos, setServicos] = useState([]);
  const [editingServico, setEditingServico] = useState(null);
  const [loading, setLoading] = useState(false);

  const messageApi = useMessage();

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    const response = await servicosService.getServicos();
    if (response.success) {
      setServicos(response.data.map(normalizeServico));
    } else {
      messageApi.open({
        type: 'error',
        content: response.message || 'Falha ao carregar serviços',
        duration: 3,
      });
    }
    setLoading(false);
  };

  const openDrawer = () => {
    form.resetFields();
    setEditingServico(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    form.resetFields();
    setEditingServico(null);
    setIsDrawerOpen(false);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        nome: values.nome,
        modalidade: values.modalidade,
        agendamento: values.agendamento || null,
        ativo: values.ativo !== undefined ? values.ativo : true,
      };

      let response;
      if (editingServico) {
        response = await servicosService.updateServico(editingServico.id, payload);
      } else {
        response = await servicosService.createServico(payload);
      }

      if (!response.success) {
        // Feedback detalhado das regras do Zod
        if (response.erros && Array.isArray(response.erros) && response.erros.length > 0) {
          response.erros.forEach((err) => {
            messageApi.open({
              type: 'error',
              content: `${err.campo ? err.campo + ': ' : ''}${err.mensagem}`,
              duration: 3,
            });
          });
        } else {
          messageApi.open({
            type: 'error',
            content: response.message || 'Erro ao processar serviço',
            duration: 3,
          });
        }
        setLoading(false);
        return;
      }

      if (editingServico) {
        setServicos((prev) =>
          prev.map((servico) =>
            servico.id === editingServico.id ? normalizeServico(response.data) : servico
          )
        );
        messageApi.open({
          type: 'success',
          content: 'Serviço atualizado com sucesso!',
          duration: 2,
        });
      } else {
        setServicos((prev) => [...prev, normalizeServico(response.data)]);
        messageApi.open({
          type: 'success',
          content: 'Serviço cadastrado com sucesso!',
          duration: 2,
        });
      }

      closeDrawer();
    } catch (error) {
      console.error('Erro inesperado ao salvar serviço:', error);
      messageApi.open({
        type: 'error',
        content: error.message || 'Erro interno ao salvar serviço.',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servico) => {
    setEditingServico(servico);
    form.setFieldsValue({
      nome: servico.nome,
      modalidade: servico.modalidade,
      agendamento: servico.agendamento || '',
      ativo: servico.ativo,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const response = await servicosService.deleteServico(id);
    if (response.success) {
      setServicos((prev) => prev.filter((servico) => servico.id !== id));
      messageApi.open({
        type: 'success',
        content: 'Serviço excluído com sucesso!',
        duration: 2,
      });
    } else {
      messageApi.open({
        type: 'error',
        content: response.message || 'Erro ao excluir serviço',
        duration: 3,
      });
    }
    setLoading(false);
  };

  const handleToggleStatus = async (servico) => {
    const novoStatus = !servico.ativo;
    const response = await servicosService.updateServico(servico.id, {
      ativo: novoStatus,
    });

    if (response.success) {
      setServicos((prev) =>
        prev.map((item) =>
          item.id === servico.id
            ? { ...item, ...normalizeServico(response.data), ativo: novoStatus }
            : item
        )
      );
      messageApi.open({
        type: 'success',
        content: `Serviço ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
        duration: 2,
      });
    } else {
      messageApi.open({
        type: 'error',
        content: response.message || 'Erro ao alterar status',
        duration: 3,
      });
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: '100%', padding: '24px' }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Serviços Ofertados</Title>
          <Paragraph type="secondary">Crie os serviços profissionais que você oferece</Paragraph>
          <ButtonPrimary onClick={openDrawer}>
            <PlusOutlined /> Novo Serviço
          </ButtonPrimary>
        </header>

        {servicos.length > 0 ? (
          servicos.map((servico) => (
            <div key={servico.id} style={{ marginBottom: 20 }}>
              <CardServico
                {...servico}
                onChangeStatus={() => handleToggleStatus(servico)}
              />
              <Space style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="default" icon={<EditOutlined />} onClick={() => handleEdit(servico)}>
                  Editar
                </Button>
                <Popconfirm
                  title="Deseja excluir este serviço?"
                  description="Esta ação não pode ser desfeita."
                  onConfirm={() => handleDelete(servico.id)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />}>
                    Excluir
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          ))
        ) : (
          <EmptyComponent showDrawer={openDrawer} btnText="Novo Serviço" />
        )}
      </Space>

      <MyDrawer
        title={editingServico ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
        open={isDrawerOpen}
        onClose={closeDrawer}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ modalidade: 'Presencial', ativo: true }}>
          <Form.Item
            name="nome"
            label="Nome do Serviço"
            rules={[
              { required: true, message: 'O nome do serviço é obrigatório!' },
              { min: 3, message: 'O nome deve ter no mínimo 3 caracteres!' },
              { max: 100, message: 'O nome deve ter no máximo 100 caracteres!' },
            ]}
          >
            <Input placeholder="Ex: Psicoterapia Individual" size="large" />
          </Form.Item>

          <Form.Item
            name="modalidade"
            label="Modalidade"
            rules={[{ required: true, message: 'Selecione a modalidade!' }]}
          >
            <Select placeholder="Selecione" size="large">
              <Option value="Presencial">Presencial</Option>
              <Option value="Online">Online</Option>
              <Option value="Híbrido">Híbrido</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="agendamento"
            label="Agendamento"
            rules={[{ max: 100, message: 'Máximo de 100 caracteres' }]}
          >
            <Input placeholder="Ex: Sessão de 50 minutos" size="large" />
          </Form.Item>

          <Form.Item name="ativo" label="Serviço ativo" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit loading={loading}>
              {editingServico ? 'Atualizar Serviço' : 'Salvar Serviço'}
            </ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};