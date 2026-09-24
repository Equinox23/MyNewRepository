import * as THREE from 'three';
import { M } from './kit.js';
import { bentCone } from './humanoid.js';
import { buildBouftou } from './bouftou.js';
import { buildWabbit } from './wabbit.js';
import { buildCrapaud } from './crapaud.js';
import { buildTofu } from './tofu.js';
import { buildChafer } from './chafer.js';
import { buildChampignon } from './champignon.js';
import { buildCraqueleur } from './craqueleur.js';
import { buildKwakwa, buildMinotoror } from './bosses.js';

// ===========================================================================
// Variantes de monstres du bestiaire : modele de base recolore, mis a
// l echelle et agremente d un accessoire (casque de guerre, chapeau de
// mage, cornes...). `base` = modele / squelette d animation de reference.
// ===========================================================================

export const VARIANTS = {
  boufton: { base: 'bouftou', build: buildBouftou, scale: 0.8, tint: 0x0c0a0e, amount: 0.94, acc: 'mohawk', accColor: 0xd8322a },
  bouftouChef: { base: 'bouftou', build: buildBouftou, scale: 1.12, tint: 0xd8c8a8, amount: 0.2, acc: 'warHelmet' },
  wabbitNoir: { base: 'wabbit', build: buildWabbit, scale: 1, tint: 0x0e0c10, amount: 0.9, acc: 'bandana', accColor: 0xd8322a },
  wabbitSquelette: { base: 'wabbit', build: buildWabbit, scale: 1.05, tint: 0xd8d0b8, amount: 0.55, acc: 'boneEyes' },
  crapaudVenimeux: { base: 'crapaud', build: buildCrapaud, scale: 1, tint: 0x9a4ad0, amount: 0.55, acc: 'horns' },
  crapaudMage: { base: 'crapaud', build: buildCrapaud, scale: 1.1, tint: 0x3a6ad8, amount: 0.4, acc: 'mageHat' },
  tofuNoir: { base: 'tofu', build: buildTofu, scale: 1, tint: 0x0c0a0e, amount: 0.95, acc: 'mohawk', accColor: 0x9a4ad0 },
  tofuMalefique: { base: 'tofu', build: buildTofu, scale: 1.2, tint: 0x8a2ad0, amount: 0.55, acc: 'horns' },
  chaferArcher: { base: 'chafer', build: buildChafer, scale: 0.95, tint: 0x6a8a4a, amount: 0.25, acc: 'quiver' },
  chaferElite: { base: 'chafer', build: buildChafer, scale: 1.1, tint: 0xa82a2a, amount: 0.3, acc: 'crest' },
  champChamp: { base: 'champignon', build: buildChampignon, scale: 0.85, tint: 0x3a8ad8, amount: 0.55, acc: 'mohawk', accColor: 0x6ad83a },
  champignonMutant: { base: 'champignon', build: buildChampignon, scale: 1.18, tint: 0x6ad83a, amount: 0.5, acc: 'horns' },
  craqueleurPlaines: { base: 'craqueleur', build: buildCraqueleur, scale: 1.05, tint: 0x6a9a4a, amount: 0.3, acc: 'moss' },
  craqueleurAncien: { base: 'craqueleur', build: buildCraqueleur, scale: 1.28, tint: 0x3a3440, amount: 0.45, acc: 'crystals' },
  kwakFlamme: { base: 'kwakwa', build: buildKwakwa, scale: 0.7, element: 0xff7a2a },
  kwakGlace: { base: 'kwakwa', build: buildKwakwa, scale: 0.72, element: 0x4ab0ff },
  kwakVent: { base: 'kwakwa', build: buildKwakwa, scale: 0.7, element: 0x8ae04a },
  mominotor: { base: 'minotoror', build: buildMinotoror, scale: 0.8, tint: 0xc89a6a, amount: 0.35, acc: 'mohawk', accColor: 0x2a5ad8 },
  gardienLabyrinthe: { base: 'minotoror', build: buildMinotoror, scale: 0.95, tint: 0x6a6a78, amount: 0.55, acc: 'crest' },
};

function tintModel(root, hex, amount) {
  const c = new THREE.Color(hex);
  root.traverse(o => {
    if (!o.isMesh || !o.material || o.material.isMeshBasicMaterial || !o.material.color) return;
    if (o.material.name === 'eye') return;
    o.material = o.material.clone();
    o.material.color.lerp(c, amount);
  });
}

function elementTint(root, hex) {
  const c = new THREE.Color(hex);
  root.traverse(o => {
    if (!o.isMesh || !o.material) return;
    const n = o.material.name;
    if (n === 'elementTint' || n === 'elementTintLt' || n === 'elementTintBasic') {
      o.material = o.material.clone();
      o.material.color.copy(n === 'elementTintLt' ? c.clone().lerp(new THREE.Color(0xffffff), 0.4) : c);
      if (o.material.emissive) o.material.emissive.copy(c).multiplyScalar(0.3);
    }
  });
}

