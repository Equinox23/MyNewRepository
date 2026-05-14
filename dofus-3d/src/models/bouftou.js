import * as THREE from 'three';

// Bouftou : grosse boule de laine jaune, 4 pattes courtes, masque facial
// noir avec yeux rouges glow, deux cornes blanches incurvees, bouclettes
// autour du corps.
export function buildBouftou() {
  const group = new THREE.Group();

  // Pattes
  const legGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a0d05, roughness: 0.9 });
  for (const [dx, dz] of [[-0.20, 0.16], [0.20, 0.16], [-0.20, -0.16], [0.20, -0.16]]) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(dx, 0.09, dz);
    leg.castShadow = true;
    group.add(leg);
  }
  // Sabots
  const hoofGeom = new THREE.BoxGeometry(0.16, 0.07, 0.20);
  const hoofMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.95 });
  for (const [dx, dz] of [[-0.20, 0.16], [0.20, 0.16], [-0.20, -0.16], [0.20, -0.16]]) {
    const hoof = new THREE.Mesh(hoofGeom, hoofMat);
    hoof.position.set(dx, 0.035, dz);
    hoof.castShadow = true;
    group.add(hoof);
  }

  // Corps : grosse sphere jaune fluffy
  const bodyGeom = new THREE.SphereGeometry(0.45, 16, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf1c40f, roughness: 0.95, flatShading: true,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 0.50;
  body.castShadow = true;
  group.add(body);

  // Bouclettes de laine autour du corps (petites spheres)
  const curlGeom = new THREE.SphereGeometry(0.13, 10, 8);
  const curlMat = new THREE.MeshStandardMaterial({
    color: 0xfff3a0, roughness: 0.95, flatShading: true,
  });
  const curls = [
    [-0.40, 0.55, 0.10],
    [0.40, 0.55, 0.10],
    [-0.32, 0.70, -0.18],
    [0.32, 0.70, -0.18],
    [-0.18, 0.85, 0.05],
    [0.18, 0.85, 0.05],
    [0, 0.45, -0.40],
    [-0.35, 0.30, -0.22],
    [0.35, 0.30, -0.22],
    [-0.25, 0.30, 0.32],
    [0.25, 0.30, 0.32],
    [0, 0.45, 0.40],
  ];
  for (const [x, y, z] of curls) {
    const curl = new THREE.Mesh(curlGeom, curlMat);
    curl.position.set(x, y, z);
    curl.castShadow = true;
    group.add(curl);
  }

  // Masque facial sombre
  const maskGeom = new THREE.SphereGeometry(0.30, 14, 10);
  const mask = new THREE.Mesh(
    maskGeom,
    new THREE.MeshStandardMaterial({ color: 0x1a0d05, roughness: 0.85 })
  );
  mask.position.set(0, 0.50, 0.32);
  mask.scale.set(1.1, 0.75, 0.55);
  group.add(mask);

  // Yeux rouges glow
  const eyeGeom = new THREE.SphereGeometry(0.05, 10, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
  for (const dx of [-0.10, 0.10]) {
    const eye = new THREE.Mesh(eyeGeom, eyeMat);
    eye.position.set(dx, 0.56, 0.44);
    group.add(eye);
    // halo glow
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: 0.3 })
    );
    halo.position.copy(eye.position);
    group.add(halo);
  }

  // Cornes blanches courbees
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfdfefe, roughness: 0.4 });
  for (const dx of [-0.28, 0.28]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 10), hornMat);
    horn.position.set(dx, 0.82, 0.10);
    horn.rotation.z = dx < 0 ? 0.6 : -0.6;
    horn.castShadow = true;
    group.add(horn);
  }

  // Petite touffe sur le sommet
  const tuftGeom = new THREE.SphereGeometry(0.10, 8, 6);
  const tuft = new THREE.Mesh(tuftGeom, curlMat);
  tuft.position.set(0, 0.95, 0);
  tuft.castShadow = true;
  group.add(tuft);

  return group;
}
