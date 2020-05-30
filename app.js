var express = require("express");
var app = express();
var server = require("http").Server(app);
var _ = require('lodash');
const GameRoom = require("./server/gameRoom");
const ServerPlayer = require("./server/serverPlayer");
const ClientPlayer = require("./server/clientPlayer");

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

function onConnect(socket) {

    socket.on("join", function(data) {
        // Prepare Players for room.
        let players = [];
        if (rooms.hasOwnProperty(data.room)) {
            players = rooms[data.room].players;
        }

        // Does Player already exist?, if so resume session.
        playerIdx = checkIfPlayerExists(players, data.name.trim(), data.pin);
        if (playerIdx === -1) {
            // New Player - Check to see if a player with the same name exists
            if (checkIfPlayerNameExists(players, data.name)) {
                socket.emit("joinError", {"errorMsg": "Player Name already exists."});
                return;
            }

            // Add Player 
            let player = new ServerPlayer(data.room, data.name, data.pin, socket.id, data.host);
            // Room Setup if necessary
            if (rooms.hasOwnProperty(data.room)) {
                // Update Players in Room
                players.push(player);
            }
            else {
                // Create Room
                players = []
                players.push(player);
                rooms[data.room] = new GameRoom(data.room, players);
            }
            const hostTag = (player.host) ? " (Host)" : "";
            console.log(`${player.name}${hostTag} - Session Id: ${player.socketId} - Room: ${player.room}`);
        }
        else {
            // Rejoining Player
            players = rooms[data.room].players;
            players[playerIdx].socketId = socket.id;
        }

        // Notify Player of "join" success
        socket.join(data.room); // Join the Socket.io Room.
        socket.emit("joinSuccess");

        // Send all players the updated Player List
        broadcastPlayerList(data.room);        
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

/**
 * checkIfPlayerExists() - Checks if the player already exists (i.e. - Rejoining due to disconnect)
 * @param {Array} players - Array of players associated with the room
 * @param {string} name - Player Name
 * @param {string} pin - Player Pin
 */
function checkIfPlayerExists(players, name, pin) {
    return _.findIndex(players, function(item) { return (item.name === name && item.pin === pin); });
};

/**
 * checkIfPlayerNameExists() - Checks to see if a Player name is already used
 * @param {Array} players - Array of players associated with the room
 * @param {string} name - Player Name to check.
 * @returns {boolean} - True is name used, otherwise false;
 */
function checkIfPlayerNameExists(players, name) {
    const nameIdx = _.findIndex(players, function(item) { return (item.name === name); });
    return (nameIdx !== -1);
}

/**
 * broadcastPlayerList() - Broadcast the list of players to all current players.
 * @param {string} room - Room Id (Guid)
 */
function broadcastPlayerList(room) {
    let players = [];
    let emitPlayerList = [];

    // Load Players to emit
    if (rooms.hasOwnProperty(room)) {
        players = rooms[room].players;
    }   
    else {
        // Room does not exist.
        return;
    }

    players.forEach(element => {
        const clientPlayer = new ClientPlayer(element.room, element.name, element.socketId, element.host, element.dealer, element.buyInAmount, element.amount);
        emitPlayerList.push(clientPlayer);        
    });

    // Emit to this Room's Players
    emitToRoom(room, "playerList", { "playerList":  emitPlayerList });
};

/**
 * emitToRoom() - Emits a message to each member of a Room
 * @param {*} room - Room to send to.
 * @param {*} messageType - Message Type
 * @param {*} payload - Message Data (Object)
 */
function emitToRoom(room, messageType, payload) {
    io.to(room).emit(messageType, payload);
};
