const express = require("express");
const bodyParser = require('body-parser');
const session = require("express-session");
const path = require("path");
const mongoose = require('mongoose');

const app = express();
const db = require("./models/db");
const ClientModel = require("./models/Client");
const { generateKey } = require("crypto");
const TicketsModel = require("./models/Tickets");

// Static folder for serving HTML, CSS, JS, and other assets
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "public/views"));// Set the views directory
// Setup sessions
app.use(session({
    secret: "a",
    resave: false,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
  });

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("index");
    
});

app.get("/login", function (req, res) {
    res.render("login",{error:null});
});

app.post("/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await ClientModel.findOne({ email, password });
        if (user) {
            req.session.isLoggedIn = true;
            req.session.email = email;

            // Retrieve additional client data from the database
            const clientData = await ClientModel.findOne({ email });
            if (clientData) {
                const { name, clientId } = clientData;
                req.session.clientId = clientId;
                req.session.name = name;
                res.redirect("/clientDashboard");
                // Render the clientDashboard template with client data
              //  res.render("clientDashboard", { name:name, clientId:clientId });
            } else {
                res.render("login", { error: "Client data not found" });
            }
        } else {
            res.render("login", { error: "Invalid username or password" });
        }
    } catch (err) {
        res.render("login", { error: "An error occurred" });
    }
});

app.get("/signup",function(req,res){
    res.render("signup", { error: null });
  });
  
app.post("/signup", async function (req, res) {
    const { name, email, password} = req.body;
    try{
        clientId = generateClientId(name);
    console.log("the client id is "+clientId)
    try {
        const existingUser = await ClientModel.findOne({ email });
        if (existingUser) {
            res.render("signup", { error: "Email is already registered" });
        } else {
            const newUser = await ClientModel.create({ name,clientId,email, password });
            req.session.isLoggedIn = true;
            req.session.email = email;
            req.session.clientId = clientId;
            req.session.name = name;
            res.redirect("/clientDashboard");
     
        }
    } catch (error) {
        res.render("signup", { error: "An error occurred" });
    }

    }
    catch{
        res.render("signup", { error: "Try again some thing Went wrong" });
    }
    
});

app.get("/clientDashboard", async function (req, res) {
    if (!req.session.isLoggedIn) {
        res.redirect("/login");
    } else {
        try {
            const clientId = req.session.clientId;
            const name = req.session.name;
            // Fetch the user's previous tickets from the database
            const previousTickets = await TicketsModel.find({ clientId: req.session.clientId });

            // Render the clientDashboard template and pass the previousTickets data
            res.render("clientDashboard", { name, clientId, previousTickets });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send("An error occurred");
        }
    }
});


app.post("/newTicketForm",async function(req,res){
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
    } else 
    {
    try{
        const ticketId = generateTicketId();        
        const clientId = req.session.clientId;
        const name = req.session.name;
        const email = req.session.email;
        const { categories, problemDescription} = req.body;
        const status = "Pending";
        const solution = "";
        console.log(ticketId,clientId,name,email,categories, problemDescription,status,solution)
        const newTicket = await TicketsModel.create({ ticketId,clientId,name,email,categories, problemDescription,status,solution });
        await newTicket.save();
        // Set the newTicketSubmitted flag in the session
        req.session.newTicketSubmitted = true;
        res.redirect("/clientDashboard");
    }
    catch (err){
        res.status(500).send("An error occurred");
    }
  }
})  
//Logout route to clear session and redirect to login page
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      }
      res.redirect("/login");
    });
  });

db.init()
    .then(function () {
        console.log("Database connected");

        app.listen(3000, function () {
            console.log("Server is running on port 3000");
        });
    })
    .catch(function (err) {
        console.error(err);
    });


//     Helper Function 


function generateClientId(name) {
    const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    return `@${name}${randomNumber}`;
}

function generateTicketId() {
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    return randomNumber;
}
