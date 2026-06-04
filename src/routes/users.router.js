const { Router } = require('express');
const { passportCall, authorization } = require('../middlewares/auth');
const { userRepository } = require('../repositories');
const { createHash } = require('../utils/utils');
const UserDTO = require('../dto/user.dto');

const router = Router();

router.get('/', passportCall('current'), async (req, res) => {
    try {
        const users = await userRepository.getAll();
        const usersDto = users.map(user => new UserDTO(user));
        return res.json({ status: 'success', payload: usersDto });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:uid', passportCall('current'), async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userRepository.getById(uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        const userDto = new UserDTO(user);
        return res.json({ status: 'success', payload: userDto });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:uid', passportCall('current'), async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = createHash(updateData.password);
        }

        if (updateData.email) {
            const existingUser = await userRepository.getByEmail(updateData.email);
            if (existingUser && existingUser._id.toString() !== uid) {
                return res.status(400).json({ status: 'error', message: 'El email ya está en uso' });
            }
        }

        const updatedUser = await userRepository.update(uid, updateData);
        if (!updatedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        const userDto = new UserDTO(updatedUser);
        return res.json({ status: 'success', message: 'Usuario actualizado', payload: userDto });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:uid', passportCall('current'), async (req, res) => {
    try {
        const { uid } = req.params;
        const deletedUser = await userRepository.delete(uid);
        if (!deletedUser) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        return res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
