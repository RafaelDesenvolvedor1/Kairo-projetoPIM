import { Space, Dropdown, Avatar } from "antd";
import { UserAvatar, Username } from "./styles";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import authService from "../../services/authService";
import { useMessage } from "../../context/MessageProvider";

export function MyUser() {
  const navigate = useNavigate();
  const messageApi = useMessage();

  const handleLogout = () => {
    authService.logout();
    messageApi.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const items = [
    {
      key: 'logout',
      icon: <FaSignOutAlt />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ];

  return (
    <Space direction="horizontal" size="middle">
      <Space wrap size={16}>
        <Dropdown menu={{ items }} trigger={['click']}>
          <div style={{ cursor: 'pointer' }}>
            <UserAvatar size={50} icon={<FaUser />} />
            <Username>Usuário</Username>
          </div>
        </Dropdown>
      </Space>
    </Space>
  );
}
