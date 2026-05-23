const jwt = require('jwt-simple');

module.exports = app => {
    const authController = app.controllers.authController;

    // Inicia o fluxo de autenticação com Google
    // Parâmetros: access_type=offline e prompt=consent para obter refreshToken
    app.get('/auth/google',
        app.passport.authenticate('google', {
            scope: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ],
            accessType: 'offline',
            prompt: 'consent'
        })
    );

    // Callback do Google após autenticação
    app.get('/auth/google/callback',
        app.passport.authenticate('google', {
            failureRedirect: '/auth/google/failure',
            session: false
        }),
        (req, res) => {
            const user = req.user;
            if (!user) {
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }

            const now = Math.floor(Date.now() / 1000);
            const payload = {
                id_usuario: user.id_usuario,
                nome: user.nome,
                email: user.email,
                exp: now + (24 * 60 * 60)
            };

            const token = jwt.encode(payload, process.env.JWT_SECRET);
            return res.redirect(`http://localhost:5173/login?token=${encodeURIComponent(token)}&nome=${encodeURIComponent(user.nome)}`);
        }
    );

    // Rota de erro
    app.get('/auth/google/failure', authController.googleFailure);

    // Desconectar Google
    app.post('/auth/google/logout', authController.googleLogout);

    // Obter tokens do Google (para integração com Google Calendar)
    app.get('/auth/google/tokens/:id_usuario', authController.getGoogleTokens);
};
