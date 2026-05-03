import { Card, Flex, Avatar, Descriptions, Form, Input, Row, Col } from "antd";
import { CardStyle } from "./styles";
import { UserOutlined } from "@ant-design/icons";
import MyDrawer from "../MyDrawer";
import { useState, useContext } from "react";
import ButtonSubmit from "../ButtonSubmit";
import ButtonDelete from "../ButtonDelete";

import { PacienteContext } from "../../context/PacienteContext";
import { useMessage } from "../../context/MessageProvider";
import ButtonSecoundary from "../ButtonSecoundary";
import ButtonWhatsapp from "../ButtonWhatsapp";
import { Link } from "react-router"; // Importação do Link conforme seu uso

export default function CardPaciente({
  grid,
  pacienteId,
  pacienteName,
  pacientePhone,
  pacienteEmail,
}) {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // States para gerenciar os dados do card
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

          {/* Seção de Botões de Atalho para Abas */}
          <div style={{ width: '100%', marginTop: '24px' }}>
            <Row gutter={[12, 12]}>
              {/* Perfil - Key 1 */}
              <Col span={24}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '1' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Perfil</ButtonSecoundary>
                </Link>
              </Col>

              {/* Instrumentos - Key 2 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '2' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Instrumentos</ButtonSecoundary>
                </Link>
              </Col>

              {/* Prontuário - Key 3 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '3' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Prontuário</ButtonSecoundary>
                </Link>
              </Col>

              {/* Anotações de Sessão - Key 4 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '4' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Anotações de Sessão</ButtonSecoundary>
                </Link>
              </Col>

              {/* Agenda - Key 5 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '5' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Agenda</ButtonSecoundary>
                </Link>
              </Col>

              {/* Financeiro - Key 6 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '6' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Financeiro</ButtonSecoundary>
                </Link>
              </Col>

              {/* Diário de Bordo - Key 7 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '7' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Diário de Bordo</ButtonSecoundary>
                </Link>
              </Col>

              {/* Documentos - Key 8 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '8' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Documentos</ButtonSecoundary>
                </Link>
              </Col>

              {/* Anexos - Key 9 */}
              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '9' }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Anexos</ButtonSecoundary>
                </Link>
              </Col>

              {/* Arquivar - Funcionalidade extra */}
              <Col span={12}>
                <ButtonSecoundary style={{ width: '100%' }}>Arquivar</ButtonSecoundary>
              </Col>

              {/* Whatsapp */}
              <Col span={12}>
                <ButtonWhatsapp style={{ width: '100%' }}>
                  Whatsapp
                </ButtonWhatsapp>
              </Col>
            </Row>
          </div>
        </Form>
      </MyDrawer>
    </>
  );
}