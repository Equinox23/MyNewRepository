import * as THREE from 'three';

// Bouftou : boule de laine cornue.
// Version retravaillee : ~20 bouclettes pour donner du volume,
// cornes courbees (capsules tronconiques empilees), sabots + queue,
// masque facial sombre, yeux rouges glow + crocs.
export function buildBouftou() {
  const group = new THREE.Group();

  const woolColor = 0xf1c40f;
  const woolLight = 0xfff3a0;
  const hoofColor = 0x000000;
  const maskColor = 0x1a0d05;
  const eyeRed    = 0xe74c3c;
  const hornColor = 0xfdfefe;
  const legColor  = 0x1a0d05;

  const woolMat = new THREE.MeshStandardMaterial({ color: woolColor, roughness: 0.95, flatShading: true });
  const woolLightMat = new THREE.MeshStandardMaterial({ color: woolLight, roughness: 0.95, flatShading: true });
  const hoofMat = new THREE.MeshStandardMaterial({ color: hoofColor, roughness: 0.95 });
  const maskMat = new THREE.MeshStandardMaterial({ color: maskColor, roughness: 0.85 });
  const eyeMat  = new THREE.MeshBasicMaterial({ color: eyeRed });
  const eyeGlow = new THREE.MeshBasicMaterial({ color: eyeRed, transparent: true, opacity: 0.35 });
  const hornMat = new THREE.MeshStandardMaterial({ color: hornColor, roughness: 0.4 });
  const legMat  = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.9 });

  // -- 4 pattes courtes --
  for (const [dx, dz] of [[-0.22, 0.18], [0.22, 0.18], [-0.22, -0.18], [0.22, -0.18]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 8), legMat);
    leg.position.set(dx, 0.10, dz);
    leg.castShadow = true;
    group.add(leg);
    const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.20), hoofMat);
    hoof.position.set(dx, 0.04, dz);
    hoof.castShadow = true;
    group.add(hoof);
  }

  // -- Corps : sphere principale --
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 14), woolMat);
  body.position.y = 0.52;
  body.castShadow = true;
  group.add(body);

  // -- ~22 bouclettes scattered sur le corps pour un effet "moutonneux" --
  const curlPositions = [
    // Couronne autour du corps
    [-0.42, 0.52, 0.16], [0.42, 0.52, 0.16],
    [-0.32, 0.72, 0.20], [0.32, 0.72, 0.20],
    [-0.18, 0.86, 0.10], [0.18, 0.86, 0.10],
    [0, 0.92, -0.05],
    [-0.32, 0.72, -0.20], [0.32, 0.72, -0.20],
    [-0.42, 0.52, -0.16], [0.42, 0.52, -0.16],
    // Anneau bas
    [-0.30, 0.30, 0.30], [0.30, 0.30, 0.30],
    [-0.30, 0.30, -0.30], [0.30, 0.30, -0.30],
    [0, 0.32, 0.42], [0, 0.32, -0.42],
    // Petites bouclettes
    [-0.42, 0.40, 0.08], [0.42, 0.40, 0.08],
    [-0.42, 0.62, -0.08], [0.42, 0.62, -0.08],
    [0, 0.80, 0.32],
  ];
  for (const [x, y, z] of curlPositions) {
    const r = 0.10 + ((x + y + z) % 0.04);
    const isLight = (x + y + z) > 0.4;
    const curl = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), isLight ? woolLightMat : woolMat);
    curl.position.set(x, y, z);
    curl.castShadow = true;
    group.add(curl);
  }

  // -- Masque facial sombre, allonge horizontalement --
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), maskMat);
  mask.position.set(0, 0.52, 0.34);
  mask.scale.set(1.05, 0.65, 0.55);
  group.add(mask);

  // -- Yeux rouges glow --
  for (const dx of [-0.10, 0.10]) {
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), eyeGlow);
    halo.position.set(dx, 0.58, 0.48);
    group.add(halo);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat);
    eye.position.set(dx, 0.58, 0.50);
    group.add(eye);
  }

  // -- Crocs blancs (petits triangles sous le masque) --
  const fangMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  for (const dx of [-0.06, 0.06]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 4), fangMat);
    fang.position.set(dx, 0.34, 0.46);
    fang.rotation.x = Math.PI;
    group.add(fang);
  }

  // -- Cornes blanches courbees (2 cones empiles avec rotation) --
  const hornGroup = (side) => {
    const g = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.20, 8), hornMat);
    c1.position.y = 0.10;
    c1.castShadow = true;
    g.add(c1);
    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.18, 8), hornMat);
    c2.position.set(side * 0.06, 0.26, 0);
    c2.rotation.z = side * -0.7;
    c2.castShadow = true;
    g.add(c2);
    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.10, 8), hornMat);
    c3.position.set(side * 0.14, 0.36, 0);
    c3.rotation.z = side * -1.0;
    c3.castShadow = true;
    g.add(c3);
    return g;
  };
  const leftHorn = hornGroup(-1);
  leftHorn.position.set(-0.22, 0.85, 0.16);
  group.add(leftHorn);
  const rightHorn = hornGroup(1);
  rightHorn.position.set(0.22, 0.85, 0.16);
  group.add(rightHorn);

  // -- Touffe sommet (boule de laine) --
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), woolLightMat);
  tuft.position.set(0, 1.00, 0);
  tuft.castShadow = true;
  group.add(tuft);

  // -- Petite queue laineuse a l arriere --
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), woolLightMat);
  tail.position.set(0, 0.55, -0.44);
  tail.castShadow = true;
  group.add(tail);

  return group;
}
