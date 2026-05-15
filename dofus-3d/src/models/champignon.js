import * as THREE from 'three';

// Champignon : creature mycelienne. Gros chapeau bombe a pois, pied
// trapu, petits yeux et bras courts.
export function buildChampignon() {
  const group = new THREE.Group();

  const capMat   = new THREE.MeshStandardMaterial({ color: 0x8e3b34, roughness: 0.85 });
  const capDkMat = new THREE.MeshStandardMaterial({ color: 0x6a2a26, roughness: 0.9 });
  const dotMat   = new THREE.MeshStandardMaterial({ color: 0xf3ead2, roughness: 0.8 });
  const stemMat  = new THREE.MeshStandardMaterial({ color: 0xe6dcc0, roughness: 0.9 });
  const gillMat  = new THREE.MeshStandardMaterial({ color: 0xc9a98c, roughness: 0.9 });
  const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

  // -- Petits pieds --
  for (const dx of [-0.12, 0.12]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), stemMat);
    foot.position.set(dx, 0.07, 0.03);
    foot.scale.set(1, 0.6, 1.2);
    foot.castShadow = true;
    group.add(foot);
  }

  // -- Pied trapu (le corps) --
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.50, 16), stemMat);
  stem.position.y = 0.36;
  stem.castShadow = true;
  group.add(stem);
  // Anneau (collerette) autour du pied
  const skirt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 20), gillMat);
  skirt.position.y = 0.50;
  skirt.rotation.x = Math.PI / 2;
  group.add(skirt);

  // -- Yeux sur le pied --
  for (const dx of [-0.10, 0.10]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), eyeWhiteMat);
    white.position.set(dx, 0.42, 0.21);
    white.scale.set(1, 1.1, 0.6);
    group.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), eyeMat);
    pupil.position.set(dx, 0.41, 0.27);
    group.add(pupil);
  }

  // -- Petits bras --
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.20, 8), stemMat);
    arm.position.set(side * 0.27, 0.34, 0.02);
    arm.rotation.z = side * 0.8;
    group.add(arm);
  }

  // -- Dessous du chapeau : lamelles --
  const gills = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.30, 0.10, 20), gillMat);
  gills.position.y = 0.66;
  group.add(gills);

  // -- Chapeau bombe --
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.50, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), capMat);
  cap.position.y = 0.66;
  cap.castShadow = true;
  group.add(cap);
  // Bord plus sombre
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.05, 8, 24), capDkMat);
  rim.position.y = 0.68;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);
  // Pois sur le chapeau
  const dotSpots = [
    [0, 1.06, 0], [0.22, 0.96, 0.12], [-0.20, 0.95, 0.14],
    [0.10, 0.92, -0.26], [-0.14, 0.90, -0.22], [0.28, 0.86, -0.08],
  ];
  for (const [x, y, z] of dotSpots) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), dotMat);
    dot.position.set(x, y, z);
    dot.scale.set(1, 0.5, 1);
    group.add(dot);
  }

  return group;
}
