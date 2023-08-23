const mongoose = require("mongoose");
const SolverSchema = new mongoose.Schema({
  name: String,
  solverId: String,
  email: String,
  categorie: String,
  password: String,
});

const Solver = mongoose.model("Solver", SolverSchema);

module.exports = Solver;