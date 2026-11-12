import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong, roundBox,
  faceEyes, faceBrows, faceSmile, hairSpike,
} from './humanoid.js';
import { makeAt, patch, ellipse, line, detail } from './heroKitB.js';

// Ecaflip : chat joueur et flambeur. Pelage roux, vraie tete feline
// (museau creme, truffe rose, moustaches, joues touffues, grandes oreilles
// pointues), regard vert narquois et sourire en coin avec un croc. Gilet
// rouge ouvert sur le poitrail creme, lisere et ceinture dores, pantalon
// bleu nuit retrousse sur des pattes nues, longue queue annelee. Eventail
// de cartes dans la main droite, de dans la gauche.
export function buildEcaflip() {
  const fur = M(0xe8893a, { r: 0.9 });
  const furDk = M(0xa8521c, { r: 0.9 });
  const cream = M(0xf8e6c4, { r: 0.85 });
  const vest = M(0xc22a2a, { r: 0.6 });
  const vestDk = M(0x7c1620, { r: 0.75 });
  const pants = M(0x2c3052, { r: 0.85 });
  const gold = M(0xf2c030, { r: 0.35, m: 0.5 });
  const pink = M(0xf08a9c, { r: 0.7 });
  const noseM = M(0xd9607a, { r: 0.5 });
  const dark = M(0x4a2014, { r: 0.6 });
  const white = M(0xfbf6ea, { r: 0.6 });
  const ink = M(0x26222c, { r: 0.6 });
  const pipRed = M(0xd0302a, { r: 0.5 });

  const H = buildHero({
    skin: fur, top: vest, bottom: pants, boots: fur, gloves: fur, bootCuff: pants, arm: fur,
    build: 0.96, headR: 0.222, ears: false, headShape: { taper: 0.3, chin: 0.02, wide: 1.1 },
  });
  const { group, head, headR: hr } = H;
  group.userData.restyled = true;

  // ---- Gilet : poitrail creme dans l echancrure, lisere dore, basque ----
  const atT = makeAt([H.torso]);
  group.add(patch(atT, [
    [-0.082, 1.035], [-0.062, 0.97], [-0.034, 0.9], [0, 0.845], [0.034, 0.9], [0.062, 0.97], [0.082, 1.035], [0, 1.05],
  ], cream, { lift: 0.006, center: [0, 0.97] }));
  for (const s of [-1, 1]) {
    group.add(line(atT, [[s * 0.088, 1.04], [s * 0.066, 0.97], [s * 0.036, 0.9], [0, 0.838]], t => 0.011, gold, { lift: 0.01 }));
  }
  for (const y of [0.8, 0.745]) {
    const bt = detail(new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), gold));
    bt.position.copy(atT(0, y, 0.006));
    group.add(bt);
  }
  group.add(loft([[0.725, 0.105, 0.085], [0.705, 0.138, 0.108], [0.64, 0.158, 0.122], [0.6, 0.164, 0.126], [0.592, 0.12, 0.09]], vest, { segs: 22, sub: 4 }));
  group.add(loft([[0.612, 0.155, 0.118], [0.604, 0.172, 0.133], [0.584, 0.173, 0.134], [0.576, 0.13, 0.1]], gold, { segs: 22, sub: 3 }));
  // Echarpe-ceinture sombre.
  group.add(loft([[0.69, 0.11, 0.09], [0.7, 0.139, 0.112], [0.735, 0.137, 0.11], [0.745, 0.11, 0.09]], vestDk, { segs: 20, sub: 3 }));

  // ---- Queue annelee en S (bout creme) ----
  const tailPts = [[0, 0.57, -0.08], [0.03, 0.5, -0.24], [0.0, 0.56, -0.4], [-0.07, 0.78, -0.47], [-0.1, 0.99, -0.4], [-0.04, 1.1, -0.3]];
  group.add(tubeAlong(tailPts, t => 0.03 + 0.016 * Math.sin(Math.PI * Math.min(1, t * 1.2)) + 0.012 * t, M(0xe8893a, { r: 0.9 }), {
    steps: 48, segs: 12,
    shade: t => (t > 0.12 && Math.sin(t * Math.PI * 11) > 0.35 ? 0.66 : 1),
  }));
  const tip = sculptSphere((d, out) => { out.set(d.x * 0.046, d.y * 0.06, d.z * 0.046); }, cream, 14, 10);
  tip.position.set(-0.035, 1.105, -0.292);
  tip.rotation.set(-0.7, 0, -0.4);
  group.add(tip);

  // ---- Tete feline ----
  const cy = hr * 0.88;
  // Museau : deux babines bombees + menton, d une seule piece.
  const muzzle = sculptSphere((d, out) => {
    const lobe = 1 + 0.16 * Math.exp(-Math.pow((Math.abs(d.x) - 0.5) / 0.32, 2)) * (d.y < 0.3 ? 1 : 0.6);
    const k = d.y < 0 ? 1 - 0.25 * d.y * d.y : 1;
    out.set(d.x * hr * 0.5 * k, d.y * hr * 0.3 * lobe, d.z * hr * 0.34 * lobe);
  }, cream, 28, 20);
  muzzle.position.set(0, hr * 0.44, hr * 0.7);
  head.add(muzzle);
  const at = makeAt([H.skull, muzzle]);

  // Joues touffues (deux pointes de pelage par cote).
  for (const s of [-1, 1]) {
    for (const [y0, y1, len, r] of [[0.52, 0.5, 0.5, 0.2], [0.3, 0.12, 0.42, 0.17]]) {
      head.add(tubeAlong([
        [s * hr * 0.72, hr * y0, hr * 0.3], [s * hr * 0.95, hr * (y0 * 0.7 + y1 * 0.3), hr * 0.26],
        [s * hr * (0.95 + len), hr * y1, hr * 0.1],
      ], t => hr * r * Math.pow(1 - t, 0.8), fur, { steps: 12, segs: 10, flat: 0.7 }));
    }
  }

  // Truffe en triangle arrondi + trait du museau.
  const nose = detail(sculptSphere((d, out) => {
    const w = 0.55 + 0.45 * Math.max(0, d.y + 0.4);
    out.set(d.x * hr * 0.105 * w, d.y * hr * 0.062, d.z * hr * 0.06);
  }, noseM, 14, 10));
  nose.position.copy(at(0, hr * 0.56, -hr * 0.012));
  head.add(nose);
  head.add(line(at, [[0, hr * 0.5], [0, hr * 0.4]], t => hr * 0.014, dark, { lift: hr * 0.012, steps: 4 }));
  faceSmile(head, hr, at, dark, { y: 0.37, width: 0.3, curve: 0.1, tilt: 0.07, x: 0.02, thick: 0.026 });
  // Petit croc du cote du sourire.
  const fang = detail(new THREE.Mesh(new THREE.ConeGeometry(hr * 0.03, hr * 0.085, 6), white));
  fang.position.copy(at(hr * 0.2, hr * 0.37, hr * 0.012));
  fang.rotation.x = Math.PI;
  head.add(fang);
  // Moustaches.
  for (const s of [-1, 1]) {
    for (const [dy, a] of [[0.06, 0.16], [-0.02, -0.02], [-0.1, -0.22]]) {
      const p = at(s * hr * 0.36, hr * (0.42 + dy), 0);
      head.add(detail(tubeAlong([
        p, [p.x + s * hr * 0.4, p.y + a * hr * 0.4, p.z - hr * 0.06], [p.x + s * hr * 0.78, p.y + a * hr * 0.95 - hr * 0.04, p.z - hr * 0.22],
      ], t => 0.0042 * (1 - 0.7 * t), white, { steps: 8, segs: 5 })));
    }
  }

  // Yeux verts fendus, sourcils narquois.
  const eyes = faceEyes(head, hr, at, { x: 0.42, y: 0.86, size: 0.23, tall: 1.1, iris: 0x3fc46a, lash: 0x4a2014, tilt: 0.2 });
  for (const e of eyes) { e.children[2].scale.x *= 0.5; e.children[2].scale.y *= 1.25; }
  faceBrows(head, hr, at, furDk, { y: 1.2, rise: 0.16, thick: 0.045 });
  // Rayures du front et des tempes.
  const stripe = (x0, y0, x1, y1, r) => head.add(line(at, [[x0 * hr, y0 * hr], [(x0 + x1) / 2 * hr, (y0 + y1) / 2 * hr], [x1 * hr, y1 * hr]], t => hr * r * (1 - 0.8 * t), furDk, { lift: hr * 0.01, flat: 0.5 }));
  stripe(0, 1.72, 0, 1.36, 0.05);
  stripe(-0.26, 1.68, -0.2, 1.42, 0.042);
  stripe(0.26, 1.68, 0.2, 1.42, 0.042);

  // Grandes oreilles pointues (pavillon rose).
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.add(loft([
      [-0.1 * hr, 0.4 * hr, 0.17 * hr], [0.2 * hr, 0.37 * hr, 0.14 * hr, s * 0.02 * hr], [0.55 * hr, 0.22 * hr, 0.09 * hr, s * 0.07 * hr],
      [0.82 * hr, 0.07 * hr, 0.04 * hr, s * 0.12 * hr], [0.95 * hr, 0.005, 0.005, s * 0.15 * hr],
    ], fur, { segs: 16, sub: 4 }));
    ear.add(detail(loft([
      [0.02 * hr, 0.24 * hr, 0.05 * hr, 0, 0.1 * hr], [0.22 * hr, 0.24 * hr, 0.05 * hr, s * 0.025 * hr, 0.085 * hr], [0.5 * hr, 0.13 * hr, 0.04 * hr, s * 0.065 * hr, 0.05 * hr],
      [0.72 * hr, 0.03 * hr, 0.02 * hr, s * 0.1 * hr, 0.03 * hr],
    ], pink, { segs: 12, sub: 4 })));
    ear.position.set(s * hr * 0.6, cy + hr * 0.58, -hr * 0.08);
    ear.rotation.set(-0.08, s * 0.25, -s * 0.42);
    head.add(ear);
  }

  // Touffe rebelle entre les oreilles (masquee sous une coiffe).
  const tuft = new THREE.Group();
  tuft.name = 'classHat';
  head.add(tuft);
  tuft.add(hairSpike(head, hr, fur, [0, 1, 0.25], 0.17, 0.075, [0.25, -0.1, 0.8]));
  tuft.add(hairSpike(head, hr, fur, [-0.2, 1, 0.1], 0.13, 0.06, [-0.5, 0, 0.5]));
  tuft.add(hairSpike(head, hr, fur, [0.1, 1, -0.2], 0.14, 0.065, [0.2, 0.1, -0.9]));

  // ---- Eventail de cartes (main droite) ----
  const fan = new THREE.Group();
  [-1, 0, 1].forEach((k, i) => {
    const c = new THREE.Group();
    const card = roundBox(0.105, 0.155, 0.007, 0.003, white);
    card.position.y = 0.115;
    c.add(card);
    const pip = detail(new THREE.Mesh(new THREE.OctahedronGeometry(0.024), i === 1 ? ink : pipRed));
    pip.scale.set(1, 1.3, 0.12);
    pip.position.set(0, 0.115, 0.005);
    c.add(pip);
    c.rotation.z = -k * 0.42;
    c.position.z = k * 0.006;
    fan.add(c);
  });
  fan.position.set(0.01, -0.05, 0.035);
  fan.rotation.set(0.55, -0.35, -0.3);
  H.handR.add(fan);

  // ---- De (main gauche) ----
  const die = new THREE.Group();
  die.add(roundBox(0.074, 0.074, 0.074, 0.016, white));
  const pipAt = (x, y, z) => {
    const p = detail(new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 6), ink));
    p.position.set(x, y, z);
    die.add(p);
  };
  const o = 0.036, q = 0.018;
  for (const [a, b] of [[0, 0], [-q, -q], [q, q], [-q, q], [q, -q]]) pipAt(a, b, o);
  for (const [a, b] of [[0, 0], [-q, -q], [q, q]]) pipAt(a, o, b);
  for (const [a, b] of [[-q, -q], [q, q]]) { pipAt(o, a, b); pipAt(-o, a, b); }
  die.position.set(-0.005, 0.012, 0.07);
  die.rotation.set(0.5, 0.6, 0.2);
  H.handL.add(die);

  return group;
}
