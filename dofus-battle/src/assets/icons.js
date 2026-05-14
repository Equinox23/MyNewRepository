// Icones de sorts 64x64. Generees en SVG, chargees comme textures Phaser.
// Chaque icone a un cadre stylise (style HUD Dofus) + un glyphe representant
// l effet du sort.

function frame(color, darkColor, content) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="2" y="2" width="60" height="60" rx="10" fill="${color}" stroke="${darkColor}" stroke-width="2"/>
  <rect x="4" y="4" width="56" height="28" rx="6" fill="#ffffff" opacity="0.18"/>
  <rect x="6" y="6" width="52" height="3" rx="1" fill="#ffffff" opacity="0.45"/>
  ${content}
  <rect x="2" y="2" width="60" height="60" rx="10" fill="none" stroke="#000000" stroke-width="1" opacity="0.4"/>
</svg>`.trim();
}

const SWORD = `
  <g transform="translate(32 36) rotate(-30)">
    <rect x="-2" y="-22" width="4" height="32" fill="#e8eef2" stroke="#2c3e50" stroke-width="1"/>
    <rect x="-6" y="8" width="12" height="3" fill="#8a6d3b" stroke="#2c1a08" stroke-width="0.5"/>
    <polygon points="-2,-22 2,-22 0,-28" fill="#e8eef2" stroke="#2c3e50" stroke-width="1"/>
  </g>`;

const GREAT_SWORD = `
  <g transform="translate(32 36) rotate(-30)">
    <rect x="-3" y="-24" width="6" height="36" fill="#fff8dc" stroke="#7a5d0a" stroke-width="1.2"/>
    <rect x="-8" y="10" width="16" height="4" fill="#7a5d0a"/>
    <polygon points="-3,-24 3,-24 0,-32" fill="#ffeb99" stroke="#7a5d0a" stroke-width="1.2"/>
    <circle cx="0" cy="-6" r="2" fill="#fffac8"/>
  </g>`;

const ARROW_UP = `
  <g transform="translate(32 36)">
    <line x1="0" y1="14" x2="0" y2="-16" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <polygon points="-8,-8 0,-18 8,-8" fill="#ffffff" stroke="#222" stroke-width="0.8"/>
    <line x1="-10" y1="14" x2="10" y2="14" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;

const FIST = `
  <g transform="translate(32 36)">
    <ellipse cx="0" cy="0" rx="14" ry="11" fill="#f4d3a5" stroke="#2c1a08" stroke-width="1.5"/>
    <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#2c1a08" stroke-width="1.5"/>
    <line x1="-9" y1="2" x2="9" y2="2" stroke="#2c1a08" stroke-width="1.5"/>
    <line x1="-8" y1="8" x2="8" y2="8" stroke="#2c1a08" stroke-width="1.5"/>
  </g>`;

const BOW_ARROW = `
  <g transform="translate(32 36)">
    <path d="M-14 -14 Q-20 0 -14 14" stroke="#8a6d3b" stroke-width="2.5" fill="none"/>
    <line x1="-14" y1="-14" x2="-14" y2="14" stroke="#dcdcdc" stroke-width="0.8"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="#8a6d3b" stroke-width="2"/>
    <polygon points="14,-4 22,0 14,4" fill="#8a6d3b" stroke="#3a2a14" stroke-width="0.8"/>
  </g>`;

const ARROW_PUSH = `
  <g transform="translate(32 36)">
    <line x1="-14" y1="0" x2="10" y2="0" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="10,-7 20,0 10,7" fill="#ffffff" stroke="#222" stroke-width="0.8"/>
    <line x1="-14" y1="-8" x2="-22" y2="-8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <line x1="-14" y1="8" x2="-22" y2="8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </g>`;

const ARROW_LONG = `
  <g transform="translate(32 36)">
    <line x1="-20" y1="0" x2="14" y2="0" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="14,-5 22,0 14,5" fill="#ffffff" stroke="#222" stroke-width="0.8"/>
    <polygon points="-20,-3 -16,0 -20,3" fill="#ffffff"/>
  </g>`;

const ARROW_HEART = `
  <g transform="translate(32 36)">
    <line x1="-12" y1="6" x2="6" y2="-12" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="6,-12 14,-12 8,-4" fill="#ffffff"/>
    <path d="M-4 8 Q-10 14 -16 8 Q-22 0 -12 -2 Q-4 -6 -4 8 Z" fill="#ff5577" stroke="#990033" stroke-width="0.8" transform="rotate(45 -10 4)"/>
  </g>`;

