    function drawTreatBackdrop(c) {
      if (!sceneCache.treatBase) buildStaticCaches();
      c.drawImage(sceneCache.treatBase, 0, 0);
      c.save();
      c.globalAlpha = 0.24;
      c.translate((game.time * 12) % 220, 0);
      c.fillStyle = "rgba(255,255,255,0.9)";
      for (let i = -1; i < 5; i++) {
        c.beginPath();
        c.arc(i * 220 + 80, 138 + (i % 2) * 18, 24, 0, Math.PI * 2);
        c.arc(i * 220 + 104, 146 + (i % 2) * 18, 16, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    function drawLaserBackdrop(c) {
      if (!sceneCache.laserBase) buildStaticCaches();
      c.drawImage(sceneCache.laserBase, 0, 0);
      drawGlowCircle(c, 702, 100, 86, "rgba(255,236,177,ALPHA)", 0.12);
    }

    function drawAimPreview(c, sx, sy, tx, flight = 0.92) {
      c.save();
      c.fillStyle = "rgba(255,255,255,0.75)";
      for (let i = 0; i < 12; i++) {
        const t = (i + 1) / 13 * flight;
        const px = sx + ((tx - sx) / flight) * t;
        const py = sy + 30 * t + 0.5 * 640 * t * t;
        c.beginPath();
        c.arc(px, py, 3 + i * 0.08, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    function drawTitleBg(c) {
      if (!sceneCache.titleBase) buildStaticCaches();
      c.drawImage(sceneCache.titleBase, 0, 0);

      /* layered bokeh lights - slow parallax */
      c.save();
      for (let layer = 0; layer < 3; layer++) {
        const speed = 0.08 + layer * 0.06;
        const baseSize = 30 + layer * 20;
        const alpha = 0.05 - layer * 0.012;
        for (let i = 0; i < 5; i++) {
          const bx = ((game.time * speed * 40 + i * 170 + layer * 90) % (W + 100)) - 50;
          const by = 80 + i * 100 + layer * 30 + Math.sin(game.time * 0.4 + i * 1.5 + layer) * 25;
          const bs = baseSize + Math.sin(game.time * 0.6 + i * 2) * 8;
          const bg = c.createRadialGradient(bx, by, 0, bx, by, bs);
          bg.addColorStop(0, `rgba(255,220,160,${alpha + 0.02})`);
          bg.addColorStop(0.5, `rgba(255,200,140,${alpha})`);
          bg.addColorStop(1, "rgba(255,200,140,0)");
          c.fillStyle = bg;
          c.beginPath();
          c.arc(bx, by, bs, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.restore();

      /* floating hearts and stars */
      for (const a of game.ambient) {
        c.save();
        c.globalAlpha = 0.28 + 0.14 * Math.sin(game.time * 1.2 + a.phase);
        c.translate(0, Math.sin(game.time * 0.8 + a.phase) * 2);
        if (a.shape === "heart") drawHeart(c, a.x, a.y, a.size / 14, a.color);
        else drawStar(c, a.x, a.y, a.size, a.color);
        c.restore();
      }

      /* warm spotlight behind character area */
      const spotG = c.createRadialGradient(400, 400, 40, 400, 400, 240);
      spotG.addColorStop(0, "rgba(255,240,210,0.12)");
      spotG.addColorStop(0.6, "rgba(255,230,200,0.05)");
      spotG.addColorStop(1, "rgba(255,230,200,0)");
      c.fillStyle = spotG;
      c.fillRect(100, 200, 600, 350);
    }

