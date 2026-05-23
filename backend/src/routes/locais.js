module.exports = (app) => {
  const Locais = app.models.locais || app.models.Locais;

  app
    .route('/locais')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const result = await Locais.findAll({
          where: { id_usuario: req.user.id_usuario, ativo: true },
          order: [['nome', 'ASC']],
        });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .post(async (req, res) => {
      try {
        req.body.id_usuario = req.user.id_usuario;
        const result = await Locais.create(req.body);
        res.status(201).json(result);
      } catch (err) {
        if (err && err.name === 'SequelizeValidationError') {
          return res.status(412).json({ msg: err.errors.map((e) => e.message).join(', ') });
        }
        res.status(412).json({ msg: err.message });
      }
    });

  app
    .route('/locais/:id')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { id } = req.params;
        const result = await Locais.findOne({
          where: { id_local: id, id_usuario: req.user.id_usuario },
        });
        if (!result) {
          return res.sendStatus(404);
        }
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .put(async (req, res) => {
      try {
        const { id } = req.params;
        delete req.body.id_usuario;

        const [updatedRows] = await Locais.update(req.body, {
          where: { id_local: id, id_usuario: req.user.id_usuario },
        });

        if (updatedRows === 0) {
          return res.sendStatus(404);
        }

        const updated = await Locais.findOne({
          where: { id_local: id, id_usuario: req.user.id_usuario },
        });

        res.json(updated);
      } catch (err) {
        if (err && err.name === 'SequelizeValidationError') {
          return res.status(412).json({ msg: err.errors.map((e) => e.message).join(', ') });
        }
        res.status(412).json({ msg: err.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const { id } = req.params;
        const deletedRows = await Locais.destroy({
          where: { id_local: id, id_usuario: req.user.id_usuario },
        });

        if (deletedRows === 0) {
          return res.sendStatus(404);
        }

        res.sendStatus(204);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });
};
