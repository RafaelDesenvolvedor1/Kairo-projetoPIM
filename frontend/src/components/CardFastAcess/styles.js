import styled from "styled-components";
import { Card } from "antd";

export const Container = styled(Card)`
    width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.75);
    transition: box-shadow 0.3s ease-in-out;
    padding: 1em;
    margin: 1em 0;

    P {
        font-size: 1.5em;
    }

    &:hover {
        box-shadow: 12px 12px 7px 0px rgba(0, 0, 0, 0.75);
    }
`;