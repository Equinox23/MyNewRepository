import { SPELLS } from './Spells.js';

// Definitions des classes / creatures.
// `ai` decrit le caractere autonome (cf Game.runAI).
// `isAquatic` autorise la traversee des cases d eau (cf BFS).
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
    hp: 100, pa: 8, pm: 4, initiative: 11,
    spellIds: ['invocationCraqueleur', 'piqureMotivante', 'protectionCraqueleur', 'soinInvocation'],
  },
  roublard: {
    name: 'Roublard',
    role: 'Artificier',
    hp: 100, pa: 8, pm: 4, initiative: 13,
    spellIds: ['poserBombe', 'alimentationBombe', 'detonationManuelle', 'bouclierBombe'],
  },
  bombeRoublard: {
    name: 'Bombe',
    role: 'Bombe',
    hp: 50, pa: 0, pm: 0, initiative: 0,
    spellIds: [],
    // Drapeaux specifiques aux bombes.
    isBomb: true,
    fuseMax: 3,           // explose apres 3 tours du proprietaire
    bombDamage: 50,       // degats de base
    bombDamageGrowth: 0.75, // +75% par tour ecoule (additif sur la base)
    bombArea: { type: 'cross', size: 1 },
  },
  bouftou: {
    name: 'Bouftou',
    role: 'Meute',
    hp: 150, pa: 5, pm: 4, initiative: 10,
    spellIds: ['morsureBouftou'],
    ai: 'aggressive',
  },
  bouftouRoyal: {
    name: 'Bouftou Royal',
    role: 'Chef de meute',
    hp: 400, pa: 7, pm: 5, initiative: 9,
    spellIds: ['morsureRoyale', 'soinAnimal'],
    ai: 'aggressive',
  },
  craqueleur: {
    name: 'Craqueleur',
    role: 'Invocation',
    hp: 80, pa: 6, pm: 3, initiative: 8,
    spellIds: ['frappeCraqueleur', 'lancerRocher'],
    ai: 'aggressive',
  },
  crapaud: {
    name: 'Crapaud',
    role: 'Crachat',
    hp: 130, pa: 4, pm: 3, initiative: 11,
    spellIds: ['crachat'],
    ai: 'fearful',
    isAquatic: true,
  },
  crapaudChef: {
    name: 'Crapaud Chef',
    role: 'Maitre des crapauds',
    hp: 220, pa: 6, pm: 3, initiative: 10,
    spellIds: ['crachatEmpoisonne', 'peauDure'],
    ai: 'fearful',
    isAquatic: true,
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
    // Buffs : { duration, damageMult?, bonusPa?, bonusPm?, shield?, dot?, permanent? }
    this.buffs = [];
    this.spellCooldowns = {};
    // Specifique aux bombes posees par le Roublard.
    this.isBomb = !!def.isBomb;
    this.bombAge = 0;
    this.bombOwner = null;  // reference vers le combattant qui l a posee
  }

  get spells() {
    return this.def.spellIds.map(id => SPELLS[id]).filter(Boolean);
  }

  // Max effectif PA / PM = base + buffs additifs. Sert a l affichage
  // "6/9" plutot que "9/6" quand on a recu un bonus.
  get effectiveMaxPa() {
    let max = this.maxPa;
    for (const b of this.buffs) if (b.bonusPa) max += b.bonusPa;
    return max;
  }
  get effectiveMaxPm() {
    let max = this.maxPm;
    for (const b of this.buffs) if (b.bonusPm) max += b.bonusPm;
    return max;
  }

  startTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
    // Decremente la duree des buffs non permanents.
    this.buffs = this.buffs
      .map(b => b.permanent ? b : { ...b, duration: b.duration - 1 })
      .filter(b => b.permanent || b.duration > 0);
    // Applique les bonus PA / PM des buffs actifs (au-dessus du max).
    for (const b of this.buffs) {
      if (b.bonusPa) this.pa += b.bonusPa;
      if (b.bonusPm) this.pm += b.bonusPm;
    }
    // Decremente les cooldowns.
    for (const id in this.spellCooldowns) {
      this.spellCooldowns[id] = Math.max(0, this.spellCooldowns[id] - 1);
    }
  }

  // Applique les DoT actifs et renvoie le total de degats subis ce tour.
  // Appele par Game.startTurn pour pouvoir gerer la mort eventuelle.
  tickDots() {
    let total = 0;
    for (const b of this.buffs) {
      if (b.dot) {
        const dmg = b.dot.min + Math.floor(Math.random() * (b.dot.max - b.dot.min + 1));
        const actual = this.takeDamage(dmg);
        total += actual;
        if (!this.alive) break;
      }
    }
    return total;
  }

  takeDamage(amount) {
    let dmg = amount;
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
