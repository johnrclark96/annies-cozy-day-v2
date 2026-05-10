    // ═══ 14-scene-minigame-base.js ═══
    class BaseMinigameScene extends BaseScene {
      constructor(gameId, title, instruction, thresholds, duration) {
        super(gameId);
        this.gameId = gameId;
        this.displayTitle = title;
        this.instruction = instruction;
        this.thresholds = thresholds;
        this.duration = duration;
        this.phase = "instructions";
        this.phaseTime = 0;
        this.timeLeft = duration;
        this.score = 0;
        this.scorePop = 0;
        this.combo = 1;
        this.hoveredButton = null;
        this.paused = false;
        this.achievementFreeze = 0;
        this.achievementBanner = null;
        this.newBest = false;
        this.resultsStars = 0;
        this.revealedStars = 0;
        this.starTimer = 0;
        this.scoreInT = 0;
        this.personalBest = 0;
        this.playHint = null;
        this.playHintTimer = 4;
        this.challengeMode = false;
        this.challengeModifier = null;
        this.challengeStarEarned = false;
      }
      enter() {
        this.phase = "instructions";
        this.phaseTime = 0;
        this.timeLeft = this.duration;
        this.score = 0;
        this.scorePop = 0;
        this.combo = 1;
        this.hoveredButton = null;
        this.paused = false;
        this.achievementFreeze = 0;
        this.achievementBanner = null;
        this.newBest = false;
        this.resultsStars = 0;
        this.revealedStars = 0;
        this.starTimer = 0;
        this.scoreInT = 0;
        this.personalBest = store["best_" + this.gameId] || 0;
        this.challengeStarEarned = false;
        if (this.challengeMode) {
          this.challengeModifier = CHALLENGE_MODIFIERS[this.gameId] || null;
          /* scrapbook goal: first challenge attempt */
          if (store.scrapbookGoals && store.scrapbookGoals.completed.indexOf("challengeAttempt") < 0) {
            store.scrapbookGoals.completed.push("challengeAttempt");
            saveJSON("scrapbookGoals", store.scrapbookGoals);
            var caGoal = SCRAPBOOK_GOALS.find(function(g) { return g.key === "challengeAttempt"; });
            if (caGoal) addCoins(caGoal.reward);
          }
        }
        /* care bonus from pet happiness */
        this.careBonus = getCareBonus();
        if (this.careBonus.timerBonus > 0) this.timeLeft += this.careBonus.timerBonus;
        if (this.careBonus.comboStartBonus) this.combo = 2;
      }
      resultsButtons() {
        return {
          playAgain: { x: 176, y: 500, w: 180, h: 58 },
          back: { x: 444, y: 500, w: 180, h: 58 }
        };
      }
      pauseButtons() {
        return {
          resume: { x: 270, y: 312, w: 120, h: 48 },
          quit: { x: 410, y: 312, w: 120, h: 48 }
        };
      }
      startCountdown() {
        this.phase = "countdown";
        this.phaseTime = 0;
      }
      startPlay() {
        this.phase = "play";
        this.phaseTime = 0;
      }
      update(dt) {
        super.update(dt);
        this.scorePop = Math.max(0, this.scorePop - dt * 4);
        if (this.achievementBanner) {
          this.achievementBanner.time -= dt;
          if (this.achievementBanner.time <= 0) this.achievementBanner = null;
        }
        if (this.phase === "instructions") {
          this.phaseTime += dt;
          if (this.phaseTime >= 3) this.startCountdown();
        } else if (this.phase === "countdown") {
          this.phaseTime += dt;
          if (this.phaseTime >= 4) this.startPlay();
        } else if (this.phase === "play") {
          if (!this.paused) {
            if (this.achievementFreeze > 0) {
              this.achievementFreeze -= dt;
            } else {
              this.timeLeft = Math.max(0, this.timeLeft - dt);
              this.updatePlay(dt);
              /* first-play hint timer */
              if (this.playHint) {
                this.playHint.life -= dt;
                if (this.playHint.life <= 0) this.playHint = null;
              } else if (this.playHintTimer > 0) {
                this.playHintTimer -= dt;
              }
              if (this.timeLeft <= 0) this.finishGame();
            }
          }
        } else if (this.phase === "ending") {
          this.updateEnding(dt);
        } else if (this.phase === "results") {
          this.phaseTime += dt;
          this.scoreInT = Math.min(1, this.phaseTime / 0.45);
          if (this.revealedStars < this.resultsStars) {
            this.starTimer += dt;
            if (this.starTimer >= 0.3) {
              this.starTimer = 0;
              this.revealedStars++;
              audio.tinyChime();
            }
          }
        }
      }
      updatePlay() {}
      updateEnding(dt) {
        this.phaseTime += dt;
        if (this.phaseTime > 1.2) this.finishGame();
      }
      addScore(value) {
        this.score += value * (this.careBonus ? this.careBonus.scoreMultiplier : 1);
        this.scorePop = 1;
      }
      onMouseMove(x, y) {
        this.hoveredButton = null;
        if (this.phase === "results") {
          const btns = this.resultsButtons();
          if (pointInRect(x, y, btns.playAgain)) this.hoveredButton = "again";
          else if (pointInRect(x, y, btns.back)) this.hoveredButton = "back";
        } else if (this.phase === "play" && this.paused) {
          const btns = this.pauseButtons();
          if (pointInRect(x, y, btns.resume)) this.hoveredButton = "resume";
          else if (pointInRect(x, y, btns.quit)) this.hoveredButton = "quit";
        }
      }
      interactiveAt(x, y) {
        if (this.phase === "results") {
          const b = this.resultsButtons();
          return pointInRect(x, y, b.playAgain) || pointInRect(x, y, b.back);
        }
        if (this.phase === "instructions") return true;
        if (this.phase === "countdown") return pointInRect(x, y, this.pauseButtonRect());
        if (this.phase === "play" && this.paused) {
          const b = this.pauseButtons();
          return pointInRect(x, y, b.resume) || pointInRect(x, y, b.quit);
        }
        if (this.phase === "play" && pointInRect(x, y, this.pauseButtonRect())) return true;
        return this.extraInteractiveAt ? this.extraInteractiveAt(x, y) : false;
      }
      onClick(x, y) {
        if (this.phase === "instructions") {
          audio.menu();
          this.startCountdown();
          return;
        }
        if (this.phase === "results") {
          const btns = this.resultsButtons();
          if (pointInRect(x, y, btns.playAgain)) {
            audio.menu();
            transitionTo(this.createReplay());
          } else if (pointInRect(x, y, btns.back)) {
            audio.menu();
            transitionTo(SceneRegistry.create("hangout"));
          }
          return;
        }
        if (this.phase === "play" && this.paused) {
          const btns = this.pauseButtons();
          if (pointInRect(x, y, btns.resume)) {
            audio.menu();
            this.paused = false;
          } else if (pointInRect(x, y, btns.quit)) {
            audio.menu();
            transitionTo(SceneRegistry.create("hangout"));
          }
          return;
        }
        if (this.phase === "countdown" && pointInRect(x, y, this.pauseButtonRect())) {
          audio.menu();
          transitionTo(SceneRegistry.create("hangout"));
          return;
        }
        if (this.phase === "play") {
          if (pointInRect(x, y, this.pauseButtonRect())) {
            audio.menu();
            this.paused = true;
            return;
          }
          this.onGameClick(x, y);
        }
      }
      onGameClick() {}
      onKeyDown(key) {
        if (key === "Escape") {
          if (this.phase === "instructions" || this.phase === "countdown") {
            audio.menu();
            transitionTo(SceneRegistry.create("hangout"));
          } else if (this.phase === "play") {
            this.paused = !this.paused;
          }
          return;
        }
        if (this.phase === "play" && key === " ") {
          this.paused = !this.paused;
        }
      }
      calculateStars(finalScore) {
        let stars = 0;
        if (finalScore >= this.thresholds[0]) stars = 1;
        if (finalScore >= this.thresholds[1]) stars = 2;
        if (finalScore >= this.thresholds[2]) stars = 3;
        return stars;
      }
      finishGame() {
        const finalScore = Math.round(this.gameId === "cuddle" ? this.score : this.score);
        this.resultsStars = this.calculateStars(finalScore);
        this.newBest = setBest(this.gameId, finalScore);
        this.personalBest = store["best_" + this.gameId] || finalScore;
        var baseReward = 5 + this.resultsStars * 10;
        var scoreBonus = Math.floor(this.score / 100) * 2;
        var playBonus = Math.min(10, Math.floor((store.stats.totalSessions || 0) / 5));
        var upgradeBonus = hasUpgrade("luckyCharm") ? 2 : 0;
        this.coinReward = baseReward + scoreBonus + (this.newBest ? 15 : 0) + playBonus + upgradeBonus;
        addCoins(this.coinReward);
        if (this.resultsStars >= 3 && this.newBest) {
          addScrapbookEntry("milestone", "Earned 3 stars in " + this.displayTitle + "!", "star");
        }
        /* check star milestone coin rewards */
        if (this.newBest) {
          var milestoneCoins = checkStarMilestones();
          if (milestoneCoins > 0) {
            this.coinReward += milestoneCoins;
            this.milestoneText = "\u2605 Star Milestone! +" + milestoneCoins + " coins!";
          }
        }
        /* check fullHouse achievement */
        if (totalStarsEarned() >= 33 && !store.achievements.fullHouse) {
          store.achievements.fullHouse = true;
          saveAchievements();
          var fhInfo = ACHIEVEMENTS.find(function(a) { return a.key === "fullHouse"; });
          if (fhInfo && fhInfo.coinBonus) addCoins(fhInfo.coinBonus);
          addScrapbookEntry("achievement", "Full House — all 33 stars!", "star");
        }
        /* challenge star check */
        if (this.challengeMode && this.resultsStars >= 2 && !store.challengeStars[this.gameId]) {
          store.challengeStars[this.gameId] = true;
          saveJSON("challengeStars", store.challengeStars);
          this.challengeStarEarned = true;
          this.coinReward += 20;
          addCoins(20);
          addScrapbookEntry("milestone", "Challenge star earned in " + this.displayTitle + "!", "star");
          /* check challenge champion achievement */
          if (totalChallengeStars() >= 5 && !store.achievements.challengeChampion) {
            store.achievements.challengeChampion = true;
            saveAchievements();
            var ccInfo = ACHIEVEMENTS.find(function(a) { return a.key === "challengeChampion"; });
            if (ccInfo && ccInfo.coinBonus) addCoins(ccInfo.coinBonus);
            addScrapbookEntry("achievement", "Challenge Champion unlocked!", "star");
          }
        }
        this.phase = "results";
        this.phaseTime = 0;
        this.scoreInT = 0;
        this.revealedStars = 0;
        this.starTimer = 0;
        this.confettiFired = false;
      }
      createReplay() {
        var s = SceneRegistry.create(this.gameId);
        s.challengeMode = this.challengeMode;
        return s;
      }
      queueAchievement(key) {
        if (store.achievements[key]) return;
        store.achievements[key] = true;
        saveAchievements();
        const info = ACHIEVEMENTS.find((a) => a.key === key);
        if (info) {
          addScrapbookEntry("achievement", info.name + " unlocked!", "star");
          if (info.coinBonus) addCoins(info.coinBonus);
          this.achievementFreeze = Math.max(this.achievementFreeze, 0.5);
          this.achievementBanner = { name: info.name + (info.coinBonus ? " (+" + info.coinBonus + " coins)" : ""), time: 1.25, maxTime: 1.25 };
          audio.achievement();
          spawnParticleBurst(W / 2, 42, [COLORS.gold, COLORS.softPink], 12, ["star", "heart"]);
        }
      }
      drawTopHud(c, showCombo = true) {
        c.save();
        const timePill = placePill("tl", 0, 130);
        const scorePill = placePill("tr", 0, 132, showCombo ? 72 : 46);
        c.fillStyle = "rgba(255,248,240,0.88)";
        rr(c, timePill.x, timePill.y, timePill.w, timePill.h, 12);
        c.fill();
        rr(c, scorePill.x, scorePill.y, scorePill.w, scorePill.h, 12);
        c.fill();

        /* pause button */
        const pb = this.pauseButtonRect();
        const pbHover = pointInRect(game.mouse.x, game.mouse.y, pb);
        c.fillStyle = pbHover ? "rgba(92,68,52,0.92)" : "rgba(92,68,52,0.68)";
        rr(c, pb.x, pb.y, pb.w, pb.h, 12);
        c.fill();
        c.fillStyle = COLORS.cream;
        c.fillRect(pb.x + 13, pb.y + 10, 4, 16);
        c.fillRect(pb.x + 21, pb.y + 10, 4, 16);

        drawHudTime(c, timePill.x + 12, timePill.y + 12, this.timeLeft);

        c.save();
        const scoreScale = 1 + this.scorePop * 0.2;
        c.translate(scorePill.x + scorePill.w - 12, scorePill.y + 12);
        c.scale(scoreScale, scoreScale);
        drawHudScore(c, 0, 0, Math.round(this.score));
        c.restore();

        if (showCombo && this.phase === "play") {
          c.fillStyle = "#A05A3C";
          c.textAlign = "center";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Combo x" + this.combo, scorePill.x + scorePill.w / 2, scorePill.y + 64);
        }
        c.restore();
      }
      pauseButtonRect() { return { x: 152, y: 16, w: 38, h: 36 }; }
      drawInstructionCard(c, iconFn) {
        c.save();
        c.fillStyle = INTRO_SCRIM;
        c.fillRect(0, 0, W, H);
        rr(c, 145, 150, 510, 260, 24);
        c.fillStyle = "rgba(255,248,240,0.97)";
        c.fill();
        c.strokeStyle = "rgba(92,68,52,0.18)";
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = "#7A4E36";
        c.textAlign = "center";
        c.font = '32px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(this.displayTitle, W / 2, 198);
        c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        wrapText(c, this.instruction, W / 2, 252, 410, 30);
        if (iconFn) iconFn(c, W / 2, 320);
        if (this.challengeMode && this.challengeModifier) {
          c.fillStyle = "#FFA500";
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("\u2605 CHALLENGE: " + this.challengeModifier.name + " \u2605", W / 2, 350);
          c.fillStyle = "rgba(160,120,80,0.7)";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(this.challengeModifier.desc, W / 2, 370);
        }
        /* care bonus indicator */
        var careBonusY = this.challengeMode ? 390 : 350;
        if (this.careBonus && this.careBonus.label) {
          c.fillStyle = "#7DB36C";
          c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          var bonusMsg = this.careBonus.label === "Well-Loved Bonus!"
            ? "Obi & Luna are happy today. Bonus time."
            : "Pets are content. Small bonus.";
          c.fillText(bonusMsg, W / 2, careBonusY);
          careBonusY += 18;
        }
        c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillStyle = "#A06B4F";
        c.fillText(isMobile ? "Tap to begin" : "Click to begin early  •  Esc to go back", W / 2, careBonusY + 8);
        c.restore();
      }
      drawCountdown(c) {
        const t = this.phaseTime;
        let text = "3";
        if (t >= 1 && t < 2) text = "2";
        else if (t >= 2 && t < 3) text = "1";
        else if (t >= 3) text = "GO!";
        const local = t % 1;
        const scale = 1 + 0.2 * (1 - local);
        c.save();
        c.fillStyle = "rgba(92,68,52,0.22)";
        c.fillRect(0, 0, W, H);
        c.translate(W / 2, H / 2);
        c.scale(scale, scale);
        c.fillStyle = "#FFF8F0";
        c.strokeStyle = "#7A4E36";
        c.lineWidth = 8;
        c.textAlign = "center";
        c.font = '64px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.strokeText(text, 0, 0);
        c.fillText(text, 0, 0);
        c.restore();
      }
      drawPause(c) {
        c.save();
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fillRect(0, 0, W, H);
        c.fillStyle = "#FFF8F0";
        c.textAlign = "center";
        c.font = '52px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("PAUSED", W / 2, 230);
        c.font = '18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(isMobile ? "Choose an option below" : "Press Space or Esc to resume", W / 2, 262);
        const btns = this.pauseButtons();
        drawButton(c, btns.resume, "Resume", this.hoveredButton === "resume", "#7DB36C");
        drawButton(c, btns.quit, "Quit", this.hoveredButton === "quit", "#B86A58");
        c.restore();
      }
      drawResults(c, characterDraw) {
        c.save();
        c.fillStyle = "rgba(255,248,240,0.82)";
        c.fillRect(0, 0, W, H);

        /* confetti burst on 3 stars */
        if (this.resultsStars >= 3 && this.revealedStars >= 3 && !this.confettiFired) {
          this.confettiFired = true;
          const confettiColors = [COLORS.gold, COLORS.softPink, "#87CEEB", "#A8D870", "#FFB347", "#FF8FAA", "#C39BD3"];
          for (let i = 0; i < 40; i++) {
            game.particles.push({
              x: W / 2 + rand(-200, 200), y: rand(50, 200),
              vx: rand(-120, 120), vy: rand(-180, 40),
              life: rand(1.5, 3), maxLife: 3,
              size: rand(4, 8), rot: rand(0, 6.28), vr: rand(-5, 5),
              shape: Math.random() < 0.5 ? "star" : "heart",
              color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
            });
          }
          audio.achievement();
        }

        c.fillStyle = "#7A4E36";
        c.textAlign = "center";
        c.font = '38px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(this.displayTitle + " Results", W / 2, 88);

        const scoreScale = easeOutBack(clamp(this.scoreInT, 0, 1));
        c.save();
        c.translate(W / 2, 166);
        c.scale(scoreScale, scoreScale);
        c.fillStyle = "#B84B3A";
        c.font = '54px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(Math.round(this.score), 0, 0);
        c.font = '18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillStyle = "#8A6045";
        c.fillText("Score", 0, 34);
        c.restore();

        c.fillStyle = "#8A6045";
        c.font = '17px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("Personal Best  \u2605  " + this.personalBest, W / 2, 210);

        c.fillStyle = COLORS.gold;
        c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("+" + this.coinReward + " coins", W / 2, this.newBest ? 280 : 228);
        /* F.8 — when Lucky Charm is active, surface its origin in a faint
           caps line below the coin total. Without this the +2 felt invisible. */
        if (hasUpgrade("luckyCharm")) {
          c.save();
          c.fillStyle = "rgba(122,78,54,0.55)";
          c.font = '10px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("includes +2 from Lucky Charm", W / 2, (this.newBest ? 280 : 228) + 14);
          c.restore();
        }

        if (this.newBest) {
          const bestPulse = 1 + Math.sin(game.time * 4) * 0.04;
          c.save();
          c.translate(W / 2, 246);
          c.scale(bestPulse, bestPulse);
          rr(c, -120, -21, 240, 42, 18);
          c.fillStyle = "#E2B83B";
          c.fill();
          c.strokeStyle = "rgba(255,255,255,0.4)";
          c.lineWidth = 2;
          c.stroke();
          c.fillStyle = "#FFF8F0";
          c.font = '19px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.textAlign = "center";
          c.fillText("✦ New Personal Best! ✦", 0, 6);
          c.restore();
        }

        var hasChalStar = store.challengeStars[this.gameId];
        var show4Stars = hasChalStar || this.challengeMode;
        var starCount = show4Stars ? 4 : 3;
        var starStartX = show4Stars ? W / 2 - 96 : W / 2 - 64;
        for (let i = 0; i < starCount; i++) {
          var isChallenge = i === 3;
          var revealed = isChallenge ? (hasChalStar && this.phaseTime > 1.2) : (i < this.revealedStars);
          var t = revealed ? easeOutBack(clamp((this.phaseTime - (isChallenge ? 1.2 : i * 0.3)) / 0.28, 0, 1)) : 0;
          c.save();
          c.translate(starStartX + i * 64, 310);
          c.scale(t, t);
          if (revealed) {
            drawGlowCircle(c, 0, 0, 28, isChallenge ? "rgba(255,180,0,ALPHA)" : "rgba(255,215,0,ALPHA)", isChallenge ? 0.25 : 0.15);
          }
          drawStar(c, 0, 0, isChallenge ? 20 : 22, revealed ? (isChallenge ? "#FFA500" : COLORS.gold) : "#D3C8B4");
          if (isChallenge && !hasChalStar) {
            c.globalAlpha = 0.4;
            drawStar(c, 0, 0, 20, "#D3C8B4");
            c.globalAlpha = 1;
          }
          c.restore();
        }

        /* celebration message for 3 stars */
        if (this.resultsStars >= 3 && this.revealedStars >= 3) {
          c.save();
          c.globalAlpha = clamp(this.phaseTime - 1.2, 0, 1);
          c.fillStyle = COLORS.gold;
          c.textAlign = "center";
          c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText("Perfect score! Amazing!", W / 2, 348);
          c.restore();
        }

        /* star milestone notification */
        if (this.milestoneText && this.phaseTime > 0.8) {
          c.save();
          c.globalAlpha = clamp(this.phaseTime - 0.8, 0, 1);
          c.fillStyle = COLORS.gold;
          c.textAlign = "center";
          c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(this.milestoneText, W / 2, 368);
          c.restore();
        }

        characterDraw(c);

        const btns = this.resultsButtons();
        drawButton(c, btns.playAgain, "Play Again", this.hoveredButton === "again", "#7DB36C");
        drawButton(c, btns.back, "Back", this.hoveredButton === "back", "#B86A58");
        c.restore();
      }
      draw(c) {
        this.drawScene(c);
        this.drawTopHud(c, true);
        if (this.phase === "instructions") this.drawInstructionCard(c, this.drawInstructionIcon.bind(this));
        else if (this.phase === "countdown") this.drawCountdown(c);
        else if (this.phase === "play" && this.paused) this.drawPause(c);
        else if (this.phase === "results") this.drawResults(c, this.drawResultCharacter.bind(this));
        else if (this.phase === "ending") this.drawEndingOverlay(c);
        /* first-play hint */
        if (this.playHint && this.phase === "play") {
          c.save();
          c.globalAlpha = clamp(this.playHint.life / 0.5, 0, 1) * 0.85;
          c.fillStyle = "rgba(255,248,240,0.88)";
          rr(c, W/2 - 180, H - 60, 360, 34, 14);
          c.fill();
          c.fillStyle = "#7A4E36";
          c.textAlign = "center";
          c.font = '14px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
          c.fillText(this.playHint.text, W/2, H - 38);
          c.restore();
        }
        drawAchievementBanner(c, this.achievementBanner);
      }
      drawScene() {}
      drawInstructionIcon() {}
      drawResultCharacter() {}
      drawEndingOverlay() {}
    }


