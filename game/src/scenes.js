// Spot the Difference — scene data: five original hand-drawn scenes.
// Each difference is a circle {x, y, r} in the 560x400 panel space, with a
// short label the hint system reads aloud. Difficulty rises scene by scene.
export const PANEL_W = 560;
export const PANEL_H = 400;

export const SCENES = [
  {
    id: 'market',
    name: 'Night Market',
    emoji: '\u{1F3EE}',
    blurb: 'Lanterns, sizzling stalls and one very smug cat.',
    timeLimit: 120,
    hints: 3,
    diffs: [
      { id: 'moon',     x: 482, y: 52,  r: 30, label: 'the moon above the rooftops' },
      { id: 'lantern',  x: 288, y: 96,  r: 22, label: 'the middle paper lantern' },
      { id: 'catTail',  x: 118, y: 318, r: 24, label: 'the cat by the fruit crate' },
      { id: 'apple',    x: 408, y: 300, r: 20, label: 'the apples in the crate' },
      { id: 'sign',     x: 268, y: 178, r: 26, label: 'the wooden stall sign' },
      { id: 'star',     x: 96,  y: 44,  r: 16, label: 'a star in the night sky' },
      { id: 'jar',      x: 196, y: 292, r: 20, label: 'the pickle jar on the counter' },
    ],
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse Cove',
    emoji: '\u{1F5FC}',
    blurb: 'A quiet cove, a working light, and gulls that cannot sit still.',
    timeLimit: 110,
    hints: 3,
    diffs: [
      { id: 'beam',     x: 214, y: 130, r: 30, label: 'the lighthouse beam' },
      { id: 'gull',     x: 392, y: 78,  r: 18, label: 'a gull over the bay' },
      { id: 'flag',     x: 152, y: 66,  r: 18, label: 'the flag on the lighthouse' },
      { id: 'buoy',     x: 448, y: 318, r: 20, label: 'the striped buoy' },
      { id: 'cloud',    x: 84,  y: 92,  r: 24, label: 'a cloud near the horizon' },
      { id: 'fish',     x: 330, y: 330, r: 20, label: 'the jumping fish' },
      { id: 'window',   x: 158, y: 190, r: 16, label: 'the lighthouse window' },
    ],
  },
  {
    id: 'workshop',
    name: 'Robot Workshop',
    emoji: '\u{1F916}',
    blurb: 'Bolts, gears and one robot who keeps changing his mind.',
    timeLimit: 100,
    hints: 3,
    diffs: [
      { id: 'eye',      x: 268, y: 168, r: 20, label: "the robot's glowing eye" },
      { id: 'gear',     x: 96,  y: 96,  r: 28, label: 'the big gear on the wall' },
      { id: 'lamp',     x: 452, y: 118, r: 24, label: 'the desk lamp' },
      { id: 'poster',   x: 428, y: 216, r: 26, label: 'the poster on the wall' },
      { id: 'jar',      x: 148, y: 268, r: 18, label: 'a jar on the shelf' },
      { id: 'wrench',   x: 330, y: 300, r: 20, label: 'the wrench on the bench' },
      { id: 'antenna',  x: 268, y: 108, r: 16, label: "the robot's antenna" },
      { id: 'cable',    x: 196, y: 340, r: 18, label: 'the cable on the floor' },
    ],
  },
  {
    id: 'library',
    name: 'Midnight Library',
    emoji: '\u{1F989}',
    blurb: 'Dusty shelves, a sleeping owl, and books that move when unobserved.',
    timeLimit: 100,
    hints: 2,
    diffs: [
      { id: 'owlEyes',  x: 420, y: 120, r: 24, label: "the owl's eyes" },
      { id: 'candle',   x: 268, y: 300, r: 22, label: 'the candle flame' },
      { id: 'spine',    x: 120, y: 168, r: 18, label: 'a book spine on the top shelf' },
      { id: 'globe',    x: 96,  y: 300, r: 26, label: 'the brass globe' },
      { id: 'rug',      x: 300, y: 368, r: 22, label: 'the pattern on the rug' },
      { id: 'rung',     x: 196, y: 240, r: 16, label: 'a rung of the rolling ladder' },
      { id: 'teacup',   x: 356, y: 292, r: 18, label: 'the teacup on the desk' },
      { id: 'star',     x: 500, y: 60,  r: 14, label: 'a star outside the window' },
    ],
  },
  {
    id: 'festival',
    name: 'Lantern Festival',
    emoji: '\u{1F3EE}',
    blurb: 'Sky lanterns, koi and fireworks over the old bridge.',
    timeLimit: 90,
    hints: 2,
    diffs: [
      { id: 'lantern',  x: 372, y: 96,  r: 22, label: 'a sky lantern' },
      { id: 'koi',      x: 300, y: 348, r: 20, label: 'a koi in the pond' },
      { id: 'firework', x: 96,  y: 84,  r: 28, label: 'the firework burst' },
      { id: 'roof',     x: 452, y: 190, r: 24, label: 'the pagoda roof' },
      { id: 'blossom',  x: 76,  y: 210, r: 22, label: 'the blossom on the tree' },
      { id: 'moon',     x: 500, y: 52,  r: 26, label: 'the festival moon' },
      { id: 'plank',    x: 268, y: 300, r: 18, label: 'a plank of the bridge' },
      { id: 'star',     x: 210, y: 48,  r: 14, label: 'a star in the festival sky' },
      { id: 'string',   x: 160, y: 130, r: 18, label: 'a bulb on the string lights' },
    ],
  },
];

// Total differences across the whole game, for the end screen.
export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);
}

// Score for finishing a scene: base per find plus the seconds left times five.
export function levelClearBonus(secondsLeft) {
  return Math.max(0, Math.round(secondsLeft)) * 5;
}
