import {TexasHoldEmPokerGameType, PlayingCard, CardCollection, Player, Hand} from 'typedeck';
import ScorePrinter from './lib/scorePrinter';
import {SuitMap, CardMap} from "./lib/translations";
import {formatPrompt, formatName, formatError} from "./lib/formatters";
import readline from 'readline';

/**
 * Kills the process with an end user friendly error
 * @param {string} message
 * @returns {never}
 */
const throwInputError = (message: string) => {
  console.log(formatError(message));
  return process.exit(1);
};

/**
 * Get a card from the deck via it's descriptor
 * @param {string} cardDescriptor
 * @returns {PlayingCard}
 */
const pullCardViaDescriptor = (cardDescriptor: string): PlayingCard => {
  let [name, suit] = cardDescriptor.trim().toUpperCase().split('');
  const card = allowedCards.find((card: PlayingCard) => card.suit === SuitMap[suit] && card.cardName === CardMap[name]);

  if (!card) {
    return throwInputError(`Unknown card '${cardDescriptor}'`);
  }

  if (!deck.hasCard(card)) {
    return throwInputError(`${card.toString()} already used`);
  }

  deck.removeCards([card]);

  return card;
};

/**
 * Begins a new cycle for a players cards
 */
const promptForPlayerCards = () => {
  ui.setPrompt(formatPrompt(`What is ${formatName(`player ${players.length + 1}`)}'s name and two cards?`));
  ui.prompt();
};

/**
 * Begins a new cycle for the community cards
 */
const promptForCommunityCards = () => {
  ui.setPrompt(formatPrompt(`What are the five ${formatName('community cards')}?`));
  ui.prompt();
}

/**
 * Manger for community cards input
 * @param {string} input
 */
const handleCommunityCards = (input: string) => {
  const cardDescriptors = input.split(' ');
  if (cardDescriptors.length !== 5) {
    throwInputError(`Expected 5 community cards but received ${input === '' ? 0 : cardDescriptors.length}`);
  }

  communityCards.addCards(cardDescriptors.map(pullCardViaDescriptor));
  promptForPlayerCards();
};

/**
 * Manager for player cards input
 * @param {string} input
 */
const handlePlayerCards = (input: string) => {
  const descriptors = input.split(' ');
  if (descriptors.length < 3) {
    throwInputError('Missing player name or card');
  }

  const playerName: string = descriptors.slice(0, -2).join(' ');
  const playerHand: Hand = new Hand(descriptors.slice(-2).map(pullCardViaDescriptor));
  players.push(new Player(playerName, playerHand));
};

/**
 * Manager for calculating and printing scores
 */
const handleCalculateScores = () => {
  if (players.length === 0) {
    throwInputError('No players entered');
  }

  const scorePrinter = new ScorePrinter(players, communityCards);
  scorePrinter.print();
  process.exit(0);
};

// Main flow manager
const handlePromptLine = (line: string) => {
  const input = line.trim();
    if (communityCards.getCount() > 0 && input.length === 0) {
      return handleCalculateScores();
    } else if (communityCards.getCount() === 0) {
      handleCommunityCards(input);
    } else {
      handlePlayerCards(input);
    }
};

// Setup the game board
const game = new TexasHoldEmPokerGameType();
const allowedCards = game.cardsAllowed as PlayingCard[];
const deck = new CardCollection([...allowedCards]);
const communityCards = new CardCollection();
const players: Player[] = [];

// Setup the UI handler
const ui = readline.createInterface({
  input: process.stdin,
  output: process.stdin.isTTY ? process.stdout : undefined
});

ui.on('line', handlePromptLine);
ui.on('close', () => handlePromptLine(''));

// Kick it off
promptForCommunityCards();