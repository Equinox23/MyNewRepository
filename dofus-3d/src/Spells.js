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

const ICON_PULSAR = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
    <circle cx="16" cy="16" r="8" opacity="0.7"/>
    <circle cx="16" cy="16" r="13" opacity="0.4"/>
    <polyline points="24 8, 28 4, 24 4"/>
    <polyline points="8 24, 4 28, 8 28"/>
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
};

export const SPELLS = {
  // ---------- IOP ----------
  pression: {
    id: 'pression', name: 'Pression', short: 'PR', icon: ICON_SWORD,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 2 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }],
    desc: 'Coup rapide a 1 a 2 cases.',
  },
  bond: {
    id: 'bond', name: 'Bond', short: 'BD', icon: ICON_JUMP,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 4, range: { min: 1, max: 5 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'teleport' }],
    desc: 'Bondit sur une case libre, meme sans ligne de vue.',
  },
  epeeDivine: {
    id: 'epeeDivine', name: 'Epee Divine', short: 'ED', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false,
    // length: -1 = jusqu au bord de la carte. piercing = traverse murs et combattants.
    target: 'tile', area: { type: 'line', length: -1, piercing: true },
    effects: [{ type: 'damage', min: 18, max: 24 }],
    desc: 'Lance sur la case devant soi : la lame divine fonce ensuite tout droit jusqu au bord de la carte et traverse murs et ennemis.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO', icon: ICON_FIST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', damageMult: 0.3, duration: 2 }],
    desc: '+30% degats pendant 2 tours. Cumulable.',
  },

  // ---------- ROUBLARD ----------
  // 4 sorts focalises sur la pose / gestion / detonation de bombes.
  poserBombe: {
    id: 'poserBombe', name: 'Poser une Bombe', short: 'PB', icon: ICON_BOMB,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 3 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'placeBomb' }],
    desc: 'Pose une bombe sur une case libre (50 PV, bloque la vue). Explose dans 3 tours en zone rayon 2 pour 50 degats, +75% par tour ecoule. Max 3 bombes sur le terrain, 2 posees par tour.',
  },
  aimantation: {
    id: 'aimantation', name: 'Aimantation', short: 'AI', icon: ICON_BOMB_MOVE,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 3, range: { min: 0, max: 6 }, needsLOS: false,
    target: 'any', area: { type: 'single' }, confirmCast: true,
    effects: [{ type: 'magnetBombs', pullRange: 5 }],
    desc: 'Attire vos bombes alignees en croix avec la case visee (a 5 cases max) jusqu a 1 case de celle-ci. Peut etre lancee sur soi-meme. Le 1er clic affiche la croix d attraction, le 2eme sur la meme case lance le sort.',
  },
  detonationManuelle: {
    id: 'detonationManuelle', name: 'Detonation', short: 'DT', icon: ICON_DETONATE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 2, range: { min: 1, max: 15 }, needsLOS: false,
    target: 'ally', area: { type: 'single' },
    targetFilter: 'bomb',
    effects: [{ type: 'detonateBomb' }],
    desc: 'Selectionne une de vos bombes et la fait exploser immediatement. Une bombe touchee par l explosion declenche une explosion en chaîne.',
  },
  bouclierBombe: {
    id: 'bouclierBombe', name: 'Bouclier de Bombe', short: 'BB', icon: ICON_SHIELD,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'ally', area: { type: 'single' },
    targetFilter: 'bomb',
    cooldown: 3,
    effects: [{ type: 'buff', shield: 0.5, duration: 3 }],
    desc: 'Pose un bouclier (-50% degats reçus) sur une de vos bombes pendant 3 tours.',
  },
  pulsar: {
    id: 'pulsar', name: 'Pulsar', short: 'PU', icon: ICON_PULSAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 40, max: 60 },
      { type: 'knockback', distance: 2 },
    ],
    desc: 'Onde de choc : 40-60 degats et repousse la cible de 2 cases. Portee 6.',
  },

  // ---------- OSAMODAS ----------
  invocationCraqueleur: {
    id: 'invocationCraqueleur', name: 'Invocation du Craqueleur', short: 'IC', icon: ICON_SUMMON,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
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
    apCost: 3, range: { min: 1, max: 4 }, needsLOS: true,
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
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
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
    target: 'ally', area: { type: 'single' },
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
      { type: 'debuff_pa', min: 1, max: 2, steal: true },
    ],
    desc: 'Lancee en ligne (portee 3) : 30-40 degats et vole 1 a 2 PA (rendus au Xelor pour le tour).',
  },
  ralentissement: {
    id: 'ralentissement', name: 'Ralentissement', short: 'RA', icon: ICON_GEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 1, range: { min: 1, max: 8 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'debuff_pa', value: 2 }],
    desc: 'Retire 2 PA a un adversaire. Portee 8.',
  },
  devouement: {
    id: 'devouement', name: 'Devouement', short: 'DV', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'circle', radius: 2 },
    cooldown: 3,
    effects: [{ type: 'buff', bonusPa: 2, duration: 3 }],
    desc: '+2 PA au lanceur et aux allies dans un rayon de 2 cases, pendant 3 tours.',
  },
  aiguille: {
    id: 'aiguille', name: 'Aiguille', short: 'AI', icon: ICON_LINE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 7 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 35 }],
    desc: 'Plante une aiguille du cadran : 20-35 degats. Portee 7.',
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
      { type: 'damage', min: 20, max: 70 },
      { type: 'debuff_pa', value: 1, chance: 0.2, turns: 10 },
    ],
    desc: 'Coup de griffe acere : 20-70 degats, 20% de chance de retirer 1 PA a la cible pendant 10 tours.',
  },
  pileOuFace: {
    id: 'pileOuFace', name: 'Pile ou Face', short: 'PF', icon: ICON_COIN,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 5, max: 45 }],
    desc: 'Lance une piece : degats totalement aleatoires (5-45).',
  },
  roueChance: {
    id: 'roueChance', name: 'Roue de la Fortune', short: 'RF', icon: ICON_BOOST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    cooldown: 3,
    effects: [{ type: 'buff', damageMult: 0.5, duration: 2 }],
    desc: 'Tente sa chance : +50% degats pendant 2 tours.',
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
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
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

  // ---------- CHAFER (squelette) ----------
  coupDeLance: {
    id: 'coupDeLance', name: 'Coup de Lance', short: 'CL', icon: ICON_SPEAR,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 16, max: 22 }],
    desc: 'Coup de lance discipline au corps a corps.',
  },
  chargeOsseuse: {
    id: 'chargeOsseuse', name: 'Charge Osseuse', short: 'CO', icon: ICON_FIST,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 5, range: { min: 1, max: 2 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 26, max: 34 }],
    desc: 'Charge osseuse devastatrice (1 a 2 cases).',
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
    effects: [{ type: 'damage', min: 14, max: 20 }],
    desc: 'Liberе un nuage de spores : degats en zone (rayon 1).',
  },
};

