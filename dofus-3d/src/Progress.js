// Progression du joueur : pour chaque couple (classe, combat), on
// retient la meilleure etoile obtenue.
//   - 'gold'   : monstre vaincu sur sa carte maison.
//   - 'silver' : monstre vaincu sur une autre carte.
// Objectif : battre tous les monstres avec tous les heros.

const KEY = 'dofus3d.progress';

export function getProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (_) {}
}

// Etoile obtenue pour (classe, combat) : 'gold' | 'silver' | null.
export function getStar(classId, combatId) {
  const p = getProgress();
  return (p[classId] && p[classId][combatId]) || null;
}

// Enregistre une victoire. L or ecrase tout ; l argent n ecrit que
// si rien n etait deja acquis (on ne degrade jamais une etoile d or).
export function recordWin(classId, combatId, result) {
  if (result !== 'gold' && result !== 'silver') return;
  const p = getProgress();
  if (!p[classId]) p[classId] = {};
  const cur = p[classId][combatId];
  if (result === 'gold' || !cur) {
    p[classId][combatId] = result;
    save(p);
  }
}

// Bilan global sur l ensemble des couples (classes x combats).
export function countStars(classIds, combatIds) {
  const p = getProgress();
  let gold = 0, silver = 0;
  for (const cls of classIds) {
    for (const cmb of combatIds) {
      const s = p[cls] && p[cls][cmb];
      if (s === 'gold') gold++;
      else if (s === 'silver') silver++;
    }
  }
  return { gold, silver, done: gold + silver, total: classIds.length * combatIds.length };
}

// ---------------------------------------------------------------------------
// Paliers de monstres : pour chaque combat, meilleur palier vaincu.
// Palier t => monstres de niveau 2t-1 (1, 3, 5, ... 19). Battre le
// palier t debloque le palier t+1.
// ---------------------------------------------------------------------------
const TIER_KEY = 'dofus3d.tiers';
export const MAX_TIER = 10;
export const tierToLevel = (t) => 2 * t - 1;

function loadTiers() {
  try { return JSON.parse(localStorage.getItem(TIER_KEY) || '{}') || {}; } catch (_) { return {}; }
}

export function getBestTier(combatId) {
  return loadTiers()[combatId] || 0;
}

export function recordTier(combatId, tier) {
  const t = loadTiers();
  if ((t[combatId] || 0) < tier) {
    t[combatId] = tier;
    try { localStorage.setItem(TIER_KEY, JSON.stringify(t)); } catch (_) {}
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Tranches d evolution (exploration) : pour chaque region, plus haute
// tranche vaincue (1 = sbires ... n = groupe royal). Les anciennes
// sauvegardes ne connaissent que les paliers : `thresholds[k-1]` est le
// palier qui vaut la tranche k, on prend le meilleur des deux.
// ---------------------------------------------------------------------------
const BAND_KEY = 'dofus3d.bands';

function loadBands() {
  try { return JSON.parse(localStorage.getItem(BAND_KEY) || '{}') || {}; } catch (_) { return {}; }
}

export function getBestBand(combatId, thresholds = [1, 3, 5, 6]) {
  const tier = getBestTier(combatId);
  let fromTier = 0;
  thresholds.forEach((t, i) => { if (tier >= t) fromTier = i + 1; });
  return Math.min(thresholds.length, Math.max(loadBands()[combatId] || 0, fromTier));
}

// Enregistre une tranche vaincue. Renvoie true si c est un nouveau record.
export function recordBand(combatId, band, thresholds = [1, 3, 5, 6]) {
  const before = getBestBand(combatId, thresholds);
  const b = loadBands();
  if ((b[combatId] || 0) < band) {
    b[combatId] = band;
    try { localStorage.setItem(BAND_KEY, JSON.stringify(b)); } catch (_) {}
  }
  // Garde l ancien compteur de paliers coherent.
  if (thresholds[band - 1]) recordTier(combatId, thresholds[band - 1]);
  return band > before;
}
