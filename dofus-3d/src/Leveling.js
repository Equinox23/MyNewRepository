import { SPELLS } from './Spells.js';

// ===========================================================================
// Progression des heros facon Dofus
//  - Niveau 1 a 20, XP gagnee en battant des monstres (plus le monstre
//    est haut niveau, plus il rapporte ; un monstre trop faible rapporte
//    peu).
//  - Chaque niveau gagne donne 1 point de sort (+1 bonus aux niveaux 5,
//    10, 15, 20). On commence avec 1 point.
//  - Les 8 sorts de chaque classe se debloquent au fil des niveaux.
//  - Chaque sort a 3 niveaux de puissance : 1 -> 2 coute 1 point,
//    2 -> 3 coute 2 points.
//  - Les stats du heros montent avec son niveau (PV, degats +6%/niv.,
//    +1 PA au niv. 10, +1 PM au niv. 16).
//  - Les monstres ont aussi un niveau (1 a 19) qui augmente leurs PV et
//    leurs degats.
// Tout est sauvegarde dans le navigateur (localStorage).
// ===========================================================================

export const MAX_LEVEL = 20;
// Niveau auquel se debloque chacun des 8 sorts (dans l ordre de la classe).
export const UNLOCK_LEVELS = [1, 1, 1, 1, 2, 4, 6, 9];
// Cout pour passer au niveau de sort suivant : index = niveau actuel.
export const UPGRADE_COST = { 1: 1, 2: 2 };
export const MAX_SPELL_LEVEL = 3;

const KEY = 'dofus3d.heroes';

// XP necessaire pour passer du niveau L au niveau L+1.
export function xpToNext(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.round(60 + level * 45 + level * level * 6);
}

function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { return {}; }
}
function saveAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (_) {}
}

// Profil d un heros : { level, xp, points, spellLevels: { id: 1..3 } }.
export function getHero(classId) {
  const all = loadAll();
  const h = all[classId] || {};
  return {
    level: Math.max(1, Math.min(MAX_LEVEL, h.level || 1)),
    xp: h.xp || 0,
    points: h.points !== undefined ? h.points : 1,
    spellLevels: h.spellLevels || {},
  };
}

function saveHero(classId, hero) {
  const all = loadAll();
  all[classId] = hero;
  saveAll(all);
}

export function resetHero(classId) {
  const all = loadAll();
  delete all[classId];
  saveAll(all);
}

// Liste ordonnee des sorts d une classe avec leur statut pour ce heros.
export function heroSpells(classId, spellIds) {
  const hero = getHero(classId);
  return spellIds.map((id, i) => {
    const unlockAt = UNLOCK_LEVELS[i] || 1;
    const unlocked = hero.level >= unlockAt;
    const level = unlocked ? Math.min(MAX_SPELL_LEVEL, hero.spellLevels[id] || 1) : 0;
    const cost = level > 0 && level < MAX_SPELL_LEVEL ? UPGRADE_COST[level] : null;
    return { id, spell: SPELLS[id], unlockAt, unlocked, level, cost, canUpgrade: cost !== null && hero.points >= cost };
  });
}

// Ameliore un sort (si assez de points). Renvoie true si c est fait.
export function upgradeSpell(classId, spellId, spellIds) {
  const list = heroSpells(classId, spellIds);
  const entry = list.find(e => e.id === spellId);
  if (!entry || !entry.canUpgrade) return false;
  const hero = getHero(classId);
  hero.points -= entry.cost;
  hero.spellLevels[spellId] = entry.level + 1;
  saveHero(classId, hero);
  return true;
}

// Remet a zero les ameliorations (les points sont rendus).
export function resetSpellPoints(classId) {
  const hero = getHero(classId);
  let refund = 0;
  for (const lv of Object.values(hero.spellLevels)) {
    if (lv >= 2) refund += UPGRADE_COST[1];
    if (lv >= 3) refund += UPGRADE_COST[2];
  }
  hero.points += refund;
  hero.spellLevels = {};
  saveHero(classId, hero);
  return refund;
}

// Ajoute de l XP. Renvoie { gained, levelsGained, newLevel, pointsGained, unlocked[] }.
export function addXp(classId, amount, spellIds = []) {
  const hero = getHero(classId);
  const before = hero.level;
  hero.xp += Math.max(0, Math.round(amount));
  let pointsGained = 0;
  while (hero.level < MAX_LEVEL && hero.xp >= xpToNext(hero.level)) {
    hero.xp -= xpToNext(hero.level);
    hero.level++;
    const pts = 1 + (hero.level % 5 === 0 ? 1 : 0);
    hero.points += pts;
    pointsGained += pts;
  }
  if (hero.level >= MAX_LEVEL) hero.xp = 0;
  saveHero(classId, hero);
  const unlocked = spellIds.filter((id, i) => {
    const at = UNLOCK_LEVELS[i] || 1;
    return at > before && at <= hero.level;
  });
  return { gained: Math.round(amount), levelsGained: hero.level - before, newLevel: hero.level, pointsGained, unlocked };
}

