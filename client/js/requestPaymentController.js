/**
 * RequestPayment Controller object
 */
var RequestPaymentController = function(parent) {
    this.playerApp = parent;
    this.domHelpers = new DomHelpers();
    this.paymentAmt = 0;
    this.amtValues = [];
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Request Payment Dialog object
 */
RequestPaymentController.prototype.initialize = function () {
    this.prepareAmtValues();
    this.setupDom();
    this.setupEvents();
};

/**
 * prepareAmtValues() - Loads the Chip Values.  Significant changes probable. 
 */
RequestPaymentController.prototype.prepareAmtValues = function() {
    this.paymentAmt = 0;

    // TODO: (Future) - Get Chip Values and Amounts from Server.
    // TODO: (Future) - Refactor to use in multiple places.
    this.amtValues = [
        {"backColor": "white", "textColor": "black", "value": 0.25 },
        {"backColor": "black", "textColor": "white", "value": 0.5 },
        {"backColor": "darkred", "textColor": "white", "value": 1 },
        {"backColor": "darkblue", "textColor": "white", "value": 2 }
    ];
};

/**
 * setupDom() - Perform any DOM Setup
 */
RequestPaymentController.prototype.setupDom = function () {
    var reqPayChips = $("#reqPayChips");
    var chip;

    this.playerApp.dealerController.hideShowDealerCommandArea("hide"); 
    this.populateFromSelectControl();
    this.setRequestAmount();
    
     // Build Chip Buttons
     reqPayChips.empty();
     for (var i = 0; i < this.amtValues.length; i++) {
         chip = this.domHelpers.buildDomObj("button", "btn btn-lg bet-chip", accounting.formatMoney(this.amtValues[i].value), false, false);
         chip.css( "background-color", this.amtValues[i].backColor);
         chip.css( "color", this.amtValues[i].textColor);
         chip.click({obj: this, chipValue: this.amtValues[i].value}, this.reqPayIncrementAmount);
         reqPayChips.append(chip);
     }   
};

/**
 * setupEvents() - Set up various events handlers.
 */
RequestPaymentController.prototype.setupEvents = function () {
    // Reset any event handlers
    $("#reqPayResetButton").unbind();
    $("#reqPaySubmitButton").unbind();
    $("#reqPayCancelButton").unbind();
 
    // Set Button Click Events
    $("#reqPayResetButton").click({obj: this}, this.reqPayResetClicked);
    $("#reqPaySubmitButton").click({obj: this}, this.reqPaySubmitClicked);    
    $("#reqPayCancelButton").click({obj: this}, this.reqPayCancelClicked);    
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * reqPayIncrementAmount() - Handles the Chip button click by updating current Request 
 * Payment and player message.
 * @param {Object} event - Object associated with triggered Event. 
 */
RequestPaymentController.prototype.reqPayIncrementAmount = function(event) {
    var objThis = event.data.obj;
    var chipValue = event.data.chipValue;
    var amtDomObj = $("#reqPayAmt");

    amtDomObj.removeClass("errorInput");
    objThis.paymentAmt += chipValue;
    objThis.setRequestAmount();
};

/**
 * reqPayResetClicked() - Resets the current payment amount
 * @param {Object} event - Object associated with triggered Event. 
 */
RequestPaymentController.prototype.reqPayResetClicked = function(event) {
    var objThis = event.data.obj;

    objThis.paymentAmt = 0;
    objThis.setRequestAmount();
};

/**
 * reqPaySubmitClicked() - Handles the Request Payment Submit click event by preparing
 * and sending the message to the server and returning Dealer controls.
 * @param {Object} event - Object associated with triggered Event. 
 */
RequestPaymentController.prototype.reqPaySubmitClicked = function(event) {
    var objThis = event.data.obj;
    var respPayload = objThis.preparePayload();
    var fromPlayer = $("#reqPayFromSelectList").val();

    if (!objThis.validateData(fromPlayer)) {
        return;   
    }

    // Populate Payload
    respPayload.fromPlayer = fromPlayer
    respPayload.amount = objThis.paymentAmt;

    // Send message to server
    objThis.sendRequestPaymentCommand(respPayload);
    $("#reqPayDialog").hide();
    objThis.playerApp.dealerController.hideShowDealerCommandArea("show"); 
};

/**
 * reqPayCancelClicked() - Handles the Request Payment Cancel click event by closing 
 * the dialog and returning Dealer controls.
 * @param {Object} event - Object associated with triggered Event.
 */
RequestPaymentController.prototype.reqPayCancelClicked = function(event) {
    var objThis = event.data.obj;

    $("#reqPayDialog").hide();   
    objThis.playerApp.dealerController.hideShowDealerCommandArea("show"); 
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************

/**
 * sendRequestPaymentCommand() - Sends a Request Payment command to the server.
 * @param {Object} payload - Command Payload
 */
RequestPaymentController.prototype.sendRequestPaymentCommand = function(payload) {
    this.playerApp.socket.emit("dealerCommand", { 
        room: this.playerApp.room,
        command: "RequestPayment",
        payload: payload
    });
};


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * setRequestAmount() - Sets the Payment Amount text in the Request Payment dialog to
 * inform the player of the requesting amount.
 */
RequestPaymentController.prototype.setRequestAmount = function() {
    var reqPayAmtObj = $("#reqPayAmt");
    var reqPayAmtText = accounting.formatMoney(this.paymentAmt);
    reqPayAmtObj.text(reqPayAmtText);
}


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * populateFromSelectControl() - Populates the Request Payment "From" select list.
 */
RequestPaymentController.prototype.populateFromSelectControl = function() {
    var domObj = $("#reqPayFromSelectList");

    domObj.removeClass("errorInput");
    domObj.empty();
    domObj.append($('<option/>', { value: "", text : "-- Please choose a Player --" }));

    if ((this.playerApp.hand !== undefined) && (this.playerApp.hand !== null)) {
        _.forEach(this.playerApp.hand.players, function(player) {
            if (!player.fold) {
                domObj.append($('<option/>', { value: player.name, text : player.name }));
            }
        });
    }
};

/**
 * validateData() - Validates the Request Payment information
 * @param {string} fromPlayer - Request payment "from" Player name.
 * @returns {boolean} - true if valid, otherwise false.
 */
RequestPaymentController.prototype.validateData = function(fromPlayer) {
    var isValid = true;
    var selectDomObj = $("#reqPayFromSelectList");
    var amtDomObj = $("#reqPayAmt");

    // Reset any existing error css
    selectDomObj.removeClass("errorInput");
    amtDomObj.removeClass("errorInput");
    
    // Error if no "From" was selected
    if (fromPlayer === "") {
        selectDomObj.addClass("errorInput");
        isValid = false;
    } 

    // Error is amount is 0
    if (this.paymentAmt === 0) {
        amtDomObj.addClass("errorInput");
        isValid = false;       
    }

    return isValid;
};

/**
 * initializePayload() - Initialize the Payload information.
 */
RequestPaymentController.prototype.preparePayload = function() {
    return {
        "fromPlayer": "",
        "amount": 0
    };
};

