import { paintedSpellIcon } from './SpellIcons.js';
import { ELEMENT_LABEL, damageElementOf } from './Elements.js';
// Registre central des sorts. Chaque sort a son propre dessin SVG (icon),
// sa couleur de categorie (rouge = attaque, rose = soin, jaune = boost,
// vert = deplacement), et ses effets composables.
//
// Types d effets :
//  - 'damage'         { min, max }
//  - 'heal'           { min, max }
//  - 'heal_percent'   { percent }  -> % des PV max de la cible
//  - 'teleport'       deplace le caster
//  - 'buff'           { duration, damageMult?, bonusPa?, bonusPm?, shield? }
//  - 'summon'         { creatureId }
//  - 'debuff_pm'      { value }  -> retire N PM a la cible
//  - 'debuff_pa'      { value | min,max, chance?, turns?, steal? }
//  - 'knockback'      { distance }  -> repousse la cible en ligne droite
//  - 'chanceStrike'   { dmgMin,dmgMax, healMin,healMax }  -> 50% degats / 50% soin
//  - 'gainPa'         { amount, nextTurnPenalty? }  -> +PA ce tour, -PA au suivant
//
// Aire : { type: 'single' } | { type: 'line', length } | { type: 'cross', size }.
// Cooldown : nombre de tours entre deux casts (decremente au debut du
// tour du caster).

const ICON_SWORD = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(16 16) rotate(-30)">
      <line x1="0" y1="-13" x2="0" y2="8"/>
      <polygon points="-2,-13 0,-17 2,-13" fill="currentColor"/>
      <line x1="-5" y1="9" x2="5" y2="9"/>
      <line x1="0" y1="9" x2="0" y2="13"/>
    </g>
  </svg>`;

const ICON_JUMP = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="16" y1="26" x2="16" y2="9"/>
    <polyline points="9,15 16,7 23,15"/>
    <path d="M6 28 Q16 22 26 28" stroke-dasharray="2 2"/>
  </svg>`;

const ICON_LINE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(16 16) rotate(-30)">
      <line x1="0" y1="-15" x2="0" y2="13"/>
      <polygon points="-3,-15 0,-19 3,-15" fill="currentColor"/>
      <line x1="-7" y1="-15" x2="7" y2="-15"/>
      <line x1="-5" y1="13" x2="5" y2="13"/>
    </g>
    <line x1="6" y1="6" x2="26" y2="6" stroke-dasharray="2 2" opacity="0.6"/>
    <line x1="6" y1="26" x2="26" y2="26" stroke-dasharray="2 2" opacity="0.6"/>
  </svg>`;

const ICON_FIST = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="16" rx="7" ry="6"/>
    <line x1="10" y1="14" x2="22" y2="14"/>
    <line x1="11" y1="17.5" x2="21" y2="17.5"/>
    <line x1="16" y1="6" x2="16" y2="3"/>
    <line x1="16" y1="26" x2="16" y2="29"/>
    <line x1="6" y1="16" x2="3" y2="16"/>
    <line x1="26" y1="16" x2="29" y2="16"/>
    <line x1="8" y1="8" x2="6" y2="6"/>
    <line x1="24" y1="8" x2="26" y2="6"/>
    <line x1="8" y1="24" x2="6" y2="26"/>
    <line x1="24" y1="24" x2="26" y2="26"/>
  </svg>`;

const ICON_BITE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="7" x2="28" y2="7"/>
    <polygon points="8 7, 14 22, 11 7" fill="currentColor"/>
    <polygon points="24 7, 18 22, 21 7" fill="currentColor"/>
  </svg>`;

const ICON_BITE_ROYAL = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="11" x2="28" y2="11"/>
    <polygon points="7 11, 13 26, 10 11" fill="currentColor"/>
    <polygon points="25 11, 19 26, 22 11" fill="currentColor"/>
    <path d="M10 6 L12 2 L16 5 L20 2 L22 6 Z" fill="currentColor"/>
  </svg>`;

const ICON_HEAL_CROSS = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <path d="M16 27 C2 16 4 6 12 6 C14 6 16 8 16 10 C16 8 18 6 20 6 C28 6 30 16 16 27 Z" fill="currentColor"/>
    <line x1="16" y1="12" x2="16" y2="22" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <line x1="11" y1="17" x2="21" y2="17" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

const ICON_SUMMON = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="26" rx="10" ry="3" stroke-dasharray="2 2"/>
    <polygon points="16 6, 22 22, 10 22" fill="currentColor"/>
    <circle cx="16" cy="13" r="3" fill="#fff"/>
    <line x1="6" y1="6" x2="9" y2="9"/>
    <line x1="26" y1="6" x2="23" y2="9"/>
    <circle cx="6" cy="14" r="1" fill="currentColor"/>
    <circle cx="26" cy="14" r="1" fill="currentColor"/>
  </svg>`;

const ICON_BOOST = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="8 18, 16 8, 24 18"/>
    <polyline points="8 24, 16 14, 24 24"/>
    <circle cx="16" cy="26" r="2" fill="currentColor"/>
  </svg>`;

const ICON_SHIELD = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <path d="M16 4 L26 8 L26 16 Q26 24 16 28 Q6 24 6 16 L6 8 Z" fill="currentColor"/>
    <path d="M11 16 L15 20 L22 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`;

const ICON_ROCK_THROW = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="14 12, 9 18, 14 24, 22 22, 23 14, 18 10" fill="currentColor"/>
    <line x1="3" y1="6" x2="9" y2="10" stroke-dasharray="2 2"/>
    <line x1="3" y1="12" x2="8" y2="14" stroke-dasharray="2 2"/>
  </svg>`;

const ICON_CROSS_PUNCH = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="13" y="8" width="6" height="6" fill="currentColor"/>
    <rect x="13" y="18" width="6" height="6" fill="currentColor"/>
    <rect x="8" y="13" width="6" height="6" fill="currentColor"/>
    <rect x="18" y="13" width="6" height="6" fill="currentColor"/>
    <rect x="13" y="13" width="6" height="6" fill="currentColor"/>
  </svg>`;

const ICON_SPIT = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="22" cy="22" rx="5" ry="3" fill="currentColor" transform="rotate(-30 22 22)"/>
    <line x1="3" y1="6" x2="9" y2="9" stroke-dasharray="2 2"/>
    <line x1="5" y1="14" x2="11" y2="15" stroke-dasharray="2 2"/>
    <line x1="3" y1="22" x2="9" y2="20" stroke-dasharray="2 2"/>
    <circle cx="14" cy="16" r="2" fill="currentColor" opacity="0.6"/>
  </svg>`;

const ICON_POISON_SPIT = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 4 Q22 10 22 16 Q22 24 16 28 Q10 24 10 16 Q10 10 16 4 Z" fill="currentColor"/>
    <circle cx="14" cy="14" r="2" fill="#fff" opacity="0.6"/>
    <circle cx="18" cy="20" r="1.5" fill="#fff" opacity="0.6"/>
    <circle cx="13" cy="22" r="1" fill="#fff" opacity="0.5"/>
  </svg>`;

