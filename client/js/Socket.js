/**
 * Socket Processing - Responsible for receiving and routing messages from server.
 */
var socket= io();

// ************************************************************************************************
// General Section
// ************************************************************************************************

/**
 * "playerList" event - Updates Player information from the server.
 */
socket.on("playerList", function(data) {
    playerApp.updatePlayerList(data);
}); 

/**
 * "joinSuccess" event - Notifies player of successful join
 */
socket.on("joinSuccess", function() {
    playerApp.joinSuccess();
});

/**
 * "joinError" event - Notifies player of a join error
 */
socket.on("joinError", function(data) {
    playerApp.setJoinErrors(data.errorMsg);
});

socket.on("rejoinPlayerState", function(data) {
    // TODO: Implement rejoinPlayerState
    console.log("rejoinPlayerState");
});

// ************************************************************************************************
// Host Section
// ************************************************************************************************

/**
 * "hostCommandSuccess" event - Closes the Host Dialog
 */
socket.on("hostCommandSuccess", function() {
    playerApp.hostDialog.close();
});

/**
 * "hostCommandFailure" event - Displays the error message from the server.
 */
socket.on("hostCommandFailure", function(msg) {
    playerApp.hostDialog.setError(msg);
});


// ************************************************************************************************
// dealer Section
// ************************************************************************************************

/**
 * "dealerSetup" event - Passes the Dealer setup message to the app for processing.
 */
socket.on("dealerSetup", function(payload) {
    console.log(payload)
    playerApp.dealerController.dealerSetup(payload);
});

/**
 * "handInfo" event - Causes the "Hand Info" area to pe populated with info
 * from the payload.
 */
socket.on("handInfoInitialize", function(payload) {
    playerApp.initializeHand(payload);
});

/**
 * handPlayerInfoUpdate - Causes the Hand's Player Info and display area to 
 * be populated with info from the payload.
 */
socket.on("handPlayerInfoUpdate", function(payload) {
    playerApp.hand.updatePlayerInfo(payload);
});


/**
 * "initiateDealing" event - Causes the Dealer Commands to become active. 
 */
socket.on("initiateDealing", function(payload) {
    playerApp.dealerController.initiateDealing(payload);
});

/**
 * "dealToPlayer" event - Receives a card and passes to the Hand to process. 
 */
socket.on("dealToPlayer", function(payload) {
    playerApp.hand.receiveCard(payload);
});

/**
 *  "deckStats" event - Deck Statistics (Cards remaining and muck count).
 */
socket.on("deckStats", function(payload) {
    playerApp.hand.deckStatsReceived(payload);
});

/**
 * "dealActionCompleted" event - Deal operation completed.
 */
socket.on("dealActionCompleted", function(payload) {
    playerApp.dealerController.dealActionCompleted(payload);
});

/**
 * "dealerCommandFailure" event - Displays the error message from the server.
 */
socket.on("dealerCommandFailure", function(payload) {
    // TODO: (Cleanup) Implement "dealerCommandFailure" processing
    console.log("Dealer Command Failure - " + payload);
});

socket.on("dealResume", function() {
    playerApp.dealerController.dealResume();
});

/**
 * "deckDisposition" event - Displays the Deck Disposition options.
 */
socket.on("deckDisposition", function() {
    playerApp.dealerController.deckDisposition();
});


// ************************************************************************************************
// Betting Section
// ************************************************************************************************

/**
 * "betRequest" event - Request that the player select a bet option.
 */
socket.on("betRequest", function(payload) {
    playerApp.betController.enableBetting(payload);
});

/**
 * "betCommandFailure" event - Displays the error message from the server.
 */
socket.on("betCommandFailure", function(payload) {
    // TODO: (Cleanup) Implement "betCommandFailure" processing
    console.log("Bet Command Failure - " + payload);
});

// ************************************************************************************************
// End Hand Section
// ************************************************************************************************

socket.on("showAllHands", function(payload) {
    playerApp.hand.showAllHands(payload);
});
