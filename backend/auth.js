const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const config = require('./config/config.js');

module.exports = (app) => {
    const User = app.db.models.User;
    
    const params = {
        secretOrKey: config.jwt.secret,
        jwtFromRequest: ExtractJwt.fromHeader('Authorization'),
    };

    passport.use(new Strategy(params, async (payload, done) => {
        try {
            const { id } = payload;
            const attributes = ['id', 'email'];
            const options = { attributes };
            const user = await User.findByPk(id, options);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate('jwt', jwt.options),
    }
}