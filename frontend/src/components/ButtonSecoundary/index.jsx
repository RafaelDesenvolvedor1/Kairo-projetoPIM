import { ButtonSecoundaryStyle } from "./styles";

export default function ButtonSecoundary({ children, ...props }) {
    return (
        <ButtonSecoundaryStyle {...props}>
            {children}
        </ButtonSecoundaryStyle>
    );
}