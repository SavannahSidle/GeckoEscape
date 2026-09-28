(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const overlay = document.querySelector("#overlay");
  const panelKicker = document.querySelector("#panelKicker");
  const panelTitle = document.querySelector("#panelTitle");
  const panelText = document.querySelector("#panelText");
  const characterSelect = document.querySelector("#characterSelect");
  const levelSelect = document.querySelector("#levelSelect");
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
  const backstageMode = new URLSearchParams(window.location.search).get("tour") === "arboreal-backstage-27";
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
  let waterJumpUntil = 0;
  let biteActiveUntil = 0;
  let biteCooldownUntil = 0;
  let trashShieldUntil = 0;
  let trashShieldCooldownUntil = 0;
  let raccoonImpactUntil = 0;
  let raccoonLandingUntil = 0;
  let raccoonCoyoteUntil = 0;
  let raccoonJumpBufferUntil = 0;
  let raccoonCombo = 0;
  let raccoonComboUntil = 0;
  let raccoonLastTreasureAt = 0;
  let parachuteBoostCooldownUntil = 0;
  let hissActiveUntil = 0;
  let hissCooldownUntil = 0;
  let playDeadUntil = 0;
  let playDeadCooldownUntil = 0;
  let flapCooldownUntil = 0;
  let echoPulseUntil = 0;
  let echoCooldownUntil = 0;
  let batFlightUntil = 0;
  let batGlideUntil = 0;
  let batStartHanging = false;
  let batHangX = 0;
  let batHangY = 0;
  let batReleaseUntil = 0;
  let batVisualFacing = 1;
  let opossumRecoveryUntil = 0;
  let characterPickup = null;
  let goatAttackUntil = 0;
  let goatAttackCooldownUntil = 0;
  let goatScrambleCooldownUntil = 0;
  let cowAttackUntil = 0;
  let cowAttackCooldownUntil = 0;
  let cowChargeUntil = 0;
  let cowChargeCooldownUntil = 0;
  let foxPounceUntil = 0;
  let foxPounceCooldownUntil = 0;
  let foxBlinkUntil = 0;
  let foxBlinkCooldownUntil = 0;
  let miceCollected = 0;
  let selectedCharacter = "crested";
  let soundOn = true;
  let audioContext = null;

  const characters = {
    chameleon: { name: "CHAMELEON", ability: "TONGUE", secondary: "CAMOUFLAGE", collectible: "CRICKETS", color: "#79a94d", climbSpeed: 135, swimSpeed: 150, w: 42, h: 25 },
    crested: { name: "CRESTED GECKO", ability: "SHORT TONGUE", secondary: "DROP TAIL", collectible: "ROACHES", color: "#d29458", climbSpeed: 195, swimSpeed: 160, w: 42, h: 25 },
    newt: { name: "FIRE-BELLY NEWT", ability: "REGENERATE", secondary: "TOXIN", collectible: "WORMS", color: "#252a28", climbSpeed: 130, swimSpeed: 235, w: 46, h: 23 },
    frog: { name: "AZUREUS DART FROG", ability: "TONGUE", secondary: "POWER LEAP", collectible: "FRUIT FLIES", color: "#2679cb", climbSpeed: 120, swimSpeed: 155, w: 38, h: 27 },
    boa: { name: "BLACK COLOMBIAN BOA", ability: "CONSTRICT", secondary: "STRIKE", collectible: "RATS", color: "#030405", climbSpeed: 155, swimSpeed: 190, w: 94, h: 36 },
    raccoon: { name: "TORONTO TRASH TANK (RACCOON)", ability: "BITE", secondary: "TRASH SHIELD", collectible: "TRASH TREASURES", color: "#73777a", climbSpeed: 178, swimSpeed: 145, w: 58, h: 38 },
    opossum: { name: "VIRGINIA OPOSSUM", ability: "HISS", secondary: "PLAY DEAD", collectible: "FORAGE", color: "#b8b2aa", climbSpeed: 182, swimSpeed: 135, w: 58, h: 31 },
    bat: { name: "EGYPTIAN FRUIT BAT", ability: "HANG", secondary: "ECHO PULSE", collectible: "FRUIT", color: "#806956", climbSpeed: 190, swimSpeed: 145, w: 54, h: 30 },
    goat: { name: "GOAT", ability: "HEADBUTT", secondary: "MOUNTAIN SCRAMBLE", collectible: "FORAGE", color: "#d9d0bb", climbSpeed: 165, swimSpeed: 130, w: 62, h: 38 },
    highland: { name: "HIGHLAND COW", ability: "HORN TOSS", secondary: "HIGHLAND CHARGE", collectible: "MEADOW BITES", color: "#b85f2e", climbSpeed: 105, swimSpeed: 115, w: 82, h: 48 },
    devilfox: { name: "FOX", ability: "POUNCE", secondary: "MISCHIEF BLINK", collectible: "SOUL BERRIES", color: "#b74766", climbSpeed: 180, swimSpeed: 155, w: 60, h: 36 }
  };

  const singleLevelCharacters=new Set(["opossum","bat","goat","highland","devilfox"]);
  const storyLevelCount=()=>selectedCharacter==="raccoon"?4:singleLevelCharacters.has(selectedCharacter)?1:levels.length;

  const player = {
    x: 0, y: 0, w: 38, h: 24,
    vx: 0, vy: 0, facing: 1,
    grounded: false, climbing: false, ceilingClimbing: false,
    spawnX: 0, spawnY: 0, onSwing: false
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
      completeTitle: "The front door is open.",
      completeText: "The house is behind you. Unfortunately, the road ahead appears to have been designed by natural selection.",
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

  // Story order begins with enclosure, aquarium, kitchen, and living room.
  levels.splice(1,0,levels.pop());

  levels.push({
    label:"LEVEL 5 · FINAL",
    title:"The Highway",
    intro:"The front door opens onto traffic. Cross the road, dodge the vehicles, collect every last meal, and reach the far sidewalk alive.",
    completeTitle:"Actually free.",
    completeText:"You crossed a highway, escaped five containment failures, and remain entirely unqualified for life in the wild.",
    palette:["#78b8d4","#bfd9d5","#777d82","#ffe16b"],
    start:[55,418],exit:[875,368,58,90],
    platforms:[[0,500,960,40],[0,458,145,42,"sidewalk"],[410,462,120,38,"median"],[815,458,145,42,"sidewalk"],[220,385,105,18,"roadSign"],[635,335,115,18,"roadSign"]],
    vines:[],
    insects:[[85,420],[270,350],[360,462],[470,425],[585,462],[692,300],[780,446],[890,420]],
    hazards:[
      {x:155,y:458,w:82,h:42,type:"car",axis:"traffic",min:-110,max:970,speed:185,direction:1,color:"#d84e45"},
      {x:410,y:448,w:118,h:52,type:"truck",axis:"traffic",min:-140,max:980,speed:138,direction:-1,color:"#e3b33f"},
      {x:650,y:461,w:76,h:39,type:"car",axis:"traffic",min:-100,max:970,speed:230,direction:1,color:"#4b86c6"},
      {x:825,y:456,w:88,h:44,type:"car",axis:"traffic",min:-110,max:980,speed:168,direction:-1,color:"#8b5ca8"}
    ],
    decor:"highway"
  });

  const standardStoryLayouts=levels.slice(1).map(level=>({
    platforms:level.platforms.map(platform=>[...platform]),
    angledPlatforms:(level.angledPlatforms||[]).map(platform=>[...platform]),
    vines:level.vines.map(vine=>[...vine]),
    insects:level.insects.map(insect=>insect.slice(0,2)),
    mice:(level.mice||[]).map(mouse=>mouse.slice(0,2))
  }));

  const standardStoryLevels=levels.slice(1).map(level=>JSON.parse(JSON.stringify(level)));

  const raccoonTorontoLevels=[
    {
      label:"LEVEL 2 · VERTICAL MENACE",title:"Climb the CN Tower",
      intro:"The Toronto Trash Tank has selected the tallest available bad idea. Climb the maintenance ledges, raid every snack, and reach the observation deck.",
      completeTitle:"Toronto has made a tactical error.",completeText:"The Trash Tank has reached the top. The restaurant contains rich people food and insufficient security.",
      palette:["#5a99c2","#d4e4e8","#59636b","#ef4c45"],start:[38,438],exit:[862,72,58,94],
      platforms:[[0,500,960,40,"street"],[28,458,165,22,"concrete"],[210,402,135,18,"towerLedge"],[365,350,130,18,"towerLedge"],[520,292,130,18,"towerLedge"],[675,235,130,18,"towerLedge"],[800,166,135,20,"observation"],[585,110,125,18,"antenna"],[385,178,105,18,"service"],[165,258,120,18,"service"],[215,466,76,14,"utilityBox"],[315,432,72,14,"scaffold"],[460,390,82,14,"scaffold"],[590,334,72,14,"vent"],[720,278,68,14,"service"],[842,218,72,14,"service"],[545,240,66,14,"sign"],[300,296,72,14,"service"],[92,330,74,14,"awning"],[505,148,62,14,"antenna"]],
      vines:[[184,300,18,158],[345,348,18,102],[650,230,18,125],[785,160,18,120]],
      insects:[[90,425],[268,368],[430,316],[585,258],[742,201],[860,132],[635,77],[435,144],[220,224]],
      hazards:[{x:300,y:285,w:62,h:30,type:"bird",axis:"x",min:230,max:600,speed:115},{x:620,y:145,w:52,h:30,type:"bird",axis:"diagonal",minX:510,maxX:810,minY:120,maxY:280,speedX:62,speedY:45}],
      decor:"torontoTower",habitat:"raccoon",vinesLabel:"maintenance ladders"
    },
    {
      label:"LEVEL 3 · FINE DINING FELONY",title:"The 360 Restaurant Heist",
      intro:"White tablecloths. Tiny portions. Excellent margins. Steal every fancy dish before security realizes the guest list contains one enormous raccoon.",
      completeTitle:"The tasting menu has been abolished.",completeText:"Caviar, steak, cake, and several cheeses are now evidence. The only remaining exit is dramatically downward.",
      palette:["#151923","#3f3340","#8f6b45","#f0cc76"],start:[38,438],exit:[872,86,55,82],
      platforms:[[0,500,960,40,"restaurantFloor"],[45,452,135,18,"table"],[255,452,135,18,"table"],[485,452,135,18,"table"],[715,452,135,18,"table"],[330,375,105,18,"servingCart"],[535,300,145,18,"bar"],[735,230,110,18,"servingCart"],[255,126,50,16,"chandelier"],[455,126,50,16,"chandelier"],[655,126,50,16,"chandelier"],[760,125,170,18,"observation"]],
      vines:[],
      insects:[[90,418],[285,376],[455,326],[650,276],[840,226],[650,171],[810,91],[535,285],[735,275],[555,170],[745,170],[885,91]],
      hazards:[{x:330,y:466,w:70,h:34,type:"server",axis:"x",min:250,max:470,speed:105},{x:700,y:466,w:70,h:34,type:"server",axis:"x",min:620,max:840,speed:120}],
      decor:"towerRestaurant",habitat:"raccoon"
    },
    {
      label:"LEVEL 4 · GRAVITY DISPUTE",title:"Parachute Escape",
      intro:"There is no approved raccoon exit from the CN Tower. Deploy the stolen emergency parachute, catch the airborne snacks, and land somewhere that cannot issue a bill.",
      completeTitle:"A majestic garbage meteor lands.",completeText:"Toronto survives. Several pigeons file formal complaints. The Trash Tank disappears into the city with a parachute and twelve thousand dollars in cheese.",
      palette:["#5aa9d6","#dff3f4","#506c79","#ff5b4f"],start:[38,92],exit:[872,400,58,92],
      platforms:[[18,130,155,20,"towerRoof"],[205,198,125,18,"cloud"],[385,270,130,18,"cloud"],[560,205,110,18,"cloud"],[700,330,125,18,"cloud"],[260,380,105,18,"cloud"],[105,245,90,16,"cloud"],[300,305,82,16,"cloud"],[485,330,78,16,"cloud"],[625,285,80,16,"cloud"],[770,245,82,16,"cloud"],[835,470,125,30,"rooftop"]],
      airCurrents:[[170,150,130,-115,55],[430,180,120,-135,-35],[675,235,125,-105,65]],
      vines:[],insects:[[110,92],[265,160],[445,232],[615,168],[755,292],[525,367],[315,342],[865,430]],
      hazards:[{x:260,y:105,w:62,h:30,type:"bird",axis:"diagonal",minX:190,maxX:520,minY:85,maxY:260,speedX:82,speedY:56},{x:590,y:260,w:52,h:30,type:"drone",axis:"diagonal",minX:520,maxX:840,minY:170,maxY:370,speedX:70,speedY:48}],
      decor:"parachute",habitat:"raccoon",parachute:true
    }
  ];

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
    },
    highway:{
      platforms:[[340,285,105,16,"roadSign"],[760,235,95,16,"roadSign"]],
      insects:[[392,252],[807,202]]
    }
  };

  const boaStoryCollectibles={
    kitchen:{rats:[[620,120]],mice:[[80,410],[300,294],[420,355],[510,294],[740,294],[120,161],[875,142]]},
    house:{rats:[[95,72],[665,233],[850,177]],mice:[[105,400],[185,225],[290,337],[470,285],[705,358],[835,305]]},
    underwater:{rats:[[310,115],[850,180]],mice:[[180,390],[120,270],[475,305],[520,465],[650,330],[810,235],[385,315],[735,245]]},
    highway:{rats:[[270,350],[692,300]],mice:[[85,420],[360,462],[470,425],[585,462],[780,446],[890,420]]}
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
      platforms:[[0,500,960,40],[75,455,175,20],[90,342,145,18],[285,405,145,18],[265,270,135,18],[380,95,140,18],[465,350,150,18],[530,220,130,18],[650,295,160,18],[780,215,145,18]],
      vines:[],insects:[[158,309],[330,370],[332,237],[450,62],[535,315],[595,187],[825,180]],
      hazards:[{x:450,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:84}]
    },
    boa: {
      title:"The Boa Enclosure",habitat:"boa",palette:["#0b100d","#242a20","#62472d","#a0b37b"],
      intro:"The sliding door is open. Follow the heavy logs toward freedom, dignity, and several poorly secured feeder rats.",
      start:[38,430],exit:[870,410,48,90],
      platforms:[[0,500,960,40],[35,454,245,26],[78,338,170,22],[315,410,210,25],[560,360,220,25],[760,292,170,24],[600,212,175,22],[390,165,180,22],[705,105,180,22]],
      vines:[[285,325,22,130],[800,215,22,110]],diagonalVines:[],insects:[[480,130]],mice:[[158,304],[365,373],[640,322],[835,255]],
      hazards:[{x:455,y:430,w:92,h:70,type:"grab",axis:"x",min:350,max:630,speed:70}]
    },
    raccoon: {
      title:"The Dumpster Den",habitat:"raccoon",palette:["#101418","#283037","#765b3f","#f2c14e"],
      intro:"The dumpster lid has fallen shut. Rummage through the good stuff, climb the trash corral, and escape before collection day.",
      start:[62,438],exit:[870,390,55,110],
      platforms:[[0,500,960,40,"alley"],[35,463,190,24,"trash"],[85,350,155,22,"cardboard"],[245,292,120,20,"cardboard"],[280,414,175,24,"dumpster"],[405,242,120,20,"trash"],[500,342,170,22,"dumpster"],[575,185,125,20,"cardboard"],[700,270,190,22,"fence"],[790,160,145,22,"dumpster"],[610,408,72,88,"recycling"],[32,235,105,18,"awning"]],
      angledPlatforms:[[150,380,245,292,16],[650,320,760,270,16]],
      vines:[[716,272,18,178],[370,240,18,175]],insects:[[105,430],[145,318],[300,258],[350,380],[465,208],[575,308],[635,151],[775,236],[850,126],[675,445]],
      hazards:[{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}]
    },
    opossum: {
      title:"The Wildlife Rehab Pen",habitat:"opossum",palette:["#101914","#293b2d","#6f5134","#c7dfa2"],
      intro:"The rehabilitation pen is secure, enriched, and tragically unable to account for one determined opossum.",
      start:[72,430],exit:[870,400,52,100],
      platforms:[[0,500,960,40,"leafLitter"],[40,455,180,22,"log"],[65,332,145,22,"nestbox"],[160,270,95,20,"meshShelf"],[225,420,125,22,"tire"],[260,305,145,22,"carrier"],[385,392,135,22,"log"],[430,245,125,22,"log"],[540,340,145,22,"log"],[585,185,125,22,"meshShelf"],[700,300,125,22,"meshShelf"],[835,330,95,22,"nestbox"]],
      vines:[[408,240,18,150],[690,190,18,150]],swings:[[780,62,150,58,92],[260,55,150,55,84]],insects:[[92,425],[135,300],[285,386],[332,272],[455,358],[490,212],[610,307],[648,152],[750,267],[852,178],[625,455],[885,295],[300,112]],
      completeTitle:"Rehabilitation status: aggressively self-discharged.",completeText:"The upper pen, tire swing, and fruit stash have been conquered. The opossum waddles into the night with absolutely no paperwork.",
      hazards:[{x:430,y:430,w:92,h:70,type:"grab",axis:"x",min:340,max:625,speed:78}]
    },
    bat: {
      title:"The Nocturnal Flight Habitat",habitat:"bat",palette:["#070817","#1d213c","#5d493e","#d5b0ff"],
      intro:"The keeper door is open beneath the artificial cave. Flap between fruit stations and leave the colony after dark.",
      start:[245,108],exit:[870,390,54,110],
      platforms:[[0,500,960,40,"caveFloor"],[40,455,175,20,"rock"],[100,340,140,18,"fruitTray"],[285,405,165,18,"roost"],[500,330,165,18,"fruitTray"],[685,255,185,18,"roost"],[785,150,150,18,"fruitTray"],[570,100,130,16,"caveWall"],[570,100,16,96,"caveWall"],[684,100,16,25,"caveWall"],[684,165,16,31,"caveWall"],[570,180,130,16,"caveWall"]],
      vines:[[435,250,15,160],[735,145,15,115]],ceilingVines:[[110,72,730,14,"batRope"]],insects:[[95,420],[160,305],[360,370],[575,295],[760,220],[850,115],[475,105],[625,140]],
      hazards:[{x:430,y:430,w:92,h:70,type:"grab",axis:"x",min:340,max:625,speed:84}],
      completeTitle:"The night air belongs to you.",completeText:"You dropped from the roost, crossed the cave on wingbeats, and vanished beyond the moonlit door.",
    },
    goat: {
      title:"The Goat Barn",habitat:"goat",palette:["#93b7c4","#d8c993","#7a5632","#fff0a8"],
      intro:"The latch was advertised as goat-proof. This was an act of extraordinary optimism.",
      start:[55,425],exit:[870,390,55,110],
      platforms:[[0,500,960,40,"barnFloor"],[34,454,190,24,"hayBale"],[72,340,145,22,"spool"],[260,410,175,22,"ramp"],[470,335,170,22,"hayBale"],[665,260,180,22,"fenceRail"],[790,155,145,22,"loft"]],
      angledPlatforms:[[240,430,390,350,20]],vines:[],insects:[[140,307],[330,365],[545,300],[745,225],[850,120]],
      hazards:[{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:82}]
    },
    highland: {
      title:"The Highland Pasture",habitat:"highland",palette:["#8ab2c2","#66784e","#75543c","#f2d38c"],
      intro:"The field gate is open beyond the stone byre. Collect the best grass and depart with immense hair and no remorse.",
      start:[42,420],exit:[870,390,58,110],
      platforms:[[0,500,960,40,"mudPasture"],[25,450,250,50,"grassHill"],[350,405,245,95,"grassHill"],[690,360,270,140,"mountainShelf"],[485,285,190,24,"grassLedge"],[760,210,175,24,"grassLedge"]],
      angledPlatforms:[[205,450,380,405,34],[565,405,735,360,38],[620,285,790,210,32]],vines:[],insects:[[120,412],[300,405],[455,365],[610,360],[755,320],[565,247],[845,172]],
      hazards:[{x:420,y:430,w:92,h:70,type:"grab",axis:"x",min:330,max:610,speed:72}]
    },
    devilfox: {
      title:"The Infernal Menagerie",habitat:"devilfox",palette:["#170b28","#45143b","#74405e","#ff82bd"],
      intro:"The containment sigil is flickering. Collect the soul berries, cause a tasteful amount of chaos, and leave before anyone finds the matches.",
      start:[62,425],exit:[870,390,55,110],
      platforms:[[0,500,960,40,"velvetFloor"],[35,454,185,22,"obsidian"],[82,340,145,20,"mushroom"],[270,405,175,22,"root"],[485,330,175,22,"crystal"],[685,255,180,22,"root"],[790,150,145,22,"obsidian"]],
      vines:[[445,250,18,160],[735,140,18,118]],ceilingVines:[[150,78,650,16,"infernalChain"]],insects:[[145,305],[345,370],[560,295],[760,220],[850,115]],
      hazards:[{x:430,y:430,w:92,h:70,type:"grab",axis:"x",min:340,max:625,speed:88}]
    }
  };

  function applyCharacterHabitat() {
    const habitat = habitatConfigs[selectedCharacter];
    standardStoryLevels.forEach((level,index)=>{levels[index+1]=JSON.parse(JSON.stringify(level));});
    levels[0].ceilingVines=[];
    levels[0].diagonalVines=[];
    levels[0].angledPlatforms=[];
    levels[0].mice=[];
    Object.assign(levels[0], JSON.parse(JSON.stringify(habitat)), {label:"LEVEL 1 · EASY",decor:"enclosure",completeTitle:habitat.completeTitle||"The room is larger than expected.",completeText:habitat.completeText||"Freedom contains shelves, suspicious noises, and absolutely no climate control."});
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
    if(selectedCharacter==="raccoon"){
      raccoonTorontoLevels.forEach((level,index)=>{levels[index+1]=JSON.parse(JSON.stringify(level));});
    }
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
    levelSelect.classList.add("hidden");
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
    panelTitle.textContent = "Eleven animals. Catastrophic judgment.";
    panelText.textContent = "Each character has a different enclosure and two abilities. Some crimes become significantly longer road trips.";
    primaryButton.classList.add("hidden");
    secondaryButton.classList.add("hidden");
    levelSelect.classList.add("hidden");
    characterSelect.classList.remove("hidden");
    characterSelect.querySelector("button")?.focus();
  }

  function showLevelSelect(){
    state="level-select";
    panelKicker.textContent="BACKSTAGE MODE";
    panelTitle.textContent="Choose a level.";
    panelText.textContent=`Testing as ${characters[selectedCharacter].name}. Every exit is unlocked.`;
    primaryButton.classList.add("hidden");
    characterSelect.classList.add("hidden");
    levelSelect.classList.remove("hidden");
    levelSelect.querySelectorAll("[data-level]").forEach(button=>{
      const index=Number(button.dataset.level);const level=levels[index];
      button.classList.toggle("hidden",index>=storyLevelCount());
      const label=button.querySelector("small");
      if(level&&label)label.textContent=level.title.replace(/^The\s+/i,"");
    });
    secondaryButton.textContent="BACK TO CHARACTERS";
    secondaryButton.onclick=showCharacterSelect;
    secondaryButton.classList.remove("hidden");
    overlay.classList.remove("hidden");
    hud.classList.add("hidden");
    levelSelect.querySelector("button")?.focus();
  }

  function showIntro(index) {
    levelIndex = index;
    const level = levels[index];
    state = "intro";
    showPanel(level.label, level.title, level.intro, index === 0 ? "START LEVEL" : "CONTINUE", () => startLevel(index));
    if(backstageMode){
      secondaryButton.textContent="LEVEL SELECT";
      secondaryButton.onclick=showLevelSelect;
      secondaryButton.classList.remove("hidden");
    }else if(index===0){
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
    level.hazards.forEach((hazard, i) => { hazard.dir = hazard.direction ?? (i % 2 ? -1 : 1); hazard.dirX = i % 2 ? -1 : 1; hazard.dirY = i % 2 ? 1 : -1; hazard.jumpPhase=i*.7; hazard.stunnedUntil = 0; hazard.camouflageIgnoredUntil=0; hazard.defeated = false; });
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
    waterJumpUntil = 0;
    biteActiveUntil = 0;
    biteCooldownUntil = 0;
    trashShieldUntil = 0;
    trashShieldCooldownUntil = 0;
    raccoonImpactUntil = 0;
    raccoonLandingUntil = 0;
    raccoonCoyoteUntil = 0;
    raccoonJumpBufferUntil = 0;
    raccoonCombo = 0;
    raccoonComboUntil = 0;
    raccoonLastTreasureAt = 0;
    parachuteBoostCooldownUntil = 0;
    hissActiveUntil = 0;
    hissCooldownUntil = 0;
    playDeadUntil = 0;
    playDeadCooldownUntil = 0;
    flapCooldownUntil = 0;
    echoPulseUntil = 0;
    echoCooldownUntil = 0;
    batFlightUntil = 0;
    batGlideUntil = 0;
    batStartHanging = false;
    opossumRecoveryUntil = 0;
    characterPickup = null;
    goatAttackUntil = 0;
    goatAttackCooldownUntil = 0;
    goatScrambleCooldownUntil = 0;
    cowAttackUntil = 0;
    cowAttackCooldownUntil = 0;
    cowChargeUntil = 0;
    cowChargeCooldownUntil = 0;
    foxPounceUntil = 0;
    foxPounceCooldownUntil = 0;
    foxBlinkUntil = 0;
    foxBlinkCooldownUntil = 0;
    miceCollected = 0;
    (level.mice||[]).forEach(mouse=>mouse[2]=false);
    tongueActiveUntil = 0;
    tongueCooldownUntil = 0;
    droppedTail = null;
    player.spawnX = level.start[0];
    player.spawnY = level.start[1];
    resetPlayer(false);
    levelLabel.textContent = `${level.label}${backstageMode?" · BACKSTAGE":""}`;
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
      if(selectedCharacter==="raccoon")showPanel("ESCAPE FAILED", "Captured by Toronto Animal Services.", "The Trash Tank has been loaded into the municipal shame van. The dog catcher appears exhausted.", "ESCAPE CUSTODY", () => startLevel(levelIndex), true);
      else if(selectedCharacter==="opossum")showPanel("ESCAPE FAILED", "Returned to wildlife rehab.", "Recovery continues. The night shift has reinforced the enrichment pen.", "TRY AGAIN", () => startLevel(levelIndex), true);
      else showPanel("ESCAPE FAILED", "Returned to your enclosure.", "Humiliating. The human has also added another clip to the door.", "TRY AGAIN", () => startLevel(levelIndex), true);
      return;
    }
    player.x = player.spawnX;
    player.y = player.spawnY;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    batStartHanging=selectedCharacter==="bat"&&levels[levelIndex]?.habitat==="bat";
    batHangX=player.spawnX;batHangY=player.spawnY;batReleaseUntil=0;batVisualFacing=player.facing;
    player.ceilingClimbing = batStartHanging;
    player.onSwing=false;
    frogAutoHopping = false;
    waterJumpUntil = 0;
    air = 100;
    invulnerableUntil = performance.now() + 1100;
    updateHud();
  }

  function updateHud() {
    const character = characters[selectedCharacter];
    const preyTotal = levels[levelIndex].insects.length;
    const miceTotal=(levels[levelIndex].mice||[]).length;
    const collectibleLabel=selectedCharacter==="raccoon"&&levels[levelIndex].decor==="towerRestaurant"?"FANCY FOOD":selectedCharacter==="raccoon"&&levels[levelIndex].decor==="parachute"?"AIRBORNE SNACKS":character.collectible;
    bugLabel.textContent = `${collectibleLabel} ${collected}/${preyTotal}${miceTotal?` · MICE ${miceCollected}/${miceTotal}`:""}`;
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
    } else if (selectedCharacter === "raccoon") {
      const parachuteState=levels[levelIndex].decor==="parachute"?` · ${performance.now()>=parachuteBoostCooldownUntil?"AIR BRAKE READY":"AIR BRAKE RECHARGING"}`:"";
      const comboState=performance.now()<raccoonComboUntil&&raccoonCombo>1?` · TRASH COMBO ×${raccoonCombo}`:"";
      abilityLabel.textContent = `${performance.now() >= biteCooldownUntil ? "BITE READY" : "BITE RECHARGING"} · ${performance.now() >= trashShieldCooldownUntil ? "SHIELD READY" : "SHIELD RECHARGING"}${parachuteState}${comboState}`;
    } else if (selectedCharacter === "opossum") {
      const recovery=performance.now()>playDeadUntil&&performance.now()<opossumRecoveryUntil?" · PANIC SPRINT":"";
      abilityLabel.textContent = `${performance.now() >= hissCooldownUntil ? "HISS READY" : "HISS RECHARGING"} · ${performance.now() >= playDeadCooldownUntil ? "PLAY DEAD READY" : "PLAY DEAD RECHARGING"}${recovery}`;
    } else if (selectedCharacter === "bat") {
      abilityLabel.textContent = `${player.ceilingClimbing?"HANGING":"HANG READY"} · ${performance.now() >= echoCooldownUntil ? "ECHO READY" : "ECHO RECHARGING"}`;
    } else if (selectedCharacter === "goat") {
      abilityLabel.textContent = `${performance.now() >= goatAttackCooldownUntil ? "HEADBUTT READY" : "HEADBUTT RECHARGING"} · ${performance.now() >= goatScrambleCooldownUntil ? "SCRAMBLE READY" : "SCRAMBLE RECHARGING"}`;
    } else if (selectedCharacter === "highland") {
      abilityLabel.textContent = `${performance.now() >= cowAttackCooldownUntil ? "HORN TOSS READY" : "HORN TOSS RECHARGING"} · ${performance.now() >= cowChargeCooldownUntil ? "CHARGE READY" : "CHARGE RECHARGING"}`;
    } else if (selectedCharacter === "devilfox") {
      abilityLabel.textContent = `${performance.now() >= foxPounceCooldownUntil ? "POUNCE READY" : "POUNCE RECHARGING"} · ${performance.now() >= foxBlinkCooldownUntil ? "BLINK READY" : "BLINK RECHARGING"}`;
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
    const livingTypes=new Set(["cat","dalmatian","frenchie","fish","spider","bird","server","drone"]);
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

  function useBite(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="raccoon"||now<biteCooldownUntil)return;
    biteActiveUntil=now+280;biteCooldownUntil=now+720;raccoonImpactUntil=now+190;
    player.vx+=player.facing*95;
    const biteBox={x:player.facing>0?player.x+player.w-8:player.x-46,y:player.y-5,w:54,h:player.h+10};
    const livingTypes=new Set(["cat","dalmatian","frenchie","fish","spider","bird","server","drone"]);
    let hitSomething=false;
    for(const hazard of levels[levelIndex].hazards){
      if(hazard.defeated||!intersects(biteBox,hazard))continue;
      hitSomething=true;
      if(hazard.type==="grab"||hazard.type==="hand"){hazard.stunnedUntil=now+1250;hazard.dir*=-1;}
      else if(livingTypes.has(hazard.type)){hazard.defeated=true;hazard.x+=player.facing*28;}
    }
    if(hitSomething)trashShieldCooldownUntil=Math.max(now,trashShieldCooldownUntil-850);
    updateHud();tone(155,.09,"square");
  }

  function useTrashShield(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="raccoon"||now<trashShieldCooldownUntil)return;
    trashShieldUntil=now+2700;trashShieldCooldownUntil=now+5200;invulnerableUntil=Math.max(invulnerableUntil,trashShieldUntil);player.vx+=player.facing*55;
    const bashBox={x:player.facing>0?player.x+player.w-5:player.x-72,y:player.y-14,w:77,h:player.h+28};
    for(const hazard of levels[levelIndex].hazards){
      if(hazard.defeated||!intersects(bashBox,hazard))continue;
      hazard.stunnedUntil=now+1900;hazard.x+=player.facing*58;hazard.dir=(hazard.dir||1)*-1;hazard.dirX=(hazard.dirX||1)*-1;
    }
    updateHud();tone(140,.16,"triangle");
  }

  function useHiss(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="opossum"||now<hissCooldownUntil)return;
    hissActiveUntil=now+420;hissCooldownUntil=now+1800;
    const px=player.x+player.w/2,py=player.y+player.h/2;
    const livingTypes=new Set(["cat","dalmatian","frenchie","fish","spider","grab","hand"]);
    for(const hazard of levels[levelIndex].hazards){
      if(!livingTypes.has(hazard.type)||hazard.defeated)continue;
      if(Math.hypot(px-hazard.x-hazard.w/2,py-hazard.y-hazard.h/2)<155)hazard.stunnedUntil=now+1700;
    }
    updateHud();tone(760,.2,"sawtooth");
  }

  function usePlayDead(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="opossum"||now<playDeadCooldownUntil)return;
    playDeadUntil=now+2800;opossumRecoveryUntil=now+4300;playDeadCooldownUntil=now+6100;invulnerableUntil=Math.max(invulnerableUntil,playDeadUntil);player.vx=0;updateHud();tone(75,.25,"sine");
  }

  function useFlap(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="bat"||batStartHanging||now<flapCooldownUntil)return;
    const roost=(levels[levelIndex].ceilingVines||[]).find(v=>player.x+player.w>v[0]&&player.x<v[0]+v[2]&&player.y<v[1]+120);
    if(!roost)return;
    batHangX=Math.max(roost[0],Math.min(player.x,roost[0]+roost[2]-player.w));batHangY=roost[1]+roost[3]-2;
    batStartHanging=true;player.ceilingClimbing=true;player.climbing=false;player.vx=0;player.vy=0;flapCooldownUntil=now+240;updateHud();tone(430,.05,"triangle");
  }

  function useEchoPulse(){
    const now=performance.now();
    if(state!=="playing"||selectedCharacter!=="bat"||now<echoCooldownUntil)return;
    echoPulseUntil=now+3000;echoCooldownUntil=now+5600;updateHud();tone(980,.12,"sine");setTimeout(()=>tone(1220,.09,"sine"),90);
  }

  function strikeNearby(activeUntilKey, cooldownKey, duration, cooldown, reach, toneFrequency){
    const now=performance.now();
    const attackBox={x:player.facing>0?player.x+player.w-8:player.x-reach+8,y:player.y-8,w:reach,h:player.h+16};
    const livingTypes=new Set(["cat","dalmatian","frenchie","fish","spider"]);
    for(const hazard of levels[levelIndex].hazards){
      if(hazard.defeated||!intersects(attackBox,hazard))continue;
      if(hazard.type==="grab"||hazard.type==="hand"){hazard.stunnedUntil=now+1100;hazard.dir*=-1;}
      else if(livingTypes.has(hazard.type))hazard.defeated=true;
    }
    if(activeUntilKey==="goat")goatAttackUntil=now+duration;
    if(activeUntilKey==="cow")cowAttackUntil=now+duration;
    if(activeUntilKey==="fox")foxPounceUntil=now+duration;
    if(cooldownKey==="goat")goatAttackCooldownUntil=now+cooldown;
    if(cooldownKey==="cow")cowAttackCooldownUntil=now+cooldown;
    if(cooldownKey==="fox")foxPounceCooldownUntil=now+cooldown;
    updateHud();tone(toneFrequency,.1,"square");
  }

  function useHeadbutt(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="goat"||now<goatAttackCooldownUntil)return;
    strikeNearby("goat","goat",300,760,74,175);
  }

  function useMountainScramble(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="goat"||now<goatScrambleCooldownUntil)return;
    goatScrambleCooldownUntil=now+1450;player.ceilingClimbing=false;player.climbing=false;player.vy=-555;player.vx=player.facing*275;player.grounded=false;invulnerableUntil=Math.max(invulnerableUntil,now+500);updateHud();tone(315,.09,"triangle");
  }

  function useHornToss(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="highland"||now<cowAttackCooldownUntil)return;
    strikeNearby("cow","cow",360,900,88,120);player.vy=Math.min(player.vy,-90);
  }

  function useHighlandCharge(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="highland"||now<cowChargeCooldownUntil)return;
    cowChargeUntil=now+850;cowChargeCooldownUntil=now+3600;player.vx=player.facing*480;invulnerableUntil=Math.max(invulnerableUntil,cowChargeUntil);updateHud();tone(78,.22,"sawtooth");
  }

  function useFoxPounce(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="devilfox"||now<foxPounceCooldownUntil)return;
    strikeNearby("fox","fox",520,980,92,260);player.vx=player.facing*330;player.vy=-330;player.grounded=false;
  }

  function useMischiefBlink(){
    const now=performance.now();if(state!=="playing"||selectedCharacter!=="devilfox"||now<foxBlinkCooldownUntil)return;
    foxBlinkUntil=now+500;foxBlinkCooldownUntil=now+2300;invulnerableUntil=Math.max(invulnerableUntil,now+650);player.x=Math.max(0,Math.min(W-player.w,player.x+player.facing*145));player.vx=player.facing*90;updateHud();tone(690,.13,"sine");
  }

  function biteHitbox(now){
    if(selectedCharacter!=="raccoon"||now>=biteActiveUntil)return null;
    return {x:player.facing>0?player.x+player.w-8:player.x-46,y:player.y-5,w:54,h:player.h+10};
  }

  function useAbility() {
    if (["chameleon","crested","frog"].includes(selectedCharacter)) useTongue();
    else if (selectedCharacter === "newt") useRegenerate();
    else if (selectedCharacter === "boa") useConstrict();
    else if (selectedCharacter === "raccoon") useBite();
    else if (selectedCharacter === "opossum") useHiss();
    else if (selectedCharacter === "bat") useFlap();
    else if (selectedCharacter === "goat") useHeadbutt();
    else if (selectedCharacter === "highland") useHornToss();
    else if (selectedCharacter === "devilfox") useFoxPounce();
  }

  function useSecondaryAbility(){
    if(selectedCharacter==="chameleon")useCamouflage();
    else if(selectedCharacter==="frog")usePowerLeap();
    else if(selectedCharacter==="crested")dropTail();
    else if(selectedCharacter==="newt")useToxin();
    else if(selectedCharacter==="boa")useStrike();
    else if(selectedCharacter==="raccoon")useTrashShield();
    else if(selectedCharacter==="opossum")usePlayDead();
    else if(selectedCharacter==="bat")useEchoPulse();
    else if(selectedCharacter==="goat")useMountainScramble();
    else if(selectedCharacter==="highland")useHighlandCharge();
    else if(selectedCharacter==="devilfox")useMischiefBlink();
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function remainingCollectibles(level){
    if(backstageMode)return 0;
    return level.insects.filter(item=>!item[2]).length+(level.mice||[]).filter(item=>!item[2]).length;
  }

  function completeLevel() {
    if (remainingCollectibles(levels[levelIndex])>0) return;
    state = "complete";
    tone(523, .1, "triangle");
    setTimeout(() => tone(659, .13, "triangle"), 100);
    const level = levels[levelIndex];
    if (levelIndex < storyLevelCount() - 1) {
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
    if(batStartHanging){player.x=batHangX;player.y=batHangY;player.vx=0;player.vy=0;player.ceilingClimbing=true;return;}
    const raccoonMovement=selectedCharacter==="raccoon"||selectedCharacter==="devilfox";
    if(raccoonMovement&&player.grounded)raccoonCoyoteUntil=now+125;
    if(selectedCharacter==="raccoon"&&now>=raccoonComboUntil&&raccoonCombo){raccoonCombo=0;updateHud();}
    const inHabitatWater = level.habitat === "newt" && player.x < 520 && player.y + player.h / 2 > 270;
    const swimming = Boolean(level.underwater || inHabitatWater);
    let speed = swimming ? character.swimSpeed : selectedCharacter==="bat" ? 210 : level.decor === "parachute" ? 265 : level.decor === "highway" ? 245 : level.decor === "house" ? 236 : 220;
    if(selectedCharacter==="opossum"&&now>playDeadUntil&&now<opossumRecoveryUntil)speed+=72;
    if(selectedCharacter==="raccoon"&&!swimming&&(left||right))speed+=18+(raccoonCombo>=3&&now<raccoonComboUntil?32:0);
    if (["chameleon","newt","frog","boa","raccoon","opossum","bat","goat","highland","devilfox"].includes(selectedCharacter)) updateHud();

    const acceleration = swimming ? 720 : selectedCharacter==="bat" ? 980 : level.decor==="parachute" ? 1180 : selectedCharacter==="frog" ? 1120 : 1450;
    const playingDead=selectedCharacter==="opossum"&&now<playDeadUntil;
    if (!playingDead&&left) { player.vx -= acceleration * dt; if(selectedCharacter!=="bat"||player.vx<10)player.facing = -1; }
    if (!playingDead&&right) { player.vx += acceleration * dt; if(selectedCharacter!=="bat"||player.vx>-10)player.facing = 1; }
    if (!left && !right) player.vx *= Math.pow(swimming ? .025 : selectedCharacter==="bat" ? .22 : level.decor==="parachute" ? .3 : selectedCharacter==="frog" ? .00008 : .0007, dt);
    if(playingDead)player.vx=0;
    player.vx = Math.max(-speed, Math.min(speed, player.vx));

    if (swimming) {
      player.climbing = false;
      player.ceilingClimbing = false;
      const waterKicking=now<waterJumpUntil;
      if (up&&!waterKicking) player.vy -= 680 * dt;
      if (down) player.vy += 680 * dt;
      if (!up && !down) player.vy *= Math.pow(waterKicking?.22:.018, dt);
      const verticalLimit=waterKicking?450:speed;
      player.vy = Math.max(-verticalLimit, Math.min(verticalLimit, player.vy));

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
      const onWall = player.x <= 5 || player.x + player.w >= W - 5;
      player.ceilingClimbing=false;
      player.climbing = (onVine || onWall) && (up || down);
      if (player.climbing) {
        player.vx=0;
        player.vy = up ? -character.climbSpeed : down ? character.climbSpeed : 0;
      } else {
        const flying=selectedCharacter==="bat";
        if(flying){
          // Powered flight: up and down steer, neutral input gently hovers.
          if(up)player.vy-=520*dt;
          else if(down)player.vy+=480*dt;
          else{player.vy+=18*dt;player.vy*=Math.pow(.28,dt);}
          player.vy=Math.max(-190,Math.min(190,player.vy));
        }else{
          const gliding=selectedCharacter==="bat"&&now<batGlideUntil&&!down;
          const parachuting=selectedCharacter==="raccoon"&&level.decor==="parachute";
          const jumpHeld=raccoonMovement&&up&&player.vy<0;
          player.vy += (parachuting?178:gliding?265:jumpHeld?475:820) * dt;
          if(gliding){
            if(up)player.vy-=125*dt;
            player.vx+=player.facing*22*dt;
          }
          if(parachuting){if(up)player.vy-=155*dt;if(down)player.vy+=80*dt;for(const current of level.airCurrents||[]){if(player.x+player.w>current[0]&&player.x<current[0]+current[1]){player.vy+=current[2]*dt;player.vx+=current[3]*dt;}}}
          player.vy = Math.min(player.vy, parachuting?145:gliding?205:570);
          if(raccoonMovement&&onWall&&player.vy>90&&!parachuting)player.vy=90;
        }
        if(selectedCharacter==="frog"&&player.grounded&&(left||right)&&now>=frogHopCooldownUntil){
          player.vy=-178;player.grounded=false;frogAutoHopping=true;frogHopCooldownUntil=now+300;
        }
      }
    }

    const oldX = player.x;
    const oldY = player.y;
    const activeSwings=level.swings||[];
    if(player.onSwing&&activeSwings[player.onSwing-1]){const current=tireSwingPosition(activeSwings[player.onSwing-1],now),previous=tireSwingPosition(activeSwings[player.onSwing-1],now-dt*1000);player.x+=current.x-previous.x;}
    player.onSwing=false;
    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(W - player.w, player.x));
    player.y += player.vy * dt;
    for(const p of level.platforms){
      if(p[4]!=="caveWall"||!intersects(player,{x:p[0],y:p[1],w:p[2],h:p[3]}))continue;
      if(oldX+player.w<=p[0]){player.x=p[0]-player.w;player.vx=0;}
      else if(oldX>=p[0]+p[2]){player.x=p[0]+p[2];player.vx=0;}
      else if(oldY+player.h<=p[1]){player.y=p[1]-player.h;player.vy=0;}
      else{player.y=p[1]+p[3];player.vy=Math.max(0,player.vy);}
    }
    if(player.y<52){player.y=52;player.vy=Math.max(0,player.vy);}
    if (level.underwater) player.y = Math.max(48, Math.min(H - player.h, player.y));
    const landingSpeed=player.vy;
    player.grounded = false;

    for (const p of level.platforms) {
      const platform = {x:p[0], y:p[1], w:p[2], h:p[3]};
      if (!level.underwater && !swimming && player.vy >= 0 && oldY + player.h <= platform.y + 4 && intersects(player, platform)) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
        if(["raccoon","opossum","devilfox","crested","newt","goat","highland","frog"].includes(selectedCharacter)&&landingSpeed>150)raccoonLandingUntil=now+190;
        if(raccoonMovement&&now<raccoonJumpBufferUntil){player.vy=-455;player.grounded=false;raccoonJumpBufferUntil=0;raccoonCoyoteUntil=0;}
        if(selectedCharacter==="frog")frogAutoHopping=false;
      }
    }
    if(!level.underwater&&player.vy>=0)activeSwings.forEach((config,index)=>{const swing=tireSwingPosition(config,now);if(oldY+player.h<=swing.y+5&&intersects(player,swing)){player.y=swing.y-player.h;player.vy=0;player.grounded=true;player.onSwing=index+1;}});
    for(const p of level.angledPlatforms||[]){
      if(level.underwater||swimming||player.vy<0)continue;
      const minX=Math.min(p[0],p[2]),maxX=Math.max(p[0],p[2]);
      const centerX=player.x+player.w/2;
      if(centerX<minX||centerX>maxX)continue;
      const surfaceY=angledPlatformY(p,centerX);
      if(oldY+player.h<=surfaceY+6&&player.y+player.h>=surfaceY){player.y=surfaceY-player.h;player.vy=0;player.grounded=true;if(["raccoon","opossum","devilfox","crested","newt","goat","highland"].includes(selectedCharacter)&&landingSpeed>150)raccoonLandingUntil=now+190;if(selectedCharacter==="raccoon"&&now<raccoonJumpBufferUntil){player.vy=-455;player.grounded=false;raccoonJumpBufferUntil=0;raccoonCoyoteUntil=0;}}
    }

    if (player.y > H + 80) {
      tone(90, .25, "square");
      resetPlayer();
      return;
    }

    const hazardDt=selectedCharacter==="bat"&&now<echoPulseUntil?dt*.38:dt;
    for (const hazard of level.hazards) {
      if(hazard.defeated)continue;
      if(hazard.axis==="traffic"&&now>=(hazard.stunnedUntil||0)){
        hazard.x+=hazard.speed*hazard.dir*hazardDt;
        if(hazard.dir>0&&hazard.x>hazard.max)hazard.x=hazard.min-hazard.w;
        if(hazard.dir<0&&hazard.x+hazard.w<hazard.min)hazard.x=hazard.max;
      }else if (hazard.axis === "x" && now >= (hazard.stunnedUntil || 0)) {
        hazard.x += hazard.speed * hazard.dir * hazardDt;
        if (hazard.x < hazard.min || hazard.x > hazard.max) {
          hazard.x = Math.max(hazard.min, Math.min(hazard.max, hazard.x));
          hazard.dir *= -1;
        }
      }else if(hazard.axis==="jump"&&now>=(hazard.stunnedUntil||0)){
        hazard.x+=hazard.speed*hazard.dir*hazardDt;
        if(hazard.x<hazard.min||hazard.x>hazard.max){hazard.x=Math.max(hazard.min,Math.min(hazard.max,hazard.x));hazard.dir*=-1;}
        hazard.jumpPhase+=hazardDt*2.7;hazard.y=hazard.baseY-Math.abs(Math.sin(hazard.jumpPhase))*hazard.jumpHeight;
      }else if(hazard.axis==="y"&&now>=(hazard.stunnedUntil||0)){
        hazard.y+=hazard.speed*hazard.dirY*hazardDt;
        if(hazard.y<hazard.minY||hazard.y>hazard.maxY){hazard.y=Math.max(hazard.minY,Math.min(hazard.maxY,hazard.y));hazard.dirY*=-1;}
      }else if(hazard.axis==="diagonal"&&now>=(hazard.stunnedUntil||0)){
        hazard.x+=hazard.speedX*hazard.dirX*hazardDt;hazard.y+=hazard.speedY*hazard.dirY*hazardDt;
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
      if(intersects(player,hazard)&&selectedCharacter==="highland"&&now<cowChargeUntil){
        if(["cat","dalmatian","frenchie","fish","spider"].includes(hazard.type))hazard.defeated=true;
        else if(hazard.type==="grab"||hazard.type==="hand")hazard.stunnedUntil=now+1200;
      }
      if(intersects(player,hazard)&&selectedCharacter==="devilfox"&&now<foxPounceUntil){
        if(["cat","dalmatian","frenchie","fish","spider"].includes(hazard.type))hazard.defeated=true;
        else if(hazard.type==="grab"||hazard.type==="hand")hazard.stunnedUntil=now+900;
      }
    }

    level.insects.forEach(insect => {
      if (!insect[2]) {
        const bug = selectedCharacter==="boa"?{x:insect[0]-20,y:insect[1]-14,w:40,h:28}:{x:insect[0]-10,y:insect[1]-10,w:20,h:20};
        const tongue = tongueHitbox(now);
        const bite = biteHitbox(now);
        if (intersects(player, bug) || (tongue && intersects(tongue, bug)) || (bite&&intersects(bite,bug))) {
          insect[2] = true;
          collected += 1;
          if(selectedCharacter==="raccoon"){
            raccoonCombo=now-raccoonLastTreasureAt<2500?raccoonCombo+1:1;raccoonLastTreasureAt=now;raccoonComboUntil=now+2500;
            if(collected%4===0&&lives<3){lives+=1;invulnerableUntil=Math.max(invulnerableUntil,now+650);tone(930,.11,"sine");}
          }
          if(["raccoon","opossum","bat"].includes(selectedCharacter))characterPickup={x:insect[0],y:insect[1],at:now,kind:selectedCharacter};
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
    const now=performance.now();
    if(selectedCharacter==="opossum"&&performance.now()<playDeadUntil)return;
    if(batStartHanging){batStartHanging=false;player.ceilingClimbing=false;batReleaseUntil=now+260;player.y+=8;player.vy=65;tone(185,.05,"triangle");return;}
    if(player.ceilingClimbing){player.ceilingClimbing=false;player.climbing=false;player.y+=8;player.vy=135;tone(185,.05,"triangle");return;}
    const level=levels[levelIndex];
    if(selectedCharacter==="raccoon"&&level.decor==="parachute"&&!player.grounded){
      if(now<parachuteBoostCooldownUntil)return;
      parachuteBoostCooldownUntil=now+650;player.vy=Math.min(player.vy,-145);player.vx+=player.facing*36;updateHud();tone(315,.07,"triangle");return;
    }
    if((selectedCharacter==="raccoon"||selectedCharacter==="devilfox")&&!player.grounded&&(player.x<=7||player.x+player.w>=W-7)){
      const offLeft=player.x<=7;player.facing=offLeft?1:-1;player.vx=offLeft?285:-285;player.vy=-455;raccoonCoyoteUntil=0;raccoonJumpBufferUntil=0;tone(285,.06,"triangle");return;
    }
    const inHabitatWater=level.habitat==="newt"&&player.x<520&&player.y+player.h/2>270;
    if(inHabitatWater){
      const nearSurface=player.y+player.h/2<330;
      player.vy=nearSurface?-420:-305;
      waterJumpUntil=performance.now()+(nearSurface?340:260);
      player.grounded=false;
      tone(nearSurface?275:220,.07,"triangle");
      return;
    }
    if (level.underwater) {
      player.vy = -Math.max(250,characters[selectedCharacter].swimSpeed*1.2);
      waterJumpUntil=performance.now()+240;
      tone(210, .05, "sine");
      return;
    }
    const raccoonMovement=selectedCharacter==="raccoon"||selectedCharacter==="devilfox";
    if (player.grounded || player.climbing || (raccoonMovement&&now<raccoonCoyoteUntil) || (selectedCharacter === "frog" && frogAutoHopping)) {
      player.vy = selectedCharacter === "frog" ? -535 : -455;
      player.grounded = false;
      if(raccoonMovement){raccoonCoyoteUntil=0;raccoonJumpBufferUntil=0;}
      if(selectedCharacter==="frog")frogAutoHopping=false;
      tone(245, .05, "triangle");
    }else if(raccoonMovement)raccoonJumpBufferUntil=now+150;
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

  function tireSwingPosition(config,now){
    const [anchorX,anchorY,length,amplitude,width]=config;
    const angle=Math.sin(now*.00175)*.42;
    const centerX=anchorX+Math.sin(angle)*amplitude;
    const centerY=anchorY+Math.cos(angle)*length;
    return {x:centerX-width/2,y:centerY-22,w:width,h:18,anchorX,anchorY,centerX,centerY};
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
      if(!["raccoon","opossum","bat","goat","highland","devilfox"].includes(level.habitat)){
        drawEnclosureTrees();
        ctx.save();ctx.globalAlpha=.42;
        drawLeaves(-18,120,"#1b4b2b");drawLeaves(185,155,"#285c34");drawLeaves(390,105,"#214d2d");
        drawLeaves(545,265,"#285735");drawLeaves(790,125,"#1d492b");drawLeaves(820,335,"#285d37");
        ctx.restore();
      }
      drawHabitatDetails(level);
      if(!["raccoon","opossum","bat","goat","highland","devilfox"].includes(level.habitat)){drawLeaves(48, 220, "#245f36");drawLeaves(665,180,"#1d4e2e");drawLeaves(720,400,"#245f36");}
    } else if (level.decor === "torontoTower") {
      const sky=ctx.createLinearGradient(0,55,0,H);sky.addColorStop(0,"#68acd2");sky.addColorStop(1,"#d8e6e8");ctx.fillStyle=sky;ctx.fillRect(0,55,W,H-55);
      ctx.fillStyle="rgba(255,255,255,.72)";for(const [x,y,s] of [[90,105,1],[430,170,.8],[760,85,1.15]]){ctx.beginPath();ctx.ellipse(x,y,48*s,15*s,0,0,Math.PI*2);ctx.ellipse(x+38*s,y-5*s,35*s,18*s,0,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#53636c";for(let x=0;x<W;x+=58){const bh=45+(x*7)%105;ctx.fillRect(x,500-bh,48,bh);ctx.fillStyle="#d5c57a";for(let wy=500-bh+12;wy<486;wy+=18)for(let wx=x+8;wx<x+42;wx+=14)ctx.fillRect(wx,wy,5,7);ctx.fillStyle="#53636c";}
      ctx.fillStyle="#aab2b6";ctx.beginPath();ctx.moveTo(445,500);ctx.lineTo(468,130);ctx.lineTo(492,130);ctx.lineTo(515,500);ctx.closePath();ctx.fill();
      ctx.fillStyle="#7b858a";ctx.beginPath();ctx.moveTo(414,188);ctx.quadraticCurveTo(480,155,546,188);ctx.lineTo(530,225);ctx.lineTo(430,225);ctx.closePath();ctx.fill();
      ctx.fillStyle="#dfe5e6";ctx.fillRect(474,63,12,112);ctx.fillStyle="#c33d3d";ctx.fillRect(477,42,6,28);
      ctx.fillStyle="#183e61";roundedRect(38,74,190,39,5);ctx.fill();ctx.strokeStyle="#f4f7f7";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#fff";ctx.font="900 18px system-ui";ctx.textAlign="center";ctx.fillText("TORONTO",133,100);
      const towerTime=performance.now();ctx.strokeStyle="rgba(255,255,255,.42)";ctx.lineWidth=2;for(let i=0;i<12;i++){const x=((towerTime*.08+i*103)%1080)-80,y=125+(i*41)%300;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+38+(i%3)*12,y-3);ctx.stroke();}
      if(Math.floor(towerTime/420)%2===0){ctx.fillStyle="#ff3f43";for(const [x,y] of [[480,43],[438,185],[522,185]]){ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}}
      ctx.strokeStyle="rgba(211,241,248,.75)";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(480,190,62,17,0,0,Math.PI*2);ctx.stroke();
      // Lake Ontario and the islands make the height feel unmistakably Toronto.
      ctx.fillStyle="rgba(67,137,166,.46)";ctx.fillRect(0,455,W,45);ctx.fillStyle="#55795b";for(const [x,w] of [[45,150],[270,95],[620,175],[835,90]]){ctx.beginPath();ctx.ellipse(x,470,w,9,0,0,Math.PI*2);ctx.fill();}
      // Seagulls, because Toronto's real municipal air force must be represented.
      ctx.strokeStyle="#eef4f3";ctx.lineWidth=2;for(const [x,y] of [[255,138],[720,118],[825,205]]){ctx.beginPath();ctx.arc(x-6,y,7,Math.PI,Math.PI*2);ctx.arc(x+6,y,7,Math.PI,Math.PI*2);ctx.stroke();}
      // A tiny external service lift slowly crawls up the tower shaft.
      const liftY=330-Math.abs(Math.sin(towerTime*.00045))*145;ctx.fillStyle="#d6a33b";roundedRect(500,liftY,23,31,3);ctx.fill();ctx.strokeStyle="#4b555a";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#25333a";ctx.fillRect(505,liftY+6,13,10);
      // Height markers and maintenance warnings reward anyone looking around while climbing.
      ctx.fillStyle="#f5eee0";ctx.font="900 10px system-ui";ctx.textAlign="left";for(const [y,label] of [[405,"147 m"],[300,"260 m"],[238,"346 m"]]){ctx.fillRect(535,y-13,42,17);ctx.fillStyle="#273b47";ctx.fillText(label,539,y);ctx.fillStyle="#f5eee0";}
    } else if (level.decor === "towerRestaurant") {
      ctx.fillStyle="#211d25";ctx.fillRect(0,55,W,H-55);ctx.fillStyle="#4c4540";ctx.fillRect(0,345,W,155);ctx.strokeStyle="rgba(214,194,170,.12)";ctx.lineWidth=2;for(let y=358;y<500;y+=18){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      const windowSky=ctx.createLinearGradient(0,70,0,335);windowSky.addColorStop(0,"#65a9ce");windowSky.addColorStop(1,"#d9e1df");ctx.fillStyle=windowSky;roundedRect(30,75,900,270,18);ctx.fill();
      const skylineLayers=[{c:"#91a8b2",y:360,b:[[35,117,80],[135,100,55],[225,140,72],[330,107,48],[405,155,70],[510,121,62],[600,170,80],[710,113,58],[795,147,75],[885,101,44]]},{c:"#536672",y:365,b:[[55,91,42],[165,132,52],[275,103,45],[365,145,54],[470,115,46],[560,139,54],[670,105,40],[750,165,58],[855,125,54]]}];
      for(const layer of skylineLayers){ctx.fillStyle=layer.c;for(const [x,h,w] of layer.b){ctx.fillRect(x,layer.y-h,w,h);ctx.fillStyle="rgba(237,221,159,.58)";for(let wy=layer.y-h+12;wy<layer.y-8;wy+=16)for(let wx=x+8;wx<x+w-6;wx+=14)ctx.fillRect(wx,wy,5,7);ctx.fillStyle=layer.c;}}
      ctx.fillStyle="#41525d";ctx.fillRect(438,165,44,173);ctx.beginPath();ctx.moveTo(438,165);ctx.lineTo(460,122);ctx.lineTo(482,165);ctx.fill();ctx.fillStyle="#687b85";ctx.fillRect(733,185,54,153);ctx.fillStyle="#a6bac2";ctx.fillRect(745,198,6,140);ctx.fillRect(763,198,6,140);
      ctx.strokeStyle="#302a32";ctx.lineWidth=11;for(const x of [190,385,575,765]){ctx.beginPath();ctx.moveTo(x,76);ctx.lineTo(x,345);ctx.stroke();}
      ctx.fillStyle="#f2e6d7";ctx.font="900 15px system-ui";ctx.textAlign="center";ctx.fillText("360 RESTAURANT",480,372);
      for(const x of [280,480,680]){const glow=ctx.createRadialGradient(x,128,2,x,128,40);glow.addColorStop(0,"rgba(255,226,150,.42)");glow.addColorStop(1,"rgba(255,226,150,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,128,40,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#c7a35f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x,108);ctx.stroke();ctx.fillStyle="#e7c87c";ctx.beginPath();ctx.moveTo(x-22,121);ctx.quadraticCurveTo(x,100,x+22,121);ctx.lineTo(x+15,132);ctx.lineTo(x-15,132);ctx.closePath();ctx.fill();}
      const diningTables=[[112,452],[322,452],[552,452],[782,452]];for(const [x,y] of diningTables){ctx.fillStyle="#5d3c48";for(const sx of [-1,1]){roundedRect(x+sx*48-13,y-34,26,43,7);ctx.fill();ctx.strokeStyle="#b99762";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+sx*48-9,y+8);ctx.lineTo(x+sx*48-12,y+36);ctx.moveTo(x+sx*48+9,y+8);ctx.lineTo(x+sx*48+12,y+36);ctx.stroke();}}
      const guests=[[64,408,"#f0c8a4","#221b18","#25395b"],[160,408,"#70452f","#151414","#6a2944"],[274,408,"#9a6548","#2c1714","#244f42"],[370,408,"#e1ad84","#d8c2a6","#26272b"],[504,408,"#5b3529","#171316","#47285c"],[600,408,"#c98f68","#8a4b2f","#244263"],[734,408,"#d7a47e","#3d241d","#3f355f"],[830,408,"#6a4030","#d9c8b2","#27493e"],[910,421,"#b87955","#1b1718","#5a2942"]];
      for(const [x,y,skin,hair,clothes] of guests){ctx.fillStyle=clothes;roundedRect(x-10,y+9,20,31,7);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.fillStyle=hair;ctx.beginPath();ctx.arc(x,y-3,9,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle="#d8b85f";ctx.fillRect(x-5,y+20,10,3);}
      ctx.fillStyle="#202a25";roundedRect(48,92,110,88,5);ctx.fill();ctx.strokeStyle="#d5bc7d";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#f1dfaa";ctx.font="900 10px system-ui";ctx.fillText("TASTING MENU",103,113);ctx.font="8px system-ui";ctx.fillText("CHEESE  $47",103,134);ctx.fillText("ONE GRAPE  $19",103,150);ctx.fillText("AIR  MARKET",103,166);
      ctx.save();ctx.translate(480,468);ctx.strokeStyle="rgba(245,220,172,.18)";ctx.lineWidth=2;for(let a=0;a<Math.PI*2;a+=Math.PI/8){ctx.beginPath();ctx.moveTo(Math.cos(a)*45,Math.sin(a)*7);ctx.lineTo(Math.cos(a)*520,Math.sin(a)*78);ctx.stroke();}ctx.restore();
    } else if (level.decor === "parachute") {
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#4c9fd2");sky.addColorStop(.65,"#cce9ed");sky.addColorStop(1,"#6f9daa");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(255,255,255,.2)";for(const [x,y,s] of [[115,215,1],[385,125,.72],[620,285,1.05],[835,175,.82]]){ctx.beginPath();ctx.ellipse(x,y,70*s,9*s,0,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#4f6671";for(let x=0;x<W;x+=64){const bh=40+(x*11)%145;ctx.fillRect(x,H-bh,54,bh);ctx.fillStyle="#d4c57b";for(let wy=H-bh+14;wy<H-12;wy+=19)ctx.fillRect(x+10,wy,5,7);ctx.fillStyle="#4f6671";}
      ctx.fillStyle="#507f94";ctx.fillRect(0,485,W,15);ctx.strokeStyle="rgba(255,255,255,.32)";ctx.lineWidth=2;for(let x=0;x<W;x+=70){ctx.beginPath();ctx.arc(x,489,26,Math.PI,Math.PI*2);ctx.stroke();}
      ctx.fillStyle="#a4adb2";ctx.beginPath();ctx.moveTo(50,500);ctx.lineTo(76,70);ctx.lineTo(98,70);ctx.lineTo(124,500);ctx.closePath();ctx.fill();ctx.fillStyle="#727e84";ctx.beginPath();ctx.ellipse(87,105,64,26,0,0,Math.PI*2);ctx.fill();
      const airTime=performance.now();ctx.strokeStyle="rgba(255,255,255,.46)";ctx.lineWidth=2;for(let i=0;i<11;i++){const x=((airTime*.1+i*121)%1080)-90,y=80+(i*47)%350;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+28,y-7,x+64,y);ctx.stroke();}
      for(const current of level.airCurrents||[]){ctx.strokeStyle="rgba(225,250,255,.55)";ctx.lineWidth=3;for(let x=current[0]+15;x<current[0]+current[1];x+=28){ctx.beginPath();ctx.moveTo(x,395);ctx.quadraticCurveTo(x+10,330,x+3,265);ctx.stroke();ctx.beginPath();ctx.moveTo(x-4,278);ctx.lineTo(x+3,265);ctx.lineTo(x+10,278);ctx.stroke();}}
      ctx.strokeStyle="#f5d247";ctx.lineWidth=6;ctx.beginPath();ctx.arc(895,474,42,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle="#f5d247";ctx.font="900 12px system-ui";ctx.textAlign="center";ctx.fillText("LAND HERE",895,455);
      // Islands and beaches sit in the lake beneath the falling raccoon.
      ctx.fillStyle="#608d61";ctx.beginPath();ctx.ellipse(570,487,125,8,-.03,0,Math.PI*2);ctx.ellipse(765,491,72,5,.04,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d7c58a";ctx.fillRect(520,489,170,3);
      // A distant Porter plane stays safely outside the raccoon's flight plan.
      const planeX=730-(airTime*.012%220);ctx.fillStyle="#e7edef";ctx.beginPath();ctx.moveTo(planeX,72);ctx.lineTo(planeX+54,76);ctx.lineTo(planeX+18,80);ctx.lineTo(planeX+3,94);ctx.lineTo(planeX+8,79);ctx.lineTo(planeX-12,77);ctx.closePath();ctx.fill();
      // Rooftop antennae and dishes give the city a proper jagged silhouette.
      ctx.strokeStyle="#27363d";ctx.lineWidth=3;for(const x of [240,346,672]){ctx.beginPath();ctx.moveTo(x,455);ctx.lineTo(x,405-(x%37));ctx.stroke();ctx.beginPath();ctx.arc(x+7,420-(x%37),10,.7,2.7);ctx.stroke();}
      // A slower parallax cloud layer adds depth without becoming another platform.
      ctx.fillStyle="rgba(236,248,250,.35)";for(let i=0;i<5;i++){const x=((airTime*.018+i*230)%1160)-100,y=52+(i%3)*115;ctx.beginPath();ctx.ellipse(x,y,70,10,0,0,Math.PI*2);ctx.fill();}
      // Pulsing landing beacon and windsock make the destination readable in motion.
      ctx.strokeStyle=`rgba(255,226,83,${.35+.35*Math.abs(Math.sin(airTime*.006))})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(895,474,50+Math.sin(airTime*.006)*8,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle="#dde6e7";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(830,475);ctx.lineTo(830,432);ctx.stroke();ctx.fillStyle="#e15043";ctx.beginPath();ctx.moveTo(830,434);ctx.lineTo(858,442);ctx.lineTo(830,450);ctx.closePath();ctx.fill();
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
    } else if (level.decor === "highway") {
      const sky=ctx.createLinearGradient(0,70,0,350);sky.addColorStop(0,"#79bddb");sky.addColorStop(1,"#d5e5dc");ctx.fillStyle=sky;ctx.fillRect(0,70,W,290);
      ctx.fillStyle="#728a70";ctx.beginPath();ctx.moveTo(0,350);for(let x=0;x<=W;x+=80)ctx.lineTo(x,315-Math.sin(x*.025)*20);ctx.lineTo(W,370);ctx.lineTo(0,370);ctx.fill();
      ctx.fillStyle="#d7d0c3";ctx.fillRect(0,330,W,28);
      ctx.fillStyle="#30343a";ctx.fillRect(0,358,W,142);
      ctx.fillStyle="#f2d35f";ctx.fillRect(0,365,W,5);
      ctx.fillStyle="rgba(242,239,220,.78)";
      for(let x=25;x<W;x+=105){ctx.fillRect(x,417,58,6);ctx.fillRect(x+42,474,42,5);}
      // The house and open front door mark the beginning of the final escape.
      ctx.fillStyle="#6f6259";ctx.fillRect(0,205,145,253);ctx.fillStyle="#4a312a";ctx.fillRect(28,285,76,173);ctx.fillStyle="#f0c75e";ctx.beginPath();ctx.arc(91,370,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d9d4c9";ctx.fillRect(0,448,145,10);ctx.fillRect(815,448,145,10);
      ctx.fillStyle="#466d43";ctx.fillRect(815,430,145,18);
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
    }else if(level.habitat==="raccoon"){
      // A commercial dumpster inside a fenced alley trash corral: a found enclosure, not a pet cage.
      ctx.fillStyle="#5a4038";ctx.fillRect(20,50,920,446);
      ctx.strokeStyle="#342521";ctx.lineWidth=3;for(let y=72;y<410;y+=34){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(940,y);ctx.stroke();for(let x=20+(y%68?0:35);x<940;x+=70){ctx.beginPath();ctx.moveTo(x,y-33);ctx.lineTo(x,y);ctx.stroke();}}
      ctx.fillStyle="#1a2025";ctx.fillRect(20,405,920,91);
      ctx.strokeStyle="#687077";ctx.lineWidth=2;for(let x=28;x<940;x+=42){ctx.beginPath();ctx.moveTo(x,82);ctx.lineTo(x,496);ctx.stroke();}
      ctx.fillStyle="#303a3e";roundedRect(260,286,420,210,12);ctx.fill();ctx.strokeStyle="#718086";ctx.lineWidth=5;ctx.stroke();
      ctx.fillStyle="#161c1f";ctx.fillRect(275,303,390,36);ctx.fillStyle="#566166";ctx.fillRect(292,317,356,8);
      ctx.fillStyle="#e8d27a";ctx.font="900 22px system-ui";ctx.textAlign="center";ctx.fillText("WASTE",470,390);
      ctx.fillStyle="#17191b";for(const [x,y,r] of [[90,450,45],[190,470,35],[735,458,42],[820,475,32]]){ctx.beginPath();ctx.arc(x,y,r,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle="#596066";ctx.lineWidth=2;ctx.stroke();}
      ctx.fillStyle="#94704b";ctx.fillRect(36,400,140,60);ctx.strokeStyle="#5e432b";ctx.strokeRect(36,400,140,60);
      // Toronto civic confidence, followed immediately by a deeply untrustworthy old advertisement.
      ctx.fillStyle="#1769a6";roundedRect(690,68,220,43,5);ctx.fill();ctx.strokeStyle="#e9f4f7";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#fff";ctx.font="900 20px system-ui";ctx.textAlign="center";ctx.fillText("TORONTO",800,95);
      ctx.save();ctx.translate(72,110);ctx.rotate(-.035);ctx.fillStyle="#cab27b";roundedRect(0,0,205,76,4);ctx.fill();ctx.strokeStyle="#6e5135";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="rgba(74,44,30,.23)";for(let i=0;i<16;i++){ctx.fillRect(8+(i*31)%188,7+(i*17)%58,7+(i%4)*3,3);}
      ctx.fillStyle="#772f28";ctx.font="900 19px system-ui";ctx.fillText("PIZZA 99¢",102,31);ctx.font="800 11px system-ui";ctx.fillText("PROBABLY STILL FINE",102,53);ctx.fillStyle="#5a4030";ctx.beginPath();ctx.moveTo(170,0);ctx.lineTo(205,0);ctx.lineTo(205,27);ctx.closePath();ctx.fill();ctx.restore();
      ctx.fillStyle="#e7bc33";ctx.fillRect(130,432,32,15);ctx.fillStyle="#d44d42";ctx.fillRect(92,444,24,11);ctx.fillStyle="#6f9fba";ctx.beginPath();ctx.arc(220,465,11,0,Math.PI*2);ctx.fill();
      const oil=ctx.createRadialGradient(700,480,3,700,480,70);oil.addColorStop(0,"rgba(117,76,155,.45)");oil.addColorStop(.55,"rgba(57,124,139,.25)");oil.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=oil;ctx.beginPath();ctx.ellipse(700,480,78,13,0,0,Math.PI*2);ctx.fill();
      // Fire escape, graffiti, recycling, wet pavement, and animated alley drips.
      ctx.strokeStyle="#262b2f";ctx.lineWidth=7;ctx.strokeRect(720,105,172,94);ctx.beginPath();ctx.moveTo(735,199);ctx.lineTo(695,286);ctx.moveTo(875,199);ctx.lineTo(835,286);ctx.stroke();
      ctx.lineWidth=3;for(let x=735;x<890;x+=26){ctx.beginPath();ctx.moveTo(x,108);ctx.lineTo(x,196);ctx.stroke();}
      ctx.strokeStyle="rgba(109,199,159,.48)";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(70,155);ctx.quadraticCurveTo(125,125,176,158);ctx.quadraticCurveTo(130,190,78,172);ctx.stroke();
      const alleyTime=performance.now();ctx.strokeStyle="rgba(168,202,214,.28)";ctx.lineWidth=2;for(let i=0;i<18;i++){const x=35+(i*83)%880,y=70+((alleyTime*.06+i*47)%330);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+12);ctx.stroke();}
      ctx.fillStyle="rgba(247,211,112,.18)";ctx.beginPath();ctx.arc(805,92,55+Math.sin(alleyTime*.006)*5,0,Math.PI*2);ctx.fill();
      // The bus is now safely printed on a battered transit sign, nowhere near the dumpster roof.
      ctx.save();ctx.translate(500,78);ctx.rotate(.025);ctx.fillStyle="#ece7d9";roundedRect(0,0,165,86,5);ctx.fill();ctx.strokeStyle="#303a40";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#d83b42";roundedRect(20,18,104,37,5);ctx.fill();ctx.fillStyle="#dcebf0";for(let x=29;x<111;x+=22)ctx.fillRect(x,24,16,12);ctx.fillStyle="#24292c";ctx.beginPath();ctx.arc(40,57,6,0,Math.PI*2);ctx.arc(104,57,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#252b2e";ctx.font="900 10px system-ui";ctx.textAlign="center";ctx.fillText("TTC NIGHT BUS",82,75);ctx.restore();
      ctx.fillStyle="#31383c";for(let x=735;x<835;x+=9)ctx.fillRect(x,475,5,18);ctx.fillStyle="rgba(210,224,226,.18)";for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(755+i*17,455-((alleyTime*.018+i*19)%65),10+i*2,0,Math.PI*2);ctx.fill();}
      ctx.save();ctx.translate(300,462);ctx.rotate(-.08);ctx.fillStyle="#d2cab4";ctx.fillRect(0,0,86,25);ctx.fillStyle="#3f4546";ctx.font="900 8px system-ui";ctx.fillText("TORONTO SUN",43,10);ctx.font="7px system-ui";ctx.fillText("RACCOON STILL AT LARGE",43,20);ctx.restore();
      // Rooftop water tower silhouette.
      ctx.fillStyle="#24292d";ctx.beginPath();ctx.moveTo(335,70);ctx.lineTo(405,70);ctx.lineTo(394,126);ctx.lineTo(346,126);ctx.closePath();ctx.fill();ctx.strokeStyle="#24292d";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(350,126);ctx.lineTo(340,170);ctx.moveTo(390,126);ctx.lineTo(400,170);ctx.stroke();
      // Flickering convenience-store neon, rated for approximately one more winter.
      ctx.save();ctx.globalAlpha=Math.floor(alleyTime/370)%5===0?.35:.95;ctx.shadowColor="#ff5b89";ctx.shadowBlur=12;ctx.strokeStyle="#ff5b89";ctx.lineWidth=3;ctx.strokeRect(72,205,112,38);ctx.fillStyle="#ffd4e1";ctx.font="900 15px system-ui";ctx.fillText("OPEN 24H",128,230);ctx.restore();
      // Compost bin with a suspiciously active lid.
      ctx.fillStyle="#345b42";roundedRect(518,419,66,77,6);ctx.fill();ctx.fillStyle="#1f3829";ctx.fillRect(512,417,78,10);ctx.fillStyle="#cce0b4";ctx.font="900 9px system-ui";ctx.fillText("GREEN BIN",551,458);
      // Clothesline and grim little socks make the alley feel inhabited.
      ctx.strokeStyle="#b6aaa0";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(285,188);ctx.quadraticCurveTo(385,216,488,181);ctx.stroke();for(const [x,y,c] of [[325,197,"#7e8f9b"],[370,201,"#c65b55"],[420,195,"#d3c277"]]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y+2);ctx.lineTo(x+15,y+27);ctx.lineTo(x+4,y+25);ctx.closePath();ctx.fill();}
      // Rain reflections sit on the pavement instead of floating over the trash.
      ctx.globalAlpha=.25;for(const [x,w,c] of [[80,75,"#ff5b89"],[505,105,"#e8e1c8"],[700,85,"#58a0be"]]){ctx.fillStyle=c;ctx.fillRect(x,485,w,3);ctx.fillRect(x+15,491,w*.55,2);}ctx.globalAlpha=.7;
    }else if(level.habitat==="opossum"){
      // Mesh rehabilitation pen with nest boxes, natural logs, leaf litter, and a water pan.
      const daylight=ctx.createLinearGradient(0,50,0,496);daylight.addColorStop(0,"#87a98b");daylight.addColorStop(1,"#344638");ctx.fillStyle=daylight;ctx.fillRect(20,50,920,446);
      ctx.fillStyle="#5a432b";for(const x of [22,238,476,714,925])ctx.fillRect(x,50,15,446);
      ctx.strokeStyle="rgba(190,205,188,.28)";ctx.lineWidth=1;
      for(let x=-300;x<1200;x+=26){ctx.beginPath();ctx.moveTo(x,50);ctx.lineTo(x+450,500);ctx.stroke();ctx.beginPath();ctx.moveTo(x,500);ctx.lineTo(x+450,50);ctx.stroke();}
      ctx.fillStyle="#493520";roundedRect(54,255,180,130,8);ctx.fill();ctx.fillStyle="#131713";ctx.beginPath();ctx.arc(145,350,38,Math.PI,Math.PI*2);ctx.fill();
      ctx.fillStyle="#dec99e";roundedRect(65,270,158,33,4);ctx.fill();ctx.fillStyle="#463624";ctx.font="900 11px system-ui";ctx.textAlign="center";ctx.fillText("WILDLIFE REHABILITATION",144,291);
      ctx.fillStyle="#6a7c72";ctx.beginPath();ctx.ellipse(550,474,88,20,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(121,190,199,.58)";ctx.beginPath();ctx.ellipse(550,470,75,12,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#60452c";for(let x=22;x<940;x+=28){ctx.beginPath();ctx.ellipse(x,486-(x%4)*3,22,7,(x%3-.8)*.3,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#465c3c";for(const x of [280,750,865]){ctx.beginPath();ctx.ellipse(x,450,35,65,0,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle="#57402a";ctx.lineWidth=24;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(270,455);ctx.lineTo(410,375);ctx.moveTo(655,460);ctx.lineTo(810,382);ctx.stroke();
      ctx.fillStyle="#d7c394";for(const [x,y] of [[315,474],[350,467],[385,480],[830,475]]){ctx.beginPath();ctx.ellipse(x,y,30,7,.2,0,Math.PI*2);ctx.fill();}
      // Rehab-specific enrichment: carrier, fleece nest, heating pad, tire, and low amber lamp.
      ctx.fillStyle="#37433f";roundedRect(805,350,105,94,12);ctx.fill();ctx.strokeStyle="#8f9d95";ctx.lineWidth=3;for(let x=818;x<900;x+=14){ctx.beginPath();ctx.moveTo(x,365);ctx.lineTo(x,418);ctx.stroke();}
      ctx.fillStyle="#8a5965";ctx.beginPath();ctx.moveTo(78,438);ctx.quadraticCurveTo(145,404,214,440);ctx.lineTo(205,482);ctx.quadraticCurveTo(142,456,82,482);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(218,126,75,.34)";roundedRect(455,451,118,30,5);ctx.fill();ctx.strokeStyle="#df9a69";ctx.lineWidth=2;for(let x=466;x<562;x+=14){ctx.beginPath();ctx.moveTo(x,456);ctx.lineTo(x,476);ctx.stroke();}
      ctx.strokeStyle="#292d2a";ctx.lineWidth=16;ctx.beginPath();ctx.arc(655,425,34,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="#737c73";ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle="#554936";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(418,50);ctx.lineTo(418,122);ctx.stroke();ctx.fillStyle="rgba(255,197,110,.22)";ctx.beginPath();ctx.arc(418,139,88,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d8a95d";ctx.beginPath();ctx.moveTo(384,122);ctx.lineTo(452,122);ctx.lineTo(438,150);ctx.lineTo(398,150);ctx.closePath();ctx.fill();
      const rehabTime=performance.now();ctx.fillStyle="rgba(214,231,174,.35)";for(let i=0;i<12;i++){const x=250+(i*61)%630,y=92+Math.sin(rehabTime*.0018+i)*22+(i*29)%275;ctx.beginPath();ctx.arc(x,y,1.5+(i%2),0,Math.PI*2);ctx.fill();}
    }else if(level.habitat==="bat"){
      // Humid, dim flight habitat with artificial cave walls and upside-down roosts.
      ctx.fillStyle="#090914";ctx.fillRect(20,50,920,446);
      const caveGlow=ctx.createRadialGradient(720,250,10,720,250,300);caveGlow.addColorStop(0,"rgba(89,82,126,.36)");caveGlow.addColorStop(1,"rgba(5,5,12,0)");ctx.fillStyle=caveGlow;ctx.fillRect(20,50,920,446);
      ctx.fillStyle="#25243a";ctx.beginPath();ctx.moveTo(20,50);for(let x=20;x<=940;x+=80)ctx.lineTo(x,70+(x%160?35:0));ctx.lineTo(940,50);ctx.closePath();ctx.fill();
      ctx.fillStyle="#57506a";ctx.strokeStyle="#8b819d";ctx.lineWidth=2;for(const [x,h] of [[65,88],[155,55],[245,112],[280,100],[430,65],[560,105],[735,70],[900,115]]){ctx.beginPath();ctx.moveTo(x-27,50);ctx.lineTo(x,50+h);ctx.lineTo(x+28,50);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.fillStyle="#343044";for(const [x,y,r] of [[80,430,85],[255,470,100],[520,460,95],[760,450,120],[920,440,80]]){ctx.beginPath();ctx.arc(x,y,r,Math.PI,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#171827";for(const [x,y] of [[170,105],[340,130],[610,96],[790,118]]){ctx.beginPath();ctx.moveTo(x-22,y);ctx.quadraticCurveTo(x,y+28,x+22,y);ctx.lineTo(x+12,y+45);ctx.lineTo(x-12,y+45);ctx.closePath();ctx.fill();}
      ctx.fillStyle="rgba(111,140,172,.18)";ctx.beginPath();ctx.ellipse(675,455,115,24,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#7d2028";ctx.beginPath();ctx.arc(80,95,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(177,37,50,.14)";ctx.beginPath();ctx.arc(80,95,85,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#12111c";for(const [x,y] of [[240,115],[475,95],[675,130],[865,100]]){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-18,10,-28,2);ctx.quadraticCurveTo(-13,23,0,28);ctx.quadraticCurveTo(13,23,28,2);ctx.quadraticCurveTo(18,10,0,0);ctx.fill();ctx.restore();}
      ctx.fillStyle="#c8a770";for(const [x,y] of [[125,320],[530,308],[820,128]]){ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#74435c";ctx.beginPath();ctx.arc(x+13,y+2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c8a770";}
      // Moon window, humidifier mist, rope web, hanging fruit cups, and a living colony.
      ctx.fillStyle="#11182a";ctx.beginPath();ctx.arc(855,155,70,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d8d9c6";ctx.beginPath();ctx.arc(838,145,48,0,Math.PI*2);ctx.fill();ctx.fillStyle="#151529";ctx.beginPath();ctx.arc(858,134,45,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#736352";ctx.lineWidth=4;for(const [x1,y1,x2,y2] of [[120,78,330,205],[330,75,540,180],[540,82,760,212]]){ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+35,x2,y2);ctx.stroke();}
      ctx.fillStyle="#745b49";for(const [x,y] of [[305,185],[548,182],[750,213]]){roundedRect(x-18,y-5,36,16,5);ctx.fill();ctx.fillStyle="#d99a45";ctx.beginPath();ctx.arc(x-6,y-6,6,0,Math.PI*2);ctx.arc(x+7,y-7,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#745b49";}
      const batTime=performance.now();ctx.fillStyle="rgba(174,205,221,.1)";for(let i=0;i<10;i++){const x=545+(i*37)%310,y=470-((batTime*.025+i*29)%155);ctx.beginPath();ctx.arc(x,y,12+(i%3)*4,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#171724";for(let i=0;i<7;i++){const x=145+i*112,y=120+Math.sin(batTime*.004+i)*22;ctx.save();ctx.translate(x,y);ctx.scale(.55,.55);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-20,-10,-34,6);ctx.quadraticCurveTo(-17,2,0,18);ctx.quadraticCurveTo(17,2,34,6);ctx.quadraticCurveTo(20,-10,0,0);ctx.fill();ctx.restore();}
    }else if(level.habitat==="goat"){
      const sky=ctx.createLinearGradient(0,50,0,500);sky.addColorStop(0,"#9fc8d7");sky.addColorStop(1,"#d8d39e");ctx.fillStyle=sky;ctx.fillRect(20,50,920,446);
      ctx.fillStyle="#b68a58";ctx.fillRect(20,285,920,211);ctx.strokeStyle="#775334";ctx.lineWidth=8;for(let x=25;x<940;x+=130){ctx.beginPath();ctx.moveTo(x,285);ctx.lineTo(x,496);ctx.stroke();}
      ctx.fillStyle="#6b4429";ctx.fillRect(610,90,310,260);ctx.fillStyle="#3b281c";ctx.beginPath();ctx.moveTo(580,105);ctx.lineTo(765,35);ctx.lineTo(940,105);ctx.closePath();ctx.fill();
      ctx.fillStyle="#17130f";roundedRect(700,170,125,180,6);ctx.fill();ctx.fillStyle="#e0c06e";for(let x=35;x<580;x+=38){ctx.beginPath();ctx.moveTo(x,490);ctx.lineTo(x+10,455-(x%3)*7);ctx.lineTo(x+18,490);ctx.fill();}
      ctx.fillStyle="#8d765c";ctx.beginPath();ctx.arc(155,395,62,0,Math.PI*2);ctx.fill();ctx.fillStyle="#27231e";ctx.beginPath();ctx.arc(155,395,20,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#f3e3ae";ctx.font="900 14px system-ui";ctx.textAlign="center";ctx.fillText("GOAT-PROOF LATCH",765,145);
    }else if(level.habitat==="highland"){
      const moor=ctx.createLinearGradient(0,50,0,500);moor.addColorStop(0,"#8fc4d2");moor.addColorStop(.52,"#b8c49a");moor.addColorStop(1,"#526b3e");ctx.fillStyle=moor;ctx.fillRect(20,50,920,446);
      ctx.fillStyle="#788a67";ctx.beginPath();ctx.moveTo(20,300);ctx.lineTo(175,125);ctx.lineTo(310,300);ctx.lineTo(500,95);ctx.lineTo(680,300);ctx.lineTo(820,145);ctx.lineTo(940,280);ctx.lineTo(940,500);ctx.lineTo(20,500);ctx.closePath();ctx.fill();
      ctx.fillStyle="#d7d9d0";ctx.beginPath();ctx.moveTo(150,150);ctx.lineTo(175,125);ctx.lineTo(202,160);ctx.lineTo(185,154);ctx.lineTo(170,170);ctx.closePath();ctx.moveTo(465,132);ctx.lineTo(500,95);ctx.lineTo(535,134);ctx.lineTo(510,126);ctx.lineTo(493,146);ctx.closePath();ctx.fill();
      ctx.fillStyle="#5d7845";ctx.beginPath();ctx.moveTo(20,405);ctx.quadraticCurveTo(180,300,335,425);ctx.quadraticCurveTo(510,285,690,415);ctx.quadraticCurveTo(825,320,940,390);ctx.lineTo(940,500);ctx.lineTo(20,500);ctx.fill();
      ctx.fillStyle="#789a55";for(let x=25;x<940;x+=24){ctx.beginPath();ctx.moveTo(x,490);ctx.lineTo(x+5,470-(x%5)*5);ctx.lineTo(x+10,490);ctx.fill();}
    }else if(level.habitat==="devilfox"){
      const inferno=ctx.createRadialGradient(480,280,20,480,280,500);inferno.addColorStop(0,"#5b174b");inferno.addColorStop(.55,"#24102f");inferno.addColorStop(1,"#090510");ctx.fillStyle=inferno;ctx.fillRect(20,50,920,446);
      ctx.fillStyle="#0b0611";ctx.beginPath();ctx.arc(760,135,70,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f0c4e7";ctx.beginPath();ctx.arc(742,125,54,0,Math.PI*2);ctx.fill();ctx.fillStyle="#24102f";ctx.beginPath();ctx.arc(764,110,52,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#32143a";ctx.lineWidth=22;ctx.lineCap="round";for(const [x,b] of [[90,35],[300,-30],[585,28],[880,-38]]){ctx.beginPath();ctx.moveTo(x,500);ctx.bezierCurveTo(x+b,390,x-b,250,x+b*.4,90);ctx.stroke();}
      ctx.fillStyle="#35103a";for(const [x,y,r] of [[75,465,70],[240,490,90],[520,475,100],[790,480,115],[930,460,70]]){ctx.beginPath();ctx.arc(x,y,r,Math.PI,Math.PI*2);ctx.fill();}
      ctx.strokeStyle="#9a426f";ctx.lineWidth=5;ctx.beginPath();ctx.arc(470,464,92,0,Math.PI*2);ctx.moveTo(470,372);ctx.lineTo(470,556);ctx.moveTo(378,464);ctx.lineTo(562,464);ctx.stroke();
      ctx.fillStyle="#e65d9e";for(const [x,y] of [[135,420],[320,445],[610,425],[845,410]]){for(let i=0;i<5;i++){ctx.save();ctx.translate(x,y);ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-14,5,15,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.fillStyle="#ffd1e8";ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e65d9e";}
      ctx.fillStyle="rgba(255,103,177,.55)";for(let i=0;i<24;i++){const x=35+(i*137)%890,y=80+(i*73)%360;ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill();}
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
    if(level.habitat==="raccoon"){
      ctx.strokeStyle="#8b969b";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(cx-10,y);ctx.lineTo(cx-10,y+h);ctx.moveTo(cx+10,y);ctx.lineTo(cx+10,y+h);ctx.stroke();
      ctx.lineWidth=3;for(let rung=y+12;rung<y+h;rung+=20){ctx.beginPath();ctx.moveTo(cx-10,rung);ctx.lineTo(cx+10,rung);ctx.stroke();}
      ctx.restore();return;
    }
    if(level.habitat==="opossum"){
      ctx.strokeStyle="#6a4c30";ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(cx,y+h);ctx.bezierCurveTo(cx-8,y+h*.65,cx+8,y+h*.3,cx,y);ctx.stroke();
      ctx.strokeStyle="#a48a67";ctx.lineWidth=3;for(let peg=y+15,index=0;peg<y+h;peg+=24,index++){ctx.beginPath();ctx.moveTo(cx,peg);ctx.lineTo(cx+(index%2?18:-18),peg-8);ctx.stroke();}
      ctx.restore();return;
    }
    if(level.habitat==="bat"){
      ctx.strokeStyle="#9a8772";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,y);ctx.bezierCurveTo(cx-8,y+h*.3,cx+9,y+h*.7,cx,y+h);ctx.stroke();
      ctx.strokeStyle="#5e5045";ctx.lineWidth=1.5;for(let knot=y+18;knot<y+h;knot+=22){ctx.beginPath();ctx.arc(cx,knot,6,0,Math.PI*2);ctx.stroke();}
      ctx.restore();return;
    }
    if(level.habitat==="devilfox"){
      ctx.strokeStyle="#421546";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(cx,y+h);ctx.bezierCurveTo(cx-20,y+h*.7,cx+18,y+h*.35,cx,y);ctx.stroke();
      ctx.strokeStyle="#cf4d8a";ctx.lineWidth=2.5;ctx.stroke();for(let s=y+18;s<y+h;s+=28){ctx.fillStyle="#8d315f";ctx.beginPath();ctx.moveTo(cx,s);ctx.lineTo(cx-14,s-8);ctx.lineTo(cx-5,s+7);ctx.fill();}
      ctx.restore();return;
    }
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
    ctx.strokeStyle=level.habitat==="highland"?"#49613a":level.palette[2];ctx.lineWidth=width||18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle=level.habitat==="highland"?"#83a85d":"rgba(255,255,255,.18)";ctx.lineWidth=level.habitat==="highland"?7:2;ctx.beginPath();ctx.moveTo(x1-2,y1-4);ctx.lineTo(x2-2,y2-4);ctx.stroke();
    ctx.restore();
  }

  function drawCeilingVine(v) {
    const [x,y,w,h,kind]=v;const cy=y+h/2;
    ctx.save();ctx.lineCap="round";
    if(kind==="batRope"){
      ctx.strokeStyle="#8a7967";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,cy);ctx.bezierCurveTo(x+w*.3,cy+18,x+w*.7,cy-12,x+w,cy+5);ctx.stroke();
      ctx.strokeStyle="#b1a18e";ctx.lineWidth=1.5;ctx.stroke();ctx.restore();return;
    }
    if(kind==="infernalChain"){
      ctx.strokeStyle="#9d4d7d";ctx.lineWidth=4;for(let px=x;px<x+w;px+=15){ctx.beginPath();ctx.ellipse(px,cy+(px%30?3:-3),9,5,px%30?.3:-.3,0,Math.PI*2);ctx.stroke();}ctx.restore();return;
    }
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
      if(level.habitat==="goat"&&p[4]!=="barnFloor"){
        if(p[4]==="hayBale"){ctx.fillStyle="#d5aa4c";roundedRect(p[0],p[1],p[2],p[3],5);ctx.fill();ctx.strokeStyle="#8d6b2d";ctx.lineWidth=2;for(let x=p[0]+12;x<p[0]+p[2];x+=18){ctx.beginPath();ctx.moveTo(x,p[1]+2);ctx.lineTo(x-6,p[1]+p[3]-2);ctx.stroke();}}
        else if(p[4]==="spool"){ctx.fillStyle="#80684d";roundedRect(p[0],p[1],p[2],p[3],8);ctx.fill();ctx.strokeStyle="#4a3828";ctx.lineWidth=4;ctx.beginPath();ctx.arc(p[0]+p[2]/2,p[1]+p[3]/2,Math.min(30,p[3]),0,Math.PI*2);ctx.stroke();}
        else{ctx.fillStyle=p[4]==="loft"?"#5a3925":"#8a613b";roundedRect(p[0],p[1],p[2],p[3],4);ctx.fill();ctx.fillStyle="#b98b58";ctx.fillRect(p[0]+6,p[1]+3,p[2]-12,4);}
      }else if(level.habitat==="highland"&&p[4]!=="mudPasture"){
        ctx.fillStyle=p[4]==="mountainShelf"?"#506245":"#627b49";roundedRect(p[0],p[1],p[2],p[3],18);ctx.fill();ctx.fillStyle="#86a95e";ctx.fillRect(p[0]+6,p[1],p[2]-12,8);ctx.strokeStyle="#9cba74";ctx.lineWidth=2;for(let x=p[0]+12;x<p[0]+p[2]-8;x+=18){ctx.beginPath();ctx.moveTo(x,p[1]+5);ctx.lineTo(x+4,p[1]-4);ctx.stroke();}
      }else if(level.habitat==="devilfox"&&p[4]!=="velvetFloor"){
        if(p[4]==="mushroom"){ctx.fillStyle="#dd4c93";ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+5,p[2]/2,p[3],0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle="#eee0e8";ctx.fillRect(p[0]+p[2]/2-10,p[1]+5,20,p[3]);}
        else if(p[4]==="crystal"){ctx.fillStyle="#b957d3";ctx.beginPath();ctx.moveTo(p[0],p[1]+p[3]);ctx.lineTo(p[0]+18,p[1]-13);ctx.lineTo(p[0]+34,p[1]+p[3]);ctx.lineTo(p[0]+p[2]/2,p[1]-20);ctx.lineTo(p[0]+p[2]-22,p[1]+p[3]);ctx.lineTo(p[0]+p[2],p[1]-10);ctx.lineTo(p[0]+p[2],p[1]+p[3]);ctx.closePath();ctx.fill();}
        else{ctx.fillStyle=p[4]==="obsidian"?"#17101f":"#46183f";roundedRect(p[0],p[1],p[2],p[3],8);ctx.fill();ctx.strokeStyle="#bc4b84";ctx.lineWidth=2;ctx.stroke();}
      }else if(level.habitat==="raccoon"&&p[4]!=="alley"){
        if(level.decor==="torontoTower"){
          ctx.fillStyle=p[4]==="observation"?"#9d3d3a":p[4]==="antenna"?"#d8dee0":"#758086";roundedRect(p[0],p[1],p[2],p[3],4);ctx.fill();ctx.strokeStyle="#d9e0e2";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="rgba(255,255,255,.32)";ctx.fillRect(p[0]+7,p[1]+3,p[2]-14,3);
          ctx.fillStyle="#2f3b40";for(let x=p[0]+12;x<p[0]+p[2]-6;x+=26){ctx.beginPath();ctx.arc(x,p[1]+p[3]-5,2.2,0,Math.PI*2);ctx.fill();}
          if(p[4]==="observation"){ctx.fillStyle="#b9dce7";for(let x=p[0]+10;x<p[0]+p[2]-8;x+=24)ctx.fillRect(x,p[1]+5,15,8);}
        }else if(level.decor==="towerRestaurant"){
          if(p[4]==="table"||p[4]==="chandelier"){if(p[4]==="table"&&p[1]>400){ctx.fillStyle="#a98b61";ctx.fillRect(p[0]+p[2]/2-5,p[1]+6,10,500-p[1]-6);}ctx.fillStyle="#eee5d8";ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+6,p[2]/2,p[3]/2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#b99b69";ctx.lineWidth=3;ctx.stroke();}
          else{ctx.fillStyle=p[4]==="banquette"?"#762b3c":p[4]==="bar"?"#9a754b":"#555c61";roundedRect(p[0],p[1],p[2],p[3],6);ctx.fill();ctx.strokeStyle="#d6c093";ctx.lineWidth=2;ctx.stroke();}
        }else if(level.decor==="parachute"){
          if(p[4]==="cloud"){ctx.fillStyle="rgba(255,255,255,.82)";ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+7,p[2]/2,p[3]/2,0,0,Math.PI*2);ctx.ellipse(p[0]+p[2]*.35,p[1]+1,p[2]*.22,p[3]*.72,0,0,Math.PI*2);ctx.fill();}
          else{ctx.fillStyle=p[4]==="towerRoof"?"#767f84":"#424e54";roundedRect(p[0],p[1],p[2],p[3],4);ctx.fill();ctx.fillStyle="#aeb7ba";ctx.fillRect(p[0]+5,p[1]+3,p[2]-10,4);}
        }else{
          if(p[4]==="trash")ctx.fillStyle="#25292b";
          else if(p[4]==="cardboard")ctx.fillStyle="#9a724a";
          else if(p[4]==="fence")ctx.fillStyle="#667078";
          else if(p[4]==="recycling")ctx.fillStyle="#356579";
          else if(p[4]==="awning")ctx.fillStyle="#8e3036";
          else ctx.fillStyle="#3c484c";
          roundedRect(p[0],p[1],p[2],p[3],5);ctx.fill();ctx.strokeStyle="#8c9698";ctx.lineWidth=2;ctx.stroke();
          if(p[4]==="dumpster"){ctx.fillStyle="#172024";ctx.fillRect(p[0]+8,p[1]+5,p[2]-16,5);ctx.fillStyle="#9aa3a5";for(const x of [p[0]+15,p[0]+p[2]-15]){ctx.beginPath();ctx.arc(x,p[1]+p[3]/2,2,0,Math.PI*2);ctx.fill();}}
          if(p[4]==="cardboard"){ctx.fillStyle="rgba(225,190,135,.55)";ctx.fillRect(p[0]+p[2]/2-8,p[1]+2,16,p[3]-4);ctx.strokeStyle="#6e4f32";ctx.beginPath();ctx.moveTo(p[0]+8,p[1]+p[3]-4);ctx.lineTo(p[0]+p[2]-8,p[1]+4);ctx.stroke();}
          if(p[4]==="fence"){ctx.strokeStyle="#aab1b4";for(let x=p[0]+10;x<p[0]+p[2];x+=18){ctx.beginPath();ctx.moveTo(x,p[1]);ctx.lineTo(x,p[1]+p[3]);ctx.stroke();}}
          if(p[4]==="recycling"){ctx.fillStyle="#74a5b5";ctx.fillRect(p[0]+8,p[1]+10,p[2]-16,8);ctx.fillStyle="#d5e4e5";ctx.font="900 10px system-ui";ctx.textAlign="center";ctx.fillText("RECYCLE",p[0]+p[2]/2,p[1]+53);}
        }
      }else if(level.habitat==="opossum"&&p[4]!=="leafLitter"){
        if(p[4]==="nestbox"){ctx.fillStyle="#67472c";roundedRect(p[0],p[1],p[2],p[3],4);ctx.fill();ctx.fillStyle="#252018";ctx.beginPath();ctx.arc(p[0]+p[2]*.7,p[1]+5,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#b98d66";for(let x=p[0]+10;x<p[0]+p[2]*.48;x+=12){ctx.beginPath();ctx.ellipse(x,p[1]+6,10,3,-.2,0,Math.PI*2);ctx.fill();}}
        else if(p[4]==="meshShelf"){ctx.fillStyle="#77817a";ctx.fillRect(p[0],p[1],p[2],p[3]);ctx.strokeStyle="#b3bbb5";for(let x=p[0]+8;x<p[0]+p[2];x+=16){ctx.beginPath();ctx.moveTo(x,p[1]);ctx.lineTo(x,p[1]+p[3]);ctx.stroke();}}
        else if(p[4]==="tire"){ctx.strokeStyle="#252826";ctx.lineWidth=15;ctx.beginPath();ctx.ellipse(p[0]+p[2]/2,p[1]+8,p[2]*.42,18,0,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle="#737b74";ctx.lineWidth=2;ctx.stroke();}
        else if(p[4]==="carrier"){ctx.fillStyle="#3e4a46";roundedRect(p[0],p[1],p[2],p[3],5);ctx.fill();ctx.strokeStyle="#9aa59e";ctx.lineWidth=2;for(let x=p[0]+10;x<p[0]+p[2]-5;x+=16){ctx.beginPath();ctx.moveTo(x,p[1]+3);ctx.lineTo(x,p[1]+p[3]-3);ctx.stroke();}}
        else{ctx.strokeStyle="#543b27";ctx.lineWidth=p[3];ctx.lineCap="round";ctx.beginPath();ctx.moveTo(p[0]+5,p[1]+p[3]/2);ctx.quadraticCurveTo(p[0]+p[2]/2,p[1]-3,p[0]+p[2]-5,p[1]+p[3]/2);ctx.stroke();}
      }else if(level.habitat==="bat"&&p[4]!=="caveFloor"){
        if(p[4]==="fruitTray"){ctx.fillStyle="#715746";roundedRect(p[0],p[1],p[2],p[3],5);ctx.fill();for(let x=p[0]+16,index=0;x<p[0]+p[2]-8;x+=25,index++){ctx.fillStyle=["#e4a33a","#8c4f79","#d95b4e"][index%3];ctx.beginPath();ctx.arc(x,p[1]+3,7,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle="#517447";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,p[1]-4);ctx.lineTo(x+4,p[1]-9);ctx.stroke();}}
        else{ctx.fillStyle="#3a3544";roundedRect(p[0],p[1],p[2],p[3],8);ctx.fill();ctx.strokeStyle="#655e70";ctx.lineWidth=2;ctx.stroke();}
      }else if(level.decor==="kitchen"&&p[4]==="fridgeTop"){
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
      }else if(level.decor==="highway"&&p[4]==="sidewalk"){
        ctx.fillStyle="#c9c7c0";ctx.fillRect(p[0],p[1],p[2],p[3]);ctx.fillStyle="#ece8dc";ctx.fillRect(p[0],p[1],p[2],7);ctx.strokeStyle="#8f918d";ctx.lineWidth=1;for(let x=p[0]+35;x<p[0]+p[2];x+=42){ctx.beginPath();ctx.moveTo(x,p[1]+7);ctx.lineTo(x,p[1]+p[3]);ctx.stroke();}
      }else if(level.decor==="highway"&&p[4]==="median"){
        ctx.fillStyle="#b8b6ae";ctx.fillRect(p[0],p[1],p[2],p[3]);ctx.fillStyle="#e4c349";ctx.fillRect(p[0],p[1],p[2],7);ctx.fillStyle="#55724a";ctx.fillRect(p[0]+8,p[1]+7,p[2]-16,8);
      }else if(level.decor==="highway"&&p[4]==="roadSign"){
        ctx.fillStyle="#315c70";roundedRect(p[0],p[1],p[2],p[3],3);ctx.fill();ctx.fillStyle="#d5edf1";ctx.fillRect(p[0]+7,p[1]+4,p[2]-14,3);ctx.strokeStyle="#747b7e";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p[0]+15,p[1]+p[3]);ctx.lineTo(p[0]+15,500);ctx.moveTo(p[0]+p[2]-15,p[1]+p[3]);ctx.lineTo(p[0]+p[2]-15,500);ctx.stroke();
      }else if(level.decor==="enclosure"&&p[1]<490){
        const y=p[1]+p[3]/2;
        ctx.strokeStyle="#51351f";ctx.lineWidth=p[3];ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(p[0]+5,y);ctx.quadraticCurveTo(p[0]+p[2]*.48,y-7,p[0]+p[2]-5,y+2);ctx.stroke();
        ctx.fillStyle="#5f8144";
        for(let bx=p[0]+14;bx<p[0]+p[2]-10;bx+=18){const by=y-5-Math.sin(bx*.09)*3;ctx.beginPath();ctx.moveTo(bx-9,by+3);ctx.quadraticCurveTo(bx-5,by-5,bx,by+1);ctx.quadraticCurveTo(bx+5,by-7,bx+10,by+3);ctx.closePath();ctx.fill();}
        ctx.strokeStyle="#624125";ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(p[0]+p[2]*.3,y-5);ctx.lineTo(p[0]+p[2]*.2,y-22);ctx.moveTo(p[0]+p[2]*.72,y);ctx.lineTo(p[0]+p[2]*.82,y-17);ctx.stroke();
      }else if(level.habitat==="bat"&&p[4]==="caveWall"){
        ctx.fillStyle="#393545";roundedRect(p[0],p[1],p[2],p[3],4);ctx.fill();ctx.strokeStyle="#8e839b";ctx.lineWidth=2;ctx.stroke();
      }else{
        ctx.fillStyle = p[1] >= 490 ? "#111914" : level.palette[2];
        roundedRect(p[0], p[1], p[2], p[3], 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(p[0] + 7, p[1] + 3, Math.max(0, p[2] - 14), 2);
      }
    }
    for (const v of level.vines) drawClimbablePlant(v,level);
    for (const p of level.angledPlatforms||[]) {
      if(level.habitat==="raccoon"&&level.decor==="enclosure"){
        const [x1,y1,x2,y2,width]=p;ctx.save();ctx.lineCap="round";ctx.strokeStyle="#596267";ctx.lineWidth=width||16;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle="#aab2b4";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1-2);ctx.lineTo(x2,y2-2);ctx.stroke();for(let t=.12;t<1;t+=.16){const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;ctx.beginPath();ctx.moveTo(x-5,y-5);ctx.lineTo(x+5,y+5);ctx.stroke();}ctx.restore();
      }else if(level.decor==="kitchen"){
        const [x1,y1,x2,y2,width]=p;
        ctx.save();ctx.lineCap="round";ctx.strokeStyle="#8d7358";ctx.lineWidth=width||18;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle="#d8c5a4";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1-3);ctx.lineTo(x2,y2-3);ctx.stroke();ctx.restore();
      }else drawAngledPlatform(p,level);
    }
    for (const v of level.diagonalVines||[]) drawDiagonalVine(v);
    for (const v of level.ceilingVines||[]) drawCeilingVine(v);
    for(const config of (level.swings||[])){const swing=tireSwingPosition(config,performance.now());ctx.strokeStyle="#6b5945";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(swing.anchorX,swing.anchorY);ctx.lineTo(swing.centerX,swing.centerY);ctx.stroke();ctx.strokeStyle="#232625";ctx.lineWidth=16;ctx.beginPath();ctx.ellipse(swing.centerX,swing.centerY,config[4]/2,22,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="#7c837c";ctx.lineWidth=2;ctx.stroke();}
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
    const destination=level.decor==="torontoTower"?"OBSERVATION DECK":level.decor==="towerRestaurant"?"EMERGENCY EXIT":level.decor==="parachute"?"LAND HERE":level.underwater?"FILTER OUT":"EXIT";
    const exitLabel = locked?`${remaining} PREY LEFT`:destination;
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
      if(selectedCharacter==="bat"&&time<echoPulseUntil){ctx.strokeStyle="rgba(190,225,255,.82)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18+Math.sin(time*.018+i)*4,0,Math.PI*2);ctx.stroke();}
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
      }else if(selectedCharacter==="raccoon"){
        const kind=i%5;
        if(level.decor==="towerRestaurant"){
          if(kind===0){ctx.fillStyle="#242126";ctx.beginPath();ctx.arc(0,2,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#222";for(let n=0;n<8;n++){ctx.beginPath();ctx.arc(-7+(n%4)*5,-1+Math.floor(n/4)*5,2,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#d7b35c";ctx.fillRect(-13,9,26,3);}
          else if(kind===1){ctx.fillStyle="#b84b48";ctx.beginPath();ctx.ellipse(0,2,14,8,-.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#f0d8c3";ctx.lineWidth=2;for(let x=-8;x<10;x+=5){ctx.beginPath();ctx.moveTo(x,-4);ctx.lineTo(x+2,8);ctx.stroke();}}
          else if(kind===2){ctx.fillStyle="#f1d6a1";ctx.beginPath();ctx.moveTo(-13,9);ctx.quadraticCurveTo(0,-14,13,9);ctx.closePath();ctx.fill();ctx.strokeStyle="#c18a4b";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,4,11,.15,Math.PI-.15);ctx.stroke();}
          else if(kind===3){ctx.fillStyle="#f3e6d4";roundedRect(-11,-10,22,20,3);ctx.fill();ctx.fillStyle="#b95a6b";ctx.fillRect(-11,-3,22,5);ctx.fillStyle="#e7bd3d";ctx.beginPath();ctx.arc(0,-11,3,0,Math.PI*2);ctx.fill();}
          else{ctx.fillStyle="#d9b349";ctx.beginPath();ctx.moveTo(-13,9);ctx.lineTo(11,-9);ctx.lineTo(13,9);ctx.closePath();ctx.fill();ctx.fillStyle="#896226";for(const [x,y] of [[-4,5],[4,1],[8,6]]){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}}
        }else{
          if(kind===0){ctx.fillStyle="#d83445";roundedRect(-12,-7,24,14,3);ctx.fill();ctx.fillStyle="#fff3c4";ctx.fillRect(-8,-2,16,4);ctx.fillStyle="#63252c";ctx.font="bold 7px system-ui";ctx.textAlign="center";ctx.fillText("BAR",0,2);}
          else if(kind===1){ctx.fillStyle="#e6b932";ctx.beginPath();ctx.moveTo(-12,-9);ctx.lineTo(13,-6);ctx.lineTo(10,10);ctx.lineTo(-10,8);ctx.closePath();ctx.fill();ctx.fillStyle="#a33b2f";ctx.font="bold 7px system-ui";ctx.textAlign="center";ctx.fillText("CHIPS",0,2);}
          else if(kind===2){ctx.fillStyle="#61351f";roundedRect(-13,-7,26,14,2);ctx.fill();ctx.fillStyle="#b98555";for(let x=-8;x<10;x+=6){ctx.beginPath();ctx.arc(x,-2,2,0,Math.PI*2);ctx.fill();}}
          else if(kind===3){ctx.fillStyle="#d56732";ctx.beginPath();ctx.moveTo(-14,8);ctx.lineTo(12,-10);ctx.lineTo(14,10);ctx.closePath();ctx.fill();ctx.fillStyle="#f3d366";ctx.beginPath();ctx.arc(3,1,3,0,Math.PI*2);ctx.fill();}
          else{ctx.strokeStyle="#b6bcc0";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,1,9,13,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,-9,5,0,Math.PI);ctx.stroke();ctx.fillStyle="#79a4bd";ctx.fillRect(-7,-5,14,12);}
        }
      }else if(selectedCharacter==="opossum"){
        if(i%3===0){ctx.fillStyle="#713956";for(const [x,y] of [[-6,2],[1,-3],[7,3],[0,7]]){ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}ctx.strokeStyle="#5b7a40";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(4,-14);ctx.stroke();}
        else{ctx.fillStyle="#bd8a62";ctx.beginPath();ctx.ellipse(0,2,12,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#684a38";ctx.beginPath();ctx.arc(8,0,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8a6044";ctx.lineWidth=2;for(let x=-8;x<8;x+=5){ctx.beginPath();ctx.moveTo(x,7);ctx.lineTo(x+2,11);ctx.stroke();}}
      }else if(selectedCharacter==="bat"){
        const fruitColors=["#e7a22e","#f2d23f","#88416a","#eb6f43","#d84f52"];
        ctx.fillStyle=fruitColors[i%fruitColors.length];
        if(i%5===1){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,11,-1.2,1.5);ctx.stroke();}
        else if(i%5===2){for(const [x,y] of [[-5,-4],[3,-5],[-7,3],[1,3],[7,5],[0,10]]){ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}}
        else{ctx.beginPath();ctx.arc(0,2,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#4e7e42";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(5,-15);ctx.stroke();}
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
    } else if(h.type==="car"){
      ctx.save();if(h.dir<0){ctx.translate(h.w,0);ctx.scale(-1,1);}
      ctx.fillStyle="#111317";ctx.beginPath();ctx.arc(18,h.h-4,8,0,Math.PI*2);ctx.arc(h.w-19,h.h-4,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=h.color||"#d84e45";roundedRect(3,14,h.w-6,h.h-18,8);ctx.fill();ctx.beginPath();ctx.moveTo(18,14);ctx.lineTo(31,3);ctx.lineTo(h.w-24,3);ctx.lineTo(h.w-10,14);ctx.closePath();ctx.fill();
      ctx.fillStyle="#b9dce4";ctx.beginPath();ctx.moveTo(32,6);ctx.lineTo(43,6);ctx.lineTo(43,14);ctx.lineTo(23,14);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(47,6);ctx.lineTo(h.w-26,6);ctx.lineTo(h.w-15,14);ctx.lineTo(47,14);ctx.closePath();ctx.fill();
      ctx.fillStyle="#fff1a1";ctx.fillRect(h.w-7,21,5,6);ctx.fillStyle="#bd342f";ctx.fillRect(3,21,4,6);ctx.fillStyle="#bfc2c4";ctx.beginPath();ctx.arc(18,h.h-4,3,0,Math.PI*2);ctx.arc(h.w-19,h.h-4,3,0,Math.PI*2);ctx.fill();ctx.restore();
    } else if(h.type==="truck"){
      ctx.save();if(h.dir<0){ctx.translate(h.w,0);ctx.scale(-1,1);}
      ctx.fillStyle="#111317";ctx.beginPath();ctx.arc(22,h.h-5,9,0,Math.PI*2);ctx.arc(h.w-22,h.h-5,9,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=h.color||"#e3b33f";roundedRect(4,5,h.w-42,h.h-15,5);ctx.fill();roundedRect(h.w-40,17,36,h.h-27,6);ctx.fill();
      ctx.fillStyle="#b9dce4";ctx.beginPath();ctx.moveTo(h.w-34,20);ctx.lineTo(h.w-11,20);ctx.lineTo(h.w-7,32);ctx.lineTo(h.w-34,32);ctx.closePath();ctx.fill();
      ctx.fillStyle="#fff1a1";ctx.fillRect(h.w-7,h.h-22,5,7);ctx.fillStyle="#bfc2c4";ctx.beginPath();ctx.arc(22,h.h-5,3.5,0,Math.PI*2);ctx.arc(h.w-22,h.h-5,3.5,0,Math.PI*2);ctx.fill();ctx.restore();
    } else if(h.type==="bird"){
      const flap=Math.sin(now*.026)*8;ctx.fillStyle="#4d5155";ctx.beginPath();ctx.ellipse(h.w*.5,h.h*.58,18,10,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(h.w*.42,h.h*.52);ctx.quadraticCurveTo(7,flap,h.w*.08,h.h*.4);ctx.quadraticCurveTo(18,h.h*.65,h.w*.45,h.h*.65);ctx.fill();ctx.beginPath();ctx.moveTo(h.w*.58,h.h*.52);ctx.quadraticCurveTo(h.w-8,flap,h.w*.92,h.h*.4);ctx.quadraticCurveTo(h.w-18,h.h*.65,h.w*.55,h.h*.65);ctx.fill();ctx.fillStyle="#d2a441";ctx.beginPath();ctx.moveTo(h.w*.72,h.h*.55);ctx.lineTo(h.w*.94,h.h*.62);ctx.lineTo(h.w*.72,h.h*.68);ctx.fill();ctx.fillStyle="#111";ctx.beginPath();ctx.arc(h.w*.66,h.h*.49,2,0,Math.PI*2);ctx.fill();
    } else if(h.type==="drone"){
      ctx.strokeStyle="#30363a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,8);ctx.lineTo(h.w-8,8);ctx.moveTo(h.w/2,8);ctx.lineTo(h.w/2,h.h-5);ctx.stroke();ctx.fillStyle="#4c565c";roundedRect(h.w/2-13,7,26,17,5);ctx.fill();ctx.fillStyle="#df4c48";ctx.beginPath();ctx.arc(h.w/2,18,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#aeb8bd";ctx.lineWidth=2;for(const x of [8,h.w-8]){ctx.beginPath();ctx.ellipse(x,7,13,3,0,0,Math.PI*2);ctx.stroke();}
    } else if(h.type==="server"){
      ctx.fillStyle="#15161a";roundedRect(h.w*.28,5,h.w*.42,h.h-5,7);ctx.fill();ctx.fillStyle="#f1e8dc";ctx.beginPath();ctx.arc(h.w*.5,5,8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ece5da";ctx.beginPath();ctx.ellipse(h.w*.78,9,18,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#b99b69";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#9f2738";ctx.beginPath();ctx.moveTo(h.w*.45,14);ctx.lineTo(h.w*.55,14);ctx.lineTo(h.w*.5,23);ctx.closePath();ctx.fill();
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

  function livelyMotion(now,rate=.018){
    const moving=Math.min(1,(Math.abs(player.vx)+Math.abs(player.vy)*.5)/105),stride=Math.sin(now*rate);
    const airborne=!player.grounded&&!player.climbing,landing=raccoonLandingUntil>now?Math.sin((raccoonLandingUntil-now)/190*Math.PI):0;
    return {moving,stride,airborne,landing,breath:!moving&&player.grounded?Math.sin(now*.0045):0,headBob:airborne?Math.max(-2,Math.min(2,player.vy*.006)):stride*moving*.85,blink:(now%3100)>2960,earTwitch:(now%2400)>2180?Math.max(0,Math.sin(now*.019))*2:0};
  }

  function drawCrestedGecko(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha = .4;
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.scale(player.facing, 1);
    const green = characters.crested.color;
    const motion=livelyMotion(now,.02);ctx.translate(0,Math.abs(motion.stride)*motion.moving*1.6+motion.landing*1.5);ctx.scale(1+motion.landing*.06,1-motion.landing*.1);
    // Long, gently tapering tail. Crested geckos are not curly-tailed chameleons.
    if (tailReady) {
      ctx.strokeStyle = green; ctx.lineWidth = 7; ctx.lineCap = "round";
      const tailWave=Math.sin(now*.011)*(2+motion.moving*3)+(motion.airborne?-player.vy*.012:0);ctx.beginPath(); ctx.moveTo(-14, 2); ctx.bezierCurveTo(-27, 3-tailWave*.2, -37, 8+tailWave, -49, 5+tailWave*.5); ctx.stroke();
    }

    // Four articulated side-view legs with alternating steps and adhesive toe pads.
    const geckoLeg=(hip,phase,front,far=false)=>{const rise=Math.max(-1,Math.min(1,-player.vy/430)),kneeX=hip+(motion.airborne?(front?7+rise*4:-8-rise*3):phase*.65),kneeY=motion.airborne?5:10,pawX=kneeX+(motion.airborne?(front?9:-8):front?8:-7),pawY=motion.airborne?9+Math.abs(rise)*2:14;ctx.globalAlpha=far?.55:1;ctx.strokeStyle=far?"#a86f43":green;ctx.lineWidth=far?3:4;ctx.beginPath();ctx.moveTo(hip,3);ctx.lineTo(kneeX,kneeY);ctx.lineTo(pawX,pawY);ctx.stroke();ctx.fillStyle=green;ctx.beginPath();ctx.ellipse(pawX,pawY,4,2.4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=green;ctx.lineWidth=1.2;for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(pawX+1,pawY+toe);ctx.lineTo(pawX+7,pawY+toe*2);ctx.stroke();}ctx.globalAlpha=1;};
    const step=motion.stride*motion.moving*6;geckoLeg(-12,-step*.8,false,true);geckoLeg(7,step*.8,true,true);geckoLeg(-8,step,false);geckoLeg(11,-step,true,false);

    // Slender body and broad, flat-topped wedge head with a distinct blunt snout.
    ctx.fillStyle = green;
    ctx.beginPath(); ctx.ellipse(-1,0,20+motion.breath*.35,9+motion.breath*.2,0,0,Math.PI*2); ctx.fill();
    ctx.save();ctx.translate(0,motion.headBob);
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
    ctx.fillStyle="#071008";ctx.beginPath();ctx.ellipse(27,-9,1.4,motion.blink?.5:3.1,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff6c5";ctx.beginPath();ctx.arc(27,-10,1,0,Math.PI*2);ctx.fill();
    if(now<tongueActiveUntil){const progress=Math.min(1,Math.max(0,(now-(tongueActiveUntil-230))/230));const extension=Math.sin(progress*Math.PI)*48;ctx.strokeStyle="#ef829a";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(39,1);ctx.lineTo(39+extension,1);ctx.stroke();ctx.fillStyle="#ff9db0";ctx.beginPath();ctx.ellipse(41+extension,1,4,2.8,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();

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
    const motion=livelyMotion(now,.018),swimming=levels[levelIndex]?.underwater||(levels[levelIndex]?.habitat==="newt"&&player.x<520&&player.y+player.h/2>270);const swimKick=swimming?Math.sin(now*.016)*Math.min(1,(Math.abs(player.vx)+Math.abs(player.vy))/90)*5:0;ctx.translate(0,(swimming?Math.sin(now*.009)*1.5:Math.abs(motion.stride)*motion.moving*1.2)+motion.landing*1.2);ctx.scale(1+motion.landing*.05,1-motion.landing*.08);
    if(now<regenerateUntil){
      const pulse=4+Math.sin(now*.018)*3;
      ctx.strokeStyle="rgba(105,244,174,.82)";ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(0,0,40+pulse,21+pulse*.45,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="rgba(105,244,174,.72)";
      [[-31,-17],[4,-23],[34,-10],[-24,19],[24,17]].forEach(([x,y],i)=>{ctx.beginPath();ctx.arc(x,y,1.8+Math.sin(now*.012+i)*.7,0,Math.PI*2);ctx.fill();});
    }
    if(now<toxinActiveUntil){ctx.strokeStyle="rgba(255,105,49,.72)";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,43,24,0,0,Math.PI*2);ctx.stroke();}
    const dark=characters.newt.color;
    const tailWave=swimKick+(motion.airborne&&!swimming?-player.vy*.008:0);ctx.strokeStyle=dark;ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-12,1);ctx.bezierCurveTo(-29,-tailWave*.4,-38,5+tailWave,-49,1-tailWave*.35);ctx.stroke();
    const step=motion.stride*motion.moving*4+swimKick*.6;const newtLeg=(hip,phase,front,far=false)=>{const kneeX=hip+(swimming?(front?phase+5:-phase-5):motion.airborne?(front?7:-8):phase),kneeY=swimming?(front?-1:5):motion.airborne?5:9,pawX=kneeX+(front?8:-7),pawY=swimming?kneeY+(front?-5:5):motion.airborne?9:14;ctx.globalAlpha=far?.52:1;ctx.strokeStyle=far?"#171b1a":dark;ctx.lineWidth=far?2.3:3;ctx.beginPath();ctx.moveTo(hip,3);ctx.lineTo(kneeX,kneeY);ctx.lineTo(pawX,pawY);ctx.stroke();ctx.lineWidth=1;for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(pawX,pawY);ctx.lineTo(pawX+6,pawY+toe*2);ctx.stroke();}ctx.globalAlpha=1;};newtLeg(-10,-step,false,true);newtLeg(7,step,true,true);newtLeg(-7,step,false);newtLeg(11,-step,true,false);
    ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(-1,0,22+motion.breath*.3,8+motion.breath*.15,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(0,motion.headBob+(swimming?Math.sin(now*.011):0));ctx.beginPath();ctx.ellipse(20,-1,12,9,0,0,Math.PI*2);ctx.fill();
    // Bright orange-red underside with the irregular black markings of a fire-belly newt.
    ctx.fillStyle="#ef542f";ctx.beginPath();ctx.moveTo(-18,2);ctx.quadraticCurveTo(-5,10,12,7);ctx.quadraticCurveTo(21,6,27,2);ctx.quadraticCurveTo(10,5,-18,2);ctx.fill();
    ctx.fillStyle="#ff9a35";ctx.beginPath();ctx.ellipse(-8,5,5,2.2,.12,0,Math.PI*2);ctx.ellipse(13,4,5,2,-.18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#171918";[[-14,4,2.2],[-1,6,2.5],[7,4,1.8],[20,3,2.2]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(x,y,r,r*.62,.2,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle="#f4cb64";ctx.beginPath();ctx.ellipse(24,-4,2,motion.blink?.45:2,0,0,Math.PI*2);ctx.fill();ctx.restore();
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
    const landing=underwater?0:(raccoonLandingUntil>now?Math.sin((raccoonLandingUntil-now)/190*Math.PI):falling);
    ctx.translate(0,landing*2);ctx.scale(1+landing*.05,1-landing*.08);
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
    const slitherPhase=now*.019;
    const tailWave=moving*Math.sin(slitherPhase)*5;
    const midWave=moving*Math.sin(slitherPhase+1.7)*6;
    const neckWave=moving*Math.sin(slitherPhase+3.25)*3.5;
    ctx.strokeStyle=dark;ctx.lineWidth=15;ctx.lineCap="round";
    if(now<constrictPulseUntil){
      // One continuous tightening spiral keeps the body and neck visibly attached.
      ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(-58,9);
      ctx.bezierCurveTo(-53,-16,-17,-23,12,-10);
      ctx.bezierCurveTo(38,2,23,25,-9,21);
      ctx.bezierCurveTo(-38,17,-39,-4,-16,-10);
      ctx.bezierCurveTo(4,-15,22,-2,14,9);ctx.stroke();
      ctx.strokeStyle="#414448";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-55,5);ctx.bezierCurveTo(-35,-18,-5,-16,13,-7);ctx.bezierCurveTo(31,2,18,19,-7,17);ctx.stroke();
    }else{
      ctx.beginPath();ctx.moveTo(-64,5+tailWave*.55);
      ctx.bezierCurveTo(-53,-17+tailWave,-40,19-midWave,-25,3+midWave*.35);
      ctx.bezierCurveTo(-10,-18+midWave,4,15-neckWave,20,-1+neckWave*.3);ctx.stroke();
    }
    const strikeProgress=now<strikeActiveUntil?Math.max(0,1-(strikeActiveUntil-now)/300):0;
    const lunge=now<strikeActiveUntil?Math.sin(strikeProgress*Math.PI)*38:0;
    const headWave=now<constrictPulseUntil?0:neckWave*.35;
    ctx.strokeStyle=dark;ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(now<constrictPulseUntil?12:14,(now<constrictPulseUntil?7:-1)+headWave);ctx.quadraticCurveTo(20+lunge*.45,-5+headWave,24+lunge,-2+headWave);ctx.stroke();
    ctx.save();ctx.translate(lunge,headWave);ctx.rotate(moving*Math.sin(slitherPhase+3.25)*.025);
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.moveTo(15,-11);ctx.quadraticCurveTo(34,-14,48,-8);ctx.lineTo(54,-1);ctx.lineTo(49,8);ctx.quadraticCurveTo(33,13,16,9);ctx.lineTo(9,3);ctx.lineTo(11,-6);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#383b3e";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(19,8);ctx.quadraticCurveTo(35,12,49,6);ctx.stroke();
    ctx.fillStyle="#d0a85d";ctx.beginPath();ctx.ellipse(39,-5,3,2.2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#070707";ctx.beginPath();ctx.ellipse(40,-5,1,2,0,0,Math.PI*2);ctx.arc(49,-1,1.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#bd3c48";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(52,4);ctx.lineTo(65,7);ctx.moveTo(65,7);ctx.lineTo(70,4);ctx.moveTo(65,7);ctx.lineTo(69,11);ctx.stroke();
    ctx.restore();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawCharacterPickup(now){
    if(!characterPickup)return;
    const age=now-characterPickup.at;if(age>720){characterPickup=null;return;}
    const t=age/720,x=characterPickup.x,y=characterPickup.y-t*42;
    ctx.save();ctx.globalAlpha=1-t;
    if(characterPickup.kind==="raccoon"){
      ctx.fillStyle="#f2cf62";ctx.font="900 11px system-ui";ctx.textAlign="center";ctx.fillText("MINE",x,y-12);
      for(let i=0;i<7;i++){ctx.fillStyle=i%2?"#d87439":"#f4d36c";ctx.beginPath();ctx.arc(x+Math.cos(i)*20*t,y+Math.sin(i)*14*t,2.5,0,Math.PI*2);ctx.fill();}
    }else if(characterPickup.kind==="opossum"){
      for(let i=0;i<8;i++){ctx.save();ctx.translate(x+Math.cos(i*.9)*24*t,y+Math.sin(i*.9)*18*t);ctx.rotate(i);ctx.fillStyle=i%2?"#9b5a6d":"#b99158";ctx.beginPath();ctx.ellipse(0,0,4,2,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    }else{
      for(let i=0;i<9;i++){ctx.fillStyle=["#eaa33d","#8f4f79","#d85855"][i%3];ctx.beginPath();ctx.arc(x+Math.cos(i*.7)*28*t,y+Math.sin(i*.7)*20*t,3,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }

  function drawTrashScent(now){
    if(selectedCharacter!=="raccoon"||state!=="playing")return;
    const targets=[...levels[levelIndex].insects,...(levels[levelIndex].mice||[])].filter(item=>!item[2]);
    if(!targets.length)return;
    const px=player.x+player.w/2,py=player.y+player.h/2;
    const target=targets.reduce((best,item)=>Math.hypot(item[0]-px,item[1]-py)<Math.hypot(best[0]-px,best[1]-py)?item:best,targets[0]);
    const dx=target[0]-px,dy=target[1]-py,distance=Math.hypot(dx,dy);if(distance<55)return;
    ctx.save();ctx.fillStyle="rgba(242,193,78,.5)";for(let d=40+(now*.035%28);d<Math.min(distance-18,245);d+=28){const t=d/distance,x=px+dx*t,y=py+dy*t+Math.sin(now*.008+d*.08)*4;ctx.beginPath();ctx.arc(x,y,2.2+(d%56?0:1.2),0,Math.PI*2);ctx.fill();}ctx.restore();
  }

  function drawRaccoon(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    const climbingPose=player.climbing&&!player.ceilingClimbing;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);if(climbingPose)ctx.rotate(-Math.PI/2);else ctx.rotate(Math.max(-.08,Math.min(.08,player.vx*.00032)));ctx.scale(climbingPose?1:player.facing,1);
    const moving=Math.min(1,(Math.abs(player.vx)+Math.abs(player.vy)*.72)/95);const stride=Math.sin(now*.018);const step=stride*moving*6;const airborne=!player.grounded&&!climbingPose;
    const scamperBob=player.grounded?Math.abs(stride)*moving*2.4:0;
    const landing=raccoonLandingUntil>now?Math.sin((raccoonLandingUntil-now)/190*Math.PI):0;
    const breath=player.grounded&&!moving?Math.sin(now*.0045)*.6:0;
    ctx.translate(0,scamperBob+landing*2);ctx.scale(1+landing*.08,1-landing*.12);
    if(levels[levelIndex]?.decor==="parachute"&&airborne){
      const sway=Math.sin(now*.004)*3;ctx.strokeStyle="#e8dfd2";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-18,-5);ctx.lineTo(-35+sway,-48);ctx.moveTo(18,-5);ctx.lineTo(35+sway,-48);ctx.stroke();
      ctx.fillStyle="#d83f43";ctx.beginPath();ctx.moveTo(-48+sway,-48);ctx.quadraticCurveTo(sway,-82,48+sway,-48);ctx.quadraticCurveTo(25+sway,-58,sway,-47);ctx.quadraticCurveTo(-25+sway,-58,-48+sway,-48);ctx.fill();
      ctx.strokeStyle="#f5d568";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sway,-72);ctx.lineTo(sway,-48);ctx.stroke();
    }
    const tailSwing=Math.sin(now*.011)*(3+moving*6)+(airborne?Math.max(-8,Math.min(9,-player.vy*.025)):0)+(climbingPose?Math.sin(now*.01)*5:0);
    // A layered, counterbalancing tail with softer fur and rings that bend with the curve.
    ctx.strokeStyle="#6f7476";ctx.lineWidth=17;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-20,0);ctx.bezierCurveTo(-33,-12-tailSwing*.22,-48,-8+tailSwing,-64,-15+tailSwing*.42);ctx.stroke();
    ctx.strokeStyle="#929596";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-23,-3);ctx.bezierCurveTo(-37,-12-tailSwing*.18,-50,-9+tailSwing,-65,-15+tailSwing*.42);ctx.stroke();
    ctx.strokeStyle="#292d2f";ctx.lineWidth=5;for(const [x,y] of [[-29,-5],[-38,-7],[-47,-9],[-56,-12],[-63,-14]]){ctx.beginPath();ctx.moveTo(x,y-5+tailSwing*.18);ctx.lineTo(x-1,y+6+tailSwing*.18);ctx.stroke();}
    ctx.strokeStyle="rgba(215,220,220,.35)";ctx.lineWidth=1.2;for(let i=0;i<8;i++){const x=-28-i*5;ctx.beginPath();ctx.moveTo(x,-12+tailSwing*.12);ctx.lineTo(x-4,-16+tailSwing*.12);ctx.stroke();}
    // Four articulated legs: two shaded far legs, then two clear foreground legs.
    const raccoonLeg=(hip,phase,front,far=false)=>{
      const rise=Math.max(-1,Math.min(1,-player.vy/430));
      const kneeX=hip+(airborne?(front?7+rise*5:-8-rise*4):climbingPose?(front?7:-7):phase*.72);
      const kneeY=airborne?7-Math.abs(rise)*2:climbingPose?(front?phase:-phase):12;
      const pawX=kneeX+(airborne?(front?9:-7):climbingPose?(front?11:-10):7+phase*.28);
      const pawY=airborne?11+Math.abs(rise)*3:climbingPose?kneeY+(front?9:-9):22;
      ctx.globalAlpha=far?.58:1;ctx.strokeStyle=far?"#404548":"#565b5e";ctx.lineWidth=far?6:8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(hip,5);ctx.lineTo(kneeX,kneeY);ctx.lineTo(pawX,pawY);ctx.stroke();
      ctx.fillStyle="#24282a";ctx.beginPath();ctx.ellipse(pawX+3,pawY,8,3.6,front?.08:-.08,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#111416";ctx.lineWidth=1;const toeSpread=airborne?1.8:1;for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(pawX+6,pawY+toe);ctx.lineTo(pawX+11+toe*toeSpread,pawY+toe*2);ctx.stroke();}ctx.globalAlpha=1;
    };
    raccoonLeg(-17,-step*.8,false,true);raccoonLeg(7,step*.8,true,true);raccoonLeg(-11,step,false);raccoonLeg(14,-step,true,false);
    // Breathing subtly expands the chest when the Trash Tank is idle.
    ctx.fillStyle="#73777a";ctx.beginPath();ctx.ellipse(-3,-1,31+breath,17.5+breath*.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#5d6265";ctx.beginPath();ctx.ellipse(12,-1,18+breath*.4,17+breath*.4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#8b8e8e";ctx.beginPath();ctx.ellipse(-7,-9,22,9,0,Math.PI,Math.PI*2);ctx.fill();
    const headBob=(airborne?Math.max(-2,Math.min(2,player.vy*.006)):stride*moving*.9);const earTwitch=Math.max(0,Math.sin(now*.019+1.4))*((now%2400)>2180?2.2:0);const blinking=(now%3100)>2960;
    ctx.save();ctx.translate(0,headBob);
    ctx.fillStyle="#73777a";ctx.beginPath();ctx.ellipse(25,-4,18,15,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#36393c";ctx.beginPath();ctx.arc(17,-14-earTwitch,7,0,Math.PI*2);ctx.arc(30,-14+earTwitch*.4,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#b58a82";ctx.beginPath();ctx.arc(17,-14-earTwitch,3.5,0,Math.PI*2);ctx.arc(30,-14+earTwitch*.4,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#232528";ctx.beginPath();ctx.moveTo(10,-11);ctx.quadraticCurveTo(25,-18,39,-8);ctx.lineTo(37,1);ctx.quadraticCurveTo(24,6,11,-1);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d4d0c5";ctx.beginPath();ctx.ellipse(20,-6,5,blinking?.7:3,0,0,Math.PI*2);ctx.ellipse(30,-6,5,blinking?.7:3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#a6a39b";ctx.beginPath();ctx.ellipse(37,0,10,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#0d0e0f";ctx.beginPath();if(blinking){ctx.fillRect(17,-6,6,1);ctx.fillRect(27,-6,6,1);}else{ctx.arc(21,-6,2,0,Math.PI*2);ctx.arc(31,-6,2,0,Math.PI*2);}ctx.arc(43,-1,3,0,Math.PI*2);ctx.fill();
    // Short, curved muzzle whiskers. The previous antenna array has been euthanized.
    ctx.fillStyle="#5f6160";for(const [dx,dy] of [[35,-2],[37,1],[35,4]]){ctx.beginPath();ctx.arc(dx,dy,1,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle="rgba(226,220,207,.78)";ctx.lineWidth=.8;for(const [sy,curve,ey] of [[-2,-3,-5],[1,0,0],[4,3,5]]){ctx.beginPath();ctx.moveTo(40,sy);ctx.quadraticCurveTo(48,sy+curve*.35,54,ey);ctx.stroke();}
    if(now<biteActiveUntil){const snap=Math.sin(Math.min(1,(now-(biteActiveUntil-280))/280)*Math.PI);ctx.fillStyle="#171719";ctx.beginPath();ctx.moveTo(34,1);ctx.lineTo(49+snap*13,5);ctx.lineTo(35,10);ctx.closePath();ctx.fill();ctx.fillStyle="#f0e5cd";for(let x=39;x<49+snap*8;x+=5){ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x+2,8);ctx.lineTo(x+4,4);ctx.fill();}}
    ctx.restore();
    if(now<raccoonImpactUntil){ctx.save();ctx.translate(62,4);ctx.rotate(now*.03);ctx.fillStyle="#f4d85b";ctx.beginPath();for(let n=0;n<16;n++){const radius=n%2?7:16,angle=n*Math.PI/8;ctx.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);}ctx.closePath();ctx.fill();ctx.restore();}
    if(now<trashShieldUntil){ctx.save();ctx.translate(1,-7);ctx.rotate(-.12+Math.sin(now*.035)*.08);ctx.fillStyle="#256b91";ctx.beginPath();ctx.ellipse(0,0,40,20,0,Math.PI,Math.PI*2);ctx.lineTo(40,5);ctx.lineTo(-40,5);ctx.closePath();ctx.fill();ctx.strokeStyle="#b8c5c9";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#34494f";roundedRect(-11,-21,22,6,3);ctx.fill();ctx.fillStyle="#d9e0df";for(const x of [-29,29]){ctx.beginPath();ctx.arc(x,-2,2,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#e8edf0";ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(4,-7);ctx.lineTo(10,-9);ctx.lineTo(7,-2);ctx.lineTo(13,1);ctx.lineTo(4,2);ctx.lineTo(3,9);ctx.lineTo(-1,4);ctx.lineTo(-7,8);ctx.lineTo(-5,1);ctx.lineTo(-13,-1);ctx.lineTo(-7,-5);ctx.lineTo(-9,-11);ctx.lineTo(-3,-8);ctx.closePath();ctx.fill();ctx.strokeStyle="#17475f";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20,-8);ctx.lineTo(-5,-2);ctx.moveTo(15,-6);ctx.lineTo(26,-12);ctx.moveTo(9,3);ctx.lineTo(25,0);ctx.stroke();ctx.restore();}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawOpossum(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const playingDead=now<playDeadUntil;
    const deathProgress=playingDead?Math.min(1,(now-(playDeadUntil-2800))/320):0;
    if(playingDead){ctx.rotate(Math.PI*deathProgress);ctx.translate(0,-6*deathProgress);}
    const motion=livelyMotion(now,.019),scurry=motion.moving,bodyBob=player.grounded&&!playingDead?Math.abs(motion.stride)*scurry*2.2:0;ctx.translate(0,bodyBob+motion.landing*1.5);ctx.scale(1+motion.landing*.07,1-motion.landing*.11);
    const tailCurl=Math.sin(now*.008)*(3+motion.moving*3)+(motion.airborne?-player.vy*.012:0);ctx.strokeStyle="#d6a6a7";ctx.lineWidth=5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-23,2);ctx.bezierCurveTo(-44,-4-tailCurl,-62,5+tailCurl,-62,16);ctx.bezierCurveTo(-62,29,-46,28,-48,17);ctx.stroke();
    const airborne=motion.airborne&&!playingDead,step=motion.stride*motion.moving*6;const opossumLeg=(hip,phase,front,far=false)=>{const rise=Math.max(-1,Math.min(1,-player.vy/430)),kneeX=hip+(airborne?(front?8+rise*5:-9-rise*5):phase*.7),kneeY=airborne?7:12,footX=kneeX+(airborne?(front?10:-9):7),footY=airborne?11+Math.abs(rise)*3:19;ctx.globalAlpha=far?.55:1;ctx.strokeStyle=far?"#625f5d":"#777470";ctx.lineWidth=far?4:5;ctx.beginPath();ctx.moveTo(hip,6);ctx.lineTo(kneeX,kneeY);ctx.lineTo(footX,footY);ctx.stroke();ctx.strokeStyle="#d0a4a5";ctx.lineWidth=1.5;for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(footX,footY);ctx.lineTo(footX+8,footY+toe*2);ctx.stroke();}ctx.globalAlpha=1;};if(!playingDead){opossumLeg(-16,-step*.8,false,true);opossumLeg(7,step*.8,true,true);opossumLeg(-11,step,false);opossumLeg(12,-step,true,false);}
    ctx.fillStyle="#8e8b87";ctx.beginPath();ctx.ellipse(-4,0,28+motion.breath*.4,14+motion.breath*.25,0,0,Math.PI*2);ctx.fill();
    if(playingDead){ctx.fillStyle="#c7c0b6";ctx.beginPath();ctx.ellipse(-3,4,20,9,0,0,Math.PI*2);ctx.fill();}
    ctx.save();ctx.translate(0,motion.headBob);ctx.fillStyle="#d1ccc3";ctx.beginPath();ctx.moveTo(11,-10);ctx.quadraticCurveTo(29,-13,45,-2);ctx.lineTo(30,8);ctx.lineTo(11,8);ctx.closePath();ctx.fill();
    ctx.fillStyle="#242426";ctx.beginPath();ctx.arc(14,-12-motion.earTwitch,7,0,Math.PI*2);ctx.arc(27,-11+motion.earTwitch*.3,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#efb4b3";ctx.beginPath();ctx.arc(14,-12-motion.earTwitch,3.5,0,Math.PI*2);ctx.arc(27,-11+motion.earTwitch*.3,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="#edb0ae";ctx.beginPath();ctx.ellipse(45,-1,5,4,0,0,Math.PI*2);ctx.fill();
    if(playingDead){ctx.strokeStyle="#121315";ctx.lineWidth=1.7;for(const eyeX of [29]){ctx.beginPath();ctx.moveTo(eyeX-3,-8);ctx.lineTo(eyeX+3,-3);ctx.moveTo(eyeX+3,-8);ctx.lineTo(eyeX-3,-3);ctx.stroke();}}else{ctx.fillStyle="#121315";ctx.beginPath();ctx.ellipse(30,-5,2.4,motion.blink?.5:2.4,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle="#e2ddd2";ctx.lineWidth=1;for(const offset of [-4,0,4]){ctx.beginPath();ctx.moveTo(39,offset);ctx.lineTo(58,offset-4);ctx.stroke();}
    if(now<hissActiveUntil){ctx.save();ctx.rotate(-.08);ctx.fillStyle="#f4e8d3";ctx.beginPath();ctx.moveTo(37,2);ctx.lineTo(54,5);ctx.lineTo(39,11);ctx.closePath();ctx.fill();ctx.fillStyle="#e25967";ctx.beginPath();ctx.moveTo(42,6);ctx.lineTo(52,6);ctx.lineTo(44,10);ctx.fill();const radius=55+Math.sin(now*.04)*8;ctx.strokeStyle="rgba(238,232,202,.65)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(38,2,radius,-.55,.55);ctx.stroke();ctx.strokeStyle="#b6b0a8";ctx.lineWidth=2;for(let x=-18;x<12;x+=6){ctx.beginPath();ctx.moveTo(x,-11);ctx.lineTo(x+2,-18-Math.sin(now*.04+x)*3);ctx.stroke();}ctx.restore();}
    ctx.restore();
    if(playingDead){ctx.fillStyle="#e66d78";ctx.beginPath();ctx.ellipse(42,8,8,3,.25,0,Math.PI*2);ctx.fill();if(playDeadUntil-now<380)ctx.translate(Math.sin(now*.09)*2,0);ctx.save();ctx.rotate(Math.PI);ctx.fillStyle="#eee";ctx.font="bold 10px system-ui";ctx.textAlign="center";ctx.fillText("ABSOLUTELY DECEASED",0,34);ctx.restore();}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawBat(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);
    batVisualFacing+=(player.facing-batVisualFacing)*.14;ctx.scale(batVisualFacing,1);
    const hanging=player.ceilingClimbing,release=Math.max(0,(batReleaseUntil-now)/260);
    if(hanging){ctx.rotate(Math.PI);ctx.translate(0,-8);}else{if(release)ctx.rotate(Math.PI*release);ctx.rotate(Math.max(-.28,Math.min(.28,player.vy*.0014+(player.vx-player.facing*80)*.00015)));ctx.translate(0,Math.sin(now*.012)*1.5);}
    const flap=Math.sin(now*.055)*(hanging?.18:1);const wingY=8+flap*20;
    ctx.fillStyle="#51443c";ctx.beginPath();ctx.moveTo(-6,-3);ctx.quadraticCurveTo(-29,-24,-43,-11);ctx.quadraticCurveTo(-31,0,-40,wingY);ctx.quadraticCurveTo(-27,2,-23,13);ctx.quadraticCurveTo(-16,6,-8,9);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,-3);ctx.quadraticCurveTo(29,-24,43,-11);ctx.quadraticCurveTo(31,0,40,wingY);ctx.quadraticCurveTo(27,2,23,13);ctx.quadraticCurveTo(16,6,8,9);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#9f8874";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-38,-10);ctx.moveTo(-5,1);ctx.lineTo(-30,wingY-3);ctx.moveTo(-4,3);ctx.lineTo(-19,11);ctx.moveTo(5,0);ctx.lineTo(38,-10);ctx.moveTo(5,1);ctx.lineTo(30,wingY-3);ctx.moveTo(4,3);ctx.lineTo(19,11);ctx.stroke();
    ctx.fillStyle="#806956";ctx.beginPath();ctx.ellipse(0,1,13,17,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(12,-9,12,9,-.15,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(4,-15);ctx.lineTo(5,-30);ctx.lineTo(12,-17);ctx.moveTo(15,-17);ctx.lineTo(22,-29);ctx.lineTo(23,-13);ctx.fill();ctx.fillStyle="#a98372";ctx.beginPath();ctx.moveTo(7,-18);ctx.lineTo(7,-26);ctx.lineTo(11,-18);ctx.moveTo(17,-18);ctx.lineTo(21,-25);ctx.lineTo(21,-16);ctx.fill();
    ctx.fillStyle="#d0b28d";ctx.beginPath();ctx.moveTo(13,-11);ctx.quadraticCurveTo(24,-15,31,-8);ctx.quadraticCurveTo(27,-1,17,-3);ctx.closePath();ctx.fill();ctx.fillStyle="#171313";ctx.beginPath();ctx.arc(30,-8,2.2,0,Math.PI*2);ctx.arc(17,-12,2.1,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f2c77b";ctx.beginPath();ctx.arc(17,-12,.8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#715e50";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-5,14);ctx.lineTo(-8,21);ctx.moveTo(5,14);ctx.lineTo(8,21);ctx.stroke();ctx.strokeStyle="#b89e82";ctx.lineWidth=1.5;for(const x of [-8,8]){ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x-5,24);ctx.moveTo(x,20);ctx.lineTo(x,25);ctx.moveTo(x,20);ctx.lineTo(x+5,24);ctx.stroke();}
    if(hanging){ctx.strokeStyle="#b89e82";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,21);ctx.quadraticCurveTo(-4,27,0,22);ctx.quadraticCurveTo(4,27,10,21);ctx.stroke();}
    if(now<echoPulseUntil){const age=(3000-(echoPulseUntil-now))%650;for(let i=0;i<3;i++){const r=((age+i*215)%650)/650*115;ctx.strokeStyle=`rgba(196,220,255,${.7-r/165})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(20,-8,r,-.7,.7);ctx.stroke();}}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawGoat(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing*.9,.9);ctx.translate(0,3);
    const motion=livelyMotion(now,.017),walk=motion.stride*motion.moving*7,ram=now<goatAttackUntil?Math.sin((goatAttackUntil-now)/300*Math.PI)*10:0;ctx.translate(0,Math.abs(motion.stride)*motion.moving*1.7+motion.landing*1.8);ctx.scale(1+motion.landing*.07,1-motion.landing*.11);
    const tailWave=Math.sin(now*.012)*(1+motion.moving*3);ctx.strokeStyle="#a79e89";ctx.lineWidth=5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-27,-3);ctx.quadraticCurveTo(-39,-15-tailWave,-42,-5+tailWave);ctx.stroke();
    const goatLeg=(hip,phase,front,far=false)=>{const kneeX=hip+(motion.airborne?(front?8:-8):phase*.62),kneeY=motion.airborne?7:12,hoofX=kneeX+(motion.airborne?(front?8:-7):4),hoofY=motion.airborne?12:21;ctx.globalAlpha=far?.52:1;ctx.strokeStyle=far?"#958d7d":"#c6bda8";ctx.lineWidth=far?5:7;ctx.beginPath();ctx.moveTo(hip,7);ctx.lineTo(kneeX,kneeY);ctx.lineTo(hoofX,hoofY);ctx.stroke();ctx.strokeStyle="#37322d";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hoofX-3,hoofY);ctx.lineTo(hoofX+6,hoofY);ctx.moveTo(hoofX+2,hoofY-1);ctx.lineTo(hoofX+2,hoofY+3);ctx.stroke();ctx.globalAlpha=1;};
    goatLeg(-17,-walk*.8,false,true);goatLeg(8,walk*.8,true,true);goatLeg(-12,walk,false);goatLeg(14,-walk,true,false);
    ctx.fillStyle="#d9d0bb";ctx.beginPath();ctx.ellipse(-3,0,29+motion.breath*.4,15+motion.breath*.25,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c6bda8";ctx.beginPath();ctx.ellipse(-5,5,22,8,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(ram,motion.headBob);ctx.strokeStyle="#c6bda8";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(13,4);ctx.lineTo(20,-5);ctx.stroke();ctx.fillStyle="#e3d9c5";ctx.beginPath();ctx.moveTo(14,-11);ctx.quadraticCurveTo(31,-14,43,-3);ctx.quadraticCurveTo(41,8,30,10);ctx.lineTo(15,7);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#8d806e";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(21,-10);ctx.quadraticCurveTo(10,-27,25,-32);ctx.quadraticCurveTo(20,-22,31,-13);ctx.moveTo(35,-11);ctx.quadraticCurveTo(35,-28,49,-27);ctx.quadraticCurveTo(39,-21,43,-9);ctx.stroke();
    ctx.fillStyle="#d9d0bb";ctx.beginPath();ctx.moveTo(17,-8-motion.earTwitch);ctx.lineTo(6,-19-motion.earTwitch);ctx.lineTo(27,-13);ctx.moveTo(37,-9);ctx.lineTo(51,-18+motion.earTwitch*.4);ctx.lineTo(45,-5);ctx.fill();
    ctx.fillStyle="#171817";ctx.beginPath();ctx.ellipse(32,-5,2,motion.blink?.5:3,0,0,Math.PI*2);ctx.arc(43,1,2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#a89480";ctx.beginPath();ctx.ellipse(38,5,8,5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#9c8e79";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(29,8);ctx.lineTo(25,22);ctx.lineTo(35,13);ctx.stroke();ctx.restore();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawHighland(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const motion=livelyMotion(now,.014),charging=now<cowChargeUntil,walk=motion.stride*motion.moving*7,toss=now<cowAttackUntil?-7:0;ctx.translate(0,Math.abs(motion.stride)*motion.moving*1.5+motion.landing*2);ctx.scale(1+motion.landing*.08,1-motion.landing*.12);
    // Long tail with a proper hairy switch.
    const tailSwing=Math.sin(now*.01)*(2+motion.moving*5);ctx.strokeStyle="#8e431f";ctx.lineWidth=6;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-36,-3);ctx.quadraticCurveTo(-49,7,-48,19+tailSwing);ctx.stroke();ctx.strokeStyle="#3a261d";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-48,17+tailSwing);ctx.lineTo(-53,25+tailSwing);ctx.stroke();
    const cowLeg=(hip,phase,front,far=false)=>{const kneeX=hip+(motion.airborne?(front?9:-9):phase*.65),kneeY=motion.airborne?10:18,hoofX=kneeX+(motion.airborne?(front?8:-7):3),hoofY=motion.airborne?17:29;ctx.globalAlpha=far?.5:1;ctx.strokeStyle=far?"#612e1b":"#83401f";ctx.lineWidth=far?8:10;ctx.beginPath();ctx.moveTo(hip,10);ctx.lineTo(kneeX,kneeY);ctx.lineTo(hoofX,hoofY);ctx.stroke();ctx.strokeStyle="#25201d";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hoofX-4,hoofY);ctx.lineTo(hoofX+7,hoofY);ctx.moveTo(hoofX+1,hoofY-1);ctx.lineTo(hoofX+1,hoofY+4);ctx.stroke();ctx.globalAlpha=1;};
    cowLeg(-24,-walk*.75,false,true);cowLeg(12,walk*.75,true,true);cowLeg(-17,walk,false);cowLeg(21,-walk,true,false);
    // Deep, stocky body with layered shag rather than a featureless orange bean.
    ctx.fillStyle="#7f3b20";ctx.beginPath();ctx.ellipse(-5,-1,39+motion.breath*.5,21+motion.breath*.3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#9f4d27";ctx.beginPath();ctx.ellipse(-8,-8,33,13,0,0,Math.PI*2);ctx.fill();ctx.lineCap="round";for(let i=0;i<11;i++){const x=-36+i*6,sway=Math.sin(now*.003+i*1.9)*3,length=18+(i*7)%11;ctx.strokeStyle=["#b85c31","#70331e","#cc6e3b"][i%3];ctx.lineWidth=2.6+(i%2);ctx.beginPath();ctx.moveTo(x,-12+(i%3)*2);ctx.bezierCurveTo(x+5+sway,-2,x-3+sway*.5,4,x+1,-12+length);ctx.stroke();}
    ctx.save();ctx.translate((charging?8:toss),motion.headBob);ctx.fillStyle="#91411f";ctx.beginPath();ctx.ellipse(30,-3,24,21,0,0,Math.PI*2);ctx.fill();
    // Wide cream horns curve out and upward from the skull.
    ctx.strokeStyle="#eee0be";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(18,-14);ctx.quadraticCurveTo(5,-28,-13,-22);ctx.quadraticCurveTo(-20,-18,-14,-13);ctx.moveTo(41,-15);ctx.quadraticCurveTo(58,-30,72,-20);ctx.quadraticCurveTo(78,-15,71,-11);ctx.stroke();
    // Rounded ears sit below the horn bases.
    ctx.fillStyle="#7f371d";ctx.beginPath();ctx.ellipse(12,-10-motion.earTwitch,10,5,-.25,0,Math.PI*2);ctx.ellipse(47,-10+motion.earTwitch*.35,10,5,.25,0,Math.PI*2);ctx.fill();
    // Long Highland fringe, with the eyes still readable underneath.
    for(let i=0;i<7;i++){const x=12+i*6;ctx.strokeStyle=i%2?"#b95b30":"#d27942";ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(x,-18+(i%2));ctx.quadraticCurveTo(x-5,-5,x-2,4+(i*3)%7);ctx.stroke();}
    ctx.fillStyle="#24150f";ctx.beginPath();ctx.ellipse(24,-4,2.4,motion.blink?.5:2.4,0,0,Math.PI*2);ctx.ellipse(40,-4,2.4,motion.blink?.5:2.4,0,0,Math.PI*2);ctx.fill();
    // Broad pale muzzle with two nostrils and a mouth line.
    ctx.fillStyle="#c98a67";ctx.beginPath();ctx.ellipse(39,7,15,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#38221b";ctx.beginPath();ctx.ellipse(33,5,2.2,1.6,0,0,Math.PI*2);ctx.ellipse(45,5,2.2,1.6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#6d3b2b";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(39,7,9,.25,Math.PI-.25);ctx.stroke();ctx.restore();
    if(charging){ctx.strokeStyle="rgba(224,188,126,.55)";ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-55-i*12,-10+i*9);ctx.lineTo(-82-i*12,-10+i*9);ctx.stroke();}}
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawDevilFox(now){
    const flash=now<invulnerableUntil&&Math.floor(now/90)%2===0;if(flash)ctx.globalAlpha=.4;
    ctx.save();ctx.translate(player.x+player.w/2,player.y+player.h/2);ctx.scale(player.facing,1);
    const motion=livelyMotion(now,.022),airborne=motion.airborne,pouncing=now<foxPounceUntil,walk=motion.stride*motion.moving*7,tailWave=Math.sin(now*.008)*(5+motion.moving*5)+(airborne?-player.vy*.02:0);ctx.translate(0,Math.abs(motion.stride)*motion.moving*1.8+motion.landing*1.6);ctx.scale(1+motion.landing*.07,1-motion.landing*.11);
    if(now<foxBlinkUntil){ctx.globalAlpha=.24;for(let g=1;g<=3;g++){ctx.save();ctx.translate(-g*18,Math.sin(g)*5);ctx.fillStyle="#dc68b3";ctx.beginPath();ctx.ellipse(0,0,28,13,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.globalAlpha=1;}
    const foxLeg=(hip,phase,front,far=false)=>{const kneeX=hip+(airborne?(front?12:-12):phase*.7),kneeY=airborne?(pouncing?1:8):12,footX=kneeX+(airborne?(front?14:-10):8),footY=airborne?(pouncing?5:14):20;ctx.globalAlpha=far?.52:1;ctx.strokeStyle=far?"#69203f":"#8f284f";ctx.lineWidth=far?4.5:6;ctx.beginPath();ctx.moveTo(hip,7);ctx.lineTo(kneeX,kneeY);ctx.lineTo(footX,footY);ctx.stroke();ctx.fillStyle="#2a1027";ctx.beginPath();ctx.ellipse(footX+3,footY,7,3,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#160a15";ctx.lineWidth=1;for(let toe=-1;toe<=1;toe++){ctx.beginPath();ctx.moveTo(footX+5,footY);ctx.lineTo(footX+10,footY+toe*2);ctx.stroke();}ctx.globalAlpha=1;};
    ctx.strokeStyle="#b74766";ctx.lineWidth=18;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-20,0);ctx.bezierCurveTo(-39,-13,-53,-2,-64,-19+tailWave*.35);ctx.stroke();ctx.strokeStyle="#f39abb";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-30,-4);ctx.bezierCurveTo(-45,-12,-54,-5,-64,-19+tailWave*.35);ctx.stroke();ctx.fillStyle="#fff0f5";ctx.beginPath();ctx.arc(-65,-19+tailWave*.35,6,0,Math.PI*2);ctx.fill();
    foxLeg(-16,-walk*.8,false,true);foxLeg(7,walk*.8,true,true);foxLeg(-11,walk,false);foxLeg(12,-walk,true,false);
    ctx.fillStyle="#b74766";ctx.beginPath();ctx.ellipse(-2,0,28+motion.breath*.4,14+motion.breath*.25,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(0,motion.headBob);ctx.fillStyle="#d95b82";ctx.beginPath();ctx.ellipse(24,-4,19,15,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#651d48";ctx.beginPath();ctx.moveTo(14,-14-motion.earTwitch);ctx.lineTo(14,-34-motion.earTwitch);ctx.lineTo(28,-17);ctx.moveTo(30,-17);ctx.lineTo(43,-34+motion.earTwitch*.4);ctx.lineTo(43,-10);ctx.fill();
    ctx.fillStyle="#2a1027";ctx.beginPath();ctx.moveTo(20,-16);ctx.quadraticCurveTo(18,-31,27,-32);ctx.lineTo(30,-16);ctx.moveTo(33,-17);ctx.quadraticCurveTo(38,-32,46,-28);ctx.lineTo(42,-12);ctx.fill();
    ctx.fillStyle="#f3d8e5";ctx.beginPath();ctx.ellipse(35,0,12,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#171018";ctx.beginPath();ctx.ellipse(26,-7,2.8,motion.blink?.5:2.8,0,0,Math.PI*2);ctx.arc(44,0,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffd468";ctx.beginPath();ctx.arc(27,-8,1,0,Math.PI*2);ctx.fill();
    if(pouncing){ctx.strokeStyle="rgba(255,111,183,.7)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,44,-1.1,1.1);ctx.stroke();}
    ctx.restore();
    ctx.restore();ctx.globalAlpha=1;
  }

  function drawPlayer(now) {
    ctx.save();
    if(player.ceilingClimbing&&selectedCharacter!=="bat"){ctx.translate(0,player.y*2+player.h);ctx.scale(1,-1);}
    if (selectedCharacter === "chameleon") drawChameleon(now);
    else if (selectedCharacter === "newt") drawNewt(now);
    else if (selectedCharacter === "frog") drawFrog(now);
    else if (selectedCharacter === "boa") drawBoa(now);
    else if (selectedCharacter === "raccoon") drawRaccoon(now);
    else if (selectedCharacter === "opossum") drawOpossum(now);
    else if (selectedCharacter === "bat") drawBat(now);
    else if (selectedCharacter === "goat") drawGoat(now);
    else if (selectedCharacter === "highland") drawHighland(now);
    else if (selectedCharacter === "devilfox") drawDevilFox(now);
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
    drawTrashScent(time);
    drawPlayer(time);
    drawCharacterPickup(time);
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
      if(backstageMode)showLevelSelect();else showIntro(0);
    });
  });
  levelSelect.querySelectorAll("[data-level]").forEach(button=>{
    button.addEventListener("click",()=>showIntro(Number(button.dataset.level)));
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
