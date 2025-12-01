import { Button } from "antd";
import { EmptyStyle } from "./styles";
import ButtonPrimary from "../ButtonPrimary";
import { PlusOutlined } from "@ant-design/icons";

import { useState } from "react";

export default function EmptyComponent({ ...props }) {

  return (
    <>
    <EmptyStyle {...props}>
      <ButtonPrimary onClick={props.showDrawer} icon={<PlusOutlined />}>{props.btnText}</ButtonPrimary>
    </EmptyStyle>

    </>
  );
}
