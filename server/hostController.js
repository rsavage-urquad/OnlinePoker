/**
 * HostController Class - Responsible for Host Command interactions.
 */
class HostController {
    constructor (socketController, gameRoom) {
        this.socketController = socketController;
        this.gameRoom = gameRoom;
    };

    /**
     * processCommand() - Processes the Host Command
     * @param {string} command - Command name
     * @param {Object} payload - Any associated data
     */
    processCommand(command, payload) {
        switch(command) {
            case "PickDealer":
                this.processPickDealer(payload);
                break;
            default:
                this.socketController.hostCommandFailure(`Unknown Command - ${command}`);                
                return;
        }
    };   

    /**
     * processPickDealer() - Process the "PickDealer" command
     * @param {Object} payload - Command payload 
     */
    processPickDealer(payload) {
        const mode = payload.mode;
        const player = payload.player;
        let playerIdx = (mode === "Manual") ?
            this.gameRoom.getPlayerIdx(player) :
            Math.floor(Math.random() * Math.floor(this.gameRoom.players.length));

        this.gameRoom.setDealerByIdx(playerIdx);
        this.socketController.hostCommandSuccess();
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.gameRoom.passControlToDealer(this.socketController); 
    };
}

module.exports = HostController;