const Hand = require("./hand");

/**
 * DealerController Class - Responsible for Dealer Command interactions.
 */
class DealerController {
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
            case "HandSetup":
                this.processHandSetup(payload);
                break;
            default:
                this.socketController.dealerCommandFailure(`Unknown Command - ${command}`);                
                return;
        }
    }; 

    /**
     * processHandSetup() - Processes the Hand Setup command by setting up the Hand,
     * collecting the ante, sending messages to update the player display and informing
     * the Dealer to start dealing.
     * @param {Object} payload - Game Details sent from Dealer
     */
    processHandSetup(payload) {
        this.gameRoom.hand = new Hand(this.socketController, this.gameRoom, payload.gameName, payload.commentInfo, payload.anteAmount);
        this.gameRoom.hand.getAnte();
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.gameRoom.hand.displayHandInfo();
        this.socketController.dealerCommandInitiateDealing();
    }

};

module.exports = DealerController;