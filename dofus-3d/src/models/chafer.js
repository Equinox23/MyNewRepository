import * as THREE from 'three';

// Chafer : fantassin squelette. Crane, cage thoracique, armure de
// plaques sombres rouillees, lance osseuse a la main.
export function buildChafer() {
  const group = new THREE.Group();

  const bone   = 0xe9e3cf;
  const boneDk = 0xb8ad8e;
  const armor  = 0x3a4046;
  const armorDk = 0x23272c;
  const rust   = 0x7a3b1e;
  const eyeCol = 0x6fe6ff;

  const boneMat   = new THREE.MeshStandardMaterial({ color: bone, roughness: 0.8 });
  const boneDkMat = new THREE.MeshStandardMaterial({ color: boneDk, roughness: 0.85 });
  const armorMat  = new THREE.MeshStandardMaterial({ color: armor, roughness: 0.55, metalness: 0.5 });
  const armorDkMat = new THREE.MeshStandardMaterial({ color: armorDk, roughness: 0.6, metalness: 0.5 });
  const rustMat   = new THREE.MeshStandardMaterial({ color: rust, roughness: 0.9 });
  const eyeMat    = new THREE.MeshStandardMaterial({ color: eyeCol, emissive: 0x2bbcd6, emissiveIntensity: 1.1, roughness: 0.4 });

  // -- Jambes osseuses --
  for (const dx of [-0.13, 0.13]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), armorDkMat);
    foot.position.set(dx, 0.04, 0.04);
    foot.castShadow = true;
    group.add(foot);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.34, 8), boneMat);
    shin.position.set(dx, 0.26, 0);
    shin.castShadow = true;
    group.add(shin);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), boneDkMat);
    knee.position.set(dx, 0.44, 0);
    group.add(knee);
  }

  // -- Bassin / jupe d armure --
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.16, 12), armorMat);
  pelvis.position.y = 0.52;
  group.add(pelvis);

  // -- Cage thoracique : torse + cotes --
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.13, 0.40, 10), boneMat);
  spine.position.y = 0.80;
  spine.castShadow = true;
  group.add(spine);
  for (let i = 0; i < 3; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.13 - i * 0.012, 0.022, 6, 16, Math.PI), boneMat);
    rib.position.set(0, 0.70 + i * 0.12, 0);
    rib.rotation.x = Math.PI / 2;
    group.add(rib);
  }
  // Plastron d armure rouille
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10, 0, Math.PI, 0, Math.PI), armorMat);
  chest.position.set(0, 0.86, 0.04);
  chest.scale.set(1, 0.9, 0.55);
  chest.rotation.y = Math.PI;
  group.add(chest);
  const rustPatch = new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), rustMat);
  rustPatch.position.set(-0.05, 0.84, 0.22);
  group.add(rustPatch);

  // -- Epaulieres --
  for (const dx of [-0.24, 0.24]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), armorMat);
    pauldron.position.set(dx, 0.98, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), armorDkMat);
    spike.position.set(dx, 1.06, 0);
    group.add(spike);
  }

  // -- Bras osseux --
  for (const dx of [-0.26, 0.26]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.40, 8), boneMat);
    arm.position.set(dx, 0.80, 0);
    group.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), boneDkMat);
    hand.position.set(dx, 0.58, 0);
    group.add(hand);
  }

  // -- Crane + machoire + casque --
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 14), boneMat);
  skull.position.y = 1.20;
  skull.castShadow = true;
  group.add(skull);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.07, 0.16), boneDkMat);
  jaw.position.set(0, 1.06, 0.04);
  group.add(jaw);
  // Casque d armure
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), armorMat);
  helm.position.y = 1.22;
  group.add(helm);
  const helmSpike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 8), armorDkMat);
  helmSpike.position.y = 1.42;
  group.add(helmSpike);
  // Orbites lumineuses
  for (const dx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeMat);
    eye.position.set(dx, 1.20, 0.17);
    group.add(eye);
  }

  // -- Lance osseuse, tenue dans la main droite --
  const spear = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.1, 8), boneDkMat);
  spear.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 8), boneMat);
  tip.position.y = 0.68;
  spear.add(tip);
  const barb = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 12, Math.PI), boneMat);
  barb.position.y = 0.52;
  barb.rotation.x = Math.PI / 2;
  spear.add(barb);
  spear.position.set(0.30, 0.72, 0.06);
  spear.rotation.z = 0.12;
  spear.castShadow = true;
  group.add(spear);

  return group;
}
