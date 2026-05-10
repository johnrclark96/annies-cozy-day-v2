    // ═══ 13-scene-hangout.js ═══
    function getCurrentFavorite(pet) {
      const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const seed = pet === "obi" ? weekNumber * 3 : weekNumber * 7 + 2;
      const favorites = pet === "obi"
        ? ["belly", "treats", "ball", "brushing"]
        : ["chin", "yarn", "brushing", "sunbeam"];
      return favorites[seed % favorites.length];
    }

    class HangoutScene extends BaseScene {
      constructor() {
        super("hangout");
        this.gamesButton = { x: 20, y: 16, w: 122, h: 40 };
        this.decorButton = { x: 524, y: 16, w: 90, h: 40 };
        this.wardrobeButton = { x: 620, y: 16, w: 90, h: 40 };
        this.wardrobeOpen = false;
        this.wardrobeHover = null;
        this.wardrobeFade = 0;
        this.wardrobeTab = "obi";
        this.wardrobeScrollOffset = 0;
        this.modeButtons = [
          { key: "pet", label: "Pet", x: 148, y: 16, w: 88, h: 40 },
          { key: "treat", label: "Treats", x: 242, y: 16, w: 88, h: 40 },
          { key: "toy", label: "Play", x: 336, y: 16, w: 88, h: 40 },
          { key: "brush", label: "Brush", x: 430, y: 16, w: 88, h: 40 }
        ];
        this.hoverKey = null;
        this.mode = "pet";
        this.menuOpen = false;
        this.decorOpen = false;
        this.decorHover = null;
        this.decorFade = 0;
        this.menuHover = null;
        this.menuFade = 0;
        this.dedication = store.firstVisit ? { phase: 0, alpha: 0 } : null;
        /* E.4 — anniversary re-trigger. If today's month+day match the first
           visit date and we haven't already re-shown the dedication this year,
           show it again. firstVisitDate is null for pre-E.4 players → no
           re-trigger until they reset save. */
        if (!this.dedication && store.firstVisitDate) {
          var _aTd = new Date();
          var _aFv = new Date(store.firstVisitDate);
          if (!isNaN(_aFv.getTime())
              && _aTd.getMonth() === _aFv.getMonth()
              && _aTd.getDate() === _aFv.getDate()
              && _aTd.getFullYear() > store.lastDedicationYear
              && _aTd.getFullYear() !== _aFv.getFullYear()) {
            this.dedication = { phase: 0, alpha: 0 };
            store.lastDedicationYear = _aTd.getFullYear();
            saveNumber("lastDedicationYear", store.lastDedicationYear);
          }
        }
        this.gameCards = [
          { key: "treat", title: "Treat Toss", desc: "Toss treats to Obi and build catch combos!", color: "#E8A84C", icon: "bone", best: () => { const s = store.best_treat; const st = (s>=1400?3:s>=700?2:s>=300?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "laser", title: "Laser Chase", desc: "Guide Luna's laser dot through glowing targets!", color: "#D44040", icon: "catEye", best: () => { const s = store.best_laser; const st = (s>=1000?3:s>=500?2:s>=200?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "cuddle", title: "Cuddle Pile", desc: "Keep the couch balanced while everyone fidgets!", color: "#7FB3D5", icon: "heart", best: () => { const s = store.best_cuddle; const st = (s>=90?3:s>=60?2:s>=30?1:0); return "Best: " + s + "s  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "walk", title: "Obi's Walk", desc: "Walk Obi through the neighborhood and find treasures!", color: "#8D6E4C", icon: "bone", best: () => { const s = store.best_walk; const st = (s>=800?3:s>=450?2:s>=200?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "nap", title: "Luna's Nap Spot", desc: "Place cushions in sunbeams to help Luna nap!", color: "#C39BD3", icon: "heart", best: () => { const s = store.best_nap; const st = (s>=1000?3:s>=550?2:s>=250?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "bath", title: "Bath Time", desc: "Scrub, rinse, and dry Obi and Luna!", color: "#87CEEB", icon: "heart", best: () => { const s = store.best_bath; const st = (s>=500?3:s>=280?2:s>=120?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "sort", title: "Snack Sort", desc: "Sort treats into the right bowls!", color: "#E8A84C", icon: "bone", best: () => { const s = store.best_sort; const st = (s>=550?3:s>=280?2:s>=120?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "pillow", title: "Pillow Pop", desc: "Boop Luna before she hides again!", color: "#F48FB1", icon: "paw", best: () => { const s = store.best_pillow; const st = (s>=650?3:s>=350?2:s>=150?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "findluna", title: "Where's Luna?", desc: "Track Luna under the shuffling cushions!", color: "#7CB342", icon: "catEye", best: () => { const s = store.best_findluna; const st = (s>=500?3:s>=250?2:s>=100?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "window", title: "Window Watch", desc: "Help Luna catch birds and butterflies!", color: "#87CEEB", icon: "star", best: () => { const s = store.best_window; const st = (s>=750?3:s>=400?2:s>=150?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "pawstep", title: "Pawstep Patterns", desc: "Repeat the pet action sequences!", color: "#C39BD3", icon: "heart", best: () => { const s = store.best_pawstep; const st = (s>=400?3:s>=200?2:s>=80?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } },
          { key: "wildwand", title: "Luna's Wild Wand", desc: "Guide Luna with a dangling toy through cozy obstacles!", color: "#E88090", icon: "catEye", best: () => { const s = store.best_wildwand; const st = (s>=500?3:s>=250?2:s>=100?1:0); return "Best: " + s + "  " + "\u2605".repeat(st) + "\u2606".repeat(3-st); } }
        ];
        this.menuScroll = 0;
        this.statusText = "Welcome home! Obi and Luna are happy to see you.";
        this.statusPulse = 0;
        this.sessionJoy = 0;
        this.idleTime = 0;
        this.strokeTick = 0;
        this.treats = [];
        this.toy = null;
        this.annie = {
          x: 404, y: 336, homeX: 404, homeY: 336, floorY: 420,
          pose: "idle", poseTimer: rand(3, 6), facing: 1,
          state: "idle", stateTimer: rand(4, 7), targetY: 336
        };
        this.obi = {
          x: 164, y: 430, homeX: 164, homeY: 430, matX: 262, matY: 446,
          targetX: 164, targetY: 430, joy: store.pet_obi_joy, facing: 1, bounce: 0,
          petTimer: 0, happyTimer: 0, sleepy: false,
          sniffTimer: 0, shakeTimer: 0, sniffing: false,
          carryingToy: false, carryTimer: 0
        };
        this.luna = {
          x: 694, y: 258, floorX: 598, floorY: 430,
          targetX: 694, targetY: 258, joy: store.pet_luna_joy, perch: "tower", facing: 1,
          petTimer: 0, happyTimer: 0, wiggle: 0, pounce: 0, pawBat: 0,
          grooming: false, bellyUp: false, stretching: false, idleBehaviorTimer: rand(5, 8)
        };
        /* pet-to-pet interaction */
        this.petInteraction = { active: false, type: null, timer: rand(12, 18), phase: 0 };
        /* thought bubbles */
        this.obiBubble = null;
        this.lunaBubble = null;
        this.bubbleTimer = store.bubbleOnboarded ? rand(8, 14) : 2;
        this.bubbleWantHistory = [];
        /* joy save timer */
        this.joySaveTimer = 0;
        /* decoration unlock notification */
        this.decorNotification = null;
        /* floating reaction texts */
        this.floatingTexts = [];
        /* joy milestone tracking */
        this.obiMilestone = this.joyTier(this.obi.joy);
        this.lunaMilestone = this.joyTier(this.luna.joy);
        /* F.NEW.1 — rolling joy history per pet for the decay-direction arrow.
           Samples are {t, joy}; compute delta over last 5s. */
        this._joyHistory = { obi: [], luna: [] };
        this._joySampleTimer = 0;
        /* stroke trail for pet/brush mode */
        this.strokeTrail = [];
        /* food & water bowls — apply real-time depletion */
        const now = Date.now();
        const foodElapsed = (now - store.pet_food_lastFill) / 1000;
        const waterElapsed = (now - store.pet_water_lastFill) / 1000;
        this.foodBowl = {
          x: 130, y: 462,
          fill: clamp(store.pet_food_fill - foodElapsed / 144, 0, 100),
          lastFill: store.pet_food_lastFill
        };
        this.waterBowl = {
          x: 430, y: 466,
          fill: clamp(store.pet_water_fill - waterElapsed / 108, 0, 100),
          lastFill: store.pet_water_lastFill
        };
        this.foodBowlHitbox = { x: this.foodBowl.x - 36, y: this.foodBowl.y - 28, w: 72, h: 48 };
        this.waterBowlHitbox = { x: this.waterBowl.x - 36, y: this.waterBowl.y - 28, w: 72, h: 48 };
        this.bowlSaveTimer = 0;
        /* offline joy decay — pets get lonely while you're away (1 joy per 3 min) */
        var lastJoySave = loadNumber("lastJoySave", now);
        var awaySeconds = (now - lastJoySave) / 1000;
        if (awaySeconds > 60) {
          var joyLoss = Math.min(40, awaySeconds / 180);
          this.obi.joy = clamp(this.obi.joy - joyLoss, 15, 100);
          this.luna.joy = clamp(this.luna.joy - joyLoss, 15, 100);
        }
        /* pet eating/drinking state */
        this.obi.eating = false;
        this.obi.drinking = false;
        this.obi.eatDrinkTimer = 0;
        this.luna.eating = false;
        this.luna.drinking = false;
        this.luna.eatDrinkTimer = 0;
        /* lamp & toy basket hitboxes */
        this.lampHitbox = { x: 186, y: 128, w: 58, h: 62 };
        this.toyBasketHitbox = { x: 248, y: 375, w: 38, h: 30 };
        /* daily gift */
        this.dailyGift = null;
        /* favorites */
        this.favDiscovered = { obi: false, luna: false };
        /* ambient events — restore from module-level holder so visitors
           don't disappear on every scene round-trip (C.B14). */
        this.ambientEvent = null;
        this.ambientEventCooldown = rand(60, 180);
        if (persistedHangoutAmbient) {
          var _hpaElapsed = (Date.now() - persistedHangoutAmbient.savedAt) / 1000;
          if (persistedHangoutAmbient.event && persistedHangoutAmbient.event.timer > _hpaElapsed) {
            this.ambientEvent = persistedHangoutAmbient.event;
            this.ambientEvent.timer -= _hpaElapsed;
          } else if (persistedHangoutAmbient.cooldown != null) {
            this.ambientEventCooldown = Math.max(1, persistedHangoutAmbient.cooldown - _hpaElapsed);
          }
        }
        /* decor pagination + tab (Phase B.4) */
        this.decorPage = 0;
        this.decorTab = "room";
        /* coin popup */
        this.coinPopup = null;
        /* camera flash */
        this.cameraFlash = 0;
        /* backyard door */
        this.backyardDoor = { x: 740, y: 300, w: 60, h: 100 };
        /* camera + scrapbook buttons — positioned below mute icon */
        this.cameraButton = { x: W - SAFE - 28, y: SAFE + 34, w: 28, h: 28 };
        this.scrapbookButton = { x: W - SAFE - 28, y: SAFE + 68, w: 28, h: 28 };
        /* F.3 — weather chip in chip stack slot 3 */
        this.weatherButton = { x: W - SAFE - 28, y: SAFE + 102, w: 28, h: 28 };
        /* V8 — help/tutorial re-open chip in chip stack slot 4 */
        this.helpButton = { x: W - SAFE - 28, y: SAFE + 136, w: 28, h: 28 };
        /* V9 — settings (gear) chip in chip stack slot 5 */
        this.gearButton = { x: W - SAFE - 28, y: SAFE + 170, w: 28, h: 28 };
        this.settingsOpen = false;
        this.scrapbookOpen = false;
        this.scrapbookHover = null;
        this.scrapbookFade = 0;
        this.scrapbookTab = "milestones";
        this.scrapbookPhotoScroll = 0;
        this.scrapbookMilestoneScroll = 0;
        /* window + pet bed hitboxes */
        this.windowHitbox = { x: 62, y: 48, w: 128, h: 160 };
        this.petBedHitbox = { x: 476, y: 450, w: 88, h: 32 };
        /* decoration reactions */
        this.decorReactionCooldown = rand(20, 40);
        this.decorReaction = null;
      }
      enter() {
        this.hoverKey = null;
        this.tooltip = null;
        /* C.B25 — explicit mood swap so returning from backyard switches
           music back to the time-of-day mood (startAmbient was a no-op
           when ambient was already running, so backyard mood persisted). */
        var _hsTod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
        audio.setMusicMood(["morning", "day", "evening", "night"][_hsTod]);
        /* E.2 — soft chord on dedication entry. */
        if (this.dedication && !this._dedicationChordPlayed) {
          this._dedicationChordPlayed = true;
          audio.softChord();
        }
        /* record returning from a minigame as a "game" care action */
        if (game.transition && game.transition.from instanceof BaseMinigameScene) {
          this.recordCareAction("game");
        }
        /* count session when entering from title */
        if (game.transition && game.transition.from instanceof TitleScene) {
          store.stats.totalSessions++;
          saveStats();
          awardBondXP("obi", "visit"); awardBondXP("luna", "visit");
        }
        /* V8 — first-visit tutorial overlay (gated on session count so we
           don't re-open it for veteran players whose tutorialSeen defaults
           to false in the migration backfill; the help chip in the chip
           column lets veterans re-open it on demand). */
        if (!store.tutorialSeen && store.stats.totalSessions <= 1 && !this.dedication) {
          this.tutorial = { phase: 0 };
        }
        /* bond XP for returning from minigame */
        if (game.transition && game.transition.from instanceof BaseMinigameScene) {
          awardBondXP("obi", "game"); awardBondXP("luna", "game");
        }
        /* bond level 2+: door greeting — pets run toward Annie on arrival */
        if (game.transition && game.transition.from instanceof TitleScene) {
          if (getBondLevel("obi") >= 2) {
            this.obi.targetX = this.annie.x - 40;
            this.obi.targetY = this.obi.homeY;
            this._obiGreeting = 2.0;
          }
          if (getBondLevel("luna") >= 2) {
            this.luna.targetX = this.annie.x + 40;
            this.luna.targetY = this.luna.floorY;
            this.luna.perch = "floor";
            this._lunaGreeting = 2.0;
          }
        }
        /* initialize daily moods and weather */
        var obiMoodToday = getDailyMood("obi");
        var lunaMoodToday = getDailyMood("luna");
        updateWeather();
        /* cozy upgrades: start joy bonus */
        if (hasUpgrade("cozyBlankets")) {
          this.obi.joy = clamp(this.obi.joy + 5, 0, 100);
          this.luna.joy = clamp(this.luna.joy + 5, 0, 100);
        }
        /* pet memory: welcome back referencing yesterday */
        var mem = store.petMemory;
        if (mem.lastDate && mem.lastDate !== new Date().toDateString() && mem.lastActions && mem.lastActions.length > 0) {
          if (mem.lastJoy && mem.lastJoy.obi > 75) this.obi.joy = clamp(this.obi.joy + 3, 0, 100);
          if (mem.lastJoy && mem.lastJoy.luna > 75) this.luna.joy = clamp(this.luna.joy + 3, 0, 100);
        }
        /* welcome back message if joy decayed while away */
        if (this.obi.joy < 40 || this.luna.joy < 40) {
          const msgs = ["The pets missed you! Give them some love.", "Obi and Luna could use some attention.", "Welcome back! The pets are waiting for you."];
          this.statusText = msgs[Math.floor(Math.random() * msgs.length)];
          this.statusPulse = 0.5;
        } else if (mem.lastDate && mem.lastDate !== new Date().toDateString() && mem.lastActions && mem.lastActions.length > 0) {
          var memMsgs = [];
          if (mem.lastActions.indexOf("pet_obi") >= 0) memMsgs.push("Obi seems to remember the belly rubs!");
          if (mem.lastActions.indexOf("pet_luna") >= 0) memMsgs.push("Luna's fur is still shiny from last time!");
          if (mem.lastActions.indexOf("toy_obi") >= 0) memMsgs.push("Obi is looking for the ball you threw.");
          if (mem.lastActions.indexOf("brush_obi") >= 0) memMsgs.push("Obi's coat is extra fluffy today!");
          if (mem.lastActions.indexOf("brush_luna") >= 0) memMsgs.push("Luna remembers the brushing session.");
          if (mem.lastActions.indexOf("treat_obi") >= 0) memMsgs.push("Obi perks up — he remembers treats!");
          if (memMsgs.length > 0) {
            this.statusText = memMsgs[Math.floor(Math.random() * memMsgs.length)];
            this.statusPulse = 0.3;
          }
        } else if (this.passiveIncomeAmount > 0) {
          this.statusText = "Your cozy home earned +" + this.passiveIncomeAmount + " coins overnight!";
          this.statusPulse = 0.5;
        } else if (game.transition && game.transition.from instanceof TitleScene) {
          /* F.NEW.2 — one-time welcome-back line if a meaningful streak broke. */
          if (store.streakBreakPending) {
            var _sbLines = ["Obi looked for you yesterday.", "Luna sat by the door for a while.", "The pets missed your visit yesterday."];
            this.statusText = _sbLines[Math.floor(Math.random() * _sbLines.length)];
            this.statusPulse = 0.5;
            store.streakBreakPending = false;
            saveBool("streakBreakPending", false);
          } else {
            /* F.5 — pick from WELCOME_LINES filtered to today's pet moods. */
            var _wMoods = [obiMoodToday, lunaMoodToday];
            var _wPool = WELCOME_LINES.filter(function(w) { return w.mood === "any" || _wMoods.indexOf(w.mood) >= 0; });
            if (_wPool.length === 0) _wPool = WELCOME_LINES;
            this.statusText = _wPool[Math.floor(Math.random() * _wPool.length)].text;
            this.statusPulse = 0.3;
          }
        }
        /* check for newly unlocked decorations */
        const stars = totalStarsEarned();
        if (stars > store.lastKnownStars) {
          for (const item of DECOR_ITEMS) {
            if (item.stars > store.lastKnownStars && item.stars <= stars) {
              this.decorNotification = { text: "New decoration unlocked: " + item.name + "!", timer: 4 };
              break;
            }
          }
          store.lastKnownStars = stars;
          saveNumber("lastKnownStars", stars);
        }
        /* away story + daily calendar */
        const today = new Date().toDateString();
        var timeSinceVisit = Date.now() - (store.lastVisitTimestamp || 0);
        /* "while you were away" story if >2 hours */
        if (store.lastVisitTimestamp > 0 && timeSinceVisit > 7200000 && game.transition && game.transition.from instanceof TitleScene) {
          var story = AWAY_STORIES[Math.floor(Math.random() * AWAY_STORIES.length)];
          this._awayStory = { text: story.text, bonus: story.bonus || null, phase: 0 };
        }
        store.lastVisitTimestamp = Date.now();
        saveNumber("lastVisitTimestamp", store.lastVisitTimestamp);
        /* daily calendar gift — C.B8: lastVisitDate set is deferred to claim
           in _tryClaimDailyGift so a leave-without-claim re-shows the gift. */
        if (store.lastVisitDate !== today) {
          /* check streak */
          var cal = store.dailyCalendar;
          if (cal.lastClaimDate) {
            var lastClaim = new Date(cal.lastClaimDate);
            var daysDiff = Math.floor((new Date() - lastClaim) / 86400000);
            if (daysDiff > 2) { cal.streak = 0; cal.currentDay = 0; }
          }
          this.dailyGift = { phase: 0, collected: false, calendarDay: cal.currentDay };
          /* passive decoration income */
          if (store.lastPassiveIncomeDate !== today) {
            var passiveIncome = calculatePassiveIncome();
            if (passiveIncome > 0) {
              addCoins(passiveIncome);
              store.lastPassiveIncomeDate = today;
              saveJSON("lastPassiveIncomeDate", today);
              this.passiveIncomeAmount = passiveIncome;
            }
          }
        }
        /* care streak milestones — expanded with escalating rewards */
        const streak = store.careStreak;
        const milestones = [
          { days: 3, coins: 10, reward: () => { this.obi.joy = clamp(this.obi.joy + 10, 0, 100); this.luna.joy = clamp(this.luna.joy + 10, 0, 100); }, text: "3-day care streak! +10 coins" },
          { days: 7, coins: 15, reward: () => { store.decor.cozyBlanket = true; saveDecor(); }, text: "7-day streak! Cozy Blanket + 15 coins!" },
          { days: 14, coins: 20, reward: () => { this.obi.joy = clamp(this.obi.joy + 15, 0, 100); this.luna.joy = clamp(this.luna.joy + 15, 0, 100); if (this.foodBowl) this.foodBowl.fill = 100; if (this.waterBowl) this.waterBowl.fill = 100; }, text: "2-week streak! +20 coins!" },
          { days: 21, coins: 25, reward: () => {}, text: "21-day streak! Tier 2 unlocked! +25 coins!" },
          { days: 30, coins: 30, reward: () => { store.decor.photoWall = true; saveDecor(); }, text: "30-day streak! Photo Wall + 30 coins!" },
          { days: 45, coins: 40, reward: () => {}, text: "45-day streak! +40 coins!" },
          { days: 60, coins: 50, reward: () => {}, text: "60-day streak! Tier 3 unlocked! +50 coins!" },
          { days: 90, coins: 75, reward: () => {}, text: "90-day streak! +75 coins! Incredible!" }
        ];
        for (const m of milestones) {
          if (streak.count >= m.days && !streak.milestonesClaimed.includes(m.days)) {
            streak.milestonesClaimed.push(m.days);
            saveCareStreak();
            m.reward();
            this.earnCoins(m.coins);
            addScrapbookEntry("milestone", m.text, "heart");
            this.decorNotification = { text: m.text, timer: 5 };
            /* dedicated achievement at 30 days */
            if (m.days >= 30 && !store.achievements.dedicated) {
              store.achievements.dedicated = true;
              saveAchievements();
              var dedInfo = ACHIEVEMENTS.find(function(a) { return a.key === "dedicated"; });
              if (dedInfo && dedInfo.coinBonus) addCoins(dedInfo.coinBonus);
              /* E.6 — special-cased scrapbook entry replaces the flat
                 "Dedicated Caretaker unlocked!" line with a sentence that
                 reads as a moment, not a log entry. */
              addScrapbookEntry("achievement", "Day 30. Annie has been here every day. Obi and Luna know.", "heart");
              /* E.6 — full-screen cream ribbon + three-character cheer pose,
                 single chord chime. Renders for 2.5s. */
              this._dedicatedReveal = { timer: 2.5, total: 2.5 };
              audio.chord([261.63, 329.63, 392, 523.25], 0.8, 0.10);
            }
          }
        }
        /* daily tasks */
        if (store.dailyTasks.date !== today) {
          const seed = today.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
          const shuffled = [...DAILY_TASK_POOL].sort((a, b) => ((a.id.charCodeAt(0) * seed) % 97) - ((b.id.charCodeAt(0) * seed) % 97));
          store.dailyTasks = { date: today, tasks: shuffled.slice(0, 3).map(t => t.id), completed: [] };
          saveJSON("dailyTasks", store.dailyTasks);
        }
        /* weekly challenge — reset each local Monday at 00:00 (C.B4).
           Math.floor(Date.now()/7days) anchors to Thursday UTC because
           the unix epoch was a Thursday — wrong day, wrong timezone. */
        var _wcD = new Date();
        var _wcDiff = (_wcD.getDay() + 6) % 7; /* 0=Mon, 6=Sun */
        var _wcMonday = new Date(_wcD.getFullYear(), _wcD.getMonth(), _wcD.getDate() - _wcDiff);
        var weekId = Math.floor(_wcMonday.getTime() / 86400000);
        if (store.weeklyChallenge.weekId !== weekId) {
          var wcSeed = weekId * 13 + 7;
          var wcIdx = wcSeed % WEEKLY_CHALLENGES.length;
          var wc = WEEKLY_CHALLENGES[wcIdx];
          store.weeklyChallenge = { weekId: weekId, challengeId: wc.id, progress: 0, target: wc.target, completed: false, reward: wc.reward, text: wc.text };
          saveJSON("weeklyChallenge", store.weeklyChallenge);
        }
      }
      trackWeeklyChallenge(trackKey, amount) {
        var wc = store.weeklyChallenge;
        if (!wc || wc.completed) return;
        var challenge = WEEKLY_CHALLENGES.find(function(c) { return c.id === wc.challengeId; });
        if (!challenge || challenge.trackKey !== trackKey) return;
        wc.progress = Math.min(wc.target, wc.progress + (amount || 1));
        if (wc.progress >= wc.target) {
          wc.completed = true;
          addCoins(wc.reward);
          this.decorNotification = { text: "Weekly challenge complete! +" + wc.reward + " coins!", timer: 5 };
          audio.combo();
          addScrapbookEntry("milestone", "Completed weekly challenge: " + (wc.text || ""), "star");
        }
        saveJSON("weeklyChallenge", wc);
      }
      getPetRect(key) {
        if (key === "obi") return { x: this.obi.x - 72, y: this.obi.y - 112, w: 144, h: 120 };
        const y = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y;
        return { x: this.luna.x - 68, y: y - 104, w: 136, h: 120 };
      }
      setMode(nextMode) {
        if (this.mode !== nextMode) {
          this.mode = nextMode;
          this.statusPulse = 1;
          if (nextMode === "pet") this.statusText = isMobile ? "Pet mode \u2014 tap and drag over Obi or Luna!" : "Pet mode \u2014 click and drag over Obi or Luna!";
          else if (nextMode === "treat") this.statusText = isMobile ? "Treat mode \u2014 tap anywhere to toss a snack!" : "Treat mode \u2014 click anywhere to toss a snack!";
          else if (nextMode === "toy") this.statusText = isMobile ? "Play mode \u2014 tap left for Obi's ball, right for Luna's yarn!" : "Play mode \u2014 click left for Obi's ball, right for Luna's yarn!";
          else if (nextMode === "brush") this.statusText = isMobile ? "Brush mode \u2014 tap and drag over a pet to brush them!" : "Brush mode \u2014 drag over a pet to brush them until they sparkle!";
        }
      }
      pickPetForPoint(x, y) {
        if (pointInRect(x, y, this.getPetRect("obi"))) return "obi";
        if (pointInRect(x, y, this.getPetRect("luna"))) return "luna";
        return x < W * 0.5 ? "obi" : "luna";
      }
      petName(key) { return key === "obi" ? "Obi" : "Luna"; }
      petMood(key) {
        const pet = key === "obi" ? this.obi : this.luna;
        const joy = pet.joy;
        const food = this.foodBowl ? this.foodBowl.fill : 100;
        const water = this.waterBowl ? this.waterBowl.fill : 100;
        if (food < 25) return "hungry";
        if (water < 25) return "thirsty";
        if (joy < 20) return "sad";
        if (pet.sleepy) return "sleepy";
        if (joy > 70 && this.idleTime > 12) return "sleepy";
        if (joy >= 35 && joy <= 70 && this.idleTime < 30) return "playful";
        return "cuddly";
      }
      moodLabel(key) {
        var dm = getMoodData(key);
        var situationalMood = this.petMood(key);
        if (situationalMood === "hungry" || situationalMood === "thirsty" || situationalMood === "sad") {
          var situationalLabels = { hungry: { obi: "hungry", luna: "hungry" }, thirsty: { obi: "thirsty", luna: "thirsty" }, sad: { obi: "lonely", luna: "grumpy" } };
          return (situationalLabels[situationalMood])[key];
        }
        return dm.label || "content";
      }
      /* F.2 — return a "x1.5 for Obi today" suffix when one or both pets
         have a >1 multiplier on the given action source. Returns "" if
         neither pet's mood boosts this action. */
      _moodMultHint(source) {
        var oM = ((getMoodData("obi") || {}).joyMult || {})[source] || 1;
        var lM = ((getMoodData("luna") || {}).joyMult || {})[source] || 1;
        var parts = [];
        if (oM > 1) parts.push("×" + oM.toFixed(1) + " Obi");
        if (lM > 1) parts.push("×" + lM.toFixed(1) + " Luna");
        return parts.length ? "  " + parts.join(", ") + " today" : "";
      }
      petSpriteState(key) {
        /* V9 — reduced-motion damping reverts V4's amplification toward
           the pre-V4 amplitudes when the player opts in. */
        const __reduced = !!(store.settings && store.settings.reducedMotion);
        const __bAmp = __reduced ? 0.012 : 0.022;
        const __tHigh = __reduced ? 1.0 : 1.4;
        const __tLow = __reduced ? 0.6 : 0.85;
        const __lAmp = __reduced ? 0.01 : 0.022;
        if (key === "obi") {
          let pose = "sit";
          if (this.obi.carryingToy) pose = "carryToy";
          else if (this.obi.eating) pose = "eat";
          else if (this.obi.drinking) pose = "drink";
          else if (this.obi.shakeTimer > 0) pose = "shake";
          else if (this.obi.sleepy) pose = "sleeping";
          else if (this.obi.sniffing) pose = "sniff";
          else if (this.toy && this.toy.pet === "obi") pose = "run";
          /* idle breathing bob */
          const obiBreathe = pose === "sit" ? Math.sin(game.time * 2.2) * __bAmp : 0;
          /* tail wags continuously with varying speed based on mood */
          const tailSpeed = this.obi.happyTimer > 0.1 ? 10 : (this.obi.joy > 65 ? 7 : this.obi.joy > 40 ? 5 : 3);
          const tailAmp = this.obi.sleepy ? 0.2 : (this.obi.joy > 65 ? __tHigh : __tLow);
          /* occasional head tilt fidget */
          const obiHeadBob = pose === "sit" ? Math.sin(game.time * 0.7) * 0.015 : 0;
          return {
            pose,
            expression: this.obi.sleepy ? "sad" : (this.obi.happyTimer > 0.1 || this.obi.petTimer > 0.08) ? "excited" : "happy",
            tail: Math.sin(game.time * tailSpeed) * tailAmp,
            bounce: this.obi.bounce + (this.obi.petTimer > 0 ? 0.04 : 0) + obiBreathe,
            facing: this.obi.facing,
            glow: this.hoverKey === "obi" ? "rgba(255,215,0,0.30)" : null
          };
        }
        /* Luna idle micro-animations */
        const lunaPose = this.luna.eating ? "eat" : this.luna.drinking ? "drink" : this.luna.stretching ? "stretch" : this.luna.bellyUp ? "bellyUp" : this.luna.grooming ? "groom" : this.luna.perch !== "floor" ? "lounge" : "sit";
        const lunaBreathe = (lunaPose === "sit" || lunaPose === "lounge") ? Math.sin(game.time * 1.8 + 0.5) * __lAmp : 0;
        /* tail sways with more organic motion (two overlapping sine waves) */
        const lunaTail = Math.sin(game.time * 1.7 + 1.2) * 0.7 + Math.sin(game.time * 2.9 + 0.4) * 0.3;
        /* periodic ear flick */
        const earBase = earSignal(game.time + 0.8);
        const earMicro = Math.sin(game.time * 0.6) > 0.92 ? 0.3 : 0;
        return {
          pose: lunaPose,
          tail: lunaTail,
          earTwitch: earBase + earMicro,
          blink: blinkSignal(game.time + 1.3, 0.38),
          wiggle: this.luna.wiggle + lunaBreathe,
          pounceStretch: this.luna.pounce,
          pawBat: this.luna.pawBat,
          facing: this.luna.facing,
          glow: this.hoverKey === "luna" ? "rgba(255,215,0,0.30)" : null
        };
      }
      rewardPet(key, amount, source, x, y) {
        const pet = key === "obi" ? this.obi : this.luna;
        /* cozy upgrade: treats jar bonus */
        if (hasUpgrade("treatsJar") && (source === "treat" || source === "feed")) amount += 1;
        /* mood multiplier */
        var moodData = getMoodData(key);
        var moodMult = (moodData.joyMult && moodData.joyMult[source]) || 1.0;
        amount = amount * moodMult;
        /* diminishing returns for rapid interactions */
        if (!this._rewardCooldown) this._rewardCooldown = { obi: 0, luna: 0 };
        var cooldown = this._rewardCooldown[key] || 0;
        var effectiveAmount = amount * clamp(1 - cooldown * 0.6, 0.1, 1);
        this._rewardCooldown[key] = Math.min(1.5, cooldown + 0.35);
        pet.joy = clamp(pet.joy + effectiveAmount, 0, 100);
        store[key === "obi" ? "pet_obi_joy" : "pet_luna_joy"] = pet.joy;
        saveNumber(key === "obi" ? "pet_obi_joy" : "pet_luna_joy", pet.joy);
        pet.petTimer = source === "pet" ? 0.32 : 0.18;
        pet.happyTimer = 0.9;
        this.statusPulse = 1;
        this.idleTime = 0;
        this.sessionJoy += amount;
        /* mood feedback */
        if (moodMult >= 1.3 && cooldown < 0.4) this.addFloatingText(this.petName(key) + " loves this today!", x || pet.x, (y || pet.y) - 30, COLORS.gold);
        else if (moodMult <= 0.7 && cooldown < 0.4) this.addFloatingText("Not in the mood...", x || pet.x, (y || pet.y) - 30, "rgba(160,140,120,0.7)");
        /* pet memory tracking */
        if (!this._sessionActions) this._sessionActions = [];
        var memAction = source + "_" + key;
        if (this._sessionActions.indexOf(memAction) < 0) this._sessionActions.push(memAction);
        if (key === "obi") this.obi.sleepy = false;
        if (key === "obi" && pet.joy >= 88 && source === "pet" && this.obi.shakeTimer <= 0) {
          this.obi.shakeTimer = 1.2;
          this.statusText = "Obi does a happy little shake!";
          spawnParticleBurst(x, y - 14, [COLORS.gold, COLORS.softPink], 8, ["star"]);
        }
        if (key === "luna") {
          this.luna.perch = "floor";
          this.luna.targetX = this.luna.floorX;
          this.luna.targetY = this.luna.floorY;
          this.luna.grooming = false;
          this.luna.bellyUp = false;
          this.luna.stretching = false;
          this.luna.idleBehaviorTimer = rand(5, 8);
        }
        if (source === "pet") {
          this.statusText = this.petName(key) + " loves the attention.";
          spawnParticleBurst(x, y - 18, [COLORS.softPink, COLORS.gold], 6, ["heart"]);
          audio.tinyChime();
        } else if (source === "treat") {
          this.statusText = this.petName(key) + " happily crunches the treat.";
          spawnParticleBurst(x, y - 8, [COLORS.softPink, COLORS.gold], 9, ["heart", "star"]);
          audio.catch();
        } else if (source === "brush") {
          /* handled by brush click handler */
        } else if (source === "feed" || source === "water") {
          /* handled by bowl click handler */
        } else {
          this.statusText = key === "obi" ? "Obi chased the ball and brought it back!" : "Luna pounced on the yarn ball!";
          spawnParticleBurst(x, y - 8, [COLORS.gold, COLORS.softPink], 10, ["star", "heart"]);
          if (key === "obi") audio.combo(); else { audio.pounce(); audio.targetHit(); }
        }
        this.checkBubbleReward(key, source);
        this.checkJoyMilestone(key);
        this.recordCareAction(source);
        /* bond XP */
        var bondLevelUp = awardBondXP(key, source);
        if (bondLevelUp > 0) {
          this._bondLevelUp = { pet: key, level: bondLevelUp, timer: 4 };
          this.statusText = this.petName(key) + " bond reached Level " + bondLevelUp + "! " + (BOND_LEVEL_NAMES[bondLevelUp] || "");
          this.statusPulse = 1;
          audio.achievement();
          spawnParticleBurst(pet.x, pet.y - 30, [COLORS.softPink, COLORS.gold, "#FF69B4"], 16, ["heart", "star"]);
        }
        /* favorite item detection */
        const fav = getCurrentFavorite(key);
        const isFavAction =
          (fav === "belly" && source === "pet") || (fav === "treats" && source === "treat") ||
          (fav === "ball" && source === "toy") || (fav === "brushing" && source === "brush") ||
          (fav === "chin" && source === "pet") || (fav === "yarn" && source === "toy") || (fav === "sunbeam");
        if (isFavAction) {
          const bonus = fav === "sunbeam" ? 3 : 5;
          pet.joy = clamp(pet.joy + bonus, 0, 100);
          if (!this.favDiscovered[key]) {
            this.favDiscovered[key] = true;
            this.earnCoins(3);
            addScrapbookEntry("discovery", "Discovered " + this.petName(key) + "'s favorite: " + fav + "!", "heart");
            this.addFloatingText("Favorite!", x, y - 20, "#FF69B4");
            spawnParticleBurst(x, y - 10, ["#FF69B4", COLORS.gold, "#FFF4C0"], 10, ["heart", "star"]);
            audio.combo();
            this.statusText = this.petName(key) + "'s favorite thing this week!";
          } else {
            spawnParticleBurst(x, y - 10, ["#FF69B4"], 3, ["heart"]);
          }
        }
      }
      updateHover(x, y) {
        if (this.dedication) return;
        if (this.menuOpen) {
          this.menuHover = null;
          if (this.menuScroll > 0 && pointInRect(x, y, { x: W / 2 - 50, y: 106, w: 100, h: 20 })) {
            this.menuHover = "scrollUp";
          } else if (this.menuScroll + 6 < this.gameCards.length && pointInRect(x, y, { x: W / 2 - 50, y: 126 + 6 * 72 + 2, w: 100, h: 20 })) {
            this.menuHover = "scrollDown";
          } else {
            for (let vi = 0; vi < Math.min(6, this.gameCards.length - this.menuScroll); vi++) {
              const cr = this.getCardRect(vi);
              if (pointInRect(x, y, cr)) { this.menuHover = this.menuScroll + vi; break; }
            }
          }
          if (pointInRect(x, y, panelClose(MENU_PANEL))) this.menuHover = "close";
          return;
        }
        if (this.decorOpen) {
          this.decorHover = null;
          const pageItems = this.getDecorPageItems();
          for (let i = 0; i < pageItems.length; i++) {
            if (pointInRect(x, y, this.getDecorItemRect(i))) { this.decorHover = i; break; }
          }
          if (pointInRect(x, y, panelClose("decor"))) this.decorHover = "close";
          if (pointInRect(x, y, { x: 300, y: 530, w: 40, h: 30 })) this.decorHover = "prevPage";
          if (pointInRect(x, y, { x: 460, y: 530, w: 40, h: 30 })) this.decorHover = "nextPage";
          return;
        }
        if (this.wardrobeOpen) {
          this.wardrobeHover = null;
          if (pointInRect(x, y, panelClose(WARDROBE_PANEL))) { this.wardrobeHover = "close"; return; }
          /* tabs flat per drawPanelTabs convention (no hover state) */
          var wMaxScroll = this.wardrobeMaxScroll();
          if (wMaxScroll > 0 && this.wardrobeScrollOffset > 0 && pointInRect(x, y, { x: 520, y: 175, w: 40, h: 20 })) { this.wardrobeHover = "scrollUp"; return; }
          if (wMaxScroll > 0 && this.wardrobeScrollOffset < wMaxScroll && pointInRect(x, y, { x: 520, y: 562, w: 40, h: 20 })) { this.wardrobeHover = "scrollDown"; return; }
          var tabItems = this.getWardrobeTabItems();
          for (var ai = 0; ai < tabItems.length; ai++) {
            var wr = this.getWardrobeItemRect(ai);
            if (wr.y + wr.h < 180 || wr.y > 560) continue;
            if (pointInRect(x, y, wr)) { this.wardrobeHover = ai; break; }
          }
          return;
        }
        if (this.scrapbookOpen) {
          this.scrapbookHover = null;
          if (pointInRect(x, y, panelClose(SCRAPBOOK_PANEL))) this.scrapbookHover = "close";
          /* tabs flat per drawPanelTabs convention (no hover state) */
          return;
        }
        if (this.settingsOpen) {
          this.settingsHover = null;
          if (pointInRect(x, y, panelClose(SETTINGS_PANEL))) { this.settingsHover = "close"; return; }
          if (pointInRect(x, y, { x: SETTINGS_PANEL.x + 160, y: SETTINGS_PANEL.y + 280, w: 220, h: 32 })) {
            this.settingsHover = "resetTutorial";
          }
          return;
        }
        this.hoverKey = null;
        if (pointInRect(x, y, this.gamesButton)) this.hoverKey = "games";
        else if (pointInRect(x, y, this.decorButton)) this.hoverKey = "decor";
        else if (pointInRect(x, y, this.wardrobeButton)) this.hoverKey = "wardrobe";
        else {
          for (const btn of this.modeButtons) {
            if (pointInRect(x, y, btn)) {
              this.hoverKey = btn.key;
              return;
            }
          }
          if (pointInRect(x, y, this.foodBowlHitbox)) this.hoverKey = "foodBowl";
          else if (pointInRect(x, y, this.waterBowlHitbox)) this.hoverKey = "waterBowl";
          else if (pointInRect(x, y, this.lampHitbox)) this.hoverKey = "lamp";
          else if (pointInRect(x, y, this.toyBasketHitbox)) this.hoverKey = "toyBasket";
          else if (pointInRect(x, y, this.windowHitbox)) this.hoverKey = "window";
          else if (pointInRect(x, y, this.backyardDoor)) this.hoverKey = "backyardDoor";
          else if (pointInRect(x, y, this.cameraButton)) this.hoverKey = "camera";
          else if (pointInRect(x, y, this.scrapbookButton)) this.hoverKey = "scrapbook";
          else if (pointInRect(x, y, this.weatherButton)) this.hoverKey = "weather";
          else if (pointInRect(x, y, this.helpButton)) this.hoverKey = "help";
          else if (pointInRect(x, y, this.gearButton)) this.hoverKey = "gear";
          else if (store.decor.petBed && pointInRect(x, y, this.petBedHitbox)) this.hoverKey = "petBed";
          else if (pointInRect(x, y, this.getPetRect("obi"))) this.hoverKey = "obi";
          else if (pointInRect(x, y, this.getPetRect("luna"))) this.hoverKey = "luna";
          else if (this.mode !== "pet" && this.mode !== "brush" && y > 90) this.hoverKey = "playfield";
        }
      }
      getCardRect(displayIndex) {
        return { x: 90, y: 126 + displayIndex * 72, w: 620, h: 62 };
      }
      getDecorItemRect(i) {
        // y shifted from 150 to 170 in Phase B.4 to make room for the tab row at y=130-156
        return { x: 130, y: 170 + i * 88, w: 540, h: 78 };
      }
      getDecorTabItems() {
        return filterDecorByTab(getVisibleDecorItems(), this.decorTab || "room");
      }
      getDecorPageItems() {
        var items = this.getDecorTabItems();
        return items.slice(this.decorPage * 4, this.decorPage * 4 + 4);
      }
      decorPageCount() {
        return Math.max(1, Math.ceil(this.getDecorTabItems().length / 4));
      }
      onMouseMove(x, y) {
        this.updateHover(x, y);
      }
      interactiveAt(x, y) {
        if (this.dedication) return true;
        if (this.menuOpen) {
          for (let vi = 0; vi < Math.min(6, this.gameCards.length - this.menuScroll); vi++) {
            if (pointInRect(x, y, this.getCardRect(vi))) return true;
          }
          if (this.menuScroll > 0 && pointInRect(x, y, { x: W / 2 - 50, y: 106, w: 100, h: 20 })) return true;
          if (this.menuScroll + 6 < this.gameCards.length && pointInRect(x, y, { x: W / 2 - 50, y: 126 + 6 * 72 + 2, w: 100, h: 20 })) return true;
          return pointInRect(x, y, panelClose(MENU_PANEL));
        }
        if (this.decorOpen) {
          const pageItems = this.getDecorPageItems();
          for (let i = 0; i < pageItems.length; i++) {
            if (pointInRect(x, y, this.getDecorItemRect(i))) return true;
          }
          if (pointInRect(x, y, { x: 300, y: 530, w: 40, h: 30 })) return true;
          if (pointInRect(x, y, { x: 460, y: 530, w: 40, h: 30 })) return true;
          return pointInRect(x, y, panelClose("decor"));
        }
        if (this.wardrobeOpen) {
          var tabItems = this.getWardrobeTabItems();
          for (var ai = 0; ai < tabItems.length; ai++) {
            if (pointInRect(x, y, this.getWardrobeItemRect(ai))) return true;
          }
          if (pointInRect(x, y, panelClose(WARDROBE_PANEL))) return true;
          return panelTabHit(WARDROBE_PANEL, WARDROBE_TABS, x, y) != null;
        }
        if (this.scrapbookOpen) {
          if (pointInRect(x, y, panelClose(SCRAPBOOK_PANEL))) return true;
          return panelTabHit(SCRAPBOOK_PANEL, SCRAPBOOK_TABS, x, y) != null;
        }
        if (this.settingsOpen) {
          if (pointInRect(x, y, panelClose(SETTINGS_PANEL))) return true;
          const _sxi = SETTINGS_PANEL.x, _syi = SETTINGS_PANEL.y;
          if (pointInRect(x, y, { x: _sxi + 160, y: _syi + 122, w: 280, h: 14 })) return true;
          if (pointInRect(x, y, { x: _sxi + 160, y: _syi + 172, w: 280, h: 14 })) return true;
          if (pointInRect(x, y, { x: _sxi + 260, y: _syi + 220, w: 80, h: 28 })) return true;
          if (pointInRect(x, y, { x: _sxi + 160, y: _syi + 280, w: 220, h: 32 })) return true;
          return false;
        }
        if (pointInRect(x, y, this.gamesButton)) return true;
        if (pointInRect(x, y, this.decorButton)) return true;
        if (pointInRect(x, y, this.wardrobeButton)) return true;
        if (pointInRect(x, y, this.backyardDoor)) return true;
        if (pointInRect(x, y, this.cameraButton)) return true;
        if (pointInRect(x, y, this.scrapbookButton)) return true;
        if (pointInRect(x, y, this.weatherButton)) return true;
        if (pointInRect(x, y, this.helpButton)) return true;
        if (pointInRect(x, y, this.gearButton)) return true;
        /* V7 — coin and star pills are clickable nav (B.6) — surface for cursor */
        if (this.hubHudRects && this.hubHudRects.coin && pointInRect(x, y, this.hubHudRects.coin)) return true;
        if (this.hubHudRects && this.hubHudRects.star && pointInRect(x, y, this.hubHudRects.star)) return true;
        if (this.modeButtons.some((btn) => pointInRect(x, y, btn))) return true;
        if (pointInRect(x, y, this.foodBowlHitbox)) return true;
        if (pointInRect(x, y, this.waterBowlHitbox)) return true;
        if (pointInRect(x, y, this.lampHitbox)) return true;
        if (pointInRect(x, y, this.toyBasketHitbox)) return true;
        if (pointInRect(x, y, this.windowHitbox)) return true;
        if (store.decor.petBed && pointInRect(x, y, this.petBedHitbox)) return true;
        if (pointInRect(x, y, this.getPetRect("obi")) || pointInRect(x, y, this.getPetRect("luna"))) return true;
        return y > 90 && this.mode !== "pet" && this.mode !== "brush";
      }
      /* C.B7 — shared apply paths so onClick + onKeyDown(Esc) match. */
      _tryDismissAwayStory() {
        if (!this._awayStory) return false;
        if (this._awayStory.phase > 0.5) {
          var bonus = this._awayStory.bonus;
          if (bonus) {
            if (bonus.type === "coins") { addCoins(bonus.amount); this.statusText = "Found " + bonus.amount + " coins!"; }
            else if (bonus.type === "joy") { var p = bonus.pet === "obi" ? this.obi : this.luna; p.joy = clamp(p.joy + bonus.amount, 0, 100); }
            spawnParticleBurst(W / 2, 280, [COLORS.gold, COLORS.softPink], 10, ["star"]);
          }
          this._awayStory = null;
          audio.tinyChime();
        }
        return true; /* swallow the event whether or not phase gate passed */
      }
      _tryClaimDailyGift() {
        if (!this.dailyGift) return false;
        /* post-claim celebration — Esc/click skips the auto-dismiss timer */
        if (this.dailyGift.collected) { this.dailyGift = null; return true; }
        if (this.dailyGift.phase > 0.5) {
          this.dailyGift.collected = true;
          this.dailyGift.phase = 0;
          var cal = store.dailyCalendar;
          var reward = CALENDAR_REWARDS[cal.currentDay % 7];
          var streakMult = 1 + Math.min(2, Math.floor(cal.streak / 7) * 0.5);
          var coinReward = Math.round((reward.coins || 0) * streakMult);
          var rewardText = "";
          if (coinReward > 0) { addCoins(coinReward); rewardText = "+" + coinReward + " coins"; }
          /* C.B3 — bond XP grants now flow through applyBondXPRaw so the
             level-up loop runs (was: raw `+= amount; saveBond()` path
             skipped levels even when crossing thresholds). */
          if (reward.bondXP) {
            awardBondXP("obi", "visit"); awardBondXP("luna", "visit");
            var _bluObi = applyBondXPRaw("obi", reward.bondXP);
            var _bluLuna = applyBondXPRaw("luna", reward.bondXP);
            if (_bluObi > 0) this._bondLevelUp = { pet: "obi", level: _bluObi, timer: 4 };
            else if (_bluLuna > 0) this._bondLevelUp = { pet: "luna", level: _bluLuna, timer: 4 };
            rewardText = "+25 Bond XP for both pets!";
          }
          if (reward.mystery) {
            var self = this;
            var mysteries = [
              { text: " + 25 bonus coins!", effect: function() { addCoins(25); } },
              { text: " + bowls refilled & +15 joy!", effect: function() { this.obi.joy = clamp(this.obi.joy + 15, 0, 100); this.luna.joy = clamp(this.luna.joy + 15, 0, 100); this.foodBowl.fill = 100; this.waterBowl.fill = 100; }.bind(this) },
              { text: " + 50 Bond XP!", effect: function() {
                  var lo = applyBondXPRaw("obi", 50);
                  var ll = applyBondXPRaw("luna", 50);
                  if (lo > 0) self._bondLevelUp = { pet: "obi", level: lo, timer: 4 };
                  else if (ll > 0) self._bondLevelUp = { pet: "luna", level: ll, timer: 4 };
                } }
            ];
            var mystery = mysteries[Math.floor(Math.random() * mysteries.length)];
            mystery.effect();
            rewardText += mystery.text;
          }
          if (streakMult > 1) rewardText += " (" + streakMult + "x streak!)";
          cal.currentDay = (cal.currentDay + 1) % 7;
          cal.streak++;
          cal.lastClaimDate = new Date().toDateString();
          saveJSON("dailyCalendar", cal);
          /* C.B8 — defer lastVisitDate set until claim so a leave-without-claim
             still re-shows the gift on next entry today. */
          var todayStr = new Date().toDateString();
          store.lastVisitDate = todayStr;
          saveJSON("lastVisitDate", todayStr);
          this.dailyGift.rewardText = rewardText;
          this.statusText = "Day " + (reward.day) + " gift: " + rewardText;
          this.statusPulse = 1;
          spawnParticleBurst(W / 2, 280, [COLORS.gold, COLORS.softPink, "#FFF4C0"], 24, ["star", "heart"]);
          audio.combo();
          screenShake(5, 0.3);
        }
        return true;
      }
      onClick(x, y) {
        /* dedication screen - click anywhere to dismiss (after 1.5s) */
        if (this.dedication) {
          /* E.1 — dismiss gate raised to 2.2 so the third line ("For Luna.")
             at phase 1.6 has its full 0.5s fade-in before any click can fire. */
          if (this.dedication.phase >= 2.2 && this.dedication.alpha > 0.5) {
            this.dedication = null;
            var _ddWasFirst = store.firstVisit;
            store.firstVisit = false;
            saveBool("firstVisit", false);
            /* E.4 — stamp firstVisitDate on first-time dismissal so the
               anniversary check on next year's same date can re-show. */
            if (_ddWasFirst && !store.firstVisitDate) {
              var _ddToday = new Date();
              var _ddIso = _ddToday.getFullYear() + "-" + String(_ddToday.getMonth() + 1).padStart(2, "0") + "-" + String(_ddToday.getDate()).padStart(2, "0");
              store.firstVisitDate = _ddIso;
              saveJSON("firstVisitDate", _ddIso);
              store.lastDedicationYear = _ddToday.getFullYear();
              saveNumber("lastDedicationYear", store.lastDedicationYear);
            }
            audio.tinyChime();
            addScrapbookEntry("milestone", "Played Annie's Cozy Day for the first time!", "heart");
            store.stats.totalSessions++;
            saveStats();
          }
          return;
        }
        /* V8 — tutorial overlay: click anywhere dismisses */
        if (this.tutorial) {
          this.tutorial = null;
          store.tutorialSeen = true;
          saveBool("tutorialSeen", true);
          audio.tinyChime();
          return;
        }
        /* away story overlay — click to dismiss */
        if (this._tryDismissAwayStory()) return;
        /* daily calendar overlay — click to claim */
        if (this._tryClaimDailyGift()) return;
        if (this.menuOpen) {
          if (pointInRect(x, y, panelClose(MENU_PANEL))) { audio.menu(); this.menuOpen = false; return; }
          if (this.menuHover === "scrollUp") { this.menuScroll = Math.max(0, this.menuScroll - 1); return; }
          if (this.menuHover === "scrollDown") { this.menuScroll = Math.min(this.gameCards.length - 6, this.menuScroll + 1); return; }
          for (let vi = 0; vi < Math.min(6, this.gameCards.length - this.menuScroll); vi++) {
            if (pointInRect(x, y, this.getCardRect(vi))) {
              audio.menu();
              audio.stopAmbient();
              var cardKey = this.gameCards[this.menuScroll + vi].key;
              var scene = SceneRegistry.create(cardKey);
              /* check if player clicked the challenge star area (top-right of card) */
              var cr = this.getCardRect(vi);
              var cardBestScore = store["best_" + cardKey] || 0;
              var t3Map = { treat: 1400, laser: 1000, cuddle: 90, walk: 800, nap: 1000, bath: 500, sort: 550, pillow: 650, findluna: 500, window: 750, pawstep: 400, wildwand: 500 };
              var cardHas3Stars = cardBestScore >= (t3Map[cardKey] || 9999);
              if (cardHas3Stars && x > cr.x + cr.w - 75 && y < cr.y + 28) {
                scene.challengeMode = true;
              }
              transitionTo(scene);
              return;
            }
          }
          audio.menu();
          this.menuOpen = false;
          return;
        }
        if (this.decorOpen) {
          if (pointInRect(x, y, panelClose("decor"))) { audio.menu(); this.decorOpen = false; this.hoverKey = null; return; }
          /* tab click (Phase B.4) */
          var decorTabKey = panelTabHit(PANEL_STD, DECOR_TABS, x, y);
          if (decorTabKey && decorTabKey !== this.decorTab) {
            this.decorTab = decorTabKey;
            this.decorPage = 0;
            audio.tinyChime();
            return;
          }
          /* page navigation */
          if (pointInRect(x, y, { x: 300, y: 530, w: 40, h: 30 }) && this.decorPage > 0) {
            this.decorPage--; audio.menu(); return;
          }
          if (pointInRect(x, y, { x: 460, y: 530, w: 40, h: 30 }) && this.decorPage < this.decorPageCount() - 1) {
            this.decorPage++; audio.menu(); return;
          }
          const stars = totalStarsEarned();
          const pageItems = this.getDecorPageItems();
          for (let i = 0; i < pageItems.length; i++) {
            if (pointInRect(x, y, this.getDecorItemRect(i))) {
              const item = pageItems[i];
              /* check all unlock conditions */
              if (!canUnlockDecorItem(item)) {
                audio.miss();
                if (item.achievementUnlock) this.statusText = "Unlock the " + item.achievementUnlock + " achievement first!";
                else if (item.streakUnlock) this.statusText = "Need a " + item.streakUnlock + "-day care streak!";
                else if (item.stars > 0) this.statusText = "Need " + item.stars + " stars!";
                else if (item.tier && !canAccessTier(item.tier)) this.statusText = "Tier " + item.tier + " locked!";
                else if (item.price && !isDecorPurchased(item)) this.statusText = "Purchase this item first!";
                this.statusPulse = 1; return;
              }
              /* coin purchase for new items */
              if (item.price && !isDecorPurchased(item)) {
                if (store.coins < item.price) {
                  audio.miss(); this.statusText = "Need " + item.price + " coins!"; this.statusPulse = 1; return;
                }
                addCoins(-item.price);
                store.decorPurchased.push(item.key);
                saveJSON("decorPurchased", store.decorPurchased);
                if (item.isUpgrade && store.cozyUpgrades.indexOf(item.key) < 0) {
                  store.cozyUpgrades.push(item.key);
                  saveJSON("cozyUpgrades", store.cozyUpgrades);
                }
                audio.combo();
                this.statusText = "Bought " + item.name + "!";
                this.statusPulse = 1;
              }
              /* toggle/cycle the item */
              if (item.type === "toggle") {
                store.decor[item.key] = !store.decor[item.key];
              } else if (item.type === "cycle") {
                store.decor[item.key] = (store.decor[item.key] + 1) % (item.max + 1);
              }
              saveDecor();
              audio.tinyChime();
              sceneCache.livingRoomBase = null;
              if (item.key === "timeOfDay") audio.setMusicMood();
              return;
            }
          }
          audio.menu();
          this.decorOpen = false;
          this.hoverKey = null;
          return;
        }
        if (this.wardrobeOpen) {
          if (pointInRect(x, y, panelClose(WARDROBE_PANEL))) { audio.menu(); this.wardrobeOpen = false; this.hoverKey = null; return; }
          /* tab clicks */
          var wTabKey = panelTabHit(WARDROBE_PANEL, WARDROBE_TABS, x, y);
          if (wTabKey && wTabKey !== this.wardrobeTab) {
            this.wardrobeTab = wTabKey;
            this.wardrobeScrollOffset = 0;
            audio.tinyChime();
            return;
          }
          /* scroll arrow clicks (D.4 — relocated to right column) */
          var wMaxScroll = this.wardrobeMaxScroll();
          if (wMaxScroll > 0) {
            if (this.wardrobeScrollOffset > 0 && pointInRect(x, y, { x: 520, y: 175, w: 40, h: 20 })) {
              this.wardrobeScrollOffset = Math.max(0, this.wardrobeScrollOffset - 62);
              return;
            }
            if (this.wardrobeScrollOffset < wMaxScroll && pointInRect(x, y, { x: 520, y: 562, w: 40, h: 20 })) {
              this.wardrobeScrollOffset = Math.min(wMaxScroll, this.wardrobeScrollOffset + 62);
              return;
            }
          }
          /* item clicks */
          var tabItems = this.getWardrobeTabItems();
          var pet = this.wardrobeTab;
          for (var ai = 0; ai < tabItems.length; ai++) {
            var wr = this.getWardrobeItemRect(ai);
            if (wr.y + wr.h < 165 || wr.y > 565) continue;
            if (pointInRect(x, y, wr)) {
              var acc = tabItems[ai];
              var owned = store.wardrobe.owned.indexOf(acc.key) >= 0;
              if (!owned) {
                /* check unlock conditions */
                if (!canUnlockAccessory(acc)) {
                  audio.miss();
                  if (acc.tier && !canAccessTier(acc.tier)) {
                    if (acc.tier === 4) {
                      var s = totalStarsEarned(), ak = 0; for (var tk in store.achievements) { if (store.achievements[tk]) ak++; }
                      this.statusText = "Tier 4: " + (s>=30?"\u2713":"✗") + " 30 stars  " + (ak>=14?"\u2713":"✗") + " 14 achievements  " + (store.careStreak.count>=30?"\u2713":"✗") + " 30-day streak";
                    } else { this.statusText = "Tier " + acc.tier + " locked — earn more stars or streaks!"; }
                  }
                  else if (acc.achievementUnlock) this.statusText = "Unlock the required achievements first!";
                  else if (acc.starUnlock) this.statusText = "Need " + acc.starUnlock + " stars!";
                  else this.statusText = "Can't unlock " + acc.name + " yet!";
                  this.statusPulse = 1;
                  return;
                }
                if (acc.price > 0 && store.coins < acc.price) {
                  audio.miss();
                  this.statusText = "Not enough coins for " + acc.name + "!";
                  this.statusPulse = 1;
                  return;
                }
                if (acc.price > 0) addCoins(-acc.price);
                store.wardrobe.owned.push(acc.key);
                store.wardrobe.equipped[pet][acc.slot] = acc.key;
                saveWardrobe();
                audio.combo();
                this.statusText = "Bought " + acc.name + "!";
                this.statusPulse = 1;
                if (store.wardrobe.owned.length === 1) {
                  addScrapbookEntry("milestone", "Bought " + acc.name + " — first accessory!", "star");
                }
                if (store.wardrobe.owned.length >= 10 && !store.achievements.fashionista) {
                  store.achievements.fashionista = true; saveAchievements();
                  var faInfo = ACHIEVEMENTS.find(function(a) { return a.key === "fashionista"; });
                  if (faInfo && faInfo.coinBonus) addCoins(faInfo.coinBonus);
                  addScrapbookEntry("achievement", "Fashionista unlocked!", "star");
                }
                this.trackWeeklyChallenge("itemsBought", 1);
              } else {
                /* toggle equip */
                if (store.wardrobe.equipped[pet][acc.slot] === acc.key) {
                  store.wardrobe.equipped[pet][acc.slot] = null;
                } else {
                  store.wardrobe.equipped[pet][acc.slot] = acc.key;
                }
                saveWardrobe();
                audio.tinyChime();
              }
              return;
            }
          }
          audio.menu();
          this.wardrobeOpen = false;
          return;
        }
        if (this.settingsOpen) {
          if (pointInRect(x, y, panelClose(SETTINGS_PANEL))) {
            audio.menu();
            this.settingsOpen = false;
            return;
          }
          const _sxc = SETTINGS_PANEL.x, _syc = SETTINGS_PANEL.y;
          const _trkXc = _sxc + 160, _trkWc = 280;
          /* Music track click */
          if (pointInRect(x, y, { x: _trkXc, y: _syc + 122, w: _trkWc, h: 14 })) {
            store.settings.music = clamp((x - _trkXc) / _trkWc, 0, 1);
            saveJSON("settings", store.settings);
            audio.setVolume(store.settings.music, store.settings.sfx);
            return;
          }
          /* SFX track click */
          if (pointInRect(x, y, { x: _trkXc, y: _syc + 172, w: _trkWc, h: 14 })) {
            store.settings.sfx = clamp((x - _trkXc) / _trkWc, 0, 1);
            saveJSON("settings", store.settings);
            audio.setVolume(store.settings.music, store.settings.sfx);
            audio.tinyChime();
            return;
          }
          /* Reduced motion toggle */
          if (pointInRect(x, y, { x: _trkXc + 100, y: _syc + 220, w: 80, h: 28 })) {
            store.settings.reducedMotion = !store.settings.reducedMotion;
            saveJSON("settings", store.settings);
            audio.tinyChime();
            return;
          }
          /* Reset tutorial */
          if (pointInRect(x, y, { x: _sxc + 160, y: _syc + 280, w: 220, h: 32 })) {
            store.tutorialSeen = false;
            saveBool("tutorialSeen", false);
            this.tutorial = { phase: 0 };
            this.settingsOpen = false;
            audio.tinyChime();
            return;
          }
          /* click outside dismisses */
          if (!pointInRect(x, y, SETTINGS_PANEL)) { this.settingsOpen = false; return; }
          return;
        }
        if (this.scrapbookOpen) {
          if (pointInRect(x, y, panelClose(SCRAPBOOK_PANEL))) { audio.menu(); this.scrapbookOpen = false; this.hoverKey = null; return; }
          var sbTabKey = panelTabHit(SCRAPBOOK_PANEL, SCRAPBOOK_TABS, x, y);
          if (sbTabKey && sbTabKey !== this.scrapbookTab) {
            this.scrapbookTab = sbTabKey;
            if (sbTabKey === "photos") this.scrapbookPhotoScroll = 0;
            else if (sbTabKey === "milestones") this.scrapbookMilestoneScroll = 0;
            audio.tinyChime();
            return;
          }
          /* scrapbook scroll arrows */
          if (pointInRect(x, y, { x: 380, y: 136, w: 40, h: 20 })) {
            if (this.scrapbookTab === "photos") { this.scrapbookPhotoScroll = Math.max(0, this.scrapbookPhotoScroll - 140); return; }
            if (this.scrapbookTab === "milestones") { this.scrapbookMilestoneScroll = Math.max(0, this.scrapbookMilestoneScroll - 1); return; }
          }
          if (pointInRect(x, y, { x: 380, y: 528, w: 40, h: 20 })) {
            if (this.scrapbookTab === "photos") { this.scrapbookPhotoScroll += 140; return; }
            if (this.scrapbookTab === "milestones") { this.scrapbookMilestoneScroll += 1; return; }
          }
          audio.menu();
          this.scrapbookOpen = false;
          return;
        }
        /* Phase B.6 — coin/star HUD pills are clickable nav.
           Star pill → Game Menu (natural place to see X/33 stars).
           Coin pill → Decor panel (where coins are spent). */
        if (this.hubHudRects && this.hubHudRects.star && pointInRect(x, y, this.hubHudRects.star)) {
          audio.menu();
          this.decorOpen = false; this.wardrobeOpen = false; this.scrapbookOpen = false;
          this.menuOpen = true;
          this.menuFade = 0;
          this.menuScroll = 0;
          return;
        }
        if (this.hubHudRects && this.hubHudRects.coin && pointInRect(x, y, this.hubHudRects.coin)) {
          audio.menu();
          this.menuOpen = false; this.wardrobeOpen = false; this.scrapbookOpen = false;
          this.decorOpen = true;
          this.decorFade = 0;
          return;
        }
        if (pointInRect(x, y, this.gamesButton)) {
          audio.menu();
          this.decorOpen = false; this.wardrobeOpen = false; this.scrapbookOpen = false;
          this.menuOpen = true;
          this.menuFade = 0;
          this.menuScroll = 0;
          return;
        }
        if (pointInRect(x, y, this.decorButton)) {
          audio.menu();
          this.menuOpen = false; this.wardrobeOpen = false; this.scrapbookOpen = false;
          this.decorOpen = true;
          this.decorFade = 0;
          return;
        }
        if (pointInRect(x, y, this.wardrobeButton)) {
          audio.menu();
          this.menuOpen = false; this.decorOpen = false; this.scrapbookOpen = false;
          this.wardrobeOpen = true;
          this.wardrobeFade = 0;
          return;
        }
        for (const btn of this.modeButtons) {
          if (pointInRect(x, y, btn)) {
            audio.menu();
            this.setMode(btn.key);
            return;
          }
        }
        /* camera button */
        if (pointInRect(x, y, this.cameraButton)) {
          this.capturePhoto();
          return;
        }
        /* scrapbook button */
        if (pointInRect(x, y, this.scrapbookButton)) {
          audio.menu();
          this.menuOpen = false; this.decorOpen = false; this.wardrobeOpen = false;
          this.scrapbookOpen = true;
          this.scrapbookFade = 0;
          return;
        }
        /* F.3 — weather chip → opens scrapbook Goals tab (where the
           weather-driven scrapbook goals like "Rainy Day" live). */
        if (pointInRect(x, y, this.weatherButton)) {
          audio.menu();
          this.menuOpen = false; this.decorOpen = false; this.wardrobeOpen = false;
          this.scrapbookOpen = true;
          this.scrapbookFade = 0;
          this.scrapbookTab = "goals";
          return;
        }
        /* V8 — help chip re-opens tutorial overlay */
        if (pointInRect(x, y, this.helpButton)) {
          audio.menu();
          this.tutorial = { phase: 0 };
          return;
        }
        /* V9 — gear chip opens settings panel */
        if (pointInRect(x, y, this.gearButton)) {
          audio.menu();
          this.menuOpen = false; this.decorOpen = false; this.wardrobeOpen = false; this.scrapbookOpen = false;
          this.settingsOpen = true;
          return;
        }
        /* clickable ambient events */
        if (this.ambientEvent && !this.ambientEvent.data.interacted) {
          if (this.ambientEvent.type === "butterfly") {
            for (var bi = this.ambientEvent.data.length - 1; bi >= 0; bi--) {
              var bf = this.ambientEvent.data[bi];
              if (dist(x, y, bf.x, bf.y) < 20) {
                this.earnCoins(1);
                this.addFloatingText("+1 coin!", bf.x, bf.y - 15, COLORS.gold);
                this.ambientEvent.data.splice(bi, 1);
                audio.tinyChime();
                if (this.ambientEvent.data.length === 0) { this.ambientEvent = null; this.ambientEventCooldown = rand(60, 120); }
                break;
              }
            }
          } else if (this.ambientEvent.type === "bird") {
            for (var bi = this.ambientEvent.data.length - 1; bi >= 0; bi--) {
              var bd = this.ambientEvent.data[bi];
              if (dist(x, y, bd.x, bd.y) < 20) {
                this.earnCoins(1);
                this.addFloatingText("+1 coin!", bd.x, bd.y - 15, COLORS.gold);
                this.ambientEvent.data.splice(bi, 1);
                audio.tinyChime();
                if (this.ambientEvent.data.length === 0) { this.ambientEvent = null; this.ambientEventCooldown = rand(60, 120); }
                break;
              }
            }
          } else if (this.ambientEvent.type === "rain") {
            if (pointInRect(x, y, this.windowHitbox)) {
              this.obi.joy = clamp(this.obi.joy + 2, 0, 100);
              this.luna.joy = clamp(this.luna.joy + 2, 0, 100);
              this.statusText = "So cozy listening to the rain together!";
              this.statusPulse = 1;
              this.addFloatingText("+2 joy!", 126, 120, COLORS.softPink);
              spawnParticleBurst(126, 120, [COLORS.softPink, "#87CEEB"], 6, ["heart"]);
              audio.tinyChime();
              this.ambientEvent.data.interacted = true;
            }
          } else if (this.ambientEvent.type === "package") {
            var pk = this.ambientEvent.data;
            if (dist(x, y, pk.x, pk.y) < 40) {
              this.earnCoins(5);
              this.addFloatingText("+5 coins!", pk.x, pk.y - 20, COLORS.gold);
              this.statusText = "Collected the package!";
              this.statusPulse = 1;
              audio.combo();
              spawnParticleBurst(pk.x, pk.y, [COLORS.gold, "#FFF4C0"], 8, ["star"]);
              this.ambientEvent = null;
              this.ambientEventCooldown = rand(60, 120);
            }
          }
        }
        /* visitor click interaction */
        if (this.ambientEvent && this.ambientEvent.type === "visitor" && !this.ambientEvent.data.interacted) {
          var v = this.ambientEvent.data.visitor;
          if (dist(x, y, v.drawX, v.drawY) < 40) {
            this.ambientEvent.data.interacted = true;
            if (v.coinReward) {
              this.earnCoins(v.coinReward);
              this.addFloatingText("+" + v.coinReward + " coins!", v.drawX, v.drawY - 30, COLORS.gold);
            }
            if (v.joyEffect) {
              if (v.joyEffect.obi) this.obi.joy = clamp(this.obi.joy + v.joyEffect.obi, 0, 100);
              if (v.joyEffect.luna) this.luna.joy = clamp(this.luna.joy + v.joyEffect.luna, 0, 100);
              this.addFloatingText("+" + (v.joyEffect.obi || 0) + " Obi, +" + (v.joyEffect.luna || 0) + " Luna joy", v.drawX, v.drawY - 20, COLORS.softPink);
            }
            this.statusText = "Thanks for visiting!";
            this.statusPulse = 1;
            audio.tinyChime();
          }
        }
        /* interactive bookshelf — Annie reads a story */
        if (x > 600 && x < 740 && y > 100 && y < 350 && (!this._bookCooldown || this._bookCooldown <= 0)) {
          this._bookCooldown = 30;
          this.obi.joy = clamp(this.obi.joy + 3, 0, 100);
          this.luna.joy = clamp(this.luna.joy + 3, 0, 100);
          var stories = ["Annie reads a story about a brave little dog.", "Annie reads a cat adventure story. Luna's ears perk up!", "Story time! Both pets gather around Annie.", "Annie reads aloud. Obi's tail wags to the rhythm."];
          this.statusText = stories[Math.floor(Math.random() * stories.length)];
          this.statusPulse = 1;
          this.addFloatingText("+3 joy!", 670, 200, COLORS.softPink);
          spawnParticleBurst(670, 200, [COLORS.softPink, "#FFF4C0"], 5, ["heart", "star"]);
          audio.tinyChime();
        }
        /* interactive rug — Luna kneads */
        if (this.luna.perch === "floor" && x > 300 && x < 500 && y > 430 && y < 500 && (!this._rugCooldown || this._rugCooldown <= 0)) {
          this._rugCooldown = 20;
          this.luna.joy = clamp(this.luna.joy + 2, 0, 100);
          this.luna.targetX = 400;
          this.statusText = "Luna kneads the rug. Making biscuits!";
          this.statusPulse = 0.5;
          this.addFloatingText("+2 Luna joy", 400, 460, COLORS.softPink);
          spawnParticleBurst(400, 470, [COLORS.softPink], 3, ["heart"]);
          audio.tinyChime();
        }
        /* backyard door */
        if (pointInRect(x, y, this.backyardDoor)) {
          audio.menu();
          store.pet_obi_joy = this.obi.joy;
          store.pet_luna_joy = this.luna.joy;
          saveNumber("pet_obi_joy", this.obi.joy);
          saveNumber("pet_luna_joy", this.luna.joy);
          this.saveSessionMemory();
          transitionTo(SceneRegistry.create("backyard"));
          return;
        }
        /* bowl refills */
        if (!this.menuOpen && !this.decorOpen && !this.wardrobeOpen && !this.scrapbookOpen) {
          if (pointInRect(x, y, this.foodBowlHitbox)) {
            this.foodBowl.fill = 100;
            this.foodBowl.lastFill = Date.now();
            store.pet_food_fill = 100;
            store.pet_food_lastFill = this.foodBowl.lastFill;
            saveNumber("pet_food_fill", 100);
            saveNumber("pet_food_lastFill", this.foodBowl.lastFill);
            this.statusText = "Annie filled the food bowl!";
            this.statusPulse = 0.6;
            spawnParticleBurst(this.foodBowl.x, this.foodBowl.y - 10, ["#D2A87C", COLORS.brown], 6, ["star"]);
            audio.tinyChime();
            this.checkBubbleReward("obi", "feed");
            this.checkBubbleReward("luna", "feed");
            awardBondXP("obi", "feed"); awardBondXP("luna", "feed");
            store.stats.totalBowlsFilled++;
            saveStats();
            if (store.stats.totalBowlsFilled >= 50 && !store.achievements.wellFed) {
              store.achievements.wellFed = true; saveAchievements();
              var wfInfo = ACHIEVEMENTS.find(function(a) { return a.key === "wellFed"; });
              if (wfInfo && wfInfo.coinBonus) addCoins(wfInfo.coinBonus);
              addScrapbookEntry("achievement", "Well Fed unlocked!", "star");
            }
            return;
          }
          if (pointInRect(x, y, this.waterBowlHitbox)) {
            this.waterBowl.fill = 100;
            this.waterBowl.lastFill = Date.now();
            store.pet_water_fill = 100;
            store.pet_water_lastFill = this.waterBowl.lastFill;
            saveNumber("pet_water_fill", 100);
            saveNumber("pet_water_lastFill", this.waterBowl.lastFill);
            store.stats.totalBowlsFilled++;
            saveStats();
            this.statusText = "Annie refilled the water!";
            this.statusPulse = 0.6;
            spawnParticleBurst(this.waterBowl.x, this.waterBowl.y - 10, ["#6CB4EE", "#A0D4FF"], 6, ["star"]);
            audio.tinyChime();
            awardBondXP("obi", "water"); awardBondXP("luna", "water");
            this.checkBubbleReward("obi", "water");
            this.checkBubbleReward("luna", "water");
            return;
          }
          /* lamp toggle */
          if (pointInRect(x, y, this.lampHitbox)) {
            store.decor.lampOn = !store.decor.lampOn;
            saveDecor();
            audio.tinyChime();
            this.statusText = store.decor.lampOn ? "Annie turned the lamp on." : "Annie turned the lamp off.";
            this.statusPulse = 0.4;
            return;
          }
          /* window click — observe outside, give small joy + hint at backyard */
          if (pointInRect(x, y, this.windowHitbox)) {
            const tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
            let msg = "The pets perk up looking outside.";
            if (this.ambientEvent && this.ambientEvent.type === "butterfly") msg = "Luna is fascinated by the butterflies!";
            else if (this.ambientEvent && this.ambientEvent.type === "bird") msg = "Obi watches the birds intently!";
            else if (this.ambientEvent && this.ambientEvent.type === "rain") msg = "Listen to the rain... so cozy in here.";
            else if (tod === 3) msg = "The stars are beautiful tonight.";
            else if (tod === 0) msg = "What a lovely sunrise! The pets want to go outside.";
            else msg = "The backyard looks nice today! Try the door on the right.";
            this.obi.joy = clamp(this.obi.joy + 1, 0, 100);
            this.luna.joy = clamp(this.luna.joy + 1, 0, 100);
            this.statusText = msg;
            this.statusPulse = 0.5;
            spawnParticleBurst(126, 130, ["#FFF4C0", COLORS.gold, "#87CEEB"], 5, ["star"]);
            audio.tinyChime();
            return;
          }
          /* pet bed click */
          if (store.decor.petBed && pointInRect(x, y, this.petBedHitbox)) {
            const nearest = x < W / 2 ? "obi" : "luna";
            const pet = nearest === "obi" ? this.obi : this.luna;
            if (nearest === "obi") {
              pet.targetX = 520; pet.targetY = 468;
              pet.sleepy = true;
              pet.joy = clamp(pet.joy + 5, 0, 100);
              this.statusText = "Obi settled into his cozy sofa!";
              spawnParticleBurst(520, 458, [COLORS.softPink], 3, ["heart"]);
            } else {
              this.luna.perch = "floor";
              pet.targetX = 520; pet.targetY = 468;
              pet.joy = clamp(pet.joy + 5, 0, 100);
              this.statusText = "Luna claimed the sofa. Obviously.";
            }
            this.statusPulse = 0.4;
            audio.tinyChime();
            return;
          }
          /* toy basket shortcut */
          if (pointInRect(x, y, this.toyBasketHitbox)) {
            const nearest = x < W / 2 ? "obi" : "luna";
            const petObj = nearest === "obi" ? this.obi : this.luna;
            const py = nearest === "luna" && this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : petObj.y;
            this.throwToy(petObj.x, py);
            this.statusText = "Annie grabbed a toy from the basket!";
            this.statusPulse = 0.5;
            spawnParticleBurst(265, 388, [COLORS.gold], 4, ["star"]);
            return;
          }
        }
        this.idleTime = 0;
        if (this.mode === "pet") {
          const target = this.pickPetForPoint(x, y);
          if (pointInRect(x, y, this.getPetRect(target))) {
            const zone = this.getPetZone(target, x, y);
            if (target === "obi") {
              const msgs = { head: "Obi loves ear scratches!", body: "Good boy, Obi!", belly: "Belly rubs make Obi's day!" };
              const floats = { head: "Ear scratches!", body: "Good boy!", belly: "Belly rubs!" };
              this.rewardPet("obi", zone === "belly" ? 9 : zone === "head" ? 8 : 6, "pet", x, y);
              this.statusText = msgs[zone];
              this.addFloatingText(floats[zone], x, y - 20, COLORS.softPink);
            } else {
              if (zone === "belly" && Math.random() < 0.35) {
                this.luna.pawBat = Math.max(this.luna.pawBat, 0.7);
                this.statusText = "Luna swats! That's her belly — off limits!";
                this.statusPulse = 1;
                this.luna.joy = clamp(this.luna.joy - 2, 0, 100);
                audio.miss();
                this.addFloatingText("Luna swats!", x, y - 20, COLORS.warmRed);
              } else {
                const msgs = { head: "Luna leans into the chin scratch.", body: "Luna purrs softly.", belly: "Luna... actually let you touch her belly!" };
                const floats = { head: "Chin scratch!", body: "Purrs...", belly: "Belly touch!" };
                this.rewardPet("luna", zone === "head" ? 8 : 6, "pet", x, y);
                this.statusText = msgs[zone];
                this.addFloatingText(floats[zone], x, y - 20, COLORS.softPink);
              }
            }
          }
        } else if (this.mode === "treat") {
          this.tossTreat(x, y);
        } else if (this.mode === "toy") {
          this.throwToy(x, y);
        } else if (this.mode === "brush") {
          const target = this.pickPetForPoint(x, y);
          if (pointInRect(x, y, this.getPetRect(target))) {
            this.rewardPet(target, 10, "brush", x, y);
            if (target === "obi") {
              this.obi.shakeTimer = Math.max(this.obi.shakeTimer, 1.0);
            }
            spawnParticleBurst(x, y - 24, ["#FFF4C0", "#FFEAA7", COLORS.gold], 8, ["star"]);
            this.statusText = this.petName(target) + " sparkles after a good brushing!";
            this.statusPulse = 1;
            audio.tinyChime();
          }
        }
        /* dismiss tooltip after interaction */
        this.hoverKey = null;
        this.tooltip = null;
        this.tooltipAlpha = 0;
      }
      onKeyDown(key) {
        if (key === "Escape") {
          if (this.dedication && this.dedication.phase < 2.2) return; /* E.1 — match click gate */
          /* V8 — Esc on tutorial dismisses just like click */
          if (this.tutorial) {
            this.tutorial = null;
            store.tutorialSeen = true;
            saveBool("tutorialSeen", true);
            audio.tinyChime();
            return;
          }
          /* C.B7 — Esc applies/claims overlays before any panel cascade or exit. */
          if (this._awayStory) { this._tryDismissAwayStory(); return; }
          if (this.dailyGift) { this._tryClaimDailyGift(); return; }
          audio.menu();
          if (this.dedication) {
            var _eddWasFirst = store.firstVisit;
            this.dedication = null;
            store.firstVisit = false;
            saveBool("firstVisit", false);
            /* E.4 — stamp firstVisitDate (mirrors click-dismiss path). */
            if (_eddWasFirst && !store.firstVisitDate) {
              var _eddToday = new Date();
              var _eddIso = _eddToday.getFullYear() + "-" + String(_eddToday.getMonth() + 1).padStart(2, "0") + "-" + String(_eddToday.getDate()).padStart(2, "0");
              store.firstVisitDate = _eddIso;
              saveJSON("firstVisitDate", _eddIso);
              store.lastDedicationYear = _eddToday.getFullYear();
              saveNumber("lastDedicationYear", store.lastDedicationYear);
            }
          }
          else if (this.menuOpen) { this.menuOpen = false; }
          else if (this.decorOpen) { this.decorOpen = false; }
          else if (this.wardrobeOpen) { this.wardrobeOpen = false; }
          else if (this.scrapbookOpen) { this.scrapbookOpen = false; }
          else if (this.settingsOpen) { this.settingsOpen = false; }
          else { audio.stopAmbient(); transitionTo(SceneRegistry.create("title")); }
        }
        if (!this.menuOpen && !this.decorOpen && !this.wardrobeOpen && !this.scrapbookOpen && !this.dedication) {
          if (key === "1" || key === "p") { audio.menu(); this.setMode("pet"); }
          else if (key === "2" || key === "t") { audio.menu(); this.setMode("treat"); }
          else if (key === "3" || key === "y") { audio.menu(); this.setMode("toy"); }
          else if (key === "4" || key === "b") { audio.menu(); this.setMode("brush"); }
          else if (key === "g") { audio.menu(); this.menuOpen = true; this.menuFade = 0; this.menuScroll = 0; }
          else if (key === "d") { audio.menu(); this.decorOpen = true; this.decorFade = 0; }
        }
      }
      tossTreat(x, y) {
        if (this.treats.length >= 2) return;
        const pet = this.pickPetForPoint(x, y);
        const targetX = clamp(x, pet === "obi" ? 86 : 438, pet === "obi" ? 362 : 734);
        const targetY = clamp(y, 168, pet === "obi" ? 476 : (this.luna.perch !== "floor" ? 314 : 476));
        this.treats.push({
          x: 400, y: 234, startX: 400, startY: 234, targetX, targetY,
          t: 0, state: "air", pet, life: 5
        });
        this.statusText = "Annie tossed a treat toward " + this.petName(pet) + ".";
        this.statusPulse = 1;
        if (pet === "obi") {
          this.obi.targetX = targetX;
          this.obi.targetY = this.obi.homeY;
          this.obi.sleepy = false;
        } else {
          this.luna.perch = "floor";
          this.luna.targetX = clamp(targetX, 474, 710);
          this.luna.targetY = this.luna.floorY;
        }
      }
      throwToy(x, y) {
        if (this.toy) return;
        const pet = this.pickPetForPoint(x, y);
        if (pet === "obi") {
          const targetX = clamp(x, 100, 340);
          this.toy = {
            type: "ball", pet: "obi", x: 400, y: 236, startX: 400, startY: 236,
            targetX, targetY: 452, t: 0, state: "air", life: 8
          };
          this.obi.targetX = targetX;
          this.obi.targetY = this.obi.homeY;
          this.obi.sleepy = false;
          this.statusText = "Obi spotted the ball and took off after it.";
        } else {
          this.luna.perch = "floor";
          this.toy = {
            type: "yarn", pet: "luna", x: clamp(x, 458, 728), y: clamp(y, 172, 458),
            homeX: clamp(x, 458, 728), homeY: clamp(y, 172, 458), state: "tease", life: 7, phase: 0
          };
          this.luna.targetX = clamp(this.toy.x, 478, 710);
          this.luna.targetY = this.luna.floorY;
          this.statusText = "Luna locked onto the yarn ball!";
        }
        this.statusPulse = 1;
      }
      updateTreats(dt) {
        for (let i = this.treats.length - 1; i >= 0; i--) {
          const t = this.treats[i];
          if (t.state === "air") {
            t.t = clamp(t.t + dt * 1.8, 0, 1);
            t.x = lerp(t.startX, t.targetX, t.t);
            t.y = lerp(t.startY, t.targetY, t.t) - Math.sin(t.t * Math.PI) * 84;
            if (t.t >= 1) {
              t.state = "ground";
              t.x = t.targetX;
              t.y = t.targetY;
            }
          } else {
            t.life -= dt;
            const px = t.pet === "obi" ? this.obi.x : this.luna.x;
            const py = t.pet === "obi" ? this.obi.y - 22 : (this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y - 8 : this.luna.y - 18);
            if (dist(px, py, t.x, t.y) < 46) {
              this.rewardPet(t.pet, 10, "treat", t.x, t.y);
              this.treats.splice(i, 1);
              continue;
            }
            if (t.life <= 0) this.treats.splice(i, 1);
          }
        }
      }
      updateToy(dt) {
        if (!this.toy) return;
        if (this.toy.type === "ball") {
          if (this.toy.state === "air") {
            this.toy.t = clamp(this.toy.t + dt * 1.9, 0, 1);
            this.toy.x = lerp(this.toy.startX, this.toy.targetX, this.toy.t);
            this.toy.y = lerp(this.toy.startY, this.toy.targetY, this.toy.t) - Math.sin(this.toy.t * Math.PI) * 72;
            if (this.toy.t >= 1) {
              this.toy.state = "ground";
              this.toy.x = this.toy.targetX;
              this.toy.y = this.toy.targetY;
            }
          } else if (this.toy.state === "ground") {
            if (dist(this.obi.x, this.obi.y - 12, this.toy.x, this.toy.y) < 48) {
              this.toy.state = "return";
              this.obi.targetX = this.obi.homeX;
              this.obi.targetY = this.obi.homeY;
            }
          } else if (this.toy.state === "return") {
            this.toy.x = this.obi.x + this.obi.facing * 12;
            this.toy.y = this.obi.y - 30;
            if (dist(this.obi.x, this.obi.y, this.obi.homeX, this.obi.homeY) < 14) {
              this.rewardPet("obi", 12, "toy", this.obi.x, this.obi.y - 20);
              this.toy = null;
            }
          }
          if (this.toy) this.toy.life -= dt;
          if (this.toy && this.toy.life <= 0) this.toy = null;
        } else {
          this.toy.life -= dt;
          this.toy.phase += dt * 4.5;
          this.toy.x = this.toy.homeX + Math.sin(this.toy.phase) * 18;
          this.toy.y = this.toy.homeY + Math.cos(this.toy.phase * 1.35) * 10;
          this.luna.wiggle = Math.max(this.luna.wiggle, 0.28 + 0.16 * Math.sin(this.toy.phase * 2));
          if (dist(this.luna.x, this.luna.y - 18, this.toy.x, this.toy.y) < 74) {
            this.luna.pounce = Math.max(this.luna.pounce, 0.55);
            this.luna.pawBat = Math.max(this.luna.pawBat, 0.45);
          }
          if (dist(this.luna.x, this.luna.y - 18, this.toy.x, this.toy.y) < 46) {
            this.rewardPet("luna", 12, "toy", this.toy.x, this.toy.y);
            this.toy = null;
          } else if (this.toy.life <= 0) {
            this.toy = null;
            this.statusText = "The yarn ball rolled away. Luna pretends not to care.";
            this.statusPulse = 1;
          }
        }
      }
      updateAnnie(dt) {
        const a = this.annie;
        a.poseTimer -= dt;
        a.stateTimer -= dt;

        /* smooth Y interpolation toward target */
        const dy = a.targetY - a.y;
        if (Math.abs(dy) > 1) {
          a.y += Math.sign(dy) * Math.min(Math.abs(dy), 80 * dt);
        } else {
          a.y = a.targetY;
        }

        /* reactive poses override idle behavior */
        if (this.obi.happyTimer > 0.1 || this.luna.happyTimer > 0.1) {
          a.pose = "cheer";
          a.poseTimer = 1.5;
          a.facing = this.obi.happyTimer > this.luna.happyTimer ? -1 : 1;
        } else if (this.mode === "brush" && this.obi.shakeTimer > 0) {
          a.pose = "laugh";
          a.poseTimer = 1;
        } else if (this.petInteraction.active) {
          a.pose = "laugh";
          a.poseTimer = 0.5;
          a.facing = this.obi.x < 400 ? -1 : 1;
        } else if (a.poseTimer <= 0) {
          /* autonomous state machine */
          if (a.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.22 && a.state !== "walkToObi" && a.state !== "walkToLuna") {
              a.state = "walkToObi";
              a.stateTimer = rand(3, 5);
              a.targetY = a.floorY;
            } else if (r < 0.44 && a.state !== "walkToLuna" && a.state !== "walkToObi") {
              a.state = "walkToLuna";
              a.stateTimer = rand(3, 5);
              a.targetY = a.floorY;
            } else if (r < 0.56) {
              a.state = "wander";
              a.stateTimer = rand(2.5, 4);
              a.targetX = rand(180, 560);
              a.targetY = a.floorY;
            } else if (r < 0.7) {
              a.state = "kneel";
              a.stateTimer = rand(2, 4);
              a.pose = "kneel";
              a.poseTimer = a.stateTimer;
              a.targetY = a.floorY;
            } else if (r < 0.85) {
              a.state = "returnHome";
              a.stateTimer = rand(3, 5);
              a.targetY = a.homeY;
            } else {
              a.state = "idle";
              a.stateTimer = rand(3, 5);
              a.pose = Math.abs(a.y - a.homeY) < 10 ? "sit" : "idle";
              if (a.pose === "sit") a.facing = 1;
              a.poseTimer = a.stateTimer;
            }
          }

          /* movement */
          if (a.state === "walkToObi") {
            const tx = this.obi.x + 50;
            a.pose = "walk";
            a.poseTimer = 0.5;
            a.facing = tx < a.x ? -1 : 1;
            if (Math.abs(a.x - tx) > 14 || Math.abs(a.y - a.floorY) > 10) {
              a.x += Math.sign(tx - a.x) * 60 * dt;
            } else {
              a.state = "kneel";
              a.stateTimer = rand(2.5, 4);
              a.pose = "kneel";
              a.poseTimer = a.stateTimer;
              a.facing = this.obi.x < a.x ? -1 : 1;
              this.statusText = "Annie kneels down to check on Obi.";
              this.statusPulse = 0.3;
              spawnParticleBurst(this.obi.x, this.obi.y - 30, [COLORS.softPink], 3, ["heart"]);
            }
          } else if (a.state === "walkToLuna") {
            const lunaX = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].x : this.luna.x;
            const tx = lunaX - 55;
            a.pose = "walk";
            a.poseTimer = 0.5;
            a.facing = tx < a.x ? -1 : 1;
            if (Math.abs(a.x - tx) > 14 || Math.abs(a.y - a.floorY) > 10) {
              a.x += Math.sign(tx - a.x) * 60 * dt;
            } else {
              a.state = "idle";
              a.stateTimer = rand(2, 3.5);
              a.pose = "laugh";
              a.poseTimer = 1.5;
              a.facing = lunaX > a.x ? 1 : -1;
              this.statusText = "Annie smiles at Luna.";
              this.statusPulse = 0.3;
            }
          } else if (a.state === "wander") {
            const tx = a.targetX || a.homeX;
            a.pose = "walk";
            a.poseTimer = 0.5;
            a.facing = tx < a.x ? -1 : 1;
            if (Math.abs(a.x - tx) > 8) {
              a.x += Math.sign(tx - a.x) * 55 * dt;
            } else {
              a.state = "idle";
              a.stateTimer = rand(2, 4);
              a.pose = "idle";
              a.poseTimer = a.stateTimer;
            }
          } else if (a.state === "returnHome") {
            a.pose = "walk";
            a.poseTimer = 0.5;
            a.facing = a.homeX < a.x ? -1 : 1;
            if (Math.abs(a.x - a.homeX) > 10 || Math.abs(a.y - a.homeY) > 10) {
              a.x += Math.sign(a.homeX - a.x) * 55 * dt;
            } else {
              a.x = a.homeX;
              a.state = "idle";
              a.stateTimer = rand(3, 6);
              a.pose = "sit";
              a.facing = 1;
              a.poseTimer = a.stateTimer;
            }
          }

          /* if far from home and idle, eventually return */
          if ((a.state === "idle" || a.state === "kneel") && Math.abs(a.x - a.homeX) > 60 && a.stateTimer < 0.5) {
            a.state = "returnHome";
            a.stateTimer = rand(3, 5);
            a.targetY = a.homeY;
          }
        }

        a.x = clamp(a.x, 140, 640);
        a.y = clamp(a.y, a.homeY, a.floorY);
      }
      updateObi(dt) {
        this.obi.petTimer = Math.max(0, this.obi.petTimer - dt);
        this.obi.happyTimer = Math.max(0, this.obi.happyTimer - dt);
        this.obi.shakeTimer = Math.max(0, this.obi.shakeTimer - dt);
        const busy = this.treats.some((t) => t.pet === "obi") || (this.toy && this.toy.pet === "obi");
        const interacting = this.petInteraction.active;
        if (!busy && !interacting) {
          if (this.idleTime > 8 && this.obi.joy > 55) {
            /* sleepy time after idle — go to pet bed if available, otherwise mat */
            var napX = store.decor.petBed ? 520 : this.obi.homeX;
            var napY = store.decor.petBed ? 468 : this.obi.homeY;
            this.obi.targetX = napX;
            this.obi.targetY = napY;
            if (dist(this.obi.x, this.obi.y, napX, napY) < 18) {
              if (!this.obi.sleepy) {
                this.obi.sleepy = true;
                const napMsgs = ["Obi found his favorite nap spot.", "Obi curls up for a snooze.", "Obi is dreaming of treats.", "Obi settles in for a cozy nap."];
                this.statusText = napMsgs[Math.floor(Math.random() * napMsgs.length)];
              }
            }
            this.obi.sniffing = false;
          } else if (this.idleTime > 3 && !this.obi.sleepy && this.obi.shakeTimer <= 0) {
            /* Obi sniffs around when idle */
            this.obi.sniffTimer -= dt;
            if (this.obi.sniffTimer <= 0) {
              this.obi.sniffing = !this.obi.sniffing;
              this.obi.sniffTimer = this.obi.sniffing ? rand(1.5, 3) : rand(2, 4);
              if (this.obi.sniffing) {
                this.obi.targetX = rand(100, 380);
                this.obi.targetY = this.obi.homeY;
                const msgs = ["Obi is sniffing around the room.", "Obi found an interesting smell!", "Obi's nose is hard at work."];
                this.statusText = msgs[Math.floor(Math.random() * msgs.length)];
              } else {
                this.obi.targetX = this.obi.homeX;
                this.obi.targetY = this.obi.homeY;
              }
            }
          } else if (!this.obi.sniffing) {
            this.obi.targetX = this.obi.homeX;
            this.obi.targetY = this.obi.homeY;
            this.obi.sleepy = false;
          }
        } else if (!interacting) {
          this.obi.sniffing = false;
        }
        const dx = this.obi.targetX - this.obi.x;
        const dy = this.obi.targetY - this.obi.y;
        const d = Math.hypot(dx, dy);
        const speed = busy ? 210 : this.obi.sleepy ? 0 : 92;
        if (d > 1 && speed > 0) {
          const step = Math.min(d, speed * dt);
          this.obi.x += dx / d * step;
          this.obi.y += dy / d * step;
          if (Math.abs(dx) > 2) this.obi.facing = dx >= 0 ? 1 : -1;
        }
        this.obi.bounce = busy ? 0.07 * Math.abs(Math.sin(game.time * 11)) : this.obi.petTimer > 0 ? 0.03 : 0;
        /* decay reward cooldown */
        if (this._rewardCooldown) {
          this._rewardCooldown.obi = Math.max(0, (this._rewardCooldown.obi || 0) - dt * 0.5);
          this._rewardCooldown.luna = Math.max(0, (this._rewardCooldown.luna || 0) - dt * 0.5);
        }
        /* bond greeting timers */
        if (this._obiGreeting > 0) {
          this._obiGreeting -= dt;
          if (this._obiGreeting <= 0) {
            this.obi.targetX = this.obi.homeX;
            this.obi.targetY = this.obi.homeY;
            spawnParticleBurst(this.obi.x, this.obi.y - 20, [COLORS.softPink, COLORS.gold], 6, ["heart"]);
          }
        }
        if (this._lunaGreeting > 0) {
          this._lunaGreeting -= dt;
          if (this._lunaGreeting <= 0) {
            this.luna.targetX = this.luna.floorX;
            this.luna.targetY = this.luna.floorY;
            spawnParticleBurst(this.luna.x, this.luna.y - 20, [COLORS.softPink, "#FF69B4"], 4, ["heart"]);
          }
        }
        var joyDecayMult = hasUpgrade("joyfulHome") ? 0.8 : 1.0;
        var obiDecay = getMoodData("obi").decay || 0.5;
        if (this.foodBowl.fill < 20) obiDecay += 0.8;
        if (this.waterBowl.fill < 20) obiDecay += 0.6;
        obiDecay = Math.min(obiDecay, 1.0) * joyDecayMult;
        this.obi.joy = clamp(this.obi.joy - dt * obiDecay, 0, 100);
        /* carryToy idle behavior */
        if (this.obi.carryingToy) {
          this.obi.carryTimer -= dt;
          if (this.obi.carryTimer <= 0 || dist(this.obi.x, this.obi.y, this.obi.targetX, this.obi.homeY) < 14) {
            this.obi.carryingToy = false;
            this.obi.targetX = this.obi.homeX;
            this.obi.targetY = this.obi.homeY;
            this.statusText = "Obi dropped the bone and wagged his tail.";
            spawnParticleBurst(this.obi.x, this.obi.y - 20, [COLORS.softPink], 3, ["heart"]);
          }
        } else if (!busy && !this.obi.sleepy && !this.obi.sniffing && this.obi.joy > 60 && Math.random() < dt * 0.015) {
          this.obi.carryingToy = true;
          this.obi.carryTimer = rand(3, 6);
          this.obi.targetX = rand(120, 360);
          this.obi.targetY = this.obi.homeY;
          this.statusText = "Obi picked up his favorite bone!";
        }
        /* eating / drinking behavior */
        if (this.obi.eating || this.obi.drinking) {
          this.obi.eatDrinkTimer -= dt;
          if (this.obi.eatDrinkTimer <= 0) {
            const bowl = this.obi.eating ? this.foodBowl : this.waterBowl;
            bowl.fill = clamp(bowl.fill - rand(8, 12), 0, 100);
            this.obi.joy = clamp(this.obi.joy + rand(3, 5), 0, 100);
            this.obi.eating = false;
            this.obi.drinking = false;
            this.obi.targetX = this.obi.homeX;
            this.obi.targetY = this.obi.homeY;
          }
        } else if (!busy && !this.obi.sleepy && this.idleTime > 4) {
          if (this.foodBowl.fill > 20 && !(this.luna.eating && this.luna.eatingFrom === "food") && Math.random() < dt * 0.08) {
            this.obi.eating = true;
            this.obi.eatingFrom = "food";
            this.obi.eatDrinkTimer = rand(2, 4);
            this.obi.targetX = this.foodBowl.x + 20;
            this.obi.targetY = this.foodBowl.y;
          } else if (this.waterBowl.fill > 20 && !(this.luna.drinking && this.luna.eatingFrom === "water") && Math.random() < dt * 0.06) {
            this.obi.drinking = true;
            this.obi.eatingFrom = "water";
            this.obi.eatDrinkTimer = rand(2, 4);
            this.obi.targetX = this.waterBowl.x + 20;
            this.obi.targetY = this.waterBowl.y;
          }
        }
      }
      updateLuna(dt) {
        this.luna.petTimer = Math.max(0, this.luna.petTimer - dt);
        this.luna.happyTimer = Math.max(0, this.luna.happyTimer - dt);
        this.luna.wiggle = Math.max(0, this.luna.wiggle - dt * 1.8);
        this.luna.pounce = Math.max(0, this.luna.pounce - dt * 2.5);
        this.luna.pawBat = Math.max(0, this.luna.pawBat - dt * 2.8);
        const busy = this.treats.some((t) => t.pet === "luna") || (this.toy && this.toy.pet === "luna");
        const interacting = this.petInteraction.active;
        if (!busy && !interacting) {
          if (this.idleTime > 8 && this.luna.joy > 48 && !this.luna.grooming && !this.luna.bellyUp) {
            /* retreat to perch after long idle */
            if (this.luna.perch === "floor") {
              /* F.NEW.3 — in snow, Luna prefers the windowsill (watching the
                 flakes fall). Default behavior otherwise: tower. */
              var _snowing = (store.weather && store.weather.current === "snow");
              if (_snowing && Math.random() < 0.7) {
                this.luna.perch = "window";
                const perchMsgsSnow = ["Luna is watching the snow fall.", "Luna takes the window seat.", "Luna picked the snowy view today."];
                this.statusText = perchMsgsSnow[Math.floor(Math.random() * perchMsgsSnow.length)];
              } else {
                this.luna.perch = "tower";
                const perchMsgs = ["Luna hopped up to her favorite perch.", "Luna retreats to the high ground.", "Luna surveys her kingdom from above.", "Luna claims the best seat in the house."];
                this.statusText = perchMsgs[Math.floor(Math.random() * perchMsgs.length)];
              }
            }
            this.luna.targetX = LUNA_PERCHES[this.luna.perch].x;
            this.luna.targetY = LUNA_PERCHES[this.luna.perch].y;
            this.luna.jumping = true;
            this.luna.jumpPhase = 0;
            this.luna.jumpStartX = this.luna.x;
            this.luna.jumpStartY = this.luna.y;
            this.luna.grooming = false;
            this.luna.bellyUp = false;
          } else if (this.idleTime > 2 && this.luna.perch === "floor") {
            /* idle floor behaviors: groom, belly up, or sit */
            this.luna.idleBehaviorTimer -= dt;
            if (this.luna.idleBehaviorTimer <= 0) {
              const r = Math.random();
              if (r < 0.3 && !this.luna.grooming) {
                this.luna.grooming = true;
                this.luna.bellyUp = false;
                this.luna.idleBehaviorTimer = rand(2.5, 4.5);
                const msgs = ["Luna starts grooming her paw.", "Luna is cleaning up. Very dignified.", "Bath time for Luna."];
                this.statusText = msgs[Math.floor(Math.random() * msgs.length)];
              } else if (r < 0.55 && !this.luna.bellyUp && this.luna.joy >= 55) {
                this.luna.bellyUp = true;
                this.luna.grooming = false;
                this.luna.stretching = false;
                this.luna.idleBehaviorTimer = rand(3, 5);
                spawnParticleBurst(this.luna.x, this.luna.y - 20, [COLORS.softPink], 3, ["heart"]);
                this.statusText = "Luna rolled onto her back! She's feeling trusting.";
              } else if (r < 0.7 && !this.luna.stretching) {
                this.luna.stretching = true;
                this.luna.grooming = false;
                this.luna.bellyUp = false;
                this.luna.idleBehaviorTimer = rand(1.5, 3);
                const msgs = ["Luna does a big stretch.", "Luna stretches out. Very yoga.", "Luna reaches way out with a yawn."];
                this.statusText = msgs[Math.floor(Math.random() * msgs.length)];
              } else {
                this.luna.grooming = false;
                this.luna.bellyUp = false;
                this.luna.stretching = false;
                this.luna.idleBehaviorTimer = rand(3, 6);
              }
            }
          } else if (!this.luna.grooming && !this.luna.bellyUp) {
            this.luna.perch = "floor";
            this.luna.targetX = this.luna.floorX;
            this.luna.targetY = this.luna.floorY;
          }
        } else if (!interacting) {
          this.luna.grooming = false;
          this.luna.bellyUp = false;
        }
        if (this.luna.jumping) {
          this.luna.jumpPhase += dt * 2;
          if (this.luna.jumpPhase >= 1) {
            this.luna.jumping = false;
            this.luna.x = this.luna.targetX;
            this.luna.y = this.luna.targetY;
          } else {
            var jt = this.luna.jumpPhase;
            this.luna.x = lerp(this.luna.jumpStartX, this.luna.targetX, jt);
            this.luna.y = lerp(this.luna.jumpStartY, this.luna.targetY, jt) - Math.sin(jt * Math.PI) * 80;
            if (Math.abs(this.luna.targetX - this.luna.jumpStartX) > 2) this.luna.facing = this.luna.targetX > this.luna.jumpStartX ? 1 : -1;
          }
        } else {
          const dx = this.luna.targetX - this.luna.x;
          const dy = this.luna.targetY - this.luna.y;
          const d = Math.hypot(dx, dy);
          const speed = busy ? 145 : this.luna.perch !== "floor" ? 86 : 96;
          if (d > 1) {
            const step = Math.min(d, speed * dt);
            this.luna.x += dx / d * step;
            this.luna.y += dy / d * step;
            if (Math.abs(dx) > 2) this.luna.facing = dx >= 0 ? 1 : -1;
          }
        }
        if (this.luna.perch === "floor" && (busy || this.hoverKey === "luna")) {
          this.luna.x += Math.sin(game.time * 7 + this.luna.x * 0.03) * 8 * dt;
        }
        var lunaJoyDecayMult = hasUpgrade("joyfulHome") ? 0.8 : 1.0;
        var lunaDecay = getMoodData("luna").decay || 0.45;
        if (this.foodBowl.fill < 20) lunaDecay += 0.7;
        if (this.waterBowl.fill < 20) lunaDecay += 0.5;
        lunaDecay = Math.min(lunaDecay, 1.0) * lunaJoyDecayMult;
        this.luna.joy = clamp(this.luna.joy - dt * lunaDecay, 0, 100);
        /* eating / drinking behavior */
        if (this.luna.eating || this.luna.drinking) {
          this.luna.eatDrinkTimer -= dt;
          if (this.luna.eatDrinkTimer <= 0) {
            const bowl = this.luna.eating ? this.foodBowl : this.waterBowl;
            bowl.fill = clamp(bowl.fill - rand(8, 12), 0, 100);
            this.luna.joy = clamp(this.luna.joy + rand(3, 5), 0, 100);
            this.luna.eating = false;
            this.luna.drinking = false;
            this.luna.targetX = LUNA_PERCHES[this.luna.perch].x;
            this.luna.targetY = LUNA_PERCHES[this.luna.perch].y;
          }
        } else if (!busy && this.luna.perch === "floor" && this.idleTime > 4) {
          if (this.foodBowl.fill > 20 && !(this.obi.eating && this.obi.eatingFrom === "food") && Math.random() < dt * 0.06) {
            this.luna.eating = true;
            this.luna.eatingFrom = "food";
            this.luna.eatDrinkTimer = rand(2, 4);
            this.luna.targetX = this.foodBowl.x - 20;
            this.luna.targetY = this.foodBowl.y;
          } else if (this.waterBowl.fill > 20 && !(this.obi.drinking && this.obi.eatingFrom === "water") && Math.random() < dt * 0.05) {
            this.luna.drinking = true;
            this.luna.eatingFrom = "water";
            this.luna.eatDrinkTimer = rand(2, 4);
            this.luna.targetX = this.waterBowl.x - 20;
            this.luna.targetY = this.waterBowl.y;
          }
        }
      }
      handlePetStroke(dt) {
        if (!game.mouse.down || (this.mode !== "pet" && this.mode !== "brush")) return;
        this.strokeTick -= dt;
        const x = game.mouse.x;
        const y = game.mouse.y;
        const target = pointInRect(x, y, this.getPetRect("obi")) ? "obi" : pointInRect(x, y, this.getPetRect("luna")) ? "luna" : null;
        if (!target) return;
        /* stroke trail */
        const last = this.strokeTrail[this.strokeTrail.length - 1];
        if (!last || dist(last.x, last.y, x, y) > 6) {
          this.strokeTrail.push({ x, y, life: 0.35 });
          if (this.strokeTrail.length > 20) this.strokeTrail.shift();
        }
        if (this.strokeTick <= 0) {
          this.strokeTick = 0.35;
          /* skip reward if cooldown is maxed (prevents hold-to-fill) */
          if (this._rewardCooldown && (this._rewardCooldown[target] || 0) >= 1.4) {
            if (Math.random() < 0.15) this.statusText = target === "obi" ? "Obi needs a break from pets!" : "Luna is over it. Typical cat.";
            return;
          }
          const zone = this.getPetZone(target, x, y);
          const amount = this.mode === "brush" ? 3.5 : 2.5;
          if (target === "obi") {
            if (zone === "head") {
              this.rewardPet("obi", amount + 1, this.mode, x, y);
              if (Math.random() < 0.3) this.statusText = "Obi loves ear scratches!";
            } else if (zone === "belly") {
              this.rewardPet("obi", amount + 2, this.mode, x, y);
              if (Math.random() < 0.3) this.statusText = "Belly rubs! Obi's favorite!";
            } else {
              this.rewardPet("obi", amount, this.mode, x, y);
              if (Math.random() < 0.2) this.statusText = "Obi wags happily.";
            }
          } else {
            if (zone === "head") {
              this.rewardPet("luna", amount + 1, this.mode, x, y);
              if (Math.random() < 0.3) this.statusText = "Luna tilts into the chin scratch.";
            } else if (zone === "belly") {
              /* cats don't always like belly rubs - same odds as click (35%) */
              if (Math.random() < 0.35) {
                this.luna.pawBat = Math.max(this.luna.pawBat, 0.6);
                this.statusText = "Luna swats! She's not a belly-rub cat.";
                this.statusPulse = 1;
                this.luna.joy = clamp(this.luna.joy - 2, 0, 100);
                this.addFloatingText("Luna swats!", x, y - 20, COLORS.warmRed);
              } else {
                this.rewardPet("luna", amount, this.mode, x, y);
                if (Math.random() < 0.3) this.statusText = "Luna tolerates the belly touch... barely.";
              }
            } else {
              this.rewardPet("luna", amount + 0.5, this.mode, x, y);
              if (Math.random() < 0.3) this.statusText = "Luna purrs as you stroke her back.";
            }
          }
          if (this.mode === "brush") {
            spawnParticleBurst(x, y - 10, ["#FFF4C0", "#FFEAA7"], 2, ["star"]);
          }
        }
      }
      getPetZone(key, mx, my) {
        const rect = this.getPetRect(key);
        const relX = (mx - rect.x) / rect.w;
        const relY = (my - rect.y) / rect.h;
        if (relY < 0.35) return "head";
        if (relY > 0.7) return "belly";
        return "body";
      }
      update(dt) {
        super.update(dt);
        this.idleTime += dt;
        this.tooltip = null;
        if (this.hoverKey === "games") this.tooltip = { x: 82, y: 66, title: "Minigames", body: "Play cozy games with Obi and Luna!" };
        else if (this.hoverKey === "decor") this.tooltip = { x: 570, y: 66, title: "Decorate", body: "Customize the living room with unlockable items!" };
        else if (this.hoverKey === "wardrobe") this.tooltip = { x: 665, y: 66, title: "Closet", body: "Buy and equip accessories for Obi and Luna!" };
        else if (this.hoverKey === "backyardDoor") this.tooltip = { x: 740, y: 290, title: "Backyard", body: "Go outside to the backyard!" };
        else if (this.hoverKey === "camera") this.tooltip = { x: W - 74, y: 100, title: "Camera", body: "Take a screenshot!" };
        else if (this.hoverKey === "scrapbook") this.tooltip = { x: W - 74, y: 144, title: "Scrapbook", body: "View photos, milestones, and stats!" };
        else if (this.hoverKey === "weather") {
          var _wKey = store.weather.current || "sunny";
          var _wLabel = { sunny: "Sunny", cloudy: "Cloudy", rain: "Raining", snow: "Snowing", golden: "Golden hour" }[_wKey] || _wKey;
          this.tooltip = { x: W - 74, y: 178, title: _wLabel, body: "Tap to check today's photo goals." };
        }
        else if (this.hoverKey === "pet") this.tooltip = { x: 198, y: 66, title: "Pet Mode", body: "Stroke directly over Obi or Luna for happy reactions." + this._moodMultHint("pet") };
        else if (this.hoverKey === "treat") this.tooltip = { x: 310, y: 66, title: "Treat Mode", body: "Click to toss snacks from Annie toward either pet." + this._moodMultHint("treat") };
        else if (this.hoverKey === "toy") this.tooltip = { x: 422, y: 66, title: "Play Mode", body: "Obi chases a ball; Luna stalks a yarn ball." + this._moodMultHint("toy") };
        else if (this.hoverKey === "brush") this.tooltip = { x: 534, y: 66, title: "Brush Mode", body: "Brush Obi or Luna until they sparkle!" + this._moodMultHint("brush") };
        else if (this.hoverKey === "foodBowl") this.tooltip = { x: this.foodBowl.x, y: this.foodBowl.y - 36, title: "Food Bowl", body: "Fill: " + Math.round(this.foodBowl.fill) + "%. Click to refill!" };
        else if (this.hoverKey === "waterBowl") this.tooltip = { x: this.waterBowl.x, y: this.waterBowl.y - 36, title: "Water Bowl", body: "Fill: " + Math.round(this.waterBowl.fill) + "%. Click to refill!" };
        else if (this.hoverKey === "lamp") this.tooltip = { x: 216, y: 122, title: "Lamp", body: "Click to toggle the lamp." };
        else if (this.hoverKey === "toyBasket") this.tooltip = { x: 265, y: 368, title: "Toy Basket", body: "Click to toss a toy!" };
        else if (this.hoverKey === "window") this.tooltip = { x: 126, y: 44, title: "Window", body: "Look outside! (+1 joy)" };
        else if (this.hoverKey === "petBed") this.tooltip = { x: 520, y: 450, title: "Pet Sofa", body: "Click to call a pet to nap." };
        else if (this.hoverKey === "obi") this.tooltip = { x: this.obi.x, y: this.obi.y - 104, title: "Obi", body: "Mood: " + this.moodLabel("obi") + " (" + getDailyMood("obi") + " today)" };
        else if (this.hoverKey === "luna") this.tooltip = { x: this.luna.x, y: (this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y) - 104, title: "Luna", body: "Mood: " + this.moodLabel("luna") + " (" + getDailyMood("luna") + " today)" };
        /* Annie behavior system */
        this.updateAnnie(dt);

        this.statusPulse = Math.max(0, this.statusPulse - dt * 2.6);
        /* away story animation */
        if (this._awayStory) {
          this._awayStory.phase += dt;
          return;
        }
        /* daily calendar animation */
        if (this.dailyGift && !this.dailyGift.collected) {
          this.dailyGift.phase += dt;
          return;
        }
        if (this.dailyGift && this.dailyGift.collected) {
          this.dailyGift.phase += dt;
          if (this.dailyGift.phase > 4) this.dailyGift = null;
        }
        /* coin popup decay */
        if (this.coinPopup) {
          this.coinPopup.timer -= dt;
          if (this.coinPopup.timer <= 0) this.coinPopup = null;
        }
        /* camera flash decay */
        if (this.cameraFlash > 0) this.cameraFlash = Math.max(0, this.cameraFlash - dt * 2.5);
        /* bowl depletion during play */
        var bowlDrainMult = hasUpgrade("comfyBowls") ? 0.75 : 1.0;
        this.foodBowl.fill = clamp(this.foodBowl.fill - dt * 0.8 * bowlDrainMult, 0, 100);
        this.waterBowl.fill = clamp(this.waterBowl.fill - dt * 1.1 * bowlDrainMult, 0, 100);
        this.bowlSaveTimer += dt;
        if (this.bowlSaveTimer > 10) {
          this.bowlSaveTimer = 0;
          store.pet_food_fill = this.foodBowl.fill;
          store.pet_water_fill = this.waterBowl.fill;
          saveNumber("pet_food_fill", this.foodBowl.fill);
          saveNumber("pet_water_fill", this.waterBowl.fill);
        }
        /* dedication screen */
        if (this.dedication) {
          this.dedication.phase += dt;
          this.dedication.alpha = clamp(this.dedication.phase / 1.5, 0, 1);
          return;
        }
        if (this.menuOpen) { this.menuFade = clamp(this.menuFade + dt * 5, 0, 1); return; }
        this.menuFade = clamp(this.menuFade - dt * 5, 0, 1);
        if (this.decorOpen) { this.decorFade = clamp(this.decorFade + dt * 5, 0, 1); return; }
        this.decorFade = clamp(this.decorFade - dt * 5, 0, 1);
        if (this.wardrobeOpen) { this.wardrobeFade = clamp(this.wardrobeFade + dt * 5, 0, 1); return; }
        this.wardrobeFade = clamp(this.wardrobeFade - dt * 5, 0, 1);
        if (this.scrapbookOpen) { this.scrapbookFade = clamp(this.scrapbookFade + dt * 5, 0, 1); return; }
        this.scrapbookFade = clamp(this.scrapbookFade - dt * 5, 0, 1);
        this.handlePetStroke(dt);
        this.updateTreats(dt);
        this.updateToy(dt);
        this.updateObi(dt);
        this.updateLuna(dt);
        this.updatePetInteraction(dt);
        this.updateThoughtBubbles(dt);
        this.updateAmbientEvents(dt);
        if (this._bookCooldown > 0) this._bookCooldown -= dt;
        if (this._rugCooldown > 0) this._rugCooldown -= dt;
        this.updateDecorReactions(dt);
        /* scrapbook goals check (every 2 seconds) */
        if (!this._goalCheckTimer) this._goalCheckTimer = 0;
        this._goalCheckTimer -= dt;
        if (this._goalCheckTimer <= 0) { this._goalCheckTimer = 2; this.checkScrapbookGoals(); }
        /* ambient particles - occasional dust motes */
        if (Math.random() < dt * 0.8) {
          spawnParticleBurst(rand(100, 700), rand(150, 450), ["rgba(255,240,200,0.5)"], 1, ["star"]);
        }
        /* periodic joy save */
        this.joySaveTimer -= dt;
        if (this.joySaveTimer <= 0) {
          this.joySaveTimer = 2;
          store.pet_obi_joy = this.obi.joy;
          store.pet_luna_joy = this.luna.joy;
          saveNumber("pet_obi_joy", this.obi.joy);
          saveNumber("pet_luna_joy", this.luna.joy);
          saveNumber("lastJoySave", Date.now());
        }
        /* decoration notification tick */
        if (this.decorNotification) {
          this.decorNotification.timer -= dt;
          if (this.decorNotification.timer <= 0) this.decorNotification = null;
        }
        /* bond level-up notification tick */
        if (this._bondLevelUp) {
          this._bondLevelUp.timer -= dt;
          if (this._bondLevelUp.timer <= 0) this._bondLevelUp = null;
        }
        /* E.6 — Dedicated Caretaker reveal tick */
        if (this._dedicatedReveal) {
          this._dedicatedReveal.timer -= dt;
          if (this._dedicatedReveal.timer <= 0) this._dedicatedReveal = null;
        }
        /* F.6 — visitor banner tick */
        if (this._visitorBanner) {
          this._visitorBanner.timer -= dt;
          if (this._visitorBanner.timer <= 0) this._visitorBanner = null;
        }
        /* F.NEW.1 — sample joy every 0.25s, trim to 5s window. */
        this._joySampleTimer = (this._joySampleTimer || 0) - dt;
        if (this._joySampleTimer <= 0) {
          this._joySampleTimer = 0.25;
          var _jhT = game.time;
          this._joyHistory.obi.push({ t: _jhT, j: this.obi.joy });
          this._joyHistory.luna.push({ t: _jhT, j: this.luna.joy });
          while (this._joyHistory.obi.length && this._joyHistory.obi[0].t < _jhT - 5) this._joyHistory.obi.shift();
          while (this._joyHistory.luna.length && this._joyHistory.luna[0].t < _jhT - 5) this._joyHistory.luna.shift();
        }
        /* stroke trail tick */
        for (let i = this.strokeTrail.length - 1; i >= 0; i--) {
          this.strokeTrail[i].life -= dt;
          if (this.strokeTrail[i].life <= 0) this.strokeTrail.splice(i, 1);
        }
        /* floating text tick */
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
          const ft = this.floatingTexts[i];
          ft.life -= dt;
          ft.y -= 25 * dt;
          if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
      }
      updatePetInteraction(dt) {
        /* pet interaction tracking helper */
        if (!this._interactionTracked) this._interactionTracked = {};
        const pi = this.petInteraction;
        const obiBusy = this.treats.some(t => t.pet === "obi") || (this.toy && this.toy.pet === "obi") || this.obi.sleepy;
        const lunaBusy = this.treats.some(t => t.pet === "luna") || (this.toy && this.toy.pet === "luna") || this.luna.perch !== "floor";
        if (pi.active) {
          pi.phase += dt;
          const midX = (this.obi.x + this.luna.x) / 2;
          const midY = Math.min(this.obi.y, this.luna.y) - 20;

          if (pi.type === "obiSniffsLuna") {
            this.obi.targetX = this.luna.x - 42;
            this.obi.facing = 1;
            this.obi.sniffing = true;
            if (pi.phase < 0.8 && pi.phase > 0.2) this.statusText = "Obi is trotting over to Luna...";
            if (Math.abs(this.obi.x - this.luna.x) < 55 && pi.phase > 0.8) {
              if (Math.random() < dt * 2.5) spawnParticleBurst(midX, midY, [COLORS.softPink], 1, ["heart"]);
              this.statusText = "Obi is sniffing Luna curiously...";
              if (pi.phase > 2.2) {
                this.statusText = "Obi gave Luna a little nose boop!";
                this.statusPulse = 1;
                spawnParticleBurst(midX, midY, [COLORS.softPink, COLORS.gold], 8, ["heart", "star"]);
                audio.tinyChime();
                this.addFloatingText("Nose boop!", midX, midY - 10, COLORS.softPink);
                this.obi.joy = clamp(this.obi.joy + 6, 0, 100);
                this.luna.joy = clamp(this.luna.joy + 4, 0, 100);
                if (!this._interactionTracked[pi.type]) { this._interactionTracked[pi.type] = true; store.stats.petInteractionsSeen++; saveStats(); }
                if (store.stats.petInteractionsSeen >= 5 && !store.achievements.socialButterfly) { store.achievements.socialButterfly = true; saveAchievements(); var sbI = ACHIEVEMENTS.find(function(a) { return a.key === "socialButterfly"; }); if (sbI && sbI.coinBonus) addCoins(sbI.coinBonus); addScrapbookEntry("achievement", "Social Butterfly unlocked!", "star"); }
                pi.active = false; pi.timer = rand(8, 14); pi.phase = 0;
                this.obi.sniffing = false;
                this.obi.targetX = this.obi.homeX;
              }
            }
          } else if (pi.type === "lunaBatsObi") {
            this.luna.targetX = this.obi.x + 38;
            this.luna.facing = -1;
            if (pi.phase < 0.6 && pi.phase > 0.2) this.statusText = "Luna is creeping toward Obi's tail...";
            if (Math.abs(this.luna.x - this.obi.x) < 52 && pi.phase > 0.6) {
              this.luna.pawBat = Math.max(this.luna.pawBat, 0.4 + Math.sin(game.time * 6) * 0.4);
              this.statusText = "Luna is batting at Obi's tail!";
              if (Math.random() < dt * 3) spawnParticleBurst(midX, this.obi.y - 25, [COLORS.gold, "#FFF4C0"], 1, ["star"]);
              if (pi.phase > 1.8) {
                this.statusText = "Luna got Obi's tail! He wags even harder.";
                this.statusPulse = 1;
                spawnParticleBurst(this.obi.x, this.obi.y - 20, [COLORS.gold, COLORS.softPink], 6, ["star", "heart"]);
                audio.tinyChime();
                this.addFloatingText("Got the tail!", midX, midY - 10, COLORS.gold);
                this.luna.joy = clamp(this.luna.joy + 6, 0, 100);
                this.obi.joy = clamp(this.obi.joy + 4, 0, 100);
                pi.active = false; pi.timer = rand(8, 14); pi.phase = 0;
                this.luna.pawBat = 0;
                this.luna.targetX = this.luna.floorX;
              }
            }
          } else if (pi.type === "obiLiesNearLuna") {
            this.obi.targetX = this.luna.x - 50;
            this.obi.facing = 1;
            if (pi.phase < 0.6) this.statusText = "Obi is wandering over to Luna...";
            if (Math.abs(this.obi.x - this.luna.x) < 60) {
              this.obi.sleepy = true;
              this.statusText = "Obi curled up next to Luna. So cozy!";
              if (Math.random() < dt * 1.5) spawnParticleBurst(midX, midY, [COLORS.softPink], 1, ["heart"]);
              if (pi.phase > 3.5) {
                spawnParticleBurst(midX, midY, [COLORS.softPink, "#FFF4C0"], 5, ["heart"]);
                audio.tinyChime();
                this.obi.joy = clamp(this.obi.joy + 4, 0, 100);
                this.luna.joy = clamp(this.luna.joy + 4, 0, 100);
                pi.active = false; pi.timer = rand(10, 16); pi.phase = 0;
                this.obi.sleepy = false;
                this.obi.targetX = this.obi.homeX;
              }
            }
          } else if (pi.type === "bothLookAtAnnie") {
            this.obi.targetX = 340;
            this.luna.targetX = 460;
            this.obi.facing = 1;
            this.luna.facing = -1;
            if (pi.phase > 0.5) this.statusText = "Obi and Luna are both looking at Annie...";
            if (Math.abs(this.obi.x - 340) < 20 && Math.abs(this.luna.x - 460) < 20 && pi.phase > 1) {
              if (Math.random() < dt * 2) spawnParticleBurst(400, 300, [COLORS.softPink, COLORS.gold], 1, ["heart"]);
              if (pi.phase > 2.5) {
                this.statusText = "They both want Annie's attention!";
                this.statusPulse = 1;
                spawnParticleBurst(400, 290, [COLORS.softPink, COLORS.gold, "#FFF4C0"], 10, ["heart", "star"]);
                audio.combo();
                this.obi.joy = clamp(this.obi.joy + 5, 0, 100);
                this.luna.joy = clamp(this.luna.joy + 5, 0, 100);
                pi.active = false; pi.timer = rand(12, 18); pi.phase = 0;
                this.obi.targetX = this.obi.homeX;
                this.luna.targetX = this.luna.floorX;
              }
            }
          }
          var interactionDurations = { obiSniffsLuna: 6, lunaBatsObi: 4, obiLiesNearLuna: 8, bothLookAtAnnie: 5 };
          var piDuration = interactionDurations[pi.type] || 5;
          if (pi.phase > piDuration) { pi.active = false; pi.timer = rand(8, 14); pi.phase = 0; this.obi.sniffing = false; }
        } else {
          pi.timer -= dt;
          if (pi.timer <= 0 && !obiBusy && !lunaBusy && this.idleTime > 1.5) {
            pi.active = true;
            pi.phase = 0;
            const r = Math.random();
            if (r < 0.3) pi.type = "obiSniffsLuna";
            else if (r < 0.55) pi.type = "lunaBatsObi";
            else if (r < 0.75) pi.type = "obiLiesNearLuna";
            else pi.type = "bothLookAtAnnie";
            this.idleTime = 0;
            this.obi.sniffing = false;
            this.luna.grooming = false;
            this.luna.bellyUp = false;
          }
        }
      }
      pickWant(pet) {
        const food = this.foodBowl.fill;
        const water = this.waterBowl.fill;
        if (food < 25) return "food";
        if (water < 25) return "water";
        const mood = this.petMood(pet);
        var want;
        if (pet === "obi") {
          if (mood === "hungry") want = Math.random() < 0.7 ? "food" : "treat";
          else if (mood === "sleepy") want = Math.random() < 0.6 ? "pet" : "brush";
          else if (mood === "playful") want = Math.random() < 0.5 ? "toy" : "treat";
          else want = Math.random() < 0.5 ? "pet" : "brush";
        } else {
          if (mood === "hungry") want = Math.random() < 0.6 ? "food" : "treat";
          else if (mood === "sleepy") want = Math.random() < 0.5 ? "pet" : "brush";
          else if (mood === "playful") want = Math.random() < 0.6 ? "toy" : "treat";
          else want = Math.random() < 0.4 ? "toy" : (Math.random() < 0.5 ? "brush" : "pet");
        }
        /* mood-weighted override: 40% chance to pick the action the daily mood favors most */
        var dm = getMoodData(pet);
        if (dm.joyMult && Math.random() < 0.4) {
          var best = null, bestVal = 0;
          for (var mk in dm.joyMult) { if (dm.joyMult[mk] > bestVal) { bestVal = dm.joyMult[mk]; best = mk; } }
          if (best) want = best;
        }
        /* filter out food/water when bowls are full */
        if (want === "food" && food > 80) want = "pet";
        if (want === "water" && water > 80) want = "pet";
        return want;
      }
      updateThoughtBubbles(dt) {
        if (this.obiBubble) {
          this.obiBubble.timer -= dt;
          this.obiBubble.age += dt;
          if (this.obiBubble.timer <= 0) {
            this.obi.joy = clamp(this.obi.joy - 3, 0, 100);
            spawnParticleBurst(this.obi.x, this.obi.y - 40, ["rgba(160,140,120,0.6)"], 3, ["heart"]);
            this.statusText = "Obi's wish went unanswered...";
            audio.miss();
            this.obiBubble = null;
          }
        }
        if (this.lunaBubble) {
          this.lunaBubble.timer -= dt;
          this.lunaBubble.age += dt;
          if (this.lunaBubble.timer <= 0) {
            this.luna.joy = clamp(this.luna.joy - 3, 0, 100);
            const ly = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y;
            spawnParticleBurst(this.luna.x, ly - 40, ["rgba(160,140,120,0.6)"], 3, ["heart"]);
            this.statusText = "Luna lost interest. Typical cat.";
            audio.miss();
            this.lunaBubble = null;
          }
        }
        this.bubbleTimer -= dt;
        if (this.bubbleTimer <= 0 && !this.petInteraction.active) {
          this.bubbleTimer = rand(5, 10);
          const obiBusy = this.treats.some(t => t.pet === "obi") || (this.toy && this.toy.pet === "obi") || this.obi.eating || this.obi.drinking;
          const lunaBusy = this.treats.some(t => t.pet === "luna") || (this.toy && this.toy.pet === "luna") || this.luna.eating || this.luna.drinking;
          const canObi = !this.obiBubble && !this.obi.sleepy && !obiBusy;
          const canLuna = !this.lunaBubble && !lunaBusy;
          if (!canObi && !canLuna) return;
          const pet = (canObi && canLuna) ? (Math.random() < 0.5 ? "obi" : "luna") : (canObi ? "obi" : "luna");
          /* bond level 6+: 15% chance of affectionate bubble */
          if (getBondLevel(pet) >= 6 && Math.random() < 0.15) {
            var bondMsgs = pet === "obi" ?
              ["Obi gazes at you with pure adoration.", "Obi's tail wags just from seeing you.", "Obi leans against your leg."] :
              ["Luna purrs loudly just being near you.", "Luna slow-blinks at you lovingly.", "Luna headbutts your hand."];
            this.statusText = bondMsgs[Math.floor(Math.random() * bondMsgs.length)];
            this.statusPulse = 0.3;
            spawnParticleBurst(pet === "obi" ? this.obi.x : this.luna.x, (pet === "obi" ? this.obi.y : this.luna.y) - 40, ["#FF69B4", COLORS.softPink], 3, ["heart"]);
            return;
          }
          /* 10% chance: memory bubble instead of want (flavor only) */
          if (Math.random() < 0.1 && store.petMemory.lastActions && store.petMemory.lastActions.length > 0) {
            var memAct = store.petMemory.lastActions[Math.floor(Math.random() * store.petMemory.lastActions.length)];
            var memLabels = { pet_obi: "belly rubs", pet_luna: "chin scratches", toy_obi: "the ball", toy_luna: "the yarn", brush_obi: "brushing", brush_luna: "being brushed", treat_obi: "treats", treat_luna: "snacks" };
            var memLabel = memLabels[memAct];
            if (memLabel) {
              this.statusText = this.petName(pet) + " is remembering " + memLabel + "...";
              this.statusPulse = 0.2;
              spawnParticleBurst(pet === "obi" ? this.obi.x : this.luna.x, (pet === "obi" ? this.obi.y : this.luna.y) - 40, [COLORS.softPink], 2, ["heart"]);
              return;
            }
          }
          let want = this.pickWant(pet);
          /* avoid repeating recent wants */
          const allWants = ["pet", "treat", "toy", "brush", "food", "water"];
          const recent = this.bubbleWantHistory.slice(-2);
          if (recent.includes(want)) {
            const alternatives = allWants.filter(w => !recent.includes(w));
            if (alternatives.length > 0) want = alternatives[Math.floor(Math.random() * alternatives.length)];
          }
          this.bubbleWantHistory.push(want);
          if (this.bubbleWantHistory.length > 6) this.bubbleWantHistory.shift();
          const bubble = { want, timer: rand(6, 10), age: 0 };
          const wantNames = { pet: "pets", treat: "a treat", toy: "to play", brush: "brushing", food: "food", water: "water" };
          if (pet === "obi") {
            this.obiBubble = bubble;
            if (!store.bubbleOnboarded) {
              const modeNames = { pet: "Pet", treat: "Treats", toy: "Play", brush: "Brush", food: "the food bowl", water: "the water bowl" };
              this.statusText = "Obi wants " + wantNames[want] + "! " + (want === "food" || want === "water" ? "Click " + modeNames[want] + " to refill it!" : "Switch to " + modeNames[want] + " mode!");
              store.bubbleOnboarded = true;
              saveBool("bubbleOnboarded", true);
            } else {
              this.statusText = "Obi is thinking about " + wantNames[want] + "...";
            }
          } else {
            this.lunaBubble = bubble;
            if (!store.bubbleOnboarded) {
              const modeNames = { pet: "Pet", treat: "Treats", toy: "Play", brush: "Brush", food: "the food bowl", water: "the water bowl" };
              this.statusText = "Luna wants " + wantNames[want] + "! " + (want === "food" || want === "water" ? "Click " + modeNames[want] + " to refill it!" : "Switch to " + modeNames[want] + " mode!");
              store.bubbleOnboarded = true;
              saveBool("bubbleOnboarded", true);
            } else {
              this.statusText = "Luna wants " + wantNames[want] + "...";
            }
          }
          this.statusPulse = 0.5;
        }
      }
      joyTier(joy) { return joy >= 85 ? 3 : joy >= 65 ? 2 : joy >= 40 ? 1 : 0; }
      checkJoyMilestone(key) {
        const pet = key === "obi" ? this.obi : this.luna;
        const tier = this.joyTier(pet.joy);
        const prev = key === "obi" ? this.obiMilestone : this.lunaMilestone;
        if (tier > prev) {
          if (key === "obi") this.obiMilestone = tier;
          else this.lunaMilestone = tier;
          const px = key === "obi" ? this.obi.x : this.luna.x;
          const py = key === "obi" ? this.obi.y - 40 : (this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y - 40 : this.luna.y - 40);
          const msgs = key === "obi"
            ? ["Obi perks up!", "Obi is wagging hard!", "Obi is thrilled!"]
            : ["Luna is warming up!", "Luna is curious!", "Luna is purring!"];
          this.addFloatingText(msgs[tier - 1], px, py, COLORS.gold);
          spawnParticleBurst(px, py, [COLORS.gold, COLORS.softPink], tier >= 3 ? 14 : 8, ["star", "heart"]);
          if (tier >= 3) screenShake(3.5, 0.25);
          audio.tinyChime();
        }
      }
      addFloatingText(text, x, y, color = "#7A4E36") {
        this.floatingTexts.push({ text, x, y, life: 1.5, color });
      }
      checkBubbleReward(key, source) {
        const bubble = key === "obi" ? this.obiBubble : this.lunaBubble;
        if (!bubble) return;
        const want = bubble.want;
        const isExact = (want === source) ||
                        (want === "food" && source === "feed") ||
                        (want === "water" && source === "water");
        const relatedMap = { pet: ["brush"], treat: ["feed"], toy: ["pet"], brush: ["pet"], food: ["treat"], water: [] };
        const isRelated = (relatedMap[want] || []).includes(source);
        const pet = key === "obi" ? this.obi : this.luna;
        const px = key === "obi" ? this.obi.x : this.luna.x;
        const py = key === "obi" ? this.obi.y - 50 : (this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y - 50 : this.luna.y - 50);
        if (isExact) {
          pet.joy = clamp(pet.joy + 10, 0, 100);
          this.sessionJoy += 10;
          this.earnCoins(5);
          spawnParticleBurst(px, py, [COLORS.gold, "#FFF4C0"], 12, ["star"]);
          this.statusText = this.petName(key) + " got exactly what they wanted! +5 coins";
          this.statusPulse = 1;
          audio.combo();
          screenShake(3, 0.2);
          this.addFloatingText("Perfect!", px, py, COLORS.gold);
          if (key === "obi") this.obiBubble = null;
          else this.lunaBubble = null;
        } else if (isRelated) {
          pet.joy = clamp(pet.joy + 3, 0, 100);
          this.sessionJoy += 3;
          spawnParticleBurst(px, py, [COLORS.softPink], 4, ["star"]);
          this.statusText = "That helped a little, but " + this.petName(key) + " wanted something else...";
          this.addFloatingText("Close!", px, py, COLORS.softPink);
          audio.tinyChime();
        }
      }
      earnCoins(amount) {
        addCoins(amount);
        this.coinPopup = { amount: amount, timer: 1.5 };
      }
      getNextGoal() {
        /* check incomplete scrapbook goals */
        var sg = store.scrapbookGoals.completed || [];
        for (var gi = 0; gi < SCRAPBOOK_GOALS.length; gi++) {
          var g = SCRAPBOOK_GOALS[gi];
          if (sg.indexOf(g.key) < 0) return "Goal: " + g.name + " (+" + g.reward + " coins)";
        }
        /* check streak milestones */
        var streak = store.careStreak.count || 0;
        var milestones = [3, 7, 14, 21, 30, 45, 60, 90];
        for (var mi = 0; mi < milestones.length; mi++) {
          if (streak < milestones[mi]) return (milestones[mi] - streak) + "-day streak to next milestone!";
        }
        /* check affordable items */
        for (var di = 0; di < DECOR_ITEMS.length; di++) {
          var item = DECOR_ITEMS[di];
          if (item.price && store.decorPurchased.indexOf(item.key) < 0 && canUnlockDecorItem(item)) {
            if (store.coins >= item.price) return "Buy " + item.name + " (" + item.price + " coins)!";
            return "Save for " + item.name + " (need " + (item.price - store.coins) + " more coins)";
          }
        }
        return "Keep playing to unlock more content!";
      }
      saveSessionMemory() {
        store.petMemory.lastActions = this._sessionActions || [];
        store.petMemory.lastJoy = { obi: this.obi.joy, luna: this.luna.joy };
        store.petMemory.lastDate = new Date().toDateString();
        if (store.petMemory.lastActions.length > 10) store.petMemory.lastActions = store.petMemory.lastActions.slice(-10);
        if (!store.petMemory.memories) store.petMemory.memories = [];
        saveJSON("petMemory", store.petMemory);
      }
      updateDecorReactions(dt) {
        if (this.petInteraction.active || this.decorReaction) {
          if (this.decorReaction) {
            this.decorReaction.timer -= dt;
            if (this.decorReaction.timer <= 0) {
              this.decorReaction = null;
              this.obi.targetX = this.obi.homeX;
              this.obi.targetY = this.obi.homeY;
              if (this.luna.perch === "floor") {
                this.luna.targetX = LUNA_PERCHES.floor.x;
                this.luna.targetY = LUNA_PERCHES.floor.y;
              }
            }
          }
          return;
        }
        this.decorReactionCooldown -= dt;
        if (this.decorReactionCooldown > 0) return;
        for (var key in DECOR_REACTIONS) {
          if (!store.decor[key]) continue;
          var r = DECOR_REACTIONS[key];
          if (r.condition === "nighttime" && store.decor.timeOfDay !== 3) continue;
          if (Math.random() < r.chance) {
            var pet = r.pet === "both" ? this.obi : (r.pet === "obi" ? this.obi : this.luna);
            pet.targetX = r.targetX;
            pet.targetY = r.targetY || pet.homeY;
            if (r.pet === "both") {
              this.obi.targetX = r.targetX - 30; this.obi.targetY = r.targetY || this.obi.homeY;
              this.luna.targetX = r.targetX + 30; this.luna.targetY = r.targetY || this.luna.homeY;
            }
            pet.joy = clamp(pet.joy + r.joyBonus, 0, 100);
            if (r.pet === "both") this.luna.joy = clamp(this.luna.joy + r.joyBonus, 0, 100);
            this.statusText = r.message;
            this.statusPulse = 0.5;
            spawnParticleBurst(r.targetX, r.targetY - 20, [COLORS.softPink], 3, ["heart"]);
            this.decorReaction = { timer: rand(2.5, 4) };
            this.decorReactionCooldown = rand(30, 60);
            return;
          }
        }
        this.decorReactionCooldown = rand(5, 10);
      }
      completeScrapbookGoal(key) {
        if (store.scrapbookGoals.completed.indexOf(key) >= 0) return;
        var goal = null;
        for (var i = 0; i < SCRAPBOOK_GOALS.length; i++) { if (SCRAPBOOK_GOALS[i].key === key) { goal = SCRAPBOOK_GOALS[i]; break; } }
        if (!goal) return;
        store.scrapbookGoals.completed.push(key);
        saveJSON("scrapbookGoals", store.scrapbookGoals);
        this.earnCoins(goal.reward);
        addScrapbookEntry("goal", "Goal: " + goal.name + " complete!", goal.icon || "star");
        this.decorNotification = { text: "\u2605 Goal: " + goal.name + " +" + goal.reward + " coins!", timer: 4 };
        audio.combo();
      }
      checkScrapbookGoals() {
        var sg = store.scrapbookGoals.completed;
        /* both80Joy */
        if (sg.indexOf("both80Joy") < 0 && this.obi.joy >= 80 && this.luna.joy >= 80) this.completeScrapbookGoal("both80Joy");
        /* rainWindow */
        if (sg.indexOf("rainWindow") < 0 && this.ambientEvent && this.ambientEvent.type === "rain") this.completeScrapbookGoal("rainWindow");
        /* snowDay */
        if (sg.indexOf("snowDay") < 0 && this.ambientEvent && this.ambientEvent.type === "snow") this.completeScrapbookGoal("snowDay");
        /* petInteraction */
        if (sg.indexOf("petInteraction") < 0 && this.petInteraction && this.petInteraction.active) this.completeScrapbookGoal("petInteraction");
        /* fiveGames3Star */
        if (sg.indexOf("fiveGames3Star") < 0) {
          var t3map = { treat: 1400, laser: 1000, cuddle: 90, walk: 800, nap: 1000, bath: 500, sort: 550, pillow: 650, findluna: 500, window: 750, pawstep: 400, wildwand: 500 };
          var count3 = 0;
          for (var gk in t3map) { if ((store["best_" + gk] || 0) >= t3map[gk]) count3++; }
          if (count3 >= 5) this.completeScrapbookGoal("fiveGames3Star");
        }
        /* allDecor5 */
        if (sg.indexOf("allDecor5") < 0) {
          var dc = 0; for (var dk in store.decor) { if (store.decor[dk] === true) dc++; }
          if (dc >= 5) this.completeScrapbookGoal("allDecor5");
        }
        /* tenPhotos */
        if (sg.indexOf("tenPhotos") < 0 && store.stats.totalPhotos >= 10) this.completeScrapbookGoal("tenPhotos");
        /* visitorMet */
        if (sg.indexOf("visitorMet") < 0 && this.ambientEvent && this.ambientEvent.type === "visitor" && this.ambientEvent.data.interacted) this.completeScrapbookGoal("visitorMet");
      }
      logAmbientEntry(type) {
        var entries = store.scrapbook.entries;
        var text = "Saw " + type + " outside!";
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].text === text) return;
        }
        addScrapbookEntry("event", text, "star");
      }
      drawSceneContents(c) {
        drawLivingRoom(c);
        var obiSt = this.petSpriteState("obi");
        drawObi(c, this.obi.x, this.obi.y, 1.12, obiSt);
        drawAccessoryOverlay(c, "obi", this.obi.x, this.obi.y, 1.12, obiSt.pose, obiSt.facing);
        var lunaY = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y;
        var lunaS = this.luna.perch === "floor" ? 0.98 : this.luna.perch === "tower" ? 1.06 : 0.92;
        var lunaSt = this.petSpriteState("luna");
        drawLuna(c, this.luna.x, lunaY, lunaS, lunaSt);
        drawAccessoryOverlay(c, "luna", this.luna.x, lunaY, lunaS, lunaSt.pose, lunaSt.facing);
        drawAnnie(c, this.annie.x, this.annie.y, 1.34, { pose: this.annie.pose, facing: this.annie.facing });
        drawAccessoryOverlay(c, "annie", this.annie.x, this.annie.y, 1.34, this.annie.pose, this.annie.facing);
      }
      capturePhoto() {
        if (!spriteArt.ready) {
          this.statusText = "Please wait for images to load...";
          this.statusPulse = 1;
          return;
        }
        var captureCanvas = makeBufferCanvas(W, H);
        var cc = captureCanvas.getContext("2d");
        /* draw scene background + characters without HUD */
        this.drawSceneContents(cc);
        /* watermark */
        cc.fillStyle = "rgba(122,78,54,0.3)";
        cc.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        cc.textAlign = "right";
        cc.fillText("Annie's Cozy Day", W - 12, H - 8);
        /* download */
        var dataURL;
        try {
          dataURL = captureCanvas.toDataURL("image/png");
        } catch (e) {
          this.cameraFlash = 0.5;
          if (location.protocol === "file:") {
            this.statusText = "Photo saved to memory! (Open from web server for full capture)";
          } else {
            this.statusText = "Couldn't capture photo.";
          }
          this.statusPulse = 1;
          return;
        }
        if (isMobile) {
          window.open(dataURL, "_blank");
        } else {
          var link = document.createElement("a");
          link.download = "cozy-moment-" + Date.now() + ".png";
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        /* flash effect */
        this.cameraFlash = 0.4;
        audio.tinyChime();
        this.statusText = "Photo saved!";
        this.statusPulse = 1;
        /* save thumbnail */
        var thumbCanvas = makeBufferCanvas(160, 120);
        thumbCanvas.getContext("2d").drawImage(captureCanvas, 0, 0, 160, 120);
        var thumbData;
        try { thumbData = thumbCanvas.toDataURL("image/jpeg", 0.6); } catch(e) { return; }
        var photos = loadJSON("photos", []);
        photos.push({ data: thumbData, date: new Date().toDateString(), room: this.name });
        if (photos.length > 20) photos.shift();
        saveJSON("photos", photos);
        this._photoCache = null;
        store.stats.totalPhotos++;
        saveStats();
        /* photo-specific scrapbook goals */
        if (this.obi && this.obi.sleepy) this.completeScrapbookGoal("obiSleepPhoto");
        if (this.luna && this.luna.grooming) this.completeScrapbookGoal("lunaGroomPhoto");
        /* scrapbook entry for first photo */
        if (store.stats.totalPhotos === 1) {
          addScrapbookEntry("milestone", "Took the first photo!", "star");
        }
        if (store.stats.totalPhotos >= 10 && !store.achievements.shutterBug) {
          store.achievements.shutterBug = true; saveAchievements();
          var sbInfo = ACHIEVEMENTS.find(function(a) { return a.key === "shutterBug"; });
          if (sbInfo && sbInfo.coinBonus) addCoins(sbInfo.coinBonus);
          addScrapbookEntry("achievement", "Shutter Bug unlocked!", "star");
        }
        this.trackWeeklyChallenge("photosTaken", 1);
      }
      getWardrobeTabItems() {
        return getVisibleAccessories(this.wardrobeTab);
      }
      getWardrobeItemRect(index) {
        /* Phase D.4 — narrowed to right column to leave the left half of
           the panel for the hero portrait (x=60..320). */
        return { x: 340, y: 190 + index * 62 - this.wardrobeScrollOffset, w: 400, h: 54 };
      }
      wardrobeMaxScroll() {
        var tabItems = this.getWardrobeTabItems();
        var totalH = tabItems.length * 62;
        var visibleH = 555 - 190;
        return Math.max(0, totalH - visibleH);
      }
      drawTreat(c, t) {
        c.save();
        c.translate(t.x, t.y);
        c.rotate(Math.sin(game.time * 8 + t.x * 0.01) * 0.16);
        drawBone(c, 0, 0, 20, 12, t.pet === "obi" ? "#D49A4A" : "#FFD08A");
        c.restore();
      }
      drawToy(c) {
        if (!this.toy) return;
        c.save();
        if (this.toy.type === "ball") {
          c.fillStyle = "#4A90D9";
          c.beginPath();
          c.arc(this.toy.x, this.toy.y, 13, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "rgba(255,255,255,0.65)";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(this.toy.x - 4, this.toy.y - 3, 4, 0, Math.PI * 2);
          c.stroke();
        } else {
          /* yarn ball */
          const yarnFrame = spriteArt.frames.items ? spriteArt.frames.items.yarnBall : null;
          if (yarnFrame && spriteArt.image) {
            const ys = 0.14;
            const yw = yarnFrame.w * ys;
            const yh = yarnFrame.h * ys;
            c.save();
            c.translate(this.toy.x, this.toy.y);
            c.rotate(Math.sin(game.time * 4) * 0.15);
            c.drawImage(spriteArt.image, yarnFrame.x, yarnFrame.y, yarnFrame.w, yarnFrame.h, -yw/2, -yh/2, yw, yh);
            c.restore();
          } else {
            drawGlowCircle(c, this.toy.x, this.toy.y, 18, "rgba(255,150,150,ALPHA)", 0.22);
            c.fillStyle = "#E88";
            c.beginPath();
            c.arc(this.toy.x, this.toy.y, 12, 0, Math.PI * 2);
            c.fill();
          }
          drawGlowCircle(c, this.toy.x, this.toy.y, 22, "rgba(255,180,180,ALPHA)", 0.15);
        }
        c.restore();
      }
      drawBowl(c, bowl, frameKey, hovered) {
        const frame = spriteArt.frames.items[frameKey];
        if (hovered) drawGlowCircle(c, bowl.x, bowl.y - 8, 42, "rgba(255,215,0,ALPHA)", 0.25);
        drawShadowEllipse(c, bowl.x, bowl.y + 10, 30, 8, 0.12);
        if (spriteArt.ready && frame) {
          c.save();
          const fix = FRAME_SCALE_FIX["items." + frameKey] || 1;
          const scale = 0.12 * fix;
          const w = frame.w * scale;
          const h = frame.h * scale;
          c.drawImage(spriteArt.image, frame.x, frame.y, frame.w, frame.h, bowl.x - w / 2, bowl.y - h, w, h);
          c.restore();
        }
        /* darkening overlay when low */
        if (bowl.fill < 50) {
          c.save();
          c.globalAlpha = 0.3 * (1 - bowl.fill / 100);
          c.fillStyle = "#000";
          c.beginPath();
          c.ellipse(bowl.x, bowl.y - 6, 22, 14, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
        /* fill bar on hover */
        if (hovered) {
          const bw = 44;
          const bx = bowl.x - bw / 2;
          const by = bowl.y + 12;
          c.save();
          rr(c, bx, by, bw, 6, 3);
          c.fillStyle = "rgba(0,0,0,0.2)";
          c.fill();
          const fw = bw * clamp(bowl.fill / 100, 0, 1);
          if (fw > 1) {
            rr(c, bx, by, fw, 6, 3);
            c.fillStyle = bowl.fill > 50 ? "#6CBF6C" : bowl.fill > 25 ? "#E8C84A" : "#D45050";
            c.fill();
          }
          c.restore();
        }
      }
      drawToyBasket(c, hovered) {
        c.save();
        c.translate(265, 388);
        if (hovered) drawGlowCircle(c, 0, 0, 26, "rgba(255,215,0,ALPHA)", 0.18);
        drawShadowEllipse(c, 0, 12, 16, 5, 0.1);
        /* basket body */
        c.fillStyle = "#A07040";
        rr(c, -15, -4, 30, 20, 5);
        c.fill();
        /* darker rim */
        c.fillStyle = "#8B6030";
        rr(c, -17, -6, 34, 6, 3);
        c.fill();
        /* wicker lines */
        c.strokeStyle = "rgba(120,85,50,0.4)";
        c.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          c.moveTo(-12, 1 + i * 5);
          c.lineTo(12, 1 + i * 5);
          c.stroke();
        }
        /* toys peeking out */
        c.fillStyle = "#E85050";
        c.beginPath(); c.arc(-5, -5, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#6CB4EE";
        c.beginPath(); c.arc(6, -4, 3.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#F0D070";
        c.beginPath(); c.moveTo(-2, -9); c.lineTo(4, -9); c.lineTo(1, -13); c.closePath(); c.fill();
        c.restore();
      }
      drawAwayStory(c) {
        if (!this._awayStory) return;
        var as = this._awayStory;
        c.save();
        c.fillStyle = "rgba(60,40,28,0.55)";
        c.fillRect(0, 0, W, H);
        var alpha = clamp(as.phase / 0.6, 0, 1);
        c.globalAlpha = alpha;
        /* parchment panel */
        rr(c, W / 2 - 220, 140, 440, 300, 18);
        c.fillStyle = "#FFF8EC";
        c.fill();
        c.strokeStyle = "rgba(160,120,70,0.3)";
        c.lineWidth = 2;
        c.stroke();
        /* decorative header line */
        c.strokeStyle = "rgba(180,140,90,0.2)";
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(W / 2 - 180, 195); c.lineTo(W / 2 + 180, 195); c.stroke();
        /* title */
        c.fillStyle = "#8B6914";
        c.textAlign = "center";
        c.font = '22px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("While You Were Away...", W / 2, 180);
        /* story text with word wrap */
        c.fillStyle = "#5A3E2B";
        c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        wrapText(c, as.text, W / 2 - 190, 220, 380, 22);
        /* bonus indicator */
        if (as.bonus) {
          var bonusText = as.bonus.type === "coins" ? "+" + as.bonus.amount + " coins found!" : "+joy!";
          c.fillStyle = COLORS.gold;
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(bonusText, W / 2, 360);
        }
        /* paw prints decoration */
        c.globalAlpha = alpha * 0.12;
        c.fillStyle = "#8B6914";
        for (var pi = 0; pi < 3; pi++) {
          c.beginPath(); c.arc(W / 2 - 160 + pi * 160, 410, 6, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(W / 2 - 155 + pi * 160, 403, 3, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(W / 2 - 165 + pi * 160, 403, 3, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = alpha;
        if (as.phase > 0.6) {
          c.fillStyle = COLORS.warmRed;
          c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(isMobile ? "Tap to continue" : "Click to continue", W / 2, 420);
        }
        c.restore();
      }
      drawDailyGift(c) {
        if (!this.dailyGift) return;
        var ph = this.dailyGift.phase;
        c.save();
        c.fillStyle = "rgba(60,40,28,0.5)";
        c.fillRect(0, 0, W, H);
        var panelAlpha = clamp(ph / 0.5, 0, 1);
        c.globalAlpha = panelAlpha;
        /* panel */
        rr(c, W / 2 - 220, 130, 440, 350, 20);
        c.fillStyle = COLORS.cream;
        c.fill();
        c.strokeStyle = "rgba(146,104,72,0.25)";
        c.lineWidth = 2;
        c.stroke();
        /* title */
        c.fillStyle = COLORS.dark;
        c.textAlign = "center";
        c.font = '24px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("Daily Gift Calendar", W / 2, 168);
        /* streak */
        var cal = store.dailyCalendar;
        var streakMult = 1 + Math.min(2, Math.floor(cal.streak / 7) * 0.5);
        c.fillStyle = "rgba(92,68,52,0.6)";
        c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("Streak: " + cal.streak + " days" + (streakMult > 1 ? " (" + streakMult + "x bonus!)" : ""), W / 2, 188);
        /* 7-day grid */
        var gridX = W / 2 - 196;
        var cellW = 54;
        var cellH = 64;
        var gridY = 200;
        for (var di = 0; di < 7; di++) {
          var cx = gridX + di * (cellW + 2);
          var reward = CALENDAR_REWARDS[di];
          var isCurrent = (di === cal.currentDay % 7);
          var isPast = false;
          if (cal.lastClaimDate === new Date().toDateString()) {
            isPast = di < cal.currentDay % 7 || (cal.currentDay === 0 && di < 7);
            if (cal.currentDay === 0) isPast = false;
          } else {
            isPast = di < cal.currentDay % 7;
          }
          /* cell background */
          rr(c, cx, gridY, cellW, cellH, 8);
          if (isCurrent && !this.dailyGift.collected) {
            var pulse = 0.85 + 0.15 * Math.sin(game.time * 4);
            c.fillStyle = "rgba(255,200,80," + (0.3 * pulse) + ")";
          } else if (isPast) {
            c.fillStyle = "rgba(180,220,160,0.3)";
          } else {
            c.fillStyle = "rgba(200,190,170,0.15)";
          }
          c.fill();
          c.strokeStyle = isCurrent ? "rgba(220,160,40,0.6)" : "rgba(146,104,72,0.15)";
          c.lineWidth = isCurrent ? 2 : 1;
          c.stroke();
          /* day number */
          c.fillStyle = isCurrent ? COLORS.gold : "#8B7355";
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("Day " + reward.day, cx + cellW / 2, gridY + 16);
          /* icon/label */
          if (isPast) {
            c.fillStyle = "#6B9B4A";
            c.font = '20px sans-serif';
            c.fillText("\u2713", cx + cellW / 2, gridY + 42);
          } else {
            c.fillStyle = reward.mystery ? "#B8860B" : (reward.bondXP ? "#D4738C" : "#5A3E2B");
            c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(reward.label, cx + cellW / 2, gridY + 40);
            if (reward.mystery) {
              c.fillStyle = "#FFD700";
              c.font = '14px sans-serif';
              c.fillText("\u2605", cx + cellW / 2, gridY + 56);
            }
          }
        }
        /* collected state */
        if (this.dailyGift.collected) {
          var fadeOut = clamp((4 - this.dailyGift.phase) / 0.8, 0, 1);
          c.globalAlpha = panelAlpha * fadeOut;
          c.fillStyle = COLORS.gold;
          c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(this.dailyGift.rewardText || "", W / 2, 320);
          c.fillStyle = COLORS.dark;
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Come back tomorrow for the next gift!", W / 2, 350);
        }
        /* gift box for uncollected */
        if (!this.dailyGift.collected) {
          var giftFrame = spriteArt.frames && spriteArt.frames.items ? spriteArt.frames.items.giftBox : null;
          if (spriteArt.ready && giftFrame) {
            var scaleIn = ph < 1 ? easeOutBack(clamp(ph, 0, 1)) : 1;
            var wiggle = ph > 1 && ph < 1.5 ? Math.sin(ph * 30) * 4 : 0;
            var gScale = 0.14 * scaleIn;
            var gw = giftFrame.w * gScale;
            var gh = giftFrame.h * gScale;
            var bob = Math.sin(ph * 2.5) * 3;
            c.save();
            c.translate(W / 2 + wiggle, 330 + bob);
            c.drawImage(spriteArt.image, giftFrame.x, giftFrame.y, giftFrame.w, giftFrame.h, -gw / 2, -gh / 2, gw, gh);
            c.restore();
          }
          c.fillStyle = "rgba(92,68,52,0.7)";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Welcome back! Here's your Day " + CALENDAR_REWARDS[cal.currentDay % 7].day + " gift.", W / 2, 410);
          if (ph > 0.5) {
            c.fillStyle = COLORS.warmRed;
            c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(isMobile ? "Tap to open!" : "Click to open!", W / 2, 440);
          }
        }
        c.restore();
      }
      recordCareAction(actionType) {
        const today = new Date().toDateString();
        const streak = store.careStreak;
        if (streak.lastCareDate !== today) {
          var lastDate = streak.lastCareDate ? new Date(streak.lastCareDate) : null;
          var now = new Date();
          var daysDiff = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
          if (daysDiff <= 2) {
            streak.count++;
            if (daysDiff === 2) {
              this.statusText = "Your streak was saved! Don't forget to visit tomorrow!";
              this.statusPulse = 1;
            }
          } else {
            /* F.NEW.2 — meaningful streak broke; queue welcome-back line. */
            if (streak.count >= 3 && !store.streakBreakPending) {
              store.streakBreakPending = true;
              saveBool("streakBreakPending", true);
            }
            streak.count = 1;
          }
          streak.lastCareDate = today;
          streak.todayActions = [];
          streak.bestStreak = Math.max(streak.bestStreak, streak.count);
        }
        if (!streak.todayActions.includes(actionType)) {
          streak.todayActions.push(actionType);
        }
        saveCareStreak();
        /* daily task completion */
        if (store.dailyTasks.tasks.includes(actionType) && !store.dailyTasks.completed.includes(actionType)) {
          store.dailyTasks.completed.push(actionType);
          saveJSON("dailyTasks", store.dailyTasks);
          this.addFloatingText("Task done!", 400, 100, COLORS.gold);
          audio.tinyChime();
          if (store.dailyTasks.completed.length >= 3) {
            this.obi.joy = clamp(this.obi.joy + 5, 0, 100);
            this.luna.joy = clamp(this.luna.joy + 5, 0, 100);
            var taskReward = 12 + Math.floor((store.careStreak.count || 0) / 7) * 3;
            this.earnCoins(taskReward);
            this.decorNotification = { text: "All daily tasks complete! +" + taskReward + " coins, +5 joy!", timer: 4 };
            audio.combo();
          }
        }
      }
      updateAmbientEvents(dt) {
        if (this.ambientEvent) {
          this.ambientEvent.timer -= dt;
          if (this.ambientEvent.type === "butterfly") {
            for (const bf of this.ambientEvent.data) {
              bf.x += Math.sin(game.time * 2.5 + bf.phase) * 20 * dt;
              bf.y += Math.cos(game.time * 1.8 + bf.phase) * 12 * dt;
              if (bf.x < 80) bf.x += (80 - bf.x) * 0.1;
              if (bf.x > 170) bf.x -= (bf.x - 170) * 0.1;
              if (bf.y < 62) bf.y += (62 - bf.y) * 0.1;
              if (bf.y > 190) bf.y -= (bf.y - 190) * 0.1;
            }
          }
          if (this.ambientEvent.timer <= 0) {
            this.ambientEvent = null;
            var careLevel = ((this.obi.joy || 50) + (this.luna.joy || 50)) / 200;
            this.ambientEventCooldown = rand(60, 180) * (1.3 - careLevel * 0.6);
          }
          this._persistAmbient();
          return;
        }
        this.ambientEventCooldown -= dt;
        if (this.ambientEventCooldown <= 0) {
          var weather = store.weather.current || "sunny";
          var r = Math.random();
          /* weather-aware spawning + visitors */
          if (r < 0.15) {
            this.spawnVisitorEvent();
          } else if (weather === "rain" && r < 0.6) {
            this.spawnRainEvent();
          } else if (weather === "snow" && r < 0.5) {
            this.spawnSnowEvent();
          } else if ((weather === "sunny" || weather === "golden") && r < 0.55) {
            this.spawnButterflyEvent();
          } else if (r < 0.7) {
            this.spawnBirdEvent();
          } else if (r < 0.85) {
            this.spawnRainEvent();
          } else {
            this.spawnPackageEvent();
          }
        }
        this._persistAmbient();
      }
      _persistAmbient() {
        persistedHangoutAmbient = {
          event: this.ambientEvent,
          cooldown: this.ambientEventCooldown,
          savedAt: Date.now()
        };
      }
      spawnButterflyEvent() {
        const count = Math.floor(rand(1, 4));
        const data = [];
        for (let i = 0; i < count; i++) data.push({ x: rand(80, 170), y: rand(70, 160), phase: rand(0, 6), color: ["#FFB3D9", "#B3D9FF", "#FFFAB3"][i % 3] });
        this.ambientEvent = { type: "butterfly", timer: rand(12, 18), data };
        this.statusText = "Butterflies at the window!";
        this.logAmbientEntry("butterflies");
      }
      spawnBirdEvent() {
        const count = Math.floor(rand(1, 3));
        const data = [];
        for (let i = 0; i < count; i++) data.push({ x: rand(80, 160), y: 196, hop: 0, phase: rand(0, 6) });
        this.ambientEvent = { type: "bird", timer: rand(8, 14), data };
        this.statusText = "Birds on the window sill!";
        this.logAmbientEntry("birds");
      }
      spawnRainEvent() {
        const drops = [];
        for (let i = 0; i < 25; i++) drops.push({ x: rand(68, 184), y: rand(54, 200), speed: rand(80, 140), len: rand(6, 14) });
        this.ambientEvent = { type: "rain", timer: rand(30, 60), data: drops };
        this.statusText = "It's raining outside... so cozy in here.";
        this.logAmbientEntry("rain");
      }
      spawnPackageEvent() {
        this.ambientEvent = { type: "package", timer: rand(10, 15), data: { x: 710, y: 458, alpha: 1 } };
        this.statusText = "A package at the door!";
        audio.tinyChime();
      }
      spawnVisitorEvent() {
        var season = getCurrentSeason();
        var available = VISITOR_TYPES.filter(function(v) { return !v.season || v.season === season; });
        var visitor = available[Math.floor(Math.random() * available.length)];
        this.ambientEvent = { type: "visitor", timer: visitor.stayTime, data: { visitor: visitor, interacted: false, fadeIn: 0 } };
        this.statusText = visitor.message;
        audio.tinyChime();
        /* F.6 — banner with countdown ring; longer "first appearance" beat for
           seasonal visitors the player has never seen. */
        var _isFirst = !!visitor.season && store.visitorsSeen.indexOf(visitor.key) < 0;
        this._visitorBanner = { text: visitor.message, timer: _isFirst ? 3 : 2, total: _isFirst ? 3 : 2, isFirst: _isFirst, key: visitor.key };
        if (store.visitorsSeen.indexOf(visitor.key) < 0) {
          store.visitorsSeen.push(visitor.key);
          saveJSON("visitorsSeen", store.visitorsSeen);
        }
        /* auto-apply joy effects for non-clickable visitors. Mark
           interacted so a later click can't grant joy again (C.B5). */
        if (visitor.joyEffect && !visitor.coinReward) {
          if (visitor.joyEffect.obi) this.obi.joy = clamp(this.obi.joy + visitor.joyEffect.obi, 0, 100);
          if (visitor.joyEffect.luna) this.luna.joy = clamp(this.luna.joy + visitor.joyEffect.luna, 0, 100);
          this.ambientEvent.data.interacted = true;
        }
      }
      spawnSnowEvent() {
        var flakes = [];
        for (var i = 0; i < 20; i++) flakes.push({ x: rand(68, 184), y: rand(54, 200), speed: rand(20, 50), drift: rand(-15, 15), size: rand(2, 5) });
        this.ambientEvent = { type: "snow", timer: rand(30, 60), data: flakes };
        this.statusText = "It's snowing! So cozy inside.";
        this.logAmbientEntry("snow");
      }
      drawAmbientEvent(c) {
        if (!this.ambientEvent) return;
        const ev = this.ambientEvent;
        if (ev.type === "butterfly") {
          c.save();
          c.beginPath(); rr(c, 66, 52, 120, 152, 5); c.clip();
          for (const bf of ev.data) {
            c.save();
            c.translate(bf.x, bf.y);
            const flap = Math.sin(game.time * 8 + bf.phase) * 0.6;
            c.fillStyle = bf.color;
            c.save(); c.rotate(flap); c.beginPath(); c.ellipse(-4, 0, 6, 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
            c.save(); c.rotate(-flap); c.beginPath(); c.ellipse(4, 0, 6, 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
            c.fillStyle = "#333"; c.beginPath(); c.arc(0, 0, 1.5, 0, Math.PI * 2); c.fill();
            c.restore();
          }
          c.restore();
        } else if (ev.type === "bird") {
          c.save();
          c.beginPath(); rr(c, 66, 52, 120, 152, 5); c.clip();
          for (const bd of ev.data) {
            const hop = Math.sin(game.time * 3 + bd.phase) > 0.9 ? -4 : 0;
            c.save();
            c.translate(bd.x, bd.y + hop);
            c.fillStyle = "#8B6914"; c.beginPath(); c.arc(0, -4, 5, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#A08030"; c.beginPath(); c.arc(0, 3, 7, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#E8A020"; c.beginPath(); c.moveTo(5, -4); c.lineTo(10, -3); c.lineTo(5, -2); c.closePath(); c.fill();
            c.fillStyle = "#222"; c.beginPath(); c.arc(-1, -5, 1, 0, Math.PI * 2); c.fill();
            c.restore();
          }
          c.restore();
        } else if (ev.type === "rain") {
          c.save();
          c.beginPath(); rr(c, 66, 52, 120, 152, 5); c.clip();
          c.fillStyle = "rgba(20,30,50,0.15)"; c.fillRect(66, 52, 120, 152);
          c.strokeStyle = "rgba(150,180,220,0.5)"; c.lineWidth = 1;
          for (const d of ev.data) {
            const yOff = (game.time * d.speed + d.y) % 160;
            c.beginPath(); c.moveTo(d.x, 52 + yOff); c.lineTo(d.x - 1, 52 + yOff + d.len); c.stroke();
          }
          c.restore();
        } else if (ev.type === "package") {
          const pk = ev.data;
          c.save();
          c.globalAlpha = clamp(ev.timer / 2, 0, 1);
          c.translate(pk.x, pk.y);
          c.fillStyle = "#A08050"; rr(c, -16, -18, 32, 22, 4); c.fill();
          c.strokeStyle = "#806030"; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(-16, -7); c.lineTo(16, -7); c.stroke();
          c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 4); c.stroke();
          c.fillStyle = "#D04040"; c.beginPath(); c.arc(0, -18, 5, 0, Math.PI * 2); c.fill();
          c.restore();
        } else if (ev.type === "visitor") {
          var v = ev.data.visitor;
          var fadeA = clamp(ev.timer / 2, 0, 1) * clamp((v.stayTime - ev.timer) / 1, 0, 1);
          c.save();
          c.globalAlpha = fadeA;
          if (v.key === "neighborCat") {
            /* small cat silhouette in window */
            c.fillStyle = "#8B7355"; c.beginPath(); c.ellipse(v.drawX, v.drawY, 10, 7, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(v.drawX, v.drawY - 10, 6, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.moveTo(v.drawX - 5, v.drawY - 14); c.lineTo(v.drawX - 2, v.drawY - 20); c.lineTo(v.drawX + 1, v.drawY - 14); c.fill();
            c.beginPath(); c.moveTo(v.drawX + 2, v.drawY - 14); c.lineTo(v.drawX + 5, v.drawY - 20); c.lineTo(v.drawX + 8, v.drawY - 14); c.fill();
            c.fillStyle = "#7CB342"; c.beginPath(); c.arc(v.drawX - 2, v.drawY - 12, 1.5, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(v.drawX + 4, v.drawY - 12, 1.5, 0, Math.PI * 2); c.fill();
          } else if (v.key === "squirrel") {
            c.fillStyle = "#A0785A"; c.beginPath(); c.ellipse(v.drawX, v.drawY, 7, 5, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(v.drawX + 5, v.drawY - 6, 4, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#C09878"; c.beginPath(); c.ellipse(v.drawX - 8, v.drawY - 4, 5, 8, -0.4, 0, Math.PI * 2); c.fill();
          } else if (v.key === "robin") {
            c.fillStyle = "#C84030"; c.beginPath(); c.arc(v.drawX, v.drawY, 6, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#6B4A2A"; c.beginPath(); c.arc(v.drawX, v.drawY - 8, 4, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#E8A84C"; c.beginPath(); c.moveTo(v.drawX + 4, v.drawY - 8); c.lineTo(v.drawX + 9, v.drawY - 7); c.lineTo(v.drawX + 4, v.drawY - 6); c.closePath(); c.fill();
          } else if (v.key === "mailCarrier") {
            /* package near door */
            c.fillStyle = "#A08050"; rr(c, v.drawX - 14, v.drawY - 16, 28, 20, 4); c.fill();
            c.strokeStyle = "#806030"; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(v.drawX - 14, v.drawY - 6); c.lineTo(v.drawX + 14, v.drawY - 6); c.stroke();
            c.fillStyle = "#D04040"; c.beginPath(); c.arc(v.drawX, v.drawY - 16, 4, 0, Math.PI * 2); c.fill();
            /* clickable indicator */
            if (!ev.data.interacted) {
              c.fillStyle = COLORS.gold; c.font = '11px "Fredoka One", sans-serif'; c.textAlign = "center";
              c.fillText(isMobile ? "Tap!" : "Click!", v.drawX, v.drawY - 24);
            }
          }
          c.restore();
        } else if (ev.type === "snow") {
          c.save();
          c.beginPath(); rr(c, 66, 52, 120, 152, 5); c.clip();
          c.fillStyle = "rgba(20,30,50,0.08)"; c.fillRect(66, 52, 120, 152);
          c.fillStyle = "rgba(255,255,255,0.8)";
          for (var si = 0; si < ev.data.length; si++) {
            var sf = ev.data[si];
            var yOff = (game.time * sf.speed + sf.y) % 160;
            var xOff = sf.x + Math.sin(game.time * 0.8 + si) * sf.drift * 0.3;
            c.beginPath(); c.arc(xOff, 52 + yOff, sf.size * 0.5, 0, Math.PI * 2); c.fill();
          }
          c.restore();
        }
      }
      drawThoughtBubble(c, x, y, bubble) {
        const bob = Math.sin(game.time * 2.2) * 4;
        const fadeIn = clamp(bubble.age / 0.4, 0, 1);
        const fadeOut = clamp(bubble.timer / 1.2, 0, 1);
        const alpha = Math.min(fadeIn, fadeOut);
        const pulse = 1 + Math.sin(game.time * 3.5) * 0.06;
        c.save();
        c.globalAlpha = alpha;
        c.translate(x, y + bob);
        c.scale(pulse, pulse);

        /* outer glow */
        drawGlowCircle(c, 0, 0, 38, "rgba(255,240,200,ALPHA)", 0.12);

        /* main cloud - multi-circle for fluffy look */
        c.fillStyle = "rgba(255,255,255,0.96)";
        c.strokeStyle = "rgba(146,104,72,0.25)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse(0, -2, 28, 22, 0, 0, Math.PI * 2);
        c.fill(); c.stroke();
        c.beginPath();
        c.ellipse(-14, 2, 16, 14, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(14, 2, 16, 14, 0, 0, Math.PI * 2);
        c.fill();

        /* connecting trail dots */
        c.fillStyle = "rgba(255,255,255,0.9)";
        c.strokeStyle = "rgba(146,104,72,0.2)";
        c.beginPath(); c.arc(-6, 22, 6, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.arc(-12, 30, 3.5, 0, Math.PI * 2); c.fill(); c.stroke();

        /* V5 — drop-shadow on icon + label so they read against busy decor */
        c.shadowColor = "rgba(80,55,35,0.35)";
        c.shadowBlur = 2;

        /* icon inside - bigger and cleaner */
        if (bubble.want === "pet") {
          drawHeart(c, 0, -4, 1.0, COLORS.softPink);
        } else if (bubble.want === "treat") {
          drawBone(c, 0, -4, 20, 10, "#D49A4A");
        } else if (bubble.want === "toy") {
          drawStar(c, 0, -4, 12, COLORS.gold);
        } else if (bubble.want === "brush") {
          c.fillStyle = "#E0A0C0";
          c.textAlign = "center";
          c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("\u2726", 0, 3);
        } else if (bubble.want === "food") {
          const f = spriteArt.frames.items.foodBowl;
          if (spriteArt.ready && f) {
            const s = 0.035;
            c.drawImage(spriteArt.image, f.x, f.y, f.w, f.h, -f.w * s / 2, -f.h * s, f.w * s, f.h * s);
          }
        } else if (bubble.want === "water") {
          const f = spriteArt.frames.items.waterBowl;
          if (spriteArt.ready && f) {
            const s = 0.035;
            c.drawImage(spriteArt.image, f.x, f.y, f.w, f.h, -f.w * s / 2, -f.h * s, f.w * s, f.h * s);
          }
        }
        /* text label */
        const labels = { pet: "Pets!", treat: "Treat!", toy: "Play!", brush: "Brush!", food: "Food!", water: "Water!" };
        c.fillStyle = "rgba(122,78,54,0.7)";
        c.textAlign = "center";
        c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(labels[bubble.want], 0, 12);
        c.restore();
      }
      draw(c) {
        drawLivingRoom(c);

        /* mode-specific ambient overlay */
        if (!this.menuOpen && !this.decorOpen && !this.dedication) {
          if (this.mode === "treat") {
            c.save();
            c.fillStyle = "rgba(232,168,76,0.04)";
            c.fillRect(0, 0, W, H);
            c.restore();
          } else if (this.mode === "toy") {
            c.save();
            c.fillStyle = "rgba(74,144,217,0.03)";
            c.fillRect(0, 0, W, H);
            c.restore();
          } else if (this.mode === "brush") {
            c.save();
            c.fillStyle = "rgba(224,160,192,0.04)";
            c.fillRect(0, 0, W, H);
            c.restore();
          }
        }

        /* buttons row */
        drawButton(c, this.gamesButton, "Games", this.hoverKey === "games", "#C7A37B");
        drawButton(c, this.decorButton, "Decor", this.hoverKey === "decor", "#C7A37B");
        drawButton(c, this.wardrobeButton, "Closet", this.hoverKey === "wardrobe", "#C7A37B");
        for (const btn of this.modeButtons) {
          const active = this.mode === btn.key;
          drawButton(c, btn, btn.label, this.hoverKey === btn.key, "#C7A37B", "#fff", active);
        }

        /* hub HUD pill row (Phase V.3, relocated V.11) \u2014 single right-anchored
           row at the BOTTOM (br slot 0, y=510, h=22) so it mirrors the goal
           pill on the left and stops colliding with the mode-button row at
           y=16-56. Size hierarchy unchanged: coin (80, primary) > star (60,
           secondary) > streak/daily/weekly (smaller, conditional). Hidden
           pills do NOT reserve space \u2014 row collapses leftward when conditions
           clear. */
        const __hudItems = [{ key: "coin", w: 80 }, { key: "star", w: 60 }];
        if (store.careStreak.count > 0) __hudItems.push({ key: "streak", w: 50 });
        if (store.dailyTasks.tasks.length > 0) __hudItems.push({ key: "daily", w: 44 });
        if (store.weeklyChallenge.challengeId && !store.weeklyChallenge.completed) __hudItems.push({ key: "weekly", w: 50 });
        const __hudStack = placePillStack("br", 0, __hudItems.map(p => p.w), 22);
        const __rectMap = {};
        __hudItems.forEach((p, i) => { __rectMap[p.key] = __hudStack[i]; });
        const coinPill = __rectMap.coin;
        const starPill = __rectMap.star;
        this.hubHudRects = { coin: coinPill, star: starPill };

        /* coin pill \u2014 primary, gold accent, right-edge chevron hint */
        const __coinHov = pointInRect(game.mouse.x, game.mouse.y, coinPill);
        c.save();
        c.fillStyle = __coinHov ? "rgba(255,248,240,0.85)" : "rgba(255,248,240,0.7)";
        rr(c, coinPill.x, coinPill.y, coinPill.w, coinPill.h, 11);
        c.fill();
        c.strokeStyle = "rgba(212,164,76,0.45)";
        c.lineWidth = 1.5;
        c.stroke();
        c.fillStyle = COLORS.gold;
        c.beginPath(); c.arc(coinPill.x + 14, coinPill.y + coinPill.h / 2, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#FFF4C0";
        c.beginPath(); c.arc(coinPill.x + 12, coinPill.y + coinPill.h / 2 - 2, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = COLORS.gold;
        c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.textAlign = "left";
        c.fillText(store.coins, coinPill.x + 24, coinPill.y + 16);
        c.fillStyle = "rgba(122,78,54,0.55)";
        c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.textAlign = "right";
        c.fillText("\u25b8", coinPill.x + coinPill.w - 6, coinPill.y + 16);
        c.restore();
        /* coin popup (anchored to coin pill center) */
        if (this.coinPopup) {
          c.save();
          var cpAlpha = clamp(this.coinPopup.timer / 0.4, 0, 1);
          c.globalAlpha = cpAlpha;
          c.fillStyle = COLORS.gold;
          c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("+" + this.coinPopup.amount, coinPill.x + coinPill.w / 2, coinPill.y - 7 - (1 - cpAlpha) * 12);
          c.restore();
        }

        /* star pill \u2014 secondary, lower contrast + chevron hint */
        const __starHov = pointInRect(game.mouse.x, game.mouse.y, starPill);
        c.save();
        c.fillStyle = __starHov ? "rgba(255,248,240,0.75)" : "rgba(255,248,240,0.5)";
        rr(c, starPill.x, starPill.y, starPill.w, starPill.h, 11);
        c.fill();
        c.fillStyle = COLORS.gold;
        c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.textAlign = "left";
        c.fillText("\u2605 " + totalStarsEarned() + "/33", starPill.x + 6, starPill.y + 15);
        c.fillStyle = "rgba(122,78,54,0.5)";
        c.textAlign = "right";
        c.fillText("\u25b8", starPill.x + starPill.w - 5, starPill.y + 15);
        c.restore();

        /* care streak pill (conditional) */
        if (__rectMap.streak) {
          const streakPill = __rectMap.streak;
          c.save();
          const sk = store.careStreak;
          const streakColor = sk.count >= 7 ? "rgba(255,215,0,0.75)" : sk.count >= 3 ? "rgba(230,140,50,0.75)" : "rgba(180,160,140,0.65)";
          rr(c, streakPill.x, streakPill.y, streakPill.w, streakPill.h, 11);
          c.fillStyle = streakColor;
          c.fill();
          c.fillStyle = "#FF6B35";
          c.beginPath(); c.arc(streakPill.x + 11, streakPill.y + streakPill.h / 2, 4, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#FFD700";
          c.beginPath(); c.arc(streakPill.x + 11, streakPill.y + streakPill.h / 2 - 2, 2.5, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#FFF8F0";
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText(sk.count + "d", streakPill.x + 32, streakPill.y + 15);
          c.restore();
        }

        /* daily tasks pill (conditional) */
        if (__rectMap.daily) {
          const dailyPill = __rectMap.daily;
          c.save();
          const done = store.dailyTasks.completed.length;
          const total = store.dailyTasks.tasks.length;
          rr(c, dailyPill.x, dailyPill.y, dailyPill.w, dailyPill.h, 11);
          c.fillStyle = done >= total ? "rgba(100,190,100,0.75)" : "rgba(180,160,140,0.65)";
          c.fill();
          c.fillStyle = "#FFF8F0";
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText(done + "/" + total + (done >= total ? " \u2605" : ""), dailyPill.x + dailyPill.w / 2, dailyPill.y + 15);
          c.restore();
        }

        /* weekly challenge pill (conditional) */
        if (__rectMap.weekly) {
          const weeklyPill = __rectMap.weekly;
          c.save();
          var wcNearDone = store.weeklyChallenge.progress >= store.weeklyChallenge.target * 0.8;
          if (wcNearDone) {
            c.globalAlpha = 0.5 + Math.sin(game.time * 4) * 0.3;
            c.fillStyle = "rgba(160,130,200,0.3)";
            rr(c, weeklyPill.x - 4, weeklyPill.y - 4, weeklyPill.w + 8, weeklyPill.h + 8, 14);
            c.fill();
            c.globalAlpha = 1;
          }
          rr(c, weeklyPill.x, weeklyPill.y, weeklyPill.w, weeklyPill.h, 11);
          c.fillStyle = "rgba(160,130,200,0.65)";
          c.fill();
          c.fillStyle = "#FFF8F0";
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText(store.weeklyChallenge.progress + "/" + store.weeklyChallenge.target, weeklyPill.x + weeklyPill.w / 2, weeklyPill.y + 15);
          c.restore();
        }

        /* compact pet status - small pills (F.1 — ticks at 50/80, hover
           numeric, F.NEW.1 — joy-decay direction arrow) */
        var _obiPillRect = { x: 14, y: 62, w: 140, h: 38 };
        var _lunaPillRect = { x: 646, y: 62, w: 140, h: 38 };
        var _obiHov = pointInRect(game.mouse.x, game.mouse.y, _obiPillRect);
        var _lunaHov = pointInRect(game.mouse.x, game.mouse.y, _lunaPillRect);
        var _that = this;
        var _drawJoyPill = function(rect, label, mood, joy, fillColor, hist, hov) {
          c.save();
          rr(c, rect.x, rect.y, rect.w, rect.h, 12);
          c.fillStyle = "rgba(255,255,255,0.78)";
          c.fill();
          c.strokeStyle = "rgba(146,104,72,0.12)";
          c.lineWidth = 1;
          c.stroke();
          c.fillStyle = "#5A3E2B";
          c.textAlign = "left";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(label + ": " + _that.moodLabel(label.toLowerCase()), rect.x + 10, rect.y + 16);
          drawMoodIcon(c, mood, rect.x + 128, rect.y + 14);
          /* bar */
          var barX = rect.x + 10, barY = rect.y + 22, barW = 120, barH = 12;
          rr(c, barX, barY, barW, barH, 6);
          c.fillStyle = "rgba(0,0,0,0.08)";
          c.fill();
          var fillW = barW * clamp(joy / 100, 0, 1);
          if (fillW > 1) {
            rr(c, barX, barY, fillW, barH, 6);
            c.fillStyle = fillColor;
            c.fill();
            c.fillStyle = "rgba(255,255,255,0.25)";
            rr(c, barX, barY, fillW, 5, 6);
            c.fill();
          }
          /* F.1 — milestone ticks at 50% and 80% */
          c.fillStyle = "rgba(0,0,0,0.35)";
          c.fillRect(barX + barW * 0.5, barY, 1, barH);
          c.fillRect(barX + barW * 0.8, barY, 1, barH);
          /* F.NEW.1 — decay direction arrow when joy is dropping */
          if (hist && hist.length >= 2) {
            var first = hist[0], last = hist[hist.length - 1];
            var dt = last.t - first.t;
            if (dt > 1.5) {
              var rate = (last.j - first.j) / dt; /* joy per second */
              if (rate < -0.1) {
                c.save();
                c.fillStyle = "rgba(180,80,60,0.85)";
                c.font = '7px "Fredoka One", sans-serif';
                c.textAlign = "left";
                c.fillText("▼", barX + barW + 3, barY + 9);
                c.restore();
              }
            }
          }
          /* F.1 — hover shows numeric to right of bar */
          if (hov) {
            c.fillStyle = "rgba(92,61,46,0.7)";
            c.font = '10px "Fredoka One", sans-serif';
            c.textAlign = "left";
            c.fillText(Math.round(joy) + " / 100", barX + barW + 12, barY + 9);
          }
          c.restore();
        };
        _drawJoyPill(_obiPillRect, "Obi", this.petMood("obi"), this.obi.joy, "#4A90D9", this._joyHistory.obi, _obiHov);
        _drawJoyPill(_lunaPillRect, "Luna", this.petMood("luna"), this.luna.joy, "#A8C686", this._joyHistory.luna, _lunaHov);

        /* warm scene glow */
        drawGlowCircle(c, 400, 380, 200, "rgba(255,240,210,ALPHA)", 0.06);
        /* dynamic character shadows - light source from window (~126, 130) */
        const lightX = 126, lightY = 130;
        const drawDynShadow = (cx, cy, baseW, baseH) => {
          const dx = (cx - lightX) * 0.12;
          const stretch = 1 + Math.abs(cx - lightX) * 0.001;
          const shadowAlpha = clamp(0.18 - Math.abs(cx - lightX) * 0.0003, 0.06, 0.18);
          c.save();
          /* V5 — soft outer shadow from cached sprite (zero per-frame gradient cost) */
          if (sceneCache.charShadow) {
            c.globalAlpha = shadowAlpha / 0.18;
            const dw = baseW * stretch * 2;
            const dh = baseH * 2;
            c.drawImage(sceneCache.charShadow, cx + dx - dw / 2, cy - dh / 2, dw, dh);
          }
          /* V5 — tight inner contact shadow for crisper grounding */
          c.globalAlpha = 1;
          c.fillStyle = "rgba(0,0,0,0.18)";
          c.beginPath();
          c.ellipse(cx + dx, cy + 1, baseW * 0.55, 3, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        };
        drawDynShadow(this.annie.x, Math.max(this.annie.y + 120, 458), 44, 14);
        drawDynShadow(this.obi.x, 466, 42, 14);
        const lunaY = this.luna.perch !== "floor" ? 280 : 462;
        drawDynShadow(this.luna.x, lunaY + 8, 38, 12);

        /* treat mode side indicators */
        if (this.mode === "treat" && !this.menuOpen && !this.decorOpen && !this.dedication) {
          c.save();
          c.globalAlpha = 0.45;
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillStyle = "#4A90D9";
          c.fillText("\u2190 Obi's side", 200, 520);
          c.fillStyle = "#A8C686";
          c.fillText("Luna's side \u2192", 600, 520);
          /* subtle center divider */
          c.strokeStyle = "rgba(122,78,54,0.2)";
          c.setLineDash([4, 6]);
          c.beginPath();
          c.moveTo(400, 110);
          c.lineTo(400, 530);
          c.stroke();
          c.setLineDash([]);
          c.restore();
        }

        drawAnnie(c, this.annie.x, this.annie.y, 1.34, {
          pose: this.annie.pose,
          breath: Math.sin(game.time * 2),
          blink: blinkSignal(game.time + 0.25, 0.55),
          hairSway: Math.sin(game.time * 1.2),
          headTilt: this.annie.pose === "walk" ? 0 : 0.1 * Math.sin(game.time * 0.8),
          facing: this.annie.facing
        });
        drawAccessoryOverlay(c, "annie", this.annie.x, this.annie.y, 1.34, this.annie.pose, this.annie.facing);

        /* ambient events — drawn after background, before characters */
        this.drawAmbientEvent(c);

        /* food & water bowls — drawn before characters */
        this.drawBowl(c, this.foodBowl, "foodBowl", this.hoverKey === "foodBowl");
        this.drawBowl(c, this.waterBowl, "waterBowl", this.hoverKey === "waterBowl");

        /* toy basket */
        this.drawToyBasket(c, this.hoverKey === "toyBasket");

        var obiState = this.petSpriteState("obi");
        /* low joy distress indicator */
        if (this.obi.joy < 30 && !this.obi.sleepy) {
          c.save();
          c.globalAlpha = 0.15 + Math.sin(game.time * 3) * 0.08;
          c.strokeStyle = "#D04040";
          c.lineWidth = 2;
          c.beginPath(); c.arc(this.obi.x, this.obi.y - 20, 30, 0, Math.PI * 2); c.stroke();
          c.restore();
        }
        drawObi(c, this.obi.x, this.obi.y, 1.12, obiState);
        drawAccessoryOverlay(c, "obi", this.obi.x, this.obi.y, 1.12, obiState.pose, obiState.facing);
        /* bone carry visual */
        if (this.obi.carryingToy) {
          var boneDir = obiState.facing || 1;
          var boneX = this.obi.x + boneDir * 14;
          var boneY = this.obi.y - 34;
          c.fillStyle = "#D4B896";
          rr(c, boneX - 8, boneY - 3, 16, 6, 3);
          c.fill();
          c.beginPath();
          c.arc(boneX - 8, boneY, 4, 0, Math.PI * 2);
          c.arc(boneX + 8, boneY, 4, 0, Math.PI * 2);
          c.fill();
        }
        const lunaDrawY = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y;
        const lunaDrawScale = this.luna.perch === "floor" ? 0.98 : this.luna.perch === "tower" ? 1.06 : 0.92;
        var lunaState = this.petSpriteState("luna");
        if (this.luna.joy < 30) {
          c.save();
          c.globalAlpha = 0.15 + Math.sin(game.time * 3 + 1) * 0.08;
          c.strokeStyle = "#D04040";
          c.lineWidth = 2;
          c.beginPath(); c.arc(this.luna.x, lunaDrawY - 20, 25, 0, Math.PI * 2); c.stroke();
          c.restore();
        }
        drawLuna(c, this.luna.x, lunaDrawY, lunaDrawScale, lunaState);
        drawAccessoryOverlay(c, "luna", this.luna.x, lunaDrawY, lunaDrawScale, lunaState.pose, lunaState.facing);

        /* thought bubbles */
        if (this.obiBubble) this.drawThoughtBubble(c, this.obi.x + 32, this.obi.y - 92, this.obiBubble);
        if (this.lunaBubble) {
          const ly = this.luna.perch !== "floor" ? LUNA_PERCHES[this.luna.perch].y : this.luna.y;
          this.drawThoughtBubble(c, this.luna.x + 30, ly - 88, this.lunaBubble);
        }

        for (const t of this.treats) this.drawTreat(c, t);
        this.drawToy(c);

        /* stroke trail */
        if (this.strokeTrail.length > 0 && (this.mode === "pet" || this.mode === "brush")) {
          for (const pt of this.strokeTrail) {
            c.save();
            c.globalAlpha = clamp(pt.life / 0.35, 0, 1) * 0.35;
            const color = this.mode === "brush" ? COLORS.gold : COLORS.softPink;
            c.fillStyle = color;
            c.beginPath();
            c.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            c.fill();
            c.restore();
          }
        }

        /* brush cursor sprite (Update 5) */
        if (this.mode === "brush" && !this.menuOpen && !this.decorOpen && !this.dedication) {
          drawGlowCircle(c, game.mouse.x, game.mouse.y, 28, "rgba(255,220,140,ALPHA)", 0.12);
          const brushFrame = spriteArt.frames.items ? spriteArt.frames.items.brush : null;
          if (brushFrame && spriteArt.image) {
            c.save();
            c.translate(game.mouse.x, game.mouse.y);
            c.rotate(-0.4);
            const bs = 0.18;
            c.drawImage(spriteArt.image, brushFrame.x, brushFrame.y, brushFrame.w, brushFrame.h, -brushFrame.w*bs/2, -brushFrame.h*bs, brushFrame.w*bs, brushFrame.h*bs);
            c.restore();
          }
        }

        /* floating reaction texts (Update 6) */
        for (const ft of this.floatingTexts) {
          c.save();
          const fadeAlpha = clamp(ft.life / 0.4, 0, 1);
          const scaleIn = ft.life > 1.2 ? easeOutBack(clamp((1.5 - ft.life) / 0.3, 0, 1)) : 1;
          c.globalAlpha = fadeAlpha;
          c.translate(ft.x, ft.y);
          c.scale(scaleIn, scaleIn);
          c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.strokeStyle = "rgba(80,55,35,0.45)";
          c.lineWidth = 3;
          c.strokeText(ft.text, 0, 0);
          c.fillStyle = ft.color;
          c.fillText(ft.text, 0, 0);
          c.restore();
        }

        /* decoration notification banner (Update 2) */
        if (this.decorNotification) {
          c.save();
          const dn = this.decorNotification;
          const fadeAlpha = clamp(dn.timer / 0.5, 0, 1) * clamp((4 - dn.timer) / 0.5, 0, 1);
          c.globalAlpha = fadeAlpha;
          const glow = 0.5 + 0.5 * Math.sin(game.time * 4);
          /* shadow */
          c.fillStyle = "rgba(60,30,80,0.12)";
          rr(c, 202, 108, 400, 36, 18);
          c.fill();
          /* banner */
          const grad = c.createLinearGradient(200, 105, 600, 105);
          grad.addColorStop(0, "rgba(128,80,180,0.94)");
          grad.addColorStop(1, "rgba(200,160,60,0.94)");
          rr(c, 200, 105, 400, 36, 18);
          c.fillStyle = grad;
          c.fill();
          c.strokeStyle = "rgba(255,255,255,0.3)";
          c.lineWidth = 1.5;
          c.stroke();
          /* shine */
          c.fillStyle = "rgba(255,255,255,0.1)";
          rr(c, 204, 106, 392, 14, 14);
          c.fill();
          drawGlowCircle(c, 400, 123, 220, "rgba(255,215,0,ALPHA)", 0.06 * glow);
          c.fillStyle = "#FFF8F0";
          c.textAlign = "center";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("\u2605 " + dn.text + " \u2605", 400, 128);
          c.restore();
        }

        /* bond level-up celebration */
        if (this._bondLevelUp) {
          c.save();
          var blu = this._bondLevelUp;
          var bluAlpha = clamp(blu.timer / 0.5, 0, 1) * clamp((4 - blu.timer) / 0.5, 0, 1);
          c.globalAlpha = bluAlpha;
          var heartPulse = 1 + 0.08 * Math.sin(game.time * 6);
          c.fillStyle = "rgba(180,60,100,0.15)";
          rr(c, 202, 148, 400, 40, 20);
          c.fill();
          var bGrad = c.createLinearGradient(200, 145, 600, 145);
          bGrad.addColorStop(0, "rgba(220,80,130,0.92)");
          bGrad.addColorStop(1, "rgba(255,140,180,0.92)");
          rr(c, 200, 145, 400, 40, 20);
          c.fillStyle = bGrad;
          c.fill();
          c.strokeStyle = "rgba(255,255,255,0.35)";
          c.lineWidth = 1.5;
          c.stroke();
          c.fillStyle = "#FFF";
          c.textAlign = "center";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          var lvlName = BOND_LEVEL_NAMES[blu.level] || "";
          c.fillText("\u2764 " + (blu.pet === "obi" ? "Obi" : "Luna") + " Bond Lv." + blu.level + (lvlName ? " — " + lvlName : "") + " \u2764", 400, 170);
          c.restore();
        }

        /* F.6 — visitor banner with countdown ring. Renders at top-center
           for 2s (3s on first-appearance for seasonal visitors). */
        if (this._visitorBanner) {
          var _vb = this._visitorBanner;
          var _vbFade = clamp(_vb.timer / 0.4, 0, 1) * clamp((_vb.total - _vb.timer) / 0.3, 0, 1);
          c.save();
          c.globalAlpha = _vbFade;
          var _vbW = 380, _vbH = 36;
          var _vbX = (W - _vbW) / 2, _vbY = 78;
          rr(c, _vbX, _vbY, _vbW, _vbH, 18);
          c.fillStyle = _vb.isFirst ? "rgba(82,58,42,0.94)" : "rgba(122,78,54,0.92)";
          c.fill();
          c.strokeStyle = "rgba(255,255,255,0.3)";
          c.lineWidth = 1.5;
          c.stroke();
          /* countdown ring on the right */
          var _vbRingCx = _vbX + _vbW - 22, _vbRingCy = _vbY + _vbH / 2;
          var _vbRingP = clamp(_vb.timer / _vb.total, 0, 1);
          c.strokeStyle = "rgba(255,255,255,0.25)";
          c.lineWidth = 2;
          c.beginPath(); c.arc(_vbRingCx, _vbRingCy, 9, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = "rgba(255,215,0,0.9)";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(_vbRingCx, _vbRingCy, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * _vbRingP);
          c.stroke();
          /* text */
          c.fillStyle = "#FFF8F0";
          c.textAlign = "left";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          if (_vb.isFirst) {
            c.fillStyle = "rgba(255,215,0,0.95)";
            c.font = '10px "Fredoka One", sans-serif';
            c.fillText("FIRST APPEARANCE", _vbX + 14, _vbY + 12);
            c.fillStyle = "#FFF8F0";
            c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(_vb.text, _vbX + 14, _vbY + 28);
          } else {
            c.fillText(_vb.text, _vbX + 14, _vbY + 22);
          }
          c.restore();
        }

        /* E.6 — Dedicated Caretaker reveal: cream ribbon at y=H/2 with the
           three characters cheering. Renders for 2.5s with fade-in / fade-out. */
        if (this._dedicatedReveal) {
          var _drT = this._dedicatedReveal.timer;
          var _drTotal = this._dedicatedReveal.total || 2.5;
          var _drElapsed = _drTotal - _drT;
          var _drFadeIn = clamp(_drElapsed / 0.4, 0, 1);
          var _drFadeOut = clamp(_drT / 0.4, 0, 1);
          var _drA = _drFadeIn * _drFadeOut;
          c.save();
          c.globalAlpha = _drA * 0.55;
          c.fillStyle = "rgba(40,28,18,0.6)";
          c.fillRect(0, 0, W, H);
          c.globalAlpha = _drA;
          rr(c, 40, H / 2 - 70, W - 80, 140, 18);
          c.fillStyle = "rgba(255,248,240,0.97)";
          c.fill();
          c.strokeStyle = "rgba(200,160,120,0.35)";
          c.lineWidth = 3;
          c.stroke();
          c.fillStyle = "rgba(122,78,54,0.6)";
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("DAY 30", W / 2, H / 2 - 40);
          c.fillStyle = "#7A4E36";
          c.font = '28px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Dedicated Caretaker", W / 2, H / 2 - 8);
          c.fillStyle = "rgba(122,78,54,0.85)";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Annie has been here every day. Obi and Luna know.", W / 2, H / 2 + 22);
          c.globalAlpha = _drA * clamp(_drElapsed / 0.6, 0, 1);
          var _drBob = Math.sin(game.time * 4) * 4;
          drawAnnie(c, 320, H / 2 + 120 - _drBob, 0.7, { pose: "cheer", breath: Math.sin(game.time * 2), hairSway: Math.sin(game.time * 1.2) });
          drawObi(c, 410, H / 2 + 132 + _drBob * 0.5, 0.65, { pose: "sit", expression: "excited", tail: Math.sin(game.time * 10), bounce: 0.06 * Math.sin(game.time * 6) });
          drawLuna(c, 490, H / 2 + 130 - _drBob * 0.5, 0.6, { pose: "sit", tail: Math.sin(game.time * 3), earTwitch: earSignal(game.time) });
          c.restore();
        }

        c.save();
        /* V7 — demoted status strip: cream fill, smaller text, quieter pulse */
        c.fillStyle = "rgba(92,68,52,0.05)";
        rr(c, 124, 539, 556, 40, 18);
        c.fill();
        rr(c, 122, 536, 556, 40, 18);
        c.fillStyle = "rgba(255,248,240,0.55)";
        c.fill();
        c.strokeStyle = "rgba(146,104,72,0.14)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.08)";
        rr(c, 126, 537, 548, 16, 14);
        c.fill();
        if (this.statusPulse > 0.05) {
          c.globalAlpha = this.statusPulse * 0.08;
          drawGlowCircle(c, 400, 556, 300, "rgba(255,215,0,ALPHA)", 0.10);
          c.globalAlpha = 1;
        }
        c.fillStyle = "#7A5040";
        c.textAlign = "center";
        c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.save();
        c.beginPath();
        c.rect(122, 536, 556, 40);
        c.clip();
        c.fillText(this.statusText, 400, 560);
        c.restore();
        c.restore();

        /* next goal indicator (Phase B.1: anchored via placePill("bl", 0, w)) */
        if (!this.decorOpen && !this.wardrobeOpen && !this.scrapbookOpen && !this.menuOpen) {
          c.save();
          var goalText = this.getNextGoal();
          c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          var goalW = Math.min(c.measureText(goalText).width + 20, 300);
          var goalPill = placePill("bl", 0, goalW, 22);
          c.fillStyle = "rgba(255,248,240,0.55)";
          rr(c, goalPill.x, goalPill.y, goalPill.w, goalPill.h, 8);
          c.fill();
          c.fillStyle = "rgba(122,78,54,0.6)";
          c.textAlign = "left";
          c.fillText(goalText, goalPill.x + 10, goalPill.y + 16);
          c.restore();
        }

        /* camera button */
        c.save();
        var camHover = this.hoverKey === "camera";
        drawHudChip(c, this.cameraButton.x, this.cameraButton.y, camHover);
        c.fillStyle = "#3A2A1E";
        rr(c, this.cameraButton.x + 5, this.cameraButton.y + 9, 18, 13, 3);
        c.fill();
        c.fillStyle = "rgba(255,248,240,0.88)";
        c.beginPath(); c.arc(this.cameraButton.x + 14, this.cameraButton.y + 16, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#3A2A1E";
        rr(c, this.cameraButton.x + 10, this.cameraButton.y + 6, 8, 4, 2);
        c.fill();
        c.restore();

        /* scrapbook button */
        c.save();
        var bookHover = this.hoverKey === "scrapbook";
        drawHudChip(c, this.scrapbookButton.x, this.scrapbookButton.y, bookHover);
        c.fillStyle = "#3A2A1E";
        c.fillRect(this.scrapbookButton.x + 7, this.scrapbookButton.y + 6, 14, 16);
        c.strokeStyle = "rgba(255,248,240,0.88)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(this.scrapbookButton.x + 14, this.scrapbookButton.y + 6);
        c.lineTo(this.scrapbookButton.x + 14, this.scrapbookButton.y + 22);
        c.stroke();
        c.restore();

        /* F.3 — weather chip */
        c.save();
        var weatherHover = this.hoverKey === "weather";
        drawHudChip(c, this.weatherButton.x, this.weatherButton.y, weatherHover);
        var _wbCx = this.weatherButton.x + 14, _wbCy = this.weatherButton.y + 14;
        var _wbKey = store.weather.current || "sunny";
        if (_wbKey === "sunny" || _wbKey === "golden") {
          /* sun: yellow circle with rays */
          c.fillStyle = _wbKey === "golden" ? "#FFB347" : "#F4C430";
          c.beginPath(); c.arc(_wbCx, _wbCy, 5, 0, Math.PI * 2); c.fill();
          c.strokeStyle = _wbKey === "golden" ? "#FFB347" : "#F4C430";
          c.lineWidth = 1.2;
          for (var _wr = 0; _wr < 8; _wr++) {
            var _wrA = _wr * Math.PI / 4;
            c.beginPath();
            c.moveTo(_wbCx + Math.cos(_wrA) * 7, _wbCy + Math.sin(_wrA) * 7);
            c.lineTo(_wbCx + Math.cos(_wrA) * 10, _wbCy + Math.sin(_wrA) * 10);
            c.stroke();
          }
        } else if (_wbKey === "cloudy") {
          c.fillStyle = "#9DA9B5";
          c.beginPath(); c.arc(_wbCx - 4, _wbCy + 1, 4, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(_wbCx + 1, _wbCy - 2, 5, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(_wbCx + 5, _wbCy + 1, 4, 0, Math.PI * 2); c.fill();
          c.fillRect(_wbCx - 7, _wbCy + 1, 14, 5);
        } else if (_wbKey === "rain") {
          c.fillStyle = "#7E8DA3";
          c.beginPath(); c.arc(_wbCx - 3, _wbCy - 3, 4, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(_wbCx + 3, _wbCy - 3, 4, 0, Math.PI * 2); c.fill();
          c.fillRect(_wbCx - 6, _wbCy - 3, 12, 4);
          c.fillStyle = "#5B8AA8";
          for (var _rd = 0; _rd < 3; _rd++) {
            c.beginPath();
            c.arc(_wbCx - 4 + _rd * 4, _wbCy + 5, 1.4, 0, Math.PI * 2); c.fill();
          }
        } else if (_wbKey === "snow") {
          c.fillStyle = "#FFF8F0";
          c.beginPath(); c.arc(_wbCx, _wbCy, 6, 0, Math.PI * 2); c.fill();
          c.strokeStyle = "#A8B8C8";
          c.lineWidth = 1;
          for (var _sa = 0; _sa < 6; _sa++) {
            var _saA = _sa * Math.PI / 3;
            c.beginPath();
            c.moveTo(_wbCx, _wbCy);
            c.lineTo(_wbCx + Math.cos(_saA) * 7, _wbCy + Math.sin(_saA) * 7);
            c.stroke();
          }
        }
        c.restore();

        /* V8 — help/tutorial chip */
        c.save();
        var helpHover = this.hoverKey === "help";
        drawHudChip(c, this.helpButton.x, this.helpButton.y, helpHover);
        c.fillStyle = helpHover ? "#3A2A1E" : "#5C4434";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = 'bold 18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("?", this.helpButton.x + 14, this.helpButton.y + 16);
        c.restore();

        /* V9 — gear/settings chip */
        c.save();
        var gearHover = this.hoverKey === "gear";
        drawHudChip(c, this.gearButton.x, this.gearButton.y, gearHover);
        var _gx = this.gearButton.x + 14, _gy = this.gearButton.y + 14;
        c.strokeStyle = gearHover ? "#3A2A1E" : "#5C4434";
        c.fillStyle = gearHover ? "#3A2A1E" : "#5C4434";
        c.lineWidth = 1.5;
        /* gear body */
        c.beginPath(); c.arc(_gx, _gy, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(255,248,240,0.9)";
        c.beginPath(); c.arc(_gx, _gy, 2, 0, Math.PI * 2); c.fill();
        /* gear teeth */
        c.fillStyle = gearHover ? "#3A2A1E" : "#5C4434";
        for (var _gt = 0; _gt < 6; _gt++) {
          var _gta = _gt * Math.PI / 3;
          c.fillRect(_gx + Math.cos(_gta) * 7 - 1.4, _gy + Math.sin(_gta) * 7 - 1.4, 2.8, 2.8);
        }
        c.restore();

        /* backyard door indicator */
        c.save();
        var doorHover = this.hoverKey === "backyardDoor";
        c.fillStyle = doorHover ? "rgba(168,198,134,0.45)" : "rgba(168,198,134,0.2)";
        rr(c, this.backyardDoor.x, this.backyardDoor.y, this.backyardDoor.w, this.backyardDoor.h, 8);
        c.fill();
        c.fillStyle = doorHover ? "#5C7A3A" : "rgba(92,122,58,0.5)";
        c.textAlign = "center";
        c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("Backyard", this.backyardDoor.x + 30, this.backyardDoor.y + 45);
        c.fillText("\u2192", this.backyardDoor.x + 30, this.backyardDoor.y + 62);
        c.restore();

        /* camera flash effect */
        if (this.cameraFlash > 0) {
          c.save();
          c.globalAlpha = this.cameraFlash;
          c.fillStyle = "#FFFFFF";
          c.fillRect(0, 0, W, H);
          c.restore();
        }

        if (this.tooltip && this.tooltipAlpha > 0.02) drawTooltip(c, this.tooltip.x, this.tooltip.y, this.tooltip.title, this.tooltip.body, this.tooltipAlpha);

        /* ── Games menu overlay ── */
        if (this.menuFade > 0.01) {
          c.save();
          c.globalAlpha = this.menuFade;

          /* Phase D.1 \u2014 unified frame + close (replaces ~33 LOC of hand-coded
             dim/panel/title/close). drawPanelFrame title at y+40 = 100 (was 110,
             30px \u2192 28px to match Decor); subtitle re-rendered below. */
          drawPanelFrame(c, { x: MENU_PANEL.x, y: MENU_PANEL.y, w: MENU_PANEL.w, h: MENU_PANEL.h, title: "Minigames" });
          var totalStars = totalStarsEarned();
          c.fillStyle = "rgba(92,61,46,0.5)";
          c.textAlign = "center";
          c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          if (totalStars === 0) {
            /* D.6 \u2014 empty state: friendlier than "\u2605 0 / 36 earned" */
            c.fillText("Pick a card below to start earning stars!", W / 2, MENU_PANEL.y + 60);
          } else {
            c.fillText("\u2605 " + totalStars + " / 36 stars earned", W / 2, MENU_PANEL.y + 60);
          }
          drawPanelClose(c, MENU_PANEL, this.menuHover === "close");

          /* scroll arrows */
          if (this.menuScroll > 0) {
            c.fillStyle = this.menuHover === "scrollUp" ? "#B84B3A" : "rgba(92,68,52,0.5)";
            c.font = '16px "Fredoka One", sans-serif';
            c.textAlign = "center";
            c.fillText("\u25B2 more", W / 2, 122);
          }
          const visEnd = Math.min(this.menuScroll + 6, this.gameCards.length);
          if (visEnd < this.gameCards.length) {
            c.fillStyle = this.menuHover === "scrollDown" ? "#B84B3A" : "rgba(92,68,52,0.5)";
            c.font = '16px "Fredoka One", sans-serif';
            c.textAlign = "center";
            c.fillText("\u25BC more", W / 2, 126 + 6 * 72 + 12);
          }

          /* game cards */
          for (let vi = 0; vi < visEnd - this.menuScroll; vi++) {
            const i = this.menuScroll + vi;
            const card = this.gameCards[i];
            const cr = this.getCardRect(vi);
            const hover = this.menuHover === i;
            const scale = hover ? 1.02 : 1;

            c.save();
            c.translate(cr.x + cr.w / 2, cr.y + cr.h / 2);
            c.scale(scale, scale);
            c.translate(-(cr.x + cr.w / 2), -(cr.y + cr.h / 2));

            /* card shadow */
            c.fillStyle = "rgba(92,68,52,0.08)";
            rr(c, cr.x + 2, cr.y + 3, cr.w, cr.h, 14);
            c.fill();

            /* card bg */
            rr(c, cr.x, cr.y, cr.w, cr.h, 14);
            c.fillStyle = hover ? "rgba(255,255,255,1)" : "rgba(255,252,245,0.95)";
            c.fill();
            c.strokeStyle = hover ? card.color : "rgba(146,104,72,0.15)";
            c.lineWidth = hover ? 3 : 2;
            c.stroke();

            /* colored accent bar */
            c.fillStyle = card.color;
            rr(c, cr.x, cr.y, 8, cr.h, 4);
            c.fill();
            c.fillRect(cr.x + 7, cr.y + 4, 1, cr.h - 8);

            /* icon circle with glow */
            c.save();
            c.globalAlpha = this.menuFade * 0.28;
            c.fillStyle = card.color;
            c.beginPath(); c.arc(cr.x + 52, cr.y + cr.h / 2, 30, 0, Math.PI * 2); c.fill();
            c.restore();
            c.fillStyle = card.color;
            c.beginPath(); c.arc(cr.x + 52, cr.y + cr.h / 2, 22, 0, Math.PI * 2); c.fill();

            /* icon */
            c.save();
            c.translate(cr.x + 52, cr.y + cr.h / 2);
            if (card.icon === "bone") drawBone(c, 0, 0, 18, 8, "#FFF8F0");
            else if (card.icon === "catEye") drawBadgeIcon(c, "catEye", 0, 0, "#FFF8F0");
            else if (card.icon === "heart") drawHeart(c, 0, 0, 1.0, "#FFF8F0");
            else if (card.icon === "paw") drawBadgeIcon(c, "paw", 0, 0, "#FFF8F0");
            else if (card.icon === "star") drawStar(c, 0, 0, 10, "#FFF8F0");
            c.restore();

            /* text */
            c.fillStyle = "#5C3D2E";
            c.textAlign = "left";
            c.font = '18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(card.title, cr.x + 88, cr.y + 26);
            c.fillStyle = "rgba(92,61,46,0.65)";
            c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(card.desc, cr.x + 88, cr.y + 46);
            c.fillStyle = "rgba(92,61,46,0.5)";
            c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(card.best(), cr.x + 88, cr.y + 62);

            /* Phase D.2 — "NEXT: N" hint when stars < 3 */
            var _stThr = STAR_THRESHOLDS[card.key];
            if (_stThr) {
              var _stBest = store["best_" + card.key] || 0;
              var _stCur = (_stBest >= _stThr[2]) ? 3 : (_stBest >= _stThr[1]) ? 2 : (_stBest >= _stThr[0]) ? 1 : 0;
              if (_stCur < 3) {
                c.save();
                c.fillStyle = "rgba(92,61,46,0.42)";
                c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
                c.textAlign = "right";
                c.fillText("NEXT: " + _stThr[_stCur], cr.x + cr.w - 50, cr.y + 56);
                c.restore();
              }
            }

            /* play arrow */
            c.fillStyle = hover ? card.color : "rgba(92,61,46,0.4)";
            c.beginPath();
            c.moveTo(cr.x + cr.w - 42, cr.y + cr.h / 2 - 10);
            c.lineTo(cr.x + cr.w - 42, cr.y + cr.h / 2 + 10);
            c.lineTo(cr.x + cr.w - 26, cr.y + cr.h / 2);
            c.closePath();
            c.fill();

            /* challenge star indicator */
            var cardBest = store["best_" + card.key] || 0;
            var t3 = { treat: 1400, laser: 1000, cuddle: 90, walk: 800, nap: 1000, bath: 500, sort: 550, pillow: 650, findluna: 500, window: 750, pawstep: 400, wildwand: 500 };
            var has3Stars = cardBest >= (t3[card.key] || 9999);
            if (has3Stars) {
              var hasChalStar = store.challengeStars[card.key];
              c.save();
              c.translate(cr.x + cr.w - 60, cr.y + 14);
              if (hasChalStar) {
                drawGlowCircle(c, 0, 0, 12, "rgba(255,180,0,ALPHA)", 0.2);
                drawStar(c, 0, 0, 8, "#FFA500");
              } else {
                c.globalAlpha = 0.4 + Math.sin(game.time * 3) * 0.15;
                drawStar(c, 0, 0, 8, "#D3C8B4");
                c.globalAlpha = 1;
              }
              c.restore();
            }

            c.restore();
          }

          /* achievements count */
          c.fillStyle = "rgba(92,61,46,0.5)";
          c.textAlign = "center";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          const unlocked = Object.values(store.achievements).filter(Boolean).length;
          c.fillText("Achievements: " + unlocked + " / " + ACHIEVEMENTS.length, W / 2, 558);

          c.restore();
        }

        /* ── Decoration panel overlay (Phase B.3 — uses drawPanelFrame + drawPanelClose;
              B.4 — adds four-tab row: Room / Upgrades / Seasonal / Cozy Set) ── */
        if (this.decorFade > 0.01) {
          c.save();
          c.globalAlpha = this.decorFade;
          drawPanelFrame(c, { x: PANEL_STD.x, y: PANEL_STD.y, w: PANEL_STD.w, h: PANEL_STD.h, title: "Decorate" });

          /* tabs row at y=130; "Stars earned" subtitle dropped — same info lives
             in the HUD pills, lock chips (B.5) communicate per-item gating */
          drawPanelTabs(c, PANEL_STD, DECOR_TABS, this.decorTab || "room");

          const stars = totalStarsEarned();

          /* close button */
          drawPanelClose(c, PANEL_STD, this.decorHover === "close");

          const pageItems = this.getDecorPageItems();
          for (let i = 0; i < pageItems.length; i++) {
            const item = pageItems[i];
            const ir = this.getDecorItemRect(i);
            const hover = this.decorHover === i;
            const have = item.streakUnlock ? store.careStreak.count >= item.streakUnlock : (item.stars === 0 || stars >= item.stars);
            const active = item.type === "toggle" ? store.decor[item.key] : store.decor[item.key] > 0;

            c.save();
            if (!have) c.globalAlpha = 0.6;
            /* item shadow */
            c.fillStyle = "rgba(92,68,52,0.05)";
            rr(c, ir.x + 2, ir.y + 2, ir.w, ir.h, 14);
            c.fill();
            rr(c, ir.x, ir.y, ir.w, ir.h, 14);
            c.fillStyle = hover ? "rgba(255,255,255,1)" : "rgba(255,252,245,0.95)";
            c.fill();
            if (hover && have) drawGlowCircle(c, ir.x + ir.w / 2, ir.y + ir.h / 2, ir.w * 0.6, "rgba(155,125,189,ALPHA)", 0.08);
            c.strokeStyle = hover && have ? "#9B7DBD" : !have ? "rgba(146,104,72,0.1)" : "rgba(146,104,72,0.15)";
            c.lineWidth = hover && have ? 3 : 2;
            c.stroke();

            /* star cost */
            c.fillStyle = have ? COLORS.gold : "rgba(180,160,140,0.5)";
            c.textAlign = "center";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            if (item.streakUnlock) {
              c.fillStyle = have ? "#FF6B35" : "rgba(180,160,140,0.5)";
              c.beginPath(); c.arc(ir.x + 32, ir.y + ir.h / 2 - 6, 6, 0, Math.PI * 2); c.fill();
              c.fillStyle = have ? "#8A6045" : "rgba(160,140,120,0.6)";
              c.fillText(item.streakUnlock + "d", ir.x + 32, ir.y + ir.h / 2 + 18);
            } else {
              drawStar(c, ir.x + 32, ir.y + ir.h / 2 - 8, 10, have ? COLORS.gold : "#C8B8A8");
              c.fillStyle = have ? "#8A6045" : "rgba(160,140,120,0.6)";
              c.fillText(item.stars, ir.x + 32, ir.y + ir.h / 2 + 18);
            }

            /* name and desc */
            c.textAlign = "left";
            c.fillStyle = have ? "#5C3D2E" : "rgba(92,61,46,0.4)";
            c.font = '17px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(item.name, ir.x + 64, ir.y + 30);
            c.fillStyle = have ? "rgba(92,61,46,0.6)" : "rgba(92,61,46,0.3)";
            c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(item.desc, ir.x + 64, ir.y + 50);

            /* lock chip (Phase B.5) — computed before the toggle/cycle render so they
               can be made mutually exclusive (chip when gated, toggle when fully owned). */
            var lockState = decorLockState(item);
            /* toggle/cycle state */
            if (have && !lockState) {
              if (item.type === "toggle") {
                const tx = ir.x + ir.w - 60;
                const ty = ir.y + ir.h / 2;
                rr(c, tx, ty - 12, 44, 24, 12);
                c.fillStyle = active ? "#7DB36C" : "rgba(180,160,140,0.4)";
                c.fill();
                c.fillStyle = "#FFF8F0";
                c.beginPath(); c.arc(active ? tx + 32 : tx + 12, ty, 9, 0, Math.PI * 2); c.fill();
              } else if (item.type === "cycle") {
                c.fillStyle = "rgba(92,61,46,0.6)";
                c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
                c.textAlign = "right";
                c.fillText(item.labels[store.decor[item.key]] + " ▸", ir.x + ir.w - 24, ir.y + ir.h / 2 + 5);
              }
            }
            if (lockState) {
              drawLockChip(c, ir, lockState.kind, lockState.value, lockState.current);
            }
            c.restore();
          }
          /* page navigation */
          if (this.decorPageCount() > 1) {
            c.fillStyle = "#7A4E36";
            c.textAlign = "center";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText("Page " + (this.decorPage + 1) + "/" + this.decorPageCount(), W / 2, 548);
            if (this.decorPage > 0) {
              c.fillStyle = this.decorHover === "prevPage" ? COLORS.warmRed : "#8A6045";
              c.fillText("\u25C4", 318, 548);
            }
            if (this.decorPage < this.decorPageCount() - 1) {
              c.fillStyle = this.decorHover === "nextPage" ? COLORS.warmRed : "#8A6045";
              c.fillText("\u25BA", 482, 548);
            }
          }
          c.restore();
        }

        /* ── Wardrobe panel overlay ── */
        if (this.wardrobeFade > 0.01) {
          c.save();
          c.globalAlpha = this.wardrobeFade;
          /* Phase D.3 — unified frame + tabs + close. Drops "Coins:" subtitle
             (HUD pill duplicates it); "X / Y owned" moves to a single line
             below the tab row. */
          drawPanelFrame(c, { x: WARDROBE_PANEL.x, y: WARDROBE_PANEL.y, w: WARDROBE_PANEL.w, h: WARDROBE_PANEL.h, title: "Closet" });
          drawPanelTabs(c, WARDROBE_PANEL, WARDROBE_TABS, this.wardrobeTab);
          drawPanelClose(c, WARDROBE_PANEL, this.wardrobeHover === "close");
          c.fillStyle = "rgba(92,61,46,0.5)";
          c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText(store.wardrobe.owned.length + " / " + Object.values(ACCESSORIES).reduce(function(s, a) { return s + a.length; }, 0) + " owned", W / 2, 165);
          /* items for current tab (with scroll) */
          var tabItems = this.getWardrobeTabItems();
          var pet = this.wardrobeTab;
          var equippedSlots = store.wardrobe.equipped[pet] || {};
          /* D.6 — empty state when no accessories owned for active character */
          var _wOwnedAny = false;
          for (var _woi = 0; _woi < tabItems.length; _woi++) {
            if (store.wardrobe.owned.indexOf(tabItems[_woi].key) >= 0) { _wOwnedAny = true; break; }
          }
          /* Phase D.4 — hero portrait on the left half. Preview the hovered
             item by overlaying it onto the active equipped state. */
          var previewEquipped = null;
          if (typeof this.wardrobeHover === "number" && tabItems[this.wardrobeHover]) {
            var hovAcc = tabItems[this.wardrobeHover];
            if (store.wardrobe.owned.indexOf(hovAcc.key) >= 0) {
              previewEquipped = {};
              for (var _slk in equippedSlots) previewEquipped[_slk] = equippedSlots[_slk];
              previewEquipped[hovAcc.slot] = hovAcc.key;
            }
          }
          c.save();
          rr(c, 60, 180, 260, 380, 14);
          c.fillStyle = "rgba(122,78,54,0.04)";
          c.fill();
          c.strokeStyle = "rgba(146,104,72,0.12)";
          c.lineWidth = 1;
          c.stroke();
          var _heroCx = 190, _heroBase = 480;
          var _portraitState = { facing: 1, tail: 0 };
          if (pet === "obi") {
            drawObi(c, _heroCx, _heroBase, 2.0, { pose: "sit", expression: "happy", tail: Math.sin(game.time * 1.5) * 0.5, bounce: 0.02, facing: 1 });
            drawAccessoryOverlay(c, "obi", _heroCx, _heroBase, 2.0, "sit", 1, previewEquipped);
          } else if (pet === "luna") {
            drawLuna(c, _heroCx, _heroBase, 1.9, { pose: "sit", tail: Math.sin(game.time * 1.5) * 0.4, earTwitch: 0, facing: 1 });
            drawAccessoryOverlay(c, "luna", _heroCx, _heroBase, 1.9, "sit", 1, previewEquipped);
          } else if (pet === "annie") {
            drawAnnie(c, _heroCx, _heroBase, 1.7, { facing: 1 });
            drawAccessoryOverlay(c, "annie", _heroCx, _heroBase, 1.7, "stand", 1, previewEquipped);
          }
          c.restore();
          if (!_wOwnedAny) {
            /* D.6 — replace items column with a centered empty-state hint
               when 0 accessories owned for this character. Mirrors the
               Photos/Milestones tab convention. */
            c.save();
            c.fillStyle = "rgba(92,61,46,0.55)";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.textAlign = "center";
            c.fillText("No items yet for " + (pet === "obi" ? "Obi" : pet === "luna" ? "Luna" : "Annie") + ".", 540, 340);
            c.fillStyle = "rgba(92,61,46,0.4)";
            c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText("Earn coins from minigames or unlock", 540, 366);
            c.fillText("via care streaks and stars to shop here.", 540, 382);
            c.restore();
          } else {
          c.save();
          c.beginPath();
          c.rect(340, 180, 400, 380);
          c.clip();
          for (var ai = 0; ai < tabItems.length; ai++) {
            var acc = tabItems[ai];
            var wr = this.getWardrobeItemRect(ai);
            if (wr.y + wr.h < 180) continue;
            if (wr.y > 560) continue;
            var owned = store.wardrobe.owned.indexOf(acc.key) >= 0;
            var equipped = equippedSlots[acc.slot] === acc.key;
            var hover = this.wardrobeHover === ai;
            var unlockable = canUnlockAccessory(acc);
            var tierColor = TIER_COLORS[acc.tier] || TIER_COLORS.special;
            c.save();
            if (!unlockable && !owned) c.globalAlpha = 0.5;
            rr(c, wr.x, wr.y, wr.w, wr.h, 10);
            c.fillStyle = hover ? "rgba(255,255,255,1)" : "rgba(255,252,245,0.95)";
            c.fill();
            c.strokeStyle = equipped ? "#7DB36C" : hover ? "#C07850" : "rgba(146,104,72,0.12)";
            c.lineWidth = equipped ? 3 : 1.5;
            c.stroke();
            /* tier dot */
            c.fillStyle = tierColor;
            c.beginPath(); c.arc(wr.x + 22, wr.y + wr.h / 2, 8, 0, Math.PI * 2); c.fill();
            if (acc.tier) {
              c.fillStyle = "#FFF8F0";
              c.font = '10px "Fredoka One", sans-serif';
              c.textAlign = "center";
              c.fillText(acc.tier, wr.x + 22, wr.y + wr.h / 2 + 4);
            }
            /* name + slot */
            c.textAlign = "left";
            c.fillStyle = "#5C3D2E";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(acc.name, wr.x + 40, wr.y + 22);
            c.fillStyle = "rgba(92,61,46,0.45)";
            c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(acc.slot + " slot", wr.x + 40, wr.y + 38);
            /* status */
            c.textAlign = "right";
            c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            if (!owned && !unlockable) {
              c.fillStyle = "rgba(160,140,120,0.5)";
              c.fillText("Locked", wr.x + wr.w - 14, wr.y + wr.h / 2 + 4);
            } else if (!owned && acc.price > 0) {
              c.fillStyle = store.coins >= acc.price ? COLORS.gold : "rgba(180,160,140,0.5)";
              c.fillText(acc.price + " coins", wr.x + wr.w - 14, wr.y + wr.h / 2 + 4);
            } else if (!owned) {
              c.fillStyle = "#7DB36C";
              c.fillText("Free!", wr.x + wr.w - 14, wr.y + wr.h / 2 + 4);
            } else if (equipped) {
              c.fillStyle = "#7DB36C";
              c.fillText("Equipped", wr.x + wr.w - 14, wr.y + wr.h / 2 + 4);
            } else {
              c.fillStyle = "rgba(92,61,46,0.45)";
              c.fillText("Equip", wr.x + wr.w - 14, wr.y + wr.h / 2 + 4);
            }
            c.restore();
          }
          c.restore();
          /* scroll arrows */
          var wMaxScroll = this.wardrobeMaxScroll();
          if (wMaxScroll > 0) {
            c.fillStyle = "#7A4E36";
            c.font = '18px "Fredoka One", sans-serif';
            c.textAlign = "center";
            if (this.wardrobeScrollOffset > 0) {
              c.fillStyle = this.wardrobeHover === "scrollUp" ? "#C07850" : "#7A4E36";
              c.fillText("\u25B2", 540, 188);
            }
            if (this.wardrobeScrollOffset < wMaxScroll) {
              c.fillStyle = this.wardrobeHover === "scrollDown" ? "#C07850" : "#7A4E36";
              c.fillText("\u25BC", 540, 575);
            }
          }
          } /* end else (D.6 empty state branch) */
          c.restore();
        }

        /* ── Scrapbook panel overlay (Phase D.5 — drawPanelFrame + tabs + close) ── */
        if (this.scrapbookFade > 0.01) {
          c.save();
          c.globalAlpha = this.scrapbookFade;
          drawPanelFrame(c, { x: SCRAPBOOK_PANEL.x, y: SCRAPBOOK_PANEL.y, w: SCRAPBOOK_PANEL.w, h: SCRAPBOOK_PANEL.h, title: "Scrapbook" });
          drawPanelTabs(c, SCRAPBOOK_PANEL, SCRAPBOOK_TABS, this.scrapbookTab);
          drawPanelClose(c, SCRAPBOOK_PANEL, this.scrapbookHover === "close");
          /* tab content */
          if (this.scrapbookTab === "photos") {
            var photos = loadJSON("photos", []);
            if (photos.length === 0) {
              c.fillStyle = "rgba(92,61,46,0.4)";
              c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.textAlign = "center";
              c.fillText("No photos yet! Use the camera button to take photos.", W / 2, 300);
            } else {
              /* pre-cache photo Image objects */
              if (!this._photoCache || this._photoCacheLen !== photos.length) {
                this._photoCache = [];
                this._photoCacheLen = photos.length;
                for (var ci = 0; ci < photos.length; ci++) {
                  var cimg = new Image();
                  cimg.src = photos[ci].data;
                  this._photoCache.push({ img: cimg, date: photos[ci].date, room: photos[ci].room });
                }
              }
              var photoMaxRows = Math.ceil(this._photoCache.length / 4);
              var photoMaxScroll = Math.max(0, (photoMaxRows * 140 + 150) - 510);
              this.scrapbookPhotoScroll = clamp(this.scrapbookPhotoScroll, 0, photoMaxScroll);
              c.save();
              c.beginPath();
              c.rect(60, 140, 680, 380);
              c.clip();
              for (var pi = 0; pi < this._photoCache.length; pi++) {
                var px = 80 + (pi % 4) * 170;
                var py = 150 + Math.floor(pi / 4) * 140 - this.scrapbookPhotoScroll;
                if (py + 140 < 140 || py > 530) continue;
                var cached = this._photoCache[pi];
                /* draw thumbnail frame */
                c.save();
                rr(c, px, py, 160, 120, 8);
                c.fillStyle = "rgba(200,190,180,0.3)";
                c.fill();
                c.clip();
                if (cached.img.complete && cached.img.naturalWidth > 0) {
                  c.drawImage(cached.img, px, py, 160, 120);
                }
                c.restore();
                c.strokeStyle = "rgba(146,104,72,0.2)";
                c.lineWidth = 2;
                rr(c, px, py, 160, 120, 8);
                c.stroke();
                /* date + room label */
                c.fillStyle = "rgba(92,61,46,0.5)";
                c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
                c.textAlign = "center";
                c.fillText((cached.room || "") + " — " + (cached.date || ""), px + 80, py + 135);
              }
              c.restore();
              /* photo scroll arrows */
              if (photoMaxScroll > 0) {
                c.fillStyle = "#7A4E36";
                c.font = '18px "Fredoka One", sans-serif';
                c.textAlign = "center";
                if (this.scrapbookPhotoScroll > 0) c.fillText("\u25B2", 400, 148);
                if (this.scrapbookPhotoScroll < photoMaxScroll) c.fillText("\u25BC", 400, 540);
              }
            }
          } else if (this.scrapbookTab === "milestones") {
            var entries = store.scrapbook.entries;
            if (entries.length === 0) {
              c.fillStyle = "rgba(92,61,46,0.4)";
              c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.textAlign = "center";
              c.fillText("No milestones yet! Keep playing to earn them.", W / 2, 300);
            } else {
              var msMaxScroll = Math.max(0, entries.length - 8);
              if (this.scrapbookMilestoneScroll === 0) this.scrapbookMilestoneScroll = msMaxScroll;
              this.scrapbookMilestoneScroll = clamp(this.scrapbookMilestoneScroll, 0, msMaxScroll);
              var startIdx = this.scrapbookMilestoneScroll;
              var endIdx = Math.min(entries.length, startIdx + 8);
              for (var ei = startIdx; ei < endIdx; ei++) {
                var entry = entries[ei];
                var ey = 155 + (ei - startIdx) * 48;
                /* icon */
                if (entry.icon === "heart") {
                  c.fillStyle = COLORS.softPink;
                  c.beginPath(); c.arc(90, ey, 8, 0, Math.PI * 2); c.fill();
                } else if (entry.icon === "bone") {
                  c.fillStyle = "#8B6914";
                  rr(c, 82, ey - 5, 16, 10, 4);
                  c.fill();
                } else {
                  drawStar(c, 90, ey, 8, COLORS.gold);
                }
                /* text */
                c.fillStyle = "#5C3D2E";
                c.textAlign = "left";
                c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
                c.fillText(entry.text, 110, ey + 4);
                /* date */
                c.fillStyle = "rgba(92,61,46,0.4)";
                c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
                c.textAlign = "right";
                c.fillText(entry.date, 720, ey + 4);
              }
              /* milestone scroll arrows */
              if (msMaxScroll > 0) {
                c.fillStyle = "#7A4E36";
                c.font = '18px "Fredoka One", sans-serif';
                c.textAlign = "center";
                if (this.scrapbookMilestoneScroll > 0) c.fillText("\u25B2", 400, 148);
                if (this.scrapbookMilestoneScroll < msMaxScroll) c.fillText("\u25BC", 400, 540);
              }
            }
          } else if (this.scrapbookTab === "stats") {
            c.fillStyle = "#5C3D2E";
            c.textAlign = "left";
            c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            var sy = 165;
            c.fillText("Total Stars: " + totalStarsEarned() + " / 33", 120, sy); sy += 40;
            c.fillText("Total Coins Earned: " + store.stats.totalCoinsEarned, 120, sy); sy += 40;
            c.fillText("Current Coins: " + store.coins, 120, sy); sy += 40;
            c.fillText("Photos Taken: " + store.stats.totalPhotos, 120, sy); sy += 40;
            c.fillText("Care Streak: " + store.careStreak.count + " days", 120, sy); sy += 40;
            c.fillText("Best Streak: " + (store.careStreak.bestStreak || 0) + " days", 120, sy); sy += 40;
            c.fillText("Accessories Owned: " + store.wardrobe.owned.length + " / " + Object.values(ACCESSORIES).reduce(function(sum, arr) { return sum + arr.length; }, 0), 120, sy); sy += 40;
            c.fillText("Scrapbook Entries: " + store.scrapbook.entries.length, 120, sy);
          } else if (this.scrapbookTab === "goals") {
            c.fillStyle = "rgba(92,61,46,0.4)";
            c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.textAlign = "center";
            c.fillText((store.scrapbookGoals.completed || []).length + " / " + SCRAPBOOK_GOALS.length + " completed", W / 2, 145);
            var gy = 155;
            var completedGoals = store.scrapbookGoals.completed || [];
            c.textAlign = "left";
            for (var gi = 0; gi < SCRAPBOOK_GOALS.length; gi++) {
              var goal = SCRAPBOOK_GOALS[gi];
              var done = completedGoals.indexOf(goal.key) >= 0;
              if (gy > 530) break;
              c.save();
              /* checkbox */
              rr(c, 88, gy - 8, 16, 16, 3);
              c.fillStyle = done ? "#7DB36C" : "rgba(200,190,180,0.4)";
              c.fill();
              if (done) {
                c.fillStyle = "#FFF8F0";
                c.font = '10px "Fredoka One", sans-serif';
                c.textAlign = "center";
                c.fillText("\u2713", 96, gy + 3);
              }
              /* goal name + description on one line */
              c.textAlign = "left";
              c.fillStyle = done ? "rgba(92,61,46,0.45)" : "#5C3D2E";
              c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.fillText(goal.name, 114, gy + 2);
              c.fillStyle = "rgba(92,61,46,0.45)";
              c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              /* D.7 — render goal.hint when present (more actionable than desc). */
              c.fillText(goal.hint || goal.desc, 114, gy + 16);
              /* reward */
              c.textAlign = "right";
              c.fillStyle = done ? "rgba(92,61,46,0.35)" : COLORS.gold;
              c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.fillText(done ? "Done!" : "+" + goal.reward, 720, gy + 4);
              c.restore();
              gy += 31;
            }
          } else if (this.scrapbookTab === "tasks") {
            /* F.7 — Tasks subtab: today's daily tasks + active weekly challenge */
            c.fillStyle = "#7A4E36";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.textAlign = "left";
            c.fillText("Today's Tasks", 90, 155);
            var _tdt = store.dailyTasks;
            var _tdy = 180;
            for (var _tti = 0; _tti < (_tdt.tasks || []).length; _tti++) {
              var _ttKey = _tdt.tasks[_tti];
              var _ttDone = (_tdt.completed || []).indexOf(_ttKey) >= 0;
              var _ttTask = DAILY_TASK_POOL.find(function(t) { return t.id === _ttKey; });
              var _ttText = _ttTask ? _ttTask.text : _ttKey;
              c.save();
              rr(c, 90, _tdy - 10, 18, 18, 4);
              c.fillStyle = _ttDone ? "#7DB36C" : "rgba(200,190,180,0.4)";
              c.fill();
              if (_ttDone) {
                c.fillStyle = "#FFF8F0";
                c.font = '11px "Fredoka One", sans-serif';
                c.textAlign = "center";
                c.fillText("✓", 99, _tdy + 4);
              }
              c.fillStyle = _ttDone ? "rgba(92,61,46,0.5)" : "#5C3D2E";
              c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.textAlign = "left";
              c.fillText(_ttText, 118, _tdy + 4);
              c.restore();
              _tdy += 32;
            }
            /* weekly challenge */
            var _twc = store.weeklyChallenge;
            if (_twc && _twc.challengeId) {
              c.fillStyle = "#7A4E36";
              c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.textAlign = "left";
              c.fillText("Weekly Challenge", 90, _tdy + 28);
              c.fillStyle = "#5C3D2E";
              c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
              c.fillText(_twc.text || "(challenge)", 90, _tdy + 50);
              /* progress bar */
              var _twcProg = clamp((_twc.progress || 0) / Math.max(1, _twc.target || 1), 0, 1);
              rr(c, 90, _tdy + 62, 540, 14, 6);
              c.fillStyle = "rgba(0,0,0,0.08)";
              c.fill();
              if (_twcProg > 0) {
                rr(c, 90, _tdy + 62, 540 * _twcProg, 14, 6);
                c.fillStyle = _twc.completed ? "#7DB36C" : "#A05A3C";
                c.fill();
              }
              c.fillStyle = "rgba(92,61,46,0.55)";
              c.font = '11px "Fredoka One", sans-serif';
              c.textAlign = "right";
              c.fillText((_twc.progress || 0) + " / " + (_twc.target || 0) + (_twc.completed ? " — done" : "  +" + (_twc.reward || 0)), 630, _tdy + 92);
            }
          }
          c.restore();
        }

        /* V9 — Settings panel overlay */
        if (this.settingsOpen) {
          drawPanelFrame(c, { x: SETTINGS_PANEL.x, y: SETTINGS_PANEL.y, w: SETTINGS_PANEL.w, h: SETTINGS_PANEL.h, title: "Settings" });
          drawPanelClose(c, SETTINGS_PANEL, this.settingsHover === "close");
          const _sxp = SETTINGS_PANEL.x, _syp = SETTINGS_PANEL.y;
          const _trkX = _sxp + 160, _trkW = 280;
          /* Music volume */
          c.fillStyle = "#5C4434"; c.textAlign = "left"; c.textBaseline = "alphabetic";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Music", _sxp + 40, _syp + 134);
          rr(c, _trkX, _syp + 122, _trkW, 14, 7);
          c.fillStyle = "rgba(0,0,0,0.10)"; c.fill();
          if (store.settings.music > 0) {
            rr(c, _trkX, _syp + 122, _trkW * store.settings.music, 14, 7);
            c.fillStyle = "#A05A3C"; c.fill();
          }
          c.fillStyle = "#7A5040"; c.textAlign = "right";
          c.font = '12px "Fredoka One", sans-serif';
          c.fillText(Math.round(store.settings.music * 100) + "%", _sxp + SETTINGS_PANEL.w - 40, _syp + 134);
          /* SFX volume */
          c.fillStyle = "#5C4434"; c.textAlign = "left";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("SFX", _sxp + 40, _syp + 184);
          rr(c, _trkX, _syp + 172, _trkW, 14, 7);
          c.fillStyle = "rgba(0,0,0,0.10)"; c.fill();
          if (store.settings.sfx > 0) {
            rr(c, _trkX, _syp + 172, _trkW * store.settings.sfx, 14, 7);
            c.fillStyle = "#A05A3C"; c.fill();
          }
          c.fillStyle = "#7A5040"; c.textAlign = "right";
          c.font = '12px "Fredoka One", sans-serif';
          c.fillText(Math.round(store.settings.sfx * 100) + "%", _sxp + SETTINGS_PANEL.w - 40, _syp + 184);
          /* Reduced motion toggle */
          c.fillStyle = "#5C4434"; c.textAlign = "left";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Reduced motion", _sxp + 40, _syp + 234);
          const _tgOn = !!store.settings.reducedMotion;
          rr(c, _trkX + 100, _syp + 220, 80, 28, 14);
          c.fillStyle = _tgOn ? "#7DB36C" : "rgba(180,160,140,0.55)"; c.fill();
          c.fillStyle = "#FFF8F0";
          c.beginPath(); c.arc(_trkX + 100 + (_tgOn ? 64 : 16), _syp + 234, 11, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#FFF8F0"; c.textAlign = "center"; c.textBaseline = "middle";
          c.font = 'bold 11px "Fredoka One", sans-serif';
          c.fillText(_tgOn ? "ON" : "OFF", _trkX + 100 + (_tgOn ? 26 : 54), _syp + 234);
          c.textBaseline = "alphabetic";
          /* Reset tutorial */
          const _rtX = _sxp + 160, _rtY = _syp + 280, _rtW = 220, _rtH = 32;
          const _rtHov = this.settingsHover === "resetTutorial";
          rr(c, _rtX, _rtY, _rtW, _rtH, 16);
          c.fillStyle = _rtHov ? "#A05A3C" : "#C7A37B"; c.fill();
          c.fillStyle = "#FFF8F0";
          c.textAlign = "center"; c.textBaseline = "middle";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Reset tutorial", _rtX + _rtW / 2, _rtY + _rtH / 2);
          c.textBaseline = "alphabetic";
          /* Footer hint */
          c.fillStyle = "rgba(92,61,46,0.45)";
          c.textAlign = "center";
          c.font = '10px "Fredoka One", sans-serif';
          c.fillText("Click a track to set volume  ·  Esc to close", _sxp + SETTINGS_PANEL.w / 2, _syp + SETTINGS_PANEL.h - 28);
        }

        /* daily gift overlay — skip if dedication is showing */
        if (!this.dedication) { this.drawAwayStory(c); this.drawDailyGift(c); }

        /* ── First visit dedication screen ── */
        if (this.dedication) {
          const a = this.dedication.alpha;
          c.save();
          c.globalAlpha = a;
          c.fillStyle = "rgba(60,40,28,0.7)";
          c.fillRect(0, 0, W, H);

          /* warm glow behind text */
          drawGlowCircle(c, W / 2, 260, 220, "rgba(255,230,180,ALPHA)", 0.15 * a);

          /* main panel */
          rr(c, 120, 120, 560, 360, 32);
          c.fillStyle = "rgba(255,248,240,0.96)";
          c.fill();
          c.strokeStyle = "rgba(200,160,120,0.25)";
          c.lineWidth = 3;
          c.stroke();

          /* E.2 — paper-grain overlay. Seeded with a fixed multiplier-product
             pattern so dots don't shimmer between frames. ~120 dots in the
             card rect at very low alpha. */
          c.save();
          c.beginPath();
          rr(c, 120, 120, 560, 360, 32);
          c.clip();
          c.fillStyle = "rgba(0,0,0,0.022)";
          for (var _pgi = 0; _pgi < 120; _pgi++) {
            /* Stable PRNG via two coprime multipliers + modulo. */
            var _pgX = 120 + ((_pgi * 1973) % 560);
            var _pgY = 120 + ((_pgi * 3299) % 360);
            c.fillRect(_pgX, _pgY, 1, 1);
          }
          c.restore();

          /* Phase E.3 — single heart leaves Annie's hand at phase 0.6 and rises.
             Annie's sprite center (320, 370) at scale 0.8 → hand offset (+18, -38)
             puts the spawn anchor at (338, 332). Heart rises 60px/s for 1.5s
             then fades. Replaces the 8-heart confetti row that read as decoration
             rather than dedication. */
          var _ph = this.dedication.phase;
          var _heartT = _ph - 0.6;
          if (_heartT > 0 && _heartT < 1.6) {
            var _heartY = 332 - 60 * _heartT;
            var _heartAlpha = clamp(1 - _heartT / 1.5, 0, 1);
            c.save();
            c.globalAlpha = a * _heartAlpha;
            drawGlowCircle(c, 338, _heartY, 18, "rgba(255,140,170,ALPHA)", 0.18 * _heartAlpha);
            drawHeart(c, 338, _heartY, 0.7, COLORS.softPink);
            c.restore();
          }

          /* Phase E.1 — three-line reveal staggered at phase 0.6 / 1.1 / 1.6.
             Each name line fades in over 0.5s; dismissal allowed at phase >= 2.2. */
          var _annieAlpha = clamp((_ph - 0.6) / 0.5, 0, 1);
          var _obiAlpha = clamp((_ph - 1.1) / 0.5, 0, 1);
          var _lunaAlpha = clamp((_ph - 1.6) / 0.5, 0, 1);
          c.fillStyle = "#7A4E36";
          c.textAlign = "center";
          c.font = '36px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.save(); c.globalAlpha = a * _annieAlpha; c.fillText("For Annie.", W / 2, 200); c.restore();
          c.save(); c.globalAlpha = a * _obiAlpha; c.fillText("For Obi.", W / 2, 244); c.restore();
          c.save(); c.globalAlpha = a * _lunaAlpha; c.fillText("For Luna.", W / 2, 288); c.restore();

          /* characters fade in with the first name line; the active name's
             character gets a brief warm glow as their line lands. */
          c.save();
          c.globalAlpha = a * _annieAlpha;
          /* Annie glow: active 0.6 → 1.1 */
          var _annieGlow = clamp((_ph - 0.6) * 2 - Math.max(0, (_ph - 1.1)) * 4, 0, 1);
          if (_annieGlow > 0.01) drawGlowCircle(c, 320, 370, 60, "rgba(255,200,140,ALPHA)", 0.18 * _annieGlow);
          drawAnnie(c, 320, 370, 0.8, { pose: "cheer", breath: Math.sin(game.time * 2), blink: blinkSignal(game.time, 0.5), hairSway: Math.sin(game.time * 1.2) });
          c.globalAlpha = a * _obiAlpha;
          var _obiGlow = clamp((_ph - 1.1) * 2 - Math.max(0, (_ph - 1.6)) * 4, 0, 1);
          if (_obiGlow > 0.01) drawGlowCircle(c, 420, 390, 50, "rgba(255,200,140,ALPHA)", 0.18 * _obiGlow);
          drawObi(c, 420, 390, 0.7, { pose: "sit", expression: "happy", tail: Math.sin(game.time * 8) });
          c.globalAlpha = a * _lunaAlpha;
          var _lunaGlow = clamp((_ph - 1.6) * 2 - Math.max(0, (_ph - 2.1)) * 4, 0, 1);
          if (_lunaGlow > 0.01) drawGlowCircle(c, 500, 382, 50, "rgba(255,200,140,ALPHA)", 0.18 * _lunaGlow);
          drawLuna(c, 500, 382, 0.65, { pose: "sit", tail: Math.sin(game.time * 2), earTwitch: earSignal(game.time) });
          c.restore();

          /* click to continue — only appears once dismiss is allowed (E.1 gate) */
          if (_ph >= 2.1) {
            var _hintAlpha = clamp((_ph - 2.1) * 2, 0, 1);
            c.globalAlpha = a * _hintAlpha * (0.4 + Math.sin(game.time * 2.5) * 0.3);
            c.fillStyle = "#8A6045";
            c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(isMobile ? "Tap anywhere to begin" : "Click anywhere to begin", W / 2, 454);
          }

          c.restore();
        }

        /* V8 — first-visit tutorial overlay (renders above everything else) */
        if (this.tutorial) {
          drawIntroModal(c, {
            eyebrow: "Welcome",
            title: "Annie's Cozy Day",
            body: "Pet, feed, and play with Obi & Luna.",
            metaText: "Use the mode buttons below • Tap to dismiss"
          });
        }
      }
    }

    SceneRegistry.register("hangout", () => new HangoutScene());


