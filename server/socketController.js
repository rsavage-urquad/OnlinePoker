const ServerPlayer = require("./serverPlayer");
const ClientPlayer = require("./clientPlayer");
const GameRoom = require("./gameRoom");
const _ = require('lodash');

/**
 * SocketController Class - Responsible for handling Socket.io messages (both in and out)
 */
class SocketController {
    constructor (io, socket, rooms) {
        this.io = io;
        this.socket = socket;
        this.rooms = rooms;
    };

    /**
     * 
     * @param {*} data 
     */
    join(data) {
        // Prepare Players for room.
        let players = [];
        if (this.rooms.hasOwnProperty(data.room)) {
            players = this.rooms[data.room].players;
        }

        // Does Player already exist?, if so resume session.
        let playerIdx = this.checkIfPlayerExists(players, data.name.trim(), data.pin);
        if (playerIdx === -1) {
            // New Player - Check to see if a player with the same name exists
            if (this.checkIfPlayerNameExists(players, data.name)) {
                this.socket.emit("joinError", {"errorMsg": "Player Name already exists."});
                return;
            }

            // Add Player 
            let player = new ServerPlayer(data.room, data.name, data.pin, this.socket.id, data.host);
            // Room Setup if necessary
            if (this.rooms.hasOwnProperty(data.room)) {
                // Update Players in Room
                players.push(player);
            }
            else {
                // Create Room
                players = []
                players.push(player);
                this.rooms[data.room] = new GameRoom(data.room, players);
            }
            const hostTag = (player.host) ? " (Host)" : "";
            console.log(`${player.name}${hostTag} - Session Id: ${player.socketId} - Room: ${player.room}`);
        }
        else {
            // Rejoining Player
            players = this.rooms[data.room].players;
            players[playerIdx].socketId = this.socket.id;
        }

        // Notify Player of "join" success
        this.socket.join(data.room); // Join the Socket.io Room.
        this.socket.emit("joinSuccess");

        // Send all players the updated Player List
        this.broadcastPlayerList(data.room);        
    };

    /**
     * checkIfPlayerExists() - Checks if the player already exists (i.e. - Rejoining due to disconnect)
     * @param {Array} players - Array of players associated with the room
     * @param {string} name - Player Name
     * @param {string} pin - Player Pin
     */
    checkIfPlayerExists(players, name, pin) {
        return _.findIndex(players, function(item) { return (item.name === name && item.pin === pin); });
    };

    /**
     * checkIfPlayerNameExists() - Checks to see if a Player name is already used
     * @param {Array} players - Array of players associated with the room
     * @param {string} name - Player Name to check.
     * @returns {boolean} - True is name used, otherwise false;
     */
    checkIfPlayerNameExists(players, name) {
        const nameIdx = _.findIndex(players, function(item) { return (item.name === name); });
        return (nameIdx !== -1);
    };

    /**
     * broadcastPlayerList() - Broadcast the list of players to all current players.
     * @param {string} room - Room Id (Guid)
     */
    broadcastPlayerList(room) {
        let emitPlayerList = [];

        // Make sure Room exists.  If not exit.
        if (!this.rooms.hasOwnProperty(room)) {
            return;
        }   

        // Build the output Client List
        this.rooms[room].players.forEach(element => {
            const clientPlayer = new ClientPlayer(element.room, element.name, element.socketId, element.host, element.dealer, element.buyInAmount, element.amount);
            emitPlayerList.push(clientPlayer);        
        });

        // Emit to this Room's Players
        this.emitToRoom(room, "playerList", { "playerList":  emitPlayerList });
    };

    /**
     * emitToRoom() - Emits a message to each member of a Room
     * @param {*} room - Room to send to.
     * @param {*} messageType - Message Type
     * @param {*} payload - Message Data (Object)
     */
    emitToRoom(room, messageType, payload) {
        this.io.to(room).emit(messageType, payload);
    };

    /**
     * hostCommandSuccess() - Passes the "hostCommandSuccess" message back to the client.
     */
    hostCommandSuccess() {
        this.socket.emit("hostCommandSuccess");
    }

}

module.exports = SocketController;