import { Form, Input, Select, Radio, InputNumber, DatePicker, Button, Space, Spin } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PrestacaoContainer, PrestacoesContainer } from "./styles";

export default function FormNovoLancamento({ form, onSubmit, loading, pacientes, onCancel }) {
  const [tipo, setTipo] = useState("RECEITA");
  const [categoria, setCategoria] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("À vista");
  const [prestacoes, setPrestacoes] = useState([{ data_vencimento: null, valor_parcela: 0 }]);

  const categoriasMap = {
    RECEITA: ["Receita atendimento", "Receita produto", "Receita outros"],
    DESPESA: ["Despesa Fixa", "Despesa em prestação"]
  };

  useEffect(() => {
    setCategoria("");
    setFormaPagamento("À vista");
    setPrestacoes([{ data_vencimento: null, valor_parcela: 0 }]);
    form.setFieldsValue({ categoria: undefined, forma_pagamento: "À vista", valor: undefined });
  }, [tipo, form]);

  useEffect(() => {
    if (categoria === "Despesa Fixa") {
      setFormaPagamento("À vista");
      form.setFieldsValue({ forma_pagamento: "À vista" });
    }
  }, [categoria, form]);

  const mostraFormaPagamento = (tipo === "RECEITA") || (tipo === "DESPESA" && categoria === "Despesa em prestação");
  const isParcelado = formaPagamento === "Parcelado" && mostraFormaPagamento;

  const adicionarPrestacao = () => {
    const ultimaPrestacao = prestacoes[prestacoes.length - 1];
    const novaData = ultimaPrestacao?.data_vencimento ? dayjs(ultimaPrestacao.data_vencimento).add(1, "month") : dayjs();
    setPrestacoes([...prestacoes, { data_vencimento: novaData, valor_parcela: 0 }]);
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

  const handleFinish = (values) => {
    if (isParcelado) {
      const todasPreenchidas = prestacoes.every(p => p.data_vencimento && p.valor_parcela > 0);
      if (!todasPreenchidas) {
        alert("Por favor, preencha todas as prestações com data e valor");
        return;
      }

      const valorTotal = prestacoes.reduce((acc, p) => acc + parseFloat(p.valor_parcela || 0), 0);
      onSubmit({
        ...values,
        tipo,
        categoria,
        forma_pagamento: "Parcelado",
        valor: valorTotal,
        quantidade_parcelas: prestacoes.length,
        data_lancamento: prestacoes[0].data_vencimento.format("YYYY-MM-DD"),
        prestacoes: prestacoes.map((p, idx) => ({
          numero_parcela: idx + 1,
          data_vencimento: p.data_vencimento.format("YYYY-MM-DD"),
          valor_parcela: parseFloat(p.valor_parcela)
        }))
      });
    } else {
      onSubmit({
        ...values,
        tipo,
        categoria,
        forma_pagamento: "À vista",
        quantidade_parcelas: 1,
        data_lancamento: values.data_lancamento ? values.data_lancamento.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
      });
    }
  };

  return (
    <Form form={form} layout="vertical" variant="underlined" onFinish={handleFinish} style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <Form.Item name="id_paciente" label="Selecionar Paciente (Opcional)">
          <Select
            placeholder="Selecione um paciente"
            allowClear
            options={pacientes.map(p => ({ label: p.nomePaciente, value: p.id, key: p.id }))}
          />
        </Form.Item>

        <Form.Item name="tipo" label="Tipo" initialValue="RECEITA">
          <Radio.Group onChange={(e) => setTipo(e.target.value)} value={tipo}>
            <Radio value="RECEITA">Receita</Radio>
            <Radio value="DESPESA">Despesa</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="categoria" label="Categoria" rules={[{ required: true, message: "Selecione a categoria" }]}>
          <Select
            placeholder="Selecione uma categoria"
            onChange={setCategoria}
            options={categoriasMap[tipo].map(cat => ({ label: cat, value: cat, key: cat }))}
          />
        </Form.Item>

        <Form.Item name="descricao" label="Descrição">
          <Input placeholder="Descreva o lançamento (opcional)" />
        </Form.Item>

        {mostraFormaPagamento && (
          <Form.Item name="forma_pagamento" label="Forma de Pagamento" initialValue="À vista">
            <Radio.Group onChange={(e) => setFormaPagamento(e.target.value)} value={formaPagamento}>
              <Radio value="À vista">À vista</Radio>
              <Radio value="Parcelado">Parcelado</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {!isParcelado && (
          <>
            <Form.Item name="valor" label="Valor" rules={[{ required: true, message: "Informe o valor" }]}>
              <InputNumber placeholder="0,00" prefix="R$" step={0.01} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="data_lancamento" label="Data de Lançamento" rules={[{ required: true, message: "Selecione a data" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}

        {isParcelado && (
          <PrestacoesContainer>
            <label style={{ fontWeight: 700, display: "block", marginBottom: "16px" }}>Prestações</label>
            {prestacoes.map((prestacao, index) => (
              <PrestacaoContainer key={index}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.85em", display: "block", marginBottom: "4px" }}>Vencimento #{index + 1}</label>
                    <DatePicker
                      value={prestacao.data_vencimento}
                      onChange={(date) => atualizarPrestacao(index, "data_vencimento", date)}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.85em", display: "block", marginBottom: "4px" }}>Valor #{index + 1}</label>
                    <InputNumber
                      value={prestacao.valor_parcela}
                      onChange={(val) => atualizarPrestacao(index, "valor_parcela", val)}
                      prefix="R$"
                      step={0.01}
                      precision={2}
                      style={{ width: "100%" }}
                    />
                  </div>
                  {prestacoes.length > 1 && (
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removerPrestacao(index)} />
                  )}
                </div>
              </PrestacaoContainer>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} block onClick={adicionarPrestacao} style={{ marginTop: "16px" }}>
              + Nova Prestação
            </Button>
          </PrestacoesContainer>
        )}

        <Form.Item style={{ marginTop: "24px" }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Salvar Lançamento</Button>
          </Space>
        </Form.Item>
      </Spin>
    </Form>
  );
}