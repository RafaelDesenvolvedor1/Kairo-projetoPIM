import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tooltip } from 'antd';
import { CopyOutlined, ExportOutlined, GlobalOutlined } from '@ant-design/icons';
import { useMessage } from '../../context/MessageProvider';
import copy from 'copy-to-clipboard';
import userService from '../../services/userService';

const { Text } = Typography;

export default () => {
  const messageApi = useMessage();
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    const res = await userService.getUsuarioAtual();
    if (res.success && res.data?.slug) {
      setSlug(res.data.slug);
    }
  };

  // Enquanto não carrega ou se não tiver slug, não renderiza link quebrado
  if (!slug) {
    return null;
  }

  const fullUrl = `${window.location.origin}/p/${slug}`;

  const handleCopy = () => {
    try {
      copy(fullUrl);
      messageApi.open({
        type: 'success',
        content: 'Link público copiado com sucesso!',
        duration: 2,
      });
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'Não foi possível copiar o link.',
        duration: 2,
      });
    }
  };

  const handleOpen = () => {
    window.open(fullUrl, '_blank');
  };

  return (
    <Card
      size="small"
      style={{
        borderRadius: 8,
        border: '1px solid #91caff',
        backgroundColor: '#e6f4ff',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space>
          <GlobalOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <div>
            <Text strong style={{ display: 'block', color: '#003a8c' }}>
              A sua Página Pública de Agendamento
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {fullUrl}
            </Text>
          </div>
        </Space>

        <Space>
          <Tooltip title="Copiar link para compartilhar com pacientes">
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copiar Link
            </Button>
          </Tooltip>
          <Tooltip title="Abrir página em nova aba">
            <Button type="primary" icon={<ExportOutlined />} onClick={handleOpen}>
              Ver Página
            </Button>
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};