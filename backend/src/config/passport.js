const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const config = require('./config.js');

module.exports = (app) => {
    const User = app.db.models.User;

    // Estratégia Local (email e senha)
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, async (email, senha, done) => {
        try {
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return done(null, false, { message: 'Usuário não encontrado' });
            }

            const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Senha inválida' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Estratégia Google OAuth2
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const { id, displayName, emails } = profile;
            const email = emails && emails.length > 0 ? emails[0].value : null;

            if (!email) {
                return done(null, false, { message: 'Email não fornecido pelo Google' });
            }

            // Tentar encontrar usuário pelo googleId
            let user = await User.findOne({ where: { google_id: id } });

            if (user) {
                // Usuário existe, atualizar tokens
                user.google_access_token = accessToken;
                user.google_refresh_token = refreshToken || user.google_refresh_token;
                user.ultimo_login = new Date();
                await user.save();
                return done(null, user);
            }

            // Verificar se email já existe (conta local)
            user = await User.findOne({ where: { email } });

            if (user) {
                // Email existe, linkar com Google
                user.google_id = id;
                user.google_access_token = accessToken;
                user.google_refresh_token = refreshToken;
                user.ultimo_login = new Date();
                await user.save();
                return done(null, user);
            }

            // Novo usuário - criar conta
            user = await User.create({
                nome: displayName,
                email: email,
                google_id: id,
                google_access_token: accessToken,
                google_refresh_token: refreshToken,
                tipo_usuario: 'paciente', // Tipo padrão, pode ser alterado
                ativo: true,
                // Para usuários Google, gerar hash aleatório para senha
                senha_hash: await bcrypt.hash(Math.random().toString(36), 10),
                ultimo_login: new Date()
            });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialização
    passport.serializeUser((user, done) => {
        done(null, user.id_usuario);
    });

    // Desserialização
    passport.deserializeUser(async (id_usuario, done) => {
        try {
            const user = await User.findByPk(id_usuario);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    return passport;
};