const HEAL_CROSS = `
  <g transform="translate(32 36)">
    <rect x="-4" y="-14" width="8" height="28" rx="2" fill="#ffffff" stroke="#1a5a3a" stroke-width="1.2"/>
    <rect x="-14" y="-4" width="28" height="8" rx="2" fill="#ffffff" stroke="#1a5a3a" stroke-width="1.2"/>
  </g>`;

const HEART = `
  <g transform="translate(32 36)">
    <path d="M0 14 Q-18 -2 -10 -12 Q-4 -16 0 -8 Q4 -16 10 -12 Q18 -2 0 14 Z" fill="#ff5577" stroke="#990033" stroke-width="1.4"/>
  </g>`;

const PLUS = `
  <g transform="translate(32 36)">
    <rect x="-3" y="-14" width="6" height="28" rx="2" fill="#ffffff"/>
    <rect x="-14" y="-3" width="28" height="6" rx="2" fill="#ffffff"/>
  </g>`;

const DROPLET = `
  <g transform="translate(32 36)">
    <path d="M0 -16 Q-12 0 -8 10 Q-4 18 0 18 Q4 18 8 10 Q12 0 0 -16 Z" fill="#9b59b6" stroke="#4a235a" stroke-width="1.5"/>
    <ellipse cx="-3" cy="2" rx="3" ry="6" fill="#ffffff" opacity="0.5"/>
  </g>`;

const SKULL = `
  <g transform="translate(32 36)">
    <ellipse cx="0" cy="-2" rx="12" ry="11" fill="#ecf0f1" stroke="#1a2530" stroke-width="1.4"/>
    <rect x="-8" y="8" width="16" height="6" rx="2" fill="#ecf0f1" stroke="#1a2530" stroke-width="1.4"/>
    <ellipse cx="-4" cy="-2" rx="3" ry="4" fill="#1a2530"/>
    <ellipse cx="4" cy="-2" rx="3" ry="4" fill="#1a2530"/>
    <rect x="-1" y="6" width="2" height="6" fill="#1a2530"/>
    <line x1="-4" y1="10" x2="-4" y2="14" stroke="#1a2530" stroke-width="1"/>
    <line x1="4" y1="10" x2="4" y2="14" stroke="#1a2530" stroke-width="1"/>
  </g>`;

const TRAP = `
  <g transform="translate(32 36)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="#888" stroke-width="2"/>
    <circle cx="0" cy="0" r="4" fill="#e74c3c" stroke="#7c1f17" stroke-width="1"/>
    <line x1="-14" y1="-14" x2="-6" y2="-6" stroke="#888" stroke-width="2.5"/>
    <line x1="14" y1="-14" x2="6" y2="-6" stroke="#888" stroke-width="2.5"/>
    <line x1="-14" y1="14" x2="-6" y2="6" stroke="#888" stroke-width="2.5"/>
    <line x1="14" y1="14" x2="6" y2="6" stroke="#888" stroke-width="2.5"/>
  </g>`;

const EYE = `
  <g transform="translate(32 36)">
    <ellipse cx="0" cy="0" rx="16" ry="9" fill="#ffffff" stroke="#1a2530" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="6" fill="#3498db" stroke="#1a2530" stroke-width="1.2"/>
    <circle cx="0" cy="0" r="3" fill="#1a2530"/>
    <circle cx="-2" cy="-2" r="1" fill="#ffffff"/>
  </g>`;

const BOOT = `
  <g transform="translate(32 36) rotate(-15)">
    <path d="M-6 -14 L-2 -14 L-2 6 L14 6 L14 12 L-6 12 Z" fill="#5a3a1a" stroke="#1a0d05" stroke-width="1.5"/>
    <rect x="-2" y="-12" width="4" height="3" fill="#3a2310"/>
  </g>`;

const THORN = `
  <g transform="translate(32 36)">
    <line x1="0" y1="14" x2="0" y2="-14" stroke="#27ae60" stroke-width="3" stroke-linecap="round"/>
    <polygon points="0,-14 -6,-8 0,-10" fill="#27ae60"/>
    <polygon points="0,-2 -8,-4 -2,2" fill="#27ae60"/>
    <polygon points="0,6 8,4 2,10" fill="#27ae60"/>
    <polygon points="0,-14 6,-8 0,-10" fill="#16a085"/>
  </g>`;

