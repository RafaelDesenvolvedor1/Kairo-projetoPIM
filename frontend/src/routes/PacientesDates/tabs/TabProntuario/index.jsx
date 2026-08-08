import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Tag, Divider, Tooltip, Modal, Form, message, Spin } from 'antd';
import { 
  EditOutlined, 
  CloudUploadOutlined, 
  ExpandOutlined, 
  CheckCircleOutlined, 
  BoldOutlined, 
  ItalicOutlined, 
  AlignLeftOutlined, 
  AlignCenterOutlined, 
  AlignRightOutlined,
  UndoOutlined, 
  RedoOutlined,
  UnorderedListOutlined, 
  OrderedListOutlined,
  SaveOutlined
} from '@ant-design/icons';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import relatoriosService from '../../../../services/relatoriosService';
import { ProntuarioContainer, HeaderEditor, EditorWrapper } from './styles';

const { Title, Text } = Typography;

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="toolbar">
      <Space.Compact>
        <Tooltip title="Negrito">
          <Button 
            size="small"
            type={editor.isActive('bold') ? 'primary' : 'text'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<BoldOutlined />}
          />
        </Tooltip>
        <Tooltip title="Itálico">
          <Button 
            size="small"
            type={editor.isActive('italic') ? 'primary' : 'text'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<ItalicOutlined />}
          />
        </Tooltip>
      </Space.Compact>

      <Divider type="vertical" style={{ height: '20px' }} />

      <Space.Compact>
        <Tooltip title="Esquerda"><Button size="small" type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={<AlignLeftOutlined />} /></Tooltip>
        <Tooltip title="Centro"><Button size="small" type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={<AlignCenterOutlined />} /></Tooltip>
        <Tooltip title="Direita"><Button size="small" type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={<AlignRightOutlined />} /></Tooltip>
      </Space.Compact>

      <Divider type="vertical" style={{ height: '20px' }} />

      <Space.Compact>
        <Tooltip title="Lista"><Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<UnorderedListOutlined />} /></Tooltip>
        <Tooltip title="Números"><Button size="small" type={editor.isActive('orderedList') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<OrderedListOutlined />} /></Tooltip>
      </Space.Compact>

      <Divider type="vertical" style={{ height: '20px' }} />

      <Space.Compact>
        <Tooltip title="Desfazer"><Button size="small" type="text" onClick={() => editor.chain().focus().undo().run()} icon={<UndoOutlined />} /></Tooltip>
        <Tooltip title="Refazer"><Button size="small" type="text" onClick={() => editor.chain().focus().redo().run()} icon={<RedoOutlined />} /></Tooltip>
      </Space.Compact>
    </div>
  );
};

export default function TabProntuario({ idPaciente }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [relatorioId, setRelatorioId] = useState(null);
  
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      form.setFieldsValue({ conteudo: editor.getHTML() });
    },
  });

  const carregarProntuarioGeral = async () => {
    if (!idPaciente) return;
    try {
      setLoading(true);
      const res = await relatoriosService.getProntuarioPaciente(idPaciente);
      if (res.success && res.data) {
        // Pega o laudo/prontuário geral do paciente (não atrelado a sessão específica)
        const prontuarioGeral = res.data.find(item => item.tipo === 'laudo' || !item.id_agendamento);
        if (prontuarioGeral) {
          setRelatorioId(prontuarioGeral.id_relatorio);
          editor?.commands.setContent(prontuarioGeral.conteudo);
          form.setFieldsValue({ conteudo: prontuarioGeral.conteudo });
        }
      }
    } catch (err) {
      message.error("Erro ao carregar prontuário.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProntuarioGeral();
  }, [idPaciente]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        id_paciente: idPaciente,
        conteudo: values.conteudo,
        tipo: 'laudo'
      };

      let res;
      if (relatorioId) {
        res = await relatoriosService.updateRelatorio(relatorioId, payload);
      } else {
        res = await relatoriosService.createRelatorio(payload);
      }

      if (res.success) {
        message.success('Prontuário salvo com sucesso!');
        if (res.data?.id_relatorio) {
          setRelatorioId(res.data.id_relatorio);
        }
        setIsEditing(false);
        setIsModalOpen(false);
      } else {
        message.error(res.message || 'Erro ao salvar prontuário.');
      }
    } catch (error) {
      message.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProntuarioContainer>
      <Spin spinning={loading}>
        <HeaderEditor>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>Prontuário</Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>Histórico clínico</Text>
            <Tag icon={<CheckCircleOutlined />} color="default" style={{ marginTop: 8 }}>Sincronizado</Tag>
          </Space>

          <Space>
            <Button type="text" icon={<CloudUploadOutlined />} />
            <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditing(!isEditing)} />
            <Button type="text" icon={<ExpandOutlined />} onClick={() => setIsModalOpen(true)} />
          </Space>
        </HeaderEditor>

        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="conteudo" hidden>
            <input />
          </Form.Item>

          <div key={isModalOpen ? 'aba-off' : 'aba-on'}>
            {isEditing ? (
              <EditorWrapper>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
                <div style={{ textAlign: 'right', padding: '10px' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    style={{ background: '#2e3192' }}
                    icon={<SaveOutlined />}
                  >
                    Salvar
                  </Button>
                </div>
              </EditorWrapper>
            ) : (
              <div 
                style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '30px', minHeight: '200px', cursor: 'pointer', background: '#fafafa' }}
                onClick={() => setIsEditing(true)}
              >
                {editor && !editor.isEmpty ? (
                  <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                ) : (
                  <Text type="secondary">Clique aqui para começar a digitar no prontuário...</Text>
                )}
              </div>
            )}
          </div>

          <Modal
            key={isModalOpen ? 'modal-active' : 'modal-inactive'}
            title="Escrita Focada"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width="100%"
            centered
            destroyOnClose={true}
            styles={{ body: { height: 'calc(100vh - 120px)', padding: '24px' } }}
            footer={[
              <Button key="close" onClick={() => setIsModalOpen(false)}>Fechar sem salvar</Button>,
              <Button 
                key="save" 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={() => form.submit()} 
                style={{ background: '#2e3192' }}
              >
                Salvar Registro
              </Button>
            ]}
          >
            <EditorWrapper isFullScreen={true}>
              <MenuBar editor={editor} />
              <div style={{ minHeight: '400px' }}>
                <EditorContent editor={editor} />
              </div>
            </EditorWrapper>
          </Modal>
        </Form>
      </Spin>
    </ProntuarioContainer>
  );
}