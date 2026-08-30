const bodyParser = require("body-parser");
const cors = require("cors");

// Função auxiliar para extrair o valor real (trata DROPDOWN, MULTIPLE_CHOICE, etc.)
const extrairValorCampo = (campo) => {
  if (!campo || campo.value === null || campo.value === undefined) {
    return null;
  }

  // Se o campo for DROPDOWN ou MULTIPLE_CHOICE, resolve o ID para o texto legível
  if (Array.isArray(campo.value) && Array.isArray(campo.options)) {
    const ids = campo.value;
    const textos = campo.options
      .filter((opt) => ids.includes(opt.id))
      .map((opt) => opt.text);
    return textos.join(", ") || null;
  }

  // Se for array simples de strings
  if (Array.isArray(campo.value)) {
    return campo.value.join(", ") || null;
  }

  return campo.value;
};

// Função para sanitizar e normalizar telefone para o padrão nacional (apenas DDD + Número)
const normalizarTelefoneBR = (telefone) => {
  if (!telefone || typeof telefone !== "string") return null;

  // Remove tudo que não for dígito
  let apenasNumeros = telefone.replace(/\D/g, "");

  // Se vier com o DDI do Brasil (ex: 5511991427214 ou 551133334444), remove o 55 inicial
  if ((apenasNumeros.length === 12 || apenasNumeros.length === 13) && apenasNumeros.startsWith("55")) {
    apenasNumeros = apenasNumeros.substring(2);
  }

  return apenasNumeros || null;
};

const mapearWebhookTally = (req, res, next) => {
  try {
    const fields = req.body?.data?.fields;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Formato de payload inválido do Tally.",
      });
    }

    const dadosMapeados = {};

    fields.forEach((campo) => {
      const valor = extrairValorCampo(campo);

      // 1. Captura o campo oculto (usuario_id)
      if (
        campo.key?.includes("usuario_id") ||
        campo.label?.toLowerCase() === "usuario_id"
      ) {
        dadosMapeados.usuarioId = valor;
      }

      // 2. Normaliza os campos
      const label = campo.label ? campo.label.toLowerCase() : "";

      // Emergência
      if (label.includes("emergência") || label.includes("emergencia")) {
        if (label.includes("telefone") || label.includes("whatsapp") || label.includes("contato")) {
          dadosMapeados.contatoEmergenciaTelefone = normalizarTelefoneBR(valor);
        } else {
          dadosMapeados.contatoEmergenciaNome = valor;
        }
      }
      // Dados Básicos e Contato
      else if (label.includes("nome")) {
        dadosMapeados.nomePaciente = valor;
      } else if (label.includes("e-mail") || label.includes("email")) {
        dadosMapeados.email = valor;
      } else if (label.includes("cpf")) {
        dadosMapeados.cpf = valor;
      } else if (label.includes("telefone") || label.includes("whatsapp")) {
        dadosMapeados.telefone = normalizarTelefoneBR(valor);
      } else if (label.includes("nascimento") || label.includes("data")) {
        dadosMapeados.dataNascimento = valor;
      } else if (label.includes("rg")) {
        dadosMapeados.rg = valor;
      } else if (label.includes("gênero") || label.includes("genero")) {
        dadosMapeados.genero = valor;
      } else if (label.includes("profissão") || label.includes("profissao")) {
        dadosMapeados.profissao = valor;
      } else if (label.includes("estado civil")) {
        dadosMapeados.estadoCivil = valor;
      }
      // Endereço
      else if (label.includes("cep")) {
        dadosMapeados.cep = valor;
      } else if (label.includes("complemento")) {
        dadosMapeados.complemento = valor;
      } else if (label.includes("número") || label.includes("numero")) {
        dadosMapeados.numero = valor;
      } else if (label.includes("endereço") || label.includes("endereco") || label.includes("logradouro")) {
        dadosMapeados.endereco = valor;
      } else if (label.includes("bairro")) {
        dadosMapeados.bairro = valor;
      } else if (label.includes("cidade")) {
        dadosMapeados.cidade = valor;
      } else if (label.includes("estado") || label.includes("uf")) {
        dadosMapeados.estado = valor;
      }
    });

    req.body = dadosMapeados;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = (app) => {
  app.set("port", process.env.PORT || 3000);
  app.set("json spaces", 4);
  app.use(bodyParser.json());
  app.use(app.auth.initialize());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use((req, res, next) => {
    if (req.body && req.body.id) {
      delete req.body.id;
    }
    next();
  });

  app.mapearWebhookTally = mapearWebhookTally;
};

module.exports.mapearWebhookTally = mapearWebhookTally;