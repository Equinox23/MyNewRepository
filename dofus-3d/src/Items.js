// ===========================================================================
// Equipement et butin facon Dofus.
//  - 5 emplacements : coiffe, cape, amulette, anneau, bottes.
//  - Les monstres vaincus lachent parfois un objet de leur "panoplie"
//    (Bouftou, Tofu, Chafer...), au niveau du monstre. Chaque famille a
//    ses statistiques de predilection (le Bouftou donne de la vitalite et
//    de la resistance terre, le Tofu de la fuite et de l air...).
//  - 4 raretes : commun, rare, epique, legendaire (les boss lachent les
//    meilleurs objets, et des PA / PM sur les objets epiques et plus).
//  - Le sac est commun a tous les heros ; chaque heros equipe ses objets.
// Tout est sauvegarde dans le navigateur (localStorage).
// ===========================================================================

const KEY = 'dofus3d.inventory';
export const BAG_MAX = 60;

export const SLOTS = ['coiffe', 'cape', 'amulette', 'anneau', 'bottes'];
export const SLOT_LABEL = { coiffe: 'Coiffe', cape: 'Cape', amulette: 'Amulette', anneau: 'Anneau', bottes: 'Bottes' };

export const RARITY = {
  commun: { label: 'Commun', color: '#c8ccd0', mult: 1, stats: 2 },
  rare: { label: 'Rare', color: '#4ab0ff', mult: 1.35, stats: 3 },
  epique: { label: 'Epique', color: '#c46aff', mult: 1.75, stats: 3 },
  legendaire: { label: 'Legendaire', color: '#ffb02a', mult: 2.3, stats: 4 },
};

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

// Familles de butin (panoplies) : nom, couleur et stats de predilection.
export const FAMILIES = {
  bouftou: { name: 'du Bouftou', color: '#f4efe4', accent: '#8a6a3a', stats: ['hp', 'res.terre', 'tacle', 'dmg'] },
  crapaud: { name: 'du Crapaud', color: '#6ac04a', accent: '#2a5a1a', stats: ['res.eau', 'hp', 'dmg', 'init'] },
  chafer: { name: 'du Chafer', color: '#e8e0c8', accent: '#4a4038', stats: ['tacle', 'dmg', 'res.neutre', 'hp'] },
  tofu: { name: 'du Tofu', color: '#ffd23a', accent: '#c87a1a', stats: ['fuite', 'res.air', 'init', 'crit'] },
  wabbit: { name: 'du Wabbit', color: '#f6f0ff', accent: '#e8762a', stats: ['fuite', 'crit', 'hp', 'res.terre'] },
  champignon: { name: 'du Champignon', color: '#c8322a', accent: '#f2e8d0', stats: ['res.terre', 'res.eau', 'hp', 'tacle'] },
  craqueleur: { name: 'du Craqueleur', color: '#9a8a78', accent: '#7af0ff', stats: ['hp', 'res.terre', 'tacle', 'res.feu'] },
  kwakwa: { name: 'du Kwakwa', color: '#4a4060', accent: '#ff7a2a', stats: ['res.feu', 'res.eau', 'res.air', 'crit', 'dmg'] },
  minotoror: { name: 'du Minotoror', color: '#7a4a2a', accent: '#e8c14a', stats: ['dmg', 'hp', 'tacle', 'crit'] },
};

// Monstre -> famille de butin.
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
// Sauvegarde
// ---------------------------------------------------------------------------
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    return { items: d.items || [], equipped: d.equipped || {}, seq: d.seq || 1 };
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

