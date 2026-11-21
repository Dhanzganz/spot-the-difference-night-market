// Spot the Difference — procedural scene painter.
// Every scene is drawn twice from the same code: variant 0 is the original
// (panel A), variant 1 is the changed picture (panel B). A difference is
// either MISSING on panel B (an element simply is not drawn) or ALTERED
// (the same element is drawn a different way). No randomness at draw time,
// so both panels always agree except for the listed differences.
import { PANEL_W, PANEL_H } from './scenes.js';

const W = PANEL_W;
const H = PANEL_H;

// Differences that vanish entirely on panel B, keyed by scene id.
const MISSING = {
  market: new Set(['star', 'jar', 'apple']),
  lighthouse: new Set(['gull', 'cloud', 'fish']),
  workshop: new Set(['jar', 'wrench']),
  library: new Set(['rung', 'teacup', 'star']),
  festival: new Set(['lantern', 'koi', 'plank', 'star', 'string']),
};
// Differences drawn differently on panel B.
const ALTERED = {
  market: new Set(['moon', 'lantern', 'catTail', 'sign']),
  lighthouse: new Set(['beam', 'flag', 'buoy', 'window']),
  workshop: new Set(['eye', 'gear', 'lamp', 'poster', 'antenna', 'cable']),
  library: new Set(['owlEyes', 'candle', 'spine', 'globe', 'rug']),
  festival: new Set(['firework', 'roof', 'blossom', 'moon']),
};

function isMissing(sceneId, diffId, variant) {
  return variant === 1 && MISSING[sceneId] && MISSING[sceneId].has(diffId);
}
function isAltered(sceneId, diffId, variant) {
  return variant === 1 && ALTERED[sceneId] && ALTERED[sceneId].has(diffId);
}

// ---- tiny drawing helpers -------------------------------------------------
function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
function moonDisc(ctx, x, y, r, crescent) {
  circle(ctx, x, y, r, '#ffe9a8');
  if (crescent) circle(ctx, x + r * 0.45, y - r * 0.15, r * 0.85, '#2a2140');
  ctx.fillStyle = 'rgba(200,170,90,0.5)';
  circle(ctx, x - r * 0.3, y + r * 0.2, r * 0.14, 'rgba(200,170,90,0.5)');
  circle(ctx, x + r * 0.25, y + r * 0.35, r * 0.1, 'rgba(200,170,90,0.5)');
}
function stringLights(ctx, y, color) {
  ctx.strokeStyle = '#3a2c1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y - 26);
  ctx.quadraticCurveTo(W / 2, y + 22, W, y - 26);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 20 + t * (W - 40);
    const yy = y - 26 + Math.sin(t * Math.PI) * 22 + 8;
    circle(ctx, x, yy, 5, color);
    circle(ctx, x, yy, 8, 'rgba(255,220,120,0.25)');
  }
}

