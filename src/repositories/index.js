const UserRepository = require('./user.repository');
const ProductRepository = require('./product.repository');
const CartRepository = require('./cart.repository');
const TicketRepository = require('./ticket.repository');

module.exports = {
    userRepository: new UserRepository(),
    productRepository: new ProductRepository(),
    cartRepository: new CartRepository(),
    ticketRepository: new TicketRepository()
};
