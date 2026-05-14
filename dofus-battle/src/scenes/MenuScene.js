import { CLASS_LIST } from '../data/classes.js';
import { MAP_LIST } from '../data/maps.js';
import { SPELLS } from '../data/spells.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');

    // Bandeau titre
    this.add.text(640, 40, 'DOFUS BATTLE', {
      fontFamily: 'Trebuchet MS', fontSize: '48px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(640, 84, 'Composez votre equipe de 3 personnages', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#cccccc',
    }).setOrigin(0.5);

    this.selection = [];
    this.mapIndex = 0;
    this.aiClasses = ['iop', 'cra', 'eniripsa'];

    this.drawClassCards();
    this.drawSelectedSlots();
    this.drawMapSelector();
    this.drawAiPreview();
    this.drawStartButton();
    this.drawSpellTooltipArea();
  }

  drawClassCards() {
    const startX = 30;
    const startY = 120;
    const w = 240;
    const h = 220;
    const gap = 10;

    this.classCards = [];
    CLASS_LIST.forEach((cls, i) => {
      const x = startX + i * (w + gap);
      const y = startY;
      const bg = this.add.rectangle(x, y, w, h, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x444a66).setInteractive();
      // portrait
      this.add.image(x + 55, y + 70, 'portrait_' + cls.id).setOrigin(0.5).setScale(0.95);
      // titre / role
      this.add.text(x + 110, y + 32, cls.name, {
        fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
      });
      this.add.text(x + 110, y + 60, cls.role, {
        fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#9aa1c4', fontStyle: 'italic',
      });
      // stats
      this.add.text(x + 110, y + 86, `PV ${cls.hp}`, { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#e74c3c' });
      this.add.text(x + 110, y + 102, `PA ${cls.pa}`, { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#3498db' });
      this.add.text(x + 110, y + 118, `PM ${cls.pm}`, { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#2ecc71' });
      // description
      this.add.text(x + 12, y + 144, cls.desc, {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#cccccc', wordWrap: { width: w - 24 },
      });
      // mini icones de sorts
      cls.spellIds.forEach((spId, j) => {
        const ix = x + 12 + j * 50;
        const iy = y + 188;
        this.add.image(ix + 22, iy + 14, 'spell_' + spId).setOrigin(0.5).setScale(0.45);
      });

      bg.on('pointerover', () => { bg.setStrokeStyle(2, 0xf1c40f); this.showSpellTooltip(cls); });
      bg.on('pointerout', () => { bg.setStrokeStyle(2, this.selection.includes(cls.id) ? 0x2ecc71 : 0x444a66); });
      bg.on('pointerdown', () => this.toggleSelection(cls.id));
      this.classCards.push({ cls, bg });
    });
  }

  toggleSelection(classId) {
    if (this.selection.includes(classId)) {
      this.selection = this.selection.filter(id => id !== classId);
    } else if (this.selection.length < 3) {
      this.selection.push(classId);
    }
    for (const card of this.classCards) {
      card.bg.setStrokeStyle(2, this.selection.includes(card.cls.id) ? 0x2ecc71 : 0x444a66);
    }
    this.refreshSlots();
  }

  drawSelectedSlots() {
    this.slotGfx = [];
    const y = 380;
    this.add.text(30, y - 24, 'Votre equipe :', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff',
    });
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 100;
      const bg = this.add.rectangle(x, y, 88, 88, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x666666);
      const img = this.add.image(x + 44, y + 44, 'portrait_iop').setOrigin(0.5).setScale(0.7).setVisible(false);
      const placeholder = this.add.text(x + 44, y + 44, '?', {
        fontFamily: 'Trebuchet MS', fontSize: '36px', color: '#666666',
      }).setOrigin(0.5);
      this.slotGfx.push({ bg, img, placeholder });
    }
  }

  refreshSlots() {
    for (let i = 0; i < 3; i++) {
      const slot = this.slotGfx[i];
      const id = this.selection[i];
      if (id) {
        slot.img.setTexture('portrait_' + id);
        slot.img.setVisible(true);
        slot.placeholder.setText('');
        slot.bg.setStrokeStyle(3, 0x2ecc71);
      } else {
        slot.img.setVisible(false);
        slot.placeholder.setText('?');
        slot.bg.setStrokeStyle(2, 0x666666);
      }
    }
    if (this.startBtnTxt) {
      const ready = this.selection.length === 3;
      this.startBtn.setFillStyle(ready ? 0x27ae60 : 0x3a3a3a);
      this.startBtnTxt.setColor(ready ? '#ffffff' : '#888888');
    }
  }

  drawMapSelector() {
    const y = 510;
    this.add.text(30, y - 20, 'Carte :', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff',
    });
    const box = this.add.rectangle(30, y + 4, 260, 40, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x444a66);
    this.mapText = this.add.text(160, y + 24, '', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#f1c40f',
    }).setOrigin(0.5);
    const prev = this.add.text(48, y + 24, '<', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive();
    const next = this.add.text(272, y + 24, '>', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive();
    prev.on('pointerdown', () => { this.mapIndex = (this.mapIndex - 1 + MAP_LIST.length) % MAP_LIST.length; this.refreshMap(); });
    next.on('pointerdown', () => { this.mapIndex = (this.mapIndex + 1) % MAP_LIST.length; this.refreshMap(); });
    this.refreshMap();
  }

  refreshMap() {
    this.mapText.setText(MAP_LIST[this.mapIndex].name);
  }

  drawAiPreview() {
    this.add.text(360, 490, 'Equipe ennemie :', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffffff',
    });
    this.aiTokens = [];
    this.renderAiTeam();
    const reroll = this.add.text(360, 624, '> Tirer au hasard une nouvelle equipe', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#9aa1c4', fontStyle: 'italic',
    }).setInteractive();
    reroll.on('pointerdown', () => {
      this.aiClasses = pickRandom(CLASS_LIST, 3).map(c => c.id);
      this.renderAiTeam();
    });
  }

  renderAiTeam() {
    for (const obj of this.aiTokens) obj.destroy();
    this.aiTokens = [];
    for (let i = 0; i < 3; i++) {
      const cls = CLASS_LIST.find(c => c.id === this.aiClasses[i]);
      const x = 360 + i * 90;
      const y = 530;
      const bg = this.add.rectangle(x, y, 80, 80, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0xaa3333);
      const img = this.add.image(x + 40, y + 40, 'portrait_' + cls.id).setOrigin(0.5).setScale(0.65);
      this.aiTokens.push(bg, img);
    }
  }

  drawStartButton() {
    const x = 970, y = 600, w = 260, h = 80;
    this.startBtn = this.add.rectangle(x, y, w, h, 0x3a3a3a).setOrigin(0).setStrokeStyle(3, 0x222222).setInteractive();
    this.startBtnTxt = this.add.text(x + w / 2, y + h / 2, 'COMBATTRE', {
      fontFamily: 'Trebuchet MS', fontSize: '28px', color: '#888888', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.startBtn.on('pointerdown', () => {
      if (this.selection.length !== 3) return;
      this.scene.start('CombatScene', {
        playerClasses: this.selection,
        enemyClasses: this.aiClasses,
        mapId: MAP_LIST[this.mapIndex].id,
      });
    });
  }

  drawSpellTooltipArea() {
    this.add.rectangle(660, 350, 280, 200, 0x14182a).setOrigin(0).setStrokeStyle(2, 0x333a55);
    this.tooltipTitle = this.add.text(680, 364, 'Survolez une classe pour voir ses sorts', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#f1c40f',
    });
    this.tooltipIcons = [];
    this.tooltipLines = [];
    for (let i = 0; i < 4; i++) {
      const iy = 400 + i * 36;
      const icon = this.add.image(696, iy, 'spell_pression').setOrigin(0.5).setScale(0.55).setVisible(false);
      const t = this.add.text(720, iy - 10, '', {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#cccccc', wordWrap: { width: 220 }, lineSpacing: 2,
      });
      this.tooltipIcons.push(icon);
      this.tooltipLines.push(t);
    }
  }

  showSpellTooltip(cls) {
    this.tooltipTitle.setText(`Sorts du ${cls.name}`);
    cls.spellIds.forEach((id, i) => {
      const s = SPELLS[id];
      this.tooltipIcons[i].setTexture('spell_' + id).setVisible(true);
      this.tooltipLines[i].setText(`${s.name} (${s.apCost} PA, ${s.range.min}-${s.range.max})\n${s.desc}`);
    });
  }
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
