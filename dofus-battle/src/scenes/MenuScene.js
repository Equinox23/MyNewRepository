import { CLASS_LIST } from '../data/classes.js';
import { MAP_LIST } from '../data/maps.js';
import { SPELLS } from '../data/spells.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');

    this.add.text(640, 40, 'DOFUS BATTLE', {
      fontFamily: 'Trebuchet MS', fontSize: '48px', color: '#f1c40f',
    }).setOrigin(0.5);
    this.add.text(640, 90, 'Composez votre equipe (3 personnages)', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#cccccc',
    }).setOrigin(0.5);

    this.selection = []; // tableau de classIds
    this.mapIndex = 0;
    this.aiClasses = ['iop', 'cra', 'eniripsa']; // composition ennemie par defaut

    this.classCards = [];
    this.drawClassCards();
    this.drawSelectedSlots();
    this.drawMapSelector();
    this.drawAiPreview();
    this.drawStartButton();
    this.drawSpellTooltipArea();
  }

  drawClassCards() {
    const startX = 80;
    const startY = 160;
    const w = 220;
    const h = 200;
    const gap = 18;

    CLASS_LIST.forEach((cls, i) => {
      const x = startX + i * (w + gap);
      const y = startY;
      const bg = this.add.rectangle(x, y, w, h, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x444a66).setInteractive();
      const token = this.add.circle(x + 38, y + 50, 22, cls.color);
      this.add.text(x + 70, y + 32, cls.name, { fontSize: '22px', color: '#ffffff', fontFamily: 'Trebuchet MS' });
      this.add.text(x + 70, y + 60, cls.role, { fontSize: '13px', color: '#9aa1c4', fontStyle: 'italic' });
      this.add.text(x + 12, y + 96, cls.desc, {
        fontSize: '12px', color: '#cccccc', wordWrap: { width: w - 24 }, fontFamily: 'Trebuchet MS',
      });
      this.add.text(x + 12, y + 158, `PV ${cls.hp}  PA ${cls.pa}  PM ${cls.pm}  Ini ${cls.initiative}`, {
        fontSize: '12px', color: '#f1c40f',
      });

      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, 0xf1c40f);
        this.showSpellTooltip(cls);
      });
      bg.on('pointerout', () => bg.setStrokeStyle(2, 0x444a66));
      bg.on('pointerdown', () => this.toggleSelection(cls.id));
      this.classCards.push({ cls, bg, token });
    });
  }

  toggleSelection(classId) {
    if (this.selection.includes(classId)) {
      this.selection = this.selection.filter(id => id !== classId);
    } else if (this.selection.length < 3) {
      this.selection.push(classId);
    }
    this.refreshSlots();
  }

  drawSelectedSlots() {
    this.slotGfx = [];
    const y = 400;
    this.add.text(80, y - 20, 'Votre equipe :', { fontSize: '18px', color: '#ffffff' });
    for (let i = 0; i < 3; i++) {
      const x = 80 + i * 90;
      const bg = this.add.rectangle(x, y, 80, 80, 0x1f2335).setOrigin(0).setStrokeStyle(2, 0x666666);
      const txt = this.add.text(x + 40, y + 40, '?', { fontSize: '36px', color: '#666666' }).setOrigin(0.5);
      this.slotGfx.push({ bg, txt });
    }
  }

  refreshSlots() {
    for (let i = 0; i < 3; i++) {
      const slot = this.slotGfx[i];
      const id = this.selection[i];
      if (id) {
        const cls = CLASS_LIST.find(c => c.id === id);
        slot.bg.setFillStyle(cls.color);
        slot.txt.setText(cls.name[0]);
        slot.txt.setColor('#ffffff');
      } else {
        slot.bg.setFillStyle(0x1f2335);
        slot.txt.setText('?');
        slot.txt.setColor('#666666');
      }
    }
    if (this.startBtnTxt) {
      const ready = this.selection.length === 3;
      this.startBtn.setFillStyle(ready ? 0x27ae60 : 0x3a3a3a);
      this.startBtnTxt.setColor(ready ? '#ffffff' : '#888888');
    }
  }

  drawMapSelector() {
    const y = 530;
    this.add.text(80, y - 20, 'Carte :', { fontSize: '18px', color: '#ffffff' });
    this.mapText = this.add.text(80, y + 4, '', { fontSize: '20px', color: '#f1c40f' });

    const prev = this.add.text(280, y + 4, '<', { fontSize: '24px', color: '#ffffff' }).setInteractive();
    const next = this.add.text(310, y + 4, '>', { fontSize: '24px', color: '#ffffff' }).setInteractive();
    prev.on('pointerdown', () => { this.mapIndex = (this.mapIndex - 1 + MAP_LIST.length) % MAP_LIST.length; this.refreshMap(); });
    next.on('pointerdown', () => { this.mapIndex = (this.mapIndex + 1) % MAP_LIST.length; this.refreshMap(); });
    this.refreshMap();
  }

  refreshMap() {
    this.mapText.setText(MAP_LIST[this.mapIndex].name);
  }

  drawAiPreview() {
    this.add.text(420, 510, 'Equipe ennemie :', { fontSize: '18px', color: '#ffffff' });
    this.aiTokens = [];
    for (let i = 0; i < 3; i++) {
      const cls = CLASS_LIST.find(c => c.id === this.aiClasses[i]);
      const x = 420 + i * 80;
      const y = 560;
      const bg = this.add.rectangle(x, y, 70, 70, cls.color).setOrigin(0).setStrokeStyle(2, 0xaa3333);
      this.add.text(x + 35, y + 35, cls.name[0], { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
      this.aiTokens.push(bg);
    }
    const reroll = this.add.text(420, 640, '> Tirer une autre equipe ennemie', { fontSize: '14px', color: '#9aa1c4' }).setInteractive();
    reroll.on('pointerdown', () => {
      this.aiClasses = pickRandom(CLASS_LIST, 3).map(c => c.id);
      // redessiner
      for (const t of this.aiTokens) t.destroy();
      this.aiTokens = [];
      for (let i = 0; i < 3; i++) {
        const cls = CLASS_LIST.find(c => c.id === this.aiClasses[i]);
        const x = 420 + i * 80;
        const y = 560;
        const bg = this.add.rectangle(x, y, 70, 70, cls.color).setOrigin(0).setStrokeStyle(2, 0xaa3333);
        this.add.text(x + 35, y + 35, cls.name[0], { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
        this.aiTokens.push(bg);
      }
    });
  }

  drawStartButton() {
    const x = 980, y = 600, w = 220, h = 70;
    this.startBtn = this.add.rectangle(x, y, w, h, 0x3a3a3a).setOrigin(0).setStrokeStyle(2, 0x222222).setInteractive();
    this.startBtnTxt = this.add.text(x + w / 2, y + h / 2, 'COMBATTRE', {
      fontSize: '24px', color: '#888888',
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
    this.add.rectangle(800, 160, 460, 220, 0x14182a).setOrigin(0).setStrokeStyle(2, 0x333a55);
    this.tooltipTitle = this.add.text(820, 175, 'Survolez une classe', { fontSize: '20px', color: '#f1c40f' });
    this.tooltipLines = [];
    for (let i = 0; i < 4; i++) {
      const t = this.add.text(820, 215 + i * 40, '', { fontSize: '13px', color: '#cccccc', wordWrap: { width: 420 } });
      this.tooltipLines.push(t);
    }
  }

  showSpellTooltip(cls) {
    this.tooltipTitle.setText(`Sorts du ${cls.name}`);
    cls.spellIds.forEach((id, i) => {
      const s = SPELLS[id];
      this.tooltipLines[i].setText(`[${s.short}] ${s.name} (${s.apCost} PA, portee ${s.range.min}-${s.range.max}) - ${s.desc}`);
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
