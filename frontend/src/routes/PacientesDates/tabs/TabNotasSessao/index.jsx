import React, { useState, useEffect } from 'react';
import { 
  Typography, Tree, Space, Button, Tag, Tooltip, 
  Collapse, Form, Popover, Checkbox, Divider, Modal, message, Spin, Empty, Select, Dropdown, Popconfirm 
} from 'antd';
import { 
  FilterOutlined, FileTextOutlined, CloudUploadOutlined, 
  ExpandOutlined, AimOutlined, MinusSquareOutlined, 
  MoreOutlined, EditOutlined, FullscreenOutlined, 
  SaveOutlined, BoldOutlined, DeleteOutlined,
  ItalicOutlined, AlignLeftOutlined, AlignCenterOutlined, 
  AlignRightOutlined, ShrinkOutlined, CalendarOutlined,
  VideoCameraOutlined, UserOutlined
} from '@ant-design/icons';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import relatoriosService from '../../../../services/relatoriosService';
import agendamentosService from '../../../../services/agendamentosService';

import { 
  SessionContainer, TimelineSidebar, ContentArea, 
  SessionHeader, AnnotationCard, EditorWrapper 
} from './styles';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="toolbar">
      <Space.Compact>
        <Tooltip title="Negrito"><Button size="small" type={editor.isActive('bold') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleBold().run()} icon={<BoldOutlined />} /></Tooltip>
        <Tooltip title="Itálico"><Button size="small" type={editor.isActive('italic') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<ItalicOutlined />} /></Tooltip>
      </Space.Compact>
      <Divider type="vertical" style={{ height: '20px' }} />
      <Space.Compact>
        <Tooltip title="Esquerda"><Button size="small" type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={<AlignLeftOutlined />} /></Tooltip>
        <Tooltip title="Centro"><Button size="small" type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={<AlignCenterOutlined />} /></Tooltip>
        <Tooltip title="Direita"><Button size="small" type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={<AlignRightOutlined />} /></Tooltip>
      </Space.Compact>
    </div>
  );
};

