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
    $("#pickDealerAuto").attr('checked', true);
    $("#pickDealerSelectRow").hide();
};

/**
 * setupEvents() - Set up various events handlers.
 */
HostDialog.prototype.setupEvents = function () {
    // Set Button Click Events
    $("#hostOpenDialogButton").click({obj: this}, this.open);
    $("#hostCloseDialogButton").click({obj: this}, this.close);
    $("#pickDealerAuto").change({obj: this}, this.pickDealerManualChanged);
    $("#pickDealerManual").change({obj: this}, this.pickDealerManualChanged);
    $("#pickDealerButton").click({obj: this}, this.pickDealerProcessClick);    
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

HostDialog.prototype.pickDealerManualChanged = function(event) {
    var objThis = event.data.obj;
    var selection =  $("input[name='pickDealerOpt']:checked"). val();

    if (selection == "Manual") {
        objThis.populatePlayersList("pickDealerSelect");
        $("#pickDealerSelectRow").show();
    }
    else {
        $("#pickDealerSelectRow").hide();
    }
};

HostDialog.prototype.pickDealerProcessClick = function(event) {
    // TODO: Implement
    console.log("pickDealerProcessClick Clicked");
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

/**
 * populatePlayersList() - Populates a Select List with Player's Names
 * @param {string} domSelectId - Id of Select to populate.
 */
HostDialog.prototype.populatePlayersList = function(domSelectId) {
    var domObj = $("#" + domSelectId);
    
    domObj.empty();
    domObj.append($('<option/>', { value: "", text : "-- Please choose a Player --" }));

    _.forEach(this.playerApp.playerList, function(player) {
        domObj.append($('<option/>', { value: player.name, text : player.name }));
    });
};
