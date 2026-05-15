import * as THREE from 'three';

// Osamodas : invocateur draconique, style chibi -- grosse tete ronde,
// capuche a cornes, petites ailes membraneuses, queue ecailleuse,
// baton surmonte d un orbe vert. Palette brun / vert.
export function buildOsamodas() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.8, metalness: o.m || 0,
  });
  const robeMat    = M(0x6b4a24);
  const robeDkMat  = M(0x463015, { r: 0.9 });
  const furMat     = M(0xcdab78, { r: 0.95 });
  const tunicMat   = M(0x4f7d36, { r: 0.75 });
  const tunicDkMat = M(0x355824, { r: 0.8 });
  const scaleMat   = M(0x3f6e3a, { r: 0.6, m: 0.1 });
  const scaleDkMat = M(0x2a4d28, { r: 0.65 });
  const skinMat    = M(0xe9c79a, { r: 0.8 });
  const skinDkMat  = M(0xc9a576, { r: 0.8 });
  const goldMat    = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const hornMat    = M(0xefe6cf, { r: 0.6 });
  const orbMat     = new THREE.MeshStandardMaterial({ color: 0x7be58a, emissive: 0x2f9a48, emissiveIntensity: 0.9, roughness: 0.35 });
  const blackMat   = M(0x161018, { r: 0.5 });
  const whiteMat   = M(0xfdfdfd, { r: 0.4 });

  // ============ JAMBES courtes + bottes ============
  for (const dx of [-0.14, 0.14]) {
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), robeDkMat);
    boot.scale.set(1, 0.72, 1.25);
    boot.position.set(dx, 0.11, 0.03);
    boot.castShadow = true;
    group.add(boot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.20, 10), robeMat);
    leg.position.set(dx, 0.30, 0);
    group.add(leg);
  }

  // ============ TORSE : tunique verte + col de fourrure ============
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 16), tunicMat);
  torso.scale.set(1.12, 1.0, 0.92);
  torso.position.y = 0.60;
  torso.castShadow = true;
  group.add(torso);
  for (const side of [-1, 1]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.30, 0.03), goldMat);
    v.position.set(side * 0.08, 0.66, 0.26);
    v.rotation.z = side * 0.5;
    group.add(v);
  }
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.11, 16), robeDkMat);
  belt.position.y = 0.44;
  group.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.05), goldMat);
  buckle.position.set(0, 0.44, 0.29);
  group.add(buckle);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 10, 22), furMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.84;
  group.add(collar);

  // ============ AILES membraneuses dans le dos ============
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 5), scaleDkMat);
      bone.position.y = 0.18;
      bone.rotation.z = -0.4 + i * 0.4;
      wing.add(bone);
    }
    const memb = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 12, 8, 0, Math.PI, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3f6e3a, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }),
    );
    memb.scale.set(1, 0.9, 0.25);
    memb.position.y = 0.18;
    wing.add(memb);
    wing.position.set(side * 0.22, 0.74, -0.24);
    wing.rotation.y = side * 0.7;
    wing.rotation.z = side * -0.2;
    group.add(wing);
  }

  // ============ BRAS + mains ============
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.32, 10), tunicDkMat);
    arm.position.set(side * 0.33, 0.58, 0.02);
    arm.rotation.z = side * 0.13;
    arm.castShadow = true;
    group.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), skinMat);
    hand.position.set(side * 0.37, 0.40, 0.03);
    group.add(hand);
  }

  // ============ QUEUE ecailleuse ============
  const tail = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.10 - i * 0.012, 10, 8), i % 2 ? scaleDkMat : scaleMat);
    seg.position.set(0, i * 0.02, -i * 0.13);
    tail.add(seg);
  }
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), scaleDkMat);
  tailTip.rotation.x = -Math.PI / 2;
  tailTip.position.set(0, 0.12, -0.86);
  tail.add(tailTip);
  tail.position.set(0, 0.34, -0.20);
  tail.rotation.x = 0.35;
  group.add(tail);

  // ============ TETE (enorme) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 20), skinMat);
  head.position.y = 1.14;
  head.castShadow = true;
  group.add(head);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), skinDkMat);
  jaw.scale.set(1, 0.5, 0.82);
  jaw.position.set(0, 0.99, 0.07);
  group.add(jaw);
  for (const dx of [-0.15, 0.15]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12), whiteMat);
    white.scale.set(0.85, 1.05, 0.5);
    white.position.set(dx, 1.13, 0.34);
    group.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x2f9a48, roughness: 0.4 }));
    pupil.position.set(dx, 1.12, 0.40);
    group.add(pupil);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), skinDkMat);
  nose.position.set(0, 1.06, 0.40);
  group.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 14, Math.PI), blackMat);
  mouth.rotation.set(Math.PI, 0, Math.PI);
  mouth.position.set(0, 0.99, 0.36);
  group.add(mouth);

  // ============ CAPUCHE a cornes (draconique) ============
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.43, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), robeMat);
  hood.position.y = 1.18;
  hood.castShadow = true;
  group.add(hood);
  const hoodRim = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.05, 8, 26), furMat);
  hoodRim.rotation.x = Math.PI / 2 + 0.25;
  hoodRim.position.y = 1.30;
  group.add(hoodRim);
  // Cornes de dragon (3 segments par cote).
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const seg = new THREE.Mesh(new THREE.ConeGeometry(0.07 - i * 0.018, 0.16, 7), hornMat);
      seg.position.set(side * (0.30 + i * 0.07), 1.42 + i * 0.13, -0.06 - i * 0.04);
      seg.rotation.z = side * (0.5 + i * 0.18);
      seg.rotation.x = -0.2;
      group.add(seg);
    }
  }
  // Ailerons draconiques sur les cotes de la tete.
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.24, 4), scaleMat);
    fin.position.set(side * 0.36, 1.16, -0.02);
    fin.rotation.z = side * 1.4;
    group.add(fin);
  }

  // ============ BATON a orbe ============
  const staff = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.30, 8), robeDkMat);
  staff.add(rod);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.20, 5), goldMat);
    claw.position.set(Math.cos(a) * 0.11, 0.66, Math.sin(a) * 0.11);
    claw.rotation.set(Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7);
    staff.add(claw);
  }
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), orbMat);
  orb.position.y = 0.70;
  staff.add(orb);
  const orbGlint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), whiteMat);
  orbGlint.position.set(-0.05, 0.76, 0.06);
  staff.add(orbGlint);
  staff.position.set(0.42, 0.66, 0.10);
  staff.rotation.z = 0.10;
  group.add(staff);

  return group;
}
