    // ═══ Luna's Wild Wand — Flappy-Bird-inspired wand toy minigame ═══
    class WildWandScene extends BaseMinigameScene {
      constructor() {
        super("wildwand", "Luna's Wild Wand", "Tap to wiggle the wand. Lead Luna through the gaps.", [100, 250, 500], 90);
        this.scrollSpeed = 120;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.passed = 0;
        this.gameOver = false;
        this.gameOverTimer = 0;
        /* wand anchor (player-controlled) */
        this.anchor = { x: 200, y: 200 };
        /* lure (fuzzy mouse — physics-driven) */
        this.lure = { x: 200, y: 300, vx: 0, vy: 0 };
        /* Luna (chases the lure) */
        this.luna = { x: 180, y: 300, vx: 0, vy: 0, facing: 1, excitement: 0 };
        this.nearMissTimer = 0;
        this.scrollX = 0;
      }
      enter() {
        super.enter();
        this.scrollSpeed = 120;
        this.obstacles = [];
        this.obstacleTimer = 3.5;
        this.passed = 0;
        this.gameOver = false;
        this.gameOverTimer = 0;
        this.anchor = { x: 200, y: 250 };
        this.lure = { x: 200, y: 340, vx: 0, vy: 0 };
        this.luna = { x: 180, y: 340, vx: 0, vy: 0, facing: 1, excitement: 0 };
        this.nearMissTimer = 0;
        this.scrollX = 0;
        this.scorePopups = [];
        this.lure.fuzz = [];
        for (var fi = 0; fi < 6; fi++) this.lure.fuzz.push({ x: rand(-7, 7), y: rand(-5, 5), r: rand(1.5, 2.5) });
      }
      extraInteractiveAt() { return true; }
      drawTopHud(c) {
        c.save();
        var timePill = placePill("tl", 0, 130);
        var scorePill = placePill("tr", 0, 132, 72);
        c.fillStyle = "rgba(255,248,240,0.88)";
        rr(c, timePill.x, timePill.y, timePill.w, timePill.h, 12); c.fill();
        rr(c, scorePill.x, scorePill.y, scorePill.w, scorePill.h, 12); c.fill();
        /* pause button */
        var pb = this.pauseButtonRect();
        var pbH = pointInRect(game.mouse.x, game.mouse.y, pb);
        c.fillStyle = pbH ? "rgba(92,68,52,0.92)" : "rgba(92,68,52,0.68)";
        rr(c, pb.x, pb.y, pb.w, pb.h, 12); c.fill();
        c.fillStyle = COLORS.cream;
        c.fillRect(pb.x + 13, pb.y + 10, 4, 16);
        c.fillRect(pb.x + 21, pb.y + 10, 4, 16);
        /* elapsed time instead of countdown */
        var elapsed = Math.floor(this.duration - this.timeLeft);
        drawHudTime(c, timePill.x + 12, timePill.y + 12, elapsed);
        /* score */
        c.save();
        var ss = 1 + this.scorePop * 0.2;
        c.translate(scorePill.x + scorePill.w - 12, scorePill.y + 12);
        c.scale(ss, ss);
        drawHudScore(c, 0, 0, Math.round(this.score));
        c.restore();
        /* combo */
        if (this.phase === "play" && this.combo > 1) {
          c.fillStyle = "#A05A3C";
          c.textAlign = "center";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Combo x" + this.combo, scorePill.x + scorePill.w / 2, scorePill.y + 64);
        }
        c.restore();
      }
      onGameClick() {}
      onMouseMove(x, y) {
        super.onMouseMove(x, y);
        if (this.phase === "play" && !this.paused && !this.gameOver) {
          this.anchor.x = clamp(x, 80, 280);
          this.anchor.y = clamp(y, 60, H - 60);
        }
      }
      updatePlay(dt) {
        if (this.gameOver) {
          this.gameOverTimer += dt;
          if (this.gameOverTimer > 1.5) this.finishGame();
          return;
        }
        var elapsed = this.duration - this.timeLeft;
        /* difficulty ramp */
        this.scrollSpeed = 100 + elapsed * 0.8;
        var gapSize = Math.max(110, 180 - elapsed * 0.6);
        if (this.challengeMode) gapSize = Math.max(85, gapSize * 0.75);
        /* scroll world */
        this.scrollX += this.scrollSpeed * dt;
        /* spawn obstacles */
        this.obstacleTimer -= dt;
        if (this.obstacleTimer <= 0) {
          var gapY = rand(100 + gapSize / 2, H - 60 - gapSize / 2);
          var obstType = ["shelf", "cushions", "scratcher", "blanketfort"][Math.floor(rand(0, 4))];
          this.obstacles.push({
            x: W + 40,
            gapY: gapY,
            baseGapY: gapY,
            gapSize: gapSize,
            baseGapSize: gapSize,
            passed: false,
            type: obstType,
            w: 50,
            bobbing: Math.random() < 0.15,
            bobPhase: rand(0, Math.PI * 2),
            narrowing: elapsed > 60 && Math.random() < 0.15
          });
          var spawnInterval = Math.max(1.6, 3.0 - elapsed * 0.02);
          this.obstacleTimer = spawnInterval;
        }
        /* move obstacles */
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
          var ob = this.obstacles[i];
          ob.x -= this.scrollSpeed * dt;
          /* bobbing gaps */
          if (ob.bobbing) ob.gapY = ob.baseGapY + Math.sin(game.time * 2 + ob.bobPhase) * 18;
          /* narrowing gaps */
          if (ob.narrowing) {
            var progress = 1 - (ob.x / W);
            ob.gapSize = Math.max(70, ob.baseGapSize - progress * 25);
          }
          /* check if Luna passed this obstacle */
          if (!ob.passed && ob.x + ob.w / 2 < this.luna.x) {
            ob.passed = true;
            this.passed++;
            var pts = 10 * this.combo;
            this.addScore(pts);
            this.combo++;
            if (this.combo > 1 && this.combo % 5 === 0) { audio.combo(); this.scorePopups.push({ x: this.luna.x, y: this.luna.y - 55, text: "x" + this.combo + " Combo!", life: 1.2 }); }
            if (this.score >= 500) this.queueAchievement("wandMaster");
            /* milestone celebrations */
            if (this.passed === 10) { this.scorePopups.push({ x: W/2, y: H/2, text: "Nice!", life: 1.5 }); spawnParticleBurst(W/2, H/2, [COLORS.gold, "#FFF4C0"], 15, ["star"]); }
            else if (this.passed === 25) { this.scorePopups.push({ x: W/2, y: H/2, text: "Amazing!", life: 1.5 }); spawnParticleBurst(W/2, H/2, [COLORS.gold, COLORS.softPink, "#87CEEB"], 25, ["star", "heart"]); }
            else if (this.passed === 50) { this.scorePopups.push({ x: W/2, y: H/2, text: "LEGENDARY!", life: 2.0 }); spawnParticleBurst(W/2, H/2, [COLORS.gold, COLORS.softPink, "#87CEEB", "#A8D870"], 40, ["star", "heart"]); audio.combo(); }
            audio.tinyChime();
            spawnParticleBurst(ob.x + ob.w, ob.gapY, [COLORS.gold, "#FFF4C0"], 6, ["star"]);
            this.scorePopups.push({ x: ob.x + ob.w, y: ob.gapY, text: "+" + pts, life: 1.0 });
            /* near miss bonus */
            var lunaDistFromEdge = Math.min(Math.abs(this.luna.y - (ob.gapY - gapSize / 2)), Math.abs(this.luna.y - (ob.gapY + gapSize / 2)));
            if (lunaDistFromEdge < 20) {
              this.addScore(5 * this.combo);
              this.nearMissTimer = 0.6;
              spawnParticleBurst(this.luna.x, this.luna.y, ["#FF69B4"], 4, ["heart"]);
              this.scorePopups.push({ x: this.luna.x + 20, y: this.luna.y - 20, text: "Close! +" + (5 * this.combo), life: 0.8 });
              audio.pounce();
              screenShake(3, 0.15);
            }
          }
          /* remove off-screen */
          if (ob.x < -60) this.obstacles.splice(i, 1);
        }
        /* update anchor from mouse */
        this.anchor.x = clamp(game.mouse.x, 80, 280);
        this.anchor.y = clamp(game.mouse.y, 60, H - 60);
        /* lure physics — pendulum/spring from anchor */
        var stringLen = 70;
        var springK = 6.0;
        var damping = 1.8;
        var gravity = 400;
        var dx = this.anchor.x - this.lure.x;
        var dy = (this.anchor.y + stringLen) - this.lure.y;
        var d = Math.hypot(dx, dy);
        /* spring force toward rest position below anchor */
        this.lure.vx += dx * springK * dt;
        this.lure.vy += dy * springK * dt;
        /* gravity */
        this.lure.vy += gravity * dt;
        /* damping */
        this.lure.vx *= Math.max(0, 1 - damping * dt);
        this.lure.vy *= Math.max(0, 1 - damping * dt);
        /* constrain max distance from anchor */
        this.lure.x += this.lure.vx * dt;
        this.lure.y += this.lure.vy * dt;
        var ldx = this.lure.x - this.anchor.x;
        var ldy = this.lure.y - this.anchor.y;
        var ld = Math.hypot(ldx, ldy);
        var maxLen = 85;
        if (ld > maxLen) {
          this.lure.x = this.anchor.x + ldx / ld * maxLen;
          this.lure.y = this.anchor.y + ldy / ld * maxLen;
          /* dampen velocity when string taut */
          this.lure.vx *= 0.7;
          this.lure.vy *= 0.7;
        }
        this.lure.x = clamp(this.lure.x, 40, W - 40);
        this.lure.y = clamp(this.lure.y, 40, H - 40);
        /* Luna chases the lure */
        var chaseX = this.lure.x;
        var chaseY = this.lure.y;
        var cdx = chaseX - this.luna.x;
        var cdy = chaseY - this.luna.y;
        var cd = Math.hypot(cdx, cdy);
        var chaseSpeed = 420;
        var chaseDamping = 2.2;
        if (cd > 5) {
          this.luna.vx += (cdx / cd) * chaseSpeed * dt;
          this.luna.vy += (cdy / cd) * chaseSpeed * dt;
        }
        /* strong gravity on Luna — she falls when lure is above */
        this.luna.vy += 120 * dt;
        /* cat wobble — occasional twitch, not constant vibration */
        if (Math.random() < dt * 8) {
          this.luna.vx += rand(-15, 15);
          this.luna.vy += rand(-10, 10);
        }
        /* pounce burst — when close to lure, sudden speed spike */
        if (cd < 30 && cd > 5 && Math.random() < dt * 2) {
          this.luna.vx += (cdx / cd) * 80;
          this.luna.vy += (cdy / cd) * 80;
        }
        /* damping */
        this.luna.vx *= Math.max(0, 1 - chaseDamping * dt);
        this.luna.vy *= Math.max(0, 1 - chaseDamping * dt);
        this.luna.x += this.luna.vx * dt;
        this.luna.y += this.luna.vy * dt;
        /* keep Luna in bounds */
        if (this.luna.y < 50) { this.luna.y = 50; this.luna.vy = Math.max(0, this.luna.vy); }
        if (this.luna.y > H - 30) { this.luna.y = H - 30; this.luna.vy = Math.min(0, this.luna.vy); }
        this.luna.x = clamp(this.luna.x, 80, 320);
        this.luna.facing = this.luna.vx >= 0 ? 1 : -1;
        this.luna.excitement = clamp(cd / 80, 0, 1);
        this.nearMissTimer = Math.max(0, this.nearMissTimer - dt);
        /* update score popups */
        for (var spi = this.scorePopups.length - 1; spi >= 0; spi--) {
          this.scorePopups[spi].life -= dt;
          this.scorePopups[spi].y -= 35 * dt;
          if (this.scorePopups[spi].life <= 0) this.scorePopups.splice(spi, 1);
        }
        /* collision detection — Luna vs obstacles */
        for (var oi = 0; oi < this.obstacles.length; oi++) {
          var ob = this.obstacles[oi];
          var inXRange = this.luna.x > ob.x - 10 && this.luna.x < ob.x + ob.w + 10;
          if (inXRange) {
            var inGap = this.luna.y > ob.gapY - ob.gapSize / 2 + 8 && this.luna.y < ob.gapY + ob.gapSize / 2 - 8;
            if (!inGap) {
              /* COLLISION */
              this.gameOver = true;
              this.gameOverTimer = 0;
              audio.miss();
              screenShake(6, 0.3);
              spawnParticleBurst(this.luna.x, this.luna.y, ["#FF6B6B", "#FFB3B3"], 12, ["star"]);
              this.luna.vx = 0;
              this.luna.vy = 0;
              return;
            }
          }
        }
      }
      drawScene(c) {
        /* cozy room background — scrolling wallpaper */
        var bgColors = ["#F5E6D3", "#EDE0D0", "#F0E2CE"];
        c.fillStyle = bgColors[0];
        c.fillRect(0, 0, W, H);
        /* scrolling floor pattern */
        c.fillStyle = "#E8D5BD";
        c.fillRect(0, H - 40, W, 40);
        c.strokeStyle = "rgba(180,160,130,0.3)";
        c.lineWidth = 1;
        for (var fi = 0; fi < 20; fi++) {
          var fx = ((fi * 50 - this.scrollX * 0.3) % (W + 100)) - 50;
          c.beginPath(); c.moveTo(fx, H - 40); c.lineTo(fx, H); c.stroke();
        }
        /* scrolling window in background */
        var winX = ((500 - this.scrollX * 0.15) % (W + 200)) - 100;
        c.fillStyle = "#B8E0F0";
        rr(c, winX, 30, 100, 80, 6);
        c.fill();
        c.strokeStyle = "#C8A882";
        c.lineWidth = 4;
        rr(c, winX, 30, 100, 80, 6);
        c.stroke();
        c.strokeStyle = "#C8A882";
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(winX + 50, 30); c.lineTo(winX + 50, 110); c.stroke();
        c.beginPath(); c.moveTo(winX, 70); c.lineTo(winX + 100, 70); c.stroke();
        /* scrolling shelf in background */
        var shelfX = ((250 - this.scrollX * 0.1) % (W + 300)) - 150;
        c.fillStyle = "rgba(180,160,130,0.2)";
        rr(c, shelfX, 60, 120, 10, 3);
        c.fill();
        /* ceiling line */
        c.strokeStyle = "rgba(180,160,130,0.15)";
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 30); c.lineTo(W, 30); c.stroke();
        /* speed lines when going fast */
        if (this.scrollSpeed > 180) {
          c.save();
          c.globalAlpha = Math.min(0.15, (this.scrollSpeed - 180) * 0.001);
          c.strokeStyle = "rgba(200,180,160,1)";
          c.lineWidth = 1;
          for (var sli = 0; sli < 6; sli++) {
            var sly = 80 + sli * 90 + Math.sin(game.time * 3 + sli) * 20;
            c.beginPath(); c.moveTo(0, sly); c.lineTo(W, sly); c.stroke();
          }
          c.restore();
        }
        /* ── draw obstacles ── */
        /* obstacle preview — faint silhouettes at right edge */
        for (var pi = 0; pi < this.obstacles.length; pi++) {
          var pob = this.obstacles[pi];
          if (pob.x > W - 60 && pob.x < W + 40) {
            c.save();
            c.globalAlpha = 0.15;
            c.fillStyle = "#8A7060";
            c.fillRect(W - 8, 0, 8, pob.gapY - pob.gapSize / 2);
            c.fillRect(W - 8, pob.gapY + pob.gapSize / 2, 8, H - (pob.gapY + pob.gapSize / 2));
            c.restore();
          }
        }
        for (var oi = 0; oi < this.obstacles.length; oi++) {
          var ob = this.obstacles[oi];
          var topH = ob.gapY - ob.gapSize / 2;
          var botY = ob.gapY + ob.gapSize / 2;
          var botH = H - botY;
          /* top obstacle */
          if (ob.type === "shelf") {
            c.fillStyle = "#B08860";
            rr(c, ob.x, 0, ob.w, topH, 4);
            c.fill();
            c.fillStyle = "#C8A070";
            c.fillRect(ob.x - 4, topH - 6, ob.w + 8, 6);
            /* books on shelf */
            var bookColors = ["#D04040", "#4080D0", "#40A040", "#E8A020"];
            for (var bi = 0; bi < 3; bi++) {
              c.fillStyle = bookColors[bi];
              rr(c, ob.x + 8 + bi * 14, topH - 30, 10, 24, 2);
              c.fill();
            }
          } else if (ob.type === "cushions") {
            c.fillStyle = "#C8A0B0";
            rr(c, ob.x, 0, ob.w, topH, 6);
            c.fill();
            c.fillStyle = "#D8B0C0";
            c.beginPath(); c.ellipse(ob.x + ob.w / 2, topH - 4, ob.w / 2 + 4, 10, 0, 0, Math.PI * 2); c.fill();
          } else if (ob.type === "scratcher") {
            c.fillStyle = "#B89868";
            c.fillRect(ob.x + 10, 0, ob.w - 20, topH);
            /* rope wrap texture */
            c.strokeStyle = "rgba(160,130,80,0.5)";
            c.lineWidth = 2;
            for (var ri = 0; ri < Math.floor(topH / 12); ri++) {
              c.beginPath(); c.moveTo(ob.x + 10, ri * 12); c.lineTo(ob.x + ob.w - 10, ri * 12 + 6); c.stroke();
            }
            c.fillStyle = "#D2B48C";
            c.beginPath(); c.ellipse(ob.x + ob.w / 2, topH, ob.w / 2 + 6, 8, 0, 0, Math.PI * 2); c.fill();
          } else {
            /* blanket fort */
            c.fillStyle = "#A0C0D8";
            c.beginPath(); c.moveTo(ob.x, 0); c.lineTo(ob.x + ob.w, 0); c.lineTo(ob.x + ob.w / 2, topH); c.closePath(); c.fill();
            c.fillStyle = "rgba(255,255,255,0.15)";
            for (var si = 0; si < 3; si++) {
              c.beginPath(); c.moveTo(ob.x + si * ob.w / 3, 0); c.lineTo(ob.x + ob.w / 2, topH); c.stroke();
            }
          }
          /* bottom obstacle */
          if (ob.type === "shelf") {
            c.fillStyle = "#B08860";
            rr(c, ob.x, botY, ob.w, botH, 4);
            c.fill();
            c.fillStyle = "#C8A070";
            c.fillRect(ob.x - 4, botY, ob.w + 8, 6);
          } else if (ob.type === "cushions") {
            c.fillStyle = "#C8A0B0";
            rr(c, ob.x, botY, ob.w, botH, 6);
            c.fill();
            c.fillStyle = "#D8B0C0";
            c.beginPath(); c.ellipse(ob.x + ob.w / 2, botY + 4, ob.w / 2 + 4, 10, 0, 0, Math.PI * 2); c.fill();
          } else if (ob.type === "scratcher") {
            c.fillStyle = "#B89868";
            c.fillRect(ob.x + 10, botY, ob.w - 20, botH);
            c.strokeStyle = "rgba(160,130,80,0.5)";
            c.lineWidth = 2;
            for (var ri = 0; ri < Math.floor(botH / 12); ri++) {
              c.beginPath(); c.moveTo(ob.x + 10, botY + ri * 12); c.lineTo(ob.x + ob.w - 10, botY + ri * 12 + 6); c.stroke();
            }
            c.fillStyle = "#D2B48C";
            c.beginPath(); c.ellipse(ob.x + ob.w / 2, botY, ob.w / 2 + 6, 8, 0, 0, Math.PI * 2); c.fill();
          } else {
            c.fillStyle = "#A0C0D8";
            c.beginPath(); c.moveTo(ob.x, H); c.lineTo(ob.x + ob.w, H); c.lineTo(ob.x + ob.w / 2, botY); c.closePath(); c.fill();
          }
          /* gap highlight — safe zone glow */
          c.save();
          c.globalAlpha = 0.08;
          c.fillStyle = "#FFD700";
          c.fillRect(ob.x - 2, ob.gapY - ob.gapSize / 2, ob.w + 4, ob.gapSize);
          c.restore();
        }
        /* ── draw string from anchor to lure ── */
        c.save();
        c.strokeStyle = "rgba(140,100,60,0.6)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(this.anchor.x, this.anchor.y);
        /* catenary curve approximation */
        var mx = (this.anchor.x + this.lure.x) / 2;
        var my = (this.anchor.y + this.lure.y) / 2 + 20;
        c.quadraticCurveTo(mx, my, this.lure.x, this.lure.y);
        c.stroke();
        c.restore();
        /* ── draw wand handle at anchor ── */
        c.save();
        c.translate(this.anchor.x, this.anchor.y);
        var wandAngle = Math.atan2(this.lure.y - this.anchor.y, this.lure.x - this.anchor.x) * 0.3;
        c.rotate(wandAngle);
        c.fillStyle = "#8B6914";
        c.fillRect(-3, -40, 6, 42);
        c.fillStyle = "#A08030";
        c.beginPath(); c.arc(0, -40, 4, 0, Math.PI * 2); c.fill();
        c.restore();
        /* ── draw lure (fuzzy mouse toy) ── */
        c.save();
        c.translate(this.lure.x, this.lure.y);
        var swing = Math.sin(game.time * 6) * 0.15;
        c.rotate(swing);
        /* body */
        c.fillStyle = "#E8A0B0";
        c.beginPath(); c.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); c.fill();
        /* fuzzy texture */
        c.fillStyle = "rgba(255,255,255,0.3)";
        if (this.lure.fuzz) {
          for (var fi = 0; fi < this.lure.fuzz.length; fi++) {
            var fz = this.lure.fuzz[fi];
            c.beginPath(); c.arc(fz.x + Math.sin(game.time * 2 + fi) * 0.5, fz.y + Math.cos(game.time * 1.5 + fi) * 0.3, fz.r, 0, Math.PI * 2); c.fill();
          }
        }
        /* ears */
        c.fillStyle = "#D08090";
        c.beginPath(); c.arc(-7, -8, 4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(7, -8, 4, 0, Math.PI * 2); c.fill();
        /* eyes */
        c.fillStyle = "#333";
        c.beginPath(); c.arc(-4, -1, 2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(4, -1, 2, 0, Math.PI * 2); c.fill();
        /* tail string */
        c.strokeStyle = "#D08090";
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 10); c.quadraticCurveTo(10, 20 + Math.sin(game.time * 8) * 4, 5, 26); c.stroke();
        c.restore();
        /* ── draw Luna ── */
        var lunaScale = 0.85 + this.luna.excitement * 0.15;
        var lunaPose = this.gameOver ? "sit" : (Math.abs(this.luna.vy) > 100 ? "stalk" : "topdown");
        drawLuna(c, this.luna.x, this.luna.y, lunaScale, {
          pose: lunaPose,
          tail: Math.sin(game.time * 3),
          earTwitch: this.luna.excitement > 0.5 ? 1 : earSignal(game.time),
          wiggle: this.luna.excitement * 0.08,
          blink: this.gameOver ? true : blinkSignal(game.time + 0.5, 0.6),
          facing: this.luna.facing
        });
        /* near-miss sparkle */
        if (this.nearMissTimer > 0) {
          c.save();
          c.globalAlpha = this.nearMissTimer;
          c.fillStyle = "#FF69B4";
          c.font = '14px "Fredoka One", sans-serif';
          c.textAlign = "center";
          c.fillText("Close!", this.luna.x, this.luna.y - 40);
          c.restore();
        }
        /* score popups */
        for (var spi = 0; spi < this.scorePopups.length; spi++) {
          var sp = this.scorePopups[spi];
          c.save();
          c.globalAlpha = clamp(sp.life / 0.3, 0, 1);
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.strokeStyle = "rgba(60,40,20,0.6)";
          c.lineWidth = 3;
          c.strokeText(sp.text, sp.x, sp.y);
          c.fillStyle = sp.text.includes("Close") ? "#FF69B4" : COLORS.gold;
          c.fillText(sp.text, sp.x, sp.y);
          c.restore();
        }
        /* game over overlay */
        if (this.gameOver) {
          c.save();
          c.globalAlpha = clamp(this.gameOverTimer / 0.5, 0, 0.6);
          c.fillStyle = "rgba(60,40,30,1)";
          c.fillRect(0, 0, W, H);
          c.globalAlpha = clamp(this.gameOverTimer / 0.8, 0, 1);
          c.fillStyle = "#FFF8F0";
          c.font = '28px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("Bonk!", W / 2, H / 2 - 20);
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Obstacles cleared: " + this.passed, W / 2, H / 2 + 20);
          c.restore();
        }
        /* HUD: obstacles passed counter */
        if (!this.gameOver) {
          c.fillStyle = "rgba(255,248,240,0.7)";
          rr(c, W / 2 - 60, H - SAFE - 26, 120, 26, 10);
          c.fill();
          c.fillStyle = "#7A4E36";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("Cleared: " + this.passed, W / 2, H - SAFE - 8);
        }
      }
      drawInstructionIcon(c, x, y) {
        c.save(); c.translate(x, y);
        /* wand stick */
        c.fillStyle = "#8B6914";
        c.fillRect(-2, -20, 4, 22);
        /* string */
        c.strokeStyle = "rgba(140,100,60,0.6)";
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(10, 14, 6, 22); c.stroke();
        /* fuzzy mouse */
        c.fillStyle = "#E8A0B0";
        c.beginPath(); c.ellipse(6, 24, 6, 4, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      drawResultCharacter(c) {
        drawLuna(c, 400, 410, 1.5, {
          pose: "sit",
          tail: Math.sin(game.time * 2),
          earTwitch: earSignal(game.time),
          blink: blinkSignal(game.time + 1, 0.4),
          facing: 1
        });
      }
    }
    SceneRegistry.register("wildwand", () => new WildWandScene());


