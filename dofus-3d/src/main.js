import { Scene3D } from './Scene3D.js';
import { Map3D } from './Map3D.js';
import { Picker } from './Picker.js';
import { Hud } from './Hud.js';
import { Game } from './Game.js';

// --- INIT ---
const scene3d = new Scene3D();
const map3d = new Map3D(scene3d.scene);
const picker = new Picker(scene3d, map3d);
const hud = new Hud();
const game = new Game({ scene3d, map3d, picker, hud });

const loader = document.getElementById('loader');
if (loader) loader.remove();
// On garde le HUD textuel en haut a gauche (titre + tip)
// car les controles meritent un rappel visible.

// Les fleches de rotation passent par le HUD et appellent snapRotate.
// direction = -1 -> camera tourne dans le sens des aiguilles, +1 -> trigonometrique.
hud.on('onRotateLeft', () => scene3d.snapRotate(-1));
hud.on('onRotateRight', () => scene3d.snapRotate(1));

game.setup();

// --- INPUTS ---
const canvas = scene3d.renderer.domElement;

// Le menu contextuel parasite le clic droit, on le bloque.
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Wheel : zoom toward the cursor world point.
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const worldPoint = scene3d.worldPointAtCursor(e.clientX, e.clientY);
  scene3d.zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1, worldPoint);
}, { passive: false });

const pointers = new Map();
let pinch = null;
// Sensibilites des rotations (radians par pixel)
const AZ_SENS = 0.008;
const POLAR_SENS = 0.005;

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, {
    startX: e.clientX, startY: e.clientY,
    x: e.clientX, y: e.clientY,
    moved: false,
    button: e.button,
    pointerType: e.pointerType,
  });
  if (pointers.size === 2) {
    const [a, b] = pointers.values();
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
  }
});

canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (p) {
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) > 6) p.moved = true;

    // Rotation : clic droit drag (souris) ou drag a 1 doigt (touch).
    if (pointers.size === 1 && p.moved) {
      const isMouseRotate = p.pointerType === 'mouse' && p.button === 2;
      const isTouchRotate = p.pointerType === 'touch';
      if (isMouseRotate || isTouchRotate) {
        scene3d.rotate(-dx * AZ_SENS, dy * POLAR_SENS);
        picker.setHover(null);
        return;
      }
    }
  }

  // Pinch : zoom centré sur le milieu des 2 doigts.
  if (pointers.size === 2 && pinch) {
    const [a, b] = pointers.values();
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 1 && pinch.dist > 1) {
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const worldPoint = scene3d.worldPointAtCursor(mid.x, mid.y);
      scene3d.zoom(pinch.dist / d, worldPoint);
      pinch.dist = d;
    }
    return;
  }

  // Hover souris : montre la case cible.
  if (e.pointerType === 'mouse' && pointers.size === 0) {
    handleHover(e.clientX, e.clientY);
  }
});

canvas.addEventListener('pointerup', (e) => {
  const p = pointers.get(e.pointerId);
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (p && !p.moved && pointers.size === 0) {
    // Le clic droit ne doit pas declencher un pick (utilise pour rotation).
    if (p.button === 2 && p.pointerType === 'mouse') return;
    handleTap(e.clientX, e.clientY);
  }
});

canvas.addEventListener('pointercancel', (e) => {
  pointers.delete(e.pointerId);
  pinch = null;
});

canvas.addEventListener('pointerleave', () => picker.setHover(null));

function handleHover(x, y) {
  if (game.busy) { picker.setHover(null); return; }
  const hit = picker.pick(x, y);
  if (!hit) { picker.setHover(null); return; }
  picker.setHover(hit.c, hit.r, hit.isWall);
}

function handleTap(x, y) {
  if (game.busy || game.ended) return;
  const hit = picker.pick(x, y);
  if (!hit) return;
  game.onTileTap(hit.c, hit.r);
}

// --- LOOP ---
let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  for (const f of game.fighters) {
    if (f.alive) f.character.update(dt, now / 1000);
  }
  scene3d.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
