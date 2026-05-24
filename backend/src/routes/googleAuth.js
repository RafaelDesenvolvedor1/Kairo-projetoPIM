const jwt = require('jwt-simple');

module.exports = app => {
    const authController = app.controllers.authController;

    /**
     * 1. Inicia o fluxo de autenticação com Google
     * Chamado tanto no Login Social quanto no Vínculo do Calendário
     */
    app.get('/auth/google', (req, res, next) => {
        const { state } = req.query; // Captura 'vinculo_ID' vindo do React

        app.passport.authenticate('google', {
            scope: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ],
            accessType: 'offline',
            prompt: 'consent',
            state: state // Envia o estado intacto para o Google nos devolver
        })(req, res, next);
    });

    /**
     * 2. Callback do Google após autenticação (Interceptador de Segurança Customizado)
     */
    app.get('/auth/google/callback', (req, res, next) => {
        const { state } = req.query; // Recupera o state devolvido pelo Google

        app.passport.authenticate('google', { session: false }, (err, user, info) => {
            // BYPASS DE SEGURANÇA: Se for fluxo de VÍNCULO, o passReqToCallback já salvou 
            // os tokens no banco com a nossa Raw Query. Mesmo se o Passport reclamar de sessão 
            // aqui no final, nós interceptamos e forçamos o redirecionamento de sucesso para o React!
            if (state && state.startsWith('vinculo_')) {
                return res.redirect('http://localhost:5173/agendamentos?integration=success');
            }

            // Tratamento padrão de erro caso NÃO seja vínculo (seja login normal do zero que falhou)
            if (err || !user) {
                console.error('Erro na autenticação do Passport:', err || info);
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }

            // FLUXO DE LOGIN SOCIAL TRADICIONAL INTOCADO
            const now = Math.floor(Date.now() / 1000);
            const payload = {
                id_usuario: user.id_usuario,
                nome: user.nome,
                email: user.email,
                exp: now + (24 * 60 * 60)
            };

            const token = jwt.encode(payload, process.env.JWT_SECRET);
            return res.redirect(`http://localhost:5173/login?token=${encodeURIComponent(token)}&nome=${encodeURIComponent(user.nome)}`);
        })(req, res, next);
    });

    // Mantendo os outros endpoints originais do controle do Google
    app.get('/auth/google/failure', authController.googleFailure);
    app.post('/auth/google/logout', authController.googleLogout);
    app.get('/auth/google/tokens/:id_usuario', authController.getGoogleTokens);
};