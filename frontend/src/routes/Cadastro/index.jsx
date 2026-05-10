import React from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import ButtonSecoundary from "../../components/ButtonSecoundary";
import { Link, useNavigate } from "react-router";
import ButtonSubmit from "../../components/ButtonSubmit";
import authService from "../../services/authService";
import { useMessage } from "../../context/MessageProvider";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const messageApi = useMessage();

  const onFinish = async (values) => {
    try {
      if (values.password !== values['confirm-password']) {
        messageApi.error('As senhas não coincidem');
        return;
      }

      const result = await authService.register(values.name, values.email, values.password);
      if (result && result.success) {
        messageApi.success('Cadastro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
      } else if (result && result.message) {
        messageApi.error(result.message);
      } else {
        messageApi.error('Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      messageApi.error('Erro inesperado ao realizar cadastro');
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
          <Title style={{ color: "#fff", marginBottom: 16 }}>
            Bem-vindo de volta!
          </Title>

          <Text style={{ color: "#f5f5f5", marginBottom: 32 }}>
            Já possui uma conta? Faça login para continuar
          </Text>

          <Link to='/login'>
            <ButtonSecoundary>
              Já tenho conta
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
              <Title level={4}>Criar Conta</Title>
            </div>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: "Informe seu nome" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Seu nome completo"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Informe seu email" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="email@exemplo.com"
                />
              </Form.Item>

              <Form.Item
                label="Senha"
                name="password"
                rules={[{ required: true, message: "Informe sua senha" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="********"
                />
              </Form.Item>
              <Form.Item
                label="Confirmar senha"
                name="confirm-password"
                rules={[{ required: true, message: "Confirme a senha" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="********"
                />
              </Form.Item>

              <ButtonSubmit block>
                Cadastrar
              </ButtonSubmit>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
