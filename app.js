const express = require("express");
const app = express();
const server = require("http").Server(app);
const _ = require('lodash');
const SocketController = require("./server/socketController");
const HostController = require("./server/hostController");
const DealerController = require("./server/dealerController");
const BetController = require("./server/betController");

let rooms = {};

// Default Page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// Check Host functionality
app.get("/checkHost", function (req, res) {
    const room = req.query.room;
    res.json({ "gotHost": checkForHost(room) })
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(2000);
console.log("Server started");

var io = require("socket.io") (server, {});
io.on('connect', onConnect);

/**
 * onConnect() -Socket.io "connect" processing (command router)
 * @param {Object} socket - Socket
 */
function onConnect(socket) {

    /**
     * "join" - Players joining room.
     */
    socket.on("join", function(data) {
        const socketController = new SocketController(io, socket, rooms);
        socketController.join(data);
    });

    /**
     * "hostCommand" - Host command processing.
     */
    socket.on("hostCommand", function(data) {
        // Make sure Room exists.  If not exit.
        if (!rooms.hasOwnProperty(data.room)) {
            return;
        } 

        const socketController = new SocketController(io, socket, rooms);
        const hostController = new HostController(socketController, rooms[data.room]);
        hostController.processCommand(data.command, data.payload);
    });  

    /**
     * "dealerCommand" - Dealer command processing.
     */
    socket.on("dealerCommand", function(data) {
        // Make sure Room exists.  If not exit.
        if (!rooms.hasOwnProperty(data.room)) {
            return;
        } 

        const socketController = new SocketController(io, socket, rooms);
        const dealerController = new DealerController(socketController, rooms[data.room]);
        rooms[data.room].setDealerController(dealerController);
        dealerController.processCommand(data.command, data.payload);
    });

    /**
     * "betCommand" - Bet command processing.
     */
    socket.on("betCommand", function(data) {
        // Make sure Room exists.  If not exit.
        if (!rooms.hasOwnProperty(data.room)) {
            return;
        } 

        const socketController = new SocketController(io, socket, rooms);
        const betController = new BetController(socketController, rooms[data.room]);
        betController.processCommand(data.command, data.payload);
    });

    /**
     * "connect_error" - Issue with Connection
     */
    socket.on("connect_error", function(err) {
        console.log("Socket IO connect_error: ", err);
    });

    /**
     * "error" - General Issue
     */
    socket.on("error", function(err) {
        console.log("Socket IO error: ", err);
    });
};

/**
 * checkForHost() - Checks to see if a host has already been established for the room.
 * @param {string} room - Room Id
 */
function checkForHost(room) {
    let hasHost;
    let players = [];

    if (rooms.hasOwnProperty(room)) {
        players = rooms[room].players;
        const hostIdx = _.findIndex(players, function(p) { return p.host; });
        hasHost = (hostIdx >= 0);
        return hasHost;            
    }   

    // Room does not exist.
    return false;
};

