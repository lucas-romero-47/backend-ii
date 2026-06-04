const TicketDAO = require('../dao/ticket.dao');

class TicketRepository {
    constructor() {
        this.dao = new TicketDAO();
    }

    async create(data) {
        return await this.dao.create(data);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async getByPurchaser(email) {
        return await this.dao.getByPurchaser(email);
    }
}

module.exports = TicketRepository;