const POISON = `
  <g transform="translate(32 36)">
    <path d="M0 -18 Q-12 -2 -8 8 Q-4 16 0 16 Q4 16 8 8 Q12 -2 0 -18 Z" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
    <circle cx="-2" cy="0" r="2" fill="#000" opacity="0.6"/>
    <circle cx="3" cy="-4" r="1" fill="#000" opacity="0.6"/>
    <circle cx="4" cy="4" r="1.5" fill="#000" opacity="0.6"/>
  </g>`;

const THORNS_CROSS = `
  <g transform="translate(32 36)">
    <line x1="-14" y1="0" x2="14" y2="0" stroke="#16a085" stroke-width="2.5"/>
    <line x1="0" y1="-14" x2="0" y2="14" stroke="#16a085" stroke-width="2.5"/>
    <polygon points="-14,0 -10,-2 -10,2" fill="#16a085"/>
    <polygon points="14,0 10,-2 10,2" fill="#16a085"/>
    <polygon points="0,-14 -2,-10 2,-10" fill="#16a085"/>
    <polygon points="0,14 -2,10 2,10" fill="#16a085"/>
    <circle cx="0" cy="0" r="3" fill="#0d6b59"/>
  </g>`;

const TREE = `
  <g transform="translate(32 36)">
    <rect x="-3" y="2" width="6" height="14" fill="#5a3a1a" stroke="#2c1a08" stroke-width="1"/>
    <ellipse cx="0" cy="-4" rx="14" ry="10" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
    <ellipse cx="-6" cy="-2" rx="4" ry="3" fill="#2ecc71" opacity="0.6"/>
    <ellipse cx="6" cy="-6" rx="4" ry="3" fill="#2ecc71" opacity="0.6"/>
  </g>`;

const LIGHTNING = `
  <g transform="translate(32 36)">
    <polygon points="-2,-16 -8,2 -2,2 -6,16 8,-2 2,-2 6,-16" fill="#fffac8" stroke="#7a5d0a" stroke-width="1.5"/>
  </g>`;

const HORN = `
  <g transform="translate(32 36)">
    <path d="M-10 8 Q-18 -6 -4 -14 Q-2 -4 -6 10 Z" fill="#ecf0f1" stroke="#2c1a08" stroke-width="1.5"/>
    <path d="M10 8 Q18 -6 4 -14 Q2 -4 6 10 Z" fill="#ecf0f1" stroke="#2c1a08" stroke-width="1.5"/>
    <ellipse cx="0" cy="8" rx="10" ry="6" fill="#3a2a14"/>
  </g>`;

const CHARGE = `
  <g transform="translate(32 36)">
    <path d="M-16 4 Q-10 -8 4 -8 L4 -16 L20 -2 L4 12 L4 4 Q-4 6 -10 12 Z" fill="#ffffff" stroke="#2c1a08" stroke-width="1.5"/>
  </g>`;

const BEAK = `
  <g transform="translate(32 36)">
    <path d="M-10 -8 Q0 10 14 -8 Q10 6 0 6 Q-8 4 -10 -8 Z" fill="#f39c12" stroke="#7a4f0a" stroke-width="1.5"/>
    <line x1="0" y1="-8" x2="0" y2="6" stroke="#7a4f0a" stroke-width="1"/>
    <circle cx="-10" cy="-12" r="1.5" fill="#fff"/>
    <circle cx="10" cy="-12" r="1.5" fill="#fff"/>
  </g>`;

const WIND = `
  <g transform="translate(32 36)" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M-18 -8 Q-4 -10 0 -4 Q4 -10 18 -8 Q14 -2 0 -2"/>
    <path d="M-18 2 Q-4 0 4 6 Q-8 8 -18 6" stroke-width="2.5"/>
    <path d="M-16 12 Q0 10 12 14" stroke-width="2"/>
  </g>`;

const SOUND_WAVES = `
  <g transform="translate(32 36)" fill="none" stroke-linecap="round">
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
    <path d="M-10 -10 Q-14 0 -10 10" stroke="#ffffff" stroke-width="2.5"/>
    <path d="M10 -10 Q14 0 10 10" stroke="#ffffff" stroke-width="2.5"/>
    <path d="M-16 -16 Q-22 0 -16 16" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    <path d="M16 -16 Q22 0 16 16" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  </g>`;

