import { SPELLS } from './Spells.js';

// Definitions des classes / creatures. spellIds liste les sorts dispo.
// `ai` decrit le caractere d un monstre (cf Game.runAI).
export const DEFS = {
  iop: {
    name: 'Iop',
    role: 'Guerrier',
    hp: 100, pa: 6, pm: 3, initiative: 12,
    spellIds: ['pression', 'bond', 'epeeDivine', 'concentration'],
  },
  bouftou: {
    name: 'Bouftou',
    role: 'Boule de laine',
    hp: 65, pa: 6, pm: 3, initiative: 10,
    spellIds: ['coupDeCorne'],
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
    this.name = def.name + (team === 'enemy' ? ' (E)' : '');
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.maxPa = def.pa;
    this.pa = def.pa;
    this.maxPm = def.pm;
    this.pm = def.pm;
    this.initiative = def.initiative + Math.random();
    this.alive = true;
    this.character = null;
    // Buffs actifs : { stat, value, duration }. duration en TOURS.
    this.buffs = [];
  }

  // Resout les ids en objets sorts (rafraichi a chaque acces, peu couteux).
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
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.alive = false;
    return amount;
  }

  heal(amount) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  damageMultiplier() {
    let mult = 1;
    for (const b of this.buffs) {
      if (b.stat === 'damage') mult += b.value;
    }
    return mult;
  }

  hasBuff(stat) {
    return this.buffs.some(b => b.stat === stat);
  }
}
