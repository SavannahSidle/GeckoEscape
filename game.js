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
  let camouflageUntil = 0;
  let camouflageCooldownUntil = 0;
  let chameleonColorIndex = 0;
  let strikeActiveUntil = 0;
  let strikeCooldownUntil = 0;
  let regenerateUntil = 0;
  let regenerateCooldownUntil = 0;
  let frogHopCooldownUntil = 0;
  let frogAutoHopping = false;
  let miceCollected = 0;
  let selectedCharacter = "crested";
  let soundOn = true;
  let audioContext = null;

  const characters = {
    chameleon: { name: "CHAMELEON", ability: "TONGUE", secondary: "CAMOUFLAGE", collectible: "CRICKETS", color: "#79a94d", climbSpeed: 135, swimSpeed: 150, w: 42, h: 25 },
    crested: { name: "CRESTED GECKO", ability: "SHORT TONGUE", secondary: "DROP TAIL", collectible: "ROACHES", color: "#d29458", climbSpeed: 195, swimSpeed: 160, w: 42, h: 25 },
    newt: { name: "FIRE-BELLY NEWT", ability: "REGENERATE", secondary: "TOXIN", collectible: "WORMS", color: "#252a28", climbSpeed: 130, swimSpeed: 235, w: 46, h: 23 },
    frog: { name: "AZUREUS DART FROG", ability: "TONGUE", secondary: "POWER LEAP", collectible: "FRUIT FLIES", color: "#2679cb", climbSpeed: 120, swimSpeed: 155, w: 38, h: 27 },
    boa: { name: "BLACK COLOMBIAN BOA", ability: "CONSTRICT", secondary: "STRIKE", collectible: "RATS", color: "#030405", climbSpeed: 155, swimSpeed: 190, w: 94, h: 36 }
  };

  const player = {
    x: 0, y: 0, w: 38, h: 24,
    vx: 0, vy: 0, facing: 1,
    grounded: false, climbing: false, ceilingClimbing: false,
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
      platforms: [[0,500,960,40],[45,458,190,22],[76,340,150,18],[262,404,190,20],[500,342,185,20],[712,270,190,20],[790,154,150,20]],
      vines: [[215,328,20,135],[456,273,20,135],[680,204,20,140]],
      insects: [[145,307],[330,370],[570,308],[840,230]],
      hazards: [{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}],
      decor: "enclosure"
    },
    {
      label: "LEVEL 3 · HARD",
      title: "The Kitchen",
      intro: "Cross the long counter and open shelves. Avoid the cat and Dalmatian while gathering every last meal.",
      completeTitle: "You have breached containment.",
      completeText: "The living room waits beyond the doorway. Somewhere in the dark, a refrigerator hums like destiny.",
      palette: ["#0c1117", "#1d2830", "#754f31", "#f0cc62"],
      start: [45, 445], exit: [876,88,50,82],
      platforms: [[0,500,960,40],[28,442,235,20,"counter"],[425,390,205,20,"counter"],[375,270,120,18,"spiceShelf"],[105,322,180,18,"sink"],[40,196,210,18,"sill"],[530,206,190,18,"sill"],[775,174,185,18,"fridgeTop"]],
      angledPlatforms: [],
      vines: [],
      insects: [[80,410],[420,355],[300,294],[510,294],[690,171],[120,161],[620,120],[875,142]],
      hazards: [
        {x:650,y:303,w:66,h:24,type:"cat",axis:"x",min:620,max:820,speed:105},
        {x:125,y:142,w:88,h:54,type:"dalmatian",axis:"x",min:60,max:165,speed:78}
      ],
      decor: "kitchen"
    },
    {
      label: "LEVEL 4 · LAWLESS",
      title: "The Living Room",
      intro: "Cross the sofa, shelves, and coffee table. The Roomba, French bulldog, cat, and ceiling spider have joined the hunt.",
      completeTitle: "Behind the refrigerator.",
      completeText: "Warm. Dusty. Free. You have escaped four separate containment failures and learned absolutely nothing.",
      palette: ["#111018", "#292239", "#795b44", "#ef8c73"],
      start: [38, 445], exit: [878,392,64,108],
      platforms: [[0,500,960,40],[26,434,165,20],[35,105,125,18],[40,175,120,18],[115,260,135,18],[230,372,150,18],[420,318,132,18],[520,160,110,18],[602,268,140,18],[790,212,150,18],[820,125,105,18],[690,392,105,18],[520,445,94,18]],
      vines: [],
      insects: [[95,72],[290,337],[665,233],[850,177]],
      mice: [],
      hazards: [
        {x:238,y:460,w:96,h:40,type:"roomba",axis:"x",min:210,max:490,speed:145},
        {x:550,y:413,w:72,h:32,type:"roomba",axis:"x",min:510,max:680,speed:118},
        {x:645,y:460,w:78,h:40,type:"frenchie",axis:"x",min:610,max:760,speed:92},
        {x:330,y:390,w:66,h:24,type:"cat",axis:"jump",min:285,max:525,speed:88,baseY:390,jumpHeight:132},
        {x:465,y:170,w:38,h:32,type:"spider",axis:"y",minY:145,maxY:390,speed:72}
      ],
      decor: "house"
    },
    {
      label: "LEVEL 2 · UNDERWATER",
      title: "The Aquarium",
      intro: "The escape route drops through an aquarium. Reptiles need air bubbles. The newt has been waiting its entire moist little life for this.",
      completeTitle: "Out through the filter.",
      completeText: "Cold, wet, and loose in the kitchen. The household has made several serious containment errors.",
      palette: ["#031729", "#075169", "#456b52", "#62e8dc"],
      start: [35,440], exit: [875,62,58,92],
      platforms: [[0,500,960,40],[70,430,170,18],[315,350,170,18],[555,430,130,18],[700,278,190,18],[410,200,150,18],[72,145,190,18]],
      vines: [[245,310,16,190],[505,220,16,210],[760,120,16,160]],
      insects: [[180,390],[120,270],[310,115],[475,305],[520,465],[650,330],[810,235],[850,180]],
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

  // Story order: enclosure, aquarium, kitchen, living room.
  levels.splice(1,0,levels.pop());

  const standardStoryLayouts=levels.slice(1).map(level=>({
    platforms:level.platforms.map(platform=>[...platform]),
    angledPlatforms:(level.angledPlatforms||[]).map(platform=>[...platform]),
    vines:level.vines.map(vine=>[...vine]),
    insects:level.insects.map(insect=>insect.slice(0,2)),
    mice:(level.mice||[]).map(mouse=>mouse.slice(0,2))
  }));

  const frogLevelExtras={
    kitchen:{
      platforms:[[108,310,135,18],[690,225,125,18]],
      insects:[[174,277],[752,192]]
    },
    house:{
      platforms:[[88,310,130,18],[350,230,135,18]],
      insects:[[152,277],[417,197]]
    },
    underwater:{
      platforms:[[225,275,125,18],[760,365,125,18]],
      insects:[[287,242],[822,332]]
    }
  };

  const boaStoryCollectibles={
    kitchen:{rats:[[620,120]],mice:[[80,410],[300,294],[420,355],[510,294],[740,294],[120,161],[875,142]]},
    house:{rats:[[95,72],[665,233],[850,177]],mice:[[105,400],[185,225],[290,337],[470,285],[705,358],[835,305]]},
    underwater:{rats:[[310,115],[850,180]],mice:[[180,390],[120,270],[475,305],[520,465],[650,330],[810,235],[385,315],[735,245]]}
  };

  const habitatConfigs = {
    chameleon: {
      title:"The Screen Enclosure",habitat:"chameleon",palette:["#08150c","#17351d","#6b4a2b","#8bd85c"],
      intro:"The screen door is loose. Cross the ficus branches and leave before anyone notices the suspiciously empty vine.",
      start:[70,420],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[42,452,190,20],[80,340,150,18],[275,392,175,20],[510,330,190,20],[735,264,180,20],[570,180,165,18]],
      vines:[[420,278,18,118],[655,188,18,142]],ceilingVines:[[150,92,680,18,"woody"]],insects:[[149,307],[95,135],[330,355],[590,292],[810,225]],
      hazards:[{x:430,y:430,w:92,h:70,type:"grab",axis:"x",min:340,max:620,speed:82}]
    },
    crested: {
      title:"The Arboreal Terrarium",habitat:"crested",palette:["#07150f","#123120","#6f4d2c","#a9f576"],
      intro:"The glass door is open. Cross the cork and branches, then make your first terrible decision.",
      start:[55,433],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[45,458,190,22],[76,340,150,18],[500,342,185,20],[712,270,190,20],[790,154,150,20]],
      vines:[[215,328,20,135],[680,204,20,140],[675,342,20,120]],ceilingVines:[[210,92,560,26,"curved"],[350,182,280,22,"curved"],[430,255,250,20,"curved"]],insects:[[145,307],[145,132],[570,308],[840,230]],
      hazards:[{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}]
    },
    newt: {
      title:"The Paludarium",habitat:"newt",palette:["#07151a","#153b3d","#536b50","#65d6c4"],
      intro:"The lid has shifted above the shoreline. Climb from water to stone and investigate this administrative failure.",
      start:[112,445],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[55,458,220,22],[82,342,150,18],[205,282,130,18],[310,422,150,18],[395,165,135,18],[490,372,170,18],[510,252,130,18],[690,320,180,18],[760,232,150,18]],
      vines:[[650,260,18,130],[845,165,18,155]],insects:[[151,309],[270,249],[350,390],[462,132],[560,338],[575,219],[800,285]],
      hazards:[{x:465,y:430,w:92,h:70,type:"grab",axis:"x",min:380,max:640,speed:76}]
    },
    frog: {
      title:"The Planted Vivarium",habitat:"frog",palette:["#061810","#164528","#67502d","#74df79"],
      intro:"A bromeliad has reached the door. Leap through the leaves before the human arrives with entirely too much concern.",
      start:[170,430],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[75,455,175,20],[90,342,145,18],[285,405,145,18],[265,270,135,18],[380,65,140,18],[465,350,150,18],[530,220,130,18],[650,295,160,18],[780,215,145,18]],
      vines:[],insects:[[158,309],[330,370],[332,237],[450,32],[535,315],[595,187],[825,180]],
      hazards:[{x:450,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:84}]
    },
    boa: {
      title:"The Boa Enclosure",habitat:"boa",palette:["#0b100d","#242a20","#62472d","#a0b37b"],
      intro:"The sliding door is open. Follow the heavy logs toward freedom, dignity, and several poorly secured feeder rats.",
      start:[38,430],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[35,454,245,26],[78,338,170,22],[315,410,210,25],[560,360,220,25],[760,292,170,24],[600,212,175,22],[390,165,180,22],[705,105,180,22]],
      vines:[[285,325,22,130],[800,215,22,110]],diagonalVines:[],insects:[[480,130]],mice:[[158,304],[365,373],[640,322],[835,255]],
      hazards:[{x:455,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:70}]
    }
  };

  function applyCharacterHabitat() {
    const habitat = habitatConfigs[selectedCharacter];
    levels[0].ceilingVines=[];
    levels[0].diagonalVines=[];
    levels[0].mice=[];
    Object.assign(levels[0], JSON.parse(JSON.stringify(habitat)), {label:"LEVEL 1 · EASY",decor:"enclosure",completeTitle:"The room is larger than expected.",completeText:"Freedom contains shelves, suspicious noises, and absolutely no climate control."});
    standardStoryLayouts.forEach((layout,index)=>{
      const level=levels[index+1];
      level.platforms=layout.platforms.map(platform=>[...platform]);
      level.angledPlatforms=layout.angledPlatforms.map(platform=>[...platform]);
      level.vines=selectedCharacter==="frog"?[]:layout.vines.map(vine=>[...vine]);
      level.insects=layout.insects.map(insect=>[...insect]);
      level.mice=selectedCharacter==="crested"?[]:layout.mice.map(mouse=>[...mouse]);
      if(selectedCharacter==="frog"){
        const extras=frogLevelExtras[level.decor];
        level.platforms.push(...extras.platforms.map(platform=>[...platform]));
        level.insects.push(...extras.insects.map(insect=>[...insect]));
      }
      if(selectedCharacter==="boa"){
        const prey=boaStoryCollectibles[level.decor];
        level.insects=prey.rats.map(rat=>[...rat]);
        level.mice=prey.mice.map(mouse=>[...mouse]);
      }
    });
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
    if(allowSelect){secondaryButton.textContent="LEVEL SELECT";secondaryButton.onclick=showMenu;}
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
    if(index===0){
      secondaryButton.textContent="BACK TO CHARACTERS";
      secondaryButton.onclick=showCharacterSelect;
      secondaryButton.classList.remove("hidden");
    }
  }

  function startLevel(index) {
    levelIndex = index;
    const level = levels[index];
    player.w = characters[selectedCharacter].w;
    player.h = characters[selectedCharacter].h;
    level.insects.forEach(insect => insect[2] = false);
    level.hazards.forEach((hazard, i) => { hazard.dir = i % 2 ? -1 : 1; hazard.dirX = i % 2 ? -1 : 1; hazard.dirY = i % 2 ? 1 : -1; hazard.jumpPhase=i*.7; hazard.stunnedUntil = 0; hazard.camouflageIgnoredUntil=0; hazard.defeated = false; });
    lives = 3;
    collected = 0;
    tailReady = true;
    toxinReady = true;
    toxinActiveUntil = 0;
    air = 100;
    leapCooldownUntil = 0;
    constrictCooldownUntil = 0;
    constrictPulseUntil = 0;
    camouflageUntil = 0;
    camouflageCooldownUntil = 0;
    strikeActiveUntil = 0;
    strikeCooldownUntil = 0;
    regenerateUntil = 0;
    regenerateCooldownUntil = 0;
    frogHopCooldownUntil = 0;
    frogAutoHopping = false;
    miceCollected = 0;
    (level.mice||[]).forEach(mouse=>mouse[2]=false);
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
    player.ceilingClimbing = false;
    frogAutoHopping = false;
    air = 100;
    invulnerableUntil = performance.now() + 1100;
    updateHud();
  }

  function updateHud() {
    const character = characters[selectedCharacter];
    const preyTotal = levels[levelIndex].insects.length;
    const miceTotal=(levels[levelIndex].mice||[]).length;
    bugLabel.textContent = `${character.collectible} ${collected}/${preyTotal}${miceTotal?` · MICE ${miceCollected}/${miceTotal}`:""}`;
    if (levels[levelIndex]?.underwater && selectedCharacter !== "newt") {
      abilityLabel.textContent = `AIR ${Math.max(0, Math.ceil(air))}% · ${character.ability}`;
    } else if (selectedCharacter === "crested") {
      abilityLabel.textContent = `SHORT TONGUE · TAIL ${tailReady ? "READY" : "GONE"}`;
    } else if (selectedCharacter === "newt") {
      const regenerateState = performance.now() >= regenerateCooldownUntil ? "REGENERATE READY" : "REGENERATE RECHARGING";
      abilityLabel.textContent = `${regenerateState} · TOXIN ${toxinReady ? "READY" : "USED"}`;
    } else if (selectedCharacter === "frog") {
      abilityLabel.textContent = `TONGUE · ${performance.now() >= leapCooldownUntil ? "POWER LEAP READY" : "LEAP RECHARGING"}`;
    } else if (selectedCharacter === "boa") {
      const constrictState=performance.now()>=constrictCooldownUntil?"CONSTRICT READY":"CONSTRICT RECHARGING";
      const strikeState=performance.now()>=strikeCooldownUntil?"STRIKE READY":"STRIKE RECHARGING";
      abilityLabel.textContent=`${constrictState} · ${strikeState}`;
    } else if (selectedCharacter === "chameleon") {
      abilityLabel.textContent = `TONGUE · ${performance.now() >= camouflageCooldownUntil ? "CAMOUFLAGE READY" : "CAMOUFLAGE RECHARGING"}`;
    } else {
      abilityLabel.textContent = "TONGUE READY";
    }
    abilityButton.textContent = character.ability;
    abilityButton.setAttribute("aria-label", `Use ${character.ability.toLowerCase()} ability`);
    tongueButton.textContent = character.secondary || "";
    tongueButton.setAttribute("aria-label", character.secondary ? `Use ${character.secondary.toLowerCase()} ability` : "Secondary ability unavailable");
    tongueButton.classList.toggle("hidden", !character.secondary);
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
    if (state !== "playing" || !["chameleon","crested","frog"].includes(selectedCharacter) || now < tongueCooldownUntil) return;
    tongueActiveUntil = now + 230;
    tongueCooldownUntil = now + 520;
    tone(610, .045, "sine");
  }

  function tongueHitbox(now) {
    if (!["chameleon","crested","frog"].includes(selectedCharacter) || now >= tongueActiveUntil) return null;
    const reach = selectedCharacter==="crested"?58:112;
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

  function useRegenerate(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="newt"||now<regenerateCooldownUntil)return;
    regenerateUntil=now+2600;
    regenerateCooldownUntil=now+5200;
    if(lives<3)lives=Math.min(3,lives+1);
    invulnerableUntil=Math.max(invulnerableUntil,regenerateUntil);
    updateHud();tone(390,.18,"sine");
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

  function useCamouflage() {
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="chameleon"||now<camouflageCooldownUntil)return;
    chameleonColorIndex=(chameleonColorIndex+1)%5;
    camouflageUntil=now+2600;
    camouflageCooldownUntil=now+5200;
    updateHud();tone(430,.16,"sine");
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
      if(hazard.defeated)continue;
      if (hazard.axis === "none") continue;
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

  function useStrike(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="boa"||now<strikeCooldownUntil)return;
    strikeActiveUntil=now+300;strikeCooldownUntil=now+1150;
    const strikeBox={x:player.facing>0?player.x+player.w-12:player.x-92,y:player.y-7,w:104,h:player.h+14};
    const livingTypes=new Set(["cat","dalmatian","frenchie","fish","spider"]);
    for(const hazard of levels[levelIndex].hazards){
      if(hazard.defeated||!intersects(strikeBox,hazard))continue;
      if(hazard.type==="grab"||hazard.type==="hand"){
        hazard.stunnedUntil=now+1000;hazard.dir*=-1;
      }else if(livingTypes.has(hazard.type)){
        hazard.defeated=true;
      }
    }
    updateHud();tone(190,.09,"sawtooth");
  }

  function useAbility() {
    if (["chameleon","crested","frog"].includes(selectedCharacter)) useTongue();
    else if (selectedCharacter === "newt") useRegenerate();
    else useConstrict();
  }

  function useSecondaryAbility(){
    if(selectedCharacter==="chameleon")useCamouflage();
    else if(selectedCharacter==="frog")usePowerLeap();
    else if(selectedCharacter==="crested")dropTail();
    else if(selectedCharacter==="newt")useToxin();
    else if(selectedCharacter==="boa")useStrike();
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function remainingCollectibles(level){
    return level.insects.filter(item=>!item[2]).length+(level.mice||[]).filter(item=>!item[2]).length;
  }

  function completeLevel() {
    if (remainingCollectibles(levels[levelIndex])>0) return;
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
    const inHabitatWater = level.habitat === "newt" && player.x < 520 && player.y + player.h / 2 > 270;
    const swimming = Boolean(level.underwater || inHabitatWater);
    const speed = swimming ? character.swimSpeed : level.decor === "house" ? 236 : 220;
    if (["chameleon","newt","frog","boa"].includes(selectedCharacter)) updateHud();

    const acceleration = swimming ? 720 : 1450;
    if (left) { player.vx -= acceleration * dt; player.facing = -1; }
    if (right) { player.vx += acceleration * dt; player.facing = 1; }
    if (!left && !right) player.vx *= Math.pow(swimming ? .025 : .0007, dt);
    player.vx = Math.max(-speed, Math.min(speed, player.vx));

    if (swimming) {
      player.climbing = false;
      player.ceilingClimbing = false;
      if (up) player.vy -= 680 * dt;
      if (down) player.vy += 680 * dt;
      if (!up && !down) player.vy *= Math.pow(.018, dt);
      player.vy = Math.max(-speed, Math.min(speed, player.vy));

      if (level.underwater && selectedCharacter !== "newt") {
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
      const diagonalVine=(level.diagonalVines||[]).find(v=>touchesDiagonalVine(player,v));
      const onVine = level.vines.some(v => intersects(player, {x:v[0], y:v[1], w:v[2], h:v[3]})) || Boolean(diagonalVine);
      const ceilingVine = (level.ceilingVines||[]).find(v => intersects(player,{x:v[0],y:v[1]-4,w:v[2],h:v[3]+22}));
      const onWall = player.x <= 5 || player.x + player.w >= W - 5;
      const canHang=["chameleon","crested"].includes(selectedCharacter);
      player.ceilingClimbing=Boolean(canHang&&ceilingVine&&!down&&(player.ceilingClimbing||up||player.vy<0));
      player.climbing = player.ceilingClimbing || ((onVine || onWall) && (up || down));
      if(player.ceilingClimbing){
        player.y=ceilingVineY(ceilingVine,player.x+player.w/2)+5;
        player.vy=0;
      }else if (player.climbing) {
        if(diagonalVine){
          const dx=diagonalVine[2]-diagonalVine[0],dy=diagonalVine[3]-diagonalVine[1],length=Math.hypot(dx,dy);
          const direction=up?1:down?-1:0;
          player.vx=dx/length*character.climbSpeed*direction;
          player.vy=dy/length*character.climbSpeed*direction;
        }else player.vy = up ? -character.climbSpeed : down ? character.climbSpeed : 0;
      } else {
        player.vy += 820 * dt;
        player.vy = Math.min(player.vy, 570);
        if(selectedCharacter==="frog"&&player.grounded&&(left||right)&&now>=frogHopCooldownUntil){
          player.vy=-145;player.grounded=false;frogAutoHopping=true;frogHopCooldownUntil=now+330;
        }
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
      if (!level.underwater && !swimming && player.vy >= 0 && oldY + player.h <= platform.y + 4 && intersects(player, platform)) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
        if(selectedCharacter==="frog")frogAutoHopping=false;
      }
    }
    for(const p of level.angledPlatforms||[]){
      if(level.underwater||swimming||player.vy<0)continue;
      const minX=Math.min(p[0],p[2]),maxX=Math.max(p[0],p[2]);
      const centerX=player.x+player.w/2;
      if(centerX<minX||centerX>maxX)continue;
      const surfaceY=angledPlatformY(p,centerX);
      if(oldY+player.h<=surfaceY+6&&player.y+player.h>=surfaceY){player.y=surfaceY-player.h;player.vy=0;player.grounded=true;}
    }

    if (player.y > H + 80) {
      tone(90, .25, "square");
      resetPlayer();
      return;
    }

    for (const hazard of level.hazards) {
      if(hazard.defeated)continue;
      if (hazard.axis === "x" && now >= (hazard.stunnedUntil || 0)) {
        hazard.x += hazard.speed * hazard.dir * dt;
        if (hazard.x < hazard.min || hazard.x > hazard.max) {
          hazard.x = Math.max(hazard.min, Math.min(hazard.max, hazard.x));
          hazard.dir *= -1;
        }
      }else if(hazard.axis==="jump"&&now>=(hazard.stunnedUntil||0)){
        hazard.x+=hazard.speed*hazard.dir*dt;
        if(hazard.x<hazard.min||hazard.x>hazard.max){hazard.x=Math.max(hazard.min,Math.min(hazard.max,hazard.x));hazard.dir*=-1;}
        hazard.jumpPhase+=dt*2.7;hazard.y=hazard.baseY-Math.abs(Math.sin(hazard.jumpPhase))*hazard.jumpHeight;
      }else if(hazard.axis==="y"&&now>=(hazard.stunnedUntil||0)){
        hazard.y+=hazard.speed*hazard.dirY*dt;
        if(hazard.y<hazard.minY||hazard.y>hazard.maxY){hazard.y=Math.max(hazard.minY,Math.min(hazard.maxY,hazard.y));hazard.dirY*=-1;}
      }else if(hazard.axis==="diagonal"&&now>=(hazard.stunnedUntil||0)){
        hazard.x+=hazard.speedX*hazard.dirX*dt;hazard.y+=hazard.speedY*hazard.dirY*dt;
        if(hazard.x<hazard.minX||hazard.x>hazard.maxX){hazard.x=Math.max(hazard.minX,Math.min(hazard.maxX,hazard.x));hazard.dirX*=-1;}
        if(hazard.y<hazard.minY||hazard.y>hazard.maxY){hazard.y=Math.max(hazard.minY,Math.min(hazard.maxY,hazard.y));hazard.dirY*=-1;}
      }
      if (now > invulnerableUntil && intersects(player, hazard)) {
        if(selectedCharacter==="chameleon"&&now<camouflageUntil){
          if(now<(hazard.camouflageIgnoredUntil||0))continue;
          if(Math.random()<.76){hazard.camouflageIgnoredUntil=now+850;tone(510,.035,"sine");continue;}
        }
        if (selectedCharacter === "newt" && now < toxinActiveUntil) {
          toxinActiveUntil = 0;
          invulnerableUntil = now + 900;
          hazard.dir *= -1;hazard.dirX*=-1;hazard.dirY*=-1;
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
        const bug = selectedCharacter==="boa"?{x:insect[0]-20,y:insect[1]-14,w:40,h:28}:{x:insect[0]-10,y:insect[1]-10,w:20,h:20};
        const tongue = tongueHitbox(now);
        if (intersects(player, bug) || (tongue && intersects(tongue, bug))) {
          insect[2] = true;
          collected += 1;
          updateHud();
          tone(720 + collected * 90, .07, "sine");
        }
      }
    });

    (level.mice||[]).forEach(mouse=>{
      if(mouse[2])return;
      const mouseBox={x:mouse[0]-14,y:mouse[1]-10,w:28,h:20};
      if(intersects(player,mouseBox)){mouse[2]=true;miceCollected+=1;updateHud();tone(540+miceCollected*80,.08,"triangle");}
    });

    const exit = {x:level.exit[0], y:level.exit[1], w:level.exit[2], h:level.exit[3]};
    if (intersects(player, exit) && remainingCollectibles(level)===0) completeLevel();
  }

  function jump() {
    if (state !== "playing") return;
    if(player.ceilingClimbing){player.ceilingClimbing=false;player.climbing=false;player.y+=8;player.vy=135;tone(185,.05,"triangle");return;}
    const level=levels[levelIndex];
    const inHabitatWater=level.habitat==="newt"&&player.x<520&&player.y+player.h/2>270;
    if(inHabitatWater){
      player.y=270-player.h-2;
      player.vy=-360;
      player.grounded=false;
      tone(245,.07,"triangle");
      return;
    }
    if (level.underwater) {
      player.vy = -characters[selectedCharacter].swimSpeed;
      tone(210, .05, "sine");
      return;
    }
    if (player.grounded || player.climbing || (selectedCharacter === "frog" && frogAutoHopping)) {
      player.vy = selectedCharacter === "frog" ? -535 : -455;
      player.grounded = false;
      if(selectedCharacter==="frog")frogAutoHopping=false;
      tone(245, .05, "triangle");
    }
  }

  function roundedRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
  }

  function touchesDiagonalVine(body,vine){
    const [x1,y1,x2,y2,width]=vine;
    const px=body.x+body.w/2,py=body.y+body.h/2;
    const dx=x2-x1,dy=y2-y1;
    const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy)));
    const nearestX=x1+t*dx,nearestY=y1+t*dy;
    return Math.hypot(px-nearestX,py-nearestY)<(width||18)+Math.max(body.w,body.h)*.35;
  }

  function angledPlatformY(platform,worldX){
    const [x1,y1,x2,y2]=platform;
    const t=Math.max(0,Math.min(1,(worldX-x1)/(x2-x1)));
    return y1+(y2-y1)*t;
  }

  function drawBackdrop(level) {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, level.palette[0]);
    gradient.addColorStop(1, level.palette[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    if(level.decor!=="enclosure"){
      ctx.globalAlpha = .13;
      ctx.strokeStyle = level.palette[3];
      ctx.lineWidth = 1;
      for (let x = 20; x < W; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 20; y < H; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    if (level.decor === "enclosure") {
      ctx.fillStyle = "rgba(110,160,130,.07)";
      ctx.fillRect(18, 45, 924, 455);
      ctx.strokeStyle = "rgba(210,255,230,.15)";
      ctx.lineWidth = 5; ctx.strokeRect(18, 45, 924, 455);
      drawEnclosureTrees();
      ctx.save();ctx.globalAlpha=.42;
      drawLeaves(-18,120,"#1b4b2b");drawLeaves(185,155,"#285c34");drawLeaves(390,105,"#214d2d");
      drawLeaves(545,265,"#285735");drawLeaves(790,125,"#1d492b");drawLeaves(820,335,"#285d37");
      ctx.restore();
      drawHabitatDetails(level);
      drawLeaves(48, 220, "#245f36");drawLeaves(665,180,"#1d4e2e");drawLeaves(720,400,"#245f36");
    } else if (level.decor === "kitchen") {
      ctx.fillStyle="#aebfbb";ctx.fillRect(0,70,W,430);
      ctx.strokeStyle="rgba(70,88,86,.22)";ctx.lineWidth=1;
      for(let y=70;y<344;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      for(let x=0;x<W;x+=72){ctx.beginPath();ctx.moveTo(x,70);ctx.lineTo(x,344);ctx.stroke();ctx.beginPath();ctx.moveTo(x+36,88);ctx.lineTo(x+36,344);ctx.stroke();}
      ctx.fillStyle="#171d20";ctx.fillRect(0,344,W,156);
      ctx.strokeStyle="rgba(240,204,98,.16)";ctx.lineWidth=3;
      for(let x=15;x<760;x+=150){ctx.strokeRect(x,360,130,130);ctx.beginPath();ctx.arc(x+112,422,3,0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle="#11171a";ctx.fillRect(360,344,150,156);ctx.strokeStyle="#778087";ctx.strokeRect(375,374,120,105);
      ctx.fillStyle="#2c3337";for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(385+i*34,337,10,0,Math.PI*2);ctx.fill();}
      // Short, unmistakable fridge beneath the exit shelf.
      ctx.fillStyle="#8d9699";roundedRect(775,174,185,326,8);ctx.fill();ctx.strokeStyle="#d4dadb";ctx.lineWidth=4;ctx.stroke();
      ctx.strokeStyle="#545c60";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(779,282);ctx.lineTo(956,282);ctx.stroke();
      ctx.fillStyle="#d8ddde";roundedRect(797,202,7,58,3);ctx.fill();roundedRect(797,310,7,92,3);ctx.fill();
      // A bright daytime view. One sky, one sun, no accidental binary star system.
      for(const [index,window] of [[0,[40,88,210,118]],[1,[530,88,190,118]]]){
        const [wx,wy,ww,wh]=window;
        const sky=ctx.createLinearGradient(0,wy,0,wy+wh);sky.addColorStop(0,"#65bce8");sky.addColorStop(1,"#c9ebed");ctx.fillStyle=sky;ctx.fillRect(wx,wy,ww,wh);
        if(index===0){
          const glow=ctx.createRadialGradient(wx+30,wy+28,3,wx+30,wy+28,30);glow.addColorStop(0,"rgba(255,246,168,.95)");glow.addColorStop(1,"rgba(255,246,168,0)");ctx.fillStyle=glow;ctx.fillRect(wx,wy,ww,wh);
          ctx.fillStyle="#ffe66f";ctx.beginPath();ctx.arc(wx+30,wy+28,12,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle="rgba(255,255,255,.78)";ctx.beginPath();ctx.ellipse(wx+80,wy+35,25,9,0,0,Math.PI*2);ctx.ellipse(wx+103,wy+32,18,11,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#3d7e42";ctx.beginPath();ctx.moveTo(wx,wy+wh);ctx.lineTo(wx+35,wy+70);ctx.lineTo(wx+68,wy+wh);ctx.lineTo(wx+108,wy+64);ctx.lineTo(wx+150,wy+wh);ctx.fill();
        ctx.strokeStyle="#b9a77e";ctx.lineWidth=7;ctx.strokeRect(wx,wy,ww,wh);ctx.beginPath();ctx.moveTo(wx+ww/2,wy);ctx.lineTo(wx+ww/2,wy+wh);ctx.stroke();
      }
    } else if (level.decor === "house") {
      ctx.fillStyle="#292634";ctx.fillRect(0,70,W,340);ctx.fillStyle="#3a2d2c";ctx.fillRect(0,410,W,90);
      ctx.fillStyle="#ddd2bd";ctx.fillRect(0,399,W,11);
      ctx.fillStyle="#101923";ctx.fillRect(82,105,210,150);ctx.strokeStyle="#806e64";ctx.lineWidth=8;ctx.strokeRect(82,105,210,150);
      ctx.strokeStyle="#8f8177";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(187,108);ctx.lineTo(187,252);ctx.moveTo(85,180);ctx.lineTo(289,180);ctx.stroke();
      ctx.fillStyle="#6d4051";
      const drawCurtain=(inner,outer)=>{ctx.beginPath();ctx.moveTo(inner,91);ctx.quadraticCurveTo((inner+outer)/2,160,inner,284);ctx.lineTo(outer,284);ctx.quadraticCurveTo(outer+10,155,outer,91);ctx.closePath();ctx.fill();};
      drawCurtain(57,112);drawCurtain(260,315);
      ctx.fillStyle="#493c50";roundedRect(92,330,305,118,22);ctx.fill();ctx.fillStyle="#5d4b63";roundedRect(110,300,128,83,20);ctx.fill();roundedRect(244,300,132,83,20);ctx.fill();
      ctx.strokeStyle="#2d2831";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(242,312);ctx.lineTo(242,430);ctx.stroke();
      ctx.fillStyle="#201b22";ctx.fillRect(455,390,240,16);ctx.fillRect(478,406,12,56);ctx.fillRect(660,406,12,56);
      ctx.fillStyle="#5a3744";ctx.beginPath();ctx.ellipse(525,478,280,45,0,0,Math.PI*2);ctx.fill();
      // Low bookshelf, clear of climbing foliage.
      ctx.fillStyle="#332b2c";ctx.fillRect(790,250,135,140);ctx.strokeStyle="#887060";ctx.lineWidth=5;ctx.strokeRect(790,250,135,140);for(let sy=296;sy<380;sy+=44){ctx.beginPath();ctx.moveTo(792,sy);ctx.lineTo(923,sy);ctx.stroke();}
      ctx.fillStyle="#765c4c";for(let bx=800;bx<915;bx+=15){ctx.fillRect(bx,260+(bx%3)*4,9,31);ctx.fillRect(bx,305+(bx%4)*3,10,31);}
      // Framed portraits of the household management team.
      ctx.strokeStyle="#806e64";ctx.lineWidth=4;ctx.strokeRect(470,105,105,78);ctx.strokeRect(600,120,92,70);
      ctx.fillStyle="#c5ad91";ctx.fillRect(475,110,95,68);ctx.fillRect(605,125,82,60);
      drawPortraitDog(522,145,"dalmatian");drawPortraitDog(646,153,"frenchie");
      // Background potted plant.
      ctx.fillStyle="#7d5237";ctx.beginPath();ctx.moveTo(714,374);ctx.lineTo(759,374);ctx.lineTo(752,402);ctx.lineTo(721,402);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#426642";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(737,374);ctx.lineTo(737,302);ctx.stroke();
      for(const [lx,ly,a] of [[737,326,-.8],[737,341,.7],[737,356,-.7],[737,310,.6]])drawPlantLeaf(lx,ly,a,"#517b4b",27,11);
      ctx.strokeStyle="#9d8266";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(735,185);ctx.lineTo(735,390);ctx.stroke();ctx.fillStyle="#b78c62";ctx.beginPath();ctx.moveTo(694,188);ctx.lineTo(776,188);ctx.lineTo(756,128);ctx.lineTo(714,128);ctx.closePath();ctx.fill();
    } else if (level.decor === "underwater") {
      const water = ctx.createLinearGradient(0,55,0,H);
      water.addColorStop(0,"rgba(51,194,211,.18)");water.addColorStop(1,"rgba(0,35,58,.76)");
      ctx.fillStyle=water;ctx.fillRect(0,55,W,H-55);
      ctx.strokeStyle="rgba(166,247,238,.22)";ctx.lineWidth=4;
      for(let x=30;x<W;x+=120){ctx.beginPath();ctx.moveTo(x,75);ctx.quadraticCurveTo(x+50,95,x+100,75);ctx.stroke();}
      ctx.fillStyle="#253e3b";ctx.fillRect(0,500,W,40);
      // Rounded aquarium gravel in mixed natural tones.
      const gravelColors=["#6d806c","#465e58","#8d735a","#b79a72","#38505a"];
      for(let row=0;row<3;row++){for(let x=8+(row%2)*9;x<W;x+=19){ctx.fillStyle=gravelColors[(Math.floor(x/19)+row)%gravelColors.length];ctx.beginPath();ctx.ellipse(x,503+row*10,10,6,(x%7)*.08,0,Math.PI*2);ctx.fill();}}
      drawUnderwaterPlant(105,500,88,"#3e8a5a");drawUnderwaterPlant(390,500,64,"#4b9a63");drawUnderwaterPlant(670,500,104,"#39794f");
    }
  }

  function drawLeaves(x, y, color) {
    ctx.strokeStyle=color;ctx.lineWidth=4;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x-12,y+12);ctx.bezierCurveTo(x+32,y-16,x+92,y-18,x+158,y-58);ctx.stroke();
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
    ctx.strokeStyle="rgba(62,111,49,.75)";ctx.lineWidth=2;
    for(let i=1;i<6;i+=2){const sx=x+i*24;const sy=y-(i%3)*28;ctx.beginPath();ctx.moveTo(sx-5,sy+4);ctx.bezierCurveTo(sx-8,sy+20,sx+6,sy+26,sx+2,sy+42);ctx.stroke();}
  }

  function drawDalmatianSprite(w=88,h=54){
    ctx.save();
    ctx.fillStyle="#f5f3e8";roundedRect(29,10,w-35,h-18,12);ctx.fill();
    ctx.strokeStyle="#f5f3e8";ctx.lineWidth=6;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(w-11,14);ctx.quadraticCurveTo(w+7,4,w+2,-6);ctx.stroke();
    ctx.fillStyle="#111318";ctx.beginPath();ctx.arc(w-1,-3,3,0,Math.PI*2);ctx.arc(w+3,2,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f5f3e8";ctx.beginPath();ctx.arc(20,18,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#111318";ctx.beginPath();ctx.ellipse(24,8,7,12,.45,0,Math.PI*2);ctx.fill();
    [[39,16,5],[50,28,3],[56,12,4],[66,18,2.5],[70,30,5],[78,13,3],[33,31,3]].forEach(([sx,sy,r])=>{ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();});
    ctx.fillRect(38,h-18,7,18);ctx.fillRect(w-23,h-18,7,18);
    ctx.fillStyle="#eee6da";ctx.beginPath();ctx.ellipse(7,25,15,9,-.08,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#b9a99e";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(7,25,15,9,-.08,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#090a0b";ctx.beginPath();ctx.ellipse(-4,22,6,5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#403735";ctx.beginPath();ctx.moveTo(1,29);ctx.quadraticCurveTo(9,34,17,28);ctx.stroke();
    ctx.fillStyle="#74462d";ctx.beginPath();ctx.arc(15,16,2.6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#17110d";ctx.beginPath();ctx.arc(15.5,16,1.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#c84d4d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,11);ctx.lineTo(30,32);ctx.stroke();
    ctx.restore();
  }

  function drawFrenchieSprite(w=78,h=40){
    ctx.save();
    ctx.fillStyle="#20252a";roundedRect(23,12,w-29,h-13,11);ctx.fill();roundedRect(8,9,27,25,9);ctx.fill();
    ctx.beginPath();ctx.moveTo(10,13);ctx.quadraticCurveTo(8,1,14,0);ctx.quadraticCurveTo(20,1,20,13);ctx.moveTo(23,13);ctx.quadraticCurveTo(23,1,29,1);ctx.quadraticCurveTo(35,3,32,15);ctx.fill();
    ctx.fillStyle="#c49a76";ctx.beginPath();ctx.ellipse(10,25,7,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(13,16,4,2.5,0,0,Math.PI*2);ctx.ellipse(27,16,4,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillRect(30,h-13,7,13);ctx.fillRect(w-21,h-13,7,13);ctx.beginPath();ctx.moveTo(39,20);ctx.lineTo(48,35);ctx.lineTo(57,35);ctx.lineTo(50,20);ctx.fill();
    ctx.fillStyle="#171a1e";ctx.beginPath();ctx.ellipse(5,23,4,3.6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#171a1e";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(7,27);ctx.lineTo(10,29);ctx.quadraticCurveTo(13,30,16,27);ctx.stroke();
    ctx.strokeStyle="#9c7457";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(10,19);ctx.lineTo(10,26);ctx.stroke();
    ctx.fillStyle="#c9b06c";ctx.beginPath();ctx.arc(14,20,1.7,0,Math.PI*2);ctx.arc(26,20,1.7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#171b1f";ctx.beginPath();ctx.arc(w-5,17,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawPortraitDog(x,y,type){
    ctx.save();ctx.translate(x,y);
    if(type==="dalmatian"){ctx.scale(.7,.7);ctx.translate(-44,-27);drawDalmatianSprite();}
    else{ctx.scale(.8,.8);ctx.translate(-39,-20);drawFrenchieSprite();}
    ctx.restore();
  }

  function drawMossFloor(y=474){
    ctx.fillStyle="#344f32";
    for(let x=18;x<942;x+=24){const lift=5+Math.sin(x*.08)*4;ctx.beginPath();ctx.arc(x,y-lift,16,Math.PI,Math.PI*2);ctx.fill();}
    ctx.fillStyle="#668251";for(let x=25;x<940;x+=37){ctx.beginPath();ctx.arc(x,y-9-(x%3)*2,3,0,Math.PI*2);ctx.fill();}
  }

  function drawCorkBark(x,y,w,h,alpha=1){
    ctx.save();ctx.globalAlpha*=alpha;ctx.fillStyle="#553820";roundedRect(x,y,w,h,16);ctx.fill();
    ctx.strokeStyle="#98704a";ctx.lineWidth=3;
    for(let row=y+15;row<y+h-8;row+=25){ctx.beginPath();ctx.moveTo(x+8,row);for(let px=x+20;px<x+w-6;px+=18)ctx.lineTo(px,row+Math.sin(px*.17+row)*7);ctx.stroke();}
    ctx.strokeStyle="#2f2419";ctx.lineWidth=2;for(let px=x+14;px<x+w;px+=24){ctx.beginPath();ctx.moveTo(px,y+8);ctx.lineTo(px-7,y+h-8);ctx.stroke();}
    ctx.restore();
  }

  function drawUnderwaterPlant(x, baseY, height, color) {
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=5;ctx.lineCap="round";
    for(let i=-1;i<=1;i++){
      ctx.beginPath();ctx.moveTo(x,baseY);
      ctx.bezierCurveTo(x+i*20,baseY-height*.32,x-i*18,baseY-height*.7,x+i*14,baseY-height);ctx.stroke();
      for(let step=1;step<=3;step++){
        const py=baseY-height*(step*.23);const px=x+Math.sin(step+i)*8;
        drawPlantLeaf(px,py,i<0?Math.PI-.5:.5,color,13,5);
      }
    }
    ctx.restore();
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
      ctx.fillStyle="#443326";ctx.fillRect(72,414,76,65);drawLeaves(58,380,"#315b35");
    }else if(level.habitat==="crested"){
      drawCorkBark(710,92,92,318,1);drawCorkBark(310,115,66,195,.42);drawCorkBark(835,210,55,180,.38);drawMossFloor(492);
    }else if(level.habitat==="newt"){
      const water=ctx.createLinearGradient(0,270,0,500);water.addColorStop(0,"rgba(76,196,202,.28)");water.addColorStop(1,"rgba(20,93,109,.58)");ctx.fillStyle=water;ctx.fillRect(20,270,500,226);
      ctx.strokeStyle="rgba(180,248,239,.55)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(20,270);ctx.quadraticCurveTo(145,261,270,270);ctx.quadraticCurveTo(395,279,520,270);ctx.stroke();
      ctx.fillStyle="#52635c";for(const [x,y,r] of [[490,450,34],[555,465,24],[620,444,38]]){ctx.beginPath();ctx.arc(x,y,r,Math.PI,Math.PI*2);ctx.fill();}
      drawUnderwaterPlant(72,492,110,"#3f8357");drawUnderwaterPlant(176,492,82,"#579b64");drawUnderwaterPlant(340,492,125,"#397950");drawMossFloor(496);
    }else if(level.habitat==="frog"){
      ctx.fillStyle="#4d3924";ctx.fillRect(20,458,920,38);for(let x=30;x<930;x+=34){ctx.fillStyle=x%68?"#765133":"#3b592f";ctx.beginPath();ctx.ellipse(x,462,28,8,-.25,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#27643b";for(const x of [130,520,820]){for(let i=0;i<6;i++){ctx.save();ctx.translate(x,405);ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.ellipse(0,-25,9,30,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
    }else if(level.habitat==="boa"){
      ctx.fillStyle="#4b3524";ctx.fillRect(20,462,920,34);ctx.fillStyle="#6b4a2e";for(let x=25;x<940;x+=19){ctx.beginPath();ctx.ellipse(x,470+(x%5)*4,13,6,.2,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#29231b";roundedRect(695,390,175,106,22);ctx.fill();roundedRect(92,390,168,106,22);ctx.fill();
      ctx.fillStyle="#090a08";ctx.beginPath();ctx.arc(780,456,42,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(176,456,39,Math.PI,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#4d3421";ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(90,438);ctx.quadraticCurveTo(290,365,470,430);ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlantLeaf(x, y, angle, color, length = 15, width = 6) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.bezierCurveTo(length*.3,-width,length*.78,-width*.72,length,0);
    ctx.bezierCurveTo(length*.72,width*.72,length*.28,width,0,0);ctx.fill();
    ctx.strokeStyle="rgba(210,245,176,.28)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(2,0);ctx.lineTo(length*.78,0);ctx.stroke();ctx.restore();
  }

  function drawClimbablePlant(v, level) {
    const [x,y,w,h]=v;
    const cx=x+w/2;
    const underwater=Boolean(level.underwater);
    ctx.save();ctx.lineCap="round";
    ctx.strokeStyle=underwater?"#376e4c":"#573a25";
    ctx.lineWidth=Math.max(8,w*.72);
    ctx.beginPath();ctx.moveTo(cx,y+h);
    ctx.bezierCurveTo(x-8,y+h*.68,x+w+12,y+h*.36,cx,y);ctx.stroke();
    ctx.strokeStyle=underwater?"#78b96d":"#9a744b";ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(cx-2,y+h-4);
    ctx.bezierCurveTo(x-9,y+h*.68,x+w+9,y+h*.36,cx-1,y+4);ctx.stroke();
    for(let offset=18,index=0;offset<h-8;offset+=27,index++){
      const leafY=y+h-offset;
      const leafX=cx+Math.sin(offset*.08)*7;
      const direction=index%2===0?-1:1;
      ctx.strokeStyle=underwater?"#4d8c58":"#426b34";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(leafX,leafY);ctx.lineTo(leafX+direction*15,leafY-7);ctx.stroke();
      drawPlantLeaf(leafX+direction*13,leafY-7,direction<0?Math.PI-.22:.22,underwater?"#4f9b61":"#4f873d",underwater?18:16,underwater?5:7);
      if(index%3===1)drawPlantLeaf(leafX,leafY-4,-Math.PI/2,underwater?"#67ad6e":"#659b47",14,6);
      if(!underwater&&index%3===0){ctx.strokeStyle="#426d35";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(leafX+direction*8,leafY-3);ctx.bezierCurveTo(leafX+direction*17,leafY+8,leafX+direction*5,leafY+18,leafX+direction*12,leafY+28);ctx.stroke();}
    }
    if(!underwater){
      ctx.fillStyle="#668448";
      for(let offset=12;offset<h;offset+=22){const my=y+h-offset;const mx=cx+Math.sin(offset*.11)*5;ctx.beginPath();ctx.ellipse(mx,my,6,3,.2,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }

  function drawDiagonalVine(v){
    const [x1,y1,x2,y2,width]=v;
    ctx.save();ctx.lineCap="round";
    ctx.strokeStyle="#4b3322";ctx.lineWidth=width||18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle="#8c6842";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1+2,y1-2);ctx.lineTo(x2+2,y2-2);ctx.stroke();
    const steps=5;
    for(let i=1;i<steps;i++){const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;drawPlantLeaf(x,y,i%2?.7:Math.PI-.7,i%2?"#526f3b":"#648449",18,7);}
    ctx.restore();
  }

  function drawAngledPlatform(platform,level){
    const [x1,y1,x2,y2,width]=platform;
    ctx.save();ctx.lineCap="round";
    ctx.strokeStyle=level.palette[2];ctx.lineWidth=width||18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,.18)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1-2,y1-4);ctx.lineTo(x2-2,y2-4);ctx.stroke();
    ctx.restore();
  }

  function drawCeilingVine(v) {
    const [x,y,w,h,kind]=v;const cy=y+h/2;
    ctx.save();ctx.lineCap="round";
    if(kind==="curved"){
      ctx.strokeStyle="#356b3c";ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x,cy);
      const sections=8,step=w/sections;
      for(let i=0;i<sections;i++){const start=x+i*step;const end=start+step;const bend=i%2===0?18:-18;ctx.quadraticCurveTo(start+step/2,cy+bend,end,cy);}
      ctx.stroke();
      ctx.strokeStyle="#75a957";ctx.lineWidth=2;ctx.stroke();
      for(let px=x+28,index=0;px<x+w-20;px+=38,index++){const py=cy+Math.sin((px-x)/w*Math.PI*8)*11;drawPlantLeaf(px,py,index%2?-.8:.8,index%2?"#4c8e48":"#65a653",19,8);}
      ctx.restore();return;
    }
    ctx.strokeStyle="#4b3322";ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(x,cy);ctx.bezierCurveTo(x+w*.3,cy+8,x+w*.7,cy-8,x+w,cy);ctx.stroke();
    ctx.strokeStyle="#5d8d42";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+4,cy-3);ctx.bezierCurveTo(x+w*.32,cy+3,x+w*.66,cy-12,x+w-5,cy-2);ctx.stroke();
    for(let px=x+22,index=0;px<x+w-18;px+=42,index++){
      const direction=index%2===0?1:-1;
      drawPlantLeaf(px,cy+direction*2,direction>0?Math.PI/2:-Math.PI/2,"#548c42",18,7);
      if(index%3===1){ctx.strokeStyle="#4b793c";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+8,cy);ctx.bezierCurveTo(px+17,cy+15,px+5,cy+29,px+14,cy+43);ctx.stroke();}
    }
    ctx.restore();
  }

  function ceilingVineY(v,worldX){
    const [x,y,w,h,kind]=v;const cy=y+h/2;
    if(kind!=="curved")return cy;
    const progress=Math.max(0,Math.min(1,(worldX-x)/w));
    return cy+Math.sin(progress*Math.PI*8)*11;
  }

  function drawPlatforms(level) {
    for (const p of level.platforms) {
      if(level.decor==="kitchen"&&p[4]==="fridgeTop"){
        // The refrigerator artwork itself is the collision surface.
        continue;
      }else if(level.decor==="kitchen"&&p[4]==="sill"){
        ctx.fillStyle="#d8c5a4";roundedRect(p[0],p[1],p[2],p[3],3);ctx.fill();
        ctx.fillStyle="#8b775f";ctx.fillRect(p[0]+4,p[1]+p[3]-4,p[2]-8,4);
        ctx.fillStyle="rgba(255,255,255,.38)";ctx.fillRect(p[0]+7,p[1]+3,p[2]-14,3);
      }else if(level.decor==="kitchen"&&p[4]==="sink"){
        ctx.fillStyle="#aeb5b6";roundedRect(p[0],p[1],p[2],p[3],5);ctx.fill();
        ctx.fillStyle="#526067";ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+9,55,7,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#e0e4e4";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+8,58,8,0,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle="#c8ced0";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(p[0]+p[2]/2-7,p[1]);ctx.arc(p[0]+p[2]/2+8,p[1]-10,15,Math.PI,Math.PI*2);ctx.lineTo(p[0]+p[2]/2+23,p[1]-3);ctx.stroke();
      }else if(level.decor==="kitchen"&&p[4]==="counter"){
        // Marble worktop with a cabinet face, so routes read as part of the kitchen.
        ctx.fillStyle="#d6d0c3";roundedRect(p[0],p[1],p[2],Math.min(10,p[3]),3);ctx.fill();
        ctx.fillStyle="#776655";ctx.fillRect(p[0]+5,p[1]+10,p[2]-10,p[3]-10);
        ctx.strokeStyle="#9b8974";ctx.lineWidth=2;
        for(let doorX=p[0]+8;doorX<p[0]+p[2]-24;doorX+=62){ctx.strokeRect(doorX,p[1]+12,52,Math.max(4,p[3]-15));}
        ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillRect(p[0]+6,p[1]+3,p[2]-12,2);
      }else if(level.decor==="kitchen"&&p[4]==="spiceShelf"){
        ctx.fillStyle="#9a7454";roundedRect(p[0],p[1],p[2],p[3],3);ctx.fill();
        ctx.fillStyle="#d8c5a4";ctx.fillRect(p[0]+4,p[1]+2,p[2]-8,4);
        ctx.fillStyle="#5b493b";ctx.beginPath();ctx.moveTo(p[0]+14,p[1]+p[3]);ctx.lineTo(p[0]+25,p[1]+p[3]+12);ctx.lineTo(p[0]+34,p[1]+p[3]);ctx.fill();ctx.beginPath();ctx.moveTo(p[0]+p[2]-34,p[1]+p[3]);ctx.lineTo(p[0]+p[2]-25,p[1]+p[3]+12);ctx.lineTo(p[0]+p[2]-14,p[1]+p[3]);ctx.fill();
        const spiceColors=["#c4773d","#d0a84a","#8d4b38","#628352","#b6b0a3"];
        spiceColors.forEach((color,index)=>{const jarX=p[0]+10+index*23;ctx.fillStyle=color;roundedRect(jarX,p[1]-23,15,23,3);ctx.fill();ctx.fillStyle="#ded8c8";ctx.fillRect(jarX+2,p[1]-20,11,4);});
      }else if(level.decor==="enclosure"&&p[1]<490){
        const y=p[1]+p[3]/2;
        ctx.strokeStyle="#51351f";ctx.lineWidth=p[3];ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(p[0]+5,y);ctx.quadraticCurveTo(p[0]+p[2]*.48,y-7,p[0]+p[2]-5,y+2);ctx.stroke();
        ctx.fillStyle="#5f8144";
        for(let bx=p[0]+14;bx<p[0]+p[2]-10;bx+=18){const by=y-5-Math.sin(bx*.09)*3;ctx.beginPath();ctx.moveTo(bx-9,by+3);ctx.quadraticCurveTo(bx-5,by-5,bx,by+1);ctx.quadraticCurveTo(bx+5,by-7,bx+10,by+3);ctx.closePath();ctx.fill();}
        ctx.strokeStyle="#624125";ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(p[0]+p[2]*.3,y-5);ctx.lineTo(p[0]+p[2]*.2,y-22);ctx.moveTo(p[0]+p[2]*.72,y);ctx.lineTo(p[0]+p[2]*.82,y-17);ctx.stroke();
      }else{
        ctx.fillStyle = p[1] >= 490 ? "#111914" : level.palette[2];
        roundedRect(p[0], p[1], p[2], p[3], 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(p[0] + 7, p[1] + 3, Math.max(0, p[2] - 14), 2);
      }
    }
    for (const v of level.vines) drawClimbablePlant(v,level);
    for (const p of level.angledPlatforms||[]) {
      if(level.decor==="kitchen"){
        const [x1,y1,x2,y2,width]=p;
        ctx.save();ctx.lineCap="round";ctx.strokeStyle="#8d7358";ctx.lineWidth=width||18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle="#d8c5a4";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1-3);ctx.lineTo(x2,y2-3);ctx.stroke();ctx.restore();
      }else drawAngledPlatform(p,level);
    }
    for (const v of level.diagonalVines||[]) drawDiagonalVine(v);
    for (const v of level.ceilingVines||[]) drawCeilingVine(v);
  }

  function drawExit(level) {
    const [x,y,w,h] = level.exit;
    const remaining=remainingCollectibles(level);
    const locked=remaining>0;
    const glow = ctx.createRadialGradient(x+w/2,y+h/2,2,x+w/2,y+h/2,70);
    glow.addColorStop(0, locked?"rgba(190,62,52,.34)":level.palette[3] + "88"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(x-50,y-45,w+100,h+90);
    ctx.fillStyle = "#020604"; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = locked?"#c75b4e":level.palette[3]; ctx.lineWidth = 3; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle = locked?"#df7b6c":level.palette[3];
    const exitLabel = locked?`${remaining} PREY LEFT`:level.underwater ? "FILTER OUT" : "EXIT";
    ctx.font = "900 12px system-ui"; ctx.textAlign = "center"; ctx.fillText(exitLabel, x+w/2, y-10);
    ctx.font = "900 24px system-ui";
    ctx.fillText(locked?"×":"↓", x+w/2, y-28);
    if(locked){ctx.strokeStyle="#c75b4e";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+7,y+8);ctx.lineTo(x+w-7,y+h-8);ctx.moveTo(x+w-7,y+8);ctx.lineTo(x+7,y+h-8);ctx.stroke();}
  }

  function drawInsects(level, time) {
    level.insects.forEach((bug, i) => {
      if (bug[2]) return;
      const bob = Math.sin(time * .004 + i * 2) * 4;
      ctx.save(); ctx.translate(bug[0], bug[1] + bob);
      if(selectedCharacter==="boa"){
        // Large, rough feeder rat, deliberately distinct from the little house mice.
        ctx.strokeStyle="#8b6b61";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,8);ctx.bezierCurveTo(-38,17,-45,-4,-58,5);ctx.stroke();
        ctx.fillStyle="#625b59";ctx.beginPath();ctx.moveTo(-24,4);ctx.quadraticCurveTo(-14,-15,8,-12);ctx.quadraticCurveTo(28,-8,30,7);ctx.quadraticCurveTo(8,20,-23,11);ctx.closePath();ctx.fill();
        ctx.fillStyle="#504a49";ctx.beginPath();ctx.moveTo(12,-8);ctx.lineTo(34,-13);ctx.lineTo(43,-4);ctx.lineTo(39,10);ctx.lineTo(22,13);ctx.closePath();ctx.fill();
        ctx.fillStyle="#a7847b";ctx.beginPath();ctx.arc(17,-11,8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#4c4443";ctx.beginPath();ctx.arc(17,-11,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#d24f4f";ctx.beginPath();ctx.arc(32,-5,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ce9188";ctx.beginPath();ctx.arc(43,1,3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ece1cf";ctx.beginPath();ctx.moveTo(38,7);ctx.lineTo(43,14);ctx.lineTo(46,7);ctx.fill();
        ctx.strokeStyle="#d8d0c8";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(37,2);ctx.lineTo(57,-4);ctx.moveTo(37,4);ctx.lineTo(58,6);ctx.moveTo(37,6);ctx.lineTo(54,14);ctx.stroke();
        ctx.strokeStyle="#302c2b";ctx.lineWidth=2;for(let fx=-17;fx<15;fx+=8){ctx.beginPath();ctx.moveTo(fx,-7);ctx.lineTo(fx-4,-12);ctx.stroke();}
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

  function drawMice(level,time){
    (level.mice||[]).forEach((mouse,index)=>{
      if(mouse[2])return;const bob=Math.sin(time*.004+index)*2;
      ctx.save();ctx.translate(mouse[0],mouse[1]+bob);
      ctx.strokeStyle="#b99384";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,5);ctx.bezierCurveTo(-21,9,-25,1,-31,4);ctx.stroke();
      ctx.fillStyle="#91817b";ctx.beginPath();ctx.ellipse(0,2,12,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(10,0,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#c7aaa0";ctx.beginPath();ctx.arc(8,-6,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#151515";ctx.beginPath();ctx.arc(13,-1,1.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d8a2a2";ctx.beginPath();ctx.arc(17,2,2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#d8d0c8";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(15,3);ctx.lineTo(25,0);ctx.moveTo(15,4);ctx.lineTo(25,7);ctx.stroke();ctx.restore();
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
    if(h.defeated)return;
    ctx.save();
    ctx.translate(h.x, h.y);
    if (now < (h.stunnedUntil || 0)) ctx.globalAlpha = .48;
    if (h.type === "cat") {
      ctx.fillStyle="#151416";roundedRect(0,4,h.w,h.h-4,9);ctx.fill();
      ctx.beginPath();ctx.moveTo(8,7);ctx.lineTo(13,-4);ctx.lineTo(20,7);ctx.moveTo(24,7);ctx.lineTo(32,-4);ctx.lineTo(39,8);ctx.fill();
      ctx.fillStyle="#d8f56d";ctx.fillRect(13,10,4,3);ctx.fillRect(22,10,4,3);
      ctx.strokeStyle="#151416";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(h.w-4,12);ctx.quadraticCurveTo(h.w+18,-2,h.w+12,-15);ctx.stroke();
    } else if (h.type === "dalmatian") {
      drawDalmatianSprite(h.w,h.h);
    } else if (h.type === "frenchie") {
      drawFrenchieSprite(h.w,h.h);
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
    } else if (h.type === "slipper") {
      ctx.fillStyle="#d7aa86";roundedRect(0,0,28,h.h,9);ctx.fill();
      ctx.fillStyle="#24252a";ctx.beginPath();ctx.moveTo(17,14);ctx.quadraticCurveTo(48,5,h.w-5,19);ctx.lineTo(h.w,34);ctx.lineTo(23,34);ctx.closePath();ctx.fill();
      ctx.fillStyle="#666a73";roundedRect(26,18,h.w-34,10,5);ctx.fill();
      ctx.fillStyle="#111318";ctx.fillRect(20,h.h-6,h.w-20,6);
    } else if(h.type==="spider"){
      ctx.strokeStyle="rgba(210,210,205,.55)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(h.w/2,-170);ctx.lineTo(h.w/2,4);ctx.stroke();
      ctx.strokeStyle="#17151a";ctx.lineWidth=3;for(let side=-1;side<=1;side+=2){for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(h.w/2+side*5,14+i*2);ctx.lineTo(h.w/2+side*(14+i*2),6+i*6);ctx.lineTo(h.w/2+side*(20+i*2),10+i*6);ctx.stroke();}}
      ctx.fillStyle="#242026";ctx.beginPath();ctx.ellipse(h.w/2,17,8,11,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(h.w/2,7,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d66c48";ctx.beginPath();ctx.arc(h.w/2-2,5,1.3,0,Math.PI*2);ctx.arc(h.w/2+2,5,1.3,0,Math.PI*2);ctx.fill();
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

    // Side view: one visible foreleg and one visible hind leg with adhesive toe pads.
    ctx.strokeStyle = green; ctx.lineWidth = 4;
    const feet = [[-9,5,-17,14,-27,13],[8,5,15,13,25,12]];
    feet.forEach(([x1,y1,x2,y2,x3,y3]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
      ctx.fillStyle=green;
      ctx.beginPath();ctx.ellipse(x3,y3,4,2.5,-.12,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=green;ctx.lineWidth=1.3;
      for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(x3+1,y3+toe);ctx.lineTo(x3+7,y3+toe*2);ctx.stroke();}
      ctx.strokeStyle=green;ctx.lineWidth=4;
    });

    // Slender body and broad, flat-topped wedge head with a distinct blunt snout.
    ctx.fillStyle = green;
    ctx.beginPath(); ctx.ellipse(-1,0,20,9,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8,-7);ctx.quadraticCurveTo(19,-11,33,-8);ctx.lineTo(40,-3);
    ctx.lineTo(39,4);ctx.quadraticCurveTo(27,9,10,7);ctx.quadraticCurveTo(16,0,8,-7);ctx.fill();

    // Raised eye turret and the little mouth line make the front unmistakable.
    ctx.beginPath();ctx.ellipse(25,-8,6,5,-.08,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#714b2f";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(24,3);ctx.quadraticCurveTo(32,6,39,2);ctx.stroke();

    // Eyelash crests continue from above the eye down the back.
    ctx.fillStyle=green;
    ctx.beginPath();
    ctx.moveTo(30,-10);ctx.lineTo(31,-17);ctx.lineTo(26,-11);
    ctx.lineTo(25,-16);ctx.lineTo(21,-10);
    ctx.lineTo(19,-15);ctx.lineTo(15,-9);
    ctx.lineTo(12,-13);ctx.lineTo(8,-8);
    ctx.lineTo(4,-12);ctx.lineTo(0,-8);
    ctx.lineTo(-5,-11);ctx.lineTo(-10,-7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle="#d9c577";ctx.beginPath();ctx.ellipse(26,-9,3.6,4.2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#071008";ctx.beginPath();ctx.ellipse(27,-9,1.4,3.1,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff6c5";ctx.beginPath();ctx.arc(27,-10,1,0,Math.PI*2);ctx.fill();
    if(now<tongueActiveUntil){const progress=Math.min(1,Math.max(0,(now-(tongueActiveUntil-230))/230));const extension=Math.sin(progress*Math.PI)*48;ctx.strokeStyle="#ef829a";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(39,1);ctx.lineTo(39+extension,1);ctx.stroke();ctx.fillStyle="#ff9db0";ctx.beginPath();ctx.ellipse(41+extension,1,4,2.8,0,0,Math.PI*2);ctx.fill();}

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawChameleon(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const chameleonColors=["#79a94d","#d8aa45","#43a4a0","#a565bd","#cf654f"];
    const green=now<camouflageUntil?chameleonColors[Math.floor(now/170)%chameleonColors.length]:chameleonColors[chameleonColorIndex];
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
    if(now<regenerateUntil){
      const pulse=4+Math.sin(now*.018)*3;
      ctx.strokeStyle="rgba(105,244,174,.82)";ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(0,0,40+pulse,21+pulse*.45,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="rgba(105,244,174,.72)";
      [[-31,-17],[4,-23],[34,-10],[-24,19],[24,17]].forEach(([x,y],i)=>{ctx.beginPath();ctx.arc(x,y,1.8+Math.sin(now*.012+i)*.7,0,Math.PI*2);ctx.fill();});
    }
    if(now<toxinActiveUntil){ctx.strokeStyle="rgba(255,105,49,.72)";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,43,24,0,0,Math.PI*2);ctx.stroke();}
    const dark=characters.newt.color;
    ctx.strokeStyle=dark;ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-12,1);ctx.bezierCurveTo(-29,0,-38,5,-49,1);ctx.stroke();
    ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(-1,0,22,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(20,-1,12,9,0,0,Math.PI*2);ctx.fill();
    // Bright orange-red underside with the irregular black markings of a fire-belly newt.
    ctx.fillStyle="#ef542f";ctx.beginPath();ctx.moveTo(-18,2);ctx.quadraticCurveTo(-5,10,12,7);ctx.quadraticCurveTo(21,6,27,2);ctx.quadraticCurveTo(10,5,-18,2);ctx.fill();
    ctx.fillStyle="#ff9a35";ctx.beginPath();ctx.ellipse(-8,5,5,2.2,.12,0,Math.PI*2);ctx.ellipse(13,4,5,2,-.18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#171918";[[-14,4,2.2],[-1,6,2.5],[7,4,1.8],[20,3,2.2]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(x,y,r,r*.62,.2,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle=dark;ctx.lineWidth=3;
    [[-8,5,-17,13],[8,5,17,13]].forEach(([x,y,x2,y2])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.lineTo(x2+6,y2);ctx.moveTo(x2+3,y2);ctx.lineTo(x2+7,y2-3);ctx.moveTo(x2+3,y2);ctx.lineTo(x2+7,y2+3);ctx.stroke();});
    ctx.fillStyle="#f4cb64";ctx.beginPath();ctx.arc(24,-4,2,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawFrog(now) {
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;
    if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const blue=characters.frog.color;
    const airborne=!player.grounded;
    const underwater=Boolean(levels[levelIndex]?.underwater);
    const rising=airborne?Math.max(0,Math.min(1,-player.vy/535)):0;
    const falling=airborne?Math.max(0,Math.min(1,player.vy/480)):0;
    const swimmingKick=underwater&&(Math.abs(player.vx)+Math.abs(player.vy)>12)?(.5+.5*Math.sin(now*.014)):0;
    const push=underwater?swimmingKick*.8:rising;
    const landing=underwater?0:falling;
    const lerp=(a,b,t)=>a+(b-a)*t;
    // At take-off the hind legs extend, at the apex they tuck under the body,
    // and during descent the feet reach forward to absorb the landing.
    const tuck={kneeX:-18,kneeY:11,ankleX:-4,ankleY:15,toeX:-15,toeY:17,elbowX:15,elbowY:8,wristX:24,wristY:9};
    const launch={kneeX:-22,kneeY:5,ankleX:-38,ankleY:7,toeX:-52,toeY:10,elbowX:18,elbowY:5,wristX:31,wristY:3};
    const land={kneeX:-14,kneeY:12,ankleX:3,ankleY:15,toeX:16,toeY:18,elbowX:18,elbowY:10,wristX:31,wristY:15};
    const pose={};
    for(const key of Object.keys(tuck))pose[key]=landing>0?lerp(tuck[key],land[key],landing):lerp(tuck[key],launch[key],push);
    if(!airborne&&!underwater){Object.assign(pose,{kneeX:-20,kneeY:13,ankleX:-5,ankleY:16,toeX:-19,toeY:18,elbowX:17,elbowY:9,wristX:27,wristY:11});}
    const hindToeDirection=landing>.12?1:-1;
    const drawLeg=(color,offsetX,offsetY,near=true)=>{
      ctx.strokeStyle=color;ctx.lineCap="round";
      ctx.lineWidth=near?6:4.5;ctx.beginPath();ctx.moveTo(-7+offsetX,5+offsetY);ctx.lineTo(pose.kneeX+offsetX,pose.kneeY+offsetY);ctx.lineTo(pose.ankleX+offsetX,pose.ankleY+offsetY);ctx.lineTo(pose.toeX+offsetX,pose.toeY+offsetY);ctx.stroke();
      ctx.lineWidth=near?4:3;ctx.beginPath();ctx.moveTo(10+offsetX,3+offsetY);ctx.lineTo(pose.elbowX+offsetX,pose.elbowY+offsetY);ctx.lineTo(pose.wristX+offsetX,pose.wristY+offsetY);ctx.stroke();
      ctx.lineWidth=1.8;ctx.beginPath();[-3,0,3].forEach(toe=>{ctx.moveTo(pose.toeX+offsetX,pose.toeY+offsetY);ctx.lineTo(pose.toeX+hindToeDirection*8+offsetX,pose.toeY+toe+offsetY);ctx.moveTo(pose.wristX+offsetX,pose.wristY+offsetY);ctx.lineTo(pose.wristX+7+offsetX,pose.wristY+toe*.65+offsetY);});ctx.stroke();
    };
    drawLeg("#15569a",3,1.5,false);
    drawLeg(blue,0,0,true);
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
    const moving=Math.min(1,Math.abs(player.vx)/110);
    const slitherPhase=now*.026;
    const tailWave=moving*Math.sin(slitherPhase)*10;
    const midWave=moving*Math.sin(slitherPhase+1.7)*11;
    const neckWave=moving*Math.sin(slitherPhase+3.25)*8;
    ctx.strokeStyle=dark;ctx.lineWidth=15;ctx.lineCap="round";
    if(now<constrictPulseUntil){
      ctx.beginPath();ctx.ellipse(-22,4,32,14,-.08,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=11;ctx.beginPath();ctx.ellipse(-17,1,22,9,.1,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#414448";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-21,4,29,12,-.08,0,Math.PI*2);ctx.stroke();
    }else{
      ctx.beginPath();ctx.moveTo(-64,5+tailWave*.55);
      ctx.bezierCurveTo(-53,-17+tailWave,-40,19-midWave,-25,3+midWave*.35);
      ctx.bezierCurveTo(-10,-18+midWave,4,15-neckWave,20,-1+neckWave*.3);ctx.stroke();
    }
    const strikeProgress=now<strikeActiveUntil?Math.max(0,1-(strikeActiveUntil-now)/300):0;
    const lunge=now<strikeActiveUntil?Math.sin(strikeProgress*Math.PI)*38:0;
    const headWave=now<constrictPulseUntil?0:neckWave*.35;
    ctx.strokeStyle=dark;ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(now<constrictPulseUntil?-1:14,-1+headWave);ctx.quadraticCurveTo(20+lunge*.45,-5+headWave,24+lunge,-2+headWave);ctx.stroke();
    ctx.save();ctx.translate(lunge,headWave);ctx.rotate(moving*Math.sin(slitherPhase+3.25)*.055);
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.moveTo(15,-11);ctx.quadraticCurveTo(34,-14,48,-8);ctx.lineTo(54,-1);ctx.lineTo(49,8);ctx.quadraticCurveTo(33,13,16,9);ctx.lineTo(9,3);ctx.lineTo(11,-6);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#383b3e";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(19,8);ctx.quadraticCurveTo(35,12,49,6);ctx.stroke();
    ctx.fillStyle="#d0a85d";ctx.beginPath();ctx.ellipse(39,-5,3,2.2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#070707";ctx.beginPath();ctx.ellipse(40,-5,1,2,0,0,Math.PI*2);ctx.arc(49,-1,1.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#bd3c48";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(52,4);ctx.lineTo(65,7);ctx.moveTo(65,7);ctx.lineTo(70,4);ctx.moveTo(65,7);ctx.lineTo(69,11);ctx.stroke();
    ctx.restore();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawPlayer(now) {
    ctx.save();
    if(player.ceilingClimbing){ctx.translate(0,player.y*2+player.h);ctx.scale(1,-1);}
    if (selectedCharacter === "chameleon") drawChameleon(now);
    else if (selectedCharacter === "newt") drawNewt(now);
    else if (selectedCharacter === "frog") drawFrog(now);
    else if (selectedCharacter === "boa") drawBoa(now);
    else drawCrestedGecko(now);
    ctx.restore();
  }

  function draw(time = 0) {
    const level = levels[levelIndex] || levels[0];
    drawBackdrop(level);
    drawPlatforms(level);
    drawExit(level);
    drawInsects(level, time);
    drawMice(level,time);
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
    if (!keys[event.code] && event.code === "KeyE") useAbility();
    if (!keys[event.code] && event.code === "KeyR") useSecondaryAbility();
    keys[event.code] = true;
  });
  window.addEventListener("keyup", event => keys[event.code] = false);

  document.querySelectorAll("[data-control]").forEach(button => {
    const control = button.dataset.control;
    const key = control === "left" ? "touchLeft" : control === "right" ? "touchRight" : "touchJump";
    const press = event => {
      event.preventDefault();
      if (control === "secondary") return useSecondaryAbility();
      if (control === "primary") return useAbility();
      if (control === "jump" && !keys[key]) jump();
      keys[key] = true;
    };
    const release = event => { event.preventDefault(); keys[key] = false; };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });

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
