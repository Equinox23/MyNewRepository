import * as THREE from 'three';

// Tofu : petit oiseau rond et duveteux. Corps spherique jaune, grands
// yeux, bec orange, petites ailes et pattes fines.
export function buildTofu() {
  const group = new THREE.Group();

  const featherMat = new THREE.MeshStandardMaterial({ color: 0xf2c93a, roughness: 0.85 });
  const featherDkMat = new THREE.MeshStandardMaterial({ color: 0xd9a324, roughness: 0.9 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xe8762a, roughness: 0.6 });
  const legMat  = new THREE.MeshStandardMaterial({ color: 0xd9762a, roughness: 0.7 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const eyeMat  = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 });

  // -- Pattes fines --
  for (const dx of [-0.10, 0.10]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.20, 6), legMat);
    leg.position.set(dx, 0.12, 0);
    group.add(leg);
    // Pied a 3 doigts
    for (const oz of [-0.06, 0, 0.06]) {
      const toe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.09), legMat);
      toe.position.set(dx, 0.025, 0.03 + oz * 0.4);
      group.add(toe);
    }
  }

  // -- Corps spherique duveteux --
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), featherMat);
  body.position.y = 0.52;
  body.scale.set(1, 0.95, 0.95);
  body.castShadow = true;
  group.add(body);
  // Ventre plus clair
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), new THREE.MeshStandardMaterial({ color: 0xfde89a, roughness: 0.85 }));
  belly.position.set(0, 0.46, 0.16);
  belly.scale.set(1, 1, 0.5);
  group.add(belly);

  // -- Ailes --
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), featherDkMat);
    wing.position.set(side * 0.32, 0.54, -0.02);
    wing.scale.set(0.45, 1.0, 0.7);
    wing.rotation.z = side * 0.3;
    wing.castShadow = true;
    group.add(wing);
  }

  // -- Touffe de plumes sur la tete --
  for (let i = 0; i < 3; i++) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 6), featherDkMat);
    tuft.position.set((i - 1) * 0.05, 0.86, 0);
    tuft.rotation.z = (i - 1) * 0.25;
    group.add(tuft);
  }

  // -- Yeux : tres grands --
  for (const dx of [-0.13, 0.13]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), eyeWhiteMat);
    white.position.set(dx, 0.60, 0.24);
    white.scale.set(1, 1.15, 0.6);
    group.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), eyeMat);
    pupil.position.set(dx, 0.59, 0.31);
    group.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeWhiteMat);
    glint.position.set(dx + 0.02, 0.63, 0.35);
    group.add(glint);
  }

  // -- Bec : deux cones --
  const beakTop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 8), beakMat);
  beakTop.rotation.x = Math.PI / 2;
  beakTop.position.set(0, 0.50, 0.34);
  group.add(beakTop);
  const beakBot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.10, 8), beakMat);
  beakBot.rotation.x = Math.PI / 2;
  beakBot.position.set(0, 0.44, 0.31);
  group.add(beakBot);

  // -- Petite queue --
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.22, 6), featherDkMat);
  tail.rotation.x = -Math.PI / 2.4;
  tail.position.set(0, 0.50, -0.34);
  group.add(tail);

  return group;
}
