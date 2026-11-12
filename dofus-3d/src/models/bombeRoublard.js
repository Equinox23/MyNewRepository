import * as THREE from 'three';
import { M, mesh, addEyes, sculptSphere, tubeAlong, loft } from './kit.js';
import { sheet, mark, sstep } from './monsterKitB.js';

// Bombe du Roublard : boulet noir-bleute bien rond avec une bouille de
// sale gosse (yeux fronces, grand sourire a dents), goulot de laiton,
// meche de corde tressee et etincelle.
export function buildBombeRoublard() {
  const group = new THREE.Group();

  const BODY = 0x3d4566;
  const bombMat = M(BODY, { r: 0.4, m: 0.2 });
  const brass = M(0xc9973a, { r: 0.4, m: 0.6 });
  const rope = M(0xb89a6a, { r: 0.9 });
  const sparkMat = M(0xffe07a, { r: 0.3, emissive: 0xff8a00, ei: 1.1 });
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xff9a20, transparent: true, opacity: 0.4 });
  const R = 0.33, CY = 0.335;

  // Corps : sphere un peu tassee, assise au sol.
  const body = sculptSphere((d, out) => {
    out.set(d.x * R, Math.max(d.y * R * (d.y < 0 ? 0.97 : 1), -R * 0.985), d.z * R);
  }, bombMat, 40, 30);
  body.position.y = CY;
  body.receiveShadow = true;
  group.add(body);
  // Point de la surface (lacet, tangage) legerement decolle.
  const on = (yaw, pitch, k, out) => out.set(Math.sin(yaw) * Math.cos(pitch) * R * k, CY + Math.sin(pitch) * R * k, Math.cos(yaw) * Math.cos(pitch) * R * k);

  // Reflet : croissant clair en haut a gauche.
  const glint = new THREE.MeshBasicMaterial({ color: 0xaab4d8 });
  group.add(mark(sheet((u, v, out) => {
    const w = Math.sin(Math.PI * u);
    on(-1.15 + u * 0.6, 0.95 - u * 0.25 + (v - 0.5) * 0.16 * w, 1.006, out);
  }, 12, 3, 0.003, glint)));

  // Yeux fronces.
  const eyes = addEyes(group, { x: 0, y: CY + 0.075, z: 0.265, size: 0.085, spacing: 0.23, turn: 0.36, lid: BODY, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });

  // Grand sourire carnassier : croissant de dents (lignes sombres peintes).
  const teeth = M(0xfff6e4, { r: 0.5 });
  const grin = sheet((u, v, out) => {
    const x = u * 2 - 1;
    const half = 0.115 * Math.pow(Math.max(0, 1 - x * x), 0.55) + 0.004;
    const mid = -0.3 + 0.2 * x * x;
    on(x * 0.72, mid + (v - 0.5) * 2 * half, 1.012, out);
  }, 84, 12, 0.012, teeth, {
    color: (u, v) => {
      const x = u * 2 - 1;
      // Bord sombre, separation des dents, ligne mediane en zigzag.
      const border = Math.max(sstep(0.72, 0.95, Math.abs(v - 0.5) * 2), sstep(0.9, 1, Math.abs(x)));
      const gap = 1 - sstep(0.06, 0.24, Math.abs(Math.sin(u * Math.PI * 7)));
      const midl = 1 - sstep(0.04, 0.13, Math.abs(v - 0.5));
      const k = 1 - 0.86 * Math.max(border, gap * 0.9, midl);
      return [k, k, k];
    },
  });
  mark(grin);
  group.add(grin);

  // Goulot de laiton un peu de travers + meche tressee.
  const top = new THREE.Group();
  top.add(loft([[-0.02, 0.125], [0.02, 0.118], [0.05, 0.085], [0.085, 0.08], [0.095, 0.098], [0.115, 0.098], [0.125, 0.07]], brass, { segs: 20, sub: 3 }));
  const fusePts = [[0, 0.11, 0], [0.005, 0.2, 0.01], [0.05, 0.28, 0.02], [0.12, 0.33, 0.02], [0.18, 0.33, 0.01]];
  top.add(tubeAlong(fusePts, t => 0.026 * (1 + 0.1 * Math.sin(t * 40)), rope, { steps: 40, segs: 8, shade: t => 0.8 + 0.2 * Math.sin(t * 40) }));
  // Etincelle en etoile + halo.
  const spark = sculptSphere((d, out) => {
    const a = Math.atan2(d.y, d.x);
    const k = 0.045 * (1 + 0.75 * Math.pow(Math.abs(Math.cos(a * 2.5)), 3) * (1 - Math.abs(d.z)));
    out.set(d.x * k, d.y * k, d.z * 0.03);
  }, sparkMat, 30, 12);
  spark.position.set(0.2, 0.335, 0.01);
  mark(spark);
  top.add(spark);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), haloMat);
  halo.position.copy(spark.position);
  top.add(halo);
  top.position.set(-0.03, CY + R * 0.93, 0);
  top.rotation.z = 0.16;
  group.add(top);

  return group;
}
