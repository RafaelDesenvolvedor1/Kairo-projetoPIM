const { Op } = require("sequelize");
const cepPromise = require("cep-promise");
const { validarPaciente } = require("../validate/pacienteValidate");

module.exports = (app) => {
  const Pacientes = app.models.pacientes;

  // ==========================================
  // ROTA PÚBLICA: Webhook do Tally (Sem Auth JWT)
  // ==========================================
  app.post(
    "/pacientes/webhook-cadastro",
    app.mapearWebhookTally,
    validarPaciente,
    async (req, res) => {
      try {
        const idUsuario = req.body.usuarioId || req.body.id_usuario;

        if (!idUsuario) {
          return res.status(400).json({
            msg: "O identificador do profissional (usuario_id) não foi enviado pelo formulário.",
          });
        }

        // Vincula a foreign key ao modelo do Sequelize
        req.body.id_usuario = Number(idUsuario);

        // Preenchimento automático de endereço via CEP
        if (req.body.cep) {
          const cepLimpo = req.body.cep.replace(/\D/g, "");
          if (cepLimpo.length === 8) {
            try {
              const dadosEndereco = await cepPromise(cepLimpo);
              req.body.endereco = req.body.endereco || dadosEndereco.street;
              req.body.bairro = req.body.bairro || dadosEndereco.neighborhood;
              req.body.cidade = req.body.cidade || dadosEndereco.city;
              req.body.estado = req.body.estado || dadosEndereco.state;
            } catch (e) {
              // Em caso de falha no serviço de CEP, prossegue com o cadastro
            }
          }
        }

        const result = await Pacientes.create(req.body);
        return res.status(201).json(result);
      } catch (err) {
        return res.status(412).json({ msg: err.message });
      }
    }
  );

  // ==========================================
  // ROTAS PRIVADAS: Requerem autenticação JWT
  // ==========================================
  app
    .route("/pacientes")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const where = { id_usuario: req.user.id_usuario };
        const result = await Pacientes.findAll({ where });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .post(validarPaciente, async (req, res) => {
      try {
        req.body.id_usuario = req.user.id_usuario;
        const result = await Pacientes.create(req.body);
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

  // Quantidade de pacientes do usuário logado
  app
    .route("/pacientes/count")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const where = { id_usuario: req.user.id_usuario };
        const count = await Pacientes.count({ where });
        res.json({ count });
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

  // Buscar paciente específico do usuário pelo nome exato
  app
    .route("/pacientes/nome/:nome")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { nome } = req.params;
        const where = {
          nomePaciente: nome,
          id_usuario: req.user.id_usuario,
        };
        const result = await Pacientes.findOne({ where });
        if (result) {
          res.json(result);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

  // Busca parcial por nome (Like) protegida por usuário
  app
    .route("/pacientes/search")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const searchNome = req.query.nome ? req.query.nome : "";
        if (!searchNome) {
          return res.sendStatus(400);
        }

        const result = await Pacientes.findAll({
          where: {
            id_usuario: req.user.id_usuario,
            nomePaciente: {
              [Op.like]: `%${searchNome}%`,
            },
          },
        });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

  app
    .route("/pacientes/:id")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { id } = req.params;
        const where = {
          id,
          id_usuario: req.user.id_usuario,
        };
        const result = await Pacientes.findOne({ where });
        if (result) {
          res.json(result);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .put(validarPaciente, async (req, res) => {
      try {
        const { id } = req.params;
        const where = {
          id,
          id_usuario: req.user.id_usuario,
        };

        delete req.body.id_usuario;

        const [updatedRows] = await Pacientes.update(req.body, { where });

        if (updatedRows > 0) {
          res.sendStatus(204);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const { id } = req.params;
        const where = {
          id,
          id_usuario: req.user.id_usuario,
        };
        const deletedRows = await Pacientes.destroy({ where });

        if (deletedRows > 0) {
          res.sendStatus(204);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });
};