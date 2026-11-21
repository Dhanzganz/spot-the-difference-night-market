// Spot the Difference — mouse and keyboard input.
// Clicks on either panel are translated into panel-local coordinates and
// handed to the game; keys are H (hint), M (mute), Esc (menu) and Enter
// (start / continue). Nothing here knows about scoring or scenes.
import { PANEL_W, PANEL_H } from './scenes.js';

// Convert a pointer event on a canvas to coordinates in the 560x400 space.
export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  return { x, y };
}

// Wire both panels to the game's onPanelClick(panel, x, y) callback.
// Returns a cleanup function that removes the listeners.
export function bindPanels(canvasA, canvasB, onPanelClick) {
  const handlerA = (event) => {
    const { x, y } = canvasPoint(canvasA, event);
    onPanelClick('A', x, y);
  };
  const handlerB = (event) => {
    const { x, y } = canvasPoint(canvasB, event);
    onPanelClick('B', x, y);
  };
  canvasA.addEventListener('click', handlerA);
  canvasB.addEventListener('click', handlerB);
  return () => {
    canvasA.removeEventListener('click', handlerA);
    canvasB.removeEventListener('click', handlerB);
  };
}

// Wire the keyboard shortcuts. callbacks: {hint, mute, menu, confirm}.
export function bindKeys(callbacks) {
  const onKey = (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h' && callbacks.hint) callbacks.hint();
    else if (key === 'm' && callbacks.mute) callbacks.mute();
    else if (key === 'escape' && callbacks.menu) callbacks.menu();
    else if ((key === 'enter' || key === ' ') && callbacks.confirm) {
      event.preventDefault();
      callbacks.confirm();
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
