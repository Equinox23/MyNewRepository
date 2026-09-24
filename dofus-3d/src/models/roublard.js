import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth, brows, hairCap } from './humanoid.js';

// Roublard facon Dofus : artificier malicieux. Long manteau de cuir sombre
// a pans fendus et col releve, bandeau rouge noue dont les pans volent,
// meches noires en pointe, foulard sur le bas du visage, bandouliere
// chargee de bombes, pistolet a la main droite, bombe a la main gauche.
export function buildRoublard() {
  const skin = M(0xf0c8a0, { r: 0.8 });
  const coat = M(0x2a2a36, { r: 0.8 });
  const coatLt = M(0x3c3c4c, { r: 0.8 });
  const leather = M(0x4a2c16, { r: 0.85 });
  const red = M(0xc8322a, { r: 0.7 });
  const redDk = M(0x8a1a14, { r: 0.75 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const steel = M(0x9aa4b0, { r: 0.35, m: 0.75 });
  const hair = M(0x1a1822, { r: 0.7 });
  const bomb = M(0x22222a, { r: 0.5, m: 0.2 });
  const dark = M(0x100a0a, { r: 0.5 });

  const H = buildHumanoid({
    skin, top: coat, bottom: M(0x3a2a22, { r: 0.85 }), boots: leather, gloves: leather,
    sleeve: coat, forearm: coatLt, build: 0.96, headR: 0.3, bootCuff: redDk, toe: 0.14,
    eyes: { iris: 0xd8322a, lid: 0xf0c8a0, angry: true },
  });
  const { group, head, headR: hr } = H;

  // ---- Manteau : pans longs fendus + col releve ----
  for (const sx of [-1, 1]) {
    const tail = cloth(0.2, 0.36, coat, { curve: 0.05, flare: 0.06, spread: 0.3, wave: 0.02 });
    tail.position.set(sx * 0.08, 0.44, -0.1);
    tail.rotation.set(0.1, sx * 0.35, 0);
    group.add(tail);
    const front = cloth(0.13, 0.22, coatLt, { curve: -0.02, flare: -0.03, spread: 0.2, wave: 0.01 });
    front.position.set(sx * 0.1, 0.44, 0.12);
    front.rotation.set(-0.15, sx * -0.2, 0);
    group.add(front);
  }
  const collar = lathe([[0.1, 0], [0.14, 0.06], [0.16, 0.13]], coatLt, 18, 0.9);
  collar.position.y = 0.8;
  group.add(collar);
  // Ceinture + bandouliere de bombes.
  const belt = lathe([[0.15, 0], [0.155, 0.035], [0.15, 0.07]], leather, 20, 0.82);
  belt.position.y = 0.43;
  group.add(belt);
  group.add(place(roundBox(0.07, 0.06, 0.03, 0.01, gold), 0, 0.465, 0.13));
  const sash = roundBox(0.05, 0.5, 0.03, 0.012, leather);
  place(sash, 0, 0.63, 0.12, 0.12, 0, 0.72);
  group.add(sash);
  for (let k = 0; k < 3; k++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), bomb);
    b.position.set(-0.13 + k * 0.1, 0.52 + k * 0.1, 0.16);
    group.add(b);
    const fuse = bentCone(0.008, 0.04, 0.01, 0, gold, 4, 2);
    fuse.position.set(-0.13 + k * 0.1, 0.565 + k * 0.1, 0.16);
    group.add(fuse);
  }

  // ---- Foulard sur le bas du visage ----
  const scarf = new THREE.Mesh(new THREE.SphereGeometry(hr * 1.02, 20, 10, 0, Math.PI * 2, Math.PI * 0.64, Math.PI * 0.26), red);
  scarf.position.y = hr * 0.88;
  scarf.scale.set(1, 1, 1.12);
  head.add(scarf);
  const knotTail = cloth(0.1, 0.22, red, { curve: 0.02, flare: 0.05, spread: 0.2 });
  knotTail.position.set(0, hr * 0.45, -hr * 0.95);
  knotTail.rotation.x = 0.5;
  head.add(knotTail);

  // ---- Cheveux noirs en pointes + bandeau rouge ----
  hairCap(head, hr, hair, { backTheta: 0.72 });
  const spikes = [[-0.14, 0.12, -0.5], [0, 0.18, -0.25], [0.14, 0.12, 0.2], [0.2, 0.02, 0.6], [-0.2, 0.02, -0.7]];
  spikes.forEach(([x, bz, rz], i) => {
    const s = bentCone(0.07, 0.2, 0, -bz, hair, 6, 4);
    s.position.set(x, hr * 1.7, -0.02 - i * 0.02);
    s.rotation.set(-0.5, 0, rz);
    head.add(s);
  });
  brows(head, hr, hair, { y: 1.2, angle: 0.4 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(hr * 1.06, 0.03, 8, 30), red);
  band.rotation.x = Math.PI / 2 + 0.08;
  band.position.set(0, hr * 1.36, 0);
  head.add(band);
  for (const sx of [-1, 1]) {
    const t = strand([[sx * 0.03, hr * 1.36, -hr * 1.04], [sx * 0.08, hr * 1.25, -hr * 1.3], [sx * 0.16, hr * 1.15, -hr * 1.55]], 0.03, 0.012, redDk, 12);
    head.add(t);
  }

  // ---- Pistolet (main droite) ----
  const gun = new THREE.Group();
  gun.add(place(roundBox(0.05, 0.12, 0.06, 0.015, leather), 0, 0, 0));
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.26, 10), steel);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.03, 0.13);
  gun.add(barrel);
  const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 12), gold);
  muzzle.position.set(0, 0.03, 0.26);
  gun.add(muzzle);
  gun.position.set(0, -0.1, 0.03);
  gun.rotation.x = -1.2;
  H.handR.add(gun);

  // ---- Bombe (main gauche) ----
  const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), bomb);
  b2.position.set(0, -0.14, 0.03);
  H.handL.add(b2);
  const f2 = bentCone(0.012, 0.07, 0.02, 0, gold, 4, 3);
  f2.position.set(0, -0.07, 0.03);
  H.handL.add(f2);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffd040 }));
  spark.position.set(0.02, 0.0, 0.03);
  H.handL.add(spark);

  return group;
}
