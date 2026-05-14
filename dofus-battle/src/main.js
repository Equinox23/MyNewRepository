import { MenuScene } from './scenes/MenuScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { EndScene } from './scenes/EndScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0c0c14',
  parent: 'game',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  input: {
    activePointers: 2,
  },
  scene: [MenuScene, CombatScene, EndScene],
};

new Phaser.Game(config);
