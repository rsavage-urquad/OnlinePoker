const _ = require('lodash');

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
                deck.push({ "suit": suit, "value": val});
            })
        });

        return deck;
    };

    /**
     * shuffle() - Shuffles the deck and resets the next card pointer
     */
    shuffle() {
        let newSlot = 0;
        for (let mix = 0; mix < 8; mix++) {
            for (let slot = 0; slot < 52; slot++) {
                let card = this.deck[slot];
                newSlot = Math.floor(Math.random() * 52);
                this.deck[slot] = this.deck[newSlot];
                this.deck[newSlot] = card;
            }
        }
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
    }

};

module.exports = Deck;