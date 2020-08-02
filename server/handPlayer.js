class HandPlayer {
    constructor (name) {
        this.name = name;
        this.amount = 0.0;
        this.fold = false;
        this.declare = "";
    }
}

module.exports = HandPlayer;