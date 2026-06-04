const ProductModel = require('./models/product.model');

class ProductDAO {
    async getAll(filter = {}, options = {}) {
        let query = ProductModel.find(filter);

        if (options.sort) {
            query = query.sort(options.sort);
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.skip) {
            query = query.skip(options.skip);
        }

        return await query.lean();
    }

    async getById(id) {
        return await ProductModel.findById(id);
    }

    async create(data) {
        return await ProductModel.create(data);
    }

    async update(id, data) {
        return await ProductModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await ProductModel.findByIdAndDelete(id);
    }
}

module.exports = ProductDAO;
