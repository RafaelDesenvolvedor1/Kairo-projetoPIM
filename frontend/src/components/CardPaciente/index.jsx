import { Card, Flex, Avatar, Descriptions, Form, Input, Row, Col } from "antd";
import { CardStyle } from "./styles";
import { UserOutlined } from "@ant-design/icons";
import MyDrawer from "../MyDrawer";
import { useState, useContext, useEffect } from "react";
import ButtonSubmit from "../ButtonSubmit";
import ButtonDelete from "../ButtonDelete";

import { PacienteContext } from "../../context/PacienteContext";
import { useMessage } from "../../context/MessageProvider";
import ButtonSecoundary from "../ButtonSecoundary";
import ButtonWhatsapp from "../ButtonWhatsapp";
import { Link } from "react-router"; 

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

  // Garante que o estado local do Card reflita mudanças globais vindas do Contexto
  useEffect(() => {
    setPaciente({
      id: pacienteId,
      nomePaciente: pacienteName,
      telefone: pacientePhone,
      email: pacienteEmail,
    });
  }, [pacienteId, pacienteName, pacientePhone, pacienteEmail]);

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

  // Refatorado para async/await para travar o estado caso a API retorne erro
  const updatePacienteHandler = async (values) => {
    const updatedPaciente = {
      id: paciente.id,
      nomePaciente: values.nomePaciente,
      telefone: values.telefone || null,
      email: values.email,
    };
    
    try {
      // Aguarda a resposta positiva da API e do Contexto
      await updatePaciente(updatedPaciente);
      
      // Só altera o estado local e fecha o Drawer se a linha acima funcionar
      setPaciente(updatedPaciente);
      onClose();
      showMessage("success", "Paciente atualizado com sucesso!");
    } catch (error) {
      console.error("Erro na atualização rápida do paciente:", error);
      
      if (error.response && error.response.data && error.response.data.erros) {
        error.response.data.erros.forEach((e) => {
          showMessage("error", `${e.campo ? e.campo + ': ' : ''}${e.mensagem}`);
        });
      } else {
        showMessage("error", "Erro ao atualizar paciente.");
      }
    }
  };

  const deletePacienteHandler = async () => {
    try {
      await removePaciente(paciente.id);
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
              {paciente.telefone || "Não informado"}
            </Descriptions.Item>
            <Descriptions.Item label="E-mail">
              {paciente.email}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </CardStyle>

      <MyDrawer open={drawerOpen} onClose={onClose} title="Editar Cadastro Rápido">
        <Form
          form={form}
          layout="vertical"
          variant="underlined"
          onFinish={updatePacienteHandler}
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

          <ButtonSubmit style={{ marginTop: 16 }}>Editar Paciente</ButtonSubmit>
          <ButtonDelete click={deletePacienteHandler}>Excluir Paciente</ButtonDelete>

          {/* Seção de Botões de Atalho para Abas */}
          <div style={{ width: '100%', marginTop: '24px' }}>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '1', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Perfil</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '2', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Instrumentos</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '3', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Prontuário</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '4', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Anotações de Sessão</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '5', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Agenda</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '6', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Financeiro</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '7', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Diário de Bordo</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '8', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Documentos</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <Link to={`/pacientes/dates`} state={{ activeTab: '9', id: paciente.id, paciente }} style={{ width: '100%' }}>
                  <ButtonSecoundary style={{ width: '100%' }}>Anexos</ButtonSecoundary>
                </Link>
              </Col>

              <Col span={12}>
                <ButtonSecoundary style={{ width: '100%' }}>Arquivar</ButtonSecoundary>
              </Col>

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