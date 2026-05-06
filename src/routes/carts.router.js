const { Router } = require('express');
const passport = require('passport');
const CartModel = require('../dao/models/cart.model');

const router = Router();

const passportJWT = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        if (!user) return res.status(401).json({ status: 'error', message: info?.message || 'No autenticado' });
        req.user = user;
        next();
    })(req, res, next);
};

router.post('/', async (req, res) => {
    try {
        const newCart = await CartModel.create({ products: [] });
        return res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/:cid/product/:pid', passportJWT, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid/product/:pid', passportJWT, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid', passportJWT, async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = [];
        await cart.save();
        return res.json({ status: 'success', message: 'Carrito vaciado', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
