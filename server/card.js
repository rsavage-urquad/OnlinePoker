class Card {
    constructor (suit, value, faceUp, special) {
        this.suit = suit;
        this.value = value;
        this.faceUp = faceUp;
        this.special = special;
    }

    // ************************************************************************************************
    // General Methods
    // ************************************************************************************************

    /**
     * setCard() - Deep copy of Card object.
     * @param {Object} card - Source Card.
     */
    setCard(card) {
        this.suit = card.suit;
        this.value = card.value;
        this.faceUp = card.faceUp;
        this.special = card.special;
    }
};

module.exports = Card;