const ICON_BOMB = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="15" cy="20" r="8" fill="currentColor"/>
    <rect x="14" y="11" width="2.5" height="2.5" fill="currentColor"/>
    <line x1="16" y1="11" x2="22" y2="5"/>
    <polygon points="22 5, 27 4, 24 9" fill="currentColor"/>
    <circle cx="12" cy="18" r="1.2" fill="#fff"/>
  </svg>`;

const ICON_BOMB_MOVE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="22" r="6" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="2" fill="currentColor"/>
    <line x1="12" y1="15" x2="15" y2="11"/>
    <polygon points="16 5, 28 5, 22 11" fill="currentColor"/>
    <polygon points="22 17, 28 17, 28 23" fill="currentColor"/>
    <line x1="14" y1="14" x2="26" y2="6" stroke-dasharray="2 2"/>
  </svg>`;

const ICON_BOMB_SWAP = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="9" r="4" fill="currentColor"/>
    <line x1="9" y1="5" x2="11" y2="3"/>
    <circle cx="23" cy="23" r="5" fill="currentColor"/>
    <rect x="22" y="16" width="2" height="2" fill="currentColor"/>
    <line x1="23" y1="16" x2="26" y2="12"/>
    <path d="M14 9 Q22 9 22 17" stroke-dasharray="2 2"/>
    <polygon points="20 17, 22 21, 24 17" fill="currentColor"/>
    <path d="M18 23 Q10 23 10 15" stroke-dasharray="2 2"/>
    <polygon points="12 15, 10 11, 8 15" fill="currentColor"/>
  </svg>`;

const ICON_DETONATE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="16 2, 19 13, 30 16, 19 19, 16 30, 13 19, 2 16, 13 13" fill="currentColor"/>
    <circle cx="16" cy="16" r="3" fill="#fff"/>
  </svg>`;

const ICON_HOURGLASS = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="5" x2="24" y2="5"/>
    <line x1="8" y1="27" x2="24" y2="27"/>
    <path d="M9 5 Q9 14 16 16 Q23 14 23 5" fill="currentColor"/>
    <path d="M9 27 Q9 18 16 16 Q23 18 23 27" fill="currentColor"/>
  </svg>`;

const ICON_GEAR = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="16" r="5" fill="currentColor"/>
    <path d="M16 3 v4 M16 25 v4 M3 16 h4 M25 16 h4 M7 7 l3 3 M22 22 l3 3 M7 25 l3 -3 M22 10 l3 -3"/>
  </svg>`;

const ICON_COIN = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="16" r="11" fill="currentColor"/>
    <text x="16" y="22" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff" stroke="none">?</text>
  </svg>`;

const ICON_CLAW = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 4 Q12 18 10 28"/>
    <path d="M14 3 Q18 18 16 29"/>
    <path d="M22 4 Q24 18 23 28"/>
  </svg>`;

const ICON_FEATHER = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M26 5 Q8 9 7 27 Q22 24 26 5 Z" fill="currentColor"/>
    <line x1="7" y1="27" x2="17" y2="14" stroke="#fff"/>
  </svg>`;

const ICON_SPORE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="17" r="6" fill="currentColor"/>
    <circle cx="8" cy="8" r="3" fill="currentColor"/>
    <circle cx="25" cy="9" r="2.5" fill="currentColor"/>
    <circle cx="24" cy="24" r="2" fill="currentColor"/>
    <circle cx="7" cy="23" r="2.5" fill="currentColor"/>
  </svg>`;

const ICON_SPEAR = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="6" y1="26" x2="24" y2="8"/>
    <polygon points="24 8, 28 4, 27 11, 21 11" fill="currentColor"/>
    <line x1="4" y1="24" x2="9" y2="29"/>
  </svg>`;

const ICON_FLASK = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 11 H21 V25 Q21 28 15.5 28 Q10 28 10 25 Z" fill="currentColor"/>
    <path d="M21 14 H25 Q26 14 26 16 V19 Q26 21 24 21 H21"/>
    <path d="M11 11 Q13 6 16 9 Q19 6 21 11" fill="currentColor"/>
    <line x1="13" y1="17" x2="18" y2="17" stroke="#fff"/>
  </svg>`;

const ICON_BARREL = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 5 Q4 16 9 27 H23 Q28 16 23 5 Z" fill="currentColor"/>
    <line x1="6.5" y1="12" x2="25.5" y2="12" stroke="#fff" stroke-width="1.6"/>
    <line x1="6.5" y1="20" x2="25.5" y2="20" stroke="#fff" stroke-width="1.6"/>
    <line x1="16" y1="5" x2="16" y2="27" stroke="#fff" stroke-width="1.4" opacity="0.7"/>
  </svg>`;

const ICON_WAVE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 11 Q8 5 13 11 Q18 17 23 11 Q26 7 29 11"/>
    <path d="M3 19 Q8 13 13 19 Q18 25 23 19 Q26 15 29 19"/>
    <path d="M3 27 Q8 21 13 27 Q18 33 23 27"/>
  </svg>`;


const ICON_PULSAR = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
    <circle cx="16" cy="16" r="8" opacity="0.7"/>
    <circle cx="16" cy="16" r="13" opacity="0.4"/>
    <polyline points="24 8, 28 4, 24 4"/>
    <polyline points="8 24, 4 28, 8 28"/>
  </svg>`;

const ICON_HASTE = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="4 7, 4 25, 15 16" fill="currentColor"/>
    <polygon points="16 7, 16 25, 27 16" fill="currentColor"/>
  </svg>`;

const ICON_GHOST = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 27 V13 Q7 4 16 4 Q25 4 25 13 V27 L21 24 L18 27 L16 24 L14 27 L11 24 Z" fill="currentColor"/>
    <circle cx="12" cy="14" r="2" fill="#fff"/>
    <circle cx="20" cy="14" r="2" fill="#fff"/>
  </svg>`;

const ICON_KITTEN = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="7 4, 12 12, 4 12" fill="currentColor"/>
    <polygon points="25 4, 28 12, 20 12" fill="currentColor"/>
    <circle cx="16" cy="18" r="9" fill="currentColor"/>
    <circle cx="12" cy="16" r="1.5" fill="#fff"/>
    <circle cx="20" cy="16" r="1.5" fill="#fff"/>
    <line x1="6" y1="19" x2="11" y2="20" stroke="#fff"/>
    <line x1="26" y1="19" x2="21" y2="20" stroke="#fff"/>
  </svg>`;

// Couleurs canoniques par categorie.
export const SPELL_CATEGORY_COLOR = {
  attack: '#c0392b',
  heal:   '#e91e63',
  boost:  '#f1c40f',
  move:   '#27ae60',
  summon: '#8a5a2b',
};

