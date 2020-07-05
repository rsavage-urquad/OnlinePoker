const _ = require("lodash");
const HandPlayer = require("./handPlayer");

class Bet {
    constructor (hand, stopPlayer, maxRaise) {
        this.hand = hand;
        this.stopPlayer = stopPlayer;
        this.currentPlayer = stopPlayer;
        this.currentBet = 0.0;
        this.raiseCount = 0;
        this.maxRaise = maxRaise;
        this.playerBets = this.initiatePlayerBets();
        this.bettingEnded = false;
    };

    // ************************************************************************************************
    // Initialize Methods
    // ************************************************************************************************

    /**
     * initiatePlayerBets() - Prepares the Array that will be used to track how much they
     * have bet this round (ad if they folded).
     * @returns {Array} - Initialized Player Bets array.
     */
    initiatePlayerBets() {
        let playerBets = [];

        _.forEach(this.hand.players, function(player) {
            if (!player.fold) {
                playerBets.push(new HandPlayer(player.name, 0));
            }
        });

        return playerBets;
    };

    // ************************************************************************************************
    // Action Methods
    // ************************************************************************************************

    /**
     * advanceBettingPlayer() - Advance the "currentPlayer" to the next active player.  If 
     * the next active player is the "Stop" player, set the betting ended flag.
     * @param {boolean} playerRaised - Did player raise?
     */
    advanceBettingPlayer(playerRaised) {
        let playerIdx = this.getPlayerIdx(this.currentPlayer);

        // If Current Player is the Stop Player, and they chose to Fold, set an flag to set a new Stop Player
        let stopPlayerFoldedCheck = ((this.currentPlayer === this.stopPlayer) && (this.playerBets[playerIdx].fold));

        if (playerRaised) {
            this.stopPlayer = this.currentPlayer;
        }        
        
        playerIdx = this.getNextActivePlayer(playerIdx);
        this.currentPlayer = this.playerBets[playerIdx].name;
        this.bettingEnded = (this.currentPlayer === this.stopPlayer);

        if (stopPlayerFoldedCheck) {
            // Set new Stop Player
            this.stopPlayer = this.currentPlayer;
        }
    };

    /**
     * setBetPlayerFold() - Sets the Player to Fold in the playersBet array.
     * @param {string} playerName - Player's Name to set. 
     */
    setBetPlayerFold(playerName) {
        const playerIdx = this.getPlayerIdx(playerName);
        this.playerBets[playerIdx].fold = true;
    };

    // ************************************************************************************************
    // Display Methods
    // ************************************************************************************************


    // ************************************************************************************************
    // Helper Methods
    // ************************************************************************************************

    /**
     * getPlayerIdx() - Gets the index of the Player from the playerBets array.
     * @param {string} name - Name of Player to locate. 
     */
    getPlayerIdx(name) {
        return _.findIndex(this.playerBets, function(item) { return item.name === name; });       
    };

    /**
     * getNextActivePlayer() - Locates the index of the next Active Player.
     * @param {number} startIdx - Starting Player's index. 
     */
    getNextActivePlayer(startIdx) {
        var safety = 0;
        var playersLength = this.playerBets.length;
        var playerIdx = startIdx;
        var initialPlayerIdx = playerIdx;
        
        // Advance the index until a non-Fold player is found (added a safety check to avoid infinite loop)
        playerIdx++;
        if (playerIdx >= playersLength) { playerIdx = 0; }
        while ((this.playerBets[playerIdx].fold) && (safety < playersLength)) {
            playerIdx++;
            if (playerIdx >= playersLength) { playerIdx = 0; }
            safety++;
        }
    
        // If safety check triggered, make current player next.
        if ((safety >= playersLength)) {
            console.log("Safety triggered - getNextActivePlayer");
            playerIdx = initialPlayerIdx;
        }
    
        return playerIdx;
    };    

};

module.exports = Bet;