import styled from 'styled-components';

export const CardDiaStyle = styled.div`
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 400px; /* Ajustado para seguir a largura do mockup */
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #a020f0;
    box-shadow: 0 2px 4px rgba(160, 32, 240, 0.1);
  }
`;

export const NomeDia = styled.span`
  color: #a020f0;
  font-weight: 600;
  font-size: 14px;
`;

export const AddIconWrapper = styled.div`
  color: #a020f0;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;