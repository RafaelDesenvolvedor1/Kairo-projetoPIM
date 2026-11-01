import React, { useEffect } from "react";
import { Layout, Card, Form, Input, Checkbox, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import ButtonSubmit from "../../components/ButtonSubmit";
import ButtonSecoundary from "../../components/ButtonSecoundary";
import { useNavigate, Link } from "react-router";
import authService from "../../services/authService";
import { useMessage } from "../../context/MessageProvider";

const { Content } = Layout;
const { Title, Text } = Typography;

export default () => {
  const navigate = useNavigate();
  const messageApi = useMessage();

  // Capturar tokens do Google OAuth quando redirecionar da callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const nome = params.get('nome');

    if (token) {
      localStorage.setItem('token', token);
      if (nome) {
        localStorage.setItem('nome', nome);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/');
      messageApi.success('Login com Google realizado com sucesso!');
    }
  }, [navigate, messageApi]);

  const onFinish = async (values) => {
    try {
      const result = await authService.login(values.email, values.password);
      if (result && result.success) {
        messageApi.success('Login realizado com sucesso!');
        navigate('/');
      } else if (result && result.message) {
        messageApi.error(result.message);
      } else {
        messageApi.error('Erro ao realizar login');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      messageApi.error('Erro inesperado ao realizar login');
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ display: "flex" }}>

        {/* LADO ESQUERDO */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1677ff, #69b1ff)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Title level={1} style={{ color: "#fff", marginBottom: 16 }}>
            Bem-vindo de volta!
          </Title>

          <Text style={{ color: "#e6f4ff", marginBottom: 32, fontSize: "16px" }}>
            Acesse sua conta para continuar
          </Text>

          <Link to="/cadastro" aria-label="Ir para a página de cadastro">
            <ButtonSecoundary>
              Cadastrar
            </ButtonSecoundary>
          </Link>
        </div>

        {/* LADO DIREITO */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f7fa",
          }}
        >
          <Card
            style={{ width: 380 }}
            bordered={false}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              {/* aria-hidden para o ícone decorativo não poluir o leitor de tela */}
              <UserOutlined aria-hidden="true" style={{ fontSize: 48, color: "#1677ff" }} />
              <Title level={2} style={{ marginTop: 8 }}>
                Identificação
              </Title>
            </div>

            <Form layout="vertical" onFinish={onFinish} requiredMark="optional">
              <Form.Item
                label="Email"
                name="email"
                htmlFor="login-email"
                rules={[
                  { required: true, message: "Informe seu email" },
                  { type: "email", message: "Informe um email válido" }
                ]}
              >
                <Input
                  id="login-email"
                  prefix={<MailOutlined aria-hidden="true" />}
                  placeholder="email@exemplo.com"
                  autoComplete="username email"
                  aria-required="true"
                  aria-label="Endereço de e-mail"
                />
              </Form.Item>

              <Form.Item
                label="Senha"
                name="password"
                htmlFor="login-password"
                rules={[{ required: true, message: "Informe sua senha" }]}
              >
                <Input.Password
                  id="login-password"
                  prefix={<LockOutlined aria-hidden="true" />}
                  placeholder="********"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-label="Senha de acesso"
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Checkbox id="remember-me" aria-label="Manter conectado neste dispositivo">
                  Manter conectado
                </Checkbox>
                {/* Atributo 'to' definido para evitar link âncora inválido */}
                <Link to="/recuperar-senha" aria-label="Recuperar senha de acesso">
                  Esqueci a senha
                </Link>
              </div>

              <ButtonSubmit block aria-label="Entrar no sistema">
                Entrar
              </ButtonSubmit>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};