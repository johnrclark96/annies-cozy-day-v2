    function drawZzz(c, x, y, scale = 1, alpha = 0.9) {
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = "#FFF8F0";
      c.strokeStyle = "rgba(92,68,52,0.45)";
      c.lineWidth = 2;
      c.font = `${Math.round(16 * scale)}px "Fredoka One", "Comic Sans MS", cursive, sans-serif`;
      c.strokeText("Zzz", x, y);
      c.fillText("Zzz", x, y);
      c.restore();
    }


    function drawFrameImage(c, frame, x, y, scale, options = {}) {
      if (!frame || !spriteArt.image) return;
      const pxScale = (options.baseScale || 0.18) * scale;
      const stretchX = options.stretchX || 1;
      const stretchY = options.stretchY || 1;
      const w = frame.w * pxScale * stretchX;
      const h = frame.h * pxScale * stretchY;
      const bob = options.bob || 0;
      const flip = options.flip || 1;
      const rotation = options.rotation || 0;
      const shadowAlpha = options.shadowAlpha == null ? 0.16 : options.shadowAlpha;

      c.save();
      c.translate(x, y + bob);
      c.rotate(rotation);
      c.scale(flip, 1);
      if (shadowAlpha > 0) {
        drawShadowEllipse(c, 0, -4, Math.max(20, w * 0.22), Math.max(6, h * 0.045), shadowAlpha);
      }
      if (options.glow) {
        c.shadowColor = options.glow;
        c.shadowBlur = options.glowBlur || 22;
      }
      c.drawImage(spriteArt.image, frame.x, frame.y, frame.w, frame.h, -w / 2, -h, w, h);
      c.restore();
    }

    function drawUpperFrame(c, frame, x, y, scale, options = {}) {
      if (!frame || !spriteArt.image) return;
      const crop = options.crop || 0.6;
      const sw = frame.w;
      const sh = Math.max(1, Math.floor(frame.h * crop));
      const pxScale = (options.baseScale || 0.16) * scale;
      const w = sw * pxScale;
      const h = sh * pxScale;
      c.save();
      c.translate(x, y + (options.bob || 0));
      c.rotate(options.rotation || 0);
      if (options.glow) {
        c.shadowColor = options.glow;
        c.shadowBlur = options.glowBlur || 20;
      }
      c.drawImage(spriteArt.image, frame.x, frame.y, sw, sh, -w / 2, -h * 0.15, w, h);
      c.restore();
    }

    function drawAnnieSprite(c, x, y, scale, s) {
      const pose = s.pose || "idle";
      const frames = spriteArt.frames.annie;
      let frame = frames.stand;
      if (pose === "sit") frame = frames.sit;
      else if (pose === "kneel") frame = frames.kneel;
      else if (pose === "walk") frame = frames.walkSide;
      else if (pose === "walkFront") frame = frames.walkFront;
      else if (pose === "cheer") frame = frames.cheer;
      else if (pose === "laugh") frame = frames.laugh;
      else if (pose === "upper") frame = (s.armRaise || 0) > 0.4 ? frames.cheer : frames.stand;
      else if (pose === "sleeping") frame = frames.laugh;
      else if (pose === "happy") frame = frames.cheer;
      else if ((s.blink && pose !== "upper" && pose !== "sit") || (s.armRaise || 0) > 0.7) frame = frames.cheer;
      const bob = -(s.breath || 0) * 4.5 + (pose === "walk" || pose === "walkFront" ? Math.sin(game.time * 8) * 2 : 0);
      const rotation = (s.headTilt || 0) * 0.08 + (s.hairSway || 0) * 0.02;
      if (pose === "upper") {
        drawUpperFrame(c, frame, x, y + 4, scale, {
          baseScale: SPRITE_BASE_SCALE.annie,
          crop: frame === frames.cheer ? 0.58 : 0.62,
          rotation,
          bob,
          glow: s.glow
        });
        return;
      }
      drawFrameImage(c, frame, x, y, scale, {
        baseScale: SPRITE_BASE_SCALE.annie,
        flip: s.facing || 1,
        rotation,
        bob,
        stretchY: 1 + (s.breath || 0) * 0.03,
        glow: s.glow
      });
      if (pose === "sleeping") drawZzz(c, x + 34, y - 150 * scale, 0.9 * scale);
    }

    function drawObiSprite(c, x, y, scale, s) {
      const pose = s.pose || "sit";
      const expression = s.expression || "happy";
      const frames = spriteArt.frames.obi;
      const happyMotion = (s.bounce || 0) > 0.06 || expression === "excited";
      let frame = frames.sitHappy;
      if (pose === "run" || pose === "side") frame = Math.sin(game.time * (happyMotion ? 18 : 12)) > 0 ? frames.run : frames.leap;
      else if (pose === "sleeping") frame = frames.sleep;
      else if (pose === "sniff") frame = frames.sniff;
      else if (pose === "shake") frame = frames.shake;
      else if (pose === "eat") frame = frames.eat;
      else if (pose === "drink") frame = frames.drink;
      else if (pose === "carryToy") frame = frames.carryToy;
      else if (pose === "bath") frame = frames.bath;
      else if (pose === "dig") frame = frames.dig;
      else if (pose === "splash") frame = frames.splash;
      else if (expression === "sad") frame = frames.sitSad;
      else if (happyMotion) frame = Math.sin(game.time * 14) > 0 ? frames.leap : frames.sitHappy;
      var obiFrameKey = "obi." + pose;
      var obiFix = FRAME_SCALE_FIX[obiFrameKey] || 1;
      drawFrameImage(c, frame, x, y, scale * obiFix, {
        baseScale: SPRITE_BASE_SCALE.obi,
        flip: s.facing || 1,
        bob: -(s.bounce || 0) * 20,
        rotation: (expression === "sad" ? -0.03 * (s.facing || 1) : 0) + (pose === "shake" ? Math.sin(game.time * 24) * 0.06 : 0),
        stretchY: 1 + (s.bounce || 0) * 0.08,
        glow: s.glow
      });
      if (pose === "sleeping") drawZzz(c, x + 30, y - 96 * scale, 0.85 * scale);
    }

    function drawLunaSprite(c, x, y, scale, s) {
      const pose = s.pose || "sit";
      const frames = spriteArt.frames.luna;
      let frame = frames.sit;
      if (pose === "lounge") frame = Math.sin(game.time * 2.4) > 0 ? frames.crouch : frames.paw;
      else if (pose === "sleeping") frame = frames.sleep;
      else if (pose === "groom") frame = frames.groom;
      else if (pose === "bellyUp") frame = frames.bellyUp;
      else if (pose === "eat") frame = frames.eat;
      else if (pose === "drink") frame = frames.drink;
      else if (pose === "stretch") frame = frames.stretch;
      else if (pose === "bath") frame = frames.bath;
      else if (pose === "treeSit") frame = frames.treeSit;
      else if (pose === "stalk") frame = frames.stalk;
      else if (pose === "topdown") {
        if ((s.pawBat || 0) > 0.12) frame = frames.paw;
        else if ((s.pounceStretch || 0) > 0.35) frame = frames.pounce;
        else frame = frames.crouch;
      } else if ((s.pawBat || 0) > 0.12) frame = frames.paw;
      else if ((s.blink && pose !== "topdown") || (s.pounceStretch || 0) > 0.25) frame = frames.pounce;
      const topdownRot = pose === "topdown" ? clamp(Math.atan2(game.mouse.y - y, game.mouse.x - x) * 0.18, -0.42, 0.42) : 0;
      const bellyRock = pose === "bellyUp" ? Math.sin(game.time * 3) * 0.04 : 0;
      var lunaFrameKey = "luna." + pose;
      var lunaFix = FRAME_SCALE_FIX[lunaFrameKey] || 1;
      drawFrameImage(c, frame, x, y, scale * lunaFix, {
        baseScale: SPRITE_BASE_SCALE.luna,
        flip: (pose === "topdown" ? (game.mouse.x >= x ? 1 : -1) : (s.facing || 1)),
        bob: -Math.abs(s.wiggle || 0) * 2 - (s.pawBat || 0) * 4 + (pose === "bellyUp" ? Math.sin(game.time * 2) * 2 : 0),
        rotation: topdownRot + (s.earTwitch || 0) * 0.09 + bellyRock,
        stretchX: 1 + (s.pounceStretch || 0) * 0.12,
        stretchY: 1 - (s.pounceStretch || 0) * 0.06,
        glow: s.glow
      });
      if (pose === "sleeping") drawZzz(c, x + 26, y - 90 * scale, 0.82 * scale);
    }

    function normalizeState(state, fallbackPose = "idle") {
      if (!state) return { pose: fallbackPose };
      if (typeof state === "string") return { pose: state };
      return state;
    }

