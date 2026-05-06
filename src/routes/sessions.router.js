const { Router } = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/utils');
const { cookieName } = require('../config/config');

const router = Router();

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(400).json({ status: 'error', message: info?.message || 'Error al registrar usuario' });
        }
        return res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role,
                cart: user.cart
            }
        });
    })(req, res, next);
});

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });
        }

        const token = generateToken(user);

        res.cookie(cookieName, token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({
            status: 'success',
            message: 'Login exitoso',
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role,
                cart: user.cart
            }
        });
    })(req, res, next);
});

router.get('/current', (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: info?.message || 'Token inválido o inexistente' });
        }
        return res.json({
            status: 'success',
            payload: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role,
                cart: user.cart
            }
        });
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    res.clearCookie(cookieName);
    return res.json({ status: 'success', message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
