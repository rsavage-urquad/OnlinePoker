var playerApp = null;

/**
 * create the Plater Application object
 */
$(document).ready(function() {
    playerApp = new PlayerApp();
});

/**
 * Player Application object
 */
var PlayerApp = function() {
    this.hostDialog = new HostDialog(this)
    this.socket = socket;  
    this.playerList = [];
    this.opponentNoXref = [];
    this.room;
    this.myName;
    this.mySocketId;
    this.isHost;
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Player Application object
 */
PlayerApp.prototype.initialize = function () {
    $("#hostOpenDialogButton").hide();
    $("#signInDialog").show();
    this.setupEvents();
};

/**
 * setupEvents() - Set up various events handlers.
 */
PlayerApp.prototype.setupEvents = function () {
    // Change Events
    $("#joinRoom").change(this.checkHostAvailable);  

    // Set Button Click Events
    $("#generateRoomButton").click({obj: this}, this.generateRoom);
    $("#joinButton").click({obj: this}, this.join);
    $("#hostOpenDialogButton").click({obj: this.hostDialog}, this.hostDialog.open);
    $("#hostCloseDialogButton").click({obj: this.hostDialog}, this.hostDialog.close);
};


// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * generateRoom() - Generates a Guid to act as the Room Id
 */
PlayerApp.prototype.generateRoom = function (event) {
    var x = uuidv4();
    var realThis = event.data.obj;

    $("#joinRoom").val(x);
    realThis.checkHostAvailable();
};

/**
 * join() - Process the Player "join" request
 */
PlayerApp.prototype.join = function(event) {
    var isHost = $("#joinIsHost").is(":checked");
    var realThis = event.data.obj;

    realThis.setJoinError("reset", "");
    realThis.myName = $("#joinPlayerName").val();

    // Send "join" request to Server
    realThis.socket.emit("join", { 
        room: $("#joinRoom").val(), 
        name: realThis.myName.trim(), 
        pin: $("#joinPlayerPin").val(), 
        host: isHost });
};

// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************

/** 
 * updatePlayerList() - Called by the Socket class, update the player list.
 * @param {Array} data - Player List (from the server)
 */
PlayerApp.prototype.updatePlayerList = function(data) {
    var realThis = this;

    this.playerList = [];
    _.forEach(data.playerList, function(item) {
        var player = new Player(item.room, item.name, item.socketId, item.host, item.dealer, item.buyInAmount, item.amount);
        realThis.playerList.push(player);
        if (item.name === realThis.myName) { 
            realThis.mySocketId = item.socketId; 
            realThis.isHost = item.host;
        }
    });

    $("#playerInfoArea").empty();
    _.forEach(this.playerList, function(item) {
        var div = $("<div>");
        div.html(item.display());
        $("#playerInfoArea").append(div);
    });

    // Set Room Title
    this.room = this.playerList[0].room;
    $("#roomTitle").text("Online Poker (" + this.room + ")");

    // Set Names in Player Area
    $("#playerName").text(this.myName + ":")
    this.setOpponentNoXref();
    this.setOpponentNames();

    // Set Host Button
    if (this.isHost) {
        $("#hostOpenDialogButton").show();
    }
    else {
        $("#hostOpenDialogButton").hide();
    }
};

/**
 * checkHostAvailable() - Initiate a call to the server to see if as host has already
 * been established for the Room.
 */
PlayerApp.prototype.checkHostAvailable = function () {
    var room = $("#joinRoom").val();
    $.get( 
        "checkHost",
        { "room": room }, 
        function( data ) {
            $("#joinIsHost").prop("disabled", data.gotHost);
        }
    );
};


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************

/**
 * joinSuccess() - Process "joinSuccess" message by hiding the Player Sign In dialog
 */
PlayerApp.prototype.joinSuccess = function() {
    $("#signInDialog").hide();
};

/**
 * setJoinError() - Sets or resets the Join Error Message
 * @param {string} status - Determines if "set" or "reset" is being requested.
 * @param {string} errorMsg - Error Message
 */
PlayerApp.prototype.setJoinError = function(status, errorMsg) {
    if (status.toLowerCase() === "set") {
        $("#joinPlayerName").addClass("errorInput");
        $("#joinErrorMsg").text(errorMsg); 
    }
    else {
        $("#joinPlayerName").removeClass("errorInput");
        $("#joinErrorMsg").text(""); 
    }
};

// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * setOpponentNoXref() - Create the opponent number xref.  This will be used when
 * dealing an displaying information 
 */
PlayerApp.prototype.setOpponentNoXref = function() {
    var playerCount = this.playerList.length;
    var myIdx;
    
    this.opponentNoXref = [];
    for (var i = 0; i < playerCount; i++) {
        if (this.playerList[i].socketId === this.mySocketId) {
            myIdx = i;
        }
        else {
            this.opponentNoXref.push({socketId: this.playerList[i].socketId, name: this.playerList[i].name, idx: i, opponentNo: 0});
        }
    }

    _.forEach(this.opponentNoXref, function(item) {
        item.opponentNo = (item.idx < myIdx) ? playerCount - myIdx + item.idx : item.idx - myIdx
    });
};

/**
 * setOpponentNames() - Set the Opponents names on the table.
 */
PlayerApp.prototype.setOpponentNames = function() {
    _.forEach(this.opponentNoXref, function(item) {    
        $("#opponentName-" + item.opponentNo.toString()).text(item.name + ":");
    });
};