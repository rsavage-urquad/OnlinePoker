/**
 * Bet Controller object
 */
var BetController = function(parent) {
    this.playerApp = parent;
    this.currentPayload = {};
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Host Dialog object
 */
BetController.prototype.initialize = function () {
    this.setupDom();
    this.setupEvents();
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
    $("#betFold").click({obj: this}, this.betFold);
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
    var payload = objThis.initializePayload()

    objThis.sendBetCommand("Check", payload);
    objThis.hideBetCommands();
};

BetController.prototype.betCallClicked= function(event) {
    var objThis = event.data.obj;
    var payload = objThis.initializePayload()

    // TODO: Implement betCallClicked
    console.log("betCallClicked");
};

BetController.prototype.betBetRaiseClicked= function(event) {
    var objThis = event.data.obj;
    var payload = objThis.initializePayload()

    // TODO: Implement betBetRaiseClicked
    console.log("betBetRaiseClicked");    
};

/**
 * betFold() - Handles the Check clicked event by sending the message 
 * to the server.
 * @param {Object} event - Object associated with triggered Event.
 */
BetController.prototype.betFold= function(event) {
    var objThis = event.data.obj;
    var payload = objThis.initializePayload()

    objThis.sendBetCommand("Fold",  payload);
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
        callBtnObj.text("Call - " + accounting.formatMoney(payload.currentBet));
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

// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * initializePayload() - Initialize the Payload information.
 */
BetController.prototype.initializePayload = function() {
    return {
        "socketId": this.playerApp.mySocketId, 
        "player": this.playerApp.myName 
    };
};
