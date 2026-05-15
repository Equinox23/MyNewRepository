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
