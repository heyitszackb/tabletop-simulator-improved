import {
  generateCardBackTexture,
  generateCardFaceTexture,
} from "@/lib/cardTextureGenerator";
import type { Rank, Suit } from "@/types/card";
import { useMemo } from "react";
import type { CanvasTexture } from "three";

const faceTextureCache = new Map<string, CanvasTexture>();
let backTextureInstance: CanvasTexture | null = null;

function getCachedFaceTexture(suit: Suit, rank: Rank): CanvasTexture {
  const key = `${suit}-${rank}`;
  let texture = faceTextureCache.get(key);
  if (!texture) {
    texture = generateCardFaceTexture(suit, rank);
    faceTextureCache.set(key, texture);
  }
  return texture;
}

function getCachedBackTexture(): CanvasTexture {
  if (!backTextureInstance) {
    backTextureInstance = generateCardBackTexture();
  }
  return backTextureInstance;
}

export function useCardTexture(suit: Suit, rank: Rank) {
  const faceTexture = useMemo(() => getCachedFaceTexture(suit, rank), [suit, rank]);
  const backTexture = useMemo(() => getCachedBackTexture(), []);

  return { faceTexture, backTexture };
}
