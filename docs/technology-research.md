# Technology Research: Web-Based Tabletop Simulator

> Comprehensive research into the optimal web technology stack for building a modern, full-featured tabletop simulator with superior UI/UX. Conducted February 2026.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Recommended Stack](#recommended-stack)
- [Architecture Overview](#architecture-overview)
- [3D Rendering & Physics](#3d-rendering--physics)
- [Multiplayer Networking & State Sync](#multiplayer-networking--state-sync)
- [UI/UX Frameworks & HUD Systems](#uiux-frameworks--hud-systems)
- [Asset Pipeline & Content Systems](#asset-pipeline--content-systems)
- [Scripting & Game Logic Automation](#scripting--game-logic-automation)
- [Audio](#audio)
- [Workshop, Sharing & Backend](#workshop-sharing--backend)
- [Architecture & Deployment](#architecture--deployment)
- [Cost Analysis](#cost-analysis)
- [Reference Implementations](#reference-implementations)
- [Sources](#sources)

---

## Executive Summary

This document presents the findings of a parallel research effort across five technology domains, evaluating the best web technologies for building a full-featured tabletop simulator. The project aims to bring a significantly better UI/UX version of Tabletop Simulator to the web browser.

The recommended stack centers on:

- **Three.js + React Three Fiber** for 3D rendering with React integration
- **Rapier (Rust WASM)** for deterministic physics (dice, stacking, collisions)
- **Colyseus** for authoritative multiplayer with hidden information support
- **React + shadcn/ui + Tailwind** for a polished, accessible game UI
- **Cloudflare (Durable Objects + Workers + R2 + Pages)** for deployment
- **Supabase** for user data, auth, and game catalog
- **Wasmoon** for TTS-compatible Lua scripting in-browser

Estimated cost at 10K concurrent games: **$600-2,000/month**.

---

## Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| **3D Rendering** | Three.js + React Three Fiber v9 + drei | Best React integration, largest ecosystem, WebGPU-ready |
| **Physics** | Rapier via @react-three/rapier v2 | WASM performance, deterministic, R3F-native |
| **UI Framework** | React 19 | Ecosystem, R3F integration, hiring pool |
| **UI Components** | shadcn/ui (Radix primitives) + Tailwind CSS v4 | Accessible, customizable, modern game aesthetic |
| **Animation** | Motion (Framer Motion) + @react-spring/three | MIT license, React-native, spring physics |
| **Drag & Drop** | @dnd-kit (UI) + custom pointer events (2D-to-3D) | Touch/keyboard support, cross-boundary DnD |
| **Drawing/Annotation** | perfect-freehand + Canvas 2D overlay | 2KB, production-proven ink-quality strokes |
| **State Management** | Zustand (client-side) | Lightweight, React-native |
| **Networking** | Colyseus (WebSocket, authoritative server) | Purpose-built for games, binary delta sync, hidden state |
| **Game State Model** | Colyseus Schema classes with @view() | Per-client visibility, auto-serialization |
| **Undo/Redo** | Command pattern with per-player stacks | Multiplayer-safe inverse operations |
| **Scripting (Lua)** | Wasmoon (Lua 5.4 via WASM) | 25x faster than Fengari, TTS-compatible |
| **Scripting (JS alt)** | QuickJS-WASM | Full ES2023 sandbox, memory isolation |
| **Audio** | Howler.js | 7KB, spatial audio, sound sprites |
| **Image Processing** | OffscreenCanvas + jSquash | Client-side WASM codecs, no server needed |
| **3D Asset Pipeline** | glTF-Transform + Draco + KTX2/Basis Universal | 60-95% compression, GPU-native textures |
| **File Uploads** | react-dropzone | Lightest weight, React-native hooks API |
| **Game Server** | Cloudflare Durable Objects | One DO per room, WebSocket Hibernation, auto-scale |
| **API Server** | Cloudflare Workers + Hono/tRPC | Type-safe, edge-deployed |
| **Static Hosting** | Cloudflare Pages | Unlimited free bandwidth, global CDN |
| **Asset Storage** | Cloudflare R2 | Zero egress fees, S3-compatible |
| **Database** | Supabase (PostgreSQL) | SQL + RLS + real-time + auth bundled |
| **Auth** | Supabase Auth | Free with Supabase, OAuth (Google, Discord, GitHub, Steam) |
| **Monorepo** | pnpm workspaces + Turborepo | Industry standard, great DX |
| **Bundler** | Vite | Fastest DX, excellent ecosystem |
| **Testing** | Vitest + Playwright | Unit + E2E, WebGL screenshot tests |
| **Code Quality** | Biome | 15x faster than ESLint, all-in-one |
| **Language** | TypeScript + Rust (WASM for physics) | Full-stack type safety + performance where needed |

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                      CLIENT (Browser)                        |
|                                                              |
|  +---------------+  +----------------+  +----------------+   |
|  |  React DOM    |  |  R3F/Three.js  |  |  Web Workers   |   |
|  |  shadcn/ui    |  |  3D Canvas     |  |  - Rapier WASM |   |
|  |  Tailwind     |  |  drei helpers  |  |  - Wasmoon     |   |
|  |  @dnd-kit     |  |  Game objects  |  |  - Asset proc  |   |
|  |  Zustand      |  |                |  |                |   |
|  +-------+-------+  +-------+--------+  +-------+--------+   |
|          +---------------+--+--------------------+            |
|                          |                                    |
|                 +--------v--------+                           |
|                 | Colyseus Client  |                           |
|                 | (WebSocket)      |                           |
|                 +--------+--------+                           |
+--------------------------|------------------------------------+
                           | wss://
+--------------------------|------------------------------------+
|                   CLOUDFLARE EDGE                             |
|                          |                                    |
|  +-----------------------v--------------------------+         |
|  |         Durable Object (Game Room)                |         |
|  |  - Colyseus room logic                            |         |
|  |  - Authoritative state + Schema                   |         |
|  |  - @view() for hidden info (hands, fog)           |         |
|  |  - SQLite (auto-save)                             |         |
|  |  - WebSocket Hibernation (free when idle)         |         |
|  +---------------------------------------------------+         |
|                                                               |
|  +---------------+  +---------------+  +------------------+   |
|  | Workers (API) |  | R2 (Assets)   |  | Pages (Frontend) |   |
|  | - Matchmaking |  | - 3D models   |  | - SPA bundle     |   |
|  | - Auth proxy  |  | - Textures    |  | - Static assets  |   |
|  | - tRPC/Hono   |  | - Game saves  |  | - Free bandwidth |   |
|  +---------------+  +---------------+  +------------------+   |
+---------------------------------------------------------------+
                           |
                +----------v-----------+
                |   Supabase (BaaS)     |
                |  - PostgreSQL (users,  |
                |    game catalog, mods) |
                |  - Auth (OAuth)        |
                |  - Real-time subs      |
                |  - Row-Level Security  |
                +-----------------------+
```

### Monorepo Structure

```
packages/
  shared/          # Types, constants, validation, game rules
  engine/          # Core game engine: ECS, physics bridge, state machine
  renderer/        # Three.js/R3F rendering, materials, effects
  networking/      # Colyseus client, state sync, reconnection
  ui/              # React UI components (HUD, menus, chat, lobby)
  server/          # Colyseus game server (Durable Objects)
  api/             # REST/tRPC API (auth, matchmaking, persistence)
  scripting/       # Wasmoon sandbox, event system, TTS compat shim
apps/
  web/             # Main web client (Vite + React + R3F)
```

---

## 3D Rendering & Physics

### 3D Rendering Engine: Three.js + React Three Fiber

#### Options Evaluated

| Engine | React Integration | Ecosystem | WebGPU | Bundle Size | Verdict |
|---|---|---|---|---|---|
| **Three.js + R3F** | Best-in-class (R3F v9) | Largest by far | Yes (r171+) | Moderate | **Recommended** |
| Babylon.js | react-babylonjs (weaker) | Strong, enterprise | Yes | Heavy (full engine) | Strong alternative |
| PlayCanvas | Minimal | Smaller | Yes | Light | Not recommended (cloud-based workflow) |

#### Why Three.js + R3F Wins

- **React Three Fiber** wraps Three.js in React's declarative model with zero performance overhead. It renders outside React's DOM reconciler.
- **drei** provides 50+ ready-made components: OrbitControls, MapControls, DragControls, Grid, PivotControls, Html (DOM-in-3D), and more.
- **WebGPU production-ready** since Three.js r171 (Sept 2025): `import * as THREE from 'three/webgpu'` with automatic WebGL 2 fallback. 2-10x performance gains for draw-call-heavy scenes.
- **InstancedMesh** for rendering 100+ similar objects (tokens, cards, chess pieces) in a single draw call.
- **glTF/GLB** is the primary format with excellent loader support.
- **R3F v9** features: React 19 compatibility, improved Suspense handling (critical for asset loading), WebGPU renderer support.

#### Why Not Babylon.js

Babylon.js is a strong all-in-one engine with built-in physics (Havok), GUI, audio, and XR support. However, its React integration (`react-babylonjs`) has far less community momentum than R3F, it has a heavier bundle since it's a full engine, and the smaller talent pool compared to Three.js ecosystem makes it a weaker choice for a React-based project.

### Physics Engine: Rapier (Rust WASM)

#### Options Evaluated

| Engine | Approach | Performance | Deterministic | R3F Integration | Verdict |
|---|---|---|---|---|---|
| **Rapier** | Rust -> WASM | Best (SIMD) | Yes | @react-three/rapier v2 | **Recommended** |
| Cannon-es | Pure JS | Decent | No | @react-three/cannon | Acceptable fallback |
| Ammo.js | Bullet -> Emscripten | Good | No | Manual | Not recommended (complex API) |
| Jolt Physics | C++ -> WASM | Excellent | Yes | No React integration | Promising but immature for web |
| Oimo.js | Pure JS | Low | No | None | Not recommended (barely maintained) |

#### Why Rapier Wins

- **2-5x faster** than JS alternatives thanks to SIMD-accelerated WASM.
- **25% speedup on stacking scenes** (cards, chips, tiles) in 2025 release due to simplified 3D friction model.
- **Deterministic physics**: Same initial parameters produce same simulation on different clients. Owlbear Rodeo uses this for synced dice rolling — sync only initial parameters, each client simulates independently.
- **Seamless R3F integration**: `<Physics>`, `<RigidBody>`, `<CuboidCollider>` components wrap naturally around R3F scene objects.
- **Independent physics loop**: `updateLoop="independent"` runs physics in its own requestAnimationFrame.

#### Why Not Cannon-es

Pure JavaScript means significantly slower than Rapier's WASM+SIMD. Non-deterministic physics makes multiplayer sync harder (must sync full state rather than just initial parameters). Less actively maintained.

### Object Interaction Patterns

**Pick up / drop / drag:**
- drei's `<DragControls>` for basic drag-and-drop
- Combine with Rapier kinematic bodies: on grab, switch RigidBody from `dynamic` to `kinematicPosition`, track cursor on table plane, switch back to `dynamic` on drop
- R3F provides built-in pointer events on meshes (`onPointerDown`, `onPointerOver`, `onPointerOut`) using Three.js Raycaster with React event semantics

**Snap-to-grid:**
- drei `<Grid>` component for visual grid
- Quantize drop positions: `Math.round(pos / gridSize) * gridSize`
- Rapier sensors (trigger volumes) for detecting snap zones

**Rotation/flipping:**
- drei `<PivotControls>` for visual rotation gizmos
- Card flipping: animate Y-axis rotation with `@react-spring/three`
- Keyboard shortcuts for 90-degree rotation snapping

**Multi-select:**
- Selection box (2D screen rectangle) that raycasts all objects within bounds
- Three.js `Group` for unified transforms on selected objects
- Rapier `FixedJoint` between selected bodies for group physics

---

## Multiplayer Networking & State Sync

### Transport Layer: Colyseus (WebSocket)

#### Options Evaluated

| Solution | Latency | Game Features | Self-Hostable | Cost | Verdict |
|---|---|---|---|---|---|
| **Colyseus** | Low (WS + binary delta) | Excellent (rooms, matchmaking, reconnect) | Yes (Docker) | Free/OSS | **Recommended** |
| PartyKit / CF Durable Objects | Low (edge) | None (build from scratch) | Partial (CF account) | $5/mo+ | Good platform, more DIY |
| Socket.io | Low (WS) | None | Yes | Free/OSS | Too generic |
| Liveblocks | Low | Collaboration-focused | No (SaaS only) | Paid SaaS | Wrong domain |
| Supabase Realtime | Medium | None (DB-centric) | Partial | Free tier+ | Poor fit |
| boardgame.io | Low | Turn-based only | Yes | Free/OSS | Too restrictive |
| Yjs + y-websocket | Low | CRDT-based | Yes | Free/OSS | Hidden info incompatible |

#### Why WebSocket Over WebRTC

Tabletop games don't need sub-10ms P2P latency. WebSocket provides reliable TCP delivery (card flips and dice results must arrive). An authoritative server model prevents cheating for hidden information. WebRTC adds NAT traversal complexity with no real benefit at tabletop speeds.

#### Why Colyseus Wins

1. **Purpose-built for multiplayer games** with rooms, matchmaking, reconnection out of the box.
2. **Automatic binary delta sync**: State changes are binary-encoded and delta-compressed automatically.
3. **Per-player state visibility**: `StateView` class with `@view()` decorators for hidden hands and private information.
4. **Reconnection support**: Built-in `reconnectionToken` and `allowReconnection()`.
5. **TypeScript-first** with decorated Schema classes.
6. **Self-hostable** via Docker. No vendor lock-in.

#### Why Not PartyKit/Durable Objects (for networking)

Great platform, but you'd be building everything Colyseus provides out of the box: matchmaking, state schema, delta sync, rooms, reconnection. The serverless model also adds complexity for stateful game rooms.

### State Synchronization: Authoritative Server + Delta Sync

#### Approaches Compared

| Approach | Consistency | Hidden Info | Validation | Tabletop Fit |
|---|---|---|---|---|
| **Authoritative server + delta sync** | Strong | Excellent (@view) | Server-side | **Best** |
| CRDTs (Yjs, Automerge) | Eventual | Impossible (full replication) | Client-side only | Poor |
| Operational Transforms | Strong | Possible | Server-side | Over-engineered |
| Command/Event Sourcing | Strong | Possible | Server-side | Good (complement) |

#### Why Not CRDTs

- Hidden information is fundamentally incompatible with full-state replication to all peers.
- Game rules need server validation (reject invalid moves, enforce turns).
- Dice rolls and card draws must be server-authoritative to prevent cheating.
- A 2025 academic paper confirmed that "Yjs excels in browser-based environments, but has not been optimized for dynamic, game-like settings."
- **Hybrid option**: Use Colyseus for game state, optionally Yjs for chat/notes/annotation layer where conflict-free editing is valuable.

### Game State Model: Colyseus Schema Classes

```typescript
class GamePiece extends Schema {
  @type("string") id: string;
  @type("string") kind: string; // "card", "token", "die", "figurine"
  @type("number") x: number;
  @type("number") y: number;
  @type("number") z: number;
  @type("number") rotationX: number;
  @type("number") rotationY: number;
  @type("number") rotationZ: number;
  @type("boolean") locked: boolean;
  @type("string") ownerId: string;
  @type("string") containerId: string;
  @type("map", "string") metadata: MapSchema<string>;
  @view() @type("string") hiddenState: string; // face-down card value
}

class Container extends Schema {
  @type("string") id: string;
  @type("string") kind: string; // "deck", "bag", "stack"
  @type(["string"]) itemIds: ArraySchema<string>;
  @type("boolean") shuffled: boolean;
}

class Zone extends Schema {
  @type("string") id: string;
  @type("string") kind: string; // "hand", "play-area", "hidden", "scripting"
  @type("string") ownerId: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
}

class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") color: string;
  @type("boolean") connected: boolean;
  @type("string") seatIndex: string;
}

class GameState extends Schema {
  @type({ map: GamePiece }) pieces = new MapSchema<GamePiece>();
  @type({ map: Container }) containers = new MapSchema<Container>();
  @type({ map: Zone }) zones = new MapSchema<Zone>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") turnIndex: number;
  @type("string") phase: string;
}
```

This approach automatically serializes/syncs across the network, supports per-player hidden state via `@view()`, is strongly typed, and maps naturally to the tabletop domain.

### Multiplayer Features

| Feature | Implementation |
|---|---|
| **Lobbies/matchmaking** | Colyseus `LobbyRoom` with `enableRealtimeListing()` |
| **Reconnection** | `allowReconnection(client, 120)` + reconnectionToken in localStorage |
| **Permissions** | Server-side message validation (reject moves on locked/other-player pieces) |
| **Turn management** | `turnIndex` + `phase` on GameState, server validates turn-ending moves |
| **Chat** | In-room Colyseus messages (ArraySchema), upgrade to separate service later if needed |
| **Spectator mode** | Separate client type, read-only messages, StateView hides all private hands |
| **Scaling** | Colyseus + Redis presence driver for multi-node room discovery |

### Undo/Redo: Command Pattern

Per-player undo stacks with inverse commands (not state snapshots) to avoid undoing other players' concurrent changes:

```typescript
interface GameCommand {
  playerId: string;
  type: string;
  timestamp: number;
  forward: () => void;
  reverse: () => void;
  data: any;
}
```

Key principles: each player can only undo their own actions, undo requests go through the server for validation, bounded history (last 50 commands per player).

### Save/Load

Colyseus Schema supports `.toJSON()` for full state serialization. Auto-save periodically to Durable Object SQLite, export completed games to R2 as JSON. Manual save/load by room host.

---

## UI/UX Frameworks & HUD Systems

### UI Framework: React + R3F

**Why React over Svelte/SolidJS/Vue:**

The R3F ecosystem (pmndrs) is decisive — R3F, drei, @react-three/rapier, @react-three/uikit all work together seamlessly. Svelte's Threlte is solid but has a much smaller ecosystem. SolidJS has no mature Three.js integration. The performance overhead of React's virtual DOM is negligible for the 2D overlay since the 3D render loop is decoupled.

**Architecture decision: DOM overlay for all primary UI.** Better text rendering, full accessibility support, GPU-accelerated CSS animations, entire React ecosystem available. Use @react-three/uikit or drei `<Html>` only for UI that must exist in 3D space (object labels tracking position, in-world indicators).

### UI Components: shadcn/ui + Tailwind CSS v4

- **shadcn/ui**: Copy-paste components (not a dependency) built on Radix UI primitives. Accessibility baked in. Provides critical game UI primitives: Context Menu, Dialog, Popover, Tooltip, Dropdown Menu, Tabs, Sheet (sliding panels), Command palette (search).
- **Tailwind CSS v4**: Utility-first styling. Customize the theme for a dark, polished game aesthetic with glowing borders, transparency/blur effects (`backdrop-blur`), and semi-transparent backgrounds that let the 3D scene show through.
- **tweakcn**: Real-time theme editing for rapid iteration on the game's visual identity.

### Animation: Motion (Framer Motion)

- **MIT open source** (unlike GSAP which has Webflow competition restrictions).
- 2.5x faster than GSAP at animating from unknown values.
- First-class React integration with declarative API.
- `AnimatePresence` for mount/unmount animations.
- Spring physics for natural-feeling card movements.
- ~32KB gzipped.

### Key HUD Elements

| Element | Approach |
|---|---|
| **Card hand display** | CSS 3D transforms for fan layout, `perspective: 1200px`, Motion spring physics for pickup/play animations |
| **Context menus** | Radix UI Context Menu (shadcn/ui), triggers on right-click or long-press, raycasting to identify clicked 3D object |
| **Scoreboards/counters** | shadcn Input + Motion AnimatePresence for rolling counter transitions |
| **Turn indicator** | Sidebar/top bar with player avatars, active player highlighted with animated border |
| **Timers/chess clocks** | `requestAnimationFrame` countdown, server-synced, displayed as shadcn Badge |
| **Chat** | shadcn Sheet (sliding panel), interleaved with game log |
| **Notes** | Tiptap (ProseMirror-based) for rich text, per-player private + shared table notes |
| **Object tooltips** | drei `<Html>` for labels tracking 3D objects, Motion for fade transitions |
| **Search/command** | shadcn Command (cmdk), Cmd+K to open, fuzzy search through game objects |
| **Game setup wizard** | shadcn Dialog + multi-step form |

### Drag & Drop: @dnd-kit

- Deliberately not built on HTML5 DnD API (which lacks touch/keyboard support).
- Supports lists, grids, multiple containers, nested contexts, 2D games.
- Built-in sensors: Pointer, Mouse, Touch, Keyboard.
- ~17KB gzipped, modular architecture.

**Cross-boundary DnD (2D UI to 3D scene)** — the hardest part:
1. @dnd-kit for dragging within 2D UI (hand, inventory panels)
2. Detect when drag crosses into 3D canvas area via pointer coordinates
3. Switch to custom drag overlay following pointer
4. On drop, use Three.js raycasting to determine 3D world position
5. Create 3D object at that position

### Drawing & Annotation: perfect-freehand + Canvas 2D Overlay

- **perfect-freehand**: Pressure-sensitive ink strokes, ~2KB, used by Canva, Excalidraw, tldraw.
- Transparent `<canvas>` layered above Three.js canvas with `pointer-events: none` (toggle to `auto` when drawing mode active).
- Measurement/ruler tools on the Canvas overlay, converting screen to 3D world coordinates.
- Ping/pointer system: broadcast cursor position via WebSocket, render as animated ripple with Motion.

### Keyboard Shortcuts: react-hotkeys-hook

Standard mappings: Space (end turn), R (roll dice), Escape (deselect), Ctrl+Z (undo). Centralized shortcut registry with `?` to show cheat sheet.

### Accessibility

- All interactive UI reachable via Tab key with visible focus indicators.
- ARIA labels on game objects ("Red meeple at position B3").
- ARIA live regions for state changes ("It's Player 2's turn").
- Never rely on color alone — supplement with icons, patterns, shapes, text labels.
- Blue as safest base color (blue-yellow color blindness is rare).
- WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text.
- High-contrast mode option.

---

## Asset Pipeline & Content Systems

### Image Processing (Client-Side)

**OffscreenCanvas + jSquash (Squoosh-derived WASM codecs):**

- Process images off the main thread via OffscreenCanvas in Web Workers.
- jSquash provides browser-native encoding/decoding for WebP, AVIF, MozJPEG, OxiPNG via WASM.
- Processing pipeline for card images: validate -> resize to standard dimensions -> compress to WebP quality 85 -> generate thumbnail -> upload.

### 3D Model Import

**glTF-Transform + Draco/Meshopt compression:**

- glTF/GLB as the industry standard (designed for real-time rendering).
- Validate with Khronos glTF Validator on upload.
- Polygon budget: 50K triangles for tokens/pieces, 200K for boards/terrain.
- Draco or Meshopt compression: 60-95% file size reduction.
- Texture resizing to max 1024x1024 power of two.
- KTX2/Basis Universal texture compression.
- Progressive loading via @needle-tools/gltf-progressive (70-95% faster perceived load).

### Custom Deck Creation

Client-side Canvas-based deck builder. Users upload individual card images or sprite sheets. Canvas API slices sprite sheets into individual cards. Store deck definition as JSON metadata alongside texture atlas.

### Asset Storage: Cloudflare R2

| Service | Storage/GB/mo | Egress | Free Tier |
|---|---|---|---|
| **Cloudflare R2** | $0.015 | **FREE** | 10GB storage, 1M reads |
| AWS S3 | $0.023 | $0.09/GB | 5GB/12mo |
| Supabase Storage | Included | Included | 1GB |
| Firebase Storage | $0.026 | $0.12/GB | 5GB |

R2 wins on zero egress fees. At 10TB/month of textures and models, R2 costs ~$15/month for storage vs S3's $891/month in egress alone.

### Texture Compression: KTX2 + Basis Universal

- KTX2 is the Khronos standard for GPU-compressed textures.
- Basis Universal transcodes to native GPU format at runtime (BC7 desktop, ASTC mobile, ETC2 older).
- UASTC mode for higher quality (normal maps, detail textures).
- ETC1S mode for smaller files (diffuse color textures).
- three.js has built-in KTX2Loader with Basis Universal transcoder.

### Progressive Loading Strategy

1. **Texture LODs**: Generate 256x256 preview + 1024x1024 medium + original. Load preview first, swap as camera approaches.
2. **3D Model LODs**: glTF-Transform generates LOD0 (full), LOD1 (50%), LOD2 (10%). Stream via @needle-tools/gltf-progressive.
3. **Frustum-based loading**: Only load assets for objects visible in camera frustum.
4. **Asset manifest**: Pre-fetch lightweight JSON listing all assets, load on demand.

---

## Scripting & Game Logic Automation

### Lua in the Browser: Wasmoon

| Solution | Approach | Performance | Lua Version | Bundle Size |
|---|---|---|---|---|
| **Wasmoon** | Official Lua compiled to WASM | Fast (15ms benchmark) | 5.4 | 130KB gzipped |
| Fengari | Lua VM rewritten in JS | Slow (390ms benchmark) | 5.3 | 69KB gzipped |

**Wasmoon is 25x faster** than Fengari because it runs the real Lua VM. Lua 5.4 is backward-compatible with most TTS Lua 5.2 scripts. A TTS compatibility shim can map common API calls (`getObjectFromGUID`, `spawnObject`, `broadcastToAll`) to our equivalents.

### JavaScript Sandboxing (Alternative)

**QuickJS-WASM** (@sebastianwessel/quickjs): Full ES2023 JavaScript engine in WebAssembly. Complete memory and execution isolation. No DOM, fetch, or browser API access unless explicitly exposed.

### Security Measures

- **Execution timeout**: Run scripts in Web Workers with 1000ms timeout per event handler.
- **Instruction counting**: Lua debug hooks (`lua_sethook` with `LUA_MASKCOUNT`) to interrupt after N instructions.
- **Memory limits**: 64MB max WASM memory per sandbox.
- **API surface control**: Whitelist pattern, all state mutations through controlled API.
- **Rate limiting**: Max 100 object spawns per second.

### Event System

**Object Events:**
- `onObjectPickUp(player, object)` / `onObjectDrop(player, object)`
- `onObjectEnterZone(zone, object)` / `onObjectLeaveZone(zone, object)`
- `onObjectDestroy(object)` / `onObjectSpawn(object)`
- `onObjectRandomize(object, player)` — dice shaken, deck shuffled
- `onObjectCollision(object, collisionInfo)`
- `onObjectStateChange(object, oldState)` — card flipped, etc.

**Game Flow Events:**
- `onTurnChange(previousPlayer, nextPlayer)`
- `onPlayerConnect(player)` / `onPlayerDisconnect(player)`
- `onGameStart()` / `onGameEnd()`
- `onChat(player, message)`

**Container Events:**
- `onObjectEnterContainer(container, object)` / `onObjectLeaveContainer(container, object)`
- `onDeckDeal(deck, card, player)`

**Cancellable "Try" Events:**
- `tryObjectPickUp(player, object)` -> return false to prevent
- `tryObjectDrop(player, object, position)` -> return false to prevent
- `tryObjectRandomize(object, player)` -> return false to prevent

### Visual Scripting (Phase 2)

Google Blockly for a visual scripting layer. Generates Lua or JavaScript from visual blocks. 100% client-side, highly customizable with game-specific blocks. Lower barrier for non-programmers.

---

## Audio

### Audio Library: Howler.js

| Library | Bundle Size | Spatial Audio | Best For |
|---|---|---|---|
| **Howler.js** | 7KB gzipped | Yes (HRTF plugin) | Game SFX + music |
| Tone.js | ~150KB | No | Music synthesis (overkill) |
| Raw Web Audio API | 0KB | Yes (PannerNode) | Maximum control (more work) |

Howler.js provides spatial audio positioning (sounds come from where objects are on the table), sound sprites (multiple SFX in one file), automatic codec fallback, and a simple API.

### Sound Strategy

**Core SFX (preload, ~500KB budget):** Dice roll (variations), card flip/deal/shuffle, piece pickup/placement (wood, plastic, metal), chip/coin, snap to grid, button clicks, turn notification, timer warning.

**Ambient (lazy load):** Background music, environment ambience (tavern, dungeon, forest) for RPG sessions.

**Format:** WebM/Opus primary (best compression), MP3 fallback. Cache aggressively with service workers.

---

## Workshop, Sharing & Backend

### Game Template Packaging

JSON-based game packages stored in R2:

```
game-template/
  manifest.json      # Metadata, asset list, SHA256 hashes
  state.json         # Initial game state
  scripts/
    global.lua       # Global game script
    objects/*.lua     # Per-object scripts
  assets/
    textures/*.webp
    models/*.glb
    audio/*.webm
  thumbnail.webp
```

Stored as .zip in R2. Support delta updates (only download changed assets on template update). Allow referencing shared/community assets by URL.

### Database: Supabase (PostgreSQL)

| Platform | Database | Auth | Real-time | Self-host | Price |
|---|---|---|---|---|---|
| **Supabase** | PostgreSQL | Built-in | Yes | Yes | Free tier, $25/mo Pro |
| Firebase | Firestore (NoSQL) | Built-in | Yes | No | Pay-per-read/write |
| PocketBase | SQLite | Built-in | Yes | Yes | Free (self-hosted) |
| Convex | Custom reactive | Third-party | Yes | Yes | Free tier, $25/mo Pro |

Supabase wins for: full SQL power, Row-Level Security, real-time subscriptions, bundled auth, open-source self-hosting option.

### Authentication: Supabase Auth

Bundled with Supabase. 100K MAUs on Pro plan ($25/mo). Supports OAuth (Google, Discord, GitHub, Steam — important for gamers). Seamless RLS integration. Magic link, email+password, phone auth.

### Workshop Database Schema

```sql
games (
  id, creator_id, title, description, tags[],
  thumbnail_url, package_url, version,
  player_count_min, player_count_max,
  play_time_estimate, complexity_rating,
  download_count, rating_avg, rating_count,
  is_published, created_at, updated_at
)

reviews (id, game_id, user_id, rating, comment, created_at)
collections (id, user_id, name, game_ids[])
game_versions (id, game_id, version, changelog, package_url, created_at)
```

Full-text search via PostgreSQL `tsvector`. Tag-based filtering. Sorting by popularity, rating, recency, trending. Curated collections. Fork support.

---

## Architecture & Deployment

### Build & Dev Tooling

| Tool | Choice | Rationale |
|---|---|---|
| **Bundler** | Vite | <1s dev server start, <50ms HMR, Rolldown for production |
| **Package Manager** | pnpm | Strict deps, content-addressable storage, best monorepo support |
| **Monorepo Orchestrator** | Turborepo | Simple, agnostic, sufficient caching |
| **Code Quality** | Biome | 15-50x faster than ESLint+Prettier, single config |
| **Unit Tests** | Vitest | Fast, Vite-native, Browser Mode in v4.0 |
| **E2E Tests** | Playwright | Multi-browser, multiple contexts for multiplayer testing |

### Deployment: Cloudflare-Native

| Layer | Service | Why |
|---|---|---|
| **Game Server** | Cloudflare Durable Objects | One DO per room, WebSocket Hibernation (free when idle), built-in SQLite, auto-scaling |
| **API Server** | Cloudflare Workers | Edge-deployed, TypeScript, pairs with DOs |
| **Static Hosting** | Cloudflare Pages | Unlimited free bandwidth, 300+ edge locations |
| **Asset Storage** | Cloudflare R2 | Zero egress, S3-compatible, built-in CDN |
| **Database** | Supabase (users/social) + DO SQLite (game state) | Split strategy: PostgreSQL for platform, SQLite for live games |

#### Why Durable Objects for Game Rooms

- One DO per game room is a natural 1:1 mapping.
- **WebSocket Hibernation**: When players are thinking (most of the time in tabletop), the DO sleeps with zero billing while connections stay open.
- Built-in SQLite for persistent game state without external DB.
- Global edge deployment automatically.
- No infrastructure management.
- **Limitations**: Single-threaded per DO (fine for tabletop), 128MB memory (plenty), can't run Rust/WASM server-side (game logic must be JS/TS), vendor lock-in to Cloudflare.

#### Alternative: Fly.io

Better if you need custom runtimes, Rust on server, or more control. Good WebSocket support, global edge deployment, but requires managing containers.

### Performance Optimization

- **Web Workers**: Physics (Rapier WASM), scripting (Wasmoon), asset decompression (Draco/KTX2).
- **WASM**: Physics (8-10x faster), binary serialization, image processing. Not worth it for general game logic (JS/WASM bridge overhead).
- **InstancedMesh**: Hundreds of similar objects in 1 draw call. Target <100 draw calls for 60fps.
- **LOD system**: Reduce mesh complexity based on camera distance.
- **WebGPU**: Three.js r171+ backend, 30% rendering improvement as progressive enhancement.
- **Benchmark target**: 200+ objects at 60fps is achievable with instancing.

### Security

| Concern | Approach |
|---|---|
| **Hidden information** | Server never sends other players' hand contents. Client only receives card counts + own cards. Dice rolls generated server-side. |
| **Script sandboxing** | Web Worker + WASM isolation, timeout enforcement, memory caps, whitelisted API surface |
| **Rate limiting** | Per-connection WebSocket message limits, action validation, connection limits per IP |
| **Asset moderation** | Magic byte validation, size limits, virus scanning, NSFW detection, report system |
| **Web security** | CSP headers, X-Frame-Options: DENY, HSTS, nosniff, strict referrer policy |

---

## Cost Analysis

### Cloudflare Durable Objects Pricing

- Requests: $0.15/million (after 1M free)
- Duration: $12.50/million GB-s (after 400K GB-s free)
- WebSocket messages: 20:1 ratio (1M messages = 50K billable requests)
- Storage: $0.20/GB-month (after 5 GB free)

Assumptions per game room: 4 players, ~2 messages/player/minute average, 50ms processing per action, 3-hour average session, WebSocket Hibernation enabled.

### Monthly Cost Estimates

| Scale | Concurrent Games | Durable Objects | Supabase | R2 Storage | CF Pages | Total |
|---|---|---|---|---|---|---|
| **Indie launch** | 1,000 | ~$50-150 | $0-25 | ~$5 | Free | **$75-200** |
| **Growing** | 10,000 | ~$500-1,500 | $25 | ~$50 | Free | **$600-2,000** |
| **Large** | 100,000 | ~$5,000-15,000 | $25-100 | ~$500 | Free | **$5,500-15,600** |

Tabletop games are extremely cost-efficient on Durable Objects because players spend most time thinking (DO hibernates), message frequency is low (1-5/min vs 60/sec for FPS), and state is small.

### Cost Comparison: R2 vs S3 for Assets

At 10TB/month egress (user-uploaded textures and models):
- **Cloudflare R2**: ~$15/month (storage only, zero egress)
- **AWS S3**: ~$891/month ($0.09/GB egress)

---

## Reference Implementations

| Project | Relevance | Stack |
|---|---|---|
| **[Owlbear Rodeo](https://www.owlbear.rodeo/)** | Three.js + Rapier for deterministic dice rolling (open source) | Three.js, Rapier, React |
| **[Tabletopia](https://tabletopia.com/)** | Existing web tabletop simulator (commercial UX reference) | Proprietary |
| **[Foundry VTT](https://foundryvtt.com/)** | Web-based VTT with scripting, mod system, community workshop | Electron, Pixi.js |
| **[Fantastic Dice](https://fantasticdice.games/)** | BabylonJS + Rapier dice system (reference for physics) | Babylon.js, Rapier |

---

## Sources

### 3D Rendering & Physics
- [Three.js vs Babylon.js vs PlayCanvas Comparison 2026](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison)
- [Rapier 2025 Review and 2026 Goals](https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/)
- [React Three Rapier](https://github.com/pmndrs/react-three-rapier)
- [R3F v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- [Owlbear Rodeo Dice (Three.js + Rapier)](https://github.com/owlbear-rodeo/dice)
- [Owlbear Rodeo Dice Deep Dive](https://blog.owlbear.rodeo/owlbear-rodeo-2-0-dice-deep-dive/)
- [Three.js WebGPU Migration Guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- [drei Controls Documentation](https://drei.docs.pmnd.rs/controls/introduction)
- [Web Game Dev Physics Comparison](https://www.webgamedev.com/physics)
- [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [100 Three.js Performance Tips 2026](https://www.utsubo.com/blog/threejs-best-practices-100-tips)

### Networking & State Sync
- [Colyseus Documentation](https://docs.colyseus.io/)
- [Colyseus State & StateView](https://docs.colyseus.io/state/view)
- [Colyseus Schema](https://docs.colyseus.io/state)
- [Colyseus Deployment & Scalability](https://docs.colyseus.io/deployment/scalability)
- [CRDT-Based Game State Sync (2025 paper)](https://arxiv.org/html/2503.17826v1)
- [Liveblocks: Undo/Redo in Multiplayer](https://liveblocks.io/blog/how-to-build-undo-redo-in-a-multiplayer-environment)
- [WebRTC vs WebSocket Comparison](https://ably.com/topic/webrtc-vs-websocket)
- [ECS for Web Games](https://www.webgamedev.com/code-architecture/ecs)

### UI/UX
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Motion (Framer Motion)](https://motion.dev/)
- [@dnd-kit Documentation](https://dndkit.com/)
- [perfect-freehand](https://github.com/steveruizok/perfect-freehand)
- [react-hotkeys-hook](https://github.com/JohannesKlaworking/react-hotkeys-hook)
- [tldraw SDK](https://tldraw.dev/)

### Assets & Scripting
- [Wasmoon (Lua 5.4 WASM)](https://github.com/ceifa/wasmoon)
- [QuickJS-WASM](https://github.com/nicolo-ribaudo/engine262)
- [jSquash Image Codecs](https://github.com/nicolo-ribaudo/jSquash)
- [glTF-Transform](https://gltf-transform.dev/)
- [Howler.js](https://howlerjs.com/)
- [Google Blockly](https://developers.google.com/blockly)
- [Draco 3D Compression](https://google.github.io/draco/)
- [KTX2 / Basis Universal](https://github.com/BinomialLLC/basis_universal)

### Architecture & Deployment
- [Cloudflare Durable Objects: Building Real-time Games](https://blog.cloudflare.com/building-real-time-games-using-workers-durable-objects-and-unity/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects WebSocket Best Practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [pnpm vs Bun vs Yarn](https://betterstack.com/community/guides/scaling-nodejs/pnpm-vs-bun-install-vs-yarn/)
- [Vite vs Turbopack vs Rspack 2025](https://www.techme365.com/posts/039)
- [Biome vs ESLint 2025](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
- [Vercel vs Cloudflare Pages 2025](https://www.ai-infra-link.com/vercel-vs-netlify-vs-cloudflare-pages-2025-comparison-for-developers/)
- [Supabase vs Neon vs Turso](https://bejamas.com/compare/neon-vs-supabase-vs-turso)
- [Rust WASM Performance Benchmarks 2025](https://byteiota.com/rust-webassembly-performance-8-10x-faster-2025-benchmarks/)
- [Vitest 4.0 Browser Mode](https://www.infoq.com/news/2025/12/vitest-4-browser-mode/)
- [Web Game Security Risks](https://genieee.com/top-security-risks-in-html5-multiplayer-games-and-how-to-fix-them/)
- [JavaScript Sandboxing Deep Dive](https://leapcell.io/blog/deep-dive-into-javascript-sandboxing)
