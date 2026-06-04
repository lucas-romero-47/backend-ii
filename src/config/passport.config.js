const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { createHash, isValidPassword, cookieExtractor } = require('../utils/utils');
const { jwtSecret } = require('./config');
const { userRepository, cartRepository } = require('../repositories');

const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, email, age } = req.body;

                const existingUser = await userRepository.getByEmail(username);
                if (existingUser) {
                    console.log('El usuario ya existe');
                    return done(null, false, { message: 'El usuario ya existe' });
                }

                const newCart = await cartRepository.create();

                const newUser = await userRepository.create({
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    cart: newCart._id,
                    role: 'user'
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (username, password, done) => {
            try {
                const user = await userRepository.getByEmail(username);
                if (!user) {
                    console.log('Usuario no encontrado');
                    return done(null, false, { message: 'Usuario no encontrado' });
                }

                if (!isValidPassword(user, password)) {
                    console.log('Contraseña incorrecta');
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('current', new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: jwtSecret
        },
        async (jwtPayload, done) => {
            try {
                const user = await userRepository.getById(jwtPayload.id);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));
};

module.exports = initializePassport;
