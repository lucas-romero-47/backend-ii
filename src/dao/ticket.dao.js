const TicketModel = require('./models/ticket.model');

class TicketDAO {
    async create(data) {
        return await TicketModel.create(data);
    }

    async getById(id) {
        return await TicketModel.findById(id);
    }

    async getByPurchaser(email) {
        return await TicketModel.find({ purchaser: email });
    }
}

module.exports = TicketDAO;
