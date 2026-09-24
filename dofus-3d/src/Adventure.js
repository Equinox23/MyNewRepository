// ===========================================================================
// Mode Aventure : donjons facon Dofus.
//  - Un donjon = 3 salles (combats) puis la salle du boss, monstres de
//    niveau fixe (bestiaire) : les derniers donjons sont tres durs.
//  - Les PV des heros ne remontent pas entierement entre deux salles
//    (seulement 25% de repos) ; un heros tombe revient a 20%.
//  - Battre le boss ouvre un coffre (objets garantis) et debloque le
//    donjon suivant.
// ===========================================================================

import { MONSTER_FAMILIES } from './Bestiary.js';
import { DEFS } from './Fighter.js';

const KEY = 'dofus3d.dungeons';

// Salles d un donjon (indices dans les membres de la famille : 0 sbire,
// 1 variante, 2 chef, 3 royal / boss). 4 salles, la derniere avec le boss.
const ROOMS = [[0, 0, 1], [0, 1, 1, 2], [1, 2, 2, 1], [1, 2, 3, 2]];

const DUNGEON_INFO = [
  ['bouftous', 'bouftou', 'Donjon des Bouftous', 'La meute garde l enclos du Bouftou Royal.'],
  ['wabbits', 'wabbit', 'Terrier du Wa Wabbit', 'Au fond du terrier, le roi des Wabbits et ses carottes geantes.'],
  ['crapauds', 'crapaud', 'Mare du Crapaud Chef', 'Crapauds venimeux et mages protegent leur chef. Ils resistent a l eau.'],
  ['tofus', 'tofu', 'Nid des Tofus', 'Des oiseaux rapides qui fuient le tacle. Le Tofu Royal niche au sommet.'],
  ['chafers', 'chafer', 'Crypte des Chafers', 'Archers et gardes d elite squelettes, pieges caches. Ils craignent le feu.'],
  ['champignons', 'champignon', 'Champignonniere', 'Spores toxiques partout. Le Champignon Royal craint le feu.'],
  ['craqueleurs', 'craqueleur', 'Grotte du Craqueleur Legendaire', 'Des golems qui enracinent et tapent fort. Ils craignent l eau.'],
  ['kwakwa', 'kwakwa', 'Canopee du Kwakwa', 'Chaque Kwak a son element ; le Kwakwa en change a chaque tour.'],
  ['minotoror', 'minotoror', 'Labyrinthe du Minotoror', 'Le Minotoror et ses gardiens chargent en ligne droite.'],
];

export const DUNGEONS = DUNGEON_INFO.map(([id, family, name, desc]) => {
  const fam = MONSTER_FAMILIES[family];
  const rooms = ROOMS.map(r => r.map(i => fam.members[i]));
  const boss = fam.members[3];
  return { id, family, name, desc, map: fam.map, boss, rooms, level: DEFS[boss].level, minLevel: DEFS[fam.members[0]].level };
});

export const REST_HEAL = 0.25;
export const REVIVE_HP = 0.2;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { return {}; }
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) {}
}

// Nombre de fois que le donjon a ete termine.
export function dungeonClears(id) {
  return (load()[id] || {}).clears || 0;
}

export function recordDungeonClear(id) {
  const d = load();
  d[id] = { clears: ((d[id] && d[id].clears) || 0) + 1 };
  save(d);
}

// Un donjon est accessible si le precedent a ete termine au moins une fois.
export function dungeonUnlocked(index) {
  if (index <= 0) return true;
  return dungeonClears(DUNGEONS[index - 1].id) > 0;
}

// Composition d une salle selon le nombre de heros : un sbire de plus
// par heros supplementaire.
export function roomComposition(dungeon, roomIndex, heroCount) {
  const base = dungeon.rooms[roomIndex].slice();
  const extra = MONSTER_FAMILIES[dungeon.family].members[1];
  for (let i = 1; i < heroCount; i++) base.unshift(extra);
  return base;
}
