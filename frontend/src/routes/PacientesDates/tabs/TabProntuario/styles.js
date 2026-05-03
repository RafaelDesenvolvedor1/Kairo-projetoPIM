import styled from 'styled-components';

export const ProntuarioContainer = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 24px;
`;

export const HeaderEditor = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const EditorWrapper = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  /* Barra de ferramentas cinza estilo robusto */
  .toolbar {
    background: #f5f5f5;
    padding: 8px 12px;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Área de digitação do Tiptap */
  .ProseMirror {
    min-height: ${props => props.isFullScreen ? '60vh' : '250px'};
    padding: 20px;
    outline: none;
    font-size: 15px;
    line-height: 1.6;
    color: #262626;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #adb5bd;
      pointer-events: none;
      height: 0;
    }
  }
`;