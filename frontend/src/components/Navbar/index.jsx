import { LineChartOutlined, UserOutlined, HomeOutlined, CalendarOutlined} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router";
import Logo from "../Logo";
const { Sider } = Layout;

export default function Navbar({ collapsed }) {
  const location = useLocation();
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Logo />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={[
          {
            key: "/",
            icon: <HomeOutlined />,
            label: <Link to="/">Home</Link>,
          },
          {
            key: "/pacientes",
            icon: <UserOutlined />,
            label: <Link to="/pacientes">Pacientes</Link>,
          },
          {
            key: "/financeiro",
            icon: <LineChartOutlined />,
            label: <Link to="/financeiro">Financeiro</Link>,
          },
          {
            key: "/agendamentos",
            icon: <CalendarOutlined />,
            label: <Link to="/agendamentos">Agendamento</Link>,
          },
        ]}
      />
    </Sider>
  );
}
