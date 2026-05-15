import * as THREE from 'three';

// Xelor : maitre du temps. Longue robe bleu nuit, large chapeau pointu,
// cadran d horloge lumineux sur le torse, baton surmonte d un sablier.
export function buildXelor() {
  const group = new THREE.Group();

  const robe     = 0x1f2a55;
  const robeDk   = 0x121a38;
  const robeLt   = 0x35468a;
  const gold     = 0xd9b44a;
  const skin     = 0xe7c9a6;
  const glow     = 0x6fd6ff;

  const robeMat   = new THREE.MeshStandardMaterial({ color: robe, roughness: 0.8 });
  const robeDkMat = new THREE.MeshStandardMaterial({ color: robeDk, roughness: 0.85 });
  const robeLtMat = new THREE.MeshStandardMaterial({ color: robeLt, roughness: 0.75 });
  const goldMat   = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.6, roughness: 0.3 });
  const skinMat   = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
  const glowMat   = new THREE.MeshStandardMaterial({ color: glow, emissive: 0x2bb6e0, emissiveIntensity: 0.9, roughness: 0.4 });

  // -- Robe : large cone qui touche le sol --
  const robeBody = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 20), robeMat);
  robeBody.position.y = 0.47;
  robeBody.castShadow = true;
  group.add(robeBody);
  // Ourlet plus sombre
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.10, 20), robeDkMat);
  hem.position.y = 0.06;
  group.add(hem);
  // Bande doree verticale devant
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.80, 0.02), goldMat);
  trim.position.set(0, 0.50, 0.40);
  trim.rotation.x = -0.06;
  group.add(trim);

  // -- Cadran d horloge lumineux sur le torse --
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 20), glowMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.78, 0.34);
  group.add(dial);
  const dialRim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 8, 22), goldMat);
  dialRim.position.set(0, 0.78, 0.35);
  group.add(dialRim);
  // Aiguilles
  const handH = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.09, 0.02), goldMat);
  handH.position.set(0, 0.82, 0.37);
  group.add(handH);
  const handM = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.02), goldMat);
  handM.position.set(0.03, 0.78, 0.37);
  group.add(handM);

  // -- Epaules / col --
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, 0.14, 16), robeLtMat);
  collar.position.y = 0.96;
  group.add(collar);

  // -- Bras larges (manches) --
  for (const side of [-1, 1]) {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.13, 0.40, 10), robeMat);
    sleeve.position.set(side * 0.30, 0.78, 0);
    sleeve.rotation.z = side * 0.18;
    sleeve.castShadow = true;
    group.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), skinMat);
    hand.position.set(side * 0.36, 0.57, 0);
    group.add(hand);
  }

  // -- Tete --
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), skinMat);
  head.position.y = 1.16;
  head.castShadow = true;
  group.add(head);
  for (const dx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), glowMat);
    eye.position.set(dx, 1.17, 0.18);
    group.add(eye);
  }

  // -- Grand chapeau pointu a large bord --
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.04, 24), robeDkMat);
  brim.position.y = 1.30;
  brim.castShadow = true;
  group.add(brim);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 20), robeMat);
  cone.position.y = 1.62;
  cone.castShadow = true;
  group.add(cone);
  // Le chapeau retombe : petite courbe au sommet
  const tipBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), goldMat);
  tipBall.position.set(0.04, 1.93, 0);
  group.add(tipBall);
  // Bande doree du chapeau
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.025, 8, 22), goldMat);
  hatBand.position.y = 1.35;
  hatBand.rotation.x = Math.PI / 2;
  group.add(hatBand);

  // -- Baton avec sablier --
  const staff = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 8), goldMat);
  staff.add(rod);
  // Sablier au sommet
  const hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 10), glowMat);
  hgTop.position.y = 0.64;
  staff.add(hgTop);
  const hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 10), glowMat);
  hgBot.position.y = 0.50;
  hgBot.rotation.x = Math.PI;
  staff.add(hgBot);
  const hgCage = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 14), goldMat);
  hgCage.position.y = 0.57;
  hgCage.rotation.x = Math.PI / 2;
  staff.add(hgCage);
  staff.position.set(0.40, 0.62, 0.08);
  staff.rotation.z = 0.10;
  group.add(staff);

  return group;
}
