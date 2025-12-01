import { Card, Flex, Avatar, Descriptions, Form, Input } from "antd";
import { CardStyle } from "./styles";
import { UserOutlined } from "@ant-design/icons";
import MyDrawer from "../MyDrawer";
import { useState, useContext } from "react";
import ButtonSubmit from "../ButtonSubmit";
import ButtonDelete from "../ButtonDelete";

import { PacienteContext } from "../../context/PacienteContext";
import { useMessage } from "../../context/MessageProvider";

export default function CardPaciente({
  grid,
  pacienteId,
  pacienteName,
  pacientePhone,
  pacienteEmail,
}) {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Preciso de states para atualizar os cards
  const [paciente, setPaciente] = useState({
    id: pacienteId,
    nomePaciente: pacienteName,
    telefone: pacientePhone,
    email: pacienteEmail,
  });

  const onClose = () => {
    setDrawerOpen(false);
  };
  const showDrawer = () => {
    form.setFieldsValue({
      nomePaciente: paciente.nomePaciente,
      telefone: paciente.telefone,
      email: paciente.email,
    });
    setDrawerOpen(true);
  };

  // useMessage para exibir mensagens de feedback
  const messageApi = useMessage();
  const key = "updatable";

  const showMessage = (type, content) => {
    messageApi.open({
      key,
      type,
      content,
      duration: 2,
    });
  };

  // useContext para pegar as funções de update e remove do PacienteContext
  const { updatePaciente, removePaciente } = useContext(PacienteContext);

  const updatePacienteHandler = (values) => {
    const updatedPaciente = {
      id: paciente.id,
      nomePaciente: values.nomePaciente,
      telefone: values.telefone,
      email: values.email,
    };
    try {
      updatePaciente(updatedPaciente);
      setPaciente(updatedPaciente);
      onClose();
      showMessage("success", "Paciente atualizado com sucesso!");
    } catch (error) {
      showMessage("error", "Erro ao atualizar paciente.");
    }
  };

  const deletePacienteHandler = () => {
    try {
      removePaciente(paciente.id);
      onClose();
      showMessage("success", "Paciente excluído com sucesso!");
    } catch (error) {
      showMessage("error", "Erro ao excluir paciente.");
    }
  };

  return (
    <>
      <CardStyle grid={grid} title={paciente.nomePaciente} onClick={showDrawer}>
        <Flex>
          <div>
            <Avatar size={64} icon={<UserOutlined />} />
          </div>

          <Descriptions column={1} style={{ marginLeft: 20 }}>
            <Descriptions.Item label="Telefone">
              {paciente.telefone}
            </Descriptions.Item>
            <Descriptions.Item label="E-mail">
              {paciente.email}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </CardStyle>
      <MyDrawer open={drawerOpen} onClose={onClose}>
        <Form
          form={form}
          layout="vertical"
          variant="underlined"
          onFinish={updatePacienteHandler}
        >
          <Form.Item
            label="Nome do Paciente"
            name="nomePaciente"
            rules={[{ required: true, message: "Campo obrigatório" }]}
          >
            <Input placeholder="Digite o nome do paciente" />
          </Form.Item>
          <Form.Item
            label="Telefone (opcional)"
            name="telefone"
            rules={[
              {
                pattern: /^\d{11}$/,
                message: "Formato inválido. Ex: 11987654321",
              },
            ]}
          >
            <Input placeholder="Apenas números" />
          </Form.Item>
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { required: true, message: "Campo obrigatório" },
              { type: "email", message: "E-mail inválido" },
            ]}
          >
            <Input placeholder="Digite o e-mail do paciente" type="email" />
          </Form.Item>
          <ButtonSubmit>Editar Paciente</ButtonSubmit>
          <ButtonDelete click={deletePacienteHandler}>Excluir Paciente</ButtonDelete>
        </Form>
      </MyDrawer>
    </>
  );
}
