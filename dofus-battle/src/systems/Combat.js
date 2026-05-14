// Application des effets d un sort.
// Toutes les fonctions sont pures vis a vis du DOM et renvoient
// une liste de "events" que la scene peut afficher (logs, animations).

import { randInt } from './Fighter.js';
import { tilesInArea, pushDirection, inBounds } from './Grid.js';

export function applySpell(state, caster, spell, targetTile) {
  const events = [];
  const affected = tilesInArea(spell.area || { type: 'single' }, targetTile);
  const fightersAt = (c, r) => state.fighters.find(f => f.alive && f.c === c && f.r === r);

  // teleport: deplace le caster sur la case cible (si libre)
  for (const eff of spell.effects) {
    if (eff.type === 'teleport') {
      const target = state.fighters.find(f => f.alive && f.c === targetTile.c && f.r === targetTile.r);
      const tileBlocked = state.map.tiles[targetTile.r][targetTile.c] === 1;
      if (!target && !tileBlocked) {
        events.push({ type: 'log', text: `${caster.name} bondit en (${targetTile.c}, ${targetTile.r}).` });
        caster.c = targetTile.c;
        caster.r = targetTile.r;
        // declencher pieges sur la nouvelle case
        triggerTrapsOn(state, caster, events);
      } else {
        events.push({ type: 'log', text: 'Case occupee, le bond echoue.' });
      }
      continue;
    }

    if (eff.type === 'trap') {
      // pose un piege sur la case cible (1 seul piege par case)
      state.traps = state.traps.filter(t => !(t.c === targetTile.c && t.r === targetTile.r));
      state.traps.push({
        c: targetTile.c, r: targetTile.r,
        min: eff.min, max: eff.max, element: eff.element,
        owner: caster.id, ownerTeam: caster.team,
      });
      events.push({ type: 'log', text: `${caster.name} pose un piege.` });
      events.push({ type: 'trap_placed', tile: targetTile });
      continue;
    }

    // Effets a zone
    for (const tile of affected) {
      const target = fightersAt(tile.c, tile.r);
      if (eff.type === 'damage') {
        if (!target) continue;
        if (target.isInvisible()) {
          target.consumeDodge();
          events.push({ type: 'log', text: `${target.name} esquive l attaque !` });
          continue;
        }
        const base = randInt(eff.min, eff.max);
        const dmg = Math.round(base * caster.damageMultiplier());
        const real = target.takeDamage(dmg);
        events.push({
          type: 'damage', target, amount: real,
          text: `${caster.name} inflige ${real} a ${target.name}${target.alive ? '' : ' (KO !)'}`,
        });
      } else if (eff.type === 'heal') {
        if (!target) continue;
        const amt = randInt(eff.min, eff.max);
        const real = target.heal(amt);
        events.push({
          type: 'heal', target, amount: real,
          text: `${caster.name} soigne ${target.name} de ${real} PV.`,
        });
      } else if (eff.type === 'buff') {
        if (!target) continue;
        target.buffs.push({ ...eff });
        events.push({
          type: 'buff', target,
          text: `${target.name} gagne un effet (${eff.stat} +${eff.value}).`,
        });
      } else if (eff.type === 'dot') {
        if (!target) continue;
        target.dots.push({ min: eff.min, max: eff.max, duration: eff.duration, casterId: caster.id });
        events.push({
          type: 'dot', target,
          text: `${target.name} est empoisonne (${eff.duration} tours).`,
        });
      } else if (eff.type === 'push') {
        if (!target) continue;
        const dir = pushDirection(caster, target);
        const slid = pushFighter(state, target, dir, eff.distance, events);
        events.push({ type: 'log', text: `${target.name} est repousse de ${slid} case(s).` });
      } else if (eff.type === 'lifesteal') {
        // applique apres avoir inflige les degats: somme des degats de ce sort
        const dmgEvents = events.filter(e => e.type === 'damage');
        const total = dmgEvents.reduce((s, e) => s + e.amount, 0);
        const heal = Math.round(total * eff.ratio);
        if (heal > 0) {
          caster.heal(heal);
          events.push({
            type: 'heal', target: caster, amount: heal,
            text: `${caster.name} se soigne de ${heal} PV.`,
          });
        }
      }
    }
  }
  return events;
}

function pushFighter(state, target, dir, distance, events) {
  let slid = 0;
  for (let i = 0; i < distance; i++) {
    const nc = target.c + dir.dc;
    const nr = target.r + dir.dr;
    if (!inBounds(nc, nr)) {
      // bute sur le bord -> degats de collision
      target.takeDamage(5);
      events.push({ type: 'damage', target, amount: 5, text: `${target.name} percute le bord (-5).` });
      return slid;
    }
    if (state.map.tiles[nr][nc] === 1) {
      target.takeDamage(5);
      events.push({ type: 'damage', target, amount: 5, text: `${target.name} percute un obstacle (-5).` });
      return slid;
    }
    const other = state.fighters.find(f => f.alive && f.c === nc && f.r === nr);
    if (other) {
      target.takeDamage(5);
      other.takeDamage(5);
      events.push({ type: 'damage', target, amount: 5, text: `Collision : ${target.name} et ${other.name} prennent 5.` });
      return slid;
    }
    target.c = nc;
    target.r = nr;
    slid++;
    triggerTrapsOn(state, target, events);
    if (!target.alive) return slid;
  }
  return slid;
}

export function triggerTrapsOn(state, fighter, events) {
  const idx = state.traps.findIndex(t => t.c === fighter.c && t.r === fighter.r);
  if (idx === -1) return;
  const trap = state.traps[idx];
  state.traps.splice(idx, 1);
  if (trap.ownerTeam === fighter.team) {
    events.push({ type: 'log', text: `${fighter.name} desamorce un piege allie.` });
    return;
  }
  const dmg = randInt(trap.min, trap.max);
  const real = fighter.takeDamage(dmg);
  events.push({
    type: 'damage', target: fighter, amount: real,
    text: `${fighter.name} declenche un piege ! (-${real})`,
  });
}
