const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  sender: String,
  employeeId: String,
  ticketId: String,
  department: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now // Set the default value to the current date and time
}
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;