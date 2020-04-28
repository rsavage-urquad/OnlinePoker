/**
 * Socket Processing
 */
var socket= io();

/**
 * "playerList" event, updates Player information from the server.
 */
socket.on("playerList", function(data) {
    playerApp.updatePlayerList(data);
}); 