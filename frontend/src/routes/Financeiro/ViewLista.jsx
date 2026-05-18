import { Empty, Spin, Table, Tag } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, DollarOutlined, MessageOutlined, UndoOutlined, CloudUploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ViewLista({ 
  lancamentos, 
  loading,
  onEditar,
  onDeletar,
  onAtualizarStatus,
  onReverterStatus,
  onAnexarComprovante
}) {
  const columns = [
    {
      title: "Data",
      dataIndex: "data_lancamento",
      key: "data_lancamento",
      width: "12%",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.data_lancamento) - new Date(b.data_lancamento),
    },
    {
      title: "Paciente",
      key: "paciente",
      width: "20%",
      render: (_, record) =>
        record.paciente?.nomePaciente ||
        record.Paciente?.nomePaciente ||
        record.pacientes?.nomePaciente ||
        record.paciente_nome ||
        "—",
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
      width: "22%",
      render: (descricao) => descricao || "—",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: "12%",
      render: (tipo) => (
        <Tag color={tipo === "RECEITA" ? "green" : "red"}>
          {tipo}
        </Tag>
      ),
    },
    {
      title: "Categoria",
      dataIndex: "categoria",
      key: "categoria",
      width: "18%",
      render: (cat) => <small>{cat}</small>,
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "valor",
      width: "12%",
      render: (valor, record) => (
        <span style={{ 
          color: record.tipo === "RECEITA" ? "#52c41a" : "#ff7875",
          fontWeight: 600
        }}>
          R$ {parseFloat(valor).toLocaleString("pt-BR", { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      ),
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => {
        const colors = {
          "Pendente": "orange",
          "Realizado": "green",
          "Cancelado": "red"
        };
        return <Tag color={colors[status] || "blue"}>{status}</Tag>;
      },
    },
    {
      title: "Ações",
      key: "acoes",
      width: "12%",
      fixed: "right",
      render: (_, record) => {
        const isPendente = record.status === "Pendente";
        const canEdit = record.status !== "Pago";
        return (
          <div style={{ display: "flex", gap: "8px", alignItems: 'center' }}>
            {record.tipo === "DESPESA" && isPendente && (
              <DollarOutlined
                style={{ cursor: "pointer", color: "#ff4d4f" }}
                onClick={() => onAtualizarStatus && onAtualizarStatus(record.id_lancamento)}
                title="Pagar"
              />
            )}

            {record.tipo === "RECEITA" && isPendente && (
              <>
                <CheckCircleOutlined
                  style={{ cursor: "pointer", color: "#52c41a" }}
                  onClick={() => onAtualizarStatus && onAtualizarStatus(record.id_lancamento)}
                  title="Marcar como Recebido"
                />
                <MessageOutlined
                  style={{ cursor: "pointer", color: "#888" }}
                  onClick={() => console.log("Cobrança clicada", record.id_lancamento)}
                  title="Cobrança"
                />
              </>
            )}
            {record.status === "Pago" && (
              <UndoOutlined
                style={{ cursor: "pointer", color: "#595959" }}
                onClick={() => onReverterStatus && onReverterStatus(record.id_lancamento)}
                title="Desfazer ação"
              />
            )}

            {(record.tipo === "RECEITA" || record.tipo === "DESPESA") && (
              <>
                <input
                  type="file"
                  id={`upload-${record.id_lancamento}`}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file && typeof onAnexarComprovante === 'function') {
                      onAnexarComprovante(record.id_lancamento, file);
                      e.target.value = null;
                    }
                  }}
                />
                <CloudUploadOutlined
                  style={{ cursor: 'pointer', color: '#1890ff' }}
                  onClick={() => document.getElementById(`upload-${record.id_lancamento}`).click()}
                  title="Anexar comprovante"
                />
              </>
            )}

            {canEdit && (
              <EditOutlined
                style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() => onEditar(record)}
                title="Editar"
              />
            )}
            <DeleteOutlined
              style={{ cursor: "pointer", color: "#ff4d4f" }}
              onClick={() => onDeletar(record.id_lancamento)}
              title="Deletar"
            />
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Spin style={{ display: "flex", justifyContent: "center", padding: "48px" }} />;
  }

  if (lancamentos.length === 0) {
    return <Empty description="Nenhum lançamento encontrado" />;
  }

  return (
    <Table
      columns={columns}
      dataSource={lancamentos.map((l, idx) => ({ ...l, key: idx }))}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 1200 }}
      size="small"
    />
  );
}
