const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const config = require('../config/config.js');

module.exports = (app) => {
    const Users = app.models.users;
    const {secret} = config.jwt;

    app.post('/token', async (req, res) => {
        try {
            const { email, senha } = req.body;
            if (email && senha) {
                const where = { email };
                const user = await Users.findOne({ where });
                if(bcrypt.compareSync(senha, user.senha_hash)) {
                    const payload = { id_usuario: user.id_usuario };
                    const token = jwt.encode(payload, secret);
                    return res.json({ token });
                }
            }
            return res.sendStatus(401);
        } catch (error) {
            return res.sendStatus(401);
        }
    });
};