// ---- scene 1: Night Market -------------------------------------------------
function drawMarket(ctx, variant) {
  skyGradient(ctx, '#2a2140', '#4a2c4e');
  if (!isMissing('market', 'star', variant)) {
    star(ctx, 96, 44, 7, '#fff3c4');
    star(ctx, 210, 30, 5, '#fff3c4');
    star(ctx, 360, 40, 6, '#ffe9a8');
    star(ctx, 40, 110, 5, '#fff3c4');
  }
  moonDisc(ctx, 482, 52, 26, isAltered('market', 'moon', variant));
  // Rooftops
  poly(ctx, [[0, 150], [90, 96], [180, 150]], '#1d1630');
  poly(ctx, [[380, 150], [470, 100], [560, 150]], '#1d1630');
  rect(ctx, 0, 148, W, 6, '#241a3a');
  // Paper lanterns on a string
  ctx.strokeStyle = '#241a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 70);
  ctx.lineTo(420, 70);
  ctx.stroke();
  const lanternColors = ['#ff5a4e', '#ff8a3d', '#ffd23d'];
  [190, 288, 386].forEach((x, i) => {
    const col = isAltered('market', 'lantern', variant) && i === 1 ? '#7ddc8a' : lanternColors[i];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, 96, 20, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x - 3, 74, 6, 44);
    rect(ctx, x - 8, 66, 16, 6, '#8a6a2a');
    rect(ctx, x - 8, 118, 16, 6, '#8a6a2a');
  });
  // Stall: awning, counter, sign
  const stripe = isAltered('market', 'sign', variant) ? '#3d7dc4' : '#e84a5f';
  for (let i = 0; i < 8; i++) {
    rect(ctx, 120 + i * 40, 168, 40, 26, i % 2 === 0 ? stripe : '#fff3d6');
  }
  rect(ctx, 120, 194, 320, 10, '#7a5230');
  rect(ctx, 140, 204, 280, 96, '#8a6a42');
  rect(ctx, 140, 204, 280, 8, '#a87a52');
  // Stall sign
  rect(ctx, 218, 158, 100, 34, '#5a3a22');
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isAltered('market', 'sign', variant) ? 'SOTO' : 'SATE', 268, 176);
  // Fruit crates
  rect(ctx, 380, 286, 90, 44, '#6a4a2a');
  const apples = isMissing('market', 'apple', variant) ? 4 : 5;
  for (let i = 0; i < apples; i++) {
    circle(ctx, 392 + (i % 3) * 26, 282 - Math.floor(i / 3) * 16, 11, '#e84a3f');
    circle(ctx, 396 + (i % 3) * 26, 278 - Math.floor(i / 3) * 16, 3, '#ffb3a0');
  }
  circle(ctx, 470, 278, 11, '#ff9f2e');
  circle(ctx, 448, 282, 11, '#ff9f2e');
  // Pickle jar on the counter
  if (!isMissing('market', 'jar', variant)) {
    rect(ctx, 182, 268, 28, 34, '#bfe8c9');
    rect(ctx, 182, 268, 28, 10, '#7dc48a');
    circle(ctx, 192, 286, 4, '#3d7a4a');
    circle(ctx, 202, 292, 4, '#3d7a4a');
  }
  // The smug cat by the crate
  const tailUp = !isAltered('market', 'catTail', variant);
  ctx.fillStyle = '#3a3a4a';
  ellipse(ctx, 108, 330, 34, 22, '#3a3a4a');
  circle(ctx, 132, 306, 17, '#3a3a4a');
  poly(ctx, [[120, 292], [126, 276], [132, 292]], '#3a3a4a');
  poly(ctx, [[136, 292], [142, 276], [148, 292]], '#3a3a4a');
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailUp) { ctx.moveTo(78, 332); ctx.quadraticCurveTo(58, 318, 62, 296); }
  else { ctx.moveTo(78, 332); ctx.quadraticCurveTo(58, 342, 52, 330); }
  ctx.stroke();
  circle(ctx, 126, 304, 2, '#ffd23d');
  circle(ctx, 138, 304, 2, '#ffd23d');
  // Cobblestones
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 8; i++) ellipse(ctx, 40 + i * 68, 372 + (i % 2) * 12, 26, 7, 'rgba(0,0,0,0.25)');
}

