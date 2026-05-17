import styled from "styled-components";

export const CardPeriodoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin-bottom: 24px;

  .ant-btn {
    color: white;

    &:hover {
      color: #f0f0f0;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .ant-select {
    .ant-select-selector {
      background-color: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }

    .ant-select-arrow {
      color: white;
    }
  }

  span {
    color: white;
  }
`;
