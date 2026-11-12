import * as THREE from 'three';
import { M, mesh, addEyes, sculptSphere, tubeAlong } from './kit.js';
import { smooth, gauss, line, decal, blob, webFoot } from './monsterKitA.js';

// Crapaud : gros crapaud ramasse d une seule piece. Dos large et bossu
// seme de verrues, gorge et ventre clairs (peints), immense bouche
// satisfaite qui fait le tour de la tete, yeux dores globuleux sous de
// lourdes paupieres, cuisses repliees et grandes pattes palmees.
// `opts.chef` : Crapaud Chef (vert sombre, regard mauvais, plus de
// verrues) utilise par crapaudChef.js.
export function buildCrapaud(opts = {}) {
  const group = new THREE.Group();
  const chef = !!opts.chef;

  const bodyHex = chef ? 0x3f7a2e : 0x5fa23c;
  const bodyCol = new THREE.Color(bodyHex);
  const bellyR = new THREE.Color(chef ? 0xc9cf78 : 0xdfe58e);
  const wartR = new THREE.Color(chef ? 0x275220 : 0x3d7a2a);
  for (const c of [bellyR, wartR]) { c.r /= bodyCol.r; c.g /= bodyCol.g; c.b /= bodyCol.b; }
  const skin = M(bodyHex, { r: 0.85 });
  const limb = M(chef ? 0x33682a : 0x4f8f34, { r: 0.85 });
  const dark = M(0x2a160c, { r: 0.6 });
  const cheekMat = M(0xf08a8a, { r: 0.8 });

  const CY = 0.31;
  // Yeux : deux bosses sur le haut du crane.
  const eyeDir = [-1, 1].map(s => new THREE.Vector3(s * 0.37, 0.8, 0.47).normalize());
  // Verrues : bosses du dos (graine fixe).
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const warts = [];
  const nW = chef ? 13 : 9;
  for (let i = 0; i < 60 && warts.length < nW; i++) {
    const v = new THREE.Vector3(rnd() * 2 - 1, 0.25 + rnd() * 0.75, rnd() * 1.5 - 1.15).normalize();
    if (v.y < 0.3 || warts.some(w => w.v.dot(v) > 0.93) || eyeDir.some(e => e.dot(v) > 0.8)) continue;
    warts.push({ v, k: 0.006 + rnd() * 0.006, h: 0.02 + rnd() * 0.014 });
  }
  // Ligne de la bouche : elevation en fonction de l azimut (sourire).
  const MW = 1.45;
  const mouthEl = (a) => -0.2 + 0.2 * Math.pow(Math.min(1, Math.abs(a) / MW), 2.2);
  const shape = (d, out) => {
    const up = Math.max(0, d.y);
    let x = d.x * 0.44, y = d.y * (d.y > 0 ? 0.29 : 0.27), z = d.z * 0.45;
    // Tete relevee a l avant, croupe basse ; machoire large.
    y += 0.05 * d.z * (1 - 0.5 * up);
    x *= 1 + 0.06 * smooth(-0.2, 0.6, d.z) * (1 - up);
    // Dos bossu.
    y += 0.03 * gauss(d.z + 0.35, 0.5) * up;
    out.set(x, y, z);
    let wart = 0;
    for (const s of [0, 1]) {
      const b = Math.exp(-(1 - d.dot(eyeDir[s])) / 0.04);
      out.addScaledVector(eyeDir[s], 0.115 * b);
    }
    // Arcade entre les deux yeux.
    out.y += 0.05 * gauss(d.x, 0.3) * smooth(0.45, 0.8, d.y) * smooth(0, 0.4, d.z);
    for (const w of warts) {
      const b = Math.exp(-(1 - d.dot(w.v)) / w.k);
      out.addScaledVector(w.v, w.h * b);
      wart = Math.max(wart, b);
    }
    // Levre : leger bourrelet au-dessus de la bouche, creux en dessous.
    const a = Math.atan2(d.x, d.z), el = Math.asin(d.y);
    if (Math.abs(a) < MW + 0.2) {
      const de = el - mouthEl(a);
      const fade = smooth(MW + 0.2, MW - 0.15, Math.abs(a));
      const lip = (gauss(de - 0.07, 0.09) * 0.016 - gauss(de + 0.01, 0.045) * 0.014) * fade;
      out.x += d.x * lip; out.z += d.z * lip;
    }
    return wart;
  };
  const cols = [];
  const body = sculptSphere((d, out) => {
    const wart = shape(d, out);
    const a = Math.atan2(d.x, d.z), el = Math.asin(d.y);
    // Gorge claire sous la bouche, ventre clair sous les flancs.
    const k = smooth(MW - 0.25, MW + 0.5, Math.abs(a));
    const edge = mouthEl(a) * (1 - k) + (-0.62) * k;
    const belly = smooth(edge - 0.005, edge - 0.07 - 0.25 * k, el);
    const w = smooth(0.25, 0.75, wart) * 0.85;
    const c = [1, 1, 1];
    for (let i = 0; i < 3; i++) {
      const b = [bellyR.r, bellyR.g, bellyR.b][i], wt = [wartR.r, wartR.g, wartR.b][i];
      c[i] = (1 + (b - 1) * belly) * (1 + (wt - 1) * w);
    }
    cols.push(c[0], c[1], c[2]);
  }, skin, 104, 70);
  body.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  skin.vertexColors = true;
  body.position.y = CY;
  group.add(body);
  // Point de la surface du corps (azimut, elevation), decale de `push`.
  const _d = new THREE.Vector3();
  const at = (a, el, push = 0) => {
    _d.set(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el));
    const o = new THREE.Vector3();
    shape(_d, o);
    o.addScaledVector(_d, push);
    o.y += CY;
    return o;
  };

  // ---- Bouche : un seul trait qui fait le tour, commissures relevees ----
  const mpts = [];
  for (let i = 0; i <= 28; i++) {
    const a = -MW + (i / 28) * MW * 2;
    mpts.push(at(a, mouthEl(a) - 0.005, 0.002));
  }
  const mo = tubeAlong(mpts, t => 0.012 * (0.45 + 0.55 * Math.sin(Math.PI * t) ** 0.5), dark, { steps: 70, segs: 6 });
  decal(mo);
  group.add(mo);
  for (const s of [-1, 1]) {
    group.add(line([at(s * (MW - 0.08), mouthEl(MW) + 0.09, 0.003), at(s * (MW + 0.02), mouthEl(MW) + 0.02, 0.003), at(s * (MW - 0.06), mouthEl(MW) - 0.07, 0.003)], 0.008, dark, { taper: true }));
    // Narines.
    const n = mesh(new THREE.SphereGeometry(0.014, 8, 6), dark, null, [1.2, 0.8, 0.6]);
    n.position.copy(at(s * 0.13, 0.2, -0.002));
    group.add(decal(n));
    // Joues roses.
    const ch = mesh(new THREE.SphereGeometry(0.05, 12, 8), cheekMat, null, [1.25, 0.7, 0.3], [0, s * 1.0, 0]);
    ch.position.copy(at(s * 0.98, 0.02, -0.004));
    group.add(decal(ch));
  }

  // ---- Yeux dores globuleux ----
  const eyes = addEyes(group, {
    x: 0, y: CY + 0.375, z: 0.285, size: 0.105, spacing: 0.4, turn: 0.42,
    iris: chef ? 0xf07a1a : 0xf2c21a, lid: bodyHex, sleepy: !chef, angry: chef,
  });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });

  // ---- Pattes arriere : cuisse repliee + grande palme ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    const thigh = blob(0.125, 0.155, 0.21, limb, (d, out) => { out.y += 0.03 * d.z; });
    thigh.position.set(s * 0.375, 0.165, -0.15);
    thigh.rotation.set(0.25, s * 0.35, s * 0.25);
    leg.add(thigh);
    const foot = webFoot(limb, { len: 0.23, back: 0.07, toes: [-0.62, 0, 0.62], toeW: 0.2, web: 0.62, thick: 0.026 });
    foot.position.set(s * 0.45, 0, -0.02);
    foot.rotation.y = s * 0.75;
    leg.add(foot);
    group.add(leg);
  }
  // ---- Pattes avant : bras court + main palmee tournee vers l interieur ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(tubeAlong([[s * 0.25, 0.26, 0.24], [s * 0.34, 0.16, 0.3], [s * 0.31, 0.03, 0.36]], t => 0.07 - 0.022 * t, limb, { steps: 14, segs: 12 }));
    const hand = webFoot(limb, { len: 0.16, back: 0.055, toes: [-0.7, 0, 0.7], toeW: 0.21, web: 0.5, thick: 0.024 });
    hand.position.set(s * 0.31, 0, 0.365);
    hand.rotation.y = -s * 0.25;
    leg.add(hand);
    group.add(leg);
  }

  return group;
}
