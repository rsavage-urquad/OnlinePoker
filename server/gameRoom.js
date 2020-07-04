const _ = require('lodash');

class GameRoom {
    constructor (room, players) {
        this.room = room;
        this.players = players;
        this.anteMode = "player";   
        this.defaultAnte = .50;     // TODO: defaultAnte (Host Commands)
        this.chipValues = [];       // TODO: chipValues (Host Commands)
        this.maxRaise = 4;          // TODO: maxRaise (Host Commands)
        this.hand = {};
    }

    // ************************************************************************************************
    // General Methods
    // ************************************************************************************************

    /**
     * getPlayerIdx() - Gets the index of the Player by Name
     * @param string} name - Player Name
     */
    getPlayerIdx(name) {
        return _.findIndex(this.players, function(item) { return item.name === name; });       
    };

    /**
     * getPlayerObject() - Gets the Object for the Player by Name
     * @param string} name - Player Name
     */
    getPlayerObject(name) {
        return _.find(this.players, function(item) { return item.name === name; });       
    };
    
    // ************************************************************************************************
    // Dealer Methods
    // ************************************************************************************************

    /**
     * setDealerByIdx() - Set the dealer based on the passed Player Index
     * @param {number} playerIdx - Index of player to be set as dealer.
     */
    setDealerByIdx(playerIdx) {
        _.forEach(this.players, function(item, idx) {
            item.dealer = (idx === playerIdx);
        });
    };

    /**
     * getDealerIdx() - Gets the index of the player that is th dealer.
     * @returns - Index of the player that is th dealer
     */
    getDealerIdx() {
        return _.findIndex(this.players, function(p) { return p.dealer; });
    };

    /**
     * passControlToDealer() - Sends the message to Pass control to the dealer
     * @param {*} socketController 
     */
    passControlToDealer(socketController) {
        const dealer = _.find(this.players, function(player) {return player.dealer});
        socketController.emitToRoom(this.room, "dealerSetup", { "name": dealer.name, "defaultAnte": this.defaultAnte });
    };


};

module.exports = GameRoom;