# Online Poker

This project is an attempt to create a multi-room multiplayer application to allow users to play poker.  A "Game Room" can host a Poker game for up to 7 players and will support dealing and betting.  At this time it is not intended to include computer controlled players.

## Status

### Host Interface

| Topic | Status | Description |
| --- | :---: | --- |
| Dealer Selection | *Working* | Both Manual and Random selection is available. |
| Game Room Setup | *Planned* | This will include items such as Buy In, Default Ante Amount, Ante Mode, Chip Amounts, Max Raise Count, Max Total Raise, Room Lock ...
| Troubleshooting Interface | *Planned* | Features are "to be determined" (as I identify scenarios where this functionality will be needed).

### Dealing Interface

| Topic | Status |
| --- | :---: |
| Dealing - Non-Draw (Stud, 7/27 ...) | *Working* |
| Dealing - Draw | *Future* |
| Dealing - Passing Cards | *Future* |
| Dealing - Common Cards (Texas Holdem) | *Future* |
| Card Display | *Working* |
| Betting Initiation | *Working* |
| Show All Hands | *Working* |
| Display Card Counts | *Working* |

### Betting

| Topic | Status |
| --- | :---: |
| Check | *Working* |
| Call | *Working* |
| Bet/Raise | *Working* |
| Fold | *Working* |

### Hand Disposition

| Topic | Status |
| --- | :---: |
| Display Hands | *Working but may change* |
| Payout | *Future* |
| Pass the Deal | *Future* |

## Environment Details

- **Server:** Node.js
- **Client:** JavaScript in the Browser
- Plan on hosting via Docker Container
