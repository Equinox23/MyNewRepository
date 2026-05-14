import { Fighter } from './Fighter.js';
import { Character3D } from './Character3D.js';
import { TurnManager } from './TurnManager.js';
import { bfs, pathTo, hasLOS } from './Path.js';
import { SPELLS } from './Spells.js';

// Configurations de combats predefinis. Chacun decrit la composition
// ennemie ; les spawns sont calcules a la setup.
export const COMBATS = {
  bouftou: {
    name: 'Meute de Bouftous',
    enemyComposition: [
      'bouftou', 'bouftou', 'bouftou', 'bouftouRoyal',
    ],
  },
};

// Spawns par defaut (gauche pour le joueur, droite pour les ennemis).
const PLAYER_SPAWNS = [
  { c: 3, r: 7 }, { c: 2, r: 5 }, { c: 2, r: 9 },
];
const ENEMY_SPAWNS = [
  { c: 11, r: 7 }, { c: 12, r: 5 }, { c: 12, r: 9 }, { c: 13, r: 7 },
];

// Orchestrateur de combat. Prend une config (classes joueur + combat)
// et gere : spawn, tour par tour, inputs joueur, IA, fin de partie.
export class Game {
  constructor({ scene3d, map3d, picker, hud, rangeOverlay }) {
    this.scene3d = scene3d;
    this.map3d = map3d;
    this.picker = picker;
    this.hud = hud;
    this.rangeOverlay = rangeOverlay;
    this.fighters = [];
    this.turn = null;
    this.mode = 'move';
    this.selectedSpellId = null;
    this.busy = false;
    this.ended = false;
    this.config = null;

    this.hud.on('onMove', () => this.setMode('move'));
    this.hud.on('onSpellSlot', (slot) => this.selectSpellSlot(slot));
    this.hud.on('onEnd', () => this.endTurn());
  }

  setup(config) {
    this.cleanup();
    this.config = config;
    this.ended = false;
    this.busy = false;
    this.mode = 'move';
    this.selectedSpellId = null;
    this.rangeOverlay && this.rangeOverlay.clear();

    const playerClasses = config.playerClasses || ['iop'];
    const enemyComposition = config.enemyComposition
      || (COMBATS[config.combatId] && COMBATS[config.combatId].enemyComposition)
      || ['bouftou'];

    // Spawn joueur(s)
    playerClasses.forEach((cls, i) => {
      const pos = PLAYER_SPAWNS[i % PLAYER_SPAWNS.length];
      const f = new Fighter(cls, 'player', pos.c, pos.r);
      f.character = new Character3D(this.scene3d.scene, cls, 'player', pos.c, pos.r);
      this.fighters.push(f);
    });
    // Spawn ennemis
    enemyComposition.forEach((cls, i) => {
      const pos = ENEMY_SPAWNS[i % ENEMY_SPAWNS.length];
      const f = new Fighter(cls, 'enemy', pos.c, pos.r);
      f.character = new Character3D(this.scene3d.scene, cls, 'enemy', pos.c, pos.r);
      this.fighters.push(f);
    });

    // Orienter chacun vers l ennemi le plus proche
    for (const f of this.fighters) {
      const other = this.fighters.find(o => o.alive && o.team !== f.team);
      if (other) f.character.faceToward(other.c, other.r);
    }

    this.turn = new TurnManager(this.fighters);
    this.refreshHpBars();
    this.startTurn();
  }

  cleanup() {
    for (const f of this.fighters) {
      if (f.character && f.character.group) {
        this.scene3d.scene.remove(f.character.group);
      }
    }
    this.fighters = [];
    this.turn = null;
    this.busy = false;
    this.ended = false;
    this.rangeOverlay && this.rangeOverlay.clear();
    this.picker && this.picker.setHover(null);
  }

