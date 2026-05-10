const { Op } = require("sequelize");

module.exports = (app) => {
  const Pacientes = app.models.pacientes;

  app
    .route("/pacientes")
    .all(app.auth.authenticate()) // Autenticação obrigatória para este grupo de rotas
    .get(async (req, res) => {
      // Listar apenas os pacientes do usuário autenticado
      try {
        const where = { userId: req.user.id_usuario };
        const result = await Pacientes.findAll({ where });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .post(async (req, res) => {
      // Cadastra um paciente associado ao usuário autenticado
      try {
        req.body.userId = req.user.id_usuario; 
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
        // Filtra para contar apenas os pacientes do próprio usuário
        const where = { userId: req.user.id_usuario };
        const result = await Pacientes.count({ where });
        res.json({ qtd_pacientes: result });
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
        const { nome } = req.params; // Corrigido de nomePacientes para nome
        const where = { 
          nome: nome,
          userId: req.user.id_usuario // Garante que pertence ao usuário logado
        };
        const result = await Pacientes.findOne({ where });
        if (result) {
          res.json(result);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        res.status(412).json({ msg: err.message }); // Corrigido de sendStatus para status
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
            userId: req.user.id_usuario, // Garante que a busca só traga registros do usuário
            nome: {
              [Op.like]: `%${searchNome}%`,
            },
          },
        });
        res.json(result);
      } catch (err) {
        res.status(412).json({ msg: err.message }); // Corrigido de sendStatus para status
      }
    });

  app
    .route("/pacientes/:id")
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      // Retorna um paciente específico se pertencer ao usuário
      try {
        const { id } = req.params;
        const where = { 
          id, 
          userId: req.user.id_usuario 
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
      // Edita um paciente apenas se pertencer ao usuário logado
      try {
        const { id } = req.params;
        const where = { 
          id, 
          userId: req.user.id_usuario 
        };
        
        // Impede que o usuário tente alterar o dono do paciente no corpo da requisição
        delete req.body.userId; 

        const [updatedRows] = await Pacientes.update(req.body, { where });
        
        if (updatedRows > 0) {
          res.sendStatus(204);
        } else {
          res.sendStatus(404); // Se tentar editar um id que não é dele ou não existe
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    })
    .delete(async (req, res) => {
      // Deleta um paciente apenas se pertencer ao usuário logado
      try {
        const { id } = req.params;
        const where = { 
          id, 
          userId: req.user.id_usuario 
        };
        const deletedRows = await Pacientes.destroy({ where });
        
        if (deletedRows > 0) {
          res.sendStatus(204);
        } else {
          res.sendStatus(404); // Se tentar deletar um id que não é dele ou não existe
        }
      } catch (err) {
        res.status(412).json({ msg: err.message });
      }
    });
};