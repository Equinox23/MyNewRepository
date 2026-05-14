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

const VIEW_W = 1280;
const VIEW_H = 720;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;

export class CombatScene extends Phaser.Scene {
  constructor() { super('CombatScene'); }

  init(data) { this.params = data || {}; }

  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');

    // ---- Etat du combat ----
    const mapId = this.params.mapId || 'arene';
    const map = MAPS[mapId];
    const playerClasses = this.params.playerClasses || ['iop', 'cra', 'eniripsa'];
    const enemyClasses = this.params.enemyClasses || ['iop', 'cra', 'sram'];

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

    this.state = { map, mapId, fighters, traps: [] };
    this.turn = new TurnManager(fighters);
    this.selectedSpell = null;
    this.hover = null;
    this.busy = false;
    this.logs = [];
    this.touchMode = false;
    this.pendingTile = null;
    this.pointerDownInfo = null;
    this.pinch = null;

    // ---- Cameras ----
    this.mainCam = this.cameras.main;
    this.mainCam.setBounds(-160, -120, VIEW_W + 320, VIEW_H + 240);
    this.uiCam = this.cameras.add(0, 0, VIEW_W, VIEW_H);
    this.uiCam.setName('uiCam');
    this.uiCam.transparent = true;
    this.uiCam.setScroll(0, 0);

    // Listes pour filtrage par camera
    this.worldObjs = [];
    this.uiObjs = [];

    // ---- Couches monde ----
    this.floorGfx = this.addWorld(this.add.graphics().setDepth(0));
    this.highlightGfx = this.addWorld(this.add.graphics().setDepth(100));
    this.hoverGfx = this.addWorld(this.add.graphics().setDepth(110));
    this.trapMarkers = []; // visuels de pieges allies

    this.drawFloor();
    this.drawWalls();
    this.createFighterSprites();

    // ---- HUD ----
    this.buildHud();
    this.buildZoomControls();

    // ---- Input ----
    this.input.mouse.disableContextMenu();
    // Zone tactile transparente couvrant la zone de jeu (entre top bar et bottom panel)
    const tapZone = this.add.rectangle(VIEW_W / 2, 330, VIEW_W, 540, 0xffffff, 0).setInteractive();
    this.addUi(tapZone); // ne pas zoomer
    tapZone.on('pointerdown', (p) => this.onMapPointerDown(p));

    this.input.on('pointermove', (p) => this.onPointerMove(p));
    this.input.on('pointerup', (p) => this.onPointerUp(p));
    this.input.on('wheel', (pointer, currentlyOver, dx, dy) => {
      const step = dy > 0 ? -0.1 : 0.1;
      this.setZoom(this.mainCam.zoom + step);
    });

    this.input.keyboard.on('keydown-ESC', () => this.cancelAction());
    this.input.keyboard.on('keydown-SPACE', () => { if (!this.busy && this.turn.current().team === 'player') this.endTurn(); });

