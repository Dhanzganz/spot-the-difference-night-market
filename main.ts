// Spot the Difference — entry hand-in (Node 22, standard library only).
// Copies this repository's game/ and screenshots/ into the output directory
// (/output in the grader, or $MAKEFUN_OUTPUT_DIR outside it) and writes
// /output/dossier.json with the kit's buildDossier library, so the sealed
// scorer can verify the game, its screenshots and the dossier byte for byte.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');

// Start from a clean output directory so a stale file can never leak in.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// The playable game, plain static files, exactly as it sits in the repo.
cpSync(gameDir, join(outDir, 'game'), { recursive: true });

// The screenshots, first by name is the cover.
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
}

// The dossier the judge reads: byte for byte what buildDossier writes from
// the files above, under the scorer's caps for this competition.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
