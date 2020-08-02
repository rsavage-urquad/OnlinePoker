const Player = require("./Player");
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


    // ************************************************************************************************
    // General Methods
    // ************************************************************************************************

    /**
     * join() - Handles a player joining a room.
     * @param {Object} data - Socket payload
     */
    join(data) {
        let isRejoin = false;

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
            let player = new Player(data.room, data.name, data.pin, this.socket.id, data.host);
            // Room Setup if necessary
            if (this.rooms.hasOwnProperty(data.room)) {
                // Update Players in Room
                players.push(player);
            }
            else {
                // Create Room
                players = []
                players.push(player);
                this.rooms[data.room] = new GameRoom(this, data.room, players);
            }
            const hostTag = (player.host) ? " (Host)" : "";
            console.log(`${player.name}${hostTag} - Session Id: ${player.socketId} - Room: ${player.room}`);
        }
        else {
            // Rejoining Player
            players = this.rooms[data.room].players;
            players[playerIdx].socketId = this.socket.id;
            isRejoin = true;          
        }

        // Notify Player of "join" success
        this.socket.join(data.room); // Join the Socket.io Room.
        this.socket.emit("joinSuccess");

        // Send all players the updated Player List
        this.broadcastPlayerList(data.room);

        // if rejoining user, resend the current state.
        if (isRejoin) {
            this.rooms[data.room].sendRejoinState(players[playerIdx]);
        }

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

        // Emit to this Room's Players
        this.emitToRoom(room, "playerList", { "playerList":  this.rooms[room].players });
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
     * emitToPlayer() -Emits a message to a specific player
     * @param {*} socketId - Socket to send to.
     * @param {*} messageType - Message Type
     * @param {*} payload - Message Data (Object)
     */
    emitToPlayer(socketId, messageType, payload) {
        this.io.to(socketId).emit(messageType, payload);
    };

    // ************************************************************************************************
    // Host Section
    // ************************************************************************************************

    /**
     * hostCommandSuccess() - Passes the "hostCommandSuccess" message back to the client.
     */
    hostCommandSuccess() {
        this.socket.emit("hostCommandSuccess");
    };

    /**
     * hostCommandFailure() - Passes the hostCommandFailure" message back to the client.
     * @param {string} msg - Error message to pass.
     */
    hostCommandFailure(msg) {
        this.socket.emit("hostCommandFailure", msg);
    }; 

    // ************************************************************************************************
    // Dealer Section
    // ************************************************************************************************

    /**
     * dealerCommandInitiateDealing() - Notifies the dealer to start dealing.
     */
    dealerCommandInitiateDealing(dealToNext) {
        this.socket.emit("initiateDealing", { "dealToNext": dealToNext} );
    };

    /**
     * dealerDealActionCompleted() - Passes the "dealActionCompleted" message back to the client.
     */
    dealerDealActionCompleted() {
        this.socket.emit("dealActionCompleted");
    };

    /**
     * dealerCommandFailure() - Passes the dealerCommandFailure" message back to the client.
     * @param {string} msg - Error message to pass.
     */
    dealerCommandFailure(msg) {
        this.socket.emit("dealerCommandFailure", msg);
    };

    /**
     * dealerResume() - Informs dealer to resume dealing.
     */
    dealerResume() {
        this.socket.emit("dealResume");
    };

    dealerDeckDisposition() {
        this.socket.emit("deckDisposition");
    };


    // ************************************************************************************************
    // Bet Section
    // ************************************************************************************************

    /**
     * betCommandFailure() - Passes the betCommandFailure" message back to the client.
     * @param {*} msg - Error message to pass.
     */
    betCommandFailure(msg) {
        this.socket.emit("betCommandFailure", msg);
    }
    
}

module.exports = SocketController;