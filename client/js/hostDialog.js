/**
 * Host Dialog object
 */
var HostDialog = function(parent) {
    this.playerApp = parent;
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Host Dialog object
 */
HostDialog.prototype.initialize = function () {
    this.setupDom();
    this.setupEvents();
};

/**
 * setupDom() - Perform any DOM Setup
 */
HostDialog.prototype.setupDom = function () {
    $("#pickDealerRandom").attr('checked', true);
    $("#pickDealerSelectRow").hide();
};

/**
 * setupEvents() - Set up various events handlers.
 */
HostDialog.prototype.setupEvents = function () {
    // Set Button Click Events
    $("#hostOpenDialogButton").click({obj: this}, this.open);
    $("#hostCloseDialogButton").click({obj: this}, this.close);
    $("#pickDealerRandom").change({obj: this}, this.pickDealerManualChanged);
    $("#pickDealerManual").change({obj: this}, this.pickDealerManualChanged);
    $("#pickDealerButton").click({obj: this}, this.pickDealerProcessClick);
    $("#setAnteModeButton").click({obj: this}, this.setAnteModeProcessClick);
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * open() - Opens the Host Dialog
 */
HostDialog.prototype.open = function () {
    // TODO: Reset default values in dialog.   
    $("#hostDialog").show();
};

/**
 * close() - Closes the Host Dialog
 */
HostDialog.prototype.close = function () {
    $("#hostDialog").hide();    
};

/**
 * pickDealerManualChanged() - Handles the Pick Dealer Manual "Changed" event.
 * @param {Object} event - Object associated with triggered Event.
 */
HostDialog.prototype.pickDealerManualChanged = function(event) {
    var objThis = event.data.obj;
    var selection =  $("input[name='pickDealerOpt']:checked").val();

    if (selection == "Manual") {
        objThis.playerApp.populatePlayersList("pickDealerSelect");
        $("#pickDealerSelectRow").show();
    }
    else {
        $("#pickDealerSelectRow").hide();
    }
};

/**
 * pickDealerProcessClick() - Handles the Pick Dealer "Process" event.
 * @param {Object} event - Object associated with triggered Event.
 */
HostDialog.prototype.pickDealerProcessClick = function(event) {
    var objThis = event.data.obj;
    var mode = $("input[name='pickDealerOpt']:checked").val();
    var player = (mode === "Random") ? "" : $("#pickDealerSelect").val();

    objThis.setError("");
    objThis.playerApp.sendPickDealer(mode, player);
};

/**
 * setAnteModeProcessClick() - Handles the Set Ante Mode "Process" event.
 * @param {Object} event - Object associated with triggered Event.
 */
HostDialog.prototype.setAnteModeProcessClick = function(event) {
    var objThis = event.data.obj;

    // TODO: Implement "setAnteModeProcessClick"

    objThis.setError("");
    objThis.playerApp.socket.emit("hostCommand", { 
        room: objThis.playerApp.room,
        command: "SetAnteMode",
        payload: {
        }
    });
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * setError() - Sets (or resets) the Host Dialog error message.
 * @param {string} - msg - Message
 */
HostDialog.prototype.setError = function(msg) {
    $("#hostErrorMsg").text(msg);
};


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************
