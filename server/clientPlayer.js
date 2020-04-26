class ClientPlayer {
    constructor (room, name, socketId, host, dealer, buyInAmount, amount) {
        this.room = room;
        this.name = name;
        this.socketId = socketId;
        this.host = host;
        this.dealer = dealer;
        this.buyInAmount = buyInAmount;
        this.amount = amount;
    }
}

module.exports = ClientPlayer;