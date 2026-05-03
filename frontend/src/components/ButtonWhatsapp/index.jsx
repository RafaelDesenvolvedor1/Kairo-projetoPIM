import { ButtonWhatsappStyled } from "./styles";
import { FaWhatsapp } from "react-icons/fa";

export default function ButtonWhatsapp({children}) {
    return <ButtonWhatsappStyled type="primary" icon={<FaWhatsapp size={20}/>}>{children}</ButtonWhatsappStyled>;
}