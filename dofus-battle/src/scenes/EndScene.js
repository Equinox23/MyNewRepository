export class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }
  init(data) { this.data2 = data; }
  create() {
    this.cameras.main.setBackgroundColor('#0c0c14');
    const win = this.data2.winner === 'player';
    this.add.text(640, 260, win ? 'VICTOIRE !' : 'DEFAITE...', {
      fontSize: '72px', color: win ? '#2ecc71' : '#e74c3c', fontFamily: 'Trebuchet MS',
    }).setOrigin(0.5);
    this.add.text(640, 340, win
      ? 'Votre equipe a triomphe.'
      : 'Vos combattants ont ete vaincus.', {
      fontSize: '20px', color: '#cccccc',
    }).setOrigin(0.5);

    const btn = (label, x, cb, color) => {
      const w = 200, h = 60;
      const r = this.add.rectangle(x, 460, w, h, color).setStrokeStyle(2, 0x111111).setInteractive();
      this.add.text(x, 460, label, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
      r.on('pointerdown', cb);
    };
    btn('REJOUER', 520, () => this.scene.start('CombatScene', this.data2.params), 0x27ae60);
    btn('MENU', 760, () => this.scene.start('MenuScene'), 0x2c3e50);
  }
}
