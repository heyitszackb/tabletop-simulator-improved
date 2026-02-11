# Tabletop Simulator

A web-based tabletop simulator with 3D card/deck operations built with React, Three.js, and Rapier physics.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Features

- Spawn and shuffle standard 52-card decks
- Draw cards to the table or directly to your hand
- Drag and drop cards with physics-based momentum (flick to slide)
- Flip cards via double-click or right-click menu
- Pick up table cards into your hand
- Play cards from your hand onto the table
- Player hand with fan layout and hover preview
- Card stacking with visual overlap
- Right-click context menu for card actions
- 3D rendering with procedurally generated card textures

## Stack

- **3D**: Three.js + React Three Fiber + drei
- **Physics**: Rapier via @react-three/rapier
- **UI**: React 19 + Tailwind CSS v4
- **Animation**: Motion (Framer Motion) + @react-spring/three
- **State**: Zustand
- **Build**: Vite + pnpm + TypeScript + Biome

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Auto-format with Biome |

## Known Bugs

- **Card stacking z-fighting**: Overlapping cards can flicker/z-fight at their edges, especially during the dynamic phase before settling. The z-order system, `polygonOffset`, and `renderOrder` mitigate most cases but don't fully eliminate the issue for all card configurations.
