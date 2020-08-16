# Online Poker

This project is an attempt to create a multi-room multiplayer application to allow users to play poker.  A "Game Room" can host a Poker game for up to 7 players and will support dealing and betting.  At this time it is not intended to include computer controlled players.

## Status

### Host Interface

| Topic | Status | Description |
| --- | :---: | --- |
| Dealer Selection | *Done* | Both Manual and Random selection is available. |
| Game Room Setup | *Planned* | This will include items such as Buy In, Default Ante Amount, Ante Mode, Chip Amounts, Max Raise Count, Max Total Raise, Room Lock ...
| Troubleshooting Interface | *Planned* | Features are "to be determined" (as I identify scenarios where this functionality will be needed).

### Dealing Interface

| Topic | Status |
| --- | :---: |
| Dealing - Non-Draw (Stud, 7/27 ...) | *Done* |
| Dealing - Draw | *Future* |
| Dealing - Passing Cards | *Future* |
| Dealing - Common Cards (Texas Holdem) | *Future* |
| Card Display | *Done* |
| Betting Initiation | *Done* |
| Display Card Counts | *Done* |

### Betting

| Topic | Status |
| --- | :---: |
| Check | *Done* |
| Call | *Done* |
| Bet/Raise | *Done* |
| Fold | *Done* |

### Hand Disposition

| Topic | Status |
| --- | :---: |
| Display Hands | *Implemented but may change* |
| Payout | *Done* |
| Deck Disposition (Pass Deck/Deal Again) | *Done* |

## Environment Details

- **Server:** Node.js
- **Client:** JavaScript in the Browser
- Plan on hosting via Docker Container
