const mongoose = require('mongoose');

const cartCollection = 'Carts';

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products'
                },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: []
    }
});

const CartModel = mongoose.model(cartCollection, cartSchema);

module.exports = CartModel;
