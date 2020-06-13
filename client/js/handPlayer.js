var HandPlayer = function (name, amount) {
    this.name = name;
    this.amount = amount;
    this.fold = false;
};

/**
 * display() - Formats the Hand Player Info for display.
 */
HandPlayer.prototype.display = function() {
    var fold = (this.fold) ? " (<span class='fold-ind'>Fold</span>)" : "";
    var amount = accounting.formatMoney(this.amount);
    return `${this.name}${fold} = ${amount}`;
};
