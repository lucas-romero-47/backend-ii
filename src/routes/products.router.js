const { Router } = require('express');
const { passportCall, authorization } = require('../middlewares/auth');
const { productRepository } = require('../repositories');

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = {};
        if (query) {
            filter.category = query;
        }

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit)
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const products = await productRepository.getAll(filter, options);

        return res.json({ status: 'success', payload: products });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productRepository.getById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', payload: product });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Solo admin puede crear productos
router.post('/', passportCall('current'), authorization('admin'), async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const newProduct = await productRepository.create({
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

// Solo admin puede actualizar productos
router.put('/:pid', passportCall('current'), authorization('admin'), async (req, res) => {
    try {
        const updatedProduct = await productRepository.update(req.params.pid, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Solo admin puede eliminar productos
router.delete('/:pid', passportCall('current'), authorization('admin'), async (req, res) => {
    try {
        const deletedProduct = await productRepository.delete(req.params.pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        return res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
