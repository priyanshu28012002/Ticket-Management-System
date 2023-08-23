const mongoose = require("mongoose");
const ClientSchema = new mongoose.Schema({
  name: String,
  clientId: String,
  email: String,
  password: String,
});

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;