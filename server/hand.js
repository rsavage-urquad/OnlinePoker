const _ = require("lodash");
Deck = require("./deck");
HandPlayer = require("./handPlayer");

class Hand {
    constructor (socketController, gameRoom, name, commentInfo, anteAmount) {
        this.socketController = socketController;
        this.gameRoom = gameRoom;        
        this.name = name;
        this.commentInfo = commentInfo;
        this.anteAmount = parseFloat(anteAmount);
        this.deck = new Deck();
        this.players = this.initializePlayers();
        this.playerCards = this.initializePlayerCards();
        this.dealerIdx = this.gameRoom.getDealerIdx();
        this.dealToNext = (this.dealerIdx < (this.players.length - 1)) ? this.dealerIdx + 1 : 0;

        // Shuffle the deck
        this.deck.shuffle();
    };

    // ************************************************************************************************
    // Initialize Methods
    // ************************************************************************************************

    /**
     * initializePlayers() - Initialize the players for the hand.
     * @returns - Array of HandPlayer objects.
     */
    initializePlayers() {
        let players = [];
        _.forEach(this.gameRoom.players, function(p) {
            players.push(new HandPlayer(p.name));
        });
        return players;
    };

    /**
     * initializePlayerCards() - Initialized the Player's cards.
     * @returns - Array of Player's Cards (empty array at this time).
     */
    initializePlayerCards() {
        let playerCards = [];
        _.forEach(this.players, function(p) {
            playerCards.push({"name": p.name, "cards": []});
        });
        return playerCards;
    };


    // ************************************************************************************************
    // Action Methods
    // ************************************************************************************************

    /**
     * getAnte() - Performs the ante operation.
     */
    getAnte() {
        const realThis = this;

        if (this.gameRoom.anteMode === "player") {
            // Each player antes.
            _.forEach(this.gameRoom.players, function(player, idx) {
                player.amount -= realThis.anteAmount;
                realThis.players[idx].amount += realThis.anteAmount;
            });
        }
        else {
            // Dealer antes for all.
            this.gameRoom.players[this.dealerIdx].amount -= this.anteAmount * this.gameRoom.players.length;
            this.players[this.dealerIdx].amount += this.anteAmount * this.gameRoom.players.length;
        }
    };


    // ************************************************************************************************
    // Display Methods
    // ************************************************************************************************

    /**
     * displayHandInfo() - Send the Hand Information to the Room.
     */
    displayHandInfo() {
        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "handInfo", 
            {
                "gameName": this.name,
                "commentInfo": this.commentInfo,
                "playerInfo": this.players
            }
        );
    };


    // ************************************************************************************************
    // Helper Methods
    // ************************************************************************************************



};

module.exports = Hand;