import { Flex, Form, Space, Segmented, message } from "antd";
import { useState, useEffect } from "react";
import { useMessage } from "../../context/MessageProvider";
import { Container, ContainerHorizontal } from "./styles";
import ButtonSecoundary from "../../components/ButtonSecoundary";
import EmptyComponent from "../../components/EmptyComponent";
import MyDrawer from "../../components/MyDrawer";
import CardFinancas from "../../components/CardFinancas";
import FormNovoLancamento from "../../components/FormNovoLancamento";
import CardPeriodo from "../../components/CardPeriodo";
import ViewPacientes from "./ViewPacientes";
import ViewLista from "./ViewLista";
import ViewGrid from "./ViewGrid";

// icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  FallOutlined,
  FilterFilled,
  UserAddOutlined,
} from "@ant-design/icons";

import financeirosService from "../../services/financeirosService";
import dayjs from "dayjs";

export default function Financeiro() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("lista"); // "pacientes", "lista", "grid"
  const messageApi = useMessage();

  // Estado do período
  const [periodo, setPeriodo] = useState(dayjs().format("YYYY-MM"));

  // Dados
  const [lancamentos, setLancamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consolidado, setConsolidado] = useState({
    despesasAPagar: 0,
    receitasPrevistas: 0,
    receitasRealizadas: 0,
    despesasRealizadas: 0,
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarPacientes();
    carregarLancamentos();
    carregarConsolidado();
  }, []);

  // Recarregar lançamentos quando período muda
  useEffect(() => {
    carregarLancamentos();
    carregarConsolidado();
  }, [periodo]);

  const carregarPacientes = async () => {
    const resultado = await financeirosService.getPacientes();
    if (resultado.success) {
      setPacientes(resultado.data);
    } else {
      messageApi.error(resultado.message);
    }
  };

  const carregarLancamentos = async () => {
    setLoading(true);
    const resultado = await financeirosService.getLancamentos(periodo);
    if (resultado.success) {
      setLancamentos(resultado.data);
    } else {
      messageApi.error(resultado.message);
    }
    setLoading(false);
  };

  const carregarConsolidado = async () => {
    const resultado = await financeirosService.getConsolidado(periodo);
    if (resultado.success) {
      setConsolidado(resultado.data);
    } else {
      messageApi.error(resultado.message);
    }
  };

  const handleNovoLancamento = async (valores) => {
    setLoading(true);
    const resultado = await financeirosService.createLancamento(valores);
    if (resultado.success) {
      messageApi.success("Lançamento criado com sucesso!");
      form.resetFields();
      setOpen(false);
      carregarLancamentos();
      carregarConsolidado();
    } else {
      messageApi.error(resultado.message);
    }
    setLoading(false);
  };

  const handleDeletarLancamento = async (id) => {
    if (confirm("Tem certeza que deseja deletar este lançamento?")) {
      const resultado = await financeirosService.deleteLancamento(id);
      if (resultado.success) {
        messageApi.success("Lançamento deletado com sucesso!");
        carregarLancamentos();
        carregarConsolidado();
      } else {
        messageApi.error(resultado.message);
      }
    }
  };

  const handleEditarLancamento = (lancamento) => {
    console.log("Editar:", lancamento);
    messageApi.info("Edição ainda não implementada");
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <Space direction="vertical" style={{ width: "100%", padding: "0 20px" }}>
      {/* Cards de Consolidação */}
      <Space
        direction="horizontal"
        style={{ width: "100%", overflowX: "auto" }}
      >
        <CardFinancas
          color="#D35050"
          title="Despesas"
          desc="Valor á pagar"
          valor={consolidado.despesasAPagar?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<FallOutlined />}
        />
        <CardFinancas
          color="#62AA85"
          title="Receitas"
          desc="Previstas"
          valor={consolidado.receitasPrevistas?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<ClockCircleOutlined />}
        />
        <CardFinancas
          color="#62AA85"
          title="Receitas"
          desc="Realizadas"
          valor={consolidado.receitasRealizadas?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<DollarOutlined />}
        />
        <CardFinancas
          color="#62AA85"
          title="Despesas"
          desc="Realizadas"
          valor={consolidado.despesasRealizadas?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={<CheckCircleOutlined />}
        />
      </Space>

      {/* Seletor de Período */}
      <CardPeriodo periodo={periodo} onPeriodoChange={setPeriodo} />

      {/* Controles Superiores */}
      <Space direction="horizontal" style={{ width: "100%", justifyContent: "space-between" }}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { label: "Pacientes", value: "pacientes" },
            { label: "Lista", value: "lista" },
            { label: "Grid", value: "grid" },
          ]}
        />
        <Space>
          <ButtonSecoundary icon={<FilterFilled />}>Filtro</ButtonSecoundary>
          <ButtonSecoundary icon={<DownloadOutlined />}>
            Baixar CSV
          </ButtonSecoundary>
          <ButtonSecoundary icon={<UserAddOutlined />} onClick={showDrawer}>
            Novo lançamento
          </ButtonSecoundary>
        </Space>
      </Space>

      {/* Views */}
      {lancamentos.length === 0 && !loading ? (
        <Container>
          <EmptyComponent
            description="Você ainda não criou nenhum lançamento"
            btnText="Novo lançamento"
            open={open}
            onClose={onClose}
            showDrawer={showDrawer}
          />
        </Container>
      ) : (
        <>
          {view === "pacientes" && (
            <ViewPacientes
              lancamentos={lancamentos}
              pacientes={pacientes}
              loading={loading}
              onPacienteClick={(id) => setView("lista")}
            />
          )}

          {view === "lista" && (
            <ViewLista
              lancamentos={lancamentos}
              loading={loading}
              onEditar={handleEditarLancamento}
              onDeletar={handleDeletarLancamento}
            />
          )}

          {view === "grid" && (
            <ViewGrid
              lancamentos={lancamentos}
              loading={loading}
              onEditar={handleEditarLancamento}
              onDeletar={handleDeletarLancamento}
            />
          )}
        </>
      )}

      {/* Drawer Novo Lançamento */}
      <MyDrawer
        open={open}
        onClose={onClose}
        title="Novo Lançamento"
        width={600}
      >
        <FormNovoLancamento
          form={form}
          onSubmit={handleNovoLancamento}
          loading={loading}
          pacientes={pacientes}
          onCancel={onClose}
        />
      </MyDrawer>
    </Space>
  );
}