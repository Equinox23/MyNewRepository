// IA des combattants ennemis. Strategie simple mais reactive:
//  1. Si bas PV et sort de soin sur soi disponible -> se soigner
//  2. Si un allie est bas PV et a portee de soin -> le soigner
//  3. Sinon: choisir la cible la plus proche, se rapprocher, lancer le sort
//     d attaque le plus rentable disponible.
// L IA renvoie une sequence d actions a executer dans l ordre :
//   { type: 'move', path }
//   { type: 'cast', spell, target }
//   { type: 'end' }

import { bfs, pathTo, hasLineOfSight, manhattan, tilesInRange, inLine } from './Grid.js';

export function planTurn(state, ai) {
  const actions = [];
  const occupied = computeOccupied(state, ai);

  let working = { c: ai.c, r: ai.r, pa: ai.pa, pm: ai.pm };

  // (1) Auto-soin si bas PV
  if (ai.hp < ai.maxHp * 0.4) {
    const healSelf = ai.spells.find(s =>
      s.target === 'self' || (s.target === 'ally' && s.range.min === 0)
    );
    const heal = ai.spells.find(s => s.effects.some(e => e.type === 'heal') && (s.target === 'self' || s.target === 'ally'));
    if (heal && working.pa >= heal.apCost && heal.range.min === 0) {
      actions.push({ type: 'cast', spell: heal, target: { c: working.c, r: working.r } });
      working.pa -= heal.apCost;
    }
  }

  // (2) Sinon, soigner un allie en danger
  const allies = state.fighters.filter(f => f.alive && f.team === ai.team && f.id !== ai.id);
  const woundedAlly = allies
    .filter(a => a.hp < a.maxHp * 0.5)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (woundedAlly) {
    const heal = ai.spells.find(s => s.effects.some(e => e.type === 'heal') && s.target === 'ally');
    if (heal && working.pa >= heal.apCost) {
      const dist = manhattan(working, woundedAlly);
      if (dist >= heal.range.min && dist <= heal.range.max &&
          (!heal.needsLOS || hasLineOfSight(state.map.tiles, occupied, working, woundedAlly))) {
        actions.push({ type: 'cast', spell: heal, target: { c: woundedAlly.c, r: woundedAlly.r } });
        working.pa -= heal.apCost;
      }
    }
  }

  // (3) Boucle d attaque: tant qu il reste des PA, attaquer ou s approcher
  let safety = 6;
  while (safety-- > 0) {
    const enemies = state.fighters.filter(f => f.alive && f.team !== ai.team);
    if (enemies.length === 0) break;

    // chercher un sort d attaque utilisable maintenant
    const cast = chooseAttack(state, ai, working, occupied, enemies);
    if (cast) {
      actions.push({ type: 'cast', spell: cast.spell, target: cast.target });
      working.pa -= cast.spell.apCost;
      // si la cible meurt potentiellement, on continue la boucle pour
      // chercher une nouvelle cible
      continue;
    }

    // sinon: se rapprocher de l ennemi le plus proche dans la limite des PM
    if (working.pm <= 0) break;
    const target = enemies
      .map(e => ({ e, d: manhattan(working, e) }))
      .sort((a, b) => a.d - b.d)[0].e;
    const move = approachTarget(state, working, target, occupied);
    if (!move || move.length <= 1) break;
    const stepCount = Math.min(move.length - 1, working.pm);
    const truncated = move.slice(0, stepCount + 1);
    actions.push({ type: 'move', path: truncated });
    const last = truncated[truncated.length - 1];
    working.c = last.c;
    working.r = last.r;
    working.pm -= stepCount;
  }

  actions.push({ type: 'end' });
  return actions;
}

function computeOccupied(state, exclude) {
  const occ = new Set();
  for (const f of state.fighters) {
    if (!f.alive) continue;
    if (exclude && f.id === exclude.id) continue;
    occ.add(`${f.c},${f.r}`);
  }
  return occ;
}

function chooseAttack(state, ai, working, occupied, enemies) {
  const candidates = [];
  for (const spell of ai.spells) {
    if (working.pa < spell.apCost) continue;
    if (!spell.effects.some(e => e.type === 'damage' || e.type === 'dot')) continue;
    if (spell.target !== 'enemy' && spell.target !== 'tile') continue;

    for (const enemy of enemies) {
      const dist = manhattan(working, enemy);
      if (dist < spell.range.min || dist > spell.range.max) continue;
      if (spell.inLine && !inLine(working, enemy)) continue;
      if (spell.needsLOS && !hasLineOfSight(state.map.tiles, occupied, working, enemy)) continue;

      // score = degats moyens + bonus si tue la cible + penalite cout
      const dmg = spell.effects
        .filter(e => e.type === 'damage')
        .reduce((s, e) => s + (e.min + e.max) / 2, 0);
      const dot = spell.effects
        .filter(e => e.type === 'dot')
        .reduce((s, e) => s + (e.min + e.max) / 2 * e.duration, 0);
      let score = dmg + dot;
      if (dmg >= enemy.hp) score += 50;
      score -= spell.apCost * 0.5;
      candidates.push({ spell, target: { c: enemy.c, r: enemy.r }, score });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function approachTarget(state, working, target, occupied) {
  // BFS depuis la position courante, on cherche le voisin de target
  // (case adjacente) accessible le plus proche.
  const start = { c: working.c, r: working.r };
  const result = bfs(state.map.tiles, occupied, start, working.pm + 12);
  // candidats: cases voisines de target
  const goals = [
    { c: target.c + 1, r: target.r },
    { c: target.c - 1, r: target.r },
    { c: target.c, r: target.r + 1 },
    { c: target.c, r: target.r - 1 },
  ];
  let best = null;
  for (const g of goals) {
    const k = `${g.c},${g.r}`;
    if (!result.dist.has(k)) continue;
    const d = result.dist.get(k);
    if (best === null || d < best.d) best = { g, d };
  }
  if (!best) return null;
  return pathTo(result, best.g);
}