// ---- scene 2: Lighthouse Cove ----------------------------------------------
function drawLighthouse(ctx, variant) {
  skyGradient(ctx, '#1d3a5e', '#e89b6a');
  if (!isMissing('lighthouse', 'cloud', variant)) {
    ellipse(ctx, 84, 92, 42, 14, 'rgba(255,220,190,0.85)');
    ellipse(ctx, 110, 86, 30, 12, 'rgba(255,220,190,0.85)');
  }
  ellipse(ctx, 470, 70, 46, 13, 'rgba(255,220,190,0.7)');
  // Sun low on the horizon
  circle(ctx, 500, 150, 26, '#ffd23d');
  // Sea
  rect(ctx, 0, 240, W, 160, '#2a6a8a');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 30, 268 + i * 22);
    ctx.quadraticCurveTo(90 + i * 30, 262 + i * 22, 160 + i * 30, 268 + i * 22);
    ctx.stroke();
  }
  // Cliffs
  poly(ctx, [[0, 400], [0, 260], [120, 300], [170, 400]], '#4a3a52');
  poly(ctx, [[560, 400], [560, 280], [470, 310], [430, 400]], '#4a3a52');
  // Lighthouse
  const beamOn = !isAltered('lighthouse', 'beam', variant);
  if (beamOn) {
    ctx.fillStyle = 'rgba(255,240,170,0.35)';
    poly(ctx, [[158, 120], [330, 84], [330, 156], [158, 138]], 'rgba(255,240,170,0.35)');
  }
  poly(ctx, [[140, 300], [150, 110], [176, 110], [186, 300]], '#f2ead8');
  rect(ctx, 148, 180, 30, 14, '#e84a5f');
  rect(ctx, 150, 240, 26, 14, '#e84a5f');
  rect(ctx, 146, 104, 34, 10, '#3a3a4a');
  circle(ctx, 163, 96, 14, '#3a3a4a');
  circle(ctx, 163, 96, 9, beamOn ? '#ffe98a' : '#5a5a6a');
  const winLit = !isAltered('lighthouse', 'window', variant);
  rect(ctx, 156, 186, 12, 16, winLit ? '#ffe98a' : '#3a3a4a');
  // Flag
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(163, 96);
  ctx.lineTo(163, 58);
  ctx.stroke();
  poly(ctx, [[163, 58], [196, 66], [163, 76]], isAltered('lighthouse', 'flag', variant) ? '#3d7dc4' : '#e84a5f');
  // Gulls
  const gulls = isMissing('lighthouse', 'gull', variant) ? 2 : 3;
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 2;
  [[330, 70], [392, 78], [440, 60]].slice(0, gulls).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.quadraticCurveTo(x - 4, y - 7, x, y);
    ctx.quadraticCurveTo(x + 4, y - 7, x + 10, y);
    ctx.stroke();
  });
  // Boat
  poly(ctx, [[240, 300], [300, 300], [288, 318], [252, 318]], '#7a4a2a');
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(272, 300);
  ctx.lineTo(272, 262);
  ctx.stroke();
  poly(ctx, [[272, 262], [272, 296], [300, 296]], '#fff3d6');
  // Buoy
  const buoyCol = isAltered('lighthouse', 'buoy', variant) ? '#3d7dc4' : '#e84a5f';
  circle(ctx, 448, 318, 14, buoyCol);
  rect(ctx, 436, 312, 24, 6, '#fff3d6');
  rect(ctx, 444, 300, 8, 12, '#3a3a4a');
  // Jumping fish
  if (!isMissing('lighthouse', 'fish', variant)) {
    ctx.fillStyle = '#bfe8ff';
    ctx.beginPath();
    ctx.ellipse(330, 330, 14, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[342, 322], [352, 318], [346, 330]], '#bfe8ff');
  }
}

