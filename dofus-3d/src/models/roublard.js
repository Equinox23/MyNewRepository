import * as THREE from 'three';

// Roublard : assassin-artificier, style chibi -- grosse tete sous une
// capuche profonde, masque de metal couvrant le bas du visage, yeux
// rouges brillants, deux dagues croisees dans le dos, bombe a la ceinture.
export function buildRoublard() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.7, metalness: o.m || 0,
  });
  const cloakMat   = M(0x141a2c, { r: 0.85 });
  const cloakDkMat = M(0x090c16, { r: 0.9 });
  const leatherMat = M(0x241712, { r: 0.9 });
  const plateMat   = M(0x32466a, { r: 0.45, m: 0.55 });
  const plateLtMat = M(0x52719c, { r: 0.4, m: 0.6 });
  const skinMat    = M(0xeed3af, { r: 0.8 });
  const goldMat    = M(0xc59a36, { r: 0.4, m: 0.6 });
  const bladeMat   = M(0xccd2d8, { r: 0.2, m: 0.9 });
  const bladeDkMat = M(0x6e757f, { r: 0.4, m: 0.8 });
  const accentMat  = M(0xc0392b, { r: 0.6 });
  const accentDkMat = M(0x6d1f17, { r: 0.7 });
  const bombMat    = M(0x18191b, { r: 0.5, m: 0.4 });
  const eyeMat     = new THREE.MeshStandardMaterial({ color: 0xff5544, emissive: 0xff2218, emissiveIntensity: 1.1, roughness: 0.4 });
  const sparkMat   = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xff8a00, emissiveIntensity: 0.9, roughness: 0.3 });

  // ============ JAMBES courtes + bottes pointues ============
  for (const dx of [-0.14, 0.14]) {
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), leatherMat);
    boot.scale.set(1, 0.7, 1.35);
    boot.position.set(dx, 0.11, 0.05);
    boot.castShadow = true;
    group.add(boot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.10, 0.22, 10), cloakDkMat);
    leg.position.set(dx, 0.30, 0);
    group.add(leg);
  }

  // ============ TORSE : cuir noir + plastron bleu nuit ============
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), cloakMat);
  torso.scale.set(1.1, 1.0, 0.9);
  torso.position.y = 0.60;
  torso.castShadow = true;
  group.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 12), plateMat);
  chest.scale.set(1.05, 0.78, 0.55);
  chest.position.set(0, 0.66, 0.16);
  group.add(chest);
  // Liseré bleu clair en V.
  for (const side of [-1, 1]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.025), plateLtMat);
    stripe.position.set(side * 0.07, 0.68, 0.27);
    stripe.rotation.z = side * 0.55;
    group.add(stripe);
  }
  // Ceinture + bombe + fiole.
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.10, 16), leatherMat);
  belt.position.y = 0.44;
  group.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.05), goldMat);
  buckle.position.set(0, 0.44, 0.29);
  group.add(buckle);
  const bombBall = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 10), bombMat);
  bombBall.position.set(0.25, 0.44, 0.16);
  group.add(bombBall);
  const bombFuse = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.08, 6), M(0x3a3025, { r: 0.9 }));
  bombFuse.position.set(0.28, 0.55, 0.18);
  bombFuse.rotation.z = -0.4;
  group.add(bombFuse);
  const bombSpark = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), sparkMat);
  bombSpark.position.set(0.31, 0.61, 0.19);
  group.add(bombSpark);
  const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.11, 10),
    new THREE.MeshStandardMaterial({ color: 0x6ee07a, roughness: 0.25, transparent: true, opacity: 0.78 }));
  vial.position.set(-0.25, 0.45, 0.15);
  group.add(vial);

  // ============ EPAULIERES souples + bras ============
  for (const side of [-1, 1]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), leatherMat);
    pauldron.position.set(side * 0.30, 0.82, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 8, 16), accentDkMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(side * 0.30, 0.79, 0);
    group.add(ring);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.30, 10), cloakDkMat);
    arm.position.set(side * 0.33, 0.62, 0.02);
    arm.rotation.z = side * 0.12;
    arm.castShadow = true;
    group.add(arm);
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.10, 10), plateMat);
    bracer.position.set(side * 0.35, 0.50, 0.02);
    group.add(bracer);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), leatherMat);
    fist.position.set(side * 0.36, 0.42, 0.03);
    group.add(fist);
  }

  // ============ CAPE longue dans le dos ============
  const capeMat = new THREE.MeshStandardMaterial({ color: 0x141a2c, roughness: 0.88, side: THREE.DoubleSide });
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.92, 4, 4), capeMat);
  const pos = cape.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) + Math.pow((y + 0.46) * -0.55, 2) * 0.18);
  }
  cape.geometry.computeVertexNormals();
  cape.position.set(0, 0.56, -0.24);
  cape.castShadow = true;
  group.add(cape);

  // ============ TETE (enorme) sous capuche ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.37, 22, 18), skinMat);
  head.position.y = 1.10;
  head.castShadow = true;
  group.add(head);

  // Capuche profonde + pointe.
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.43, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), cloakMat);
  hood.position.set(0, 1.12, -0.02);
  hood.castShadow = true;
  group.add(hood);
  const hoodTip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.30, 14), cloakMat);
  hoodTip.position.set(0, 1.40, -0.16);
  hoodTip.rotation.x = -0.6;
  group.add(hoodTip);
  // Ombre profonde sous la capuche.
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  shadow.position.set(0, 1.14, 0.20);
  group.add(shadow);

  // Masque metallique (bas du visage).
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 12, 0, Math.PI, 0, Math.PI), plateMat);
  mask.scale.set(1, 0.6, 0.6);
  mask.position.set(0, 1.00, 0.05);
  mask.rotation.y = Math.PI;
  group.add(mask);
  const maskRim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.014, 6, 20, Math.PI), accentMat);
  maskRim.rotation.x = Math.PI / 2;
  maskRim.position.set(0, 0.92, 0.05);
  group.add(maskRim);
  // Fentes du masque.
  for (const dx of [-0.10, 0, 0.10]) {
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.10, 0.02), plateLtMat);
    slit.position.set(dx, 0.99, 0.30);
    group.add(slit);
  }

  // Yeux rouges brillants + halo.
  for (const dx of [-0.10, 0.10]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), eyeMat);
    eye.position.set(dx, 1.15, 0.27);
    group.add(eye);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5544, transparent: true, opacity: 0.32 }));
    halo.position.set(dx, 1.15, 0.27);
    group.add(halo);
  }

  // ============ DEUX DAGUES croisees dans le dos ============
  const makeDagger = () => {
    const d = new THREE.Group();
    const db = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.42, 8), bladeMat);
    db.position.y = 0.21;
    d.add(db);
    const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.34, 0.016), bladeDkMat);
    fuller.position.y = 0.21;
    d.add(fuller);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.045), goldMat);
    d.add(guard);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 8), leatherMat);
    handle.position.y = -0.07;
    d.add(handle);
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), accentDkMat);
    pommel.position.y = -0.13;
    d.add(pommel);
    return d;
  };
  const dL = makeDagger();
  dL.position.set(-0.18, 0.66, -0.20);
  dL.rotation.set(Math.PI / 6, 0, -0.75);
  group.add(dL);
  const dR = makeDagger();
  dR.position.set(0.18, 0.66, -0.20);
  dR.rotation.set(Math.PI / 6, 0, 0.75);
  group.add(dR);

  return group;
}
