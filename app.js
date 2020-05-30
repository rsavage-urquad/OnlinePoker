const express = require("express");
const app = express();
const server = require("http").Server(app);
const _ = require('lodash');
const SocketController = require("./server/socketController");
const HostController = require("./server/hostController");

let rooms = {};

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.get('/checkHost', function (req, res) {
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
        const hostController = new HostController(socketController, data.room, rooms[data.room].players);
        hostController.processCommand(data.command, data.payload);
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

