const mongoose = require("mongoose");
const TicketsSchema = new mongoose.Schema({
    employeeId: String,
    ticketId: String,
    name: String,
    email: String,
    department: String,
    problemDescription: String,
    status: String,
    solution: String,
    createdAt: {
        type: Date,
        default: Date.now // Set the default value to the current date and time
    }
});

const Tickets = mongoose.model("Tickets", TicketsSchema);

module.exports = Tickets;
