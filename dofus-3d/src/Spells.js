// Registre central des sorts. Chaque sort decrit :
//  id, name, short (2-3 lettres pour l icone HUD), color (hex en string),
//  apCost (cout en PA), range { min, max } (distance manhattan),
//  needsLOS (ligne de vue requise), target ('enemy'|'ally'|'self'|'tile'),
//  area ({ type: 'single' } pour l instant -- AOE plus tard),
//  effects [{ type, ...params }].
//
// Types d effets supportes :
//  - 'damage'    : { min, max, element? }
//  - 'teleport'  : pas de params, deplace le caster sur la case cible
//  - 'buff'      : { stat: 'damage', value: 0.3, duration: 2 (tours) }
//  - 'heal'      : { min, max }
//  - 'push'      : { distance } (a venir)

export const SPELLS = {
  // ---------- IOP ----------
  pression: {
    id: 'pression', name: 'Pression', short: 'PR',
    color: '#c0392b',
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 12, max: 18 }],
    desc: 'Coup au CAC. 12-18 degats.',
  },
  bond: {
    id: 'bond', name: 'Bond', short: 'BD',
    color: '#e67e22',
    apCost: 4, range: { min: 1, max: 5 }, needsLOS: true,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'teleport' }],
    desc: 'Saute jusqu a 5 cases sur une case libre.',
  },
  epeeDivine: {
    id: 'epeeDivine', name: 'Epee Divine', short: 'ED',
    color: '#f1c40f',
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 22, max: 30 }],
    desc: 'Frappe lourde au CAC. 22-30 degats.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO',
    color: '#9b59b6',
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'damage', value: 0.3, duration: 2 }],
    desc: '+30% degats infliges pendant 2 tours.',
  },

  // ---------- BOUFTOU ----------
  coupDeCorne: {
    id: 'coupDeCorne', name: 'Coup de Corne', short: 'CC',
    color: '#7a5d0a',
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 8, max: 12 }],
    desc: 'Charge cornue. 8-12 degats.',
  },
};
