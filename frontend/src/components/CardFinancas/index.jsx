import {  Flex, Avatar, Descriptions, Form, Input } from "antd";
import { CardStyle } from "./styles";
import { UserOutlined } from "@ant-design/icons";
import { useState} from "react";




export default ({
  color,
  title,
  desc,
  valor,
  icon
}) => {
  // Preciso de states para atualizar os cards
  return (
      <CardStyle color={color} title={title} description={desc} valor={valor} headStyle={{color: '#f5f5f5', background: color}}>
        <Flex>
          <div>
            <Avatar size={64} icon={icon} style={{background: color}}  />
          </div>
          <Descriptions column={1} style={{ marginLeft: 20, display:'flex', alignItems: 'center' }} >
            <Descriptions.Item 
              label={desc} 
              labelStyle={{fontSize: '1.2em', fontWeight:700, color:color}}
              contentStyle={{fontWeight: 'bold', fontSize:'1.3em', color: color}}
            >
              R$ {valor}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </CardStyle>
  );
}
