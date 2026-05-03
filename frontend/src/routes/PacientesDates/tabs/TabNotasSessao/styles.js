import styled from 'styled-components';

export const SessionContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => props.hideSidebar ? '0px 1fr' : '280px 1fr'};
  gap: ${props => props.hideSidebar ? '0px' : '20px'};
  height: 100%;
  padding: 10px;
  transition: all 0.3s ease;
`;

export const TimelineSidebar = styled.div`
  background: #fff;
  border: ${props => props.hideSidebar ? 'none' : '1px solid #f0f0f0'};
  border-radius: 8px;
  padding: ${props => props.hideSidebar ? '0px' : '20px'};
  overflow: hidden;
  height: fit-content;
  opacity: ${props => props.hideSidebar ? 0 : 1};
  transition: all 0.3s ease;
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
  overflow: hidden;

  .ant-collapse {
    background: transparent;
    border: none;
  }

  .ant-collapse-header {
    align-items: center !important;
    padding: 12px 20px !important;
  }

  .card-footer {
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;