import * as THREE from 'three';

// Dragounet Rouge : petit dragon invoque, style chibi -- corps rond
// rouge, grosse tete a museau, cornes, petites ailes membraneuses,
// queue, et une lueur de braise dans la gueule.
export function buildDragounetRouge() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.7, metalness: o.m || 0,
  });
  const scaleMat   = M(0xc23a2b, { r: 0.6 });        // ecailles rouges
  const scaleDkMat = M(0x7c1f17, { r: 0.7 });        // rouge sombre
  const bellyMat   = M(0xf0c878, { r: 0.75 });       // ventre creme-dore
  const membMat    = new THREE.MeshStandardMaterial({ color: 0xe8654f, roughness: 0.7, side: THREE.DoubleSide });
  const hornMat    = M(0xefe4cf, { r: 0.6 });
  const clawMat    = M(0xf0e8d4, { r: 0.5 });
  const emberMat   = new THREE.MeshStandardMaterial({ color: 0xffb13a, emissive: 0xff6a1a, emissiveIntensity: 1.1, roughness: 0.4 });
  const eyeMat     = new THREE.MeshStandardMaterial({ color: 0xffd23a, emissive: 0xd98a1a, emissiveIntensity: 0.6, roughness: 0.4 });
  const blackMat   = M(0x16100e, { r: 0.5 });

  // ============ PATTES courtes + griffes ============
  for (const dx of [-0.13, 0.13]) {
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), scaleMat);
    leg.scale.set(1, 0.8, 1.25);
    leg.position.set(dx, 0.10, 0.04);
    leg.castShadow = true;
    group.add(leg);
    for (const oz of [-0.05, 0.05]) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), clawMat);
      claw.rotation.x = Math.PI / 2;
      claw.position.set(dx + oz, 0.05, 0.16);
      group.add(claw);
    }
  }

  // ============ CORPS rond ============
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 16), scaleMat);
  body.scale.set(1.05, 1.0, 1.1);
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);
  // Ventre creme avec ecailles.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), bellyMat);
  belly.scale.set(0.85, 1.0, 0.55);
  belly.position.set(0, 0.38, 0.20);
  group.add(belly);
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Mesh(new THREE.TorusGeometry(0.10 - i * 0.02, 0.018, 6, 14, Math.PI), scaleDkMat);
    seg.position.set(0, 0.28 + i * 0.13, 0.24);
    seg.rotation.x = -Math.PI / 2;
    group.add(seg);
  }

  // ============ AILES membraneuses ============
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 6), scaleDkMat);
    bone.position.y = 0.21;
    wing.add(bone);
    for (let i = 0; i < 3; i++) {
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.30, 5), scaleDkMat);
      rib.position.set(0, 0.36, 0);
      rib.rotation.z = -0.5 + i * 0.5;
      wing.add(rib);
    }
    const memb = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 12, 8, 0, Math.PI, 0, Math.PI * 0.62), membMat);
    memb.scale.set(1, 0.95, 0.22);
    memb.position.y = 0.22;
    wing.add(memb);
    wing.position.set(side * 0.24, 0.52, -0.18);
    wing.rotation.y = side * 0.8;
    wing.rotation.z = side * -0.35;
    group.add(wing);
  }

  // ============ QUEUE ============
  const tail = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.095 - i * 0.012, 10, 8), i % 2 ? scaleDkMat : scaleMat);
    seg.position.set(0, i * 0.015, -i * 0.12);
    tail.add(seg);
  }
  // Pointe en fer de lance.
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 4), scaleDkMat);
  tailTip.rotation.x = -Math.PI / 2;
  tailTip.position.set(0, 0.08, -0.78);
  tail.add(tailTip);
  tail.position.set(0, 0.30, -0.22);
  tail.rotation.x = 0.4;
  group.add(tail);

  // ============ TETE (grosse) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), scaleMat);
  head.position.set(0, 0.92, 0.06);
  head.castShadow = true;
  group.add(head);
  // Museau allonge.
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), scaleMat);
  snout.scale.set(0.85, 0.7, 1.15);
  snout.position.set(0, 0.84, 0.28);
  group.add(snout);
  // Narines.
  for (const dx of [-0.05, 0.05]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), blackMat);
    n.position.set(dx, 0.88, 0.42);
    group.add(n);
  }
  // Gueule entrouverte : braise.
  const maw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), emberMat);
  maw.position.set(0, 0.79, 0.40);
  group.add(maw);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.4 }));
  ember.position.set(0, 0.79, 0.46);
  group.add(ember);

  // ============ Yeux + sourcils ============
  for (const dx of [-0.11, 0.11]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), eyeMat);
    eye.position.set(dx, 0.96, 0.24);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.05, 0.02), blackMat);
    pupil.position.set(dx, 0.96, 0.29);
    group.add(pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.035, 0.05), scaleDkMat);
    brow.position.set(dx, 1.02, 0.23);
    brow.rotation.z = dx > 0 ? 0.3 : -0.3;
    group.add(brow);
  }

  // ============ CORNES + crete ============
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 7), hornMat);
    horn.position.set(side * 0.14, 1.12, -0.04);
    horn.rotation.z = side * 0.5;
    horn.rotation.x = -0.4;
    group.add(horn);
  }
  // Petite crete dorsale sur la tete et le cou.
  for (let i = 0; i < 4; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 4), scaleDkMat);
    spike.position.set(0, 1.06 - i * 0.10, -0.10 - i * 0.07);
    spike.rotation.x = -0.5;
    group.add(spike);
  }
  // Petites joues a piquants.
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), scaleDkMat);
    fin.position.set(side * 0.24, 0.88, 0.04);
    fin.rotation.z = side * 1.3;
    group.add(fin);
  }

  return group;
}
