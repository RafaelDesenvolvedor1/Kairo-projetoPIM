import styled from 'styled-components';

export const AgendaContainer = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
`;

export const AppointmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s;

  &:hover {
    background: #fafafa;
  }
`;

export const DateBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-right: 24px;

  .day {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    color: #262626;
  }

  .month-year {
    font-size: 12px;
    text-transform: uppercase;
    color: #8c8c8c;
    margin-top: 4px;
  }
`;

export const AppointmentInfo = styled.div`
  flex: 1;

  .time-row {
    margin-bottom: 4px;
  }

  .patient-name {
    font-size: 18px;
    font-weight: 500;
    color: #262626;
  }
`;