import { ButtonDeleteStyled } from "./styles";

export default function ButtonDelete({ children, click }) {
  return <ButtonDeleteStyled color="danger" variant="solid" htmlType="button" onClick={click}>{children}</ButtonDeleteStyled>;
}