import { CLASSES } from '../data/classes.js';
import { CREATURES } from '../data/creatures.js';
import { SPELLS } from '../data/spells.js';

export function getEntity(id) {
  return CLASSES[id] || CREATURES[id] || null;
}

let nextId = 1;

export class Fighter {
  constructor(classId, team, c, r, name = null) {
    const cls = getEntity(classId);
    this.id = nextId++;
    this.classId = classId;
    this.cls = cls;
    this.team = team;
    this.name = name || cls.name;
    this.maxHp = cls.hp;
    this.hp = cls.hp;
    this.maxPa = cls.pa;
    this.maxPm = cls.pm;
    this.pa = cls.pa;
    this.pm = cls.pm;
    this.initiative = cls.initiative + Math.random();
    this.c = c;
    this.r = r;
    this.alive = true;
    // buffs actifs: { stat, value, duration }
    this.buffs = [];
    // dot actifs: { min, max, duration, casterId }
    this.dots = [];
  }

  get spells() {
    return this.cls.spellIds.map(id => SPELLS[id]);
  }

  startTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
    // bonus PA temporaire (mot stimulant)
    for (const b of this.buffs) {
      if (b.stat === 'pa') this.pa += b.value;
    }
  }

  endTurn() {
    // Decrementer la duree des buffs et dots
    this.buffs = this.buffs.filter(b => --b.duration > 0);
    // les dots ont deja ete appliques au debut du tour de la cible
  }

  applyDots() {
    let total = 0;
    for (const d of this.dots) {
      const dmg = randInt(d.min, d.max);
      total += dmg;
      this.hp -= dmg;
    }
    this.dots = this.dots.filter(d => --d.duration > 0);
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return total;
  }

  damageMultiplier() {
    let m = 1;
    for (const b of this.buffs) {
      if (b.stat === 'damage') m += b.value;
    }
    return m;
  }

  armor() {
    let a = 0;
    for (const b of this.buffs) {
      if (b.stat === 'armor') a += b.value;
    }
    return a;
  }

  isInvisible() {
    return this.buffs.some(b => b.stat === 'dodge' && b.value > 0);
  }

  consumeDodge() {
    for (const b of this.buffs) {
      if (b.stat === 'dodge' && b.value > 0) {
        b.value = 0;
        b.duration = 0;
        return true;
      }
    }
    return false;
  }

  takeDamage(amount) {
    if (this.consumeDodge()) return 0;
    const real = Math.max(0, amount - this.armor());
    this.hp -= real;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return real;
  }

  heal(amount) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }
}

export function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
