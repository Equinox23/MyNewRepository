import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere, woolBlob, tubeAlong } from './kit.js';
import { paint, ratio, smooth, gauss, line, decal, blob, feather, crown } from './monsterKitA.js';

// Wabbit : lapin bipede trapu a l air mauvais. Corps en poire au ventre
// blanc, grosse tete a bajoues, yeux rouges sous des paupieres froncees,
// petit nez rose et rictus en coin (pas de dents), tres longues oreilles
// dont une cassee vers l avant, grands pieds, queue pompon, carotte
// brandie comme un poignard dans la patte droite.
// `opts.royal` : Wa Wabbit (cape rouge a col d hermine, couronne,
// carotte-sceptre).
// Jambes, bras et tete sont des pivots nommes (group.userData.rig) :
// Rig.js les anime directement et les variantes posent leur accessoire
// sur la tete.
export function buildWabbit(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const furHex = royal ? 0xf6f3ec : 0xe9e9f0;
  const fur = M(furHex, { r: 0.9 });
  const furBody = M(furHex, { r: 0.9 });
  const furEar = M(furHex, { r: 0.9 });
  const furDk = M(royal ? 0xdcd5c6 : 0xc6c7d4, { r: 0.9 });
  const white = M(0xffffff, { r: 0.95 });
  const nose = M(0xe8587a, { r: 0.5 });
  const cheekMat = M(0xf2a8b8, { r: 0.8 });
  const carrot = M(0xf07a1a, { r: 0.7 });
  const leaf = M(0x5aa832, { r: 0.8 });
  const dark = M(0x3a2028, { r: 0.5 });

  // ---- Jambes : cuisse ronde + long pied de lapin ----
  const legs = {};
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.125, 0.26, 0);
    leg.add(mesh(new THREE.SphereGeometry(0.105, 16, 12), furDk, [0, -0.05, -0.02], [1, 1.05, 1.05]));
    const foot = sculptSphere((d, out) => {
      // Talon etroit, avant-pied large et bombe, semelle plate.
      const f = smooth(-0.6, 0.7, d.z);
      out.set(d.x * (0.062 + 0.036 * f), (d.y > 0 ? d.y * (0.05 + 0.03 * f) : d.y * 0.045), d.z * 0.165);
    }, fur, 20, 14);
    foot.position.set(s * 0.012, -0.215, 0.085);
    foot.rotation.y = s * 0.2;
    leg.add(foot);
    group.add(leg);
    legs[s] = leg;
  }

  // ---- Corps en poire, ventre blanc peint ----
  const body = sculptSphere((d, out) => {
    const low = Math.max(0, -d.y), up = Math.max(0, d.y);
    const w = 1 + 0.08 * low - 0.42 * up * up;
    out.set(d.x * 0.255 * w, d.y * (d.y > 0 ? 0.27 : 0.235), d.z * 0.235 * w + 0.02 * gauss(d.y + 0.25, 0.5) * Math.max(0, d.z));
  }, furBody, 36, 26);
  paint(body, [[ratio(furHex, 0xffffff), (p) => smooth(0.05, 0.17, p.z) * smooth(0.2, 0.1, Math.abs(p.x)) * smooth(0.2, 0.1, p.y)]]);
  body.position.set(0, 0.43, 0);
  group.add(body);
  // Queue pompon.
  const tail = woolBlob(0.085, white, { lobes: 7, amp: 0.26, seed: 4, shade: 0.14, ws: 24, hs: 18 });
  tail.position.set(0, 0.34, -0.25);
  group.add(tail);

  // ---- Bras ----
  const arms = {};
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.19, 0.58, 0.02);
    const right = s > 0;
    // Gauche : poing sur la hanche. Droit : avant-bras leve, carotte au poing.
    const pts = right
      ? [[-0.09, 0.02, 0], [0.07, -0.07, 0.03], [0.14, -0.1, 0.09], [0.19, -0.05, 0.15]]
      : [[0.09, 0.02, 0], [-0.08, -0.07, 0.0], [-0.13, -0.16, 0.03], [-0.09, -0.23, 0.09]];
    arm.add(tubeAlong(pts, t => 0.052 + 0.012 * t, fur, { steps: 18, segs: 12 }));
    const hand = pts[pts.length - 1];
    arm.add(mesh(new THREE.SphereGeometry(0.068, 14, 10), fur, hand, [1, 0.95, 1]));
    if (right) {
      const c = new THREE.Group();
      const L = royal ? 0.56 : 0.4, R = royal ? 0.075 : 0.058;
      const cb = loft([
        [0, R * 0.45], [L * 0.07, R * 0.92], [L * 0.22, R], [L * 0.55, R * 0.72], [L * 0.85, R * 0.34], [L, 0.004],
      ], carrot, { segs: 14, sub: 5 });
      c.add(cb);
      // Stries de la carotte.
      for (const [k, a] of [[0.2, 0.3], [0.38, 2.2], [0.55, 4.1], [0.7, 1.0]]) {
        const rr = R * (1 - 0.75 * Math.max(0, k - 0.2)) * 1.0;
        const st = line([[Math.cos(a) * rr, L * k, Math.sin(a) * rr], [Math.cos(a + 0.5) * rr * 1.02, L * k - 0.004, Math.sin(a + 0.5) * rr * 1.02], [Math.cos(a + 1.0) * rr, L * k, Math.sin(a + 1.0) * rr]], 0.006, M(0xc85a10, { r: 0.7 }));
        c.add(st);
      }
      // Fanes.
      for (let i = 0; i < 3; i++) {
        const f = feather(royal ? 0.2 : 0.16, 0.04, leaf, { thick: 0.016, bend: 0.25, ws: 12, hs: 12 });
        f.rotation.set(Math.PI + 0.35, i * 2.1, 0, 'YXZ');
        f.position.y = 0.01;
        c.add(f);
      }
      c.position.set(hand[0], hand[1] - 0.02, hand[2] - 0.0);
      c.rotation.set(0.35, 0, -0.45);
      c.translateY(-0.07);
      arm.add(c);
    }
    group.add(arm);
    arms[s] = arm;
  }

  // ---- Tete ----
  const head = new THREE.Group();
  head.position.set(0, 0.6, 0);
  const HY = 0.275, HZ = 0.02;
  const skull = sculptSphere((d, out) => {
    const low = Math.max(0, -d.y);
    let x = d.x * 0.27, y = d.y * (d.y > 0 ? 0.25 : 0.24), z = d.z * 0.245;
    // Bajoues touffues qui pointent vers le bas et l exterieur.
    const ck = gauss(Math.abs(d.x) - 0.78, 0.3) * gauss(d.y + 0.42, 0.3) * smooth(-0.5, 0.2, d.z);
    x += Math.sign(d.x) * 0.06 * ck; y -= 0.03 * ck;
    // Petit museau.
    const mz = gauss(d.x, 0.42) * gauss(d.y + 0.3, 0.3) * Math.max(0, d.z);
    z += 0.035 * mz;
    // Crane un peu resserre en haut.
    x *= 1 - 0.1 * Math.max(0, d.y) + 0.04 * low;
    out.set(x, y, z);
  }, fur, 44, 32);
  skull.position.set(0, HY, HZ);
  head.add(skull);
  const eyes = addEyes(head, { x: 0, y: HY + 0.035, z: HZ + 0.205, size: 0.082, spacing: 0.25, turn: 0.34, iris: royal ? 0xe8322a : 0xd8403a, lid: royal ? 0xd9d0bf : 0xc3c4d2, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Nez rose + rictus en coin.
  const nz = blob(0.036, 0.024, 0.02, nose, (d, out) => { out.x *= 1 - 0.5 * Math.max(0, -d.y); }, 14, 10);
  nz.position.set(0, HY - 0.075, HZ + 0.272);
  head.add(decal(nz));
  const my = HY - 0.105, mz0 = HZ + 0.268;
  head.add(line([[0, my + 0.012, mz0 + 0.008], [0, my - 0.012, mz0 + 0.006]], 0.0075, dark));
  head.add(line([[0, my - 0.012, mz0 + 0.006], [-0.03, my - 0.03, mz0], [-0.07, my - 0.022, mz0 - 0.02], [-0.095, my - 0.0, mz0 - 0.042]], 0.0075, dark));
  head.add(line([[0, my - 0.012, mz0 + 0.006], [0.03, my - 0.03, mz0], [0.075, my - 0.03, mz0 - 0.02], [0.115, my - 0.045, mz0 - 0.055]], 0.0075, dark));
  for (const s of [-1, 1]) {
    head.add(decal(mesh(new THREE.SphereGeometry(0.05, 14, 10), cheekMat, [s * 0.185, HY - 0.085, HZ + 0.165], [1.2, 0.7, 0.3], [0, s * 0.75, 0])));
  }
  // Longues oreilles (interieur rose peint) ; la gauche est cassee.
  const pinkR = ratio(furHex, 0xf29ab2);
  for (const s of [-1, 1]) {
    const flop = s < 0;
    const len = 0.46, wd = 0.088;
    const ear = sculptSphere((d, out) => {
      const t = (d.y + 1) / 2;
      const prof = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.7);
      const base = Math.max(prof, 0.55 * (1 - t));
      let y = t * len, z = d.z * 0.03 * (0.4 + 0.6 * base);
      // Pliure : le dernier tiers bascule vers l avant.
      if (flop) {
        const k = smooth(0.58, 0.72, t);
        const yy = y - len * 0.64;
        const a = 1.9 * k;
        if (yy > 0) { const zz = z; z = zz * Math.cos(a) + yy * Math.sin(a); y = len * 0.64 + yy * Math.cos(a) - zz * Math.sin(a); }
      }
      out.set(d.x * wd * base, y, z);
    }, furEar, 28, 30);
    const fold = len * 0.64;
    paint(ear, [[pinkR, (p, n) => {
      const along = flop && p.z > 0.03 ? 0 : smooth(0.05, 0.14, p.y) * smooth(flop ? fold + 0.02 : len - 0.04, flop ? fold - 0.06 : len - 0.12, p.y);
      return smooth(0.1, 0.5, n.z) * smooth(0.066, 0.04, Math.abs(p.x)) * along;
    }]]);
    ear.position.set(s * 0.115, HY + 0.2, HZ - 0.04);
    ear.rotation.set(-0.14, s * 0.25, -s * 0.2);
    head.add(ear);
  }
  group.add(head);

  if (royal) {
    // Cape rouge qui enveloppe le dos, col d hermine, couronne.
    const cape = loft([
      [0.04, 0.33, 0.13, 0, -0.25],
      [0.2, 0.315, 0.15, 0, -0.2],
      [0.4, 0.28, 0.17, 0, -0.14],
      [0.56, 0.21, 0.15, 0, -0.08],
      [0.66, 0.13, 0.1, 0, -0.04],
    ], M(0xb0202a, { r: 0.8 }), { segs: 28, sub: 5 });
    group.add(cape);
    const hem = woolBlob(0.2, M(0xffffff, { r: 0.95 }), { lobes: 14, amp: 0.2, scale: [1.02, 0.34, 0.95], seed: 9, shade: 0.16, ws: 44, hs: 24 });
    hem.position.set(0, 0.645, -0.005);
    group.add(hem);
    const c = crown(0.15, 0.13, { points: 5, flare: 0.25, valley: 0.45, cap: 0x8a1a2a });
    c.position.set(0, HY + 0.2, HZ + 0.0);
    c.rotation.x = 0.06;
    head.add(c);
  }

  group.userData.rig = { legL: legs[-1], legR: legs[1], armL: arms[-1], armR: arms[1], head };
  return group;
}

export function buildWaWabbit() {
  const group = new THREE.Group();
  const body = buildWabbit({ royal: true });
  body.scale.setScalar(1.45);
  group.add(body);
  group.userData.rig = body.userData.rig;
  return group;
}
