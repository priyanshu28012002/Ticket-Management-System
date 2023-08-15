const mongoose = require("mongoose");
module.exports.init = async function () {
  await mongoose.connect(
  //  const uri = "mongodb+srv://yashu:<password>@cluster0.di5wr92.mongodb.net/?retryWrites=true&w=majority";
  "mongodb+srv://yashu:PYfpfmRhjUhTl10D@cluster0.di5wr92.mongodb.net/?retryWrites=true&w=majority");
    
   // "mongodb+srv://yashu:PYfpfmRhjUhTl10D@cluster0.di5wr92.mongodb.net/?retryWrites=true&w=majority");
   //await mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
   //
};
