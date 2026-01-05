import { Flex, Form, Input, Space, Select, Switch, DatePicker } from "antd";
import { useState } from "react";
import { useMessage } from "../../context/MessageProvider";
import { Container, ContainerHorizontal } from "./styles";
import ButtonSecoundary from "../../components/ButtonSecoundary";

// icons
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, DownloadOutlined, FallOutlined, FilterFilled, UserAddOutlined, CalendarOutlined } from "@ant-design/icons";

import EmptyComponent from "../../components/EmptyComponent";
import MyDrawer from "../../components/MyDrawer";
import ButtonSubmit from '../../components/ButtonSubmit';
import ButtonWhatsapp from '../../components/ButtonWhatsapp';
import CardFinancas from "../../components/CardFinancas";
import { Link } from "react-router";

export default function Financeiro() {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);

    // useMessage para exibir mensagens de feedback
    const messageApi = useMessage();
    const key = "updatable";

    const openMessage = (type, content) => {
        messageApi.open({
            key,
            type,
            content,
            duration: 2,
        });
    };


    const [isListEmpty, setIsListEmpty] = useState(0);

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Space direction="horizontal" style={{ width: "100%", overflowX: 'auto' }}>
                <CardFinancas
                    color='#D35050'
                    title="Despesas"
                    desc="Valor á pagar"
                    valor="0,00"
                    icon={<FallOutlined />}
                />
                <CardFinancas
                    color='#62AA85'
                    title="Receitas"
                    desc="Previstas"
                    valor="0,00"
                    icon={<ClockCircleOutlined />}

                />
                <CardFinancas
                    color='#62AA85'
                    title="Receitas"
                    desc="Cobranças pagas"
                    valor="0,00"
                    icon={<DollarOutlined />}
                />
                <CardFinancas
                    color='#62AA85'
                    title="Receitas"
                    desc="Realizadas"
                    valor="0,00"
                    icon={<CheckCircleOutlined />}
                />
            </Space>
            <ContainerHorizontal direction="horizontal">
                <ButtonSecoundary icon={<FilterFilled />}>Filtro</ButtonSecoundary>
                <ButtonSecoundary icon={<DownloadOutlined />}>Baixar CSV</ButtonSecoundary>
            </ContainerHorizontal>
            <Container>
                <EmptyComponent
                    // image={<FiUserPlus size={48} />}
                    description="Você ainda não criou nenhum lançamento"
                    btnText="Novo lançamento"
                    open={open}
                    onClose={onClose}
                    showDrawer={showDrawer}
                />
            </Container>
            <MyDrawer open={open} onClose={onClose} title=" Cadastro de Paciente">
                <Form
                    form={form}
                    layout="vertical"
                    variant="underlined"
                    onFinish={() => {}}
                    initialValues={{ modalidade: 'À vista' }}
                    style={{ padding: '20px' }}
                >
                    {/* Selecionar Cliente */}
                    <Form.Item
                        label="Selecionar cliente"
                        name="cliente"
                        rules={[{ message: "Por favor, selecione um cliente" }]}
                    >
                        <Select
                            placeholder="Selecionar cliente"
                            suffixIcon={(<Link to='/pacientes'><UserAddOutlined title="Cadastrar um Paciente" style={{color: '#000'}}/></Link>)}
                            allowClear
                        >
                            <Select.Option value="cliente1">Cliente Exemplo 1</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Descrição */}
                    <Form.Item label="Descrição" name="descricao">
                        <Input placeholder="Descrição" />
                    </Form.Item>

                    {/* Observações */}
                    <Form.Item label="Observações" name="observacoes">
                        <Input placeholder="Observações" />
                    </Form.Item>

                    {/* Tipo e Categoria em Linha (Opcional, ou manter vertical como no print) */}
                    <Form.Item label="Tipo" name="tipo">
                        <Select placeholder="Select...">
                            <Select.Option value="receita">Receita</Select.Option>
                            <Select.Option value="despesa">Despesa</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Categoria" name="categoria">
                        <Select placeholder="Select...">
                            <Select.Option value="receita_atendimento">Receita de atendimento</Select.Option>
                            <Select.Option value="receita_produto">Receita produto</Select.Option>
                            <Select.Option value="receita_outros">Receita outros</Select.Option>
                            {/* despesas */}
                            <Select.Option value="despesa_fixa">Despesa Fixa</Select.Option>
                            <Select.Option value="despesa_prestacoes">Despesa em prestações</Select.Option>


                        </Select>
                    </Form.Item>

                    <Form.Item label="Forma de pagamento" name="formaPagamento">
                        <Select placeholder="Select...">
                            <Select.Option value="pix">Pix</Select.Option>
                            <Select.Option value="credito">Crédito</Select.Option>
                            <Select.Option value="debito">Débito</Select.Option>
                            <Select.Option value="dinheiro">Dinheiro</Select.Option>
                            <Select.Option value="boleto">Boleto</Select.Option>
                            <Select.Option value="transferencia">Transferência</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Switch À vista / Parcelado */}
                    <Form.Item name="modalidade">
                        <Flex align="center" gap={10}>
                            <span style={{ color: '#666' }}>À vista</span>
                            <Switch size="small" />
                            <span style={{ color: '#666' }}>Parcelado</span>
                        </Flex>
                    </Form.Item>

                    {/* Valor */}
                    <Form.Item label="Valor" name="valor">
                        <Input placeholder="Valor do Atendimento" prefix="R$" />
                    </Form.Item>

                    {/* Data do Lançamento */}
                    <Form.Item label="Data do Lançamento" name="dataLancamento">
                        <DatePicker
                            placeholder="dd/mm/aaaa"
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            suffixIcon={<CalendarOutlined />}
                        />
                    </Form.Item>

                    <div style={{ marginTop: 24 }}>
                        <ButtonSubmit>Salvar Lançamento</ButtonSubmit>
                        <ButtonWhatsapp>Enviar comprovante</ButtonWhatsapp>
                    </div>
                </Form>
            </MyDrawer>
        </Space>
    );
}