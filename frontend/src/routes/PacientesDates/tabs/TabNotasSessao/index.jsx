import React, { useState, useEffect } from 'react';
import { 
  Typography, Tree, Space, Button, Tag, Tooltip, 
  Collapse, Form, Popover, Checkbox, Divider, Modal, message, Spin, Empty, Select, Dropdown, Popconfirm, Input 
} from 'antd';
import { 
  FilterOutlined, FileTextOutlined, CloudUploadOutlined, 
  ExpandOutlined, AimOutlined, 
  MoreOutlined, EditOutlined, FullscreenOutlined, 
  SaveOutlined, BoldOutlined, DeleteOutlined,
  ItalicOutlined, AlignLeftOutlined, AlignCenterOutlined, 
  AlignRightOutlined, ShrinkOutlined, CalendarOutlined, SearchOutlined
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
  
  // Base de dados
  const [todasSessoes, setTodasSessoes] = useState([]); 
  const [sessoesExibidas, setSessoesExibidas] = useState([]); 
  const [treeData, setTreeData] = useState([]);
  const [agendamentosPaciente, setAgendamentosPaciente] = useState([]);
  
  // Estados para os Filtros
  const [filtroServico, setFiltroServico] = useState('TODOS');
  const [filtroOrigem, setFiltroOrigem] = useState('TODOS');
  const [termoBusca, setTermoBusca] = useState('');
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

  const [currentAgendamentoId, setCurrentAgendamentoId] = useState(null);
  const [currentRelatorioId, setCurrentRelatorioId] = useState(null);
  
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      form.setFieldsValue({ anotacao: editor.getHTML() });
    },
  });

  const gerarTreeDataApenasNotas = (listaSessoes) => {
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mapaAnos = {};

    listaSessoes.forEach((nota) => {
      const dataStr = nota.agendamento?.data_hora_inicio || nota.data_criacao;
      if (!dataStr) return;

      const d = new Date(dataStr);
      const ano = d.getFullYear();
      const mesNome = mesesNomes[d.getMonth()];

      if (!mapaAnos[ano]) mapaAnos[ano] = {};
      if (!mapaAnos[ano][mesNome]) mapaAnos[ano][mesNome] = [];

      mapaAnos[ano][mesNome].push(nota);
    });

    return Object.keys(mapaAnos).sort((a, b) => b - a).map((ano) => ({
      title: ano,
      key: `ano-${ano}`,
      children: Object.keys(mapaAnos[ano]).map((mes) => ({
        title: `${mes} (${mapaAnos[ano][mes].length})`,
        key: `mes-${ano}-${mes}`,
        notasDoMes: mapaAnos[ano][mes]
      }))
    }));
  };

  const carregarDadosProntuario = async () => {
    if (!idPaciente) return;
    try {
      setLoading(true);
      
      const [resRelatorios, resAgendamentos] = await Promise.all([
        relatoriosService.getProntuarioPaciente(idPaciente),
        agendamentosService.listarAgendamentosPorPaciente(idPaciente)
      ]);

      if (resRelatorios.success && resRelatorios.data) {
        const notasRealizadas = resRelatorios.data.filter(item => item.tipo === 'sessao');
        
        notasRealizadas.sort((a, b) => {
          const dataA = a.agendamento?.data_hora_inicio || a.data_criacao;
          const dataB = b.agendamento?.data_hora_inicio || b.data_criacao;
          return new Date(dataB) - new Date(dataA);
        });

        setTodasSessoes(notasRealizadas);

        // Mapeia serviços únicos das notas para o Select do Filtro
        const servicos = Array.from(new Set(
          notasRealizadas
            .map(n => n.agendamento?.servico?.nome)
            .filter(Boolean)
        ));
        setServicosDisponiveis(servicos);
      }

      if (resAgendamentos.success && resAgendamentos.data) {
        setAgendamentosPaciente(resAgendamentos.data);
      }
    } catch (err) {
      message.error("Erro ao carregar prontuário.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosProntuario();
  }, [idPaciente]);

  // APLICAÇÃO DOS FILTROS (Serviço, Origem e Texto de Busca)
  useEffect(() => {
    let filtradas = [...todasSessoes];

    // 1. Filtro de Serviço
    if (filtroServico !== 'TODOS') {
      filtradas = filtradas.filter(n => n.agendamento?.servico?.nome === filtroServico);
    }

    // 2. Filtro de Origem
    if (filtroOrigem === 'AGENDA') {
      filtradas = filtradas.filter(n => !!n.id_agendamento);
    } else if (filtroOrigem === 'AVULSO') {
      filtradas = filtradas.filter(n => !n.id_agendamento);
    }

    // 3. Filtro por Busca de Texto
    if (termoBusca.trim() !== '') {
      const busca = termoBusca.toLowerCase();
      filtradas = filtradas.filter(n => n.conteudo.toLowerCase().includes(busca));
    }

    setSessoesExibidas(filtradas);
    setTreeData(gerarTreeDataApenasNotas(filtradas));

    if (filtradas.length > 0) {
      setActiveKey([String(filtradas[0].id_relatorio)]);
    } else {
      setActiveKey([]);
    }
  }, [filtroServico, filtroOrigem, termoBusca, todasSessoes]);

  const handleSelectTreeNode = (selectedKeys, info) => {
    const node = info.node;
    if (node.notasDoMes && node.notasDoMes.length > 0) {
      setSessoesExibidas(node.notasDoMes);
      setActiveKey(node.notasDoMes.map(n => String(n.id_relatorio)));
    } else {
      setSessoesExibidas(todasSessoes);
      if (todasSessoes.length > 0) {
        setActiveKey([String(todasSessoes[0].id_relatorio)]);
      }
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id_paciente: idPaciente,
        id_agendamento: values.id_agendamento || currentAgendamentoId || null,
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
        setCurrentAgendamentoId(null);
        form.resetFields();
        carregarDadosProntuario();
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
    setCurrentAgendamentoId(item.id_agendamento);
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
        carregarDadosProntuario();
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
      setActiveKey(sessoesExibidas.map(s => String(s.id_relatorio))); 
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const formatarDataHeader = (item) => {
    const dataAlvo = item.agendamento?.data_hora_inicio || item.data_criacao;
    if (!dataAlvo) return 'Sessão sem data';

    const d = new Date(dataAlvo);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <SessionContainer hideSidebar={hideSidebar}>
      <TimelineSidebar hideSidebar={hideSidebar}>
        <Title level={5}>Timeline</Title>
        {treeData.length === 0 ? (
          <Text type="secondary" style={{ fontSize: '12px' }}>Nenhum histórico</Text>
        ) : (
          <Tree 
            treeData={treeData} 
            defaultExpandAll
            onSelect={handleSelectTreeNode}
          />
        )}
      </TimelineSidebar>

      <ContentArea>
        <SessionHeader>
          {/* POPOVER COM OS FILTROS AVANÇADOS */}
          <Popover 
            trigger="click" 
            placement="bottomRight" 
            content={(
              <div style={{ width: 240, padding: '4px 0' }}>
                <Text strong>Filtrar Anotações</Text>
                <Divider style={{ margin: '8px 0' }} />
                
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Busca textual:</Text>
                    <Input 
                      placeholder="Pesquisar termo..." 
                      prefix={<SearchOutlined />} 
                      value={termoBusca}
                      onChange={e => setTermoBusca(e.target.value)}
                      allowClear
                      size="small"
                    />
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Por Serviço:</Text>
                    <Select 
                      value={filtroServico} 
                      onChange={setFiltroServico} 
                      style={{ width: '100%' }}
                      size="small"
                    >
                      <Select.Option value="TODOS">Todos os Serviços</Select.Option>
                      {servicosDisponiveis.map(s => (
                        <Select.Option key={s} value={s}>{s}</Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Por Origem:</Text>
                    <Select 
                      value={filtroOrigem} 
                      onChange={setFiltroOrigem} 
                      style={{ width: '100%' }}
                      size="small"
                    >
                      <Select.Option value="TODOS">Todas as Origens</Select.Option>
                      <Select.Option value="AGENDA">Via Agenda</Select.Option>
                      <Select.Option value="AVULSO">Anotação Avulsa</Select.Option>
                    </Select>
                  </div>

                  {(filtroServico !== 'TODOS' || filtroOrigem !== 'TODOS' || termoBusca !== '') && (
                    <Button 
                      type="link" 
                      danger 
                      size="small" 
                      onClick={() => {
                        setFiltroServico('TODOS');
                        setFiltroOrigem('TODOS');
                        setTermoBusca('');
                      }}
                      style={{ padding: 0 }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </Space>
              </div>
            )}
          >
            <Button 
              type={filtroServico !== 'TODOS' || filtroOrigem !== 'TODOS' || termoBusca !== '' ? 'primary' : 'text'} 
              icon={<FilterOutlined />} 
            />
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
              setCurrentAgendamentoId(null);
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
              {sessoesExibidas.length === 0 && !isEditing ? (
                <Empty description="Nenhuma anotação localizada para os filtros selecionados." style={{ padding: 40 }} />
              ) : (
                <Collapse activeKey={activeKey} onChange={setActiveKey} ghost expandIconPosition="start">
                  {sessoesExibidas.map((item) => {
                    const menuItems = [
                      { key: 'edit', label: 'Editar', icon: <EditOutlined />, onClick: () => handleEditItem(item) },
                      { type: 'divider' },
                      {
                        key: 'delete',
                        label: (
                          <Popconfirm
                            title="Remover anotação?"
                            description="Tem certeza que deseja excluir esta evolução?"
                            onConfirm={() => handleDeleteItem(item.id_relatorio)}
                            okText="Excluir"
                            cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                          >
                            <span style={{ color: '#ff4d4f' }}>Excluir registro</span>
                          </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                      },
                    ];

                    const nomeServico = item.agendamento?.servico?.nome || (item.id_agendamento ? "Sessão Agenda" : "Anotação Avulsa");

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
                              <Tag icon={<CalendarOutlined />} color="blue" style={{ borderRadius: '12px' }}>
                                {nomeServico}
                              </Tag>

                              <Button type="text" icon={<EditOutlined />} onClick={() => handleEditItem(item)} />
                              
                              <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                                <Button type="text" icon={<MoreOutlined />} />
                              </Dropdown>
                            </Space>
                          </div>
                        } 
                        key={String(item.id_relatorio)}
                      >
                        <div>
                          {isEditing && currentRelatorioId === item.id_relatorio ? (
                            <EditorWrapper>
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
                                    options={agendamentosPaciente.map(ag => {
                                      const labelServico = ag.servico?.nome ? ` - ${ag.servico.nome}` : '';
                                      return {
                                        value: ag.id_agendamento,
                                        label: `Consulta de ${new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')} às ${new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${labelServico}`
                                      };
                                    })}
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

              {/* MODO ADICIONAR NOVA NOTA */}
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
                        options={agendamentosPaciente.map(ag => {
                          const labelServico = ag.servico?.nome ? ` - ${ag.servico.nome}` : '';
                          return {
                            value: ag.id_agendamento,
                            label: `Consulta de ${new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')} às ${new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${labelServico}`
                          };
                        })}
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