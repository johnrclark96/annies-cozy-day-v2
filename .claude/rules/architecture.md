# Architecture

Annie's Cozy Day is a single-page HTML5 canvas game (800×600). All 38 JS source files
share one IIFE scope via concatenation build (`node build.js` → `dist/annies-cozy-day.html`).

## File ordering
Files are concatenated alphabetically. This ordering is load-bearing:
- `const`/`class` declarations are NOT hoisted — they must be defined before use
- `function` declarations ARE hoisted within the IIFE — order doesn't matter for these
- Class inheritance: BaseScene (11) → scene classes (12-13b), BaseMinigameScene (14) → minigames (15-19b)

## Key globals (IIFE scope)
- `canvas`, `ctx`, `W` (800), `H` (600) — from 01-constants
- `store` — persisted game state, from 02-storage
- `audio` — CozyAudio instance, from 05-audio
- `game` — runtime state (scene, mouse, particles, time), from 06-game-state
- `SceneRegistry` — scene factory registry, from 06-game-state

## Scene system
Scenes extend `BaseScene` (11). Minigames extend `BaseMinigameScene` (14).
Each scene file ends with `SceneRegistry.register("name", () => new SceneClass())`.
Transitions via `transitionTo(SceneRegistry.create("name"))` from 20-navigation.

## Largest file
`13-scene-hangout.js` is 4,900 lines (HangoutScene). It cannot be split because `class`
syntax requires a contiguous body. See method map below for navigation.

## HangoutScene method map (grep targets)
constructor()         — hitboxes, pet objects, state init
enter()               — daily init, moods, weather, streaks, gifts
onClick(x,y)          — click dispatch for all panels and modes (624 lines)
draw(c)               — renders everything: room, HUD, all panel overlays (1,518 lines)
update(dt)            — main update loop dispatch
updateAnnie(dt)       — Annie AI movement
updateObi(dt)         — Obi behavior state machine
updateLuna(dt)        — Luna behavior state machine
updatePetInteraction  — pet-pet interactions
updateThoughtBubbles  — want-bubble system
updateAmbientEvents   — visitor/weather/butterfly spawning
drawAmbientEvent(c)   — visitor/weather rendering
drawDailyGift(c)      — daily gift overlay
capturePhoto()        — photo capture logic
rewardPet()           — joy rewards with multipliers
checkScrapbookGoals() — goal completion checks
recordCareAction()    — care streak tracking
