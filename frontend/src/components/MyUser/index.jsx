import { Space, Dropdown, Avatar } from "antd";
import { UserAvatar, Username } from "./styles";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import authService from "../../services/authService";
import { useMessage } from "../../context/MessageProvider";

export function MyUser() {
  const navigate = useNavigate();
  const messageApi = useMessage();
  const currentUser = authService.getCurrentUser();

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
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserAvatar size={50} icon={<FaUser />} />
            <Username>{currentUser?.nome || 'Usuário'}</Username>
          </div>
        </Dropdown>
      </Space>
    </Space>
  );
}
