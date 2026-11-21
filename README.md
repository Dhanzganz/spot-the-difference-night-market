# Spot the Difference — Night Market Mysteries

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Dhanzganz/spot-the-difference-night-market/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Dhanzganz/spot-the-difference-night-market/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Built for the [make.fun bounty "Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

A complete, original spot-the-difference game that runs offline in a desktop
browser from static files — no network requests, no libraries, no build step.

## The game

Two near-identical pictures hang side by side. They look the same — they are
not. Click a difference on either picture to ring it in green; several stay
hidden until you find them, and the counter up top always shows how many
remain.

**Five original scenes, rising difficulty:**

| # | Scene | Differences | Time |
|---|-------|-------------|------|
| 1 | Night Market | 7 | 2:00 |
| 2 | Lighthouse Cove | 7 | 1:50 |
| 3 | Robot Workshop | 8 | 1:40 |
| 4 | Midnight Library | 8 | 1:40 |
| 5 | Lantern Festival | 9 | 1:30 |

**How it plays**

- Click a difference on either panel — fast finds build a combo worth more
  points (100 base, +25 per combo step).
- A wrong click costs 25 points and 3 seconds, and resets the combo.
- Press **H** (or the Hint button) to reveal one difference — limited hints
  per scene, 50 points each.
- Clearing a scene pays a time bonus of 5 points per second left.
- Finish all five scenes for a star rating and a final score.

**Feel and polish**

- Every picture is drawn procedurally on canvas — original art, no copied
  assets: lanterns, a smug market cat, a lighthouse beam, a robot with
  opinions, a sleeping owl, sky lanterns over a koi pond.
- All sounds are synthesized live with the Web Audio API (find chime, wrong
  buzz, hint pluck, clear fanfare) — no audio files. Press **M** to mute.
- Keyboard: **H** hint, **M** mute, **Esc** menu, **Enter** start.

## Play it

```sh
# serve game/ with any static server, then open it in desktop Chrome
python3 -m http.server 8080 --directory game
# → http://localhost:8080/
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/ holds game/, screenshots/ and dossier.json
```

## Layout

- `main.ts` — the hand-in program (Node 22 stdlib only): copies `game/` and
  `screenshots/` to `/output` and writes `dossier.json` via
  `vendor/makefun-game.ts`.
- `game/index.html` — page shell: HUD, two panels, overlays.
- `game/style.css` — warm dusk theme, responsive panels.
- `game/src/main.js` — game core: state machine, scoring, timer, markers.
- `game/src/scenes.js` — the five scenes and their 39 differences.
- `game/src/painter.js` — procedural canvas art for both panels.
- `game/src/audio.js` — synthesized WebAudio sound effects.
- `game/src/input.js` — mouse and keyboard handling.
- `game/src/shots.js` — deterministic demo states for the screenshots
  (`?shot=cover`, `?shot=workshop`, `?shot=title`, `?shot=end`).
- `screenshots/` — real renders of the game in a browser.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE).
