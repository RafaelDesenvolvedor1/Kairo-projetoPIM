import React, { useState, useEffect } from 'react';
import { 
  Typography, Tree, Space, Button, Tag, Tooltip, 
  Collapse, Form, Popover, Checkbox, Divider, Modal, message 
} from 'antd';
import { 
  FilterOutlined, FileTextOutlined, CloudUploadOutlined, 
  ExpandOutlined, AimOutlined, MinusSquareOutlined, 
  MoreOutlined, EditOutlined, FullscreenOutlined, 
  DownOutlined, SaveOutlined, BoldOutlined, 
  ItalicOutlined, AlignLeftOutlined, AlignCenterOutlined, 
  AlignRightOutlined, UndoOutlined, RedoOutlined,
  UnorderedListOutlined, OrderedListOutlined,
  ArrowsAltOutlined, ShrinkOutlined
} from '@ant-design/icons';

// Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

// Styles
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

export default function TabAnotacoesSessao() {
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(['1']); 
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: '<p>Conteúdo da sessão...</p>',
    onUpdate: ({ editor }) => {
      // Sincronização em tempo real com o campo do formulário
      form.setFieldsValue({ anotacao: editor.getHTML() });
    },
  });

  const onFinish = (values) => {
    console.log('Salvando no Banco:', values);
    message.success('Anotação de sessão salva com sucesso!');
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setActiveKey([]); 
    } else {
      setActiveKey(['1']); 
    }
    setIsAllExpanded(!isAllExpanded);
  };

  return (
    <SessionContainer hideSidebar={hideSidebar}>
      <TimelineSidebar hideSidebar={hideSidebar}>
        <Title level={5}>Timeline</Title>
        <Tree treeData={[{ title: '2026', key: '26', children: [{ title: 'Abr/26', key: 'abr' }] }]} />
      </TimelineSidebar>

      <ContentArea>
        <SessionHeader>
          <Popover trigger="click" placement="bottomRight" content={(
            <div style={{ width: 220 }}>
              <Text strong>Filtros</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Checkbox>Somente com anotação</Checkbox><br/>
              <Checkbox>Exibir sessões canceladas</Checkbox><br/>
              <Checkbox>Somente com rascunho</Checkbox>
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

          <Tooltip title="Ir para sessão atual">
            <Button type="text" icon={<AimOutlined />} onClick={() => setActiveKey(['1'])} />
          </Tooltip>
        </SessionHeader>

        <Form form={form} onFinish={onFinish}>
          <Form.Item name="anotacao" hidden>
            <input />
          </Form.Item>

          <AnnotationCard>
            <Collapse activeKey={activeKey} onChange={setActiveKey} ghost expandIconPosition="start">
              <Panel 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '95%' }}>
                    <Space><Text strong>Sexta-Feira, 03/04/2026 às 12:38</Text><Tag color="blue">Atual</Tag></Space>
                    <Space onClick={e => e.stopPropagation()}>
                      <Button size="small" shape="round" icon={<MinusSquareOutlined />}>Prevista</Button>
                      <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditing(true)} />
                      <Button type="text" icon={<MoreOutlined />} />
                    </Space>
                  </div>
                } 
                key="1"
              >
                <div key={isModalOpen ? 'off' : 'on'}>
                  {isEditing ? (
                    <EditorWrapper>
                      <MenuBar editor={editor} />
                      <EditorContent editor={editor} />
                      <div className="card-footer">
                        <Button type="text" icon={<FullscreenOutlined />} onClick={() => setIsModalOpen(true)} />
                        <Space>
                          <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
                          <Button type="primary" htmlType="submit" style={{ background: '#2e3192' }} icon={<SaveOutlined />}>Salvar</Button>
                        </Space>
                      </div>
                    </EditorWrapper>
                  ) : (
                    <div className="view-mode" onClick={() => setIsEditing(true)}>
                      <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() }} />
                    </div>
                  )}
                </div>
              </Panel>
            </Collapse>
          </AnnotationCard>
        </Form>
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