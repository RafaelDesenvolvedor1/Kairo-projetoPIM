import styled from 'styled-components';

export const CardStyle = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-left: 5px solid ${props => props.ativo ? '#52c41a' : '#bfbfbf'};
  border-radius: 15px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const TextoPrimario = styled.span`
  color: #2e3192; 
  font-weight: 600;
  font-size: 16px;
`;

export const TextoSecundario = styled.span`
  color: #8c8c8c;
  font-size: 14px;
`;

export const TextoDestaque = styled.span`
  color: #52c41a; 
  font-weight: 700;
  font-size: 12px;
`;