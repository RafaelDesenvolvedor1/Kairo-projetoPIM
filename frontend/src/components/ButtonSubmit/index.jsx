import { ButtonSubmitStyled } from "./styles";

export default function ButtonSubmit({ children}) {
  return <ButtonSubmitStyled type="primary" htmlType="submit">{children}</ButtonSubmitStyled>;
}