import {PlayingCard, CardCollection, Player, IPokerScoreService, PokerHandResult, CardName, PokerScoreService} from 'typedeck';
import {formatName, formatRank} from "./formatters";
import isEqual from "lodash.isequal";

export type NullablePokerHandResult = PokerHandResult | undefined;

export default class ScorePrinter {

  protected scoreService: IPokerScoreService;
  protected results: [string, PokerHandResult][];
  protected players: Player[];

  constructor(players: Player[], communityCards: CardCollection) {
    this.scoreService = new PokerScoreService();
    this.players = players;
    this.results = Array.from(this.scorePlayers(this.players, communityCards));
    this.results.sort(([_a, a], [_b, b]) => b.value - a.value);
  }

  public print() {
    let activeRank = 1;
    this.results.forEach(([playerKey, result], index) => {
      const prevResult = this.getPrevPlayerResult(index);
      const nextResult = this.getNextPlayerResult(index);
      const player = this.getPlayerById(playerKey);
      const playerName = player ? player.name : 'Unknown';
      const printedHand = this.calculatePrintedHand(result, prevResult, nextResult);
      activeRank = printedHand.handSameAsPrev ? activeRank : index + 1;
      console.log(`${formatRank(String(activeRank))} ${formatName(playerName)} with a ${printedHand.handDescription}`);
    });
  }

  protected calculatePrintedHand(result: PokerHandResult, prevResult: NullablePokerHandResult, nextResult: NullablePokerHandResult) {
    const prevEquality = this.calculateHandEquality(result, prevResult);
    const nextEquality = this.calculateHandEquality(result, nextResult);
    let handDescription;

    if (prevEquality.handEqual || nextEquality.handEqual) {
      const resultScoringCards = result.scoringHandCardNames.map(cn => CardName[cn]).join(', ');
      handDescription = `${result.toString()} using ${resultScoringCards}; Tied!`;
    } else if (prevEquality.cardsEqual || nextEquality.cardsEqual) {
      const resultScoringCards = result.scoringHandCardNames.map(cn => CardName[cn]).join(', ');
      const kickers = result.kickers.map(card => CardName[card.cardName]).join(', ');
      handDescription = `${result.toString()} using ${resultScoringCards}; Tie breaker using ${kickers}`;
    } else if (prevEquality.handTypeEqual || nextEquality.handTypeEqual) {
      const resultScoringCards = result.scoringHandCardNames.map(cn => CardName[cn]).join(', ');
      handDescription = `${result.toString()} using ${resultScoringCards}`;
    } else {
      handDescription = result.toString();
    }

    return {
      handDescription: handDescription,
      handSameAsPrev: nextEquality.handEqual
    }
  }

  protected calculateHandEquality(handA: NullablePokerHandResult, handB: NullablePokerHandResult) {
    if ((!handA || !handB) || handA.handType !== handB.handType) {
      return {
        handTypeEqual: false,
        cardsEqual: false,
        handEqual: false,
        handsTied: false
      }
    }

    const cardsEqual = isEqual(handA.scoringHandCardNames, handB.scoringHandCardNames);
    const handEqual = cardsEqual && isEqual(handA.kickers, handB.kickers);
    return {handTypeEqual: true, cardsEqual, handEqual};
  }

  protected scorePlayers(players: Player[], communityCards: CardCollection) {
    return this.scoreService.scorePlayers(players, communityCards.getCards() as PlayingCard[]).entries();
  }

  protected getPlayerById(id: string) {
    return this.players.find(player => player.id === id);
  }

  protected getNextPlayerResult(index: number): NullablePokerHandResult {
    return index > 0 ? this.results[index - 1][1] : undefined;
  }

  protected getPrevPlayerResult(index: number): NullablePokerHandResult {
    return index < this.results.length - 1 ? this.results[index + 1][1] : undefined;
  }
}