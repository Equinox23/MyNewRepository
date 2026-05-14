import { CLASS_LIST } from '../data/classes.js';
import { CREATURE_LIST } from '../data/creatures.js';
import { MAP_LIST } from '../data/maps.js';
import { SPELLS } from '../data/spells.js';
import { toggleFullscreen, isStandalone, isIosDevice } from '../systems/Fullscreen.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');

    this.add.text(640, 26, 'DOFUS BATTLE', {
      fontFamily: 'Trebuchet MS', fontSize: '36px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.selection = [];           // class ids
    this.enemySelection = [];      // creature ids
    this.mapIndex = 0;

    this.drawClassCards();
    this.drawPlayerSlots();
    this.drawCreatureGrid();
    this.drawEnemySlots();
    this.drawMapSelector();
    this.drawStartButton();
    this.drawSpellTooltipArea();
    this.drawFullscreenButton();

    this.input.keyboard.on('keydown-F', () => toggleFullscreen(this));
  }

  // ---------- HEROS ----------
  drawClassCards() {
    this.add.text(30, 60, 'Tes heros : choisis-en 3', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#f1c40f',
    });

    const startY = 80;
    const w = 230, h = 170, gap = 8;
    const totalW = CLASS_LIST.length * w + (CLASS_LIST.length - 1) * gap;
    const startX = (1280 - totalW) / 2;

    this.classCards = [];
    CLASS_LIST.forEach((cls, i) => {
      const x = startX + i * (w + gap);
      const y = startY;
      const bg = this.add.rectangle(x, y, w, h, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x444a66).setInteractive();
      this.add.image(x + 50, y + 70, 'portrait_' + cls.id).setOrigin(0.5).setScale(0.95);
      this.add.text(x + 105, y + 18, cls.name, {
        fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
      });
      this.add.text(x + 105, y + 44, cls.role, {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#9aa1c4', fontStyle: 'italic',
      });
      this.add.text(x + 105, y + 64, `PV ${cls.hp}`, { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#e74c3c' });
      this.add.text(x + 105, y + 80, `PA ${cls.pa}`, { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#3498db' });
      this.add.text(x + 105, y + 96, `PM ${cls.pm}`, { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#2ecc71' });
      this.add.text(x + 10, y + 130, cls.desc, {
        fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#cccccc', wordWrap: { width: w - 20 },
      });
      cls.spellIds.forEach((sid, j) => {
        this.add.image(x + 20 + j * 38, y + 156, 'spell_' + sid).setOrigin(0.5).setScale(0.42);
      });

      bg.on('pointerover', () => { bg.setStrokeStyle(2, 0xf1c40f); this.showSpellTooltip(cls); });
      bg.on('pointerout', () => bg.setStrokeStyle(2, this.selection.includes(cls.id) ? 0x2ecc71 : 0x444a66));
      bg.on('pointerdown', () => this.toggleClass(cls.id));
      this.classCards.push({ cls, bg });
    });
  }

  toggleClass(id) {
    if (this.selection.includes(id)) this.selection = this.selection.filter(x => x !== id);
    else if (this.selection.length < 3) this.selection.push(id);
    for (const c of this.classCards) {
      c.bg.setStrokeStyle(2, this.selection.includes(c.cls.id) ? 0x2ecc71 : 0x444a66);
    }
    this.refreshPlayerSlots();
    this.refreshStartButton();
  }

  drawPlayerSlots() {
    const y = 270;
    this.add.text(30, y - 20, 'Ton equipe :', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffffff' });
    this.playerSlots = [];
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 80;
      const bg = this.add.rectangle(x, y, 72, 72, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x666666).setInteractive();
      const img = this.add.image(x + 36, y + 36, 'portrait_iop').setOrigin(0.5).setScale(0.7).setVisible(false);
      const ph = this.add.text(x + 36, y + 36, '?', { fontSize: '28px', color: '#666666', fontFamily: 'Trebuchet MS' }).setOrigin(0.5);
      bg.on('pointerdown', () => {
        if (this.selection[i]) {
          this.selection.splice(i, 1);
          for (const c of this.classCards) c.bg.setStrokeStyle(2, this.selection.includes(c.cls.id) ? 0x2ecc71 : 0x444a66);
          this.refreshPlayerSlots();
          this.refreshStartButton();
        }
      });
      this.playerSlots.push({ bg, img, ph });
    }
  }

  refreshPlayerSlots() {
    for (let i = 0; i < 3; i++) {
      const slot = this.playerSlots[i];
      const id = this.selection[i];
      if (id) {
        slot.img.setTexture('portrait_' + id).setVisible(true);
        slot.ph.setText('');
        slot.bg.setStrokeStyle(3, 0x2ecc71);
      } else {
        slot.img.setVisible(false);
        slot.ph.setText('?');
        slot.bg.setStrokeStyle(2, 0x666666);
      }
    }
  }

  // ---------- BESTIAIRE ----------
  drawCreatureGrid() {
    this.add.text(30, 360, 'Bestiaire : choisis tes 3 adversaires (clic = ajouter)', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#e74c3c',
    });

    const startY = 380;
    const w = 144, h = 80, gap = 6;
    const totalW = 4 * w + 3 * gap;
    const startX = (1280 - totalW) / 2;

    this.creatureCards = [];
    CREATURE_LIST.forEach((cr, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = startX + col * (w + gap);
      const y = startY + row * (h + gap);

      const bg = this.add.rectangle(x, y, w, h, 0x1f2335).setOrigin(0).setStrokeStyle(2, cr.id.includes('Royal') ? 0xf1c40f : 0xaa3333).setInteractive();
      this.add.image(x + 36, y + 40, 'portrait_' + cr.id).setOrigin(0.5).setScale(0.7);
      this.add.text(x + 76, y + 12, cr.name, {
        fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
      });
      this.add.text(x + 76, y + 30, cr.role, {
        fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#9aa1c4', fontStyle: 'italic',
      });
      this.add.text(x + 76, y + 50, `PV ${cr.hp}`, { fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#e74c3c' });
      this.add.text(x + 76, y + 64, `PA ${cr.pa}  PM ${cr.pm}`, { fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#3498db' });

      bg.on('pointerover', () => { bg.setStrokeStyle(3, 0xf1c40f); this.showCreatureTooltip(cr); });
      bg.on('pointerout', () => bg.setStrokeStyle(2, cr.id.includes('Royal') ? 0xf1c40f : 0xaa3333));
      bg.on('pointerdown', () => this.addCreature(cr.id));
      this.creatureCards.push({ cr, bg });
    });
  }

  addCreature(id) {
    if (this.enemySelection.length >= 3) return;
    this.enemySelection.push(id);
    this.refreshEnemySlots();
    this.refreshStartButton();
  }

  drawEnemySlots() {
    const y = 562;
    this.add.text(30, y - 20, 'Equipe adverse :', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffffff' });
    this.enemySlots = [];
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 80;
      const bg = this.add.rectangle(x, y, 72, 72, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x666666).setInteractive();
      const img = this.add.image(x + 36, y + 36, 'portrait_bouftou').setOrigin(0.5).setScale(0.7).setVisible(false);
      const ph = this.add.text(x + 36, y + 36, '?', { fontSize: '28px', color: '#666666', fontFamily: 'Trebuchet MS' }).setOrigin(0.5);
      bg.on('pointerdown', () => {
        if (this.enemySelection[i]) {
          this.enemySelection.splice(i, 1);
          this.refreshEnemySlots();
          this.refreshStartButton();
        }
      });
      this.enemySlots.push({ bg, img, ph });
    }
    // Bouton random
    const rx = 270, ry = y;
    const rbg = this.add.rectangle(rx, ry, 200, 72, 0x34495e).setOrigin(0).setStrokeStyle(2, 0x111111).setInteractive();
    this.add.text(rx + 100, ry + 28, 'TIRER 3 AU HASARD', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(rx + 100, ry + 50, '(remplace l equipe adverse)', {
      fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#9aa1c4',
    }).setOrigin(0.5);
    rbg.on('pointerover', () => rbg.setStrokeStyle(2, 0xf1c40f));
    rbg.on('pointerout', () => rbg.setStrokeStyle(2, 0x111111));
    rbg.on('pointerdown', () => {
      this.enemySelection = [];
      for (let i = 0; i < 3; i++) {
        const c = CREATURE_LIST[Math.floor(Math.random() * CREATURE_LIST.length)];
        this.enemySelection.push(c.id);
      }
      this.refreshEnemySlots();
      this.refreshStartButton();
    });
  }

  refreshEnemySlots() {
    for (let i = 0; i < 3; i++) {
      const slot = this.enemySlots[i];
      const id = this.enemySelection[i];
      if (id) {
        slot.img.setTexture('portrait_' + id).setVisible(true);
        slot.ph.setText('');
        slot.bg.setStrokeStyle(3, 0xe74c3c);
      } else {
        slot.img.setVisible(false);
        slot.ph.setText('?');
        slot.bg.setStrokeStyle(2, 0x666666);
      }
    }
  }

  // ---------- MAP + START ----------
  drawMapSelector() {
    const y = 660;
    this.add.text(30, y - 20, 'Carte :', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffffff' });
    const box = this.add.rectangle(30, y, 240, 36, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x444a66);
    this.mapText = this.add.text(150, y + 18, '', { fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#f1c40f' }).setOrigin(0.5);
    const prev = this.add.text(48, y + 18, '<', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
    const next = this.add.text(252, y + 18, '>', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
    prev.on('pointerdown', () => { this.mapIndex = (this.mapIndex - 1 + MAP_LIST.length) % MAP_LIST.length; this.refreshMap(); });
    next.on('pointerdown', () => { this.mapIndex = (this.mapIndex + 1) % MAP_LIST.length; this.refreshMap(); });
    this.refreshMap();
  }

  refreshMap() {
    this.mapText.setText(MAP_LIST[this.mapIndex].name);
  }

  drawStartButton() {
    const x = 1000, y = 638, w = 240, h = 66;
    this.startBtn = this.add.rectangle(x, y, w, h, 0x3a3a3a).setOrigin(0).setStrokeStyle(3, 0x222222).setInteractive();
    this.startBtnTxt = this.add.text(x + w / 2, y + h / 2, 'COMBATTRE', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#888888', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.startBtn.on('pointerdown', () => {
      if (this.selection.length !== 3 || this.enemySelection.length !== 3) return;
      this.scene.start('CombatScene', {
        playerClasses: this.selection,
        enemyClasses: this.enemySelection,
        mapId: MAP_LIST[this.mapIndex].id,
      });
    });
  }

  refreshStartButton() {
    const ready = this.selection.length === 3 && this.enemySelection.length === 3;
    this.startBtn.setFillStyle(ready ? 0x27ae60 : 0x3a3a3a);
    this.startBtnTxt.setColor(ready ? '#ffffff' : '#888888');
  }

  // ---------- TOOLTIPS SORTS / CREATURES ----------
  drawSpellTooltipArea() {
    this.tooltipBg = this.add.rectangle(290, 270, 670, 80, 0x14182a).setOrigin(0).setStrokeStyle(2, 0x333a55);
    this.tooltipTitle = this.add.text(305, 280, 'Survole une carte pour voir les details', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#f1c40f',
    });
    this.tooltipIcons = [];
    this.tooltipLines = [];
    for (let i = 0; i < 4; i++) {
      const ix = 305 + i * 160;
      const icon = this.add.image(ix + 14, 320, 'spell_pression').setOrigin(0.5).setScale(0.5).setVisible(false);
      const t = this.add.text(ix + 30, 305, '', {
        fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#cccccc', wordWrap: { width: 130 }, lineSpacing: 2,
      });
      this.tooltipIcons.push(icon);
      this.tooltipLines.push(t);
    }
  }

  showSpellTooltip(entity) {
    this.tooltipTitle.setText(`Sorts du ${entity.name}`);
    for (let i = 0; i < 4; i++) {
      const sid = entity.spellIds[i];
      if (!sid) { this.tooltipIcons[i].setVisible(false); this.tooltipLines[i].setText(''); continue; }
      const s = SPELLS[sid];
      this.tooltipIcons[i].setTexture('spell_' + sid).setVisible(true);
      this.tooltipLines[i].setText(`${s.name}\n${s.apCost} PA, ${s.range.min}-${s.range.max}\n${s.desc}`);
    }
  }

  showCreatureTooltip(creature) { this.showSpellTooltip(creature); }

  // ---------- PLEIN ECRAN ----------
  drawFullscreenButton() {
    if (isStandalone()) return;
    const x = 1230, y = 26;
    const bg = this.add.rectangle(x, y, 60, 36, 0x222230).setStrokeStyle(2, 0x444466).setInteractive();
    const label = this.add.text(x, y, '[ ]', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    bg.on('pointerdown', () => toggleFullscreen(this));
    bg.on('pointerover', () => bg.setStrokeStyle(2, 0xf1c40f));
    bg.on('pointerout', () => bg.setStrokeStyle(2, 0x444466));
    if (isIosDevice()) {
      this.add.text(640, 714, "Astuce iPhone : ajoute le jeu a l ecran d accueil pour un vrai plein ecran.", {
        fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#9aa1c4', fontStyle: 'italic',
      }).setOrigin(0.5);
    }
  }
}
