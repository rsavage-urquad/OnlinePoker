const _ = require("lodash");

class Deck {
    constructor () {
        this.deck = this.initializeDeck();
        this.muck = [];
    }

    // ************************************************************************************************
    // General Methods
    // ************************************************************************************************

    /**
     * initializeDeck() - Builds the Deck
     * @returns - Deck (Array of Card Objects)
     */
    initializeDeck() {
        let deck = [];
        let suits = ["H", "D", "S", "C"];
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

        _.forEach(suits, (suit) => {
            _.forEach(values, (val) => {
                deck.push({ "suit": suit, "value": val, "faceUp": false, "special": false });
            })
        });

        return deck;
    };

    /**
     * shuffle() - Shuffles the deck.
     */
    shuffle() {
        this.shuffleTarget(this.deck);
    };

    /**
     * dealNextCard() - Gets the next card and updates the next card pointer.
     * @returns - Card object
     */
    dealNextCard() {
        return this.deck.pop();
    };

    /**
     * remainingCards() - Returns the number of remaining cards
     * @returns - Number of cards remaining in the deck.
     */
    remainingCards() {
        return this.deck.length;
    };

    /**
     * addToMuck() - Adds a card to the muck. 
     * @param {Object} card - Card to be added. 
     */
    addToMuck(card) {
        this.muck.push(card);
    };

    /** 
     * shuffleMuck() - Shuffles the muck.
     */
    shuffleMuck(target) {
        this.shuffleTarget(this.muck);
    };

    /**
     * moveMuckToDeck() - Swaps the muck with the deck.
     */
    moveMuckToDeck() {
        let tempArray = this.deck;
        this.deck = this.muck;
        this.muck = tempArray;
    };


    /**
     * shuffleTarget() - Shuffles the target collection.
     * @param {Array} target - Target collection to be shuffled.
     */
    shuffleTarget(target) {
        let newSlot = 0;
        const deckLength = target.length;

        for (let mix = 0; mix < 8; mix++) {
            for (let slot = 0; slot < deckLength; slot++) {
                let card = target[slot];
                newSlot = Math.floor(Math.random() * deckLength);
                target[slot] = target[newSlot];
                target[newSlot] = card;
            }
        }
    };


};

module.exports = Deck;