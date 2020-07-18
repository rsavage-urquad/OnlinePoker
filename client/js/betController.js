/**
 * Bet Controller object
 */
var BetController = function(parent) {
    this.playerApp = parent;
    this.domHelpers = new DomHelpers();
    this.currentPayload = {};
    this.currentBet = 0;
    this.betValues = [];
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Bet Dialog object
 */
BetController.prototype.initialize = function () {
    this.prepareBetValues();
    this.setupDom();
    this.setupEvents();
};

/**
 * prepareBetValues() - Loads the Chip Values.  Significant changes probable. 
 */
BetController.prototype.prepareBetValues = function() {
    // TODO: (Future) - Get Chip Values and Amounts from Server.
    this.betValues = [
        {"backColor": "white", "textColor": "black", "value": 0.25 },
        {"backColor": "black", "textColor": "white", "value": 0.5 },
        {"backColor": "darkred", "textColor": "white", "value": 1 },
        {"backColor": "darkblue", "textColor": "white", "value": 2 }
    ];
};

/**
 * setupDom() - Perform any DOM Setup
 */
BetController.prototype.setupDom = function () {
    this.hideBetCommands();
};

/**
 * setupEvents() - Set up various events handlers.
 */
BetController.prototype.setupEvents = function () {
    // Reset any event handlers
    $("#betCheck").unbind();
    $("#betCall").unbind();
    $("#betBetRaise").unbind();
    $("#betFold").unbind();

    // Set Button Click Events
    $("#betCheck").click({obj: this}, this.betCheckClicked);
    $("#betCall").click({obj: this}, this.betCallClicked);
    $("#betBetRaise").click({obj: this}, this.betBetRaiseClicked);
    $("#betFold").click({obj: this}, this.betFoldClicked);
    this.setupBetDialog();
};

/**
 * setupBetDialog() - Set up the Bet Dialog information, including the button,
 * chips and events handlers
 */
BetController.prototype.setupBetDialog = function() {
    var betChipsObj = $("#betChips");
    var chip;

    // Build Chip Buttons
    betChipsObj.empty();
    for (var i = 0; i < this.betValues.length; i++) {
        chip = this.domHelpers.buildDomObj("button", "btn btn-lg bet-chip", accounting.formatMoney(this.betValues[i].value), false, false);
        chip.css( "background-color", this.betValues[i].backColor);
        chip.css( "color", this.betValues[i].textColor);
        chip.click({obj: this, chipValue: this.betValues[i].value}, this.betIncrementAmount);
        betChipsObj.append(chip);
    }

    // Reset any event handlers
    $("#betResetButton").unbind();
    $("#betSubmitButton").unbind();
 
    // Set Button Click Events
    $("#betResetButton").click({obj: this}, this.betResetClicked);
    $("#betSubmitButton").click({obj: this}, this.betSubmitClicked);    
};

// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * betCheckClicked() - Handles the Check clicked event by sending the message 
 * to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
BetController.prototype.betCheckClicked = function(event) {
    var objThis = event.data.obj;
    var respPayload = objThis.preparePayload();

    objThis.sendBetCommand("Check", respPayload);
    objThis.hideBetCommands();
};

/**
 * betCallClicked() - Handles the Call clicked event by sending the appropriate 
 * information to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
BetController.prototype.betCallClicked = function(event) {
    var objThis = event.data.obj;
    var checkPayload = { data: { obj: objThis }};

    objThis.currentBet = 0;
    objThis.betSubmitClicked(checkPayload);
};

/**
 * betBetRaiseClicked() 0 Handles the Bet/Raise clicked event by preparing and
 * displaying the Bet/Raise dialog.
 * @param {Object} event - Object associated with triggered Event.
 */
BetController.prototype.betBetRaiseClicked = function(event) {
    var objThis = event.data.obj;
    var betCurrentObj = $("#betCurrent");

    betCurrentObj.text(accounting.formatMoney(objThis.currentPayload.currentBet));
    objThis.currentBet = 0;
    objThis.setBetRaiseText(objThis.currentBet, objThis.currentPayload.currentBet);
    $("#betDialog").show();
};

/**
 * betFoldClicked() - Handles the Check clicked event by sending the message 
 * to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
BetController.prototype.betFoldClicked = function(event) {
    var objThis = event.data.obj;
    var respPayload = objThis.preparePayload();

    objThis.sendBetCommand("Fold",  respPayload);
    objThis.hideBetCommands();
};

/**
 * betIncrementAmount() - Handles the Chip button click by updating current bet 
 * and player message.
 * @param {Object} event - Object associated with triggered Event. 
 */
BetController.prototype.betIncrementAmount = function(event) {
    var objThis = event.data.obj;
    var chipValue = event.data.chipValue;
        
    objThis.currentBet += chipValue;
    objThis.setBetRaiseText(objThis.currentBet, objThis.currentPayload.currentBet);
};

/**
 * beResetClicked() - Resets the current Bet amount
 * @param {Object} event - Object associated with triggered Event. 
 */
BetController.prototype.betResetClicked = function(event) {
    var objThis = event.data.obj;

    objThis.currentBet = 0;
    objThis.setBetRaiseText(objThis.currentBet, objThis.currentPayload.currentBet);
};

/**
 * betSubmitClicked() - Handles the Bet/Raise Submit click event by preparing
 * and sending the response to the server.
 * @param {Object} event - Object associated with triggered Event. 
 */
BetController.prototype.betSubmitClicked = function(event) {
    var objThis = event.data.obj;
    var respPayload = objThis.preparePayload();
    respPayload.bet = objThis.currentBet;

    objThis.sendBetCommand("BetRaise",  respPayload);
    $("#betDialog").hide();
    objThis.hideBetCommands();    
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************

/**
 * sendBetCommand() - Sends a Bet command to the server.
 * @param {string} command - Bet Command
 * @param {Object} payload - Command Payload
 */
BetController.prototype.sendBetCommand = function(command, payload) {
    this.playerApp.socket.emit("betCommand", { 
        room: this.playerApp.room,
        command: command,
        payload: payload
    });
};

// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * hideBetCommands() - Hides the Betting commands.
 */
BetController.prototype.hideBetCommands = function() {
    $("#betArea").hide();
};

/**
 * enableBetting() - Display the Betting options.
 * @param {Object} payload - Information pertaining to Betting details. 
 */
BetController.prototype.enableBetting = function(payload) {
    var checkBtnObj = $("#betCheck");
    var callBtnObj = $("#betCall");
    var betBtnObj = $("#betBetRaise");
    var betBtnText = "";

    // Hold Payload details for Bet/Raise dialog (if needed)
    this.currentPayload = payload;

    // Prepare "Check" & "Call" buttons.
    if (payload.currentBet > 0) {
        checkBtnObj.hide();

        // Set Call text and show button
        var callButtonText = "Call " + accounting.formatMoney(payload.currentBet - payload.prevBetSum)
        if (payload.prevBetSum > 0) {
            callButtonText += " (to " + accounting.formatMoney(payload.currentBet) + ")";
        }
        callBtnObj.text(callButtonText);
        callBtnObj.show();
    }
    else {
        checkBtnObj.show();
        callBtnObj.hide();       
    }

    // Prepare Bet/Raise button
    if (payload.raiseCount === payload.maxRaise) {
        betBtnObj.hide();
    }
    else {
        betBtnText = (payload.currentBet > 0) ? "Raise" : "Bet";
        betBtnObj.text(betBtnText);
        betBtnObj.show();
    }

    $("#betArea").show();
};

/**
 * setBetRaiseText() - Sets the Bet/Raise text in the Bet/Raise dialog to
 * inform the player of the current bet status.
 * @param {number} currBet - Current Bet
 * @param {number} prevBet - Previous Bet amount
 */
BetController.prototype.setBetRaiseText = function(currBet, prevBet) {
    var betRaiseTextObj = $("#betRaiseText");
    var betRaiseText;
    betRaiseText = (prevBet === 0) ? "Bet " : "Raise";
    betRaiseText += accounting.formatMoney(currBet);
    
    if (prevBet > 0) {
        betRaiseText += " to " + accounting.formatMoney(prevBet + currBet);
    }
    
    betRaiseTextObj.text(betRaiseText);
}


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * initializePayload() - Initialize the Payload information.
 */
BetController.prototype.preparePayload = function() {
    return {
        "player": this.playerApp.myName,
        "socketId": this.playerApp.mySocketId
    };
};

/**
 * getMinChipValue() - retrieves the minimum chip value.
 * @returns {number} - Minimum chip value.
 */
BetController.prototype.getMinChipValue = function() {
    return _.reduce(this.betValues, function(min, chip) {
            return (chip.value < min) ? chip.value : min;
        }, Number.MAX_VALUE);
};
