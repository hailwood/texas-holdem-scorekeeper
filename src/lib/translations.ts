import {CardName, Suit} from 'typedeck';

export const CardMap: { [key: string]: number } = {
  '2': CardName.Two,
  '3': CardName.Three,
  '4': CardName.Four,
  '5': CardName.Five,
  '6': CardName.Six,
  '7': CardName.Seven,
  '8': CardName.Eight,
  '9': CardName.Nine,
  'T': CardName.Ten,
  'J': CardName.Jack,
  'Q': CardName.Queen,
  'K': CardName.King,
  'A': CardName.Ace
};

export const SuitMap: { [key: string]: number } = {
  'D': Suit.Diamonds,
  'S': Suit.Spades,
  'H': Suit.Hearts,
  'C': Suit.Clubs
}