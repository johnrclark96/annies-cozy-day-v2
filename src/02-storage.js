    // ═══ 02-storage.js ═══
    function sKey(key) { return STORE_PREFIX + key; }
    function loadJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(sKey(key));
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    }
    function saveJSON(key, value) {
      try { localStorage.setItem(sKey(key), JSON.stringify(value)); } catch (err) {}
    }
    function loadNumber(key, fallback = 0) {
      try {
        const raw = localStorage.getItem(sKey(key));
        const num = raw === null ? fallback : Number(raw);
        return Number.isFinite(num) ? num : fallback;
      } catch (err) {
        return fallback;
      }
    }
    function saveNumber(key, value) {
      try { localStorage.setItem(sKey(key), String(value)); } catch (err) {}
    }
    function loadBool(key, fallback = false) {
      try {
        const raw = localStorage.getItem(sKey(key));
        return raw === null ? fallback : raw === "true";
      } catch (err) {
        return fallback;
      }
    }
    function saveBool(key, value) {
      try { localStorage.setItem(sKey(key), String(!!value)); } catch (err) {}
    }

    const store = {
      muted: loadBool("muted", false),
      best_treat: loadNumber("best_treat", 0),
      best_laser: loadNumber("best_laser", 0),
      best_cuddle: loadNumber("best_cuddle", 0),
      best_walk: loadNumber("best_walk", 0),
      best_nap: loadNumber("best_nap", 0),
      best_bath: loadNumber("best_bath", 0),
      best_sort: loadNumber("best_sort", 0),
      best_pillow: loadNumber("best_pillow", 0),
      best_findluna: loadNumber("best_findluna", 0),
      best_window: loadNumber("best_window", 0),
      best_pawstep: loadNumber("best_pawstep", 0),
      best_wildwand: loadNumber("best_wildwand", 0),
      stats: loadJSON("stats", {
        totalTreatCatches: 0, bestTreatCombo: 1, bestLaserCombo: 1,
        bestCuddle: 0, cuddleWon: false,
        totalSessions: 0, totalPhotos: 0, totalCoinsEarned: 0,
        totalFlowersPlanted: 0, totalBowlsFilled: 0, petInteractionsSeen: 0
      }),
      achievements: loadJSON("achievements", {
        obiBestFriend: false, comboStar: false, catWhisperer: false, pouncePerfect: false,
        couchPotato: false, maximumCozy: false, goodWalker: false, napMaster: false,
        squeakyClean: false, sortingPro: false, whackQueen: false, sharpEye: false,
        birdWatcher: false, goodMemory: false,
        greenThumb: false, shutterBug: false, fashionista: false, dedicated: false,
        socialButterfly: false, fullHouse: false, wellFed: false, collector: false,
        challengeChampion: false, wandMaster: false
      }),
      decor: loadJSON("decor", {
        fairyLights: false, plant2: false, petBed: false, rugColor: 0,
        lampOn: true, roomPreset: 0, timeOfDay: 1, wallArt2: 0,
        windowPlant: false, cozyBlanket: false, photoWall: false,
        floorCushion: false, corkBoard: false, bookStack: false, couchPillows: 0,
        hangingPlant: false, candles: false, wallClock: false, rugPattern: 0,
        garland: 0, petToys: false, musicBox: false, familyPortrait: false
      }),
      backyardDecor: loadJSON("backyardDecor", {
        windChime: false, gardenGnome: false, picnicBlanket: false,
        birdBath: false, lanterns: false, birdHouse: false,
        sundial: false, dogHouse: false, butterflyGarden: false, fountain: false
      }),
      firstVisit: loadBool("firstVisit", true),
      /* V8 — first-visit tutorial overlay flag (independent of `firstVisit`,
         which gates the dedication card; tutorial fires after dedication on
         the first session, then persists). */
      tutorialSeen: loadBool("tutorialSeen", false),
      /* V9 — settings panel: music vol, sfx vol, reduced-motion. Defaults to
         {music:1, sfx:1, reducedMotion:false} so behavior is unchanged for
         existing players until they touch the panel. */
      settings: loadJSON("settings", { music: 1, sfx: 1, reducedMotion: false }),
      /* V10 — per-mood variation index advancing on each mood change. */
      musicVariation: loadJSON("musicVariation", { morning: 0, day: 0, evening: 0, night: 0, backyard: 0 }),
      /* F.NEW.2 — set true when a meaningful (>= 3-day) streak breaks; the
         next title→hangout transition shows a one-time welcome line then clears. */
      streakBreakPending: loadBool("streakBreakPending", false),
      /* F.6 — visitor.key list of visitors the player has seen at least once;
         seasonal visitors get a "first-appearance" banner only the first time. */
      visitorsSeen: loadJSON("visitorsSeen", []),
      /* E.4 — anniversary re-trigger of dedication.
         firstVisitDate: ISO yyyy-mm-dd of when the dedication first showed.
           null for existing players (migration backfill — they don't get an
           anniversary because we don't know when they started).
         lastDedicationYear: year the dedication last fired, prevents
           re-firing more than once per year. */
      firstVisitDate: loadJSON("firstVisitDate", null),
      lastDedicationYear: loadNumber("lastDedicationYear", 0),
      pet_obi_joy: loadNumber("pet_obi_joy", 54),
      pet_luna_joy: loadNumber("pet_luna_joy", 56),
      lastKnownStars: loadNumber("lastKnownStars", 0),
      bubbleOnboarded: loadBool("bubbleOnboarded", false),
      pet_food_fill: loadNumber("pet_food_fill", 80),
      pet_food_lastFill: loadNumber("pet_food_lastFill", Date.now()),
      pet_water_fill: loadNumber("pet_water_fill", 80),
      pet_water_lastFill: loadNumber("pet_water_lastFill", Date.now()),
      lastVisitDate: loadJSON("lastVisitDate", null),
      careStreak: loadJSON("careStreak", { count: 0, lastCareDate: null, todayActions: [], bestStreak: 0, milestonesClaimed: [] }),
      dailyTasks: loadJSON("dailyTasks", { date: null, tasks: [], completed: [] }),
      coins: loadNumber("coins", 50),
      wardrobe: loadJSON("wardrobe", { owned: [], equipped: { obi: null, luna: null } }),
      backyardFlowers: loadNumber("backyardFlowers", 0),
      scrapbook: loadJSON("scrapbook", { entries: [], photosViewed: 0 }),
      weeklyChallenge: loadJSON("weeklyChallenge", { weekId: null, challengeId: null, progress: 0, target: 0, completed: false, reward: 0 }),
      starMilestonesClaimed: loadJSON("starMilestonesClaimed", []),
      decorPurchased: loadJSON("decorPurchased", []),
      cozyUpgrades: loadJSON("cozyUpgrades", []),
      lastPassiveIncomeDate: loadJSON("lastPassiveIncomeDate", null),
      petPersonality: loadJSON("petPersonality", { obi: { dailyMood: null, moodSeed: null, prefHistory: [] }, luna: { dailyMood: null, moodSeed: null, prefHistory: [] } }),
      challengeStars: loadJSON("challengeStars", {}),
      weather: loadJSON("weather", { current: "sunny", lastUpdate: null }),
      scrapbookGoals: loadJSON("scrapbookGoals", { completed: [] }),
      petMemory: loadJSON("petMemory", { lastActions: [], lastJoy: { obi: 50, luna: 50 }, lastDate: null, memories: [] }),
      bond: loadJSON("bond", {
        obi: { xp: 0, level: 1, dailyActions: {}, lastActionDate: null },
        luna: { xp: 0, level: 1, dailyActions: {}, lastActionDate: null }
      }),
      lastVisitTimestamp: loadNumber("lastVisitTimestamp", 0),
      dailyCalendar: loadJSON("dailyCalendar", { currentDay: 0, lastClaimDate: null, streak: 0, weekCycle: 0 })
    };

    /* ── Backfill migrations for existing saves ── */
    /* decor keys */
    if (store.decor.lampOn === undefined) store.decor.lampOn = true;
    if (store.decor.roomPreset === undefined) store.decor.roomPreset = 0;
    if (store.decor.timeOfDay === undefined) store.decor.timeOfDay = 1;
    if (store.decor.wallArt2 === undefined) store.decor.wallArt2 = 0;
    if (store.decor.windowPlant === undefined) store.decor.windowPlant = false;
    if (store.decor.cozyBlanket === undefined) store.decor.cozyBlanket = false;
    if (store.decor.photoWall === undefined) store.decor.photoWall = false;
    /* new decor keys */
    var newDecorKeys = ["floorCushion","corkBoard","bookStack","couchPillows","hangingPlant","candles","wallClock","rugPattern","garland","petToys","musicBox","familyPortrait","comfyBowls","treatsJar","cozyBlankets","joyfulHome","luckyCharm","goldenCurtains","chandelier","silkPillows","antiqueMusicBox","royalThrone","cherryBranch","paintedEggs","springWreath","lemonadePitcher","beachTowel","seashells","pumpkinDisplay","leafGarland","cinnamonCandle","hotCocoaMug","snowglobe","miniTree"];
    for (var ndi = 0; ndi < newDecorKeys.length; ndi++) {
      if (store.decor[newDecorKeys[ndi]] === undefined) store.decor[newDecorKeys[ndi]] = newDecorKeys[ndi] === "couchPillows" || newDecorKeys[ndi] === "rugPattern" || newDecorKeys[ndi] === "garland" ? 0 : false;
    }
    /* achievement keys */
    var allAchKeys = ["obiBestFriend","comboStar","catWhisperer","pouncePerfect","couchPotato","maximumCozy","goodWalker","napMaster","squeakyClean","sortingPro","whackQueen","sharpEye","birdWatcher","goodMemory","greenThumb","shutterBug","fashionista","dedicated","socialButterfly","fullHouse","wellFed","collector","challengeChampion","wandMaster"];
    for (var ai = 0; ai < allAchKeys.length; ai++) {
      if (store.achievements[allAchKeys[ai]] === undefined) store.achievements[allAchKeys[ai]] = false;
    }
    /* stats */
    if (store.stats.totalSessions === undefined) store.stats.totalSessions = 0;
    if (store.stats.totalPhotos === undefined) store.stats.totalPhotos = 0;
    if (store.stats.totalCoinsEarned === undefined) store.stats.totalCoinsEarned = 0;
    if (store.stats.totalFlowersPlanted === undefined) store.stats.totalFlowersPlanted = 0;
    if (store.stats.totalBowlsFilled === undefined) store.stats.totalBowlsFilled = 0;
    if (store.stats.petInteractionsSeen === undefined) store.stats.petInteractionsSeen = 0;
    /* V9 — settings backfill (existing partial saves may have any subset). */
    if (!store.settings || typeof store.settings !== "object") store.settings = { music: 1, sfx: 1, reducedMotion: false };
    if (typeof store.settings.music !== "number") store.settings.music = 1;
    if (typeof store.settings.sfx !== "number") store.settings.sfx = 1;
    if (typeof store.settings.reducedMotion !== "boolean") store.settings.reducedMotion = false;
    /* V10 — musicVariation backfill */
    if (!store.musicVariation || typeof store.musicVariation !== "object") store.musicVariation = { morning: 0, day: 0, evening: 0, night: 0, backyard: 0 };
    ["morning","day","evening","night","backyard"].forEach(function(_mvk) {
      if (typeof store.musicVariation[_mvk] !== "number") store.musicVariation[_mvk] = 0;
    });

    /* ── Bond system migration for existing saves ── */
    if (!store.bond || !store.bond.obi || !store.bond.luna) {
      store.bond = { obi: { xp: 0, level: 1, dailyActions: {}, lastActionDate: null }, luna: { xp: 0, level: 1, dailyActions: {}, lastActionDate: null } };
    }
    /* retroactive bond XP for veteran players based on stats */
    if (store.bond.obi.xp === 0 && store.stats.totalSessions > 1) {
      var retroXP = Math.min(2500, (store.stats.totalBowlsFilled || 0) * 4 + (store.stats.totalTreatCatches || 0) * 2 + (store.careStreak.bestStreak || 0) * 15 + (store.stats.totalSessions || 0) * 5 + (store.stats.petInteractionsSeen || 0) * 8);
      store.bond.obi.xp = retroXP;
      store.bond.luna.xp = retroXP;
      for (var bl = 1; bl <= 10; bl++) { if (retroXP >= bl * bl * 50) { store.bond.obi.level = bl; store.bond.luna.level = bl; } }
      saveJSON("bond", store.bond);
    }

    /* ── Wardrobe migration: single-slot → multi-slot ── */
    if (typeof store.wardrobe.equipped.obi === "string" || store.wardrobe.equipped.obi === null) {
      var oldObi = store.wardrobe.equipped.obi;
      var oldLuna = store.wardrobe.equipped.luna;
      var obiSlot = "neck";
      if (oldObi) { for (var oi = 0; oi < ACCESSORIES.obi.length; oi++) { if (ACCESSORIES.obi[oi].key === oldObi) { obiSlot = ACCESSORIES.obi[oi].slot; break; } } }
      var lunaSlot = "head";
      if (oldLuna) { for (var li = 0; li < ACCESSORIES.luna.length; li++) { if (ACCESSORIES.luna[li].key === oldLuna) { lunaSlot = ACCESSORIES.luna[li].slot; break; } } }
      store.wardrobe.equipped = {
        obi: { head: null, neck: null, body: null },
        luna: { head: null, neck: null },
        annie: { head: null, wrist: null }
      };
      if (oldObi) store.wardrobe.equipped.obi[obiSlot] = oldObi;
      if (oldLuna) store.wardrobe.equipped.luna[lunaSlot] = oldLuna;
      saveWardrobe();
    }
    /* ensure annie slot exists */
    if (!store.wardrobe.equipped.annie) store.wardrobe.equipped.annie = { head: null, wrist: null };
    if (!store.wardrobe.equipped.obi.head && store.wardrobe.equipped.obi.head !== null) store.wardrobe.equipped.obi = { head: null, neck: store.wardrobe.equipped.obi.neck || null, body: store.wardrobe.equipped.obi.body || null };

    function saveStats() { saveJSON("stats", store.stats); }
    function saveAchievements() { saveJSON("achievements", store.achievements); }
    function saveDecor() { saveJSON("decor", store.decor); }
    function saveBackyardDecor() { saveJSON("backyardDecor", store.backyardDecor); }
    function saveCareStreak() { saveJSON("careStreak", store.careStreak); }
    function saveBond() { saveJSON("bond", store.bond); }
    function getCurrentSeason() {
      var month = new Date().getMonth();
      if (month >= 2 && month <= 4) return "spring";
      if (month >= 5 && month <= 7) return "summer";
      if (month >= 8 && month <= 10) return "autumn";
      return "winter";
    }
    function getVisibleDecorItems() {
      var season = getCurrentSeason();
      return DECOR_ITEMS.filter(function(item) { return !item.season || item.season === season; });
    }
    /* Decor panel tabs (Phase B.4) */
    const DECOR_GOLDEN_KEYS = ["goldenCurtains", "chandelier", "silkPillows", "antiqueMusicBox", "royalThrone"];
    const DECOR_TABS = [
      { key: "room",     label: "Room" },
      { key: "upgrades", label: "Upgrades" },
      { key: "seasonal", label: "Seasonal" },
      { key: "golden",   label: "Cozy Set" }
    ];
    function filterDecorByTab(items, tab) {
      return items.filter(function(item) {
        if (tab === "upgrades") return item.isUpgrade === true;
        if (tab === "seasonal") return item.season != null;
        if (tab === "golden")   return DECOR_GOLDEN_KEYS.indexOf(item.key) >= 0;
        // "room" — default catch-all (everything not classified above)
        return !item.isUpgrade && !item.season && DECOR_GOLDEN_KEYS.indexOf(item.key) < 0;
      });
    }
    function getVisibleAccessories(who) {
      var season = getCurrentSeason();
      return (ACCESSORIES[who] || []).filter(function(item) { return !item.season || item.season === season; });
    }
    var BOND_XP_RATES = { pet: { xp: 5, cap: 3 }, brush: { xp: 8, cap: 2 }, treat: { xp: 3, cap: 4 }, toy: { xp: 6, cap: 3 }, feed: { xp: 4, cap: 2 }, water: { xp: 4, cap: 2 }, game: { xp: 10, cap: 3 }, visit: { xp: 5, cap: 1 } };
    function getBondLevel(pet) { return store.bond[pet] ? store.bond[pet].level : 1; }
    function getBondXPForLevel(level) { return level * level * 50; }
    function getBondProgress(pet) {
      var b = store.bond[pet]; if (!b) return 0;
      var curThresh = getBondXPForLevel(b.level);
      var nextThresh = getBondXPForLevel(b.level + 1);
      if (b.level >= 10) return 1;
      return clamp((b.xp - curThresh) / (nextThresh - curThresh), 0, 1);
    }
    /* C.B3 — raw XP grant that runs the level-up loop. Used by the
       awardBondXP daily-action path AND by gift/event grants that
       previously did `b.xp += amount; saveBond()` and skipped levels. */
    function applyBondXPRaw(pet, amount) {
      var b = store.bond[pet]; if (!b || b.level >= 10) return 0;
      b.xp += amount;
      var leveled = false;
      while (b.level < 10 && b.xp >= getBondXPForLevel(b.level + 1)) { b.level++; leveled = true; }
      saveBond();
      return leveled ? b.level : 0;
    }
    function awardBondXP(pet, actionType) {
      var b = store.bond[pet]; if (!b || b.level >= 10) return 0;
      var rate = BOND_XP_RATES[actionType]; if (!rate) return 0;
      var today = new Date().toDateString();
      if (b.lastActionDate !== today) { b.dailyActions = {}; b.lastActionDate = today; }
      var count = b.dailyActions[actionType] || 0;
      if (count >= rate.cap) return 0;
      b.dailyActions[actionType] = count + 1;
      return applyBondXPRaw(pet, rate.xp);
    }
    var BOND_LEVEL_NAMES = ["", "", "Familiar", "Friendly", "Companion", "Trusted", "Devoted", "Bonded", "Inseparable", "Soulmates", "Best Friends Forever"];
    function setBest(gameId, value) {
      const key = "best_" + gameId;
      if (value > store[key]) {
        store[key] = value;
        saveNumber(key, value);
        return true;
      }
      return false;
    }
    function addCoins(amount) {
      store.coins = Math.max(0, store.coins + amount);
      saveNumber("coins", store.coins);
      if (amount > 0) {
        store.stats.totalCoinsEarned += amount;
        saveStats();
      }
      return store.coins;
    }
    function saveWardrobe() { saveJSON("wardrobe", store.wardrobe); }
    function addScrapbookEntry(type, text, icon) {
      var entry = { type: type, text: text, date: new Date().toDateString(), icon: icon || "star" };
      store.scrapbook.entries.push(entry);
      if (store.scrapbook.entries.length > 50) store.scrapbook.entries.shift();
      saveJSON("scrapbook", store.scrapbook);
    }

    /* check if a decor item can be purchased/toggled */
    function canUnlockDecorItem(item) {
      if (item.achievementUnlock) return !!store.achievements[item.achievementUnlock];
      if (item.streakUnlock) return store.careStreak.count >= item.streakUnlock;
      if (item.stars > 0) return totalStarsEarned() >= item.stars;
      if (item.tier && !canAccessTier(item.tier)) return false;
      /* coin items are unlockable — purchase happens on click */
      return true;
    }

    /* decorLockState (Phase B.5) — returns the most-relevant lock chip data,
       or null if the item is fully owned. Priority: achievement > streak >
       stars > season > coins (the same order canUnlockDecorItem walks). */
    function decorLockState(item) {
      if (item.achievementUnlock && !store.achievements[item.achievementUnlock]) {
        return { kind: "achievement", value: item.achievementUnlock };
      }
      if (item.streakUnlock && store.careStreak.count < item.streakUnlock) {
        return { kind: "streak", value: item.streakUnlock };
      }
      if (item.stars > 0 && totalStarsEarned() < item.stars) {
        return { kind: "stars", value: item.stars, current: totalStarsEarned() };
      }
      if (item.season && item.season !== getCurrentSeason()) {
        return { kind: "season", value: item.season };
      }
      if (item.price && (store.decorPurchased || []).indexOf(item.key) < 0) {
        return { kind: "coins", value: item.price };
      }
      return null;
    }

    /* check if player has purchased a coin-gated decor item */
    function isDecorPurchased(item) {
      if (!item.price) return true;
      return store.decorPurchased.indexOf(item.key) >= 0;
    }

    /* check if an accessory can be purchased */
    function canUnlockAccessory(acc) {
      if (acc.achievementUnlock) {
        var parts = acc.achievementUnlock.split("+");
        for (var pi = 0; pi < parts.length; pi++) {
          if (parts[pi] === "allAchievements") {
            for (var ak in store.achievements) { if (!store.achievements[ak]) return false; }
          } else if (!store.achievements[parts[pi]]) return false;
        }
        return true;
      }
      if (acc.starUnlock) return totalStarsEarned() >= acc.starUnlock;
      if (acc.tier && !canAccessTier(acc.tier)) return false;
      return true;
    }

    /* Phase D.2 — single source of truth for the per-minigame star thresholds.
       Used by totalStarsEarned and the Game Menu card render's "next" hint. */
    const STAR_THRESHOLDS = {
      treat:    [300, 700, 1400],
      laser:    [200, 500, 1000],
      cuddle:   [30, 60, 90],
      walk:     [200, 450, 800],
      nap:      [250, 550, 1000],
      bath:     [120, 280, 500],
      sort:     [120, 280, 550],
      pillow:   [150, 350, 650],
      findluna: [100, 250, 500],
      window:   [150, 400, 750],
      pawstep:  [80, 200, 400],
      wildwand: [100, 250, 500]
    };

    function totalStarsEarned() {
      let total = 0;
      for (const key in STAR_THRESHOLDS) {
        const best = store["best_" + key] || 0;
        const t = STAR_THRESHOLDS[key];
        if (best >= t[0]) total++;
        if (best >= t[1]) total++;
        if (best >= t[2]) total++;
      }
      return total;
    }

    /* check and award star milestone coins */
    function checkStarMilestones() {
      var stars = totalStarsEarned();
      var awarded = 0;
      for (var mi = 0; mi < STAR_MILESTONES.length; mi++) {
        var m = STAR_MILESTONES[mi];
        if (stars >= m.stars && store.starMilestonesClaimed.indexOf(m.stars) < 0) {
          store.starMilestonesClaimed.push(m.stars);
          saveJSON("starMilestonesClaimed", store.starMilestonesClaimed);
          addCoins(m.coins);
          awarded += m.coins;
        }
      }
      return awarded;
    }

    function hasUpgrade(key) {
      return store.cozyUpgrades.indexOf(key) >= 0;
    }

    function calculatePassiveIncome() {
      var income = 0;
      for (var i = 0; i < DECOR_ITEMS.length; i++) {
        var item = DECOR_ITEMS[i];
        if (item.type === "toggle" && store.decor[item.key]) income += (item.tier || 1);
        else if (item.type === "cycle" && store.decor[item.key] > 0) income += (item.tier || 1);
      }
      for (var j = 0; j < BACKYARD_DECOR_ITEMS.length; j++) {
        var bItem = BACKYARD_DECOR_ITEMS[j];
        if (bItem.type === "toggle" && store.backyardDecor[bItem.key]) income += (bItem.tier || 1);
      }
      return Math.min(25, income);
    }


    function updateWeather() {
      var now = Date.now();
      var fourHours = 4 * 60 * 60 * 1000;
      if (store.weather.lastUpdate && (now - store.weather.lastUpdate) < fourHours) return store.weather.current;
      /* weighted random selection */
      var roll = Math.random(), cumulative = 0;
      for (var wi = 0; wi < WEATHER_TYPES.length; wi++) {
        cumulative += WEATHER_TYPES[wi].weight;
        if (roll < cumulative) { store.weather.current = WEATHER_TYPES[wi].key; break; }
      }
      store.weather.lastUpdate = now;
      saveJSON("weather", store.weather);
      return store.weather.current;
    }

    function getWeatherData() {
      var key = store.weather.current || "sunny";
      for (var i = 0; i < WEATHER_TYPES.length; i++) { if (WEATHER_TYPES[i].key === key) return WEATHER_TYPES[i]; }
      return WEATHER_TYPES[0];
    }

    function getCareBonus() {
      var joyAvg = ((store.pet_obi_joy || 50) + (store.pet_luna_joy || 50)) / 2;
      var food = store.pet_food_fill || 50;
      var water = store.pet_water_fill || 50;
      var careScore = (joyAvg * 0.5 + food * 0.25 + water * 0.25) / 100;
      return {
        score: careScore,
        scoreMultiplier: 1.0 + careScore * 0.15,
        comboStartBonus: careScore > 0.7 ? 1 : 0,
        timerBonus: Math.floor(careScore * 5),
        label: careScore > 0.8 ? "Well-Loved Bonus!" : careScore > 0.5 ? "Happy Pets Bonus" : null
      };
    }

    function totalChallengeStars() {
      var count = 0;
      for (var k in store.challengeStars) { if (store.challengeStars[k]) count++; }
      return count;
    }

    function getDailyMood(pet) {
      var pp = store.petPersonality[pet];
      if (!pp) { store.petPersonality[pet] = { dailyMood: null, moodSeed: null, prefHistory: [] }; pp = store.petPersonality[pet]; }
      var today = new Date().toDateString();
      if (pp.moodSeed === today && pp.dailyMood) return pp.dailyMood;
      var dayIdx = new Date().getDay();
      var baseMood = DAY_OF_WEEK_PREFS[pet][dayIdx];
      var moods = Object.keys(PET_MOODS[pet]);
      if (Math.random() < 0.3) {
        var recent = (pp.prefHistory || []).slice(-2);
        var alt = moods.filter(function(m) { return m !== baseMood && recent.indexOf(m) < 0; });
        if (alt.length) baseMood = alt[Math.floor(Math.random() * alt.length)];
      }
      pp.dailyMood = baseMood;
      pp.moodSeed = today;
      if (!pp.prefHistory) pp.prefHistory = [];
      pp.prefHistory.push(baseMood);
      if (pp.prefHistory.length > 7) pp.prefHistory.shift();
      saveJSON("petPersonality", store.petPersonality);
      return baseMood;
    }

    function getMoodData(pet) {
      var mood = getDailyMood(pet);
      return PET_MOODS[pet][mood] || PET_MOODS[pet][Object.keys(PET_MOODS[pet])[0]];
    }

