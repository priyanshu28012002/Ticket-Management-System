const mongoose = require("mongoose");
const EmployeeSchema = new mongoose.Schema({
  name: String,
  employeeId: String,
  email: String,
  department: String,
  password: String,
});

const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;