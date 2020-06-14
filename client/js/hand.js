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


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


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