const ROCK = `
  <g transform="translate(32 36)">
    <polygon points="-12,8 -8,-10 6,-12 14,-2 10,12" fill="#a98660" stroke="#2c1a08" stroke-width="1.8"/>
    <line x1="-6" y1="-4" x2="2" y2="4" stroke="#2c1a08" stroke-width="1"/>
    <line x1="4" y1="-8" x2="8" y2="-2" stroke="#2c1a08" stroke-width="1"/>
    <line x1="-4" y1="4" x2="4" y2="8" stroke="#2c1a08" stroke-width="1"/>
  </g>`;

const SHAKE = `
  <g transform="translate(32 36)" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round">
    <path d="M-18 -2 L-10 -8 L-2 -2 L6 -8 L14 -2"/>
    <path d="M-18 8 L-10 2 L-2 8 L6 2 L14 8"/>
    <line x1="-20" y1="-12" x2="-16" y2="-12" stroke-width="2"/>
    <line x1="16" y1="-12" x2="20" y2="-12" stroke-width="2"/>
    <line x1="-20" y1="14" x2="-16" y2="14" stroke-width="2"/>
    <line x1="16" y1="14" x2="20" y2="14" stroke-width="2"/>
  </g>`;

const STONE_SHIELD = `
  <g transform="translate(32 36)">
    <path d="M-14 -14 L14 -14 L14 4 Q14 14 0 18 Q-14 14 -14 4 Z" fill="#a98660" stroke="#2c1a08" stroke-width="2"/>
    <line x1="0" y1="-14" x2="0" y2="18" stroke="#2c1a08" stroke-width="1.2"/>
    <line x1="-14" y1="-2" x2="14" y2="-2" stroke="#2c1a08" stroke-width="1.2"/>
    <path d="M-6 -10 L-4 -2" stroke="#2c1a08" stroke-width="1"/>
    <path d="M6 -10 L4 -2" stroke="#2c1a08" stroke-width="1"/>
  </g>`;

const FLAME = `
  <g transform="translate(32 36)">
    <path d="M0 16 Q-12 12 -10 0 Q-8 -8 -4 -8 Q-2 0 0 -4 Q2 -10 6 -16 Q12 -8 10 0 Q8 12 0 16 Z" fill="#e74c3c" stroke="#7a1a10" stroke-width="1.5"/>
    <path d="M0 12 Q-4 10 -4 4 Q-2 -2 2 -4 Q6 4 0 12 Z" fill="#f39c12"/>
    <ellipse cx="0" cy="8" rx="2" ry="3" fill="#fffac8" opacity="0.8"/>
  </g>`;

const BIG_FLAME = `
  <g transform="translate(32 36)">
    <path d="M-14 4 Q-12 -8 -2 -10 Q4 -16 8 -4 Q12 -8 10 4 Q14 -2 14 8 Q12 16 0 18 Q-12 16 -14 4 Z" fill="#e74c3c" stroke="#7a1a10" stroke-width="1.5"/>
    <path d="M-6 4 Q-4 -4 4 -6 Q8 0 4 8 Q-2 12 -6 4 Z" fill="#f39c12"/>
    <path d="M-2 6 Q0 0 4 2 Q4 8 -2 6 Z" fill="#fffac8"/>
    <circle cx="-12" cy="0" r="2" fill="#f39c12" opacity="0.6"/>
    <circle cx="12" cy="-2" r="2" fill="#f39c12" opacity="0.6"/>
  </g>`;

const SHELL_SHIELD = `
  <g transform="translate(32 36)">
    <path d="M-14 0 Q-14 -14 0 -14 Q14 -14 14 0 Q14 14 0 14 Q-14 14 -14 0 Z" fill="#bb8fce" stroke="#2c1a08" stroke-width="2"/>
    <line x1="0" y1="-14" x2="0" y2="14" stroke="#2c1a08" stroke-width="1.5"/>
    <path d="M-10 -8 Q-12 0 -10 8" stroke="#2c1a08" stroke-width="1.2" fill="none"/>
    <path d="M10 -8 Q12 0 10 8" stroke="#2c1a08" stroke-width="1.2" fill="none"/>
    <ellipse cx="-6" cy="-4" rx="3" ry="2" fill="#d2b4de"/>
    <ellipse cx="6" cy="-4" rx="3" ry="2" fill="#d2b4de"/>
  </g>`;

