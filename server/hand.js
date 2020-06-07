const _ = require('lodash');

class Hand {
    constructor (socketController, gameRoom, name, wildInfo, anteAmount) {
        this.socketController = socketController;
        this.gameRoom = gameRoom;        
        this.name = name;
        this.wildInfo = wildInfo;
        this.anteAmount = anteAmount;
        this.deck = new this.deck()
        this.dealer = "";       // TODO
        this.dealToNext = 0;    // TODO
        this.cards = this.initializeHands();
        this.playerStatus = this.initializePlayerStatus();
    };

    // ************************************************************************************************
    // Initialize Methods
    // ************************************************************************************************

    initializeHands() {
        // TODO: Implement
    };

    initializePlayerStatus() {
        // TODO: Implement
    }
};

module.exports = Hand;