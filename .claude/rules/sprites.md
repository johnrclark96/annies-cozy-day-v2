# Sprite System

Characters have two rendering paths:
1. Sprite atlas (09a/09b) — pixel art from cozy-sprites-atlas.webp
2. Procedural fallback (09c) — canvas-drawn characters used when atlas hasn't loaded

## Drawing a character
drawAnnie(c, x, y, scale, state)
drawObi(c, x, y, scale, state)
drawLuna(c, x, y, scale, state)

state = { pose, facing, breath, blink, earTwitch, tail, hairSway, ... }

## Accessories
drawAccessoryOverlay(c, pet, x, y, scale, pose, facing)
Reads equipped items from store.wardrobe.equipped[pet]

## Animation signals (from 20-navigation.js)
blinkSignal(t, offset) — returns boolean for eye-blink timing
earSignal(t) — returns 0-1 for ear twitch timing
