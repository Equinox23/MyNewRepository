import * as THREE from 'three';

// Iop guerrier - version retravaillee avec pauldrons (epaulieres), visor
// au casque, bracers, ceinture sculptee, gardes-greaves, cape plus
// volumineuse, epee dans le dos plus detaillee.
export function buildIop() {
  const group = new THREE.Group();

  const armorRed   = 0xc0392b;
  const armorDark  = 0x7a1f17;
  const armorLight = 0xff6b5b;
  const skinColor  = 0xf4d3a5;
  const beltColor  = 0x5a3a1a;
  const beltDark   = 0x3a2310;
  const goldColor  = 0xf1c40f;
  const goldDark   = 0x7a5d0a;
  const capeColor  = 0x7c1f17;
  const pantsColor = 0x3a2a14;
  const bootColor  = 0x1a0d05;
  const sigil      = 0xfff0c8;

  const armorMat = new THREE.MeshStandardMaterial({ color: armorRed, roughness: 0.55, metalness: 0.15 });
  const armorMatDark = new THREE.MeshStandardMaterial({ color: armorDark, roughness: 0.6 });
  const skinMat  = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.75 });
  const goldMat  = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.35, metalness: 0.6 });
  const goldDarkMat = new THREE.MeshStandardMaterial({ color: goldDark, roughness: 0.5, metalness: 0.5 });
  const beltMat  = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.85 });
  const beltDarkMat = new THREE.MeshStandardMaterial({ color: beltDark, roughness: 0.9 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 });
  const bootMat  = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.95 });

  // -- Bottes avec semelle plate et metal d acier --
  for (const dx of [-0.12, 0.12]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.26), bootMat);
    boot.position.set(dx, 0.05, 0.05);
    boot.castShadow = true;
    group.add(boot);
    // Embout de fer dore
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.08), goldDarkMat);
    tip.position.set(dx, 0.04, 0.16);
    group.add(tip);
  }

  // -- Jambes (pantalon) --
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.24, 10), pantsMat);
    leg.position.set(dx, 0.23, 0);
    leg.castShadow = true;
    group.add(leg);
    // Genouilliere doree
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), goldMat);
    knee.position.set(dx, 0.16, 0.08);
    knee.scale.set(1.1, 0.6, 1.1);
    group.add(knee);
  }

  // -- Greaves (gardes-bottes en plaques) au-dessus des bottes --
  for (const dx of [-0.12, 0.12]) {
    const grv = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.14, 10), armorMat);
    grv.position.set(dx, 0.18, 0);
    group.add(grv);
  }

  // -- Torse principal (tronconique) --
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.46, 16), armorMat);
  torso.position.y = 0.58;
  torso.castShadow = true;
  group.add(torso);

  // Plaques claire devant (pectoraux)
  const breastL = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 8), new THREE.MeshStandardMaterial({ color: armorLight, roughness: 0.5 }));
  breastL.position.set(-0.10, 0.66, 0.22);
  breastL.scale.set(1, 1, 0.5);
  group.add(breastL);
  const breastR = breastL.clone();
  breastR.position.x = 0.10;
  group.add(breastR);

  // Bordure doree haute de plastron
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 24), goldMat);
  collar.position.y = 0.79;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  // -- Ceinture sculptee --
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), beltMat);
  belt.position.y = 0.38;
  group.add(belt);
  // Bord cuir sombre
  const beltEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.02, 16), beltDarkMat);
  beltEdge.position.y = 0.34;
  group.add(beltEdge);
  // Boucle doree centrale
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.05), goldMat);
  buckle.position.set(0, 0.38, 0.30);
  group.add(buckle);

  // -- Etoile insigne Iop sur le plastron --
  const sigilMat = new THREE.MeshStandardMaterial({ color: sigil, roughness: 0.4, metalness: 0.4 });
  const star = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.04, 5), sigilMat);
  star.position.set(0, 0.60, 0.30);
  star.rotation.x = Math.PI / 2;
  star.rotation.z = Math.PI;
  group.add(star);

  // -- Pauldrons (epaulieres bombees) --
  for (const dx of [-0.32, 0.32]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), armorMat);
    pauldron.position.set(dx, 0.74, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    // Liseré dore sur l epauliere
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 16), goldMat);
    ring.position.set(dx, 0.74, 0);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // -- Bras (manchons + mains skin) --
  for (const dx of [-0.34, 0.34]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.34, 10), armorMat);
    arm.position.set(dx, 0.56, 0);
    arm.castShadow = true;
    group.add(arm);
    // Bracer dore avant-bras
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.13, 10), goldDarkMat);
    bracer.position.set(dx, 0.42, 0);
    group.add(bracer);
    // Main
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), skinMat);
    hand.position.set(dx, 0.34, 0);
    hand.castShadow = true;
    group.add(hand);
  }

  // -- Cape (deux pans pour effet de volume) --
  const capeMat = new THREE.MeshStandardMaterial({ color: capeColor, side: THREE.DoubleSide, roughness: 0.8 });
  const capeMain = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78, 4, 4), capeMat);
  // Courbure douce vers l avant en bas
  const pos = capeMain.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setZ(i, pos.getZ(i) + Math.pow((y + 0.39) * -0.6, 2) * 0.15);
  }
  capeMain.geometry.computeVertexNormals();
  capeMain.position.set(0, 0.55, -0.28);
  capeMain.castShadow = true;
  group.add(capeMain);
  // Bordure doree haute
  const capeRim = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.022, 6, 16, Math.PI), goldMat);
  capeRim.position.set(0, 0.85, -0.28);
  capeRim.rotation.x = Math.PI / 2;
  group.add(capeRim);

  // -- Tete (sphere chibi assez grosse) --
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), skinMat);
  head.position.y = 1.00;
  head.castShadow = true;
  group.add(head);

  // -- Casque : calotte demi-sphere + visor + nasale --
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), armorMat);
  helm.position.y = 1.00;
  helm.castShadow = true;
  group.add(helm);
  // Visor (bandeau horizontal sombre devant)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.07), armorMatDark);
  visor.position.set(0, 0.99, 0.22);
  group.add(visor);
  // Nasale (barre verticale qui descend du casque sur le nez)
  const nasale = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.04), armorMatDark);
  nasale.position.set(0, 0.93, 0.26);
  group.add(nasale);
  // Liseré dore tour du casque
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 24), goldMat);
  stripe.position.y = 0.96;
  stripe.rotation.x = Math.PI / 2;
  group.add(stripe);

  // -- Panache (3 plumes dorees) --
  for (let i = 0; i < 3; i++) {
    const featherCol = i % 2 === 0 ? goldColor : 0xfffac8;
    const feather = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.20, 8),
      new THREE.MeshStandardMaterial({ color: featherCol, roughness: 0.5, metalness: 0.3 })
    );
    feather.position.set((i - 1) * 0.04, 1.28 + Math.abs(i - 1) * -0.02, -0.02);
    feather.rotation.z = (i - 1) * 0.15;
    feather.castShadow = true;
    group.add(feather);
  }

  // -- Yeux + sourcils --
  const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  eyeWhite.position.set(-0.08, 0.99, 0.23);
  group.add(eyeWhite);
  const eyeWhite2 = eyeWhite.clone();
  eyeWhite2.position.x = 0.08;
  group.add(eyeWhite2);
  const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  eyePupil.position.set(-0.07, 0.99, 0.27);
  group.add(eyePupil);
  const eyePupil2 = eyePupil.clone();
  eyePupil2.position.x = 0.07;
  group.add(eyePupil2);

  // -- Epee posee sur l epaule droite --
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.76, 0.018),
    new THREE.MeshStandardMaterial({ color: 0xdde3e8, roughness: 0.25, metalness: 0.85 })
  );
  blade.position.y = 0.52;
  blade.castShadow = true;
  sword.add(blade);
  // Tranche fileuse au centre de la lame
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.66, 0.022), new THREE.MeshStandardMaterial({ color: 0xa0a8b0, roughness: 0.4, metalness: 0.7 }));
  fuller.position.y = 0.52;
  sword.add(fuller);
  // Garde + pommeau
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.06), goldMat);
  guard.position.y = 0.14;
  sword.add(guard);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 10), beltMat);
  handle.position.y = 0.08;
  sword.add(handle);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), goldMat);
  pommel.position.y = 0.02;
  sword.add(pommel);
  sword.position.set(0.34, 0.78, -0.06);
  sword.rotation.z = -0.22;
  group.add(sword);

  return group;
}
