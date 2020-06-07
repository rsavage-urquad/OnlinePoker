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
        // TODO: Prepare Hand (Players, take out ante ...)
        // TODO: Send Room Info (due to ante takeout)
        // TODO: Send Hand Info to Room
        // TODO: Send Start Dealing to Dealer
        console.log(payload);
    }

};

module.exports = DealerController;