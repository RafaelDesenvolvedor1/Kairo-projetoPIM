import { Button, Flex, Form, Input, Space } from "antd";
import ButtonSecoundary from "../../components/ButtonSecoundary";
import ButtonSubmit from "../../components/ButtonSubmit";
import {
  CaretDownOutlined,
  FilterFilled,
  BarsOutlined,
  HolderOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FiUserPlus } from "react-icons/fi";

import { ContainerHorizontal, Container, FormStyled } from "./styles";
import EmptyComponent from "../../components/EmptyComponent";
import ButtonWhatsapp from "../../components/ButtonWhatsapp";

import { useState, useContext, useEffect } from "react";
import ButtonPrimary from "../../components/ButtonPrimary";
import CardPaciente from "../../components/CardPaciente";
import MyDrawer from "../../components/MyDrawer";

import { PacienteContext } from "../../context/PacienteContext";
import { useMessage } from "../../context/MessageProvider";

export default function Pacientes() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

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

  const { pacientesList, addPaciente } = useContext(PacienteContext);

  const [isListEmpty, setIsListEmpty] = useState(pacientesList.length > 0);
  const [gridView, setGridView] = useState(true);

  useEffect(() => {
    setIsListEmpty(pacientesList.length > 0);
  }, [pacientesList]);

  const addPacienteHandler = async (values) => {
    const newPaciente = {
      nomePaciente: values.nomePaciente,
      telefone: values.telefone || null,
      email: values.email,
    };

    try {
      await addPaciente(newPaciente);
      form.resetFields();
      onClose();
      openMessage("success", "Paciente adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);

      if (error.response && error.response.data && error.response.data.erros) {
        error.response.data.erros.forEach((e) => {
          openMessage("error", `${e.campo ? e.campo + ': ' : ''}${e.mensagem}`);
        });
      } else {
        openMessage("error", "Erro ao adicionar paciente.");
      }
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <ContainerHorizontal direction="horizontal">
        <div>
          <span>Ordenar por: </span>
          <ButtonSecoundary icon={<CaretDownOutlined />}>
            Alfabética
          </ButtonSecoundary>
          <ButtonSecoundary icon={<FilterFilled />}>Filtro</ButtonSecoundary>
        </div>
        <div>
          <ButtonSecoundary
            onClick={() => setGridView(false)}
            icon={<BarsOutlined />}
          />
          <ButtonSecoundary
            onClick={() => setGridView(true)}
            icon={<HolderOutlined />}
          />
          <ButtonSecoundary icon={<DownloadOutlined />}>
            Baixar CSV
          </ButtonSecoundary>
        </div>
      </ContainerHorizontal>

      {isListEmpty ? (
        <div style={{ marginTop: 50 }}>
          <ButtonPrimary onClick={showDrawer} icon={<PlusOutlined />}>
            Adicionar Paciente
          </ButtonPrimary>
          <Flex gap="middle" wrap style={{ marginTop: 20 }}>
            {pacientesList.map((paciente) => (
              <CardPaciente
                key={paciente.id}
                grid={gridView}
                pacienteId={paciente.id}
                pacienteName={paciente.nomePaciente || paciente.nome_paciente}
                pacientePhone={paciente.telefone}
                pacienteEmail={paciente.email}
              />
            ))}
          </Flex>
        </div>
      ) : (
        <Container direction="vertical">
          <EmptyComponent
            image={<FiUserPlus size={48} />}
            description="Nenhum paciente encontrado"
            btnText="Adicionar Paciente"
            open={open}
            onClose={onClose}
            showDrawer={showDrawer}
          />
        </Container>
      )}

      <MyDrawer open={open} onClose={onClose} title=" Cadastro de Paciente">
        <FormStyled
          form={form}
          layout="vertical"
          variant="underlined"
          onFinish={addPacienteHandler}
        >
          <Form.Item
            label="Nome do Paciente"
            name="nomePaciente"
            rules={[
              { required: true, message: "O nome é obrigatório!" },
              { min: 3, message: "O nome deve ter no mínimo 3 caracteres!" },
              { max: 50, message: "O nome deve ter no máximo 50 caracteres!" }
            ]}
          >
            <Input placeholder="Digite o nome do paciente" />
          </Form.Item>

          <Form.Item
            label="Telefone (opcional)"
            name="telefone"
            rules={[
              {
                pattern: /^\d{10,11}$/,
                message: "Formato inválido. Use apenas DDD e números (ex: 11987654321)",
              },
            ]}
          >
            <Input placeholder="Apenas números com DDD" maxLength={11} />
          </Form.Item>

          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { required: true, message: "O e-mail é obrigatório!" },
              { type: "email", message: "Formato de e-mail inválido!" },
              { max: 50, message: "E-mail pode ter no máximo 50 caracteres!" }
            ]}
          >
            <Input placeholder="Digite o e-mail do paciente" type="email" />
          </Form.Item>

          <ButtonSubmit style={{ marginTop: 16 }}>Adicionar Paciente</ButtonSubmit>
          <ButtonWhatsapp>Enviar formulário de cadastro</ButtonWhatsapp>
        </FormStyled>
      </MyDrawer>
    </Space>
  );
}