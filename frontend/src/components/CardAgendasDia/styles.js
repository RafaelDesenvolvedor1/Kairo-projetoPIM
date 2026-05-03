import styled from 'styled-components';

export const Container = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 450px;
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.75);
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const LinkText = styled.span`
  color: #a020f0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export const AgendamentoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

export const PacienteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8c8c8c;
  font-size: 16px;
`;

export const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  text-align: center;
  gap: 4px;
`;