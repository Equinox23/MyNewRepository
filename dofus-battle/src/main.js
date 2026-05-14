import { MenuScene } from './scenes/MenuScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { EndScene } from './scenes/EndScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0c0c14',
  parent: 'game',
  pixelArt: false,
  scene: [MenuScene, CombatScene, EndScene],
};

new Phaser.Game(config);
