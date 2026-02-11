import { DeckControls } from "@/components/hud/DeckControls";
import { DragOverlay } from "@/components/hud/DragOverlay";
import { GameContextMenu } from "@/components/hud/GameContextMenu";
import { Hand } from "@/components/hud/Hand";
import { HandDropZone } from "@/components/hud/HandDropZone";
import { ToastContainer } from "@/components/hud/ToastContainer";

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top-left controls */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <DeckControls />
      </div>

      {/* Hand drop zone indicator (behind hand cards) */}
      <HandDropZone />

      {/* Hand zone at bottom */}
      <Hand />

      {/* Overlays */}
      <DragOverlay />
      <GameContextMenu />
      <ToastContainer />
    </div>
  );
}
