import React, { useState } from 'react';
import { 
  Typography, Tree, Space, Button, Tag, Tooltip, 
  Collapse, Form, Popover, Checkbox, Divider, Modal 
} from 'antd';
import { 
  FilterOutlined, FileTextOutlined, CloudUploadOutlined, 
  ExpandOutlined, AimOutlined, MinusSquareOutlined, 
  MoreOutlined, EditOutlined, FullscreenOutlined, 
  DownOutlined, SaveOutlined, BoldOutlined, 
  ItalicOutlined, AlignLeftOutlined, AlignCenterOutlined, 
  AlignRightOutlined, UndoOutlined, RedoOutlined,
  UnorderedListOutlined, OrderedListOutlined
} from '@ant-design/icons';

// Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import { 
  SessionContainer, TimelineSidebar, ContentArea, 
  SessionHeader, AnnotationCard, EditorWrapper 
} from './styles';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="toolbar" style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
      <Space.Compact>
        <Button size="small" type={editor.isActive('bold') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleBold().run()} icon={<BoldOutlined />} />
        <Button size="small" type={editor.isActive('italic') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<ItalicOutlined />} />
        <Button size="small" type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={<AlignLeftOutlined />} />
        <Button size="small" type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={<AlignCenterOutlined />} />
        <Button size="small" type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'text'} onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={<AlignRightOutlined />} />
        <Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'text'} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<UnorderedListOutlined />} />
      </Space.Compact>
    </div>
  );
};

export default function TabAnotacoesSessao() {
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: '<p>v vvvvvvvvvvvvv</p>',
    onUpdate: ({ editor }) => form.setFieldsValue({ anotacao: editor.getHTML() }),
  });

  const filterContent = (
    <div style={{ width: 250 }}>
      <Text strong>Filtros</Text>
      <Divider style={{ margin: '8px 0' }} />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Checkbox>Somente com anotação</Checkbox>
        <Checkbox>Exibir sessões canceladas</Checkbox>
        <Checkbox>Somente com rascunho</Checkbox>
        <Button type="link" size="small" style={{ float: 'right', color: '#8c8c8c' }}>Limpar filtros</Button>
      </Space>
    </div>
  );

  return (
    <SessionContainer hideSidebar={hideSidebar}>
      <TimelineSidebar hideSidebar={hideSidebar}>
        <Title level={5}>Timeline</Title>
        <Tree
          showIcon
          defaultExpandedKeys={['2026']}
          switcherIcon={<DownOutlined />}
          treeData={[{ title: '2026', key: '2026', children: [{ title: 'Abr/26', key: 'abr' }] }]}
        />
      </TimelineSidebar>

      <ContentArea>
        <SessionHeader>
          <Popover content={filterContent} trigger="click" placement="bottomRight">
            <Button type="text" icon={<FilterOutlined />} />
          </Popover>
          <Button type="text" icon={<FileTextOutlined />} />
          <Button type="text" icon={<CloudUploadOutlined />} />
          <Tooltip title="Ocultar timeline">
            <Button type="text" icon={<ExpandOutlined rotate={hideSidebar ? 0 : 45} />} onClick={() => setHideSidebar(!hideSidebar)} />
          </Tooltip>
          <Tooltip title="Ir para sessão atual">
            <Button type="text" icon={<AimOutlined />} />
          </Tooltip>
        </SessionHeader>

        <Form form={form} onFinish={(v) => console.log(v)}>
          <AnnotationCard>
            <Collapse defaultActiveKey={['1']} ghost expandIconPosition="start">
              <Panel 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '95%' }}>
                    <Space>
                      <Text strong>Sexta-Feira, 03/04/2026 às 12:38</Text>
                      <Tag color="blue" style={{ borderRadius: '10px' }}>Atual</Tag>
                    </Space>
                    <Space onClick={e => e.stopPropagation()}>
                      <Button size="small" shape="round" icon={<MinusSquareOutlined />}>Prevista</Button>
                      <Button type="text" icon={<MoreOutlined />} />
                    </Space>
                  </div>
                } 
                key="1"
              >
                <Form.Item name="anotacao" hidden><input /></Form.Item>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <MenuBar editor={editor} />
                  <div style={{ padding: '20px', minHeight: '200px' }}>
                    <EditorContent editor={editor} />
                  </div>
                </div>
                
                <div className="card-footer">
                  <Button type="text" icon={<FullscreenOutlined />} onClick={() => setIsModalOpen(true)} />
                  <Space>
                    <Button onClick={() => editor.commands.setContent('<p></p>')}>Cancelar</Button>
                    <Button type="primary" htmlType="submit" style={{ background: '#2e3192' }}>Salvar</Button>
                  </Space>
                </div>
              </Panel>
            </Collapse>
          </AnnotationCard>
        </Form>
      </ContentArea>

      <Modal
        title="Escrita Focada"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width="100%"
        centered
        footer={[<Button key="s" type="primary" onClick={() => form.submit()} style={{ background: '#2e3192' }}>Salvar</Button>]}
      >
        <MenuBar editor={editor} />
        <EditorContent editor={editor} style={{ minHeight: '400px', padding: '20px' }} />
      </Modal>
    </SessionContainer>
  );
}