    // ═══ 13b-scene-backyard.js ═══
    class BackyardScene extends BaseScene {
      constructor() {
        super("backyard");
        this.obi = {
          x: 300, y: 480, homeX: 300, homeY: 480,
          targetX: 300, targetY: 480, joy: store.pet_obi_joy, facing: 1,
          bounce: 0, petTimer: 0, happyTimer: 0,
          pose: "sit", actionTimer: rand(3, 6), action: "idle",
          splashing: false, digging: false
        };
        this.luna = {
          x: 600, y: 480, homeX: 600, homeY: 480,
          targetX: 600, targetY: 480, joy: store.pet_luna_joy, facing: -1,
          wiggle: 0, earTwitch: 0,
          pose: "sit", actionTimer: rand(3, 6), action: "idle",
          inTree: false, stalking: false
        };
        this.goInsideButton = { x: SAFE, y: SAFE, w: 120, h: 34 };
        this.hoverKey = null;
        this.statusText = "Welcome to the backyard!";
        this.statusPulse = 0;
        this.floatingTexts = [];
        this.coinPopup = null;
        this.cameraFlash = 0;
        /* bird feeder */
        this.feeder = { x: 620, y: 360, filled: false, birdTimer: 0, birds: [] };
        /* garden */
        this.garden = { x: 180, y: 460 };
        /* kiddie pool */
        this.pool = { x: 420, y: 480 };
        /* tree */
        this.tree = { x: 680, y: 180 };
        /* tooltip */
        this.tooltip = null;
        /* camera — below mute icon */
        this.cameraButton = { x: W - SAFE - 28, y: SAFE + 34, w: 28, h: 28 };
        /* backyard decor */
        this.byDecorButton = { x: SAFE + 128, y: SAFE - 1, w: 90, h: 36 };
        this.byDecorOpen = false;
        this.byDecorHover = null;
        this.byDecorFade = 0;
        this.byDecorPage = 0;
        /* joy save timer */
        this.joySaveTimer = 0;
        /* first visit scrapbook */
        this.checkedFirstVisit = false;
        /* backyard expansion */
        this.fishingState = null;
        this.fetchState = null;
        this.fetchCooldown = 0;
        this.sprinklerOn = false;
        this.sprinklerTimer = 0;
        this.bugs = [];
        this.bugSpawnTimer = rand(8, 15);
        this.byButterflies = [];
        this.byButterflyTimer = rand(20, 40);
        this.picnicState = null;
        this.picnicCooldown = 0;
      }
      enter() {
        this.obi.joy = store.pet_obi_joy;
        this.luna.joy = store.pet_luna_joy;
        /* C.B25 — `startAmbient` is a no-op once ambient is already
           running, so entering backyard from hangout left the day/night
           music playing. setMusicMood swaps mood (or starts cold). */
        audio.setMusicMood("backyard");
        if (!this.checkedFirstVisit) {
          this.checkedFirstVisit = true;
          var entries = store.scrapbook.entries;
          var hasVisit = false;
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].type === "milestone" && entries[i].text === "Explored the backyard for the first time!") { hasVisit = true; break; }
          }
          if (!hasVisit) {
            addScrapbookEntry("milestone", "Explored the backyard for the first time!", "heart");
          }
        }
        /* scrapbook goal */
        if (store.scrapbookGoals.completed.indexOf("backyardVisit") < 0) {
          store.scrapbookGoals.completed.push("backyardVisit");
          saveJSON("scrapbookGoals", store.scrapbookGoals);
          var bvGoal = SCRAPBOOK_GOALS.find(function(g) { return g.key === "backyardVisit"; });
          if (bvGoal) { addCoins(bvGoal.reward); addScrapbookEntry("goal", "Goal: Outdoor Explorer complete!", "bone"); }
        }
      }
      addFloatingText(text, x, y, color) {
        this.floatingTexts.push({ text: text, x: x, y: y, color: color || COLORS.gold, life: 1.5 });
      }
      earnCoins(amount) {
        addCoins(amount);
        this.coinPopup = { amount: amount, timer: 1.5 };
      }
      capturePhoto() {
        if (!spriteArt.ready) {
          this.statusText = "Please wait for images to load...";
          this.statusPulse = 1;
          return;
        }
        var captureCanvas = makeBufferCanvas(W, H);
        var cc = captureCanvas.getContext("2d");
        var tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
        this.drawBackground(cc, tod);
        this.drawInteractiveObjects(cc);
        var obiSt = { pose: this.obi.pose, expression: "happy", tail: Math.sin(game.time * 7), bounce: this.obi.bounce, facing: this.obi.facing };
        drawObi(cc, this.obi.x, this.obi.y, 1.0, obiSt);
        drawAccessoryOverlay(cc, "obi", this.obi.x, this.obi.y, 1.0, obiSt.pose, obiSt.facing);
        var lunaSt = { pose: this.luna.pose, tail: Math.sin(game.time * 2), facing: this.luna.facing, wiggle: this.luna.wiggle, earTwitch: this.luna.earTwitch };
        drawLuna(cc, this.luna.x, this.luna.y, 0.95, lunaSt);
        drawAccessoryOverlay(cc, "luna", this.luna.x, this.luna.y, 0.95, lunaSt.pose, lunaSt.facing);
        cc.fillStyle = "rgba(122,78,54,0.3)";
        cc.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        cc.textAlign = "right";
        cc.fillText("Annie's Cozy Day", W - 12, H - 8);
        var dataURL;
        try { dataURL = captureCanvas.toDataURL("image/png"); }
        catch(e) { this.statusText = "Couldn't capture photo."; this.statusPulse = 1; return; }
        if (isMobile) { window.open(dataURL, "_blank"); }
        else {
          var link = document.createElement("a");
          link.download = "cozy-moment-" + Date.now() + ".png";
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        this.cameraFlash = 0.4;
        audio.tinyChime();
        this.statusText = "Photo saved!";
        this.statusPulse = 1;
        var thumbCanvas = makeBufferCanvas(160, 120);
        thumbCanvas.getContext("2d").drawImage(captureCanvas, 0, 0, 160, 120);
        var thumbData;
        try { thumbData = thumbCanvas.toDataURL("image/jpeg", 0.6); } catch(e) { return; }
        var photos = loadJSON("photos", []);
        photos.push({ data: thumbData, date: new Date().toDateString(), room: this.name });
        if (photos.length > 20) photos.shift();
        saveJSON("photos", photos);
        store.stats.totalPhotos++;
        saveStats();
        if (store.stats.totalPhotos === 1) {
          addScrapbookEntry("milestone", "Took the first photo!", "star");
        }
      }
      saveJoy() {
        store.pet_obi_joy = this.obi.joy;
        store.pet_luna_joy = this.luna.joy;
        saveNumber("pet_obi_joy", this.obi.joy);
        saveNumber("pet_luna_joy", this.luna.joy);
      }
      update(dt) {
        super.update(dt);
        this.statusPulse = Math.max(0, this.statusPulse - dt * 2.6);
        if (this.coinPopup) {
          this.coinPopup.timer -= dt;
          if (this.coinPopup.timer <= 0) this.coinPopup = null;
        }
        if (this.cameraFlash > 0) this.cameraFlash = Math.max(0, this.cameraFlash - dt * 2.5);
        if (this.byDecorOpen) this.byDecorFade = clamp(this.byDecorFade + dt * 5, 0, 1);
        else this.byDecorFade = clamp(this.byDecorFade - dt * 5, 0, 1);
        /* seasonal particles */
        var season = getCurrentSeason();
        if (season === "spring" && Math.random() < 0.03) {
          spawnParticleBurst(rand(100, 700), rand(-10, 20), ["#FFB7C5", "#FFDAE0", "#FFE4E9"], 1, ["heart"]);
        }
        if (season === "autumn" && Math.random() < 0.025) {
          spawnParticleBurst(rand(100, 700), rand(-10, 20), ["#D4763B", "#C5441B", "#E8A82E"], 1, ["star"]);
        }
        if (season === "summer" && ((store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay)) === 3 && Math.random() < 0.04) {
          spawnParticleBurst(rand(150, 650), rand(200, 450), ["#FFFF66", "#AAFFAA"], 1, ["star"]);
        }
        /* floating texts */
        for (var fi = this.floatingTexts.length - 1; fi >= 0; fi--) {
          this.floatingTexts[fi].life -= dt;
          this.floatingTexts[fi].y -= dt * 30;
          if (this.floatingTexts[fi].life <= 0) this.floatingTexts.splice(fi, 1);
        }
        /* joy save */
        this.joySaveTimer += dt;
        if (this.joySaveTimer > 5) {
          this.joySaveTimer = 0;
          this.saveJoy();
        }
        /* update obi */
        this.updateObiBackyard(dt);
        /* update luna */
        this.updateLunaBackyard(dt);
        /* bird feeder */
        this.updateFeeder(dt);
        /* fishing micro-activity */
        if (this.fishingState) {
          this.fishingState.timer -= dt;
          if (this.fishingState.phase === "waiting") {
            this.fishingState.fishX = this.pool.x + Math.sin(game.time * 1.5) * 30;
            this.fishingState.fishY = this.pool.y - 8 + Math.cos(game.time * 2) * 6;
            if (this.fishingState.timer <= 0) {
              this.fishingState.phase = "strike";
              this.fishingState.timer = 1.2;
              this.statusText = "Now! Click the fish!";
              this.statusPulse = 1;
            }
          } else if (this.fishingState.phase === "strike") {
            if (this.fishingState.timer <= 0) {
              this.fishingState = null;
              this.statusText = "The fish got away!";
              audio.miss();
            }
          } else if (this.fishingState.phase === "caught") {
            if (this.fishingState.timer <= 0) this.fishingState = null;
          }
        }
        /* butterfly catching */
        if (store.backyardDecor.butterflyGarden && store.backyardFlowers > 0) {
          this.byButterflyTimer -= dt;
          if (this.byButterflyTimer <= 0 && this.byButterflies.length < 3) {
            this.byButterflies.push({ x: this.garden.x + rand(-40, 40), y: this.garden.y - rand(20, 50), timer: rand(8, 12), phase: rand(0, 6.28), color: ["#FF69B4", "#87CEEB", "#FFD700"][Math.floor(Math.random() * 3)] });
            this.byButterflyTimer = rand(20, 40);
          }
          for (var bi = this.byButterflies.length - 1; bi >= 0; bi--) {
            var bf = this.byButterflies[bi];
            bf.x += Math.sin(game.time * 2 + bf.phase) * 18 * dt;
            bf.y += Math.cos(game.time * 1.5 + bf.phase) * 10 * dt;
            bf.timer -= dt;
            if (bf.timer <= 0) this.byButterflies.splice(bi, 1);
          }
        }
        /* fetch with Obi */
        if (this.fetchState) {
          this.fetchState.timer -= dt;
          if (this.fetchState.phase === "thrown") {
            this.fetchState.ballX += this.fetchState.ballVX * dt;
            this.fetchState.ballY += this.fetchState.ballVY * dt;
            this.fetchState.ballVY += 400 * dt;
            if (this.fetchState.ballY > 470) {
              this.fetchState.phase = "landed";
              this.fetchState.ballY = 470;
              this.obi.targetX = this.fetchState.ballX;
            }
          } else if (this.fetchState.phase === "landed") {
            if (Math.abs(this.obi.x - this.fetchState.ballX) < 25) {
              this.fetchState.phase = "returning";
              this.fetchState.timer = 6;
              this.obi.targetX = this.obi.homeX;
              this.obi.joy = clamp(this.obi.joy + 4, 0, 100);
              var fetchCoins = Math.random() < 0.3 ? 2 : 1;
              addCoins(fetchCoins);
              this.addFloatingText("+" + fetchCoins + " coins! Good boy!", this.obi.x, this.obi.y - 50, COLORS.gold);
              this.statusText = "Obi brought the ball back!";
              this.statusPulse = 1;
              audio.tinyChime();
              spawnParticleBurst(this.obi.x, this.obi.y - 20, [COLORS.gold, COLORS.softPink], 6, ["star", "heart"]);
            }
          } else if (this.fetchState.phase === "returning") {
            if (Math.abs(this.obi.x - this.obi.homeX) < 30 || this.fetchState.timer <= 0) {
              this.fetchState = null;
              this.fetchCooldown = 3;
              this.obi.targetX = this.obi.homeX;
            }
          }
        }
        if (this.fetchCooldown > 0) this.fetchCooldown -= dt;
        /* sprinkler */
        if (this.sprinklerOn) {
          this.sprinklerTimer -= dt;
          if (this.sprinklerTimer <= 0) {
            this.sprinklerOn = false;
            this.statusText = "Sprinkler turned off.";
          }
          /* Obi runs through sprinkler — joy boost */
          if (Math.abs(this.obi.x - 350) < 60 && !this.obi.splashing) {
            if (Math.random() < dt * 0.5) {
              this.obi.joy = clamp(this.obi.joy + 1, 0, 100);
              spawnParticleBurst(this.obi.x, this.obi.y - 20, ["#87CEEB", "#B3D9FF"], 2, ["star"]);
            }
          }
          /* Luna avoids sprinkler */
          if (Math.abs(this.luna.x - 350) < 80 && !this.luna.inTree) {
            this.luna.targetX = this.luna.x < 350 ? 200 : 550;
          }
        }
        /* bug spawning and movement */
        this.bugSpawnTimer -= dt;
        if (this.bugSpawnTimer <= 0 && this.bugs.length < 4) {
          this.bugs.push({ x: rand(140, 600), y: rand(400, 470), vx: rand(-20, 20), vy: rand(-10, 10), timer: rand(5, 10), type: ["ladybug", "beetle", "ant"][Math.floor(Math.random() * 3)] });
          this.bugSpawnTimer = rand(6, 12);
        }
        for (var bugi = this.bugs.length - 1; bugi >= 0; bugi--) {
          var bug = this.bugs[bugi];
          bug.x += bug.vx * dt;
          bug.y += bug.vy * dt;
          bug.x = clamp(bug.x, 80, 720);
          bug.y = clamp(bug.y, 380, 490);
          if (Math.random() < dt * 0.5) { bug.vx = rand(-25, 25); bug.vy = rand(-12, 12); }
          bug.timer -= dt;
          if (bug.timer <= 0) this.bugs.splice(bugi, 1);
          /* Luna pounces at nearby bugs */
          if (!this.luna.inTree && !this.luna.stalking && Math.abs(this.luna.x - bug.x) < 40 && Math.abs(this.luna.y - bug.y) < 30 && Math.random() < dt * 0.3) {
            this.luna.stalking = true;
            this.luna.targetX = bug.x;
            this.luna.actionTimer = 1.5;
          }
        }
        /* ambient status messages */
        if (!this._ambientMsgTimer) this._ambientMsgTimer = rand(8, 14);
        this._ambientMsgTimer -= dt;
        if (this._ambientMsgTimer <= 0 && this.statusPulse < 0.1) {
          var ambientMsgs = ["The breeze rustles through the garden.", "A bird chirps in the tree.", "Obi sniffs the afternoon air.", "Luna watches a cloud drift by.", "The yard smells like fresh grass.", "Sunshine warms the patio."];
          this.statusText = ambientMsgs[Math.floor(Math.random() * ambientMsgs.length)];
          this._ambientMsgTimer = rand(8, 14);
        }
        /* harvest cooldown */
        if (this.harvestCooldown > 0) this.harvestCooldown -= dt;
        /* picnic cooldown */
        if (this.picnicCooldown > 0) this.picnicCooldown -= dt;
        if (this.picnicState) {
          this.picnicState.timer -= dt;
          if (this.picnicState.timer <= 0) {
            this.picnicState = null;
            this.obi.targetX = this.obi.homeX;
            this.luna.targetX = this.luna.homeX;
          }
        }
      }
      updateObiBackyard(dt) {
        var o = this.obi;
        o.bounce = Math.max(0, o.bounce - dt * 3);
        o.happyTimer = Math.max(0, o.happyTimer - dt);
        o.actionTimer -= dt;
        /* move toward target */
        if (Math.abs(o.x - o.targetX) > 4) {
          o.facing = o.targetX > o.x ? 1 : -1;
          o.x = clamp(o.x + Math.sign(o.targetX - o.x) * 60 * dt, 80, 720);
          o.pose = "run";
        } else if (o.digging) {
          o.pose = "dig";
        } else if (o.splashing) {
          o.pose = "splash";
          o.happyTimer = 0.5;
        } else {
          o.pose = "sit";
        }
        if (o.actionTimer <= 0 && !o.splashing && !o.digging) {
          o.actionTimer = rand(5, 10);
          var choice = Math.random();
          if (choice < 0.3) {
            /* wander */
            o.targetX = clamp(rand(120, 600), 120, 600);
          } else if (choice < 0.5 && store.backyardFlowers > 0) {
            /* dig up a flower */
            o.targetX = this.garden.x;
            o.digging = true;
            o.actionTimer = 3;
          } else {
            /* sniff around */
            o.targetX = clamp(rand(120, 600), 120, 600);
          }
        }
        /* finish digging */
        if (o.digging && o.actionTimer <= 0) {
          o.digging = false;
          if (store.backyardFlowers > 0) {
            o.joy = clamp(o.joy + 4, 0, 100);
            store.backyardFlowers = Math.max(0, store.backyardFlowers - 1);
            saveNumber("backyardFlowers", store.backyardFlowers);
            this.addFloatingText("Obi dug up a flower!", o.x, o.y - 60, "#8B6914");
            this.statusText = "Obi dug up a tulip! Bad boy!";
            this.statusPulse = 1;
            spawnParticleBurst(o.x, o.y - 30, ["#8B6914", "#5C7A3A"], 6, ["star"]);
            var lastSE = store.scrapbook.entries[store.scrapbook.entries.length - 1];
            if (!lastSE || lastSE.text !== "Obi dug up a flower in the garden!") addScrapbookEntry("event", "Obi dug up a flower in the garden!", "bone");
          }
        }
        /* finish splashing */
        if (o.splashing && o.actionTimer <= 0) {
          o.splashing = false;
        }
      }
      updateLunaBackyard(dt) {
        var l = this.luna;
        l.wiggle = Math.sin(game.time * 2) * 0.02;
        l.earTwitch = earSignal(game.time);
        l.actionTimer -= dt;
        if (l.inTree) {
          l.pose = "treeSit";
          l.x = this.tree.x - 30;
          l.y = this.tree.y + 40;
        } else if (l.stalking) {
          l.pose = "stalk";
        } else if (Math.abs(l.x - l.targetX) > 4) {
          l.facing = l.targetX > l.x ? 1 : -1;
          l.x = clamp(l.x + Math.sign(l.targetX - l.x) * 40 * dt, 80, 720);
          l.pose = "lounge";
        } else {
          l.pose = "sit";
        }
        if (l.actionTimer <= 0 && !l.inTree && !l.stalking) {
          l.actionTimer = rand(6, 12);
          var choice = Math.random();
          if (choice < 0.35) {
            /* climb tree */
            l.inTree = true;
            l.actionTimer = rand(8, 15);
          } else if (choice < 0.55) {
            /* stalk bugs */
            l.stalking = true;
            l.targetX = rand(200, 500);
            l.actionTimer = rand(3, 5);
          } else {
            /* wander */
            l.targetX = clamp(rand(150, 650), 150, 650);
          }
        }
        /* finish tree */
        if (l.inTree && l.actionTimer <= 0) {
          l.inTree = false;
          l.y = 480;
          l.targetY = 480;
          l.targetX = rand(200, 500);
        }
        /* finish stalking */
        if (l.stalking && l.actionTimer <= 0) {
          l.stalking = false;
          l.joy = clamp(l.joy + 2, 0, 100);
          spawnParticleBurst(l.x, l.y - 30, ["#5C7A3A"], 3, ["star"]);
        }
      }
      updateFeeder(dt) {
        if (this.feeder.filled) {
          this.feeder.birdTimer -= dt;
          if (this.feeder.birdTimer <= 0 && this.feeder.birds.length === 0) {
            /* birds arrive */
            var count = Math.floor(rand(2, 4));
            for (var i = 0; i < count; i++) {
              this.feeder.birds.push({ x: this.feeder.x + rand(-20, 20), y: this.feeder.y - 10 + rand(-10, 10), phase: rand(0, 6) });
            }
            this.luna.joy = clamp(this.luna.joy + 2, 0, 100);
            this.addFloatingText("+2 Luna joy", this.luna.x, this.luna.y - 50, "#9B7D3C");
            this.feeder.birdTimer = 0;
          } else if (this.feeder.birds.length > 0 && this.feeder.birdTimer < -8) {
            this.feeder.birds = [];
            this.feeder.filled = false;
          }
        }
      }
      getByDecorPageItems() { return BACKYARD_DECOR_ITEMS.slice(this.byDecorPage * 4, this.byDecorPage * 4 + 4); }
      byDecorPageCount() { return Math.ceil(BACKYARD_DECOR_ITEMS.length / 4); }
      getByDecorItemRect(i) { return { x: 130, y: 150 + i * 88, w: 540, h: 78 }; }
      onClick(x, y) {
        /* backyard decor panel */
        if (this.byDecorOpen) {
          if (pointInRect(x, y, panelClose("decor"))) { audio.menu(); this.byDecorOpen = false; return; }
          if (pointInRect(x, y, { x: 300, y: 530, w: 40, h: 30 }) && this.byDecorPage > 0) { this.byDecorPage--; audio.menu(); return; }
          if (pointInRect(x, y, { x: 460, y: 530, w: 40, h: 30 }) && this.byDecorPage < this.byDecorPageCount() - 1) { this.byDecorPage++; audio.menu(); return; }
          var pageItems = this.getByDecorPageItems();
          for (var i = 0; i < pageItems.length; i++) {
            if (pointInRect(x, y, this.getByDecorItemRect(i))) {
              var item = pageItems[i];
              if (!canUnlockDecorItem(item)) {
                audio.miss();
                if (item.tier && !canAccessTier(item.tier)) this.statusText = "Tier " + item.tier + " locked!";
                else if (item.achievementUnlock) this.statusText = "Unlock " + item.achievementUnlock + " first!";
                this.statusPulse = 1; return;
              }
              if (item.price && store.decorPurchased.indexOf(item.key) < 0) {
                if (store.coins < item.price) { audio.miss(); this.statusText = "Need " + item.price + " coins!"; this.statusPulse = 1; return; }
                addCoins(-item.price);
                store.decorPurchased.push(item.key);
                saveJSON("decorPurchased", store.decorPurchased);
                audio.combo();
                this.statusText = "Bought " + item.name + "!";
                this.statusPulse = 1;
              }
              store.backyardDecor[item.key] = !store.backyardDecor[item.key];
              saveBackyardDecor();
              audio.tinyChime();
              return;
            }
          }
          audio.menu(); this.byDecorOpen = false; return;
        }
        /* decor button */
        if (pointInRect(x, y, this.byDecorButton)) {
          audio.menu(); this.byDecorOpen = true; this.byDecorFade = 0; return;
        }
        /* camera */
        if (pointInRect(x, y, this.cameraButton)) {
          this.capturePhoto();
          return;
        }
        /* go inside */
        if (pointInRect(x, y, this.goInsideButton)) {
          audio.menu();
          this.saveJoy();
          transitionTo(SceneRegistry.create("hangout"));
          return;
        }
        /* bird feeder */
        if (Math.abs(x - this.feeder.x) < 40 && Math.abs(y - this.feeder.y) < 40) {
          if (!this.feeder.filled) {
            this.feeder.filled = true;
            this.feeder.birdTimer = rand(8, 15);
            this.feeder.birds = [];
            audio.tinyChime();
            this.statusText = "Feeder filled! Birds will come soon.";
            this.statusPulse = 1;
          }
          return;
        }
        /* garden — plant a flower */
        if (Math.abs(x - this.garden.x) < 50 && Math.abs(y - this.garden.y) < 40) {
          if (store.backyardFlowers < 6) {
            if (store.coins >= 3) {
              addCoins(-3);
              store.backyardFlowers++;
              saveNumber("backyardFlowers", store.backyardFlowers);
              store.stats.totalFlowersPlanted++;
              saveStats();
              if (store.stats.totalFlowersPlanted >= 20 && !store.achievements.greenThumb) {
                store.achievements.greenThumb = true; saveAchievements();
                var gtInfo = ACHIEVEMENTS.find(function(a) { return a.key === "greenThumb"; });
                if (gtInfo && gtInfo.coinBonus) addCoins(gtInfo.coinBonus);
                addScrapbookEntry("achievement", "Green Thumb unlocked!", "star");
                this.addFloatingText("Achievement!", this.garden.x, this.garden.y - 50, COLORS.gold);
              }
              this.trackWeeklyChallenge && this.trackWeeklyChallenge("flowersPlanted", 1);
              audio.tinyChime();
              this.addFloatingText("Planted!", this.garden.x, this.garden.y - 30, "#5C7A3A");
              this.statusText = "Planted a flower! (" + store.backyardFlowers + "/6)";
              this.statusPulse = 1;
            } else {
              audio.miss();
              this.statusText = "Need 3 coins to plant a flower!";
              this.statusPulse = 1;
            }
          } else {
            /* harvest full garden (with cooldown) */
            if (this.harvestCooldown && this.harvestCooldown > 0) {
              this.statusText = "Garden needs time to regrow! (" + Math.ceil(this.harvestCooldown) + "s)";
              this.statusPulse = 0.5;
            } else {
              addCoins(5);
              store.backyardFlowers = 0;
              saveNumber("backyardFlowers", 0);
              this.harvestCooldown = 30;
              this.statusText = "Harvested flowers! +5 coins";
              this.statusPulse = 1;
              this.addFloatingText("+5 coins", this.garden.x, this.garden.y - 30, COLORS.gold);
              if (audio.combo) audio.combo();
            }
          }
          return;
        }
        /* kiddie pool — fishing or splash */
        if (Math.abs(x - this.pool.x) < 50 && Math.abs(y - this.pool.y) < 40) {
          /* fishing: click during strike phase to catch */
          if (this.fishingState && this.fishingState.phase === "strike") {
            if (dist(x, y, this.fishingState.fishX, this.fishingState.fishY) < 35) {
              var fishCoins = rand(3, 6) | 0;
              addCoins(fishCoins);
              this.fishingState = { phase: "caught", timer: 1.5 };
              this.statusText = "Caught a fish! +" + fishCoins + " coins!";
              this.statusPulse = 1;
              this.addFloatingText("+" + fishCoins + " coins!", this.pool.x, this.pool.y - 30, COLORS.gold);
              audio.combo();
              spawnParticleBurst(this.pool.x, this.pool.y - 20, ["#87CEEB", COLORS.gold], 8, ["star"]);
            }
            return;
          }
          /* start fishing if not already active */
          if (!this.fishingState && !this.obi.splashing && !this.obi.digging) {
            if (Math.random() < 0.4) {
              /* fishing mini-activity */
              this.fishingState = { phase: "waiting", timer: rand(1.5, 3.5), fishX: this.pool.x, fishY: this.pool.y - 5 };
              this.statusText = "Something's moving in the pool... wait for it!";
              this.statusPulse = 0.5;
              audio.tinyChime();
            } else {
              /* splash */
              this.obi.targetX = this.pool.x;
              this.obi.splashing = true;
              this.obi.actionTimer = rand(3, 5);
              this.obi.joy = clamp(this.obi.joy + 6, 0, 100);
              this.addFloatingText("+6 Obi joy", this.obi.x, this.obi.y - 50, "#4A90D9");
              this.statusText = "Obi loves the pool!";
              this.statusPulse = 1;
              audio.combo();
              spawnParticleBurst(this.pool.x, this.pool.y - 20, ["#87CEEB", "#B3D9FF"], 8, ["star"]);
            }
          }
          return;
        }
        /* tree click — Luna climbs or comes down */
        if (Math.abs(x - this.tree.x) < 40 && y < 350 && y > 100) {
          if (this.luna.inTree) {
            this.luna.inTree = false;
            this.luna.y = 480;
            this.luna.targetY = 480;
            this.luna.targetX = rand(200, 500);
            this.luna.actionTimer = rand(5, 10);
            this.statusText = "Luna hops down from the tree.";
            this.statusPulse = 0.5;
          } else if (!this.luna.stalking) {
            this.luna.inTree = true;
            this.luna.actionTimer = rand(10, 20);
            this.luna.joy = clamp(this.luna.joy + 3, 0, 100);
            this.statusText = "Luna claims the high ground!";
            this.statusPulse = 0.5;
            this.addFloatingText("+3 joy", this.tree.x - 30, this.tree.y + 30, COLORS.softPink);
            spawnParticleBurst(this.tree.x - 30, this.tree.y + 40, [COLORS.softPink], 3, ["heart"]);
          }
          return;
        }
        /* fetch with Obi — click open ground to throw ball (avoid other interactive zones) */
        if (!this.fetchState && this.fetchCooldown <= 0 && y > 380 && y < 490 && x > 150 && x < 600
            && Math.abs(x - this.pool.x) > 60 && Math.abs(x - this.garden.x) > 60
            && Math.abs(x - this.feeder.x) > 50 && Math.abs(x - 350) > 35
            && !this.obi.splashing && !this.obi.digging) {
          this.fetchState = { phase: "thrown", timer: 8, ballX: 150, ballY: 380, ballVX: (x - 150) * 1.5, ballVY: -200 };
          this.obi.facing = x > this.obi.x ? 1 : -1;
          this.statusText = "Fetch, Obi!";
          this.statusPulse = 0.5;
          audio.tinyChime();
          return;
        }
        /* sprinkler toggle — click near center grass */
        if (Math.abs(x - 350) < 30 && Math.abs(y - 440) < 25 && !this.sprinklerOn) {
          this.sprinklerOn = true;
          this.sprinklerTimer = 15;
          this.statusText = "Sprinkler on! Obi loves it!";
          this.statusPulse = 1;
          audio.combo();
          spawnParticleBurst(350, 430, ["#87CEEB", "#B3D9FF", "#FFFFFF"], 10, ["star"]);
        }
        /* bug catching — click near bugs */
        for (var bugi = this.bugs.length - 1; bugi >= 0; bugi--) {
          var bug = this.bugs[bugi];
          if (dist(x, y, bug.x, bug.y) < 25) {
            this.bugs.splice(bugi, 1);
            var bugCoins = bug.type === "ladybug" ? 3 : bug.type === "beetle" ? 2 : 1;
            addCoins(bugCoins);
            this.addFloatingText("+" + bugCoins + " coins!", bug.x, bug.y - 20, COLORS.gold);
            this.statusText = "Caught a " + bug.type + "!";
            this.statusPulse = 0.5;
            audio.tinyChime();
            spawnParticleBurst(bug.x, bug.y, ["#5C7A3A", "#8B6914"], 4, ["star"]);
            break;
          }
        }
        /* butterfly catching */
        for (var bi = this.byButterflies.length - 1; bi >= 0; bi--) {
          var bf = this.byButterflies[bi];
          if (dist(x, y, bf.x, bf.y) < 28) {
            this.byButterflies.splice(bi, 1);
            var bfCoins = Math.random() < 0.3 ? 2 : 1;
            addCoins(bfCoins);
            this.addFloatingText("+" + bfCoins + " coins!", bf.x, bf.y - 20, COLORS.gold);
            this.statusText = "Caught a butterfly!";
            this.statusPulse = 0.5;
            audio.tinyChime();
            spawnParticleBurst(bf.x, bf.y, [bf.color, "#FFF4C0"], 6, ["star"]);
            break;
          }
        }
        /* picnic time (if picnicBlanket active) */
        if (store.backyardDecor.picnicBlanket && this.picnicCooldown <= 0 && !this.picnicState) {
          if (Math.abs(x - 350) < 50 && Math.abs(y - 430) < 30) {
            this.picnicState = { timer: 10 };
            this.picnicCooldown = 60;
            this.obi.targetX = 330;
            this.obi.targetY = 430;
            this.luna.targetX = 370;
            this.luna.targetY = 430;
            this.obi.joy = clamp(this.obi.joy + 5, 0, 100);
            this.luna.joy = clamp(this.luna.joy + 5, 0, 100);
            addCoins(2);
            this.addFloatingText("Picnic! +5 joy, +2 coins", 350, 410, COLORS.gold);
            this.statusText = "Everyone's enjoying a cozy picnic!";
            this.statusPulse = 1;
            audio.combo();
            spawnParticleBurst(350, 420, [COLORS.softPink, COLORS.gold, "#FFF4C0"], 10, ["heart", "star"]);
          }
        }
      }
      onMouseMove(x, y) {
        this.hoverKey = null;
        this.tooltip = null;
        if (this.byDecorOpen) {
          this.byDecorHover = null;
          if (pointInRect(x, y, panelClose("decor"))) this.byDecorHover = "close";
          var bPageItems = this.getByDecorPageItems();
          for (var bi = 0; bi < bPageItems.length; bi++) {
            if (pointInRect(x, y, this.getByDecorItemRect(bi))) { this.byDecorHover = bi; break; }
          }
          return;
        }
        if (pointInRect(x, y, this.byDecorButton)) this.hoverKey = "byDecor";
        else if (pointInRect(x, y, this.cameraButton)) this.hoverKey = "camera";
        else if (pointInRect(x, y, this.goInsideButton)) this.hoverKey = "inside";
        else if (Math.abs(x - this.feeder.x) < 40 && Math.abs(y - this.feeder.y) < 40) {
          this.hoverKey = "feeder";
          this.tooltip = { x: this.feeder.x, y: this.feeder.y - 40, title: "Bird Feeder", body: this.feeder.filled ? "Birds are coming..." : "Click to fill!" };
        } else if (Math.abs(x - this.garden.x) < 50 && Math.abs(y - this.garden.y) < 40) {
          this.hoverKey = "garden";
          this.tooltip = { x: this.garden.x, y: this.garden.y - 40, title: "Garden", body: store.backyardFlowers + "/6 flowers." + (store.backyardFlowers >= 6 ? " Click to harvest! +5 coins" : " 3 coins to plant.") };
        } else if (Math.abs(x - this.pool.x) < 50 && Math.abs(y - this.pool.y) < 40) {
          this.hoverKey = "pool";
          this.tooltip = { x: this.pool.x, y: this.pool.y - 40, title: "Kiddie Pool", body: this.fishingState ? "Something's in the water!" : "Click for a splash or fishing!" };
        } else if (Math.abs(x - 350) < 20 && Math.abs(y - 440) < 20) {
          this.hoverKey = "sprinkler";
          this.tooltip = { x: 350, y: 420, title: "Sprinkler", body: this.sprinklerOn ? "Sprinkler is running! (" + Math.ceil(this.sprinklerTimer) + "s)" : "Click to turn on!" };
        } else if (Math.abs(x - this.tree.x) < 50 && y > this.tree.y - 60 && y < this.tree.y + 100) {
          this.hoverKey = "tree";
          this.tooltip = { x: this.tree.x, y: this.tree.y - 60, title: "Oak Tree", body: this.luna.inTree ? "Click to call Luna down" : "Click to call Luna up!" };
        }
      }
      interactiveAt(x, y) {
        if (this.byDecorOpen) return true;
        if (pointInRect(x, y, this.byDecorButton)) return true;
        if (pointInRect(x, y, this.cameraButton)) return true;
        if (pointInRect(x, y, this.goInsideButton)) return true;
        if (Math.abs(x - this.feeder.x) < 40 && Math.abs(y - this.feeder.y) < 40) return true;
        if (Math.abs(x - this.garden.x) < 50 && Math.abs(y - this.garden.y) < 40) return true;
        if (Math.abs(x - this.pool.x) < 50 && Math.abs(y - this.pool.y) < 40) return true;
        if (Math.abs(x - this.tree.x) < 50 && y > this.tree.y - 60 && y < this.tree.y + 100) return true;
        return false;
      }
      onKeyDown(key) {
        if (key === "Escape") {
          /* C.NEW.2 — close byDecor panel first; otherwise return to
             hangout (already correct, hangout.enter sets lastVisitTimestamp). */
          if (this.byDecorOpen) {
            audio.menu();
            this.byDecorOpen = false;
            this.byDecorHover = null;
            return;
          }
          audio.menu();
          this.saveJoy();
          transitionTo(SceneRegistry.create("hangout"));
        }
      }
      draw(c) {
        var tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
        this.drawBackground(c, tod);
        this.drawInteractiveObjects(c);
        /* draw pets */
        var obiState = { pose: this.obi.pose, expression: this.obi.happyTimer > 0 ? "excited" : "happy",
          tail: Math.sin(game.time * 7), bounce: this.obi.bounce, facing: this.obi.facing };
        drawObi(c, this.obi.x, this.obi.y, 1.0, obiState);
        drawAccessoryOverlay(c, "obi", this.obi.x, this.obi.y, 1.0, obiState.pose, obiState.facing);

        var lunaState = { pose: this.luna.pose, tail: Math.sin(game.time * 2), facing: this.luna.facing,
          wiggle: this.luna.wiggle, earTwitch: this.luna.earTwitch, pawBat: this.luna.pawBat || 0 };
        drawLuna(c, this.luna.x, this.luna.y, 0.95, lunaState);
        drawAccessoryOverlay(c, "luna", this.luna.x, this.luna.y, 0.95, lunaState.pose, lunaState.facing);

        /* feeder birds */
        for (var bi = 0; bi < this.feeder.birds.length; bi++) {
          var bird = this.feeder.birds[bi];
          c.save();
          c.translate(bird.x + Math.sin(game.time * 3 + bird.phase) * 4, bird.y + Math.cos(game.time * 2 + bird.phase) * 3);
          c.fillStyle = "#5C4434";
          c.beginPath();
          c.arc(0, 0, 5, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#E8A020";
          c.beginPath(); c.moveTo(5, -1); c.lineTo(9, 0); c.lineTo(5, 1); c.closePath(); c.fill();
          /* wings */
          c.fillStyle = "#6B5B4E";
          c.beginPath(); c.ellipse(-3, -2, 6, 3, -0.3 + Math.sin(game.time * 8 + bird.phase) * 0.3, 0, Math.PI * 2); c.fill();
          c.restore();
        }

        /* fishing indicator */
        if (this.fishingState) {
          c.save();
          if (this.fishingState.phase === "waiting") {
            c.globalAlpha = 0.4 + Math.sin(game.time * 3) * 0.2;
            c.fillStyle = "#6B8F8A";
            c.beginPath(); c.ellipse(this.fishingState.fishX, this.fishingState.fishY, 8, 4, 0, 0, Math.PI * 2); c.fill();
          } else if (this.fishingState.phase === "strike") {
            c.fillStyle = "#6B8F8A";
            c.beginPath(); c.ellipse(this.fishingState.fishX, this.fishingState.fishY, 10, 5, Math.sin(game.time * 6) * 0.3, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#FFDD44";
            c.font = '16px "Fredoka One", sans-serif';
            c.textAlign = "center";
            c.fillText("!", this.fishingState.fishX, this.fishingState.fishY - 16);
          } else if (this.fishingState.phase === "caught") {
            c.globalAlpha = clamp(this.fishingState.timer / 0.5, 0, 1);
            c.fillStyle = "#6B8F8A";
            c.beginPath(); c.ellipse(this.pool.x, this.pool.y - 20 - (1.5 - this.fishingState.timer) * 30, 8, 4, 0, 0, Math.PI * 2); c.fill();
          }
          c.restore();
        }
        /* backyard butterflies */
        for (var bbi = 0; bbi < this.byButterflies.length; bbi++) {
          var bbf = this.byButterflies[bbi];
          c.save();
          c.translate(bbf.x, bbf.y);
          var bWing = Math.sin(game.time * 8 + bbf.phase) * 0.6;
          c.fillStyle = bbf.color;
          c.save(); c.rotate(bWing); c.beginPath(); c.ellipse(-4, 0, 6, 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
          c.save(); c.rotate(-bWing); c.beginPath(); c.ellipse(4, 0, 6, 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
          c.fillStyle = "#333"; c.beginPath(); c.arc(0, 0, 1.5, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        /* fetch ball */
        if (this.fetchState) {
          c.save();
          c.fillStyle = "#D04040";
          c.beginPath(); c.arc(this.fetchState.ballX, this.fetchState.ballY, 6, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#FFFFFF";
          c.beginPath(); c.arc(this.fetchState.ballX - 1, this.fetchState.ballY - 2, 2, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        /* sprinkler */
        if (this.sprinklerOn) {
          c.save();
          /* ground wet zone */
          c.fillStyle = "rgba(80,160,220,0.08)";
          c.beginPath(); c.ellipse(350, 445, 70, 25, 0, 0, Math.PI * 2); c.fill();
          /* water arcs — rotating fan pattern */
          c.strokeStyle = "rgba(100,180,240,0.5)"; c.lineWidth = 2.5;
          for (var si = 0; si < 7; si++) {
            var sAngle = (si - 3) * 0.4 + Math.sin(game.time * 2.5) * 0.6;
            var sLen = 50 + Math.sin(game.time * 3.5 + si) * 20;
            c.beginPath();
            c.moveTo(350, 438);
            c.quadraticCurveTo(350 + Math.sin(sAngle) * sLen * 0.5, 438 - sLen * 0.7, 350 + Math.sin(sAngle) * sLen, 445);
            c.stroke();
          }
          /* water droplets — more and spread wider */
          c.fillStyle = "rgba(100,180,240,0.55)";
          for (var sdi = 0; sdi < 14; sdi++) {
            var sdx = 350 + Math.sin(game.time * 2.2 + sdi * 0.95) * (25 + sdi * 6);
            var sdy = 425 + Math.abs(Math.sin(game.time * 2.8 + sdi * 0.7)) * 30;
            c.beginPath(); c.arc(sdx, sdy, 2.5, 0, Math.PI * 2); c.fill();
          }
          /* sparkle highlights */
          c.fillStyle = "rgba(255,255,255,0.5)";
          for (var ssi = 0; ssi < 4; ssi++) {
            var ssx = 350 + Math.sin(game.time * 1.8 + ssi * 1.5) * 40;
            var ssy = 430 + Math.cos(game.time * 2.2 + ssi * 2) * 15;
            c.beginPath(); c.arc(ssx, ssy, 1.5, 0, Math.PI * 2); c.fill();
          }
          c.restore();
        }
        /* bugs */
        for (var bugi = 0; bugi < this.bugs.length; bugi++) {
          var bug = this.bugs[bugi];
          c.save();
          c.translate(bug.x, bug.y);
          if (bug.type === "ladybug") {
            c.fillStyle = "#D04040"; c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#1A1A1A"; c.beginPath(); c.arc(0, -5, 3, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#1A1A1A"; c.beginPath(); c.arc(-2, 1.5, 1.5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(2, 1.5, 1.5, 0, Math.PI * 2); c.fill();
            c.strokeStyle = "#1A1A1A"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, 5); c.stroke();
          } else if (bug.type === "beetle") {
            c.fillStyle = "#2A5A2A"; c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#1A3A1A"; c.beginPath(); c.arc(0, -4.5, 2.5, 0, Math.PI * 2); c.fill();
            c.fillStyle = "rgba(255,255,255,0.15)"; c.beginPath(); c.ellipse(-2, -1, 3, 2, -0.2, 0, Math.PI * 2); c.fill();
          } else {
            c.fillStyle = "#3A2A1A"; c.beginPath(); c.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#2A1A0A"; c.beginPath(); c.arc(0, -3.5, 2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = "#2A1A0A"; c.lineWidth = 0.5;
            c.beginPath(); c.moveTo(-3, 1); c.lineTo(-6, 3); c.stroke();
            c.beginPath(); c.moveTo(3, 1); c.lineTo(6, 3); c.stroke();
          }
          c.restore();
        }
        /* picnic scene */
        if (this.picnicState && store.backyardDecor.picnicBlanket) {
          c.save();
          c.globalAlpha = clamp((10 - this.picnicState.timer) / 1, 0, 1) * clamp(this.picnicState.timer / 1, 0, 1);
          if (Math.random() < 0.03) spawnParticleBurst(350 + rand(-20, 20), 420 + rand(-10, 10), [COLORS.softPink, COLORS.gold], 1, ["heart"]);
          c.restore();
        }

        /* go inside button */
        c.save();
        var insideHover = this.hoverKey === "inside";
        c.fillStyle = insideHover ? "#FFFFFF" : "#F4EBDC";
        rr(c, this.goInsideButton.x, this.goInsideButton.y, this.goInsideButton.w, this.goInsideButton.h, 999);
        c.fill();
        c.strokeStyle = "rgba(58,42,30,0.45)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "#3A2A1E";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("\u2190 Go Inside", this.goInsideButton.x + this.goInsideButton.w / 2, this.goInsideButton.y + this.goInsideButton.h / 2);
        c.restore();

        /* floating texts */
        for (var fi = 0; fi < this.floatingTexts.length; fi++) {
          var ft = this.floatingTexts[fi];
          c.save();
          c.globalAlpha = clamp(ft.life / 0.4, 0, 1);
          c.fillStyle = ft.color;
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText(ft.text, ft.x, ft.y);
          c.restore();
        }

        /* camera button */
        c.save();
        var camH = this.hoverKey === "camera";
        drawHudChip(c, this.cameraButton.x, this.cameraButton.y, camH);
        c.fillStyle = "#3A2A1E";
        rr(c, this.cameraButton.x + 5, this.cameraButton.y + 9, 18, 13, 3);
        c.fill();
        c.fillStyle = "rgba(255,248,240,0.88)";
        c.beginPath(); c.arc(this.cameraButton.x + 14, this.cameraButton.y + 16, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#3A2A1E";
        rr(c, this.cameraButton.x + 10, this.cameraButton.y + 6, 8, 4, 2);
        c.fill();
        c.restore();

        /* coin pill (same as hangout) */
        c.save();
        c.fillStyle = "rgba(255,248,240,0.65)";
        rr(c, 452, 59, 72, 22, 11);
        c.fill();
        c.fillStyle = COLORS.gold;
        c.beginPath(); c.arc(466, 70, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#FFF4C0";
        c.beginPath(); c.arc(464, 68, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = COLORS.gold;
        c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.textAlign = "center";
        c.fillText(store.coins, 503, 75);
        c.restore();
        /* coin popup */
        if (this.coinPopup) {
          c.save();
          var cpAlpha = clamp(this.coinPopup.timer / 0.4, 0, 1);
          c.globalAlpha = cpAlpha;
          c.fillStyle = COLORS.gold;
          c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("+" + this.coinPopup.amount, 503, 6 - (1 - cpAlpha) * 12);
          c.restore();
        }

        /* status text */
        var sAlpha = 0.7 + this.statusPulse * 0.3;
        c.globalAlpha = sAlpha;
        c.fillStyle = "rgba(255,248,240,0.85)";
        rr(c, 122, 540, 556, 36, 18);
        c.fill();
        c.fillStyle = "#5C3D2E";
        c.textAlign = "center";
        c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(this.statusText, 400, 560);
        c.globalAlpha = 1;

        /* tooltip */
        /* backyard decor button */
        drawButton(c, this.byDecorButton, "Decor", this.hoverKey === "byDecor", "#9B7DBD");

        if (this.tooltip && this.tooltipAlpha > 0.02) drawTooltip(c, this.tooltip.x, this.tooltip.y, this.tooltip.title, this.tooltip.body, this.tooltipAlpha);

        /* backyard decor panel overlay (Phase D.NEW — drawPanelFrame + Close) */
        if (this.byDecorFade > 0.01) {
          c.save();
          c.globalAlpha = this.byDecorFade;
          drawPanelFrame(c, { x: PANEL_STD.x, y: PANEL_STD.y, w: PANEL_STD.w, h: PANEL_STD.h, title: "Backyard Decor" });
          drawPanelClose(c, PANEL_STD, this.byDecorHover === "close");
          /* items */
          var bPageItems = this.getByDecorPageItems();
          for (var bdi = 0; bdi < bPageItems.length; bdi++) {
            var bItem = bPageItems[bdi];
            var bir = this.getByDecorItemRect(bdi);
            var bHov = this.byDecorHover === bdi;
            var bActive = store.backyardDecor[bItem.key];
            var bUnlockable = canUnlockDecorItem(bItem);
            var bPurchased = !bItem.price || store.decorPurchased.indexOf(bItem.key) >= 0;
            c.save();
            if (!bUnlockable) c.globalAlpha = 0.5;
            rr(c, bir.x, bir.y, bir.w, bir.h, 14);
            c.fillStyle = bHov ? "rgba(255,255,255,1)" : "rgba(255,252,245,0.95)";
            c.fill();
            c.strokeStyle = bActive ? "#7DB36C" : bHov ? "#9B7DBD" : "rgba(146,104,72,0.12)";
            c.lineWidth = bActive ? 3 : 1.5;
            c.stroke();
            c.textAlign = "left";
            c.fillStyle = "#5C3D2E";
            c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(bItem.name, bir.x + 20, bir.y + 30);
            c.fillStyle = "rgba(92,61,46,0.5)";
            c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText(bItem.desc, bir.x + 20, bir.y + 50);
            c.textAlign = "right";
            c.font = '12px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            if (!bUnlockable) { c.fillStyle = "rgba(160,140,120,0.5)"; c.fillText("Locked", bir.x + bir.w - 16, bir.y + 40); }
            else if (!bPurchased) {
              c.fillStyle = store.coins >= bItem.price ? COLORS.gold : "rgba(160,140,120,0.5)";
              c.fillText(bItem.price + " coins", bir.x + bir.w - 16, bir.y + 40);
            } else if (bActive) { c.fillStyle = "#7DB36C"; c.fillText("Active", bir.x + bir.w - 16, bir.y + 40); }
            else { c.fillStyle = "rgba(92,61,46,0.4)"; c.fillText("Toggle", bir.x + bir.w - 16, bir.y + 40); }
            c.restore();
          }
          /* pagination */
          if (this.byDecorPageCount() > 1) {
            c.fillStyle = "#7A4E36"; c.textAlign = "center";
            c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
            c.fillText("Page " + (this.byDecorPage + 1) + "/" + this.byDecorPageCount(), W / 2, 548);
            var leftArrowHov = this.byDecorPage > 0 && game.mouse.x > 308 && game.mouse.x < 328 && game.mouse.y > 536 && game.mouse.y < 560;
            var rightArrowHov = this.byDecorPage < this.byDecorPageCount() - 1 && game.mouse.x > 472 && game.mouse.x < 492 && game.mouse.y > 536 && game.mouse.y < 560;
            if (this.byDecorPage > 0) { c.fillStyle = leftArrowHov ? "#C07850" : "#7A4E36"; c.fillText("\u25C4", 318, 548); }
            if (this.byDecorPage < this.byDecorPageCount() - 1) { c.fillStyle = rightArrowHov ? "#C07850" : "#7A4E36"; c.fillText("\u25BA", 482, 548); }
          }
          c.restore();
        }

        /* camera flash */
        if (this.cameraFlash > 0) {
          c.save();
          c.globalAlpha = this.cameraFlash;
          c.fillStyle = "#FFFFFF";
          c.fillRect(0, 0, W, H);
          c.restore();
        }
      }
      drawBackground(c, tod) {
        /* sky */
        var skyG = c.createLinearGradient(0, 0, 0, 250);
        if (tod === 0) { skyG.addColorStop(0, "#FFB088"); skyG.addColorStop(1, "#FFCDA8"); }
        else if (tod === 1) { skyG.addColorStop(0, "#87CEEB"); skyG.addColorStop(1, "#B3E0F2"); }
        else if (tod === 2) { skyG.addColorStop(0, "#C87848"); skyG.addColorStop(1, "#D89060"); }
        else { skyG.addColorStop(0, "#1A1E38"); skyG.addColorStop(1, "#2A3058"); }
        c.fillStyle = skyG;
        c.fillRect(0, 0, W, 300);

        /* stars at night */
        if (tod === 3) {
          c.fillStyle = "rgba(255,255,220,0.6)";
          var starPositions = [[100, 30], [250, 60], [380, 20], [520, 50], [650, 35], [720, 70], [180, 80]];
          for (var si = 0; si < starPositions.length; si++) {
            var sx = starPositions[si][0], sy = starPositions[si][1];
            var tw = Math.sin(game.time * 2 + si * 1.3) * 0.3 + 0.7;
            c.globalAlpha = tw * 0.6;
            c.beginPath(); c.arc(sx, sy, 1.5, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;
        }

        /* grass */
        var grassG = c.createLinearGradient(0, 280, 0, H);
        grassG.addColorStop(0, tod === 3 ? "#2A4020" : "#7CB342");
        grassG.addColorStop(1, tod === 3 ? "#1E3018" : "#5A8E2A");
        c.fillStyle = grassG;
        c.fillRect(0, 280, W, H - 280);

        /* grass detail */
        c.fillStyle = tod === 3 ? "rgba(80,120,50,0.3)" : "rgba(100,160,60,0.3)";
        for (var gi = 0; gi < 20; gi++) {
          var gx = (gi * 41 + 15) % W;
          var gy = 290 + (gi * 17 % 200);
          c.beginPath();
          c.moveTo(gx, gy); c.lineTo(gx + 3, gy - 8 - Math.sin(game.time + gi) * 2); c.lineTo(gx + 6, gy);
          c.fill();
        }

        /* fence */
        c.fillStyle = tod === 3 ? "#4A3828" : "#D2B48C";
        for (var fi = 0; fi < 14; fi++) {
          var fx = 20 + fi * 58;
          c.fillRect(fx, 260, 8, 50);
          /* picket top */
          c.beginPath(); c.moveTo(fx - 2, 260); c.lineTo(fx + 4, 248); c.lineTo(fx + 10, 260); c.closePath(); c.fill();
        }
        /* horizontal rails */
        c.fillRect(0, 275, W, 5);
        c.fillRect(0, 295, W, 5);

        /* tree */
        c.fillStyle = tod === 3 ? "#3A2818" : "#8B6914";
        c.fillRect(this.tree.x - 10, this.tree.y, 20, 320);
        /* branch */
        c.fillRect(this.tree.x - 50, this.tree.y + 30, 60, 8);
        /* canopy — seasonal color variation */
        var season = getCurrentSeason();
        var canopyColor = tod === 3 ? "#1E3818" : "#4A8030";
        if (season === "spring") canopyColor = tod === 3 ? "#1E3820" : "#5A9040";
        else if (season === "autumn") canopyColor = tod === 3 ? "#3A2818" : "#C87030";
        else if (season === "winter") canopyColor = tod === 3 ? "#2A3828" : "#6A8858";
        c.fillStyle = canopyColor;
        c.beginPath(); c.arc(this.tree.x, this.tree.y - 20, 60, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(this.tree.x - 30, this.tree.y + 10, 40, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(this.tree.x + 25, this.tree.y + 5, 45, 0, Math.PI * 2); c.fill();
        /* spring cherry blossoms on tree */
        if (season === "spring" && tod !== 3) {
          c.fillStyle = "#FFB7C5";
          for (var bi = 0; bi < 8; bi++) {
            var bx = this.tree.x - 40 + Math.sin(bi * 1.7 + game.time * 0.3) * 50;
            var by = this.tree.y - 30 + Math.cos(bi * 2.1 + game.time * 0.2) * 35;
            c.globalAlpha = 0.6 + 0.3 * Math.sin(bi * 3 + game.time);
            c.beginPath(); c.arc(bx, by, 3, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;
        }
        /* autumn scattered leaves on ground */
        if (season === "autumn") {
          var leafColors = ["#D4763B", "#C5441B", "#E8A82E"];
          for (var li = 0; li < 5; li++) {
            c.fillStyle = leafColors[li % 3];
            c.globalAlpha = 0.5;
            var lx = this.tree.x - 60 + li * 28 + Math.sin(li * 2.3) * 15;
            var ly = this.tree.y + 80 + li * 6;
            c.beginPath(); c.ellipse(lx, ly, 4, 2.5, li * 0.8, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;
        }
      }
      drawInteractiveObjects(c) {
        var tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
        var byFrames = spriteArt.ready ? spriteArt.frames.backyard : null;

        /* bench — decorative, drawn behind other objects */
        if (byFrames && byFrames.bench) {
          drawFrameImage(c, byFrames.bench, 100, 380, 0.8, { baseScale: 1, shadowAlpha: 0.10 });
        } else {
          c.fillStyle = tod === 3 ? "#3A3020" : "#8B7A58";
          rr(c, 60, 368, 80, 30, 6); c.fill();
          c.fillRect(66, 398, 6, 20); c.fillRect(128, 398, 6, 20);
        }

        /* garden patch */
        if (byFrames && byFrames.gardenPatch) {
          drawFrameImage(c, byFrames.gardenPatch, this.garden.x, this.garden.y, 0.8, { baseScale: 1, shadowAlpha: 0.10 });
        } else {
          c.fillStyle = tod === 3 ? "#3A2818" : "#7A5428";
          rr(c, this.garden.x - 50, this.garden.y - 18, 100, 40, 8);
          c.fill();
        }
        /* flowers on top of garden */
        var flowerColors = ["#FF6B9D", "#FFD700", "#FF8C42", "#E040FB", "#4FC3F7", "#AED581"];
        for (var fi = 0; fi < store.backyardFlowers; fi++) {
          var fx = this.garden.x - 35 + fi * 14;
          var fy = this.garden.y - 16;
          c.fillStyle = "#5C7A3A";
          c.fillRect(fx, fy, 2, 14);
          c.fillStyle = flowerColors[fi % flowerColors.length];
          c.beginPath(); c.arc(fx + 1, fy - 4, 5, 0, Math.PI * 2); c.fill();
        }

        /* kiddie pool */
        if (byFrames && byFrames.kiddiePool) {
          drawFrameImage(c, byFrames.kiddiePool, this.pool.x, this.pool.y, 0.5, { baseScale: 1, shadowAlpha: 0.08 });
        } else {
          c.fillStyle = "#4A90D9";
          c.globalAlpha = 0.5;
          c.beginPath(); c.ellipse(this.pool.x, this.pool.y, 50, 22, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          c.strokeStyle = "#87CEEB"; c.lineWidth = 3;
          c.beginPath(); c.ellipse(this.pool.x, this.pool.y, 50, 22, 0, 0, Math.PI * 2); c.stroke();
        }
        /* sprinkler base (always visible, pulsing when off) */
        if (!this.sprinklerOn) {
          c.save();
          c.globalAlpha = 0.15 + Math.sin(game.time * 2) * 0.08;
          c.fillStyle = "#87CEEB";
          c.beginPath(); c.arc(350, 440, 14, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        c.fillStyle = "#606060";
        c.fillRect(348, 440, 4, 10);
        c.fillStyle = "#808080";
        c.beginPath(); c.arc(350, 440, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#A0A0A0";
        c.beginPath(); c.arc(350, 440, 3, 0, Math.PI * 2); c.fill();
        /* water ripples on pool */
        c.strokeStyle = "rgba(255,255,255,0.3)"; c.lineWidth = 1;
        c.beginPath();
        c.ellipse(this.pool.x + Math.sin(game.time * 2) * 12, this.pool.y, 22, 9, 0, 0, Math.PI * 2);
        c.stroke();

        /* bird feeder */
        if (byFrames && byFrames.birdFeeder) {
          drawFrameImage(c, byFrames.birdFeeder, this.feeder.x, this.feeder.y, 0.35, { baseScale: 1, shadowAlpha: 0.10 });
        } else {
          c.fillStyle = tod === 3 ? "#3A2818" : "#8B6914";
          c.fillRect(this.feeder.x - 4, this.feeder.y, 8, 55);
          c.fillStyle = tod === 3 ? "#4A3828" : "#D2B48C";
          rr(c, this.feeder.x - 22, this.feeder.y - 12, 44, 18, 5);
          c.fill();
        }
        /* seed indicator */
        if (this.feeder.filled) {
          c.fillStyle = "#E8C44C";
          c.beginPath(); c.arc(this.feeder.x, this.feeder.y - 4, 7, 0, Math.PI * 2); c.fill();
        }
        /* ── Backyard decorations ── */
        var bd = store.backyardDecor;
        if (bd.windChime) {
          var wcSwing = Math.sin(game.time * 1.5) * 0.12;
          c.save(); c.translate(this.tree.x - 40, this.tree.y + 34); c.rotate(wcSwing);
          c.strokeStyle = "#A8A0A0"; c.lineWidth = 1;
          for (var wci = 0; wci < 4; wci++) {
            c.beginPath(); c.moveTo(-6 + wci * 4, 0); c.lineTo(-6 + wci * 4, 12 + wci * 2); c.stroke();
          }
          c.fillStyle = "#C0B8B0";
          c.beginPath(); c.ellipse(0, -2, 10, 3, 0, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        if (bd.gardenGnome) {
          c.fillStyle = "#D04040"; /* hat */
          c.beginPath(); c.moveTo(this.garden.x + 55, 448); c.lineTo(this.garden.x + 60, 430); c.lineTo(this.garden.x + 65, 448); c.closePath(); c.fill();
          c.fillStyle = "#FFDFC4"; /* face */
          c.beginPath(); c.arc(this.garden.x + 60, 453, 5, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#4060C0"; /* body */
          rr(c, this.garden.x + 55, 458, 10, 12, 3); c.fill();
        }
        if (bd.picnicBlanket) {
          c.save(); c.globalAlpha = 0.7;
          c.fillStyle = "#DD4444";
          c.beginPath(); c.ellipse(300, 420, 40, 18, 0.1, 0, Math.PI * 2); c.fill();
          /* checkered pattern */
          c.fillStyle = "#FFFFFF"; c.globalAlpha = 0.3;
          for (var pi = 0; pi < 4; pi++) { c.fillRect(280 + pi * 12, 412, 6, 6); c.fillRect(286 + pi * 12, 418, 6, 6); }
          c.restore();
        }
        if (bd.birdBath) {
          c.fillStyle = "#A0A0A0";
          c.fillRect(this.feeder.x - 40, 310, 5, 25);
          c.beginPath(); c.ellipse(this.feeder.x - 37, 308, 16, 6, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(100,180,240,0.4)";
          c.beginPath(); c.ellipse(this.feeder.x - 37, 306, 12, 4, 0, 0, Math.PI * 2); c.fill();
        }
        if (bd.lanterns) {
          var tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
          var lanternGlow = tod >= 2 ? 0.6 : 0.2;
          c.strokeStyle = "rgba(160,140,120,0.4)"; c.lineWidth = 1;
          c.beginPath(); c.moveTo(40, 262); c.quadraticCurveTo(400, 248, 760, 262); c.stroke();
          var lanternColors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"];
          for (var li = 0; li < 10; li++) {
            var lx = 60 + li * 72;
            var ly = 258 + Math.sin((li / 9) * Math.PI) * 8;
            c.fillStyle = lanternColors[li % 4];
            c.globalAlpha = lanternGlow;
            rr(c, lx - 5, ly, 10, 14, 4); c.fill();
            c.globalAlpha = 1;
          }
        }
        if (bd.birdHouse) {
          /* birdhouse mounted on tree trunk */
          c.fillStyle = "#D2A870"; c.fillRect(660, 300, 6, 30);
          c.fillStyle = "#E8C88C"; rr(c, 648, 284, 30, 20, 4); c.fill();
          c.fillStyle = "#D04040"; c.beginPath(); c.moveTo(646, 286); c.lineTo(663, 272); c.lineTo(680, 286); c.closePath(); c.fill();
          c.fillStyle = "#5C4434"; c.beginPath(); c.arc(663, 294, 3.5, 0, Math.PI * 2); c.fill();
        }
        if (bd.sundial) {
          c.fillStyle = "#A09890";
          c.beginPath(); c.ellipse(400, 440, 18, 8, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#8A8078";
          c.beginPath(); c.moveTo(400, 440); c.lineTo(398, 424); c.lineTo(402, 440); c.closePath(); c.fill();
        }
        if (bd.dogHouse) {
          c.fillStyle = "#B08050"; rr(c, 70, 418, 50, 38, 4); c.fill();
          c.fillStyle = "#D04040"; c.beginPath(); c.moveTo(66, 420); c.lineTo(95, 403); c.lineTo(124, 420); c.closePath(); c.fill();
          c.fillStyle = "#5C3020"; c.beginPath(); c.ellipse(95, 446, 10, 12, 0, Math.PI, Math.PI * 2); c.fill();
          c.fillStyle = "#E8D8C0"; c.font = '8px "Fredoka One", sans-serif'; c.textAlign = "center"; c.fillText("OBI", 95, 414);
        }
        if (bd.butterflyGarden && store.backyardFlowers > 0) {
          var bfColors = ["#FF69B4", "#87CEEB", "#FFD700"];
          for (var bfi = 0; bfi < 3; bfi++) {
            var bfx = this.garden.x - 20 + bfi * 20 + Math.sin(game.time * 2 + bfi * 2) * 12;
            var bfy = this.garden.y - 30 + Math.cos(game.time * 1.5 + bfi * 1.7) * 10;
            c.fillStyle = bfColors[bfi];
            var wing = Math.abs(Math.sin(game.time * 5 + bfi * 1.3)) * 4 + 2;
            c.beginPath(); c.ellipse(bfx - 3, bfy, wing, 3, -0.3, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(bfx + 3, bfy, wing, 3, 0.3, 0, Math.PI * 2); c.fill();
            c.fillStyle = "#333"; c.beginPath(); c.arc(bfx, bfy, 1.5, 0, Math.PI * 2); c.fill();
          }
        }
        if (bd.fountain) {
          c.fillStyle = "#909898";
          c.beginPath(); c.ellipse(500, 380, 28, 12, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#A0A8A8"; c.fillRect(496, 355, 8, 25);
          c.fillStyle = "rgba(100,180,240,0.35)";
          c.beginPath(); c.ellipse(500, 378, 22, 8, 0, 0, Math.PI * 2); c.fill();
          /* water streams */
          c.strokeStyle = "rgba(100,180,240,0.5)"; c.lineWidth = 1.5;
          for (var fsi = 0; fsi < 3; fsi++) {
            var fsa = (fsi - 1) * 0.4;
            var fsy = Math.sin(game.time * 3 + fsi) * 2;
            c.beginPath();
            c.moveTo(500, 355);
            c.quadraticCurveTo(500 + fsa * 15, 345 + fsy, 500 + fsa * 20, 370);
            c.stroke();
          }
        }
      }
    }

    SceneRegistry.register("backyard", function() { return new BackyardScene(); });


