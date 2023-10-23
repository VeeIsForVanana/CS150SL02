import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const rl = readline.createInterface({ input, output })
const scoreMap = new Map([
[    "A" , 1,],
[    "2" , -2,],
[    "3" , 3,],
[    "4" , 4,],
[    "5" , 5,],
[    "6" , 6,],
[    "7" , 7,],
[    "8" , 8,],
[    "9" , 9,],
[    "10", 10],
[    "J" , 10,],
[    "Q" , 10,],
[    "K" , 0,],
])


class Card {
    
    public faceUp : boolean = false;
    public suit : string = ""
    public value : string = ""

    flip() {
        this.faceUp = !this.faceUp
        return this
    }

    getName() {
        return this.faceUp ? this.name : "Face-down card"
    }

    constructor(private name: string) {
        [this.suit, this.value] = this.name.split(' ')
    }

}

class Player {

    public hand : Array<Card | undefined> = []
    public score : number = 0

    constructor(public name : string) {}

    retrieveScoreCardHelper(cardValue : string | undefined) {
        if (cardValue === undefined) {
            return 0
        }
        else {
            return scoreMap.get(cardValue)
        }
    }

    countHand(): number {
        // Calculate the score
        let total = 0
        for(const score of this.hand.map(card => this.retrieveScoreCardHelper(card?.value))) {
            total += score ? score : 0
        }
        
        this.score += total
        return total
    }

    checkHandFaceUp(): boolean {
        return this.hand.every(card => card?.faceUp)
    }

}

class Round {
    
    public deck : Array<Card | undefined> = []
    public discard : Array<Card | undefined> = []
    private deckSize : number = 5

    
    constructor(public players : Array<Player> = []) {
        this.buildDeck()
        this.setUpPlayers()
    }

    shuffle = (array: any[]) => { 
        return array.sort(() => Math.random() - 0.5); 
    }; 

    buildDeck() {
        // TODO: Create a function building this.deck
        for(let suit of ["clubs", "spades", "hearts", "diamonds"]) {
            for(let value of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
                this.deck.push(new Card(`${suit} ${value}`))
            }
        }
        this.shuffle(this.deck)
        this.discard.push(this.deck.pop()?.flip())
    }

    setUpPlayers() {
        // TODO: Set up initial player hands
        for(const player of this.players) {
            player.hand = []
            for(const cards of Array(this.deckSize)) {
                player.hand.push(this.deck.pop())
            }
        }
    }

    async mainRoundLoop() {
        let lastPlayer = -1

        while(!this.players.some(player => player.checkHandFaceUp())) {
            for(const [idx, player] of this.players.entries()) {
                await this.doTurn(player)
                if(player.checkHandFaceUp() && lastPlayer < 0) {
                    // Check if current player has ended the round AND lastPlayer hasn't been already set (someone else has already ended the round)
                    lastPlayer = idx
                }
            }
        }

        // Handle extra turn for early ending for rounds
        for(let extraTurnPlayer = 0; extraTurnPlayer < lastPlayer; extraTurnPlayer++) {
            await this.doTurn(this.players[extraTurnPlayer])
        }

        console.log()
        console.log("CURRENT SCORES")
        for(const player of this.players) {
            console.log(`${player.name}: ${player.countHand()}, TOTAL: ${player.score}`)
        }
    }

    async doTurn(player: Player) {
        await this.readout(player)
            const playerChoice = await takeInput("Please input your choice (1 to 2) ")
            const drawnCard = this.drawCard(playerChoice)
            console.log(`You drew ${drawnCard?.getName()} from ${playerChoice==1 ? 'deck' : 'discard pile'}`)
            const cardReplace = await takeInput("Please input your selected card to be replaced (1 to 5) ") - 1
            const oldCard = player.hand[cardReplace]
            player.hand[cardReplace] = drawnCard
            this.discard.push(oldCard?.faceUp ? oldCard : oldCard?.flip())
    }    

    drawCard(playerChoice: number) {
        if (this.deck.length <= 0) {
            const topDiscardCard = this.discard.pop()
            this.shuffle(this.discard)
            this.discard.map(card => card?.flip())
            this.deck = this.discard
            this.discard = [topDiscardCard]
        }
        return (playerChoice == 1) ? this.deck.pop()?.flip() : this.discard.pop()
    }

    async readout(currentPlayer: Player) {
        // Print out hands for current game state
        console.log('GAME STATE:')
        console.log(`Discard Pile: ${this.discard[this.discard.length - 1]?.getName()}`)

        for(const player of this.players) {
            console.log(`Player ${player.name}`)
            for(const [jdx, card] of player.hand.entries()) {
                console.log(`   ${jdx + 1} ${card?.getName()}`)
            }
            console.log()
        }
        
        console.log(`\n\nCHOICES for Player ${currentPlayer.name}:`)
        // Print available choices
        console.log(`1: Draw a card from the deck (reveal card)`)
        console.log(`2: Draw a card from the discard pile`)
    }

}

async function takeInput(prompt: string): Promise<number> {
    const choice = await rl.question(prompt)
    return parseInt(choice)
}

async function main() {
    
    const numberOfPlayers = 2
    const playerArr = []

    for(let i = 0; i < numberOfPlayers; i++) {
        playerArr.push(new Player(`${i + 1}`))
    }

    const maxRounds = 9

    for(let rounds = 0; rounds < maxRounds; rounds++) {
        const round = new Round(playerArr)
        await round.mainRoundLoop()
        console.log("\n\nA round has ended, starting a new round!")
    }

    // Check the winner
    const minScore = Math.min(...playerArr.map(player => player.score))
    const winner = playerArr.map(player => player.score).indexOf(minScore) + 1
    console.log(`Player ${playerArr[winner].name} wins with score ${minScore}`)

    rl.close()
}

main()
