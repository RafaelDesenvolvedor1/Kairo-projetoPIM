import { Empty, Spin, Tag } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, DollarOutlined, MessageOutlined, UndoOutlined, CloudUploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { LancamentoGrid, LancamentoCard } from "./styles";

export default function ViewGrid({ 
  lancamentos, 
  loading,
  onEditar,
  onDeletar,
  onAtualizarStatus,
  onReverterStatus,
  onAnexarComprovante
}) {
  if (loading) {
    return <Spin style={{ display: "flex", justifyContent: "center", padding: "48px" }} />;
  }

  if (lancamentos.length === 0) {
    return <Empty description="Nenhum lançamento encontrado" />;
  }

  return (
    <LancamentoGrid>
      {lancamentos.map((lancamento, idx) => {
        const canEdit = lancamento.status !== "Pago";
        return (
          <LancamentoCard 
            key={idx}
            tipo={lancamento.tipo}
          >
          <div className="header">
            <div className="tipo-tag">
              <Tag color={lancamento.tipo === "RECEITA" ? "green" : "red"}>
                {lancamento.tipo}
              </Tag>
            </div>
            <div className="acoes">
              {canEdit && (
                <EditOutlined
                  onClick={() => onEditar(lancamento)}
                  title="Editar"
                />
              )}
              <DeleteOutlined
                onClick={() => onDeletar(lancamento.id_lancamento)}
                title="Deletar"
              />
              {(lancamento.tipo === "RECEITA" || lancamento.tipo === "DESPESA") && (
                <>
                  <input
                    type="file"
                    id={`upload-${lancamento.id_lancamento}`}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f && typeof onAnexarComprovante === 'function') {
                        onAnexarComprovante(lancamento.id_lancamento, f);
                        e.target.value = null;
                      }
                    }}
                  />
                  <CloudUploadOutlined
                    style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 8 }}
                    onClick={() => document.getElementById(`upload-${lancamento.id_lancamento}`).click()}
                    title="Anexar comprovante"
                  />
                </>
              )}
            </div>
          </div>

          <div className="content">
            <h4 className="categoria">{lancamento.categoria}</h4>
            {lancamento.descricao && (
              <p className="descricao">{lancamento.descricao}</p>
            )}

            {(
              lancamento.paciente?.nomePaciente ||
              lancamento.Paciente?.nomePaciente ||
              lancamento.pacientes?.nomePaciente ||
              lancamento.paciente_nome
            ) && (
              <p className="paciente">
                <strong>Paciente:</strong>{" "}
                {
                  lancamento.paciente?.nomePaciente ||
                  lancamento.Paciente?.nomePaciente ||
                  lancamento.pacientes?.nomePaciente ||
                  lancamento.paciente_nome
                }
              </p>
            )}

            <div className="data">
              <small>{dayjs(lancamento.data_lancamento).format("DD/MM/YYYY")}</small>
            </div>
          </div>

          <div className="footer">
            <div className="valor">
              <span className="label">Valor</span>
              <span className={`amount ${lancamento.tipo.toLowerCase()}`}>
                R$ {parseFloat(lancamento.valor).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="status" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag color={lancamento.status === "Pendente" ? "orange" : "green"}>
                {lancamento.status}
              </Tag>

              {lancamento.status === "Pendente" && lancamento.tipo === "DESPESA" && (
                <DollarOutlined
                  style={{ cursor: 'pointer', color: '#ff4d4f' }}
                  onClick={() => onAtualizarStatus && onAtualizarStatus(lancamento.id_lancamento)}
                  title="Pagar"
                />
              )}

              {lancamento.status === "Pendente" && lancamento.tipo === "RECEITA" && (
                <>
                  <CheckCircleOutlined
                    style={{ cursor: 'pointer', color: '#52c41a' }}
                    onClick={() => onAtualizarStatus && onAtualizarStatus(lancamento.id_lancamento)}
                    title="Marcar como Recebido"
                  />
                  <MessageOutlined
                    style={{ cursor: 'pointer', color: '#888' }}
                    onClick={() => console.log('Cobrança clicada', lancamento.id_lancamento)}
                    title="Cobrança"
                  />
                </>
              )}
              {lancamento.status === "Pago" && (
                <UndoOutlined
                  style={{ cursor: 'pointer', color: '#595959' }}
                  onClick={() => onReverterStatus && onReverterStatus(lancamento.id_lancamento)}
                  title="Desfazer ação"
                />
              )}
            </div>
          </div>

          {lancamento.parcelas && lancamento.parcelas.length > 0 && (
            <div className="parcelas-badge">
              {lancamento.parcelas.length}x
            </div>
          )}
        </LancamentoCard>
        );
      })}
    </LancamentoGrid>
  );
}
