class Player {
    constructor (room, name, pin, socketId, host) {
        this.room = room;
        this.name = name;
        this.pin = pin;
        this.socketId = socketId;
        this.host = host;
        this.status = ""
        this.dealer = false;
        this.buyInAmount = 0.0;
        this.amount = 0.0;
    }
}

module.exports = Player;