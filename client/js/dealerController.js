/**
 * Dealer Controller object
 */
var DealerController = function(parent) {
    this.playerApp = parent;
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Host Dialog object
 */
DealerController.prototype.initialize = function () {
    this.setupDom();
    this.setupEvents();
};

/**
 * setupDom() - Perform any DOM Setup
 */
DealerController.prototype.setupDom = function () {
    $("#dealerCommandArea").hide();
};

/**
 * setupEvents() - Set up various events handlers.
 */
DealerController.prototype.setupEvents = function () {
    // Reset any event handlers
    $("#handStartButton").unbind();
    $("#dealToAll").unbind();
    $("#dealToNext").unbind();
    $("#dealToSpecific").unbind();
    $("#initiateBetting").unbind();
    $("#initiateBettingNext").unbind();
    $("#initiateBettingSpecific").unbind();
    $("#initiateBettingCancel").unbind();
    $("#endShowHands").unbind();

    // Set Button Click Events
    $("#handStartButton").click({obj: this}, this.startHandClicked);
    $("#dealToAll").click({obj: this}, this.dealToAllClicked);
    $("#dealToNext").click({obj: this}, this.dealToNextClicked);
    $("#dealToSpecific").click({obj: this}, this.dealToSpecificClicked);
    $("#initiateBetting").click({obj: this}, this.initiateBettingClicked);
    $("#initiateBettingNext").click({obj: this}, this.initiateBettingNextClicked);
    $("#initiateBettingSpecific").click({obj: this}, this.initiateBettingSpecificClicked);
    $("#initiateBettingCancel").click({obj: this}, this.initiateBettingCancelClicked);
    $("#endShowHands").click({obj: this}, this.endShowAllHandsClicked);

};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * startHandClicked() - Process the Start Hand clicked event by validating the information and,
 * if valid, sending the message to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.startHandClicked = function(event) {
    var objThis = event.data.obj;
    objThis.resetHandSetupErrors();

    // Validate Input and, if valid, proceed.
    if (objThis.validateHandSetupInfo()) {
        // Send "handSetup" request to Server
        objThis.sendDealerCommand(
            "HandSetup",
            {
                gameName: $("#handGameName").val(),
                commentInfo: $("#handCommentText").val(),
                anteAmount: $("#handAnteAmount").val()
            }            
        )
    }
};

/**
 * initiateDealing() - Process the "initiateDealing" message by hiding the 
 * Setup Hand dialog and showing the Dealer commands.
 */
DealerController.prototype.initiateDealing = function(payload) {
    var dealToNextName = payload.dealToNext;
    
    this.updateDealToNext(dealToNextName);
    $("#dealToNext").text("Deal to " + dealToNextName);
    this.playerApp.hand.setDealToNextIdx(dealToNextName)
    $("#handSetupDialog").hide();
    $("#dealerCommandArea").show();
};

/**
 * dealToAllClicked() - Handles the Deal to All clicked event bu sending
 * the appropriate command to the Server.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.dealToAllClicked = function(event) {
    var objThis = event.data.obj;
    var command = "DealToAll";
    var payload = {};

    // Disable Dealer Commands until completion message received
    objThis.setDealerOptions("disable");

    // Prepare and send command
    payload.dealMode = $("input[name='dealMode']:checked").val();
    payload.startPlayerName = objThis.playerApp.hand.players[objThis.playerApp.hand.dealToNextIdx].name;
    objThis.sendDealerCommand(command, payload);
};

/**
 * dealToNextClicked() - Handles the Deal to Next clicked event by sending
 * the appropriate command to the Server.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.dealToNextClicked = function(event) {
    var objThis = event.data.obj;
    var command = "DealToSpecific";
    var payload = {};

    // Disable Dealer Commands until completion message received
    objThis.setDealerOptions("disable");    

    // Prepare and send command
    payload.dealMode = $("input[name='dealMode']:checked").val();
    payload.toPlayerName = objThis.playerApp.hand.players[objThis.playerApp.hand.dealToNextIdx].name;
    objThis.sendDealerCommand(command, payload);

    // Advance Deal to Next
    objThis.advanceDealToNext(payload.toPlayerName); 
};

/**
 * dealToSpecificClicked() - Handles the Deal to Specific clicked event by 
 * enabling the selection buttons
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.dealToSpecificClicked = function(event) {
    var objThis = event.data.obj;

    // Disable Dealer Commands until completion message received
    objThis.setDealerOptions("disable");       

    // Setup and display Select buttons
    objThis.setupSelectButtons(objThis, objThis.dealToSpecificSelected);
};

/**
 * dealToSpecificSelected - Handle the Selected event for "Deal to Specific"
 * purposes.  This includes sending the deal command to the server
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.dealToSpecificSelected = function(event) {
    var objThis = event.data.obj;
    var command = "DealToSpecific";
    var payload = {};

    $(".select-player").hide();

    // Prepare and send command
    payload.dealMode = $("input[name='dealMode']:checked").val();
    payload.toPlayerName = this.value;
    objThis.sendDealerCommand(command, payload);

    // Advance Deal to Next
    objThis.advanceDealToNext(payload.toPlayerName); 
};

/**
 * dealActionCompleted() - Deal action completed, enable Dealer actions.
 */
DealerController.prototype.dealActionCompleted = function() {
    this.setDealerOptions("enable");
};

/**
 * dealResume() - Handles the "Deal Resume" message from the server.
 */
DealerController.prototype.dealResume = function() {
    $("#dealerCommandArea").show();
};

/**
 * initiateBettingClicked() - Handle the Initiate Betting clicked event by preparing
 * and displaying the Initiate Betting options
 * @param {*} event - Object associated with triggered Event.
 */
DealerController.prototype.initiateBettingClicked = function(event) {
    var objThis = event.data.obj;
    var startPlayerIdx = objThis.playerApp.hand.getIdxOfPlayerName(objThis.playerApp.myName);
    var playerIdx = objThis.getNextActivePlayer(startPlayerIdx);

    $("#initiateBetNext").text("Start with " + objThis.playerApp.hand.players[playerIdx].name);
  
    // Display commands
    $("#dealerCommandArea").hide();
    $("#initBetCommandArea").show();
};

/**
 * initiateBettingNextClicked() - Handle the Initiate Betting Next clicked event by sending
 * the command to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.initiateBettingNextClicked = function(event) {
    var objThis = event.data.obj;
    var startPlayerIdx = objThis.playerApp.hand.getIdxOfPlayerName(objThis.playerApp.myName);
    var playerIdx = objThis.getNextActivePlayer(startPlayerIdx);
    var command = "BetInitiate";
    var payload = {};

    // Prepare and send command
    payload.startPlayerName = objThis.playerApp.hand.players[playerIdx].name;
    objThis.sendDealerCommand(command, payload);

    // Hide Initiate Betting Commands
    $("#initBetCommandArea").hide();
};

/**
 * initiateBettingSpecificClicked() - Handle the Initiate Betting Specific clicked event 
 * displaying the "Select" buttons to allow the dealer to choose.
 * @param {*} event - Object associated with triggered Event.
 */
DealerController.prototype.initiateBettingSpecificClicked = function(event) {
    var objThis = event.data.obj;

    // TODO: (Future) - Disable Initiate Buttons until selection is made?

    // Setup and display Select buttons
    objThis.setupSelectButtons(objThis, objThis.initiateBettingSpecificSelected);
};

/**
 * initiateBettingCancelClicked() - Handle the Cancel Initiate Betting clicked event by 
 * resetting the command options.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.initiateBettingCancelClicked = function(event) {
    $("#initBetCommandArea").hide();
    $("#dealerCommandArea").show();
}

/**
 * initiateBettingSpecificSelected() - Handle the "Select" button click event when initiating the 
 * Bet for a specific player.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.initiateBettingSpecificSelected = function(event) {
    var objThis = event.data.obj;
    var command = "BetInitiate";
    var payload = {};

    $(".select-player").hide();

    // Prepare and send command
    payload.startPlayerName = this.value;
    objThis.sendDealerCommand(command, payload);

    // Hide Initiate Betting Commands
    $("#initBetCommandArea").hide();
}

/**
 * endShowAllHandsClicked() - Handle the "Show All Hands" button click event by sending 
 * a message to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
DealerController.prototype.endShowAllHandsClicked = function(event) {
    var objThis = event.data.obj;
    objThis.sendDealerCommand("EndShowAllHands", {});
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************

/**
 * sendDealerCommand() - Sends a dealer command to the server.
 * @param {string} command - Dealer Command
 * @param {Object} payload - Command Payload
 */
DealerController.prototype.sendDealerCommand = function(command, payload) {
    this.playerApp.socket.emit("dealerCommand", { 
        room: this.playerApp.room,
        command: command,
        payload: payload
    });
};


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * dealerSetup() - Prepares the Dealer Setup dialog and hide the Dealer commands
 */
DealerController.prototype.dealerSetup = function(payload) {
    $("#dealerCommandArea").hide();

    if (payload.name === this.playerApp.myName) {
        $("#handGameName").val("");
        $("#handCommentText").val("");
        $("#handAnteAmount").val(accounting.toFixed(payload.defaultAnte, 2));
        $("#handSetupDialog").show();
    }
};

/**
 * resetHandSetupErrors() - Resets any Hand Setup dialog errors.
 */
DealerController.prototype.resetHandSetupErrors = function() {
    $("#handGameName").removeClass("errorInput");
    $("#handAnteAmount").removeClass("errorInput");
    $("#handSetupErrorMsg").text("");
};

/**
 * setError() - Sets (or resets) the Hand Dialog error message.
 * @param {string} - msg - Message
 */
DealerController.prototype.setError = function(msg) {
    $("#handSetupErrorMsg").text(msg);
};

/**
 * updateDealToNext() - Updates the hand's Deal to Next information
 * @param {string} dealToNextName = Name of Player to deal to next.
 */
DealerController.prototype.updateDealToNext = function(dealToNextName) {
    $("#dealToNext").text("Deal to " + dealToNextName);
    this.playerApp.hand.setDealToNextIdx(dealToNextName)
};

/**
 * setDealerOptions() - Enable or disable Dealer options to avoid accidental
 * deal due to double click.
 */
DealerController.prototype.setDealerOptions = function(mode) {
    var domElements = $("#dealerCommandArea button");
    var isDisable = (mode === "disable");

    _.forEach(domElements, function(elem) {
        domElements.prop("disabled", isDisable);
    });
};

/**
 * setupSelectButtons() - Display the "Select" buttons for player specific processing
 * @param {Object} objThis - "this" reference
 * @param {*} callback - Function to call on click.
 */
DealerController.prototype.setupSelectButtons = function(objThis, callback) {
    buttonObj = $("#selectMe");
    buttonObj.unbind();
    // Do not display if player is folded.
    if (!objThis.playerApp.hand.hasPlayerFolded(objThis.playerApp.myName)) {
        buttonObj.click({obj: objThis}, callback);
        buttonObj.show();
    }

    _.forEach(objThis.playerApp.opponentNoXref, function(item) {
        buttonObj = $("#selectPlayer-" + item.opponentNo.toString());
        buttonObj.unbind();

        // Do not display if player is folded.
        if (!objThis.playerApp.hand.hasPlayerFolded(item.name)) {
            buttonObj.click({obj: objThis}, callback);
            buttonObj.show();
        }
    });    
};


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * validateHandSetupInfo() - Validates the Hand Setup info.  If invalid, the field
 * highlights and error message will be set.
 * @returns - True if valid, otherwise false.
 */
DealerController.prototype.validateHandSetupInfo = function() {
    var retValue = true;
    var errorMsgArray = [];
    var errorMsg = "";
    var gameNameObj = $("#handGameName");
    var anteAmountObj = $("#handAnteAmount");

    if (gameNameObj.val().trim() === "") {
        retValue = false;
        gameNameObj.addClass("errorInput");
        errorMsgArray.push("Please populate the Game Name.");
    }

    if (anteAmountObj.val().trim() === "") {
        retValue = false;
        anteAmountObj.addClass("errorInput");
        errorMsgArray.push("Please populate the Ante Amount.");
    }
    else {
        if (isNaN(parseFloat(anteAmountObj.val()))) {
            retValue = false;
            anteAmountObj.addClass("errorInput");
            errorMsgArray.push("Ante Amount must be a number.");
        }
    }

    if (!retValue) {
        for (var i = 0; i < errorMsgArray.length; i++) {
            if (i > 0) { errorMsg = errorMsg + "<br/>"; }
            errorMsg = errorMsg + errorMsgArray[i];
        }
        $("#handSetupErrorMsg").html(errorMsg); 
    }

    return retValue;
};

/**
 * advanceDealToNext() - Advance the Deal To Next info to the plater  to the left of
 * the supplied Player
 * @param {string} currentDealToName - Current Deal To Player
 */
DealerController.prototype.advanceDealToNext = function(currentDealToName) {
    var startPlayerIdx = this.playerApp.hand.getIdxOfPlayerName(currentDealToName);
    var playerIdx = this.getNextActivePlayer(startPlayerIdx);
    this.updateDealToNext(this.playerApp.hand.players[playerIdx].name);
};

/**
 * getNextActivePlayer() - Determine the next "Active" player based on a starting
 * player index.
 * @param {number} startIdx - Starting player index.
 * @returns {number} - Index of next "Active" player
 */
DealerController.prototype.getNextActivePlayer = function(startIdx) {
    var safety = 0;
    var playersLength = this.playerApp.hand.players.length;
    var playerIdx = startIdx;
    var initialPlayerIdx = playerIdx;
    
    // Advance the index until a non-Fold player is found (added a safety check to avoid infinite loop)
    playerIdx++;
    if (playerIdx >= playersLength) { playerIdx = 0; }
    while ((this.playerApp.hand.players[playerIdx].fold) && (safety < playersLength)) {
        playerIdx++;
        if (playerIdx >= playersLength) { playerIdx = 0; }
        safety++;
    }

    // If safety check triggered, make current player next.
    if ((safety >= playersLength)) {
        console.log("Safety issue occurred - getNextActivePlayer");
        playerIdx = initialPlayerIdx;
    }

    return playerIdx;
};
