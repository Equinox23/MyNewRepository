import { itemIcon } from './ItemArt.js';

// ===========================================================================
// Equipement et panoplies facon Dofus.
//  - 5 emplacements : coiffe, cape, amulette, anneau, bottes.
//  - 9 panoplies (une par famille de monstres), chacune avec son niveau,
//    son style et ses statistiques de predilection.
//  - Jets FIXES : un objet est entierement defini par (panoplie,
//    emplacement, rarete). Deux "Coiffe du Bouftou" legendaires sont
//    identiques.
//  - Bonus de panoplie a 2, 3, 4 et 5 objets portes (independants de la
//    rarete), avec un effet special unique a 5 objets.
//  - Le sac est commun a tous les heros ; chaque heros equipe ses objets.
// Tout est sauvegarde dans le navigateur (localStorage).
// ===========================================================================

export { itemIcon };

const KEY = 'dofus3d.inventory';
export const BAG_MAX = 80;

export const SLOTS = ['coiffe', 'cape', 'amulette', 'anneau', 'bottes'];
export const SLOT_LABEL = { coiffe: 'Coiffe', cape: 'Cape', amulette: 'Amulette', anneau: 'Anneau', bottes: 'Bottes' };

export const RARITY = {
  commun: { label: 'Commun', color: '#c8ccd0', mult: 1, stats: 2, rank: 0 },
  rare: { label: 'Rare', color: '#4ab0ff', mult: 1.35, stats: 3, rank: 1 },
  epique: { label: 'Epique', color: '#c46aff', mult: 1.75, stats: 3, rank: 2 },
  legendaire: { label: 'Legendaire', color: '#ffb02a', mult: 2.3, stats: 4, rank: 3 },
};
export const RARITY_ORDER = ['commun', 'rare', 'epique', 'legendaire'];

export const STAT_ORDER = ['hp', 'pa', 'pm', 'dmg', 'crit', 'tacle', 'fuite', 'init', 'res.feu', 'res.eau', 'res.terre', 'res.air', 'res.neutre'];
export const STAT_LABEL = {
  hp: 'Vitalite', dmg: '% Dommages', crit: '% Critique', tacle: 'Tacle', fuite: 'Fuite', init: 'Initiative',
  pa: 'PA', pm: 'PM',
  'res.feu': '% Res. Feu', 'res.eau': '% Res. Eau', 'res.terre': '% Res. Terre', 'res.air': '% Res. Air', 'res.neutre': '% Res. Neutre',
};

// Valeur d un point de "budget" pour chaque statistique.
const STAT_UNIT = {
  hp: 3, dmg: 0.7, crit: 0.35, tacle: 0.45, fuite: 0.45, init: 1.2,
  'res.feu': 0.8, 'res.eau': 0.8, 'res.terre': 0.8, 'res.air': 0.8, 'res.neutre': 0.8,
};

