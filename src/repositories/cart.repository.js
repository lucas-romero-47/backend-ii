const CartDAO = require('../dao/cart.dao');

class CartRepository {
    constructor() {
        this.dao = new CartDAO();
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async getByIdPopulated(id) {
        return await this.dao.getByIdPopulated(id);
    }

    async create() {
        return await this.dao.create();
    }

    async addProduct(cartId, productId) {
        const cart = await this.dao.getById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        return await this.dao.save(cart);
    }

    async removeProduct(cartId, productId) {
        const cart = await this.dao.getById(cartId);
        if (!cart) return null;

        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        return await this.dao.save(cart);
    }

    async clearCart(cartId) {
        const cart = await this.dao.getById(cartId);
        if (!cart) return null;

        cart.products = [];
        return await this.dao.save(cart);
    }

    async update(cartId, data) {
        return await this.dao.update(cartId, data);
    }

    async save(cart) {
        return await this.dao.save(cart);
    }
}

module.exports = CartRepository;