// ---- scene 3: Robot Workshop ------------------------------------------------
function drawWorkshop(ctx, variant) {
  skyGradient(ctx, '#3a2a1e', '#5a4632');
  rect(ctx, 0, 0, W, H, '#6a5138');
  // Back wall panels
  rect(ctx, 0, 0, W, 220, '#7a5f42');
  for (let i = 0; i < 4; i++) rect(ctx, 20 + i * 140, 12, 4, 200, 'rgba(0,0,0,0.15)');
  // Window with night sky
  rect(ctx, 420, 30, 110, 90, '#2a2140');
  rect(ctx, 420, 30, 110, 90, 'rgba(42,33,64,0.4)');
  ctx.fillStyle = '#2a2140';
  ctx.fillRect(424, 34, 102, 82);
  star(ctx, 448, 58, 5, '#fff3c4');
  star(ctx, 492, 74, 4, '#fff3c4');
  circle(ctx, 508, 52, 10, '#ffe9a8');
  rect(ctx, 468, 30, 6, 90, '#5a4632');
  rect(ctx, 420, 70, 110, 6, '#5a4632');
  // Big gear on the wall
  const gearTeeth = isAltered('workshop', 'gear', variant) ? 6 : 8;
  ctx.fillStyle = '#8a8a9a';
  ctx.beginPath();
  for (let i = 0; i < gearTeeth * 2; i++) {
    const a = (i * Math.PI) / gearTeeth;
    const rr = i % 2 === 0 ? 34 : 26;
    const px = 96 + Math.cos(a) * rr;
    const py = 96 + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  circle(ctx, 96, 96, 12, '#5a5a6a');
  // Poster
  rect(ctx, 400, 180, 60, 80, '#f2ead8');
  rect(ctx, 404, 184, 52, 72, '#2a4a6a');
  if (isAltered('workshop', 'poster', variant)) {
    circle(ctx, 430, 216, 18, '#e8a34a');
    circle(ctx, 424, 210, 5, '#c47a2a');
  } else {
    poly(ctx, [[430, 196], [442, 226], [430, 220], [418, 226]], '#ff8a3d');
    circle(ctx, 430, 200, 6, '#ff8a3d');
    circle(ctx, 418, 240, 3, '#fff3c4');
    circle(ctx, 444, 246, 3, '#fff3c4');
  }
  ctx.fillStyle = '#2a2a3a';
  ctx.font = 'bold 9px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPACE', 430, 250);
  // Shelf with jars
  rect(ctx, 60, 250, 180, 12, '#4a3423');
  if (!isMissing('workshop', 'jar', variant)) {
    rect(ctx, 140, 226, 22, 24, '#bfe8c9');
    rect(ctx, 140, 226, 22, 8, '#7dc48a');
  }
  rect(ctx, 176, 222, 22, 28, '#c4b8ff');
  rect(ctx, 176, 222, 22, 8, '#8a7ad4');
  rect(ctx, 212, 228, 22, 22, '#ffd23d');
  // Desk lamp
  const lampOn = !isAltered('workshop', 'lamp', variant);
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(452, 260);
  ctx.lineTo(452, 300);
  ctx.stroke();
  poly(ctx, [[436, 300], [468, 300], [460, 276], [444, 276]], lampOn ? '#ffd23d' : '#8a8a9a');
  if (lampOn) {
    ctx.fillStyle = 'rgba(255,220,120,0.25)';
    poly(ctx, [[444, 300], [460, 300], [500, 360], [410, 360]], 'rgba(255,220,120,0.25)');
  }
  // Workbench
  rect(ctx, 40, 300, 480, 16, '#4a3423');
  rect(ctx, 60, 316, 14, 60, '#3a2a1a');
  rect(ctx, 486, 316, 14, 60, '#3a2a1a');
  // Robot on the bench
  const eyeCol = isAltered('workshop', 'eye', variant) ? '#7ddc8a' : '#ff5a4e';
  const antennaCol = isAltered('workshop', 'antenna', variant) ? '#ffd23d' : '#ff5a4e';
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(268, 116);
  ctx.lineTo(268, 132);
  ctx.stroke();
  circle(ctx, 268, 110, 7, antennaCol);
  rect(ctx, 238, 132, 60, 54, '#9aa0b0');
  rect(ctx, 238, 132, 60, 12, '#7a8090');
  circle(ctx, 258, 160, 8, eyeCol);
  circle(ctx, 278, 160, 8, eyeCol);
  rect(ctx, 258, 172, 20, 4, '#3a3a4a');
  rect(ctx, 246, 186, 44, 34, '#b0b6c4');
  circle(ctx, 268, 203, 9, '#e84a5f');
  rect(ctx, 226, 190, 12, 26, '#8a8a9a');
  rect(ctx, 298, 190, 12, 26, '#8a8a9a');
  // Wrench on the bench
  if (!isMissing('workshop', 'wrench', variant)) {
    ctx.strokeStyle = '#c4c4d4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(318, 296);
    ctx.lineTo(344, 308);
    ctx.stroke();
    circle(ctx, 316, 295, 7, '#c4c4d4');
    circle(ctx, 316, 295, 4, '#6a5138');
  }
  // Cable on the floor
  ctx.strokeStyle = isAltered('workshop', 'cable', variant) ? '#e84a5f' : '#2a2a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(150, 380);
  ctx.quadraticCurveTo(200, 330, 250, 372);
  ctx.stroke();
  // Floor bolts
  circle(ctx, 80, 360, 5, '#8a8a9a');
  circle(ctx, 520, 366, 5, '#8a8a9a');
}

