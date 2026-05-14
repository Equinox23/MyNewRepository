// Definition des sorts. Chaque sort a:
//  - id, name, short (2-3 lettres pour l icone)
//  - apCost, range {min, max}, needsLOS, inLine (cible doit etre alignee)
//  - target: 'enemy' | 'ally' | 'self' | 'tile' | 'any'
//  - area: { type: 'single'|'cross'|'circle'|'line', size }
//  - effects: tableau d effets {type, ...}
//      type: 'damage', 'heal', 'push', 'pull', 'buff', 'dot', 'trap', 'teleport'
//  - color (pour l icone)
//  - desc

export const SPELLS = {
  // ---------- IOP ----------
  pression: {
    id: 'pression', name: 'Pression', short: 'PR',
    apCost: 3, range: { min: 1, max: 1 }, needsLOS: false, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 14, max: 20, element: 'neutre' }],
    color: 0xc0392b,
    desc: 'Coup de melee neutre. 14-20 degats.',
  },
  bond: {
    id: 'bond', name: 'Bond', short: 'BD',
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true, inLine: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'teleport' }],
    color: 0xe67e22,
    desc: 'Saute jusqu a 6 cases sur une case libre.',
  },
  epeeDivine: {
    id: 'epeeDivine', name: 'Epee Divine', short: 'ED',
    apCost: 5, range: { min: 1, max: 1 }, needsLOS: false, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 22, max: 30, element: 'neutre' }],
    color: 0xf1c40f,
    desc: 'Frappe massive au corps a corps. 22-30 degats.',
  },
  concentration: {
    id: 'concentration', name: 'Concentration', short: 'CO',
    apCost: 2, range: { min: 0, max: 0 }, needsLOS: false, inLine: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'damage', value: 0.3, duration: 2 }],
    color: 0x9b59b6,
    desc: '+30% degats infliges pendant 2 tours.',
  },

  // ---------- CRA ----------
  flecheMagique: {
    id: 'flecheMagique', name: 'Fleche Magique', short: 'FM',
    apCost: 3, range: { min: 2, max: 8 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 10, max: 14, element: 'air' }],
    color: 0x1abc9c,
    desc: 'Tir a distance. 10-14 degats air.',
  },
  flecheRepoussante: {
    id: 'flecheRepoussante', name: 'Fleche Repoussante', short: 'FR',
    apCost: 3, range: { min: 1, max: 6 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 6, max: 10, element: 'air' },
      { type: 'push', distance: 3 },
    ],
    color: 0x3498db,
    desc: '6-10 degats + repousse la cible de 3 cases.',
  },
  flechePunitive: {
    id: 'flechePunitive', name: 'Fleche Punitive', short: 'FP',
    apCost: 5, range: { min: 3, max: 10 }, needsLOS: true, inLine: true,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 20, max: 28, element: 'air' }],
    color: 0x16a085,
    desc: 'Tir tres long en ligne. 20-28 degats.',
  },
  flecheSoigneuse: {
    id: 'flecheSoigneuse', name: 'Fleche Soigneuse', short: 'FS',
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true, inLine: false,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal', min: 14, max: 20 }],
    color: 0x2ecc71,
    desc: 'Soigne un allie de 14-20 PV.',
  },

  // ---------- ENIRIPSA ----------
  motBlessant: {
    id: 'motBlessant', name: 'Mot Blessant', short: 'MB',
    apCost: 2, range: { min: 1, max: 5 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 6, max: 10, element: 'eau' }],
    color: 0x8e44ad,
    desc: '6-10 degats eau.',
  },
  motCuratif: {
    id: 'motCuratif', name: 'Mot Curatif', short: 'MC',
    apCost: 3, range: { min: 0, max: 6 }, needsLOS: true, inLine: false,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'heal', min: 16, max: 22 }],
    color: 0x2ecc71,
    desc: 'Soigne un allie (ou soi-meme) de 16-22 PV.',
  },
  motStimulant: {
    id: 'motStimulant', name: 'Mot Stimulant', short: 'MS',
    apCost: 3, range: { min: 0, max: 4 }, needsLOS: true, inLine: false,
    target: 'ally', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'pa', value: 1, duration: 1 }],
    color: 0x27ae60,
    desc: '+1 PA pour le prochain tour de l allie cible.',
  },
  motDrainant: {
    id: 'motDrainant', name: 'Mot Drainant', short: 'MD',
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 10, max: 14, element: 'eau' },
      { type: 'lifesteal', ratio: 0.5 },
    ],
    color: 0x9b59b6,
    desc: '10-14 degats, soigne le lanceur de la moitie.',
  },

  // ---------- SRAM ----------
  attaqueMortelle: {
    id: 'attaqueMortelle', name: 'Attaque Mortelle', short: 'AM',
    apCost: 4, range: { min: 1, max: 1 }, needsLOS: false, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 16, max: 24, element: 'terre' }],
    color: 0x7f8c8d,
    desc: 'Coup mortel au corps a corps. 16-24 degats.',
  },
  piegeSournois: {
    id: 'piegeSournois', name: 'Piege Sournois', short: 'PS',
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true, inLine: false,
    target: 'tile', area: { type: 'single' },
    effects: [{ type: 'trap', min: 12, max: 18, element: 'terre' }],
    color: 0x95a5a6,
    desc: 'Pose un piege qui inflige 12-18 degats au passage.',
  },
  invisibilite: {
    id: 'invisibilite', name: 'Invisibilite', short: 'IN',
    apCost: 3, range: { min: 0, max: 0 }, needsLOS: false, inLine: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'dodge', value: 1, duration: 1 }],
    color: 0x34495e,
    desc: 'Esquive la prochaine attaque recue.',
  },
  coupBas: {
    id: 'coupBas', name: 'Coup Bas', short: 'CB',
    apCost: 3, range: { min: 1, max: 3 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [
      { type: 'damage', min: 8, max: 12, element: 'terre' },
      { type: 'push', distance: 2 },
    ],
    color: 0x6c7a89,
    desc: '8-12 degats + recule la cible de 2 cases.',
  },

  // ---------- SADIDA ----------
  ronce: {
    id: 'ronce', name: 'Ronce', short: 'RC',
    apCost: 3, range: { min: 1, max: 5 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'damage', min: 8, max: 12, element: 'terre' }],
    color: 0x27ae60,
    desc: '8-12 degats terre.',
  },
  poisonParalysant: {
    id: 'poisonParalysant', name: 'Poison Paralysant', short: 'PP',
    apCost: 4, range: { min: 1, max: 6 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'single' },
    effects: [{ type: 'dot', min: 6, max: 9, duration: 3, element: 'air' }],
    color: 0x8e44ad,
    desc: 'Inflige 6-9 degats par tour pendant 3 tours.',
  },
  ronceMultiple: {
    id: 'ronceMultiple', name: 'Ronce Multiple', short: 'RM',
    apCost: 4, range: { min: 1, max: 4 }, needsLOS: true, inLine: false,
    target: 'enemy', area: { type: 'cross', size: 1 },
    effects: [{ type: 'damage', min: 10, max: 14, element: 'terre' }],
    color: 0x16a085,
    desc: '10-14 degats en zone croix.',
  },
  arbreVivant: {
    id: 'arbreVivant', name: 'Arbre Vivant', short: 'AV',
    apCost: 3, range: { min: 0, max: 0 }, needsLOS: false, inLine: false,
    target: 'self', area: { type: 'single' },
    effects: [{ type: 'buff', stat: 'armor', value: 5, duration: 3 }],
    color: 0x2ecc71,
    desc: '+5 armure (reduit les degats) pendant 3 tours.',
  },
};
