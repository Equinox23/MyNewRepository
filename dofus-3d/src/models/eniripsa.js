import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong,
  faceEyes, faceBrows, faceSmile, faceNose, hairShell, hairSpike,
} from './humanoid.js';
import { makeAt, patch, ellipse, detail, heart } from './heroKitB.js';

// Eniripsa : fee soigneuse. Silhouette fine, robe rose a jupe en corolle
// sur un jupon blanc, col et manches ballon blancs, coeur dore sur la
// poitrine, collants clairs et bottines roses. Carre de cheveux roses aux
// pointes relevees, grands yeux bleus, joues roses, sourire doux. Deux
// paires de petites ailes translucides et baguette a coeur.
export function buildEniripsa() {
  const skin = M(0xf9dcc4, { r: 0.8 });
  const skinShade = M(0xeab59a, { r: 0.8 });
  const hair = M(0xff6fae, { r: 0.7 });
  const hairDk = M(0xc8387c, { r: 0.7 });
  const white = M(0xfff6f8, { r: 0.8 });
  const pink = M(0xf0569a, { r: 0.7 });
  const pinkDk = M(0xb82e6c, { r: 0.75 });
  const gold = M(0xf6c944, { r: 0.35, m: 0.5 });
  const tights = M(0xfbdbe4, { r: 0.8 });
  const blush = M(0xf9a0ac, { r: 0.8 });
  const dark = M(0x7a2a48, { r: 0.6 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xd2f4ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.2,
    emissive: 0x58b8e0, emissiveIntensity: 0.3, depthWrite: false,
  });
  const wingEdge = M(0x9fdcf2, { r: 0.4 });

  const b = 0.82;
  const H = buildHero({
    skin, top: pink, bottom: tights, boots: pink, gloves: skin, bootCuff: white, arm: skin,
    build: b, headR: 0.215, headShape: { taper: 0.46, chin: 0.06 },
  });
  const { group, head, headR: hr, at } = H;
  group.userData.restyled = true;

  // ---- Robe : jupe en corolle sur jupon blanc, ceinture, col ----
  group.add(loft([[0.725, 0.092, 0.074], [0.7, 0.118, 0.096], [0.62, 0.172, 0.15], [0.52, 0.225, 0.2], [0.47, 0.243, 0.218], [0.462, 0.19, 0.17]], pink, { segs: 26, sub: 5 }));
  group.add(loft([[0.5, 0.215, 0.19], [0.455, 0.25, 0.225], [0.428, 0.26, 0.235], [0.42, 0.2, 0.18]], white, { segs: 26, sub: 3 }));
  group.add(loft([[0.695, 0.095, 0.078], [0.703, 0.117, 0.097], [0.735, 0.113, 0.093], [0.743, 0.092, 0.075]], pinkDk, { segs: 20, sub: 3 }));
  group.add(loft([[1.0, 0.118, 0.09], [1.022, 0.142, 0.106], [1.05, 0.104, 0.084], [1.07, 0.066, 0.062]], white, { segs: 20, sub: 3 }));
  const brooch = heart(0.058, 0.012, gold);
  brooch.position.set(0, 0.945, 0.108);
  brooch.rotation.x = -0.12;
  group.add(brooch);
  // Noeud dans le dos.
  for (const s of [-1, 1]) {
    const loop = sculptSphere((d, out) => { out.set(d.x * 0.07 * (0.55 + 0.45 * Math.abs(d.x)), d.y * 0.045 * (0.4 + 0.6 * Math.abs(d.x)), d.z * 0.022); }, pinkDk, 14, 10);
    loop.position.set(s * 0.06, 0.725, -0.1);
    loop.rotation.set(0, 0, s * 0.3);
    group.add(loop);
  }
  // Manches ballon.
  for (const [arm, s] of [[H.armL, -1], [H.armR, 1]]) {
    const puff = sculptSphere((d, out) => {
      out.set(d.x * 0.078, d.y * (d.y < 0 ? 0.07 : 0.062), d.z * 0.08);
    }, white, 18, 14);
    puff.position.set(s * 0.004, -0.02, 0);
    arm.add(puff);
  }

  // ---- Ailes de fee (deux paires) ----
  for (const s of [-1, 1]) {
    const side = new THREE.Group();
    side.scale.x = s;
    side.position.set(s * 0.035, 0.94, -0.105);
    for (const [k, rz, ry] of [[1.12, 0.72, 0.42], [0.72, -0.25, 0.55]]) {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.bezierCurveTo(0.1 * k, 0.2 * k, 0.4 * k, 0.26 * k, 0.5 * k, 0.1 * k);
      sh.bezierCurveTo(0.54 * k, -0.02 * k, 0.3 * k, -0.1 * k, 0, 0);
      const w = new THREE.Group();
      const wm = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), wingMat);
      wm.userData.noOutline = true;
      w.add(wm);
      const pts = sh.getPoints(14).map(p => [p.x, p.y, 0]);
      w.add(detail(tubeAlong(pts, () => 0.0055, wingEdge, { steps: 40, segs: 5 })));
      w.add(detail(tubeAlong([[0, 0, 0], [0.22 * k, 0.07 * k, 0], [0.42 * k, 0.08 * k, 0]], t => 0.004 * (1 - 0.6 * t), wingEdge, { steps: 10, segs: 5 })));
      w.rotation.set(0, ry, rz);
      side.add(w);
    }
    group.add(side);
  }

  // ---- Visage ----
  for (const s of [-1, 1]) {
    head.add(patch(at, ellipse(s * hr * 0.6, hr * 0.5, hr * 0.13, hr * 0.075, 0, 14), blush, { lift: hr * 0.01, rings: 2 }));
  }
  faceEyes(head, hr, at, { x: 0.4, y: 0.76, size: 0.25, tall: 1.28, iris: 0x3a8ee8, lash: 0x6a2444 });
  faceBrows(head, hr, at, hairDk, { y: 1.16, rise: -0.04, thick: 0.03, inner: 0.2, outer: 0.62 });
  faceNose(head, hr, at, skinShade, { y: 0.48 });
  faceSmile(head, hr, at, dark, { y: 0.26, width: 0.17, curve: 0.08, thick: 0.024 });

  // ---- Carre rose : coque, meches relevees, frange ----
  hairShell(head, hr, hair, { volume: 0.17, front: 0.54, nape: -0.82 });
  const lock = (parent, dir, len, r, sweep, flat) => parent.add(hairSpike(head, hr, hair, dir, len, r, sweep, { flat }));
  const cyH = hr * 0.88;
  const strandOf = (pts, r) => head.add(tubeAlong(pts, t => r * (0.55 + 0.6 * Math.sin(Math.PI * Math.min(1, t * 1.5))) * Math.pow(1 - t, 0.8), hair, { steps: 18, segs: 10 }));
  // Meches qui encadrent le visage.
  for (const s of [-1, 1]) {
    strandOf([[s * hr * 0.78, cyH + hr * 0.42, hr * 0.5], [s * hr * 0.97, cyH - hr * 0.1, hr * 0.42], [s * hr * 0.98, cyH - hr * 0.6, hr * 0.36], [s * hr * 1.12, cyH - hr * 0.92, hr * 0.34]], hr * 0.3);
  }
  // Pointes du carre, relevees vers l exterieur (restent sous une coiffe).
  for (const deg of [-114, -62, 62, 114]) {
    const a = deg * Math.PI / 180, sx = Math.sin(a), sz = -Math.cos(a);
    const P = (rad, y) => [sx * hr * rad, cyH + hr * y, sz * hr * rad * 1.05];
    strandOf([P(0.78, -0.05), P(0.98, -0.45), P(1.08, -0.8), P(1.3, -1.02)], hr * 0.36);
  }
  const top = new THREE.Group();
  top.name = 'classHat'; // masque quand une coiffe est equipee
  head.add(top);
  // Frange balayee + epi.
  lock(top, [-0.42, 0.66, 0.7], 0.16, 0.075, [-0.55, -1, 0.1]);
  lock(top, [0.0, 0.72, 0.74], 0.17, 0.08, [-0.5, -1, 0.15]);
  lock(top, [0.4, 0.68, 0.7], 0.15, 0.07, [0.6, -1, 0.1]);
  lock(top, [0.1, 1, 0.1], 0.11, 0.04, [0.6, -0.2, 0.7]);
  // Barrette coeur.
  const pin = heart(hr * 0.26, hr * 0.06, gold);
  pin.position.set(hr * 0.74, hr * 1.5, hr * 0.62);
  pin.rotation.set(-0.3, 0.75, -0.3);
  top.add(pin);

  // ---- Baguette a coeur (main droite) ----
  const wand = new THREE.Group();
  wand.add(loft([[-0.09, 0.012], [-0.08, 0.017], [0.2, 0.012], [0.4, 0.011]], gold, { segs: 10, sub: 2 }));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), gold);
  knob.position.y = -0.095;
  wand.add(knob);
  const hTop = heart(0.15, 0.04, pink);
  hTop.position.y = 0.46;
  wand.add(hTop);
  const gem = detail(heart(0.065, 0.05, white));
  gem.position.set(0, 0.465, 0);
  wand.add(gem);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffc0e0, transparent: true, opacity: 0.22, depthWrite: false }));
  glow.position.y = 0.46;
  glow.userData.noOutline = true;
  wand.add(glow);
  wand.position.set(0.0, -0.05, 0.02);
  wand.rotation.set(0.7, -0.5, -0.5);
  H.handR.add(wand);

  return group;
}
