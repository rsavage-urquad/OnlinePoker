const _ = require("lodash");
const Deck = require("./deck");
const HandPlayer = require("./handPlayer");
const Bet = require("./bet");

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
        this.bet = {};

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

    /**
     * dealToPlayer() - Initiates the process to deal a card to a player.
     * @param {string} playerName - Player name to deal to.
     * @param {string} dealMode - Deal mode ("U"= Face Up, otherwise Face Down).
     */
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

    /**
     * BetInitiate() - Set up the bet object and send the Bet Request
     * to the appropriate player.
     * @param {string} playerName - Starting bettor's name.
     */
    BetInitiate(playerName) {
        this.bet = new Bet(this, playerName, this.gameRoom.maxRaise);
        this.emitBetMessage();
    };

    /**
     * processBetCheck() - Handle the bettor's Check message.
     * @param {Object} payload 
     */
    processBetCheck(payload) {
        const playerName = payload.player;
        if (this.bet.currentPlayer !== playerName) {
            emitUnexpectedEvent(`Got a message from an unexpected player - ${playerName}`);
            return;
        }
        this.bet.advanceBettingPlayer();
        
        // If betting is completed, inform dealer to continue.
        if (this.bet.bettingEnded) {
            this.socketController.dealerResume();
        }
        else {
            this.emitBetMessage();
        }
    };

    // ************************************************************************************************
    // Communications Methods
    // ************************************************************************************************

    /**
     * emitBetMessage() - Sends the Bet Request to the current player (as per Bet object).
     */
    emitBetMessage() {
        const playerName = this.bet.currentPlayer;
        let player = _.find(this.gameRoom.players, function(item) { return item.name === playerName; }); 
        let betPlayerIdx = _.findIndex(this.bet.playerBets, function(item) { return item.name === playerName; });
        let prevBetSum = this.bet.playerBets[betPlayerIdx].amount;

        this.socketController.emitToPlayer(
            player.socketId, 
            "betRequest",
            {
                "currentBet": this.bet.currentBet,
                "raiseCount": this.bet.raiseCount,                
                "maxRaise": this.bet.maxRaise,
                "prevBetSum": prevBetSum
            }
        ); 
    };

    /**
     * emitUnexpectedEvent() - Send details on an Unexpected Event
     * @param {string} msg - Details on Unexpected Event.
     */
    emitUnexpectedEvent(msg) {
        this.socketController.betCommandFailure(msg);
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
            let player = this.gameRoom.getPlayerObject(playerName);
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