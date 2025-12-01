import { MyInputSearchStyle } from "./styles";

export default function MySearchInput() {
  return (
    <MyInputSearchStyle
      placeholder="Pesquisar..."
      allowClear
      enterButton
      size="large"
      
    />
  );
}
