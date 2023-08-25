const express = require("express");
const bodyParser = require('body-parser');
const session = require("express-session");
const path = require("path");
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const http = require('http')
const app = express();

const db = require("./models/db");
const ClientModel = require("./models/Client");
const { generateKey } = require("crypto");
const TicketsModel = require("./models/Tickets");
const SolverModel = require("./models/Solver");
const EmployeeModel = require("./models/Employee");
const MessageModel = require("./models/Message");

// Socket connection 
// const server = http.createServer(app);
// const io = socketIO(server);
// console.log(io);
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

const server = http.createServer(app);
const io = socketIO(server);
console.log(io);

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('join', (room) => {
//         socket.join(room);
//         console.log(`User joined room ${room}`);
//     });

//     socket.on('leave', (room) => {
//         socket.leave(room);
//         console.log(`User left room ${room}`);
//     });

//     socket.on('message', async ({ room, message }) => {
//         const newMessage = new Message({ room, text: message });
//         await newMessage.save();
//         io.to(room).emit('message', { room, message });
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

app.get("/", function (req, res) {
    res.render("index");

});

app.get("/employeeLogin", function (req, res) {
    res.render("employeeLogin", { error: null });
});

app.post("/employeeLogin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await EmployeeModel.findOne({ email, password });
        if (user) {
            req.session.isLoggedIn = true;
            req.session.email = email;

            // Retrieve additional client data from the database
            const employeeData = await EmployeeModel.findOne({ email });
            if (employeeData) {
                const { name, employeeId, department } = employeeData;
                req.session.employeeId = employeeId;
                req.session.name = name;
                req.session.department = department;
                res.redirect("/employeeDashboard");
                // Render the clientDashboard template with client data
                //  res.render("clientDashboard", { name:name, clientId:clientId });
            } else {
                res.render("employeeLogin", { error: "Employee data not found" });
            }
        } else {
            res.render("employeeLogin", { error: "Invalid username or password" });
        }
    } catch (err) {
        res.render("employeeLogin", { error: "An error occurred" });
    }
});

// app.get("/signup", function (req, res) {
//     res.render("signup", { error: null });
// });

// app.post("/signup", async function (req, res) {
//     const { name, email, password } = req.body;
//     try {
//         clientId = generateClientId(name);
//         console.log("the client id is " + clientId)
//         try {
//             const existingUser = await ClientModel.findOne({ email });
//             if (existingUser) {
//                 res.render("signup", { error: "Email is already registered" });
//             } else {
//                 const newUser = await ClientModel.create({ name, clientId, email, password });
//                 req.session.isLoggedIn = true;
//                 req.session.email = email;
//                 req.session.clientId = clientId;
//                 req.session.name = name;
//                 res.redirect("/clientDashboard");

//             } 
//         } catch (error) {
//             res.render("signup", { error: "An error occurred" });
//         }

//     }
//     catch {
//         res.render("signup", { error: "Try again some thing Went wrong" });
//     }

// });

// app.get("/clientDashboard", async function (req, res) {
//     if (!req.session.isLoggedIn) {
//         res.redirect("/login");
//     } else {
//         try {
//             const clientId = req.session.clientId;
//             const name = req.session.name;
//             // Fetch the user's previous tickets from the database
//             const previousTickets = await TicketsModel.find({ clientId: req.session.clientId });

//             // Render the clientDashboard template and pass the previousTickets data
//             res.render("clientDashboard", { name, clientId, previousTickets });
//         } catch (err) {
//             console.error("Error:", err);
//             res.status(500).send("An error occurred");
//         }
//     }
// });

app.get("/employeeDashboard", async function (req, res) {
    if (!req.session.isLoggedIn) {
        res.redirect("/employeeLogin");
    } else {
        try {
            const employeeId = req.session.employeeId;
            const name = req.session.name;
            const email = req.session.email;
            const department = req.session.department;
            // Fetch the user's previous tickets from the database
            const previousTickets = await TicketsModel.find({ employeeId: req.session.employeeId });

            // Render the clientDashboard template and pass the previousTickets data
            res.render("employeeDashboard", { name, employeeId, previousTickets, department });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send("An error occurred");
        }
    }
});

