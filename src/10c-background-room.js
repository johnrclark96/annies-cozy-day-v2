    function drawLivingRoom(c, mode = "hub") {
      if (!sceneCache.livingRoomBase) buildStaticCaches();
      c.drawImage(sceneCache.livingRoomBase, 0, 0);

      /* animated window sky — time-of-day aware */
      const tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
      c.save();
      c.beginPath();
      rr(c, 66, 52, 120, 152, 5);
      c.clip();
      if (tod === 0) {
        const skyG = c.createLinearGradient(66, 52, 66, 204);
        skyG.addColorStop(0, "#FFB088");
        skyG.addColorStop(0.5, "#FFCDA8");
        skyG.addColorStop(1, "#FFE8C8");
        c.fillStyle = skyG;
        c.fillRect(66, 52, 120, 152);
      } else if (tod === 2) {
        const skyG = c.createLinearGradient(66, 52, 66, 204);
        skyG.addColorStop(0, "#C87848");
        skyG.addColorStop(0.4, "#D89060");
        skyG.addColorStop(1, "#A87098");
        c.fillStyle = skyG;
        c.fillRect(66, 52, 120, 152);
      } else if (tod === 3) {
        c.fillStyle = "#1A1E38";
        c.fillRect(66, 52, 120, 152);
        c.fillStyle = "#FFFFFF";
        const starPositions = [[82,68],[110,72],[140,60],[95,90],[160,80],[130,100],[75,110],[150,95],[108,118],[170,65]];
        for (const [sx,sy] of starPositions) {
          c.globalAlpha = 0.4 + Math.sin(game.time * 1.5 + sx * 0.1) * 0.3;
          c.beginPath(); c.arc(sx, sy, 1.2, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
        c.fillStyle = "#E8E4D8";
        c.beginPath(); c.arc(155, 72, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#1A1E38";
        c.beginPath(); c.arc(160, 68, 10, 0, Math.PI * 2); c.fill();
      } else {
        const skyShift = Math.sin(game.time * 0.05) * 0.08;
        const skyG = c.createLinearGradient(66, 52, 66, 204);
        skyG.addColorStop(0, `rgba(${135 + skyShift * 40},${206 + skyShift * 20},${235},1)`);
        skyG.addColorStop(1, `rgba(${200 + skyShift * 30},${230 + skyShift * 10},255,1)`);
        c.fillStyle = skyG;
        c.fillRect(66, 52, 120, 152);
        c.fillStyle = "rgba(255,255,255,0.7)";
        for (let i = 0; i < 3; i++) {
          const cx = 66 + ((game.time * (6 + i * 2) + i * 55) % 160) - 20;
          const cy = 68 + i * 40 + Math.sin(game.time * 0.3 + i * 2) * 4;
          c.beginPath();
          c.ellipse(cx, cy, 18 + i * 4, 8 + i * 2, 0, 0, Math.PI * 2);
          c.fill();
          c.beginPath();
          c.ellipse(cx + 12, cy + 2, 12 + i * 2, 6 + i, 0, 0, Math.PI * 2);
          c.fill();
        }
      }
      /* weather tint overlay on window */
      var wd = getWeatherData();
      if (wd.windowTint) {
        c.fillStyle = wd.windowTint;
        c.fillRect(66, 52, 120, 152);
      }
      c.restore();

      /* warm light rays from window */
      c.save();
      c.globalAlpha = 0.04 + 0.015 * Math.sin(game.time * 0.8);
      c.fillStyle = "rgba(255,240,180,1)";
      c.beginPath();
      c.moveTo(66, 52);
      c.lineTo(190, 52);
      c.lineTo(380, 480);
      c.lineTo(120, 480);
      c.closePath();
      c.fill();
      /* secondary softer ray */
      c.globalAlpha = 0.025 + 0.01 * Math.sin(game.time * 0.6 + 1);
      c.beginPath();
      c.moveTo(100, 80);
      c.lineTo(170, 80);
      c.lineTo(320, 470);
      c.lineTo(200, 470);
      c.closePath();
      c.fill();
      c.restore();

      /* time-of-day room lighting overlay */
      if (tod === 0) {
        c.save(); c.globalAlpha = 0.06;
        c.fillStyle = "#FFE0A0"; c.fillRect(0, 0, W, H);
        c.restore();
      } else if (tod === 2) {
        c.save(); c.globalAlpha = 0.08;
        c.fillStyle = "#E8A050"; c.fillRect(0, 0, W, H);
        c.restore();
      } else if (tod === 3) {
        c.save(); c.globalAlpha = 0.38;
        c.fillStyle = "#141828"; c.fillRect(0, 0, W, H);
        c.restore();
        if (store.decor.lampOn !== false) {
          drawGlowCircle(c, 216, 160, 200, "rgba(255,220,140,ALPHA)", 0.25);
        }
      }

      /* seasonal window effects */
      var seasonNow = getCurrentSeason();
      if (seasonNow === "winter") {
        c.save(); c.globalAlpha = 0.12;
        var frostGrad = c.createRadialGradient(126, 130, 30, 126, 130, 90);
        frostGrad.addColorStop(0, "rgba(200,220,240,0)");
        frostGrad.addColorStop(1, "rgba(200,220,240,1)");
        c.fillStyle = frostGrad;
        c.fillRect(62, 48, 128, 160);
        c.restore();
      }
      if (seasonNow === "spring") {
        c.save(); c.globalAlpha = 0.04;
        c.fillStyle = "#FFE0F0";
        c.fillRect(0, 0, W, H);
        c.restore();
      }

      /* animated lamp glow - conditional on lamp state + time-of-day */
      const lampOn = store.decor.lampOn !== false;
      const todMult = tod === 3 ? 1.6 : tod === 2 ? 1.3 : tod === 0 ? 0.7 : 1.0;
      const lampFlicker = (0.08 + 0.025 * Math.sin(game.time * 1.2) + 0.01 * Math.sin(game.time * 4.7) + 0.005 * Math.sin(game.time * 11.3)) * todMult;
      const lampAlpha = lampOn ? lampFlicker : lampFlicker * 0.05;
      const glowColors = [
        ["rgba(255,232,160,ALPHA)", "rgba(255,220,140,ALPHA)"],
        ["rgba(255,210,230,ALPHA)", "rgba(255,200,220,ALPHA)"],
        ["rgba(255,200,140,ALPHA)", "rgba(255,190,120,ALPHA)"],
        ["rgba(200,215,255,ALPHA)", "rgba(190,205,245,ALPHA)"],
        ["rgba(255,225,170,ALPHA)", "rgba(245,215,155,ALPHA)"]
      ][store.decor.roomPreset || 0] || ["rgba(255,232,160,ALPHA)", "rgba(255,220,140,ALPHA)"];
      drawGlowCircle(c, 216, 146, 96, glowColors[0], lampAlpha);
      drawGlowCircle(c, 216, 160, 50, glowColors[1], lampAlpha * 0.6);
      if (!lampOn) {
        c.save();
        c.globalAlpha = 0.35;
        c.fillStyle = "#000";
        c.beginPath();
        c.ellipse(216, 160, 20, 30, 0, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 0.06;
        c.fillRect(0, 0, W / 2, H);
        c.restore();
      }

      /* steam from mug on side table */
      c.save();
      c.globalAlpha = 0.18;
      for (let i = 0; i < 3; i++) {
        const st = (game.time * 0.6 + i * 1.2) % 3.6;
        const sy = 314 - st * 14;
        const sx = 246 + Math.sin(game.time * 1.5 + i * 2.1) * 4;
        const sa = clamp(1 - st / 3.6, 0, 1) * (st > 0.2 ? 1 : st / 0.2);
        c.globalAlpha = sa * 0.15;
        c.fillStyle = "rgba(255,255,255,0.9)";
        c.beginPath();
        c.ellipse(sx, sy, 3 + st * 1.5, 2 + st, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      /* dust motes floating in light rays */
      if (mode === "hub") {
        c.save();
        for (let i = 0; i < 8; i++) {
          const mt = (game.time * 0.15 + i * 1.7) % 6;
          const mx = 100 + i * 30 + Math.sin(game.time * 0.3 + i * 0.9) * 20;
          const my = 120 + mt * 60 + Math.sin(game.time * 0.5 + i * 1.3) * 8;
          if (my > 460) continue;
          /* only show motes in the light ray area */
          const inRay = mx > 80 && mx < 340 && my > 80;
          if (!inRay) continue;
          const mAlpha = 0.25 + 0.15 * Math.sin(game.time * 2 + i * 0.7);
          c.globalAlpha = mAlpha * clamp(1 - (my - 380) / 80, 0.2, 1);
          c.fillStyle = "#FFF8E0";
          c.beginPath();
          c.arc(mx, my, 1.5 + Math.sin(game.time + i) * 0.5, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }

      /* dynamic decorations */
      const d = store.decor;
      if (d.fairyLights) {
        c.save();
        /* string with natural sag */
        c.strokeStyle = "rgba(180,160,110,0.55)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(50, 228);
        for (let i = 1; i < 16; i++) {
          const px = 50 + i * 47;
          const py = 224 + Math.sin(i * 0.8) * 7 + Math.sin(i * 0.3) * 3;
          c.lineTo(px, py);
        }
        c.stroke();
        /* bulbs with glow */
        for (let i = 0; i < 16; i++) {
          const lx = 50 + i * 47;
          const ly = 224 + Math.sin(i * 0.8) * 7 + Math.sin(i * 0.3) * 3;
          const bulbColor = ["#FFD700","#FF8FAA","#87CEEB","#A8D870","#FFB347"][i % 5];
          const pulse = Math.sin(game.time * 2.5 + i * 1.1);
          /* outer glow */
          c.globalAlpha = 0.25 + pulse * 0.12;
          c.fillStyle = bulbColor;
          c.beginPath(); c.arc(lx, ly + 5, 14, 0, Math.PI * 2); c.fill();
          /* bulb body */
          c.globalAlpha = 0.85 + pulse * 0.15;
          c.beginPath(); c.arc(lx, ly + 5, 5.5, 0, Math.PI * 2); c.fill();
          /* highlight */
          c.globalAlpha = 0.5 + pulse * 0.2;
          c.fillStyle = "rgba(255,255,255,0.7)";
          c.beginPath(); c.arc(lx - 1, ly + 3, 1.5, 0, Math.PI * 2); c.fill();
        }
        c.restore();
      }
      if (d.plant2) {
        c.save();
        c.translate(236, 324);
        /* pot shadow */
        c.fillStyle = "rgba(0,0,0,0.06)";
        c.beginPath(); c.ellipse(0, 14, 14, 4, 0, 0, Math.PI * 2); c.fill();
        /* pot body */
        c.fillStyle = "#A07050";
        rr(c, -10, 0, 20, 14, 4);
        c.fill();
        /* pot rim */
        c.fillStyle = "#B08060";
        rr(c, -12, -2, 24, 5, 3);
        c.fill();
        /* foliage layers */
        c.fillStyle = "#4A9848";
        c.beginPath(); c.ellipse(0, -8, 15, 15, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#5EAA56";
        c.beginPath(); c.ellipse(-5, -14, 11, 11, -0.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#6CBC64";
        c.beginPath(); c.ellipse(5, -12, 9, 9, 0.2, 0, Math.PI * 2); c.fill();
        /* flowers */
        c.fillStyle = "#FF8090";
        c.beginPath(); c.arc(4, -20, 4.5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(-9, -13, 3.5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(8, -10, 3, 0, Math.PI * 2); c.fill();
        /* flower centers */
        c.fillStyle = "#FFD080";
        c.beginPath(); c.arc(4, -20, 1.5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(-9, -13, 1.2, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      if (d.petBed) {
        c.save();
        c.translate(520, 466);
        /* shadow */
        c.fillStyle = "rgba(0,0,0,0.10)";
        c.beginPath(); c.ellipse(0, 12, 46, 12, 0, 0, Math.PI * 2); c.fill();
        /* sofa back */
        c.fillStyle = "#9C6B6B";
        rr(c, -40, -18, 80, 14, 6); c.fill();
        /* sofa arms */
        c.fillStyle = "#A87878";
        rr(c, -44, -14, 12, 24, 5); c.fill();
        rr(c, 32, -14, 12, 24, 5); c.fill();
        /* sofa seat cushion */
        c.fillStyle = "#D4A0A0";
        rr(c, -36, -4, 72, 16, 8); c.fill();
        /* cushion gradient */
        var bedGrad = c.createLinearGradient(0, -4, 0, 12);
        bedGrad.addColorStop(0, "rgba(255,255,255,0.2)");
        bedGrad.addColorStop(1, "rgba(0,0,0,0.05)");
        c.fillStyle = bedGrad;
        rr(c, -36, -4, 72, 16, 8); c.fill();
        /* pillow */
        c.fillStyle = "#E8C0B8";
        c.beginPath(); c.ellipse(-16, 0, 14, 8, -0.1, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(16, 0, 14, 8, 0.1, 0, 0, Math.PI * 2); c.fill();
        /* highlight */
        c.fillStyle = "rgba(255,255,255,0.2)";
        rr(c, -32, -3, 30, 6, 4); c.fill();
        /* sofa border */
        c.strokeStyle = "rgba(120,70,70,0.2)";
        c.lineWidth = 1;
        rr(c, -44, -18, 88, 30, 6); c.stroke();
        c.restore();
      }
      /* cozy blanket on couch back */
      if (d.cozyBlanket) {
        c.save();
        c.translate(400, 268);
        c.fillStyle = "#C4A088";
        c.beginPath();
        c.moveTo(-60, -4);
        c.quadraticCurveTo(-40, 8, -20, 2);
        c.quadraticCurveTo(0, -4, 20, 2);
        c.quadraticCurveTo(40, 8, 60, -2);
        c.lineTo(55, 24);
        c.quadraticCurveTo(30, 30, 0, 26);
        c.quadraticCurveTo(-30, 30, -55, 24);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(160,120,90,0.3)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.12)";
        c.beginPath();
        c.moveTo(-40, 0); c.quadraticCurveTo(-10, -4, 20, 2); c.lineTo(15, 14); c.quadraticCurveTo(-10, 10, -40, 14); c.closePath();
        c.fill();
        c.restore();
      }
      /* window herbs */
      if (d.windowPlant) {
        const herbX = [72, 110, 148];
        for (let hi = 0; hi < 3; hi++) {
          c.save();
          c.translate(herbX[hi], 196);
          c.fillStyle = "#906840";
          rr(c, -6, -2, 12, 8, 3); c.fill();
          c.fillStyle = "#4A9848";
          c.beginPath(); c.ellipse(0, -8, 7, 8, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#5EAA56";
          c.beginPath(); c.ellipse(-3, -12, 4, 5, -0.3, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(3, -11, 4, 5, 0.3, 0, Math.PI * 2); c.fill();
          c.restore();
        }
      }
      /* photo wall */
      if (d.photoWall) {
        const frameY = [100, 140, 170];
        for (let fi = 0; fi < 3; fi++) {
          c.save();
          c.translate(548, frameY[fi]);
          /* V6 — drop shadow under frame */
          c.fillStyle = "rgba(60,40,25,0.22)";
          rr(c, -14, -9, 32, 24, 2); c.fill();
          c.fillStyle = "#8B7355";
          rr(c, -16, -12, 32, 24, 2); c.fill();
          /* V6 — top edge cream highlight */
          c.fillStyle = "rgba(255,248,240,0.4)";
          c.fillRect(-15, -12, 30, 1);
          c.fillStyle = "#FFF8E8";
          rr(c, -13, -9, 26, 18, 1); c.fill();
          c.fillStyle = "rgba(180,150,120,0.3)";
          c.beginPath(); c.arc(-2, 0, 5, 0, Math.PI * 2); c.fill();
          c.restore();
        }
      }
      /* ── Phase 4 decorations ── */
      if (d.floorCushion) {
        c.fillStyle = "#E8A898";
        c.beginPath(); c.ellipse(340, 488, 22, 10, 0.1, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(255,255,255,0.2)";
        c.beginPath(); c.ellipse(336, 486, 8, 4, 0, 0, Math.PI * 2); c.fill();
      }
      if (d.corkBoard) {
        /* V6 — drop shadow */
        c.fillStyle = "rgba(60,40,25,0.22)";
        rr(c, 474, 113, 52, 42, 3); c.fill();
        c.fillStyle = "#B89060";
        rr(c, 472, 110, 52, 42, 3); c.fill();
        /* V6 — top edge highlight */
        c.fillStyle = "rgba(255,248,240,0.32)";
        c.fillRect(473, 110, 50, 1);
        c.fillStyle = "#D4A870";
        rr(c, 475, 113, 46, 36, 2); c.fill();
        /* pins */
        c.fillStyle = "#D04040"; c.beginPath(); c.arc(485, 122, 2.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#4090D0"; c.beginPath(); c.arc(500, 130, 2.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#40B040"; c.beginPath(); c.arc(510, 120, 2.5, 0, Math.PI * 2); c.fill();
        /* notes */
        c.fillStyle = "#FFFAC0"; rr(c, 481, 125, 14, 16, 1); c.fill();
        c.fillStyle = "#C0E8FF"; rr(c, 498, 133, 16, 12, 1); c.fill();
      }
      if (d.bookStack) {
        var bkColors = ["#8B4040", "#40608B", "#6B8B40", "#8B6B40"];
        for (var bi = 0; bi < 4; bi++) {
          c.fillStyle = bkColors[bi];
          rr(c, 236, 360 - bi * 8, 28, 7, 2); c.fill();
        }
      }
      if (d.hangingPlant) {
        /* macrame hanger from ceiling */
        c.strokeStyle = "#C8B8A0"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(560, 0); c.lineTo(560, 60); c.stroke();
        c.beginPath(); c.moveTo(555, 50); c.quadraticCurveTo(560, 65, 565, 50); c.stroke();
        c.fillStyle = "#6B8B40";
        c.beginPath(); c.arc(560, 54, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#8BAB50";
        c.beginPath(); c.arc(556, 48, 6, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(565, 50, 5, 0, Math.PI * 2); c.fill();
      }
      if (d.candles) {
        /* 3 candles on side table — animated glow handled by time */
        for (var ci = 0; ci < 3; ci++) {
          var cx = 240 + ci * 12;
          c.fillStyle = "#FFF0D0"; rr(c, cx - 3, 320, 6, 14, 2); c.fill();
          c.fillStyle = "#FF9020";
          var flicker = Math.sin(game.time * 6 + ci * 2) * 1.5;
          c.beginPath(); c.arc(cx, 318 + flicker, 3, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(255,180,60,0.15)";
          c.beginPath(); c.arc(cx, 320, 10 + flicker, 0, Math.PI * 2); c.fill();
        }
      }
      if (d.wallClock) {
        /* V6 — drop shadow */
        c.fillStyle = "rgba(60,40,25,0.22)";
        c.beginPath(); c.arc(552, 183, 24, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#E8D8C0";
        c.beginPath(); c.arc(550, 180, 24, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "#8B7355"; c.lineWidth = 2;
        c.beginPath(); c.arc(550, 180, 24, 0, Math.PI * 2); c.stroke();
        /* hour hand */
        var hr = (game.time * 0.001) % (Math.PI * 2);
        c.strokeStyle = "#5C4434"; c.lineWidth = 2;
        c.beginPath(); c.moveTo(550, 180); c.lineTo(550 + Math.sin(hr) * 12, 180 - Math.cos(hr) * 12); c.stroke();
        /* minute hand */
        var mn = (game.time * 0.01) % (Math.PI * 2);
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(550, 180); c.lineTo(550 + Math.sin(mn) * 17, 180 - Math.cos(mn) * 17); c.stroke();
        /* second hand */
        var secAngle = (game.time % 60) / 60 * Math.PI * 2;
        c.strokeStyle = "#C0392B"; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(550, 180); c.lineTo(550 + Math.sin(secAngle) * 18, 180 - Math.cos(secAngle) * 18); c.stroke();
        c.fillStyle = "#5C4434"; c.beginPath(); c.arc(550, 180, 2, 0, Math.PI * 2); c.fill();
      }
      if (d.petToys) {
        /* small basket of toys on the floor */
        c.fillStyle = "#B89868";
        rr(c, 300, 478, 36, 18, 6); c.fill();
        c.fillStyle = "#4A90D9"; c.beginPath(); c.arc(308, 476, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#E8A84C"; rr(c, 316, 473, 12, 5, 2); c.fill();
        c.fillStyle = "#FF69B4"; c.beginPath(); c.arc(324, 476, 4, 0, Math.PI * 2); c.fill();
      }
      if (d.garland > 0) {
        var gColors = [
          ["#FFB6C1", "#FFD700", "#87CEEB"],
          ["#FFD700", "#FF8C42", "#FFE4B5"],
          ["#C87848", "#A87048", "#D4A848"],
          ["#B8D8F0", "#E8E8F0", "#D0D8E8"]
        ];
        var gc = gColors[(d.garland - 1) % gColors.length];
        c.strokeStyle = "rgba(160,140,120,0.3)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(300, 36); c.quadraticCurveTo(400, 50, 500, 36); c.stroke();
        for (var gi = 0; gi < 8; gi++) {
          var gx = 310 + gi * 24;
          var gy = 36 + Math.sin((gi / 7) * Math.PI) * 14;
          c.fillStyle = gc[gi % gc.length];
          c.beginPath(); c.arc(gx, gy + 4, 6, 0, Math.PI * 2); c.fill();
        }
      }
      if (d.musicBox) {
        c.fillStyle = "#B89060";
        rr(c, 248, 328, 18, 12, 3); c.fill();
        c.fillStyle = "#FFD700";
        c.beginPath(); c.arc(257, 326, 2, 0, Math.PI * 2); c.fill();
        /* sparkle particles */
        for (var si = 0; si < 3; si++) {
          var sPhase = game.time * 3 + si * 2.1;
          var sx = 257 + Math.sin(sPhase) * 8;
          var sy = 322 - Math.abs(Math.sin(game.time * 2 + si)) * 10;
          c.globalAlpha = 0.5 + Math.sin(sPhase) * 0.3;
          c.beginPath();
          c.arc(sx, sy, 3 + Math.sin(sPhase * 0.5), 0, Math.PI * 2);
          c.fillStyle = "#FFE4B5";
          c.fill();
        }
        c.globalAlpha = 1;
      }
      if (d.familyPortrait) {
        /* V6 — drop shadow */
        c.fillStyle = "rgba(60,40,25,0.22)";
        rr(c, 342, 93, 44, 36, 3); c.fill();
        c.fillStyle = "#C8A872";
        rr(c, 340, 90, 44, 36, 3); c.fill();
        /* V6 — top edge highlight */
        c.fillStyle = "rgba(255,248,240,0.4)";
        c.fillRect(341, 90, 42, 1);
        c.fillStyle = "#FFE8D8";
        rr(c, 344, 94, 36, 28, 2); c.fill();
        /* tiny silhouettes */
        c.fillStyle = "#E8C85A"; c.beginPath(); c.arc(358, 104, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#FAFAFA"; c.beginPath(); c.arc(350, 112, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#9B7D3C"; c.beginPath(); c.arc(366, 112, 3.5, 0, Math.PI * 2); c.fill();
      }
      var couchPillowColors = [null, "#E88070", "#7ECBB0", "#E8C84A", "#C39BD3"];
      if (d.couchPillows > 0) {
        c.fillStyle = couchPillowColors[d.couchPillows] || "#E88070";
        c.beginPath(); c.ellipse(352, 310, 14, 10, -0.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(448, 308, 12, 9, 0.15, 0, Math.PI * 2); c.fill();
      }

      const rugColors = ["rgba(216,194,168,1)", "rgba(168,198,148,1)", "rgba(185,170,210,1)", "rgba(210,175,168,1)"];
      if (d.rugColor > 0) {
        c.save();
        c.globalAlpha = 0.22;
        c.fillStyle = rugColors[d.rugColor];
        c.beginPath(); c.ellipse(400, 470, 220, 55, 0, 0, Math.PI * 2); c.fill();
        /* rug texture highlight */
        c.globalAlpha = 0.06;
        c.fillStyle = "#FFFFFF";
        c.beginPath(); c.ellipse(400, 465, 180, 40, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      /* Golden Room collection */
      if (d.goldenCurtains) {
        c.fillStyle = "rgba(218,180,80,0.3)";
        c.fillRect(56, 40, 20, 180); c.fillRect(186, 40, 20, 180);
        c.fillStyle = "#D4B050"; c.fillRect(56, 40, 20, 10); c.fillRect(186, 40, 20, 10);
      }
      if (d.chandelier) {
        c.save(); c.translate(400, 20);
        c.strokeStyle = "rgba(218,180,80,0.5)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 18); c.stroke();
        for (var chi = 0; chi < 5; chi++) {
          var chx = -20 + chi * 10;
          c.strokeStyle = "rgba(218,180,80,0.4)";
          c.beginPath(); c.moveTo(0, 18); c.lineTo(chx, 32); c.stroke();
          c.fillStyle = "rgba(255,240,180," + (0.4 + Math.sin(game.time * 3 + chi) * 0.15) + ")";
          c.beginPath(); c.arc(chx, 34, 3, 0, Math.PI * 2); c.fill();
        }
        c.restore();
      }
      if (d.silkPillows) {
        c.fillStyle = "#C8A8D0"; c.beginPath(); c.ellipse(370, 298, 18, 10, -0.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#D0B8D8"; c.beginPath(); c.ellipse(430, 300, 16, 9, 0.15, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(255,255,255,0.2)"; c.beginPath(); c.ellipse(368, 294, 8, 4, -0.2, 0, Math.PI * 2); c.fill();
      }
      if (d.royalThrone) {
        c.save(); c.translate(520, 432);
        c.fillStyle = "#B08020"; rr(c, -22, -24, 44, 8, 3); c.fill();
        c.fillStyle = "#C89830"; rr(c, -18, -16, 36, 20, 4); c.fill();
        c.fillStyle = "#D8A840"; c.beginPath(); c.ellipse(0, -10, 14, 8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#FFD700"; c.beginPath(); c.arc(0, -28, 4, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      /* room style preset tint — applied after all room elements */
      if (store.decor.roomPreset === 1) {
        c.save(); c.globalCompositeOperation = "multiply";
        c.fillStyle = "rgba(245,225,238,0.15)"; c.fillRect(0, 0, W, 340);
        c.fillStyle = "rgba(240,225,215,0.12)"; c.fillRect(0, 340, W, H - 340);
        c.restore();
      } else if (store.decor.roomPreset === 2) {
        c.save(); c.globalCompositeOperation = "multiply";
        c.fillStyle = "rgba(245,228,200,0.18)"; c.fillRect(0, 0, W, 340);
        c.fillStyle = "rgba(235,210,180,0.14)"; c.fillRect(0, 340, W, H - 340);
        c.restore();
      } else if (store.decor.roomPreset === 3) {
        c.save(); c.globalCompositeOperation = "multiply";
        c.fillStyle = "rgba(200,215,240,0.15)"; c.fillRect(0, 0, W, 340);
        c.fillStyle = "rgba(190,200,220,0.12)"; c.fillRect(0, 340, W, H - 340);
        c.restore();
      } else if (store.decor.roomPreset === 4) {
        c.save(); c.globalCompositeOperation = "multiply";
        c.fillStyle = "rgba(230,215,195,0.16)"; c.fillRect(0, 0, W, 340);
        c.fillStyle = "rgba(220,200,175,0.12)"; c.fillRect(0, 340, W, H - 340);
        c.restore();
      }

      if (mode === "cuddle") {
        drawGlowCircle(c, 398, 310, 170, "rgba(255,255,255,ALPHA)", 0.08);
      }
    }


