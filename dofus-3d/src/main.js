import { Scene3D } from './Scene3D.js';
import { Map3D } from './Map3D.js';
import { Character3D } from './Character3D.js';
import { Picker } from './Picker.js';
import { bfs, pathTo } from './Path.js';

// --- INIT ----
const scene3d = new Scene3D();
const map3d = new Map3D(scene3d.scene);
const character = new Character3D(scene3d.scene);
const picker = new Picker(scene3d, map3d);

// On retire l ecran de chargement une fois la scene prete.
const loader = document.getElementById('loader');
if (loader) loader.remove();

const infoEl = document.getElementById('info');
let moving = false;

// --- INPUTS ---
const canvas = scene3d.renderer.domElement;

// Roue souris : zoom in/out.
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  scene3d.zoom(e.deltaY > 0 ? 1.1 : 1 / 1.1);
}, { passive: false });

// On track tous les pointeurs (souris ET doigts) pour distinguer tap / pan
// et detecter le pinch a 2 doigts.
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

  // Pinch zoom a 2 doigts.
  if (pointers.size === 2 && pinch) {
    const [a, b] = pointers.values();
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 1 && pinch.dist > 1) {
      scene3d.zoom(pinch.dist / d);
      pinch.dist = d;
    }
    return;
  }

  // Hover (uniquement avec la souris : sur tactile, le 1er tap suffit).
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
  if (moving) return;
  const hit = picker.pick(x, y);
  if (!hit) {
    picker.setHover(null);
    infoEl.textContent = '';
    return;
  }
  picker.setHover(hit.c, hit.r, hit.isWall);
  infoEl.textContent = `Case (${hit.c}, ${hit.r})` + (hit.isWall ? ' - mur' : '');
}

async function handleTap(x, y) {
  if (moving) return;
  const hit = picker.pick(x, y);
  if (!hit || hit.isWall) return;
  if (hit.c === character.c && hit.r === character.r) return;
  const result = bfs(map3d.getData(), new Set(), { c: character.c, r: character.r }, 999);
  const path = pathTo(result, { c: hit.c, r: hit.r });
  if (!path || path.length <= 1) return;
  moving = true;
  picker.setHover(null);
  for (const step of path.slice(1)) {
    await character.moveTo(step.c, step.r, 180);
  }
  moving = false;
  // Re-evaluer le hover apres mouvement.
}

// --- GAME LOOP ---
let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  character.update(dt, now / 1000);
  scene3d.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