app.get("/departmentDashboard", async function (req, res) {
    if (!req.session.isLoggedIn) {
        res.redirect("/employeeLogin");
    } else {
        try {
            const employeeId = req.session.employeeId;
            const name = req.session.name;
            const department = req.session.department;
            // Fetch the user's previous tickets from the database
            const previousTickets = await TicketsModel.find({ department: req.session.department });
            const previousChat = await MessageModel.find();
            // io.on('connection', (socket) => {
            //     console.log('A user connected');

            //     socket.on('join', (ticketId) => {
            //         socket.join(ticketId);
            //         console.log(`User joined room ${ticketId}`);
            //     });

            //     socket.on('leave', (ticketId) => {
            //         socket.leave(ticketId);
            //         console.log(`User left room ${ticketId}`);
            //     });

            //     socket.on('message', async ({ ticketId, message }) => {
            //         const currentDate = new Date();
            //         const newMessage = await MessageModel.create({
            //             ticketId,
            //             employeeId,
            //             name,
            //             department,
            //             message,
            //             createdAt: currentDate // Store the current date and time
            //         });
        
            //         await newMessage.save();
            //         // const newMessage = new Message({ room, text: message });
            //         // await newMessage.save();
            //        // saveMessage(ticketId, message);
            //        console.log(ticketId, message)
            //         io.to(ticketId).emit('message', { ticketId, message });
            //     });

            //     socket.on('disconnect', () => {
            //         console.log('A user disconnected');
            //     });
            // });
            // const employeeId = req.session.employeeId;
            // const name = req.session.name;
            // const department = req.session.department;
            // // Fetch the user's previous tickets from the database
            // const previousTickets = await TicketsModel.find({ department: req.session.department });

            // Render the clientDashboard template and pass the previousTickets data
            console.log(previousChat)
            res.render("departmentDashboard", { name, employeeId, previousTickets, department ,previousChat});
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send("An error occurred");
        }
    }
});

app.post("/newTicketForm", async function (req, res) {
    if (!req.session.isLoggedIn) {
        res.redirect("/employeeLogin");
    } else {
        try {
            const ticketId = generateTicketId();
            const employeeId = req.session.employeeId;
            const name = req.session.name;
            const email = req.session.email;
            const { department, problemDescription } = req.body;
            const status = "Pending";
            const solution = "";

            // Get the current date and time
            const currentDate = new Date();

            console.log(ticketId, employeeId, name, email, department, problemDescription, status, solution)

            // Create a new ticket with the current date and time
            const newTicket = await TicketsModel.create({
                ticketId,
                employeeId,
                name,
                email,
                department,
                problemDescription,
                status,
                solution,
                createdAt: currentDate // Store the current date and time
            });

            await newTicket.save();

            // Set the newTicketSubmitted flag in the session
            req.session.newTicketSubmitted = true;
            res.redirect("/employeeDashboard");
        }
        catch (err) {
            console.error("Error:", err);
            res.status(500).send("An error occurred");
        }
    }
});


// app.post("/newTicketForm", async function (req, res) {
//     if (!req.session.isLoggedIn) {
//         res.redirect("/employeeLogin");
//     } else {
//         try {
//             const ticketId = generateTicketId();
//             const employeeId = req.session.employeeId;
//             const name = req.session.name;
//             const email = req.session.email;
//             const { department, problemDescription } = req.body;
//             const status = "Pending";
//             const solution = "";
//             console.log(ticketId, employeeId, name, email, department, problemDescription, status, solution)
//             const newTicket = await TicketsModel.create({ ticketId, employeeId, name, email, department, problemDescription, status, solution });
//             await newTicket.save();
//             // Set the newTicketSubmitted flag in the session
//             req.session.newTicketSubmitted = true;
//             res.redirect("/employeeDashboard");
//         }
//         catch (err) {
//             console.error("Error:", err);
//             res.status(500).send("An error occurred");
//         }
//     }
// })

// app.get("/solverSignup", function (req, res) {
//     res.render("solverSignup", { error: null });
// })

// app.post("/solverSignup", async function (req, res) {
//     const { name, email, categorie, password } = req.body;

//     try {
//         const solverId = generateSolverId(name);
//         console.log("the Solver id is " + solverId);

//         console.log(name, solverId, email, categorie, password);

//         const existingUser = await SolverModel.findOne({ email });

//         if (existingUser) {
//             return res.render("signup", { error: "Email is already registered" });
//         }

//         const newUser = await SolverModel.create({
//             name,
//             solverId,
//             email,
//             categorie,
//             password
//         });

//         req.session.isLoggedIn = true;
//         req.session.email = email;
//         req.session.solverId = solverId;
//         req.session.categories = categorie;
//         req.session.name = name;

//         return res.render("admin");
//     } catch (error) {
//         console.error("Error:", error);
//         return res.render("solverSignup", { error: "An error occurred" });
//     }
// });

app.get("/employeeSignup", function (req, res) {
    res.render("employeeSignup", { error: null });
})

