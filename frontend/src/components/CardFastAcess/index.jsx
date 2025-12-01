import { Space } from "antd";
import { Container } from "./styles";

export default function CardFastAcess({ title, children }) {
  return (
    <Container>
      <Space direction="vertical" align="center"  >
        {children}
        <p>{title}</p>
      </Space>
    </Container>
  );
}
