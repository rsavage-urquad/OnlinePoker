/**
 * Card object
 * @param {string} suit - Card Suit ("H"=Hearts, "S"=Spades, "D"=Diamonds, "C"=Clubs).
 * @param {string} value - A,2,3,4,5,6,7,8,9,T,J,Q,K
 * @param {boolean} faceUp - Was card dealt face up?
 */
var Card = function (suit, value, faceUp) {
    this.suit = suit;
    this.value = value;
    this.faceUp = faceUp;
};

// ************************************************************************************************
// Initialization Section
// ************************************************************************************************


// ************************************************************************************************
// Events Section
// ************************************************************************************************


// ************************************************************************************************
// Data Activities Section
// ************************************************************************************************


// ************************************************************************************************
// Display Processing Section
// ************************************************************************************************


// ************************************************************************************************
// Helpers Section
// ************************************************************************************************

/**
 * getImageName() - Gets the image name of the card.
 * @returns {string} - Image name of the card.
 */
Card.prototype.getImageName = function() {
    var suitName;
    var valueName;

    if (this.suit === "X") {
        return "BlueBack.png";
    }

    switch (this.suit) {
        case "C":
            suitName = "clubs";
            break;
        case "D":
            suitName = "diamonds";
            break;
        case "H":
            suitName = "hearts";
            break;
        default:
            suitName = "spades";
            break;
    }

    switch (this.value) {
        case "A":
            valueName = "ace";
            break;
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            valueName = this.value;
            break;
        case "T":
            valueName = "10";
            break;
        case "J":
            valueName = "jack";
            break;
        case "Q":
            valueName = "queen";
            break;      
        default:
            valueName = "king";
            break;
    }

    return valueName + "_of_" + suitName + ".png";
};