app.post("/employeeSignup", async function (req, res) {
    const { name, email, department, password } = req.body;

    try {
        const employeeId = generateemployeeId(name);
        console.log("the Solver id is " + employeeId);

        console.log(name, employeeId, email, department, password);

        const existingUser = await EmployeeModel.findOne({ email });

        if (existingUser) {
            return res.render("employeeSignup", { error: "Email is already registered" });
        }

        const newUser = await EmployeeModel.create({
            name,
            employeeId,
            email,
            department,
            password
        });

        req.session.isLoggedIn = true;
        req.session.email = email;
        req.session.employeeId = employeeId;
        req.session.department = department;
        req.session.name = name;

        return res.render("admin");
    } catch (error) {
        console.error("Error:", error);
        return res.render("employeeSignup", { error: "An error occurred" });
    }
});

// app.get("/solverLogin", function (req, res) {
//     res.render("solverLogin", { error: null });
// });

// app.post("/solverLogin", async function (req, res) {
//     const email = req.body.email;
//     const password = req.body.password;

//     try {
//         const user = await SolverModel.findOne({ email, password });

//         if (user) {
//             req.session.isLoggedIn = true;
//             req.session.email = email;

//             // Retrieve additional solver data from the database
//             const solverData = await SolverModel.findOne({ email });

//             if (solverData) {
//                 const { name, solverId, categorie } = solverData;
//                 console.log("the data id " + categorie)
//                 req.session.solverId = solverId;
//                 req.session.name = name;
//                 req.session.categorie = categorie;
//                 res.redirect("/solverDashboard");
//             } else {
//                 res.render("solverLogin", { error: "Solver data not found" });
//             }
//         } else {
//             res.render("solverLogin", { error: "Invalid username or password" });
//         }
//     } catch (err) {
//         console.error("Error:", err);
//         res.render("solverLogin", { error: "An error occurred" });
//     }
// });

// app.get("/solverDashboard", async function (req, res) {
//     if (!req.session.isLoggedIn) {
//         res.redirect("/solverLogin");
//     } else {
//         try {
//             console.log("i am here")
//             const categories = req.session.categorie;
//             const tickets = await TicketsModel.find({ categories });
//             console.log(tickets)
//             res.render("solverDashboard", { tickets: tickets });
//         } catch (err) {
//             res.status(500).send(err);
//         }
//     }
// });

// app.post("/updateTicketStatus", async function (req, res) {
//     if (!req.session.isLoggedIn) {
//         return res.redirect("/solverLogin");
//     }

//     const ticketId = req.body.ticketId;
//     const newStatus = req.body.newStatus;

//     try {
//         // Update the ticket status
//         await TicketsModel.updateOne({ ticketId: ticketId }, { status: newStatus });

//         res.redirect("/solverDashboard");
//     } catch (err) {
//         console.error("Error:", err);
//         res.render("solverDashboard", { error: "An error occurred" });
//     }
// });

// app.post("/addSolution", async function (req, res) {
//     if (!req.session.isLoggedIn) {
//         return res.redirect("/solverLogin");
//     }

//     const ticketId = req.body.ticketId;
//     const solution = req.body.solution;

//     try {
//         // Update the ticket's solution
//         await TicketsModel.updateOne({ ticketId: ticketId }, { solution: solution });

//         res.redirect("/solverDashboard");
//     } catch (err) {
//         console.error("Error:", err);
//         res.render("solverDashboard", { error: "An error occurred" });
//     }
// });

app.post("/updateTicket", async function (req, res) {
    if (!req.session.isLoggedIn) {
        return res.redirect("/employeeLogin");
    }

    const ticketId = req.body.ticketId;
    const newStatus = req.body.newStatus;
    const solution = req.body.solution;

    try {
        // Update the ticket status and solution
        await TicketsModel.updateOne(
            { ticketId: ticketId },
            { status: newStatus, solution: solution }
        );

        res.redirect("/departmentDashboard");
    } catch (err) {
        console.error("Error:", err);
        res.render("departmentDashboard", { error: "An error occurred" });
    }
});


app.get("/adminLogin", function (req, res) {
    res.render("adminLogin", { error: null });
})

app.post("/adminLogin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        if (email === "10" && password === "10") {
            req.session.isLoggedIn = true;
            req.session.email = email;
            res.render("admin");
        } else {
            res.render("adminLogin", { error: "Invalid username or password" });
        }
    } catch (err) {
        res.render("adminLogin", { error: "An error occurred" });
    }
});

app.get("/admin", async function (req, res) {
    if (!req.session.isLoggedIn) {
        res.redirect("/adminLogin");
    } else {
        res.render("admin");
    }
})

// chat server
// io.on('connection', (socket) => {
//     console.log('User connected');
//     // Handle chat messages
//     socket.on('chatMessage', (data) => {
//         // Process the message data (e.g., store in a database)

