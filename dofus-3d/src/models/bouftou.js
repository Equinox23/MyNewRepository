import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere, woolBlob, curledHorn, tubeAlong } from './kit.js';

// Bouftou : mouton-belier trapu. Une seule grosse toison a lobes bombes
// (pas un tas de boules), tete brune au museau court et clair (truffe,
// petite bouche fermee, pas de dents), grands yeux boudeurs, cornes de
// belier annelees enroulees autour des oreilles tombantes, pattes fines
// a sabots et pompon de queue.
// `opts.royal` : variante Royal (laine creme a reflets dores, plus grosses
// cornes) utilisee par bouftouRoyal.js.
// Les quatre pattes restent des enfants directs du groupe (Rig.js les
// retrouve par leur position pour la marche).
export function buildBouftou(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const wool = M(royal ? 0xfbf0d4 : 0xfbf7ee, { r: 0.95 });
  const face = M(royal ? 0x57301a : 0x744426, { r: 0.8 });
  const muzzle = M(royal ? 0x8a5a36 : 0xa87650, { r: 0.8 });
  const legMat = M(royal ? 0x4a2814 : 0x5e351c, { r: 0.8 });
  const hornMat = M(royal ? 0xeebc52 : 0xe9d3a4, { r: 0.5 });
  const hoof = M(0x2a1608, { r: 0.6 });
  const dark = M(0x2a120a, { r: 0.5 });
  const earIn = M(0xd98a80, { r: 0.8 });
  const cheekMat = M(0xe88a80, { r: 0.8 });

  // ---- Pattes fuselees + sabots ----
  for (const [x, z] of [[-0.2, 0.19], [0.2, 0.19], [-0.19, -0.23], [0.19, -0.23]]) {
    const leg = new THREE.Group();
    const back = z < 0;
    leg.add(loft([
      [0.36, 0.085, 0.09, 0, back ? 0.01 : 0],
      [0.25, 0.066, 0.07, 0, back ? -0.012 : 0.004],
      [0.15, 0.048, 0.05, 0, back ? -0.004 : 0],
      [0.07, 0.052, 0.056, 0, 0.006],
    ], legMat, { segs: 14, sub: 4 }));
    leg.add(loft([
      [0.085, 0.05, 0.054, 0, 0.004],
      [0.06, 0.064, 0.07, 0, 0.012],
      [0.005, 0.07, 0.08, 0, 0.018],
      [0.0, 0.05, 0.06, 0, 0.018],
    ], hoof, { segs: 14, sub: 3 }));
    leg.position.set(x, 0, z);
    group.add(leg);
  }

  // ---- Toison : un seul volume a gros lobes ----
  const bodyY = 0.6;
  const body = woolBlob(0.43, wool, { lobes: 22, amp: 0.34, scale: [1.04, 0.93, 1.1], seed: 11, shade: 0.36 });
  body.position.set(0, bodyY, -0.07);
  group.add(body);
  // Pompon de queue.
  const tail = woolBlob(0.105, wool, { lobes: 6, amp: 0.26, seed: 5, shade: 0.18, ws: 28, hs: 20 });
  tail.position.set(0, 0.66, -0.53);
  group.add(tail);

  // ---- Tete : front large, museau court qui avance ----
  const head = new THREE.Group();
  head.position.set(0, 0.56, 0.45);
  head.scale.setScalar(1.18);
  const skull = sculptSphere((d, out) => {
    const low = Math.max(0, -d.y + 0.15);
    let x = d.x * 0.235 * (1 - 0.3 * low);
    let y = d.y * (d.y > 0 ? 0.2 : 0.215);
    let z = d.z * 0.19;
    if (d.z > 0) {
      // Museau : renflement bas-avant.
      const k = Math.exp(-Math.pow((d.y + 0.38) / 0.42, 2)) * Math.exp(-Math.pow(d.x / 0.62, 2));
      z += 0.085 * k * d.z;
      y -= 0.012 * k;
    }
    out.set(x, y, z);
  }, face, 36, 26);
  head.add(skull);
  // Bout du museau plus clair (meme volume, un peu gonfle).
  const tip = sculptSphere((d, out) => {
    out.set(d.x * 0.125, d.y * 0.085, d.z * 0.075);
  }, muzzle, 24, 16);
  tip.position.set(0, -0.085, 0.205);
  tip.userData.noOutline = true;
  head.add(tip);
  // Truffe en coeur + sillon + petite bouche fermee en "w".
  const nose = sculptSphere((d, out) => {
    const w = 0.046 * (1 - 0.45 * Math.max(0, -d.y));
    out.set(d.x * w, d.y * 0.026 - Math.abs(d.x) * -0.006, d.z * 0.022);
  }, dark, 16, 12);
  nose.position.set(0, -0.045, 0.268);
  nose.userData.noOutline = true;
  head.add(nose);
  const line = (pts, r = 0.0075) => {
    const t = tubeAlong(pts, () => r, dark, { steps: 14, segs: 6 });
    t.userData.noOutline = true;
    t.castShadow = false;
    return t;
  };
  head.add(line([[0, -0.065, 0.281], [0, -0.09, 0.283], [0, -0.108, 0.279]]));
  for (const s of [-1, 1]) {
    head.add(line([[0, -0.108, 0.279], [s * 0.025, -0.124, 0.274], [s * 0.055, -0.118, 0.262], [s * 0.075, -0.1, 0.245]]));
  }
  // Joues roses discretes.
  for (const s of [-1, 1]) {
    const ch = mesh(new THREE.SphereGeometry(0.036, 12, 8), cheekMat, [s * 0.155, -0.075, 0.172], [1.25, 0.7, 0.35], [0, s * 0.7, 0]);
    ch.userData.noOutline = true;
    ch.castShadow = false;
    head.add(ch);
  }
  // Grands yeux expressifs, paupiere boudeuse.
  const eyes = addEyes(head, { x: 0, y: 0.06, z: 0.185, size: 0.078, spacing: 0.215, turn: 0.3, lid: royal ? 0x57301a : 0x744426, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Oreilles tombantes (feuille, interieur rose).
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    const outer = sculptSphere((d, out) => {
      const t = (d.y + 1) / 2; // 0 = pointe, 1 = attache
      out.set(d.x * 0.06 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0, d.y * 0.105, d.z * 0.026);
    }, face, 16, 14);
    ear.add(outer);
    const inner = mesh(new THREE.SphereGeometry(0.04, 10, 8), earIn, [0, -0.01, 0.018], [0.85, 1.6, 0.25]);
    inner.userData.noOutline = true;
    inner.castShadow = false;
    ear.add(inner);
    ear.position.set(s * 0.275, 0.0, 0.03);
    ear.rotation.set(0.15, s * 0.5, s * 1.15);
    head.add(ear);
  }
  group.add(head);

  // ---- Toupet de laine sur le front ----
  const tuft = woolBlob(0.2, wool, { lobes: 8, amp: 0.34, scale: [1.25, 0.8, 0.95], seed: 3, shade: 0.2, ws: 40, hs: 28 });
  tuft.position.set(0, 0.89, 0.37);
  group.add(tuft);

  // ---- Cornes de belier enroulees ----
  for (const side of [-1, 1]) {
    const horn = curledHorn(side, hornMat, { radius: royal ? 0.098 : 0.084, curl: royal ? 0.185 : 0.16, turns: 0.88, out: 0.15 });
    horn.position.set(side * 0.2, 0.95, 0.4);
    horn.rotation.set(0, -side * 1.05, 0);
    group.add(horn);
  }

  return group;
}
