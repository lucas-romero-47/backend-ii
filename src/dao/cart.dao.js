const CartModel = require('./models/cart.model');

class CartDAO {
    async getById(id) {
        return await CartModel.findById(id);
    }

    async getByIdPopulated(id) {
        return await CartModel.findById(id).populate('products.product');
    }

    async create() {
        return await CartModel.create({ products: [] });
    }

    async update(id, data) {
        return await CartModel.findByIdAndUpdate(id, data, { new: true });
    }

    async save(cart) {
        return await cart.save();
    }
}

module.exports = CartDAO;
