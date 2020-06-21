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
    // Set Button Click Events
    $("#handStartButton").click({obj: this}, this.startHandClicked);
    $("#dealToAll").click({obj: this}, this.dealToAllClicked);
    $("#dealToNext").click({obj: this}, this.dealToNextClicked);
    $("#dealToSpecific").click({obj: this}, this.dealToSpecificClicked);
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

DealerController.prototype.dealToNextClicked = function(event) {
    var objThis = event.data.obj;
    var command = "DealToNext";
    var payload = {};
    
    payload.dealMode = $("input[name='dealMode']:checked").val();
    payload.toPlayerName = objThis.playerApp.hand.players[objThis.playerApp.hand.dealToNextIdx].name;
    // TODO: (Left Off Here) - Implement on server.
    //objThis.sendDealerCommand(command, payload);

    // Advance Deal to Next
    objThis.advanceDealToNext(payload.toPlayerName); 
};

DealerController.prototype.dealToSpecificClicked = function(event) {
    var objThis = event.data.obj;

    payload.dealMode = $("input[name='dealMode']:checked").val();
    var dealCommand = "DealToNext"

    // TODO: Initiate Deal to Specific
    console.log("Deal to Specific Clicked");
    // TODO: Advance Deal to Next
};

/**
 * dealActionCompleted() - Deal action completed, enable Dealer actions.
 */
DealerController.prototype.dealActionCompleted = function() {
    this.setDealerOptions("enable");
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
    var safety = 0;
    var playersLength = this.playerApp.hand.players.length;
    var playerIdx = this.playerApp.hand.getIdxOfPlayerName(currentDealToName);
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
        playerIdx = initialPlayerIdx;
    }

    this.updateDealToNext(this.playerApp.hand.players[playerIdx].name);
};