    // ═══ 01-constants.js ═══
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const SAFE = 16;
    const INTRO_SCRIM = "rgba(58, 42, 30, 0.55)";
    const STORE_PREFIX = "anniesCozyDay_";

    /* ── HUD anchor grid (Phase A.1) ──
       Single source of truth for HUD pill positions across hub, backyard, and minigames.
       row1 = top header row (y=SAFE); row2 = second row (clears a 28-tall element + gap).
       slot 0 = primary header pill (h=primaryH=46, used by minigame Time/Score).
       slot 1+ = small pills (h=pillH=22, used by hangout coin/star/streak/etc).
       chipCol = x of the right-edge 28×28 chip stack (sound/camera/scrapbook). */
    const HUD_GRID = {
      row1: SAFE,                 // 16 — slot-0 baseline (minigame Time/Score, chip stack)
      row2: SAFE + 18,             // 34 — slot-1 baseline (hangout pill row); horizontally
                                   //      separate from chip stack which sits at chipCol
      pillH: 22,                  // standard small-pill height
      pillGap: 6,                 // gap between rows (and between pills horizontally)
      primaryH: 46,               // h for slot-0 header pill (minigame Time/Score)
      chipCol: W - SAFE - 28,     // x for the right-edge 28×28 chip stack
      bottomY: 510                // y for bottom-anchored row (goal pill, etc) —
                                   // sits above the welcome banner, not at canvas bottom
    };

    const COLORS = {
      cream: "#FFF8F0",
      peach: "#FFDAB9",
      softPink: "#FFB6C1",
      gold: "#FFD700",
      sage: "#A8C686",
      brown: "#D2B48C",
      warmRed: "#C0392B",
      wall: "#F5E6D3",
      couch: "#C59A6A",
      couchDark: "#AA7C50",
      rug: "#D8C2A8",
      floor: "#EFD8BE",
      dark: "#5C4434",
      shadow: "rgba(0,0,0,0.14)"
    };

    /* ── Tier system ── */
    const TIER_COLORS = { 1: "#8B7355", 2: "#4A90D9", 3: "#9B59B6", 4: "#E8A020", special: "#C0392B" };

    function canAccessTier(tier) {
      var stars = totalStarsEarned();
      var streak = store.careStreak.count;
      var achCount = 0;
      for (var k in store.achievements) { if (store.achievements[k]) achCount++; }
      if (tier <= 1) return true;
      if (tier === 2) return stars >= 10 || streak >= 21 || achCount >= 5;
      if (tier === 3) return stars >= 20 || streak >= 60 || achCount >= 10;
      if (tier === 4) return stars >= 30 && achCount >= 14 && streak >= 30;
      return true;
    }

    /* ── Achievements ── */
    const ACHIEVEMENTS = [
      { key: "obiBestFriend", name: "Obi's Best Friend", desc: "Catch 30 total treats across all Treat Toss games.", color: "#A97142", icon: "bone", coinBonus: 10 },
      { key: "comboStar", name: "Combo Star", desc: "Reach a 10x combo in Treat Toss.", color: "#FFD700", icon: "star", coinBonus: 10 },
      { key: "catWhisperer", name: "Cat Whisperer", desc: "Score 400+ in a single Laser Chase game.", color: "#7CB342", icon: "catEye", coinBonus: 10 },
      { key: "pouncePerfect", name: "Pounce Perfect", desc: "Reach a 5x combo in Laser Chase.", color: "#E53935", icon: "paw", coinBonus: 10 },
      { key: "couchPotato", name: "Couch Potato", desc: "Survive 30 seconds in Cuddle Pile.", color: "#7FB3D5", icon: "couch", coinBonus: 10 },
      { key: "maximumCozy", name: "Maximum Cozy", desc: "Reach the 90-second win state in Cuddle Pile.", color: "#F48FB1", icon: "heart", coinBonus: 15 },
      { key: "goodWalker", name: "Good Walker", desc: "Score 300+ on Obi's Walk.", color: "#8D6E4C", icon: "bone", coinBonus: 10 },
      { key: "napMaster", name: "Nap Master", desc: "Score 400+ on Luna's Nap Spot.", color: "#C39BD3", icon: "heart", coinBonus: 10 },
      { key: "squeakyClean", name: "Squeaky Clean", desc: "Score 200+ in Bath Time.", color: "#87CEEB", icon: "heart", coinBonus: 10 },
      { key: "sortingPro", name: "Sorting Pro", desc: "Sort 10 treats correctly in a row.", color: "#E8A84C", icon: "star", coinBonus: 10 },
      { key: "whackQueen", name: "Whack Queen", desc: "Score 250+ in Pillow Pop.", color: "#F48FB1", icon: "paw", coinBonus: 10 },
      { key: "sharpEye", name: "Sharp Eye", desc: "Find Luna 8 times in a row in Where's Luna.", color: "#7CB342", icon: "catEye", coinBonus: 10 },
      { key: "birdWatcher", name: "Bird Watcher", desc: "Score 300+ in Window Watch.", color: "#87CEEB", icon: "star", coinBonus: 10 },
      { key: "goodMemory", name: "Good Memory", desc: "Repeat a 7-step sequence in Pawstep Patterns.", color: "#C39BD3", icon: "heart", coinBonus: 10 },
      { key: "greenThumb", name: "Green Thumb", desc: "Plant 20 total flowers in the backyard.", color: "#5C8A3A", icon: "star", coinBonus: 15 },
      { key: "shutterBug", name: "Shutter Bug", desc: "Take 10 photos.", color: "#E8A84C", icon: "star", coinBonus: 10 },
      { key: "fashionista", name: "Fashionista", desc: "Own 10 accessories across all characters.", color: "#9B59B6", icon: "star", coinBonus: 20 },
      { key: "dedicated", name: "Dedicated Caretaker", desc: "Reach a 30-day care streak.", color: "#E8A020", icon: "heart", coinBonus: 25 },
      { key: "socialButterfly", name: "Social Butterfly", desc: "Witness 5 different pet-to-pet interactions.", color: "#FF69B4", icon: "heart", coinBonus: 15 },
      { key: "fullHouse", name: "Full House", desc: "Earn all 33 minigame stars.", color: "#FFD700", icon: "star", coinBonus: 50 },
      { key: "wellFed", name: "Well Fed", desc: "Fill food and water bowls 50 total times.", color: "#7CB342", icon: "heart", coinBonus: 10 },
      { key: "collector", name: "Master Collector", desc: "Own every item in the game.", color: "#E8A020", icon: "star", coinBonus: 100 },
      { key: "challengeChampion", name: "Challenge Champion", desc: "Earn 5 challenge stars.", color: "#FFD700", icon: "star", coinBonus: 50 },
      { key: "wandMaster", name: "Wand Master", desc: "Score 500+ in Luna's Wild Wand.", color: "#E88090", icon: "catEye", coinBonus: 10 }
    ];

    const TITLE_SUBTITLES = [
      "A cozy little gift for Annie, Obi, and Luna",
      "Obi wants belly rubs",
      "Luna is judging you lovingly",
      "Everyone's favorite nap spot",
      "A game about the important things",
      "Obi found something interesting to sniff",
      "Luna claims this is her couch now"
    ];

    /* F.5 — welcome banner pool, drawn from on title→hangout entry. Each
       entry can be filtered by `mood` (matches the active pet's daily mood,
       or "any" for generic). Tone: warm, observational, never urgent. */
    const WELCOME_LINES = [
      { text: "Obi is curious about you today.", mood: "any" },
      { text: "Luna is judging from the couch.", mood: "any" },
      { text: "It's quiet here. Settle in.", mood: "any" },
      { text: "The light through the window is gentle today.", mood: "any" },
      { text: "Obi wagged when the door opened.", mood: "any" },
      { text: "Luna pretends not to care that you're back.", mood: "any" },
      { text: "Obi wants to play.", mood: "playful" },
      { text: "Obi is bouncing — fetch me a toy.", mood: "playful" },
      { text: "Obi is leaning into Annie's hand.", mood: "cuddly" },
      { text: "Obi will follow you anywhere right now.", mood: "cuddly" },
      { text: "Obi is yawning. Couch time?", mood: "lazy" },
      { text: "Obi keeps looking at his food bowl.", mood: "hungry" },
      { text: "Luna is watching the windowsill carefully.", mood: "curious" },
      { text: "Luna's tail is twitching at nothing.", mood: "curious" },
      { text: "Luna found the highest cushion. Of course.", mood: "aloof" },
      { text: "Luna pretends she doesn't see you.", mood: "aloof" },
      { text: "Luna walked past Annie three times. That's affection.", mood: "affectionate" },
      { text: "Luna is purring before you've even sat down.", mood: "affectionate" },
      { text: "Luna's tail keeps flicking. Watch your ankles.", mood: "mischievous" },
      { text: "Luna is up to something.", mood: "mischievous" }
    ];

    /* ── Living room decorations ── */
    const DECOR_ITEMS = [
      /* existing star/streak-gated items */
      { key: "fairyLights", name: "Fairy Lights", desc: "Twinkling lights along the wall", stars: 1, type: "toggle" },
      { key: "plant2", name: "Flower Pot", desc: "A flowering plant on the side table", stars: 3, type: "toggle" },
      { key: "petBed", name: "Pet Bed", desc: "A cozy pink bed for napping", stars: 5, type: "toggle" },
      { key: "rugColor", name: "Rug Color", desc: "Change the rug color", stars: 2, type: "cycle", max: 3, labels: ["Default", "Sage", "Lavender", "Rose"] },
      { key: "roomPreset", name: "Room Style", desc: "Change the room's color palette", stars: 0, type: "cycle", max: 4, labels: ["Cozy Neutral", "Pastel Cute", "Warm Cottage", "Moonlight Blue", "Bookish Cozy"] },
      { key: "timeOfDay", name: "Time of Day", desc: "Change the lighting and atmosphere", stars: 0, type: "cycle", max: 3, labels: ["Morning", "Daytime", "Evening", "Nighttime"] },
      { key: "wallArt2", name: "Wall Art", desc: "New artwork for the wall", stars: 7, type: "cycle", max: 3, labels: ["Landscape", "Floral", "Portraits", "Abstract"] },
      { key: "windowPlant", name: "Window Herbs", desc: "Fresh herbs on the window sill", stars: 6, type: "toggle" },
      { key: "cozyBlanket", name: "Cozy Blanket", desc: "A warm blanket on the couch", stars: 0, type: "toggle", streakUnlock: 7 },
      { key: "photoWall", name: "Photo Wall", desc: "Family photos on the wall", stars: 0, type: "toggle", streakUnlock: 30 },
      /* new coin-purchasable decorations */
      { key: "floorCushion", name: "Floor Cushion", desc: "A round cushion near the rug", stars: 0, type: "toggle", price: 15, tier: 1 },
      { key: "corkBoard", name: "Cork Board", desc: "A cork board with pinned notes", stars: 0, type: "toggle", price: 20, tier: 1 },
      { key: "bookStack", name: "Book Stack", desc: "A cozy stack of books by the couch", stars: 0, type: "toggle", price: 25, tier: 1 },
      { key: "couchPillows", name: "Couch Pillows", desc: "Change pillow colors", stars: 0, type: "cycle", max: 4, labels: ["Default", "Coral", "Mint", "Sunflower", "Lilac"], price: 30, tier: 1 },
      { key: "hangingPlant", name: "Hanging Plant", desc: "A macrame plant hanger", stars: 0, type: "toggle", price: 45, tier: 2 },
      { key: "candles", name: "Candle Set", desc: "Three candles that glow at night", stars: 0, type: "toggle", price: 50, tier: 2 },
      { key: "wallClock", name: "Wall Clock", desc: "A cute clock with moving hands", stars: 0, type: "toggle", price: 55, tier: 2 },
      { key: "rugPattern", name: "Fancy Rug", desc: "Upgraded rug patterns", stars: 0, type: "cycle", max: 3, labels: ["Default", "Moroccan", "Floral", "Geometric"], price: 60, tier: 2 },
      { key: "garland", name: "Seasonal Garland", desc: "Hanging garland decorations", stars: 0, type: "cycle", max: 4, labels: ["Off", "Spring", "Summer", "Autumn", "Winter"], price: 100, tier: 3 },
      { key: "petToys", name: "Toy Display", desc: "A basket of visible toys", stars: 0, type: "toggle", price: 120, tier: 3 },
      { key: "musicBox", name: "Music Box", desc: "A sparkling music box", stars: 0, type: "toggle", achievementUnlock: "maximumCozy" },
      { key: "familyPortrait", name: "Family Portrait", desc: "Annie, Obi, and Luna together", stars: 33, type: "toggle" },
      /* cozy upgrades — gameplay-affecting */
      { key: "comfyBowls", name: "\u2728 Comfy Bowls", desc: "Bowls deplete 25% slower", stars: 0, type: "toggle", price: 80, tier: 1, isUpgrade: true },
      { key: "treatsJar", name: "\u2728 Treats Jar", desc: "Treats give +1 bonus joy", stars: 0, type: "toggle", price: 60, tier: 1, isUpgrade: true },
      { key: "cozyBlankets", name: "\u2728 Extra Blankets", desc: "Pets start each visit +5 joy", stars: 0, type: "toggle", price: 100, tier: 2, isUpgrade: true },
      { key: "joyfulHome", name: "\u2728 Joyful Home", desc: "Joy decays 20% slower", stars: 0, type: "toggle", price: 120, tier: 2, isUpgrade: true },
      { key: "luckyCharm", name: "\u2728 Lucky Charm", desc: "+2 coins per minigame play", stars: 0, type: "toggle", price: 150, tier: 2, isUpgrade: true },
      /* Golden Room collection — endgame aspirational items */
      { key: "goldenCurtains", name: "\u2728 Golden Curtains", desc: "Luxurious golden drapes", stars: 25, type: "toggle", price: 200, tier: 3 },
      { key: "chandelier", name: "\u2728 Crystal Chandelier", desc: "A sparkling centerpiece", stars: 25, type: "toggle", price: 300, tier: 3 },
      { key: "silkPillows", name: "\u2728 Silk Throw Pillows", desc: "Elegant couch upgrade", stars: 25, type: "toggle", price: 250, tier: 3 },
      { key: "antiqueMusicBox", name: "\u2728 Antique Music Box", desc: "Plays a tinkling melody", stars: 25, type: "toggle", price: 350, tier: 4 },
      { key: "royalThrone", name: "\u2728 Royal Pet Throne", desc: "A throne for the king and queen", stars: 25, type: "toggle", price: 500, tier: 4 },
      /* seasonal decorations */
      { key: "cherryBranch", name: "\u{1F338} Cherry Branch", desc: "Blossoming cherry branch in a vase", type: "toggle", price: 35, tier: 1, season: "spring" },
      { key: "paintedEggs", name: "\u{1F338} Painted Eggs", desc: "Colorful eggs in a woven basket", type: "toggle", price: 25, tier: 1, season: "spring" },
      { key: "springWreath", name: "\u{1F338} Spring Wreath", desc: "Fresh flower wreath for the wall", type: "toggle", price: 45, tier: 2, season: "spring" },
      { key: "lemonadePitcher", name: "\u2600 Lemonade Pitcher", desc: "Cool lemonade on the shelf", type: "toggle", price: 30, tier: 1, season: "summer" },
      { key: "beachTowel", name: "\u2600 Beach Towel", desc: "Draped over the couch arm", type: "toggle", price: 25, tier: 1, season: "summer" },
      { key: "seashells", name: "\u2600 Seashell Collection", desc: "A bowl of shells and sand", type: "toggle", price: 40, tier: 2, season: "summer" },
      { key: "pumpkinDisplay", name: "\u{1F342} Pumpkin Display", desc: "Festive pumpkins on the shelf", type: "toggle", price: 35, tier: 1, season: "autumn" },
      { key: "leafGarland", name: "\u{1F342} Leaf Garland", desc: "Warm autumn leaf garland", type: "toggle", price: 30, tier: 1, season: "autumn" },
      { key: "cinnamonCandle", name: "\u{1F342} Cinnamon Candle", desc: "Fills the room with warmth", type: "toggle", price: 45, tier: 2, season: "autumn" },
      { key: "hotCocoaMug", name: "\u2744 Hot Cocoa Mug", desc: "A steaming mug of cocoa", type: "toggle", price: 30, tier: 1, season: "winter" },
      { key: "snowglobe", name: "\u2744 Snowglobe", desc: "Shake it and watch the snow fall", type: "toggle", price: 40, tier: 1, season: "winter" },
      { key: "miniTree", name: "\u2744 Mini Holiday Tree", desc: "A tiny decorated tree", type: "toggle", price: 50, tier: 2, season: "winter" }
    ];

    /* ── Backyard decorations ── */
    const BACKYARD_DECOR_ITEMS = [
      { key: "windChime", name: "Wind Chime", desc: "Sways gently from the tree", type: "toggle", price: 20, tier: 1 },
      { key: "gardenGnome", name: "Garden Gnome", desc: "A cheerful gnome by the garden", type: "toggle", price: 25, tier: 1 },
      { key: "picnicBlanket", name: "Picnic Blanket", desc: "A checkered blanket on the grass", type: "toggle", price: 45, tier: 2 },
      { key: "birdBath", name: "Bird Bath", desc: "A stone bird bath near the feeder", type: "toggle", price: 50, tier: 2 },
      { key: "lanterns", name: "String Lanterns", desc: "Paper lanterns along the fence", type: "toggle", price: 55, tier: 2 },
      { key: "birdHouse", name: "Bird House", desc: "A painted birdhouse on a post", type: "toggle", price: 100, tier: 3 },
      { key: "sundial", name: "Sundial", desc: "A stone sundial in the yard", type: "toggle", price: 110, tier: 3 },
      { key: "dogHouse", name: "Dog House", desc: "Obi's own little house", type: "toggle", price: 150, tier: 3 },
      { key: "butterflyGarden", name: "Butterfly Garden", desc: "Butterflies flutter near the flowers", type: "toggle", achievementUnlock: "birdWatcher" },
      { key: "fountain", name: "Garden Fountain", desc: "A stone fountain with flowing water", type: "toggle", price: 300, tier: 4 }
    ];

    const DAILY_TASK_POOL = [
      { id: "pet", text: "Pet Obi or Luna" },
      { id: "feed", text: "Fill the food bowl" },
      { id: "water", text: "Fill the water bowl" },
      { id: "brush", text: "Brush a pet" },
      { id: "toy", text: "Throw a toy" },
      { id: "treat", text: "Toss a treat" },
      { id: "game", text: "Play a minigame" }
    ];

    /* ── Weekly challenge pool ── */
    const WEEKLY_CHALLENGES = [
      { id: "play5games", text: "Play 5 different minigames", target: 5, reward: 40, trackKey: "gamesPlayed" },
      { id: "earn8stars", text: "Earn 8 stars total", target: 8, reward: 50, trackKey: "starsEarned" },
      { id: "pet10", text: "Pet both Obi and Luna 10 times", target: 10, reward: 30, trackKey: "petActions" },
      { id: "feedBirds5", text: "Fill the bird feeder 5 times", target: 5, reward: 40, trackKey: "feederFills" },
      { id: "plant4", text: "Plant 4 flowers", target: 4, reward: 35, trackKey: "flowersPlanted" },
      { id: "photos3", text: "Take 3 photos", target: 3, reward: 40, trackKey: "photosTaken" },
      { id: "streak5", text: "Maintain a 5-day streak", target: 5, reward: 50, trackKey: "streakDays" },
      { id: "buy2", text: "Buy 2 items", target: 2, reward: 60, trackKey: "itemsBought" }
    ];

    /* ── Accessories (all 3 characters) ── */
    const ACCESSORIES = {
      obi: [
        { key: "bandanaRed", name: "Red Bandana", price: 10, slot: "neck", tier: 1 },
        { key: "bandanaPlaid", name: "Plaid Bandana", price: 15, slot: "neck", tier: 1 },
        { key: "bandanaCamo", name: "Camo Bandana", price: 15, slot: "neck", tier: 1 },
        { key: "bandanaBlue", name: "Blue Bandana", price: 20, slot: "neck", tier: 1 },
        { key: "sweaterRed", name: "Red Sweater", price: 35, slot: "body", tier: 1 },
        { key: "partyHat", name: "Party Hat", price: 55, slot: "head", tier: 2 },
        { key: "bowtieBlack", name: "Black Bow Tie", price: 50, slot: "neck", tier: 2 },
        { key: "sweaterGreen", name: "Green Sweater", price: 65, slot: "body", tier: 2 },
        { key: "raincoatYellow", name: "Yellow Raincoat", price: 120, slot: "body", tier: 3 },
        { key: "flowerLei", name: "Flower Lei", price: 100, slot: "neck", tier: 3 },
        { key: "jerseyBlue", name: "Sports Jersey", price: 250, slot: "body", tier: 4 },
        { key: "crownGold", name: "Golden Crown", price: 0, slot: "head", achievementUnlock: "allAchievements" },
        { key: "flowerCollar", name: "\u{1F338} Flower Collar", price: 30, slot: "neck", tier: 1, season: "spring" },
        { key: "sunVisor", name: "\u2600 Sun Visor", price: 25, slot: "head", tier: 1, season: "summer" },
        { key: "plaidScarf", name: "\u{1F342} Plaid Scarf", price: 30, slot: "neck", tier: 1, season: "autumn" },
        { key: "antlers", name: "\u2744 Reindeer Antlers", price: 35, slot: "head", tier: 1, season: "winter" }
      ],
      luna: [
        { key: "bowPink", name: "Pink Bow", price: 10, slot: "head", tier: 1 },
        { key: "starCollar", name: "Star Collar", price: 15, slot: "neck", tier: 1 },
        { key: "bellCollar", name: "Bell Collar", price: 20, slot: "neck", tier: 1 },
        { key: "flowerCrown", name: "Flower Crown", price: 20, slot: "head", tier: 1 },
        { key: "bowLavender", name: "Lavender Bow", price: 45, slot: "head", tier: 2 },
        { key: "scarfKnit", name: "Knit Scarf", price: 55, slot: "neck", tier: 2 },
        { key: "tiara", name: "Crystal Tiara", price: 100, slot: "head", tier: 3 },
        { key: "witchHat", name: "Witch Hat", price: 130, slot: "head", tier: 3 },
        { key: "pearlNecklace", name: "Pearl Necklace", price: 250, slot: "neck", tier: 4 },
        { key: "crownSilver", name: "Silver Crown", price: 0, slot: "head", starUnlock: 33 },
        { key: "butterflyBow", name: "\u{1F338} Butterfly Bow", price: 25, slot: "head", tier: 1, season: "spring" },
        { key: "sunflowerCrown", name: "\u2600 Sunflower Crown", price: 30, slot: "head", tier: 1, season: "summer" },
        { key: "harvestBow", name: "\u{1F342} Harvest Bow", price: 30, slot: "head", tier: 1, season: "autumn" },
        { key: "snowflakeCollar", name: "\u2744 Snowflake Collar", price: 35, slot: "neck", tier: 1, season: "winter" }
      ],
      annie: [
        { key: "headbandFloral", name: "Floral Headband", price: 15, slot: "head", tier: 1 },
        { key: "braceletBeaded", name: "Beaded Bracelet", price: 20, slot: "wrist", tier: 1 },
        { key: "beretPink", name: "Pink Beret", price: 25, slot: "head", tier: 1 },
        { key: "sunHat", name: "Sun Hat", price: 50, slot: "head", tier: 2 },
        { key: "watchGold", name: "Gold Watch", price: 55, slot: "wrist", tier: 2 },
        { key: "hairClipStar", name: "Star Hair Clip", price: 100, slot: "head", tier: 3 },
        { key: "braceletCharm", name: "Charm Bracelet", price: 120, slot: "wrist", tier: 3 },
        { key: "crownFloral", name: "Floral Crown", price: 0, slot: "head", achievementUnlock: "napMaster+catWhisperer" }
      ]
    };

    /* ── Star milestone coin rewards ── */
    const STAR_MILESTONES = [
      { stars: 10, coins: 15 },
      { stars: 20, coins: 30 },
      { stars: 25, coins: 50 },
      { stars: 30, coins: 75 },
      { stars: 33, coins: 100 }
    ];

    /* ── Cozy Upgrades (gameplay-affecting purchases) ── */
    const COZY_UPGRADES = [
      { key: "comfyBowls", name: "Comfy Bowls", desc: "Bowls deplete 25% slower", price: 80, icon: "bowl" },
      { key: "treatsJar", name: "Treats Jar", desc: "Treats give +1 bonus joy", price: 60, icon: "treat" },
      { key: "cozyBlankets", name: "Extra Blankets", desc: "Pets start each visit +5 joy", price: 100, icon: "blanket" },
      { key: "joyfulHome", name: "Joyful Home", desc: "Joy decays 20% slower", price: 120, icon: "heart" },
      { key: "luckyCharm", name: "Lucky Charm", desc: "+2 coins per minigame play", price: 150, icon: "star" }
    ];

    /* ── Decoration Reactions ── */
    const DECOR_REACTIONS = {
      musicBox:   { pet: "luna", targetX: 257, targetY: 430, message: "Luna paws at the music box!", joyBonus: 2, chance: 0.008 },
      petToys:    { pet: "obi",  targetX: 318, targetY: 480, message: "Obi grabbed a toy from the basket!", joyBonus: 3, chance: 0.006 },
      bookStack:  { pet: "luna", targetX: 350, targetY: 430, message: "Luna sits on the book stack. Of course.", joyBonus: 1, chance: 0.005 },
      petBed:     { pet: "obi",  targetX: 520, targetY: 468, message: "Obi settled into his cozy sofa!", joyBonus: 2, chance: 0.004 },
      floorCushion: { pet: "obi", targetX: 400, targetY: 475, message: "Obi claimed the floor cushion.", joyBonus: 1, chance: 0.005 },
      candles:    { pet: "luna", targetX: 220, targetY: 430, message: "Luna relaxes by the candlelight.", joyBonus: 1, condition: "nighttime", chance: 0.004 },
      familyPortrait: { pet: "both", targetX: 400, targetY: 350, message: "Both pets look up at the family portrait.", joyBonus: 2, chance: 0.003 }
    };

    /* ── Scrapbook Goals ── */
    /* Phase D.7 — `hint` is a short actionable how-to surfaced in the
       Scrapbook Goals tab. Falls back to `desc` if a goal hasn't been
       given a hint yet. */
    const SCRAPBOOK_GOALS = [
      { key: "obiSleepPhoto", name: "Dreaming Obi", desc: "Take a photo while Obi is napping", hint: "Open camera while Obi is curled up asleep.", reward: 10, icon: "star" },
      { key: "lunaGroomPhoto", name: "Grooming Session", desc: "Take a photo while Luna is grooming", hint: "Watch for Luna's grooming pose, then snap.", reward: 10, icon: "catEye" },
      { key: "both80Joy", name: "Double Happiness", desc: "Both pets at 80+ joy at once", hint: "Pet, treat, brush, and play to lift both joy bars above 80.", reward: 15, icon: "heart" },
      { key: "rainWindow", name: "Rainy Day", desc: "See rain outside the window", hint: "Just be present when the weather turns rainy.", reward: 5, icon: "star" },
      { key: "fiveGames3Star", name: "Star Student", desc: "Earn 3 stars in 5 different games", hint: "Replay each minigame until you hit the third star score.", reward: 20, icon: "star" },
      { key: "allDecor5", name: "Interior Designer", desc: "Activate 5 decorations at once", hint: "Buy decor in the Decor panel and toggle five on.", reward: 15, icon: "star" },
      { key: "petInteraction", name: "Best Friends", desc: "Witness Obi and Luna interact", hint: "Just hang out — Obi and Luna play together on their own.", reward: 10, icon: "heart" },
      { key: "backyardVisit", name: "Outdoor Explorer", desc: "Visit the backyard", hint: "Click the door on the right side of the hangout.", reward: 5, icon: "bone" },
      { key: "tenPhotos", name: "Shutterbug Deluxe", desc: "Take 10 photos total", hint: "Use the camera chip in the top-right HUD.", reward: 15, icon: "star" },
      { key: "snowDay", name: "Let It Snow", desc: "See snow outside the window", hint: "Snow only happens in winter — check the window in cold months.", reward: 10, icon: "star" },
      { key: "visitorMet", name: "Friendly Neighbor", desc: "Interact with a visitor", hint: "Click visitors (squirrels, cats, mail) when they appear.", reward: 10, icon: "heart" },
      { key: "challengeAttempt", name: "Brave Heart", desc: "Try a challenge mode minigame", hint: "On a 3-star card, click the gold star top-right to enter challenge mode.", reward: 10, icon: "star" }
    ];

    /* ── Weather & Visitor System ── */
    const WEATHER_TYPES = [
      { key: "sunny",  weight: 0.3, windowTint: null },
      { key: "cloudy", weight: 0.25, windowTint: "rgba(180,190,200,0.12)" },
      { key: "rain",   weight: 0.2, windowTint: "rgba(100,120,140,0.15)" },
      { key: "snow",   weight: 0.1, windowTint: "rgba(200,215,225,0.1)" },
      { key: "golden", weight: 0.15, windowTint: "rgba(255,220,150,0.1)" }
    ];
    const VISITOR_TYPES = [
      { key: "mailCarrier", message: "A package delivery!", stayTime: 12, coinReward: 5, drawX: 710, drawY: 430 },
      { key: "neighborCat", message: "A fluffy cat appeared at the window!", stayTime: 15, joyEffect: { luna: 4, obi: 2 }, drawX: 140, drawY: 190 },
      { key: "squirrel", message: "A squirrel on the window sill!", stayTime: 10, joyEffect: { obi: 5, luna: 3 }, drawX: 160, drawY: 185 },
      { key: "robin", message: "A robin is singing outside!", stayTime: 14, joyEffect: { obi: 2, luna: 2 }, drawX: 100, drawY: 120 },
      { key: "bunny", message: "A bunny hopped by with a basket!", stayTime: 15, coinReward: 8, joyEffect: { obi: 3, luna: 3 }, drawX: 140, drawY: 430, season: "spring" },
      { key: "iceCreamTruck", message: "The ice cream truck is here!", stayTime: 12, coinReward: 6, joyEffect: { obi: 4, luna: 2 }, drawX: 130, drawY: 170, season: "summer" },
      { key: "scarecrow", message: "A friendly scarecrow appeared!", stayTime: 14, coinReward: 5, joyEffect: { obi: 2, luna: 4 }, drawX: 150, drawY: 420, season: "autumn" },
      { key: "santaElf", message: "One of Santa's elves stopped by!", stayTime: 16, coinReward: 12, joyEffect: { obi: 5, luna: 5 }, drawX: 140, drawY: 425, season: "winter" }
    ];

    /* ── Challenge Star Modifiers (4th star per minigame) ── */
    const CHALLENGE_MODIFIERS = {
      treat:    { name: "Speedy Obi",       desc: "Obi moves 50% faster from the start!" },
      laser:    { name: "Invisible Targets", desc: "Targets fade after appearing briefly!" },
      cuddle:   { name: "Wiggly Pile",      desc: "Everyone fidgets twice as often!" },
      walk:     { name: "Rainy Walk",       desc: "Items pass by 40% faster!" },
      nap:      { name: "Restless Beams",   desc: "Sunbeams move twice as fast!" },
      bath:     { name: "Bubble Trouble",   desc: "Scrub meter drains if you stop!" },
      sort:     { name: "Swap Bowls",       desc: "Bowls swap sides every 15 seconds!" },
      pillow:   { name: "Double Trouble",   desc: "Up to 4 popups at once!" },
      findluna: { name: "Speed Shuffle",    desc: "Cushions shuffle at 2x speed!" },
      window:   { name: "Night Watch",      desc: "Darker window, smaller visible area!" },
      pawstep:  { name: "Reverse Memory",   desc: "Repeat the sequence backwards!" },
      wildwand: { name: "Narrow Gaps",      desc: "All gaps are 30% smaller!" }
    };

    /* ── Pet Mood & Personality System ── */
    const PET_MOODS = {
      obi: {
        playful: { joyMult: { toy: 1.5, treat: 1.0, pet: 0.8, brush: 0.7 }, idleBias: "wander", decay: 0.55, label: "waggy" },
        cuddly:  { joyMult: { toy: 0.8, treat: 1.0, pet: 1.5, brush: 1.3 }, idleBias: "sleep", decay: 0.4, label: "cuddly" },
        lazy:    { joyMult: { toy: 0.6, treat: 1.3, pet: 1.0, brush: 1.4 }, idleBias: "sleep", decay: 0.35, label: "sleepy" },
        hungry:  { joyMult: { toy: 0.7, treat: 1.6, pet: 0.8, brush: 0.8 }, idleBias: "sniff", decay: 0.6, label: "snacky" }
      },
      luna: {
        curious:      { joyMult: { toy: 1.5, treat: 0.9, pet: 0.9, brush: 1.0 }, idleBias: "wander", decay: 0.5, label: "curious" },
        aloof:        { joyMult: { toy: 0.7, treat: 1.0, pet: 0.6, brush: 1.3 }, idleBias: "perch", decay: 0.3, label: "aloof" },
        affectionate: { joyMult: { toy: 1.0, treat: 1.0, pet: 1.6, brush: 1.4 }, idleBias: "floor", decay: 0.45, label: "lovey" },
        mischievous:  { joyMult: { toy: 1.3, treat: 1.0, pet: 0.8, brush: 0.7 }, idleBias: "pounce", decay: 0.55, label: "feisty" }
      }
    };
    const DAY_OF_WEEK_PREFS = {
      obi:  ["playful","cuddly","hungry","playful","lazy","cuddly","playful"],
      luna: ["curious","aloof","affectionate","mischievous","curious","affectionate","aloof"]
    };

    const LUNA_PERCHES = {
      tower:  { x: 694, y: 258 },
      couch:  { x: 402, y: 256 },
      window: { x: 126, y: 200 },
      floor:  { x: 598, y: 430 }
    };


