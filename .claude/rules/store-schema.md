# Store Schema

All persistence uses localStorage with prefix `anniesCozyDay_`.
The `store` object (02-storage.js) is the single source of truth.

## Key store fields
store.coins           — currency (integer)
store.stats           — { totalTreats, totalPets, totalPlays, ... }
store.achievements    — { [key]: boolean }
store.decor           — { placed: [...], owned: [...], roomPreset: 0-3 }
store.backyardDecor   — { placed: [...], owned: [...] }
store.wardrobe        — { equipped: { annie: [...], obi: [...], luna: [...] }, owned: [...] }
store.bond            — { xp, level }
store.careStreak      — { count, lastDate }
store.scrapbook       — { entries: [...], completed: [...] }
store.muted           — boolean
store.weather         — { type, until }
store.dailyTasks      — { tasks: [...], date }
store.weeklyChallenge — { key, progress, weekStart }

## Save functions
saveStats(), saveAchievements(), saveDecor(), saveBackyardDecor(),
saveCareStreak(), saveBond(), saveWardrobe(), addScrapbookEntry(),
addCoins(), setBest()
