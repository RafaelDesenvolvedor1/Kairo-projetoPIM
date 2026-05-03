import React from 'react';
import { Typography, Tree, Space, Button, Tag, Tooltip } from 'antd';
import { 
  FilterOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined, 
  ExpandOutlined, 
  AimOutlined,
  MinusSquareOutlined,
  MoreOutlined,
  EditOutlined,
  FullscreenOutlined,
  DownOutlined
} from '@ant-design/icons';

import { 
  SessionContainer, 
  TimelineSidebar, 
  ContentArea, 
  SessionHeader, 
  AnnotationCard 
} from './styles';

const { Title, Text } = Typography;

export default function TabAnotacoesSessao() {
  // Dados simulados para a Timeline baseados na imagem
  const treeData = [
    {
      title: '2026',
      key: '2026',
      children: [
        {
          title: 'Abr/26',
          key: 'abr-26',
          children: [
            {
              title: (
                <Space>
                   <MinusSquareOutlined style={{ color: '#2e3192' }} />
                   <Text>03/Abr</Text>
                   <Tag color="blue" style={{ fontSize: '10px', borderRadius: '10px' }}>Atual</Tag>
                </Space>
              ),
              key: '03-abr',
            },
          ],
        },
      ],
    },
  ];

  return (
    <SessionContainer>
      {/* Lado Esquerdo: Timeline */}
      <TimelineSidebar>
        <Title level={5}>Timeline</Title>
        <Tree
          showIcon
          defaultExpandedKeys={['2026', 'abr-26']}
          switcherIcon={<DownOutlined />}
          treeData={treeData}
          selectable={true}
        />
      </TimelineSidebar>

      {/* Lado Direito: Conteúdo da Sessão */}
      <ContentArea>
        <SessionHeader>
          <Tooltip title="Filtrar"><Button type="text" icon={<FilterOutlined />} /></Tooltip>
          <Tooltip title="Ver documentos"><Button type="text" icon={<FileTextOutlined />} /></Tooltip>
          <Tooltip title="Upload"><Button type="text" icon={<CloudUploadOutlined />} /></Tooltip>
          <Tooltip title="Contrair"><Button type="text" icon={<ExpandOutlined rotate={45} />} /></Tooltip>
          <Tooltip title="Focar"><Button type="text" icon={<AimOutlined />} /></Tooltip>
        </SessionHeader>

        <AnnotationCard>
          <div className="card-header">
            <Space>
              <DownOutlined style={{ fontSize: '12px', color: '#2e3192' }} />
              <Text strong>Sexta-Feira, 03/04/2026 às 12:38</Text>
              <Tag color="blue" style={{ borderRadius: '10px' }}>Atual</Tag>
            </Space>
            <Space>
              <Button size="small" shape="round" icon={<MinusSquareOutlined />}>Prevista</Button>
              <Button type="text" icon={<MoreOutlined />} />
            </Space>
          </div>

          <div className="card-body">
            <Text type="secondary">v vvvvvvvvvvvvv</Text>
          </div>

          <div className="card-footer">
            <Button type="text" icon={<FullscreenOutlined />} />
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              style={{ background: '#2e3192', borderRadius: '6px' }}
            >
              Editar
            </Button>
          </div>
        </AnnotationCard>
      </ContentArea>
    </SessionContainer>
  );
}