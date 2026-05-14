import { SPELLS } from './Spells.js';

// Definitions des classes / creatures.
// `ai` decrit le caractere autonome (cf Game.runAI). Un Craqueleur (invocation)
// est sur l equipe 'player' mais a ai='aggressive' : il joue tout seul.
export const DEFS = {
  iop: {
    name: 'Iop',
    role: 'Guerrier',
    hp: 100, pa: 8, pm: 4, initiative: 12,
    spellIds: ['pression', 'bond', 'epeeDivine', 'concentration'],
  },
  osamodas: {
    name: 'Osamodas',
    role: 'Invocateur',
    hp: 95, pa: 8, pm: 4, initiative: 11,
    spellIds: ['invocationCraqueleur', 'piqureMotivante', 'protectionCraqueleur', 'soinInvocation'],
  },
  bouftou: {
    name: 'Bouftou',
    role: 'Meute',
    hp: 55, pa: 5, pm: 4, initiative: 10,
    spellIds: ['morsureBouftou'],
    ai: 'aggressive',
  },
  bouftouRoyal: {
    name: 'Bouftou Royal',
    role: 'Chef de meute',
    hp: 160, pa: 7, pm: 3, initiative: 9,
    spellIds: ['morsureRoyale', 'soinAnimal'],
    ai: 'aggressive',
  },
  craqueleur: {
    name: 'Craqueleur',
    role: 'Invocation',
    hp: 80, pa: 5, pm: 3, initiative: 8,
    spellIds: ['frappeCraqueleur', 'lancerRocher'],
    ai: 'aggressive',
  },
};

export class Fighter {
  constructor(classId, team, c, r) {
    const def = DEFS[classId];
    if (!def) throw new Error('Unknown classId ' + classId);
    this.classId = classId;
    this.def = def;
    this.team = team;
    this.c = c;
    this.r = r;
    // Marque les invocations (Craqueleur) avec un suffixe lisible.
    this.isSummon = def.role === 'Invocation';
    this.name = def.name
      + (team === 'enemy' ? ' (E)' : (this.isSummon ? ' (Invoc.)' : ''));
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.maxPa = def.pa;
    this.pa = def.pa;
    this.maxPm = def.pm;
    this.pm = def.pm;
    this.initiative = def.initiative + Math.random();
    this.alive = true;
    this.character = null;
    // Buffs : { duration, damageMult?, bonusPa?, bonusPm?, shield? }
    this.buffs = [];
    // Cooldown des sorts : { [spellId]: tours restants }
    this.spellCooldowns = {};
  }

  get spells() {
    return this.def.spellIds.map(id => SPELLS[id]).filter(Boolean);
  }

  startTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
    // Decremente la duree des buffs ; retire ceux a 0.
    this.buffs = this.buffs
      .map(b => ({ ...b, duration: b.duration - 1 }))
      .filter(b => b.duration > 0);
    // Applique les bonus PA / PM des buffs encore actifs.
    for (const b of this.buffs) {
      if (b.bonusPa) this.pa += b.bonusPa;
      if (b.bonusPm) this.pm += b.bonusPm;
    }
    // Decremente les cooldowns des sorts.
    for (const id in this.spellCooldowns) {
      this.spellCooldowns[id] = Math.max(0, this.spellCooldowns[id] - 1);
    }
  }

  takeDamage(amount) {
    let dmg = amount;
    // Reductions cumulatives multiplicatives des boucliers actifs.
    for (const b of this.buffs) {
      if (b.shield) dmg *= (1 - b.shield);
    }
    dmg = Math.max(0, Math.round(dmg));
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) this.alive = false;
    return dmg;
  }

  heal(amount) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  damageMultiplier() {
    let mult = 1;
    for (const b of this.buffs) {
      if (b.damageMult) mult += b.damageMult;
    }
    return mult;
  }

  isOnCooldown(spellId) {
    return (this.spellCooldowns[spellId] || 0) > 0;
  }

  setCooldown(spellId, turns) {
    if (turns) this.spellCooldowns[spellId] = turns;
  }
}