  startTurn() {
    if (this.checkEnd()) return;
    const cur = this.turn.current();
    cur.startTurn();
    for (const f of this.fighters) f.character.setActive(f === cur);
    this.mode = 'move';
    this.selectedSpellId = null;
    this.hud.update(cur, this.mode, null);
    this.hud.flash(`Tour ${this.turn.round}  -  ${cur.name}`, 1200);
    this.refreshRangeOverlay();
    if (cur.team === 'enemy') {
      this.busy = true;
      setTimeout(() => this.runAI(), 700);
    } else {
      this.busy = false;
    }
  }

  endTurn() {
    if (this.busy || this.ended) return;
    this._advanceTurn();
  }

  _advanceTurn() {
    if (this.ended) return;
    this.turn.advance();
    this.startTurn();
  }

  setMode(mode) {
    if (this.busy) return;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    this.mode = mode;
    if (mode !== 'spell') this.selectedSpellId = null;
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  selectSpellSlot(slot) {
    if (this.busy) return;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    const spell = cur.spells[slot];
    if (!spell) return;
    if (spell.apCost > cur.pa) {
      this.hud.flash('Pas assez de PA pour ' + spell.name, 900);
      return;
    }
    if (spell.target === 'self') {
      this.busy = true;
      this.castSelf(cur, spell).finally(() => {
        this.busy = false;
        if (!this.checkEnd()) {
          this.refreshRangeOverlay();
          this.hud.update(cur, this.mode, this.selectedSpellId);
        }
      });
      return;
    }
    this.selectedSpellId = spell.id;
    this.mode = 'spell';
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  async castSelf(caster, spell) {
    caster.pa -= spell.apCost;
    caster.character.popCost(spell.apCost, 'pa');
    this.hud.update(caster, this.mode, this.selectedSpellId);
    await this.applySpellEffects(caster, spell, { c: caster.c, r: caster.r });
  }

  async onTileTap(c, r) {
    if (this.busy || this.ended) return;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    if (this.map3d.isWall(c, r) && this.mode === 'move') return;
    if (this.mode === 'move') {
      await this.tryMove(c, r);
    } else if (this.mode === 'spell') {
      await this.tryCastSpell(c, r);
    }
  }

  async tryMove(c, r) {
    const cur = this.turn.current();
    if (c === cur.c && r === cur.r) return;
    const occ = this.computeOccupied(cur);
    const result = bfs(this.map3d.getData(), occ, { c: cur.c, r: cur.r }, cur.pm);
    const path = pathTo(result, { c, r });
    if (!path || path.length <= 1) {
      this.hud.flash('Hors de portee', 800);
      return;
    }
    const cost = path.length - 1;
    if (cost > cur.pm) return;
    this.busy = true;
    this.picker.setHover(null);
    cur.character.popCost(cost, 'pm');
    for (const step of path.slice(1)) {
      cur.pm--;
      this.hud.update(cur, this.mode, this.selectedSpellId);
      this.refreshRangeOverlay();
      await cur.character.moveTo(step.c, step.r, 170);
      cur.c = step.c;
      cur.r = step.r;
    }
    this.busy = false;
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  async tryCastSpell(c, r) {
    const cur = this.turn.current();
    const spell = SPELLS[this.selectedSpellId];
    if (!spell) return;
    const reason = this.validateSpellTarget(cur, spell, c, r);
    if (reason) { this.hud.flash(reason, 900); return; }
    cur.pa -= spell.apCost;
    cur.character.popCost(spell.apCost, 'pa');
    this.hud.update(cur, this.mode, this.selectedSpellId);
    this.busy = true;
    this.picker.setHover(null);
    this.rangeOverlay.clear();
    await this.applySpellEffects(cur, spell, { c, r });
    this.busy = false;
    if (this.checkEnd()) return;
    this.selectedSpellId = null;
    this.mode = 'move';
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  validateSpellTarget(caster, spell, c, r) {
    const dist = Math.abs(caster.c - c) + Math.abs(caster.r - r);
    if (dist < spell.range.min || dist > spell.range.max) return 'Hors de portee';
    if (this.map3d.isWall(c, r)) return 'Mur';
    if (spell.needsLOS && !hasLOS(this.map3d.getData(), caster.c, caster.r, c, r)) {
      return 'Pas de vue';
    }
    // Sort en ligne droite : la cible doit etre orthogonale au lanceur.
    if (spell.area && spell.area.type === 'line') {
      const dc = c - caster.c, dr = r - caster.r;
      if (dc !== 0 && dr !== 0) return 'Doit etre en ligne droite';
    }
    const targetFighter = this.fighters.find(f => f.alive && f.c === c && f.r === r);
    if (spell.target === 'self' && targetFighter !== caster) return 'Cible : soi-meme';
    if (spell.target === 'enemy' && (!targetFighter || targetFighter.team === caster.team)) return 'Pas d ennemi';
    if (spell.target === 'ally' && (!targetFighter || targetFighter.team !== caster.team)) return 'Pas d allie';
    if (spell.target === 'tile') {
      const needsEmpty = spell.effects.some(e => e.type === 'teleport');
      if (needsEmpty && targetFighter) return 'Case occupee';
    }
    return null;
  }

  async applySpellEffects(caster, spell, target) {
    for (const effect of spell.effects) {
      await this.applyEffect(effect, caster, spell, target);
      if (this.ended) return;
    }
  }

  async applyEffect(effect, caster, spell, target) {
    switch (effect.type) {
      case 'damage': {
        // Calcule les cases affectees (ligne pour AOE line, sinon
        // unique tile cible).
        let cells;
        if (spell.area && spell.area.type === 'line') {
          cells = this.lineCells(caster, target, spell.area.length);
        } else {
          cells = [{ c: target.c, r: target.r }];
        }
        // Lunge vers la 1ere case visee (direction).
        const firstCell = cells[0] || target;
        const lunge = caster.character.lungeTo(firstCell.c, firstCell.r, 320);
        await new Promise(r => setTimeout(r, 180));
        // Applique les degats a chaque combattant present dans la zone.
        const dying = [];
        for (const cell of cells) {
          const tf = this.fighters.find(f => f.alive && f.c === cell.c && f.r === cell.r);
          if (!tf) continue;
          const base = effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1));
          const dmg = Math.round(base * caster.damageMultiplier());
          tf.takeDamage(dmg);
          tf.character.popDamage(dmg);
          tf.character.hpBar.setHp(tf.hp, tf.maxHp);
          if (!tf.alive) dying.push(tf);
        }
        await lunge;
        for (const d of dying) await d.character.die();
        return;
      }
      case 'heal': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        const amt = effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1));
        const healed = tf.heal(amt);
        tf.character.popHeal(healed);
        tf.character.hpBar.setHp(tf.hp, tf.maxHp);
        tf.character.flashGlow(0xe91e63, 700);
        await new Promise(r => setTimeout(r, 500));
        return;
      }
      case 'teleport': {
        await caster.character.teleportTo(target.c, target.r);
        caster.c = target.c;
        caster.r = target.r;
        return;
      }
      case 'buff': {
        caster.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration + 1 });
        caster.character.flashGlow(parseInt(spell.color.slice(1), 16), 900);
        this.hud.flash(`${spell.name} : +${Math.round(effect.value * 100)}% ${effect.stat} pendant ${effect.duration} tours (cumule)`, 1400);
        await new Promise(r => setTimeout(r, 400));
        return;
      }
    }
  }

  // Cases d une ligne droite depuis caster en direction de target.
  lineCells(caster, target, length) {
    const dc = Math.sign(target.c - caster.c);
    const dr = Math.sign(target.r - caster.r);
    if (dc === 0 && dr === 0) return [];
    const cells = [];
    for (let i = 1; i <= length; i++) {
      const cc = caster.c + dc * i;
      const cr = caster.r + dr * i;
      if (!this.map3d.inBounds(cc, cr)) break;
      if (this.map3d.isWall(cc, cr)) break; // mur stoppe la ligne
      cells.push({ c: cc, r: cr });
    }
    return cells;
  }

  // Surlignage des cases : portee de mouvement OU portee de sort.
  refreshRangeOverlay() {
    this.rangeOverlay.clear();
    if (!this.turn || this.busy) return;
    const cur = this.turn.current();
    if (!cur || cur.team !== 'player') return;

    if (this.mode === 'move') {
      // Affiche les cases atteignables avec les PM restants (BFS).
      const occ = this.computeOccupied(cur);
      const result = bfs(this.map3d.getData(), occ, { c: cur.c, r: cur.r }, cur.pm);
      const tiles = [];
      for (const [key, d] of result.dist.entries()) {
        if (d === 0) continue;
        const [c, r] = key.split(',').map(Number);
        tiles.push({ c, r });
      }
      this.rangeOverlay.paint(tiles, 0x6ee7b6, 0.30);
      return;
    }

    if (this.mode === 'spell' && this.selectedSpellId) {
      const spell = SPELLS[this.selectedSpellId];
      if (!spell) return;
      const tiles = [];
      if (spell.area && spell.area.type === 'line') {
        // Pour un sort en ligne, surligne uniquement les 4 axes
        // orthogonaux jusqu a la portee max.
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          for (let i = 1; i <= spell.range.max; i++) {
            const c = cur.c + dc * i;
            const r = cur.r + dr * i;
            if (!this.map3d.inBounds(c, r)) break;
            if (this.map3d.isWall(c, r)) break;
            tiles.push({ c, r });
          }
        }
      } else {
        // Portee manhattan standard.
        for (let dc = -spell.range.max; dc <= spell.range.max; dc++) {
          for (let dr = -spell.range.max; dr <= spell.range.max; dr++) {
            const d = Math.abs(dc) + Math.abs(dr);
            if (d < spell.range.min || d > spell.range.max) continue;
            const c = cur.c + dc;
            const r = cur.r + dr;
            if (!this.map3d.inBounds(c, r)) continue;
            if (this.map3d.isWall(c, r)) continue;
            tiles.push({ c, r });
          }
        }
      }
      const color = parseInt(spell.color.replace('#', ''), 16);
      this.rangeOverlay.paint(tiles, color, 0.33);
    }
  }

  // ---------- IA ----------
  async runAI() {
    if (this.ended) return;
    const ai = this.turn.current();
    const profile = ai.def.ai || 'aggressive';
    if (profile === 'aggressive') {
      await this.runAggressive(ai);
    }
    if (this.ended) return;
    this.busy = false;
    this._advanceTurn();
  }

  async runAggressive(ai) {
    // 1. Si le combattant a un sort de soin, soigne un allie blesse a portee.
    if (ai.spells.some(s => s.effects.some(e => e.type === 'heal'))) {
      await this.aiTryHeal(ai);
      if (this.ended) return;
    }

    const target = this.pickWeakestTarget(ai);
    if (!target) return;
    const damageSpells = ai.spells.filter(s =>
      s.effects.some(e => e.type === 'damage') &&
      (s.target === 'enemy' || s.target === 'tile')
    );
    if (damageSpells.length === 0) return;
    const longestRange = damageSpells.reduce((m, s) => Math.max(m, s.range.max), 0);

    if (ai.pm > 0) {
      const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
      if (dist > longestRange) {
        await this.aiApproach(ai, target, longestRange);
      }
    }
    if (this.ended) return;

    while (ai.alive && target.alive) {
      const usable = damageSpells.filter(s => s.apCost <= ai.pa).filter(s => {
        const d = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
        if (d < s.range.min || d > s.range.max) return false;
        if (s.needsLOS && !hasLOS(this.map3d.getData(), ai.c, ai.r, target.c, target.r)) return false;
        return true;
      });
      if (usable.length === 0) break;
      usable.sort((a, b) => avgDmg(b) - avgDmg(a));
      const spell = usable[0];
      ai.pa -= spell.apCost;
      ai.character.popCost(spell.apCost, 'pa');
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await this.applySpellEffects(ai, spell, { c: target.c, r: target.r });
      if (this.checkEnd()) return;
    }
  }

  // Soigne l allie le plus blesse (sous 70% PV) a portee, une fois par tour.
  async aiTryHeal(ai) {
    const healSpells = ai.spells.filter(s =>
      s.effects.some(e => e.type === 'heal') && s.target === 'ally'
    );
    if (healSpells.length === 0) return;
    const wounded = this.fighters.filter(f =>
      f.alive && f.team === ai.team && f !== ai && f.hp < f.maxHp * 0.7
    ).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    if (wounded.length === 0) return;

    for (const target of wounded) {
      for (const spell of healSpells) {
        if (ai.pa < spell.apCost) continue;
        const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
        if (dist < spell.range.min || dist > spell.range.max) continue;
        if (spell.needsLOS && !hasLOS(this.map3d.getData(), ai.c, ai.r, target.c, target.r)) continue;
        ai.pa -= spell.apCost;
        ai.character.popCost(spell.apCost, 'pa');
        this.hud.update(ai, this.mode, this.selectedSpellId);
        await this.applySpellEffects(ai, spell, { c: target.c, r: target.r });
        return; // un seul soin par tour
      }
    }
  }

  pickWeakestTarget(ai) {
    const enemies = this.fighters.filter(f => f.alive && f.team !== ai.team);
    if (enemies.length === 0) return null;
    enemies.sort((a, b) => {
      if (a.hp !== b.hp) return a.hp - b.hp;
      const da = Math.abs(ai.c - a.c) + Math.abs(ai.r - a.r);
      const db = Math.abs(ai.c - b.c) + Math.abs(ai.r - b.r);
      return da - db;
    });
    return enemies[0];
  }

  async aiApproach(ai, target, range) {
    const occ = this.computeOccupied(ai);
    const result = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, 999);
    const goals = [];
    for (let dc = -range; dc <= range; dc++) {
      for (let dr = -range; dr <= range; dr++) {
        if (dc === 0 && dr === 0) continue;
        if (Math.abs(dc) + Math.abs(dr) > range) continue;
        goals.push({ c: target.c + dc, r: target.r + dr });
      }
    }
    let bestGoal = null;
    let bestDist = Infinity;
    for (const g of goals) {
      const k = `${g.c},${g.r}`;
      if (!result.dist.has(k)) continue;
      const d = result.dist.get(k);
      if (d < bestDist) { bestDist = d; bestGoal = g; }
    }
    if (!bestGoal) return;
    const fullPath = pathTo(result, bestGoal);
    if (!fullPath || fullPath.length <= 1) return;
    const maxSteps = Math.min(ai.pm, fullPath.length - 1);
    if (maxSteps === 0) return;
    ai.character.popCost(maxSteps, 'pm');
    const steps = fullPath.slice(1, maxSteps + 1);
    for (const step of steps) {
      ai.pm--;
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await ai.character.moveTo(step.c, step.r, 170);
      ai.c = step.c;
      ai.r = step.r;
    }
  }

  // ---------- HELPERS ----------
  computeOccupied(exclude) {
    const occ = new Set();
    for (const f of this.fighters) {
      if (!f.alive) continue;
      if (exclude && f === exclude) continue;
      occ.add(`${f.c},${f.r}`);
    }
    return occ;
  }

  refreshHpBars() {
    for (const f of this.fighters) {
      f.character.hpBar.setHp(f.hp, f.maxHp);
    }
  }

  checkEnd() {
    const winner = this.turn ? this.turn.hasWinner() : null;
    if (winner && !this.ended) {
      this.ended = true;
      this.busy = true;
      setTimeout(() => this.hud.showEnd(winner, () => {
        if (this.onEnd) this.onEnd();
      }), 600);
      return true;
    }
    return false;
  }
}

function avgDmg(spell) {
  return spell.effects
    .filter(e => e.type === 'damage')
    .reduce((s, e) => s + (e.min + e.max) / 2, 0);
}
