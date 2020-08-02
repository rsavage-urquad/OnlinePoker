const _ = require('lodash');

class GameRoom {
    constructor (socketController, room, players) {
        this.socketController = socketController
        this.room = room;
        this.players = players;
        this.anteMode = "player";   
        this.defaultAnte = .50;     // TODO: defaultAnte (Host Commands)
        this.chipValues = [];       // TODO: chipValues (Host Commands)
        this.maxRaise = 4;          // TODO: maxRaise (Host Commands)
        this.hand = {};
        this.state = "Join";
        this.stateUser = "";
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

    setState(state, stateUser) {
        this.state = state;
        this.stateUser = stateUser;
        
        // TODO: (Testing) To be removed
        console.log(`State: ${this.state} - User: ${this.stateUser}`);
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
     * @param {Object} socketController 
     */
    passControlToDealer(socketController) {
        const dealer = this.getDealer();
        this.setState("GameSetup", dealer.name);
        socketController.emitToRoom(this.room, "dealerSetup", { "name": dealer.name, "defaultAnte": this.defaultAnte });
    };

    /**
     * getDealer() - Gets the Player object for the current dealer.
     * @returns {Object} - Player object for the current dealer.
     */
    getDealer() {
        return _.find(this.players, function(player) {return player.dealer});
    }

    // ************************************************************************************************
    // State Management Methods
    // ************************************************************************************************

    /**
     * sendRejoinState() - Routes the logic to send the appropriate information to 
     * a rejoining player (in the event of a refresh or disconnect). 
     * @param {Object} player - Rejoining Player  
     */
    sendRejoinState(player) {
        switch(this.state.toLowerCase()) {
            case "join":
                // No action necessary;
                break;
            case "gamesetup":
                this.updateStateGameSetup(player)
                break;
            case "deal":
                this.updateStateDeal(player)
                break;
            case "bet":
                this.updateStateBet(player)
                break;
        }
    };

    /**
     * updateStateGameSetup() - If the rejoining Player is the Dealer, resend 
     * the "Pass Control To Dealer" message.
     * @param {Object} player - Rejoining Player
     */
    updateStateGameSetup(player) {
        if (player.name === this.getDealer().name) {
            this.passControlToDealer(this.socketController); 
        }
    };

    /**
     * updateStateDeal() - Rejoin occurred during a "Deal" state.  Send the hand details
     * and, if the player is the dealer, put them in Deal mode.
     * @param {Object} player - Rejoining Player
     */
    updateStateDeal(player) {
        let passState = (player.name === this.getDealer().name) ? "Deal" : "";
        this.hand.resendState(player, passState);
    };

    /**
     * updateStateBet() - Rejoin occurred during a "Bet" state.  Send the hand details
     * and, if the player is the current better, put them in bet mode.
     * @param {Object} player - Rejoining Player
     */
    updateStateBet(player) {
        let passState = (player.name === this.hand.bet.currentPlayer) ? "Bet" : "";
        this.hand.resendState(player, passState);
    };
};

module.exports = GameRoom;