// ---- scene 4: Midnight Library ----------------------------------------------
function drawLibrary(ctx, variant) {
  skyGradient(ctx, '#241a3a', '#3a2a52');
  // Window with night sky
  rect(ctx, 440, 30, 100, 120, '#1d1630');
  ctx.fillStyle = '#1d1630';
  ctx.fillRect(444, 34, 92, 112);
  if (!isMissing('library', 'star', variant)) star(ctx, 500, 60, 6, '#fff3c4');
  star(ctx, 462, 96, 5, '#fff3c4');
  star(ctx, 516, 112, 4, '#fff3c4');
  circle(ctx, 522, 52, 11, '#ffe9a8');
  rect(ctx, 486, 30, 6, 120, '#5a4632');
  rect(ctx, 440, 84, 100, 6, '#5a4632');
  // Bookshelves
  rect(ctx, 30, 40, 380, 240, '#5a3a22');
  const shelfCols = ['#b03a3a', '#3a6ab0', '#3a9a4a', '#d4a03a', '#7a4ab0', '#b06a3a'];
  for (let row = 0; row < 3; row++) {
    const y = 56 + row * 72;
    for (let i = 0; i < 9; i++) {
      const x = 42 + i * 40;
      const spine = isAltered('library', 'spine', variant) && row === 0 && i === 2 ? '#7ddc8a' : shelfCols[(row * 3 + i) % shelfCols.length];
      rect(ctx, x, y, 30, 52, spine);
      rect(ctx, x + 4, y + 8, 22, 3, 'rgba(255,255,255,0.5)');
    }
    rect(ctx, 36, y + 52, 368, 8, '#3a2412');
  }
  // Rolling ladder
  ctx.strokeStyle = '#8a6a42';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(180, 60);
  ctx.lineTo(180, 280);
  ctx.moveTo(212, 60);
  ctx.lineTo(212, 280);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    if (isMissing('library', 'rung', variant) && i === 1) continue;
    ctx.beginPath();
    ctx.moveTo(180, 100 + i * 44);
    ctx.lineTo(212, 100 + i * 44);
    ctx.stroke();
  }
  // Owl on the shelf top
  const eyesOpen = !isAltered('library', 'owlEyes', variant);
  ellipse(ctx, 420, 122, 26, 30, '#6a4a2a');
  circle(ctx, 410, 100, 6, '#6a4a2a');
  circle(ctx, 430, 100, 6, '#6a4a2a');
  if (eyesOpen) {
    circle(ctx, 410, 104, 4, '#ffd23d');
    circle(ctx, 430, 104, 4, '#ffd23d');
    circle(ctx, 410, 104, 2, '#1d1630');
    circle(ctx, 430, 104, 2, '#1d1630');
  } else {
    ctx.strokeStyle = '#1d1630';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(406, 104); ctx.lineTo(414, 104);
    ctx.moveTo(426, 104); ctx.lineTo(434, 104);
    ctx.stroke();
  }
  poly(ctx, [[420, 112], [416, 120], [424, 120]], '#e8a34a');
  // Desk
  rect(ctx, 60, 300, 360, 14, '#4a3423');
  rect(ctx, 80, 314, 12, 56, '#3a2a1a');
  rect(ctx, 388, 314, 12, 56, '#3a2a1a');
  // Brass globe
  ctx.save();
  ctx.translate(96, 300);
  if (isAltered('library', 'globe', variant)) ctx.rotate(0.35);
  circle(ctx, 0, 0, 22, '#3d7dc4');
  ctx.fillStyle = '#7dc48a';
  ctx.beginPath();
  ctx.ellipse(-6, -4, 9, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, 8, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  rect(ctx, 88, 320, 16, 8, '#8a6a2a');
  // Candle
  rect(ctx, 262, 282, 12, 22, '#fff3d6');
  const flameCol = isAltered('library', 'candle', variant) ? '#6ec6ff' : '#ff9f2e';
  const flameGlow = isAltered('library', 'candle', variant)
    ? 'rgba(110,198,255,0.25)'
    : 'rgba(255,159,46,0.25)';
  ctx.fillStyle = flameCol;
  ctx.beginPath();
  ctx.ellipse(268, 272, 6, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 268, 272, 10, flameGlow);
  // Teacup
  if (!isMissing('library', 'teacup', variant)) {
    ellipse(ctx, 356, 296, 14, 8, '#b03a3a');
    ctx.strokeStyle = '#b03a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(370, 294, 6, -1.2, 1.2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(352, 284);
    ctx.quadraticCurveTo(350, 276, 356, 272);
    ctx.stroke();
  }
  // Rug
  const rugStripe = isAltered('library', 'rug', variant) ? '#7ddc8a' : '#e84a5f';
  rect(ctx, 200, 352, 200, 34, '#8a3a3a');
  rect(ctx, 210, 358, 180, 6, rugStripe);
  rect(ctx, 210, 372, 180, 6, '#ffd23d');
  ellipse(ctx, 300, 369, 16, 5, rugStripe);
}