const DIRT_HOOF = `
  <g transform="translate(32 36)">
    <path d="M-10 12 L-12 -8 L0 -10 L12 -8 L10 12 Z" fill="#3a2a14" stroke="#1a0d05" stroke-width="1.5"/>
    <line x1="-2" y1="-10" x2="-2" y2="12" stroke="#1a0d05" stroke-width="1.5"/>
    <circle cx="-12" cy="14" r="3" fill="#27ae60" opacity="0.8"/>
    <circle cx="-6" cy="16" r="2" fill="#27ae60" opacity="0.6"/>
    <circle cx="0" cy="14" r="3" fill="#27ae60" opacity="0.8"/>
    <circle cx="6" cy="16" r="2" fill="#27ae60" opacity="0.6"/>
    <circle cx="12" cy="14" r="3" fill="#27ae60" opacity="0.8"/>
  </g>`;

// Couleurs darkenees par defaut
const PAIRS = {
  red:    ['#e74c3c', '#7c1f17'],
  orange: ['#e67e22', '#7a3f0e'],
  gold:   ['#f1c40f', '#7a5d0a'],
  purple: ['#9b59b6', '#4a235a'],
  blue:   ['#3498db', '#1a4d6e'],
  teal:   ['#1abc9c', '#0d6b59'],
  green:  ['#27ae60', '#155a32'],
  pink:   ['#e91e63', '#5c0a2a'],
  grey:   ['#7f8c8d', '#2c3a3b'],
  darkgrey: ['#34495e', '#0a1015'],
  brown:  ['#8b5a2b', '#3a2a14'],
};

function withPair(p, glyph) { return frame(p[0], p[1], glyph); }

export const SPELL_ICONS = {
  // IOP
  pression:        withPair(PAIRS.red,      SWORD),
  bond:            withPair(PAIRS.orange,   ARROW_UP),
  epeeDivine:      withPair(PAIRS.gold,     GREAT_SWORD),
  concentration:   withPair(PAIRS.purple,   FIST),
  // CRA
  flecheMagique:   withPair(PAIRS.teal,     BOW_ARROW),
  flecheRepoussante: withPair(PAIRS.blue,   ARROW_PUSH),
  flechePunitive:  withPair(PAIRS.teal,     ARROW_LONG),
  flecheSoigneuse: withPair(PAIRS.green,    ARROW_HEART),
  // ENIRIPSA
  motBlessant:     withPair(PAIRS.purple,   LIGHTNING),
  motCuratif:      withPair(PAIRS.green,    HEAL_CROSS),
  motStimulant:    withPair(PAIRS.green,    PLUS),
  motDrainant:     withPair(PAIRS.purple,   DROPLET),
  // SRAM
  attaqueMortelle: withPair(PAIRS.grey,     SKULL),
  piegeSournois:   withPair(PAIRS.darkgrey, TRAP),
  invisibilite:    withPair(PAIRS.darkgrey, EYE),
  coupBas:         withPair(PAIRS.grey,     BOOT),
  // SADIDA
  ronce:           withPair(PAIRS.green,    THORN),
  poisonParalysant:withPair(PAIRS.purple,   POISON),
  ronceMultiple:   withPair(PAIRS.teal,     THORNS_CROSS),
  arbreVivant:     withPair(PAIRS.green,    TREE),

  // CREATURES : BOUFTOU
  coupDeCorne:     withPair(PAIRS.gold,     HORN),
  charge:          withPair(PAIRS.orange,   CHARGE),
  chargeRoyale:    withPair(PAIRS.gold,     CHARGE),
  piedsSales:      withPair(PAIRS.brown,    DIRT_HOOF),

  // CREATURES : TOFU
  coupDeBec:       withPair(PAIRS.grey,     BEAK),
  tornade:         withPair(PAIRS.blue,     WIND),
  cri:             withPair(PAIRS.gold,     SOUND_WAVES),

  // CREATURES : CRAQUELEUR
  eclatDePierre:   withPair(PAIRS.brown,    ROCK),
  tremblement:     withPair(PAIRS.brown,    SHAKE),
  armurePierre:    withPair(PAIRS.brown,    STONE_SHIELD),

  // CREATURES : SCARA
  souffleFeu:      withPair(PAIRS.red,      FLAME),
  souffleXxl:      withPair(PAIRS.red,      BIG_FLAME),
  carapace:        withPair(PAIRS.purple,   SHELL_SHIELD),
};
