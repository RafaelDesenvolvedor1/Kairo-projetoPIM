module.exports = (app) => {
    const Users = app.models.users;

    app.route('/user')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            try {
                const {id_usuario} = req.user; // Obtém o ID do usuário autenticado
                const attributes = ['id_usuario', 'nome', 'email', 'tipo_usuario', 'ativo', 'data_criacao', 'ultimo_login'];
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
                const {id_usuario} = req.user; // Obtém o ID do usuário autenticado
                const where = { id_usuario };
                await Users.destroy({ where });
                res.sendStatus(204);
            } catch (error) {
                res.status(412).json({ msg: error.message });
            }
        });
        
    app.post('/users', async (req, res) => {
        try {
            const result = await Users.create(req.body);
            res.json(result);
        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    });
};