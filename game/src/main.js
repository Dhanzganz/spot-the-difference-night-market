// Spot the Difference — game core: state machine, scoring, timer, markers,
// HUD and overlays. The pictures themselves live in painter.js, the level
// data in scenes.js, sounds in audio.js, input in input.js.
import { SCENES, totalDifferences, levelClearBonus } from './scenes.js';
import { paintScene } from './painter.js';
import * as audio from './audio.js';
import { bindPanels, bindKeys } from './input.js';
import { applyShotState } from './shots.js';

const canvasA = document.getElementById('canvasA');
const canvasB = document.getElementById('canvasB');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');

const el = (id) => document.getElementById(id);
const scoreEl = el('score');
const streakEl = el('streak');
const levelLabelEl = el('levelLabel');
const sceneNameEl = el('sceneName');
const foundCountEl = el('foundCount');
const foundDotsEl = el('foundDots');
const timerEl = el('timer');
const timerFillEl = el('timerFill');
const hintBtn = el('hintBtn');
const hintCountEl = el('hintCount');
const soundBtn = el('soundBtn');
const menuBtn = el('menuBtn');
const toastEl = el('toast');
const progressTextEl = el('progressText');
const overlayEl = el('overlay');
const overlayCardEl = el('overlayCard');

const FIND_POINTS = 100;
const COMBO_STEP = 25;
const WRONG_POINTS = 25;
const WRONG_SECONDS = 3;
const HINT_COST = 50;
const COMBO_WINDOW_MS = 6000;

const game = {
  state: 'title', // title | playing | levelClear | timeout | end
  sceneIndex: 0,
  found: new Set(),
  score: 0,
  combo: 0,
  lastFindAt: 0,
  hintsLeft: 3,
  timeLeft: 120,
  timeLimit: 120,
  levelScores: [],
  totalFound: 0,
  wrongFlash: null, // {x, y, panel, until}
  hintPulse: null, // {diff, until}
  timerId: null,
  shotMode: false,
};

