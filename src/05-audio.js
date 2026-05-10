    // ═══ 05-audio.js ═══
    class CozyAudio {
      constructor() {
        this.ctx = null;
        this._musicNodes = null;
        this._musicScheduler = null;
        this._musicMood = null;
        this._musicMoodConfig = null;
        this._musicSubBeat = 0;
        this._musicNextTime = 0;
        this._melNoteIdx = 12;
        this._arpStep = 0;
        /* V9 — independent volume rails (1 = unity). Set from store.settings
           after store is initialized; mute is still gated separately by
           store.muted. */
        this._sfxVol = 1;
        this._musicVol = 1;
      }
      setVolume(musicVol, sfxVol) {
        if (typeof musicVol === "number") this._musicVol = clamp(musicVol, 0, 1);
        if (typeof sfxVol === "number") this._sfxVol = clamp(sfxVol, 0, 1);
        if (this._musicNodes && this._musicNodes.master && this.ctx) {
          /* live-update the music master gain to the new target without abrupt jumps */
          var now = this.ctx.currentTime;
          this._musicNodes.master.gain.cancelScheduledValues(now);
          this._musicNodes.master.gain.linearRampToValueAtTime(0.7 * this._musicVol, now + 0.4);
        }
      }
      ensure() {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        return this.ctx;
      }
      canPlay() {
        return !!this.ctx && !store.muted;
      }
      envGain(gainNode, when, attack, sustain, release, gain) {
        /* V9 — apply SFX volume rail to all envelope-driven SFX */
        var g = Math.max(0.0001, gain * this._sfxVol);
        gainNode.gain.cancelScheduledValues(when);
        gainNode.gain.setValueAtTime(0.0001, when);
        gainNode.gain.exponentialRampToValueAtTime(g, when + attack);
        gainNode.gain.setTargetAtTime(0.0001, when + attack + sustain, release);
      }
      tone(freq, duration = 0.1, gain = 0.18, type = "sine", endFreq = null, whenOffset = 0) {
        if (!this.canPlay()) return;
        const now = this.ctx.currentTime + whenOffset;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
        osc.connect(g);
        g.connect(this.ctx.destination);
        this.envGain(g, now, 0.008, duration * 0.55, duration * 0.35, gain);
        osc.start(now);
        osc.stop(now + duration + 0.2);
      }
      vibratoTone(freq, duration = 0.15, gain = 0.15) {
        if (!this.canPlay()) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        lfo.frequency.value = 18;
        lfoGain.gain.value = 16;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(g);
        g.connect(this.ctx.destination);
        this.envGain(g, now, 0.01, duration * 0.6, duration * 0.4, gain);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + duration + 0.25);
        lfo.stop(now + duration + 0.25);
      }
      noisePop() {
        if (!this.canPlay()) return;
        const now = this.ctx.currentTime;
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / data.length * 4);
        const src = this.ctx.createBufferSource();
        const band = this.ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 800;
        band.Q.value = 0.8;
        const g = this.ctx.createGain();
        src.buffer = buffer;
        src.connect(band);
        band.connect(g);
        g.connect(this.ctx.destination);
        this.envGain(g, now, 0.005, 0.03, 0.08, 0.16);
        src.start(now);
      }
      chord(freqs, duration = 0.3, gain = 0.12) {
        if (!this.canPlay()) return;
        freqs.forEach((f) => this.tone(f, duration, gain, "sine"));
      }
      menu() { this.tone(440, 0.1, 0.15, "sine"); }
      catch() { this.noisePop(); }
      miss() { this.tone(300, 0.2, 0.14, "sine", 200); }
      combo() {
        [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.08, 0.12, "sine", null, i * 0.08));
      }
      pounce() { this.tone(300, 0.1, 0.14, "sine", 600); }
      targetHit() { this.vibratoTone(880, 0.15, 0.14); }
      fidget() { this.tone(200, 0.1, 0.12, "sine"); }
      lullaby() {
        [392, 329.63, 261.63, 196].forEach((f, i) => this.tone(f, 0.42, 0.12, "sine", null, i * 0.4));
      }
      achievement() { this.chord([261.63, 329.63, 392], 0.3, 0.11); }
      tinyChime() { this.tone(660, 0.09, 0.08, "sine"); }
      /* Phase E.2 — soft, long-sustain chord for the dedication entry. C major
         triad with octave; ~1.5s sustain at very low gain (0.05). */
      softChord() {
        if (!this.canPlay()) return;
        [261.63, 329.63, 392.00, 523.25].forEach((f) => this.tone(f, 1.5, 0.05, "sine"));
      }
      startAmbient(mood) {
        if (this.ambientActive) return;
        if (!this.ensure()) return;
        if (store.muted) return;
        this.ambientActive = true;
        var moodKey = mood || this._getMusicMoodKey();
        this._musicMood = moodKey;
        this._musicMoodConfig = MUSIC_MOODS[moodKey] || MUSIC_MOODS.day;
        var mc = this._musicMoodConfig;
        var now = this.ctx.currentTime;
        /* audio graph: voices → filter → master → destination */
        var master = this.ctx.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.gain.linearRampToValueAtTime(0.7 * this._musicVol, now + 1.5);
        var filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(mc.filter, now);
        filter.Q.setValueAtTime(0.7, now);
        filter.connect(master);
        master.connect(this.ctx.destination);
        /* bass voice — sustained sine */
        var bass = this.ctx.createOscillator();
        var bassG = this.ctx.createGain();
        bass.type = "sine";
        bass.frequency.setValueAtTime(mc.chords[0].bass, now);
        bassG.gain.setValueAtTime(mc.vol.bass, now);
        bass.connect(bassG);
        bassG.connect(filter);
        bass.start(now);
        /* pad — two detuned sines for warmth */
        var pad1 = this.ctx.createOscillator();
        var pad2 = this.ctx.createOscillator();
        var padG = this.ctx.createGain();
        pad1.type = "sine";
        pad2.type = "sine";
        pad1.frequency.setValueAtTime(mc.chords[0].pad[0], now);
        pad2.frequency.setValueAtTime(mc.chords[0].pad[1] * 1.003, now);
        padG.gain.setValueAtTime(mc.vol.pad, now);
        var lfo = this.ctx.createOscillator();
        var lfoG = this.ctx.createGain();
        lfo.frequency.value = 0.18;
        lfoG.gain.value = 0.003;
        lfo.connect(lfoG);
        lfoG.connect(padG.gain);
        pad1.connect(padG);
        pad2.connect(padG);
        padG.connect(filter);
        pad1.start(now);
        pad2.start(now);
        lfo.start(now);
        this._musicNodes = { master: master, filter: filter, bass: bass, bassG: bassG, pad1: pad1, pad2: pad2, padG: padG, lfo: lfo, lfoG: lfoG };
        /* start beat scheduler */
        this._musicSubBeat = 0;
        this._musicNextTime = now + 0.5;
        this._melNoteIdx = mc.melRange[0] + Math.floor((mc.melRange[1] - mc.melRange[0]) / 2);
        this._arpStep = 0;
        var self = this;
        this._musicScheduler = setInterval(function() { self._scheduleMusicBeat(); }, 180);
      }
      stopAmbient() {
        if (!this.ambientActive) return;
        this.ambientActive = false;
        if (this._musicScheduler) { clearInterval(this._musicScheduler); this._musicScheduler = null; }
        var n = this._musicNodes;
        if (!n || !this.ctx) { this._musicNodes = null; return; }
        this._musicNodes = null;
        try {
          var now = this.ctx.currentTime;
          n.master.gain.setTargetAtTime(0, now, 0.15);
          setTimeout(function() {
            try { n.bass.stop(); n.pad1.stop(); n.pad2.stop(); n.lfo.stop(); } catch(e) {}
            try { n.bass.disconnect(); n.pad1.disconnect(); n.pad2.disconnect(); n.lfo.disconnect(); n.lfoG.disconnect(); n.bassG.disconnect(); n.padG.disconnect(); n.filter.disconnect(); n.master.disconnect(); } catch(e) {}
          }, 500);
        } catch(e) {}
      }
      _getMusicMoodKey() {
        var tod = (store.decor.timeOfDay == null ? 1 : store.decor.timeOfDay);
        if (game.scene && game.scene.name === "backyard") return "backyard";
        return ["morning", "day", "evening", "night"][tod];
      }
      setMusicMood(mood) {
        var key = mood || this._getMusicMoodKey();
        if (key === this._musicMood && this.ambientActive) return;
        /* V10 — advance the variation index for this mood so the next entry
           into the mood plays a different chord-progression permutation. */
        if (store.musicVariation && key && store.musicVariation[key] != null) {
          var __mcfg = MUSIC_MOODS[key];
          var __mcount = (__mcfg && __mcfg.variations) ? __mcfg.variations.length : 1;
          store.musicVariation[key] = ((store.musicVariation[key] | 0) + 1) % __mcount;
          saveJSON("musicVariation", store.musicVariation);
        }
        this.stopAmbient();
        var self = this;
        setTimeout(function() { self.startAmbient(key); }, 350);
      }
      _scheduleMusicBeat() {
        if (!this.ctx || !this._musicNodes || !this._musicMoodConfig) return;
        var mc = this._musicMoodConfig;
        var eighthDur = 60 / mc.bpm / 2;
        var lookAhead = 0.4;
        /* if tab was hidden, jump ahead instead of catching up */
        if (this._musicNextTime < this.ctx.currentTime - 1.0) {
          this._musicNextTime = this.ctx.currentTime + 0.1;
        }
        var safety = 0;
        while (this._musicNextTime < this.ctx.currentTime + lookAhead && safety < 16) {
          safety++;
          var when = this._musicNextTime;
          var sub = this._musicSubBeat;
          var chordIdx = Math.floor(sub / 16) % 4;
          /* V10 — apply variation permutation if available */
          var __mvIdx = (store.musicVariation && store.musicVariation[this._musicMood] != null) ? store.musicVariation[this._musicMood] : 0;
          var __mvPerm = mc.variations ? mc.variations[__mvIdx % mc.variations.length] : null;
          var chord = mc.chords[__mvPerm ? __mvPerm[chordIdx] : chordIdx];
          var beatInChord = sub % 16;
          var isDownbeat = (sub % 2 === 0);
          /* update sustained voices on chord boundaries */
          if (beatInChord === 0 && this._musicNodes) {
            var n = this._musicNodes;
            n.bass.frequency.setTargetAtTime(chord.bass, when, 0.4);
            n.bassG.gain.setTargetAtTime(mc.vol.bass, when, 0.1);
            n.pad1.frequency.setTargetAtTime(chord.pad[0], when, 0.35);
            n.pad2.frequency.setTargetAtTime(chord.pad[1] * 1.003, when, 0.35);
            n.padG.gain.setTargetAtTime(mc.vol.pad, when, 0.1);
          }
          /* melody on quarter-note beats */
          if (isDownbeat) {
            var resolving = (beatInChord >= 14);
            var melFreq = this._nextMelodyNote(chord.home, mc.melRange, mc.restPct, resolving);
            if (melFreq) {
              this._playMusicNote(melFreq, when, eighthDur * 1.6, mc.vol.mel, "triangle");
            }
          }
          /* arpeggio on eighth notes */
          if (mc.arpOn && mc.vol.arp > 0) {
            if (Math.random() < 0.62) {
              var arpIdx = chord.home[this._arpStep % chord.home.length];
              this._playMusicNote(PENTA_FREQS[arpIdx], when, eighthDur * 0.55, mc.vol.arp, "sine");
            }
            this._arpStep++;
          }
          this._musicSubBeat = (sub + 1) % 64;
          this._musicNextTime += eighthDur;
        }
      }
      _nextMelodyNote(home, range, restPct, resolve) {
        if (Math.random() < restPct) return null;
        var idx = this._melNoteIdx;
        if (resolve) {
          idx = home[0];
          this._melNoteIdx = idx;
          return PENTA_FREQS[idx];
        }
        var r = Math.random();
        if (r < 0.50) {
          idx += (Math.random() < 0.5) ? 1 : -1;
        } else if (r < 0.75) {
          idx = home[Math.floor(Math.random() * home.length)];
        } else if (r < 0.88) {
          idx += (Math.random() < 0.5) ? 2 : -2;
        }
        idx = Math.max(range[0], Math.min(range[1], idx));
        this._melNoteIdx = idx;
        return PENTA_FREQS[idx];
      }
      _playMusicNote(freq, when, dur, gain, type) {
        if (!this.ctx || !this._musicNodes) return;
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();
        osc.type = type || "triangle";
        osc.frequency.setValueAtTime(freq, when);
        osc.connect(g);
        g.connect(this._musicNodes.filter);
        var attack = Math.min(0.025, dur * 0.12);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(gain, when + attack);
        g.gain.setTargetAtTime(0.0001, when + dur * 0.55, dur * 0.25);
        osc.start(when);
        osc.stop(when + dur + 0.15);
      }
    }
    const audio = new CozyAudio();
    audio.setVolume(store.settings.music, store.settings.sfx);

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ("ontouchstart" in window);