// Panoplies : niveau (requis), couleurs, stats de predilection (dans
// l ordre d importance) et effet special a 5 objets.
export const FAMILIES = {
  bouftou: {
    name: 'du Bouftou', set: 'Panoplie du Bouftou', level: 1, color: '#f4efe4', accent: '#8a6a3a',
    stats: ['hp', 'res.terre', 'tacle', 'dmg'],
    special: { id: 'toison', name: 'Toison', desc: 'Regenere 4% des PV max au debut de chaque tour.' },
  },
  wabbit: {
    name: 'du Wabbit', set: 'Panoplie du Wabbit', level: 3, color: '#f6f0ff', accent: '#f07a1a',
    stats: ['fuite', 'crit', 'hp', 'res.terre'],
    special: { id: 'lapin', name: 'Chance du Wabbit', desc: '+10% critique ; chaque coup critique rend 1 PM.', stats: { crit: 10 } },
  },
  crapaud: {
    name: 'du Crapaud', set: 'Panoplie du Crapaud', level: 4, color: '#5ab84a', accent: '#f2e060',
    stats: ['res.eau', 'hp', 'dmg', 'init'],
    special: { id: 'bave', name: 'Bave collante', desc: '25% de chance que tes attaques retirent 1 PM a la cible.' },
  },
  tofu: {
    name: 'du Tofu', set: 'Panoplie du Tofu', level: 5, color: '#ffd23a', accent: '#e8762a',
    stats: ['fuite', 'res.air', 'init', 'crit'],
    special: { id: 'envol', name: 'Envol', desc: '+1 PM et tu ne peux plus etre tacle.', stats: { pm: 1 } },
  },
  chafer: {
    name: 'du Chafer', set: 'Panoplie du Chafer', level: 7, color: '#e8e0c8', accent: '#3a3430',
    stats: ['tacle', 'dmg', 'res.neutre', 'hp'],
    special: { id: 'osDurs', name: 'Os durs', desc: 'Renvoie 10% des degats subis a l attaquant.' },
  },
  champignon: {
    name: 'du Champignon', set: 'Panoplie du Champignon', level: 8, color: '#c8322a', accent: '#f2e8d0',
    stats: ['res.terre', 'res.eau', 'hp', 'tacle'],
    special: { id: 'spores', name: 'Spores', desc: '30% de chance d empoisonner la cible touchee (2 tours).' },
  },
  craqueleur: {
    name: 'du Craqueleur', set: 'Panoplie du Craqueleur', level: 10, color: '#9a8a78', accent: '#7af0ff',
    stats: ['hp', 'res.terre', 'tacle', 'res.feu'],
    special: { id: 'pierre', name: 'Peau de pierre', desc: 'Toujours stabilise (inamovible) et -10% degats subis.' },
  },
  kwakwa: {
    name: 'du Kwakwa', set: 'Panoplie du Kwakwa', level: 13, color: '#2a2438', accent: '#ff7a2a',
    stats: ['res.feu', 'res.eau', 'res.air', 'crit', 'dmg'],
    special: { id: 'prisme', name: 'Prisme', desc: '+10% resistance a tous les elements et +10% dommages.',
      stats: { dmg: 10, 'res.feu': 10, 'res.eau': 10, 'res.terre': 10, 'res.air': 10, 'res.neutre': 10 } },
  },
  minotoror: {
    name: 'du Minotoror', set: 'Panoplie du Minotoror', level: 16, color: '#6a3a1e', accent: '#e8c14a',
    stats: ['dmg', 'hp', 'tacle', 'crit'],
    special: { id: 'fureur', name: 'Fureur du Minotoror', desc: 'Sous 50% de PV : +1 PA et +20% dommages.' },
  },
};
export const FAMILY_ORDER = Object.keys(FAMILIES);

// Monstre -> panoplie.
const FAMILY_OF = {
  bouftou: 'bouftou', bouftouRoyal: 'bouftou',
  crapaud: 'crapaud', crapaudChef: 'crapaud',
  chafer: 'chafer', chaferRoyal: 'chafer',
  tofu: 'tofu', tofuRoyal: 'tofu',
  wabbit: 'wabbit', waWabbit: 'wabbit',
  champignon: 'champignon', champignonRoyal: 'champignon',
  craqueleurSauvage: 'craqueleur', craqueleurLegendaire: 'craqueleur',
  kwakwa: 'kwakwa', minotoror: 'minotoror',
};

// ---------------------------------------------------------------------------
// Jets fixes : statistiques d un objet (panoplie, emplacement, rarete).
// ---------------------------------------------------------------------------
const WEIGHTS = [0.45, 0.3, 0.15, 0.1];

export function itemStats(familyId, slot, rarity) {
  const fam = FAMILIES[familyId] || FAMILIES.bouftou;
  const R = RARITY[rarity] || RARITY.commun;
  const si = Math.max(0, SLOTS.indexOf(slot));
  // Chaque emplacement met en avant une stat differente de la panoplie.
  const keys = [];
  for (let i = 0; i < fam.stats.length && keys.length < R.stats; i++) keys.push(fam.stats[(si + i) % fam.stats.length]);
  const budget = (6 + fam.level * 1.6) * R.mult;
  const wsum = WEIGHTS.slice(0, keys.length).reduce((a, b) => a + b, 0);
  const stats = {};
  keys.forEach((k, i) => {
    stats[k] = Math.max(1, Math.round(budget * (WEIGHTS[i] / wsum) * STAT_UNIT[k]));
  });
  // Legendaires : l amulette donne 1 PA, les bottes 1 PM.
  if (rarity === 'legendaire' && slot === 'amulette') stats.pa = 1;
  if (rarity === 'legendaire' && slot === 'bottes') stats.pm = 1;
  return stats;
}

export function makeItem(familyId, rarity, slot) {
  const fam = FAMILIES[familyId] || FAMILIES.bouftou;
  slot = slot || SLOTS[Math.floor(Math.random() * SLOTS.length)];
  return {
    family: familyId, slot, rarity,
    level: fam.level, req: fam.level,
    name: `${SLOT_LABEL[slot]} ${fam.name}`,
    stats: itemStats(familyId, slot, rarity),
  };
}

