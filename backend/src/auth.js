const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const config = require('./config/config.js');
const associateModels = require('../associate');

module.exports = (app) => {
    associateModels(app);

    const User = app.db.models.User;
    
    const params = {
        secretOrKey: config.jwt.secret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    passport.use(new Strategy(params, async (payload, done) => {
        try {
            const { id_usuario } = payload;
            if (!id_usuario) {
                return done(null, false);
            }
            const attributes = ['id_usuario', 'email'];
            const options = { attributes };
            const user = await User.findByPk(id_usuario, options);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate('jwt', { session: false }),
    }
};