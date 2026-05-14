import { PORTRAITS } from '../assets/portraits.js';
import { SPELL_ICONS } from '../assets/icons.js';

// Convertit une string SVG en URI data utilisable par Phaser.load.image.
function svgToDataUri(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export class PreloaderScene extends Phaser.Scene {
  constructor() { super('PreloaderScene'); }

  preload() {
    // Petit ecran de chargement
    this.cameras.main.setBackgroundColor('#0c0c14');
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.add.text(cx, cy - 40, 'DOFUS BATTLE', {
      fontFamily: 'Trebuchet MS', fontSize: '48px', color: '#f1c40f',
    }).setOrigin(0.5);
    const subtitle = this.add.text(cx, cy + 10, 'Chargement des sprites...', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#cccccc',
    }).setOrigin(0.5);
    const barBg = this.add.rectangle(cx, cy + 50, 360, 14, 0x222230).setStrokeStyle(2, 0x444466);
    const bar = this.add.rectangle(cx - 178, cy + 50, 2, 10, 0xf1c40f).setOrigin(0, 0.5);

    this.load.on('progress', (v) => { bar.width = Math.max(2, 356 * v); });
    this.load.on('complete', () => { subtitle.setText('Pret !'); });

    for (const [id, svg] of Object.entries(PORTRAITS)) {
      this.load.image('portrait_' + id, svgToDataUri(svg));
    }
    for (const [id, svg] of Object.entries(SPELL_ICONS)) {
      this.load.image('spell_' + id, svgToDataUri(svg));
    }
  }

  create() {
    this.time.delayedCall(150, () => this.scene.start('MenuScene'));
  }
}