// ---- scene 5: Lantern Festival ----------------------------------------------
function drawFestival(ctx, variant) {
  skyGradient(ctx, '#1d1630', '#5e2a4e');
  if (!isMissing('festival', 'star', variant)) star(ctx, 210, 48, 6, '#fff3c4');
  star(ctx, 120, 36, 5, '#fff3c4');
  star(ctx, 330, 40, 4, '#fff3c4');
  moonDisc(ctx, 500, 52, 24, isAltered('festival', 'moon', variant));
  // Firework
  const fwCol = isAltered('festival', 'firework', variant) ? '#7ddc8a' : '#ff8a3d';
  ctx.strokeStyle = fwCol;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(96, 84);
    ctx.lineTo(96 + Math.cos(a) * 26, 84 + Math.sin(a) * 26);
    ctx.stroke();
  }
  circle(ctx, 96, 84, 5, fwCol);
  // Sky lanterns
  const lanterns = isMissing('festival', 'lantern', variant)
    ? [[300, 60], [440, 80], [180, 110]]
    : [[300, 60], [372, 96], [440, 80], [180, 110]];
  lanterns.forEach(([x, y], i) => {
    ctx.fillStyle = i % 2 === 0 ? '#ff8a3d' : '#ffd23d';
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,120,60,0.7)';
    circle(ctx, x, y + 14, 4, 'rgba(255,120,60,0.7)');
  });
  // String lights across the sky
  stringLights(ctx, 150, isMissing('festival', 'string', variant) ? '#ffd23d' : '#ffd23d');
  if (isMissing('festival', 'string', variant)) {
    // one bulb dark on panel B: redraw the middle bulb dim
    circle(ctx, 280, 152, 5, '#4a3a6e');
  }
  // Pagoda
  rect(ctx, 420, 210, 70, 90, '#7a3a3a');
  poly(ctx, [[410, 212], [455, 178], [500, 212]], isAltered('festival', 'roof', variant) ? '#3d7dc4' : '#2a4a6a');
  rect(ctx, 436, 232, 14, 20, '#ffe9a8');
  rect(ctx, 460, 232, 14, 20, '#ffe9a8');
  rect(ctx, 436, 266, 38, 24, '#5a2a2a');
  // Blossom tree
  ctx.fillStyle = '#4a2a1a';
  ctx.fillRect(66, 220, 14, 80);
  ctx.beginPath();
  ctx.moveTo(73, 230);
  ctx.lineTo(50, 200);
  ctx.lineTo(96, 200);
  ctx.closePath();
  ctx.fill();
  const blossomCol = isAltered('festival', 'blossom', variant) ? '#ffd23d' : '#ff9fc4';
  [[52, 196], [76, 186], [98, 200], [64, 214], [90, 216]].forEach(([x, y]) => circle(ctx, x, y, 12, blossomCol));
  // Bridge over the pond
  ctx.strokeStyle = '#7a4a2a';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(140, 330);
  ctx.quadraticCurveTo(280, 270, 420, 330);
  ctx.stroke();
  ctx.strokeStyle = '#a87a52';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    if (isMissing('festival', 'plank', variant) && i === 3) continue;
    const t = i / 6;
    const x = 150 + t * 260;
    const y = 330 - Math.sin(t * Math.PI) * 34;
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
  }
  // Pond
  rect(ctx, 0, 330, W, 70, '#2a5a7a');
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 40, 352 + i * 10);
    ctx.quadraticCurveTo(90 + i * 40, 346 + i * 10, 150 + i * 40, 352 + i * 10);
    ctx.stroke();
  }
  // Koi
  const koiCount = isMissing('festival', 'koi', variant) ? 1 : 2;
  [[230, 360], [300, 348]].slice(0, koiCount).forEach(([x, y]) => {
    ctx.fillStyle = '#ff8a3d';
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[x + 14, y], [x + 24, y - 6], [x + 24, y + 6]], '#ff8a3d');
    circle(ctx, x - 8, y - 2, 2, '#1d1630');
  });
}

// ---- public entry ------------------------------------------------------------
const PAINTERS = {
  market: drawMarket,
  lighthouse: drawLighthouse,
  workshop: drawWorkshop,
  library: drawLibrary,
  festival: drawFestival,
};

// Paint one panel of a scene. variant 0 = original (A), 1 = changed (B).
export function paintScene(ctx, scene, variant) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  PAINTERS[scene.id](ctx, variant);
  ctx.restore();
}
