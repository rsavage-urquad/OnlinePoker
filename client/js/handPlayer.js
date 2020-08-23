var HandPlayer = function (name, amount) {
    this.name = name;
    this.amount = amount;
    this.fold = false;
    this.declare = "";
    this.extraAmount = 0.0;
};

/**
 * display() - Formats the Hand Player Info for display.
 */
HandPlayer.prototype.display = function() {
    var fold = (this.fold) ? " (<span class='fold-ind'>Fold</span>)" : "";
    var declare = (this.declare !== "") ? " (<span>Declare: " + this.declare + "</span>)" : "";
    var amount = accounting.formatMoney(this.amount);
    var extraAmount = "";

    if (this.extraAmount !== 0) {
        extraAmount = " <span class='extra-amt'>(Extra: " + accounting.formatMoney(this.extraAmount) + ")</span>";
    }

    return this.name + fold + declare + " = " + amount + extraAmount;
};
