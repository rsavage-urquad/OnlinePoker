class GameRoom {
    constructor (room, players) {
        this.room = room;
        this.players = players;
        this.anteMode = "player";
        this.chipValues = [];
    }
}

module.exports = GameRoom;