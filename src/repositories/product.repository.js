const ProductDAO = require('../dao/product.dao');

class ProductRepository {
    constructor() {
        this.dao = new ProductDAO();
    }

    async getAll(filter = {}, options = {}) {
        return await this.dao.getAll(filter, options);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async create(data) {
        return await this.dao.create(data);
    }

    async update(id, data) {
        return await this.dao.update(id, data);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }
}

module.exports = ProductRepository;
