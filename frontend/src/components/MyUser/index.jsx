import { Space } from "antd";
import { UserAvatar, Username } from "./styles";

import { FaUser } from "react-icons/fa";


export function MyUser() {
  return (
    <Space direction="horizontal" size="middle">
      <Space wrap size={16}>
        <UserAvatar size={50} icon={<FaUser />} />
        <Username>Username</Username>
      </Space>
    </Space>
  );
}
