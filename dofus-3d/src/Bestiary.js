// ===========================================================================
// Bestiaire : chaque famille de monstres a sa carte et 3 a 4 membres de
// niveau FIXE (la force d un monstre depend de son niveau).
//   members : [sbire, variante, chef, royal / boss]
// Le palier choisi (1 a 10) ne change pas la force des creatures mais le
// nombre et la composition du groupe : palier 1 = 3 sbires, palier 2 =
// 2 sbires + 1 chef... palier 10 = plusieurs royaux.
// ===========================================================================

export const MONSTER_FAMILIES = {
  bouftou: { name: 'Bouftous', map: 'foret', members: ['bouftou', 'boufton', 'bouftouChef', 'bouftouRoyal'] },
  wabbit: { name: 'Wabbits', map: 'foret', members: ['wabbit', 'wabbitNoir', 'wabbitSquelette', 'waWabbit'] },
  crapaud: { name: 'Crapauds', map: 'cascade', members: ['crapaud', 'crapaudVenimeux', 'crapaudMage', 'crapaudChef'] },
  tofu: { name: 'Tofus', map: 'falaise', members: ['tofu', 'tofuNoir', 'tofuMalefique', 'tofuRoyal'] },
  chafer: { name: 'Chafers', map: 'cimetiere', members: ['chafer', 'chaferArcher', 'chaferElite', 'chaferRoyal'] },
  champignon: { name: 'Champignons', map: 'marais', members: ['champignon', 'champChamp', 'champignonMutant', 'champignonRoyal'] },
  craqueleur: { name: 'Craqueleurs', map: 'falaise', members: ['craqueleurSauvage', 'craqueleurPlaines', 'craqueleurAncien', 'craqueleurLegendaire'] },
  kwakwa: { name: 'Kwaks', map: 'cascade', members: ['kwakFlamme', 'kwakGlace', 'kwakVent', 'kwakwa'] },
  minotoror: { name: 'Labyrinthe', map: 'cimetiere', members: ['mominotor', 'mominotor', 'gardienLabyrinthe', 'minotoror'] },
};

// Combat (id du menu) -> famille.
export const COMBAT_FAMILY = {
  bouftou: 'bouftou', wabbit: 'wabbit', crapaud: 'crapaud', tofu: 'tofu', chafer: 'chafer',
  champignon: 'champignon', craqueleurLegendaire: 'craqueleur', kwakwa: 'kwakwa', minotoror: 'minotoror',
};

// Monstre -> famille.
export const FAMILY_OF_MONSTER = {};
for (const [fam, f] of Object.entries(MONSTER_FAMILIES)) for (const id of f.members) FAMILY_OF_MONSTER[id] = fam;

// Composition des paliers : indices dans members (0 sbire, 1 variante,
// 2 chef, 3 royal / boss).
const TIERS = [
  [0, 0, 0],
  [0, 0, 2],
  [0, 1, 1, 0],
  [0, 1, 2, 0],
  [1, 1, 2, 2],
  [0, 1, 2, 3],
  [1, 1, 2, 2, 3],
  [1, 2, 2, 2, 3],
  [1, 2, 2, 3, 3],
  [2, 2, 3, 3, 3],
];
export const MAX_TIER = TIERS.length;

// Liste des monstres d un palier pour `heroCount` heros (un monstre de
// plus par heros supplementaire, pris parmi les plus faibles du palier).
export function tierComposition(familyId, tier, heroCount = 1) {
  const f = MONSTER_FAMILIES[familyId] || MONSTER_FAMILIES.bouftou;
  const t = TIERS[Math.max(1, Math.min(MAX_TIER, tier)) - 1];
  const comp = t.map(i => f.members[i]);
  const extra = Math.min(...t);
  for (let h = 1; h < heroCount; h++) comp.unshift(f.members[Math.min(extra + 1, 2)]);
  return comp;
}

// ---------------------------------------------------------------------------
// Evolutions et tranches de niveau (exploration des regions).
// Chaque evolution de la famille (sbire, variante, chef, royal) ouvre une
// TRANCHE : les groupes de la tranche k sont menes par l evolution k,
// accompagnee de l evolution precedente. Tranche 1 = sbires seuls,
// derniere tranche = chefs + royal.
// ---------------------------------------------------------------------------
// Evolutions distinctes d une famille, de la plus faible a la plus forte.
export function familyEvolutions(familyId) {
  const f = MONSTER_FAMILIES[familyId] || MONSTER_FAMILIES.bouftou;
  return f.members.filter((m, i, a) => a.indexOf(m) === i);
}

export function bandCount(familyId) {
  return familyEvolutions(familyId).length;
}

// Composition d un groupe de la tranche `band` (1..n). `size` : 0 petit,
// 1 moyen, 2 grand. Un monstre de plus par heros supplementaire (pris
// dans l evolution precedente). a = evolution de la tranche, b = la
// precedente, c = celle d avant.
const BAND_FIRST = [['a', 'a'], ['a', 'a', 'a'], ['a', 'a', 'a', 'a']];
const BAND_MID = [['b', 'a'], ['b', 'b', 'a'], ['b', 'b', 'a', 'a']];
const BAND_LAST = [['b', 'a'], ['b', 'b', 'a'], ['c', 'b', 'b', 'a']];
export function bandComposition(familyId, band, size = 1, heroCount = 1) {
  const evo = familyEvolutions(familyId);
  const n = evo.length;
  const k = Math.max(1, Math.min(n, band)) - 1;
  const pick = { a: evo[k], b: evo[Math.max(0, k - 1)], c: evo[Math.max(0, k - 2)] };
  const tpl = (k === 0 ? BAND_FIRST : k === n - 1 ? BAND_LAST : BAND_MID)[Math.max(0, Math.min(2, size))];
  const comp = tpl.map(x => pick[x]);
  for (let h = 1; h < heroCount; h++) comp.unshift(pick.b);
  return comp;
}

// Palier (ancien systeme, 1..10) equivalent a une tranche vaincue : sert
// a relire les anciennes sauvegardes et a les garder a jour.
export function bandTierThresholds(familyId) {
  return bandCount(familyId) >= 4 ? [1, 3, 5, 6] : [1, 4, 6];
}
