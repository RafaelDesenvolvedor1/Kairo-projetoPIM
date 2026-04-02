import { 
  LineChartOutlined, 
  UserOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined, 
  AppstoreOutlined,
  SettingOutlined,
  ClockCircleOutlined // Ícone sugerido para Horários
} from "@ant-design/icons";
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
        // Abre o submenu automaticamente se estiver em uma das rotas de configuração
        defaultOpenKeys={['sub-agendamento']}
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
            key: "/agendamentos", // Esta é a sua tela de consultas/agenda [cite: 27]
            icon: <CalendarOutlined />,
            label: <Link to="/agendamentos">Agenda</Link>,
          },
          {
            key: "/financeiro",
            icon: <LineChartOutlined />,
            label: <Link to="/financeiro">Financeiro</Link>,
          },
          // Grupo de Configurações (Baseado no Corpora)
          {
            key: "sub-agendamento",
            icon: <SettingOutlined />, 
            label: "Site de Agendamento",
            children: [
              {
                key: "/locais",
                icon: <EnvironmentOutlined />,
                label: <Link to="/locais">Locais de Atendimento</Link>,
              },
              {
                key: "/servicos",
                icon: <AppstoreOutlined />,
                label: <Link to="/servicos">Serviços</Link>,  
              },
              {
                key: "/horarios", // Esta será a tela da Página 11 do seu PDF [cite: 105]
                icon: <ClockCircleOutlined />,
                label: <Link to="/horarios">Horário de Atendimento</Link>,
              },
            ],
          },
        ]}
      />
    </Sider>
  );
}