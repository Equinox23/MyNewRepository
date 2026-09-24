// ===========================================================================
// Mode Aventure : donjons facon Dofus.
//  - Un donjon = une suite de salles (combats) puis la salle du boss.
//  - Les PV des heros ne remontent pas entierement entre deux salles
//    (seulement 25% de repos) ; un heros tombe revient a 20%.
//  - Battre le boss ouvre un coffre (objets garantis) et debloque le
//    donjon suivant.
// ===========================================================================

const KEY = 'dofus3d.dungeons';

export const DUNGEONS = [
  {
    id: 'bouftous', name: 'Donjon des Bouftous', map: 'foret', level: 2, family: 'bouftou', boss: 'bouftouRoyal',
    desc: 'La meute garde l enclos du Bouftou Royal.',
    rooms: [['bouftou', 'bouftou'], ['bouftou', 'bouftou', 'bouftou'], ['bouftou', 'bouftou', 'bouftouRoyal']],
  },
  {
    id: 'wabbits', name: 'Terrier du Wa Wabbit', map: 'foret', level: 5, family: 'wabbit', boss: 'waWabbit',
    desc: 'Au fond du terrier, le roi des Wabbits et ses carottes geantes.',
    rooms: [['wabbit', 'wabbit'], ['wabbit', 'wabbit', 'wabbit'], ['wabbit', 'wabbit', 'waWabbit']],
  },
  {
    id: 'craqueleurs', name: 'Grotte du Craqueleur Legendaire', map: 'falaise', level: 8, family: 'craqueleur', boss: 'craqueleurLegendaire',
    desc: 'Un golem de cristal qui enracine ses proies. Craint l eau.',
    rooms: [['craqueleurSauvage', 'tofu'], ['craqueleurSauvage', 'craqueleurSauvage', 'tofu'], ['craqueleurSauvage', 'craqueleurLegendaire']],
  },
  {
    id: 'kwakwa', name: 'Canopee du Kwakwa', map: 'cascade', level: 11, family: 'kwakwa', boss: 'kwakwa',
    desc: 'Le Kwakwa change d element a chaque tour : frappe-le dans l element oppose !',
    rooms: [['crapaud', 'tofu', 'tofu'], ['crapaud', 'crapaud', 'tofuRoyal'], ['tofu', 'tofu', 'kwakwa']],
  },
  {
    id: 'minotoror', name: 'Labyrinthe du Minotoror', map: 'cimetiere', level: 14, family: 'minotoror', boss: 'minotoror',
    desc: 'Le Minotoror charge en ligne droite : ne reste pas aligne !',
    rooms: [['chafer', 'chafer'], ['chafer', 'chafer', 'chaferRoyal'], ['chafer', 'chafer', 'minotoror']],
  },
];

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
  const minion = base[0];
  for (let i = 1; i < heroCount; i++) base.unshift(minion);
  return base;
}
