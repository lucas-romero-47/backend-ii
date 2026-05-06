const { Router } = require('express');
const passport = require('passport');
const UserModel = require('../dao/models/user.model');
const { createHash } = require('../utils/utils');

const router = Router();

const passportJWT = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: info?.message || 'No autenticado' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

router.get('/', passportJWT, async (req, res) => {
    try {
        const users = await UserModel.find().select('-password');
        return res.json({ status: 'success', payload: users });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:uid', passportJWT, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await UserModel.findById(uid).select('-password');
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        return res.json({ status: 'success', payload: user });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:uid', passportJWT, async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = createHash(updateData.password);
        }

        if (updateData.email) {
            const existingUser = await UserModel.findOne({ email: updateData.email, _id: { $ne: uid } });
            if (existingUser) {
                return res.status(400).json({ status: 'error', message: 'El email ya está en uso' });
            }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(uid, updateData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        return res.json({ status: 'success', message: 'Usuario actualizado', payload: updatedUser });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:uid', passportJWT, async (req, res) => {
    try {
        const { uid } = req.params;
        const deletedUser = await UserModel.findByIdAndDelete(uid);
        if (!deletedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        return res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
