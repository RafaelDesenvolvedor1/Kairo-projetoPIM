import { Empty, Spin, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { LancamentoGrid, LancamentoCard } from "./styles";

export default function ViewGrid({ 
  lancamentos, 
  loading,
  onEditar,
  onDeletar 
}) {
  if (loading) {
    return <Spin style={{ display: "flex", justifyContent: "center", padding: "48px" }} />;
  }

  if (lancamentos.length === 0) {
    return <Empty description="Nenhum lançamento encontrado" />;
  }

  return (
    <LancamentoGrid>
      {lancamentos.map((lancamento, idx) => (
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
              <EditOutlined
                onClick={() => onEditar(lancamento)}
                title="Editar"
              />
              <DeleteOutlined
                onClick={() => onDeletar(lancamento.id_lancamento)}
                title="Deletar"
              />
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
            <div className="status">
              <Tag color={lancamento.status === "Pendente" ? "orange" : "green"}>
                {lancamento.status}
              </Tag>
            </div>
          </div>

          {lancamento.parcelas && lancamento.parcelas.length > 0 && (
            <div className="parcelas-badge">
              {lancamento.parcelas.length}x
            </div>
          )}
        </LancamentoCard>
      ))}
    </LancamentoGrid>
  );
}
