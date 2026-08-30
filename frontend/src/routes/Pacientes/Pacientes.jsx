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
  CopyOutlined,
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

import copy from "copy-to-clipboard"; // Importa a biblioteca copy-to-clipboard

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

  // Função auxiliar para recuperar o id_usuario do storage ou token JWT
  const obterUsuarioId = () => {
    // 1. Tenta buscar o objeto de usuário serializado
    const userRaw =
      localStorage.getItem("user") ||
      localStorage.getItem("usuario") ||
      sessionStorage.getItem("user");

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        if (parsed.id_usuario || parsed.id) {
          return parsed.id_usuario || parsed.id;
        }
      } catch (e) {
        // Ignora erro de parse caso seja apenas uma string pura
      }
    }

    // 2. Se houver apenas o token JWT salvo, decodifica o payload base64
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("token");

    if (token && token.includes(".")) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.id_usuario || payload.id || payload.sub;
      } catch (e) {
        console.error("Falha ao decodificar token JWT:", e);
      }
    }

    return null;
  };

  // Função para gerar e copiar a URL com o ID do profissional
  const copiarLinkCadastro = () => {
    try {
      const usuarioId = obterUsuarioId();

      if (!usuarioId) {
        openMessage(
          "error",
          "Não foi possível identificar o usuário autenticado."
        );
        return;
      }

      const tallyUrl = `https://tally.so/r/rjMeoX?usuario_id=${usuarioId}`;

      copy(tallyUrl);
      openMessage(
        "success",
        "Link do formulário copiado para a área de transferência!"
      );
    } catch (err) {
      openMessage("error", "Erro ao copiar o link de cadastro.");
    }
  };

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
          openMessage(
            "error",
            `${e.campo ? e.campo + ": " : ""}${e.mensagem}`
          );
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
          <Flex gap="small" align="center" style={{ marginBottom: 20 }}>
            <ButtonPrimary onClick={showDrawer} icon={<PlusOutlined />}>
              Adicionar Paciente
            </ButtonPrimary>

            <ButtonSecoundary
      
              onClick={copiarLinkCadastro}
              icon={<CopyOutlined />}
            >
              Copiar Link de Cadastro
            </ButtonSecoundary>
          </Flex>

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
              { max: 50, message: "O nome deve ter no máximo 50 caracteres!" },
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
                message:
                  "Formato inválido. Use apenas DDD e números (ex: 11987654321)",
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
              { max: 50, message: "E-mail pode ter no máximo 50 caracteres!" },
            ]}
          >
            <Input placeholder="Digite o e-mail do paciente" type="email" />
          </Form.Item>

          <ButtonSubmit style={{ marginTop: 16 }}>
            Adicionar Paciente
          </ButtonSubmit>
          
          <ButtonWhatsapp onClick={copiarLinkCadastro}>
            Enviar formulário de cadastro
          </ButtonWhatsapp>

          <ButtonSecoundary
              block
              style={{ marginTop: 16 }}
              onClick={copiarLinkCadastro}
              icon={<CopyOutlined />}
          >
            Copiar Link de Cadastro
          </ButtonSecoundary>
        </FormStyled>
      </MyDrawer>
    </Space>
  );
}