// ---------------------------------------------------------------------------
// Bonus de panoplie (independants de la rarete des objets).
// ---------------------------------------------------------------------------
export function setBonus(familyId, count) {
  const fam = FAMILIES[familyId];
  if (!fam || count < 2) return { stats: {}, special: null };
  const n = Math.min(5, count);
  const P = 8 + fam.level * 2;
  const stats = {};
  // Les % de dommages / critique / resistances sont plus precieux : bonus reduits.
  const SCALE = (k) => (k === 'dmg' || k === 'crit') ? 0.6 : k.startsWith('res.') ? 0.8 : 1;
  const add = (k, pts) => { if (pts > 0) stats[k] = (stats[k] || 0) + Math.max(1, Math.round(pts * STAT_UNIT[k] * SCALE(k))); };
  add(fam.stats[0], P * 0.5 * (n - 1));
  if (n >= 3) add(fam.stats[1], P * 0.4 * (n - 2));
  if (n >= 4) add(fam.stats[2], P * 0.35 * (n - 3));
  let special = null;
  if (n >= 5) {
    special = fam.special;
    for (const [k, v] of Object.entries(special.stats || {})) stats[k] = (stats[k] || 0) + v;
  }
  return { stats, special };
}

// ---------------------------------------------------------------------------
// Sauvegarde (avec migration des anciens objets a jets aleatoires)
// ---------------------------------------------------------------------------
function normalize(it) {
  if (!FAMILIES[it.family]) it.family = 'bouftou';
  if (!RARITY[it.rarity]) it.rarity = 'commun';
  if (!SLOTS.includes(it.slot)) it.slot = 'anneau';
  const fam = FAMILIES[it.family];
  it.level = fam.level;
  it.req = fam.level;
  it.name = `${SLOT_LABEL[it.slot]} ${fam.name}`;
  it.stats = itemStats(it.family, it.slot, it.rarity);
  return it;
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    return { items: (d.items || []).map(normalize), equipped: d.equipped || {}, seq: d.seq || 1 };
  } catch (_) {
    return { items: [], equipped: {}, seq: 1 };
  }
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) {}
}

export function getInventory() { return load(); }

export function getItem(id) {
  return load().items.find(i => i.id === id) || null;
}

// Heros qui porte l objet (ou null).
export function wornBy(itemId, inv = load()) {
  for (const [cls, slots] of Object.entries(inv.equipped)) {
    for (const id of Object.values(slots || {})) if (id === itemId) return cls;
  }
  return null;
}

export function equippedItems(classId, inv = load()) {
  const slots = inv.equipped[classId] || {};
  const out = {};
  for (const s of SLOTS) {
    const it = slots[s] && inv.items.find(i => i.id === slots[s]);
    if (it) out[s] = it;
  }
  return out;
}

export function equippedList(classId, inv = load()) {
  return Object.values(equippedItems(classId, inv));
}

// Equipe un objet sur un heros (le retire de celui qui le portait).
export function equip(classId, itemId, heroLevel = 99) {
  const inv = load();
  const it = inv.items.find(i => i.id === itemId);
  if (!it) return 'Objet introuvable';
  if (heroLevel < it.req) return `Niveau ${it.req} requis`;
  for (const slots of Object.values(inv.equipped)) {
    for (const [s, id] of Object.entries(slots)) if (id === itemId) delete slots[s];
  }
  inv.equipped[classId] = inv.equipped[classId] || {};
  inv.equipped[classId][it.slot] = itemId;
  save(inv);
  return null;
}

export function unequip(classId, slot) {
  const inv = load();
  if (inv.equipped[classId]) delete inv.equipped[classId][slot];
  save(inv);
}

export function discard(itemId) {
  const inv = load();
  inv.items = inv.items.filter(i => i.id !== itemId);
  for (const slots of Object.values(inv.equipped)) {
    for (const [s, id] of Object.entries(slots)) if (id === itemId) delete slots[s];
  }
  save(inv);
}

// Ajoute des objets au sac (les plus faibles non portes sautent si plein).
export function addItems(items) {
  const inv = load();
  for (const it of items) {
    it.id = 'it' + (inv.seq++);
    inv.items.push(it);
  }
  while (inv.items.length > BAG_MAX) {
    const worn = new Set(Object.values(inv.equipped).flatMap(s => Object.values(s || {})));
    const loose = inv.items.filter(i => !worn.has(i.id)).sort((a, b) => itemScore(a) - itemScore(b));
    if (!loose.length) break;
    inv.items = inv.items.filter(i => i !== loose[0]);
  }
  save(inv);
  return items;
}

