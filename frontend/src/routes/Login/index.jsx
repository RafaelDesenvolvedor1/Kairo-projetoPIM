import React from "react";
import { Layout, Card, Form, Input, Button, Checkbox, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecoundary from "../../components/ButtonSecoundary";

const { Content } = Layout;
const { Title, Text } = Typography;
import { Link } from "react-router";

export default () => {
  const onFinish = (values) => {
    console.log("Login:", values);
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

          <Text style={{ color: "#e6f4ff", marginBottom: 32 }}>
            Acesse sua conta para continuar
          </Text>

          <Link to='/cadastro'>
            <ButtonSecoundary >
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
              <UserOutlined style={{ fontSize: 48, color: "#1677ff" }} />
              <Title level={4} style={{ marginTop: 8 }}>
                Username
              </Title>
            </div>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Informe seu email" }]}
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Checkbox>Manter conectado</Checkbox>
                <Link>Esqueci a senha</Link>
              </div>

              <ButtonPrimary block>
                Entrar
              </ButtonPrimary>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