// Accessoire pose au sommet du modele (repere du modele de base).
function accessory(kind, top, depth, color = 0xd8322a) {
  const g = new THREE.Group();
  switch (kind) {
    case 'warHelmet': {
      const red = M(0xa82a1a, { r: 0.6 });
      const steel = M(0xb0b8c4, { r: 0.3, m: 0.7 });
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel);
      helm.scale.set(1, 0.7, 1);
      g.add(helm);
      const plume = bentCone(0.05, 0.28, 0, -0.12, red, 6, 4);
      plume.position.y = 0.1;
      g.add(plume);
      for (const sx of [-1, 1]) {
        const h = bentCone(0.035, 0.16, sx * 0.08, 0, M(0xf0e6c8), 6, 3);
        h.position.set(sx * 0.16, 0.05, 0);
        h.rotation.z = -sx * 0.9;
        g.add(h);
      }
      break;
    }
    case 'mageHat': {
      const blue = M(0x2a3a8a, { r: 0.7 });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20), blue);
      g.add(brim);
      const cone = bentCone(0.13, 0.36, 0.08, -0.06, blue, 14, 6);
      g.add(cone);
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), new THREE.MeshBasicMaterial({ color: 0xffe07a }));
      star.position.set(0, 0.08, 0.12);
      g.add(star);
      break;
    }
    case 'horns': {
      const dark = M(0x2a1a2a, { r: 0.5 });
      for (const sx of [-1, 1]) {
        const h = bentCone(0.04, 0.2, sx * 0.08, -0.03, dark, 6, 4);
        h.position.set(sx * 0.09, 0, 0);
        h.rotation.z = -sx * 0.35;
        g.add(h);
      }
      break;
    }
    case 'boneEyes': {
      const red = new THREE.MeshBasicMaterial({ color: 0xff3a2a });
      for (const sx of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), red);
        e.position.set(sx * 0.06, -0.18, depth * 0.9);
        g.add(e);
      }
      break;
    }
    case 'quiver': {
      const leather = M(0x5a3418, { r: 0.8 });
      const q = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.34, 10), leather);
      q.position.set(0.08, -0.45, -depth * 0.8);
      q.rotation.z = 0.4;
      g.add(q);
      for (let i = 0; i < 3; i++) {
        const a = bentCone(0.012, 0.12, 0, 0, M(0xe8e0c8), 4, 2);
        a.position.set(0.02 + i * 0.03, -0.3, -depth * 0.8);
        a.rotation.z = 0.4;
        g.add(a);
      }
      break;
    }
    case 'crest': {
      const red = M(0xc8322a, { r: 0.6 });
      for (let i = 0; i < 5; i++) {
        const f = bentCone(0.04, 0.2 - i * 0.02, 0, -0.08, red, 6, 3);
        f.position.set(0, 0, 0.06 - i * 0.05);
        f.rotation.x = -0.3 - i * 0.2;
        g.add(f);
      }
      break;
    }
    case 'mohawk': {
      const m = M(color, { r: 0.6 });
      for (let i = 0; i < 5; i++) {
        const sp = bentCone(0.045, 0.2 - Math.abs(i - 2) * 0.03, 0, -0.05, m, 6, 3);
        sp.position.set(0, 0.02, 0.1 - i * 0.06);
        sp.rotation.x = -0.25 - i * 0.12;
        g.add(sp);
      }
      break;
    }
    case 'bandana': {
      const m = M(color, { r: 0.7 });
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 24), m);
      band.rotation.x = Math.PI / 2 + 0.15;
      band.scale.set(1, 1.1, 1);
      band.position.y = -0.1;
      g.add(band);
      for (const sx of [-1, 1]) {
        const tail = bentCone(0.035, 0.16, sx * 0.05, -0.06, m, 5, 3);
        tail.position.set(sx * 0.04, -0.12, -0.21);
        tail.rotation.x = -2.2;
        g.add(tail);
      }
      break;
    }
    case 'moss': {
      const m = M(0x5a9a32, { r: 0.9 });
      const f = M(0xf2d060, { r: 0.7 });
      for (const [x, z, r] of [[-0.18, -0.1, 0.12], [0.1, -0.2, 0.14], [0.22, 0.05, 0.1]]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m);
        b.scale.y = 0.5;
        b.position.set(x, 0.0, z);
        g.add(b);
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), f);
        fl.position.set(x, r * 0.45, z);
        g.add(fl);
      }
      break;
    }
    case 'crystals': {
      const cr = new THREE.MeshStandardMaterial({ color: 0xc46aff, emissive: 0x6a2aa8, emissiveIntensity: 0.8, roughness: 0.2 });
      for (const [x, z, h] of [[-0.15, -0.1, 0.22], [0.05, -0.2, 0.3], [0.2, -0.05, 0.2]]) {
        const c = new THREE.Mesh(new THREE.OctahedronGeometry(h * 0.5, 0), cr);
        c.scale.set(0.6, 1.9, 0.6);
        c.position.set(x, -0.05, z);
        g.add(c);
      }
      break;
    }
  }
  g.position.y = top;
  return g;
}

export function buildVariant(id) {
  const v = VARIANTS[id];
  const inner = v.build();
  if (v.tint !== undefined) tintModel(inner, v.tint, v.amount || 0.4);
  if (v.element !== undefined) elementTint(inner, v.element);
  if (v.acc) {
    inner.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(inner);
    const acc = accessory(v.acc, box.max.y - 0.04, box.max.z, v.accColor);
    // Minotoror : l accessoire suit la tete.
    const rig = inner.userData.rig;
    if (rig && rig.head) {
      acc.position.y = 0.52;
      rig.head.add(acc);
    } else {
      inner.add(acc);
    }
  }
  const root = new THREE.Group();
  inner.scale.multiplyScalar(v.scale || 1);
  root.add(inner);
  if (inner.userData.rig) root.userData.rig = inner.userData.rig;
  return root;
}
