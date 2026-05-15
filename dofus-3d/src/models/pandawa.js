import * as THREE from 'three';

// Pandawa : bambouseur fetard, style chibi -- gros panda debout, tete
// ronde blanche a taches noires, oreilles rondes, un tonneau sous le
// bras et un baton de bambou dans l autre main.
export function buildPandawa() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.85, metalness: o.m || 0,
  });
  const white   = M(0xf1ede1);
  const cream   = M(0xfbf8ef, { r: 0.8 });
  const black   = M(0x262329, { r: 0.7 });
  const wood    = M(0x8a5a2b, { r: 0.7 });
  const hoop    = M(0xb9893f, { r: 0.45, m: 0.35 });
  const beltMat = M(0x5a3a1a);
  const bamboo  = M(0x6aa84a, { r: 0.6 });
  const leafMat = M(0x4f8a32, { r: 0.6 });
  const eyeW    = M(0xffffff, { r: 0.4 });
  const eyeD    = M(0x16121a, { r: 0.4 });
  const pinkMat = M(0xe88a8a, { r: 0.7 });

  // ============ JAMBES noires + pieds ============
  for (const dx of [-0.15, 0.15]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), black);
    foot.scale.set(1, 0.7, 1.3);
    foot.position.set(dx, 0.11, 0.04);
    foot.castShadow = true;
    group.add(foot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 10), black);
    leg.position.set(dx, 0.30, 0);
    group.add(leg);
  }

  // ============ TORSE blanc bien rond + ventre ============
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), white);
  torso.scale.set(1.12, 1.05, 0.95);
  torso.position.y = 0.66;
  torso.castShadow = true;
  group.add(torso);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), cream);
  belly.scale.set(1, 1.05, 0.55);
  belly.position.set(0, 0.60, 0.21);
  group.add(belly);
  // Ceinture + boucle.
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.11, 16), beltMat);
  belt.position.y = 0.44;
  group.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.05), hoop);
  buckle.position.set(0, 0.44, 0.33);
  group.add(buckle);

  // ============ BRAS noirs + pattes ============
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.34, 10), black);
    arm.position.set(side * 0.39, 0.64, 0.03);
    arm.rotation.z = side * 0.20;
    arm.castShadow = true;
    group.add(arm);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), black);
    paw.position.set(side * 0.47, 0.46, 0.05);
    group.add(paw);
  }

  // ============ TETE blanche enorme ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 20), white);
  head.position.y = 1.20;
  head.castShadow = true;
  group.add(head);

  // Oreilles noires rondes.
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), black);
    ear.position.set(side * 0.30, 1.55, -0.03);
    ear.castShadow = true;
    group.add(ear);
  }

  // Taches noires autour des yeux.
  for (const side of [-1, 1]) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), black);
    patch.scale.set(0.8, 1.2, 0.5);
    patch.position.set(side * 0.16, 1.21, 0.33);
    patch.rotation.z = side * 0.55;
    group.add(patch);
  }
  // Yeux.
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), eyeW);
    eye.position.set(side * 0.16, 1.22, 0.43);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.033, 8, 8), eyeD);
    pupil.position.set(side * 0.16, 1.21, 0.48);
    group.add(pupil);
  }
  // Museau + truffe + bouche.
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), cream);
  muzzle.scale.set(1, 0.68, 0.7);
  muzzle.position.set(0, 1.05, 0.35);
  group.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeD);
  nose.position.set(0, 1.10, 0.50);
  group.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 14, Math.PI), eyeD);
  mouth.rotation.set(Math.PI, 0, Math.PI);
  mouth.position.set(0, 1.00, 0.46);
  group.add(mouth);
  // Joues roses (le Pandawa est un brin emeche).
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), pinkMat);
    cheek.scale.set(1, 0.6, 0.4);
    cheek.position.set(side * 0.28, 1.03, 0.31);
    group.add(cheek);
  }

  // ============ TONNEAU cale sous le bras droit ============
  const barrel = new THREE.Group();
  const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.32, 16), wood);
  barrel.add(cask);
  for (const y of [-0.10, 0.10]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.024, 8, 18), hoop);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    barrel.add(ring);
  }
  barrel.position.set(0.52, 0.42, 0.18);
  barrel.rotation.set(0.35, 0, 0.4);
  barrel.castShadow = true;
  group.add(barrel);

  // ============ BATON de bambou dans la main gauche ============
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.78, 8), bamboo);
  stick.position.set(-0.52, 0.74, 0.06);
  stick.rotation.z = 0.22;
  group.add(stick);
  for (let i = 0; i < 3; i++) {
    const node = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.014, 6, 10), leafMat);
    node.rotation.x = Math.PI / 2;
    node.position.set(-0.52 + (i - 1) * 0.055, 0.74 + (i - 1) * 0.24, 0.06);
    node.rotation.z = 0.22;
    group.add(node);
  }
  // Deux feuilles en haut du baton.
  for (const side of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), leafMat);
    leaf.position.set(-0.36 + side * 0.05, 1.10, 0.06);
    leaf.rotation.z = side * 1.0 + 0.22;
    group.add(leaf);
  }

  return group;
}
