(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const overlay = document.querySelector("#overlay");
  const panelKicker = document.querySelector("#panelKicker");
  const panelTitle = document.querySelector("#panelTitle");
  const panelText = document.querySelector("#panelText");
  const characterSelect = document.querySelector("#characterSelect");
  const primaryButton = document.querySelector("#primaryButton");
  const secondaryButton = document.querySelector("#secondaryButton");
  const hud = document.querySelector("#hud");
  const levelLabel = document.querySelector("#levelLabel");
  const bugLabel = document.querySelector("#bugLabel");
  const abilityLabel = document.querySelector("#abilityLabel");
  const lifeLabel = document.querySelector("#lifeLabel");
  const soundButton = document.querySelector("#soundButton");
  const abilityButton = document.querySelector("#abilityButton");
  const tongueButton = document.querySelector("#tongueButton");

  const W = canvas.width;
  const H = canvas.height;
  const keys = Object.create(null);
  let state = "menu";
  let levelIndex = 0;
  let lastTime = 0;
  let lives = 3;
  let collected = 0;
  let tailReady = true;
  let invulnerableUntil = 0;
  let tongueActiveUntil = 0;
  let tongueCooldownUntil = 0;
  let droppedTail = null;
  let toxinActiveUntil = 0;
  let toxinReady = true;
  let air = 100;
  let leapCooldownUntil = 0;
  let constrictCooldownUntil = 0;
  let constrictPulseUntil = 0;
  let selectedCharacter = "crested";
  let soundOn = true;
  let audioContext = null;

  const characters = {
    chameleon: { name: "CHAMELEON", ability: "TONGUE", collectible: "CRICKETS", color: "#79a94d", climbSpeed: 135, swimSpeed: 150, w: 42, h: 25 },
    crested: { name: "CRESTED GECKO", ability: "DROP TAIL", collectible: "ROACHES", color: "#d29458", climbSpeed: 195, swimSpeed: 160, w: 42, h: 25 },
    newt: { name: "FIRE-BELLY NEWT", ability: "TOXIN", collectible: "WORMS", color: "#252a28", climbSpeed: 130, swimSpeed: 235, w: 46, h: 23 },
    frog: { name: "AZUREUS DART FROG", ability: "POWER LEAP", collectible: "FRUIT FLIES", color: "#2679cb", climbSpeed: 120, swimSpeed: 155, w: 38, h: 27 },
    boa: { name: "BLACK COLOMBIAN BOA", ability: "CONSTRICT", collectible: "RATS", color: "#030405", climbSpeed: 155, swimSpeed: 190, w: 94, h: 36 }
  };

  const player = {
    x: 0, y: 0, w: 38, h: 24,
    vx: 0, vy: 0, facing: 1,
    grounded: false, climbing: false,
    spawnX: 0, spawnY: 0
  };

  const levels = [
    {
      label: "LEVEL 1 · EASY",
      title: "The Enclosure",
      intro: "The door is open. Cross the branches, climb the glass, and make your first terrible decision.",
      completeTitle: "The room is larger than expected.",
      completeText: "Freedom contains shelves, suspicious noises, and absolutely no climate control.",
      palette: ["#07150f", "#123120", "#6f4d2c", "#a9f576"],
      start: [66, 445], exit: [870, 410, 48, 90],
      platforms: [[0,500,960,40],[45,458,190,22],[262,404,190,20],[500,342,185,20],[712,270,190,20],[790,154,150,20]],
      vines: [[215,328,20,135],[456,273,20,135],[680,204,20,140]],
      insects: [[330,370],[570,308],[840,230]],
      hazards: [{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}],
      decor: "enclosure"
    },
    {
      label: "LEVEL 2 · MEDIUM",
      title: "The Kitchen",
      intro: "Cross the counters and open shelves. Avoid the cat, the Dalmatian, and the armed mousetrap on the floor.",
      completeTitle: "You have breached containment.",
      completeText: "The house stretches before you. Somewhere in the dark, a refrigerator hums like destiny.",
      palette: ["#0c1117", "#1d2830", "#754f31", "#f0cc62"],
      start: [45, 445], exit: [876,88,50,82],
      platforms: [[0,500,960,40],[28,442,235,20],[340,390,205,20],[615,327,285,20],[280,262,170,18],[55,196,180,18],[530,155,180,18],[815,174,125,18]],
      vines: [[258,317,18,130],[545,270,18,123],[705,95,18,235]],
      insects: [[420,355],[120,161],[620,120]],
      hazards: [
        {x:650,y:303,w:66,h:24,type:"cat",axis:"x",min:620,max:820,speed:105},
        {x:286,y:468,w:76,h:32,type:"mouseTrap",axis:"none"},
        {x:125,y:152,w:88,h:44,type:"dalmatian",axis:"x",min:60,max:165,speed:78}
      ],
      decor: "kitchen"
    },
    {
      label: "LEVEL 3 · HARD",
      title: "The House",
      intro: "Cross the living room. A human foot patrols the floor. The Roomba and French bulldog have joined the hunt.",
      completeTitle: "Behind the refrigerator.",
      completeText: "Warm. Dusty. Almost freedom. Then the filter hose gives way and the floor disappears beneath a wall of water.",
      palette: ["#111018", "#292239", "#795b44", "#ef8c73"],
      start: [38, 445], exit: [878,392,64,108],
      platforms: [[0,500,960,40],[26,434,165,20],[230,372,150,18],[420,318,132,18],[602,268,140,18],[790,212,150,18],[690,392,105,18],[520,445,94,18]],
      vines: [[190,326,18,112],[380,265,18,110],[742,205,18,190]],
      insects: [[290,337],[665,233],[850,177]],
      hazards: [
        {x:238,y:460,w:96,h:40,type:"slipper",axis:"x",min:210,max:490,speed:145},
        {x:550,y:413,w:72,h:32,type:"roomba",axis:"x",min:510,max:680,speed:118},
        {x:645,y:464,w:78,h:36,type:"frenchie",axis:"x",min:610,max:760,speed:92},
        {x:800,y:474,w:56,h:26,type:"lego",axis:"none"}
      ],
      decor: "house"
    },
    {
      label: "LEVEL 4 · UNDERWATER",
      title: "The Aquarium",
      intro: "The final route is underwater. Reptiles need air bubbles. The newt has been waiting its entire moist little life for this.",
      completeTitle: "Out through the filter.",
      completeText: "Cold. Wet. Free. You have escaped four separate containment failures and learned absolutely nothing.",
      palette: ["#031729", "#075169", "#456b52", "#62e8dc"],
      start: [35,440], exit: [875,62,58,92],
      platforms: [[0,500,960,40],[70,430,170,18],[315,350,170,18],[555,430,130,18],[700,278,190,18],[410,200,150,18],[72,145,190,18]],
      vines: [[245,310,16,190],[505,220,16,210],[760,120,16,160]],
      insects: [[180,390],[475,305],[810,235]],
      airPockets: [[285,260,24],[635,175,24]],
      hazards: [
        {x:270,y:392,w:86,h:34,type:"fish",axis:"x",min:245,max:500,speed:112},
        {x:620,y:238,w:92,h:38,type:"fish",axis:"x",min:560,max:800,speed:145},
        {x:805,y:457,w:70,h:43,type:"filter",axis:"none"}
      ],
      decor: "underwater",
      underwater: true
    }
  ];

  const habitatConfigs = {
    chameleon: {
      title:"The Screen Enclosure",habitat:"chameleon",palette:["#08150c","#17351d","#6b4a2b","#8bd85c"],
      intro:"The screen door is loose. Cross the ficus branches and leave before anyone notices the suspiciously empty vine.",
      start:[70,420],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[42,452,190,20],[275,392,175,20],[510,330,190,20],[735,264,180,20],[570,180,165,18]],
      vines:[[225,315,18,140],[465,255,18,140],[720,190,18,145]],insects:[[330,355],[590,292],[810,225]],
      hazards:[{x:430,y:430,w:92,h:70,type:"grab",axis:"x",min:340,max:620,speed:82}]
    },
    crested: {
      title:"The Arboreal Terrarium",habitat:"crested",palette:["#07150f","#123120","#6f4d2c","#a9f576"],
      intro:"The glass door is open. Cross the cork and branches, then make your first terrible decision.",
      start:[55,433],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[45,458,190,22],[262,404,190,20],[500,342,185,20],[712,270,190,20],[790,154,150,20]],
      vines:[[215,328,20,135],[456,273,20,135],[680,204,20,140]],insects:[[330,370],[570,308],[840,230]],
      hazards:[{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}]
    },
    newt: {
      title:"The Paludarium",habitat:"newt",palette:["#07151a","#153b3d","#536b50","#65d6c4"],
      intro:"The lid has shifted above the shoreline. Climb from water to stone and investigate this administrative failure.",
      start:[112,445],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[55,458,220,22],[310,422,150,18],[490,372,170,18],[690,320,180,18],[760,232,150,18]],
      vines:[[280,345,18,118],[650,260,18,130],[845,165,18,155]],insects:[[350,390],[560,338],[800,285]],
      hazards:[{x:465,y:430,w:92,h:70,type:"grab",axis:"x",min:380,max:640,speed:76}]
    },
    frog: {
      title:"The Planted Vivarium",habitat:"frog",palette:["#061810","#164528","#67502d","#74df79"],
      intro:"A bromeliad has reached the door. Leap through the leaves before the human arrives with entirely too much concern.",
      start:[170,430],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[75,455,175,20],[285,405,145,18],[465,350,150,18],[650,295,160,18],[780,215,145,18]],
      vines:[[250,320,18,140],[610,245,18,120],[760,155,18,145]],insects:[[330,370],[535,315],[825,180]],
      hazards:[{x:450,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:84}]
    },
    boa: {
      title:"The Boa Enclosure",habitat:"boa",palette:["#0b100d","#242a20","#62472d","#a0b37b"],
      intro:"The sliding door is open. Follow the heavy logs toward freedom, dignity, and several poorly secured feeder rats.",
      start:[38,430],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[35,454,245,26],[315,410,210,25],[560,360,220,25],[760,292,170,24],[600,212,175,22]],
      vines:[[285,325,22,130],[535,285,22,125],[800,215,22,110]],insects:[[365,373],[640,322],[835,255]],
      hazards:[{x:455,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:70}]
    }
  };

  function applyCharacterHabitat() {
    const habitat = habitatConfigs[selectedCharacter];
    Object.assign(levels[0], JSON.parse(JSON.stringify(habitat)), {label:"LEVEL 1 · EASY",decor:"enclosure",completeTitle:"The room is larger than expected.",completeText:"Freedom contains shelves, suspicious noises, and absolutely no climate control."});
  }

  function tone(frequency, duration = 0.08, type = "sine") {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Sound is optional. Death is not. */ }
  }

  function showPanel(kicker, title, text, buttonText, action, allowSelect = false) {
    panelKicker.textContent = kicker;
    panelTitle.textContent = title;
    panelText.textContent = text;
    primaryButton.textContent = buttonText;
    primaryButton.onclick = action;
    primaryButton.classList.remove("hidden");
    characterSelect.classList.add("hidden");
    secondaryButton.classList.toggle("hidden", !allowSelect);
    overlay.classList.remove("hidden");
    hud.classList.add("hidden");
    primaryButton.focus();
  }

  function showMenu() {
    state = "menu";
    showPanel("STORY MODE", "The enclosure door is open.", "This is almost certainly a trap. Choose the small criminal responsible.", "CHOOSE CHARACTER", showCharacterSelect);
  }

  function showCharacterSelect() {
    state = "character-select";
    panelKicker.textContent = "CHOOSE YOUR ESCAPE ARTIST";
    panelTitle.textContent = "Five animals. Five bad decisions.";
    panelText.textContent = "Each character has a different ability. Your choice lasts for all four levels.";
    primaryButton.classList.add("hidden");
    secondaryButton.classList.add("hidden");
    characterSelect.classList.remove("hidden");
    characterSelect.querySelector("button")?.focus();
  }

  function showIntro(index) {
    levelIndex = index;
    const level = levels[index];
    state = "intro";
    showPanel(level.label, level.title, level.intro, index === 0 ? "START LEVEL" : "CONTINUE", () => startLevel(index));
  }

  function startLevel(index) {
    levelIndex = index;
    const level = levels[index];
    player.w = characters[selectedCharacter].w;
    player.h = characters[selectedCharacter].h;
    level.insects.forEach(insect => insect[2] = false);
    level.hazards.forEach((hazard, i) => { hazard.dir = i % 2 ? -1 : 1; hazard.stunnedUntil = 0; });
    lives = 3;
    collected = 0;
    tailReady = true;
    toxinReady = true;
    toxinActiveUntil = 0;
    air = 100;
    leapCooldownUntil = 0;
    constrictCooldownUntil = 0;
    constrictPulseUntil = 0;
    tongueActiveUntil = 0;
    tongueCooldownUntil = 0;
    droppedTail = null;
    player.spawnX = level.start[0];
    player.spawnY = level.start[1];
    resetPlayer(false);
    levelLabel.textContent = level.label;
    updateHud();
    overlay.classList.add("hidden");
    hud.classList.remove("hidden");
    state = "playing";
    canvas.focus();
    tone(330, .08, "triangle");
  }

  function resetPlayer(loseLife = true) {
    if (loseLife) lives -= 1;
    if (lives <= 0) {
      state = "dead";
      showPanel("ESCAPE FAILED", "Returned to your enclosure.", "Humiliating. The human has also added another clip to the door.", "TRY AGAIN", () => startLevel(levelIndex), true);
      return;
    }
    player.x = player.spawnX;
    player.y = player.spawnY;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    air = 100;
    invulnerableUntil = performance.now() + 1100;
    updateHud();
  }

  function updateHud() {
    const character = characters[selectedCharacter];
    bugLabel.textContent = `${character.collectible} ${collected}/3`;
    if (levels[levelIndex]?.underwater && selectedCharacter !== "newt") {
      abilityLabel.textContent = `AIR ${Math.max(0, Math.ceil(air))}% · ${character.ability}`;
    } else if (selectedCharacter === "crested") {
      abilityLabel.textContent = `TAIL ${tailReady ? "READY" : "GONE"}`;
    } else if (selectedCharacter === "newt") {
      abilityLabel.textContent = `TOXIN ${toxinReady ? "READY" : "USED"}`;
    } else if (selectedCharacter === "frog") {
      abilityLabel.textContent = performance.now() >= leapCooldownUntil ? "POWER LEAP READY" : "LEAP RECHARGING";
    } else if (selectedCharacter === "boa") {
      abilityLabel.textContent = performance.now() >= constrictCooldownUntil ? "CONSTRICT READY" : "CONSTRICT RECHARGING";
    } else {
      abilityLabel.textContent = "TONGUE READY";
    }
    abilityButton.textContent = character.ability;
    abilityButton.setAttribute("aria-label", `Use ${character.ability.toLowerCase()} ability`);
    tongueButton.classList.toggle("hidden", selectedCharacter !== "frog");
    lifeLabel.textContent = "♥ ".repeat(Math.max(0, lives)).trim();
  }

  function dropTail() {
    if (state !== "playing" || selectedCharacter !== "crested" || !tailReady) return;
    droppedTail = {
      x: player.x + player.w / 2 - player.facing * 24,
      y: player.y + player.h / 2 + 3,
      facing: player.facing,
      droppedAt: performance.now()
    };
    tailReady = false;
    invulnerableUntil = performance.now() + 2400;
    player.vx = -player.facing * 190;
    player.vy = -180;
    updateHud();
    tone(115, .22, "sawtooth");
  }

  function useTongue() {
    const now = performance.now();
    if (state !== "playing" || !["chameleon","frog"].includes(selectedCharacter) || now < tongueCooldownUntil) return;
    tongueActiveUntil = now + 230;
    tongueCooldownUntil = now + 520;
    tone(610, .045, "sine");
  }

  function tongueHitbox(now) {
    if (!["chameleon","frog"].includes(selectedCharacter) || now >= tongueActiveUntil) return null;
    const reach = 112;
    return {
      x: player.facing > 0 ? player.x + player.w - 3 : player.x - reach + 3,
      y: player.y + 5,
      w: reach,
      h: 20
    };
  }

  function useToxin() {
    const now = performance.now();
    if (state !== "playing" || selectedCharacter !== "newt" || !toxinReady) return;
    toxinReady = false;
    toxinActiveUntil = now + 2600;
    updateHud();
    tone(155, .18, "sawtooth");
  }

  function usePowerLeap() {
    const now = performance.now();
    if (state !== "playing" || selectedCharacter !== "frog" || now < leapCooldownUntil) return;
    leapCooldownUntil = now + 950;
    player.vy = levels[levelIndex].underwater ? -characters.frog.swimSpeed * 1.55 : -620;
    player.vx += player.facing * 170;
    player.grounded = false;
    updateHud();
    tone(360, .1, "triangle");
  }

  function useConstrict() {
    const now = performance.now();
    if (state !== "playing" || selectedCharacter !== "boa" || now < constrictCooldownUntil) return;
    const level = levels[levelIndex];
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    let target = null;
    let nearest = 155;
    for (const hazard of level.hazards) {
      if (hazard.axis !== "x") continue;
      const distance = Math.hypot(px - (hazard.x + hazard.w / 2), py - (hazard.y + hazard.h / 2));
      if (distance < nearest) { nearest = distance; target = hazard; }
    }
    constrictPulseUntil = now + 360;
    if (!target) { tone(92, .08, "square"); return; }
    target.stunnedUntil = now + 3500;
    constrictCooldownUntil = now + 4600;
    updateHud();
    tone(105, .22, "sawtooth");
  }

  function useAbility() {
    if (selectedCharacter === "chameleon") useTongue();
    else if (selectedCharacter === "crested") dropTail();
    else if (selectedCharacter === "newt") useToxin();
    else if (selectedCharacter === "frog") usePowerLeap();
    else useConstrict();
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function completeLevel() {
    state = "complete";
    tone(523, .1, "triangle");
    setTimeout(() => tone(659, .13, "triangle"), 100);
    const level = levels[levelIndex];
    if (levelIndex < levels.length - 1) {
      showPanel("ESCAPE SUCCESSFUL", level.completeTitle, level.completeText, "NEXT LEVEL", () => showIntro(levelIndex + 1));
    } else {
      showPanel("STORY COMPLETE", level.completeTitle, level.completeText, "ESCAPE AGAIN", showMenu);
    }
  }

  function update(dt, now) {
    if (state !== "playing") return;
    const level = levels[levelIndex];
    const character = characters[selectedCharacter];
    const left = keys.ArrowLeft || keys.KeyA || keys.touchLeft;
    const right = keys.ArrowRight || keys.KeyD || keys.touchRight;
    const up = keys.ArrowUp || keys.KeyW || keys.touchJump;
    const down = keys.ArrowDown || keys.KeyS;
    const speed = level.underwater ? character.swimSpeed : levelIndex === 2 ? 236 : 220;
    if (selectedCharacter === "frog" || selectedCharacter === "boa") updateHud();

    const acceleration = level.underwater ? 720 : 1450;
    if (left) { player.vx -= acceleration * dt; player.facing = -1; }
    if (right) { player.vx += acceleration * dt; player.facing = 1; }
    if (!left && !right) player.vx *= Math.pow(level.underwater ? .025 : .0007, dt);
    player.vx = Math.max(-speed, Math.min(speed, player.vx));

    if (level.underwater) {
      player.climbing = false;
      if (up) player.vy -= 680 * dt;
      if (down) player.vy += 680 * dt;
      if (!up && !down) player.vy *= Math.pow(.018, dt);
      player.vy = Math.max(-speed, Math.min(speed, player.vy));

      if (selectedCharacter !== "newt") {
        air -= dt * 7.5;
        for (const pocket of level.airPockets || []) {
          const bubble = {x:pocket[0]-pocket[2],y:pocket[1]-pocket[2],w:pocket[2]*2,h:pocket[2]*2};
          if (intersects(player, bubble)) air = Math.min(100, air + dt * 75);
        }
        if (air <= 0) {
          tone(70, .3, "square");
          resetPlayer();
          return;
        }
      }
      updateHud();
    } else {
      const onVine = level.vines.some(v => intersects(player, {x:v[0], y:v[1], w:v[2], h:v[3]}));
      const onWall = player.x <= 5 || player.x + player.w >= W - 5;
      player.climbing = (onVine || onWall) && (up || down);
      if (player.climbing) {
        player.vy = up ? -character.climbSpeed : down ? character.climbSpeed : 0;
      } else {
        player.vy += 820 * dt;
        player.vy = Math.min(player.vy, 570);
      }
    }

    const oldY = player.y;
    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(W - player.w, player.x));
    player.y += player.vy * dt;
    if (level.underwater) player.y = Math.max(48, Math.min(H - player.h, player.y));
    player.grounded = false;

    for (const p of level.platforms) {
      const platform = {x:p[0], y:p[1], w:p[2], h:p[3]};
      if (!level.underwater && player.vy >= 0 && oldY + player.h <= platform.y + 4 && intersects(player, platform)) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }

    if (player.y > H + 80) {
      tone(90, .25, "square");
      resetPlayer();
      return;
    }

    for (const hazard of level.hazards) {
      if (hazard.axis === "x" && now >= (hazard.stunnedUntil || 0)) {
        hazard.x += hazard.speed * hazard.dir * dt;
        if (hazard.x < hazard.min || hazard.x > hazard.max) {
          hazard.x = Math.max(hazard.min, Math.min(hazard.max, hazard.x));
          hazard.dir *= -1;
        }
      }
      if (now > invulnerableUntil && intersects(player, hazard)) {
        if (selectedCharacter === "newt" && now < toxinActiveUntil) {
          toxinActiveUntil = 0;
          invulnerableUntil = now + 900;
          hazard.dir *= -1;
          tone(120, .18, "sawtooth");
        } else {
          tone(86, .2, "square");
          resetPlayer();
          return;
        }
      }
    }

    level.insects.forEach(insect => {
      if (!insect[2]) {
        const bug = {x:insect[0]-10,y:insect[1]-10,w:20,h:20};
        const tongue = tongueHitbox(now);
        if (intersects(player, bug) || (tongue && intersects(tongue, bug))) {
          insect[2] = true;
          collected += 1;
          updateHud();
          tone(720 + collected * 90, .07, "sine");
        }
      }
    });

    const exit = {x:level.exit[0], y:level.exit[1], w:level.exit[2], h:level.exit[3]};
    if (intersects(player, exit)) completeLevel();
  }

  function jump() {
    if (state !== "playing") return;
    if (levels[levelIndex].underwater) {
      player.vy = -characters[selectedCharacter].swimSpeed;
      tone(210, .05, "sine");
      return;
    }
    if (player.grounded || player.climbing) {
      player.vy = selectedCharacter === "frog" ? -535 : -455;
      player.grounded = false;
      tone(245, .05, "triangle");
    }
  }

  function roundedRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
  }

  function drawBackdrop(level) {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, level.palette[0]);
    gradient.addColorStop(1, level.palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = .13;
    ctx.strokeStyle = level.palette[3];
    ctx.lineWidth = 1;
    for (let x = 20; x < W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 20; y < H; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (level.decor === "enclosure") {
      ctx.fillStyle = "rgba(110,160,130,.07)";
      ctx.fillRect(18, 45, 924, 455);
      ctx.strokeStyle = "rgba(210,255,230,.15)";
      ctx.lineWidth = 5; ctx.strokeRect(18, 45, 924, 455);
      drawEnclosureTrees();
      drawHabitatDetails(level);
      drawLeaves(48, 220, "#245f36");drawLeaves(665,180,"#1d4e2e");drawLeaves(720,400,"#245f36");
    } else if (level.decor === "kitchen") {
      ctx.fillStyle="#20272b";ctx.fillRect(0,70,W,430);
      for(let y=86;y<322;y+=36){for(let x=(y/36)%2?0:36;x<W;x+=72){ctx.fillStyle="rgba(240,232,205,.055)";ctx.fillRect(x,y,35,35);}}
      ctx.fillStyle="#171d20";ctx.fillRect(0,344,W,156);
      ctx.fillStyle="#695541";ctx.fillRect(0,326,W,22);
      ctx.fillStyle="#b69a76";ctx.fillRect(0,326,W,5);
      ctx.strokeStyle="rgba(240,204,98,.16)";ctx.lineWidth=3;
      for(let x=15;x<760;x+=150){ctx.strokeRect(x,360,130,130);ctx.beginPath();ctx.arc(x+112,422,3,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle="#11171a";ctx.fillRect(360,344,150,156);ctx.strokeStyle="#778087";ctx.strokeRect(375,374,120,105);
      ctx.fillStyle="#2c3337";for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(385+i*34,337,10,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#90979a";ctx.fillRect(120,322,150,7);ctx.fillStyle="#0b1215";ctx.beginPath();ctx.ellipse(195,326,52,13,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#9ca4a5";ctx.lineWidth=5;ctx.beginPath();ctx.arc(195,307,18,Math.PI,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#22282b";ctx.fillRect(775,68,185,432);ctx.strokeStyle="#92999d";ctx.lineWidth=4;ctx.strokeRect(779,72,177,424);ctx.beginPath();ctx.moveTo(779,235);ctx.lineTo(956,235);ctx.stroke();
      ctx.fillStyle="#aeb5b6";ctx.fillRect(802,116,5,85);ctx.fillRect(802,270,5,115);
      ctx.fillStyle="rgba(240,240,220,.08)";ctx.fillRect(40,95,210,112);ctx.fillRect(530,90,190,118);
      ctx.strokeStyle="rgba(240,204,98,.18)";ctx.strokeRect(40,95,210,112);ctx.strokeRect(530,90,190,118);
    } else if (level.decor === "house") {
      ctx.fillStyle = "rgba(255,210,185,.04)"; ctx.fillRect(0, 70, W, 430);
      ctx.fillStyle = "#171820"; ctx.fillRect(760, 70, 200, 430);
      ctx.strokeStyle = "rgba(239,140,115,.18)"; ctx.lineWidth = 4; ctx.strokeRect(760, 70, 200, 430);
      ctx.fillStyle = "rgba(245,245,230,.1)"; ctx.fillRect(895, 100, 8, 265);
      ctx.fillStyle = "rgba(80,60,50,.3)"; ctx.fillRect(70, 360, 290, 140);
    } else if (level.decor === "underwater") {
      const water = ctx.createLinearGradient(0,55,0,H);
      water.addColorStop(0,"rgba(51,194,211,.18)");water.addColorStop(1,"rgba(0,35,58,.76)");
      ctx.fillStyle=water;ctx.fillRect(0,55,W,H-55);
      ctx.strokeStyle="rgba(166,247,238,.22)";ctx.lineWidth=4;
      for(let x=30;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,75);ctx.quadraticCurveTo(x+50,95,x+100,75);ctx.stroke();}
      ctx.fillStyle="#253e3b";ctx.fillRect(0,500,W,40);
      for(let x=10;x<W;x+=24){ctx.fillStyle=x%48===10?"#6d806c":"#465e58";ctx.beginPath();ctx.arc(x,505+(x%3)*5,8,Math.PI,Math.PI*2);ctx.fill();}
    }
  }

  function drawLeaves(x, y, color) {
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(x + i * 24, y - (i % 3) * 28);
      ctx.rotate((i - 3) * .22);
      const length = 27 + (i % 2) * 5;
      const width = 10 + (i % 3);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-length, 0);
      ctx.bezierCurveTo(-length * .48, -width * 1.25, length * .52, -width, length, 0);
      ctx.bezierCurveTo(length * .46, width, -length * .52, width * 1.18, -length, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(177,220,153,.32)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();ctx.moveTo(-length * .72,0);ctx.lineTo(length * .72,0);ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnclosureTrees() {
    ctx.save();ctx.globalAlpha=.2;ctx.lineCap="round";
    for(const [x,bend,height] of [[70,-18,390],[235,22,330],[430,-26,420],[650,18,350],[845,-16,410]]){
      ctx.strokeStyle="#26342b";ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(x,500);ctx.bezierCurveTo(x+bend,390,x-bend,250,x+bend*.4,500-height);ctx.stroke();
      ctx.strokeStyle="#526453";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-3,490);ctx.bezierCurveTo(x+bend-4,385,x-bend-4,255,x+bend*.4-3,510-height);ctx.stroke();
      ctx.strokeStyle="#2c3a30";ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(x,260);ctx.quadraticCurveTo(x+55,225,x+105,242);ctx.moveTo(x,330);ctx.quadraticCurveTo(x-50,300,x-92,315);ctx.stroke();
    }
    ctx.restore();
  }

  function drawHabitatDetails(level) {
    ctx.save();ctx.globalAlpha=.7;
    if(level.habitat==="chameleon"){
      ctx.strokeStyle="rgba(150,190,150,.18)";ctx.lineWidth=1;for(let x=28;x<940;x+=18){ctx.beginPath();ctx.moveTo(x,50);ctx.lineTo(x,498);ctx.stroke();}
      ctx.fillStyle="#443326";ctx.fillRect(72,414,76,65);drawLeaves(58,380,"#315b35");
    }else if(level.habitat==="crested"){
      ctx.fillStyle="#583b24";roundedRect(700,95,105,315,18);ctx.fill();ctx.strokeStyle="#936b43";ctx.lineWidth=4;for(let y=120;y<390;y+=36){ctx.beginPath();ctx.moveTo(710,y);ctx.lineTo(790,y-11);ctx.stroke();}
    }else if(level.habitat==="newt"){
      ctx.fillStyle="rgba(45,145,155,.28)";ctx.fillRect(20,410,430,86);ctx.strokeStyle="#62d7d0";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(20,410);ctx.quadraticCurveTo(120,400,220,410);ctx.quadraticCurveTo(330,420,450,410);ctx.stroke();
      ctx.fillStyle="#52635c";for(const [x,y,r] of [[490,450,34],[555,465,24],[620,444,38]]){ctx.beginPath();ctx.arc(x,y,r,Math.PI,Math.PI*2);ctx.fill();}
    }else if(level.habitat==="frog"){
      ctx.fillStyle="#4d3924";ctx.fillRect(20,458,920,38);for(let x=30;x<930;x+=34){ctx.fillStyle=x%68?"#765133":"#3b592f";ctx.beginPath();ctx.ellipse(x,462,28,8,-.25,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#27643b";for(const x of [130,520,820]){for(let i=0;i<6;i++){ctx.save();ctx.translate(x,405);ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.ellipse(0,-25,9,30,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
    }else if(level.habitat==="boa"){
      ctx.fillStyle="#29231b";roundedRect(695,390,175,106,22);ctx.fill();ctx.fillStyle="#090a08";ctx.beginPath();ctx.arc(780,456,42,Math.PI,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#4d3421";ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(90,438);ctx.quadraticCurveTo(290,365,470,430);ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlatforms(level) {
    for (const p of level.platforms) {
      if(level.decor==="enclosure"&&p[1]<490){
        const y=p[1]+p[3]/2;
        ctx.strokeStyle="#51351f";ctx.lineWidth=p[3];ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(p[0]+5,y);ctx.quadraticCurveTo(p[0]+p[2]*.48,y-7,p[0]+p[2]-5,y+2);ctx.stroke();
        ctx.strokeStyle=level.palette[3];ctx.globalAlpha=.9;ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(p[0]+10,y-4);ctx.quadraticCurveTo(p[0]+p[2]*.5,y-9,p[0]+p[2]-12,y-2);ctx.stroke();
        ctx.globalAlpha=1;
        ctx.strokeStyle="#624125";ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(p[0]+p[2]*.3,y-5);ctx.lineTo(p[0]+p[2]*.2,y-22);ctx.moveTo(p[0]+p[2]*.72,y);ctx.lineTo(p[0]+p[2]*.82,y-17);ctx.stroke();
      }else{
        ctx.fillStyle = p[1] >= 490 ? "#111914" : level.palette[2];
        roundedRect(p[0], p[1], p[2], p[3], 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(p[0] + 7, p[1] + 3, Math.max(0, p[2] - 14), 2);
      }
    }
    for (const v of level.vines) {
      ctx.strokeStyle = level.palette[3];
      ctx.globalAlpha = .52;
      ctx.lineWidth = v[2];
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(v[0] + v[2]/2, v[1]);
      ctx.bezierCurveTo(v[0]-12, v[1]+v[3]*.35, v[0]+26, v[1]+v[3]*.68, v[0]+v[2]/2, v[1]+v[3]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawExit(level) {
    const [x,y,w,h] = level.exit;
    const glow = ctx.createRadialGradient(x+w/2,y+h/2,2,x+w/2,y+h/2,70);
    glow.addColorStop(0, level.palette[3] + "88"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(x-50,y-45,w+100,h+90);
    ctx.fillStyle = "#020604"; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = level.palette[3]; ctx.lineWidth = 3; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle = level.palette[3];
    const exitLabel = levelIndex === 2 ? "FRIDGE" : level.underwater ? "FILTER OUT" : "EXIT";
    ctx.font = "900 12px system-ui"; ctx.textAlign = "center"; ctx.fillText(exitLabel, x+w/2, y-10);
    ctx.font = "900 24px system-ui";
    ctx.fillText("↓", x+w/2, y-28);
  }

  function drawInsects(level, time) {
    level.insects.forEach((bug, i) => {
      if (bug[2]) return;
      const bob = Math.sin(time * .004 + i * 2) * 4;
      ctx.save(); ctx.translate(bug[0], bug[1] + bob);
      if(selectedCharacter==="boa"){
        ctx.strokeStyle="#b99384";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,5);ctx.bezierCurveTo(-21,9,-25,1,-31,4);ctx.stroke();
        ctx.fillStyle="#91817b";ctx.beginPath();ctx.ellipse(0,2,12,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(10,0,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#c7aaa0";ctx.beginPath();ctx.arc(9,-6,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#151515";ctx.beginPath();ctx.arc(13,-1,1.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#d8a2a2";ctx.beginPath();ctx.arc(17,2,2,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#d8d0c8";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(15,3);ctx.lineTo(25,0);ctx.moveTo(15,4);ctx.lineTo(25,7);ctx.stroke();
      }else if(selectedCharacter==="newt"){
        ctx.strokeStyle="#b97968";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-14,6);ctx.bezierCurveTo(-7,-8,4,12,15,-4);ctx.stroke();
        ctx.strokeStyle="#e0a08b";ctx.lineWidth=1.2;for(let x=-9;x<12;x+=6){ctx.beginPath();ctx.moveTo(x,-1);ctx.lineTo(x+2,5);ctx.stroke();}
      }else if(selectedCharacter==="frog"){
        ctx.fillStyle="rgba(220,235,245,.55)";ctx.beginPath();ctx.ellipse(-5,-2,7,4,-.4,0,Math.PI*2);ctx.ellipse(5,-2,7,4,.4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#181513";ctx.beginPath();ctx.ellipse(0,2,3,7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,-5,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#9d3030";ctx.beginPath();ctx.arc(-1,-6,1,0,Math.PI*2);ctx.arc(2,-6,1,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#6d6259";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,3);ctx.lineTo(-8,8);ctx.moveTo(2,3);ctx.lineTo(8,8);ctx.stroke();
      }else if(selectedCharacter==="crested"){
        ctx.strokeStyle="#bb8b54";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(-13,-8);ctx.moveTo(5,-2);ctx.lineTo(13,-8);ctx.moveTo(-5,3);ctx.lineTo(-13,9);ctx.moveTo(5,3);ctx.lineTo(13,9);ctx.stroke();
        ctx.fillStyle="#5b351d";ctx.beginPath();ctx.ellipse(0,1,8,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#9a6c3d";ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(6,-2);ctx.moveTo(-7,3);ctx.lineTo(7,3);ctx.stroke();
        ctx.fillStyle="#29170d";ctx.beginPath();ctx.ellipse(0,-9,6,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#c09a6b";ctx.beginPath();ctx.moveTo(-2,-12);ctx.lineTo(-10,-19);ctx.moveTo(2,-12);ctx.lineTo(10,-19);ctx.stroke();
      }else{
        ctx.strokeStyle="#b99461";ctx.lineWidth=1.6;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(-4,2);ctx.lineTo(-12,10);ctx.lineTo(-16,7);ctx.moveTo(4,2);ctx.lineTo(12,10);ctx.lineTo(16,7);ctx.moveTo(-4,-1);ctx.lineTo(-10,-6);ctx.moveTo(4,-1);ctx.lineTo(10,-6);ctx.stroke();
        ctx.fillStyle="#5a3b20";ctx.beginPath();ctx.ellipse(0,2,6,10,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#8d653b";ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.moveTo(-5,4);ctx.lineTo(5,4);ctx.stroke();
        ctx.fillStyle="#2b1b10";ctx.beginPath();ctx.arc(0,-8,5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#d1ad75";ctx.beginPath();ctx.moveTo(-2,-11);ctx.quadraticCurveTo(-7,-18,-12,-19);ctx.moveTo(2,-11);ctx.quadraticCurveTo(7,-18,12,-19);ctx.stroke();
        ctx.fillStyle="#d9ba77";ctx.beginPath();ctx.arc(-2,-9,1,0,Math.PI*2);ctx.arc(2,-9,1,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawAirPockets(level, time) {
    if (!level.underwater) return;
    for (const [x,y,r] of level.airPockets || []) {
      ctx.strokeStyle="rgba(203,252,255,.85)";ctx.fillStyle="rgba(185,245,255,.11)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y,r+Math.sin(time*.004+x)*2,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x-13+i*13,y+r+12+(i%2)*8,3+i,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle="#d9ffff";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText("AIR",x,y+3);
    }
  }

  function drawHazard(h, now = 0) {
    ctx.save();
    ctx.translate(h.x, h.y);
    if (now < (h.stunnedUntil || 0)) ctx.globalAlpha = .48;
    if (h.type === "cat") {
      ctx.fillStyle="#151416";roundedRect(0,4,h.w,h.h-4,9);ctx.fill();
      ctx.beginPath();ctx.moveTo(8,7);ctx.lineTo(13,-4);ctx.lineTo(20,7);ctx.moveTo(24,7);ctx.lineTo(32,-4);ctx.lineTo(39,8);ctx.fill();
      ctx.fillStyle="#d8f56d";ctx.fillRect(13,10,4,3);ctx.fillRect(22,10,4,3);
      ctx.strokeStyle="#151416";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(h.w-4,12);ctx.quadraticCurveTo(h.w+18,-2,h.w+12,-15);ctx.stroke();
    } else if (h.type === "dalmatian") {
      ctx.fillStyle="#f5f3e8";roundedRect(29,10,h.w-35,h.h-18,12);ctx.fill();
      ctx.strokeStyle="#f5f3e8";ctx.lineWidth=6;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(h.w-11,14);ctx.quadraticCurveTo(h.w+7,4,h.w+2,-6);ctx.stroke();
      ctx.fillStyle="#f5f3e8";ctx.beginPath();ctx.arc(20,18,16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#111318";ctx.beginPath();ctx.ellipse(24,8,7,12,.45,0,Math.PI*2);ctx.fill();
      [[39,16,5],[56,12,4],[70,23,5],[33,27,3]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();});
      ctx.fillRect(38,h.h-13,7,13);ctx.fillRect(h.w-23,h.h-13,7,13);
      ctx.fillStyle="#eee6da";ctx.beginPath();ctx.ellipse(7,25,15,9,-.08,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#b9a99e";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(7,25,15,9,-.08,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#090a0b";ctx.beginPath();ctx.ellipse(-4,22,6,5,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#403735";ctx.beginPath();ctx.moveTo(1,29);ctx.quadraticCurveTo(9,34,17,28);ctx.stroke();
      ctx.fillStyle="#8df4d7";ctx.beginPath();ctx.arc(15,16,2.4,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#c84d4d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,11);ctx.lineTo(30,32);ctx.stroke();
    } else if (h.type === "frenchie") {
      ctx.fillStyle="#111315";roundedRect(23,12,h.w-29,h.h-13,11);ctx.fill();roundedRect(6,10,29,24,9);ctx.fill();
      ctx.beginPath();ctx.moveTo(9,13);ctx.quadraticCurveTo(7,1,13,0);ctx.quadraticCurveTo(19,1,20,13);ctx.moveTo(22,13);ctx.quadraticCurveTo(23,1,29,1);ctx.quadraticCurveTo(35,3,32,15);ctx.fill();
      ctx.fillStyle="#9b5d30";ctx.beginPath();ctx.ellipse(6,25,11,7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(12,16,4,2.5,0,0,Math.PI*2);ctx.ellipse(26,16,4,2.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillRect(30,h.h-10,7,10);ctx.fillRect(h.w-21,h.h-10,7,10);ctx.beginPath();ctx.moveTo(39,20);ctx.lineTo(48,35);ctx.lineTo(57,35);ctx.lineTo(50,20);ctx.fill();
      ctx.fillStyle="#050607";ctx.beginPath();ctx.ellipse(-2,23,5,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#050607";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1,28);ctx.quadraticCurveTo(7,31,13,27);ctx.stroke();
      ctx.fillStyle="#d9e6a0";ctx.beginPath();ctx.arc(13,20,1.7,0,Math.PI*2);ctx.arc(25,20,1.7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111315";ctx.beginPath();ctx.arc(h.w-5,17,4,0,Math.PI*2);ctx.fill();
    } else if (h.type === "hand") {
      ctx.fillStyle="#c99072";roundedRect(0,5,h.w,h.h-5,10);ctx.fill();
      for(let i=0;i<4;i++){roundedRect(25+i*9,0,8,16,4);ctx.fill();}
    } else if (h.type === "grab") {
      // Top-down open hand with an actual thumb, not an escaped deli product.
      ctx.fillStyle="#c99072";
      roundedRect(36,53,27,21,7);ctx.fill();
      roundedRect(25,25,48,39,17);ctx.fill();
      const fingers=[[21,7,11,30,-.10],[34,1,11,35,-.03],[48,0,11,37,.03],[62,6,10,30,.11]];
      fingers.forEach(([x,y,w,ht,angle])=>{ctx.save();ctx.translate(x+w/2,y+ht);ctx.rotate(angle);roundedRect(-w/2,-ht,w,ht,6);ctx.fill();ctx.restore();});
      ctx.beginPath();
      ctx.moveTo(29,34);
      ctx.bezierCurveTo(20,29,12,30,7,36);
      ctx.bezierCurveTo(3,41,6,47,12,47);
      ctx.bezierCurveTo(18,47,23,52,29,57);
      ctx.lineTo(39,49);
      ctx.quadraticCurveTo(33,40,29,34);
      ctx.closePath();ctx.fill();
      ctx.fillStyle="#e9b69a";
      ctx.save();ctx.translate(10,38);ctx.rotate(-.55);roundedRect(-4,-3,9,7,4);ctx.fill();ctx.restore();
      ctx.fillStyle="#e9b69a";
      [[26,10],[39,5],[53,4],[67,10]].forEach(([x,y])=>{roundedRect(x-4,y,8,8,4);ctx.fill();});
      ctx.strokeStyle="#9d644e";ctx.lineWidth=1.4;
      ctx.beginPath();ctx.arc(49,44,13,.2,2.9);ctx.moveTo(38,55);ctx.quadraticCurveTo(49,50,61,55);ctx.stroke();
    } else if (h.type === "mouseTrap") {
      ctx.fillStyle="#ad7b42";roundedRect(1,8,h.w-2,h.h-8,3);ctx.fill();ctx.strokeStyle="#e0b77a";ctx.lineWidth=2;roundedRect(1,8,h.w-2,h.h-8,3);ctx.stroke();
      ctx.strokeStyle="#cfd2cf";ctx.lineWidth=3;ctx.beginPath();ctx.rect(12,3,h.w-25,h.h-10);ctx.stroke();ctx.beginPath();ctx.moveTo(h.w/2,4);ctx.lineTo(h.w/2,h.h-2);ctx.stroke();
      ctx.fillStyle="#e8c84e";ctx.beginPath();ctx.moveTo(h.w/2-8,h.h-8);ctx.lineTo(h.w/2+9,h.h-8);ctx.lineTo(h.w/2+5,h.h-18);ctx.closePath();ctx.fill();ctx.fillStyle="#997625";ctx.beginPath();ctx.arc(h.w/2,h.h-11,2,0,Math.PI*2);ctx.fill();
    } else if (h.type === "roomba") {
      // Side-view robot vacuum with wheels sitting directly on its platform.
      ctx.fillStyle="#0c0d10";ctx.beginPath();ctx.arc(15,h.h-3,6,0,Math.PI*2);ctx.arc(h.w-15,h.h-3,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#3a3d43";roundedRect(2,8,h.w-4,h.h-12,9);ctx.fill();
      ctx.strokeStyle="#8f959f";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#1e2025";ctx.beginPath();ctx.ellipse(h.w/2,9,h.w*.35,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#65d9f5";ctx.beginPath();ctx.arc(h.w/2,8,3,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#ef8c73";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(h.w-4,h.h-7);ctx.lineTo(h.w+9,h.h-13);ctx.moveTo(h.w-4,h.h-7);ctx.lineTo(h.w+9,h.h-4);ctx.stroke();
    } else if (h.type === "slipper") {
      ctx.fillStyle="#d7aa86";roundedRect(0,0,28,h.h,9);ctx.fill();
      ctx.fillStyle="#24252a";ctx.beginPath();ctx.moveTo(17,14);ctx.quadraticCurveTo(48,5,h.w-5,19);ctx.lineTo(h.w,34);ctx.lineTo(23,34);ctx.closePath();ctx.fill();
      ctx.fillStyle="#666a73";roundedRect(26,18,h.w-34,10,5);ctx.fill();
      ctx.fillStyle="#111318";ctx.fillRect(20,h.h-6,h.w-20,6);
    } else if (h.type === "lego") {
      ctx.fillStyle="#e3343f";roundedRect(2,7,h.w-4,h.h-7,3);ctx.fill();
      ctx.fillStyle="#ff5b62";
      for(let x=9;x<h.w-5;x+=13){ctx.beginPath();ctx.ellipse(x,7,5,3,0,Math.PI,Math.PI*2);ctx.fill();}
      ctx.strokeStyle="#9e1720";ctx.lineWidth=2;roundedRect(2,7,h.w-4,h.h-7,3);ctx.stroke();
    } else if (h.type === "fish") {
      ctx.fillStyle="#d4a04d";ctx.beginPath();ctx.ellipse(h.w*.48,h.h*.52,h.w*.34,h.h*.34,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(h.w*.76,h.h*.52);ctx.lineTo(h.w,h.h*.18);ctx.lineTo(h.w,h.h*.84);ctx.closePath();ctx.fill();
      ctx.fillStyle="#785427";ctx.beginPath();ctx.moveTo(h.w*.4,h.h*.3);ctx.lineTo(h.w*.57,1);ctx.lineTo(h.w*.62,h.h*.34);ctx.fill();
      ctx.fillStyle="#0c1820";ctx.beginPath();ctx.arc(h.w*.26,h.h*.42,3,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#6f4721";ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.w*.12,h.h*.58,7,-.8,.8);ctx.stroke();
    } else if (h.type === "filter") {
      ctx.fillStyle="#17242a";roundedRect(4,0,h.w-8,h.h,8);ctx.fill();
      ctx.strokeStyle="#7ec5cf";ctx.lineWidth=2;roundedRect(4,0,h.w-8,h.h,8);ctx.stroke();
      ctx.fillStyle="#081217";
      for(let y=9;y<h.h-5;y+=8)ctx.fillRect(13,y,h.w-26,3);
      ctx.strokeStyle="rgba(196,249,255,.7)";ctx.lineWidth=2;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(12+i*19,-8-i*4,4,0,Math.PI*2);ctx.stroke();}
    }
    if (now < (h.stunnedUntil || 0)) {
      ctx.globalAlpha = 1;ctx.fillStyle="#d4e5ff";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText("CONSTRICTED",h.w/2,-7);
    }
    ctx.restore();
  }

  function drawDroppedTail(now) {
    if (!droppedTail || selectedCharacter !== "crested") return;
    const age = now - droppedTail.droppedAt;
    if (age > 7000) return;
    const wiggle = age < 3200 ? Math.sin(age * .026) * 7 * (1 - age / 4000) : 0;
    const green = characters.crested.color;
    ctx.save();
    ctx.translate(droppedTail.x, droppedTail.y);
    ctx.scale(droppedTail.facing, 1);
    ctx.rotate(wiggle * .025);
    ctx.globalAlpha = Math.max(.28, 1 - age / 9000);
    ctx.strokeStyle = green;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -wiggle, -24, wiggle, -43, 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawCrestedGecko(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha = .4;
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.scale(player.facing, 1);
    const green = characters.crested.color;
    // Long, gently tapering tail. Crested geckos are not curly-tailed chameleons.
    if (tailReady) {
      ctx.strokeStyle = green; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-14, 2); ctx.bezierCurveTo(-27, 3, -37, 8, -49, 5); ctx.stroke();
    }

    // Splayed legs and round adhesive toe pads.
    ctx.strokeStyle = green; ctx.lineWidth = 4;
    const feet = [[-9,6,-18,14,-25,13],[7,6,14,14,22,13],[-8,-5,-17,-11,-23,-10],[7,-5,15,-11,22,-9]];
    feet.forEach(([x1,y1,x2,y2,x3,y3]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
      ctx.beginPath(); ctx.arc(x3,y3,3,0,Math.PI*2); ctx.fillStyle=green; ctx.fill();
    });

    // Slender body and broad wedge-shaped crested-gecko head.
    ctx.fillStyle = green;
    ctx.beginPath(); ctx.ellipse(-1,0,20,9,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10,-8); ctx.lineTo(29,-7); ctx.quadraticCurveTo(34,-1,29,7); ctx.lineTo(11,8); ctx.quadraticCurveTo(18,0,10,-8); ctx.fill();

    // Eyelash crests continue from above the eye down the back.
    ctx.beginPath();
    ctx.moveTo(27,-7); ctx.lineTo(29,-14); ctx.lineTo(23,-8);
    ctx.lineTo(23,-13); ctx.lineTo(18,-8);
    ctx.lineTo(16,-12); ctx.lineTo(11,-7);
    ctx.lineTo(8,-11); ctx.lineTo(3,-8);
    ctx.lineTo(0,-11); ctx.lineTo(-5,-8);
    ctx.lineTo(-8,-10); ctx.lineTo(-12,-7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle="#071008"; ctx.beginPath(); ctx.ellipse(24,-5,3,3.8,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff6c5"; ctx.beginPath(); ctx.arc(25,-6,1,0,Math.PI*2); ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawChameleon(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const green=characters.chameleon.color;
    ctx.strokeStyle=green;ctx.lineWidth=6;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-13,3);ctx.bezierCurveTo(-37,12,-47,-3,-34,-14);ctx.bezierCurveTo(-23,-22,-18,-9,-29,-5);ctx.stroke();
    ctx.fillStyle=green;ctx.beginPath();ctx.ellipse(-1,0,20,11,-.08,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(12,-9);ctx.lineTo(25,-15);ctx.lineTo(31,-4);ctx.lineTo(27,8);ctx.lineTo(12,8);ctx.closePath();ctx.fill();
    ctx.strokeStyle=green;ctx.lineWidth=4;
    [[-8,7,-18,15],[8,7,18,15],[-7,-5,-17,-10],[8,-5,18,-10]].forEach(([x,y,x2,y2])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.lineTo(x2+5,y2-2);ctx.stroke();});
    ctx.fillStyle="#d9ef76";ctx.beginPath();ctx.arc(23,-5,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#13190d";ctx.beginPath();ctx.arc(25,-5,2.5,0,Math.PI*2);ctx.fill();
    if(now<tongueActiveUntil){const progress=Math.min(1,Math.max(0,(now-(tongueActiveUntil-230))/230));const extension=Math.sin(progress*Math.PI)*106;ctx.strokeStyle="#ff86a8";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(29,2);ctx.lineTo(29+extension,2);ctx.stroke();ctx.fillStyle="#ff9bb7";ctx.beginPath();ctx.ellipse(31+extension,2,6,4,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawNewt(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    if(now<toxinActiveUntil){ctx.strokeStyle="rgba(255,105,49,.72)";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,43,24,0,0,Math.PI*2);ctx.stroke();}
    const dark=characters.newt.color;
    ctx.strokeStyle=dark;ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-12,1);ctx.bezierCurveTo(-29,0,-38,5,-49,1);ctx.stroke();
    ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(-1,0,22,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(20,-1,12,9,0,0,Math.PI*2);ctx.fill();
    // Bright orange-red underside with the irregular black markings of a fire-belly newt.
    ctx.fillStyle="#ef542f";ctx.beginPath();ctx.moveTo(-18,2);ctx.quadraticCurveTo(-5,10,12,7);ctx.quadraticCurveTo(21,6,27,2);ctx.quadraticCurveTo(10,5,-18,2);ctx.fill();
    ctx.fillStyle="#ff9a35";ctx.beginPath();ctx.ellipse(-8,5,5,2.2,.12,0,Math.PI*2);ctx.ellipse(13,4,5,2,-.18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#171918";[[-14,4,2.2],[-1,6,2.5],[7,4,1.8],[20,3,2.2]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(x,y,r,r*.62,.2,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle=dark;ctx.lineWidth=3;
    [[-8,5,-17,13],[7,5,16,13],[-7,-4,-16,-10],[8,-4,17,-10]].forEach(([x,y,x2,y2])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.lineTo(x2+5,y2);ctx.stroke();});
    ctx.fillStyle="#f4cb64";ctx.beginPath();ctx.arc(24,-4,2,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawFrog(now) {
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;
    if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const blue=characters.frog.color;
    ctx.strokeStyle=blue;ctx.lineWidth=6;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-8,5);ctx.lineTo(-22,14);ctx.lineTo(-31,10);ctx.moveTo(7,6);ctx.lineTo(20,15);ctx.lineTo(29,11);ctx.stroke();
    ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(-18,-10);ctx.lineTo(-24,-8);ctx.moveTo(9,-3);ctx.lineTo(19,-9);ctx.lineTo(25,-7);ctx.stroke();
    ctx.fillStyle=blue;ctx.beginPath();ctx.ellipse(0,3,18,12,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(12,-5,15,10,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#0a1830";[[-8,1,4],[2,7,3],[13,1,4],[20,-7,3],[-1,-5,3]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle="#d8e9a0";ctx.beginPath();ctx.arc(18,-9,3.6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#10171a";ctx.beginPath();ctx.arc(19,-9,1.7,0,Math.PI*2);ctx.fill();
    if(now<tongueActiveUntil){const progress=Math.min(1,Math.max(0,(now-(tongueActiveUntil-230))/230));const extension=Math.sin(progress*Math.PI)*92;ctx.strokeStyle="#ff86a8";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(24,-1);ctx.lineTo(24+extension,-1);ctx.stroke();ctx.fillStyle="#ff9bb7";ctx.beginPath();ctx.ellipse(26+extension,-1,5,3.5,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawBoa(now) {
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;
    if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const dark=characters.boa.color;
    if(now<constrictPulseUntil){const pulse=1-(constrictPulseUntil-now)/360;ctx.strokeStyle=`rgba(182,190,200,${.8-pulse*.7})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27+pulse*28,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle=dark;ctx.lineWidth=15;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-64,5);ctx.bezierCurveTo(-50,-14,-31,15,-15,0);ctx.bezierCurveTo(1,-15,11,10,24,-1);ctx.stroke();
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.moveTo(15,-11);ctx.quadraticCurveTo(34,-14,48,-8);ctx.lineTo(54,-1);ctx.lineTo(49,8);ctx.quadraticCurveTo(33,13,16,9);ctx.lineTo(9,3);ctx.lineTo(11,-6);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#383b3e";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(19,8);ctx.quadraticCurveTo(35,12,49,6);ctx.stroke();
    ctx.fillStyle="#d0a85d";ctx.beginPath();ctx.ellipse(39,-5,3,2.2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#070707";ctx.beginPath();ctx.ellipse(40,-5,1,2,0,0,Math.PI*2);ctx.arc(49,-1,1.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#bd3c48";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(52,4);ctx.lineTo(65,7);ctx.moveTo(65,7);ctx.lineTo(70,4);ctx.moveTo(65,7);ctx.lineTo(69,11);ctx.stroke();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawPlayer(now) {
    if (selectedCharacter === "chameleon") drawChameleon(now);
    else if (selectedCharacter === "newt") drawNewt(now);
    else if (selectedCharacter === "frog") drawFrog(now);
    else if (selectedCharacter === "boa") drawBoa(now);
    else drawCrestedGecko(now);
  }

  function draw(time = 0) {
    const level = levels[levelIndex] || levels[0];
    drawBackdrop(level);
    drawPlatforms(level);
    drawExit(level);
    drawInsects(level, time);
    drawAirPockets(level, time);
    level.hazards.forEach(hazard => drawHazard(hazard, time));
    drawDroppedTail(time);
    drawPlayer(time);
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .033);
    lastTime = time;
    update(dt, time);
    draw(time);
    requestAnimationFrame(frame);
  }

  window.addEventListener("keydown", event => {
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(event.code)) event.preventDefault();
    if (!keys[event.code] && (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW")) jump();
    if (!keys[event.code] && event.code === "KeyE") (["chameleon","frog"].includes(selectedCharacter) ? useTongue() : useAbility());
    if (!keys[event.code] && (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyX")) useAbility();
    keys[event.code] = true;
  });
  window.addEventListener("keyup", event => keys[event.code] = false);

  document.querySelectorAll("[data-control]").forEach(button => {
    const control = button.dataset.control;
    const key = control === "left" ? "touchLeft" : control === "right" ? "touchRight" : "touchJump";
    const press = event => {
      event.preventDefault();
      if (control === "tongue") return useTongue();
      if (control === "ability") return useAbility();
      if (control === "jump" && !keys[key]) jump();
      keys[key] = true;
    };
    const release = event => { event.preventDefault(); keys[key] = false; };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });

  secondaryButton.addEventListener("click", showMenu);
  characterSelect.querySelectorAll("[data-character]").forEach(button => {
    button.addEventListener("click", () => {
      selectedCharacter = button.dataset.character;
      applyCharacterHabitat();
      abilityButton.textContent = characters[selectedCharacter].ability;
      showIntro(0);
    });
  });
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.setAttribute("aria-label", `Turn sound ${soundOn ? "off" : "on"}`);
    if (soundOn) tone(440);
  });

  showMenu();
  requestAnimationFrame(frame);
})();