    this.log('Combat lance !');
    this.startTurn();
  }

  update() {
    this.updatePinch();
  }

  // ---- Helpers cameras / listes ----
  addWorld(obj) {
    this.worldObjs.push(obj);
    this.uiCam.ignore(obj);
    return obj;
  }
  addUi(obj) {
    this.uiObjs.push(obj);
    this.mainCam.ignore(obj);
    return obj;
  }

  // ---- DESSIN SOL ----
  drawFloor() {
    const g = this.floorGfx;
    g.clear();
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (this.state.map.tiles[r][c] === 1) continue;
        this.drawTileDiamond(g, c, r, ((c + r) % 2 === 0 ? 0x2a3458 : 0x232b48), 0x141826);
      }
    }
  }

  drawTileDiamond(g, c, r, fill, stroke, alpha = 1) {
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

  // ---- DESSIN MURS 3D ISO ----
  drawWalls() {
    this.walls = [];
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (this.state.map.tiles[r][c] !== 1) continue;
        const g = this.add.graphics();
        this.drawWallAt(g, c, r);
        const depth = (c + r) * 1000 + 500;
        g.setDepth(depth);
        this.addWorld(g);
        this.walls.push({ c, r, g });
      }
    }
  }

  drawWallAt(g, c, r) {
    const p = tileToScreen(c, r);
    const H = 32; // hauteur visuelle du mur

    // Ombre au sol
    g.fillStyle(0x000000, 0.45);
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2);
    g.lineTo(p.x, p.y + TILE_H);
    g.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2);
    g.closePath();
    g.fillPath();

    // Face gauche (NW) - plus sombre
    g.fillStyle(0x4a352a, 1);
    g.lineStyle(1, 0x1a0d05, 1);
    g.beginPath();
    g.moveTo(p.x - TILE_W / 2, p.y + TILE_H / 2);
    g.lineTo(p.x, p.y + TILE_H);
    g.lineTo(p.x, p.y + TILE_H - H);
    g.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2 - H);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Face droite (NE) - plus claire
    g.fillStyle(0x6a4d3a, 1);
    g.beginPath();
    g.moveTo(p.x + TILE_W / 2, p.y + TILE_H / 2);
    g.lineTo(p.x, p.y + TILE_H);
    g.lineTo(p.x, p.y + TILE_H - H);
    g.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2 - H);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Top (eclaire)
    g.fillStyle(0x8a6d5a, 1);
    g.beginPath();
    g.moveTo(p.x, p.y - H);
    g.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2 - H);
    g.lineTo(p.x, p.y + TILE_H - H);
    g.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2 - H);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Crenelures / texture briques sur les faces
    g.lineStyle(1, 0x3a2a18, 0.7);
    for (let i = 1; i < 3; i++) {
      const y = p.y + TILE_H - (H / 3) * i;
      // ligne gauche
      g.beginPath();
      g.moveTo(p.x - TILE_W / 2, p.y + TILE_H / 2 - (H / 3) * i);
      g.lineTo(p.x, y);
      g.strokePath();
      // ligne droite
      g.beginPath();
      g.moveTo(p.x + TILE_W / 2, p.y + TILE_H / 2 - (H / 3) * i);
      g.lineTo(p.x, y);
      g.strokePath();
    }
    // brique verticale top
    g.lineStyle(1, 0x4a3a28, 0.5);
    g.beginPath();
    g.moveTo(p.x, p.y - H);
    g.lineTo(p.x, p.y + TILE_H - H);
    g.strokePath();
  }

  // ---- COMBATTANTS ----
  createFighterSprites() {
    for (const f of this.state.fighters) {
      const p = tileToScreen(f.c, f.r);
      const cont = this.add.container(p.x, p.y + TILE_H / 2);

      // Anneau d equipe au sol
      const ringColor = f.team === 'player' ? 0x2ecc71 : 0xe74c3c;
      const ring = this.add.graphics();
      ring.lineStyle(3, ringColor, 0.85);
      ring.fillStyle(ringColor, 0.18);
      ring.strokeEllipse(0, 4, 44, 18);
      ring.fillEllipse(0, 4, 44, 18);

      // Sprite portrait
      const sprite = this.add.image(0, -16, 'portrait_' + f.classId).setOrigin(0.5, 1);
      sprite.setScale(0.9);

      // Barre de vie cadre
      const hpBg = this.add.rectangle(0, 16, 50, 8, 0x111111).setStrokeStyle(1, 0x000000);
      const hpBar = this.add.rectangle(-25, 16, 50, 6, 0x2ecc71).setOrigin(0, 0.5);
      const hpText = this.add.text(0, 16, '', {
        fontFamily: 'Trebuchet MS', fontSize: '9px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Nom
      const nameText = this.add.text(0, 26, f.name, {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      // Indicateur tour actif (anneau jaune autour du sprite)
      const turnRing = this.add.graphics();
      turnRing.setVisible(false);

      cont.add([ring, turnRing, sprite, hpBg, hpBar, hpText, nameText]);
      cont.setDepth((f.c + f.r) * 1000 + 501);
      this.addWorld(cont);

      f.gfx = { cont, ring, turnRing, sprite, hpBg, hpBar, hpText, nameText };
      this.refreshFighterUi(f);
    }
  }

  refreshFighterUi(f) {
    const ratio = Math.max(0, f.hp / f.maxHp);
    f.gfx.hpBar.width = 50 * ratio;
    f.gfx.hpBar.fillColor = ratio > 0.5 ? 0x2ecc71 : (ratio > 0.25 ? 0xf39c12 : 0xe74c3c);
    f.gfx.hpText.setText(`${f.hp}/${f.maxHp}`);
    f.gfx.cont.setAlpha(f.alive ? 1 : 0.3);
    if (!f.alive) f.gfx.sprite.setTint(0x444444);

    const active = this.turn && this.turn.current() === f && f.alive;
    f.gfx.turnRing.clear();
    if (active) {
      f.gfx.turnRing.lineStyle(3, 0xf1c40f, 1);
      f.gfx.turnRing.strokeEllipse(0, 4, 50, 22);
      f.gfx.turnRing.setVisible(true);
    } else {
      f.gfx.turnRing.setVisible(false);
    }
  }

  refreshAllFighters() {
    for (const f of this.state.fighters) this.refreshFighterUi(f);
  }

  updateFighterDepth(f) {
    f.gfx.cont.setDepth((f.c + f.r) * 1000 + 501);
  }

  // ---- HUD ----
  buildHud() {
    // Bandeau ordre de tour
    const topBg = this.add.rectangle(0, 0, VIEW_W, 60, 0x000000, 0.7).setOrigin(0);
    this.addUi(topBg);
    this.addUi(this.add.text(20, 18, 'Ordre :', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#cccccc' }));
    this.turnIcons = [];
    this.turn.order.forEach((f, i) => {
      const x = 100 + i * 56;
      const r = this.add.rectangle(x, 30, 46, 46, f.team === 'player' ? 0x2ecc71 : 0xe74c3c).setOrigin(0.5).setStrokeStyle(2, 0x111111);
      const img = this.add.image(x, 30, 'portrait_' + f.classId).setOrigin(0.5).setScale(0.45);
      const initial = this.add.text(x - 18, 14, f.cls.name[0], {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.addUi(r); this.addUi(img); this.addUi(initial);
      this.turnIcons.push({ fighter: f, r, img, initial });
    });
    this.roundText = this.addUi(this.add.text(VIEW_W - 100, 30, 'Tour 1', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#f1c40f',
    }).setOrigin(0.5));

    // Bandeau bas
    this.addUi(this.add.rectangle(0, 600, VIEW_W, 120, 0x000000, 0.78).setOrigin(0));

    // Portrait combattant actif
    this.activePortrait = this.addUi(this.add.image(60, 660, 'portrait_iop').setOrigin(0.5).setScale(0.8));
    this.addUi(this.add.rectangle(60, 660, 76, 76, 0x000000, 0).setStrokeStyle(2, 0xf1c40f));
    this.curStatsText = this.addUi(this.add.text(110, 614, '', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffffff', lineSpacing: 4,
    }));

    // Sorts
    this.spellButtons = [];
    for (let i = 0; i < 5; i++) {
      const x = 380 + i * 80;
      const y = 660;
      const bg = this.add.rectangle(x, y, 74, 74, 0x222230).setStrokeStyle(3, 0x444466).setInteractive();
      const img = this.add.image(x, y, 'spell_pression').setOrigin(0.5).setScale(0.92);
      const cost = this.add.text(x + 26, y + 22, '', {
        fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#f1c40f', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5);
      const disabled = this.add.rectangle(x, y, 74, 74, 0x000000, 0).setVisible(false);
      this.addUi(bg); this.addUi(img); this.addUi(cost); this.addUi(disabled);
      this.spellButtons.push({ bg, img, cost, disabled, idx: i });
      bg.on('pointerdown', () => this.onSpellButtonClick(i));
      bg.on('pointerover', () => this.showSpellTooltip(i));
      bg.on('pointerout', () => this.hideSpellTooltip());
    }

    // Boutons annuler / fin de tour
    this.makeButton(850, 660, 100, 56, 'ANNULER', 0x34495e, () => { if (!this.busy) this.cancelAction(); });
    this.makeButton(1100, 660, 140, 60, 'FIN DE TOUR', 0xc0392b, () => {
      if (!this.busy && this.turn.current().team === 'player') this.endTurn();
    });

    // Journal
    this.addUi(this.add.rectangle(960, 80, 300, 510, 0x000000, 0.55).setOrigin(0).setStrokeStyle(1, 0x333a55));
    this.addUi(this.add.text(975, 90, 'Journal', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#f1c40f' }));
    this.logTexts = [];
    for (let i = 0; i < 18; i++) {
      const t = this.addUi(this.add.text(975, 115 + i * 25, '', {
        fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#cccccc', wordWrap: { width: 280 },
      }));
      this.logTexts.push(t);
    }

    // Tooltip sort
    this.spellTooltip = this.addUi(this.add.text(640, 594, '', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1));
  }

  makeButton(x, y, w, h, label, color, cb) {
    const bg = this.add.rectangle(x, y, w, h, color).setStrokeStyle(2, 0x111111).setInteractive();
    const t = this.add.text(x, y, label, {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.addUi(bg); this.addUi(t);
    bg.on('pointerdown', cb);
    bg.on('pointerover', () => bg.setStrokeStyle(2, 0xf1c40f));
    bg.on('pointerout', () => bg.setStrokeStyle(2, 0x111111));
    return { bg, t };
  }

  buildZoomControls() {
    const x = 1230, w = 44, h = 44;
    let y = 80;
    const mk = (sym, cb) => {
      const bg = this.add.rectangle(x, y, w, h, 0x222230).setStrokeStyle(2, 0x444466).setInteractive();
      const t = this.add.text(x, y, sym, {
        fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.addUi(bg); this.addUi(t);
      bg.on('pointerdown', cb);
      bg.on('pointerover', () => bg.setStrokeStyle(2, 0xf1c40f));
      bg.on('pointerout', () => bg.setStrokeStyle(2, 0x444466));
      y += h + 8;
    };
    mk('+', () => this.setZoom(this.mainCam.zoom + 0.2));
    mk('-', () => this.setZoom(this.mainCam.zoom - 0.2));
    mk('o', () => this.resetCamera());
    // legende
    this.addUi(this.add.text(x, y + 4, 'ZOOM', {
      fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#888899',
    }).setOrigin(0.5));
  }

  setZoom(z) {
    const newZoom = Phaser.Math.Clamp(z, ZOOM_MIN, ZOOM_MAX);
    this.mainCam.setZoom(newZoom);
    this.clampCamera();
  }

  resetCamera() {
    this.mainCam.setZoom(1);
    this.mainCam.setScroll(0, 0);
  }

  clampCamera() {
    // Phaser bounds clamp est natif (cam.setBounds active dirtyBounds).
  }

  refreshHud() {
    const cur = this.turn.current();
    this.roundText.setText('Tour ' + this.turn.round);
    this.activePortrait.setTexture('portrait_' + cur.classId);
    this.curStatsText.setText(
      `${cur.name}\nPV ${cur.hp}/${cur.maxHp}\nPA ${cur.pa}/${cur.maxPa}    PM ${cur.pm}/${cur.maxPm}`
    );

    const spells = cur.spells;
    for (let i = 0; i < this.spellButtons.length; i++) {
      const btn = this.spellButtons[i];
      const spell = spells[i];
      if (!spell) {
        btn.img.setVisible(false);
        btn.cost.setText('');
        btn.bg.setFillStyle(0x111118);
        btn.bg.disableInteractive();
        btn.disabled.setVisible(false);
        continue;
      }
      btn.bg.setInteractive();
      btn.img.setVisible(true);
      btn.img.setTexture('spell_' + spell.id);
      btn.cost.setText(spell.apCost + ' PA');
      const usable = cur.team === 'player' && cur.pa >= spell.apCost && !this.busy;
      const selected = this.selectedSpell === spell;
      btn.bg.setFillStyle(0x222230);
      btn.bg.setStrokeStyle(3, selected ? 0xf1c40f : (usable ? 0x6a7090 : 0x33384a));
      btn.disabled.setVisible(!usable);
      btn.disabled.setFillStyle(0x000000, usable ? 0 : 0.55);
      btn.img.setAlpha(usable ? 1 : 0.4);
    }

    for (const ic of this.turnIcons) {
      const active = this.turn.current() === ic.fighter;
      ic.r.setStrokeStyle(active ? 3 : 2, active ? 0xf1c40f : 0x111111);
      ic.r.setAlpha(ic.fighter.alive ? 1 : 0.35);
      ic.img.setAlpha(ic.fighter.alive ? 1 : 0.35);
    }

    this.refreshAllFighters();
  }

  showSpellTooltip(i) {
    const cur = this.turn.current();
    const spell = cur.spells[i];
    if (!spell) { this.spellTooltip.setText(''); return; }
    this.spellTooltip.setText(
      `${spell.name} - ${spell.desc}\nPortee ${spell.range.min}-${spell.range.max}` +
      (spell.needsLOS ? ', vue requise' : '') + (spell.inLine ? ', en ligne' : '')
    );
  }
  hideSpellTooltip() { this.spellTooltip.setText(''); }

  log(line) {
    this.logs.push(line);
    if (this.logs.length > this.logTexts.length) this.logs.shift();
    for (let i = 0; i < this.logTexts.length; i++) {
      this.logTexts[i].setText(this.logs[i] || '');
    }
  }

  // ---- INTERACTIONS ----
  isTouchPointer(p) {
    const ev = p && p.event;
    if (!ev) return false;
    if (ev.pointerType === 'touch') return true;
    if (typeof ev.type === 'string' && ev.type.startsWith('touch')) return true;
    return false;
  }

  onMapPointerDown(p) {
    if (this.pinch) return;
    if (this.isTouchPointer(p)) this.touchMode = true;
    this.pointerDownInfo = {
      x: p.x, y: p.y,
      startScrollX: this.mainCam.scrollX,
      startScrollY: this.mainCam.scrollY,
      time: this.time.now,
      dragging: false,
    };
  }

  onPointerMove(p) {
    if (this.pinch) return;
    if (this.pointerDownInfo && p.isDown) {
      const dx = p.x - this.pointerDownInfo.x;
      const dy = p.y - this.pointerDownInfo.y;
      const d = Math.hypot(dx, dy);
      if (d > 10) {
        if (this.mainCam.zoom > 1.02) {
          this.pointerDownInfo.dragging = true;
          this.mainCam.scrollX = this.pointerDownInfo.startScrollX - dx / this.mainCam.zoom;
          this.mainCam.scrollY = this.pointerDownInfo.startScrollY - dy / this.mainCam.zoom;
          this.hover = null;
          this.refreshHighlights();
          return;
        }
      }
    }
    if (this.isTouchPointer(p)) return;
    const wp = this.mainCam.getWorldPoint(p.x, p.y);
    const t = screenToTile(wp.x, wp.y);
    const f = this.findFighterAtScreen(p.x, p.y);
    const hoverTile = f ? { c: f.c, r: f.r } : (inBounds(t.c, t.r) ? t : null);
    if (!hoverTile) { if (this.hover) { this.hover = null; this.refreshHighlights(); } return; }
    if (!this.hover || this.hover.c !== hoverTile.c || this.hover.r !== hoverTile.r) {
      this.hover = hoverTile;
      this.refreshHighlights();
    }
  }

  onPointerUp(p) {
    if (this.pinch) return;
    if (!this.pointerDownInfo) return;
    const wasDragging = this.pointerDownInfo.dragging;
    this.pointerDownInfo = null;
    if (wasDragging) return;
    if (this.busy) return;
    // Tap court a partir de cette position.
    this.handleTap(p);
  }

  handleTap(p) {
    const cur = this.turn.current();
    if (cur.team !== 'player') return;

    // Clic droit souris = annuler
    if (!this.touchMode && (p.button === 2 || (p.rightButtonDown && p.rightButtonDown()))) {
      this.cancelAction();
      return;
    }

    // Resoudre la tuile cible: priorite combattant cliquables
    const f = this.findFighterAtScreen(p.x, p.y);
    let t;
    if (f) {
      t = { c: f.c, r: f.r };
    } else {
      const wp = this.mainCam.getWorldPoint(p.x, p.y);
      t = screenToTile(wp.x, wp.y);
      if (!inBounds(t.c, t.r)) return;
    }

    if (this.touchMode) {
      if (this.pendingTile && this.pendingTile.c === t.c && this.pendingTile.r === t.r) {
        const target = t;
        this.pendingTile = null;
        this.hover = null;
        if (this.selectedSpell) this.tryCastAt(target);
        else this.tryMoveTo(target);
        return;
      }
      this.pendingTile = t;
      this.hover = t;
      this.refreshHighlights();
      return;
    }

    if (this.selectedSpell) this.tryCastAt(t);
    else this.tryMoveTo(t);
  }

  findFighterAtScreen(sx, sy) {
    const wp = this.mainCam.getWorldPoint(sx, sy);
    // bbox de chaque sprite (en world coords)
    const sorted = this.state.fighters.filter(f => f.alive).sort((a, b) => (b.c + b.r) - (a.c + a.r));
    for (const f of sorted) {
      const sp = f.gfx.sprite;
      const w = sp.displayWidth, h = sp.displayHeight;
      const cx = f.gfx.cont.x + sp.x;
      const cy = f.gfx.cont.y + sp.y;
      // Origine sprite (0.5, 1) : top-left = cx - w/2, cy - h
      const left = cx - w / 2, right = cx + w / 2;
      const top = cy - h, bottom = cy;
      if (wp.x >= left && wp.x <= right && wp.y >= top && wp.y <= bottom) return f;
    }
    return null;
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
    if (this.state.map.tiles[t.r][t.c] === 1) return;
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
      if (this.state.map.tiles[t.r][t.c] === 1) return false;
      if (target) return false;
    }
    return true;
  }

  // ---- HIGHLIGHTS ----
  refreshHighlights() {
    const g = this.highlightGfx; g.clear();
    const hp = this.hoverGfx; hp.clear();
    if (this.busy) return;
    const cur = this.turn.current();
    if (!cur || cur.team !== 'player') return;

    const occ = this.computeOccupied(cur);

    if (this.selectedSpell) {
      const spell = this.selectedSpell;
      const range = computeReachableRange(cur, spell, this.state.map.tiles);
      for (const t of range) this.fillTile(g, t.c, t.r, 0x3498db, 0.25);
      if (this.hover) {
        if (this.spellTargetValid(cur, spell, this.hover)) {
          const area = tilesInArea(spell.area || { type: 'single' }, this.hover);
          for (const t of area) this.fillTile(g, t.c, t.r, 0xf1c40f, 0.55);
        } else {
          this.fillTile(g, this.hover.c, this.hover.r, 0xe74c3c, 0.45);
        }
      }
    } else {
      const result = bfs(this.state.map.tiles, occ, { c: cur.c, r: cur.r }, cur.pm);
      for (const [k, d] of result.dist.entries()) {
        if (d === 0) continue;
        const [c, r] = k.split(',').map(Number);
        this.fillTile(g, c, r, 0x2ecc71, 0.2);
      }
      if (this.hover) {
        const path = pathTo(result, this.hover);
        if (path && path.length > 1) {
          for (const t of path.slice(1)) this.fillTile(hp, t.c, t.r, 0xffffff, 0.4);
        }
      }
    }

    // Pieges allies (visibles pour le joueur)
    for (const trap of this.state.traps) {
      if (trap.ownerTeam === 'player') this.fillTile(g, trap.c, trap.r, 0x9b59b6, 0.5);
    }
  }

  // ---- ANIMATIONS / EFFETS ----
  animatePath(fighter, path, onDone) {
    const steps = path.slice(1);
    let i = 0;
    const stepNext = () => {
      if (i >= steps.length) {
        const events = [];
        triggerTrapsOn(this.state, fighter, events);
        this.consumeEvents(events);
        this.updateFighterDepth(fighter);
        onDone && onDone();
        return;
      }
      const next = steps[i++];
      fighter.c = next.c;
      fighter.r = next.r;
      const p = tileToScreen(next.c, next.r);
      this.updateFighterDepth(fighter);
      this.tweens.add({
        targets: fighter.gfx.cont,
        x: p.x,
        y: p.y + TILE_H / 2,
        duration: 160,
        onComplete: () => {
          const events = [];
          triggerTrapsOn(this.state, fighter, events);
          if (events.length) {
            this.consumeEvents(events);
            this.refreshAllFighters();
            if (!fighter.alive) { onDone && onDone(); return; }
          }
          stepNext();
        },
      });
    };
    stepNext();
  }

  castSpell(caster, spell, target, onDone) {
    this.flashTile(target.c, target.r, spell.color);
    this.spellAnim(caster, target, spell);
    this.log(`${caster.name} lance ${spell.name}.`);
    const events = applySpell(this.state, caster, spell, target);
    this.consumeEvents(events);
    this.refreshAllFighters();
    this.time.delayedCall(500, () => onDone && onDone());
  }

  spellAnim(caster, target, spell) {
    // Projectile: petite bille qui va du caster a la cible (sauf melee/self/teleport)
    const from = tileToScreen(caster.c, caster.r);
    const to = tileToScreen(target.c, target.r);
    const isMelee = spell.range && spell.range.max <= 1;
    const isSelf = spell.target === 'self';
    const hasTeleport = spell.effects.some(e => e.type === 'teleport');
    if (isMelee || isSelf || hasTeleport) return;

    const dot = this.add.circle(from.x, from.y + TILE_H / 2 - 14, 7, spell.color, 1);
    dot.setStrokeStyle(2, 0x000000, 0.5);
    dot.setDepth(99999);
    this.addWorld(dot);
    this.tweens.add({
      targets: dot,
      x: to.x, y: to.y + TILE_H / 2 - 14,
      duration: 320,
      onComplete: () => dot.destroy(),
    });
  }

  flashTile(c, r, color) {
    const p = tileToScreen(c, r);
    const flash = this.add.ellipse(p.x, p.y + TILE_H / 2, 56, 28, color, 0.7);
    flash.setDepth(99998);
    this.addWorld(flash);
    this.tweens.add({
      targets: flash, alpha: 0, scaleX: 1.7, scaleY: 1.7, duration: 520,
      onComplete: () => flash.destroy(),
    });
  }

  consumeEvents(events) {
    for (const e of events) {
      if (e.text) this.log(e.text);
      if (e.type === 'damage' && e.target && e.target.gfx) {
        this.popText(e.target, '-' + e.amount, '#ff5577');
        this.shakeFighter(e.target);
      } else if (e.type === 'heal' && e.target && e.target.gfx) {
        this.popText(e.target, '+' + e.amount, '#7dffa0');
      } else if (e.type === 'trap_placed') {
        this.flashTile(e.tile.c, e.tile.r, 0x9b59b6);
      } else if (e.type === 'dot' && e.target && e.target.gfx) {
        this.popText(e.target, 'POISON', '#9b59b6');
      } else if (e.type === 'buff' && e.target && e.target.gfx) {
        this.popText(e.target, 'BUFF', '#f1c40f');
      }
    }
  }

  popText(fighter, text, color) {
    const p = tileToScreen(fighter.c, fighter.r);
    const t = this.add.text(p.x, p.y - 20, text, {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(999999);
    this.addWorld(t);
    this.tweens.add({ targets: t, y: p.y - 70, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  shakeFighter(f) {
    const ox = f.gfx.cont.x;
    this.tweens.add({
      targets: f.gfx.cont, x: ox + 6, duration: 60, yoyo: true, repeat: 2,
      onComplete: () => { f.gfx.cont.x = ox; },
    });
  }

  // ---- TURN FLOW ----
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
    if (cur.dots && cur.dots.length) {
      const total = cur.applyDots();
      if (total > 0) {
        this.log(`${cur.name} subit ${total} degats de poison.`);
        this.popText(cur, '-' + total, '#9b59b6');
      }
    }
    this.hover = null;
    this.pendingTile = null;
    this.refreshHud();
    this.refreshHighlights();
    this.log(`> Au tour de ${cur.name}.`);
    if (this.checkEnd()) return;
    if (!cur.alive) { this.endTurn(); return; }

    // Centrer la camera sur le combattant actif si zoom > 1
    if (this.mainCam.zoom > 1.02) {
      const p = tileToScreen(cur.c, cur.r);
      this.mainCam.pan(p.x, p.y, 300, 'Sine.easeInOut');
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
    this.pendingTile = null;
    if (this.checkEnd()) return;
    this.turn.advance();
    this.startTurn();
  }

  runAI() {
    const cur = this.turn.current();
    const actions = planTurn(this.state, cur);
    let i = 0;
    const next = () => {
      if (i >= actions.length) { this.busy = false; this.endTurn(); return; }
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
      } else { next(); }
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

  // ---- PINCH ZOOM ----
  updatePinch() {
    const p1 = this.input.pointer1;
    const p2 = this.input.pointer2;
    if (p1 && p2 && p1.isDown && p2.isDown) {
      const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      if (this.pinch) {
        const factor = dist / Math.max(8, this.pinch.startDist);
        const newZoom = Phaser.Math.Clamp(this.pinch.startZoom * factor, ZOOM_MIN, ZOOM_MAX);
        this.mainCam.setZoom(newZoom);
        const dx = mid.x - this.pinch.startMid.x;
        const dy = mid.y - this.pinch.startMid.y;
        this.mainCam.scrollX = this.pinch.startScrollX - dx / Math.max(0.5, newZoom);
        this.mainCam.scrollY = this.pinch.startScrollY - dy / Math.max(0.5, newZoom);
      } else {
        this.pinch = {
          startDist: dist, startMid: mid,
          startZoom: this.mainCam.zoom,
          startScrollX: this.mainCam.scrollX,
          startScrollY: this.mainCam.scrollY,
        };
        this.pointerDownInfo = null;
      }
    } else if (this.pinch) {
      this.pinch = null;
    }
  }
}

function computeReachableRange(caster, spell, tiles) {
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
