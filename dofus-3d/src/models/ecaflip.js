import * as THREE from 'three';

// Ecaflip : felin joueur et chanceux, style chibi -- grosse tete de
// chat ronde, grandes oreilles, museau creme, gilet rouge de croupier,
// queue annelee, une grande carte a jouer en main.
export function buildEcaflip() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.85, metalness: o.m || 0,
  });
  const furMat    = M(0xdb8336);
  const furDkMat  = M(0xa85a22, { r: 0.9 });
  const creamMat  = M(0xf3ddb0, { r: 0.8 });
  const vestMat   = M(0xb52d2d, { r: 0.7 });
  const vestDkMat = M(0x7a1818, { r: 0.75 });
  const goldMat   = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const pantsMat  = M(0x2a2e3e, { r: 0.85 });
  const noseMat   = M(0x2a1a14, { r: 0.6 });
  const eyeMat    = new THREE.MeshStandardMaterial({ color: 0x3ad17a, emissive: 0x1a6e3a, emissiveIntensity: 0.45, roughness: 0.4 });
  const blackMat  = M(0x16121a, { r: 0.5 });

  // ============ JAMBES courtes + bottes ============
  for (const dx of [-0.14, 0.14]) {
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), furDkMat);
    boot.scale.set(1, 0.72, 1.25);
    boot.position.set(dx, 0.11, 0.03);
    boot.castShadow = true;
    group.add(boot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.115, 0.20, 10), pantsMat);
    leg.position.set(dx, 0.30, 0);
    group.add(leg);
  }

  // ============ TORSE : fourrure + gilet de croupier ============
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 16), furMat);
  torso.scale.set(1.12, 1.0, 0.92);
  torso.position.y = 0.60;
  torso.castShadow = true;
  group.add(torso);
  // Gilet rouge (demi-coquille avant).
  const vest = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 14, 0, Math.PI, 0, Math.PI), vestMat);
  vest.scale.set(1.05, 1.0, 0.62);
  vest.position.set(0, 0.60, 0.04);
  vest.rotation.y = Math.PI;
  group.add(vest);
  // Ventre creme.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), creamMat);
  belly.scale.set(1, 1.25, 0.5);
  belly.position.set(0, 0.56, 0.20);
  group.add(belly);
  // Boutons dores.
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), goldMat);
    btn.position.set(0.13, 0.72 - i * 0.11, 0.23);
    group.add(btn);
  }
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.10, 16), vestDkMat);
  belt.position.y = 0.42;
  group.add(belt);

  // ============ EPAULES / BRAS / pattes ============
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.082, 0.32, 10), furMat);
    arm.position.set(side * 0.34, 0.58, 0.02);
    arm.rotation.z = side * 0.13;
    arm.castShadow = true;
    group.add(arm);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), creamMat);
    paw.position.set(side * 0.38, 0.40, 0.03);
    group.add(paw);
  }

  // ============ QUEUE de chat annelee ============
  const tail = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.085 - i * 0.008, 10, 8), i % 2 ? furDkMat : furMat);
    seg.position.set(0, i * 0.14, -0.05 - i * 0.055);
    tail.add(seg);
  }
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), creamMat);
  tailTip.position.set(0, 0.84, -0.34);
  tail.add(tailTip);
  tail.position.set(0, 0.42, -0.22);
  tail.rotation.x = 0.55;
  group.add(tail);

  // ============ TETE de chat (enorme, ronde) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 20), furMat);
  head.position.y = 1.12;
  head.castShadow = true;
  group.add(head);
  // Museau creme.
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.20, 14, 12), creamMat);
  muzzle.scale.set(1, 0.68, 0.7);
  muzzle.position.set(0, 1.02, 0.27);
  group.add(muzzle);
  // Truffe + bouche.
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.06, 6), noseMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.07, 0.46);
  group.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 14, Math.PI), noseMat);
  mouth.rotation.set(Math.PI, 0, Math.PI);
  mouth.position.set(0, 1.0, 0.44);
  group.add(mouth);

  // ============ OREILLES de chat ============
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 6), furMat);
    ear.position.set(side * 0.25, 1.46, -0.02);
    ear.rotation.z = side * -0.30;
    ear.castShadow = true;
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), creamMat);
    inner.position.set(side * 0.25, 1.44, 0.04);
    inner.rotation.z = side * -0.30;
    group.add(inner);
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.10, 5), furDkMat);
    tuft.position.set(side * 0.25, 1.64, -0.02);
    tuft.rotation.z = side * -0.30;
    group.add(tuft);
  }

  // ============ Yeux felins + sourcils ============
  for (const dx of [-0.16, 0.16]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), eyeMat);
    eye.scale.set(0.95, 1.1, 0.5);
    eye.position.set(dx, 1.16, 0.33);
    group.add(eye);
    // Pupille fendue verticale.
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.10, 0.02), blackMat);
    pupil.position.set(dx, 1.16, 0.40);
    group.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), M(0xffffff, { r: 0.3 }));
    glint.position.set(dx + 0.03, 1.20, 0.41);
    group.add(glint);
  }
  // Moustaches.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 4), creamMat);
      wh.position.set(side * 0.18, 1.03 + i * 0.045, 0.30);
      wh.rotation.z = Math.PI / 2 + side * (0.08 + i * 0.14);
      group.add(wh);
    }
  }

  // ============ CHAPEAU de croupier (petit bandeau a plume) ============
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 24), vestDkMat);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 1.36;
  group.add(hatBand);
  const feather = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.34, 6), goldMat);
  feather.position.set(0.30, 1.52, -0.04);
  feather.rotation.z = -0.6;
  group.add(feather);

  // ============ GRANDE CARTE a jouer en main droite ============
  const card = new THREE.Group();
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.38, 0.025), M(0xf6f0e0, { r: 0.55 }));
  card.add(face);
  // Pique rouge centrale.
  const pip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 4), M(0xc0392b, { r: 0.6 }));
  pip.rotation.x = Math.PI / 2;
  pip.position.z = 0.02;
  card.add(pip);
  const pipBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.025), M(0xc0392b, { r: 0.6 }));
  pipBar.position.set(0, -0.08, 0.02);
  card.add(pipBar);
  card.position.set(0.46, 0.46, 0.12);
  card.rotation.set(0.25, 0.5, 0.4);
  group.add(card);

  // ============ Piece d or qui levite dans la main gauche ============
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.03, 20), goldMat);
  coin.rotation.set(Math.PI / 2, 0, 0.4);
  coin.position.set(-0.42, 0.56, 0.10);
  group.add(coin);

  return group;
}
