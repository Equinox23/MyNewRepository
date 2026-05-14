import { MAPS, MAP_COLS, MAP_ROWS } from '../data/maps.js';
import { CLASSES } from '../data/classes.js';
import { Fighter } from '../systems/Fighter.js';
import { TurnManager } from '../systems/TurnManager.js';
import {
  TILE_W, TILE_H, tileToScreen, screenToTile, inBounds,
  bfs, pathTo, hasLineOfSight, manhattan, tilesInArea, inLine,
} from '../systems/Grid.js';
import { applySpell, triggerTrapsOn } from '../systems/Combat.js';
import { planTurn } from '../systems/AI.js';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super('CombatScene');
  }

  init(data) {
    this.params = data || {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');

    const mapId = this.params.mapId || 'arene';
    const map = MAPS[mapId];
    const playerClasses = this.params.playerClasses || ['iop', 'cra', 'eniripsa'];
    const enemyClasses = this.params.enemyClasses || ['iop', 'cra', 'sram'];

    // Construire les combattants
    const fighters = [];
    playerClasses.forEach((cls, i) => {
      const [c, r] = map.playerSpawns[i];
      fighters.push(new Fighter(cls, 'player', c, r));
    });
    enemyClasses.forEach((cls, i) => {
      const [c, r] = map.enemySpawns[i];
      const f = new Fighter(cls, 'enemy', c, r);
      f.name = f.cls.name + ' (E)';
      fighters.push(f);
    });

    this.state = {
      map,
      mapId,
      fighters,
      traps: [],
    };
    this.turn = new TurnManager(fighters);
    this.selectedSpell = null;
    this.hover = null;
    this.busy = false; // pendant les animations / IA
    this.logs = [];
    // mode tactile: tap-preview puis tap-confirm sur la meme case
    this.touchMode = false;
    this.pendingTile = null;

    this.layers = {
      grid: this.add.graphics(),
      highlight: this.add.graphics(),
      hoverPath: this.add.graphics(),
      fighters: this.add.container(),
      effects: this.add.container(),
      ui: this.add.container(),
    };

    this.drawGrid();
    this.createFighterSprites();
    this.buildHud();

    this.input.mouse.disableContextMenu();
    this.input.on('pointermove', (p) => this.onPointerMove(p));
    this.input.on('pointerdown', (p) => this.onPointerDown(p));
    this.input.keyboard.on('keydown-ESC', () => { this.selectedSpell = null; this.refreshHighlights(); });
    this.input.keyboard.on('keydown-SPACE', () => { if (!this.busy && this.turn.current().team === 'player') this.endTurn(); });

    this.log('Combat lance !');
    this.startTurn();
  }

  // --- DESSIN GRILLE ---

  drawGrid() {
    const g = this.layers.grid;
    g.clear();
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const blocked = this.state.map.tiles[r][c] === 1;
        this.drawTile(g, c, r, blocked ? 0x3a2818 : ((c + r) % 2 === 0 ? 0x2a3458 : 0x232b48), 0x141826);
      }
    }
  }

  drawTile(g, c, r, fill, stroke, alpha = 1) {
    const p = tileToScreen(c, r);
    g.lineStyle(1, stroke, alpha);
    g.fillStyle(fill, alpha);
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2);
    g.lineTo(p.x, p.y + TILE_H);
    g.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2);
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  // --- COMBATTANTS ---

  createFighterSprites() {
    for (const f of this.state.fighters) {
      const p = tileToScreen(f.c, f.r);
      const cont = this.add.container(p.x, p.y + TILE_H / 2);
      const ring = this.add.circle(0, -4, 22, f.team === 'player' ? 0x2ecc71 : 0xe74c3c, 0.3);
      const body = this.add.circle(0, -8, 18, f.cls.color);
      body.setStrokeStyle(2, 0xffffff);
      const initial = this.add.text(0, -10, f.cls.name[0], {
        fontSize: '20px', color: '#ffffff', fontFamily: 'Trebuchet MS', fontStyle: 'bold',
      }).setOrigin(0.5);
      const hpBg = this.add.rectangle(0, 16, 44, 6, 0x111111).setOrigin(0.5);
      const hpBar = this.add.rectangle(-22, 16, 44, 6, 0x2ecc71).setOrigin(0, 0.5);
      const nameText = this.add.text(0, 26, f.name, {
        fontSize: '11px', color: '#ffffff',
      }).setOrigin(0.5);
      cont.add([ring, body, initial, hpBg, hpBar, nameText]);
      this.layers.fighters.add(cont);
      f.gfx = { cont, ring, body, hpBar, nameText };
      this.refreshFighterUi(f);
    }
    this.depthSortFighters();
  }

  depthSortFighters() {
    const list = this.state.fighters.slice().sort((a, b) => (a.c + a.r) - (b.c + b.r));
    list.forEach((f, i) => f.gfx.cont.setDepth(i + 1));
  }

  refreshFighterUi(f) {
    const ratio = f.hp / f.maxHp;
    f.gfx.hpBar.width = 44 * ratio;
    f.gfx.hpBar.fillColor = ratio > 0.5 ? 0x2ecc71 : (ratio > 0.25 ? 0xf39c12 : 0xe74c3c);
    f.gfx.cont.setAlpha(f.alive ? 1 : 0.3);
    if (this.turn && this.turn.current() === f && f.alive) {
      f.gfx.ring.setStrokeStyle(3, 0xf1c40f);
    } else {
      f.gfx.ring.setStrokeStyle(0);
    }
  }

  refreshAllFighters() {
    for (const f of this.state.fighters) this.refreshFighterUi(f);
  }

  // --- HUD ---

  buildHud() {
    // Bandeau ordre de tour
    this.add.rectangle(0, 0, 1280, 60, 0x000000, 0.6).setOrigin(0);
    this.add.text(20, 18, 'Ordre :', { fontSize: '16px', color: '#cccccc' });
    this.turnIcons = [];
    this.turn.order.forEach((f, i) => {
      const x = 100 + i * 50;
      const r = this.add.rectangle(x, 30, 40, 40, f.team === 'player' ? 0x2ecc71 : 0xe74c3c).setOrigin(0.5).setStrokeStyle(2, 0x111111);
      const c = this.add.circle(x, 30, 14, f.cls.color);
      const t = this.add.text(x, 30, f.cls.name[0], { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      this.turnIcons.push({ fighter: f, r, c, t });
    });

    // Round
    this.roundText = this.add.text(1180, 30, 'Tour 1', { fontSize: '20px', color: '#f1c40f' }).setOrigin(0.5);

    // Bandeau bas: infos perso + sorts
    this.add.rectangle(0, 600, 1280, 120, 0x000000, 0.7).setOrigin(0);
    this.curStatsText = this.add.text(20, 615, '', { fontSize: '16px', color: '#ffffff' });
    this.spellButtons = [];
    for (let i = 0; i < 5; i++) {
      const x = 360 + i * 90;
      const y = 660;
      const bg = this.add.rectangle(x, y, 78, 78, 0x222230).setStrokeStyle(2, 0x444466).setInteractive();
      const label = this.add.text(x, y - 18, '', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
      const cost = this.add.text(x + 30, y + 22, '', { fontSize: '14px', color: '#f1c40f' }).setOrigin(0.5);
      const tip = this.add.text(x, y + 45, '', { fontSize: '11px', color: '#cccccc', wordWrap: { width: 78 } }).setOrigin(0.5, 0);
      this.spellButtons.push({ bg, label, cost, tip, idx: i });
      bg.on('pointerdown', () => this.onSpellButtonClick(i));
      bg.on('pointerover', () => this.showSpellTooltip(i));
      bg.on('pointerout', () => this.hideSpellTooltip());
    }

    // Bouton annuler (selection de sort / tile en attente)
    const cx = 870, cy = 660;
    const cancelBtn = this.add.rectangle(cx, cy, 110, 60, 0x34495e).setStrokeStyle(2, 0x111111).setInteractive();
    this.add.text(cx, cy, 'ANNULER', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    cancelBtn.on('pointerdown', () => { if (!this.busy) this.cancelAction(); });

    // Bouton fin de tour
    const ex = 1100, ey = 660;
    const endBtn = this.add.rectangle(ex, ey, 140, 60, 0xc0392b).setStrokeStyle(2, 0x111111).setInteractive();
    this.add.text(ex, ey, 'FIN DE TOUR', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    endBtn.on('pointerdown', () => {
      if (!this.busy && this.turn.current().team === 'player') this.endTurn();
    });

    // Journal de combat
    this.add.rectangle(960, 80, 300, 510, 0x000000, 0.5).setOrigin(0);
    this.add.text(975, 90, 'Journal', { fontSize: '16px', color: '#f1c40f' });
    this.logTexts = [];
    for (let i = 0; i < 18; i++) {
      const t = this.add.text(975, 115 + i * 25, '', { fontSize: '12px', color: '#cccccc', wordWrap: { width: 280 } });
      this.logTexts.push(t);
    }

    // Tooltip survol case
    this.spellTooltip = this.add.text(640, 580, '', { fontSize: '13px', color: '#f1c40f' }).setOrigin(0.5);
  }

  refreshHud() {
    const cur = this.turn.current();
    this.roundText.setText('Tour ' + this.turn.round);
    this.curStatsText.setText(
      `${cur.name}\nPV ${cur.hp}/${cur.maxHp}    PA ${cur.pa}/${cur.maxPa}    PM ${cur.pm}/${cur.maxPm}`
    );

    // Sorts
    const spells = cur.spells;
    for (let i = 0; i < this.spellButtons.length; i++) {
      const btn = this.spellButtons[i];
      const spell = spells[i];
      if (!spell) {
        btn.bg.setFillStyle(0x111118);
        btn.label.setText('');
        btn.cost.setText('');
        btn.bg.disableInteractive();
        continue;
      }
      btn.bg.setInteractive();
      btn.label.setText(spell.short);
      btn.cost.setText(spell.apCost + ' PA');
      const usable = cur.team === 'player' && cur.pa >= spell.apCost && !this.busy;
      const selected = this.selectedSpell === spell;
      btn.bg.setFillStyle(selected ? 0xf1c40f : (usable ? spell.color : 0x222230), 1);
      btn.label.setColor(usable ? '#ffffff' : '#777777');
    }

    for (const ic of this.turnIcons) {
      const active = this.turn.current() === ic.fighter;
      ic.r.setStrokeStyle(active ? 3 : 2, active ? 0xf1c40f : 0x111111);
      ic.r.setAlpha(ic.fighter.alive ? 1 : 0.3);
    }

    this.refreshAllFighters();
  }

  showSpellTooltip(i) {
    const cur = this.turn.current();
    const spell = cur.spells[i];
    if (!spell) { this.spellTooltip.setText(''); return; }
    this.spellTooltip.setText(`${spell.name} - ${spell.desc}`);
  }

  hideSpellTooltip() { this.spellTooltip.setText(''); }

  log(line) {
    this.logs.push(line);
    if (this.logs.length > this.logTexts.length) this.logs.shift();
    for (let i = 0; i < this.logTexts.length; i++) {
      this.logTexts[i].setText(this.logs[i] || '');
    }
  }

  // --- INTERACTIONS ---

  onPointerMove(p) {
    // Sur tactile, le pointermove est emis lors du touch sans valeur ajoutee:
    // on ignore pour eviter de melanger avec le mode tap-confirm.
    if (this.isTouchPointer(p)) return;
    const t = screenToTile(p.x, p.y);
    if (!inBounds(t.c, t.r)) { this.hover = null; this.refreshHighlights(); return; }
    if (!this.hover || this.hover.c !== t.c || this.hover.r !== t.r) {
      this.hover = t;
      this.refreshHighlights();
    }
  }

  isTouchPointer(p) {
    const ev = p && p.event;
    if (!ev) return false;
    if (ev.pointerType === 'touch') return true;
    if (typeof ev.type === 'string' && ev.type.startsWith('touch')) return true;
    return false;
  }

  onPointerDown(p) {
    if (this.busy) return;
    if (this.isTouchPointer(p)) this.touchMode = true;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    const t = screenToTile(p.x, p.y);
    if (!inBounds(t.c, t.r)) return;

    // Clic droit (souris uniquement) = annuler la selection
    if (!this.touchMode && (p.button === 2 || p.rightButtonDown())) {
      this.cancelAction();
      return;
    }

    if (this.touchMode) {
      // Mode tactile: 1er tap = preview ; 2e tap meme case = confirmer.
      if (this.pendingTile && this.pendingTile.c === t.c && this.pendingTile.r === t.r) {
        const target = t;
        this.pendingTile = null;
        this.hover = null;
        if (this.selectedSpell) this.tryCastAt(target);
        else this.tryMoveTo(target);
        return;
      }
      // Sinon: mettre cette case en preview (pseudo-hover)
      this.pendingTile = t;
      this.hover = t;
      this.refreshHighlights();
      return;
    }

    // Souris: action immediate
    if (this.selectedSpell) this.tryCastAt(t);
    else this.tryMoveTo(t);
  }

  cancelAction() {
    this.selectedSpell = null;
    this.pendingTile = null;
    this.refreshHud();
    this.refreshHighlights();
  }

  onSpellButtonClick(i) {
    if (this.busy) return;
    const cur = this.turn.current();
    if (cur.team !== 'player') return;
    const spell = cur.spells[i];
    if (!spell) return;
    if (cur.pa < spell.apCost) return;
    this.selectedSpell = (this.selectedSpell === spell) ? null : spell;
    this.pendingTile = null;
    this.refreshHud();
    this.refreshHighlights();
  }

  tryMoveTo(t) {
    const cur = this.turn.current();
    if (cur.pm <= 0) return;
    const occ = this.computeOccupied(cur);
    const result = bfs(this.state.map.tiles, occ, { c: cur.c, r: cur.r }, cur.pm);
    const path = pathTo(result, t);
    if (!path || path.length <= 1) return;
    cur.pm -= (path.length - 1);
    this.busy = true;
    this.animatePath(cur, path, () => {
      this.busy = false;
      this.refreshHud();
      this.refreshHighlights();
    });
  }

  tryCastAt(t) {
    const cur = this.turn.current();
    const spell = this.selectedSpell;
    if (!spell) return;
    if (cur.pa < spell.apCost) return;
    if (!this.spellTargetValid(cur, spell, t)) return;
    cur.pa -= spell.apCost;
    this.busy = true;
    this.castSpell(cur, spell, t, () => {
      this.busy = false;
      this.selectedSpell = null;
      this.refreshHud();
      this.refreshHighlights();
      this.checkEnd();
    });
  }

  spellTargetValid(caster, spell, t) {
    const dist = manhattan({ c: caster.c, r: caster.r }, t);
    if (dist < spell.range.min || dist > spell.range.max) return false;
    if (spell.inLine && !inLine({ c: caster.c, r: caster.r }, t)) return false;
    if (spell.needsLOS) {
      const occ = this.computeOccupied(caster);
      if (!hasLineOfSight(this.state.map.tiles, occ, { c: caster.c, r: caster.r }, t)) return false;
    }
    const target = this.state.fighters.find(f => f.alive && f.c === t.c && f.r === t.r);
    if (spell.target === 'enemy' && (!target || target.team === caster.team)) return false;
    if (spell.target === 'ally' && !(target && target.team === caster.team)) return false;
    if (spell.target === 'self' && (t.c !== caster.c || t.r !== caster.r)) return false;
    if (spell.target === 'tile') {
      // pour teleport, la case doit etre libre ; pour piege idem
      const blocked = this.state.map.tiles[t.r][t.c] === 1;
      if (blocked) return false;
      if (target) return false;
    }
    return true;
  }

  // --- HIGHLIGHTS ---

  refreshHighlights() {
    const g = this.layers.highlight;
    const hp = this.layers.hoverPath;
    g.clear();
    hp.clear();
    if (this.busy) return;
    const cur = this.turn.current();
    if (!cur || cur.team !== 'player') return;

    const occ = this.computeOccupied(cur);

    if (this.selectedSpell) {
      const spell = this.selectedSpell;
      // portee
      const range = computeReachableRange(cur, spell);
      for (const t of range) this.fillTile(g, t.c, t.r, 0x3498db, 0.25);
      // ligne de vue / validite
      if (this.hover) {
        if (this.spellTargetValid(cur, spell, this.hover)) {
          // zone d effet
          const area = tilesInArea(spell.area || { type: 'single' }, this.hover);
          for (const t of area) this.fillTile(g, t.c, t.r, 0xf1c40f, 0.5);
        } else {
          this.fillTile(g, this.hover.c, this.hover.r, 0xe74c3c, 0.4);
        }
      }
    } else {
      // mouvement
      const result = bfs(this.state.map.tiles, occ, { c: cur.c, r: cur.r }, cur.pm);
      for (const [k, d] of result.dist.entries()) {
        if (d === 0) continue;
        const [c, r] = k.split(',').map(Number);
        this.fillTile(g, c, r, 0x2ecc71, 0.18);
      }
      if (this.hover) {
        const path = pathTo(result, this.hover);
        if (path && path.length > 1) {
          for (const t of path.slice(1)) this.fillTile(hp, t.c, t.r, 0xffffff, 0.35);
        }
      }
    }

    // afficher les pieges du joueur (les ennemis sont caches)
    for (const trap of this.state.traps) {
      if (trap.ownerTeam === 'player') this.fillTile(g, trap.c, trap.r, 0x9b59b6, 0.4);
    }
  }

  fillTile(g, c, r, color, alpha) {
    const p = tileToScreen(c, r);
    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2);
    g.lineTo(p.x, p.y + TILE_H);
    g.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2);
    g.closePath();
    g.fillPath();
  }

  // --- ANIMATIONS / EFFETS ---

  animatePath(fighter, path, onDone) {
    const steps = path.slice(1);
    let i = 0;
    const stepNext = () => {
      if (i >= steps.length) {
        // checker piege
        const events = [];
        triggerTrapsOn(this.state, fighter, events);
        this.consumeEvents(events);
        this.depthSortFighters();
        onDone && onDone();
        return;
      }
      const next = steps[i++];
      fighter.c = next.c;
      fighter.r = next.r;
      const p = tileToScreen(next.c, next.r);
      this.tweens.add({
        targets: fighter.gfx.cont,
        x: p.x,
        y: p.y + TILE_H / 2,
        duration: 140,
        onComplete: () => {
          // verifier piege a chaque pas
          const events = [];
          triggerTrapsOn(this.state, fighter, events);
          if (events.length) {
            this.consumeEvents(events);
            this.depthSortFighters();
            this.refreshAllFighters();
            if (!fighter.alive) { onDone && onDone(); return; }
          }
          this.depthSortFighters();
          stepNext();
        },
      });
    };
    stepNext();
  }

  castSpell(caster, spell, target, onDone) {
    this.flashTile(target.c, target.r, spell.color);
    this.log(`${caster.name} lance ${spell.name}.`);
    const events = applySpell(this.state, caster, spell, target);
    this.consumeEvents(events);
    this.refreshAllFighters();
    this.depthSortFighters();
    this.time.delayedCall(450, () => onDone && onDone());
  }

  flashTile(c, r, color) {
    const p = tileToScreen(c, r);
    const flash = this.add.circle(p.x, p.y + TILE_H / 2, 28, color, 0.7);
    this.tweens.add({
      targets: flash, alpha: 0, scale: 1.8, duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  consumeEvents(events) {
    for (const e of events) {
      if (e.text) this.log(e.text);
      if (e.type === 'damage' && e.target && e.target.gfx) {
        this.popText(e.target, '-' + e.amount, '#e74c3c');
        this.shakeFighter(e.target);
      } else if (e.type === 'heal' && e.target && e.target.gfx) {
        this.popText(e.target, '+' + e.amount, '#2ecc71');
      } else if (e.type === 'trap_placed') {
        this.flashTile(e.tile.c, e.tile.r, 0x9b59b6);
      }
    }
  }

  popText(fighter, text, color) {
    const p = tileToScreen(fighter.c, fighter.r);
    const t = this.add.text(p.x, p.y - 10, text, { fontSize: '20px', color, fontStyle: 'bold' }).setOrigin(0.5).setDepth(999);
    this.tweens.add({ targets: t, y: p.y - 60, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  shakeFighter(f) {
    const ox = f.gfx.cont.x;
    this.tweens.add({
      targets: f.gfx.cont, x: ox + 6, duration: 60, yoyo: true, repeat: 2,
      onComplete: () => { f.gfx.cont.x = ox; },
    });
  }

  // --- TURN FLOW ---

  computeOccupied(exclude) {
    const occ = new Set();
    for (const f of this.state.fighters) {
      if (!f.alive) continue;
      if (exclude && f.id === exclude.id) continue;
      occ.add(`${f.c},${f.r}`);
    }
    return occ;
  }

  startTurn() {
    const cur = this.turn.current();
    cur.startTurn();
    // appliquer les DoT
    if (cur.dots && cur.dots.length) {
      const total = cur.applyDots();
      if (total > 0) {
        this.log(`${cur.name} subit ${total} degats de poison.`);
        this.popText(cur, '-' + total, '#9b59b6');
      }
    }
    this.refreshHud();
    this.refreshHighlights();
    this.log(`> Au tour de ${cur.name}.`);
    if (this.checkEnd()) return;

    if (!cur.alive) {
      this.endTurn();
      return;
    }
    if (cur.team === 'enemy') {
      this.busy = true;
      this.time.delayedCall(500, () => this.runAI());
    }
  }

  endTurn() {
    const cur = this.turn.current();
    cur.endTurn();
    this.selectedSpell = null;
    if (this.checkEnd()) return;
    this.turn.advance();
    this.startTurn();
  }

  runAI() {
    const cur = this.turn.current();
    const actions = planTurn(this.state, cur);
    let i = 0;
    const next = () => {
      if (i >= actions.length) {
        this.busy = false;
        this.endTurn();
        return;
      }
      const action = actions[i++];
      if (action.type === 'move') {
        cur.pm -= (action.path.length - 1);
        this.animatePath(cur, action.path, () => {
          this.refreshHud();
          this.time.delayedCall(150, next);
        });
      } else if (action.type === 'cast') {
        cur.pa -= action.spell.apCost;
        this.castSpell(cur, action.spell, action.target, () => {
          this.refreshHud();
          if (this.checkEnd()) { this.busy = false; return; }
          this.time.delayedCall(200, next);
        });
      } else {
        next();
      }
    };
    next();
  }

  checkEnd() {
    const w = this.turn.hasWinner();
    if (w) {
      this.busy = true;
      this.time.delayedCall(900, () => {
        this.scene.start('EndScene', { winner: w, params: this.params });
      });
      return true;
    }
    return false;
  }
}

function computeReachableRange(caster, spell) {
  // Ne tient pas compte des obstacles -- comme Dofus pour la portee de base.
  const out = [];
  const max = spell.range.max;
  const min = spell.range.min;
  for (let dr = -max; dr <= max; dr++) {
    for (let dc = -max; dc <= max; dc++) {
      const d = Math.abs(dr) + Math.abs(dc);
      if (d < min || d > max) continue;
      if (spell.inLine && !(dc === 0 || dr === 0)) continue;
      const c = caster.c + dc;
      const r = caster.r + dr;
      if (!inBounds(c, r)) continue;
      out.push({ c, r });
    }
  }
  return out;
}