export default function TabNotasSessao({ idPaciente }) {
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState([]); 
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessoes, setSessoes] = useState([]);
  const [agendamentosPaciente, setAgendamentosPaciente] = useState([]);
  const [currentRelatorioId, setCurrentRelatorioId] = useState(null);
  
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: '<p>Anotações do atendimento...</p>',
    onUpdate: ({ editor }) => {
      form.setFieldsValue({ anotacao: editor.getHTML() });
    },
  });

  const carregarProntuarioEAgendamentos = async () => {
    if (!idPaciente) return;
    try {
      setLoading(true);
      
      const [resRelatorios, resAgendamentos] = await Promise.all([
        relatoriosService.getProntuarioPaciente(idPaciente),
        agendamentosService.listarAgendamentosPorPaciente ? agendamentosService.listarAgendamentosPorPaciente(idPaciente) : Promise.resolve({ success: false })
      ]);

      if (resRelatorios.success && resRelatorios.data) {
        const relatoriosSessao = resRelatorios.data.filter(item => item.tipo === 'sessao');
        setSessoes(relatoriosSessao);
        if (relatoriosSessao.length > 0) {
          setActiveKey([String(relatoriosSessao[0].id_relatorio)]);
        }
      }

      if (resAgendamentos.success && resAgendamentos.data) {
        setAgendamentosPaciente(resAgendamentos.data);
      }
    } catch (err) {
      message.error("Erro ao carregar dados da sessão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProntuarioEAgendamentos();
  }, [idPaciente]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id_paciente: idPaciente,
        id_agendamento: values.id_agendamento || null,
        conteudo: values.anotacao,
        tipo: 'sessao'
      };

      let res;
      if (currentRelatorioId) {
        res = await relatoriosService.updateRelatorio(currentRelatorioId, payload);
      } else {
        res = await relatoriosService.createRelatorio(payload);
      }

      if (res.success) {
        message.success('Anotação de sessão salva com sucesso!');
        setIsEditing(false);
        setIsModalOpen(false);
        setCurrentRelatorioId(null);
        form.resetFields();
        carregarProntuarioEAgendamentos();
      } else {
        message.error(res.message || 'Falha ao salvar anotação.');
      }
    } catch (error) {
      message.error('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setCurrentRelatorioId(item.id_relatorio);
    editor?.commands.setContent(item.conteudo);
    form.setFieldsValue({ 
      anotacao: item.conteudo,
      id_agendamento: item.id_agendamento || undefined
    });
    setIsEditing(true);
  };

  const handleDeleteItem = async (idRelatorio) => {
    try {
      setLoading(true);
      const res = await relatoriosService.deleteRelatorio(idRelatorio);
      if (res.success) {
        message.success('Anotação removida com sucesso!');
        carregarProntuarioEAgendamentos();
      } else {
        message.error(res.message || 'Erro ao remover anotação.');
      }
    } catch (err) {
      message.error('Erro ao excluir do servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setActiveKey([]); 
    } else {
      setActiveKey(sessoes.map(s => String(s.id_relatorio))); 
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const formatarDataHeader = (item) => {
    const dataAlvo = item.agendamento?.data_hora_inicio || item.data_criacao;
    if (!dataAlvo) return 'Sessão sem data';

    const d = new Date(dataAlvo);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SessionContainer hideSidebar={hideSidebar}>
      <TimelineSidebar hideSidebar={hideSidebar}>
        <Title level={5}>Timeline</Title>
        <Tree treeData={[{ title: '2026', key: '26', children: [{ title: 'Histórico de Atendimentos', key: 'atend' }] }]} />
      </TimelineSidebar>

      <ContentArea>
        <SessionHeader>
          <Popover trigger="click" placement="bottomRight" content={(
            <div style={{ width: 220 }}>
              <Text strong>Filtros</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Checkbox defaultChecked>Somente com anotação</Checkbox><br/>
            </div>
          )}>
            <Button type="text" icon={<FilterOutlined />} />
          </Popover>
          
          <Tooltip title={hideSidebar ? "Mostrar timeline" : "Ocultar timeline"}>
            <Button type="text" icon={<FileTextOutlined />} onClick={() => setHideSidebar(!hideSidebar)} />
          </Tooltip>

          <Tooltip title="Anexar"><Button type="text" icon={<CloudUploadOutlined />} /></Tooltip>
          
          <Tooltip title={isAllExpanded ? "Recolher todas as sessões" : "Expandir todas as sessões"}>
            <Button type="text" icon={isAllExpanded ? <ShrinkOutlined /> : <ExpandOutlined />} onClick={handleToggleExpandAll} />
          </Tooltip>

          <Tooltip title="Nova Anotação de Atendimento">
            <Button type="text" icon={<AimOutlined />} onClick={() => {
              setCurrentRelatorioId(null);
              form.resetFields();
              editor?.commands.setContent('<p></p>');
              setIsEditing(true);
            }} />
          </Tooltip>
        </SessionHeader>

        <Spin spinning={loading}>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="anotacao" hidden>
              <input />
            </Form.Item>

            <AnnotationCard>
              {sessoes.length === 0 && !isEditing ? (
                <Empty description="Nenhuma anotação de sessão cadastrada." style={{ padding: 40 }} />
              ) : (
                <Collapse activeKey={activeKey} onChange={setActiveKey} ghost expandIconPosition="start">
                  {sessoes.map((item) => {
                    // Menu de opções dos 3 pontinhos usando AntD Dropdown
                    const menuItems = [
                      {
                        key: 'edit',
                        label: 'Editar',
                        icon: <EditOutlined />,
                        onClick: () => handleEditItem(item)
                      },
                      {
                        type: 'divider',
                      },
                      {
                        key: 'delete',
                        label: (
                          <Popconfirm
                            title="Remover anotação?"
                            description="Tem certeza que deseja excluir este registro do prontuário?"
                            onConfirm={() => handleDeleteItem(item.id_relatorio)}
                            okText="Sim, excluir"
                            cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                          >
                            <span style={{ color: '#ff4d4f' }}>Excluir registro</span>
                          </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                      },
                    ];

                    return (
                      <Panel 
                        header={
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '95%' }}>
                            <Space>
                              <Text strong style={{ textTransform: 'capitalize' }}>
                                {formatarDataHeader(item)}
                              </Text>

                              <Tag color={item.id_agendamento ? "green" : "orange"}>
                                {item.id_agendamento ? "Via Agenda" : "Avulso"}
                              </Tag>
                            </Space>

                            <Space onClick={e => e.stopPropagation()}>
                              {/* TAG HUMANIZADA (SEM EXIBIR ID DE BANCO) */}
                              <Tag icon={<CalendarOutlined />} color="blue" style={{ borderRadius: '12px' }}>
                                {item.agendamento ? "Sessão Presencial" : "Anotação"}
                              </Tag>

                              <Button type="text" icon={<EditOutlined />} onClick={() => handleEditItem(item)} />
                              
                              {/* MENU DOS 3 PONTINHOS */}
                              <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                                <Button type="text" icon={<MoreOutlined />} />
                              </Dropdown>
                            </Space>
                          </div>
                        } 
                        key={String(item.id_relatorio)}
                      >
                        <div key={isModalOpen ? 'off' : 'on'}>
                          {isEditing && currentRelatorioId === item.id_relatorio ? (
                            <EditorWrapper>
                              {/* VINCULAÇÃO DE CONSULTA INTEGRADA AO FORMULÁRIO DE EDIÇÃO */}
                              <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
                                <Form.Item 
                                  name="id_agendamento" 
                                  label={<Text type="secondary" style={{ fontSize: '12px' }}>Vincular esta anotação a uma consulta da agenda:</Text>}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Select
                                    size="small"
                                    placeholder="Selecione a consulta correspondente (opcional)..."
                                    allowClear
                                    style={{ width: '100%' }}
                                    options={agendamentosPaciente.map(ag => ({
                                      value: ag.id_agendamento,
                                      label: `Consulta de ${new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')} às ${new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                                    }))}
                                  />
                                </Form.Item>
                              </div>

                              <MenuBar editor={editor} />
                              <EditorContent editor={editor} />
                              <div className="card-footer" style={{ marginTop: 12 }}>
                                <Button type="text" icon={<FullscreenOutlined />} onClick={() => setIsModalOpen(true)} />
                                <Space>
                                  <Button onClick={() => { setIsEditing(false); setCurrentRelatorioId(null); }}>Cancelar</Button>
                                  <Button type="primary" htmlType="submit" style={{ background: '#2e3192' }} icon={<SaveOutlined />}>Salvar Alterações</Button>
                                </Space>
                              </div>
                            </EditorWrapper>
                          ) : (
                            <div className="view-mode" onClick={() => handleEditItem(item)}>
                              <div dangerouslySetInnerHTML={{ __html: item.conteudo }} />
                            </div>
                          )}
                        </div>
                      </Panel>
                    );
                  })}
                </Collapse>
              )}

              {/* FORMULÁRIO DE NOVA ANOTAÇÃO (QUANDO NÃO ESTÁ EDITANDO UM EXISTENTE) */}
              {isEditing && !currentRelatorioId && (
                <div style={{ marginTop: 20, border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, background: '#fff' }}>
                  <Title level={5} style={{ marginTop: 0 }}>Nova Evolução / Anotação de Atendimento</Title>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Form.Item 
                      name="id_agendamento" 
                      label={<Text type="secondary" style={{ fontSize: '12px' }}>Vincular esta anotação a uma consulta da agenda:</Text>}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        size="small"
                        placeholder="Selecione a consulta correspondente (opcional)..."
                        allowClear
                        style={{ width: '100%' }}
                        options={agendamentosPaciente.map(ag => ({
                          value: ag.id_agendamento,
                          label: `Consulta de ${new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')} às ${new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <EditorWrapper>
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                    <div className="card-footer" style={{ marginTop: 12, textAlign: 'right' }}>
                      <Space>
                        <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit" style={{ background: '#2e3192' }} icon={<SaveOutlined />}>Salvar Anotação</Button>
                      </Space>
                    </div>
                  </EditorWrapper>
                </div>
              )}
            </AnnotationCard>
          </Form>
        </Spin>
      </ContentArea>

      <Modal
        key={isModalOpen ? 'active' : 'inactive'}
        title="Escrita Focada"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width="100%"
        destroyOnClose
        centered
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>Cancelar</Button>,
          <Button key="s" type="primary" onClick={() => form.submit()} style={{ background: '#2e3192' }} icon={<SaveOutlined />}>Salvar</Button>
        ]}
      >
        <EditorWrapper isFullScreen>
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </EditorWrapper>
      </Modal>
    </SessionContainer>
  );
}