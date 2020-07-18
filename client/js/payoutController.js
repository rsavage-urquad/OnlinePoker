/**
 * Payout Controller object
 */
var PayoutController = function(parent) {
    this.playerApp = parent;
    this.domHelpers = new DomHelpers();
    this.payoutAmountRemaining = 0;
    this.remainingPlayers = [];
    this.winners = [];
    this.minChipValue = 0;
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Payout Dialog object
 */
PayoutController.prototype.initialize = function () {
    this.initializeProperties(0, [], [], 0);
    this.setupDom();
    this.setupEvents();
};

/**
 * initializeProperties() - Initialize the Properties that can change.
 * @param {number} payoutAmountRemaining - Total amount to be paid out 
 * @param {Array} remainingPlayers - Array of the Names of remaining Players (potential winners) 
 * @param {Array} winners - Array of Winners (generally initialize to empty array)
 * @param {number} minChipValue - Minimum Chip Value 
 */
PayoutController.prototype.initializeProperties = function(payoutAmountRemaining, remainingPlayers, winners, minChipValue) {
    this.payoutAmountRemaining = payoutAmountRemaining;
    this.remainingPlayers = remainingPlayers;
    this.winners = winners;
    this.minChipValue = minChipValue;
};

/**
 * setupDom() - Perform any DOM Setup
 */
PayoutController.prototype.setupDom = function () {
    $("#payoutWinnerCount").val(this.winners.length);
    this.populateWinnerSelectControl();
    $("#payoutArea").empty();
    $("#payoutAmountRemaining").text(accounting.formatMoney(this.payoutAmountRemaining));
};

/**
 * setupEvents() - Set up various events handlers.
 */
PayoutController.prototype.setupEvents = function () {
    // Reset any event handlers
    $("#payoutWinnerSelect").unbind();
    $("#payoutSubmit").unbind();
    $("#payoutCancel").unbind();

    // Set Button Click Events
    $("#payoutWinnerSelect").click({obj: this}, this.payoutWinnerSelectClicked);
    $("#payoutSubmit").click({obj: this}, this.payoutSubmitClicked);
    $("#payoutCancel").click({obj: this}, this.payoutCancelClicked);
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * payoutWinnerSelectClicked() - Handles the winner Select clicked event by adding the 
 * selected player to the winner collection and preparing the DOM for further processing.
 * @param {Object} event - Object associated with triggered Event.
 */
PayoutController.prototype.payoutWinnerSelectClicked = function(event) {
    var objThis = event.data.obj;
    var selectedName = $("#payoutWinnerSelectList").val();

    objThis.setPayoutMsg("");

    // Ignore no selection
    if (selectedName === "") {
        return;   
    }
    
    // Add Selected Player to Winner collection, remove from Remaining Players and refresh Winner Select options.
    objThis.winners.push({name: selectedName, portion: "", amount: 0 });
    objThis.remainingPlayers = _.remove(objThis.remainingPlayers, function(name) { return (name !== selectedName); });
    objThis.populateWinnerSelectControl();

    // Refresh Winner Dom Area
    objThis.displayWinnersDomArea();
};

PayoutController.prototype.payoutSubmitClicked = function(event) {
    var objThis = event.data.obj;    

    objThis.setPayoutMsg("");

    // TODO: Format the Payout Message and send to Server
    // TODO: Server must respond with results, then "Pass the deal or not" options must be presented to dealer

    console.log("payoutSubmit Clicked")
};

/**
 * payoutCancelClicked() - Cancels the Payout dialog.
 * @param {Object} event - Object associated with triggered Event.
 */
PayoutController.prototype.payoutCancelClicked = function(event) {
    var objThis = event.data.obj; 
    objThis.setPayoutMsg("");
    $("#payoutDialog").hide();   
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * preparePayoutDialog() - Prepare and display the Payout dialog
 * @param {Array} remainingPlayers - Array of Players still remaining in the hand.
 * @param {number} potAmount - Amount to be paid out.
 * @param {number} minChipValue - Minimum Chip Value.
 */
PayoutController.prototype.preparePayoutDialog = function(remainingPlayers, potAmount, minChipValue) {
    this.initializeProperties(potAmount, remainingPlayers, [], minChipValue)
    this.setupDom();
    $("#payoutDialog").show();
};

/**
 * setPayoutMsg() - Set the payout message 
 * @param {string} msg - Message text.
 */
PayoutController.prototype.setPayoutMsg = function(msg) {
    $("#payoutMsg").text(msg);
};

PayoutController.prototype.displayWinnersDomArea = function() {
    $("#payoutArea").empty();
    this.setPayoutMsg("");

    _.forEach(this.winners, function(winner) {
        console.log(winner.name);
    });
};


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * populateWinnerSelectControl() - Populates the Winner(s) select options
 */
PayoutController.prototype.populateWinnerSelectControl = function() {
    var domObj = $("#payoutWinnerSelectList");
    
    domObj.empty();
    domObj.append($('<option/>', { value: "", text : "-- Please choose a Player --" }));

    // TODO: Prepare DOM, including setting up events
    _.forEach(this.remainingPlayers, function(player) {
        domObj.append($('<option/>', { value: player, text : player }));
    });
};





/*
    payoutWinnerCount
    payoutWinnerSelectList
    payoutArea
    payoutAmountRemaining
    payoutMsg
*/

