    // ═══ 21-loop.js ═══
    function drawMuteIcon(c) {
      const rect = { x: W - SAFE - 28, y: SAFE, w: 28, h: 28 };
      const hovered = pointInRect(game.mouse.x, game.mouse.y, rect);
      drawSpeakerIcon(c, rect.x, rect.y, store.muted, hovered);
    }

    function handleMuteClick(x, y) {
      const rect = { x: W - SAFE - 28, y: SAFE, w: 28, h: 28 };
      if (pointInRect(x, y, rect)) {
        audio.ensure();
        store.muted = !store.muted;
        saveBool("muted", store.muted);
        if (!store.muted) { audio.menu(); if (game.scene && (game.scene.name === "hangout" || game.scene.name === "backyard")) audio.startAmbient(); }
        else { audio.stopAmbient(); }
        return true;
      }
      return false;
    }

    function loop(ts) {
      if (!game.last) game.last = ts;
      let dt = (ts - game.last) / 1000;
      game.last = ts;
      dt = clamp(dt, 0, 0.033);
      game.time += dt;

      updateSharedParticles(dt);

      if (game.transition) {
        game.transition.t += dt;
        if (game.transition.from) game.transition.from.update(dt);
        if (game.transition.t >= game.transition.duration) {
          game.scene = game.transition.to;
          game.transition = null;
        }
      } else if (game.scene) {
        game.scene.update(dt);
      }

      /* screen shake */
      if (game.shake > 0) {
        game.shake -= dt;
        const intensity = game.shakeIntensity * clamp(game.shake / 0.1, 0, 1);
        game.shakeX = (Math.random() - 0.5) * intensity * 2;
        game.shakeY = (Math.random() - 0.5) * intensity * 2;
      } else {
        game.shakeX = 0;
        game.shakeY = 0;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(game.shakeX, game.shakeY);
      if (game.transition) {
        const p = clamp(game.transition.t / game.transition.duration, 0, 1);
        if (game.transition.from) {
          ctx.save();
          ctx.globalAlpha = 1 - p;
          ctx.translate(W/2, H/2); ctx.scale(1 - p*0.03, 1 - p*0.03); ctx.translate(-W/2, -H/2);
          game.transition.from.draw(ctx);
          drawMuteIcon(ctx);
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = p;
        ctx.translate(W/2, H/2); ctx.scale(0.97 + p*0.03, 0.97 + p*0.03); ctx.translate(-W/2, -H/2);
        game.transition.to.draw(ctx);
        drawMuteIcon(ctx);
        ctx.restore();
      } else if (game.scene) {
        game.scene.draw(ctx);
        drawMuteIcon(ctx);
      }
      drawSharedParticles(ctx);

      /* warm vignette */
      ctx.save();
      const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(40,25,15,0.18)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      ctx.restore(); /* end screen shake transform */

      if (game.scene || game.transition) {
        const activeScene = game.transition ? game.transition.from : game.scene;
        const overMute = pointInRect(game.mouse.x, game.mouse.y, { x: W - 54, y: 12, w: 40, h: 40 });
        canvas.style.cursor = (overMute || (activeScene && activeScene.interactiveAt(game.mouse.x, game.mouse.y))) ? "pointer" : "default";
      }

  
    // TEST HOOK: expose current scene name globally
    window.__getScene = () => {
      if (game.transition) return 'transition:' + (game.transition.to && game.transition.to.name ? game.transition.to.name : 'unknown');
      if (game.scene) return game.scene.name || 'unknown';
      return 'none';
    };
    window.__getSceneDetails = () => {
      const s = game.scene;
      if (!s) return { name: 'none' };
      const result = { name: s.name || 'unknown' };
      if (s.menuOpen !== undefined) result.menuOpen = s.menuOpen;
      if (s.decorOpen !== undefined) result.decorOpen = s.decorOpen;
      if (s.wardrobeOpen !== undefined) result.wardrobeOpen = s.wardrobeOpen;
      if (s.scrapbookOpen !== undefined) result.scrapbookOpen = s.scrapbookOpen;
      if (s.dedication !== undefined) result.dedication = !!s.dedication;
      if (s.dailyGift !== undefined) result.dailyGift = !!s.dailyGift;
      if (s.phase !== undefined) result.phase = s.phase;
      if (s.paused !== undefined) result.paused = s.paused;
      if (s.timer !== undefined) result.timer = s.timer;
      if (s.foodBowl) result.foodBowl = {x: s.foodBowl.x, y: s.foodBowl.y, fill: s.foodBowl.fill};
      if (s.waterBowl) result.waterBowl = {x: s.waterBowl.x, y: s.waterBowl.y, fill: s.waterBowl.fill};
      if (s.obi) result.obi = {x: s.obi.x, y: s.obi.y, joy: s.obi.joy};
      if (s.luna) result.luna = {x: s.luna.x, y: s.luna.y, joy: s.luna.joy, perch: s.luna.perch};
      if (s.annie) result.annie = {x: s.annie.x, y: s.annie.y, pose: s.annie.pose};
      if (s.tree) result.tree = {x: s.tree.x, y: s.tree.y};
      if (s.pool) result.pool = {x: s.pool.x, y: s.pool.y};
      if (s.feeder) result.feeder = {x: s.feeder.x, y: s.feeder.y};
      if (s.garden) result.garden = {x: s.garden.x, y: s.garden.y};
      if (s.byDecorButton) result.byDecorButton = s.byDecorButton;
      return result;
    };
    /* Direct scene modification hook for testing */
    window.__modifyScene = (fn) => {
      const s = game.scene;
      if (!s) return false;
      try { fn(s); return true; } catch(e) { return e.message; }
    };
    /* Direct scene transition hook for testing */
    window.__goToScene = (key) => {
      try { transitionTo(SceneRegistry.create(key)); return true; } catch(e) { return e.message; }
    };
    /* Phase A.4 synthetic test hook for drawPanelTabs / panelTabHit geometry */
    window.__panelTabsTest = () => {
      var panel = { x: 100, y: 70, w: 600, h: 480 };
      var tabs = [{ key: "a" }, { key: "b" }, { key: "c" }, { key: "d" }];
      return {
        hitTabA: panelTabHit(panel, tabs, 200, 140),
        hitTabC: panelTabHit(panel, tabs, 410, 140),
        hitMissY: panelTabHit(panel, tabs, 200, 200),
        hitMissX: panelTabHit(panel, tabs, 90, 140)
      };
    };

    requestAnimationFrame(loop);
    }


