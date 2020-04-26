/**
 * Socket 
 */
var socket= io();

socket.on("playerList", function(data) {
    playerApp.updatePlayerList(data);
}); 