//         // Broadcast the message to all connected clients
//         io.emit('chatMessage', data.message);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// app.js
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Handle chat events
//     socket.on('chat message', (msg) => {
//         // Broadcast the message to clients in the same department
//         const userDepartment = getUserDepartment(); // Implement your logic to get the user's department
//         socket.to(userDepartment).emit('chat message', msg);
//     });

//     // Join user to department room
//     socket.on('join department', (department) => {
//         socket.join(department);
//     });

//     // Handle disconnect
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });


// app.post("/chat", (req, res) => {
//     const { ticketId, message } = req.body;

//     // Emit the message to the ticket's room
//     io.to(ticketId).emit("chatMessage", message);

//     // Respond with a success status
//     res.sendStatus(404);
// });
console.log("hipchat");
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('join', (room) => {
//         socket.join(room);
//         console.log(`User joined room ${room}`);
//     });

//     socket.on('leave', (room) => {
//         socket.leave(room);
//         console.log(`User left room ${room}`);
//     });

//     socket.on('message', async ({ room, message }) => {
//         const newMessage = new Message({ room, text: message });
//         await newMessage.save();
//         io.to(room).emit('message', { room, message });
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

//  io.on('connection', (socket) => {
//                 console.log('A user connected');

//                 socket.on('join', (ticketId) => {
//                     socket.join(ticketId);
//                     console.log(`User joined room ${ticketId}`);
//                 });

//                 socket.on('leave', (ticketId) => {
//                     socket.leave(ticketId);
//                     console.log(`User left room ${ticketId}`);
//                 });

//                 socket.on('message', async ({ ticketId, message }) => {
//                     const currentDate = new Date();
//                     const newMessage = await MessageModel.create({
//                         ticketId,
//                         employeeId,
//                         name,
//                         department,
//                         message,
//                         createdAt: currentDate // Store the current date and time
//                     });
        
//                     await newMessage.save();
//                     // const newMessage = new Message({ room, text: message });
//                     // await newMessage.save();
//                    // saveMessage(ticketId, message);
//                    console.log(ticketId, message)
//                     io.to(ticketId).emit('message', { ticketId, message });
//                 });

//                 socket.on('disconnect', () => {
//                     console.log('A user disconnected');
//                 });
//             });

// Function to set up Socket.IO connections
function setupSocketIO(socket) {
    socket.on('join', (ticketId) => {
        socket.join(ticketId);
        console.log(`User joined room ${ticketId}`);
    });

    socket.on('leave', (ticketId) => {
        socket.leave(ticketId);
        console.log(`User left room ${ticketId}`);
    });

    socket.on('message', async ({ ticketId, message }) => {
        const currentDate = new Date();
        
        const newMessage = await MessageModel.create({
            ticketId,
           // employeeId,
            //name,
           // department,
            message,
            createdAt: currentDate // Store the current date and time
        });

        await newMessage.save();
        console.log(ticketId, message);
        io.to(ticketId).emit('message', { ticketId, message });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Check if the user is logged in
    // if (!socket.request.session.isLoggedIn) {
    //     console.log('User not logged in');
    //     socket.disconnect();
    //     return;
    // }

    setupSocketIO(socket);
});



//Logout route to clear session and redirect to login page
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

app.get('/getPreviousChat', async (req, res) => {
    const selectedTicketId = req.query.ticketId;

    try {
        const previousChat = await MessageModel.find({ ticketId: selectedTicketId });
        res.json(previousChat);
    } catch (error) {
        console.error('Error fetching previous chat:', error);
        res.status(500).json({ error: 'An error occurred while fetching previous chat.' });
    }
});

db.init()
    .then(function () {
        console.log("Database connected");

        server.listen(3000, function () {
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

function generateSolverId(name) {
    const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    return `@${name}${randomNumber}`;
}

function generateTicketId() {
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    return randomNumber;
}



function generateemployeeId() {
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    return randomNumber;
}



async function saveMessage(ticketId, message) {
    if (!req.session.isLoggedIn) {
        res.redirect("/employeeLogin");
    } else {
        try {
            const employeeId = req.session.employeeId;
            const name = req.session.name;
            const department = req.session.department;
            const currentDate = new Date();

            console.log(ticketId, employeeId, name, department, message, currentDate)

            // Create a new ticket with the current date and time
            const newMessage = await MessageModel.create({
                ticketId,
                employeeId,
                name,
                department,
                message,
                createdAt: currentDate // Store the current date and time
            });

            await newMessage.save();

        }
        catch (err) {
            console.error(err);
        }
    }
}