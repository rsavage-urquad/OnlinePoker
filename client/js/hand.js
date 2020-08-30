/**
 * Hand object
 * @param {Object} playerApp - Pointer to PlayerApp object.
 * @param {string} gameName - Game Name
 * @param {string} commentInfo - Comment info (Wild, payments ...).
 * @param {Array} playerInfo - Player information
 */
var Hand = function (playerApp, gameName, commentInfo, playerInfo) {
    this.playerApp = playerApp
    this.gameName = gameName.trim();
    this.commentInfo = commentInfo.trim();
    this.players = this.initializePlayers(playerInfo);
    this.hands = this.initializeHands();
    this.dealToNextIdx = 0;

    $("#deckStats").empty();
};

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initializePlayers() - Initialize the players array.
 */
Hand.prototype.initializePlayers = function(playerInfo) {
    var handPlayers = [];

    _.forEach(playerInfo, function(p) {
        handPlayers.push(new HandPlayer(p.name, p.amount));
    });
    return handPlayers
};

/**
 * initializeHands() - Initialized the hands.  Each player 
 * will get an empty cards array.
 */
Hand.prototype.initializeHands = function() {
    var hands = [];

    _.forEach(this.players, function(p) {
        hands.push({ "playerName": p.name, "cards": [] });
    });
    return hands
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * receiveCard() - Process the Card information from the server.  This includes adding the card 
 * to player's hand and displaying it in the Player's card area
 */
Hand.prototype.receiveCard = function(cardInfo) {
    var player = cardInfo.playerName;
    var playerIdx = this.getIdxOfPlayerName(player);

    // Ignore any Face Down card (Suit = "X") for this Player as a separate card will be sent with the suit set.
    if ((player === this.playerApp.myName) && (cardInfo.card.suit === "X")) {
        return;
    }

    var card = new Card(cardInfo.card.suit, cardInfo.card.value, cardInfo.card.faceUp, cardInfo.card.special);
    this.hands[playerIdx].cards.push(card);
    this.displayHandCardsForPlayer(playerIdx, (player === this.playerApp.myName));
};

/**
 * updatePlayerInfo() - Update the Player Info with data in the Payload.  
 * This can include Fold processing.
 * @param {Object} payload - Information for all Players.
 */
Hand.prototype.updatePlayerInfo = function(payload) {
    var realThis = this;
    var playerIdx;
    var playerCardAreaName;

    _.forEach(payload.playerInfo, function(player) {
        playerIdx = realThis.getIdxOfPlayerName(player.name);
        realThis.players[playerIdx].amount = player.amount;
        realThis.players[playerIdx].extraAmount = player.extraAmount;

        // If the player has not folded, check to see if they have now folded and take action.
        if (!realThis.players[playerIdx].fold) {
            if (player.fold) {
                realThis.players[playerIdx].fold = true;
                
                // Remove Cards from Player's hand.
                realThis.hands[playerIdx].cards = [];

                // Remove cards from Player's area.
                playerCardAreaName = realThis.playerApp.getPlayerCardAreaName(playerIdx);
                $("#" + playerCardAreaName).empty();
            }
        }
    });

    this.displayHandPlayerInfo("handPlayerInfoArea");
};

/**
 * deckStatsReceived() - Display the Deck cards remaining and muck count info. 
 * @param {Object} payload - Deck Statistics
 */
Hand.prototype.deckStatsReceived = function(payload) {
    $("#deckStats").text(payload.deckStats);
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************

/**
 * setRejoinHandPlayers() - Set and display the Hand's Player information after the 
 * player rejoins during a hand.  Also create empty hands.
 * @param {Array} playerInfo - Collection of player information.
 */
Hand.prototype.setRejoinHandPlayers = function(playerInfo) {
    var realThis = this;
    var player;

    _.forEach(playerInfo, function(p) {
        player = new HandPlayer(p.name, p.amount);
        player.fold = p.fold;
        player.declare = p.declare;
        player.extraAmount = p.extraAmount;
        realThis.players.push(player);
        realThis.hands.push({ "playerName": p.name, "cards": [] });
    });

    this.displayHandDetails("handName", "handCommentInfo");
    this.displayHandPlayerInfo("handPlayerInfoArea");
};

/**
 * dealerRejoin() - Process Dealer Rejoin message by setting the Deal To Next info
 * and displaying the Dealer Commands, if requested.
 * @param {Object} statePayload - State Payload.  Contains Deal To Next info
 * @param {boolean} showDealerCommands - Should Dealer Commands be displayed?
 */
Hand.prototype.dealerRejoin = function(statePayload, showDealerCommands) {
    // Set Deal To Next info
    this.setDealToNextIdx(statePayload.dealToNext); 

    // Show Dealer Commands, if necessary
    if (showDealerCommands) {
        this.playerApp.dealerController.initiateDealing(statePayload);
    }
};

/**
 * bettorRejoin() - Process Bettor Rejoin message by preparing and enabling the 
 * betting controls.
 * @param {Object} statePayload - Player's Bet State information
 */
Hand.prototype.bettorRejoin = function(statePayload) {
    this.playerApp.betController.enableBetting(statePayload);
};

// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * displayHandDetails() - Display the Hand information in the passed 
 * DOM element Id.
 * @param {string} gameElemId - DOM Element Id to insert Game Name into.
 * @param {string} commentElemId - DOM Element Id to insert Comment Info into.
 */
Hand.prototype.displayHandDetails = function(gameElemId, commentElemId) {
    var gameElemObj = $("#" + gameElemId);
    var commentElemObj = $("#" + commentElemId);

    // Prepare the Game Name information
    gameElemObj.text(this.gameName)

    // Prepare the Comment Information
    commentElemObj.empty();
    commentElemObj.hide();
    if (this.commentInfo !== "") {
        commentElemObj.text("Comment Info: " + this.commentInfo);
        commentElemObj.show();
    }
};

/**
 * displayHandPlayerInfo() -  Display the Hand Player information in 
 * the passed DOM element Id.
 * @param {string} elemId - DOM Element Id to insert into.
 */
Hand.prototype.displayHandPlayerInfo = function(elemId) {
    var elemObj = $("#" + elemId);
    var totalDiv = $("<div class='pot-total'>");
    var potTotal = 0;

    // Player amounts
    elemObj.empty();
    _.forEach(this.players, function(item) {
        var div = $("<div>");
        div.html(item.display());
        elemObj.append(div);
        potTotal += item.amount;
    });

    // Total Line
    totalDiv.append("<span class='bold'>Pot Total:</span> " + accounting.formatMoney(potTotal));
    elemObj.append(totalDiv);
};

/**
 * clearPlayerCardAreas() - Clears the players Card areas.
 */
Hand.prototype.clearPlayerCardAreas = function() {
    $("#opponentCards-1").empty();
    $("#opponentCards-2").empty();
    $("#opponentCards-3").empty();
    $("#opponentCards-4").empty();
    $("#opponentCards-5").empty();
    $("#opponentCards-6").empty();
    $("#playerCards").empty();
};

/**
 * displayHandCardsForPlayer() - Updates the Player's Card display area.
 * @param {number} playerIdx - Index of player to render cards.
 * @param {boolean} isMyPlayer - isMyPlayer - Is the player to display me?
 */
Hand.prototype.displayHandCardsForPlayer = function(playerIdx, isMyPlayer) {
    var domAreaObj;
    var cardArea;
    var cardHeight;
    var domAreaObj;
    var offsetValue;
    var leftOffset = 10;
    var topOffsetNormal = this.playerApp.displayDetails.topOffsetNormal + "px";
    var topOffsetSpecial = "0"

    // Set display parameters
    if (isMyPlayer) {
        cardArea = "playerCards";
        cardWidth = this.playerApp.displayDetails.dealerCardWidth;
        offsetValue = this.playerApp.displayDetails.dealerOffsetValue;
    }
    else {
        cardArea = this.playerApp.getPlayerCardAreaName(playerIdx)
        cardWidth = this.playerApp.displayDetails.playerCardWidth;
        offsetValue = this.playerApp.displayDetails.playerOffsetValue;
    }

    // Render the card area with the cards from the hand.
    domAreaObj = $("#" + cardArea);
    domAreaObj.empty();
    _.forEach(this.hands[playerIdx].cards, function(card, idx) {
        var img = $("<img>");
        img.prop('src', "./client/img/cards/" + card.getImageName());
        img.css("position", "absolute");
        img.css("top", (card.special) ? topOffsetSpecial : topOffsetNormal);
        img.css("left", leftOffset + "px");
        img.css("width", cardWidth + "px");
        domAreaObj.append(img);
        
        leftOffset += offsetValue;
    });
};

/**
 * populateAndDisplayAllHands() - Populates and displays the cards for all players.
 * @param {Object} cardInfo - Contains arrays of all cards for all players. 
 */
Hand.prototype.populateAndDisplayAllHands = function(cardInfo) {
    var realThis = this;
    var playerIdx;
    var card;

    // Sets and display each player's hand.
    _.forEach(cardInfo.hands, function(hand) {
        playerIdx = realThis.getIdxOfPlayerName(hand.name);
        realThis.hands[playerIdx].cards = [];
        // Populate cards received from server
        _.forEach(hand.cards, function(cardInfo) {
            card = new Card(cardInfo.suit, cardInfo.value, cardInfo.faceUp, cardInfo.special);
            realThis.hands[playerIdx].cards.push(card);
        });

        realThis.displayHandCardsForPlayer(playerIdx, (hand.name === realThis.playerApp.myName));
    });
};


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * getIdxOfPlayerName() - Gets the index of the requested Player's name.
 * @param {string} playerName - Player name to locate
 * @return - Index of Player
 */
Hand.prototype.getIdxOfPlayerName = function(playerName) {
    return _.findIndex(this.players, function(p) { return p.name === (playerName); });
};

/**
 * setDealToNextIdx() - Sets the Deal To Next index based on the supplied Player name.
 * @param {string} dealToNextName - Player to deal to next.
 */
Hand.prototype.setDealToNextIdx = function(dealToNextName) {
    this.dealToNextIdx = this.getIdxOfPlayerName(dealToNextName);
};

/**
 * hasPlayerFolded() - Identifies if a player has folded
 * @param {string} playerName - Player to check.
 * @returns {boolean} - True if player has folded, otherwise false. 
 */
Hand.prototype.hasPlayerFolded = function(playerName) {
    var playerIdx = this.getIdxOfPlayerName(playerName);
    return this.players[playerIdx].fold;
}

/**
 * getPotAmount() - Gets the total amount of the pot for the current Hand.
 * @returns {number} - Total amount of the pot.
 */
Hand.prototype.getPotAmount = function() {
    return _.reduce(this.players, function(sum, player) {
        return sum + player.amount;
    }, 0); 
};

/**
 * getRemainingPlayers() - Retrieves an array of the Player Names that are still 
 * in the hand.
 * @returns {Array} - Array of Player Names that are still in the hand
 */
Hand.prototype.getRemainingPlayers = function() {
    var remaining = [];

    _.forEach(this.players, function(player) {
        if (!player.fold) {
            remaining.push(player.name);
        }
    });
    return remaining;
};
