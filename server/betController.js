const _ = require('lodash');

/**
 * BetController Class - Responsible for Bet Command interactions.
 */
class BetController {
    constructor (socketController, gameRoom) {
        this.socketController = socketController;
        this.gameRoom = gameRoom;
    };

    /**
     * processCommand() - Processes the Dealer Command
     * @param {string} command - Command name
     * @param {Object} payload - Any associated data
     */
    processCommand(command, payload) {
        switch(command) {
            case "Check":
                this.processCheck(payload);
                break;
            case "Fold":
                this.processFold(payload);
                break;
            case "BetRaise":
                this.processBetRaise(payload);
                break;    
            default:
                this.socketController.betCommandFailure(`Unknown Command - ${command}`);                
                return;
        }
    }; 

    /** processCheck() - Process the "Check" message by validating it and
     * passing it to the Hand object to process.
     * @param {Object} payload - Data pertaining to the message.
     */
    processCheck(payload) {
        if (!this.validatePayload(payload)) {
            return;
        }
        this.gameRoom.hand.processBetCheck(payload);
    };

    /**
     * processBetRaise() - Process the "BetRaise" message by validating it and
     * passing it to the Hand object to process.
     * @param {Object} payload - Data pertaining to the message. 
     */
    processBetRaise(payload) {
        if (!this.validatePayload(payload)) {
            return;
        }
        this.gameRoom.hand.processBetRaise(payload);
    };

    /**
     * processFold() - Passes the "Fold" message by validating it and
     * passing it to the Hand object to process.
     * @param {Object} payload - Data pertaining to the message.
     */
    processFold(payload) {
        if (!this.validatePayload(payload)) {
            return;
        }
        this.gameRoom.hand.processFold(payload);
    };

    /**
     * validatePayload() - Validate that the Player Name and Socket Id match.
     * @param {Object} payload - Data pertaining to the message.
     * @returns {boolean} - True if valid, otherwise false;
     */
    validatePayload(payload) {
        const playerName = payload.player;
        const socketId = payload.socketId;

        // Locate the Player Name/Socket Id combination.
        let idx = _.findIndex(this.gameRoom.players, function(p) {
            return ((p.name === playerName) && (p.socketId === socketId));
        })

        // If combination does not exist return error message to client (possible cheating)
        if (idx < 0) {
            this.socketController.betCommandFailure("Player Name/Socket Id mismatch.");
            return false;
        }
        return true;
    };

};

module.exports = BetController;