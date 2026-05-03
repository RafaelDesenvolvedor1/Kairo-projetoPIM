import styled from 'styled-components';

export const FinanceiroContainer = styled.div`
  padding: 20px;
  background: #fff;
`;

export const MonthSection = styled.div`
  margin-bottom: 24px;
  
  .month-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #262626;
  }
`;

export const TransactionItem = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 150px 150px 100px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: ${props => props.isSelected ? '#e6f7ff' : 'transparent'};
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: #fafafa;
  }

  .status-tag {
    text-align: center;
  }

  .amount {
    font-weight: 500;
    text-align: right;
  }
`;

export const ActionBanner = styled.div`
  background: #fff;
  padding: 12px 24px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;