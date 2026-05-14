// Registre central des sorts. Chaque sort a son propre dessin SVG (icon),
// sa couleur de categorie (rouge = attaque, rose = soin, jaune = boost,
// vert = deplacement), et ses effets composables.
//
// Types d effets : 'damage', 'heal', 'teleport', 'buff'.
// Type d aire   : { type: 'single' } | { type: 'line', length: N }.

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
    apCost: 5, range: { min: 1, max: 4 }, needsLOS: false,
    target: 'tile', area: { type: 'line', length: 4 },
    effects: [{ type: 'damage', min: 18, max: 24 }],
    desc: 'Frappe une ligne droite devant soi : touche tout dans la ligne.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO', icon: ICON_FIST,
    category: 'boost', color: SPELL_CATEGORY_COLOR.boost,
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'damage', value: 0.3, duration: 2 }],
    desc: '+30% degats pendant 2 tours. Cumulable.',
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

  // ---------- BOUFTOU ROYAL ----------
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
    effects: [{ type: 'heal', min: 14, max: 20 }],
    desc: 'Soigne un Bouftou allie de la meute.',
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
          lines.push(`(ligne de ${spell.area.length} cases)`);
        }
        break;
      case 'heal':
        lines.push(`Soins : ${eff.min}-${eff.max}`);
        break;
      case 'teleport':
        lines.push('Teleporte le lanceur');
        break;
      case 'buff':
        lines.push(`+${Math.round(eff.value * 100)}% ${eff.stat} pendant ${eff.duration} tours (cumulable)`);
        break;
    }
  }
  return lines;
}
