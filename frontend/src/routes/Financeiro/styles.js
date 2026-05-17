import styled from "styled-components";
import { Space, Form } from "antd";

export const ContainerHorizontal = styled(Space)`
    width: 100%;
    justify-content: end;
`;

export const Container = styled(Space)`
    padding: 2em;
    width: 100%;
    min-height: 60vh;
    justify-content: center;
`;

export const FormStyled = styled(Form)`
    /* width: 100%; */
`;

// ========== PACIENTES VIEW ==========
export const PacientesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 16px 0;
`;

export const PacienteCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: ${props => props.clickable ? "pointer" : "default"};

  &:hover {
    ${props => props.clickable && "box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); transform: translateY(-2px);"}
  }

  .header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: flex-start;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      flex-shrink: 0;
    }

    .info {
      flex: 1;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #222;
      }

      .email {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: #999;
      }
    }
  }

  .valores {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;

    .valor-box {
      padding: 12px;
      border-radius: 8px;
      text-align: center;

      .label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .amount {
        display: block;
        font-size: 14px;
        font-weight: 700;
      }

      &.receita {
        background-color: #f6ffed;
        color: #52c41a;
      }

      &.despesa {
        background-color: #fff1f0;
        color: #ff4d4f;
      }
    }
  }

  .rodape {
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    font-size: 12px;
    color: #999;
  }
`;

// ========== GRID VIEW ==========
export const LancamentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 16px 0;
`;

export const LancamentoCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  border-left: 4px solid ${props => props.tipo === "RECEITA" ? "#52c41a" : "#ff4d4f"};

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;

    .tipo-tag {
      flex: 1;
    }

    .acoes {
      display: flex;
      gap: 12px;
      font-size: 16px;

      svg {
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }

  .content {
    padding: 16px;
    flex: 1;

    .categoria {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #222;
    }

    .descricao {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .paciente {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #999;

      strong {
        color: #222;
      }
    }

    .data {
      font-size: 12px;
      color: #999;
    }
  }

  .footer {
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .valor {
      .label {
        display: block;
        font-size: 11px;
        color: #999;
        margin-bottom: 2px;
      }

      .amount {
        display: block;
        font-size: 16px;
        font-weight: 700;

        &.receita {
          color: #52c41a;
        }

        &.despesa {
          color: #ff4d4f;
        }
      }
    }
  }

  .parcelas-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }
`;