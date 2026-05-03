import { ButtonPrimaryStyle } from "./styles";

export default function ButtonPrimary({ children, ...props }) {
    return (
        <ButtonPrimaryStyle type="primary" {...props}>
            {children}
        </ButtonPrimaryStyle>
    );
}