export const SPELLS = {
  // ---------- IOP ----------
  pression: {
    id: 'pression', name: 'Pression', short: 'PR', icon: ICON_SWORD,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 2 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 28, max: 42 }],
    desc: 'Le coup de base du Iop : frappe rapide a 1 ou 2 cases.',
  },
  bond: {
    id: 'bond', name: 'Bond', short: 'BD', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 4, range: { min: 1, max: 5 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'teleport' }],
    levels: { 3: { apCost: 3 } },
    desc: 'Bondit sur une case libre, meme sans ligne de vue (ignore le tacle). 3 PA au niveau 3.',
  },
  epeeDivine: {
    id: 'epeeDivine', name: 'Epee Divine', short: 'ED', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false,
    // length: -1 = jusqu au bord de la carte. piercing = traverse murs et combattants.
    target: 'tile', area: { type: 'line', length: -1, piercing: true },
    cooldown: 2,
    effects: [{ type: 'damage', min: 38, max: 58 }],
    desc: 'Lance sur la case devant soi : la lame divine fonce tout droit jusqu au bord de la carte et traverse murs et ennemis.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO', icon: ICON_FIST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, maxCastsPerTurn: 1,
    effects: [{ type: 'buff', damageMult: 0.3, duration: 2 }],
    desc: '+30% degats pendant 2 tours. Une fois par tour, cumulable d un tour a l autre.',
  },
  precipitation: {
    id: 'precipitation', name: 'Precipitation', short: 'PE', icon: ICON_HASTE,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 1, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'gainPa', amount: 5, nextTurnPenalty: 3 }],
    desc: 'Gagne 5 PA pour ce tour puis perd 3 PA au tour suivant.',
  },

  // ---------- ROUBLARD ----------
  // 4 sorts focalises sur la pose / gestion / detonation de bombes.
  poserBombe: {
    id: 'poserBombe', name: 'Poser une Bombe', short: 'PB', icon: ICON_BOMB,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 3 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'placeBomb' }],
    levels: { 3: { apCost: 3 } },
    desc: 'Pose une bombe sur une case libre (bloque la vue). Explose dans 3 tours en zone rayon 2, +75% de degats par tour ecoule. Max 3 bombes, 2 posees par tour. Ameliorer le sort rend les bombes plus solides et plus puissantes.',
  },
  entourloupe: {
    id: 'entourloupe', name: 'Entourloupe', short: 'ET', icon: ICON_BOMB_SWAP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: false,
    target: 'ally', area: { type: 'single' },
    targetFilter: 'bomb',
    cooldown: 4,
    effects: [{ type: 'swapWithBomb' }],
    levels: { 2: { cooldown: 3 }, 3: { cooldown: 2, apCost: 2 } },
    desc: 'Echange la position du lanceur avec celle d une de ses bombes (portee 6).',
  },
  detonationManuelle: {
    id: 'detonationManuelle', name: 'Detonation', short: 'DT', icon: ICON_DETONATE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 15 }, needsLOS: false,
    target: 'ally', area: { type: 'single' },
    targetFilter: 'bomb',
    effects: [{ type: 'detonateBomb' }],
    levels: { 3: { apCost: 1 } },
    desc: 'Fait exploser immediatement une de vos bombes (explosion en chaine sur les bombes touchees). Ameliore : explosion plus forte, 1 PA au niveau 3.',
  },
  bouclierBombe: {
    id: 'bouclierBombe', name: 'Bouclier de Bombe', short: 'BB', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    targetFilter: 'bomb',
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.5, duration: 3 }],
    levels: { 3: { apCost: 2 } },
    desc: 'Pose un bouclier (-50% degats reçus) sur une de vos bombes pendant 3 tours.',
  },
  pulsar: {
    id: 'pulsar', name: 'Pulsar', short: 'PU', icon: ICON_PULSAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 1,
    effects: [
      { type: 'damage', min: 38, max: 55 },
      { type: 'knockback', distance: 2 },
    ],
    desc: 'Onde de choc : 38-55 degats et repousse la cible de 2 cases. Portee 6.',
  },

  // ---------- OSAMODAS ----------
  invocationCraqueleur: {
    id: 'invocationCraqueleur', name: 'Invocation du Craqueleur', short: 'IC', icon: ICON_SUMMON,
    category: 'summon', color: SPELL_CATEGORY_COLOR.summon,
    apCost: 6, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'summon', creatureId: 'craqueleur' }],
    desc: 'Invoque un Craqueleur sur une case adjacente libre.',
  },
  piqureMotivante: {
    id: 'piqureMotivante', name: 'Piqure Motivante', short: 'PI', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 3,
    effects: [
      { type: 'buff', bonusPa: 3, bonusPm: 4, duration: 5 },
      { type: 'buff', damageMult: 0.3, duration: 10 },
    ],
    desc: 'Donne +3 PA et +4 PM (5 tours) et +30% degats (10 tours) a une invocation alliee.',
  },
  protectionCraqueleur: {
    id: 'protectionCraqueleur', name: 'Protection du Craqueleur', short: 'PC', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.5, duration: 2 }],
    desc: 'Bouclier : -50% degats reçus pendant 2 tours.',
  },
  soinInvocation: {
    id: 'soinInvocation', name: 'Soin de l Invocation', short: 'SI', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal_percent', percent: 0.30 }],
    desc: 'Soigne 30% des PV max de l invocation alliee.',
  },
  invocationDragounet: {
    id: 'invocationDragounet', name: 'Invocation du Dragounet Rouge', short: 'ID', icon: ICON_SUMMON,
    category: 'summon', color: SPELL_CATEGORY_COLOR.summon,
    apCost: 8, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 5,
    effects: [{ type: 'summon', creatureId: 'dragounetRouge' }],
    desc: 'Invoque un Dragounet Rouge sur une case adjacente libre.',
  },

  // ---------- DRAGOUNET ROUGE (invocation Osamodas) ----------
  dragoflamme: {
    id: 'dragoflamme', name: 'Dragoflamme', short: 'DF', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 8 }, needsLOS: true, lineOnly: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 50, max: 60 }],
    desc: 'Souffle enflamme en ligne droite (portee 8) : 50-60 degats.',
  },
  dragosoin: {
    id: 'dragosoin', name: 'Dragosoin', short: 'DS', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal_percent', percent: 0.20 }],
    desc: 'Soigne un allie de 20% de ses PV max. Portee 4.',
  },

  // ---------- BOUFTOU ----------
  morsureBouftou: {
    id: 'morsureBouftou', name: 'Morsure du Bouftou', short: 'MO', icon: ICON_BITE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 30 }],
    desc: 'Morsure brutale au corps a corps.',
  },
  morsureRoyale: {
    id: 'morsureRoyale', name: 'Morsure Royale', short: 'MR', icon: ICON_BITE_ROYAL,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 40, max: 60 }],
    desc: 'Morsure royale devastatrice.',
  },
  soinAnimal: {
    id: 'soinAnimal', name: 'Soin Animal', short: 'SA', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 3, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal_percent', percent: 0.30 }],
    desc: 'Soigne 30% des PV max d un Bouftou allie de la meute.',
  },

  // ---------- CRAQUELEUR (invocation Osamodas) ----------
  frappeCraqueleur: {
    id: 'frappeCraqueleur', name: 'Frappe du Craqueleur', short: 'FC', icon: ICON_CROSS_PUNCH,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false,
    // Zone circulaire de rayon 2 (Manhattan) autour de la case ciblee.
    target: 'tile', area: { type: 'circle', radius: 2 },
    effects: [{ type: 'damage', min: 30, max: 40 }],
    desc: 'Frappe sismique sur une case adjacente : touche tout dans un rayon de 2 cases autour de la cible.',
  },
  lancerRocher: {
    id: 'lancerRocher', name: 'Lancer de Rocher', short: 'LR', icon: ICON_ROCK_THROW,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 20, max: 30 },
      { type: 'debuff_pm', value: 2 },
    ],
    desc: 'Jette un rocher (ligne de vue requise) : degats + la cible perd 2 PM.',
  },

  // ---------- CRAPAUD ----------
  crachat: {
    id: 'crachat', name: 'Crachat', short: 'CR', icon: ICON_SPIT,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 8, max: 12 },
      { type: 'debuff_pa', value: 1 },
    ],
    desc: 'Crache une mixture acide : degats + la cible perd 1 PA.',
  },

  // ---------- CRAPAUD CHEF ----------
  crachatEmpoisonne: {
    id: 'crachatEmpoisonne', name: 'Crachat Empoisonne', short: 'CE', icon: ICON_POISON_SPIT,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'dot', min: 6, max: 9, duration: 3 }],
    desc: 'Empoisonne la cible : degats sur 3 tours.',
  },
  peauDure: {
    id: 'peauDure', name: 'Peau Dure', short: 'PD', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'ally', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'buff', shield: 0.3, duration: 3 }],
    desc: 'Renforce la peau d un allie : -30% degats reçus pendant 3 tours.',
  },

  // ---------- XELOR ----------
  horloge: {
    id: 'horloge', name: 'Horloge', short: 'HO', icon: ICON_HOURGLASS,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 3 }, needsLOS: true, lineOnly: true,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 30, max: 40 },
      { type: 'debuff_pa', min: 1, max: 2, steal: true, currentTurnOnly: true },
    ],
    desc: 'Lancee en ligne (portee 3) : 30-40 degats et vole 1 a 2 PA (rendus au Xelor pour le tour).',
  },
  ralentissement: {
    id: 'ralentissement', name: 'Ralentissement', short: 'RA', icon: ICON_GEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 8 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'debuff_pa', value: 2, currentTurnOnly: true }],
    levels: { 3: { apCost: 1 } },
    desc: 'Retire 2 PA a un adversaire pour son prochain tour (une fois par cible et par tour). 1 PA au niveau 3.',
  },
  devouement: {
    id: 'devouement', name: 'Devouement', short: 'DV', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 2 },
    cooldown: 4,
    effects: [{ type: 'buff', bonusPa: 2, duration: 3 }],
    desc: '+2 PA au lanceur et aux allies dans un rayon de 2 cases, pendant 3 tours.',
  },
  aiguille: {
    id: 'aiguille', name: 'Aiguille', short: 'AI', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 7 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 18, max: 26 }, { type: 'debuff_pa', value: 1, currentTurnOnly: true }],
    desc: 'Plante une aiguille du cadran : degats et -1 PA au prochain tour de la cible (-2 au niveau 3).',
  },
  momification: {
    id: 'momification', name: 'Momification', short: 'MO', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 5, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 8,
    effects: [{ type: 'buff', shield: 0.5, reflect: 0.4, duration: 4 }],
    desc: 'Le Xelor se momifie 4 tours : -50% degats reçus et renvoie 40% des degats restants a l attaquant.',
  },

  // ---------- ECAFLIP ----------
  griffeFeline: {
    id: 'griffeFeline', name: 'Griffe de Ceangal', short: 'GC', icon: ICON_CLAW,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 15, max: 55 },
      { type: 'debuff_pa', value: 1, chance: 0.25, turns: 3 },
    ],
    desc: 'Coup de griffe tres aleatoire (15-55), 25% de chance de retirer 1 PA pendant 3 tours.',
  },
  pileOuFace: {
    id: 'pileOuFace', name: 'Pile ou Face', short: 'PF', icon: ICON_COIN,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 10, max: 50 }],
    desc: 'Lance une piece : degats totalement aleatoires a distance.',
  },
  roueChance: {
    id: 'roueChance', name: 'Roue de la Fortune', short: 'RF', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', damageMultRoll: [0.2, 0.8], duration: 2 }],
    desc: 'La roue tourne : de +20% a +80% de degats pendant 2 tours, au hasard.',
  },
  bondDuFelin: {
    id: 'bondDuFelin', name: 'Bond du Felin', short: 'BF', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 1, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'tile', area: { type: 'single' }, maxCastsPerTurn: 3,
    effects: [{ type: 'teleport' }],
    desc: 'Bond felin sur une case adjacente libre. Coute 1 PA, jusqu a 3 fois par tour.',
  },
  invocationChaton: {
    id: 'invocationChaton', name: 'Invocation du Chaton', short: 'IK', icon: ICON_SUMMON,
    category: 'summon', color: SPELL_CATEGORY_COLOR.summon,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 7,
    effects: [{ type: 'summon', creatureId: 'chatonBlanc' }],
    desc: 'Invoque un Chaton Blanc sur une case adjacente libre.',
  },
  coupDeGriffe: {
    id: 'coupDeGriffe', name: 'Coup de Griffe', short: 'CG', icon: ICON_KITTEN,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'chanceStrike', dmgMin: 10, dmgMax: 90, healMin: 20, healMax: 40 }],
    desc: 'Griffure chanceuse : 50% de chance d infliger 10-90 degats, 50% de soigner la cible de 20-40.',
  },

  // ---------- PANDAWA ----------
  picole: {
    id: 'picole', name: 'Picole', short: 'PI', icon: ICON_FLASK,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', damageMult: 0.35, bonusPm: -1, duration: 2 }],
    desc: 'Le Pandawa s enivre : +35% degats mais -1 PM pendant 2 tours (etat Saoul).',
  },
  tirPandatak: {
    id: 'tirPandatak', name: 'Tir Pandatak', short: 'TP', icon: ICON_FIST,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 30, max: 42 },
      { type: 'knockback', distance: 2 },
    ],
    desc: 'Un grand coup de pied : degats et repousse la cible de 2 cases.',
  },
  karcham: {
    id: 'karcham', name: 'Karcham', short: 'KA', icon: ICON_BARREL,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 22, max: 32 }],
    desc: 'Lance son tonneau sur un ennemi (portee 5).',
  },
  vaguePandawa: {
    id: 'vaguePandawa', name: 'Vague', short: 'VG', icon: ICON_WAVE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    effects: [{ type: 'damage', min: 20, max: 30 }],
    desc: 'Deferle une vague en zone (rayon 1) sur tout ce qu elle touche.',
  },
  laitDeBambou: {
    id: 'laitDeBambou', name: 'Lait de Bambou', short: 'LB', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 4, range: { min: 0, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 2,
    effects: [{ type: 'heal_percent', percent: 0.2 }],
    desc: 'Un lait de bambou apaisant : soigne 20% des PV max (allie ou soi-meme).',
  },

  // ---------- CHAFER (squelette) ----------
  coupDeLance: {
    id: 'coupDeLance', name: 'Coup de Lance', short: 'CL', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 16, max: 22 }],
    desc: 'Coup de lance discipline au corps a corps.',
  },
  coupDeLanceRoyal: {
    id: 'coupDeLanceRoyal', name: 'Coup de Lance', short: 'CL', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 35 }],
    desc: 'Coup de lance royal au corps a corps.',
  },
  invisibilite: {
    id: 'invisibilite', name: 'Invisibilite', short: 'IV', icon: ICON_GHOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 4, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 5,
    effects: [{ type: 'buff', invisible: true, bonusPm: 1, duration: 3 }],
    desc: 'Le lanceur disparait completement pendant 3 tours et gagne +1 PM. Il reste touchable si on vise sa case.',
  },

  // ---------- TOFU (oiseau) ----------
  coupDeBec: {
    id: 'coupDeBec', name: 'Coup de Bec', short: 'CB', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 9, max: 13 }],
    desc: 'Picore vivement la cible. Peu couteux : picore en rafale.',
  },
  bourrasque: {
    id: 'bourrasque', name: 'Bourrasque', short: 'BO', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 2, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 16, max: 22 },
      { type: 'debuff_pm', value: 2 },
    ],
    desc: 'Souffle une rafale : degats + la cible perd 2 PM.',
  },

  // ---------- CHAMPIGNON ----------
  sporeToxique: {
    id: 'sporeToxique', name: 'Spore Toxique', short: 'ST', icon: ICON_SPORE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'dot', min: 6, max: 9, duration: 3 }],
    desc: 'Projette une spore : empoisonne la cible sur 3 tours.',
  },
  nuageDeSpores: {
    id: 'nuageDeSpores', name: 'Nuage de Spores', short: 'NS', icon: ICON_SPORE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    effects: [
      { type: 'damage', min: 14, max: 20 },
      { type: 'glyph', radius: 1, duration: 2, color: 0x9a4ad0, name: 'Nappe de spores', onTurn: { damage: { min: 6, max: 10 } } },
    ],
    desc: 'Libere un nuage de spores : degats en zone (rayon 1) et une nappe toxique reste 2 tours.',
  },

  // ---------- ENIRIPSA (fee soigneuse) ----------
  motBlessant: {
    id: 'motBlessant', name: 'Mot Blessant', short: 'MB', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 28, lifesteal: 0.3 }],
    desc: 'Un mot cinglant lance a distance. La fee recupere 30% des degats infliges.',
  },
  motSoignant: {
    id: 'motSoignant', name: 'Mot Soignant', short: 'MS', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 3, range: { min: 0, max: 5 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal', min: 28, max: 40 }],
    desc: 'Un mot doux qui referme les plaies : soigne 28-40 PV (allie ou soi-meme).',
  },
  motDeFrayeur: {
    id: 'motDeFrayeur', name: 'Mot de Frayeur', short: 'MF', icon: ICON_GHOST,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 3 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 2,
    effects: [
      { type: 'damage', min: 8, max: 14 },
      { type: 'knockback', distance: 3 },
    ],
    desc: 'Terrifie la cible : 8-14 degats et la repousse de 3 cases.',
  },
  motStimulant: {
    id: 'motStimulant', name: 'Mot Stimulant', short: 'MT', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', bonusPa: 2, bonusPm: 1, duration: 2 }],
    desc: 'Galvanise un allie : +2 PA et +1 PM pendant 2 tours.',
  },
  motDeReconstitution: {
    id: 'motDeReconstitution', name: 'Mot de Reconstitution', short: 'MR', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 5, range: { min: 0, max: 3 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'heal_percent', percent: 0.5 }],
    desc: 'Le grand mot de soin : rend 50% des PV max d un allie (recharge 4 tours).',
  },

  // ---------- WABBITS (lapins) ----------
  morsureWabbit: {
    id: 'morsureWabbit', name: 'Morsure du Wabbit', short: 'MW', icon: ICON_BITE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 14, max: 22 }],
    desc: 'Deux grandes dents qui croquent : 14-22 degats.',
  },
  lancerCarotte: {
    id: 'lancerCarotte', name: 'Lancer de Carotte', short: 'LC', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 2, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 8, max: 14 }],
    desc: 'Lance une carotte bien dure : 8-14 degats a distance.',
  },
  carotteGeante: {
    id: 'carotteGeante', name: 'Carotte Geante', short: 'CG', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    effects: [{ type: 'damage', min: 22, max: 32 }],
    desc: 'Le Wa Wabbit abat une carotte geante : 22-32 degats en zone (rayon 1).',
  },
  // ======== SORTS SUPPLEMENTAIRES (8 sorts par classe) ========
  // ---------- IOP ----------
  intimidation: {
    id: 'intimidation', name: 'Intimidation', short: 'IN', icon: ICON_FIST,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }, { type: 'knockback', distance: 2 }],
    desc: 'Un coup d epaule qui repousse de 2 cases : ideal pour se liberer d un tacleur.',
  },
  epeeDuJugement: {
    id: 'epeeDuJugement', name: 'Epee du Jugement', short: 'EJ', icon: ICON_SWORD,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 2, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 26, max: 36 }],
    levels: { 3: { effects: [null, { type: 'debuff_pm', value: 1 }] } },
    desc: 'Une epee de lumiere frappe a distance (air). Retire 1 PM au niveau 3.',
  },
  colereDeIop: {
    id: 'colereDeIop', name: 'Colere de Iop', short: 'CI', icon: ICON_SWORD,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 7, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'damage', min: 85, max: 105 }],
    desc: 'Le coup ultime du Iop : enorme frappe au corps a corps (recharge 3 tours).',
  },

  // ---------- OSAMODAS ----------
  fouetOsamodas: {
    id: 'fouetOsamodas', name: 'Fouet', short: 'FO', icon: ICON_CLAW,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 3 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 14, max: 22 }, { type: 'debuff_pm', value: 1 }],
    desc: 'Un claquement de fouet : 14-22 degats et -1 PM.',
  },
  invocationBouftou: {
    id: 'invocationBouftou', name: 'Invocation de Bouftou', short: 'IB', icon: ICON_SUMMON,
    category: 'summon', color: SPELL_CATEGORY_COLOR.summon,
    apCost: 4, range: { min: 1, max: 2 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'summon', creatureId: 'bouftouInvoc' }],
    desc: 'Invoque un Bouftou apprivoise qui fonce mordre les ennemis.',
  },
  criDeLaBete: {
    id: 'criDeLaBete', name: 'Cri de la Bete', short: 'CB', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 3 },
    cooldown: 4,
    effects: [{ type: 'buff', damageMult: 0.25, bonusPm: 1, duration: 2 }],
    desc: 'Un cri sauvage : +25% degats et +1 PM pour les allies et invocations proches (rayon 3).',
  },

  // ---------- ROUBLARD ----------
  kaboom: {
    id: 'kaboom', name: 'Kaboom', short: 'KB', icon: ICON_DETONATE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 30 }],
    levels: { 3: { effects: [null, { type: 'knockback', distance: 1 }] } },
    desc: 'Un tir de pistolet explosif : 20-30 degats (repousse de 1 case au niveau 3).',
  },
  tromblon: {
    id: 'tromblon', name: 'Tromblon', short: 'TR', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'tile', area: { type: 'line', length: 3 }, lineOnly: true,
    effects: [{ type: 'damage', min: 30, max: 40 }],
    levels: { 3: { area: { length: 4 } } },
    desc: 'Decharge de tromblon en ligne sur 3 cases (4 au niveau 3) : 30-40 degats a chaque cible.',
  },
  fourberie: {
    id: 'fourberie', name: 'Fourberie', short: 'FB', icon: ICON_HASTE,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.25, bonusPm: 2, duration: 1 }],
    levels: { 3: { apCost: 1 } },
    desc: 'Le Roublard se faufile : +2 PM et 25% de degats en moins pendant 1 tour.',
  },

  // ---------- XELOR ----------
  rembobinage: {
    id: 'rembobinage', name: 'Rembobinage', short: 'RB', icon: ICON_HOURGLASS,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 2, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 2,
    effects: [{ type: 'teleport' }],
    desc: 'Le Xelor remonte le temps et se teleporte sur une case libre (portee 4).',
  },
  frappeDuXelor: {
    id: 'frappeDuXelor', name: 'Frappe du Xelor', short: 'FX', icon: ICON_HOURGLASS,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 2 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 24, max: 32 }],
    desc: 'Un coup de baton temporel a 1 ou 2 cases.',
  },
  sablier: {
    id: 'sablier', name: 'Sablier', short: 'SB', icon: ICON_HOURGLASS,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 2, max: 6 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    cooldown: 3,
    effects: [
      { type: 'damage', min: 14, max: 20 },
      { type: 'glyph', radius: 1, duration: 2, color: 0x4ab0ff, name: 'Glyphe du Sablier',
        onTurn: { damage: { min: 8, max: 12 }, debuffPm: 2 } },
    ],
    desc: 'Le sable du temps se repand (zone rayon 1) : degats, puis un glyphe reste 2 tours. Un ennemi qui commence son tour dessus perd 2 PM et subit des degats.',
  },

  // ---------- ECAFLIP ----------
  toutOuRien: {
    id: 'toutOuRien', name: 'Tout ou Rien', short: 'TR', icon: ICON_COIN,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 1,
    effects: [{ type: 'chanceStrike', dmgMin: 45, dmgMax: 110, healMin: 10, healMax: 25 }],
    desc: 'Pari risque : 50% de chances de 45-110 degats... ou de soigner la cible.',
  },
  reflexes: {
    id: 'reflexes', name: 'Reflexes', short: 'RF', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.25, fuite: 15, duration: 2 }],
    desc: 'Reflexes felins : -25% de degats subis et +15 fuite (echappe au tacle) pendant 2 tours.',
  },
  trefle: {
    id: 'trefle', name: 'Trefle', short: 'TF', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 0, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', damageMult: 0.2, crit: 0.25, duration: 2 }],
    desc: 'Un trefle porte-bonheur : +20% degats et +25% de coups critiques pendant 2 tours (allie ou soi-meme).',
  },

  // ---------- PANDAWA ----------
  souffleAlcoolise: {
    id: 'souffleAlcoolise', name: 'Souffle Alcoolise', short: 'SA', icon: ICON_WAVE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 2 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    effects: [{ type: 'damage', min: 16, max: 24 }],
    desc: 'Un souffle enflamme : 16-24 degats en zone (rayon 1).',
  },
  gueuleDeBois: {
    id: 'gueuleDeBois', name: 'Gueule de Bois', short: 'GB', icon: ICON_FLASK,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }, { type: 'debuff_pm', value: 2 }],
    desc: 'Une bouteille lancee a la tete : degats et -2 PM.',
  },
  stabilisation: {
    id: 'stabilisation', name: 'Stabilisation', short: 'ST', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'buff', shield: 0.3, stabilized: true, tacle: 10, duration: 2 }],
    desc: 'Le Pandawa s ancre au sol pendant 2 tours : -30% degats subis, +10 tacle, ne peut plus etre deplace.',
  },

  // ---------- ENIRIPSA ----------
  motDEnvol: {
    id: 'motDEnvol', name: 'Mot d Envol', short: 'ME', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 2, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 2,
    effects: [{ type: 'teleport' }],
    desc: 'La fee s envole vers une case libre (portee 4).',
  },
  motDePrevention: {
    id: 'motDePrevention', name: 'Mot de Prevention', short: 'MP', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 0, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.35, duration: 2 }],
    desc: 'Protege un allie : 35% de degats en moins pendant 2 tours.',
  },
  motInterdit: {
    id: 'motInterdit', name: 'Mot Interdit', short: 'MI', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 3 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 2,
    effects: [{ type: 'damage', min: 40, max: 55 }],
    desc: 'Le mot que nul ne doit prononcer : 40-55 degats (recharge 2 tours).',
  },

  // ---------- BOSS & MONSTRES (glyphes, pieges, etats) ----------
  frappeRocheuse: {
    id: 'frappeRocheuse', name: 'Frappe Rocheuse', short: 'FR', icon: ICON_CROSS_PUNCH,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 24, max: 32 }],
    desc: 'Un poing de pierre au corps a corps.',
  },
  poingLegendaire: {
    id: 'poingLegendaire', name: 'Poing Legendaire', short: 'PL', icon: ICON_CROSS_PUNCH,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 34, max: 44 }],
    desc: 'Le poing du golem legendaire ecrase sa cible.',
  },
  enracinement: {
    id: 'enracinement', name: 'Enracinement', short: 'EN', icon: ICON_ROCK_THROW,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    cooldown: 3,
    effects: [{ type: 'damage', min: 10, max: 16 }, { type: 'state', rooted: true, duration: 2 }],
    desc: 'Des racines de pierre jaillissent (rayon 1) : degats et les ennemis touches sont ENRACINES 2 tours (ni marche ni deplacement).',
  },
  eboulement: {
    id: 'eboulement', name: 'Eboulement', short: 'EB', icon: ICON_ROCK_THROW,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    cooldown: 2,
    effects: [{ type: 'damage', min: 28, max: 38 }],
    desc: 'Une pluie de rochers en zone (rayon 1).',
  },
  kwakElementaire: {
    id: 'kwakElementaire', name: 'Kwak Elementaire', short: 'KE', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 6 }, needsLOS: true, dynamicElement: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 26, max: 34 }],
    desc: 'Un cri charge de l element du moment du Kwakwa.',
  },
  plumesTranchantes: {
    id: 'plumesTranchantes', name: 'Plumes Tranchantes', short: 'PT', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 5 }, needsLOS: true, dynamicElement: true,
    target: 'tile', area: { type: 'circle', radius: 1 },
    cooldown: 2,
    effects: [{ type: 'damage', min: 20, max: 28 }],
    desc: 'Une volee de plumes elementaires en zone (rayon 1).',
  },
  souffleKwakwa: {
    id: 'souffleKwakwa', name: 'Souffle du Kwakwa', short: 'SK', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true, dynamicElement: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 1,
    effects: [{ type: 'damage', min: 10, max: 14 }, { type: 'debuff_pm', value: 2 }],
    desc: 'Un souffle glacial ou brulant : degats et -2 PM.',
  },
  chargeMinotoror: {
    id: 'chargeMinotoror', name: 'Charge', short: 'CH', icon: ICON_HASTE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 2, max: 6 }, needsLOS: true, lineOnly: true,
    target: 'enemy', area: { type: 'single' },
    cooldown: 2,
    effects: [{ type: 'charge' }, { type: 'damage', min: 34, max: 46 }, { type: 'knockback', distance: 2 }],
    desc: 'Le Minotoror charge en ligne droite jusqu a sa cible, la percute et la repousse.',
  },
  coupDeCorne: {
    id: 'coupDeCorne', name: 'Coup de Corne', short: 'CC', icon: ICON_BITE_ROYAL,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 28, max: 36 }],
    desc: 'Un violent coup de corne au corps a corps.',
  },
  fureurMinotoror: {
    id: 'fureurMinotoror', name: 'Fureur', short: 'FU', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 4,
    effects: [{ type: 'buff', damageMult: 0.3, stabilized: true, duration: 2 }],
    desc: 'Le Minotoror entre en fureur : +30% degats et inebranlable pendant 2 tours.',
  },
  // ---------- SORTS PROPRES AUX MONSTRES EVOLUES ----------
  bondBouftou: {
    id: 'bondBouftou', name: 'Bond du Boufton', short: 'BB', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 2, range: { min: 1, max: 3 }, needsLOS: false,
    target: 'tile', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'teleport' }],
    desc: 'Le jeune bouftou bondit sur une case libre (portee 3).',
  },
  toisonRoyale: {
    id: 'toisonRoyale', name: 'Toison Royale', short: 'TR', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 4,
    effects: [{ type: 'buff', shield: 0.3, tacle: 10, duration: 2 }],
    desc: 'La laine royale epaissit : -30% degats subis et +10 tacle.',
  },
  bondDuWabbit: {
    id: 'bondDuWabbit', name: 'Bond du Wabbit', short: 'BW', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 1, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'tile', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'teleport' }],
    desc: 'Un bond de lapin par-dessus les obstacles (portee 4).',
  },
  carotteMaudite: {
    id: 'carotteMaudite', name: 'Carotte Maudite', short: 'CM', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 2, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 14, max: 20 }, { type: 'debuff_pa', value: 1 }],
    desc: 'Une carotte pourrie lancee de loin : degats et -1 PA.',
  },
  terrierWabbit: {
    id: 'terrierWabbit', name: 'Galop du Terrier', short: 'GT', icon: ICON_HASTE,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 1, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 2 }, cooldown: 3,
    effects: [{ type: 'buff', bonusPm: 2, duration: 1 }],
    desc: 'Le Wa Wabbit sonne le galop : +2 PM a lui et aux wabbits proches.',
  },
  croassement: {
    id: 'croassement', name: 'Croassement', short: 'CR', icon: ICON_WAVE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'debuff_pm', value: 2 }],
    desc: 'Un croassement assourdissant : la cible perd 2 PM.',
  },
  soinDeLaMare: {
    id: 'soinDeLaMare', name: 'Eau de la Mare', short: 'EM', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'ally', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'heal_percent', percent: 0.25 }],
    desc: 'Le mage asperge un allie d eau de la mare : soigne 25% de ses PV max.',
  },
  deluge: {
    id: 'deluge', name: 'Deluge', short: 'DL', icon: ICON_WAVE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 }, cooldown: 2,
    effects: [{ type: 'damage', min: 22, max: 30 }],
    desc: 'Le chef appelle la pluie : degats d eau en zone (rayon 1).',
  },
  bondAquatique: {
    id: 'bondAquatique', name: 'Saut de la Mare', short: 'SM', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 2, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'tile', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'teleport' }],
    desc: 'Un grand saut de crapaud (portee 4).',
  },
  envolTofu: {
    id: 'envolTofu', name: 'Envol', short: 'EV', icon: ICON_FEATHER,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 1, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 3,
    effects: [{ type: 'buff', bonusPm: 2, fuite: 10, duration: 1 }],
    desc: 'L oiseau prend son envol : +2 PM et +10 fuite ce tour.',
  },
  becMaudit: {
    id: 'becMaudit', name: 'Bec Maudit', short: 'BM', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 16, max: 22 }, { type: 'debuff_pa', value: 1 }],
    desc: 'Un coup de bec maudit : degats et -1 PA.',
  },
  plongeon: {
    id: 'plongeon', name: 'Plongeon', short: 'PL', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 2, range: { min: 2, max: 5 }, needsLOS: false,
    target: 'tile', area: { type: 'single' }, cooldown: 3,
    effects: [{ type: 'teleport' }],
    desc: 'Le Tofu Royal pique du ciel sur une case libre (portee 5).',
  },
  plumageRoyal: {
    id: 'plumageRoyal', name: 'Plumage Royal', short: 'PR', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 4,
    effects: [{ type: 'buff', bonusPa: 2, damageMult: 0.2, duration: 2 }],
    desc: 'Le Tofu Royal gonfle son plumage : +2 PA et +20% degats.',
  },
  flecheClouante: {
    id: 'flecheClouante', name: 'Fleche Clouante', short: 'FC', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 2, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'damage', min: 10, max: 14 }, { type: 'debuff_pm', value: 2 }],
    desc: 'Une fleche qui cloue au sol : degats et -2 PM.',
  },
  bouclierOsseux: {
    id: 'bouclierOsseux', name: 'Bouclier Osseux', short: 'BO', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 3,
    effects: [{ type: 'buff', shield: 0.35, duration: 2 }],
    desc: 'Le garde leve son bouclier d os : -35% degats subis.',
  },
  ordreDuRoi: {
    id: 'ordreDuRoi', name: 'Ordre du Roi', short: 'OR', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 3 }, cooldown: 4,
    effects: [{ type: 'buff', bonusPa: 1, damageMult: 0.15, duration: 2 }],
    desc: 'Le Chafer Royal ordonne l assaut : +1 PA et +15% degats aux chafers proches.',
  },
  sporeCollante: {
    id: 'sporeCollante', name: 'Spore Collante', short: 'SC', icon: ICON_SPORE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 8, max: 12 }, { type: 'debuff_pm', value: 2 }],
    desc: 'Une spore gluante : degats et -2 PM.',
  },
  mycose: {
    id: 'mycose', name: 'Mycose', short: 'MY', icon: ICON_SPORE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 18, max: 26, lifesteal: 0.5 }],
    desc: 'Le mutant draine la vie de sa cible : il recupere 50% des degats.',
  },
  regenerationFongique: {
    id: 'regenerationFongique', name: 'Regeneration Fongique', short: 'RF', icon: ICON_HEAL_CROSS,
    category: 'heal', color: SPELL_CATEGORY_COLOR.heal,
    apCost: 3, range: { min: 0, max: 4 }, needsLOS: true,
    target: 'ally', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'heal_percent', percent: 0.25 }],
    desc: 'Des spores guerisseuses : soigne 25% des PV max d un allie.',
  },
  racinesFongiques: {
    id: 'racinesFongiques', name: 'Racines Fongiques', short: 'RA', icon: ICON_SPORE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'tile', area: { type: 'circle', radius: 1 }, cooldown: 3,
    effects: [{ type: 'damage', min: 8, max: 12 }, { type: 'state', rooted: true, duration: 1 }],
    desc: 'Du mycelium jaillit du sol : degats et enracine 1 tour (rayon 1).',
  },
  carapace: {
    id: 'carapace', name: 'Carapace', short: 'CA', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 4,
    effects: [{ type: 'buff', shield: 0.4, stabilized: true, duration: 2 }],
    desc: 'Le golem ancien se referme : -40% degats subis et inamovible.',
  },
  givre: {
    id: 'givre', name: 'Givre', short: 'GV', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' }, cooldown: 2,
    effects: [{ type: 'damage', min: 10, max: 14 }, { type: 'debuff_pa', value: 2 }],
    desc: 'Un souffle glace : degats et -2 PA.',
  },
  rafaleKwak: {
    id: 'rafaleKwak', name: 'Rafale', short: 'RK', icon: ICON_FEATHER,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 4 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' }, cooldown: 1,
    effects: [{ type: 'damage', min: 14, max: 20 }, { type: 'knockback', distance: 2 }],
    desc: 'Une rafale de vent : degats et repousse de 2 cases.',
  },
  peauDePierre: {
    id: 'peauDePierre', name: 'Peau de Pierre', short: 'PP', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' }, cooldown: 4,
    effects: [{ type: 'buff', shield: 0.3, tacle: 15, duration: 2 }],
    desc: 'Le gardien se petrifie : -30% degats subis et +15 tacle.',
  },
  criDeGuerre: {
    id: 'criDeGuerre', name: 'Cri de Guerre', short: 'CG', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 3 },
    cooldown: 4,
    effects: [{ type: 'buff', damageMult: 0.2, bonusPm: 1, duration: 2 }],
    desc: 'Le chef de guerre galvanise la meute : +20% degats et +1 PM (rayon 3).',
  },
  bulleDEau: {
    id: 'bulleDEau', name: 'Bulle d Eau', short: 'BE', icon: ICON_SPIT,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 28 }],
    desc: 'Une bulle d eau magique eclate sur la cible.',
  },
  flecheOsseuse: {
    id: 'flecheOsseuse', name: 'Fleche Osseuse', short: 'FO', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 2, max: 7 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 14, max: 20 }],
    desc: 'Une fleche d os tiree de loin.',
  },
  piegeSournois: {
    id: 'piegeSournois', name: 'Piege Sournois', short: 'PS', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 3 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'trap', radius: 1, color: 0x9a8a78, name: 'Piege Sournois', trigger: { damage: { min: 22, max: 30 } } }],
    desc: 'Pose un piege invisible : le premier ennemi qui marche dessus declenche une explosion (rayon 1).',
  },
};

