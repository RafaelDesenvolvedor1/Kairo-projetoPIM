module.exports = (app) => {
  const Horarios = app.models.horarios || app.models.Horarios;

  app
    .route('/horarios')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const result = await Horarios.findAll({
          where: { id_usuario: req.user.id_usuario },
          include: [
            {
              association: 'local',
              attributes: ['id_local', 'nome', 'endereco', 'is_video'],
            }
          ],
          order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']],
        });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .post(async (req, res) => {
      try {
        req.body.id_usuario = req.user.id_usuario;
        const result = await Horarios.create(req.body);
        const horarioComLocal = await Horarios.findByPk(result.id_horario, {
          include: [
            {
              association: 'local',
              attributes: ['id_local', 'nome', 'endereco', 'is_video'],
            }
          ],
        });
        res.status(201).json(horarioComLocal);
      } catch (err) {
        if (err && err.name === 'SequelizeValidationError') {
          return res.status(412).json({ msg: err.errors.map((e) => e.message).join(', ') });
        }
        res.status(412).json({ msg: err.message });
      }
    });

  app
    .route('/horarios/:id')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { id } = req.params;
        const result = await Horarios.findOne({
          where: { id_horario: id, id_usuario: req.user.id_usuario },
          include: [
            {
              association: 'local',
              attributes: ['id_local', 'nome', 'endereco', 'is_video'],
            }
          ],
        });
        if (!result) return res.sendStatus(404);
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .put(async (req, res) => {
      try {
        const { id } = req.params;
        delete req.body.id_usuario;

        const [updatedRows] = await Horarios.update(req.body, {
          where: { id_horario: id, id_usuario: req.user.id_usuario },
        });

        if (updatedRows === 0) {
          return res.sendStatus(404);
        }

        const updated = await Horarios.findOne({
          where: { id_horario: id, id_usuario: req.user.id_usuario },
          include: [
            {
              association: 'local',
              attributes: ['id_local', 'nome', 'endereco', 'is_video'],
            }
          ],
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
        const deletedRows = await Horarios.destroy({
          where: { id_horario: id, id_usuario: req.user.id_usuario },
        });
        if (deletedRows === 0) return res.sendStatus(404);
        res.sendStatus(204);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });
};
