// Classes jouables. Chaque classe a:
//  - id, name, role, color (couleur du jeton), desc
//  - hp (points de vie max)
//  - pa (points d action par tour)
//  - pm (points de mouvement par tour)
//  - initiative (ordre de jeu)
//  - spellIds (sorts disponibles)

export const CLASSES = {
  iop: {
    id: 'iop',
    name: 'Iop',
    role: 'Guerrier melee',
    color: 0xc0392b,
    desc: 'Frappeur au corps a corps. Gros degats, peu de portee.',
    hp: 95,
    pa: 7,
    pm: 3,
    initiative: 12,
    spellIds: ['pression', 'bond', 'epeeDivine', 'concentration'],
  },
  cra: {
    id: 'cra',
    name: 'Cra',
    role: 'Archer',
    color: 0x16a085,
    desc: 'Tireur a longue portee. Fragile mais letal en distance.',
    hp: 75,
    pa: 7,
    pm: 4,
    initiative: 14,
    spellIds: ['flecheMagique', 'flecheRepoussante', 'flechePunitive', 'flecheSoigneuse'],
  },
  eniripsa: {
    id: 'eniripsa',
    name: 'Eniripsa',
    role: 'Soigneur',
    color: 0xe91e63,
    desc: 'Mage soigneur. Peu de degats mais maintient l equipe en vie.',
    hp: 70,
    pa: 8,
    pm: 3,
    initiative: 10,
    spellIds: ['motBlessant', 'motCuratif', 'motStimulant', 'motDrainant'],
  },
  sram: {
    id: 'sram',
    name: 'Sram',
    role: 'Assassin',
    color: 0x34495e,
    desc: 'Assassin sournois. Pieges, esquives et coups fatals.',
    hp: 80,
    pa: 7,
    pm: 4,
    initiative: 15,
    spellIds: ['attaqueMortelle', 'piegeSournois', 'invisibilite', 'coupBas'],
  },
  sadida: {
    id: 'sadida',
    name: 'Sadida',
    role: 'Druide',
    color: 0x27ae60,
    desc: 'Maitre des poisons et des ronces. Controle a distance.',
    hp: 85,
    pa: 7,
    pm: 3,
    initiative: 11,
    spellIds: ['ronce', 'poisonParalysant', 'ronceMultiple', 'arbreVivant'],
  },
};

export const CLASS_LIST = Object.values(CLASSES);
