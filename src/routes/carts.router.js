const { Router } = require('express');
const { passportCall, authorization } = require('../middlewares/auth');
const { cartRepository, productRepository, ticketRepository } = require('../repositories');
const mailService = require('../services/mail.service');

const router = Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartRepository.create();
        return res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartRepository.getByIdPopulated(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Solo user puede agregar productos al carrito
router.post('/:cid/product/:pid', passportCall('current'), authorization('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartRepository.addProduct(cid, pid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid/product/:pid', passportCall('current'), authorization('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartRepository.removeProduct(cid, pid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        return res.json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid', passportCall('current'), authorization('user'), async (req, res) => {
    try {
        const cart = await cartRepository.clearCart(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        return res.json({ status: 'success', message: 'Carrito vaciado', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Endpoint de compra - Solo user
router.post('/:cid/purchase', passportCall('current'), authorization('user'), async (req, res) => {
    try {
        const { cid } = req.params;

        // 1. Obtener carrito con productos populados
        const cart = await cartRepository.getByIdPopulated(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        if (cart.products.length === 0) {
            return res.status(400).json({ status: 'error', message: 'El carrito está vacío' });
        }

        const productsWithStock = [];     // Productos que SÍ se pueden comprar
        const productsWithoutStock = [];  // Productos que NO tienen stock suficiente
        let totalAmount = 0;

        // 2. Verificar stock de cada producto
        for (const item of cart.products) {
            const product = item.product;

            if (!product) {
                productsWithoutStock.push(item);
                continue;
            }

            if (product.stock >= item.quantity) {
                productsWithStock.push(item);
                totalAmount += product.price * item.quantity;
            } else {
                productsWithoutStock.push(item);
            }
        }

        if (productsWithStock.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Ningún producto tiene stock suficiente',
                productsWithoutStock: productsWithoutStock.map(p => p.product?._id || p.product)
            });
        }

        // 3. Descontar stock de los productos comprados
        for (const item of productsWithStock) {
            const product = await productRepository.getById(item.product._id);
            await productRepository.update(product._id, {
                stock: product.stock - item.quantity
            });
        }

        // 4. Crear ticket
        const ticket = await ticketRepository.create({
            amount: totalAmount,
            purchaser: req.user.email
        });

        // 5. Actualizar carrito: dejar solo los productos no procesados
        const cartDoc = await cartRepository.getById(cid);
        cartDoc.products = productsWithoutStock.map(item => ({
            product: item.product._id || item.product,
            quantity: item.quantity
        }));
        await cartRepository.save(cartDoc);

        // 6. Enviar email con el ticket
        await mailService.sendPurchaseEmail(req.user.email, ticket);

        // 7. Respuesta
        const response = {
            status: 'success',
            message: productsWithoutStock.length > 0
                ? 'Compra parcial realizada. Algunos productos no tenían stock suficiente.'
                : 'Compra realizada exitosamente',
            payload: {
                ticket,
                productsNotProcessed: productsWithoutStock.map(p => p.product?._id || p.product)
            }
        };

        return res.json(response);
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
