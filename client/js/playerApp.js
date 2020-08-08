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
    this.hostDialog = new HostDialog(this);
    this.dealerController = new DealerController(this);
    this.betController = new BetController(this);
    this.payoutController = new PayoutController(this);
    this.domHelpers = new DomHelpers();
    this.socket = socket;  
    this.playerList = [];
    this.opponentNoXref = [];
    this.room;
    this.myName;
    this.mySocketId;
    this.isHost;
    this.hand = {};
    this.initialize();
} 

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************

/**
 * initialize() - Initialize the Player Application object
 */
PlayerApp.prototype.initialize = function () {
    this.setupDom();
    this.setupEvents();
};

/**
 * setupDom() - Perform any DOM Setup
 */
PlayerApp.prototype.setupDom = function () {
    $("#hostOpenDialogButton").hide();

    // Set the Room Id from the Query String.
    var room = this.domHelpers.getQueryStringValueByName("room");
    room = ((room === undefined) || (room === null)) ? "" : room;
    $("#joinRoom").val(room);

    // If room is provided, check to see if Host checkbox should be enabled.
    if (room !== "") {
        this.checkHostAvailable();        
    }

    $("#signInDialog").show();
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

/**
 * initializeHand() - Initialize a hand and display the basic information
 * @param {Object} payload - Hand Information from server.
 */
PlayerApp.prototype.initializeHand = function(payload) {
    this.hand = new Hand(this, payload.gameName, payload.commentInfo, payload.playerInfo);
    this.hand.displayHandDetails("handName", "handCommentInfo");
    this.hand.displayHandPlayerInfo("handPlayerInfoArea");
    this.hand.clearPlayerCardAreas();
};

// ************************************************************************************************
// Events Section
// ************************************************************************************************

/**
 * generateRoom() - Generates a Guid to act as the Room Id
 * @param {Object} event - Object associated with triggered Event.
 */
PlayerApp.prototype.generateRoom = function (event) {
    var x = uuidv4();
    var objThis = event.data.obj;

    $("#joinRoom").val(x);
    objThis.checkHostAvailable();
};

/**
 * join() - Process the Player "join" request
 * @param {Object} event - Object associated with triggered Event.
 */
PlayerApp.prototype.join = function(event) {
    var isHost = $("#joinIsHost").is(":checked");
    var objThis = event.data.obj;
    var roomId = $("#joinRoom").val();

    objThis.resetJoinErrors();
    objThis.myName = $("#joinPlayerName").val();

    // Validate Input and, if valid, proceed.
    if (objThis.validateJoinInfo()) {
        // Send "join" request to Server
        objThis.socket.emit("join", { 
            room: roomId, 
            name: objThis.myName.trim(), 
            pin: $("#joinPlayerPin").val(), 
            host: isHost });

        // Set Url to include Room.
        objThis.replaceUrl(roomId)
    }
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
    $("#selectMe").prop("value", this.myName);
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

/**
 * rejoin() - Process setup actions when a player rejoin after disconnect 
 * or browser refresh.
 * @param {Object} data - Rejoin state data.
 */
PlayerApp.prototype.rejoin = function(data) {
    // Set and display Hand and Card info.
    this.hand = new Hand(this, data.handInfo.name, data.handInfo.commentInfo, []);
    this.hand.setRejoinHandPlayers(data.handPlayerInfo);
    this.hand.populateAndDisplayAllHands(data.cardInfo);

    // Process any special states (deal, bet ...)
    switch (data.state.toLowerCase()) {
        case "deal":
            this.hand.dealerRejoin(data.statePayload);
            break;
        case "bet":
            this.hand.bettorRejoin(data.statePayload);
            break;
    }
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
 * setJoinErrors() - Sets the indicators and Error Message when a "join"
 * error occurs.
 * @param {string} errMsg - Error Message
 */
PlayerApp.prototype.setJoinErrors = function(errMsg) {
    $("#joinRoom").addClass("errorInput");
    $("#joinPlayerName").addClass("errorInput");
    $("#joinPlayerPin").addClass("errorInput");
    $("#joinErrorMsg").text(errMsg);
};

/**
 * resetJoinErrors - Removes error classes from Join Dialog fields.
 */
PlayerApp.prototype.resetJoinErrors = function() {
    $("#joinRoom").removeClass("errorInput");
    $("#joinPlayerName").removeClass("errorInput");
    $("#joinPlayerPin").removeClass("errorInput");
    $("#joinErrorMsg").text("");
};


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * validateJoinInfo() - Validate Join information.  All values must be present.
 */
PlayerApp.prototype.validateJoinInfo = function() {
    var retValue = true;
    var roomObj = $("#joinRoom");
    var playerNameObj = $("#joinPlayerName");
    var playerPinObj = $("#joinPlayerPin");

    if (roomObj.val().trim() === "") {
        retValue = false;
        roomObj.addClass("errorInput");
    }

    if (playerNameObj.val().trim() === "") {
        retValue = false;
        playerNameObj.addClass("errorInput");
    }

    if (playerPinObj.val().trim() === "") {
        retValue = false;
        playerPinObj.addClass("errorInput");
    }

    if (!retValue) {
        $("#joinErrorMsg").text("Please populate highlighted fields."); 
    }

    return retValue;
};

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
 * sendPickDealer() - Sends the Pick Dealer message to the server
 * @param {string} mode - Pick mode ("Random" or "Manual")
 * @param {string} player - Play name (if mode not "Random")
 */
PlayerApp.prototype.sendPickDealer = function(mode, player) {
    this.socket.emit("hostCommand", { 
        room: this.room,
        command: "PickDealer",
        payload: {
            mode: mode,
            player: player
        }
    });
};

/**
 * setOpponentNames() - Set the Opponents names on the table.
 */
PlayerApp.prototype.setOpponentNames = function() {
    _.forEach(this.opponentNoXref, function(item) {    
        $("#opponentName-" + item.opponentNo.toString()).text(item.name + ":");
        $("#selectPlayer-" + item.opponentNo.toString()).prop("value", item.name);
    });
};

/**
 * replaceUrl() - Replaces Url to add room info.  Warning - HTML5 (IE not supported)
 * @param {string} roomId = Room Id (GUID)
 */
PlayerApp.prototype.replaceUrl = function(roomId) {
    const params = new URLSearchParams(location.search);
    params.set("room", roomId);
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);    
};

/**
 * populatePlayersList() - Populates a Select List with Player's Names
 * @param {string} domSelectId - Id of Select to populate.
 */
PlayerApp.prototype.populatePlayersList = function(domSelectId) {
    var domObj = $("#" + domSelectId);
    
    domObj.empty();
    domObj.append($('<option/>', { value: "", text : "-- Please choose a Player --" }));

    _.forEach(this.playerList, function(player) {
        domObj.append($('<option/>', { value: player.name, text : player.name }));
    });
};

/**
 * getPlayerCardAreaName() - Determines the Card Area Id for selected Player Idx
 * @param {number} playerIdx - Index of the player to determine Area Id
 * @returns {string} - DOM Id of the player's Card area.
 */
PlayerApp.prototype.getPlayerCardAreaName = function(playerIdx) {
    var realThis = this;
    var areaNameId = 0;

    // Find My Index
    var MyIdx = _.findIndex(this.playerList, function(player) { return player.name == realThis.myName; });
    if (playerIdx === MyIdx) {
        return "playerCards";
    }

    // Determine Area Id
    // - If Player Idx is greater than mine, the Id is the difference from their idx to mine.
    // - If Player Idx is less than mine, the Id is their idx plus the number of players minus my idx.
    var areaNameId = (playerIdx > MyIdx) ? (playerIdx - MyIdx) : (playerIdx + (this.playerList.length - MyIdx));
    return "opponentCards-" + areaNameId.toString();
};

/**
 * getIdxOfPlayerName() - Get the index of the requested Player.
 * @param {string} playerName - Player's name to locate. 
 */
PlayerApp.prototype.getIdxOfPlayerName = function(playerName) {
    return _.findIndex(this.playerList, function(p) { return p.name === (playerName); });
};