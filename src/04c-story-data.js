    /* ═══ Away Stories & Daily Calendar Constants ═══ */
    const AWAY_STORIES = [
      { text: "While you were away, Obi found a squeaky toy under the couch and carried it around for an hour. Luna watched from the windowsill, unimpressed." },
      { text: "Luna knocked something off the shelf. Twice. She looked very pleased with herself." },
      { text: "Obi dreamed about chasing squirrels in the backyard and wagged his tail in his sleep." },
      { text: "Luna discovered the sunbeam moved across the room and followed it all afternoon." },
      { text: "A butterfly landed on the windowsill. Luna stared at it for 47 minutes straight." },
      { text: "Obi and Luna had a staring contest. Luna won. Obviously." },
      { text: "Obi tried to bring you his leash, but you weren't here. He waited by the door for a while." },
      { text: "Luna found the coziest spot on the couch cushion and claimed it as her personal throne." },
      { text: "Obi sniffed every single corner of the living room. Twice. He's very thorough." },
      { text: "Luna practiced her pouncing technique on a dust bunny. 10/10 form." },
      { text: "Obi fell asleep on Luna's favorite spot. Luna sat on Obi. Problem solved." },
      { text: "Luna groomed herself for a solid twenty minutes, then immediately rolled in something." },
      { text: "Obi heard a noise outside and did his best guard dog impression. It was the wind." },
      { text: "Luna climbed to the highest point in the room and surveyed her kingdom with satisfaction." },
      { text: "Obi brought his favorite bone to the couch and fell asleep on it." },
      { text: "Luna batted a pen off the table. Then waited. Then batted another one." },
      { text: "Obi tried to befriend a bird through the window. The bird was not interested." },
      { text: "Luna curled up in a perfect circle and purred herself to sleep." },
      { text: "Obi did three full spins before lying down. It's a very important ritual." },
      { text: "Luna discovered that if she sits on the bookshelf, she can see the whole room. New favorite spot." },
      { text: "Obi's tail knocked over a cup. He looked at it. He looked at you. He looked at it again." },
      { text: "Luna and Obi napped together on the rug. Don't tell Luna — she'd deny it." },
      { text: "Obi found a coin behind the couch cushion!", bonus: { type: "coins", amount: 5 } },
      { text: "A package arrived while you were away! It contained a small gift.", bonus: { type: "coins", amount: 10 } },
      { text: "Luna caught a dust bunny and left it as a present for you. How thoughtful.", bonus: { type: "coins", amount: 3 } },
      { text: "Obi was extra good today. He deserves a treat.", bonus: { type: "joy", pet: "obi", amount: 8 } },
      { text: "Luna purred so loudly the neighbors probably heard. She missed you.", bonus: { type: "joy", pet: "luna", amount: 8 } },
      { text: "The pets found some spare change between the couch cushions!", bonus: { type: "coins", amount: 8 } }
    ];
    const CALENDAR_REWARDS = [
      { day: 1, coins: 10, label: "10 coins" },
      { day: 2, coins: 15, label: "15 coins" },
      { day: 3, coins: 20, label: "20 coins" },
      { day: 4, coins: 0, bondXP: 25, label: "Bond Treat (+25 XP)" },
      { day: 5, coins: 30, label: "30 coins" },
      { day: 6, coins: 40, label: "40 coins" },
      { day: 7, coins: 50, label: "50 coins + Mystery!", mystery: true }
    ];

