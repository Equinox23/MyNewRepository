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

// Retirer l ecran de chargement
const loader = document.getElementById('loader');
if (loader) loader.remove();
// Le HUD textuel initial dans l index.html ne sert plus en V2
const oldHud = document.getElementById('hud');
if (oldHud) oldHud.remove();

game.setup();

// --- INPUTS ---
const canvas = scene3d.renderer.domElement;

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  scene3d.zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1);
}, { passive: false });

const pointers = new Map();
let pinch = null;

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, {
    startX: e.clientX, startY: e.clientY,
    x: e.clientX, y: e.clientY,
    moved: false,
  });
  if (pointers.size === 2) {
    const [a, b] = pointers.values();
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
  }
});

canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (p) {
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) > 6) p.moved = true;
  }
  if (pointers.size === 2 && pinch) {
    const [a, b] = pointers.values();
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 1 && pinch.dist > 1) {
      scene3d.zoom(pinch.dist / d);
      pinch.dist = d;
    }
    return;
  }
  if (e.pointerType === 'mouse') {
    handleHover(e.clientX, e.clientY);
  }
});

canvas.addEventListener('pointerup', (e) => {
  const p = pointers.get(e.pointerId);
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (p && !p.moved && pointers.size === 0) {
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
