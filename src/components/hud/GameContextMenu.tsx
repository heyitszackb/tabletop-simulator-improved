import { isCardBlockedByOthers } from "@/lib/cardOverlapCheck";
import { useGameStore } from "@/stores/useGameStore";
import { useToastStore } from "@/stores/useToastStore";
import { useCallback, useEffect, useState } from "react";

interface ContextMenuState {
  x: number;
  y: number;
  cardId: string | null;
  visible: boolean;
}

export function GameContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    cardId: null,
    visible: false,
  });

  const flipCard = useGameStore((s) => s.flipCard);
  const pickUpToHand = useGameStore((s) => s.pickUpToHand);

  const blocked = menu.cardId ? isCardBlockedByOthers(menu.cardId) : false;

  useEffect(() => {
    const handleContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cardEl = target.closest("[data-card-id]");

      if (cardEl) {
        e.preventDefault();
        setMenu({
          x: e.clientX,
          y: e.clientY,
          cardId: cardEl.getAttribute("data-card-id"),
          visible: true,
        });
      } else {
        setMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    const handleClick = () => {
      setMenu((prev) => ({ ...prev, visible: false }));
    };

    window.addEventListener("contextmenu", handleContext);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleContext);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleFlip = useCallback(() => {
    if (menu.cardId) {
      if (isCardBlockedByOthers(menu.cardId)) {
        useToastStore
          .getState()
          .addToast("Can't flip — card is covered by another card");
      } else {
        flipCard(menu.cardId);
      }
    }
    setMenu((prev) => ({ ...prev, visible: false }));
  }, [menu.cardId, flipCard]);

  const handlePickUp = useCallback(() => {
    if (menu.cardId) {
      if (isCardBlockedByOthers(menu.cardId)) {
        useToastStore
          .getState()
          .addToast("Can't pick up — card is covered by another card");
      } else {
        pickUpToHand(menu.cardId);
      }
    }
    setMenu((prev) => ({ ...prev, visible: false }));
  }, [menu.cardId, pickUpToHand]);

  if (!menu.visible || !menu.cardId) return null;

  return (
    <div
      className="fixed z-50 min-w-[160px] rounded-md border border-gray-600 bg-gray-800 py-1 shadow-xl pointer-events-auto"
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        onClick={handleFlip}
        disabled={blocked}
        className="w-full px-3 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Flip Card
        {blocked && (
          <span className="ml-1 text-xs text-gray-400">(covered)</span>
        )}
      </button>
      <button
        type="button"
        onClick={handlePickUp}
        disabled={blocked}
        className="w-full px-3 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Pick Up to Hand
        {blocked && (
          <span className="ml-1 text-xs text-gray-400">(covered)</span>
        )}
      </button>
    </div>
  );
}
