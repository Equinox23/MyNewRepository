import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong, roundBox,
  faceEyes, faceBrows, faceSmile, faceNose, hairShell, hairSpike,
} from './humanoid.js';
import { band, surfaceOf, headBand, openSkirt, torsoPath, torsoRadius, detail } from './heroKitA.js';

// Roublard : artificier malicieux. Long manteau sombre a col releve et
// pans fendus, foulard rouge noue au cou, bandeau rouge dont les pans
// volent derriere la tete, meches noires en pointe, bandouliere chargee
// de bombes, tromblon dans la main droite, bombe allumee dans la gauche.
export function buildRoublard() {
  const skin = M(0xf2c9a2, { r: 0.8 });
  const skinShade = M(0xdca882, { r: 0.8 });
  const coat = M(0x47476a, { r: 0.8 });
  const coatLt = M(0x6c6c92, { r: 0.8 });
  const pants = M(0x4a3a34, { r: 0.85 });
  const leather = M(0x5a3418, { r: 0.85 });
  const leatherDk = M(0x3a2212, { r: 0.85 });
  const red = M(0xd2362c, { r: 0.7 });
  const redDk = M(0x96201a, { r: 0.75 });
  const gold = M(0xf0c444, { r: 0.35, m: 0.5 });
  const steel = M(0xaab4c0, { r: 0.35, m: 0.75 });
  const hair = M(0x2c2a3c, { r: 0.7 });
  const bomb = M(0x34343f, { r: 0.5, m: 0.2 });
  const dark = M(0x3a1612, { r: 0.6 });

  const H = buildHero({
    skin, top: coat, bottom: pants, boots: leather, gloves: leatherDk, arm: coat,
    bootCuff: redDk, bracer: coatLt, build: 0.95, headR: 0.215,
  });
  const { group, head, headR: hr, at } = H;
  group.userData.restyled = true; // proportions deja finales
  const R = torsoRadius(H);

  // ---- Manteau : pans longs ouverts devant ----
  const tails = openSkirt([[0.71, 0.128, 0.096], [0.62, 0.172, 0.13], [0.48, 0.205, 0.16], [0.33, 0.232, 0.186]], coat,
    { gap: 1.15, wave: 0.035, waves: 4, flare: 0.1 });
  group.add(tails);
  // Revers clairs en V sur la poitrine.
  for (const s of [-1, 1]) {
    group.add(band((t) => {
      const y = 1.03 - t * 0.31;
      const x = s * (0.085 - 0.06 * t);
      const [rx, rz] = R(y);
      const z = rz * Math.sqrt(Math.max(0.05, 1 - (x / rx) * (x / rx))) + 0.006;
      return { p: new THREE.Vector3(x, y, z), n: new THREE.Vector3(s * 0.25, 0.1, 1).normalize(), w: 0.036 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)) + 0.003, th: 0.009 };
    }, coatLt, { steps: 16, segs: 8, sq: 0.5 }));
  }
  // Col releve derriere la nuque, pointes vers l avant.
  group.add(band((t) => {
    const phi = (t * 2 - 1) * 2.05;
    const k = Math.cos(phi * 0.5);
    const n = new THREE.Vector3(Math.sin(phi), 0.35, -Math.cos(phi)).normalize();
    return { p: new THREE.Vector3(Math.sin(phi) * 0.15, 1.035 + 0.03 * k, -Math.cos(phi) * 0.115 - 0.01), n, w: 0.012 + 0.05 * Math.pow(k, 0.7), th: 0.01 };
  }, coatLt, { steps: 28, segs: 8, sq: 0.5 }));

  // ---- Foulard rouge noue au cou, pointe sur la poitrine ----
  group.add(loft([[0.985, 0.1, 0.085], [1.0, 0.142, 0.126], [1.035, 0.145, 0.128], [1.06, 0.1, 0.09], [1.07, 0.06, 0.06]], red, { segs: 20, sub: 4 }));
  group.add(band((t) => {
    const y = 1.0 - t * 0.14;
    const [, rz] = R(y);
    return { p: new THREE.Vector3(0, y, Math.max(rz, 0.112) + 0.006 + 0.012 * (1 - t)), n: new THREE.Vector3(0, 0.2, 1).normalize(), w: 0.092 * Math.pow(1 - t, 0.9) + 0.003, th: 0.014 };
  }, red, { steps: 12, segs: 8, sq: 0.3 }));

  // ---- Ceinture + boucle ----
  group.add(loft([[0.655, 0.108, 0.084], [0.665, 0.142, 0.107], [0.7, 0.14, 0.105], [0.71, 0.108, 0.084]], leather, { segs: 20, sub: 3 }));
  const buckle = roundBox(0.07, 0.058, 0.03, 0.012, gold);
  buckle.position.set(0, 0.683, 0.1);
  group.add(buckle);

  // ---- Bandouliere chargee de bombes ----
  const path = torsoPath(H, 0.855, 1.0, 0.012);
  group.add(band((t) => {
    const s = path(t * Math.PI * 2);
    return { p: s.p, n: s.n, w: 0.027, th: 0.01 };
  }, leather, { steps: 56, segs: 8, closed: true, sq: 0.6 }));
  const mkBomb = (r) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), bomb);
    b.castShadow = true;
    g.add(b);
    const cap = detail(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.34, r * 0.4, r * 0.4, 10), gold));
    cap.position.y = r * 0.98;
    g.add(cap);
    const shine = detail(new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xb8bcd0 })));
    shine.position.set(-r * 0.4, r * 0.45, r * 0.68);
    shine.scale.set(1, 1.4, 0.4);
    g.add(shine);
    return g;
  };
  for (const a of [1.08, 1.6, 2.12]) {
    const s = path(a);
    const b = mkBomb(0.043);
    b.position.copy(s.p).addScaledVector(s.n, 0.036);
    b.rotation.z = -0.5;
    group.add(b);
  }

  // ---- Visage : regard en coin, sourire narquois ----
  faceEyes(head, hr, at, { x: 0.4, y: 0.77, size: 0.215, tall: 1.02, iris: 0xc83a2c, lash: 0x1a1622, tilt: 0.2 });
  faceBrows(head, hr, at, hair, { y: 1.08, rise: 0.2, thick: 0.05 });
  faceNose(head, hr, at, skinShade, { y: 0.5 });
  faceSmile(head, hr, at, dark, { y: 0.25, width: 0.22, curve: 0.06, tilt: 0.1, x: 0.05 });

  // ---- Cheveux noirs en pointes ----
  const shell = hairShell(head, hr, hair, { volume: 0.13, front: 0.56 });
  const top = new THREE.Group();
  top.name = 'classHat'; // masque quand une coiffe est equipee
  head.add(top);
  const spike = (dir, len, r, sweep, flat) => top.add(hairSpike(head, hr, hair, dir, len, r, sweep, { flat }));
  spike([0.15, 1, 0.2], 0.24, 0.1, [0.5, 0.1, -0.7]);
  spike([-0.45, 0.9, 0], 0.22, 0.09, [-0.5, 0.2, -0.7]);
  spike([0.6, 0.8, -0.2], 0.22, 0.09, [0.6, 0, -0.7]);
  spike([0, 0.8, -0.65], 0.26, 0.1, [0, -0.2, -0.9]);
  spike([-0.7, 0.45, -0.55], 0.22, 0.085, [-0.4, -0.5, -0.6]);
  spike([0.7, 0.45, -0.55], 0.22, 0.085, [0.4, -0.5, -0.6]);
  spike([0, 0.05, -1], 0.18, 0.09, [0, -0.9, -0.2]);
  // Longue meche qui retombe sur le front.
  spike([-0.3, 0.72, 0.68], 0.2, 0.075, [0.75, -0.85, 0.2]);
  spike([0.45, 0.66, 0.62], 0.13, 0.058, [0.6, -0.9, 0.1]);

  // ---- Bandeau rouge noue, pans au vent ----
  const c0 = new THREE.Vector3(0, hr * 0.88, 0);
  const surf = surfaceOf([H.skull, shell], c0);
  top.add(headBand(surf, red, { y: 0.47, k: 0.1, w: hr * 0.105, th: hr * 0.03, lift: hr * 0.012, sq: 0.5 }));
  const knotP = surf(new THREE.Vector3(0.35, 0.36, -1), 0.012);
  const knot = sculptSphere((d, out) => { out.set(d.x * 0.034, d.y * 0.03, d.z * 0.03); }, redDk, 12, 10);
  knot.position.copy(knotP);
  top.add(knot);
  for (const [dx, dy, len] of [[0.1, -0.05, 0.3], [0.02, -0.2, 0.24]]) {
    const pts = [knotP.clone(), knotP.clone().add(new THREE.Vector3(dx * 0.4, 0.02, -len * 0.35)),
      knotP.clone().add(new THREE.Vector3(dx, dy * 0.5, -len * 0.7)), knotP.clone().add(new THREE.Vector3(dx * 1.6, dy, -len))];
    top.add(tubeAlong(pts, t => 0.014 + 0.034 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.08)), red, { steps: 16, segs: 8, flat: 0.3 }));
  }

  // ---- Tromblon (main droite) : crosse de bois, canon evase ----
  const gun = new THREE.Group();
  gun.add(loft([[-0.105, 0.022, 0.03], [-0.07, 0.026, 0.034], [0.0, 0.024, 0.03], [0.05, 0.03, 0.04]], leather, { segs: 12, sub: 3 }));
  const stock = roundBox(0.056, 0.07, 0.15, 0.022, leather);
  stock.position.set(0, 0.058, 0.03);
  gun.add(stock);
  const barrel = loft([[0, 0.03, 0.03], [0.05, 0.027, 0.027], [0.2, 0.025, 0.025], [0.27, 0.034, 0.034], [0.31, 0.058, 0.058], [0.325, 0.056, 0.056]], steel, { segs: 16, sub: 4 });
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.07, 0.08);
  gun.add(barrel);
  const ring = loft([[0, 0.02, 0.02], [0.006, 0.037, 0.037], [0.034, 0.037, 0.037], [0.04, 0.02, 0.02]], gold, { segs: 14, sub: 2 });
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.07, 0.085);
  gun.add(detail(ring));
  const hole = detail(new THREE.Mesh(new THREE.CircleGeometry(0.044, 16), M(0x14141c, { r: 0.9 })));
  hole.position.set(0, 0.07, 0.4065);
  gun.add(hole);
  gun.position.set(0, -0.045, 0.012);
  gun.rotation.set(-0.75, 0.25, -0.2);
  H.handR.add(gun);

  // ---- Bombe allumee (main gauche) ----
  const b2 = mkBomb(0.078);
  b2.position.set(-0.01, -0.15, 0.035);
  b2.rotation.z = 0.35;
  H.handL.add(b2);
  const fuse = detail(tubeAlong([[0, 0.085, 0], [0.01, 0.12, 0], [0.04, 0.145, 0.01]], () => 0.008, leather, { steps: 8, segs: 6 }));
  b2.add(fuse);
  const spark = detail(new THREE.Mesh(new THREE.OctahedronGeometry(0.03), new THREE.MeshBasicMaterial({ color: 0xffd040 })));
  spark.position.set(0.045, 0.15, 0.01);
  b2.add(spark);

  return group;
}
