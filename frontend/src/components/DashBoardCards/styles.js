import styled from 'styled-components';

export const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 10px 10px 10px 0px rgba(0, 0, 0, 0.34);

`;

export const Label = styled.span`
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 8px;
`;

export const Value = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #001529;
`;

export const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #2e3192;
`;