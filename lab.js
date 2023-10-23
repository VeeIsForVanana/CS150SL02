"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("node:readline/promises"));
const node_process_1 = require("node:process");
const rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
const scoreMap = new Map([
    ["A", 1,],
    ["2", -2,],
    ["3", 3,],
    ["4", 4,],
    ["5", 5,],
    ["6", 6,],
    ["7", 7,],
    ["8", 8,],
    ["9", 9,],
    ["10", 10],
    ["J", 10,],
    ["Q", 10,],
    ["K", 0,],
]);
class Card {
    flip() {
        this.faceUp = !this.faceUp;
        return this;
    }
    getName() {
        return this.faceUp ? this.name : "Face-down card";
    }
    constructor(name) {
        this.name = name;
        this.faceUp = false;
        this.suit = "";
        this.value = "";
        [this.suit, this.value] = this.name.split(' ');
    }
}
class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.score = 0;
    }
    retrieveScoreCardHelper(cardValue) {
        if (cardValue === undefined) {
            return 0;
        }
        else {
            return scoreMap.get(cardValue);
        }
    }
    countHand() {
        // Calculate the score
        let total = 0;
        for (const score of this.hand.map(card => this.retrieveScoreCardHelper(card === null || card === void 0 ? void 0 : card.value))) {
            total += score ? score : 0;
        }
        this.score += total;
        return total;
    }
    checkHandFaceUp() {
        return this.hand.every(card => card === null || card === void 0 ? void 0 : card.faceUp);
    }
}
class Round {
    constructor(players = []) {
        this.players = players;
        this.deck = [];
        this.discard = [];
        this.deckSize = 5;
        this.shuffle = (array) => {
            return array.sort(() => Math.random() - 0.5);
        };
        this.buildDeck();
        this.setUpPlayers();
    }
    buildDeck() {
        var _a;
        // TODO: Create a function building this.deck
        for (let suit of ["clubs", "spades", "hearts", "diamonds"]) {
            for (let value of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
                this.deck.push(new Card(`${suit} ${value}`));
            }
        }
        this.shuffle(this.deck);
        this.discard.push((_a = this.deck.pop()) === null || _a === void 0 ? void 0 : _a.flip());
    }
    setUpPlayers() {
        // TODO: Set up initial player hands
        for (const player of this.players) {
            player.hand = [];
            for (const cards of Array(this.deckSize)) {
                player.hand.push(this.deck.pop());
            }
        }
    }
    mainRoundLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            let lastPlayer = -1;
            while (!this.players.some(player => player.checkHandFaceUp())) {
                for (const [idx, player] of this.players.entries()) {
                    yield this.doTurn(player);
                    if (player.checkHandFaceUp() && lastPlayer < 0) {
                        // Check if current player has ended the round AND lastPlayer hasn't been already set (someone else has already ended the round)
                        lastPlayer = idx;
                    }
                }
            }
            // Handle extra turn for early ending for rounds
            for (let extraTurnPlayer = 0; extraTurnPlayer < lastPlayer; extraTurnPlayer++) {
                yield this.doTurn(this.players[extraTurnPlayer]);
            }
            console.log();
            console.log("CURRENT SCORES");
            for (const player of this.players) {
                console.log(`${player.name}: ${player.countHand()}, TOTAL: ${player.score}`);
            }
        });
    }
    doTurn(player) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.readout(player);
            const playerChoice = yield takeInput("Please input your choice (1 to 2) ");
            const drawnCard = this.drawCard(playerChoice);
            console.log(`You drew ${drawnCard === null || drawnCard === void 0 ? void 0 : drawnCard.getName()} from ${playerChoice == 1 ? 'deck' : 'discard pile'}`);
            const cardReplace = (yield takeInput("Please input your selected card to be replaced (1 to 5) ")) - 1;
            const oldCard = player.hand[cardReplace];
            player.hand[cardReplace] = drawnCard;
            this.discard.push((oldCard === null || oldCard === void 0 ? void 0 : oldCard.faceUp) ? oldCard : oldCard === null || oldCard === void 0 ? void 0 : oldCard.flip());
        });
    }
    drawCard(playerChoice) {
        var _a;
        if (this.deck.length <= 0) {
            const topDiscardCard = this.discard.pop();
            this.shuffle(this.discard);
            this.discard.map(card => card === null || card === void 0 ? void 0 : card.flip());
            this.deck = this.discard;
            this.discard = [topDiscardCard];
        }
        return (playerChoice == 1) ? (_a = this.deck.pop()) === null || _a === void 0 ? void 0 : _a.flip() : this.discard.pop();
    }
    readout(currentPlayer) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Print out hands for current game state
            console.log('GAME STATE:');
            console.log(`Discard Pile: ${(_a = this.discard[this.discard.length - 1]) === null || _a === void 0 ? void 0 : _a.getName()}`);
            for (const player of this.players) {
                console.log(`Player ${player.name}`);
                for (const [jdx, card] of player.hand.entries()) {
                    console.log(`   ${jdx + 1} ${card === null || card === void 0 ? void 0 : card.getName()}`);
                }
                console.log();
            }
            console.log(`\n\nCHOICES for Player ${currentPlayer.name}:`);
            // Print available choices
            console.log(`1: Draw a card from the deck (reveal card)`);
            console.log(`2: Draw a card from the discard pile`);
        });
    }
}
function takeInput(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const choice = yield rl.question(prompt);
        return parseInt(choice);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const numberOfPlayers = 2;
        const playerArr = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            playerArr.push(new Player(`${i + 1}`));
        }
        const maxRounds = 9;
        for (let rounds = 0; rounds < maxRounds; rounds++) {
            const round = new Round(playerArr);
            yield round.mainRoundLoop();
            console.log("\n\nA round has ended, starting a new round!");
        }
        // Check the winner
        const minScore = Math.min(...playerArr.map(player => player.score));
        const winner = playerArr.map(player => player.score).indexOf(minScore) + 1;
        console.log(`Player ${playerArr[winner].name} wins with score ${minScore}`);
        rl.close();
    });
}
main();
