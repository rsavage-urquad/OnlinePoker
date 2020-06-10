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
                // TODO:
                break;
            default:
                this.socketController.dealerCommandFailure(`Unknown Command - ${command}`);                
                return;
        }
    }; 

    processHandSetup(payload) {
        this.gameRoom.hand = new Hand(this.socketController, this.gameRoom, payload.gameName, payload.wildInfo, payload.anteAmount);
        this.gameRoom.hand.getAnte();
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.gameRoom.hand.displayHandInfo();

        // TODO: Send Start Dealing to Dealer
        console.log(this.gameRoom);
    }

};

module.exports = DealerController;