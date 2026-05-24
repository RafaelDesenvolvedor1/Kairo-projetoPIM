import { Form, Input, Select, Radio, InputNumber, DatePicker, Space, Segmented, Button, Spin, Dropdown, Menu } from "antd";
import { useState, useEffect } from "react";
import { useMessage } from "../../context/MessageProvider";
import { Container, ContainerHorizontal, FormStyled } from "./styles";
import ButtonSecoundary from "../../components/ButtonSecoundary";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSubmit from "../../components/ButtonSubmit";
import EmptyComponent from "../../components/EmptyComponent";
import MyDrawer from "../../components/MyDrawer";
import CardFinancas from "../../components/CardFinancas";
import CardPeriodo from "../../components/CardPeriodo";
import ViewPacientes from "./ViewPacientes";
import ViewLista from "./ViewLista";
import ViewGrid from "./ViewGrid";

// icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  DownloadOutlined,
  FallOutlined,
  FilterFilled,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import financeirosService from "../../services/financeirosService";
import authService from "../../services/authService";
import dayjs from "dayjs";

export default function Financeiro() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("lista"); // "pacientes", "lista", "grid"
  const messageApi = useMessage();
  const currentUser = authService.getCurrentUser();

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

  const [tipo, setTipo] = useState("RECEITA");
  const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("À vista");
  const [prestacoes, setPrestacoes] = useState([
    { data_vencimento: null, valor_parcela: 0 },
  ]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [editingLancamentoId, setEditingLancamentoId] = useState(null);

  const categoriasMap = {
    RECEITA: ["Receita atendimento", "Receita produto", "Receita outros"],
    DESPESA: ["Despesa Fixa", "Despesa em prestação"],
  };

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

  useEffect(() => {
    if (pacientes.length && lancamentos.length) {
      setLancamentos((prev) => enrichLancamentos(prev));
    }
  }, [pacientes]);

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
      setLancamentos(enrichLancamentos(resultado.data));
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

  const enrichLancamentos = (items) => {
    return items.map((item) => ({
      ...item,
      paciente:
        item.paciente ||
        pacientes.find((p) => p.id === item.id_paciente) ||
        item.paciente,
    }));
  };

  const resetFinanceiroForm = (keepTipo = false) => {
    setEditingLancamentoId(null);
    if (!keepTipo) setTipo("RECEITA");
    setCategoria("");
    setFormaPagamento("À vista");
    setPrestacoes([{ data_vencimento: null, valor_parcela: 0 }]);
    form.resetFields();
  };

  const handleNovoLancamento = async (valores) => {
    setLoading(true);
    const resultado = await financeirosService.createLancamento(valores);
    if (resultado.success) {
      messageApi.success("Lançamento criado com sucesso!");
      form.resetFields();
      setTipo("RECEITA");
      setCategoria("");
      setFormaPagamento("À vista");
      setPrestacoes([{ data_vencimento: null, valor_parcela: 0 }]);
      setOpen(false);
      carregarLancamentos();
      carregarConsolidado();
    } else {
      messageApi.error(resultado.message);
    }
    setLoading(false);
  };

  const mostraFormaPagamento =
    tipo === "RECEITA" || (tipo === "DESPESA" && categoria === "Despesa em prestação");
  const isParcelado = formaPagamento === "Parcelado" && mostraFormaPagamento;

  useEffect(() => {
    setCategoria("");
    setFormaPagamento("À vista");
    setPrestacoes([{ data_vencimento: null, valor_parcela: 0 }]);
    form.setFieldsValue({
      categoria: undefined,
      forma_pagamento: "À vista",
      valor: undefined,
      data_lancamento: undefined,
    });
  }, [tipo, form]);

  useEffect(() => {
    if (categoria === "Despesa Fixa") {
      setFormaPagamento("À vista");
      form.setFieldsValue({ forma_pagamento: "À vista" });
    }
  }, [categoria, form]);

  const adicionarPrestacao = () => {
    const ultimaPrestacao = prestacoes[prestacoes.length - 1];
    const novaData = ultimaPrestacao?.data_vencimento
      ? dayjs(ultimaPrestacao.data_vencimento).add(1, "month")
      : dayjs();
    setPrestacoes([
      ...prestacoes,
      { data_vencimento: novaData, valor_parcela: 0 },
    ]);
  };

  const removerPrestacao = (index) => {
    if (prestacoes.length > 1) {
      setPrestacoes(prestacoes.filter((_, i) => i !== index));
    }
  };

  const atualizarPrestacao = (index, campo, valor) => {
    const novasPrestacoes = [...prestacoes];
    novasPrestacoes[index][campo] = valor;
    setPrestacoes(novasPrestacoes);
  };

  const handleFinishFinanceiro = async (values) => {
    let payload = {
      ...values,
      tipo,
      categoria,
      forma_pagamento: isParcelado ? "Parcelado" : "À vista",
      quantidade_parcelas: isParcelado ? prestacoes.length : 1,
      data_lancamento: values.data_lancamento
        ? values.data_lancamento.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
    };

    if (isParcelado) {
      const todasPreenchidas = prestacoes.every(
        (p) => p.data_vencimento && p.valor_parcela > 0
      );
      if (!todasPreenchidas) {
        messageApi.error("Por favor, preencha todas as prestações com data e valor");
        return;
      }

      const valorTotal = prestacoes.reduce(
        (acc, p) => acc + parseFloat(p.valor_parcela || 0),
        0
      );

      payload = {
        ...payload,
        valor: valorTotal,
        data_lancamento: prestacoes[0].data_vencimento.format("YYYY-MM-DD"),
        prestacoes: prestacoes.map((p, idx) => ({
          numero_parcela: idx + 1,
          data_vencimento: p.data_vencimento.format("YYYY-MM-DD"),
          valor_parcela: parseFloat(p.valor_parcela),
        })),
      };
    }

    setLoading(true);

    if (editingLancamentoId) {
      const resultado = await financeirosService.updateLancamento(editingLancamentoId, payload);
      if (resultado.success) {
        messageApi.success("Lançamento actualizado com sucesso!");
      } else {
        messageApi.error(resultado.message || "Erro ao atualizar lançamento");
        setLoading(false);
        return;
      }
    } else {
      const resultado = await financeirosService.createLancamento(payload);
      if (resultado.success) {
        messageApi.success("Lançamento criado com sucesso!");
      } else {
        messageApi.error(resultado.message);
        setLoading(false);
        return;
      }
    }

    form.resetFields();
    resetFinanceiroForm();
    setOpen(false);
    await carregarLancamentos();
    await carregarConsolidado();
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
    if (lancamento.status === "Pago") {
      messageApi.warning("Não é possível editar um lançamento já pago.");
      return;
    }

    setEditingLancamentoId(lancamento.id_lancamento);
    setTipo(lancamento.tipo || "RECEITA");
    setCategoria(lancamento.categoria || "");
    setFormaPagamento(lancamento.forma_pagamento || "À vista");

    if (lancamento.prestacoes && lancamento.prestacoes.length > 0) {
      setPrestacoes(
        lancamento.prestacoes.map((p) => ({
          data_vencimento: p.data_vencimento ? dayjs(p.data_vencimento) : null,
          valor_parcela: parseFloat(p.valor_parcela || 0),
        }))
      );
    } else {
      setPrestacoes([
        {
          data_vencimento: lancamento.data_lancamento
            ? dayjs(lancamento.data_lancamento)
            : null,
          valor_parcela: parseFloat(lancamento.valor || 0),
        },
      ]);
    }

    form.setFieldsValue({
      id_paciente: lancamento.id_paciente || undefined,
      tipo: lancamento.tipo,
      categoria: lancamento.categoria,
      descricao: lancamento.descricao,
      forma_pagamento: lancamento.forma_pagamento || "À vista",
      valor: lancamento.valor ? parseFloat(lancamento.valor) : undefined,
      data_lancamento: lancamento.data_lancamento
        ? dayjs(lancamento.data_lancamento)
        : undefined,
    });
    setOpen(true);
  };

  const showDrawer = () => {
    resetFinanceiroForm();
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    resetFinanceiroForm();
  };

  const handlePacienteClick = (id) => {
    setSelectedPacienteId(id);
    setView("lista");
  };

  const handleClearPacienteFilter = () => {
    setSelectedPacienteId(null);
  };

  const atualizarStatus = async (id_lancamento) => {
    setLoading(true);
    const resultado = await financeirosService.updateLancamento(id_lancamento, {
      status: "Pago",
      data_pagamento: dayjs().format("YYYY-MM-DD"),
    });
    if (resultado.success) {
      messageApi.success("Status atualizado com sucesso");
      await carregarLancamentos();
      await carregarConsolidado();
    } else {
      messageApi.error(resultado.message || "Erro ao atualizar status");
    }
    setLoading(false);
  };

  const reverterStatus = async (id_lancamento) => {
    setLoading(true);
    const resultado = await financeirosService.updateLancamento(id_lancamento, {
      status: "Pendente",
      data_pagamento: null,
    });
    if (resultado.success) {
      messageApi.success("Ação desfeita com sucesso");
      await carregarLancamentos();
      await carregarConsolidado();
    } else {
      messageApi.error(resultado.message || "Erro ao desfazer ação");
    }
    setLoading(false);
  };

  const filteredLancamentos = (() => {
    let items = selectedPacienteId
      ? lancamentos.filter((l) => l.id_paciente === selectedPacienteId)
      : lancamentos;

    if (filterTipo && filterTipo !== "Todos") {
      if (filterTipo === "Receitas") items = items.filter((l) => l.tipo === "RECEITA");
      if (filterTipo === "Despesas") items = items.filter((l) => l.tipo === "DESPESA");
    }

    if (filterStatus && filterStatus !== "Todos") {
      if (filterStatus === "Pendente") items = items.filter((l) => l.status === "Pendente");
      if (filterStatus === "Pago") items = items.filter((l) => l.status === "Pago");
    }

    return items;
  })();

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
          onChange={(value) => {
            setView(value);
            if (value === "pacientes") {
              handleClearPacienteFilter();
            }
          }}
          options={[
            { label: "Pacientes", value: "pacientes" },
            { label: "Lista", value: "lista" },
            { label: "Grid", value: "grid" },
          ]}
        />
        <Space>
          <Dropdown
            overlay={
              <Menu onClick={({ key }) => setFilterTipo(key)}>
                <Menu.Item key="Todos">Todos</Menu.Item>
                <Menu.Item key="Receitas">Apenas Receitas</Menu.Item>
                <Menu.Item key="Despesas">Apenas Despesas</Menu.Item>
              </Menu>
            }
          >
            <ButtonSecoundary icon={<FilterFilled />}>Filtro</ButtonSecoundary>
          </Dropdown>
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) => {
                  if (key === "Limpar") {
                    setFilterTipo("Todos");
                    setFilterStatus("Todos");
                  } else {
                    setFilterStatus(key);
                  }
                }}
              >
                <Menu.Item key="Todos">Todos</Menu.Item>
                <Menu.Item key="Pendente">Pendentes</Menu.Item>
                <Menu.Item key="Pago">Pagos</Menu.Item>
                <Menu.Item key="Limpar">Limpar filtros</Menu.Item>
              </Menu>
            }
          >
            <ButtonSecoundary>Situação</ButtonSecoundary>
          </Dropdown>
          <ButtonSecoundary icon={<DownloadOutlined />}>
            Baixar CSV
          </ButtonSecoundary>
          <ButtonPrimary icon={<UserAddOutlined />} onClick={showDrawer}>
            Novo lançamento
          </ButtonPrimary>
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
              onPacienteClick={handlePacienteClick}
            />
          )}

          {view === "lista" && (
            <ViewLista
              lancamentos={filteredLancamentos}
              loading={loading}
              onEditar={handleEditarLancamento}
              onDeletar={handleDeletarLancamento}
              onAtualizarStatus={atualizarStatus}
              onReverterStatus={reverterStatus}
              onAnexarComprovante={async (id_lancamento, file) => {
                setLoading(true);
                const resultado = await financeirosService.uploadComprovante(id_lancamento, file);
                if (resultado.success) {
                  messageApi.success('Comprovante enviado com sucesso');
                  await carregarLancamentos();
                } else {
                  messageApi.error(resultado.message || 'Erro ao enviar comprovante');
                }
                setLoading(false);
              }}
            />
          )}

          {view === "grid" && (
            <ViewGrid
              lancamentos={filteredLancamentos}
              loading={loading}
              onEditar={handleEditarLancamento}
              onDeletar={handleDeletarLancamento}
              onAtualizarStatus={atualizarStatus}
              onReverterStatus={reverterStatus}
              onAnexarComprovante={async (id_lancamento, file) => {
                setLoading(true);
                const resultado = await financeirosService.uploadComprovante(id_lancamento, file);
                if (resultado.success) {
                  messageApi.success('Comprovante enviado com sucesso');
                  await carregarLancamentos();
                } else {
                  messageApi.error(resultado.message || 'Erro ao enviar comprovante');
                }
                setLoading(false);
              }}
            />
          )}
        </>
      )}

      {/* Drawer Novo Lançamento */}
      <MyDrawer open={open} onClose={onClose} title={editingLancamentoId ? "Editar Lançamento" : "Novo Lançamento"} width={600}>
        <FormStyled
          form={form}
          layout="vertical"
          variant="underlined"
          onFinish={handleFinishFinanceiro}
        >
          <Spin spinning={loading}>
          <Form.Item name="id_paciente" label="Selecionar Paciente (Opcional)">
            <Select
              placeholder="Selecione um paciente"
              allowClear
              showSearch
              optionFilterProp="label"
              options={pacientes
                // 1. Filtra garantindo que o paciente pertence ao Lucas Vieira (id_usuario: 1)
                // .filter((p) => String(p.id_usuario || p.usuario_id || p.userId) === String(currentUser?.id_usuario))
                // 2. Mapeia os campos exatos que vieram do banco de dados
                .map((p) => ({
                  label: p.nomePaciente || p.nome || p.nome_paciente, // Tenta todas as variações de nome
                  value: p.id || p.id_paciente,                       // Tenta as variações de ID primário
                  key: p.id || p.id_paciente,
                }))}
            />
           </Form.Item>

            <Form.Item name="tipo" label="Tipo" initialValue="RECEITA">
              <Radio.Group onChange={(e) => setTipo(e.target.value)} value={tipo}>
                <Radio value="RECEITA">Receita</Radio>
                <Radio value="DESPESA">Despesa</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="categoria"
              label="Categoria"
              rules={[{ required: true, message: "Selecione a categoria" }]}
            >
              <Select
                placeholder="Selecione uma categoria"
                onChange={setCategoria}
                options={categoriasMap[tipo].map((cat) => ({
                  label: cat,
                  value: cat,
                  key: cat,
                }))}
              />
            </Form.Item>

            <Form.Item name="descricao" label="Descrição">
              <Input placeholder="Descreva o lançamento (opcional)" />
            </Form.Item>

            {mostraFormaPagamento && (
              <Form.Item
                name="forma_pagamento"
                label="Forma de Pagamento"
                initialValue="À vista"
              >
                <Radio.Group
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  value={formaPagamento}
                >
                  <Radio value="À vista">À vista</Radio>
                  <Radio value="Parcelado">Parcelado</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            {!isParcelado && (
              <>
                <Form.Item
                  name="valor"
                  label="Valor"
                  rules={[{ required: true, message: "Informe o valor" }]}
                >
                  <InputNumber
                    placeholder="0,00"
                    prefix="R$"
                    step={0.01}
                    precision={2}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  name="data_lancamento"
                  label="Data de Lançamento"
                  rules={[{ required: true, message: "Selecione a data" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </>
            )}

            {isParcelado && (
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 16,
                  }}
                >
                  Prestações
                </label>
                {prestacoes.map((prestacao, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-end",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.85em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Vencimento #{index + 1}
                      </label>
                      <DatePicker
                        value={prestacao.data_vencimento}
                        onChange={(date) =>
                          atualizarPrestacao(index, "data_vencimento", date)
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.85em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Valor #{index + 1}
                      </label>
                      <InputNumber
                        value={prestacao.valor_parcela}
                        onChange={(val) =>
                          atualizarPrestacao(index, "valor_parcela", val)
                        }
                        prefix="R$"
                        step={0.01}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </div>
                    {prestacoes.length > 1 && (
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removerPrestacao(index)}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  onClick={adicionarPrestacao}
                >
                  + Nova Prestação
                </Button>
              </div>
            )}

            <ButtonSubmit loading={loading}>
              {editingLancamentoId ? "Atualizar Lançamento" : "Salvar Lançamento"}
            </ButtonSubmit>
            <ButtonSecoundary block onClick={onClose}>Cancelar</ButtonSecoundary>
          </Spin>
        </FormStyled>
      </MyDrawer>
    </Space>
  );
}