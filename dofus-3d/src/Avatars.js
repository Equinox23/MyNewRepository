import * as THREE from 'three';
import { toonify } from './Toon.js';
import { buildIop } from './models/iop.js';
import { buildOsamodas } from './models/osamodas.js';
import { buildBouftou } from './models/bouftou.js';
import { buildBouftouRoyal } from './models/bouftouRoyal.js';
import { buildCraqueleur } from './models/craqueleur.js';
import { buildCrapaud } from './models/crapaud.js';
import { buildCrapaudChef } from './models/crapaudChef.js';
import { buildRoublard } from './models/roublard.js';
import { buildXelor } from './models/xelor.js';
import { buildEcaflip } from './models/ecaflip.js';
import { buildChafer } from './models/chafer.js';
import { buildChaferRoyal } from './models/chaferRoyal.js';
import { buildTofu } from './models/tofu.js';
import { buildTofuRoyal } from './models/tofuRoyal.js';
import { buildChampignon } from './models/champignon.js';
import { buildChampignonRoyal } from './models/champignonRoyal.js';
import { buildDragounetRouge } from './models/dragounetRouge.js';
import { buildChatonBlanc } from './models/chatonBlanc.js';
import { buildPandawa } from './models/pandawa.js';
import { buildEniripsa } from './models/eniripsa.js';
import { buildWabbit, buildWaWabbit } from './models/wabbit.js';
import { buildBombeRoublard } from './models/bombeRoublard.js';

const BUILDERS = {
  iop: buildIop,
  osamodas: buildOsamodas,
  roublard: buildRoublard,
  xelor: buildXelor,
  ecaflip: buildEcaflip,
  bouftou: buildBouftou,
  bouftouRoyal: buildBouftouRoyal,
  craqueleur: buildCraqueleur,
  dragounetRouge: buildDragounetRouge,
  chatonBlanc: buildChatonBlanc,
  pandawa: buildPandawa,
  eniripsa: buildEniripsa,
  bouftouInvoc: () => { const g = new THREE.Group(); const b = buildBouftou(); b.scale.setScalar(0.85); g.add(b); return g; },
  wabbit: buildWabbit,
  waWabbit: buildWaWabbit,
  bombeRoublard: buildBombeRoublard,
  crapaud: buildCrapaud,
  crapaudChef: buildCrapaudChef,
  chafer: buildChafer,
  chaferRoyal: buildChaferRoyal,
  tofu: buildTofu,
  tofuRoyal: buildTofuRoyal,
  champignon: buildChampignon,
  champignonRoyal: buildChampignonRoyal,
};

// Cadrage par classe pour bien tenir dans la vignette (les modeles
// n ont pas tous la meme taille).
const FRAME = {
  iop: { y: 0.95, dist: 2.7, height: 1.15 },
  pandawa: { y: 1.0, dist: 2.9, height: 1.25 },
  eniripsa: { y: 0.95, dist: 2.7, height: 1.15 },
  bouftouInvoc: { y: 0.5, dist: 1.9, height: 0.75 },
  wabbit: { y: 0.75, dist: 2.4, height: 1.0 },
  waWabbit: { y: 1.05, dist: 3.3, height: 1.4 },
  bombeRoublard: { y: 0.35, dist: 1.6, height: 0.6 },
  osamodas: { y: 0.95, dist: 2.7, height: 1.15 },
  roublard: { y: 0.90, dist: 2.5, height: 1.10 },
  xelor: { y: 1.05, dist: 3.0, height: 1.30 },
  ecaflip: { y: 0.95, dist: 2.7, height: 1.15 },
  bouftou: { y: 0.55, dist: 2.1, height: 0.8 },
  bouftouRoyal: { y: 0.75, dist: 2.6, height: 1.0 },
  craqueleur: { y: 0.55, dist: 2.0, height: 0.8 },
  crapaud: { y: 0.35, dist: 1.7, height: 0.55 },
  crapaudChef: { y: 0.55, dist: 2.0, height: 0.9 },
  dragounetRouge: { y: 0.6, dist: 2.3, height: 0.95 },
  chatonBlanc: { y: 0.6, dist: 2.2, height: 0.95 },
  chafer: { y: 0.95, dist: 2.7, height: 1.2 },
  chaferRoyal: { y: 1.3, dist: 3.7, height: 1.5 },
  tofu: { y: 0.45, dist: 1.9, height: 0.7 },
  tofuRoyal: { y: 0.65, dist: 2.6, height: 0.95 },
  champignon: { y: 0.72, dist: 2.7, height: 1.1 },
  champignonRoyal: { y: 1.05, dist: 3.6, height: 1.4 },
};

// Cache : classId -> dataURL.
const CACHE = {};
// Renderer / scene reutilises pour tous les snapshots.
let _shared = null;

function ensureShared(size) {
  if (_shared) return _shared;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2);
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const ambient = new THREE.HemisphereLight(0xfff4d6, 0x6b5a3a, 1.4);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xfff5d9, 1.6);
  dir.position.set(1.2, 2.0, 1.5);
  scene.add(dir);
  const rim = new THREE.DirectionalLight(0xb4cfff, 0.5);
  rim.position.set(-1.5, 1.0, -1.0);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);

  _shared = { renderer, scene, camera, size };
  return _shared;
}

// Rend une snapshot 3D du modele en data URL PNG. Memoise par classId.
export function getAvatar(classId, size = 64) {
  if (CACHE[classId]) return CACHE[classId];
  const builder = BUILDERS[classId];
  if (!builder) return null;

  const { renderer, scene, camera } = ensureShared(size);
  const frame = FRAME[classId] || { y: 0.7, dist: 2.4, height: 0.9 };

  const model = builder();
  toonify(model, { width: 0.02, minRadius: 0.06 });
  // La camera est a 45 deg (axe +X+Z) : on tourne le modele (qui regarde
  // +Z) vers elle, avec un leger trois-quarts pour garder du volume.
  model.rotation.y = Math.PI / 4 - 0.35;
  scene.add(model);

  camera.position.set(frame.dist * 0.85, frame.y + frame.height * 0.5, frame.dist * 0.85);
  camera.lookAt(0, frame.y, 0);

  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL('image/png');

  // Cleanup du modele uniquement (on garde la scene / le renderer).
  scene.remove(model);
  model.traverse(o => {
    if (o.isMesh) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    }
  });

  CACHE[classId] = dataUrl;
  return dataUrl;
}
