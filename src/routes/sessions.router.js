const { Router } = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { generateToken, createHash, isValidPassword } = require('../utils/utils');
const { cookieName, jwtSecret, baseUrl } = require('../config/config');
const { passportCall } = require('../middlewares/auth');
const { userRepository } = require('../repositories');
const UserDTO = require('../dto/user.dto');
const mailService = require('../services/mail.service');

const router = Router();

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(400).json({ status: 'error', message: info?.message || 'Error al registrar usuario' });
        }

        const userDto = new UserDTO(user);

        return res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            payload: userDto
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

        const userDto = new UserDTO(user);

        return res.json({
            status: 'success',
            message: 'Login exitoso',
            payload: userDto
        });
    })(req, res, next);
});

router.get('/current', passportCall('current'), (req, res) => {
    const userDto = new UserDTO(req.user);
    return res.json({
        status: 'success',
        payload: userDto
    });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'error', message: 'El email es requerido' });
        }

        const user = await userRepository.getByEmail(email);

        // Siempre respondemos éxito para no revelar si el email existe
        if (!user) {
            return res.json({
                status: 'success',
                message: 'Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña'
            });
        }

        // Generar token JWT con expiración de 1 hora
        const resetToken = jwt.sign(
            { email: user.email, purpose: 'reset' },
            jwtSecret,
            { expiresIn: '1h' }
        );

        // Enviar email
        await mailService.sendPasswordResetEmail(email, resetToken);

        return res.json({
            status: 'success',
            message: 'Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña'
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ status: 'error', message: 'Token y nueva contraseña son requeridos' });
        }

        // Verificar y decodificar el token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({
                    status: 'error',
                    message: 'El enlace de restablecimiento ha expirado. Generá uno nuevo.'
                });
            }
            return res.status(400).json({ status: 'error', message: 'Token inválido' });
        }

        // Validar que el token sea de tipo reset
        if (decoded.purpose !== 'reset') {
            return res.status(400).json({ status: 'error', message: 'Token inválido' });
        }

        const user = await userRepository.getByEmail(decoded.email);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        // Verificar que la nueva contraseña no sea igual a la actual
        if (isValidPassword(user, new_password)) {
            return res.status(400).json({
                status: 'error',
                message: 'La nueva contraseña no puede ser igual a la contraseña actual'
            });
        }

        // Actualizar contraseña
        await userRepository.update(user._id, { password: createHash(new_password) });

        return res.json({ status: 'success', message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie(cookieName);
    return res.json({ status: 'success', message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
