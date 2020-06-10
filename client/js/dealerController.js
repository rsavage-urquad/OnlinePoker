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
        objThis.playerApp.socket.emit("dealerCommand", { 
            room: objThis.playerApp.room,
            command: "HandSetup",
            payload: {
                gameName: $("#handGameName").val(),
                wildInfo: $("#handWildCardText").val(),
                anteAmount: $("#handAnteAmount").val()
            }
        });
    }
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * dealerSetup() - Prepares the Dealer Setup dialog and hide the Dealer commands
 */
DealerController.prototype.dealerSetup = function(payload) {
    $("#dealerCommandArea").hide();

    if (payload.name === this.playerApp.myName) {
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