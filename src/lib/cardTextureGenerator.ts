import { SUIT_COLORS, SUIT_SYMBOLS } from "@/constants/cards";
import type { Rank, Suit } from "@/types/card";
import { CanvasTexture, SRGBColorSpace } from "three";

const TEXTURE_WIDTH = 256;
const TEXTURE_HEIGHT = 360;

function createCardCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

export function generateCardFaceTexture(suit: Suit, rank: Rank): CanvasTexture {
  const [canvas, ctx] = createCardCanvas();
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  // White background with rounded corners
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // Border
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, TEXTURE_WIDTH - 4, TEXTURE_HEIGHT - 4);

  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Top-left rank
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText(rank, 14, 12);

  // Top-left suit symbol
  ctx.font = "28px Georgia, serif";
  ctx.fillText(symbol, 16, 48);

  // Center suit symbol (large)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "80px Georgia, serif";
  ctx.fillText(symbol, TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2);

  // Bottom-right rank (rotated)
  ctx.save();
  ctx.translate(TEXTURE_WIDTH - 14, TEXTURE_HEIGHT - 12);
  ctx.rotate(Math.PI);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText(rank, 0, 0);
  ctx.font = "28px Georgia, serif";
  ctx.fillText(symbol, 2, 36);
  ctx.restore();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function generateCardBackTexture(): CanvasTexture {
  const [canvas, ctx] = createCardCanvas();

  // Dark blue background
  ctx.fillStyle = "#1E3A5F";
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // Border
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, TEXTURE_WIDTH - 16, TEXTURE_HEIGHT - 16);

  // Inner border
  ctx.strokeStyle = "#C9A84C";
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, TEXTURE_WIDTH - 28, TEXTURE_HEIGHT - 28);

  // Diamond pattern
  ctx.fillStyle = "#2A5080";
  const size = 20;
  for (let y = 24; y < TEXTURE_HEIGHT - 24; y += size) {
    for (let x = 24; x < TEXTURE_WIDTH - 24; x += size) {
      if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
        ctx.fillRect(x, y, size - 1, size - 1);
      }
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
