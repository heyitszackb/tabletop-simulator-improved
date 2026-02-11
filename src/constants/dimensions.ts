// Standard poker card dimensions (in world units, roughly matching inches)
export const CARD_WIDTH = 0.635;
export const CARD_HEIGHT = 0.003;
export const CARD_DEPTH = 0.889;

// Visual gap between stacked cards (larger than CARD_HEIGHT to prevent z-fighting)
export const CARD_STACK_GAP = 0.01;

// Table dimensions
export const TABLE_WIDTH = 12;
export const TABLE_DEPTH = 8;
export const TABLE_HEIGHT = 0.1;
export const TABLE_Y = -TABLE_HEIGHT / 2;

// Deck spawn position
export const DECK_SPAWN_POSITION: [number, number, number] = [0, 0.5, 0];

// Card draw offset from deck
export const DRAW_OFFSET_X = 1.2;

// Flip animation
export const FLIP_LIFT_HEIGHT = 0.6;
export const FLIP_DURATION = 0.5; // seconds total

// Hand zone
export const HAND_ZONE_HEIGHT = 120; // px from bottom of screen
