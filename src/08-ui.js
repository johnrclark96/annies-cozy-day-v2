    // ═══ 08-ui.js ═══
    function lightenColor(hex, pct) {
      var h = hex.replace("#", "");
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
      r = Math.min(255, Math.round(r + (255 - r) * pct));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct));
      return "#" + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
    }
    function darkenColor(hex, pct) {
      var h = hex.replace("#", "");
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
      r = Math.max(0, Math.round(r * (1 - pct)));
      g = Math.max(0, Math.round(g * (1 - pct)));
      b = Math.max(0, Math.round(b * (1 - pct)));
      return "#" + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
    }

    const HUD_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
    /* Font role constants (Phase A.6) — used per-site, not by mass rewrite.
       FONT_DISPLAY: titles only (the soft display face).
       FONT_BODY: body text (welcome banner, panel descriptions, decor card subtitles).
       FONT_MONO: HUD digits (Time, Score, Combo, label-stacks). */
    const FONT_DISPLAY = '"Fredoka One", "Comic Sans MS", cursive, sans-serif';
    const FONT_BODY = 'system-ui, "Segoe UI", -apple-system, sans-serif';
    const FONT_MONO = HUD_MONO;

    function formatMSS(seconds) {
      const s = Math.max(0, Math.ceil(seconds));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m + ":" + (r < 10 ? "0" + r : r);
    }

    function drawHudTime(c, x, y, seconds) {
      c.save();
      c.textAlign = "left";
      c.textBaseline = "top";
      if ("letterSpacing" in c) c.letterSpacing = "0.14em";
      c.fillStyle = "#807366";
      c.font = '10px ' + HUD_MONO;
      c.fillText("TIME", x, y);
      if ("letterSpacing" in c) c.letterSpacing = "0px";
      c.fillStyle = "#3A2A1E";
      c.font = '600 22px ' + HUD_MONO;
      c.fillText(formatMSS(seconds), x, y + 14);
      c.restore();
    }

    function drawHudScore(c, x, y, score) {
      c.save();
      c.textAlign = "right";
      c.textBaseline = "top";
      if ("letterSpacing" in c) c.letterSpacing = "0.14em";
      c.fillStyle = "#807366";
      c.font = '10px ' + HUD_MONO;
      c.fillText("SCORE", x, y);
      if ("letterSpacing" in c) c.letterSpacing = "0px";
      c.fillStyle = "#3A2A1E";
      c.font = '600 22px ' + HUD_MONO;
      c.fillText(String(score), x, y + 14);
      c.restore();
    }

    function drawHudChip(c, x, y, hovered) {
      c.save();
      c.fillStyle = hovered ? "rgba(255,248,240,0.98)" : "rgba(255,248,240,0.88)";
      rr(c, x, y, 28, 28, 8);
      c.fill();
      c.strokeStyle = "rgba(58,42,30,0.45)";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }

    /* drawLabelStack (Phase A.6) — generic mono label-stack widget.
       opts: { size?=22, side?="left", labelColor?, valueColor? }
       Mirrors drawHudTime/Score: small caps label, then mono value below.
       Use for HUD readouts like NEXT, COMBO, GOAL, etc. */
    function drawLabelStack(c, x, y, label, value, opts) {
      opts = opts || {};
      var size = opts.size != null ? opts.size : 22;
      var side = opts.side || "left";
      var labelColor = opts.labelColor || "#807366";
      var valueColor = opts.valueColor || "#3A2A1E";
      c.save();
      c.textAlign = side === "right" ? "right" : "left";
      c.textBaseline = "top";
      if ("letterSpacing" in c) c.letterSpacing = "0.14em";
      c.fillStyle = labelColor;
      c.font = '10px ' + FONT_MONO;
      c.fillText(String(label).toUpperCase(), x, y);
      if ("letterSpacing" in c) c.letterSpacing = "0px";
      c.fillStyle = valueColor;
      c.font = '600 ' + size + 'px ' + FONT_MONO;
      c.fillText(String(value), x, y + 14);
      c.restore();
    }

    /* placePill (Phase A.1, refined A.2) — single source of truth for HUD pill anchor points.
       side: "tl" | "tr" | "bl" | "br"
       slot: 0 = primary header row (h defaults to HUD_GRID.primaryH = 46);
             1+ = small-pill rows below (h defaults to HUD_GRID.pillH = 22)
       w: explicit width; h: optional, derived from slot if omitted.
       "tr"/"br" pills are anchored to clear the right-edge chip column (sound/camera/scrapbook)
       with a 6px gutter — fixes F6 (Score pill overlapping mute chip). */
    function placePill(side, slot, w, h) {
      if (h == null) h = (slot === 0 ? HUD_GRID.primaryH : HUD_GRID.pillH);
      var y;
      if (side === "bl" || side === "br") {
        y = HUD_GRID.bottomY - slot * (HUD_GRID.pillH + HUD_GRID.pillGap);
      } else {
        y = (slot === 0)
          ? HUD_GRID.row1
          : HUD_GRID.row2 + (slot - 1) * (HUD_GRID.pillH + HUD_GRID.pillGap);
      }
      var x;
      if (side === "tl" || side === "bl") {
        x = SAFE;
      } else {
        // "tr"/"br": right edge clears the chip column with a 6px gutter
        x = HUD_GRID.chipCol - HUD_GRID.pillGap - w;
      }
      return { x: x, y: y, w: w, h: h };
    }

    /* placePillStack (Phase B.1) — multi-pill row sharing a slot.
       For "tr"/"br": widths[0] is the rightmost; subsequent widths grow leftward.
       For "tl"/"bl": widths[0] is the leftmost; subsequent widths grow rightward.
       Each pill spaced HUD_GRID.pillGap apart. Returns array of rects, same shape as placePill. */
    function placePillStack(side, slot, widths, h) {
      var rects = [];
      if (!widths || !widths.length) return rects;
      var first = placePill(side, slot, widths[0], h);
      rects.push(first);
      for (var i = 1; i < widths.length; i++) {
        var prev = rects[i - 1];
        var x = (side === "tr" || side === "br")
          ? prev.x - HUD_GRID.pillGap - widths[i]
          : prev.x + prev.w + HUD_GRID.pillGap;
        rects.push({ x: x, y: prev.y, w: widths[i], h: prev.h });
      }
      return rects;
    }

    function drawButton(c, r, label, hovered, fill = COLORS.warmRed, textColor = "#fff", selected = false) {
      c.save();
      const ey = selected ? r.y - 2 : r.y;
      const effFill = selected ? "#7A4E36" : fill;
      const shadowY = hovered ? 4 : 6;
      c.fillStyle = "rgba(92,68,52,0.18)";
      rr(c, r.x, ey + shadowY, r.w, r.h, 18);
      c.fill();
      if (hovered && !selected) {
        drawGlowCircle(c, r.x + r.w / 2, ey + r.h / 2, Math.max(r.w, r.h) * 0.95, "rgba(255,215,0,ALPHA)", 0.18);
      }
      const grad = c.createLinearGradient(r.x, ey, r.x, ey + r.h);
      if (selected) {
        grad.addColorStop(0, lightenColor(effFill, 0.08));
        grad.addColorStop(1, effFill);
      } else {
        grad.addColorStop(0, hovered ? lightenColor(effFill, 0.2) : effFill);
        grad.addColorStop(1, hovered ? effFill : darkenColor(effFill, 0.1));
      }
      c.fillStyle = grad;
      rr(c, r.x, ey, r.w, r.h, 18);
      c.fill();
      if (selected) {
        c.strokeStyle = "rgba(255,248,240,0.85)";
        c.lineWidth = 3;
        rr(c, r.x - 2, ey - 2, r.w + 4, r.h + 4, 20);
        c.stroke();
      } else {
        c.strokeStyle = "rgba(255,255,255,0.65)";
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.14)";
        rr(c, r.x + 4, ey + 4, r.w - 8, r.h * 0.4, 14);
        c.fill();
      }
      c.fillStyle = textColor;
      c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(label, r.x + r.w / 2, ey + r.h / 2 + 1);
      c.restore();
    }

    /* drawPanelFrame (Phase A.3) — unified scrim + cream rounded card + optional title.
       opts: { x, y, w, h, title?, radius?=28 }
       Replaces hand-coded panel frames in HangoutScene (decor/wardrobe/scrapbook/menu) and
       BackyardScene (decor) once those panels migrate in B.3 / D.1 / D.3 / D.5. */
    function drawPanelFrame(c, opts) {
      var radius = (opts.radius != null) ? opts.radius : 28;
      c.save();
      c.fillStyle = "rgba(40,28,18,0.55)";
      c.fillRect(0, 0, W, H);
      rr(c, opts.x, opts.y, opts.w, opts.h, radius);
      c.fillStyle = "rgba(255,248,240,0.97)";
      c.fill();
      c.strokeStyle = "rgba(146,104,72,0.2)";
      c.lineWidth = 3;
      c.stroke();
      if (opts.title) {
        c.fillStyle = "#7A4E36";
        c.textAlign = "center";
        c.textBaseline = "alphabetic";
        c.font = '28px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(opts.title, opts.x + opts.w / 2, opts.y + 40);
      }
      c.restore();
    }

    /* drawPanelTabs (Phase A.4) — segmented pill row anchored to panel.x+24, panel.y+60.
       tabs: [{key, label?}] — equal-width tabs filling (panel.w - 48) with 6px gaps.
       Returns [{key, rect}] for hit-testing; pair with panelTabHit() in click handlers. */
    function drawPanelTabs(c, panel, tabs, activeKey) {
      var rects = [];
      if (!tabs || !tabs.length) return rects;
      var startX = panel.x + 24;
      var y = panel.y + 60;
      var h = 26;
      var gap = 6;
      var avail = panel.w - 48;
      var w = Math.floor((avail - gap * (tabs.length - 1)) / tabs.length);
      c.save();
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var rect = { x: startX + i * (w + gap), y: y, w: w, h: h };
        var active = (t.key === activeKey);
        rr(c, rect.x, rect.y, rect.w, rect.h, 10);
        c.fillStyle = active ? "#A05A3C" : "rgba(122,78,54,0.08)";
        c.fill();
        if (!active) {
          c.strokeStyle = "rgba(146,104,72,0.18)";
          c.lineWidth = 1;
          c.stroke();
        }
        c.fillStyle = active ? "#FFF8F0" : "#7A4E36";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(t.label || t.key, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
        rects.push({ key: t.key, rect: rect });
      }
      c.restore();
      return rects;
    }

    function panelTabHit(panel, tabs, x, y) {
      if (!tabs || !tabs.length) return null;
      var startX = panel.x + 24;
      var ty = panel.y + 60;
      var h = 26;
      var gap = 6;
      var avail = panel.w - 48;
      var w = Math.floor((avail - gap * (tabs.length - 1)) / tabs.length);
      if (y < ty || y > ty + h) return null;
      for (var i = 0; i < tabs.length; i++) {
        var rx = startX + i * (w + gap);
        if (x >= rx && x <= rx + w) return tabs[i].key;
      }
      return null;
    }

    /* drawPanelClose (Phase A.3) — unified close-button circle anchored to a panel.
       Center at (panel.x + panel.w - 22, panel.y + 22). Reads hovered to swell + tint.
       Returns the hit circle {cx, cy, r} so the click handler can read the same source. */
    function drawPanelClose(c, panel, hovered) {
      var cx = panel.x + panel.w - 22;
      var cy = panel.y + 22;
      var r = hovered ? 18 : 16;
      c.save();
      if (hovered) drawGlowCircle(c, cx, cy, 24, "rgba(180,80,60,ALPHA)", 0.2);
      c.fillStyle = hovered ? "rgba(200,70,50,0.95)" : "rgba(140,100,70,0.55)";
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#FFF8F0";
      c.lineWidth = hovered ? 3 : 2.5;
      c.beginPath(); c.moveTo(cx - 6, cy - 6); c.lineTo(cx + 6, cy + 6); c.stroke();
      c.beginPath(); c.moveTo(cx + 6, cy - 6); c.lineTo(cx - 6, cy + 6); c.stroke();
      c.restore();
      return { cx: cx, cy: cy, r: r };
    }

    /* Phase B.3 — standard hangout/backyard panel frame. All current panels
       (decor, wardrobe, scrapbook, backyard decor) share this rect.
       Future divergent panels can register their own frame in panelClose. */
    const PANEL_STD = { x: 100, y: 70, w: 600, h: 480 };
    /* V9 — settings panel uses the standard panel frame */
    const SETTINGS_PANEL = { x: 130, y: 90, w: 540, h: 420 };
    /* Phase D.1 — Game Menu uses a wider/taller frame to fit 6 cards × 720 wide. */
    const MENU_PANEL = { x: 40, y: 60, w: 720, h: 540 };
    /* Phase D.3 — Wardrobe panel matches Game Menu width but is shorter. */
    const WARDROBE_PANEL = { x: 40, y: 60, w: 720, h: 520 };
    const WARDROBE_TABS = [
      { key: "obi", label: "Obi" },
      { key: "luna", label: "Luna" },
      { key: "annie", label: "Annie" }
    ];
    /* Phase D.5 — Scrapbook panel; panel.y = 50 so drawPanelTabs (panel.y+60)
       lands at the original tab row y=110, preserving all content offsets. */
    const SCRAPBOOK_PANEL = { x: 40, y: 50, w: 720, h: 530 };
    const SCRAPBOOK_TABS = [
      { key: "photos", label: "Photos" },
      { key: "milestones", label: "Milestones" },
      { key: "stats", label: "Stats" },
      { key: "goals", label: "Goals" },
      { key: "tasks", label: "Tasks" }
    ];

    /* drawLockChip (Phase B.5) — small chip top-right of a card rect indicating
       why a card is gated. kind ∈ {"stars","coins","achievement","season","streak"}.
       value: required value for the gate. current?: optional progress (used for stars). */
    function drawLockChip(c, rect, kind, value, current) {
      var fillColor, textColor, label, dotColor;
      if (kind === "stars") {
        label = (current != null ? current : 0) + " / " + value;
        fillColor = "rgba(255,215,0,0.18)"; textColor = "#8A6045"; dotColor = "#E8A020";
      } else if (kind === "coins") {
        label = String(value);
        fillColor = "rgba(255,200,80,0.22)"; textColor = "#8A6045"; dotColor = "#E8A020";
      } else if (kind === "achievement") {
        var aLabel = String(value);
        if (aLabel.length > 12) aLabel = aLabel.slice(0, 12);
        label = aLabel;
        fillColor = "rgba(180,130,200,0.18)"; textColor = "#6B3F8C"; dotColor = "#9B7DBD";
      } else if (kind === "streak") {
        label = value + "d";
        fillColor = "rgba(255,107,53,0.20)"; textColor = "#A0501C"; dotColor = "#FF6B35";
      } else if (kind === "season") {
        label = String(value).charAt(0).toUpperCase() + String(value).slice(1);
        fillColor = "rgba(125,179,108,0.22)"; textColor = "#5C8A4A"; dotColor = "#7DB36C";
      } else {
        return;
      }
      c.save();
      c.font = '11px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      var textW = c.measureText(label).width;
      var iconW = 14;
      var pad = 8;
      var chipW = Math.ceil(textW + iconW + pad * 2);
      var chipH = 22;
      var x = rect.x + rect.w - chipW - 8;
      var y = rect.y + 8;
      rr(c, x, y, chipW, chipH, 11);
      c.fillStyle = fillColor;
      c.fill();
      c.strokeStyle = "rgba(146,104,72,0.25)";
      c.lineWidth = 1;
      c.stroke();
      // Icon
      var ix = x + pad;
      var iy = y + chipH / 2;
      if (kind === "stars") {
        drawStar(c, ix + 5, iy, 5, dotColor);
      } else {
        c.fillStyle = dotColor;
        c.beginPath(); c.arc(ix + 5, iy, kind === "streak" ? 4 : 5, 0, Math.PI * 2); c.fill();
      }
      // Label
      c.fillStyle = textColor;
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.fillText(label, x + pad + iconW, y + chipH / 2 + 1);
      c.restore();
    }

    /* panelClose (Phase B.3) — hit rect for the close button of a named panel.
       Argument can be either a panel-key string (defaults to PANEL_STD) or a
       panel rect {x,y,w,h}. Mirrors the geometry drawPanelClose uses for
       rendering, so the click handler and renderer always agree. */
    function panelClose(panelOrKey) {
      var p = (typeof panelOrKey === "string" || panelOrKey == null) ? PANEL_STD : panelOrKey;
      var cx = p.x + p.w - 22;
      var cy = p.y + 22;
      return { x: cx - 18, y: cy - 18, w: 36, h: 36 };
    }

    /* drawKeyGlyph (Phase A.5) — small rounded "key cap" used inside intro modal meta lines
       (e.g. ← / → for Cuddle Pile, "Esc" for the universal back-out hint). */
    function drawKeyGlyph(c, x, y, char, w, h) {
      if (w == null) w = 22;
      if (h == null) h = 20;
      c.save();
      rr(c, x - w / 2, y - h / 2, w, h, 4);
      c.fillStyle = "rgba(255,248,240,0.95)";
      c.fill();
      c.strokeStyle = "rgba(92,68,52,0.45)";
      c.lineWidth = 1.5;
      c.stroke();
      c.fillStyle = "#5C4434";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = 'bold 13px ' + HUD_MONO;
      c.fillText(char, x, y + 1);
      c.restore();
    }

    /* drawIntroModal (Phase A.5) — unified minigame intro modal.
       opts: { eyebrow?, title, body, iconFn?(c,x,y), challengeText?, bonusText?, metaText? }
       Drop-in replacement for BaseMinigameScene.drawInstructionCard once G.1 wires
       the canary (Bath Time) and then the batch. Card position (145,150,510,260)
       and INTRO_SCRIM match the existing drawInstructionCard so visual diff is 0
       for the title + body region. */
    function drawIntroModal(c, opts) {
      c.save();
      c.fillStyle = INTRO_SCRIM;
      c.fillRect(0, 0, W, H);
      rr(c, 145, 150, 510, 260, 24);
      c.fillStyle = "rgba(255,248,240,0.97)";
      c.fill();
      c.strokeStyle = "rgba(92,68,52,0.18)";
      c.lineWidth = 2;
      c.stroke();
      // eyebrow: small grey caps with letter-spacing (e.g. "TIER 2  ·  60s")
      if (opts.eyebrow) {
        c.fillStyle = "#A89684";
        c.textAlign = "center";
        c.textBaseline = "alphabetic";
        if ("letterSpacing" in c) c.letterSpacing = "0.18em";
        c.font = '11px ' + HUD_MONO;
        c.fillText(String(opts.eyebrow).toUpperCase(), W / 2, 178);
        if ("letterSpacing" in c) c.letterSpacing = "0px";
      }
      // title (display)
      c.fillStyle = "#7A4E36";
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.font = '32px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillText(opts.title || "", W / 2, opts.eyebrow ? 214 : 198);
      // body (one sentence — wrap allowed but copy should be ≤ 8 words)
      c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      wrapText(c, opts.body || "", W / 2, 252, 410, 30);
      // icon callback (same signature as drawInstructionCard)
      if (opts.iconFn) opts.iconFn(c, W / 2, 320);
      var nextY = 350;
      if (opts.challengeText) {
        c.fillStyle = "#FFA500";
        c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText("★ CHALLENGE: " + opts.challengeText + " ★", W / 2, nextY);
        nextY += 20;
      }
      if (opts.bonusText) {
        c.fillStyle = "#7DB36C";
        c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.fillText(opts.bonusText, W / 2, nextY);
        nextY += 18;
      }
      // meta line (single thin sentence bottom)
      var meta = (opts.metaText != null) ? opts.metaText : "Tap to start  ·  Esc to cuddle instead";
      c.fillStyle = "#A06B4F";
      c.font = '15px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillText(meta, W / 2, nextY + 8);
      c.restore();
    }

    /* drawCharacterUnderModal (Phase A.7) — framing transform applied during the
       intro `instructions` phase so characters drawn at normal hangout y-coords
       compose neatly below the modal frame (y=150-410).
       Scales 0.85 around canvas center, then shifts +60 down. Caller is responsible
       for c.save() / c.restore() around this and the character draws. Not yet called
       from any scene — wired in G.1+ as part of per-minigame intro polish. */
    function drawCharacterUnderModal(c) {
      c.translate(W / 2, H / 2 + 60);
      c.scale(0.85, 0.85);
      c.translate(-W / 2, -H / 2);
    }

    function drawTooltip(c, x, y, title, body, alpha = 1) {
      c.save();
      c.globalAlpha = alpha;
      /* dynamic sizing */
      c.font = '18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      var titleW = c.measureText(title).width;
      c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      var bodyW = body ? c.measureText(body).width : 0;
      var w = Math.max(Math.max(titleW, bodyW) + 40, 120);
      var h = Math.max(30 + (body ? 18 : 0) + 16, 50);
      /* clamp box to canvas */
      var clampedX = clamp(x, w / 2 + 10, 800 - w / 2 - 10);
      var boxLeft = clampedX - w / 2;
      /* auto-flip: render below anchor if box would clip top of canvas */
      var flipBelow = (y - h) < 4;
      var pointerGap = 12;
      var boxTop = flipBelow ? y + pointerGap : y - h;
      /* shadow */
      c.fillStyle = "rgba(60,40,25,0.15)";
      rr(c, boxLeft + 3, boxTop + 3, w, h, 14);
      c.fill();
      /* main box */
      rr(c, boxLeft, boxTop, w, h, 14);
      c.fillStyle = "rgba(82,58,42,0.94)";
      c.fill();
      /* top highlight */
      c.fillStyle = "rgba(255,255,255,0.06)";
      rr(c, boxLeft + 4, boxTop + 4, w - 8, h * 0.35, 12);
      c.fill();
      /* text */
      c.fillStyle = "#FFF8F0";
      c.textAlign = "center";
      c.font = '18px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillText(title, clampedX, boxTop + 24);
      c.font = '13px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillStyle = "rgba(255,248,240,0.85)";
      wrapText(c, body, clampedX, boxTop + 44, w - 30, 16);
      /* pointer — always points at original anchor, clamped to box bounds */
      var pointerX = clamp(x, boxLeft + 14, boxLeft + w - 14);
      c.fillStyle = "rgba(82,58,42,0.94)";
      c.beginPath();
      if (flipBelow) {
        c.moveTo(pointerX - 8, y + pointerGap);
        c.quadraticCurveTo(pointerX, y, pointerX + 8, y + pointerGap);
      } else {
        c.moveTo(pointerX - 8, y);
        c.quadraticCurveTo(pointerX, y + 12, pointerX + 8, y);
      }
      c.closePath();
      c.fill();
      c.restore();
    }

    function drawSpeakerIcon(c, x, y, muted, hovered) {
      c.save();
      drawHudChip(c, x, y, hovered);
      c.translate(x + 14, y + 14);
      c.strokeStyle = "#3A2A1E";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-6, -4);
      c.lineTo(-2, -4);
      c.lineTo(4, -10);
      c.lineTo(4, 10);
      c.lineTo(-2, 4);
      c.lineTo(-6, 4);
      c.stroke();
      if (!muted) {
        c.beginPath();
        c.arc(5, 0, 5, -0.7, 0.7);
        c.stroke();
        c.beginPath();
        c.arc(5, 0, 9, -0.8, 0.8);
        c.stroke();
      } else {
        c.strokeStyle = "#B86A58";
        c.beginPath();
        c.moveTo(7, -7);
        c.lineTo(13, 7);
        c.moveTo(13, -7);
        c.lineTo(7, 7);
        c.stroke();
      }
      c.restore();
    }

    function drawBadgeIcon(c, icon, x, y, color) {
      c.save();
      c.translate(x, y);
      c.fillStyle = color;
      c.strokeStyle = "#fff";
      c.lineWidth = 1.5;
      if (icon === "bone") {
        drawBone(c, 0, 0, 18, 10, color);
      } else if (icon === "star") {
        drawStar(c, 0, 0, 8, color);
      } else if (icon === "catEye") {
        c.beginPath();
        c.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.strokeStyle = "#2E7D32";
        c.beginPath();
        c.moveTo(0, -4);
        c.lineTo(0, 4);
        c.stroke();
      } else if (icon === "paw") {
        c.beginPath();
        c.arc(0, 2, 6, 0, Math.PI * 2);
        c.fill();
        [-6, -1, 4, 9].forEach((dx) => {
          c.beginPath();
          c.arc(dx, -7, 3, 0, Math.PI * 2);
          c.fill();
        });
      } else if (icon === "couch") {
        rr(c, -10, -2, 20, 8, 4);
        c.fill();
        rr(c, -13, -8, 26, 8, 5);
        c.fill();
      } else if (icon === "heart") {
        drawHeart(c, 0, 6, 0.45, color);
      }
      c.restore();
    }

    function drawWaterDrop(c, x, y, s, color) {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.fillStyle = color || "#6CB4EE";
      c.beginPath();
      c.moveTo(0, -6);
      c.quadraticCurveTo(5, 0, 4, 4);
      c.quadraticCurveTo(0, 8, -4, 4);
      c.quadraticCurveTo(-5, 0, 0, -6);
      c.closePath();
      c.fill();
      c.restore();
    }

    function drawMoodIcon(c, mood, x, y) {
      if (mood === "hungry") drawBone(c, x, y, 10, 5, "#A07050");
      else if (mood === "thirsty") drawWaterDrop(c, x, y, 0.8, "#6CB4EE");
      else if (mood === "sleepy") {
        c.save();
        c.fillStyle = "#9B8EC2";
        c.font = '9px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("Zzz", x, y);
        c.restore();
      } else if (mood === "playful") drawStar(c, x, y, 5, COLORS.gold);
      else if (mood === "cuddly") drawHeart(c, x, y + 3, 0.22, COLORS.softPink);
    }

    function drawAchievementBanner(c, banner) {
      if (!banner) return;
      const t = clamp(banner.time / banner.maxTime, 0, 1);
      const slide = 1 - easeOutQuad(Math.min(1, (banner.maxTime - banner.time) / 0.2));
      const y = lerp(24, -84, slide);
      c.save();
      c.translate(W / 2, y);
      rr(c, -180, 0, 360, 64, 16);
      c.fillStyle = "rgba(92,68,52,0.96)";
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.4)";
      c.lineWidth = 2;
      c.stroke();
      drawStar(c, -145, 32, 12, COLORS.gold);
      c.fillStyle = COLORS.cream;
      c.textAlign = "left";
      c.font = '16px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillText("Achievement Unlocked!", -120, 23);
      c.font = '20px "Fredoka One", "Comic Sans MS", cursive, sans-serif';
      c.fillText(banner.name, -120, 46);
      c.restore();
    }