// Stats des bombes par niveau du sort (heros niveau 1 ; +7% PV et +6%
// degats par niveau du heros en plus) -- cf. Leveling.bombBonus.
const BOMB_LEVELS = [
  { hp: 50, dmg: 50, res: 0 },
  { hp: 70, dmg: 63, res: 10 },
  { hp: 90, dmg: 75, res: 20 },
];

const SUMMON_NAMES = {
  craqueleur: 'Craqueleur', dragounetRouge: 'Dragounet Rouge', chatonBlanc: 'Chaton Blanc', bouftouInvoc: 'Bouftou apprivoise',
};

// Helpers pour fabriquer le contenu du tooltip a partir d un spell.
export function spellEffectLines(spell) {
  const lines = [];
  for (const eff of spell.effects) {
    switch (eff.type) {
      case 'damage':
        lines.push(`Degats ${ELEMENT_LABEL[damageElementOf(spell)] || ''} : ${eff.min}-${eff.max}`.replace('  ', ' '));
        if (eff.lifesteal) lines.push(`Vole ${Math.round(eff.lifesteal * 100)}% des degats en PV`);
        if (spell.area && spell.area.type === 'line') {
          const lenTxt = spell.area.length < 0
            ? 'jusqu au bord de la carte'
            : `de ${spell.area.length} cases`;
          lines.push(`(ligne ${lenTxt})`);
        }
        if (spell.area && spell.area.type === 'cross') {
          lines.push(`(croix de ${spell.area.size})`);
        }
        if (spell.area && spell.area.type === 'circle') {
          lines.push(`(zone rayon ${spell.area.radius})`);
        }
        break;
      case 'heal':
        lines.push(`Soins : ${eff.min}-${eff.max}`);
        break;
      case 'heal_percent':
        lines.push(`Soins : ${Math.round(eff.percent * 100)}% des PV max`);
        break;
      case 'teleport':
        lines.push('Teleporte le lanceur');
        break;
      case 'buff': {
        const parts = [];
        if (eff.damageMult) parts.push(`+${Math.round(eff.damageMult * 100)}% degats`);
        if (eff.bonusPa) parts.push(`+${eff.bonusPa} PA`);
        if (eff.bonusPm) parts.push(`+${eff.bonusPm} PM`);
        if (eff.shield) parts.push(`-${Math.round(eff.shield * 100)}% degats reçus`);
        if (eff.reflect) parts.push(`renvoie ${Math.round(eff.reflect * 100)}% des degats`);
        if (eff.invisible) parts.push('invisible');
        if (eff.damageMultRoll) parts.push(`+${Math.round(eff.damageMultRoll[0] * 100)} a +${Math.round(eff.damageMultRoll[1] * 100)}% degats (hasard)`);
        if (eff.crit) parts.push(`+${Math.round(eff.crit * 100)}% critique`);
        if (eff.fuite) parts.push(`+${eff.fuite} fuite`);
        if (eff.tacle) parts.push(`+${eff.tacle} tacle`);
        if (eff.stabilized) parts.push('stabilise');
        lines.push(`${parts.join(', ')} pendant ${eff.duration} tours${eff.damageMult ? ' (cumulable)' : ''}`);
        break;
      }
      case 'summon': {
        const lv = eff.summonLevel || 1;
        lines.push(`Invoque : ${SUMMON_NAMES[eff.creatureId] || eff.creatureId}`);
        if (lv >= 2) lines.push(`Creature : PV et degats +${(lv - 1) * 20}%${lv >= 3 ? ', +1 PA, +1 PM' : ''}, sorts niv. ${lv}`);
        break;
      }
      case 'debuff_pm': {
        const amt = eff.value !== undefined ? `${eff.value}` : `${eff.min}-${eff.max}`;
        lines.push(`Cible perd ${amt} PM (au prochain tour)`);
        break;
      }
      case 'debuff_pa': {
        const amt = eff.value !== undefined ? `${eff.value}` : `${eff.min}-${eff.max}`;
        const turnTxt = eff.turns ? `${eff.turns} tours` : 'au prochain tour';
        if (eff.chance !== undefined) {
          lines.push(`${Math.round(eff.chance * 100)}% : cible perd ${amt} PA (${turnTxt})`);
        } else {
          lines.push(`Cible perd ${amt} PA (${turnTxt})`);
        }
        break;
      }
      case 'knockback':
        lines.push(`Repousse la cible de ${eff.distance || 1} cases`);
        break;
      case 'gainPa':
        lines.push(`+${eff.amount} PA ce tour`);
        if (eff.nextTurnPenalty) lines.push(`-${eff.nextTurnPenalty} PA au tour suivant`);
        break;
      case 'chanceStrike':
        lines.push(`50% : degats ${eff.dmgMin}-${eff.dmgMax}`);
        lines.push(`50% : soigne ${eff.healMin}-${eff.healMax}`);
        break;
      case 'dot':
        lines.push(`Poison : ${eff.min}-${eff.max} degats pendant ${eff.duration} tours`);
        break;
      case 'placeBomb': {
        const lv = eff.bombLevel || 1;
        const b = BOMB_LEVELS[lv - 1];
        lines.push(`Bombe : ${b.hp} PV${b.res ? `, resistance ${b.res}%` : ''}`);
        lines.push(`Explosion : ${b.dmg} degats (+75% par tour), rayon 2, dans 3 tours`);
        break;
      }
      case 'moveBomb':
        lines.push('Deplace la bombe la plus proche');
        break;
      case 'swapWithBomb':
        lines.push('Echange la position du lanceur avec la bombe ciblee');
        break;
      case 'detonateBomb':
        lines.push(`Detonation de la bombe ciblee${eff.bonus ? ` (+${Math.round(eff.bonus * 100)}% degats)` : ''}`);
        lines.push('Chaine sur les bombes touchees');
        break;
      case 'detonateBombs':
        lines.push('Detonation immediate de toutes vos bombes');
        break;
      case 'state':
        if (eff.rooted) lines.push(`Enracine la cible ${eff.duration} tours`);
        break;
      case 'glyph': {
        const bits = [];
        if (eff.onTurn && eff.onTurn.damage) bits.push(`${eff.onTurn.damage.min}-${eff.onTurn.damage.max} degats`);
        if (eff.onTurn && eff.onTurn.debuffPm) bits.push(`-${eff.onTurn.debuffPm} PM`);
        if (eff.onTurn && eff.onTurn.debuffPa) bits.push(`-${eff.onTurn.debuffPa} PA`);
        lines.push(`Glyphe ${eff.duration} tours (rayon ${eff.radius}) : ${bits.join(', ')} en debut de tour`);
        break;
      }
      case 'trap':
        lines.push(`Piege invisible : ${eff.trigger.damage.min}-${eff.trigger.damage.max} degats (rayon ${eff.radius})`);
        break;
      case 'charge':
        lines.push('Charge jusqu au contact de la cible');
        break;
    }
  }
  return lines;
}

// Icones peintes facon Dofus (cf. SpellIcons.js) : remplacent les
// pictogrammes quand une illustration dediee existe.
for (const spell of Object.values(SPELLS)) {
  const painted = paintedSpellIcon(spell);
  if (painted) spell.paintedIcon = painted;
}
