import styled from 'styled-components';

export const CardStyle = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-left: 5px solid ${props => props.ativo ? '#52c41a' : '#bfbfbf'};
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

export const IconWrapper = styled.div`
  font-size: 24px;
  color: #2e3192;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
`;