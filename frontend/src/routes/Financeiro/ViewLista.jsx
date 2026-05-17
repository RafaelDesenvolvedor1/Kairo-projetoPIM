import { Empty, Spin, Table, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ViewLista({ 
  lancamentos, 
  loading,
  onEditar,
  onDeletar 
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
      width: "8%",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <EditOutlined
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => onEditar(record)}
            title="Editar"
          />
          <DeleteOutlined
            style={{ cursor: "pointer", color: "#ff4d4f" }}
            onClick={() => onDeletar(record.id_lancamento)}
            title="Deletar"
          />
        </div>
      ),
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
