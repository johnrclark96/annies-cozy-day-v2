    /* ═══ Procedural Music Constants ═══ */
    const PENTA_FREQS = [
      65.41, 73.42, 82.41, 98.00, 110.00,
      130.81, 146.83, 164.81, 196.00, 220.00,
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.26, 783.99, 880.00
    ];
    const MUSIC_MOODS = {
      morning: { bpm: 76, filter: 1800, melRange: [10,17], arpOn: true, restPct: 0.25,
        vol: { bass: 0.022, pad: 0.012, mel: 0.035, arp: 0.010 },
        chords: [
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] },
          { bass: 196.00, pad: [392.00, 293.66], home: [13,11,14] },
          { bass: 110.00, pad: [220.00, 329.63], home: [14,10,12] },
          { bass: 130.81, pad: [261.63, 329.63], home: [10,12,13] }
        ],
        /* V10 — chord-progression permutations. Index into `chords`. */
        variations: [[0,1,2,3], [3,2,1,0], [1,3,0,2]]},
      day: { bpm: 72, filter: 1400, melRange: [10,16], arpOn: true, restPct: 0.28,
        vol: { bass: 0.022, pad: 0.012, mel: 0.032, arp: 0.009 },
        chords: [
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] },
          { bass: 110.00, pad: [220.00, 329.63], home: [14,10,12] },
          { bass: 196.00, pad: [196.00, 293.66], home: [13,11,10] },
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] }
        ],
        variations: [[0,1,2,3], [2,0,3,1], [1,2,0,3]]},
      evening: { bpm: 64, filter: 950, melRange: [10,15], arpOn: false, restPct: 0.38,
        vol: { bass: 0.020, pad: 0.011, mel: 0.026, arp: 0 },
        chords: [
          { bass: 110.00, pad: [220.00, 329.63], home: [14,10,12] },
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] },
          { bass: 196.00, pad: [196.00, 293.66], home: [13,11,10] },
          { bass: 110.00, pad: [220.00, 329.63], home: [14,10,12] }
        ],
        variations: [[0,1,2,3], [1,0,2,3], [2,1,0,3]]},
      night: { bpm: 54, filter: 600, melRange: [10,14], arpOn: false, restPct: 0.55,
        vol: { bass: 0.016, pad: 0.009, mel: 0.018, arp: 0 },
        chords: [
          { bass: 130.81, pad: [261.63, 329.63], home: [10,12,13] },
          { bass: 110.00, pad: [220.00, 329.63], home: [14,10,12] },
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] },
          { bass: 110.00, pad: [220.00, 261.63], home: [14,10,12] }
        ],
        variations: [[0,1,2,3], [3,2,1,0], [2,3,0,1]]},
      backyard: { bpm: 80, filter: 2000, melRange: [10,18], arpOn: true, restPct: 0.22,
        vol: { bass: 0.020, pad: 0.013, mel: 0.034, arp: 0.011 },
        chords: [
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] },
          { bass: 146.83, pad: [293.66, 440.00], home: [11,13,14] },
          { bass: 196.00, pad: [392.00, 293.66], home: [13,11,10] },
          { bass: 130.81, pad: [261.63, 392.00], home: [10,12,13] }
        ],
        variations: [[0,1,2,3], [3,1,2,0], [1,2,3,0]]}
    };

