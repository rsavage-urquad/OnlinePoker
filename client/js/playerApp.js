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
    this.room;
    this.initialize();
} 

/**
 * initialize() - Initialize the Player Application object
 */
PlayerApp.prototype.initialize = function () {
    $("#signInDialog").show();
    $("#room").change(this.checkHostAvailable);  
};

/**
 * generateRoom() - Generates a Guid to act as the Room Id
 */
PlayerApp.prototype.generateRoom = function () {
    var x = uuidv4();
    $("#room").val(x);
    this.checkHostAvailable();
};

/**
 * join() - Process the Player "join" request
 */
PlayerApp.prototype.join = function() {
    var isHost = $("#isHost").is(":checked");
    this.socket.emit("join", { 
        room: $("#room").val(), 
        name: $("#playerName").val(), 
        pin: $("#playerPin").val(), 
        host: isHost });
    $("#signInDialog").hide();
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
};

PlayerApp.prototype.checkHostAvailable = function () {
    var room = $("#room").val();
    $.get( 
        "checkHost",
        { "room": room }, 
        function( data ) {
            $("#isHost").prop("disabled", data.gotHost);
        }
    );
};