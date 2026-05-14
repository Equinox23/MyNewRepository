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
    const player = this.fighters.find(f => f.alive && f.team !== ai.team);
    if (!player) { this.checkEnd(); return; }
    const atk = ai.def.attack;

    // Approcher la cible si on n est pas en portee.
    while (ai.alive && ai.pm > 0) {
      const dist = Math.abs(ai.c - player.c) + Math.abs(ai.r - player.r);
      if (dist <= atk.range) break;
      const occ = this.computeOccupied(ai);
      const result = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, ai.pm);
      const goals = [
        { c: player.c + 1, r: player.r },
        { c: player.c - 1, r: player.r },
        { c: player.c, r: player.r + 1 },
        { c: player.c, r: player.r - 1 },
      ];
      let best = null;
      for (const g of goals) {
        const k = `${g.c},${g.r}`;
        if (!result.dist.has(k)) continue;
        const d = result.dist.get(k);
        if (best === null || d < best.d) best = { g, d };
      }
      if (!best) break;
      const path = pathTo(result, best.g);
      if (!path || path.length <= 1) break;
      const steps = path.slice(1, ai.pm + 1);
      for (const step of steps) {
        await ai.character.moveTo(step.c, step.r, 170);
        ai.c = step.c;
        ai.r = step.r;
        ai.pm--;
      }
      break;
    }

    // Attaquer tant qu on est en portee et qu on a les PA.
    while (ai.alive) {
      const dist = Math.abs(ai.c - player.c) + Math.abs(ai.r - player.r);
      if (dist > atk.range) break;
      if (ai.pa < atk.apCost) break;
      ai.pa -= atk.apCost;
      await this.playAttack(ai, player);
      if (this.checkEnd()) return;
      if (!player.alive) break;
    }

    // L IA a fini ses actions : on libere busy puis on avance le tour
    // (via la voie interne pour ne pas etre bloque par busy).
    this.busy = false;
    this._advanceTurn();
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
