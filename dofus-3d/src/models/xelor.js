import * as THREE from 'three';

// Xelor : maitre du temps, style chibi -- grosse tete ronde, robe
// conique bleu nuit, large chapeau pointu, cadran d horloge lumineux,
// baton a sablier. Regard cyan brillant.
export function buildXelor() {
  const group = new THREE.Group();

  const robe     = 0x24306a;
  const robeDk   = 0x141a3e;
  const robeLt   = 0x3e52a6;
  const gold     = 0xe8c14a;
  const goldDk   = 0x9a7d28;
  const skin     = 0xeccfa6;
  const skinDk   = 0xcdaa7e;
  const glow     = 0x73e0ff;

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.7, metalness: o.m || 0,
  });
  const robeMat   = M(robe, { r: 0.8 });
  const robeDkMat = M(robeDk, { r: 0.85 });
  const robeLtMat = M(robeLt, { r: 0.75 });
  const goldMat   = M(gold, { r: 0.35, m: 0.6 });
  const goldDkMat = M(goldDk, { r: 0.45, m: 0.5 });
  const skinMat   = M(skin, { r: 0.8 });
  const skinDkMat = M(skinDk, { r: 0.8 });
  const glowMat   = new THREE.MeshStandardMaterial({ color: glow, emissive: 0x33b8e0, emissiveIntensity: 1.0, roughness: 0.4 });
  const blackMat  = M(0x14121c, { r: 0.5 });

  // ============ ROBE (cone large jusqu au sol) ============
  const robeBody = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.92, 22), robeMat);
  robeBody.position.y = 0.46;
  robeBody.castShadow = true;
  group.add(robeBody);
  // Ourlet sombre.
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.12, 22), robeDkMat);
  hem.position.y = 0.07;
  group.add(hem);
  // Pans de robe : petits triangles dores en bas.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const v = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), goldMat);
    v.position.set(Math.cos(a) * 0.42, 0.14, Math.sin(a) * 0.42);
    group.add(v);
  }
  // Bande doree verticale.
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.74, 0.03), goldMat);
  trim.position.set(0, 0.50, 0.40);
  trim.rotation.x = -0.10;
  group.add(trim);

  // ============ CADRAN D HORLOGE sur le torse ============
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 22), glowMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.74, 0.36);
  group.add(dial);
  const dialRim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 10, 26), goldMat);
  dialRim.position.set(0, 0.74, 0.37);
  group.add(dialRim);
  // 4 reperes horaires.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.05, 0.02), goldDkMat);
    tick.position.set(Math.cos(a) * 0.14, 0.74 + Math.sin(a) * 0.14, 0.39);
    group.add(tick);
  }
  // Aiguilles.
  const handH = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.11, 0.02), goldDkMat);
  handH.position.set(0, 0.79, 0.40);
  group.add(handH);
  const handM = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.028, 0.02), goldDkMat);
  handM.position.set(0.04, 0.74, 0.40);
  group.add(handM);
  const dialPin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), goldMat);
  dialPin.position.set(0, 0.74, 0.41);
  group.add(dialPin);

  // ============ COL + EPAULES ============
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 10, 24), robeLtMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.92;
  group.add(collar);

  // ============ BRAS (manches larges) ============
  for (const side of [-1, 1]) {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.40, 12), robeMat);
    sleeve.position.set(side * 0.33, 0.78, 0.02);
    sleeve.rotation.z = side * 0.20;
    sleeve.castShadow = true;
    group.add(sleeve);
    // Liseré dore du poignet.
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.03, 8, 16), goldMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(side * 0.40, 0.60, 0.02);
    group.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), skinMat);
    hand.position.set(side * 0.41, 0.55, 0.03);
    hand.castShadow = true;
    group.add(hand);
  }

  // ============ TETE (enorme, ronde) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 20), skinMat);
  head.position.y = 1.16;
  head.castShadow = true;
  group.add(head);
  // Petit menton.
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), skinDkMat);
  jaw.scale.set(1, 0.5, 0.8);
  jaw.position.set(0, 1.00, 0.07);
  group.add(jaw);
  // Yeux cyan brillants.
  for (const dx of [-0.15, 0.15]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), glowMat);
    eye.scale.set(0.8, 1.1, 0.5);
    eye.position.set(dx, 1.16, 0.34);
    group.add(eye);
  }
  // Sourcils fins, air severe.
  for (const dx of [-0.15, 0.15]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.06), skinDkMat);
    brow.position.set(dx, 1.27, 0.35);
    brow.rotation.z = dx > 0 ? 0.28 : -0.28;
    group.add(brow);
  }
  // Petite bouche neutre.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.028, 0.04), blackMat);
  mouth.position.set(0, 1.01, 0.36);
  group.add(mouth);

  // ============ CHAPEAU pointu a large bord ============
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 28), robeDkMat);
  brim.position.y = 1.40;
  brim.castShadow = true;
  group.add(brim);
  const brimEdge = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 8, 30), goldMat);
  brimEdge.rotation.x = Math.PI / 2;
  brimEdge.position.y = 1.40;
  group.add(brimEdge);
  // Cone en plusieurs segments, legerement courbe.
  let prevY = 1.42;
  for (let i = 0; i < 4; i++) {
    const rTop = 0.30 - i * 0.07;
    const rBot = 0.37 - i * 0.07;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, 0.22, 16), robeMat);
    seg.position.set(i * 0.035, prevY + 0.11, 0);
    seg.rotation.z = -i * 0.08;
    group.add(seg);
    prevY += 0.20;
  }
  // Bande doree + sablier-broche sur le chapeau.
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 24), goldMat);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 1.52;
  group.add(hatBand);
  const hatGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), glowMat);
  hatGem.position.set(0, 1.54, 0.36);
  group.add(hatGem);
  // Pompon au sommet.
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), goldMat);
  tip.position.set(0.16, 2.18, 0);
  group.add(tip);

  // ============ BATON a sablier ============
  const staff = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.25, 10), goldDkMat);
  staff.add(rod);
  // Sablier (2 cones) dans une cage doree.
  const hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.15, 12), glowMat);
  hgTop.position.y = 0.72;
  staff.add(hgTop);
  const hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.15, 12), glowMat);
  hgBot.position.y = 0.56;
  hgBot.rotation.x = Math.PI;
  staff.add(hgBot);
  for (const yy of [0.79, 0.49]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), goldMat);
    plate.position.y = yy;
    staff.add(plate);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.30, 6), goldMat);
    bar.position.set(Math.cos(a) * 0.10, 0.64, Math.sin(a) * 0.10);
    staff.add(bar);
  }
  staff.position.set(0.42, 0.64, 0.10);
  staff.rotation.z = 0.10;
  group.add(staff);

  return group;
}
