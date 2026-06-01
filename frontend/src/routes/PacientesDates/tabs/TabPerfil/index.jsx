import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Card, Space, Spin, Alert } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
// Importa a função que criamos no controller do frontend
import { getPacienteById } from '../../../../controllers/pacientesController'; 

const { Text } = Typography;

export default function TabPerfil({ idPaciente }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se não houver ID por algum motivo, cancela a busca para não quebrar a API
    if (!idPaciente) {
      setError("ID do paciente não foi encontrado.");
      setLoading(false);
      return;
    }

    const carregarPerfil = async () => {
      try {
        setLoading(true);
        setError(null);
        // Busca os dados atualizados diretamente do Backend usando o ID
        const data = await getPacienteById(idPaciente);
        setDados(data);
      } catch (err) {
        console.error("Erro ao carregar aba Perfil:", err);
        setError("Não foi possível carregar os dados deste paciente.");
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [idPaciente]);

  // Se estiver buscando no banco, mostra o feedback visual de carregamento
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin tip="Carregando dados do perfil..." size="large" />
      </div>
    );
  }

  // Se der algum erro na requisição do Axios, mostra o alerta na tela
  if (error) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Alert message="Erro" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <Card title="Dados Pessoais" bordered={false} style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <Row gutter={[32, 24]}>
          <Col span={12}>
            <Space>
              <UserOutlined />
              <Text><strong>Nome Completo:</strong> {dados?.nomePaciente || 'Não informado'}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <PhoneOutlined />
              <Text>
                {/* Adiciona o prefixo +55 de forma amigável apenas se houver telefone salvo */}
                <strong>Telefone:</strong> {dados?.telefone ? `+55${dados.telefone}` : 'Não informado'}
              </Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <MailOutlined />
              <Text><strong>E-mail:</strong> {dados?.email || 'Não informado'}</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="Dados Adicionais" bordered={false} style={{ borderRadius: '8px' }}>
        {/* Futuramente você pode renderizar os dados extras puxados do back aqui */}
        <Text type="secondary">Sem dados adicionais cadastrados para este paciente.</Text>
      </Card>
    </div>
  );
}