// ---------------------------------------------------------------------------
// Totaux : objets + bonus de panoplie
// ---------------------------------------------------------------------------
// Compte des objets portes par panoplie.
export function setCounts(items) {
  const c = {};
  for (const it of items) c[it.family] = (c[it.family] || 0) + 1;
  return c;
}

// Statistiques "a plat" ({ hp, 'res.feu', ... }) d une liste d objets,
// panoplies comprises, et effets speciaux actifs.
export function flatTotals(items) {
  const flat = {};
  const addAll = (stats) => { for (const [k, v] of Object.entries(stats)) flat[k] = (flat[k] || 0) + v; };
  for (const it of items) addAll(it.stats);
  const specials = [];
  const sets = [];
  for (const [fam, n] of Object.entries(setCounts(items))) {
    const b = setBonus(fam, n);
    addAll(b.stats);
    if (b.special) specials.push(b.special.id);
    if (n >= 2) sets.push({ family: fam, count: n, bonus: b });
  }
  return { flat, specials, sets };
}

// Somme des bonus d equipement d un heros (format attendu par Fighter).
export function toFighterEquip(items) {
  const { flat, specials } = flatTotals(items);
  const out = { hp: 0, pa: 0, pm: 0, dmg: 0, crit: 0, tacle: 0, fuite: 0, init: 0, res: {}, specials };
  for (const [k, v] of Object.entries(flat)) {
    if (k.startsWith('res.')) out.res[k.slice(4)] = (out.res[k.slice(4)] || 0) + v;
    else out[k] = (out[k] || 0) + v;
  }
  return out;
}

export function equipmentStats(classId) {
  return toFighterEquip(equippedList(classId));
}

// Equipement d un heros si l on remplacait l objet de l emplacement par `item`.
export function withSwap(classId, item, inv = load()) {
  const eq = equippedItems(classId, inv);
  eq[item.slot] = item;
  return Object.values(eq);
}

// Lignes de comparaison { key, label, from, to, diff } entre deux jeux de stats.
export function statsDiff(a = {}, b = {}) {
  const keys = STAT_ORDER.filter(k => (a[k] || 0) !== 0 || (b[k] || 0) !== 0);
  return keys.map(k => ({ key: k, label: STAT_LABEL[k] || k, from: a[k] || 0, to: b[k] || 0, diff: (b[k] || 0) - (a[k] || 0) }));
}

// ---------------------------------------------------------------------------
// Butin : les objets rares sont... rares.
//   Monstre normal : 10% de chance de lacher un objet
//     (commun 75% - rare 20% - epique 4.5% - legendaire 0.5%).
//   Chef / Royal : 35%. Boss : 100% (rare 70% - epique 25% - legendaire 5%).
// ---------------------------------------------------------------------------
function pickRarity(boss, luck = 0) {
  const r = Math.random() - luck;
  if (boss) {
    if (r < 0.05) return 'legendaire';
    if (r < 0.3) return 'epique';
    return 'rare';
  }
  if (r < 0.005) return 'legendaire';
  if (r < 0.05) return 'epique';
  if (r < 0.25) return 'rare';
  return 'commun';
}

export function rollLoot(enemies, opts = {}) {
  const drops = [];
  for (const e of enemies) {
    const fam = FAMILY_OF[e.classId];
    if (!fam) continue;
    const isBoss = !!(e.def && e.def.isBoss);
    const chief = !isBoss && !!(e.def && /Royal|Chef|Roi/.test(e.def.name + ' ' + e.def.role));
    const chance = isBoss ? 1 : chief ? 0.35 : 0.1;
    if (Math.random() < chance * (opts.dropMult || 1)) {
      drops.push(makeItem(fam, pickRarity(isBoss, opts.luck || 0)));
    }
  }
  return drops;
}

// Coffre de fin de donjon : objets garantis de la panoplie du boss.
export function chestLoot(familyId, _level, count = 2) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = i === 0 ? (Math.random() < 0.08 ? 'legendaire' : Math.random() < 0.45 ? 'epique' : 'rare') : pickRarity(false, 0.1);
    out.push(makeItem(familyId, r));
  }
  return out;
}

export function itemScore(it) {
  let s = RARITY[it.rarity].rank * 1000;
  for (const [k, v] of Object.entries(it.stats)) {
    if (k === 'pa' || k === 'pm') s += 40;
    else s += v / (STAT_UNIT[k] || 1);
  }
  return s;
}

export function statLines(stats) {
  return STAT_ORDER.filter(k => stats[k]).map(k => `+${stats[k]} ${STAT_LABEL[k] || k}`);
}
