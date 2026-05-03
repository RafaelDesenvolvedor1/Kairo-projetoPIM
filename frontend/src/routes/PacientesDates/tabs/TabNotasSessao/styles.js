import styled from 'styled-components';

export const SessionContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  height: 100%;
  padding: 10px;
`;

export const TimelineSidebar = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;

  .ant-typography {
    margin-bottom: 16px;
    font-weight: 600;
  }
`;

export const ContentArea = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

export const SessionHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
`;

export const AnnotationCard = styled.div`
  margin: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;

  .card-header {
    background: #fff;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-body {
    padding: 20px;
    min-height: 300px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-footer {
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;