// Helpers pour fabriquer le contenu du tooltip a partir d un spell.
export function spellEffectLines(spell) {
  const lines = [];
  for (const eff of spell.effects) {
    switch (eff.type) {
      case 'damage':
        lines.push(`Degats : ${eff.min}-${eff.max}`);
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
        lines.push(`${parts.join(', ')} pendant ${eff.duration} tours${eff.damageMult ? ' (cumulable)' : ''}`);
        break;
      }
      case 'summon':
        lines.push(`Invoque : ${eff.creatureId}`);
        break;
      case 'debuff_pm': {
        const amt = eff.value !== undefined ? `${eff.value}` : `${eff.min}-${eff.max}`;
        lines.push(`Cible perd ${amt} PM (au prochain tour)`);
        break;
      }
      case 'debuff_pa': {
        const amt = eff.value !== undefined ? `${eff.value}` : `${eff.min}-${eff.max}`;
        if (eff.chance !== undefined) {
          const turnTxt = eff.turns ? `${eff.turns} tours` : 'au prochain tour';
          lines.push(`${Math.round(eff.chance * 100)}% : cible perd ${amt} PA (${turnTxt})`);
        } else {
          lines.push(`Cible perd ${amt} PA (au prochain tour)`);
        }
        break;
      }
      case 'knockback':
        lines.push(`Repousse la cible de ${eff.distance || 1} cases`);
        break;
      case 'chanceStrike':
        lines.push(`50% : degats ${eff.dmgMin}-${eff.dmgMax}`);
        lines.push(`50% : soigne ${eff.healMin}-${eff.healMax}`);
        break;
      case 'dot':
        lines.push(`Poison : ${eff.min}-${eff.max} degats pendant ${eff.duration} tours`);
        break;
      case 'placeBomb':
        lines.push('Pose une bombe (50 PV)');
        lines.push('Explose en zone (rayon 2) dans 3 tours');
        lines.push('Degats : 50 + 75% par tour ecoule');
        break;
      case 'moveBomb':
        lines.push('Deplace la bombe la plus proche');
        break;
      case 'magnetBombs':
        lines.push('Attire vos bombes alignees vers la cible');
        lines.push(`Portee d attraction : ${eff.pullRange || 5} cases`);
        break;
      case 'detonateBomb':
        lines.push('Detonation de la bombe ciblee');
        lines.push('Chaine sur les bombes touchees');
        break;
      case 'detonateBombs':
        lines.push('Detonation immediate de toutes vos bombes');
        break;
    }
  }
  return lines;
}
