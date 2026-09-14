const {
  validarCriacaoLocal,
  validarAtualizacaoLocal,
} = require('../validate/locaisValidate');

module.exports = (app) => {
  const Locais = app.models.locais || app.models.Locais;
  const LocaisEnderecos = app.models.locaisEnderecos || app.models.LocaisEnderecos;

  app
    .route('/locais')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const where = { id_usuario: req.user.id_usuario };

        // Se no futuro você quiser filtrar na API passando ?ativo=true (ex: para a tela pública de agendamento do paciente)
        if (req.query.ativo !== undefined) {
          where.ativo = req.query.ativo === 'true';
        }

        const result = await Locais.findAll({
          where,
          include: [
            {
              model: LocaisEnderecos,
              as: 'endereco',
            },
          ],
          order: [['nome', 'ASC']],
        });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .post(validarCriacaoLocal, async (req, res) => {
      const transaction = await app.db.transaction();
      try {
        const { endereco, nome, ativo, is_video } = req.body;
        let id_endereco = null;

        // Se não for atendimento por vídeo e foram enviados dados de endereço
        if (!is_video && endereco && typeof endereco === 'object') {
          const novoEndereco = await LocaisEnderecos.create(endereco, { transaction });
          id_endereco = novoEndereco.id_endereco;
        }

        const novoLocal = await Locais.create(
          {
            nome,
            ativo: ativo !== undefined ? ativo : true,
            is_video: Boolean(is_video),
            id_usuario: req.user.id_usuario,
            id_endereco,
          },
          { transaction }
        );

        await transaction.commit();

        const localCriado = await Locais.findOne({
          where: { id_local: novoLocal.id_local },
          include: [{ model: LocaisEnderecos, as: 'endereco' }],
        });

        res.status(201).json(localCriado);
      } catch (err) {
        await transaction.rollback();
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
          include: [{ model: LocaisEnderecos, as: 'endereco' }],
        });

        if (!result) {
          return res.sendStatus(404);
        }
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .put(validarAtualizacaoLocal, async (req, res) => {
      const transaction = await app.db.transaction();
      try {
        const { id } = req.params;
        const { endereco, nome, ativo, is_video } = req.body;

        const localExistente = await Locais.findOne({
          where: { id_local: id, id_usuario: req.user.id_usuario },
          transaction,
        });

        if (!localExistente) {
          await transaction.rollback();
          return res.sendStatus(404);
        }

        let id_endereco = localExistente.id_endereco;

        if (is_video) {
          // Se virou atendimento online, remove o endereço anterior se existir
          if (id_endereco) {
            await LocaisEnderecos.destroy({
              where: { id_endereco },
              transaction,
            });
            id_endereco = null;
          }
        } else if (endereco && typeof endereco === 'object') {
          if (id_endereco) {
            // Atualiza o endereço existente
            await LocaisEnderecos.update(endereco, {
              where: { id_endereco },
              transaction,
            });
          } else {
            // Cria um endereço novo caso antes não existisse
            const novoEndereco = await LocaisEnderecos.create(endereco, { transaction });
            id_endereco = novoEndereco.id_endereco;
          }
        }

        const dadosAtualizar = {};
        if (nome !== undefined) dadosAtualizar.nome = nome;
        if (ativo !== undefined) dadosAtualizar.ativo = ativo;
        if (is_video !== undefined) dadosAtualizar.is_video = is_video;
        dadosAtualizar.id_endereco = id_endereco;

        await Locais.update(dadosAtualizar, {
          where: { id_local: id, id_usuario: req.user.id_usuario },
          transaction,
        });

        await transaction.commit();

        const localAtualizado = await Locais.findOne({
          where: { id_local: id, id_usuario: req.user.id_usuario },
          include: [{ model: LocaisEnderecos, as: 'endereco' }],
        });

        res.json(localAtualizado);
      } catch (err) {
        await transaction.rollback();
        if (err && err.name === 'SequelizeValidationError') {
          return res.status(412).json({ msg: err.errors.map((e) => e.message).join(', ') });
        }
        res.status(412).json({ msg: err.message });
      }
    })
    .delete(async (req, res) => {
      const transaction = await app.db.transaction();
      try {
        const { id } = req.params;

        const local = await Locais.findOne({
          where: { id_local: id, id_usuario: req.user.id_usuario },
          transaction,
        });

        if (!local) {
          await transaction.rollback();
          return res.sendStatus(404);
        }

        const id_endereco = local.id_endereco;

        await Locais.destroy({
          where: { id_local: id, id_usuario: req.user.id_usuario },
          transaction,
        });

        if (id_endereco) {
          await LocaisEnderecos.destroy({
            where: { id_endereco },
            transaction,
          });
        }

        await transaction.commit();
        res.sendStatus(204);
      } catch (err) {
        await transaction.rollback();
        res.status(412).json({ msg: err.message });
      }
    });
};