// ---------------------------------------------------------------------------
// Stats par niveau
// ---------------------------------------------------------------------------
export function heroStats(def, level) {
  return {
    hp: Math.round(def.hp * (1 + 0.07 * (level - 1))),
    pa: def.pa + (level >= 10 ? 1 : 0),
    pm: def.pm + (level >= 16 ? 1 : 0),
    damage: 1 + 0.06 * (level - 1),
  };
}

export function monsterStats(def, level) {
  return {
    hp: Math.round(def.hp * (1 + 0.14 * (level - 1))),
    pa: def.pa + (level >= 13 ? 1 : 0),
    pm: def.pm,
    damage: 1 + 0.08 * (level - 1),
  };
}

// Bonus d une invocation selon le niveau du sort qui l a appelee :
// niv. 2 : +20% PV / degats, sorts niv. 2 ; niv. 3 : +40%, +1 PA, +1 PM,
// sorts niv. 3.
export function summonBonus(summonLevel = 1) {
  const lv = Math.max(1, Math.min(MAX_SPELL_LEVEL, summonLevel));
  return {
    level: lv,
    mult: 1 + 0.2 * (lv - 1),
    pa: lv >= 3 ? 1 : 0,
    pm: lv >= 3 ? 1 : 0,
  };
}

// XP rapportee par un monstre vaincu, pour un heros de niveau heroLevel.
export function monsterXp(def, level, heroLevel) {
  const base = Math.round(def.hp / 4 + (def.pa + def.pm) * 2);
  const lvl = base * (1 + 0.3 * (level - 1));
  // Un monstre bien plus faible que le heros rapporte moins (min 20%),
  // un monstre plus fort rapporte un bonus (max +50%).
  const diff = level - heroLevel;
  const factor = Math.max(0.2, Math.min(1.5, 1 + diff * 0.08));
  return Math.round(lvl * factor);
}

// ---------------------------------------------------------------------------
// Puissance des sorts : copie du sort avec ses valeurs a un niveau donne.
//   niv. 2 : x1.25 sur degats / soins, +1 portee (sorts a distance)
//   niv. 3 : x1.55, recharge -1, effets secondaires renforces
//   `extraMult` : multiplicateur de degats supplementaire (monstres).
// ---------------------------------------------------------------------------
const POWER = [1, 1, 1.25, 1.55];

export function scaledSpell(spell, level = 1, extraMult = 1) {
  if (!spell) return spell;
  const lv = Math.max(1, Math.min(MAX_SPELL_LEVEL, level));
  if (lv === 1 && extraMult === 1) return spell;
  const k = POWER[lv] * extraMult;
  const s = { ...spell, spellLevel: lv, range: { ...spell.range } };
  if (lv >= 2 && spell.range.max > 1 && spell.target !== 'self') s.range.max = spell.range.max + 1;
  if (lv >= 3 && spell.cooldown && spell.cooldown > 1) s.cooldown = spell.cooldown - 1;
  s.effects = spell.effects.map(e => {
    const x = { ...e };
    const mul = (v) => Math.max(1, Math.round(v * k));
    switch (e.type) {
      case 'damage':
      case 'heal':
      case 'dot':
        if (x.min !== undefined) x.min = mul(x.min);
        if (x.max !== undefined) x.max = mul(x.max);
        break;
      case 'heal_percent':
        x.percent = Math.min(0.9, +(e.percent * (1 + (lv - 1) * 0.2)).toFixed(2));
        break;
      case 'chanceStrike':
        x.dmgMin = mul(e.dmgMin); x.dmgMax = mul(e.dmgMax);
        x.healMin = mul(e.healMin); x.healMax = mul(e.healMax);
        break;
      case 'buff':
        if (e.damageMult) x.damageMult = +(e.damageMult * (1 + (lv - 1) * 0.25)).toFixed(2);
        if (e.shield) x.shield = Math.min(0.75, +(e.shield + (lv - 1) * 0.08).toFixed(2));
        if (lv >= 3 && e.bonusPa) x.bonusPa = e.bonusPa + 1;
        if (lv >= 3 && e.bonusPm) x.bonusPm = e.bonusPm + 1;
        if (lv >= 3 && e.duration) x.duration = e.duration + 1;
        break;
      case 'knockback':
        if (lv >= 3) x.distance = e.distance + 1;
        break;
      case 'debuff_pm':
        if (lv >= 3 && e.value) x.value = e.value + 1;
        break;
      case 'debuff_pa':
        if (lv >= 3 && e.value) x.value = e.value + 1;
        if (lv >= 3 && e.max) x.max = e.max + 1;
        break;
      case 'gainPa':
        if (lv >= 3) x.amount = e.amount + 1;
        break;
      case 'summon':
        // La creature invoquee profite du niveau du sort (cf. summonBonus).
        x.summonLevel = lv;
        break;
    }
    return x;
  });
  return s;
}
