class HandPlayer {
    constructor (name) {
        this.name = name;
        this.amount = 0.0;
        this.fold = false;
        this.declare = "";
        this.extraAmount = 0.0;
    }
}

module.exports = HandPlayer;