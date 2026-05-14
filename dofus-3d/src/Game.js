import { Fighter } from './Fighter.js';
import { Character3D } from './Character3D.js';
import { TurnManager } from './TurnManager.js';
import { bfs, pathTo, hasLOS } from './Path.js';
import { SPELLS } from './Spells.js';

// Orchestrateur de combat 1v1 (V3). Generalise la gestion des sorts :
// chaque combattant a une liste de spellIds, et la logique est dirigee
// par les `effects` definis dans Spells.js (damage / teleport / buff).
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

    this.hud.on('onMove', () => this.setMode('move'));
    this.hud.on('onSpellSlot', (slot) => this.selectSpellSlot(slot));
    this.hud.on('onEnd', () => this.endTurn());
  }

  setup() {
    this.ended = false;
    this.busy = false;
    this.mode = 'move';
    this.selectedSpellId = null;
    this.rangeOverlay && this.rangeOverlay.clear();

    const iop = new Fighter('iop', 'player', 3, 7);
    const bouftou = new Fighter('bouftou', 'enemy', 11, 7);
    iop.character = new Character3D(this.scene3d.scene, 'iop', 'player', 3, 7);
    bouftou.character = new Character3D(this.scene3d.scene, 'bouftou', 'enemy', 11, 7);
    iop.character.faceToward(bouftou.c, bouftou.r);
    bouftou.character.faceToward(iop.c, iop.r);
    this.fighters = [iop, bouftou];
    this.turn = new TurnManager(this.fighters);
    this.refreshHpBars();
    this.startTurn();
  }

  startTurn() {
    if (this.checkEnd()) return;
    const cur = this.turn.current();
    cur.startTurn();
    for (const f of this.fighters) f.character.setActive(f === cur);
    this.mode = 'move';
    this.selectedSpellId = null;
    this.rangeOverlay.clear();
    this.hud.update(cur, this.mode, null);
    this.hud.flash(`Tour ${this.turn.round}  -  ${cur.name}`, 1200);
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

  // Selection d un sort par numero de slot (0-based).
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
    // Sort sur soi-meme : on lance directement, pas besoin de cible.
    if (spell.target === 'self') {
      this.busy = true;
      this.castSelf(cur, spell).finally(() => {
        this.busy = false;
        if (!this.checkEnd()) {
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
    this.hud.update(caster, this.mode, this.selectedSpellId);
    await this.applySpellEffects(caster, spell, { c: caster.c, r: caster.r });
  }

  // Tap d une case du terrain.
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
    // Decompte PAS par PAS pour que le HUD diminue visuellement les PM
    // a chaque case parcourue (au lieu d un seul saut a la fin).
    for (const step of path.slice(1)) {
      cur.pm--;
      this.hud.update(cur, this.mode, this.selectedSpellId);
      await cur.character.moveTo(step.c, step.r, 170);
      cur.c = step.c;
      cur.r = step.r;
    }
    this.busy = false;
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  async tryCastSpell(c, r) {
    const cur = this.turn.current();
    const spell = SPELLS[this.selectedSpellId];
    if (!spell) return;
    const reason = this.validateSpellTarget(cur, spell, c, r);
    if (reason) { this.hud.flash(reason, 900); return; }
    cur.pa -= spell.apCost;
    // Mise a jour HUD AVANT l animation : on voit les PA chuter en direct.
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

  // Renvoie null si valide, sinon un message d erreur explicite.
  validateSpellTarget(caster, spell, c, r) {
    const dist = Math.abs(caster.c - c) + Math.abs(caster.r - r);
    if (dist < spell.range.min || dist > spell.range.max) return 'Hors de portee';
    if (this.map3d.isWall(c, r)) return 'Mur';
    if (spell.needsLOS && !hasLOS(this.map3d.getData(), caster.c, caster.r, c, r)) {
      return 'Pas de vue';
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

  // Applique tous les effets d un sort.
  async applySpellEffects(caster, spell, target) {
    for (const effect of spell.effects) {
      await this.applyEffect(effect, caster, spell, target);
      if (this.ended) return;
    }
  }

  async applyEffect(effect, caster, spell, target) {
    switch (effect.type) {
      case 'damage': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        const base = effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1));
        const dmg = Math.round(base * caster.damageMultiplier());
        // Choix d animation : lunge pour CAC, sinon flash.
        const lunge = caster.character.lungeTo(target.c, target.r, 320);
        await new Promise(r => setTimeout(r, 180));
        tf.takeDamage(dmg);
        tf.character.popDamage(dmg);
        tf.character.hpBar.setHp(tf.hp, tf.maxHp);
        await lunge;
        if (!tf.alive) await tf.character.die();
        return;
      }
      case 'heal': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        const amt = effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1));
        const healed = tf.heal(amt);
        tf.character.popDamage('+' + healed, '#7dffa0');
        tf.character.hpBar.setHp(tf.hp, tf.maxHp);
        tf.character.flashGlow(0x2ecc71, 700);
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
        // duration en tours du caster : decremente au DEBUT de chaque
        // tour. On stocke +1 pour que le tour de cast compte aussi
        // (sinon le bonus n est actif qu apres). L affichage HUD
        // soustrait 1 pour ne pas trahir la duree promise.
        caster.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration + 1 });
        caster.character.flashGlow(parseInt(spell.color.slice(1), 16), 900);
        this.hud.flash(`${spell.name} : +${Math.round(effect.value * 100)}% ${effect.stat} pendant ${effect.duration} tours`, 1400);
        await new Promise(r => setTimeout(r, 500));
        return;
      }
    }
  }

  // Affiche les cases dans la portee du sort selectionne, peintes a la
  // couleur du sort lui-meme (ainsi chaque sort a sa propre identite
  // visuelle quand on le selectionne).
  refreshRangeOverlay() {
    this.rangeOverlay.clear();
    if (this.mode !== 'spell' || !this.selectedSpellId) return;
    const cur = this.turn.current();
    const spell = SPELLS[this.selectedSpellId];
    if (!spell) return;
    const tiles = [];
    for (let dc = -spell.range.max; dc <= spell.range.max; dc++) {
      for (let dr = -spell.range.max; dr <= spell.range.max; dr++) {
        const d = Math.abs(dc) + Math.abs(dr);
        if (d < spell.range.min || d > spell.range.max) continue;
        const c = cur.c + dc;
        const r = cur.r + dr;
        if (c < 0 || r < 0) continue;
        if (this.map3d.isWall(c, r)) continue;
        tiles.push({ c, r });
      }
    }
    const color = parseInt(spell.color.replace('#', ''), 16);
    this.rangeOverlay.paint(tiles, color, 0.33);
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
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await this.applySpellEffects(ai, spell, { c: target.c, r: target.r });
      if (this.checkEnd()) return;
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
      setTimeout(() => this.hud.showEnd(winner, () => this.reset()), 600);
      return true;
    }
    return false;
  }

  reset() {
    for (const f of this.fighters) {
      this.scene3d.scene.remove(f.character.group);
    }
    this.fighters = [];
    this.setup();
  }
}

function avgDmg(spell) {
  return spell.effects
    .filter(e => e.type === 'damage')
    .reduce((s, e) => s + (e.min + e.max) / 2, 0);
}
