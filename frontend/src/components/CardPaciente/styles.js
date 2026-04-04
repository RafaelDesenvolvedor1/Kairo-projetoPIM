import styled from "styled-components";
import { Card, Button } from "antd";


export const CardStyle = styled(Card)`
    width: ${props => props.grid ? '350px' : '100%'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
`;

