const jwt = require('jwt-simple');
const config = require('../config/config.js');

module.exports = (app) => {
    const Users = app.db.models.User;
    const { secret } = config.jwt;

    return {
        // Callback de sucesso no Google OAuth
        googleSuccess: async (req, res) => {
            try {
                const user = req.user;

                if (!user) {
                    return res.status(401).json({ message: 'Autenticação falhou' });
                }

                // Gerar JWT token
                const now = Math.floor(Date.now() / 1000);
                const payload = {
                    id_usuario: user.id_usuario,
                    nome: user.nome,
                    email: user.email,
                    exp: now + (24 * 60 * 60) // 24 horas
                };

                const token = jwt.encode(payload, secret);

                // Retornar token (pode ser um redirect ou JSON)
                return res.json({
                    success: true,
                    token,
                    user: {
                        id_usuario: user.id_usuario,
                        nome: user.nome,
                        email: user.email,
                        tipo_usuario: user.tipo_usuario
                    }
                });
            } catch (error) {
                console.error('Erro ao gerar token após Google login:', error);
                return res.status(500).json({ message: 'Erro interno no servidor' });
            }
        },

        // Callback de erro no Google OAuth
        googleFailure: (req, res) => {
            res.status(401).json({
                success: false,
                message: 'Falha na autenticação com Google'
            });
        },

        // Desconectar Google
        googleLogout: async (req, res) => {
            try {
                const { id_usuario } = req.body;

                if (!id_usuario) {
                    return res.status(400).json({ message: 'ID do usuário é obrigatório' });
                }

                const user = await Users.findByPk(id_usuario);

                if (!user) {
                    return res.status(404).json({ message: 'Usuário não encontrado' });
                }

                // Remover tokens Google
                user.google_access_token = null;
                user.google_refresh_token = null;
                await user.save();

                return res.json({
                    success: true,
                    message: 'Desconectado do Google com sucesso'
                });
            } catch (error) {
                console.error('Erro ao desconectar Google:', error);
                return res.status(500).json({ message: 'Erro interno no servidor' });
            }
        },

        // Obter tokens do Google de um usuário (para uso com Calendar API)
        getGoogleTokens: async (req, res) => {
            try {
                const { id_usuario } = req.params;

                const user = await Users.findByPk(id_usuario, {
                    attributes: ['id_usuario', 'google_id', 'google_access_token', 'google_refresh_token', 'google_token_expiry']
                });

                if (!user) {
                    return res.status(404).json({ message: 'Usuário não encontrado' });
                }

                if (!user.google_id) {
                    return res.status(400).json({ message: 'Usuário não autenticado com Google' });
                }

                return res.json({
                    success: true,
                    tokens: {
                        access_token: user.google_access_token,
                        refresh_token: user.google_refresh_token,
                        token_expiry: user.google_token_expiry
                    }
                });
            } catch (error) {
                console.error('Erro ao obter tokens Google:', error);
                return res.status(500).json({ message: 'Erro interno no servidor' });
            }
        }
    };
};
