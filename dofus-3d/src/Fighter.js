import { SPELLS } from './Spells.js';
import { heroStats, monsterStats, scaledSpell, summonBonus, UNLOCK_LEVELS } from './Leveling.js';

// Definitions des classes / creatures.
// `ai` decrit le caractere autonome (cf Game.runAI).
// `isAquatic` autorise la traversee des cases d eau (cf BFS).
export const DEFS = {
  iop: {
    name: 'Iop',
    role: 'Guerrier',
    hp: 100, pa: 8, pm: 4, initiative: 12,
    spellIds: ['pression', 'bond', 'concentration', 'intimidation', 'epeeDivine', 'precipitation', 'epeeDuJugement', 'colereDeIop'],
  },
  osamodas: {
    name: 'Osamodas',
    role: 'Invocateur',
    hp: 100, pa: 8, pm: 4, initiative: 11,
    spellIds: ['invocationCraqueleur', 'fouetOsamodas', 'soinInvocation', 'piqureMotivante', 'invocationDragounet', 'protectionCraqueleur', 'invocationBouftou', 'criDeLaBete'],
  },
  roublard: {
    name: 'Roublard',
    role: 'Artificier',
    hp: 100, pa: 8, pm: 4, initiative: 13,
    spellIds: ['poserBombe', 'detonationManuelle', 'kaboom', 'entourloupe', 'pulsar', 'bouclierBombe', 'tromblon', 'fourberie'],
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
    // L explosion couvre un disque Manhattan de rayon 2 (13 cases) et
    // touche allies comme ennemis.
    bombArea: { type: 'circle', radius: 2 },
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
    ai: 'craqueleur',
  },
  dragounetRouge: {
    name: 'Dragounet Rouge',
    role: 'Invocation',
    hp: 70, pa: 5, pm: 3, initiative: 8,
    spellIds: ['dragoflamme', 'dragosoin'],
    ai: 'dragounet',
  },
  bouftouInvoc: {
    name: 'Bouftou apprivoise',
    role: 'Invocation',
    hp: 90, pa: 5, pm: 4, initiative: 9,
    spellIds: ['morsureBouftou'],
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

  // ---------- HEROS ----------
  xelor: {
    name: 'Xelor',
    role: 'Maitre du temps',
    hp: 100, pa: 8, pm: 4, initiative: 10,
    spellIds: ['aiguille', 'horloge', 'frappeDuXelor', 'ralentissement', 'rembobinage', 'devouement', 'sablier', 'momification'],
  },
  ecaflip: {
    name: 'Ecaflip',
    role: 'Joueur',
    hp: 100, pa: 8, pm: 4, initiative: 12,
    spellIds: ['griffeFeline', 'pileOuFace', 'bondDuFelin', 'reflexes', 'roueChance', 'invocationChaton', 'trefle', 'toutOuRien'],
  },
  chatonBlanc: {
    name: 'Chaton Blanc',
    role: 'Invocation',
    hp: 100, pa: 7, pm: 5, initiative: 12,
    spellIds: ['coupDeGriffe'],
    ai: 'chaton',
  },
  pandawa: {
    name: 'Pandawa',
    role: 'Bambouseur',
    hp: 110, pa: 8, pm: 4, initiative: 10,
    spellIds: ['tirPandatak', 'karcham', 'laitDeBambou', 'picole', 'gueuleDeBois', 'vaguePandawa', 'stabilisation', 'souffleAlcoolise'],
  },

  eniripsa: {
    name: 'Eniripsa',
    role: 'Soigneuse',
    hp: 90, pa: 8, pm: 4, initiative: 11,
    spellIds: ['motBlessant', 'motSoignant', 'motDEnvol', 'motDeFrayeur', 'motStimulant', 'motDePrevention', 'motInterdit', 'motDeReconstitution'],
  },

  // ---------- WABBITS (lapins de l ile des Wabbits) ----------
  wabbit: {
    name: 'Wabbit',
    role: 'Lapin',
    hp: 95, pa: 5, pm: 5, initiative: 14,
    spellIds: ['morsureWabbit', 'lancerCarotte'],
    ai: 'aggressive',
  },
  waWabbit: {
    name: 'Wa Wabbit',
    role: 'Roi des Wabbits',
    hp: 340, pa: 8, pm: 4, initiative: 12,
    spellIds: ['carotteGeante', 'morsureWabbit', 'soinAnimal'],
    ai: 'aggressive',
  },

  // ---------- CHAFER (squelettes) ----------
  chafer: {
    name: 'Chafer',
    role: 'Fantassin',
    hp: 130, pa: 5, pm: 4, initiative: 9,
    spellIds: ['coupDeLance'],
    ai: 'chafer',
  },
  chaferRoyal: {
    name: 'Chafer Royal',
    role: 'Officier squelette',
    hp: 380, pa: 8, pm: 4, initiative: 8,
    spellIds: ['coupDeLanceRoyal', 'invisibilite', 'piegeSournois'],
    ai: 'chaferRoyal',
  },

  // ---------- TOFU (oiseaux) ----------
  tofu: {
    name: 'Tofu',
    role: 'Oiseau',
    hp: 85, pa: 6, pm: 5, initiative: 13,
    spellIds: ['coupDeBec'],
    ai: 'tofu',
  },
  tofuRoyal: {
    name: 'Tofu Royal',
    role: 'Roi des Tofus',
    hp: 300, pa: 8, pm: 5, initiative: 11,
    spellIds: ['coupDeBec', 'bourrasque'],
    ai: 'tofuRoyal',
  },

  // ---------- CHAMPIGNON ----------
  champignon: {
    name: 'Champignon',
    role: 'Sporifere',
    hp: 150, pa: 4, pm: 2, initiative: 7,
    spellIds: ['sporeToxique'],
    ai: 'champignon',
    isAquatic: true,
  },
  champignonRoyal: {
    name: 'Champignon Royal',
    role: 'Mycelien royal',
    hp: 420, pa: 7, pm: 2, initiative: 6,
    spellIds: ['sporeToxique', 'nuageDeSpores'],
    ai: 'champignonRoyal',
    isAquatic: true,
  },

  // ---------- BOSS ----------
  craqueleurSauvage: {
    name: 'Craqueleur Sauvage',
    role: 'Golem',
    hp: 140, pa: 5, pm: 3, initiative: 8,
    spellIds: ['frappeRocheuse', 'lancerRocher'],
    ai: 'aggressive',
  },
  craqueleurLegendaire: {
    name: 'Craqueleur Legendaire',
    role: 'Boss',
    hp: 480, pa: 8, pm: 3, initiative: 7,
    spellIds: ['poingLegendaire', 'enracinement', 'eboulement'],
    ai: 'boss',
    isBoss: true,
  },
  kwakwa: {
    name: 'Kwakwa',
    role: 'Boss',
    hp: 400, pa: 8, pm: 4, initiative: 15,
    spellIds: ['kwakElementaire', 'plumesTranchantes', 'souffleKwakwa'],
    ai: 'bossRanged',
    isBoss: true,
    // Change d element a chaque tour : tres resistant a son element du
    // moment, vulnerable a l element oppose.
    elementCycle: ['feu', 'eau', 'air', 'terre'],
  },
  minotoror: {
    name: 'Minotoror',
    role: 'Boss',
    hp: 500, pa: 8, pm: 4, initiative: 11,
    spellIds: ['chargeMinotoror', 'coupDeCorne', 'fureurMinotoror'],
    ai: 'boss',
    isBoss: true,
  },
};

// Stats tactiques : tacle / fuite et resistances elementaires (%).
// Un tacleur (Iop, Pandawa, Craqueleur) retient au contact ; un
// personnage agile (Roublard, Ecaflip, Tofu) s echappe facilement.
const TACTICS = {
  iop:        { tacle: 10, fuite: 4 },
  osamodas:   { tacle: 3, fuite: 5 },
  roublard:   { tacle: 3, fuite: 10 },
  xelor:      { tacle: 4, fuite: 6 },
  ecaflip:    { tacle: 5, fuite: 10 },
  pandawa:    { tacle: 12, fuite: 3 },
  eniripsa:   { tacle: 2, fuite: 8 },
  craqueleur: { tacle: 12, fuite: 0, res: { terre: 20 } },
  dragounetRouge: { tacle: 2, fuite: 6, res: { feu: 25, eau: -10 } },
  bouftouInvoc: { tacle: 6, fuite: 2 },
  chatonBlanc: { tacle: 4, fuite: 8 },
  bombeRoublard: { tacle: 0, fuite: 0 },
  bouftou:    { tacle: 6, fuite: 3, res: { terre: 20, feu: -15 } },
  bouftouRoyal: { tacle: 12, fuite: 4, res: { terre: 25, air: 10, feu: -10 } },
  crapaud:    { tacle: 2, fuite: 5, res: { eau: 30, feu: 10, air: -20 } },
  crapaudChef: { tacle: 4, fuite: 4, res: { eau: 35, feu: 10, air: -15 } },
  chafer:     { tacle: 8, fuite: 2, res: { terre: 20, neutre: 20, feu: -25 } },
  chaferRoyal: { tacle: 12, fuite: 4, res: { terre: 25, neutre: 25, feu: -20 } },
  tofu:       { tacle: 2, fuite: 12, res: { air: 30, terre: -20 } },
  tofuRoyal:  { tacle: 6, fuite: 10, res: { air: 35, terre: -15 } },
  wabbit:     { tacle: 4, fuite: 8, res: { terre: 10, air: 15, eau: -15 } },
  waWabbit:   { tacle: 10, fuite: 6, res: { terre: 20, air: 10, eau: -10 } },
  champignon: { tacle: 10, fuite: 0, res: { terre: 20, eau: 20, feu: -30 } },
  champignonRoyal: { tacle: 14, fuite: 0, res: { terre: 25, eau: 25, feu: -25 } },
  craqueleurSauvage: { tacle: 12, fuite: 0, res: { terre: 25, feu: 10, eau: -15 } },
  craqueleurLegendaire: { tacle: 20, fuite: 0, res: { terre: 40, neutre: 20, feu: 15, air: 10, eau: -20 } },
  kwakwa:     { tacle: 6, fuite: 14, res: { feu: 10, eau: 10, terre: 10, air: 10, neutre: 10 } },
  minotoror:  { tacle: 18, fuite: 6, res: { terre: 25, neutre: 25, feu: 10, air: -15 } },
};
for (const [id, t] of Object.entries(TACTICS)) {
  if (!DEFS[id]) continue;
  DEFS[id].tacle = t.tacle;
  DEFS[id].fuite = t.fuite;
  DEFS[id].res = t.res || {};
}
for (const d of Object.values(DEFS)) {
  if (d.tacle === undefined) { d.tacle = 3; d.fuite = 3; d.res = d.res || {}; }
}

const RES_KEYS = ['feu', 'eau', 'terre', 'air', 'neutre'];
const OPP = { feu: 'eau', eau: 'feu', terre: 'air', air: 'terre' };

export class Fighter {
  // opts : { level, spellLevels (heros), kind: 'hero' | 'monster' | 'summon' }
  constructor(classId, team, c, r, opts = {}) {
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
    // Retrait de PA differé : consomme au prochain startTurn de la cible
    // (utilise par les sorts du Xelor : Horloge, Ralentissement).
    this.pendingPaDebuff = 0;
    this.spellCooldowns = {};
    // Specifique aux bombes posees par le Roublard.
    this.isBomb = !!def.isBomb;
    this.bombAge = 0;
    this.bombOwner = null;  // reference vers le combattant qui l a posee
    // Niveau (progression) : stats et sorts mis a l echelle.
    this.level = opts.level || 1;
    this.levelDamageMult = 1;
    this._spells = null;
    this.summonLevel = opts.summonLevel || 1;
    // Equipement (heros) : { hp, pa, pm, dmg, res, tacle, fuite, crit, init }.
    this.equip = opts.equipment || null;
    this.currentElement = null;
    if (opts.kind) this.applyLevel(opts.kind, opts.spellLevels || {});
    if (this.equip && this.equip.init) this.initiative += this.equip.init;
  }

  applyLevel(kind, spellLevels = {}) {
    const def = this.def;
    const L = this.level;
    let st;
    if (kind === 'hero') st = heroStats(def, L);
    else if (kind === 'summon') {
      // Invocation : suit le niveau du heros (PV, degats) et le niveau du
      // sort d invocation (bonus PV / degats, PA / PM, puissance des sorts).
      const hs = heroStats(def, L);
      const sb = summonBonus(this.summonLevel);
      st = { hp: Math.round(hs.hp * sb.mult), pa: def.pa + sb.pa, pm: def.pm + sb.pm, damage: hs.damage * sb.mult };
      if (sb.level > 1) {
        this._spells = def.spellIds.map(id => SPELLS[id]).filter(Boolean).map(sp => scaledSpell(sp, sb.level));
      }
    }
    else st = monsterStats(def, L);
    this.maxHp = this.hp = st.hp;
    this.maxPa = this.pa = st.pa;
    this.maxPm = this.pm = st.pm;
    this.levelDamageMult = st.damage || 1;
    if (kind === 'hero' && this.equip) {
      const e = this.equip;
      this.maxHp = this.hp = this.maxHp + (e.hp || 0);
      this.maxPa = this.pa = this.maxPa + (e.pa || 0);
      this.maxPm = this.pm = this.maxPm + (e.pm || 0);
      this.levelDamageMult += (e.dmg || 0) / 100;
    }
    if (kind === 'hero') {
      // Seuls les sorts debloques a ce niveau sont disponibles, chacun a
      // son niveau de puissance (1 a 3).
      this._spells = def.spellIds
        .map((id, i) => ({ id, at: UNLOCK_LEVELS[i] || 1 }))
        .filter(e => L >= e.at && SPELLS[e.id])
        .map(e => scaledSpell(SPELLS[e.id], spellLevels[e.id] || 1));
    }
    this.levelKind = kind;
  }

  get spells() {
    if (this._spells) return this._spells;
    return this.def.spellIds.map(id => SPELLS[id]).filter(Boolean);
  }

  // Sort (eventuellement ameliore) de ce combattant par identifiant.
  spellById(id) {
    return this.spells.find(s => s.id === id) || SPELLS[id];
  }

  // Vrai tant qu un buff d invisibilite est actif : le combattant ne
  // peut alors plus etre pris pour cible directe.
  get invisible() {
    return this.buffs.some(b => b.invisible);
  }

  // Enracine : ne peut plus marcher ni etre deplace.
  get rooted() {
    return this.buffs.some(b => b.rooted);
  }
  // Stabilise : ne peut pas etre repousse / attire / echange.
  get stabilized() {
    return this.rooted || this.buffs.some(b => b.stabilized);
  }

  // Resistances elementaires (%) : base de la creature + equipement +
  // buffs, bornees a [-50, 75]. Le Kwakwa renforce son element du moment.
  get res() {
    const out = {};
    const base = this.def.res || {};
    const eq = (this.equip && this.equip.res) || {};
    for (const k of RES_KEYS) {
      let v = (base[k] || 0) + (eq[k] || 0);
      for (const b of this.buffs) if (b.res && b.res[k]) v += b.res[k];
      if (this.currentElement) {
        if (k === this.currentElement) v += 50;
        else if (k === OPP[this.currentElement]) v -= 30;
      }
      out[k] = Math.max(-50, Math.min(75, v));
    }
    return out;
  }

  // Tacle / fuite : base de classe + niveau + equipement + buffs.
  get tacle() {
    let v = (this.def.tacle || 0) + Math.floor((this.level || 1) / 2) + ((this.equip && this.equip.tacle) || 0);
    for (const b of this.buffs) if (b.tacle) v += b.tacle;
    return Math.max(0, v);
  }
  get fuite() {
    let v = (this.def.fuite || 0) + Math.floor((this.level || 1) / 2) + ((this.equip && this.equip.fuite) || 0);
    for (const b of this.buffs) if (b.fuite) v += b.fuite;
    return Math.max(0, v);
  }

  // Chance de coup critique (degats x1.3).
  get critChance() {
    let v = 0.05 + ((this.equip && this.equip.crit) || 0) / 100;
    for (const b of this.buffs) if (b.crit) v += b.crit;
    return Math.max(0, Math.min(0.8, v));
  }

  // Max effectif PA / PM = base + buffs additifs (bonus ou malus).
  // Borne a 0 : un combattant totalement draine affiche "0/0".
  get effectiveMaxPa() {
    let max = this.maxPa;
    for (const b of this.buffs) if (b.bonusPa) max += b.bonusPa;
    return Math.max(0, max);
  }
  get effectiveMaxPm() {
    let max = this.maxPm;
    for (const b of this.buffs) if (b.bonusPm) max += b.bonusPm;
    return Math.max(0, max);
  }

  startTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
    // Decremente la duree des buffs non permanents.
    this.buffs = this.buffs
      .map(b => b.permanent ? b : { ...b, duration: b.duration - 1 })
      .filter(b => b.permanent || b.duration > 0);
    // Applique les bonus / malus PA / PM des buffs actifs.
    for (const b of this.buffs) {
      if (b.bonusPa) this.pa += b.bonusPa;
      if (b.bonusPm) this.pm += b.bonusPm;
    }
    // Consomme le retrait de PA differé (sorts du Xelor) : la cible
    // commence son tour amputee une seule fois, puis revient a la
    // normale au tour suivant.
    if (this.pendingPaDebuff) {
      this.pa -= this.pendingPaDebuff;
      this.pendingPaDebuff = 0;
    }
    this.pa = Math.max(0, this.pa);
    this.pm = Math.max(0, this.pm);
    if (this.rooted) this.pm = 0;
    // Decremente les cooldowns.
    for (const id in this.spellCooldowns) {
      this.spellCooldowns[id] = Math.max(0, this.spellCooldowns[id] - 1);
    }
  }

  endTurn() {
    // Nettoie les buffs qui n auront plus d effet sur les tours
    // suivants (duration <= 1, non permanents) : ils seraient filtres
    // au prochain startTurn de toute façon. On evite ainsi qu un
    // malus "deja termine" (ex : Crachat, Ralentissement) continue
    // d apparaitre dans l infobulle entre les tours. Les effets long
    // terme (Griffe de Ceangal, Concentration) restent visibles.
    this.buffs = this.buffs.filter(b => b.permanent || b.duration > 1);
    // Reinitialise PA / PM affiches : un combattant idle apparait
    // "frais" sauf si un buff long terme reduit son maximum. Le
    // pendingPaDebuff reste : il s appliquera au prochain startTurn.
    this.pa = this.effectiveMaxPa;
    this.pm = this.effectiveMaxPm;
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

  // Degats apres reduction des boucliers, sans toucher aux PV.
  computeShielded(amount) {
    let dmg = amount;
    for (const b of this.buffs) {
      if (b.shield) dmg *= (1 - b.shield);
    }
    return Math.max(0, Math.round(dmg));
  }

  // Fraction de degats renvoyee a l attaquant (buff Momification).
  reflectFraction() {
    let r = 0;
    for (const b of this.buffs) {
      if (b.reflect) r += b.reflect;
    }
    return Math.min(0.95, r);
  }

  takeDamage(amount) {
    const dmg = this.computeShielded(amount);
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
    return mult * (this.levelDamageMult || 1);
  }

  isOnCooldown(spellId) {
    return (this.spellCooldowns[spellId] || 0) > 0;
  }

  setCooldown(spellId, turns) {
    if (turns) this.spellCooldowns[spellId] = turns;
  }
}
