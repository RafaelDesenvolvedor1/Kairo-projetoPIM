import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Space, Button, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardLocal from '../../components/CardLocal';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';
import locaisService from '../../services/locaisService';

const { Title, Paragraph } = Typography;

const normalizeLocal = (item) => ({
  ...item,
  titulo: item.nome,
  isVideo: item.is_video,
  id: item.id_local,
});

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [locais, setLocais] = useState([]);
  const [editingLocal, setEditingLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    setLoading(true);
    const response = await locaisService.getLocais();
    if (response.success) {
      setLocais(response.data.map(normalizeLocal));
    } else {
      message.error(response.message || 'Falha ao carregar locais');
    }
    setLoading(false);
  };

  const openDrawer = () => {
    setEditingLocal(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingLocal(null);
    form.resetFields();
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        nome: values.nome,
        endereco: values.endereco,
        is_video: values.isVideo || false,
        ativo: values.ativo !== undefined ? values.ativo : true,
      };

      if (editingLocal) {
        const response = await locaisService.updateLocal(editingLocal.id, payload);
        if (!response.success) {
          throw new Error(response.message);
        }

        setLocais((prev) => prev.map((item) => (item.id === editingLocal.id ? normalizeLocal(response.data) : item)));
        message.success('Local atualizado com sucesso');
      } else {
        const response = await locaisService.createLocal(payload);
        if (!response.success) {
          throw new Error(response.message);
        }

        setLocais((prev) => [...prev, normalizeLocal(response.data)]);
        message.success('Local cadastrado com sucesso');
      }

      closeDrawer();
    } catch (error) {
      message.error(error.message || 'Erro ao salvar local');
    }
    setLoading(false);
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    form.setFieldsValue({
      nome: local.titulo,
      endereco: local.endereco,
      isVideo: local.isVideo,
      ativo: local.ativo,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (localId) => {
    setLoading(true);
    const response = await locaisService.deleteLocal(localId);
    if (response.success) {
      setLocais((prev) => prev.filter((item) => item.id !== localId));
      message.success('Local excluído com sucesso');
    } else {
      message.error(response.message || 'Erro ao excluir local');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (local) => {
    const response = await locaisService.updateLocal(local.id, {
      ativo: !local.ativo,
    });

    if (response.success) {
      setLocais((prev) => prev.map((item) => (item.id === local.id ? normalizeLocal(response.data) : item)));
      message.success('Status do local alterado');
    } else {
      message.error(response.message || 'Erro ao alterar status');
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: '100%', padding: '24px' }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Locais de Atendimento</Title>
          <Paragraph type="secondary">Principais locais de atendimento:</Paragraph>
          <ButtonPrimary onClick={openDrawer}>
            <PlusOutlined /> Adicionar Local
          </ButtonPrimary>
        </header>

        {locais.length > 0 ? (
          locais.map((local) => (
            <div key={local.id} style={{ marginBottom: 20 }}>
              <CardLocal
                {...local}
                onChangeStatus={() => handleToggleStatus(local)}
              />
              <Space style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="default" icon={<EditOutlined />} onClick={() => handleEdit(local)}>
                  Editar
                </Button>
                <Popconfirm
                  title="Deseja excluir este local?"
                  description="Essa ação não pode ser desfeita."
                  onConfirm={() => handleDelete(local.id)}
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
          <EmptyComponent showDrawer={openDrawer} btnText="Adicionar Local" />
        )}
      </Space>

      <MyDrawer
        title={editingLocal ? 'Editar Local' : 'Adicionar Local'}
        open={isDrawerOpen}
        onClose={closeDrawer}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isVideo: false, ativo: true }}
        >
          <Form.Item
            name="nome"
            label="Nome do Local"
            rules={[{ required: true, message: 'Obrigatório' }]}
          >
            <Input placeholder="Digite o nome" size="large" />
          </Form.Item>
          <Form.Item
            name="endereco"
            label="Endereço"
            rules={[{ required: true, message: 'Obrigatório' }]}
          >
            <Input.TextArea rows={4} placeholder="Endereço completo" size="large" />
          </Form.Item>
          <Form.Item name="isVideo" label="Atendimento online" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="ativo" label="Local ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>{editingLocal ? 'Atualizar Local' : 'Salvar Local'}</ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};
