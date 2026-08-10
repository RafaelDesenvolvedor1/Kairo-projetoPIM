import React, { useEffect, useState, useContext } from 'react';
import { 
  Row, Col, Typography, Card, Space, Spin, Alert, Button, Modal, Form, Input, DatePicker, Select, message, Divider 
} from 'antd';
import { 
  UserOutlined, EditOutlined, HomeOutlined, ContactsOutlined, SaveOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { PacienteContext } from '../../../../context/PacienteContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper para validação visual de CPF matemática no AntD
const validarCPFVisual = (_, value) => {
  if (!value) return Promise.resolve();
  
  const cpfLimp = value.replace(/\D/g, '');
  if (cpfLimp.length !== 11 || /^(\d)\1{10}$/.test(cpfLimp)) {
    return Promise.reject(new Error('CPF inválido!'));
  }

  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpfLimp.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimp.substring(9, 10))) return Promise.reject(new Error('CPF inválido!'));

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpfLimp.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimp.substring(10, 11))) return Promise.reject(new Error('CPF inválido!'));

  return Promise.resolve();
};

export default function TabPerfil({ idPaciente }) {
  const { pacientesList, updatePaciente } = useContext(PacienteContext);

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  // Localiza o paciente atual dentro da lista do Contexto
  useEffect(() => {
    if (!idPaciente) {
      setError("ID do paciente não foi encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const pacienteEncontrado = pacientesList.find(
      (p) => String(p.id) === String(idPaciente)
    );

    if (pacienteEncontrado) {
      setDados(pacienteEncontrado);
    } else if (pacientesList.length > 0) {
      setError("Não foi possível carregar os dados deste paciente.");
    }

    setLoading(false);
  }, [idPaciente, pacientesList]);

  // Preenche o formulário para edição
  const handleOpenEditModal = () => {
    if (!dados) return;

    form.setFieldsValue({
      nomePaciente: dados.nomePaciente || dados.nome_paciente,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: (dados.dataNascimento || dados.data_nascimento) ? dayjs(dados.dataNascimento || dados.data_nascimento) : null,
      genero: dados.genero,
      profissao: dados.profissao,
      estadoCivil: dados.estadoCivil || dados.estado_civil,
      telefone: dados.telefone,
      email: dados.email,
      cep: dados.cep,
      endereco: dados.endereco,
      numero: dados.numero,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.cidade,
      estado: dados.estado,
      contatoEmergenciaNome: dados.contatoEmergenciaNome || dados.contato_emergencia_nome,
      contatoEmergenciaTelefone: dados.contatoEmergenciaTelefone || dados.contato_emergencia_telefone,
      observacoes: dados.observacoes
    });

    setIsModalOpen(true);
  };

  const handleSavePerfil = async (values) => {
    try {
      setSaving(true);

      const payload = {
        id: idPaciente,
        ...values,
        dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : null
      };

      await updatePaciente(payload);

      message.success('Perfil atualizado com sucesso!');
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar alterações no Perfil:", err);

      // Exibe os erros retornados pelo Zod no backend
      if (err.response && err.response.data && err.response.data.erros) {
        err.response.data.erros.forEach(e => {
          message.error(`${e.campo ? e.campo + ': ' : ''}${e.mensagem}`);
        });
      } else {
        message.error('Erro ao atualizar dados do paciente.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin tip="Carregando dados do perfil..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Alert message="Erro" description={error} type="error" showIcon />
      </div>
    );
  }

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não informado';
    return dayjs(dataStr).format('DD/MM/YYYY');
  };

  // Fallbacks para exibição
  const nomeExibicao = dados?.nomePaciente || dados?.nome_paciente || 'Não informado';
  const dataNascExibicao = dados?.dataNascimento || dados?.data_nascimento;
  const estadoCivilExibicao = dados?.estadoCivil || dados?.estado_civil || 'Não informado';
  const contatoEmergenciaNomeExibicao = dados?.contatoEmergenciaNome || dados?.contato_emergencia_nome || 'Não informado';
  const contatoEmergenciaTelExibicao = dados?.contatoEmergenciaTelefone || dados?.contato_emergencia_telefone || 'Não informado';

  return (
    <div style={{ padding: '20px 0' }}>
      {/* CABEÇALHO DO PERFIL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{nomeExibicao}</Title>
          <Text type="secondary">Perfil Cadastral do Paciente</Text>
        </div>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          style={{ background: '#2e3192' }}
          onClick={handleOpenEditModal}
        >
          Editar Perfil
        </Button>
      </div>

      {/* BLOCO 1: DADOS PESSOAIS */}
      <Card 
        title={<Space><UserOutlined /> Dados Pessoais</Space>} 
        bordered={false} 
        style={{ marginBottom: '20px', borderRadius: '8px' }}
      >
        <Row gutter={[32, 16]}>
          <Col span={12} md={8}>
            <Text type="secondary">Nome Completo:</Text><br />
            <Text strong>{nomeExibicao}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">CPF:</Text><br />
            <Text strong>{dados?.cpf || 'Não informado'}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">RG:</Text><br />
            <Text strong>{dados?.rg || 'Não informado'}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">Data de Nascimento:</Text><br />
            <Text strong>{formatarData(dataNascExibicao)}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">Gênero:</Text><br />
            <Text strong>{dados?.genero || 'Não informado'}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">Estado Civil:</Text><br />
            <Text strong>{estadoCivilExibicao}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">Profissão:</Text><br />
            <Text strong>{dados?.profissao || 'Não informado'}</Text>
          </Col>
        </Row>
      </Card>

      {/* BLOCO 2: CONTATO E ENDEREÇO */}
      <Card 
        title={<Space><HomeOutlined /> Contato e Endereço</Space>} 
        bordered={false} 
        style={{ marginBottom: '20px', borderRadius: '8px' }}
      >
        <Row gutter={[32, 16]}>
          <Col span={12} md={8}>
            <Text type="secondary">Telefone / WhatsApp:</Text><br />
            <Text strong>{dados?.telefone ? `+55 ${dados.telefone}` : 'Não informado'}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">E-mail:</Text><br />
            <Text strong>{dados?.email || 'Não informado'}</Text>
          </Col>
          <Col span={12} md={8}>
            <Text type="secondary">CEP:</Text><br />
            <Text strong>{dados?.cep || 'Não informado'}</Text>
          </Col>
          <Col span={16} md={12}>
            <Text type="secondary">Endereço:</Text><br />
            <Text strong>{dados?.endereco ? `${dados.endereco}, Nº ${dados.numero || 'S/N'}` : 'Não informado'}</Text>
          </Col>
          <Col span={8} md={6}>
            <Text type="secondary">Complemento:</Text><br />
            <Text strong>{dados?.complemento || '-'}</Text>
          </Col>
          <Col span={12} md={6}>
            <Text type="secondary">Bairro:</Text><br />
            <Text strong>{dados?.bairro || 'Não informado'}</Text>
          </Col>
          <Col span={12} md={6}>
            <Text type="secondary">Cidade / UF:</Text><br />
            <Text strong>{dados?.cidade ? `${dados.cidade} - ${dados.estado || ''}` : 'Não informado'}</Text>
          </Col>
        </Row>
      </Card>

      {/* BLOCO 3: CONTATO DE EMERGÊNCIA E OBSERVAÇÕES */}
      <Card 
        title={<Space><ContactsOutlined /> Contato de Emergência & Observações</Space>} 
        bordered={false} 
        style={{ borderRadius: '8px' }}
      >
        <Row gutter={[32, 16]}>
          <Col span={12}>
            <Text type="secondary">Nome do Contato:</Text><br />
            <Text strong>{contatoEmergenciaNomeExibicao}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Telefone de Emergência:</Text><br />
            <Text strong>{contatoEmergenciaTelExibicao}</Text>
          </Col>
          <Col span={24} style={{ marginTop: 12 }}>
            <Text type="secondary">Observações Cadastrais:</Text><br />
            <Text>{dados?.observacoes || 'Nenhuma observação cadastrada.'}</Text>
          </Col>
        </Row>
      </Card>

      {/* MODAL DE EDIÇÃO DO PERFIL COM ANTD RULES ROBUSTAS */}
      <Modal
        title="Editar Dados do Paciente"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSavePerfil} style={{ marginTop: 16 }}>
          <Divider orientation="left" style={{ fontSize: 13, color: '#8c8c8c' }}>Dados Pessoais</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="nomePaciente" 
                label="Nome Completo" 
                rules={[
                  { required: true, message: 'O nome do paciente é obrigatório!' },
                  { min: 3, message: 'O nome deve ter pelo menos 3 caracteres!' },
                  { max: 50, message: 'O nome deve ter no máximo 50 caracteres!' }
                ]}
              >
                <Input placeholder="Ex: Cleiton Santos" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="cpf" 
                label="CPF"
                rules={[
                  { validator: validarCPFVisual }
                ]}
              >
                <Input placeholder="000.000.000-00" maxLength={14} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="rg" 
                label="RG"
                rules={[
                  { pattern: /^[a-zA-Z0-9.\-\s]{5,20}$/, message: 'RG deve conter entre 5 e 20 caracteres' }
                ]}
              >
                <Input placeholder="00.000.000-0" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dataNascimento" label="Data de Nascimento">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Selecione..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="genero" label="Gênero">
                <Select placeholder="Selecione...">
                  <Option value="Masculino">Masculino</Option>
                  <Option value="Feminino">Feminino</Option>
                  <Option value="Não-binário">Não-binário</Option>
                  <Option value="Outro">Outro / Prefiro não informar</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estadoCivil" label="Estado Civil">
                <Select placeholder="Selecione...">
                  <Option value="Solteiro(a)">Solteiro(a)</Option>
                  <Option value="Casado(a)">Casado(a)</Option>
                  <Option value="Divorciado(a)">Divorciado(a)</Option>
                  <Option value="Viúvo(a)">Viúvo(a)</Option>
                  <Option value="União Estável">União Estável</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="profissao" label="Profissão">
                <Input placeholder="Ex: Desenvolvedor de Software" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ fontSize: 13, color: '#8c8c8c' }}>Contato e Endereço</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="telefone" 
                label="Telefone / WhatsApp"
                rules={[
                  { pattern: /^\d{10,11}$/, message: 'Insira um telefone válido com DDD (apenas números)' }
                ]}
              >
                <Input placeholder="11999999999" maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="email" 
                label="E-mail" 
                rules={[
                  { required: true, message: 'O e-mail é obrigatório!' },
                  { type: 'email', message: 'Por favor, insira um e-mail válido!' },
                  { max: 50, message: 'E-mail pode ter no máximo 50 caracteres!' }
                ]}
              >
                <Input placeholder="exemplo@email.com" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="cep" 
                label="CEP"
                rules={[
                  { pattern: /^\d{5}-?\d{3}$/, message: 'CEP deve conter 8 dígitos (ex: 00000000 ou 00000-000)' }
                ]}
              >
                <Input placeholder="00000000" maxLength={9} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endereco" label="Logradouro / Endereço">
                <Input placeholder="Rua / Avenida..." />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="numero" label="Número">
                <Input placeholder="123" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="complemento" label="Complemento">
                <Input placeholder="Apto 4B" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bairro" label="Bairro">
                <Input placeholder="Centro" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="cidade" label="Cidade">
                <Input placeholder="São Paulo" />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item 
                name="estado" 
                label="UF"
                rules={[
                  { max: 2, message: 'UF deve ter 2 letras' }
                ]}
              >
                <Input placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ fontSize: 13, color: '#8c8c8c' }}>Emergência & Observações</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contatoEmergenciaNome" label="Nome do Contato de Emergência">
                <Input placeholder="Ex: Maria Santos (Mãe)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="contatoEmergenciaTelefone" 
                label="Telefone de Emergência"
                rules={[
                  { pattern: /^\d{10,11}$/, message: 'Insira um telefone válido com DDD (apenas números)' }
                ]}
              >
                <Input placeholder="11999999999" maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="observacoes" label="Observações Adicionais">
                <TextArea rows={3} placeholder="Anotações cadastrais ou preferências..." />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving} 
                icon={<SaveOutlined />}
                style={{ background: '#2e3192' }}
              >
                Salvar Alterações
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}