// Spot the Difference — screenshot demo states.
// ?shot=cover loads the Night Market mid-hunt with three differences already
// found, several still unfound and the counter reading 3 / 7: exactly the
// frame the bounty asks the cover to show. The timer is frozen so the shot
// is the same every render. Other shots stage the title, a later scene and
// the end screen. With no ?shot parameter the game starts normally.
import { SCENES } from './scenes.js';

function setFound(game, sceneIndex, diffIds, score, combo, timeLeft) {
  const sc = SCENES[sceneIndex];
  game.sceneIndex = sceneIndex;
  game.found = new Set(diffIds);
  game.totalFound = diffIds.length;
  game.score = score;
  game.combo = combo;
  game.lastFindAt = Date.now();
  game.hintsLeft = sc.hints;
  game.timeLimit = sc.timeLimit;
  game.timeLeft = timeLeft;
  game.state = 'playing';
}

export function applyShotState(game, hooks) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  // Screenshot mode: no countdown, no surprises.
  game.shotMode = true;
  const toast = document.getElementById('toast');

  if (shot === 'cover') {
    // Night Market, 3 of 7 found, 1:47 left, score 350, combo x3.
    hooks.startScene(0);
    setFound(game, 0, ['lantern', 'catTail', 'apple'], 350, 3, 107);
    game.hintsLeft = 3;
    if (toast) toast.textContent = 'Found it! +150  (combo \u00D73)';
    hooks.updateHud();
    hooks.render();
  } else if (shot === 'workshop') {
    // Robot Workshop, 2 of 8 found, 1:12 left.
    hooks.startScene(2);
    setFound(game, 2, ['eye', 'gear'], 225, 2, 72);
    game.hintsLeft = 2;
    if (toast) toast.textContent = 'Found it! +125  (combo \u00D72)';
    hooks.updateHud();
    hooks.render();
  } else if (shot === 'title') {
    hooks.showTitle();
    hooks.render();
  } else if (shot === 'end') {
    // End screen after all five scenes, three stars.
    game.score = 5340;
    game.totalFound = 39;
    game.levelScores = [1120, 1085, 1210, 975, 950];
    game.state = 'end';
    hooks.showEnd();
    hooks.render();
  }
}
