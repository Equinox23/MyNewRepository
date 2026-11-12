import * as THREE from 'three';
import { M, mesh, addEyes, sculptSphere, tubeAlong } from './kit.js';
import { paintSphere, vcol, mix, sstep, limb, spike, sheet, mark } from './monsterKitB.js';

// Dragounet Rouge : dragonnet invoque, mignon mais teigneux. Corps en
// poire a plastron creme annele, grosse tete a museau court (naseaux
// fumants, croc qui depasse), grands yeux dores a pupille fendue, cornes
// recourbees, collerettes aux joues, ailes de chauve-souris a membrane
// orangee, queue epaisse en fer de lance et crete dorsale.
export function buildDragounetRouge() {
  const group = new THREE.Group();

  const RED = 0xcf3a26;
  const red = M(RED, { r: 0.6 });
  const redV = M(RED, { r: 0.6 }); // pieces peintes (couleurs de sommet)
  const redLimb = M(0xb83020, { r: 0.6 });
  const redDk = M(0x8a2018, { r: 0.7 });
  const memb = M(0xf08a3a, { r: 0.7 });
  const hornMat = M(0xf3e6c8, { r: 0.5 });
  const claw = M(0xf6eedc, { r: 0.4 });
  const dark = M(0x2a0e0a, { r: 0.5 });
  const cCream = vcol(0xf6d488, RED);
  const cCreamDk = vcol(0xc98a3c, RED);
  const cDk = vcol(0xa82a1c, RED);

  // ---- Pattes arriere : cuisse ronde + pied a trois griffes ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    const thigh = sculptSphere((d, out) => {
      out.set(d.x * 0.11, d.y * 0.13 + 0.14, d.z * 0.135 - 0.02);
    }, redLimb, 20, 14);
    leg.add(thigh);
    const foot = sculptSphere((d, out) => {
      out.set(d.x * 0.1 * (1 + 0.25 * Math.max(0, d.z)), Math.max(d.y, -0.5) * 0.075 + 0.04, d.z * 0.14 + 0.07);
    }, redLimb, 20, 14);
    leg.add(foot);
    for (const k of [-1, 0, 1]) {
      const c = mark(spike([[k * 0.05, 0.035, 0.18], [k * 0.058, 0.035, 0.225], [k * 0.062, 0.012, 0.255]], 0.026, claw, { steps: 8, segs: 8 }));
      leg.add(c);
    }
    leg.position.set(s * 0.175, 0, 0.02);
    leg.rotation.y = s * 0.3;
    group.add(leg);
  }

  // ---- Corps en poire, plastron creme annele ----
  const body = paintSphere((d, out) => {
    const up = Math.max(0, d.y), dn = Math.max(0, -d.y);
    const w = 1 - 0.36 * up * up + 0.04 * dn;
    out.set(d.x * 0.285 * w, 0.4 + d.y * (d.y > 0 ? 0.36 : 0.27), d.z * 0.29 * w + 0.03 * dn - 0.02);
    // Plastron : bande ventrale claire, segments soulignes.
    const m = sstep(0.5, 0.62, d.z - Math.abs(d.x) * 0.55 + 0.1 * dn);
    const seg = sstep(0.0, 0.35, Math.abs(Math.sin((out.y - 0.13) * 21)));
    return mix([1, 1, 1], mix(cCreamDk, cCream, seg), m);
  }, redV, 64, 56);
  group.add(body);

  // ---- Queue epaisse, pointe en fer de lance ----
  const tailPts = [[0, 0.3, -0.2], [0, 0.17, -0.42], [0, 0.11, -0.62], [0.05, 0.17, -0.8], [0.12, 0.33, -0.86], [0.15, 0.47, -0.8]];
  const tail = tubeAlong(tailPts, t => 0.135 * Math.pow(1 - t, 0.75) + 0.03, red, { steps: 36, segs: 14 });
  group.add(tail);
  const tip = sculptSphere((d, out) => {
    const t = (d.y + 1) / 2;
    const w = Math.sin(Math.PI * Math.pow(1 - t, 0.5)) * (1 - t * 0.5);
    out.set(d.x * 0.11 * w, t * 0.22 - 0.05, d.z * 0.035 * (0.5 + w));
  }, redDk, 18, 14);
  tip.position.set(0.155, 0.49, -0.79);
  tip.rotation.set(0.5, 0.2, -0.25);
  group.add(tip);

  // ---- Ailes de chauve-souris ----
  for (const s of [-1, 1]) {
    const wing = new THREE.Group();
    const L = 0.6;
    const ang = v => 1.4 - v * 1.75;
    const len = v => L * (0.76 + 0.24 * Math.pow(Math.abs(Math.cos(Math.PI * 3 * v)), 0.7)) * (1 - 0.34 * v);
    const m = sheet((u, v, out) => {
      const a = ang(v), r = Math.pow(u, 0.9) * len(v);
      out.set(Math.cos(a) * r, Math.sin(a) * r, -0.07 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v) - 0.05 * u * u);
    }, 14, 30, 0.012, memb, { color: (u, v) => { const k = 0.72 + 0.28 * u; return [k, k * k, k * k]; } });
    wing.add(m);
    for (const v of [0, 1 / 3, 2 / 3, 1]) {
      const a = ang(v), r = len(v);
      const pts = [];
      for (let i = 0; i <= 4; i++) { const u = i / 4, rr = Math.pow(u, 0.9) * r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr, -0.05 * u * u + 0.004]); }
      const f = tubeAlong(pts, t => 0.03 * (1 - t * 0.75), redDk, { steps: 12, segs: 8 });
      if (v > 0 && v < 1) f.userData.noOutline = true;
      wing.add(f);
    }
    wing.scale.x = s;
    wing.position.set(s * 0.16, 0.6, -0.2);
    wing.rotation.set(0.1, s * 0.3, 0);
    // Retourne les faces du cote miroir (echelle negative).
    group.add(wing);
  }

  // ---- Petits bras ----
  for (const s of [-1, 1]) {
    const arm = limb([[s * 0.2, 0.53, 0.1], [s * 0.27, 0.45, 0.19], [s * 0.24, 0.38, 0.27], [s * 0.21, 0.36, 0.3]], 0.05, 0.05, redLimb, { steps: 16, segs: 10, cap: 0.2 });
    group.add(arm);
  }

  // ---- Crete dorsale ----
  for (const [y, z, h] of [[0.72, -0.2, 0.12], [0.56, -0.28, 0.13], [0.38, -0.31, 0.11]]) {
    const sp = spike([[0, y, z + 0.05], [0, y + h * 0.5, z - h * 0.55], [0, y + h * 0.75, z - h * 1.05]], 0.055, redDk, { steps: 8, segs: 8, flat: 0.5 });
    group.add(sp);
  }

  // ---- Tete : crane rond, museau court et large ----
  const head = new THREE.Group();
  head.position.set(0, 0.92, 0.07);
  const skull = paintSphere((d, out) => {
    const low = Math.max(0, -d.y);
    let x = d.x * 0.285 * (1 - 0.12 * low);
    let y = d.y * (d.y > 0 ? 0.25 : 0.22);
    let z = d.z * 0.25;
    let k = 0;
    if (d.z > 0) {
      // Museau : renflement bas-avant, large.
      k = Math.exp(-Math.pow((d.y + 0.36) / 0.4, 2)) * Math.exp(-Math.pow(d.x / 0.66, 2));
      z += 0.14 * k * d.z;
      y -= 0.01 * k;
    }
    out.set(x, y, z);
    // Machoire inferieure claire.
    const m = sstep(0.42, 0.56, low + 0.12 * d.z) * sstep(-0.2, 0.25, d.z);
    return mix(mix([1, 1, 1], cDk, sstep(0.55, 1, -d.z) * 0.5), cCream, m);
  }, redV, 56, 44);
  head.add(skull);
  // Naseaux + petite braise.
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xffa23a });
  for (const s of [-1, 1]) {
    const n = mark(mesh(new THREE.SphereGeometry(0.024, 10, 8), dark, [s * 0.062, -0.035, 0.362], [1.1, 0.75, 0.5], [0.3, s * 0.35, s * 0.4]));
    head.add(n);
  }
  // Bouche : sourire en coin + croc.
  const line = (pts, r = 0.009) => mark(tubeAlong(pts, t => r * (0.45 + 0.55 * Math.sin(Math.PI * t)), dark, { steps: 16, segs: 6 }));
  head.add(line([[-0.2, -0.085, 0.2], [-0.13, -0.125, 0.3], [0, -0.14, 0.372], [0.13, -0.125, 0.3], [0.21, -0.07, 0.19]]));
  for (const [x, z, r] of [[0.105, 0.325, 0.02], [-0.105, 0.325, 0.02]]) {
    head.add(mark(spike([[x, -0.125, z], [x, -0.155, z + 0.006], [x * 0.98, -0.182, z + 0.004]], r, claw, { steps: 6, segs: 8 })));
  }
  // Flammeche qui s echappe du coin de la gueule.
  const fl = sculptSphere((d, out) => {
    const t = (d.y + 1) / 2;
    const w = Math.sin(Math.PI * Math.pow(1 - t, 0.6)) * (0.4 + 0.6 * (1 - t));
    out.set(d.x * 0.04 * w + 0.03 * t * t, t * 0.13, d.z * 0.03 * w);
  }, emberMat, 12, 10);
  fl.position.set(0.02, -0.12, 0.385);
  fl.rotation.set(1.25, 0, -0.2);
  fl.castShadow = false;
  head.add(fl);
  const fl2 = fl.clone();
  fl2.material = new THREE.MeshBasicMaterial({ color: 0xffe07a });
  fl2.scale.setScalar(0.55);
  fl2.position.set(0.022, -0.118, 0.4);
  head.add(fl2);
  // Grands yeux dores a pupille fendue, paupiere froncee.
  const eyes = addEyes(head, { x: 0, y: 0.075, z: 0.2, size: 0.085, spacing: 0.25, turn: 0.38, iris: 0xffc21e, slit: true, lid: RED, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Cornes recourbees vers l arriere.
  for (const s of [-1, 1]) {
    const h = spike([[s * 0.13, 0.19, -0.02], [s * 0.185, 0.3, -0.08], [s * 0.2, 0.39, -0.18], [s * 0.175, 0.43, -0.29]], 0.058, hornMat, {
      steps: 26, segs: 12, pow: 0.7, shade: t => 1 - 0.16 * Math.max(0, Math.sin(t * 34)) * (1 - t),
    });
    head.add(h);
    // Collerette de joue a trois pointes.
    const fin = sheet((u, v, out) => {
      const a = -0.75 + v * 1.5;
      const r = Math.pow(u, 0.9) * 0.2 * (0.6 + 0.4 * Math.pow(Math.abs(Math.cos(Math.PI * 2 * v)), 0.6));
      out.set(Math.cos(a) * r, Math.sin(a) * r, -0.03 * u * u);
    }, 8, 18, 0.014, memb, { color: (u) => { const k = 0.75 + 0.25 * u; return [k, k * k, k * k]; } });
    fin.scale.x = s;
    fin.position.set(s * 0.25, -0.07, -0.03);
    fin.rotation.set(0, s * 0.5, s * -0.1);
    head.add(fin);
  }
  // Petite crete sur le crane.
  for (const [y, z, h] of [[0.235, 0.0, 0.1], [0.2, -0.13, 0.11]]) {
    head.add(spike([[0, y - 0.03, z + 0.04], [0, y + h * 0.6, z - h * 0.4], [0, y + h * 0.9, z - h * 0.9]], 0.05, redDk, { steps: 8, segs: 8, flat: 0.5 }));
  }
  group.add(head);

  return group;
}
