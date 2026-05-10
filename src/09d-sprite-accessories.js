    function getAccessoryOffset(pet, key, pose) {
      var hidden = ["sleeping", "bath", "shake", "splash", "dig"];
      if (hidden.indexOf(pose) >= 0) return null;
      var slot = null;
      var list = ACCESSORIES[pet];
      for (var i = 0; i < list.length; i++) { if (list[i].key === key) { slot = list[i].slot; break; } }
      if (!slot) return null;
      /* Offsets are relative to pet anchor (feet position).
         renderSize = how wide to draw the accessory in pixels. */
      if (pet === "obi") {
        if (slot === "head") {
          var dy = -72, dx = 0, sz = 22, rot = 0;
          if (pose === "run" || pose === "side") { dy = -56; dx = 6; rot = 0.05; }
          else if (pose === "sniff") { dy = -48; dx = 10; rot = 0.15; sz = 20; }
          else if (pose === "eat" || pose === "drink") { dy = -46; dx = 8; rot = 0.12; sz = 20; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        if (slot === "neck") {
          var dy = -58, dx = 2, sz = 30, rot = 0;
          if (pose === "run" || pose === "side") { dy = -42; dx = 8; rot = 0.1; }
          else if (pose === "sniff") { dy = -38; dx = 12; rot = 0.2; sz = 28; }
          else if (pose === "eat" || pose === "drink") { dy = -36; dx = 10; rot = 0.15; sz = 28; }
          else if (pose === "carryToy") { dy = -44; dx = 6; rot = 0.05; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        if (slot === "body") {
          var dy = -48, dx = 0, sz = 50, rot = 0;
          if (pose === "run" || pose === "side") { dy = -36; dx = 4; }
          else if (pose === "sniff" || pose === "eat" || pose === "drink") { dy = -32; rot = 0.1; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
      } else if (pet === "annie") {
        /* annie */
        if (slot === "head") {
          var dy = -120, dx = 0, sz = 30, rot = 0;
          if (pose === "sit" || pose === "kneel") { dy = -108; }
          else if (pose === "walk" || pose === "walkSide") { dy = -118; dx = 4; }
          else if (pose === "cheer") { dy = -124; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        if (slot === "wrist") {
          var dy = -60, dx = 20, sz = 22, rot = 0;
          if (pose === "sit") { dy = -50; dx = 18; }
          else if (pose === "kneel") { dy = -46; dx = 20; }
          else if (pose === "cheer") { dy = -70; dx = 24; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        return null;
      } else {
        /* luna */
        if (slot === "head") {
          var dy = -68, dx = 0, sz = 34, rot = 0;
          if (pose === "lounge") { dy = -48; dx = 4; sz = 30; }
          else if (pose === "groom") { dy = -56; dx = -4; rot = -0.1; sz = 30; }
          else if (pose === "treeSit") { dy = -54; dx = 2; sz = 30; }
          else if (pose === "stalk") { dy = -28; dx = 8; rot = 0.15; sz = 28; }
          else if (pose === "eat" || pose === "drink") { dy = -34; dx = 8; rot = 0.2; sz = 28; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        if (slot === "neck") {
          var dy = -54, dx = 0, sz = 36, rot = 0;
          if (pose === "lounge") { dy = -38; dx = 4; sz = 32; }
          else if (pose === "stalk") { dy = -22; dx = 6; rot = 0.1; sz = 30; }
          else if (pose === "eat" || pose === "drink") { dy = -28; dx = 8; rot = 0.15; sz = 30; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
        if (slot === "body") {
          var dy = -42, dx = 0, sz = 60, rot = 0;
          if (pose === "lounge") { dy = -30; dx = 4; sz = 55; }
          else if (pose === "stalk") { dy = -18; dx = 6; rot = 0.1; sz = 50; }
          else if (pose === "eat" || pose === "drink") { dy = -24; dx = 8; rot = 0.15; sz = 52; }
          return { dx: dx, dy: dy, size: sz, rot: rot };
        }
      }
      return null;
    }

    function drawAccessoryOverlay(c, pet, x, y, scale, pose, facing, equippedOverride) {
      var equipped = (equippedOverride !== undefined) ? equippedOverride : store.wardrobe.equipped[pet];
      if (!equipped || typeof equipped !== "object") return;
      if (!spriteArt.ready) return;
      var mainAccFrames = spriteArt.frames.accessories || {};
      var slots = Object.keys(equipped);
      for (var si = 0; si < slots.length; si++) {
        var key = equipped[slots[si]];
        if (!key) continue;
        var off = getAccessoryOffset(pet, key, pose);
        if (!off) continue;
        /* look up frame from main atlas first, then accessory atlas */
        var frame = mainAccFrames[key];
        var atlasImg = spriteArt.image;
        if (!frame && ACCESSORY_ATLAS_FRAMES[key]) {
          frame = ACCESSORY_ATLAS_FRAMES[key];
          atlasImg = spriteArt.accessoryImage;
        }
        if (!frame || !atlasImg) continue;
        var f = facing || 1;
        var ax = x + off.dx * scale * f;
        var ay = y + off.dy * scale;
        var renderW = off.size * scale;
        var aspect = frame.h / frame.w;
        var renderH = renderW * aspect;
        c.save();
        c.translate(ax, ay);
        c.rotate(off.rot * f);
        c.scale(f, 1);
        c.drawImage(atlasImg, frame.x, frame.y, frame.w, frame.h,
          -renderW / 2, -renderH / 2, renderW, renderH);
        c.restore();
      }
    }


