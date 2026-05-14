import * as THREE from 'three';

// Roublard : assassin / artificier discret. Capuche profonde, masque de
// metal sombre couvrant le bas du visage, yeux rouges qui brillent,
// armure de cuir noir avec plaques bleu nuit, ceinture chargee de fioles
// et de bombes, deux dagues croisees dans le dos.
export function buildRoublard() {
  const group = new THREE.Group();

  const cloak       = 0x111623; // tissu noir-bleute
  const cloakDark   = 0x080a14;
  const leather     = 0x1f1410; // cuir noir
  const plate       = 0x2a3a55; // plaque bleu nuit
  const plateLight  = 0x4a6080;
  const skin        = 0xeed6b3;
  const beltColor   = 0x3a2412;
  const beltDark    = 0x1c100a;
  const goldColor   = 0xb8902a;
  const blade       = 0xc8cdd4;
  const bladeDark   = 0x6e757f;
  const accentRed   = 0xc0392b;
  const accentDark  = 0x6d1f17;
  const eyeGlow     = 0xff5544;
  const fuse        = 0x3a3025;
  const fuseSpark   = 0xffd166;
  const bomb        = 0x18191b;

  const cloakMat   = new THREE.MeshStandardMaterial({ color: cloak, roughness: 0.85, side: THREE.DoubleSide });
  const cloakDarkMat = new THREE.MeshStandardMaterial({ color: cloakDark, roughness: 0.9 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: leather, roughness: 0.9 });
  const plateMat   = new THREE.MeshStandardMaterial({ color: plate, roughness: 0.45, metalness: 0.55 });
  const plateLightMat = new THREE.MeshStandardMaterial({ color: plateLight, roughness: 0.4, metalness: 0.6 });
  const skinMat    = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
  const beltMat    = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.85 });
  const beltDarkMat = new THREE.MeshStandardMaterial({ color: beltDark, roughness: 0.9 });
  const goldMat    = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.7 });
  const bladeMat   = new THREE.MeshStandardMaterial({ color: blade, roughness: 0.2, metalness: 0.9 });
  const bladeDarkMat = new THREE.MeshStandardMaterial({ color: bladeDark, roughness: 0.35, metalness: 0.8 });
  const accentRedMat = new THREE.MeshStandardMaterial({ color: accentRed, roughness: 0.6 });
  const accentDarkMat = new THREE.MeshStandardMaterial({ color: accentDark, roughness: 0.7 });
  const eyeMat     = new THREE.MeshStandardMaterial({ color: eyeGlow, emissive: 0xff2218, emissiveIntensity: 1.0, roughness: 0.4 });
  const bombMat    = new THREE.MeshStandardMaterial({ color: bomb, roughness: 0.5, metalness: 0.4 });
  const fuseMat    = new THREE.MeshStandardMaterial({ color: fuse, roughness: 0.9 });
  const sparkMat   = new THREE.MeshStandardMaterial({ color: fuseSpark, emissive: 0xff8a00, emissiveIntensity: 0.9, roughness: 0.3 });

  // -- Bottes pointues, cuir noir --
  for (const dx of [-0.12, 0.12]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.28), leatherMat);
    boot.position.set(dx, 0.05, 0.05);
    boot.castShadow = true;
    group.add(boot);
    // Embout pointu
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.10, 8), leatherMat);
    tip.position.set(dx, 0.05, 0.21);
    tip.rotation.x = Math.PI / 2;
    group.add(tip);
  }

  // -- Jambes (pantalon serre) --
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.30, 10), cloakDarkMat);
    leg.position.set(dx, 0.26, 0);
    leg.castShadow = true;
    group.add(leg);
    // Sangle de cuir
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 6, 12), beltMat);
    strap.position.set(dx, 0.20, 0);
    strap.rotation.x = Math.PI / 2;
    group.add(strap);
  }

  // -- Torse : tunique souple bleu nuit + plastron leger --
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.20, 0.46, 14), cloakMat);
  torso.position.y = 0.60;
  torso.castShadow = true;
  group.add(torso);
  // Plaque pectorale leger metal bleu (juste devant, pas tout autour).
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10, 0, Math.PI, 0, Math.PI), plateMat);
  chest.position.set(0, 0.66, 0.06);
  chest.scale.set(1, 0.85, 0.55);
  chest.rotation.y = Math.PI;
  group.add(chest);
  // Liseré bleu clair en V sur le plastron
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.025), plateLightMat);
  stripe.position.set(0, 0.74, 0.27);
  stripe.rotation.z = -0.08;
  group.add(stripe);

  // -- Ceinture cuir avec garnitures (fioles + bombe) --
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 16), beltMat);
  belt.position.y = 0.40;
  group.add(belt);
  const beltEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.018, 16), beltDarkMat);
  beltEdge.position.y = 0.36;
  group.add(beltEdge);
  // Boucle metal
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.04), goldMat);
  buckle.position.set(0, 0.40, 0.27);
  group.add(buckle);
  // Bombe ronde noire avec meche cote droit
  const bombBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), bombMat);
  bombBall.position.set(0.21, 0.40, 0.16);
  bombBall.castShadow = true;
  group.add(bombBall);
  const bombFuse = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), fuseMat);
  bombFuse.position.set(0.24, 0.50, 0.18);
  bombFuse.rotation.z = -0.4;
  group.add(bombFuse);
  const bombSpark = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), sparkMat);
  bombSpark.position.set(0.27, 0.55, 0.19);
  group.add(bombSpark);
  // Fiole verte cote gauche
  const vialGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.10, 10),
    new THREE.MeshStandardMaterial({ color: 0x6ee07a, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.75 }));
  vialGlass.position.set(-0.21, 0.41, 0.16);
  group.add(vialGlass);
  const vialCap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 10), goldMat);
  vialCap.position.set(-0.21, 0.47, 0.16);
  group.add(vialCap);

  // -- Pauldrons souples (cuir noir, peu de volume) --
  for (const dx of [-0.30, 0.30]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), leatherMat);
    pauldron.position.set(dx, 0.76, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    // Bord rouge sang
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.013, 8, 16), accentDarkMat);
    ring.position.set(dx, 0.74, 0);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // -- Bras (manchons noirs + gants en cuir) --
  for (const dx of [-0.32, 0.32]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.36, 10), cloakDarkMat);
    arm.position.set(dx, 0.56, 0);
    arm.castShadow = true;
    group.add(arm);
    // Bracelet metal
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.10, 10), plateMat);
    bracer.position.set(dx, 0.42, 0);
    group.add(bracer);
    // Liseré rouge
    const bracerStripe = new THREE.Mesh(new THREE.TorusGeometry(0.084, 0.008, 6, 12), accentRedMat);
    bracerStripe.position.set(dx, 0.42, 0);
    bracerStripe.rotation.x = Math.PI / 2;
    group.add(bracerStripe);
    // Main gantee
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.080, 12, 10), leatherMat);
    hand.position.set(dx, 0.34, 0);
    hand.castShadow = true;
    group.add(hand);
  }

  // -- Cape / pelerine longue dans le dos --
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.95, 4, 4), cloakMat);
  const pos = cape.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) + Math.pow((y + 0.47) * -0.6, 2) * 0.18);
  }
  cape.geometry.computeVertexNormals();
  cape.position.set(0, 0.50, -0.24);
  cape.castShadow = true;
  group.add(cape);

  // -- Tete : peau cachee derriere capuche profonde + masque metallique --
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), skinMat);
  head.position.y = 1.00;
  head.castShadow = true;
  group.add(head);

  // Capuche : demi-sphere avancee au dessus du visage.
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), cloakMat);
  hood.position.set(0, 1.01, -0.02);
  hood.castShadow = true;
  group.add(hood);
  // Cone front pointu de la capuche (allongee).
  const hoodTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.20, 14), cloakMat);
  hoodTip.position.set(0, 1.18, -0.13);
  hoodTip.rotation.x = -0.55;
  group.add(hoodTip);
  // Ombre profonde sous la capuche : disque sombre cachant le haut du visage.
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  shadow.position.set(0, 1.02, 0.21);
  group.add(shadow);

  // Masque metallique inferieur : couvre nez/bouche, en plaque sombre.
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10, 0, Math.PI, 0, Math.PI), plateMat);
  mask.position.set(0, 0.92, 0.04);
  mask.scale.set(1, 0.55, 0.55);
  mask.rotation.y = Math.PI;
  group.add(mask);
  // Liseré rouge bas du masque
  const maskRim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.010, 6, 18, Math.PI), accentRedMat);
  maskRim.position.set(0, 0.86, 0.04);
  maskRim.rotation.x = Math.PI / 2;
  group.add(maskRim);

  // -- Yeux rouges qui brillent (lueurs sous la capuche) --
  for (const dx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.030, 10, 8), eyeMat);
    eye.position.set(dx, 1.02, 0.21);
    group.add(eye);
    // Halo
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.050, 10, 8),
      new THREE.MeshBasicMaterial({ color: eyeGlow, transparent: true, opacity: 0.35 }));
    halo.position.set(dx, 1.02, 0.21);
    group.add(halo);
  }

  // -- Deux dagues croisees dans le dos --
  const makeDagger = () => {
    const dagger = new THREE.Group();
    const db = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.36, 8), bladeMat);
    db.position.y = 0.18;
    db.castShadow = true;
    dagger.add(db);
    // Tranche centrale plus sombre
    const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.30, 0.014), bladeDarkMat);
    fuller.position.y = 0.18;
    dagger.add(fuller);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.022, 0.04), goldMat);
    guard.position.y = -0.005;
    dagger.add(guard);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.10, 8), beltMat);
    handle.position.y = -0.06;
    dagger.add(handle);
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), accentDarkMat);
    pommel.position.y = -0.12;
    dagger.add(pommel);
    return dagger;
  };
  const daggerL = makeDagger();
  daggerL.position.set(-0.16, 0.66, -0.18);
  daggerL.rotation.set(Math.PI / 6, 0, -0.7);
  group.add(daggerL);
  const daggerR = makeDagger();
  daggerR.position.set(0.16, 0.66, -0.18);
  daggerR.rotation.set(Math.PI / 6, 0, 0.7);
  group.add(daggerR);

  return group;
}
