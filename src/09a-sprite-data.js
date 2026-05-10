    // ═══ 09-sprites.js ═══
    const SPRITE_ATLAS_URI = "assets/cozy-sprites-atlas.webp";

    const SPRITE_FRAME_BOXES = {
      "annie": {
            "stand": { "x": 8, "y": 8, "w": 462, "h": 974 },
            "sit": { "x": 472, "y": 990, "w": 515, "h": 957 },
            "cheer": { "x": 478, "y": 8, "w": 514, "h": 970 },
            "laugh": { "x": 8, "y": 990, "w": 456, "h": 970 },
            "kneel": { "x": 8, "y": 7467, "w": 730, "h": 745 },
            "walkSide": { "x": 8, "y": 8220, "w": 633, "h": 970 },
            "walkFront": { "x": 8, "y": 9198, "w": 613, "h": 984 }
      },
      "items": {
            "yarnBall": { "x": 8, "y": 10190, "w": 352, "h": 257 },
            "brush": { "x": 8, "y": 10455, "w": 381, "h": 294 },
            "giftBox": { "x": 482, "y": 11986, "w": 307, "h": 308 },
            "waterBowl": { "x": 8, "y": 12329, "w": 397, "h": 307 },
            "dogTreats": { "x": 413, "y": 12329, "w": 358, "h": 307 },
            "foodBowl": { "x": 249, "y": 13488, "w": 407, "h": 230 },
            "catTreats": { "x": 8, "y": 14380, "w": 306, "h": 93 }
      },
      "obi": {
            "sitHappy": { "x": 8, "y": 2558, "w": 360, "h": 512 },
            "run": { "x": 8, "y": 3907, "w": 564, "h": 379 },
            "leap": { "x": 8, "y": 3517, "w": 485, "h": 382 },
            "sitSad": { "x": 376, "y": 2558, "w": 367, "h": 471 },
            "sleep": { "x": 8, "y": 4666, "w": 653, "h": 342 },
            "sniff": { "x": 8, "y": 5016, "w": 757, "h": 509 },
            "shake": { "x": 8, "y": 5533, "w": 644, "h": 520 },
            "dig": { "x": 8, "y": 11625, "w": 580, "h": 353 },
            "splash": { "x": 450, "y": 11247, "w": 510, "h": 366 },
            "eat": { "x": 316, "y": 12936, "w": 390, "h": 271 },
            "drink": { "x": 289, "y": 13217, "w": 409, "h": 262 },
            "carryToy": { "x": 596, "y": 11625, "w": 363, "h": 336 },
            "bath": { "x": 8, "y": 12644, "w": 340, "h": 284 }
      },
      "luna": {
            "sit": { "x": 8, "y": 1968, "w": 428, "h": 582 },
            "crouch": { "x": 8, "y": 4294, "w": 524, "h": 356 },
            "pounce": { "x": 8, "y": 3078, "w": 680, "h": 431 },
            "paw": { "x": 444, "y": 1968, "w": 353, "h": 533 },
            "sleep": { "x": 8, "y": 6069, "w": 719, "h": 372 },
            "groom": { "x": 8, "y": 6449, "w": 581, "h": 576 },
            "bellyUp": { "x": 8, "y": 7033, "w": 868, "h": 418 },
            "treeSit": { "x": 8, "y": 10765, "w": 614, "h": 474 },
            "stalk": { "x": 316, "y": 13741, "w": 680, "h": 206 },
            "eat": { "x": 316, "y": 13963, "w": 466, "h": 201 },
            "drink": { "x": 8, "y": 11986, "w": 466, "h": 335 },
            "stretch": { "x": 8, "y": 11247, "w": 434, "h": 370 },
            "bath": { "x": 8, "y": 14172, "w": 367, "h": 200 }
      },
      "accessories": {
            "bandanaRed": { "x": 8, "y": 13963, "w": 300, "h": 201 },
            "bandanaPlaid": { "x": 706, "y": 13217, "w": 300, "h": 253 },
            "bandanaCamo": { "x": 383, "y": 14172, "w": 300, "h": 181 },
            "sweaterRed": { "x": 664, "y": 12644, "w": 300, "h": 278 },
            "bowPink": { "x": 8, "y": 13741, "w": 300, "h": 214 },
            "flowerCrown": { "x": 664, "y": 13488, "w": 300, "h": 226 },
            "starCollar": { "x": 691, "y": 14172, "w": 300, "h": 155 }
      },
      "backyard": {
            "birdFeeder": { "x": 8, "y": 13217, "w": 273, "h": 263 },
            "kiddiePool": { "x": 356, "y": 12644, "w": 300, "h": 281 },
            "gardenPatch": { "x": 8, "y": 12936, "w": 300, "h": 273 },
            "bench": { "x": 714, "y": 12936, "w": 300, "h": 270 },
            "butterflyNet": { "x": 8, "y": 13488, "w": 233, "h": 245 }
      }
};

    const SPRITE_BASE_SCALE = {
      annie: 0.158,
      obi: 0.205,
      luna: 0.198
    };

    /* Scale corrections for replacement sprites (new atlas frames differ in px from originals).
       Maps "category.key" -> multiplier so rendered size matches the original visual size. */
    const FRAME_SCALE_FIX = {
      "obi.eat": 1.63, "obi.drink": 1.62, "obi.carryToy": 1.54, "obi.bath": 1.65,
      "obi.dig": 1.10, "obi.splash": 1.10,
      "luna.eat": 1.68, "luna.drink": 1.68, "luna.stretch": 1.64, "luna.bath": 1.53,
      "luna.treeSit": 1.10, "luna.stalk": 1.05,
      "items.foodBowl": 1.58, "items.waterBowl": 1.62, "items.giftBox": 1.58,
      "items.dogTreats": 1.62, "items.catTreats": 1.60
    };

    const ACCESSORY_ATLAS_URI = "assets/cozy-accessories-atlas.webp";

    const ACCESSORY_ATLAS_FRAMES = {
      "scarfKnit": { "x": 8, "y": 8, "w": 280, "h": 286 },
      "witchHat": { "x": 296, "y": 8, "w": 280, "h": 272 },
      "partyHat": { "x": 584, "y": 8, "w": 178, "h": 265 },
      "raincoatYellow": { "x": 8, "y": 302, "w": 280, "h": 259 },
      "jerseyBlue": { "x": 296, "y": 302, "w": 280, "h": 256 },
      "tiara": { "x": 584, "y": 302, "w": 280, "h": 226 },
      "bowtieBlack": { "x": 8, "y": 569, "w": 280, "h": 215 },
      "flowerLei": { "x": 296, "y": 569, "w": 280, "h": 207 },
      "beretPink": { "x": 584, "y": 569, "w": 280, "h": 204 },
      "crownGold": { "x": 8, "y": 792, "w": 248, "h": 166 },
      "bellCollar": { "x": 264, "y": 792, "w": 280, "h": 155 },
      "bowLavender": { "x": 552, "y": 792, "w": 280, "h": 151 },
      "watchGold": { "x": 8, "y": 966, "w": 280, "h": 149 },
      "sunHat": { "x": 296, "y": 966, "w": 280, "h": 145 },
      "hairClipStar": { "x": 584, "y": 966, "w": 280, "h": 144 },
      "bandanaBlue": { "x": 8, "y": 1123, "w": 280, "h": 135 },
      "braceletCharm": { "x": 296, "y": 1123, "w": 280, "h": 131 },
      "sweaterGreen": { "x": 584, "y": 1123, "w": 280, "h": 127 },
      "braceletBeaded": { "x": 8, "y": 1266, "w": 280, "h": 123 },
      "pearlNecklace": { "x": 296, "y": 1266, "w": 280, "h": 118 },
      "headbandFloral": { "x": 584, "y": 1266, "w": 280, "h": 87 },
      "crownFloral": { "x": 8, "y": 1397, "w": 280, "h": 84 },
      "crownSilver": { "x": 296, "y": 1397, "w": 280, "h": 54 }
    };

    const spriteArt = {
      ready: false,
      loading: false,
      image: null,
      accessoryImage: null,
      frames: SPRITE_FRAME_BOXES
    };

    function makeBufferCanvas(w, h) {
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(w));
      cv.height = Math.max(1, Math.round(h));
      return cv;
    }

    function loadCozyArt() {
      if (spriteArt.loading || spriteArt.ready) return;
      spriteArt.loading = true;
      var mainLoaded = false, accLoaded = false;
      function checkDone() {
        if (mainLoaded && accLoaded) { spriteArt.loading = false; spriteArt.ready = true; }
      }
      var img = new Image();
      img.decoding = "async";
      img.onload = function() { spriteArt.image = img; mainLoaded = true; checkDone(); };
      img.onerror = function() { spriteArt.loading = false; };
      img.src = SPRITE_ATLAS_URI;
      var accImg = new Image();
      accImg.decoding = "async";
      accImg.onload = function() { spriteArt.accessoryImage = accImg; accLoaded = true; checkDone(); };
      accImg.onerror = function() { accLoaded = true; checkDone(); };
      accImg.src = ACCESSORY_ATLAS_URI;
    }

