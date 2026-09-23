import * as THREE from 'three';
import { M, mesh, addEyes, ramHorn } from './kit.js';

// Bouftou facon Dofus : grosse boule de laine blanche toute douce,
// museau brun qui depasse devant, grands yeux ronds, deux dents, cornes
// de belier enroulees de chaque cote et quatre petites pattes sombres.
// `opts.royal` : variante Royal (laine creme a reflets dores, plus grosses
// cornes) utilisee par bouftouRoyal.js.
export function buildBouftou(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  // Laine blanche bien moelleuse (Royal : blanc creme avec reflets dores).
  const woolMid = M(royal ? 0xf2e8d0 : 0xf2efe8, { r: 0.95 });
  const woolLight = M(royal ? 0xfffaee : 0xffffff, { r: 0.95 });
  const woolDark = M(royal ? 0xd4c29a : 0xd6d0c4, { r: 0.95 });
  const face = M(royal ? 0x4a2410 : 0x6a3a1c, { r: 0.8 });
  const faceLight = M(royal ? 0x6a3a1c : 0x8a5430, { r: 0.8 });
  const hornMat = M(royal ? 0xe8b850 : 0xe6cfa0, { r: 0.5 });
  const cheekMat = M(0xf08a8a, { r: 0.8 });
  const hoof = M(0x2a1608, { r: 0.8 });
  const tooth = M(0xffffff, { r: 0.4 });
  const nose = M(0x2a120a, { r: 0.4 });
  const tongue = M(0xe0566a, { r: 0.6 });

  // ---- Pattes courtes ----
  for (const [x, z] of [[-0.22, 0.2], [0.22, 0.2], [-0.2, -0.2], [0.2, -0.2]]) {
    group.add(mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.2, 10), face, [x, 0.12, z]));
    group.add(mesh(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hoof, [x, 0.0, z + 0.02], [1, 0.7, 1.2]));
  }

  // ---- Corps : boule de laine ----
  const bodyY = 0.56;
  group.add(mesh(new THREE.IcosahedronGeometry(0.44, 3), woolMid, [0, bodyY, 0], [1.05, 0.95, 1]));
  // Bouclettes de laine regulierement reparties sur la sphere (Fibonacci),
  // plus claires sur le dessus (lumiere) et plus sombres dessous.
  const nCurls = 46;
  for (let i = 0; i < nCurls; i++) {
    const y = 1 - (i / (nCurls - 1)) * 1.6;
    const rr = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    // Pas de bouclettes devant le museau.
    if (z > 0.55 && y < 0.35 && y > -0.55 && Math.abs(x) < 0.55) continue;
    const mat = y > 0.35 ? woolLight : y < -0.25 ? woolDark : woolMid;
    const size = 0.12 + ((i * 37) % 10) * 0.006;
    group.add(mesh(new THREE.IcosahedronGeometry(size, 2), mat, [x * 0.43, bodyY + y * 0.4, z * 0.42]));
  }
  // Toupet sur le haut du crane.
  for (const [x, y, z, s] of [[0, 1.02, 0.12, 0.13], [-0.1, 0.98, 0.18, 0.1], [0.1, 0.99, 0.2, 0.1]]) {
    group.add(mesh(new THREE.IcosahedronGeometry(s, 2), woolLight, [x, y, z]));
  }

  // ---- Museau brun qui depasse devant ----
  const faceZ = 0.36;
  group.add(mesh(new THREE.SphereGeometry(0.26, 18, 14), face, [0, 0.54, faceZ], [1.05, 0.9, 0.75]));
  // Bout du nez (plus clair) + narines.
  group.add(mesh(new THREE.SphereGeometry(0.15, 14, 10), faceLight, [0, 0.46, faceZ + 0.15], [1.2, 0.8, 0.8]));
  for (const sx of [-1, 1]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), nose);
    n.position.set(sx * 0.05, 0.5, faceZ + 0.26);
    group.add(n);
  }
  // Bouche ouverte + langue + deux grosses dents.
  const mouthIn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), nose);
  mouthIn.position.set(0, 0.39, faceZ + 0.2);
  mouthIn.scale.set(1.3, 0.55, 0.6);
  group.add(mouthIn);
  const tg = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), tongue);
  tg.position.set(0, 0.375, faceZ + 0.23);
  tg.scale.set(1.2, 0.5, 0.7);
  group.add(tg);
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.BoxGeometry(0.045, 0.05, 0.02), tooth, [sx * 0.03, 0.415, faceZ + 0.255]));
  }
  // Grands yeux sur le haut du museau, legerement fronces.
  addEyes(group, { x: 0, y: 0.64, z: faceZ + 0.14, size: 0.075, spacing: 0.2, turn: 0.25, lid: royal ? 0x4a2410 : 0x6a3a1c, angry: true });

  // ---- Cornes de belier enroulees ----
  for (const side of [-1, 1]) {
    const horn = ramHorn(side, hornMat, { radius: royal ? 0.09 : 0.075, curl: royal ? 0.2 : 0.16, segments: 12 });
    horn.position.set(side * 0.3, 0.8, 0.22);
    horn.rotation.y = side * 0.35;
    group.add(horn);
  }

  // ---- Frange de laine qui retombe sur le front ----
  for (const [x, y, z, sz] of [[-0.14, 0.78, 0.36, 0.1], [0, 0.8, 0.4, 0.11], [0.14, 0.78, 0.36, 0.1], [-0.07, 0.75, 0.43, 0.075], [0.07, 0.75, 0.43, 0.075]]) {
    group.add(mesh(new THREE.IcosahedronGeometry(sz, 2), woolLight, [x, y, z]));
  }
  // ---- Petites oreilles tombantes sous les cornes ----
  for (const side of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.08, 12, 8), face, [side * 0.3, 0.6, 0.3], [0.5, 0.9, 1.3], [0.3, 0, side * 0.9]));
  }
  // ---- Joues roses ----
  for (const side of [-1, 1]) {
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), cheekMat);
    ch.position.set(side * 0.17, 0.5, faceZ + 0.16);
    ch.scale.set(1.3, 0.8, 0.5);
    group.add(ch);
  }

  // ---- Petite queue en pompon ----
  group.add(mesh(new THREE.IcosahedronGeometry(0.1, 2), woolLight, [0, 0.62, -0.47]));

  return group;
}
