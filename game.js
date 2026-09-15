(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const overlay = document.querySelector("#overlay");
  const panelKicker = document.querySelector("#panelKicker");
  const panelTitle = document.querySelector("#panelTitle");
  const panelText = document.querySelector("#panelText");
  const primaryButton = document.querySelector("#primaryButton");
  const secondaryButton = document.querySelector("#secondaryButton");
  const hud = document.querySelector("#hud");
  const levelLabel = document.querySelector("#levelLabel");
  const bugLabel = document.querySelector("#bugLabel");
  const lifeLabel = document.querySelector("#lifeLabel");
  const soundButton = document.querySelector("#soundButton");

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
  let soundOn = true;
  let audioContext = null;

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
      hazards: [{x:420,y:454,w:82,h:46,type:"grab",axis:"x",min:330,max:620,speed:82}],
      decor: "enclosure"
    },
    {
      label: "LEVEL 2 · MEDIUM",
      title: "The Reptile Room",
      intro: "Reach the doorway. Avoid the hand, the cat, and the cup of Repashy that has achieved structural permanence.",
      completeTitle: "You have breached containment.",
      completeText: "The house stretches before you. Somewhere in the dark, a refrigerator hums like destiny.",
      palette: ["#0c1117", "#1d2830", "#754f31", "#f0cc62"],
      start: [45, 445], exit: [876,88,50,82],
      platforms: [[0,500,960,40],[28,442,235,20],[340,390,205,20],[615,327,285,20],[280,262,170,18],[55,196,180,18],[530,155,180,18],[815,174,125,18]],
      vines: [[258,317,18,130],[545,270,18,123],[705,95,18,235]],
      insects: [[420,355],[120,161],[620,120]],
      hazards: [
        {x:650,y:303,w:66,h:24,type:"cat",axis:"x",min:620,max:820,speed:105},
        {x:292,y:478,w:62,h:22,type:"repashy",axis:"none"},
        {x:135,y:164,w:70,h:24,type:"hand",axis:"x",min:60,max:190,speed:78}
      ],
      decor: "room"
    },
    {
      label: "LEVEL 3 · HARD",
      title: "The House",
      intro: "Cross the living room. The dog has noticed you. The refrigerator waits beyond all reason and hygiene.",
      completeTitle: "Behind the refrigerator.",
      completeText: "Warm. Dusty. Inaccessible to humans. You have found paradise, which is mostly crumbs and one dead spider.",
      palette: ["#111018", "#292239", "#795b44", "#ef8c73"],
      start: [38, 445], exit: [878,392,64,108],
      platforms: [[0,500,960,40],[26,434,165,20],[230,372,150,18],[420,318,132,18],[602,268,140,18],[790,212,150,18],[690,392,105,18],[520,445,94,18]],
      vines: [[190,326,18,112],[380,265,18,110],[742,205,18,190]],
      insects: [[290,337],[665,233],[850,177]],
      hazards: [
        {x:238,y:478,w:92,h:22,type:"dog",axis:"x",min:210,max:490,speed:145},
        {x:555,y:423,w:62,h:22,type:"roomba",axis:"x",min:510,max:680,speed:118},
        {x:800,y:478,w:52,h:22,type:"sock",axis:"none"}
      ],
      decor: "house"
    }
  ];

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
    secondaryButton.classList.toggle("hidden", !allowSelect);
    overlay.classList.remove("hidden");
    hud.classList.add("hidden");
    primaryButton.focus();
  }

  function showMenu() {
    state = "menu";
    showPanel("STORY MODE", "The enclosure door is open.", "This is almost certainly a trap. Unfortunately, you are a gecko.", "BEGIN ESCAPE", () => showIntro(0));
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
    level.insects.forEach(insect => insect[2] = false);
    level.hazards.forEach((hazard, i) => { hazard.dir = i % 2 ? -1 : 1; });
    lives = 3;
    collected = 0;
    tailReady = true;
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
    invulnerableUntil = performance.now() + 1100;
    updateHud();
  }

  function updateHud() {
    bugLabel.textContent = `BUGS ${collected}/3 · TAIL ${tailReady ? "READY" : "GONE"}`;
    lifeLabel.textContent = "♥ ".repeat(Math.max(0, lives)).trim();
  }

  function dropTail() {
    if (state !== "playing" || !tailReady) return;
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
    if (state !== "playing" || now < tongueCooldownUntil) return;
    tongueActiveUntil = now + 230;
    tongueCooldownUntil = now + 520;
    tone(610, .045, "sine");
  }

  function tongueHitbox(now) {
    if (now >= tongueActiveUntil) return null;
    const reach = 112;
    return {
      x: player.facing > 0 ? player.x + player.w - 3 : player.x - reach + 3,
      y: player.y + 5,
      w: reach,
      h: 20
    };
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
    const left = keys.ArrowLeft || keys.KeyA || keys.touchLeft;
    const right = keys.ArrowRight || keys.KeyD || keys.touchRight;
    const up = keys.ArrowUp || keys.KeyW || keys.touchJump;
    const down = keys.ArrowDown || keys.KeyS;
    const speed = levelIndex === 2 ? 236 : 220;

    if (left) { player.vx -= 1450 * dt; player.facing = -1; }
    if (right) { player.vx += 1450 * dt; player.facing = 1; }
    if (!left && !right) player.vx *= Math.pow(.0007, dt);
    player.vx = Math.max(-speed, Math.min(speed, player.vx));

    const onVine = level.vines.some(v => intersects(player, {x:v[0], y:v[1], w:v[2], h:v[3]}));
    const onWall = player.x <= 5 || player.x + player.w >= W - 5;
    player.climbing = (onVine || onWall) && (up || down);
    if (player.climbing) {
      player.vy = up ? -145 : down ? 145 : 0;
    } else {
      player.vy += 820 * dt;
      player.vy = Math.min(player.vy, 570);
    }

    const oldY = player.y;
    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(W - player.w, player.x));
    player.y += player.vy * dt;
    player.grounded = false;

    for (const p of level.platforms) {
      const platform = {x:p[0], y:p[1], w:p[2], h:p[3]};
      if (player.vy >= 0 && oldY + player.h <= platform.y + 4 && intersects(player, platform)) {
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
      if (hazard.axis === "x") {
        hazard.x += hazard.speed * hazard.dir * dt;
        if (hazard.x < hazard.min || hazard.x > hazard.max) {
          hazard.x = Math.max(hazard.min, Math.min(hazard.max, hazard.x));
          hazard.dir *= -1;
        }
      }
      if (now > invulnerableUntil && intersects(player, hazard)) {
        tone(86, .2, "square");
        resetPlayer();
        return;
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
    if (player.grounded || player.climbing) {
      player.vy = -455;
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
      drawLeaves(100, 345, "#245f36"); drawLeaves(740, 420, "#1d4e2e");
    } else if (level.decor === "room") {
      ctx.fillStyle = "rgba(230,240,230,.05)"; ctx.fillRect(0, 65, W, 435);
      ctx.fillStyle = "rgba(5,10,13,.38)";
      for (let x = 35; x < W; x += 205) ctx.fillRect(x, 120, 155, 330);
      ctx.strokeStyle = "rgba(240,204,98,.13)"; ctx.lineWidth = 4;
      for (let x = 35; x < W; x += 205) ctx.strokeRect(x, 120, 155, 330);
    } else {
      ctx.fillStyle = "rgba(255,210,185,.04)"; ctx.fillRect(0, 70, W, 430);
      ctx.fillStyle = "#171820"; ctx.fillRect(760, 70, 200, 430);
      ctx.strokeStyle = "rgba(239,140,115,.18)"; ctx.lineWidth = 4; ctx.strokeRect(760, 70, 200, 430);
      ctx.fillStyle = "rgba(245,245,230,.1)"; ctx.fillRect(895, 100, 8, 265);
      ctx.fillStyle = "rgba(80,60,50,.3)"; ctx.fillRect(70, 360, 290, 140);
    }
  }

  function drawLeaves(x, y, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(x + i * 24, y - (i % 3) * 28);
      ctx.rotate((i - 3) * .22);
      ctx.beginPath(); ctx.ellipse(0, 0, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawPlatforms(level) {
    for (const p of level.platforms) {
      ctx.fillStyle = p[1] >= 490 ? "#111914" : level.palette[2];
      roundedRect(p[0], p[1], p[2], p[3], 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.fillRect(p[0] + 7, p[1] + 3, Math.max(0, p[2] - 14), 2);
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
    ctx.font = "900 12px system-ui"; ctx.textAlign = "center"; ctx.fillText(levelIndex === 2 ? "FRIDGE" : "EXIT", x+w/2, y-10);
    ctx.font = "900 24px system-ui";
    ctx.fillText("↓", x+w/2, y-28);
  }

  function drawInsects(level, time) {
    level.insects.forEach((bug, i) => {
      if (bug[2]) return;
      const bob = Math.sin(time * .004 + i * 2) * 4;
      ctx.save(); ctx.translate(bug[0], bug[1] + bob);
      ctx.strokeStyle = "#f8e89a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4,-2);ctx.lineTo(-12,-8);ctx.moveTo(4,-2);ctx.lineTo(12,-8);ctx.moveTo(-4,3);ctx.lineTo(-12,9);ctx.moveTo(4,3);ctx.lineTo(12,9);ctx.stroke();
      ctx.fillStyle = "#1b1108"; ctx.beginPath();ctx.ellipse(0,0,7,10,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle = "#f8e89a";ctx.beginPath();ctx.arc(0,-7,2.2,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });
  }

  function drawHazard(h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    if (h.type === "cat") {
      ctx.fillStyle="#151416";roundedRect(0,4,h.w,h.h-4,9);ctx.fill();
      ctx.beginPath();ctx.moveTo(8,7);ctx.lineTo(13,-4);ctx.lineTo(20,7);ctx.fill();
      ctx.fillStyle="#d8f56d";ctx.fillRect(13,10,4,3);ctx.fillRect(22,10,4,3);
      ctx.strokeStyle="#151416";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(h.w-4,12);ctx.quadraticCurveTo(h.w+18,-2,h.w+12,-15);ctx.stroke();
    } else if (h.type === "dog") {
      ctx.fillStyle="#9c7655";roundedRect(0,2,h.w,h.h-2,10);ctx.fill();
      ctx.fillStyle="#6d4b35";ctx.beginPath();ctx.ellipse(16,7,12,9,-.3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#111";ctx.beginPath();ctx.arc(8,8,3,0,Math.PI*2);ctx.fill();
    } else if (h.type === "hand") {
      ctx.fillStyle="#c99072";roundedRect(0,5,h.w,h.h-5,10);ctx.fill();
      for(let i=0;i<4;i++){roundedRect(25+i*9,0,8,16,4);ctx.fill();}
    } else if (h.type === "grab") {
      ctx.fillStyle="#c99072";
      roundedRect(16,20,h.w-30,h.h-14,13);ctx.fill();
      for(let i=0;i<4;i++){
        roundedRect(12+i*15,2,11,31-(i%2)*5,6);ctx.fill();
      }
      ctx.fillStyle="#a96f56";
      roundedRect(h.w-20,29,28,15,7);ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.18)";
      roundedRect(18,23,h.w-42,4,2);ctx.fill();
    } else if (h.type === "repashy") {
      ctx.fillStyle="#d6d1b4";roundedRect(4,0,h.w-8,h.h,6);ctx.fill();ctx.fillStyle="#6d5938";ctx.fillRect(8,4,h.w-16,7);
    } else if (h.type === "roomba") {
      ctx.fillStyle="#26272a";ctx.beginPath();ctx.ellipse(h.w/2,h.h/2,h.w/2,h.h/2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#ef8c73";ctx.stroke();
    } else {
      ctx.fillStyle="#524957";ctx.beginPath();ctx.ellipse(h.w/2,h.h/2,h.w/2,h.h/2,-.25,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawDroppedTail(now) {
    if (!droppedTail) return;
    const age = now - droppedTail.droppedAt;
    if (age > 7000) return;
    const wiggle = age < 3200 ? Math.sin(age * .026) * 7 * (1 - age / 4000) : 0;
    const green = levels[levelIndex]?.palette[3] || "#a9f576";
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

  function drawGecko(now) {
    const flash = now < invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (flash) ctx.globalAlpha = .4;
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    ctx.scale(player.facing, 1);
    const green = levels[levelIndex]?.palette[3] || "#a9f576";
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

    // Tongue reaches forward and can actually collect bugs.
    if (now < tongueActiveUntil) {
      const progress = Math.min(1, Math.max(0, (now - (tongueActiveUntil - 230)) / 230));
      const extension = Math.sin(progress * Math.PI) * 106;
      ctx.strokeStyle="#ff86a8"; ctx.lineWidth=3; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(29,2); ctx.lineTo(29 + extension,2); ctx.stroke();
      ctx.fillStyle="#ff9bb7"; ctx.beginPath(); ctx.ellipse(31 + extension,2,6,4,0,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function draw(time = 0) {
    const level = levels[levelIndex] || levels[0];
    drawBackdrop(level);
    drawPlatforms(level);
    drawExit(level);
    drawInsects(level, time);
    level.hazards.forEach(drawHazard);
    drawDroppedTail(time);
    drawGecko(time);
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
    if (!keys[event.code] && event.code === "KeyE") useTongue();
    if (!keys[event.code] && (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyX")) dropTail();
    keys[event.code] = true;
  });
  window.addEventListener("keyup", event => keys[event.code] = false);

  document.querySelectorAll("[data-control]").forEach(button => {
    const control = button.dataset.control;
    const key = control === "left" ? "touchLeft" : control === "right" ? "touchRight" : "touchJump";
    const press = event => {
      event.preventDefault();
      if (control === "tail") return dropTail();
      if (control === "tongue") return useTongue();
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
