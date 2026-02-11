import type { Card } from "./card";

export interface Deck {
  id: string;
  cards: Card[];
  position: [number, number, number];
}
