const _ = require('lodash');

class GameRoom {
    constructor (room, players) {
        this.room = room;
        this.players = players;
        this.anteMode = "player";
        this.chipValues = [];
        this.hands = [];
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
    }
}

module.exports = GameRoom;