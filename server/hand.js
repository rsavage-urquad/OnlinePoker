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

    dealToPlayer(playerName, dealMode) {
        const playerIdx = this.getHandPlayerIdx(playerName);
        const card = this.deck.dealNextCard();

        // Mark Card as Face Up, if applicable.  Default is Face Down
        if (dealMode === "U") {
            card.faceUp = true;
        }
        this.playerCards[playerIdx].cards.push(card);
        this.emitCard(playerName, card);
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

    /**
     * emitCard() - Deals a card to the Player and Room.  Player can be sent Face Up
     * or Face Down.  If Face Up, the entire room will get the card Face Up.  Otherwise
     * the entire room will get the card Face Down and the intended Player will get
     * the card Face Up
     * @param {*} playerName - Player to receive the Card
     * @param {*} card - Card
     */
    emitCard(playerName, card) {
        const downCard = { "suit": "X", "value": "X", "faceUp": false }
        let dealCard = (card.faceUp) ? card : downCard;

        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "dealToPlayer",
            {
                "playerName": playerName,
                "card": dealCard
            }
        );

        // Deal the card to the player Face Up (if it was not already sent Face Up)
        if (!card.faceUp) {
            let player = this.gameRoom.getPlayerObject(playerName) 
            this.socketController.emitToPlayer(
                player.socketId, 
                "dealToPlayer",
                {
                    "playerName": playerName,
                    "card": card
                }
            );            
        }
    };

    // ************************************************************************************************
    // Helper Methods
    // ************************************************************************************************

    /**
     * getHandPlayerIdx() - Gets the index of the Hand Player by Name
     * @param string} name - Player Name
     */
    getHandPlayerIdx(name) {
        return _.findIndex(this.players, function(item) { return item.name === name; });       
    };

    /**
     * getDealToNextName() - Returns the name of the player to the left of the dealer.
     * @returns - Name of the player to the left of the dealer.
     */
    getDealToNextName() {
        let dealToIdx = this.gameRoom.getDealerIdx();
        dealToIdx++;
        if (dealToIdx >= this.players.length) { dealToIdx = 0; }
        return this.players[dealToIdx].name;
    };



};

module.exports = Hand;