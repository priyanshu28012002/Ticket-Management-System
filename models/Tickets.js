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
  //clientId,name,email,categories, problemDescription
});

const Tickets = mongoose.model("Tickets", TicketsSchema);

module.exports = Tickets;