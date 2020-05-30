/**
 * Socket Processing - Responsible for receiving and routing messages from server.
 */
var socket= io();

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
    playerApp.setJoinError("set", data.errorMsg);
});

/**
 * "hostCommandSuccess" event - Closes the Host Dialog
 */
socket.on("hostCommandSuccess", function() {
    playerApp.hostDialog.close();
});
