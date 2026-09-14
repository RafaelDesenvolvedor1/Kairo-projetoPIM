import React, { useState, useEffect } from 'react';
import {
  Typography,
  Form,
  Input,
  Space,
  Button,
  Switch,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MyDrawer from '../../components/MyDrawer';
import CardLocal from '../../components/CardLocal';
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSubmit from '../../components/ButtonSubmit';
import EmptyComponent from '../../components/EmptyComponent';
import locaisService from '../../services/locaisService';
import cepService from '../../services/cepService';
import { useMessage } from '../../context/MessageProvider';

const { Title, Paragraph } = Typography;

const formatarEnderecoString = (end) => {
  if (!end || typeof end !== 'object') return 'Endereço não informado';
  const partes = [];
  if (end.logradouro) partes.push(end.logradouro);
  if (end.numero) partes.push(`Nº ${end.numero}`);
  if (end.complemento) partes.push(end.complemento);
  if (end.bairro) partes.push(end.bairro);
  if (end.cidade && end.estado) partes.push(`${end.cidade} - ${end.estado}`);
  if (end.cep) partes.push(`CEP: ${end.cep}`);
  return partes.join(', ') || 'Endereço não informado';
};

const normalizeLocal = (item) => ({
  ...item,
  titulo: item.nome,
  isVideo: Boolean(item.is_video),
  ativo: Boolean(item.ativo),
  id: item.id_local,
  enderecoObj: item.endereco || null,
  endereco: item.is_video
    ? 'Atendimento Online / Videoconferência'
    : formatarEnderecoString(item.endereco),
});

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [locais, setLocais] = useState([]);
  const [editingLocal, setEditingLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  const messageApi = useMessage();
  const messageKey = 'cepNotificationKey';

  const isVideoWatch = Form.useWatch('isVideo', form);

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    setLoading(true);
    const response = await locaisService.getLocais();
    if (response.success) {
      setLocais(response.data.map(normalizeLocal));
    } else {
      messageApi.open({
        type: 'error',
        content: response.message || 'Falha ao carregar locais',
        duration: 3,
      });
    }
    setLoading(false);
  };

  const handleBuscaCep = async (e) => {
    const cepDigitado = e.target.value;
    const cepLimpo = cepDigitado.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      messageApi.open({
        key: messageKey,
        type: 'loading',
        content: 'Buscando CEP...',
      });

      const resultado = await cepService.buscarEnderecoPorCep(cepLimpo);

      if (resultado.sucesso) {
        messageApi.open({
          key: messageKey,
          type: 'success',
          content: 'Endereço localizado!',
          duration: 2,
        });

        form.setFieldsValue({
          logradouro: resultado.dados.endereco,
          bairro: resultado.dados.bairro,
          cidade: resultado.dados.cidade,
          estado: resultado.dados.estado,
        });
      } else {
        messageApi.open({
          key: messageKey,
          type: 'error',
          content: resultado.mensagem || 'CEP não encontrado.',
          duration: 3,
        });
      }
    }
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
      const isVideo = Boolean(values.isVideo);

      const payload = {
        nome: values.nome,
        is_video: isVideo,
        ativo: values.ativo !== undefined ? values.ativo : true,
        endereco: isVideo
          ? null
          : {
              cep: values.cep ? values.cep.replace(/\D/g, '') : null,
              logradouro: values.logradouro || null,
              numero: values.numero || null,
              complemento: values.complemento || null,
              bairro: values.bairro || null,
              cidade: values.cidade || null,
              estado: values.estado || null,
            },
      };

      let response;
      if (editingLocal) {
        response = await locaisService.updateLocal(editingLocal.id, payload);
      } else {
        response = await locaisService.createLocal(payload);
      }

      // Tratamento das respostas com falhas e erros de validação do Zod
      if (!response.success) {
        if (response.erros && Array.isArray(response.erros) && response.erros.length > 0) {
          response.erros.forEach((err) => {
            messageApi.open({
              type: 'error',
              content: `${err.mensagem}`,
              duration: 3,
            });
          });
        } else {
          messageApi.open({
            type: 'error',
            content: response.message || 'Erro ao processar local',
            duration: 3,
          });
        }
        setLoading(false);
        return;
      }

      if (editingLocal) {
        setLocais((prev) =>
          prev.map((item) =>
            item.id === editingLocal.id ? normalizeLocal(response.data) : item
          )
        );
        messageApi.open({
          type: 'success',
          content: 'Local atualizado com sucesso!',
          duration: 2,
        });
      } else {
        setLocais((prev) => [...prev, normalizeLocal(response.data)]);
        messageApi.open({
          type: 'success',
          content: 'Local cadastrado com sucesso!',
          duration: 2,
        });
      }

      closeDrawer();
    } catch (error) {
      console.error('Erro inesperado ao salvar local:', error);
      messageApi.open({
        type: 'error',
        content: error.message || 'Erro interno ao salvar local.',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    const end = local.enderecoObj || {};

    form.setFieldsValue({
      nome: local.titulo,
      isVideo: local.isVideo,
      ativo: local.ativo,
      cep: end.cep || '',
      logradouro: end.logradouro || '',
      numero: end.numero || '',
      complemento: end.complemento || '',
      bairro: end.bairro || '',
      cidade: end.cidade || '',
      estado: end.estado || '',
    });

    setIsDrawerOpen(true);
  };

  const handleDelete = async (localId) => {
    setLoading(true);
    const response = await locaisService.deleteLocal(localId);
    if (response.success) {
      setLocais((prev) => prev.filter((item) => item.id !== localId));
      messageApi.open({
        type: 'success',
        content: 'Local excluído com sucesso!',
        duration: 2,
      });
    } else {
      messageApi.open({
        type: 'error',
        content: response.message || 'Erro ao excluir local',
        duration: 3,
      });
    }
    setLoading(false);
  };

  const handleToggleStatus = async (local) => {
    const novoStatus = !local.ativo;
    const response = await locaisService.updateLocal(local.id, {
      ativo: novoStatus,
    });

    if (response.success) {
      setLocais((prev) =>
        prev.map((item) =>
          item.id === local.id
            ? { ...item, ...normalizeLocal(response.data), ativo: novoStatus }
            : item
        )
      );
      messageApi.open({
        type: 'success',
        content: `Local ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
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
          <Title level={2} style={{ color: '#001529' }}>
            Locais de Atendimento
          </Title>
          <Paragraph type="secondary">
            Principais locais de atendimento:
          </Paragraph>
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
              <Space
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(local)}
                >
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
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isVideo: false, ativo: true }}
        >
          <Form.Item
            name="nome"
            label="Nome do Local / Sala"
            rules={[{ required: true, message: 'O nome é obrigatório' }]}
          >
            <Input placeholder="Ex: Consultório Principal - Sala 102" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isVideo"
                label="Atendimento online"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ativo"
                label="Local ativo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {!isVideoWatch && (
            <>
              <div style={{ marginTop: 12, marginBottom: 12, fontWeight: 600 }}>
                Endereço Físico
              </div>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="cep"
                    label="CEP"
                    rules={[
                      { required: true, message: 'Informe o CEP' },
                      {
                        pattern: /^\d{5}-?\d{3}$/,
                        message: 'Formato de CEP inválido',
                      },
                    ]}
                  >
                    <Input
                      placeholder="00000-000"
                      maxLength={9}
                      onChange={handleBuscaCep}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="numero"
                    label="Número"
                    rules={[{ required: true, message: 'Informe o número' }]}
                  >
                    <Input placeholder="Ex: 120" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="logradouro"
                label="Logradouro / Rua"
                rules={[{ required: true, message: 'Informe a rua' }]}
              >
                <Input placeholder="Ex: Avenida Paulista" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="complemento" label="Complemento">
                    <Input placeholder="Ex: Sala 4" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bairro"
                    label="Bairro"
                    rules={[{ required: true, message: 'Informe o bairro' }]}
                  >
                    <Input placeholder="Ex: Bela Vista" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={16}>
                  <Form.Item
                    name="cidade"
                    label="Cidade"
                    rules={[{ required: true, message: 'Informe a cidade' }]}
                  >
                    <Input placeholder="Ex: São Paulo" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="estado"
                    label="UF"
                    rules={[{ required: true, message: 'UF' }]}
                  >
                    <Input
                      maxLength={2}
                      placeholder="SP"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit loading={loading}>
              {editingLocal ? 'Atualizar Local' : 'Salvar Local'}
            </ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};