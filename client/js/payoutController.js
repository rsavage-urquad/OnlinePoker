/**
 * Payout Controller object
 */
var PayoutController = function(parent) {
    this.playerApp = parent;
    this.domHelpers = new DomHelpers();
    this.totalPayoutAmount = 0;
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
    this.updateAmountRemaining();
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
    objThis.winners.push({"name": selectedName, "split": "", "amount": 0 });
    objThis.remainingPlayers = _.remove(objThis.remainingPlayers, function(name) { return (name !== selectedName); });
    objThis.populateWinnerSelectControl();

    // Refresh Winner Dom Area
    objThis.displayWinnersDomArea();
    $("#payoutWinnerCount").val(objThis.winners.length.toString());
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

/**
 * payoutSplitChanged() - Handles the winner Split changed event by recomputing
 * the payout amounts.
 * @param {Object} event - Object associated with triggered Event.
 */
PayoutController.prototype.payoutSplitChanged = function(event) {
    var objThis = event.data.obj; 
    objThis.setPayoutMsg("");

    // Update the winner collection objects
    objThis.updateWinnersFromForm();
    objThis.recomputeSplits();
    objThis.checkForAmountErrors();

    // Update Amount in DOM.
    objThis.unbindChangeEvents();
    objThis.updateFormAmounts();
    objThis.bindChangeEvents();
    
    // Update Amount Remaining
    objThis.updateAmountRemaining();
};

PayoutController.prototype.payoutAmountChanged = function(event) {
    var objThis = event.data.obj; 
    objThis.setPayoutMsg("");
   
    // TODO:Implement payoutAmountChanged
    console.log("payoutAmount Changed")    
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
    this.totalPayoutAmount = potAmount;
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

/**
 * displayWinnersDomArea() - Build and insert the Winner Payout DOM Table.  This will 
 * include wiring up the Change events. 
 */
PayoutController.prototype.displayWinnersDomArea = function() {
    var realThis = this;
    var domObj = $("#payoutArea");
    var table = $("<table>");
    var tr;
    var nameTd;
    var splitTd;
    var amountTd;
    var nameId;
    var splitId;
    var amountId;

    // Clear out existing info
    domObj.empty();
    this.setPayoutMsg("");

    // Prepare DOM, including setting up events
    _.forEach(this.winners, function(winner, idx) {
        nameId = "winnerName-" + idx.toString();
        nameTd = realThis.domHelpers.buildDomObj("td", "", winner.name, false, true);
        realThis.domHelpers.applyAttributeToObj(nameTd, "width", "40%");
        nameTd.append(realThis.domHelpers.buildInput("hidden", nameId, nameId, "", winner.name));

        splitId = "winnerSplit-" + idx.toString();
        splitTd = realThis.domHelpers.buildDomObj("td", "payout-col", "", false, false);
        realThis.domHelpers.applyAttributeToObj(splitTd, "width", "30%");
        splitTd.append(realThis.prepareSplitSelect(splitId, "form-control winner-split"));

        amountId = "winnerAmt-" + idx.toString();
        amountTd = realThis.domHelpers.buildDomObj("td", "payout-col", "", false, false);
        realThis.domHelpers.applyAttributeToObj(amountTd, "width", "30%");
        amountTd.append(realThis.domHelpers.buildInput("number", amountId, amountId, "form-control winner-amt", ""));

        tr = $("<tr>");
        tr.append(nameTd);
        tr.append(splitTd);
        tr.append(amountTd);
        table.append(tr);
    });

    domObj.append(table);

    // Wire Up Events
    this.unbindChangeEvents();
    this.bindChangeEvents();
};

PayoutController.prototype.updateFormAmounts = function() {
    // TODO: Implement updateFormAmounts
};

/**
 * updateAmountRemaining() - Updates the Amount Remaining DOM element.
 */
PayoutController.prototype.updateAmountRemaining = function() {
    $("#payoutAmountRemaining").text(accounting.formatMoney(this.payoutAmountRemaining));
}


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
    _.forEach(this.remainingPlayers, function(player) {
        domObj.append($('<option/>', { value: player, text : player }));
    });
};

/**
 * prepareSplitSelect() - Builds an HTML Select control populated with Split options.
 * @param {string} selectId - Id of control.
 * @param {string} selectClass - Class(es) to be associated with the control.
 */
PayoutController.prototype.prepareSplitSelect = function(selectId, selectClass) {
    var options = [];
    options.push({ "value": "", "text": "Portion" });
    options.push({ "value": "All", "text": "All" });
    options.push({ "value": "1/2", "text": "1/2" });
    options.push({ "value": "1/3", "text": "1/3" });
    options.push({ "value": "2/3", "text": "2/3" });
    options.push({ "value": "1/4", "text": "1/4" });
    options.push({ "value": "3/4", "text": "3/4" });
    options.push({ "value": "1/6", "text": "1/6" });
    options.push({ "value": "5/6", "text": "5/6" });

    return this.domHelpers.buildSelect(selectId, selectId, selectClass, options, "");
}

/**
 * unbindChangeEvents() - Unbind the Payout Split & Amount Change Events (to 
 * avoid unwanted triggering). 
 */
PayoutController.prototype.unbindChangeEvents = function() {
    $(".winner-split").unbind();
    $(".winner-amt").unbind();
}

/**
 * bindChangeEvents() - Bind the Payout Split & Amount Change Events to the 
 * appropriate Handlers.
 */
PayoutController.prototype.bindChangeEvents = function() {
    $(".winner-split").change({obj: this}, this.payoutSplitChanged);
    $(".winner-amt").change({obj: this}, this.payoutAmountChanged);    
}

/**
 * updateWinnersFromForm() - Update the this.winners Collection with the info 
 * from split table inputs controls.
 */
PayoutController.prototype.updateWinnersFromForm = function() {
    var numOfWinners = $("#payoutWinnerCount").val();
    var winnerName;
    var winnerIdx;
    var winnerIdxStr;
    var testAmt;

    for (var idx = 0; idx < numOfWinners; idx++) {
        winnerIdxStr = idx.toString();
        winnerName = $("#winnerName-" + winnerIdxStr).val();
        winnerIdx = _.findIndex(this.winners, function(w) { return w.name === winnerName; });
        if (winnerIdx !== -1) {
            this.winners[winnerIdx].split = $("#winnerSplit-" + winnerIdxStr).val();
            testAmt = $("#winnerAmt-" + winnerIdxStr).val();
            this.winners[winnerIdx].amount = (isNaN(testAmt)) ? Number(testAmt) : 0; 
        }
    }
};

PayoutController.prototype.recomputeSplits = function() {
    // TODO: Implement recomputeSplits
};

PayoutController.prototype.checkForAmountErrors = function() {
    // TODO: Implement checkForAmountErrors

    // TODO: Make Sure to update Amount Remaining.
};

/*
    objThis.winners.push({"name": selectedName, "split": "", "amount": 0 });

    payoutWinnerCount
    payoutWinnerSelectList
    payoutArea
    payoutAmountRemaining
    payoutMsg

    winnerName-#
    winnerSplit-#
    winnerAmt-#   

*/

