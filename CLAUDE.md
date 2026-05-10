# Annie's Cozy Day

Browser-based HTML5 canvas game (800×600). Gift for Annie, featuring Annie (human),
Obi (beagle), and Luna (cat).

## Quick reference
- Build: `node build.js` → outputs `dist/annies-cozy-day.html`
- Test: open `dist/annies-cozy-day.html` in browser (works from file://)
- Deploy: push to main → GitHub Pages at johnrclark96.github.io/Annies-cozy-day-v2
- Source: 38 .js files in `src/`, concatenated alphabetically inside one IIFE

## File structure
src/template.html          — HTML/CSS shell with {{GAME_SCRIPT}} placeholder
src/01-constants.js        — canvas, COLORS, data arrays (371 lines)
src/02-storage.js          — store object, save/load, migrations (490 lines)
src/03-math-helpers.js     — clamp, lerp, rand, etc (39 lines)
src/04-draw-helpers.js     — drawHeart, drawStar, drawBone, etc (78 lines)
src/04b-music-data.js      — PENTA_FREQS, MUSIC_MOODS (56 lines)
src/04c-story-data.js      — AWAY_STORIES, CALENDAR_REWARDS (41 lines)
src/05-audio.js            — CozyAudio, audio instance, isMobile (313 lines)
src/06-game-state.js       — game object, SceneRegistry (38 lines)
src/07-particles.js        — particle system (70 lines)
src/08-ui.js               — UI helpers, panels, fonts (650 lines)
src/09a-sprite-data.js     — frame data, atlas config, loading (149 lines)
src/09b-sprite-render.js   — sprite rendering functions (169 lines)
src/09c-sprite-procedural.js — procedural character drawing (725 lines)
src/09d-sprite-accessories.js — accessory rendering (113 lines)
src/10a-background-cache.js  — buildStaticCaches (492 lines)
src/10b-background-helpers.js — backdrop helpers (81 lines)
src/10c-background-room.js   — drawLivingRoom (568 lines)
src/11-scene-base.js       — BaseScene class (20 lines)
src/12-scene-title.js      — TitleScene (259 lines)
src/13-scene-hangout.js    — HangoutScene (4900 lines, see architecture rules)
src/13b-scene-backyard.js  — BackyardScene (1300 lines)
src/14-scene-minigame-base.js — BaseMinigameScene (574 lines)
src/15-*.js through 19b-*  — 12 minigame scenes (189-530 lines each)
src/20-navigation.js       — blinkSignal, earSignal, transitionTo (42 lines)
src/21-loop.js             — game loop, test hooks (151 lines)
src/22-input.js            — mouse/touch/keyboard handlers (85 lines)
src/23-main.js             — initialization (8 lines)

## Rules
- Do NOT edit dist/ directly — always edit src/ and rebuild
- File naming determines execution order (alphabetical sort)
- Do NOT rename files without understanding ordering constraints
- HangoutScene is one class — cannot be split across files
- function declarations are hoisted; const/let/class are NOT
- Run `node build.js` and test in browser after any change

## Content
12 minigames, 32 decorations, 30 accessories, procedural music engine,
pet bond leveling, daily gifts, seasonal events, weather, visitors,
challenge stars, scrapbook goals, photo capture.
