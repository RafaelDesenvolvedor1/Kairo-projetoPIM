module.exports = (app) => {
  const Users = app.models.users;

  app.route('/user')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const { id_usuario } = req.user;
        const attributes = [
          'id_usuario',
          'nome',
          'email',
          'slug',
          'tipo_usuario',
          'ativo',
          'data_criacao',
          'ultimo_login',
        ];
        const options = { attributes };
        const result = await Users.findByPk(id_usuario, options);

        if (result) {
          res.json(result);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        res.status(412).json({ msg: error.message });
      }
    })
    .delete(async (req, res) => {
      try {
        const { id_usuario } = req.user;
        const where = { id_usuario };
        await Users.destroy({ where });
        res.sendStatus(204);
      } catch (error) {
        res.status(412).json({ msg: error.message });
      }
    });

  app.post('/users', async (req, res) => {
    try {
      const { nome, email, senha_hash, tipo_usuario, ativo } = req.body;
      if (!nome || !email || !senha_hash) {
        return res.status(400).json({ msg: 'Nome, email e senha são obrigatórios' });
      }

      // Cria normalmente. A trigger no banco preenche NEW.slug automaticamente.
      const result = await Users.create({
        nome,
        email,
        senha_hash,
        tipo_usuario: tipo_usuario || 'paciente',
        ativo: ativo !== undefined ? ativo : true,
      });

      // Recarrega o registro para retornar com o slug preenchido pela trigger
      await result.reload();

      res.status(201).json(result);
    } catch (error) {
      res.status(412).json({ msg: error.message });
    }
  });
};