// Somme des bonus d equipement d un heros (format attendu par Fighter).
export function equipmentStats(classId) {
  const items = Object.values(equippedItems(classId));
  const out = { hp: 0, pa: 0, pm: 0, dmg: 0, crit: 0, tacle: 0, fuite: 0, init: 0, res: {} };
  for (const it of items) {
    for (const [k, v] of Object.entries(it.stats)) {
      if (k.startsWith('res.')) {
        const e = k.slice(4);
        out.res[e] = (out.res[e] || 0) + v;
      } else out[k] = (out[k] || 0) + v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------
function pickRarity(boss, luck = 0) {
  const r = Math.random() - luck;
  if (boss) {
    if (r < 0.15) return 'legendaire';
    if (r < 0.5) return 'epique';
    return 'rare';
  }
  if (r < 0.02) return 'legendaire';
  if (r < 0.1) return 'epique';
  if (r < 0.38) return 'rare';
  return 'commun';
}

export function makeItem(familyId, level, rarity, slot) {
  const fam = FAMILIES[familyId] || FAMILIES.bouftou;
  slot = slot || SLOTS[Math.floor(Math.random() * SLOTS.length)];
  const R = RARITY[rarity];
  const budget = (6 + level * 1.6) * R.mult;
  // Stats : celles de la famille en priorite, dans un ordre aleatoire.
  const pool = fam.stats.slice().sort(() => Math.random() - 0.5);
  const keys = pool.slice(0, Math.min(R.stats, pool.length));
  const stats = {};
  let rest = budget;
  keys.forEach((k, i) => {
    const share = i === keys.length - 1 ? rest : rest * (0.35 + Math.random() * 0.3);
    rest -= share;
    const v = Math.max(1, Math.round(share * STAT_UNIT[k]));
    stats[k] = v;
  });
  // Les objets epiques / legendaires peuvent donner un PA ou un PM.
  if ((rarity === 'epique' && Math.random() < 0.35) || rarity === 'legendaire') {
    const k = (slot === 'bottes' || Math.random() < 0.4) ? 'pm' : 'pa';
    stats[k] = 1;
  }
  return {
    family: familyId,
    slot,
    rarity,
    level,
    req: Math.max(1, level - 2),
    name: `${SLOT_LABEL[slot]} ${fam.name}`,
    stats,
  };
}

// Butin d un combat gagne : chaque monstre a une chance de lacher un
// objet de sa famille (les boss en lachent un a coup sur).
export function rollLoot(enemies, opts = {}) {
  const drops = [];
  for (const e of enemies) {
    const fam = FAMILY_OF[e.classId];
    if (!fam) continue;
    const boss = !!(e.def && (e.def.isBoss || /Royal|Chef|Roi/.test(e.def.name) || e.def.role === 'Boss'));
    const chance = boss ? (e.def.isBoss ? 1 : 0.55) : 0.16;
    if (Math.random() < chance * (opts.dropMult || 1)) {
      drops.push(makeItem(fam, e.level || 1, pickRarity(!!e.def.isBoss, opts.luck || 0)));
    }
  }
  return drops;
}

// Coffre de fin de donjon : objets garantis de la famille du boss.
export function chestLoot(familyId, level, count = 2) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = i === 0 ? (Math.random() < 0.35 ? 'legendaire' : 'epique') : pickRarity(false, 0.25);
    out.push(makeItem(familyId, level, r));
  }
  return out;
}

export function itemScore(it) {
  let s = 0;
  for (const [k, v] of Object.entries(it.stats)) {
    if (k === 'pa' || k === 'pm') s += 40;
    else s += v / (STAT_UNIT[k] || 1);
  }
  return s;
}

export function statLines(stats) {
  return Object.entries(stats).map(([k, v]) => `+${v} ${STAT_LABEL[k] || k}`);
}

// Icone SVG d un objet : dessin de l emplacement aux couleurs de la
// famille, sur un fond borde de la couleur de rarete.
export function itemIcon(it, size = 48) {
  const fam = FAMILIES[it.family] || FAMILIES.bouftou;
  const c = fam.color, a = fam.accent, rc = RARITY[it.rarity].color;
  const O = 'stroke="#241208" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
  const art = {
    coiffe: `<path d="M12 40 Q12 18 32 16 Q52 18 52 40 Z" fill="${c}" ${O}/><path d="M8 42 Q32 34 56 42 Q56 48 32 48 Q8 48 8 42 Z" fill="${a}" ${O}/><circle cx="32" cy="15" r="4" fill="${a}" ${O}/>`,
    cape: `<path d="M22 12 L42 12 L50 52 Q32 58 14 52 Z" fill="${c}" ${O}/><path d="M22 12 Q32 20 42 12" fill="none" ${O}/><circle cx="32" cy="16" r="3.5" fill="${a}" ${O}/><path d="M22 30 L42 30" stroke="${a}" stroke-width="3" opacity="0.7"/>`,
    amulette: `<path d="M18 10 Q32 34 46 10" fill="none" stroke="${a}" stroke-width="3"/><path d="M32 30 L42 40 L32 54 L22 40 Z" fill="${c}" ${O}/><circle cx="32" cy="41" r="4" fill="${a}" ${O}/>`,
    anneau: `<circle cx="32" cy="38" r="14" fill="none" stroke="#241208" stroke-width="9"/><circle cx="32" cy="38" r="14" fill="none" stroke="${a}" stroke-width="5.5"/><path d="M24 24 L32 14 L40 24 L32 30 Z" fill="${c}" ${O}/>`,
    bottes: `<path d="M16 12 L30 12 L30 40 L48 44 Q52 52 44 54 L16 54 Z" fill="${c}" ${O}/><path d="M16 20 L30 20" stroke="${a}" stroke-width="4"/><path d="M16 50 L50 50" stroke="${a}" stroke-width="3"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="60" height="60" rx="10" fill="#1d2130" stroke="${rc}" stroke-width="3"/>
    <rect x="6" y="6" width="52" height="52" rx="8" fill="${rc}" opacity="0.14"/>
    ${art[it.slot] || art.anneau}
  </svg>`;
}
