import type { Rank, Suit } from "@/types/card";

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
export const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: "#DC2626",
  diamonds: "#DC2626",
  clubs: "#1a1a1a",
  spades: "#1a1a1a",
};
