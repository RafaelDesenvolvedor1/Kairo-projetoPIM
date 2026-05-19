import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Space, Select, Button, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardServico from '../../components/CardServico';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';
import servicosService from '../../services/servicosService';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const normalizeServico = (item) => ({
  ...item,
  id: item.id_servico,
});

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [servicos, setServicos] = useState([]);
  const [editingServico, setEditingServico] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    const response = await servicosService.getServicos();
    if (response.success) {
      setServicos(response.data.map(normalizeServico));
    } else {
      message.error(response.message || 'Falha ao carregar serviços');
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
        agendamento: values.agendamento || '',
        ativo: values.ativo !== undefined ? values.ativo : true,
      };

      if (editingServico) {
        const response = await servicosService.updateServico(editingServico.id, payload);
        if (!response.success) throw new Error(response.message);
        setServicos((prev) => prev.map((servico) => (servico.id === editingServico.id ? normalizeServico(response.data) : servico)));
        message.success('Serviço atualizado com sucesso');
      } else {
        const response = await servicosService.createServico(payload);
        if (!response.success) throw new Error(response.message);
        setServicos((prev) => [...prev, normalizeServico(response.data)]);
        message.success('Serviço cadastrado com sucesso');
      }

      closeDrawer();
    } catch (error) {
      message.error(error.message || 'Erro ao salvar serviço');
    }
    setLoading(false);
  };

  const handleEdit = (servico) => {
    setEditingServico(servico);
    form.setFieldsValue({
      nome: servico.nome,
      modalidade: servico.modalidade,
      agendamento: servico.agendamento,
      ativo: servico.ativo,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const response = await servicosService.deleteServico(id);
    if (response.success) {
      setServicos((prev) => prev.filter((servico) => servico.id !== id));
      message.success('Serviço excluído com sucesso');
    } else {
      message.error(response.message || 'Erro ao excluir serviço');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (servico) => {
    const response = await servicosService.updateServico(servico.id, {
      ativo: !servico.ativo,
    });
    if (response.success) {
      setServicos((prev) => prev.map((item) => (item.id === servico.id ? normalizeServico(response.data) : item)));
      message.success('Status do serviço alterado');
    } else {
      message.error(response.message || 'Erro ao alterar status');
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
            rules={[{ required: true, message: 'Obrigatório' }]}
          >
            <Input placeholder="Ex: Terapia" size="large" />
          </Form.Item>

          <Form.Item
            name="modalidade"
            label="Modalidade"
            rules={[{ required: true, message: 'Obrigatório' }]}
          >
            <Select placeholder="Selecione" size="large">
              <Option value="Presencial">Presencial</Option>
              <Option value="Online">Online</Option>
              <Option value="Híbrido">Híbrido</Option>
            </Select>
          </Form.Item>

          <Form.Item name="agendamento" label="Agendamento">
            <Input placeholder="Ex: Online" size="large" />
          </Form.Item>

          <Form.Item name="ativo" label="Serviço ativo" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>{editingServico ? 'Atualizar Serviço' : 'Salvar Serviço'}</ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};
