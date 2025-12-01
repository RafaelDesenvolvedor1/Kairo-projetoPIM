import React, { useState } from "react";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import { Button, Layout, theme } from "antd";
import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import { Container } from "./components/MyContainer/styles";
import MyHeader from "./components/MyHeader";
import MySearchInput from "./components/MySearchInput";
import { MyUser } from "./components/MyUser";
import { PacienteProvider } from "./context/PacienteContext";
import { MessageProvider } from "./context/MessageProvider";
const { Content } = Layout;
const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Container>
      <Navbar collapsed={collapsed} />
      <Layout>
        <MyHeader>
          <Button
            type="text"
            icon={collapsed ? <CaretRightOutlined /> : <CaretLeftOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "#fff",
            }}
          />
          <MySearchInput />
          <MyUser />
        </MyHeader>
        <MessageProvider>
        <PacienteProvider>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </PacienteProvider>
      </MessageProvider>
      </Layout>
    </Container>
  );
};
export default App;
