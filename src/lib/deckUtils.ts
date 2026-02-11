import { RANKS, SUITS } from "@/constants/cards";
import type { Card } from "@/types/card";
import { v4 as uuidv4 } from "uuid";

export function createStandard52Deck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: uuidv4(),
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  return cards;
}

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
