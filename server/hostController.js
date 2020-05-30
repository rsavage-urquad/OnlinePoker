/**
 * HostController Class - Responsible for Host Command interactions.
 */
class HostController {
    constructor (socketController, room, players) {
        this.socketController = socketController;
        this.room = room;
        this.players = players;
    }

    processCommand(command, payload) {
        console.log(command);
        console.log(payload);

        this.socketController.hostCommandSuccess();
    }    

}

module.exports = HostController;