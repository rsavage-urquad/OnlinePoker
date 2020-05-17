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
    this.setupEvents();
};

/**
 * setupEvents() - Set up various events handlers.
 */
HostDialog.prototype.setupEvents = function () {
    // Set Button Click Events
    $("#hostOpenDialogButton").click({obj: this}, this.open);
    $("#hostCloseDialogButton").click({obj: this}, this.close);
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * open() - Opens the Host Dialog
 */
HostDialog.prototype.open = function () {
    $("#hostDialog").show();
};

/**
 * close() - Closes the Host Dialog
 */
HostDialog.prototype.close = function () {
    $("#hostDialog").hide();    
};


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

