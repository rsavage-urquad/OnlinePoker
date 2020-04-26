/**
 * Player object
 * @param {string} room - Room Id (Guid)
 * @param {string} name - Player Name
 * @param {string} socketId - Socket Id
 * @param {boolean} host - Is player Host?
 * @param {boolean} dealer - Is player Dealer?
 * @param {number} buyInAmount - Buy in Amount
 * @param {number} amount - Current Amount
 */
var Player = function (room, name, socketId, host, dealer, buyInAmount, amount) {
    this.room = room;
    this.name = name;
    this.socketId = socketId;
    this.host = host;
    this.dealer = dealer;
    this.buyInAmount = buyInAmount;
    this.amount = amount;
};

/**
 * display() - Formats the Player Info for display.
 * @returns {STRING}
 */
Player.prototype.display = function() {
    var host = (this.host) ? " (Host)" : "";
    var dealer = (this.dealer) ? " - Dealer" : "";
    var amount = accounting.formatMoney(this.amount);
    return `${this.name}${host}${dealer} = ${amount}`;
};
