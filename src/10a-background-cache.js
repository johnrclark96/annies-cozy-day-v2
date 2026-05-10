    // ═══ 10-backgrounds.js ═══
    const sceneCache = Object.create(null);

    function buildStaticCaches() {
      /* ── Title screen background ── */
      const tc = makeBufferCanvas(W, H);
      const tx = tc.getContext("2d");
      const tg = tx.createLinearGradient(0, 0, 0, H);
      tg.addColorStop(0, "#FFE8D6");
      tg.addColorStop(0.5, "#FFDAB9");
      tg.addColorStop(1, "#F5C6A0");
      tx.fillStyle = tg;
      tx.fillRect(0, 0, W, H);
      tx.fillStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < 6; i++) {
        tx.beginPath();
        tx.arc(130 + i * 140, 500 - i * 30 + (i % 2) * 60, 80 + i * 12, 0, Math.PI * 2);
        tx.fill();
      }
      tx.fillStyle = "rgba(255,200,160,0.18)";
      for (let i = 0; i < 4; i++) {
        tx.beginPath();
        tx.arc(200 + i * 180, 150 + (i % 2) * 100, 60, 0, Math.PI * 2);
        tx.fill();
      }
      sceneCache.titleBase = tc;

      /* V5 — soft character shadow sprite (cached, drawn per character per frame) */
      const cs = makeBufferCanvas(80, 24);
      const csx = cs.getContext("2d");
      const csg = csx.createRadialGradient(40, 12, 0, 40, 12, 44);
      csg.addColorStop(0, "rgba(80,55,35,1)");
      csg.addColorStop(1, "rgba(80,55,35,0)");
      csx.fillStyle = csg;
      csx.beginPath();
      csx.ellipse(40, 12, 40, 12, 0, 0, Math.PI * 2);
      csx.fill();
      sceneCache.charShadow = cs;

      /* ── Living room background ── */
      var roomPalettes = [
        /* 0: Cozy Neutral */ { wallTop: "#F5E6D3", wallBot: "#EDD8C4", stripe: "rgba(220,200,175,0.12)", wainscot: "#E8D4BC", wainLine: "#D8C0A4", floorTop: "#EFD8BE", floorBot: "#E2C6A4", plank: "rgba(180,145,110,0.15)", base: "#D4B896" },
        /* 1: Pastel Cute */  { wallTop: "#F5E0EE", wallBot: "#EEDAE8", stripe: "rgba(225,190,210,0.12)", wainscot: "#EECEDE", wainLine: "#DDB8CC", floorTop: "#F2DCD0", floorBot: "#E8C8B8", plank: "rgba(190,150,140,0.12)", base: "#DEB8AA" },
        /* 2: Warm Cottage */ { wallTop: "#F5E2C8", wallBot: "#EDD4B0", stripe: "rgba(210,180,140,0.15)", wainscot: "#E2C8A0", wainLine: "#D0B48C", floorTop: "#E0C4A0", floorBot: "#D4B088", plank: "rgba(170,130,90,0.18)", base: "#C8A478" },
        /* 3: Moonlight Blue */ { wallTop: "#D8E0F0", wallBot: "#C8D4E8", stripe: "rgba(180,195,220,0.12)", wainscot: "#C0D0E0", wainLine: "#A8B8D0", floorTop: "#D0D4DC", floorBot: "#BCC4D0", plank: "rgba(140,155,175,0.12)", base: "#A8B4C4" },
        /* 4: Bookish Cozy */ { wallTop: "#E8D8C0", wallBot: "#DCC8A8", stripe: "rgba(195,170,130,0.15)", wainscot: "#D4C0A0", wainLine: "#C0A880", floorTop: "#D8C0A0", floorBot: "#C8AE8C", plank: "rgba(160,130,95,0.18)", base: "#BCA078" }
      ];
      var rp = roomPalettes[store.decor.roomPreset || 0];
      const lc = makeBufferCanvas(W, H);
      const lx = lc.getContext("2d");
      /* wall */
      const wg = lx.createLinearGradient(0, 0, 0, 340);
      wg.addColorStop(0, rp.wallTop);
      wg.addColorStop(1, rp.wallBot);
      lx.fillStyle = wg;
      lx.fillRect(0, 0, W, 340);
      /* subtle wall texture stripes */
      lx.fillStyle = rp.stripe;
      for (let i = 0; i < 20; i++) lx.fillRect(i * 42, 0, 20, 340);
      /* wainscoting / lower wall panel */
      lx.fillStyle = rp.wainscot;
      lx.fillRect(0, 240, W, 100);
      lx.strokeStyle = rp.wainLine;
      lx.lineWidth = 2;
      lx.beginPath(); lx.moveTo(0, 240); lx.lineTo(W, 240); lx.stroke();
      lx.beginPath(); lx.moveTo(0, 248); lx.lineTo(W, 248); lx.stroke();
      /* floor */
      const fg = lx.createLinearGradient(0, 340, 0, H);
      fg.addColorStop(0, rp.floorTop);
      fg.addColorStop(1, rp.floorBot);
      lx.fillStyle = fg;
      lx.fillRect(0, 340, W, H - 340);
      /* floor wood plank lines */
      lx.strokeStyle = rp.plank;
      lx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        lx.beginPath(); lx.moveTo(0, 350 + i * 28); lx.lineTo(W, 350 + i * 28); lx.stroke();
      }
      /* baseboard */
      lx.fillStyle = rp.base;
      lx.fillRect(0, 336, W, 8);
      lx.fillStyle = "#C8A882";
      lx.fillRect(0, 336, W, 3);
      /* V1 — ground/contact shadows (palette-aware), refined V.11.
         Two-pass per furniture piece: a wide soft outer ellipse + a tighter
         darker contact ellipse. Reads as a shadow, not a flat blob. The
         original V1 rug-edge ring was dropped — at 4px stroke it read as
         an ugly outline, not a contact shadow. */
      var __vMoon = (store.decor.roomPreset || 0) === 3;
      var __vSoft = __vMoon ? "rgba(40,50,80,0.10)" : "rgba(60,40,25,0.12)";
      var __vDark = __vMoon ? "rgba(20,30,60,0.20)" : "rgba(40,25,15,0.22)";
      var __vUf = __vMoon ? "rgba(20,30,60,0.08)" : "rgba(0,0,0,0.08)";
      /* couch ground shadow */
      lx.fillStyle = __vSoft;
      lx.beginPath(); lx.ellipse(400, 386, 150, 14, 0, 0, Math.PI * 2); lx.fill();
      lx.fillStyle = __vDark;
      lx.beginPath(); lx.ellipse(400, 384, 130, 6, 0, 0, Math.PI * 2); lx.fill();
      /* side table ground shadow */
      lx.fillStyle = __vSoft;
      lx.beginPath(); lx.ellipse(250, 381, 36, 7, 0, 0, Math.PI * 2); lx.fill();
      lx.fillStyle = __vDark;
      lx.beginPath(); lx.ellipse(250, 380, 26, 3, 0, 0, Math.PI * 2); lx.fill();
      /* cat tower ground shadow */
      lx.fillStyle = __vSoft;
      lx.beginPath(); lx.ellipse(698, 486, 40, 10, 0, 0, Math.PI * 2); lx.fill();
      lx.fillStyle = __vDark;
      lx.beginPath(); lx.ellipse(698, 484, 28, 5, 0, 0, Math.PI * 2); lx.fill();
      /* bookshelf wall shadow (slightly stronger so the hung shelf reads
         as having weight; leaves structural floating fix for a later pass) */
      lx.fillStyle = __vMoon ? "rgba(20,30,60,0.18)" : "rgba(60,40,25,0.18)";
      lx.fillRect(566, 242, 74, 6);
      /* window sill wall shadow */
      lx.fillStyle = __vUf;
      lx.fillRect(56, 217, 140, 4);
      /* window */
      lx.fillStyle = "#B8D8F0";
      rr(lx, 62, 48, 128, 160, 8);
      lx.fill();
      /* window sky gradient */
      const skyg = lx.createLinearGradient(62, 48, 62, 208);
      skyg.addColorStop(0, "rgba(135,206,235,0.3)");
      skyg.addColorStop(1, "rgba(200,230,255,0.15)");
      lx.fillStyle = skyg;
      rr(lx, 62, 48, 128, 160, 8);
      lx.fill();
      lx.strokeStyle = "#C8A882";
      lx.lineWidth = 6;
      rr(lx, 62, 48, 128, 160, 8);
      lx.stroke();
      lx.lineWidth = 3;
      lx.beginPath();
      lx.moveTo(126, 48);
      lx.lineTo(126, 208);
      lx.moveTo(62, 128);
      lx.lineTo(190, 128);
      lx.stroke();
      /* window sill */
      lx.fillStyle = "#D8C0A0";
      rr(lx, 54, 206, 144, 10, 3);
      lx.fill();
      /* small plant on sill */
      lx.fillStyle = "#B8724A";
      rr(lx, 148, 192, 20, 16, 4);
      lx.fill();
      lx.fillStyle = "#6AAF50";
      lx.beginPath();
      lx.ellipse(158, 185, 14, 12, 0, 0, Math.PI * 2);
      lx.fill();
      lx.fillStyle = "#7CC462";
      lx.beginPath();
      lx.ellipse(154, 182, 10, 9, -0.3, 0, Math.PI * 2);
      lx.fill();
      /* curtains */
      lx.fillStyle = "rgba(195,160,130,0.3)";
      rr(lx, 46, 36, 24, 186, 4);
      lx.fill();
      rr(lx, 182, 36, 24, 186, 4);
      lx.fill();
      /* curtain rod */
      lx.fillStyle = "#B8986C";
      lx.fillRect(42, 34, 172, 4);
      lx.beginPath(); lx.arc(42, 36, 5, 0, Math.PI * 2); lx.fill();
      lx.beginPath(); lx.arc(214, 36, 5, 0, Math.PI * 2); lx.fill();
      /* rug with pattern */
      lx.fillStyle = COLORS.rug;
      lx.beginPath();
      lx.ellipse(400, 470, 220, 55, 0, 0, Math.PI * 2);
      lx.fill();
      lx.strokeStyle = "rgba(180,140,100,0.25)";
      lx.lineWidth = 3;
      lx.stroke();
      lx.fillStyle = "rgba(200,165,130,0.35)";
      lx.beginPath();
      lx.ellipse(400, 470, 170, 40, 0, 0, Math.PI * 2);
      lx.fill();
      lx.strokeStyle = "rgba(160,120,85,0.15)";
      lx.lineWidth = 2;
      lx.beginPath();
      lx.ellipse(400, 470, 120, 28, 0, 0, Math.PI * 2);
      lx.stroke();
      /* couch - more detailed */
      /* couch back */
      lx.fillStyle = "#A87C50";
      rr(lx, 276, 254, 252, 30, 14);
      lx.fill();
      /* couch body */
      lx.fillStyle = COLORS.couchDark;
      rr(lx, 280, 272, 244, 106, 18);
      lx.fill();
      lx.fillStyle = COLORS.couch;
      rr(lx, 286, 266, 232, 86, 16);
      lx.fill();
      /* couch seat cushions with stitch lines */
      lx.fillStyle = COLORS.couchDark;
      rr(lx, 296, 276, 100, 64, 12);
      lx.fill();
      rr(lx, 408, 276, 100, 64, 12);
      lx.fill();
      /* stitch details */
      lx.strokeStyle = "rgba(140,100,60,0.2)";
      lx.lineWidth = 1;
      lx.beginPath(); lx.moveTo(346, 282); lx.lineTo(346, 334); lx.stroke();
      lx.beginPath(); lx.moveTo(458, 282); lx.lineTo(458, 334); lx.stroke();
      /* couch armrests */
      lx.fillStyle = COLORS.couch;
      rr(lx, 264, 276, 32, 92, 14);
      lx.fill();
      rr(lx, 508, 276, 32, 92, 14);
      lx.fill();
      /* couch legs */
      lx.fillStyle = "#8B6B4A";
      rr(lx, 282, 370, 10, 14, 3);
      lx.fill();
      rr(lx, 512, 370, 10, 14, 3);
      lx.fill();
      /* V1 — couch front underside band */
      lx.fillStyle = __vUf;
      lx.fillRect(296, 374, 212, 3);
      /* throw pillows */
      lx.fillStyle = "#E8B8A0";
      lx.save();
      lx.translate(310, 292);
      lx.rotate(-0.15);
      rr(lx, -22, -18, 44, 36, 14);
      lx.fill();
      lx.restore();
      lx.fillStyle = "#A8C686";
      lx.save();
      lx.translate(490, 296);
      lx.rotate(0.12);
      rr(lx, -20, -16, 40, 32, 14);
      lx.fill();
      lx.restore();
      /* blanket draped over armrest */
      lx.fillStyle = "rgba(200,160,180,0.4)";
      rr(lx, 504, 280, 38, 72, 8);
      lx.fill();
      /* lamp with shade and glow — positioned right of window */
      lx.fillStyle = "#B89868";
      lx.fillRect(212, 178, 5, 110);
      /* lamp base */
      lx.fillStyle = "#A08060";
      rr(lx, 202, 284, 26, 8, 4);
      lx.fill();
      /* lamp shade */
      lx.fillStyle = "#FFEEBB";
      lx.beginPath();
      lx.moveTo(192, 178);
      lx.lineTo(238, 178);
      lx.lineTo(232, 138);
      lx.lineTo(198, 138);
      lx.closePath();
      lx.fill();
      lx.strokeStyle = "rgba(200,170,120,0.4)";
      lx.lineWidth = 2;
      lx.stroke();
      /* warm lamp glow on wall */
      var lampGlow = lx.createRadialGradient(215, 158, 10, 215, 158, 120);
      lampGlow.addColorStop(0, "rgba(255,240,200,0.12)");
      lampGlow.addColorStop(1, "rgba(255,240,200,0)");
      lx.fillStyle = lampGlow;
      lx.fillRect(80, 30, 300, 300);
      /* side table next to couch */
      lx.fillStyle = "#B89868";
      rr(lx, 230, 330, 40, 46, 6);
      lx.fill();
      lx.fillStyle = "#C8A878";
      rr(lx, 226, 326, 48, 8, 4);
      lx.fill();
      /* mug on side table */
      lx.fillStyle = "#E8D8C8";
      rr(lx, 238, 314, 16, 14, 4);
      lx.fill();
      lx.fillStyle = "#C8B098";
      lx.fillRect(254, 320, 6, 4);
      /* cat tower on right - more detailed */
      lx.fillStyle = "#C4A882";
      lx.fillRect(674, 200, 16, 280);
      lx.fillRect(706, 260, 16, 220);
      /* tower wrapping texture */
      lx.strokeStyle = "rgba(180,150,110,0.3)";
      lx.lineWidth = 1;
      for (let y = 200; y < 480; y += 6) {
        lx.beginPath(); lx.moveTo(674, y); lx.lineTo(690, y); lx.stroke();
      }
      /* platforms */
      lx.fillStyle = "#D8C0A0";
      rr(lx, 652, 186, 60, 18, 6);
      lx.fill();
      rr(lx, 686, 248, 54, 14, 5);
      lx.fill();
      rr(lx, 656, 360, 76, 16, 6);
      lx.fill();
      /* dangling toy on tower */
      lx.strokeStyle = "#A88060";
      lx.lineWidth = 1;
      lx.beginPath(); lx.moveTo(660, 204); lx.lineTo(650, 230); lx.stroke();
      lx.fillStyle = "#E88080";
      lx.beginPath(); lx.arc(650, 233, 5, 0, Math.PI * 2); lx.fill();
      /* bookshelf */
      lx.fillStyle = "#C4A076";
      rr(lx, 566, 56, 74, 186, 6);
      lx.fill();
      /* V1 — bookshelf bottom underside band */
      lx.fillStyle = __vUf;
      lx.fillRect(568, 240, 70, 2);
      /* shelf edges */
      lx.fillStyle = "#B89060";
      lx.fillRect(566, 56, 74, 4);
      lx.fillStyle = "#D4B48E";
      lx.fillRect(572, 100, 62, 5);
      lx.fillRect(572, 145, 62, 5);
      lx.fillRect(572, 190, 62, 5);
      /* books - varied sizes */
      const bookColors = ["#C0392B","#2980B9","#27AE60","#8E44AD","#E67E22","#D4A44C","#1ABC9C","#E74C3C"];
      for (let s = 0; s < 3; s++) {
        const bx = 576;
        const by = 64 + s * 45;
        for (let b = 0; b < 5; b++) {
          lx.fillStyle = bookColors[(s * 5 + b) % bookColors.length];
          const bh = 24 + (b % 3) * 4;
          lx.fillRect(bx + b * 12, by + (32 - bh), 9, bh);
        }
      }
      /* framed photo on shelf */
      lx.fillStyle = "#C8A872";
      rr(lx, 577, 152, 22, 30, 2);
      lx.fill();
      lx.fillStyle = "#F0E0D0";
      rr(lx, 580, 155, 16, 24, 1);
      lx.fill();
      /* wall art - changes with wallArt2 decor setting */
      var artStyle = store.decor.wallArt2 || 0;
      lx.fillStyle = "#C8A872";
      rr(lx, 350, 60, 100, 72, 5);
      lx.fill();
      lx.fillStyle = "#E8D8C8";
      rr(lx, 356, 66, 88, 60, 4);
      lx.fill();
      if (artStyle === 0) {
        /* Landscape — sunset mountains */
        var sunsetG = lx.createLinearGradient(356, 66, 356, 126);
        sunsetG.addColorStop(0, "rgba(255,180,120,0.4)");
        sunsetG.addColorStop(0.5, "rgba(255,220,180,0.3)");
        sunsetG.addColorStop(1, "rgba(160,200,140,0.4)");
        lx.fillStyle = sunsetG;
        rr(lx, 356, 66, 88, 60, 4); lx.fill();
        lx.fillStyle = "rgba(120,160,100,0.5)";
        lx.beginPath();
        lx.moveTo(356, 116); lx.lineTo(380, 82); lx.lineTo(400, 100); lx.lineTo(420, 78); lx.lineTo(444, 116);
        lx.fill();
      } else if (artStyle === 1) {
        /* Floral — flowers on green */
        lx.fillStyle = "rgba(180,220,160,0.5)";
        rr(lx, 356, 66, 88, 60, 4); lx.fill();
        var flColors = ["#FF6B9D", "#FFD700", "#87CEEB", "#FF8C42", "#E040FB"];
        for (var fi = 0; fi < 7; fi++) {
          var fx = 370 + (fi % 4) * 18, fy = 80 + Math.floor(fi / 4) * 24;
          lx.fillStyle = "#5C8A3A"; lx.fillRect(fx + 3, fy + 4, 2, 10);
          lx.fillStyle = flColors[fi % 5];
          lx.beginPath(); lx.arc(fx + 4, fy + 2, 5, 0, Math.PI * 2); lx.fill();
        }
      } else if (artStyle === 2) {
        /* Portraits — two pet silhouettes */
        lx.fillStyle = "rgba(200,180,160,0.4)";
        rr(lx, 356, 66, 88, 60, 4); lx.fill();
        lx.fillStyle = "rgba(139,105,20,0.5)";
        lx.beginPath(); lx.arc(382, 96, 14, 0, Math.PI * 2); lx.fill();
        lx.beginPath(); lx.ellipse(382, 112, 10, 6, 0, 0, Math.PI * 2); lx.fill();
        lx.fillStyle = "rgba(155,125,60,0.5)";
        lx.beginPath(); lx.arc(420, 96, 12, 0, Math.PI * 2); lx.fill();
        lx.beginPath(); lx.moveTo(412, 86); lx.lineTo(408, 78); lx.lineTo(416, 84); lx.fill();
        lx.beginPath(); lx.moveTo(428, 86); lx.lineTo(432, 78); lx.lineTo(424, 84); lx.fill();
      } else {
        /* Abstract — geometric shapes */
        lx.fillStyle = "rgba(100,150,200,0.3)";
        rr(lx, 356, 66, 88, 60, 4); lx.fill();
        lx.fillStyle = "rgba(255,180,100,0.5)";
        lx.beginPath(); lx.arc(380, 90, 16, 0, Math.PI * 2); lx.fill();
        lx.fillStyle = "rgba(200,100,150,0.4)";
        lx.beginPath(); lx.moveTo(410, 72); lx.lineTo(436, 110); lx.lineTo(384, 110); lx.closePath(); lx.fill();
        lx.fillStyle = "rgba(100,200,180,0.4)";
        rr(lx, 400, 78, 30, 30, 3); lx.fill();
      }
      /* second smaller frame */
      lx.fillStyle = "#C8A872";
      rr(lx, 466, 76, 50, 50, 4);
      lx.fill();
      lx.fillStyle = "#FFE8D8";
      rr(lx, 470, 80, 42, 42, 3);
      lx.fill();
      /* paw print in small frame */
      lx.fillStyle = "rgba(180,140,110,0.4)";
      lx.beginPath(); lx.arc(491, 98, 8, 0, Math.PI * 2); lx.fill();
      lx.beginPath(); lx.arc(483, 90, 4, 0, Math.PI * 2); lx.fill();
      lx.beginPath(); lx.arc(499, 90, 4, 0, Math.PI * 2); lx.fill();
      lx.beginPath(); lx.arc(480, 97, 3.5, 0, Math.PI * 2); lx.fill();
      lx.beginPath(); lx.arc(502, 97, 3.5, 0, Math.PI * 2); lx.fill();
      sceneCache.livingRoomBase = lc;

      /* ── Treat Toss background ── */
      const rc = makeBufferCanvas(W, H);
      const rx = rc.getContext("2d");
      /* sky */
      const sg = rx.createLinearGradient(0, 0, 0, 200);
      sg.addColorStop(0, "#87CEEB");
      sg.addColorStop(1, "#B8E0F0");
      rx.fillStyle = sg;
      rx.fillRect(0, 0, W, 200);
      /* grass */
      const gg = rx.createLinearGradient(0, 160, 0, H);
      gg.addColorStop(0, "#A8D870");
      gg.addColorStop(0.3, "#8BC860");
      gg.addColorStop(1, "#6BAA48");
      rx.fillStyle = gg;
      rx.fillRect(0, 160, W, H - 160);
      /* fence */
      rx.fillStyle = "#E8D4B8";
      for (let i = 0; i < 12; i++) {
        rx.fillRect(i * 72 + 10, 120, 8, 100);
      }
      rx.fillRect(0, 140, W, 6);
      rx.fillRect(0, 180, W, 6);
      /* counter where Annie stands */
      rx.fillStyle = "#D8C0A0";
      rr(rx, 300, 140, 200, 70, 8);
      rx.fill();
      rx.fillStyle = "#C4A882";
      rr(rx, 304, 144, 192, 30, 6);
      rx.fill();
      /* sun */
      rx.fillStyle = "rgba(255,240,180,0.5)";
      rx.beginPath();
      rx.arc(680, 50, 44, 0, Math.PI * 2);
      rx.fill();
      rx.fillStyle = "rgba(255,250,220,0.6)";
      rx.beginPath();
      rx.arc(680, 50, 30, 0, Math.PI * 2);
      rx.fill();
      /* trees in background */
      rx.fillStyle = "#6B8E4E";
      rx.beginPath(); rx.arc(60, 130, 50, 0, Math.PI * 2); rx.fill();
      rx.beginPath(); rx.arc(740, 120, 60, 0, Math.PI * 2); rx.fill();
      rx.fillStyle = "#7CA858";
      rx.beginPath(); rx.arc(50, 115, 35, 0, Math.PI * 2); rx.fill();
      rx.beginPath(); rx.arc(755, 105, 42, 0, Math.PI * 2); rx.fill();
      /* tree trunks */
      rx.fillStyle = "#8B6B4A";
      rx.fillRect(54, 140, 12, 40);
      rx.fillRect(746, 130, 14, 50);
      sceneCache.treatBase = rc;

      /* ── Laser Chase background ── */
      const ec = makeBufferCanvas(W, H);
      const ex = ec.getContext("2d");
      /* dark room floor */
      const dg = ex.createLinearGradient(0, 0, 0, H);
      dg.addColorStop(0, "#3D3028");
      dg.addColorStop(1, "#2A2018");
      ex.fillStyle = dg;
      ex.fillRect(0, 0, W, H);
      /* slightly lighter floor area */
      ex.fillStyle = "rgba(80,60,45,0.4)";
      ex.fillRect(0, H * 0.55, W, H * 0.45);
      /* furniture obstacles (match this.obstacles() in LaserChaseScene) */
      ex.fillStyle = "rgba(110,85,60,0.8)";
      rr(ex, 44, 118, 160, 80, 12);
      ex.fill();
      rr(ex, 272, 228, 150, 70, 10);
      ex.fill();
      rr(ex, 608, 92, 100, 150, 10);
      ex.fill();
      rr(ex, 588, 370, 96, 96, 12);
      ex.fill();
      /* furniture highlights */
      ex.fillStyle = "rgba(140,115,85,0.5)";
      rr(ex, 48, 122, 152, 24, 8);
      ex.fill();
      rr(ex, 276, 232, 142, 20, 7);
      ex.fill();
      rr(ex, 612, 96, 92, 24, 7);
      ex.fill();
      /* ambient light from top right */
      const ag = ex.createRadialGradient(700, 80, 20, 700, 80, 300);
      ag.addColorStop(0, "rgba(255,236,177,0.08)");
      ag.addColorStop(1, "rgba(255,236,177,0)");
      ex.fillStyle = ag;
      ex.fillRect(0, 0, W, H);
      sceneCache.laserBase = ec;
    }


