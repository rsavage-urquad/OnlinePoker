var express = require("express");
var app = express();
var server = require("http").Server(app);
var _ = require('lodash');
const GameRoom = require("./server/gameRoom");
const ServerPlayer = require("./server/serverPlayer");
const ClientPlayer = require("./server/clientPlayer");

let players = [];

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
        // Does Player already exist?, if so resume session.
        playerIdx = checkIfUserExists(data.room, data.name, data.pin);
        if (playerIdx === -1) {
            // New Player
            // TODO: RS - Use Random Number for Key to Player Dictionary
            let player = new ServerPlayer(data.room, data.name, data.pin, socket.id, data.host);
            players.push(player);
            const hostTag = (player.host) ? " (Host)" : "";
            console.log(`${player.name}${hostTag} - Session Id: ${player.socketId} - Room: ${player.room}`);
        }
        else {
            // Rejoining Player
            players[playerIdx].socketId = socket.id;
        }
        broadcastPlayerList(data.room);        
    });
};

/**
 * checkForHost() - Checks to see if a host has already been established for the room.
 * @param {string} room - Room Id
 */
function checkForHost(room) {
    let hasHost;
    const hostIdx = _.findIndex(players, function(p) { return ((p.room === room) && (p.host)); });
    hasHost = (hostIdx >= 0);
    return hasHost;    
};

/**
 * checkIfUserExists() - Checks if the player already exists (i.e. - Rejoining due to disconnect)
 * @param {string} room - Room Id
 * @param {string} name - Player Name
 * @param {string} pin - Player Pin
 */
function checkIfUserExists(room, name, pin) {
    return _.findIndex(players, function(item) { return (item.room === room && item.name === name && item.pin === pin); });
};

/**
 * broadcastPlayerList() - Broadcast the list of players to all current players.
 * @param {string} room - Room Id (Guid)
 */
function broadcastPlayerList(room) {
    var playerList = [];

    players.forEach(element => {
        if (element.room === room) {
            const clientPlayer = new ClientPlayer(element.room, element.name, element.socketId, element.host, element.dealer, element.buyInAmount, element.amount);
            playerList.push(clientPlayer);        
        }
    });

    io.emit("playerList", { "playerList":  playerList });
};
