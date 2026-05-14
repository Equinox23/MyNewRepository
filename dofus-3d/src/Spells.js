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
    apCost: 5, range: { min: 1, max: 3 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'placeBomb' }],
    desc: 'Pose une bombe sur une case libre (50 PV, bloque la vue). Explose dans 3 tours en zone rayon 2 pour 50 degats, +75% par tour ecoule. Max 2 bombes sur le terrain, 1 pose par tour.',
  },
  alimentationBombe: {
    id: 'alimentationBombe', name: 'Alimentation', short: 'AL', icon: ICON_BOMB_MOVE,
    category: 'move', color: SPELL_CATEGORY_COLOR.move,
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'moveBomb' }],
    desc: 'Deplace votre bombe la plus proche vers la case visee (case libre).',
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
    effects: [{ type: 'buff', bonusPa: 3, bonusPm: 4, duration: 5 }],
    desc: 'Donne +3 PA et +4 PM a une invocation alliee pendant 5 tours.',
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

  // ---------- BOUFTOU ----------
  morsureBouftou: {
    id: 'morsureBouftou', name: 'Morsure du Bouftou', short: 'MO', icon: ICON_BITE,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 6, max: 9 }],
    desc: 'Morsure brutale au corps a corps.',
  },
  morsureRoyale: {
    id: 'morsureRoyale', name: 'Morsure Royale', short: 'MR', icon: ICON_BITE_ROYAL,
    category: 'attack', color: SPELL_CATEGORY_COLOR.attack,
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }],
    desc: 'Morsure royale puissante.',
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
        lines.push(`${parts.join(', ')} pendant ${eff.duration} tours${eff.damageMult ? ' (cumulable)' : ''}`);
        break;
      }
      case 'summon':
        lines.push(`Invoque : ${eff.creatureId}`);
        break;
      case 'debuff_pm':
        lines.push(`Cible perd ${eff.value} PM`);
        break;
      case 'debuff_pa':
        lines.push(`Cible perd ${eff.value} PA`);
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
