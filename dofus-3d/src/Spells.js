// Registre central des sorts. Chaque sort a maintenant son propre
// dessin SVG (champ `icon`). L icone est rendu en blanc et superpose
// sur l accent de couleur du sort dans le HUD.
//
// Types d effets supportes :
//  - 'damage'   : { min, max }
//  - 'heal'     : { min, max }
//  - 'teleport' : -
//  - 'buff'     : { stat, value, duration }

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

const ICON_GREATSWORD = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(16 16) rotate(-30)">
      <line x1="0" y1="-14" x2="0" y2="9"/>
      <polygon points="-3,-14 0,-18 3,-14" fill="currentColor"/>
      <line x1="-7" y1="10" x2="7" y2="10"/>
      <line x1="0" y1="10" x2="0" y2="14"/>
      <circle cx="0" cy="-3" r="1.5" fill="currentColor"/>
    </g>
    <circle cx="16" cy="16" r="13" stroke-dasharray="1 3" opacity="0.7"/>
  </svg>`;

const ICON_FIST = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="16" rx="7" ry="6" fill="none"/>
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

const ICON_HORNS = `
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 24 C3 17 5 7 13 5 C12 10 14 14 11 24 Z" fill="currentColor"/>
    <path d="M21 24 C29 17 27 7 19 5 C20 10 18 14 21 24 Z" fill="currentColor"/>
  </svg>`;

export const SPELLS = {
  // ---------- IOP ----------
  pression: {
    id: 'pression', name: 'Pression', short: 'PR', icon: ICON_SWORD,
    color: '#c0392b',
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }],
    desc: 'Coup au corps a corps. Frappe rapide et fiable.',
  },
  bond: {
    id: 'bond', name: 'Bond', short: 'BD', icon: ICON_JUMP,
    color: '#e67e22',
    apCost: 4, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'teleport' }],
    desc: 'Bondit en avant et atterrit sur une case libre.',
  },
  epeeDivine: {
    id: 'epeeDivine', name: 'Epee Divine', short: 'ED', icon: ICON_GREATSWORD,
    color: '#f1c40f',
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 22, max: 30 }],
    desc: 'Frappe lourde charge d energie divine.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO', icon: ICON_FIST,
    color: '#9b59b6',
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'damage', value: 0.3, duration: 2 }],
    desc: 'Le Iop se concentre et amplifie ses degats.',
  },

  // ---------- BOUFTOU ----------
  coupDeCorne: {
    id: 'coupDeCorne', name: 'Coup de Corne', short: 'CC', icon: ICON_HORNS,
    color: '#7a5d0a',
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 8, max: 12 }],
    desc: 'Charge cornue au corps a corps.',
  },
};

// Helpers pour fabriquer le contenu du tooltip a partir d un spell.
export function spellEffectLines(spell) {
  const lines = [];
  for (const eff of spell.effects) {
    switch (eff.type) {
      case 'damage':
        lines.push(`Degats : ${eff.min}-${eff.max}`);
        break;
      case 'heal':
        lines.push(`Soins : ${eff.min}-${eff.max}`);
        break;
      case 'teleport':
        lines.push('Teleporte le lanceur');
        break;
      case 'buff':
        lines.push(`+${Math.round(eff.value * 100)}% ${eff.stat} pendant ${eff.duration} tours`);
        break;
    }
  }
  return lines;
}
