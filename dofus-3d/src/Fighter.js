// Definitions des classes / creatures dispos dans la V2.
// Stats simples + portee melee (1 case).
export const DEFS = {
  iop: {
    name: 'Iop',
    role: 'Guerrier',
    hp: 100, pa: 6, pm: 3, initiative: 12,
    attack: { name: 'Pression', apCost: 3, range: 1, dmgMin: 12, dmgMax: 18 },
  },
  bouftou: {
    name: 'Bouftou',
    role: 'Boule de laine',
    hp: 65, pa: 6, pm: 3, initiative: 10,
    attack: { name: 'Coup de Corne', apCost: 3, range: 1, dmgMin: 8, dmgMax: 12 },
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
    this.character = null; // Character3D ref set par Game
  }

  startTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.alive = false;
    return amount;
  }
}
