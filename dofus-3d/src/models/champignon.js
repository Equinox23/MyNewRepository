import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere, tubeAlong } from './kit.js';
import { paintSphere, vcol, mix, sstep, limb, mark, crownMesh } from './monsterKitB.js';

// Champignon : creature mycelienne ronchon. Gros chapeau bombe d une seule
// piece (bord ourle, verrues claires en relief, lamelles dessous), pied
// dodu en poire qui porte le visage (gros yeux boudeurs sous le rebord du
// chapeau, moue), collerette, petits bras moufles et pieds ronds.
// `opts.royal` : chapeau pourpre a verrues dorees, plus haut et plus orne
// (utilise par champignonRoyal.js).
const _cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};
// Profil [t, rayon, hauteur] interpole (t = 0 sommet, 1 = centre du dessous).
function profile(keys, t) {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const a = keys[Math.max(0, i - 1)], b = keys[i], c = keys[i + 1], d = keys[Math.min(keys.length - 1, i + 2)];
  const k = Math.min(1, Math.max(0, (t - b[0]) / (c[0] - b[0])));
  return [Math.max(0, _cr(a[1], b[1], c[1], d[1], k)), _cr(a[2], b[2], c[2], d[2], k)];
}

export function buildChampignon(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const capHex = royal ? 0x7c3ab8 : 0xd23a2a;
  const capMat = M(capHex, { r: 0.85 });
  const stemHex = royal ? 0xf0e4cc : 0xeadfc4;
  const stemMat = M(stemHex, { r: 0.9 });
  const limbMat = M(royal ? 0xe2d2b4 : 0xdccdaa, { r: 0.9 });
  const dark = M(0x2a1a16, { r: 0.5 });

  // ---- Pieds ronds (enfants directs) ----
  for (const s of [-1, 1]) {
    const foot = sculptSphere((d, out) => {
      out.set(d.x * 0.115, Math.max(d.y, -0.45) * 0.09, d.z * 0.15 + 0.02 * Math.max(0, d.z));
    }, limbMat, 20, 14);
    foot.position.set(s * 0.14, 0.04, 0.06);
    foot.rotation.y = s * 0.3;
    group.add(foot);
  }

  // ---- Pied dodu (le corps) : poire, plus large en bas ----
  const body = new THREE.Group();
  const stem = loft([
    [0.04, 0.17, 0.16],
    [0.12, 0.27, 0.25],
    [0.28, 0.305, 0.28],
    [0.46, 0.27, 0.25],
    [0.62, 0.22, 0.21],
    [0.78, 0.19, 0.19],
  ], stemMat, { segs: 28, sub: 6 });
  body.add(stem);

  // ---- Collerette sous le chapeau : anneau ondule ----
  const ringMat = M(royal ? 0xe8c14a : 0xd8c49c, { r: 0.85, m: royal ? 0.4 : 0 });
  const collar = sculptSphere((d, out) => {
    const a = Math.atan2(d.z, d.x);
    const rr = Math.hypot(d.x, d.z);
    const w = 1 + 0.07 * Math.sin(a * 7);
    out.set(d.x * 0.3 * w, d.y * 0.035 - rr * rr * 0.05 + 0.012 * Math.sin(a * 7 + 1), d.z * 0.29 * w);
  }, ringMat, 42, 10);
  collar.position.y = 0.665;
  body.add(collar);

  // ---- Visage : gros yeux boudeurs + moue ----
  const eyes = addEyes(body, { x: 0, y: 0.45, z: 0.232, size: 0.088, spacing: 0.205, turn: 0.32, lid: stemHex, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Sourcils epais et fronces.
  const browMat = M(royal ? 0x4a2374 : 0x8a2418, { r: 0.8 });
  for (const s of [-1, 1]) {
    const brow = mark(limb([[s * 0.035, 0.535, 0.268], [s * 0.1, 0.57, 0.256], [s * 0.175, 0.58, 0.21]], 0.02, 0.014, browMat, { steps: 10, segs: 8, cap: 0.25 }));
    body.add(brow);
  }
  const frown = mark(tubeAlong([[-0.075, 0.262, 0.262], [-0.04, 0.287, 0.283], [0, 0.295, 0.29], [0.04, 0.287, 0.283], [0.075, 0.262, 0.262]], t => 0.011 * (0.5 + Math.sin(Math.PI * t) * 0.5), dark, { steps: 14, segs: 6 }));
  body.add(frown);
  // Joues un peu rosees.
  const cheekMat = M(0xe8a08a, { r: 0.9 });
  for (const s of [-1, 1]) {
    body.add(mark(mesh(new THREE.SphereGeometry(0.04, 12, 8), cheekMat, [s * 0.185, 0.345, 0.213], [1.2, 0.7, 0.3], [0, s * 0.75, 0])));
  }
  group.add(body);

  // ---- Petits bras moufles (enfants directs) ----
  for (const s of [-1, 1]) {
    const arm = limb([[s * 0.24, 0.42, 0.03], [s * 0.34, 0.39, 0.07], [s * 0.4, 0.31, 0.11], [s * 0.41, 0.25, 0.13]], 0.05, 0.062, limbMat, { steps: 18, segs: 12, cap: 0.2 });
    group.add(arm);
  }

  // ---- Chapeau d une seule piece ----
  const H = royal ? 1.06 : 1;
  const keys = [
    [0, 0, 0.66 * H],
    [0.2, 0.3, 0.6 * H],
    [0.4, 0.5, 0.4 * H],
    [0.55, 0.585, 0.16],
    [0.64, 0.555, 0.0],
    [0.7, 0.47, -0.02],
    [0.8, 0.33, 0.045],
    [1, 0, 0.09],
  ];
  // Verrues : direction + rayon angulaire.
  const spots = [];
  const sd = [[0.05, 1, 0.1, 0.3], [0.75, 0.62, 0.55, 0.25], [-0.72, 0.6, 0.5, 0.22], [0.05, 0.42, 0.95, 0.2], [0.98, 0.3, -0.1, 0.2],
    [-0.95, 0.38, -0.2, 0.24], [0.45, 0.6, -0.7, 0.24], [-0.4, 0.5, -0.8, 0.19], [0.55, 0.2, 0.85, 0.13], [-0.55, 0.16, 0.86, 0.15], [-0.25, 0.85, -0.3, 0.14], [0.95, 0.12, 0.5, 0.12]];
  for (const [x, y, z, r] of sd) spots.push({ c: new THREE.Vector3(x, y, z).normalize(), r });
  const cCap = [1, 1, 1];
  const cSpot = vcol(royal ? 0xf4d27a : 0xfff4e0, capHex);
  const cRim = vcol(royal ? 0x57288a : 0xa82a1c, capHex);
  const cGill = vcol(royal ? 0xdcc8e8 : 0xe9cdb0, capHex);
  const cGillDk = vcol(royal ? 0xa88cc0 : 0xc09a7c, capHex);
  const cap = paintSphere((d, out) => {
    const t = Math.acos(Math.max(-1, Math.min(1, d.y))) / Math.PI;
    const a = Math.atan2(d.z, d.x);
    let [rad, y] = profile(keys, t);
    // Bord legerement ondule.
    const edge = Math.exp(-Math.pow((t - 0.62) / 0.12, 2));
    rad *= 1 + 0.035 * edge * Math.sin(a * 5 + 0.6);
    y += 0.025 * edge * Math.sin(a * 5 + 2.2);
    let col = cCap;
    if (t < 0.6) {
      let best = 0;
      for (const s of spots) {
        const ang = Math.acos(Math.min(1, d.dot(s.c)));
        best = Math.max(best, 1 - sstep(s.r * 0.86, s.r, ang));
      }
      // Verrue : pastille claire en leger relief.
      rad *= 1 + 0.035 * best;
      y += 0.02 * best * (1 - t);
      col = mix(mix(cCap, cRim, sstep(0.46, 0.6, t) * 0.75), cSpot, best);
    } else if (t < 0.67) {
      col = mix(cCap, cRim, 0.75);
    } else {
      const stripe = 0.5 + 0.5 * Math.sin(a * 26);
      col = mix(cGill, cGillDk, stripe * 0.8);
    }
    out.set(Math.cos(a) * rad, y, Math.sin(a) * rad * 0.97);
    return col;
  }, capMat, 112, 84);
  cap.position.set(0, 0.735, -0.01);
  cap.rotation.x = -0.06;
  group.add(cap);

  if (royal) {
    // Couronne d or posee de travers + spores lumineuses sur les pointes.
    const gold = M(0xe8b830, { r: 0.35, m: 0.6 });
    const spore = M(0xa6f07a, { r: 0.5, emissive: 0x4a9a2a, ei: 0.8 });
    const crown = new THREE.Group();
    crown.add(crownMesh(0.17, 0.2, gold, { points: 5, flare: 0.3 }));
    for (let i = 0; i < 5; i++) {
      const a = ((i + 0.5) / 5) * Math.PI * 2;
      const sp = mesh(new THREE.SphereGeometry(0.034, 10, 8), spore, [Math.cos(a) * 0.225, 0.215, Math.sin(a) * 0.225]);
      sp.userData.noOutline = true;
      crown.add(sp);
    }
    crown.position.set(0.02, 0.735 + 0.63 * H, -0.03);
    crown.rotation.set(-0.1, 0.3, -0.1);
    group.add(crown);
    // Grosse moustache blanche de vieux roi.
    const stache = M(0xfffaf0, { r: 0.9 });
    for (const s of [-1, 1]) {
      body.add(limb([[s * 0.005, 0.325, 0.3], [s * 0.09, 0.3, 0.3], [s * 0.19, 0.31, 0.26], [s * 0.26, 0.37, 0.2], [s * 0.27, 0.42, 0.17]], 0.045, 0.012, stache, { steps: 20, segs: 10, cap: 0.12, bulge: 0.5 }));
    }
    // Spores luisantes qui pendent au bord du chapeau.
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      const sp = mesh(new THREE.SphereGeometry(0.035, 10, 8), spore, [Math.cos(a) * 0.52, 0.7 + 0.02 * Math.sin(a * 5 + 2.2), Math.sin(a) * 0.5]);
      sp.userData.noOutline = true;
      group.add(sp);
    }
  }

  return group;
}
