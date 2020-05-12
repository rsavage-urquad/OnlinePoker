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
    this.socket = socket;  
    this.playerList = [];
    this.opponentNoXref = [];
    this.room;
    this.myName;
    this.mySocketId;
    this.initialize();
} 

/**
 * initialize() - Initialize the Player Application object
 */
PlayerApp.prototype.initialize = function () {
    $("#signInDialog").show();
    $("#joinRoom").change(this.checkHostAvailable);  
};

/**
 * generateRoom() - Generates a Guid to act as the Room Id
 */
PlayerApp.prototype.generateRoom = function () {
    var x = uuidv4();
    $("#joinRoom").val(x);
    this.checkHostAvailable();
};

/**
 * join() - Process the Player "join" request
 */
PlayerApp.prototype.join = function() {
    var isHost = $("#joinIsHost").is(":checked");

    this.setJoinError("reset", "");
    this.myName = $("#joinPlayerName").val()
    this.socket.emit("join", { 
        room: $("#joinRoom").val(), 
        name: this.myName.trim(), 
        pin: $("#joinPlayerPin").val(), 
        host: isHost });
};

/**
 * joinSuccess() - Process "joinSuccess" message by hiding the Player Sign In dialog
 */
PlayerApp.prototype.joinSuccess = function() {
    $("#signInDialog").hide();
};

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
        if (item.name === realThis.myName) { realThis.mySocketId = item.socketId; }
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
};

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

PlayerApp.prototype.setOpponentNames = function() {
    _.forEach(this.opponentNoXref, function(item) {    
        $("#opponentName-" + item.opponentNo.toString()).text(item.name + ":");
    });
};