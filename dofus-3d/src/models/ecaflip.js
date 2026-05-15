import * as THREE from 'three';

// Ecaflip : felin joueur et chanceux. Pelage roux, oreilles de chat,
// museau, gilet rouge de croupier, une grande carte a la main.
export function buildEcaflip() {
  const group = new THREE.Group();

  const fur     = 0xd9803a;
  const furDk   = 0xa85a22;
  const cream   = 0xf2dcb0;
  const vest    = 0xb02a2a;
  const vestDk  = 0x7a1818;
  const gold    = 0xe8c14a;
  const pants   = 0x2a2e3e;

  const furMat   = new THREE.MeshStandardMaterial({ color: fur, roughness: 0.85 });
  const furDkMat = new THREE.MeshStandardMaterial({ color: furDk, roughness: 0.9 });
  const creamMat = new THREE.MeshStandardMaterial({ color: cream, roughness: 0.8 });
  const vestMat  = new THREE.MeshStandardMaterial({ color: vest, roughness: 0.7 });
  const vestDkMat = new THREE.MeshStandardMaterial({ color: vestDk, roughness: 0.75 });
  const goldMat  = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.55, roughness: 0.35 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.85 });
  const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x3ad17a, emissive: 0x1a6e3a, emissiveIntensity: 0.5, roughness: 0.4 });
  const noseMat  = new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.6 });

  // -- Bottes / pieds --
  for (const dx of [-0.13, 0.13]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.26), furDkMat);
    boot.position.set(dx, 0.05, 0.04);
    boot.castShadow = true;
    group.add(boot);
  }
  // -- Jambes --
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.26, 10), pantsMat);
    leg.position.set(dx, 0.24, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // -- Torse + gilet de croupier --
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.20, 0.44, 14), furMat);
  torso.position.y = 0.58;
  torso.castShadow = true;
  group.add(torso);
  const vestBody = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.22, 0.40, 14, 1, true), vestMat);
  vestBody.position.y = 0.58;
  group.add(vestBody);
  // Ventre creme
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), creamMat);
  belly.position.set(0, 0.54, 0.18);
  belly.scale.set(1, 1.2, 0.45);
  group.add(belly);
  // Boutons dores
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), goldMat);
    btn.position.set(0.12, 0.70 - i * 0.12, 0.24);
    group.add(btn);
  }
  // Ceinture
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.07, 14), vestDkMat);
  belt.position.y = 0.38;
  group.add(belt);

  // -- Epaules / bras --
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.34, 10), furMat);
    arm.position.set(side * 0.32, 0.56, 0);
    arm.rotation.z = side * 0.12;
    arm.castShadow = true;
    group.add(arm);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), creamMat);
    paw.position.set(side * 0.35, 0.38, 0);
    group.add(paw);
  }

  // -- Queue de chat --
  const tail = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.07 - i * 0.008, 8, 6), i % 2 ? furDkMat : furMat);
    seg.position.set(0, i * 0.13, -0.05 - i * 0.06);
    tail.add(seg);
  }
  tail.position.set(0, 0.42, -0.24);
  tail.rotation.x = 0.5;
  group.add(tail);

  // -- Tete feline --
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 14), furMat);
  head.position.y = 1.04;
  head.castShadow = true;
  group.add(head);
  // Museau creme
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), creamMat);
  muzzle.position.set(0, 0.98, 0.20);
  muzzle.scale.set(1, 0.7, 0.7);
  group.add(muzzle);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.05, 6), noseMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.00, 0.32);
  group.add(nose);

  // -- Oreilles de chat --
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.20, 6), furMat);
    ear.position.set(side * 0.16, 1.26, 0);
    ear.rotation.z = side * -0.25;
    ear.castShadow = true;
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.11, 6), creamMat);
    inner.position.set(side * 0.16, 1.25, 0.03);
    inner.rotation.z = side * -0.25;
    group.add(inner);
  }

  // -- Yeux felins --
  for (const dx of [-0.10, 0.10]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeMat);
    eye.position.set(dx, 1.07, 0.21);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.06, 0.02), noseMat);
    pupil.position.set(dx, 1.07, 0.26);
    group.add(pupil);
  }

  // -- Moustaches --
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 4), creamMat);
      wh.position.set(side * 0.18, 0.99 + i * 0.05, 0.22);
      wh.rotation.z = Math.PI / 2 + side * (0.1 + i * 0.12);
      group.add(wh);
    }
  }

  // -- Grande carte a jouer dans la main droite --
  const card = new THREE.Group();
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf6f0e0, roughness: 0.6 }));
  card.add(face);
  const pip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.10, 4),
    new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 }));
  pip.rotation.x = Math.PI / 2;
  pip.position.z = 0.02;
  card.add(pip);
  card.position.set(0.40, 0.46, 0.10);
  card.rotation.set(0.3, 0.4, 0.35);
  group.add(card);

  return group;
}
