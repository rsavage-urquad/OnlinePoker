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
 * "dealerSetup" - Passes the Dealer setup message to the app for processing.
 */
socket.on("dealerSetup", function(payload) {
    playerApp.dealerController.dealerSetup(payload);
});

/**
 * "handInfo" - Causes the "Hand Info" area to pe populated with info
 * from the payload.
 */
socket.on("handInfo", function(payload) {
    playerApp.initializeHand(payload);
});

/**
 * "initiateDealing" - Causes the Dealer Commands to become active. 
 */
socket.on("initiateDealing", function(payload) {
    playerApp.dealerController.initiateDealing(payload);
});

socket.on("dealToPlayer", function(payload) {
    // TODO: Implement dealToPlayer
    console.log(payload);
});
