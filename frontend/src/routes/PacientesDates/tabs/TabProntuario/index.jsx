import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Tag, Divider, Tooltip, Modal, Form, message } from 'antd';
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

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

// Styles
import { ProntuarioContainer, HeaderEditor, EditorWrapper } from './styles';

const { Title, Text } = Typography;

// Toolbar Reutilizável
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

export default function TabProntuario() {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm(); // Hook do AntD Form

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Atualiza o valor do campo oculto do formulário sempre que o texto mudar
      form.setFieldsValue({ conteudo: editor.getHTML() });
    },
  });

  const onFinish = (values) => {
    // Aqui os dados já vêm formatados do formulário (AntD)
    console.log('Dados para o Banco:', values);
    
    // Simulação de envio
    message.success('Prontuário salvo com sucesso!');
    setIsEditing(false);
    setIsModalOpen(false);
  };

  return (
    <ProntuarioContainer>
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
        {/* Campo oculto para o AntD gerenciar o valor do Tiptap */}
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
                  htmlType="submit" // Faz o botão disparar o onFinish do Form
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
              onClick={() => form.submit()} // Dispara a submissão do formulário
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
    </ProntuarioContainer>
  );
}