function scene() {
  return SCENES[game.sceneIndex];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function toast(message, kind) {
  toastEl.textContent = message;
  toastEl.className = kind || '';
}

function updateHud() {
  const sc = scene();
  scoreEl.textContent = game.score;
  streakEl.textContent = '\u00D7' + Math.max(1, game.combo);
  levelLabelEl.textContent = (game.sceneIndex + 1) + ' / ' + SCENES.length;
  sceneNameEl.textContent = sc.name;
  foundCountEl.textContent = game.found.size + ' / ' + sc.diffs.length;
  foundDotsEl.innerHTML = sc.diffs
    .map((d) => '<i class="' + (game.found.has(d.id) ? 'on' : '') + '"></i>')
    .join('');
  timerEl.textContent = formatTime(game.timeLeft);
  timerEl.classList.toggle('low', game.timeLeft <= 15 && game.state === 'playing');
  const frac = game.timeLeft / game.timeLimit;
  timerFillEl.style.width = Math.max(0, frac * 100) + '%';
  timerFillEl.style.background = frac > 0.5 ? '#7ddc8a' : frac > 0.25 ? '#ffc94d' : '#ff6b6b';
  hintCountEl.textContent = game.hintsLeft;
  hintBtn.disabled = game.hintsLeft <= 0 || game.state !== 'playing';
  progressTextEl.textContent =
    'Scene ' + (game.sceneIndex + 1) + ' of ' + SCENES.length +
    ' \u00B7 find all ' + sc.diffs.length + ' differences';
}

// ---- rendering -------------------------------------------------------------
function drawMarker(ctx, diff, kind) {
  ctx.save();
  if (kind === 'found') {
    ctx.strokeStyle = '#7ddc8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#7ddc8a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x - 9, diff.y);
    ctx.lineTo(diff.x - 2, diff.y + 7);
    ctx.lineTo(diff.x + 10, diff.y - 7);
    ctx.stroke();
  } else if (kind === 'hint') {
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 120);
    ctx.strokeStyle = 'rgba(255,201,77,' + pulse.toFixed(2) + ')';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r + 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function render() {
  const sc = scene();
  paintScene(ctxA, sc, 0);
  paintScene(ctxB, sc, 1);
  // Found markers on both panels.
  sc.diffs.forEach((diff) => {
    if (game.found.has(diff.id)) {
      drawMarker(ctxA, diff, 'found');
      drawMarker(ctxB, diff, 'found');
    }
  });
  // Active hint pulse on both panels.
  if (game.hintPulse && Date.now() < game.hintPulse.until) {
    drawMarker(ctxA, game.hintPulse.diff, 'hint');
    drawMarker(ctxB, game.hintPulse.diff, 'hint');
  } else {
    game.hintPulse = null;
  }
  // Wrong-click flash.
  if (game.wrongFlash && Date.now() < game.wrongFlash.until) {
    const ctx = game.wrongFlash.panel === 'A' ? ctxA : ctxB;
    const { x, y } = game.wrongFlash;
    ctx.save();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    ctx.restore();
  } else {
    game.wrongFlash = null;
  }
}

// One continuous animation frame loop: repaints the panels every frame so
// markers, hint pulses and wrong-click flashes animate smoothly.
function startRenderLoop() {
  const tick = () => {
    render();
    requestAnimationFrame(tick);
  };
  tick();
}

// ---- timer -----------------------------------------------------------------
function stopTimer() {
  if (game.timerId) {
    clearInterval(game.timerId);
    game.timerId = null;
  }
}
function startTimer() {
  stopTimer();
  game.timerId = setInterval(() => {
    if (game.state !== 'playing') return;
    game.timeLeft -= 0.25;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      updateHud();
      onTimeout();
      return;
    }
    updateHud();
  }, 250);
}

// ---- flow ------------------------------------------------------------------
function startScene(index) {
  const sc = SCENES[index];
  game.sceneIndex = index;
  game.found = new Set();
  game.combo = 0;
  game.hintsLeft = sc.hints;
  game.timeLimit = sc.timeLimit;
  game.timeLeft = sc.timeLimit;
  game.wrongFlash = null;
  game.hintPulse = null;
  game.state = 'playing';
  hideOverlay();
  toast('Find all ' + sc.diffs.length + ' differences in ' + sc.name + '!');
  updateHud();
  render();
  if (!game.shotMode) startTimer();
}

function onTimeout() {
  stopTimer();
  game.state = 'timeout';
  audio.playTimeout();
  showOverlay(
    '<h1>Time&rsquo;s Up!</h1>' +
    '<h2>' + scene().name + ' &mdash; ' + game.found.size + ' of ' + scene().diffs.length + ' found</h2>' +
    '<p>The differences slipped away this time. Your score so far is safe &mdash; ' +
    'try the scene again and keep your streak going.</p>' +
    '<div class="menu-btns">' +
    '<button type="button" class="primary" id="ovRetry">Retry Scene</button>' +
    '<button type="button" id="ovMenu2">Back to Menu</button>' +
    '</div>'
  );
  el('ovRetry').addEventListener('click', () => { audio.playClick(); startScene(game.sceneIndex); });
  el('ovMenu2').addEventListener('click', () => { audio.playClick(); showTitle(); });
}

function onLevelClear() {
  stopTimer();
  game.state = 'levelClear';
  const bonus = levelClearBonus(game.timeLeft);
  game.score += bonus;
  game.levelScores[game.sceneIndex] = game.score;
  audio.playClear();
  const last = game.sceneIndex === SCENES.length - 1;
  showOverlay(
    '<h1>Scene Cleared!</h1>' +
    '<h2>' + scene().name + ' &mdash; all ' + scene().diffs.length + ' differences found</h2>' +
    '<p>Time bonus: <b>+' + bonus + '</b> &nbsp;&middot;&nbsp; Total score: <b>' + game.score + '</b></p>' +
    '<div class="menu-btns">' +
    (last
      ? '<button type="button" class="primary" id="ovFinish">See Final Results</button>'
      : '<button type="button" class="primary" id="ovNext">Next Scene: ' + SCENES[game.sceneIndex + 1].name + '</button>') +
    '<button type="button" id="ovMenu3">Back to Menu</button>' +
    '</div>'
  );
  const next = el('ovNext');
  if (next) next.addEventListener('click', () => { audio.playClick(); startScene(game.sceneIndex + 1); });
  const finish = el('ovFinish');
  if (finish) finish.addEventListener('click', () => { audio.playClick(); showEnd(); });
  el('ovMenu3').addEventListener('click', () => { audio.playClick(); showTitle(); });
  updateHud();
}

function showEnd() {
  stopTimer();
  game.state = 'end';
  const found = game.totalFound;
  const total = totalDifferences();
  const stars = game.score >= 5000 ? 3 : game.score >= 3500 ? 2 : 1;
  showOverlay(
    '<h1>You Did It!</h1>' +
    '<h2>All five scenes solved</h2>' +
    '<div class="stars">' + '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars) + '</div>' +
    '<div class="big-score">' + game.score + '</div>' +
    '<p>You found <b>' + found + ' of ' + total + '</b> differences across the Night Market, ' +
    'the Lighthouse Cove, the Robot Workshop, the Midnight Library and the Lantern Festival.</p>' +
    '<p>Thanks for playing &mdash; hunt again to beat your score!</p>' +
    '<div class="menu-btns">' +
    '<button type="button" class="primary" id="ovAgain">Play Again</button>' +
    '<button type="button" id="ovMenu4">Back to Menu</button>' +
    '</div>'
  );
  el('ovAgain').addEventListener('click', () => {
    audio.playClick();
    game.score = 0;
    game.totalFound = 0;
    game.levelScores = [];
    startScene(0);
  });
  el('ovMenu4').addEventListener('click', () => { audio.playClick(); showTitle(); });
}

function showTitle() {
  stopTimer();
  game.state = 'title';
  const cards = SCENES.map((sc, i) => {
    const done = game.levelScores[i] !== undefined;
    return '<div class="level-card' + (done ? ' done' : '') + '" data-scene="' + i + '" role="button" tabindex="0">' +
      '<span class="lv-emoji">' + sc.emoji + '</span>' +
      '<span class="lv-name">' + sc.name + '</span>' +
      '<span class="lv-meta">' + sc.diffs.length + ' differences &middot; ' + Math.floor(sc.timeLimit / 60) + ':' + String(sc.timeLimit % 60).padStart(2, '0') + (done ? ' &middot; cleared' : '') + '</span>' +
      '</div>';
  }).join('');
  showOverlay(
    '<h1>SPOT THE DIFFERENCE</h1>' +
    '<h2>Night Market Mysteries</h2>' +
    '<p>Two pictures hang side by side. They look the same &mdash; they are not. ' +
    'Find every difference before the clock runs out.</p>' +
    '<ol class="howto">' +
    '<li>Click a difference on <b>either</b> picture to mark it.</li>' +
    '<li>Fast finds build a combo &mdash; each one is worth more.</li>' +
    '<li>A wrong click costs 25 points and 3 seconds. Ouch.</li>' +
    '<li>Stuck? Press <b>H</b> for a hint (limited per scene).</li>' +
    '</ol>' +
    '<div class="level-grid">' + cards + '</div>' +
    '<div class="menu-btns">' +
    '<button type="button" class="primary" id="ovStart">Start the Hunt</button>' +
    '</div>'
  );
  el('ovStart').addEventListener('click', () => {
    audio.playClick();
    game.score = 0;
    game.totalFound = 0;
    game.levelScores = [];
    startScene(0);
  });
  overlayCardEl.querySelectorAll('.level-card').forEach((card) => {
    const go = () => {
      audio.playClick();
      startScene(Number(card.dataset.scene));
    };
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
  updateHud();
  render();
}

function showOverlay(html) {
  overlayCardEl.innerHTML = html;
  overlayEl.classList.remove('hidden');
}
function hideOverlay() {
  overlayEl.classList.add('hidden');
}

// ---- gameplay ---------------------------------------------------------------
function onPanelClick(panel, x, y) {
  if (game.state !== 'playing') return;
  audio.unlockAudio();
  const sc = scene();
  let best = null;
  let bestDist = Infinity;
  sc.diffs.forEach((diff) => {
    if (game.found.has(diff.id)) return;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < diff.r + 16 && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  });
  if (best) {
    game.found.add(best.id);
    game.totalFound += 1;
    const now = Date.now();
    game.combo = now - game.lastFindAt <= COMBO_WINDOW_MS ? game.combo + 1 : 1;
    game.lastFindAt = now;
    const gained = FIND_POINTS + (game.combo - 1) * COMBO_STEP;
    game.score += gained;
    audio.playFound();
    toast('Found it! +' + gained + (game.combo > 1 ? '  (combo \u00D7' + game.combo + ')' : ''), 'good');
    updateHud();
    render();
    if (game.found.size === sc.diffs.length) onLevelClear();
  } else {
    game.combo = 0;
    game.score = Math.max(0, game.score - WRONG_POINTS);
    game.timeLeft = Math.max(0, game.timeLeft - WRONG_SECONDS);
    game.wrongFlash = { x, y, panel, until: Date.now() + 700 };
    audio.playWrong();
    toast('Not a difference \u2014 ' + WRONG_POINTS + ' points, ' + WRONG_SECONDS + ' seconds.', 'bad');
    updateHud();
    render();
    if (game.timeLeft <= 0) onTimeout();
  }
}

function useHint() {
  if (game.state !== 'playing') return;
  if (game.hintsLeft <= 0) {
    toast('No hints left in this scene.', 'bad');
    return;
  }
  const sc = scene();
  const remaining = sc.diffs.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.hintPulse = { diff, until: Date.now() + 4000 };
  audio.playHint();
  toast('Hint: look near ' + diff.label + ' (' + HINT_COST + ' points).');
  updateHud();
  render();
}

function toggleSound() {
  audio.setMuted(!audio.isMuted());
  soundBtn.innerHTML = audio.isMuted() ? '&#9834; Sound: Off' : '&#9834; Sound: On';
  if (!audio.isMuted()) audio.playClick();
}

// ---- boot --------------------------------------------------------------------
bindPanels(canvasA, canvasB, onPanelClick);
bindKeys({
  hint: useHint,
  mute: toggleSound,
  menu: () => { if (game.state === 'playing') showTitle(); },
  confirm: () => {
    if (game.state === 'title') el('ovStart') && el('ovStart').click();
  },
});
hintBtn.addEventListener('click', useHint);
soundBtn.addEventListener('click', toggleSound);
menuBtn.addEventListener('click', () => { if (game.state !== 'title') showTitle(); });

showTitle();
startRenderLoop();
// Screenshot demo states (?shot=cover etc.) freeze a mid-game frame for shots.
applyShotState(game, { startScene, updateHud, render, showEnd, showTitle });
updateHud();
