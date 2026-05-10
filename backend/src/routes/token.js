const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const config = require('../config/config.js');

module.exports = (app) => {
    const Users = app.models.users;
    const {secret} = config.jwt;

    app.post('/token', async (req, res) => {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' });
            }
            const user = await Users.findOne({ where: { email } });
            if(!user) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            if (bcrypt.compareSync(senha, user.senha_hash)) {
                const now = Math.floor(Date.now() / 1000);
                const payload = {
                    id_usuario: user.id_usuario,
                    exp: now + (24 * 60 * 60)
                };
                const token = jwt.encode(payload, secret);
                return res.json({ token });
            }
            return res.status(401).json({ message: 'Credenciais inválidas' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno no login' });
        }
    });
};