import { useGameStore } from "@/stores/useGameStore";

export function DeckControls() {
  const decks = useGameStore((s) => s.decks);
  const spawnDeck = useGameStore((s) => s.spawnDeck);
  const shuffleDeck = useGameStore((s) => s.shuffleDeck);
  const drawToTable = useGameStore((s) => s.drawToTable);
  const drawToHand = useGameStore((s) => s.drawToHand);

  const deckEntries = Array.from(decks.entries());

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => spawnDeck()}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        Spawn Deck
      </button>

      {deckEntries.map(([id, deck]) => (
        <div
          key={id}
          className="flex flex-col gap-1 rounded bg-gray-800/80 p-2 text-xs text-gray-200"
        >
          <span className="font-medium">
            Deck ({deck.cards.length} cards)
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => drawToTable(id)}
              disabled={deck.cards.length === 0}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => drawToHand(id)}
              disabled={deck.cards.length === 0}
              className="rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Draw to Hand
            </button>
            <button
              type="button"
              onClick={() => shuffleDeck(id)}
              disabled={deck.cards.length === 0}
              className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Shuffle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
