const { Router } = require('express');
const passport = require('passport');
const ProductModel = require('../dao/models/product.model');

const router = Router();

const passportJWT = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        if (!user) return res.status(401).json({ status: 'error', message: info?.message || 'No autenticado' });
        req.user = user;
        next();
    })(req, res, next);
};

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = {};
        if (query) {
            filter.category = query;
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const products = await ProductModel.paginate
            ? await ProductModel.find(filter).limit(options.limit).skip((options.page - 1) * options.limit).sort(options.sort).lean()
            : await ProductModel.find(filter).lean();

        return res.json({ status: 'success', payload: products });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', payload: product });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/', passportJWT, async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const newProduct = await ProductModel.create({
            title, description, code, price,
            status: status !== undefined ? status : true,
            stock, category,
            thumbnails: thumbnails || []
        });

        return res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:pid', passportJWT, async (req, res) => {
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:pid', passportJWT, async (req, res) => {
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(req.params.pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
