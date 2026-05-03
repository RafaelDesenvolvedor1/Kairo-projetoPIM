const { Op } = require("sequelize");

module.exports = (app) => {
  const Pacientes = app.models.pacientes;
  app
    .route("/pacientes")
    .get(async (req, res) => {
      // Listar os pacientes
      try {
        const result = await Pacientes.findAll();
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })

    .post(async (req, res) => {
      // Cadastra um Pacientes
      try {
        const result = await Pacientes.create(req.body);
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

  // quantidade de pacienes
  app.route("/pacienes/count").get(async (req, res) => {
    try {
      const result = await Cidade.count();
      res.json({ qtd_pacienes: result });
    } catch (err) {
      res.status(412).json({ msg: err.message });
    }
  });

  // buscar paciente por nome
  app.route("/pacientes/nome/:nome").get(async (req, res) => {
    try {
      const { nomePacientes } = req.params;
      const where = { nomePacientes };
      const result = await Pacientes.findOne({ where });
      if (result) {
        res.json(result);
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      res.sendStatus(412).json({ msg: err.message });
    }
  });

  // busca por nome (like)
  app.route("/pacientes/search").get(async (req, res) => {
    try {
      const searchCidade = req.query.nome ? req.query.nome : "";
      if (!searchCidade) {
        return res.sendStatus(400);
      }
      const result = await Pacientes.findAll({
        where: {
          nome: {
            [Op.like]: `%${searchCidade}%`,
          },
        },
      });
      res.json(result);
    } catch (err) {
      res.sendStatus(412).json({ msg: err.message });
    }
  });

  app
    .route("/pacientes/:id")
    .get(async (req, res) => {
      // retorna um Cidade específico
      try {
        const { id } = req.params;
        const where = { id };
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
    .put(async (req, res) => {
      // Edita um Paciente
      try {
        const { id } = req.params;
        const where = { id };
        await Pacientes.update(req.body, { where });
        res.sendStatus(204);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })

    .delete(async (req, res) => {
      // Deleta um Paciente
      try {
        const { id } = req.params;
        const where = { id };
        await Pacientes.destroy({ where });
        res.sendStatus(204);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });
};
