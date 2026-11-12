import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere } from './kit.js';
import { paint, ratio, smooth, gauss, line, decal, webFoot, feather } from './monsterKitA.js';

// Tofu : poussin tout rond et effronte. Un seul corps en forme d oeuf
// dodu (ventre creme peint), enormes yeux rapproches sous des sourcils
// moqueurs, bec court et large entrouvert, ailerons en goutte, houppette
// de trois plumes rabattues, pattes fines a trois doigts.
// `opts.royal` : plumage rouge royal a ventre dore, sourcils severes,
// houppette et queue plus fournies (utilise par tofuRoyal.js).
// Les deux pattes restent des enfants directs du groupe (Rig.js).
export function buildTofu(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const bodyHex = royal ? 0xd23a2a : 0xffd23a;
  const bellyHex = royal ? 0xf6c452 : 0xfff0a8;
  const featherMat = M(bodyHex, { r: 0.85 });
  const wingMat = M(royal ? 0x9a2018 : 0xf7a51e, { r: 0.85 });
  const beakMat = M(royal ? 0xf0a02a : 0xf07a22, { r: 0.55 });
  const beakDk = M(royal ? 0xc8701a : 0xc8521a, { r: 0.6 });
  const legMat = M(royal ? 0xe08a22 : 0xe8782a, { r: 0.65 });
  const dark = M(0x3a1a0c, { r: 0.6 });
  const cheekMat = M(royal ? 0xf07a5a : 0xff9a6a, { r: 0.8 });

  // ---- Pattes fines (genou marque) + pied a trois doigts ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(loft([
      [0.27, 0.036, 0.036, 0, -0.01],
      [0.19, 0.026, 0.026, 0, -0.012],
      [0.13, 0.03, 0.03, 0, -0.004],
      [0.07, 0.021, 0.021, 0, -0.012],
      [0.012, 0.026, 0.028, 0, -0.008],
    ], legMat, { segs: 10, sub: 4 }));
    const foot = webFoot(legMat, { len: 0.135, back: 0.05, toes: [-0.62, 0, 0.62], toeW: 0.19, web: 0.3, thick: 0.02 });
    foot.position.set(0, 0, 0.0);
    foot.rotation.y = s * 0.18;
    leg.add(foot);
    leg.position.set(s * 0.115, 0, 0.0);
    group.add(leg);
  }

  // ---- Corps : oeuf dodu, joues rebondies, ventre creme peint ----
  const bodyY = 0.5;
  const body = sculptSphere((d, out) => {
    const low = Math.max(0, -d.y), up = Math.max(0, d.y);
    const w = 1 + 0.07 * low - 0.1 * up * up;
    let x = d.x * 0.345 * w;
    let y = d.y * (d.y > 0 ? 0.345 : 0.31);
    let z = d.z * 0.325 * w;
    // Joues duveteuses de part et d autre du bec.
    const ck = gauss(Math.abs(d.x) - 0.62, 0.3) * gauss(d.y + 0.12, 0.3) * smooth(-0.1, 0.5, d.z);
    x += Math.sign(d.x) * 0.022 * ck; z += 0.02 * ck;
    // Petit croupion releve.
    const rump = gauss(d.y - 0.05, 0.45) * smooth(0.55, 1, -d.z);
    z -= 0.035 * rump; y += 0.02 * rump;
    out.set(x, y, z);
  }, featherMat, 48, 34);
  paint(body, [[ratio(bodyHex, bellyHex), (p) => {
    const k = smooth(0.02, 0.2, p.z - 0.02) * smooth(0.04, -0.1, p.y) * smooth(0.27, 0.12, Math.abs(p.x));
    return k;
  }]]);
  body.position.y = bodyY;
  group.add(body);

  // ---- Ailerons en goutte, pointe vers l arriere ----
  for (const s of [-1, 1]) {
    const wing = feather(0.3, 0.125, wingMat, { thick: 0.05, pw: 0.6, bend: 0.04, ws: 20, hs: 18 });
    wing.rotation.set(-(Math.PI - 0.6), s * Math.PI / 2, 0);
    const w = new THREE.Group();
    w.add(wing);
    w.position.set(s * 0.335, bodyY + 0.13, 0.035);
    w.rotation.z = s * 0.3;
    group.add(w);
  }

  // ---- Queue : eventail de trois plumes relevees ----
  const tail = new THREE.Group();
  const nT = royal ? 5 : 3;
  for (let i = 0; i < nT; i++) {
    const k = i - (nT - 1) / 2;
    const f = feather((royal ? 0.34 : 0.27) - Math.abs(k) * 0.03, 0.068, wingMat, { thick: 0.026, bend: -0.3 });
    f.rotation.set(-1.05 + Math.abs(k) * 0.1, 0, -k * 0.38);
    tail.add(f);
  }
  tail.position.set(0, bodyY + 0.0, -0.27);
  group.add(tail);

  // ---- Houppette : trois plumes rabattues vers l arriere ----
  const crest = new THREE.Group();
  const nC = 3;
  for (let i = 0; i < nC; i++) {
    const k = i - 1;
    const f = feather((royal ? 0.2 : 0.15) - Math.abs(k) * 0.035, 0.036, wingMat, { thick: 0.02, bend: 0.5, ws: 12, hs: 14 });
    f.rotation.set(-0.35, 0, -k * 0.5);
    f.position.set(k * 0.02, 0, 0);
    crest.add(f);
  }
  crest.position.set(0, bodyY + 0.325, 0.03);
  group.add(crest);

  // ---- Visage ----
  const face = new THREE.Group();
  face.position.set(0, bodyY, 0);
  const eyes = addEyes(face, { x: 0, y: 0.105, z: 0.248, size: 0.1, spacing: 0.228, turn: 0.32, lid: bodyHex, angry: royal });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Sourcils : moqueurs (un leve) ou severes pour le Royal.
  for (const s of [-1, 1]) {
    const lift = royal ? 0 : (s > 0 ? 0.03 : 0);
    const tilt = royal ? -0.045 : (s > 0 ? 0.012 : -0.03);
    const b = line([
      [s * 0.035, 0.225 + lift + tilt, 0.272],
      [s * 0.11, 0.25 + lift, 0.245],
      [s * 0.18, 0.232 + lift - tilt * 0.4, 0.2],
    ], 0.013, dark, { taper: true });
    face.add(b);
  }
  // Bec court et large, entrouvert : machoire haute un peu crochue.
  const beak = new THREE.Group();
  const upper = loft([
    [0, 0.082, 0.05, 0, -0.004],
    [0.045, 0.07, 0.044, 0, 0.0],
    [0.095, 0.042, 0.028, 0, 0.012],
    [0.13, 0.006, 0.005, 0, 0.03],
  ], beakMat, { segs: 16, sub: 5 });
  upper.rotation.x = Math.PI / 2;
  beak.add(upper);
  const lower = loft([
    [0, 0.064, 0.03, 0, 0],
    [0.045, 0.048, 0.024, 0, -0.002],
    [0.085, 0.006, 0.005, 0, -0.008],
  ], beakDk, { segs: 14, sub: 4 });
  lower.rotation.x = Math.PI / 2 + 0.32;
  lower.position.set(0, -0.042, -0.005);
  lower.userData.noOutline = true;
  beak.add(lower);
  beak.position.set(0, -0.012, 0.3);
  face.add(beak);
  // Joues roses.
  for (const s of [-1, 1]) {
    face.add(decal(mesh(new THREE.SphereGeometry(0.04, 12, 8), cheekMat, [s * 0.2, -0.045, 0.262], [1.2, 0.7, 0.35], [0, s * 0.65, 0])));
  }
  group.add(face);

  return group;
}
