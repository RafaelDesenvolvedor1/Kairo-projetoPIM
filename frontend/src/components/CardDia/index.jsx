import React from 'react';
import { PlusCircleFilled } from '@ant-design/icons';
import { CardDiaStyle, NomeDia, AddIconWrapper } from './styles';

export default function CardDia({ dia, onAdd, ...props }) {
  return (
    <CardDiaStyle {...props}>
      <NomeDia>{dia}</NomeDia>
      <AddIconWrapper onClick={() => onAdd(dia)}>
        <PlusCircleFilled />
      </AddIconWrapper>
    </CardDiaStyle>
  );
}