const { Op } = require("sequelize");

module.exports = (app) => {
  const Pacientes = app.models.pacientes;

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
    .post(async (req, res) => {
      try {
        req.body.id_usuario = req.user.id_usuario;
        const result = await Pacientes.create(req.body);
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });

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

  app
    .route("/pacientes/nome/:nome")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { nome } = req.params;
        const where = { 
          nomePaciente: nome,
          id_usuario: req.user.id_usuario 
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
          id_usuario: req.user.id_usuario 
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
    .put(async (req, res) => {
      try {
        const { id } = req.params;
        const where = { 
          id, 
          id_usuario: req.user.id_usuario 
        };
        
        delete req.body.id_usuario;

        const [updatedRows] = await Pacientes.update(req.body, { where });
        
        if (updatedRows > 0) {
          const pacienteAtualizado = await Pacientes.findOne({ where });
          res.json(pacienteAtualizado);
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
          id_usuario: req.user.id_usuario 
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