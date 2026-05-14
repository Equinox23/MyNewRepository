import { Fighter } from './Fighter.js';
import { Character3D } from './Character3D.js';
import { TurnManager } from './TurnManager.js';
import { bfs, pathTo } from './Path.js';

// Orchestrateur de combat 1v1 (V2). Gere :
//  - le spawn des combattants,
//  - le tour par tour,
//  - les inputs joueur (deplacer / attaquer),
//  - l IA ennemie,
//  - la condition de victoire.
export class Game {
  constructor({ scene3d, map3d, picker, hud }) {
    this.scene3d = scene3d;
    this.map3d = map3d;
    this.picker = picker;
    this.hud = hud;
    this.fighters = [];
    this.turn = null;
    this.mode = 'move';
    this.busy = false;
    this.ended = false;

    // Wire HUD callbacks
    this.hud.on('onMove', () => this.setMode('move'));
    this.hud.on('onAttack', () => this.setMode('attack'));
    this.hud.on('onEnd', () => this.endTurn());
  }

  setup() {
    this.ended = false;
    this.busy = false;
    this.mode = 'move';

    // Spawn Iop joueur a gauche, Bouftou ennemi a droite.
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
    this.hud.update(cur, this.mode);
    this.hud.flash(`Tour ${this.turn.round}  -  ${cur.name}`, 1200);
    // Centrer la camera sur le combattant actif si zoomee
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

  // Avancement interne (sans verifier busy) - utilise par l IA en fin
  // de tour, ou un endTurn de joueur valide.
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
    this.hud.update(cur, this.mode);
  }

  // Tap / clic sur une case du terrain.
  async onTileTap(c, r) {
    if (this.busy || this.ended) return;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    if (this.map3d.isWall(c, r)) return;

    if (this.mode === 'move') {
      await this.tryMove(c, r);
    } else if (this.mode === 'attack') {
      await this.tryAttack(c, r);
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
    cur.pm -= cost;
    this.busy = true;
    this.picker.setHover(null);
    for (const step of path.slice(1)) {
      await cur.character.moveTo(step.c, step.r, 170);
      cur.c = step.c;
      cur.r = step.r;
    }
    this.busy = false;
    this.hud.update(cur, this.mode);
  }

  async tryAttack(c, r) {
    const cur = this.turn.current();
    const atk = cur.def.attack;
    if (cur.pa < atk.apCost) { this.hud.flash('Pas assez de PA', 800); return; }
    const dist = Math.abs(cur.c - c) + Math.abs(cur.r - r);
    if (dist > atk.range || dist < 1) { this.hud.flash('Hors de portee', 800); return; }
    const target = this.fighters.find(f => f.alive && f.team !== cur.team && f.c === c && f.r === r);
    if (!target) { this.hud.flash('Pas de cible ici', 800); return; }
    cur.pa -= atk.apCost;
    this.busy = true;
    this.picker.setHover(null);
    await this.playAttack(cur, target);
    this.busy = false;
    if (this.checkEnd()) return;
    this.mode = 'move';
    this.hud.update(cur, this.mode);
  }

  async playAttack(attacker, target) {
    const atk = attacker.def.attack;
    const dmg = atk.dmgMin + Math.floor(Math.random() * (atk.dmgMax - atk.dmgMin + 1));
    target.takeDamage(dmg);
    // Anim lunge
    const lunge = attacker.character.lungeTo(target.c, target.r, 320);
    // Apres 60% de la lunge, on applique le degat visuel
    await new Promise(r => setTimeout(r, 180));
    target.character.popDamage(dmg);
    target.character.hpBar.setHp(target.hp, target.maxHp);
    await lunge;
    if (!target.alive) {
      await target.character.die();
    }
  }

  async runAI() {
    if (this.ended) return;
    const ai = this.turn.current();
    const profile = ai.def.ai || 'aggressive';
    if (profile === 'aggressive') {
      await this.runAggressive(ai);
    }
    // (futurs profils : 'defensive', 'ranged', 'coward'...)
    if (this.ended) return;
    this.busy = false;
    this._advanceTurn();
  }

  // Profil 'aggressive' : fonce sur la cible la plus faible (moins de PV)
  // et frappe au CAC tant qu il a les PA. Avance autant que possible
  // (PM complets) vers cette cible meme si elle est hors d atteinte ce
  // tour-ci.
  async runAggressive(ai) {
    const target = this.pickWeakestTarget(ai);
    if (!target) return;
    const atk = ai.def.attack;

    // 1) S approcher pour entrer en portee.
    if (ai.pm > 0) {
      const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
      if (dist > atk.range) {
        await this.aiApproach(ai, target, atk.range);
      }
    }
    if (this.ended) return;

    // 2) Cogner tant qu on a les PA et qu on est a portee.
    while (ai.alive && target.alive) {
      const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
      if (dist > atk.range) break;
      if (ai.pa < atk.apCost) break;
      ai.pa -= atk.apCost;
      await this.playAttack(ai, target);
      if (this.checkEnd()) return;
    }
  }

  // Choisit la cible adverse la plus fragile (PV les plus bas).
  // Departage ties par distance (la plus proche d abord).
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

  // BFS illimite depuis l IA, cherche la case a portee de la cible
  // (cases voisines pour une attaque CAC) la plus proche, puis avance
  // d autant de pas que les PM le permettent dans cette direction
  // (l IA ne reste pas immobile meme si la cible est trop loin).
  async aiApproach(ai, target, range) {
    const occ = this.computeOccupied(ai);
    const result = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, 999);

    // Toutes les cases a distance <= range de la cible, sauf elle-meme.
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
    // Avance autant que possible, dans la limite des PM.
    const maxSteps = Math.min(ai.pm, fullPath.length - 1);
    const steps = fullPath.slice(1, maxSteps + 1);
    for (const step of steps) {
      await ai.character.moveTo(step.c, step.r, 170);
      ai.c = step.c;
      ai.r = step.r;
      ai.pm--;
    }
  }

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
      setTimeout(() => {
        this.hud.showEnd(winner, () => this.reset());
      }, 600);
      return true;
    }
    return false;
  }

  reset() {
    // Detruire les fighters existants.
    for (const f of this.fighters) {
      this.scene3d.scene.remove(f.character.group);
    }
    this.fighters = [];
    this.setup();
  }
}
