import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth, brows, hairCap } from './humanoid.js';

// Osamodas facon Dofus : dresseur a sang de dragon. Tunique verte a col
// de fourrure et pans decoupes, bracelets de cuir, grandes cornes
// recourbees vers l arriere, queue ecailleuse qui ondule, meche brune,
// fouet enroule a la ceinture et baton surmonte d une griffe tenant un
// orbe vert.
export function buildOsamodas() {
  const skin = M(0xe9c79a, { r: 0.8 });
  const tunic = M(0x4f8a36, { r: 0.75 });
  const tunicDk = M(0x2f5a22, { r: 0.8 });
  const brown = M(0x6b4a24, { r: 0.85 });
  const brownDk = M(0x3e2a12, { r: 0.9 });
  const fur = M(0xd8b884, { r: 0.95 });
  const horn = M(0xf0e4c8, { r: 0.55 });
  const scale = M(0x3f7a3a, { r: 0.6 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const hair = M(0x5a3a1c, { r: 0.8 });
  const dark = M(0x1a1010, { r: 0.5 });
  const orb = new THREE.MeshStandardMaterial({ color: 0x7be58a, emissive: 0x2f9a48, emissiveIntensity: 1, roughness: 0.3 });

  const H = buildHumanoid({
    skin, top: tunic, bottom: brown, boots: brownDk, gloves: skin, sleeve: tunic, forearm: brown,
    build: 1.0, headR: 0.3, bootCuff: fur, ears: true,
    eyes: { iris: 0x2f9a48 },
  });
  const { group, head, headR: hr } = H;

  // ---- Tunique : pans decoupes en V + col de fourrure ----
  for (let i = -2; i <= 2; i++) {
    const flap = roundBox(0.11, 0.2, 0.02, 0.008, i % 2 ? tunicDk : tunic);
    const a = i * 0.45;
    flap.position.set(Math.sin(a) * 0.15, 0.36, Math.cos(a) * 0.12);
    flap.rotation.set(0.18, a, 0);
    group.add(flap);
  }
  const belt = lathe([[0.155, 0], [0.16, 0.035], [0.155, 0.07]], brownDk, 22, 0.82);
  belt.position.y = 0.43;
  group.add(belt);
  group.add(place(roundBox(0.08, 0.07, 0.03, 0.012, gold), 0, 0.465, 0.135));
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 10, 22), fur);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 0.85, 1);
  collar.position.y = 0.84;
  group.add(collar);
  // Lacets croises sur la poitrine.
  for (const sx of [-1, 1]) {
    const lace = roundBox(0.018, 0.2, 0.012, 0.006, gold);
    place(lace, sx * 0.045, 0.66, 0.15, 0, 0, sx * 0.45);
    group.add(lace);
  }
  // Fouet enroule a la hanche.
  const whip = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 18), brownDk);
  whip.position.set(-0.17, 0.42, 0.04);
  whip.rotation.y = Math.PI / 2;
  group.add(whip);

  // ---- Bracelets de cuir a griffes ----
  for (const arm of [H.armL, H.armR]) {
    const elbow = arm.children.find(c => c.isGroup);
    if (!elbow) continue;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.08, 12), brownDk);
    br.position.y = -0.1;
    elbow.add(br);
    const claw = bentCone(0.014, 0.05, 0, 0.02, horn, 5, 2);
    claw.position.set(0, -0.08, 0.05);
    claw.rotation.x = 1.2;
    elbow.add(claw);
  }

  // ---- Queue ecailleuse ----
  const tail = strand([[0, 0.44, -0.12], [0, 0.3, -0.3], [0.08, 0.22, -0.46], [0.2, 0.28, -0.56], [0.26, 0.4, -0.58]], 0.06, 0.012, scale, 28);
  group.add(tail);
  const tip = bentCone(0.04, 0.12, 0.04, 0, tunicDk, 4, 2);
  tip.position.set(0.26, 0.4, -0.58);
  tip.rotation.z = -0.5;
  group.add(tip);

  // ---- Visage ----
  brows(head, hr, hair, { y: 1.24, angle: -0.12 });
  faceMouth(head, hr, dark, { width: hr * 0.16, y: 0.5, arc: 0.85 });
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const sc = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), scale);
      sc.position.set(sx * (hr * 0.75 + k * 0.02), hr * (0.62 + k * 0.08), hr * 0.62 - k * 0.02);
      sc.scale.set(1, 1, 0.5);
      head.add(sc);
    }
  }

  // ---- Cheveux bruns en bataille ----
  hairCap(head, hr, hair, { backTheta: 0.7 });
  for (let i = -2; i <= 2; i++) {
    const m = bentCone(0.05, 0.16, i * 0.02, 0.1, hair, 6, 4);
    m.position.set(i * 0.07, hr * 1.6, hr * 0.6);
    m.rotation.set(1.9, 0, i * 0.25);
    head.add(m);
  }

  // ---- Grandes cornes de dragon recourbees vers l arriere ----
  for (const sx of [-1, 1]) {
    const h1 = strand([
      [sx * hr * 0.6, hr * 1.5, 0], [sx * hr * 0.85, hr * 1.95, -0.06],
      [sx * hr * 1.0, hr * 2.15, -0.22], [sx * hr * 0.95, hr * 2.1, -0.4],
    ], 0.055, 0.008, horn, 22);
    head.add(h1);
    for (let k = 0; k < 3; k++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05 - k * 0.008, 0.008, 5, 12), brown);
      ring.position.set(sx * hr * (0.66 + k * 0.08), hr * (1.62 + k * 0.14), -0.01 - k * 0.04);
      ring.rotation.set(Math.PI / 2 - 0.4, 0, sx * 0.4);
      head.add(ring);
    }
  }

  // ---- Baton a griffe et orbe (main droite) ----
  const staff = new THREE.Group();
  staff.add(place(taper(0.022, 0.026, 1.25, brown), 0, 0.95, 0));
  const orbM = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), orb);
  orbM.position.y = 1.02;
  staff.add(orbM);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshBasicMaterial({ color: 0x7be58a, transparent: true, opacity: 0.25 }));
  halo.position.y = 1.02;
  staff.add(halo);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const c = bentCone(0.018, 0.16, -Math.cos(a) * 0.06, -Math.sin(a) * 0.06, horn, 5, 4);
    c.position.set(Math.cos(a) * 0.06, 0.93, Math.sin(a) * 0.06);
    staff.add(c);
  }
  staff.position.set(0, -0.1, 0.02);
  staff.rotation.set(0.25, 0, -0.08);
  H.handR.add(staff);

  return group;
}
