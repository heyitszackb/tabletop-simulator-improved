import {
  CARD_HEIGHT,
  DECK_SPAWN_POSITION,
  DRAW_OFFSET_X,
} from "@/constants/dimensions";
import { createStandard52Deck, fisherYatesShuffle } from "@/lib/deckUtils";
import type { Card, TableCard } from "@/types/card";
import type { Deck } from "@/types/deck";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

interface GameState {
  tableCards: Map<string, TableCard>;
  decks: Map<string, Deck>;
  hand: Card[];

  // Deck actions
  spawnDeck: (position?: [number, number, number]) => string;
  shuffleDeck: (deckId: string) => void;
  drawCard: (deckId: string) => Card | null;
  addCardToDeck: (deckId: string, card: Card) => void;

  // Table actions
  placeCardOnTable: (
    card: Card,
    position: [number, number, number],
    rotation?: [number, number, number],
  ) => void;
  removeCardFromTable: (cardId: string) => void;
  moveCardOnTable: (cardId: string, position: [number, number, number]) => void;
  flipCard: (cardId: string) => void;

  // Hand actions
  addToHand: (card: Card) => void;
  removeFromHand: (cardId: string) => Card | null;
  reorderHand: (fromIndex: number, toIndex: number) => void;

  // Compound actions
  drawToHand: (deckId: string) => void;
  drawToTable: (deckId: string) => void;
  pickUpToHand: (cardId: string) => void;
  playFromHand: (
    cardId: string,
    position: [number, number, number],
    faceUp?: boolean,
  ) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  tableCards: new Map(),
  decks: new Map(),
  hand: [],

  spawnDeck: (position = DECK_SPAWN_POSITION) => {
    const id = uuidv4();
    const cards = fisherYatesShuffle(createStandard52Deck());
    const deck: Deck = { id, cards, position };
    set((state) => {
      const decks = new Map(state.decks);
      decks.set(id, deck);
      return { decks };
    });
    return id;
  },

  shuffleDeck: (deckId) => {
    set((state) => {
      const decks = new Map(state.decks);
      const deck = decks.get(deckId);
      if (!deck) return state;
      decks.set(deckId, { ...deck, cards: fisherYatesShuffle(deck.cards) });
      return { decks };
    });
  },

  drawCard: (deckId) => {
    const state = get();
    const deck = state.decks.get(deckId);
    if (!deck || deck.cards.length === 0) return null;

    const card = deck.cards[deck.cards.length - 1];
    set((s) => {
      const decks = new Map(s.decks);
      const d = decks.get(deckId)!;
      decks.set(deckId, { ...d, cards: d.cards.slice(0, -1) });
      return { decks };
    });
    return card;
  },

  addCardToDeck: (deckId, card) => {
    set((state) => {
      const decks = new Map(state.decks);
      const deck = decks.get(deckId);
      if (!deck) return state;
      decks.set(deckId, {
        ...deck,
        cards: [...deck.cards, { ...card, faceUp: false }],
      });
      return { decks };
    });
  },

  placeCardOnTable: (card, position, rotation = [0, 0, 0]) => {
    set((state) => {
      const tableCards = new Map(state.tableCards);
      const tableCard: TableCard = { ...card, position, rotation };
      tableCards.set(card.id, tableCard);
      return { tableCards };
    });
  },

  removeCardFromTable: (cardId) => {
    set((state) => {
      const tableCards = new Map(state.tableCards);
      tableCards.delete(cardId);
      return { tableCards };
    });
  },

  moveCardOnTable: (cardId, position) => {
    set((state) => {
      const tableCards = new Map(state.tableCards);
      const card = tableCards.get(cardId);
      if (!card) return state;
      tableCards.set(cardId, { ...card, position });
      return { tableCards };
    });
  },

  flipCard: (cardId) => {
    set((state) => {
      const tableCards = new Map(state.tableCards);
      const card = tableCards.get(cardId);
      if (!card) return state;
      tableCards.set(cardId, { ...card, faceUp: !card.faceUp });
      return { tableCards };
    });
  },

  addToHand: (card) => {
    set((state) => ({
      hand: [...state.hand, { ...card, faceUp: true }],
    }));
  },

  removeFromHand: (cardId) => {
    const state = get();
    const card = state.hand.find((c) => c.id === cardId);
    if (!card) return null;
    set((s) => ({
      hand: s.hand.filter((c) => c.id !== cardId),
    }));
    return card;
  },

  reorderHand: (fromIndex, toIndex) => {
    set((state) => {
      const hand = [...state.hand];
      const [card] = hand.splice(fromIndex, 1);
      hand.splice(toIndex, 0, card);
      return { hand };
    });
  },

  drawToHand: (deckId) => {
    const card = get().drawCard(deckId);
    if (card) {
      get().addToHand(card);
    }
  },

  drawToTable: (deckId) => {
    const state = get();
    const deck = state.decks.get(deckId);
    if (!deck) return;

    const card = state.drawCard(deckId);
    if (card) {
      const stackHeight = CARD_HEIGHT * 2;
      state.placeCardOnTable(card, [
        deck.position[0] + DRAW_OFFSET_X,
        stackHeight,
        deck.position[2],
      ]);
    }
  },

  pickUpToHand: (cardId) => {
    const state = get();
    const card = state.tableCards.get(cardId);
    if (!card) return;
    state.removeCardFromTable(cardId);
    state.addToHand(card);
  },

  playFromHand: (cardId, position, faceUp = true) => {
    const state = get();
    const card = state.removeFromHand(cardId);
    if (card) {
      state.placeCardOnTable({ ...card, faceUp }, position);
    }
  },
}));
