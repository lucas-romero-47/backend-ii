const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketCollection = 'Tickets';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(6).toString('hex').toUpperCase()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
});

const TicketModel = mongoose.model(ticketCollection, ticketSchema);

module.exports = TicketModel;
