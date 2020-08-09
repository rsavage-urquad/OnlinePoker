const _ = require("lodash");
const Deck = require("./deck");
const Card = require("./card");
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

    /**
     * resetHandPlayerAmounts() - Resets the Hand amounts for each player. 
     */
    resetHandPlayerAmounts() {
        _.forEach(this.players, function(p) {
            p.amount = 0;
        });
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

        // Update the Deal to Next index
        this.dealToNext = (this.dealToNext < (this.players.length - 1)) ? this.dealToNext + 1 : 0;

    };

    /**
     * betInitiate() - Set up the bet object and send the Bet Request
     * to the appropriate player.
     * @param {string} playerName - Starting bettor's name.
     */
    betInitiate(playerName) {
        this.bet = new Bet(this, playerName, this.gameRoom.maxRaise);
        this.gameRoom.setState("Bet", playerName);
        this.emitBetMessage();
    };

    /**
     * processBetCheck() - Handle the bettor's Check message.
     * @param {Object} payload - Information associated with the message.
     */
    processBetCheck(payload) {
        const playerName = payload.player;
        if (this.bet.currentPlayer !== playerName) {
            emitUnexpectedEvent(`Got a message from an unexpected player - ${playerName}`);
            return;
        }
        this.sendNextBetMessage();
    };

    /**
     * processBetRaise() - Handle the bettor's Bet/Raise message.
     * @param {Object} payload - Information associated with the message.
     */
    processBetRaise(payload) {
        const playerName = payload.player;
        const raiseAmt = payload.bet;
        const totalBetAmt = this.bet.currentBet + raiseAmt;
        const wasRaise = (raiseAmt !== 0);      // Player did not actually raise if amount was 0

        if (this.bet.currentPlayer !== playerName) {
            emitUnexpectedEvent(`Got a message from an unexpected player - ${playerName}`);
            return;
        }        

        // Update the bet details. 
        let betPlayerIdx = _.findIndex(this.bet.playerBets, function(item) { return item.name === playerName; });
        let actualBetAmt = totalBetAmt - this.bet.playerBets[betPlayerIdx].amount
        this.bet.playerBets[betPlayerIdx].amount += actualBetAmt;
        this.bet.currentBet += raiseAmt;
        if (wasRaise) { this.bet.raiseCount++; }

        // Update Game Room and Hand amounts for player
        this.updatePlayerAmount(playerName, actualBetAmt);

        // Refresh display for player amounts and and pass bet to the appropriate player.
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.displayHandPlayerArea();        
        this.sendNextBetMessage(wasRaise);
    };

    /**
     * processFold() - Handles the bettor's Fold message
     * @param {object} payload - Information associated with the message.
     */
    processFold(payload) {
        const playerName = payload.player;
        if (this.bet.currentPlayer !== playerName) {
            emitUnexpectedEvent(`Got a message from an unexpected player - ${playerName}`);
            return;
        }

        // Mark Player as Folded
        this.bet.setBetPlayerFold(playerName);
        const playerIdx = this.getHandPlayerIdx(playerName);
        this.players[playerIdx].fold = true;
        
        // Clear Player's Cards (send to Muck)
        this.sendPlayersCardsToMuck(playerIdx);

        // Send multiple messages to the Players (including Next Bet action).
        this.sendDeckStats();
        this.displayHandPlayerArea();
        this.sendNextBetMessage(false);
    };

    /**
     * processPayout() - Distribute the payout to the winner(s) and send an
     * update message with the new totals to the players.
     * @param {Array} payload - Payout details
     */
    processPayout(payload) {
        // Distribute Payout
        this.distributePayout(payload);

        // Send Message to update Player Info and Hand Info areas
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.displayHandPlayerArea();     

        // Send Message to Dealer to Pass the Deck or Deal again.
        this.gameRoom.socketController.dealerDeckDisposition();
    };


    // ************************************************************************************************
    // Communications Methods (Interact with Players)
    // ************************************************************************************************

    /**
     * emitBetMessage() - Sends the Bet Request to the current player (as per Bet object).
     */
    emitBetMessage() {
        const playerName = this.bet.currentPlayer;
        let player = _.find(this.gameRoom.players, function(item) { return item.name === playerName; }); 
        let betPlayerIdx = _.findIndex(this.bet.playerBets, function(item) { return item.name === playerName; });

        // If there are no active players (betPlayerIdx = -1), send "dealerResume" message.
        if (betPlayerIdx === -1) {
            this.socketController.dealerResume();
            return;
        }

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
    
    /**
     * displayHandInfo() - Send the Hand Information to the Room (initial send for Hand).
     */
    displayHandInfo() {
        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "handInfoInitialize", 
            {
                "gameName": this.name,
                "commentInfo": this.commentInfo,
                "playerInfo": this.players
            }
        );
    };

    /**
     * displayHandPlayerArea() - Sends the Hand's Player information message to the Room. 
     */
    displayHandPlayerArea() {
        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "handPlayerInfoUpdate", 
            {
                "playerInfo": this.players
            }
        );       
    }

    /**
     * emitCard() - Deals a card to the Player and Room.  Player can be sent Face Up
     * or Face Down.  If Face Up, the entire room will get the card Face Up.  Otherwise
     * the entire room will get the card Face Down and the intended Player will get
     * the card Face Up
     * @param {*} playerName - Player to receive the Card
     * @param {*} card - Card
     */
    emitCard(playerName, card) {
        const downCard = new Card("X", "X", false, card.special);
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

        this.sendDeckStats();
    };

    /**
     * emitShowAllHands() - Sends all Active Players Hand information to the Room.
     */
    emitShowAllHands() {
        const realThis = this;
        let payload = { "hands": [] };

        _.forEach(this.gameRoom.players, function(player, idx) {
            if (!player.fold) {
                let cards = [];
                _.forEach(realThis.playerCards[idx].cards, function(card) {
                    card.faceUp = true;
                    cards.push(card);                  
                });
                payload.hands.push({ "name": player.name, "cards": cards });
            }
        });

        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "showAllHands",
            payload
        );
    };

    /**
     * sendDeckStats() - Sends the Desk Statistics to the table.
     */
    sendDeckStats() {
        let deckStats = `Deck: ${this.deck.deck.length} - Muck: ${this.deck.muck.length}`;
        let payload = { "deckStats": deckStats };

        this.socketController.emitToRoom(
            this.gameRoom.room, 
            "deckStats",
            payload
        );        
    }

    /**
     * resendState() - Resend the State information to a rejoining player.
     * @param {Object} player - Rejoining Player 
     * @param {string} state - Game State
     */
    resendState(player, state) {
        const cardInfo = this.prepareCardInfo(player);
        const handInfo = { "name": this.name, "commentInfo": this.commentInfo };
        let statePayload = this.prepareStatePayload(player, state);

        this.socketController.emitToPlayer(
            player.socketId, 
            "rejoinPlayerState",
            {
                "handInfo": handInfo,
                "handPlayerInfo": this.players,
                "cardInfo": cardInfo,
                "state": state,
                "statePayload": statePayload
            }
        );
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
     * getDealToNextName() - Returns the name of the player to be dealt to next.
     * @param {number} dealToIdx - Index of the player to deal to next.
     * @returns - Name of the player to the left of the dealer.
     */
    getDealToNextName(dealToIdx) {
        // if dealToIdx is -1, next is Player to the left of the dealer.
        if (dealToIdx === -1) {
            dealToIdx = this.gameRoom.getDealerIdx();
            dealToIdx++;
            if (dealToIdx >= this.players.length) { dealToIdx = 0; }
        }

        return this.players[dealToIdx].name;
    };

    /**
     * sendNextBetMessage() - Advance the Bettor and send the next Bet message 
     * (either to next Bettor or Dealer, if betting completed).
     * @param {boolean} playerRaised - Did player raise? 
     */
    sendNextBetMessage(playerRaised) {
        this.bet.advanceBettingPlayer(playerRaised);

        // If betting is completed, inform dealer to continue.
        if (this.bet.bettingEnded) {
            this.gameRoom.setState("Deal", this.gameRoom.getDealer().name);
            this.gameRoom.dealerController.socketController.dealerResume();
        }
        else {
            this.gameRoom.setState("Bet", this.bet.currentPlayer);
            this.emitBetMessage();
        }
    };

    /** 
     * sendPlayersCardsToMuck() - Sends the players cards to the Deck's muck pile
     * and clear out the platers cards.
     */
    sendPlayersCardsToMuck(playerIdx) {
        const realThis = this;
        _.forEach(this.playerCards[playerIdx].cards, function(item) {
            realThis.deck.addToMuck(item);
        });
        this.playerCards[playerIdx].cards = [];
    };

    /**
     * updatePlayerAmount() - Updates the Player's Amount for both Room & Hand.
     * @param {string} playerName - Player's name.
     * @param {string} bet - Bet amount 
     */
    updatePlayerAmount(playerName, bet) {
        const handPlayerIdx = this.getHandPlayerIdx(playerName);
        const gameRoomPlayerIdx = this.gameRoom.getPlayerIdx(playerName);
        this.gameRoom.players[gameRoomPlayerIdx].amount -= bet;
        this.players[handPlayerIdx].amount += bet;
    };

    /**
     * distributePayout() - Distribute the payout amount to the winner(s).
     * @param {Array} payload - Array of winner objects containing {name, split, amount}.
     */
    distributePayout(payload) {
        const realThis = this;

        _.forEach(payload, function(payout) {
            let gameRoomPlayerIdx = realThis.gameRoom.getPlayerIdx(payout.name);
            realThis.gameRoom.players[gameRoomPlayerIdx].amount += payout.amount;
        });

        // Since the payout has been distributed, clear the Hand amounts.
        this.resetHandPlayerAmounts();
    };

    /**
     * prepareCardInfo() -  Prepares all players card information to send to the 
     * rejoining Player.
     * @param {Object} rejoinPlayer - Rejoining Player.
     */
    prepareCardInfo(rejoinPlayer) {
        const realThis = this;
        const cardInfo = { "hands": [] };

        _.forEach(this.gameRoom.players, function(player, idx) {
            if (!player.fold) {
                let cards = [];
                _.forEach(realThis.playerCards[idx].cards, function(card) {
                    let sendCard = new Card();
                    sendCard.setCard(card);
                    if (!sendCard.faceUp) {
                        if (player.name === rejoinPlayer.name) {
                            // Card belongs to rejoining player, so set as face up.
                            sendCard.faceUp = true;
                        }
                        else {
                            // Card should be Face Down
                            sendCard.suit = "X";
                            sendCard.value = "X";                            
                        }
                    }
                    cards.push(sendCard);                  
                });
                cardInfo.hands.push({ "name": player.name, "cards": cards });
            }
        });
        return cardInfo;
    };

    /**
     * prepareStatePayload() - Route to the appropriate method to build the payload
     * based on the state.
     * @param {Object} player - Rejoining Player
     * @param {string} state - Rejoin state
     * @returns {Object} - Payload object
     */
    prepareStatePayload(player, state) {
        let payload = {};

        switch (state.toLowerCase()) {
            case "deal":
            case "dealwait":
                payload = this.getDealPayload(player);
                break;
            case "bet":
                payload = this.getBetPayload(player);
                break
            // Default is to return empty object
        }
        return payload;
    };  

    /**
     * getDealPayload() - Sets up and payload info need when the rejoining
     * player is the dealer.
     * @param {Object} player - Rejoining Player
     */
    getDealPayload(player) {
        return { "dealToNext": this.getDealToNextName(this.dealToNext) };
    };

    getBetPayload(player) {
        // TODO: Implement getBetPayload  <--
        console.log("getBetPayload");
    }

};

module.exports = Hand;