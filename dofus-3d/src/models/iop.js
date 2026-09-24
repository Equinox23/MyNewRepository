import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, place, faceMouth, brows, hairCap } from './humanoid.js';

// Iop facon Dofus : guerrier fougueux. Silhouette en V (epaules larges,
// taille fine), plastron rouge a arete centrale, epaulieres anguleuses a
// pointes, jupe de plates, brassards, crete de cheveux en flammes et
// bandeau dore, cape rouge qui flotte, grande epee a garde en croix.
export function buildIop() {
  const skin = M(0xf2c28a, { r: 0.8 });
  const red = M(0xc8322a, { r: 0.55, m: 0.15 });
  const redLt = M(0xe8584a, { r: 0.5, m: 0.15 });
  const redDk = M(0x7a1a14, { r: 0.7 });
  const gold = M(0xf2c030, { r: 0.35, m: 0.6 });
  const leather = M(0x5a3418, { r: 0.85 });
  const cloth1 = M(0x8a2018, { r: 0.85 });
  const steel = M(0xe4ebf2, { r: 0.25, m: 0.8 });
  const steelDk = M(0x8e9aa6, { r: 0.35, m: 0.7 });
  const hair = M(0xe0561c, { r: 0.7 });
  const hairLt = M(0xff8a2a, { r: 0.7 });
  const hairDk = M(0x8a2a0c, { r: 0.7 });
  const dark = M(0x1a1010, { r: 0.5 });

  const H = buildHumanoid({
    skin, top: red, bottom: cloth1, boots: redDk, gloves: leather, sleeve: cloth1,
    forearm: red, build: 1.08, bootCuff: gold, headR: 0.3,
    eyes: { iris: 0x8a4a1a, lid: 0xf2c28a, angry: true },
  });
  const { group, head, headR: hr } = H;

  // ---- Plastron : arete centrale + pectoraux ----
  const plate = lathe([[0.16, 0], [0.19, 0.08], [0.205, 0.17], [0.17, 0.26], [0.08, 0.3]], redLt, 20, 0.7);
  plate.position.set(0, 0.52, 0.035);
  group.add(plate);
  const ridge = roundBox(0.04, 0.24, 0.04, 0.015, gold);
  place(ridge, 0, 0.66, 0.175);
  group.add(ridge);
  // Ceinture + boucle.
  const belt = lathe([[0.165, 0], [0.17, 0.03], [0.165, 0.06]], leather, 22, 0.82);
  belt.position.y = 0.43;
  group.add(belt);
  group.add(place(roundBox(0.1, 0.075, 0.03, 0.012, gold), 0, 0.46, 0.14));
  // Jupe de plates (tassettes) evasees.
  for (let i = -2; i <= 2; i++) {
    const t = roundBox(0.085, 0.13, 0.025, 0.01, i % 2 ? red : redLt);
    const a = i * 0.42;
    t.position.set(Math.sin(a) * 0.155, 0.37, Math.cos(a) * 0.125);
    t.rotation.set(0.25, a, 0);
    group.add(t);
  }

  // ---- Epaulieres anguleuses a pointes (suivent les bras) ----
  for (const [arm, side] of [[H.armL, -1], [H.armR, 1]]) {
    const pad = lathe([[0.02, -0.05], [0.1, -0.03], [0.115, 0.02], [0.08, 0.07], [0.02, 0.085]], red, 16);
    pad.scale.set(1.1, 1, 1);
    pad.position.set(side * 0.03, 0.02, 0);
    pad.rotation.z = -side * 0.35;
    arm.add(pad);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 20), gold);
    rim.rotation.set(Math.PI / 2, 0, 0);
    rim.position.set(side * 0.045, -0.02, 0);
    arm.add(rim);
    for (let k = 0; k < 2; k++) {
      const sp = bentCone(0.025, 0.09, side * 0.03, 0, steel, 6, 3);
      sp.position.set(side * (0.05 + k * 0.03), 0.06, -0.02 + k * 0.04);
      sp.rotation.z = -side * 0.7;
      arm.add(sp);
    }
    // Brassard dore sur l avant-bras.
    const elbow = arm.children.find(c => c.isGroup);
    if (elbow) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.05, 0.07, 14), gold);
      br.position.y = -0.1;
      elbow.add(br);
    }
  }

  // ---- Cape qui flotte dans le dos ----
  const cape = cloth(0.36, 0.62, redDk, { curve: 0.1, flare: 0.14, spread: 0.45, wave: 0.04, waves: 3 });
  cape.position.set(0, 0.84, -0.16);
  cape.rotation.x = 0.12;
  cape.name = 'classCape';
  group.add(cape);
  const clasp = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 18, Math.PI), gold);
  clasp.rotation.set(Math.PI / 2 + 0.2, 0, Math.PI);
  clasp.position.set(0, 0.84, -0.02);
  group.add(clasp);

  // ---- Visage : sourire en coin, sourcils fronces ----
  brows(head, hr, hairDk, { y: 1.28, angle: 0.35 });
  faceMouth(head, hr, dark, { width: hr * 0.2, y: 0.48, tilt: 0.15, arc: 0.8 });

  // ---- Crete de cheveux en flammes + bandeau ----
  hairCap(head, hr, hair, { backTheta: 0.72 });
  const locks = [
    // x, y, z, r, h, bx, bz, rx, rz
    [0, 1.72, 0.1, 0.1, 0.42, 0, -0.18, -0.2, 0],
    [-0.12, 1.66, 0.04, 0.085, 0.34, -0.08, -0.16, -0.3, 0.35],
    [0.12, 1.66, 0.04, 0.085, 0.34, 0.08, -0.16, -0.3, -0.35],
    [0, 1.64, -0.14, 0.1, 0.4, 0, -0.26, -0.9, 0],
    [-0.2, 1.52, -0.12, 0.08, 0.3, -0.12, -0.14, -0.8, 0.8],
    [0.2, 1.52, -0.12, 0.08, 0.3, 0.12, -0.14, -0.8, -0.8],
    [0, 1.5, -0.25, 0.09, 0.32, 0, -0.2, -1.4, 0],
    [-0.26, 1.34, 0.05, 0.06, 0.2, -0.1, 0, 0.1, 1.2],
    [0.26, 1.34, 0.05, 0.06, 0.2, 0.1, 0, 0.1, -1.2],
  ];
  locks.forEach(([x, y, z, r, h, bx, bz, rx, rz], i) => {
    const l = bentCone(r, h, bx, bz, i % 3 === 0 ? hairLt : hair, 7, 5);
    l.position.set(x, y - 1.2, z);
    l.rotation.set(rx, 0, rz);
    head.add(l);
  });
  const fringe = bentCone(0.06, 0.2, 0.06, 0.1, hair, 7, 4);
  fringe.position.set(-0.08, hr * 1.45, hr * 0.8);
  fringe.rotation.set(2.4, 0, 0.3);
  head.add(fringe);
  const band = new THREE.Mesh(new THREE.TorusGeometry(hr * 1.02, 0.022, 8, 30), gold);
  band.rotation.x = Math.PI / 2 - 0.15;
  band.position.set(0, hr * 1.35, 0.01);
  head.add(band);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), M(0xe8322a, { r: 0.2, m: 0.3 }));
  gem.position.set(0, hr * 1.42, hr * 1.02);
  head.add(gem);

  // ---- Grande epee (main droite) ----
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 0.022), steel);
  blade.position.y = 0.5;
  blade.castShadow = true;
  sword.add(blade);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.74, 0.026), steelDk);
  edge.position.y = 0.5;
  sword.add(edge);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.16, 4), steel);
  tip.rotation.y = Math.PI / 4;
  tip.scale.z = 0.3;
  tip.position.y = 0.97;
  sword.add(tip);
  const guard = roundBox(0.3, 0.05, 0.06, 0.02, gold);
  guard.position.y = 0.1;
  sword.add(guard);
  for (const sx of [-1, 1]) {
    const g2 = bentCone(0.025, 0.08, 0, 0, gold, 6, 2);
    g2.position.set(sx * 0.16, 0.1, 0);
    g2.rotation.z = -sx * Math.PI / 2;
    sword.add(g2);
  }
  sword.add(place(taper(0.024, 0.022, 0.16, leather), 0, 0.08, 0));
  sword.add(place(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), gold), 0, -0.1, 0));
  // Tenue sur le cote, lame inclinee vers l exterieur (ne cache pas le visage).
  sword.position.set(0.02, -0.08, 0.02);
  sword.rotation.set(0.5, 0, -0.75);
  H.handR.add(sword);

  return group;
}
