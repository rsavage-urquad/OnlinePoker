const Hand = require("./hand");

/**
 * DealerController Class - Responsible for Dealer Command interactions.
 */
class DealerController {
    constructor (socketController, gameRoom) {
        this.socketController = socketController;
        this.gameRoom = gameRoom;
    };

    /**
     * processCommand() - Processes the Dealer Command
     * @param {string} command - Command name
     * @param {Object} payload - Any associated data
     */
    processCommand(command, payload) {
        switch(command) {
            case "HandSetup":
                this.processHandSetup(payload);
                break;
            case "DealToAll":
                this.processDealToAll(payload);
                break;                
            case "DealToSpecific":
                this.processDealToSpecific(payload);
                break;
            case "BetInitiate":
                this.processBetInitiate(payload);
                break;
            case "EndShowAllHands":
                this.processShowAllHands();
                break;
            case "Payout":
                this.processPayout(payload);
                break;    
            default:
                this.socketController.dealerCommandFailure(`Unknown Command - ${command}`);                
                return;
        }
    }; 

    /**
     * processHandSetup() - Processes the Hand Setup command by setting up the Hand,
     * collecting the ante, sending messages to update the player display and informing
     * the Dealer to start dealing.
     * @param {Object} payload - Game Details sent from Dealer
     */
    processHandSetup(payload) {
        this.gameRoom.hand = new Hand(this.gameRoom, payload.gameName, payload.commentInfo, payload.anteAmount);
        this.gameRoom.hand.getAnte();
        this.gameRoom.setState("Deal", this.gameRoom.getDealer().name);
        this.socketController.broadcastPlayerList(this.gameRoom.room);
        this.gameRoom.hand.displayHandInfo();
        const dealToNext = this.gameRoom.hand.getDealToNextName(-1);
        this.socketController.dealerCommandInitiateDealing(dealToNext);
    };

    /**
     * processDealToAll() - Deals a card to all players
     * @param {*} payload - Includes if card should be dealt up/down and the starting player.
     */
    processDealToAll(payload) {
        let idx = this.gameRoom.hand.getHandPlayerIdx(payload.startPlayerName)

        for (let i = 0; i < this.gameRoom.hand.players.length; i++) {
            // Deal a card to only active Players
            if (!this.gameRoom.hand.players[idx].fold) {
                this.gameRoom.hand.dealToPlayer(this.gameRoom.hand.players[idx].name, payload.dealMode, false);
            }
            
            // Advance to the next player
            idx++;
            if (idx >= this.gameRoom.hand.players.length) { idx = 0; }
        }

        // Inform dealer that deal completed.
        this.socketController.dealerDealActionCompleted();
    };

    /**
     * processDealToSpecific() - Deals a card to a specific player.
     * @param {*} payload - Includes if card should be dealt up/down and the player to deal to.
     */
    processDealToSpecific(payload) {
        let idx = this.gameRoom.hand.getHandPlayerIdx(payload.toPlayerName)
        this.gameRoom.hand.dealToPlayer(this.gameRoom.hand.players[idx].name, payload.dealMode, payload.special);

        // Inform dealer that deal completed.
        this.socketController.dealerDealActionCompleted();
    };

    /**
     * processBetInitiate() - Process the Bet Initiate message by passing it
     * to the Hand object.
     * @param {Object} payload - Information pertaining to message. 
     */
    processBetInitiate(payload) {
        this.gameRoom.hand.betInitiate(payload.startPlayerName);
    };

    /**
     * processShowAllHands() - Process the Show All Hands message by passing it
     * to the Hand object.
     */
    processShowAllHands() {
        this.gameRoom.hand.emitShowAllHands();
    };

    /**
     * processPayout() - Process the Payout message by passing it to the 
     * Hand object.
     * @param {Array} payload - Array of payout details.
     */
    processPayout(payload) {
        this.gameRoom.hand.processPayout(payload);
    };
};

module.exports = DealerController;