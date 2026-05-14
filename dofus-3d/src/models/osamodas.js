import * as THREE from 'three';

// Osamodas : invocateur en tunique verte + cape brune fourree avec
// oreilles d animal (capuche), portant un baton avec un orbe d emeraude
// en bout. Volontairement different du Iop (rouge / sword) avec une
// palette nature.
export function buildOsamodas() {
  const group = new THREE.Group();

  const tunicGreen  = 0x3a7a32;
  const tunicLight  = 0x6aa548;
  const skinColor   = 0xe5b88c;
  const beltColor   = 0x5a3a1a;
  const goldColor   = 0xd4a017;
  const capeColor   = 0x7a4f1e;
  const furColor    = 0xcfa970;
  const pantsColor  = 0x2a4d20;
  const bootColor   = 0x3a1f08;
  const orbColor    = 0x2ecc71;

  const tunicMat = new THREE.MeshStandardMaterial({ color: tunicGreen, roughness: 0.75 });
  const tunicLightMat = new THREE.MeshStandardMaterial({ color: tunicLight, roughness: 0.7 });
  const skinMat  = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.75 });
  const goldMat  = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.55 });
  const beltMat  = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.85 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 });
  const bootMat  = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.95 });
  const capeMat  = new THREE.MeshStandardMaterial({ color: capeColor, side: THREE.DoubleSide, roughness: 0.8 });
  const furMat   = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.95, flatShading: true });

  // -- Bottes en cuir sombre --
  for (const dx of [-0.12, 0.12]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.26), bootMat);
    boot.position.set(dx, 0.05, 0.05);
    boot.castShadow = true;
    group.add(boot);
  }

  // -- Jambes --
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.22, 10), pantsMat);
    leg.position.set(dx, 0.21, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // -- Tunique verte tronconique --
  const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.22, 0.46, 16), tunicMat);
  tunic.position.y = 0.56;
  tunic.castShadow = true;
  group.add(tunic);

  // Bordure inferieure plus claire (jupe / tunique evasee)
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.10, 16), tunicLightMat);
  skirt.position.y = 0.36;
  group.add(skirt);

  // Broderie : V doree sur le torse
  const embroideryV = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.020, 8, 24, Math.PI * 0.6), goldMat);
  embroideryV.position.set(0, 0.62, 0.27);
  embroideryV.rotation.x = -Math.PI / 2;
  embroideryV.rotation.y = Math.PI;
  group.add(embroideryV);

  // -- Ceinture cuir --
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16), beltMat);
  belt.position.y = 0.38;
  group.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.04), goldMat);
  buckle.position.set(0, 0.38, 0.30);
  group.add(buckle);

  // -- Cape brune (plane subdivisee, courbure douce) --
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.80, 4, 4), capeMat);
  const pos = cape.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) + Math.pow((pos.getY(i) + 0.40) * -0.55, 2) * 0.18);
  }
  cape.geometry.computeVertexNormals();
  cape.position.set(0, 0.55, -0.30);
  cape.castShadow = true;
  group.add(cape);

  // Col fourrure
  const furCollar = new THREE.Mesh(new THREE.SphereGeometry(0.20, 14, 10), furMat);
  furCollar.position.set(0, 0.86, -0.16);
  furCollar.scale.set(1.7, 0.50, 0.85);
  furCollar.castShadow = true;
  group.add(furCollar);

  // -- Bras avec manchons et mains skin --
  for (const dx of [-0.32, 0.32]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.38, 10), tunicMat);
    arm.position.set(dx, 0.56, 0);
    arm.castShadow = true;
    group.add(arm);
    // Manchon dore
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.06, 10), goldMat);
    cuff.position.set(dx, 0.38, 0);
    group.add(cuff);
    // Main
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), skinMat);
    hand.position.set(dx, 0.34, 0);
    hand.castShadow = true;
    group.add(hand);
  }

  // -- Tete --
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), skinMat);
  head.position.y = 1.00;
  head.castShadow = true;
  group.add(head);

  // -- Capuche brune par-dessus la tete (calotte) --
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
    capeMat
  );
  hood.position.y = 1.00;
  hood.castShadow = true;
  group.add(hood);

  // Bordure dorée sur le rebord avant de la capuche
  const hoodRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.022, 8, 24, Math.PI), goldMat);
  hoodRim.position.set(0, 0.85, 0.16);
  hoodRim.rotation.x = Math.PI / 2;
  hoodRim.rotation.y = Math.PI / 2;
  group.add(hoodRim);

  // -- Oreilles d animal qui pointent sur la capuche --
  for (const dx of [-0.18, 0.18]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 5), new THREE.MeshStandardMaterial({
      color: capeColor, roughness: 0.85,
    }));
    ear.position.set(dx, 1.20, -0.02);
    ear.rotation.z = dx > 0 ? -0.35 : 0.35;
    ear.castShadow = true;
    group.add(ear);
    // Pointe interieure plus claire (oreille de panthere)
    const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.10, 5), furMat);
    earIn.position.set(dx, 1.18, 0);
    earIn.rotation.z = dx > 0 ? -0.35 : 0.35;
    group.add(earIn);
  }

  // -- Yeux verts --
  for (const dx of [-0.08, 0.08]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
    white.position.set(dx, 0.99, 0.23);
    group.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: orbColor }));
    pupil.position.set(dx, 0.99, 0.27);
    group.add(pupil);
  }

  // -- Baton avec orbe vert (l Osamodas est invocateur, le baton focalise sa magie) --
  const staff = new THREE.Group();
  // Manche en bois
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.10, 8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 }));
  shaft.position.y = 0;
  shaft.castShadow = true;
  staff.add(shaft);
  // Anneau dore sous l orbe
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), goldMat);
  ring.position.y = 0.50;
  ring.rotation.x = Math.PI / 2;
  staff.add(ring);
  // Orbe en cristal emeraude
  const orb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.11),
    new THREE.MeshStandardMaterial({
      color: orbColor, metalness: 0.45, roughness: 0.12,
      emissive: 0x1f6e3a, emissiveIntensity: 0.6,
    })
  );
  orb.position.y = 0.62;
  orb.castShadow = true;
  staff.add(orb);
  // 3 pointes d ancrage autour de l orbe (style cage cristalliere)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.10, 6), goldMat);
    claw.position.set(Math.cos(a) * 0.10, 0.55, Math.sin(a) * 0.10);
    claw.rotation.set(0, -a, Math.PI);
    staff.add(claw);
  }
  staff.position.set(0.36, 0.70, -0.02);
  staff.rotation.z = -0.18;
  group.add(staff);

  return group;
}
