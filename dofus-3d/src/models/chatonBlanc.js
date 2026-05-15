import * as THREE from 'three';

// Chaton Blanc : invocation de l Ecaflip, style chibi -- grosse tete
// ronde, petit corps potele, oreilles triangulaires, grands yeux,
// moustaches et queue dressee.
export function buildChatonBlanc() {
  const group = new THREE.Group();

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.85, metalness: o.m || 0,
  });
  const furMat   = M(0xf4f1ea, { r: 0.9 });   // fourrure blanc creme
  const innerMat = M(0xf6b8c4, { r: 0.7 });   // rose interieur oreilles / nez
  const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x4cae8f, emissive: 0x1f6f55, emissiveIntensity: 0.5, roughness: 0.35 });
  const blackMat = M(0x16110f, { r: 0.5 });
  const whiskMat = M(0xe8e3d6, { r: 0.6 });

  // ============ PATTES + queue ============
  for (const dx of [-0.13, 0.13]) {
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), furMat);
    leg.scale.set(1, 0.85, 1.15);
    leg.position.set(dx, 0.09, 0.05);
    leg.castShadow = true;
    group.add(leg);
  }
  const tail = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.075 - i * 0.006, 10, 8), furMat);
    seg.position.set(0, i * 0.10, -0.02 - i * 0.015);
    tail.add(seg);
  }
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), M(0xd9d3c4, { r: 0.9 }));
  tailTip.position.set(0, 0.62, -0.10);
  tail.add(tailTip);
  tail.position.set(0, 0.22, -0.20);
  tail.rotation.x = -0.35;
  group.add(tail);

  // ============ CORPS potele ============
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 16), furMat);
  body.scale.set(1.0, 0.95, 1.0);
  body.position.y = 0.38;
  body.castShadow = true;
  group.add(body);
  // Petit poitrail plus clair.
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), M(0xfffdf6, { r: 0.9 }));
  chest.scale.set(0.8, 1.0, 0.5);
  chest.position.set(0, 0.34, 0.18);
  group.add(chest);

  // ============ TETE (grosse) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 18), furMat);
  head.position.set(0, 0.86, 0.04);
  head.castShadow = true;
  group.add(head);
  // Joues bouffies.
  for (const dx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), furMat);
    cheek.position.set(dx * 0.20, 0.78, 0.16);
    group.add(cheek);
  }

  // ============ OREILLES triangulaires ============
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), furMat);
    ear.position.set(side * 0.19, 1.12, -0.02);
    ear.rotation.z = side * -0.25;
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 4), innerMat);
    inner.position.set(side * 0.19, 1.10, 0.03);
    inner.rotation.z = side * -0.25;
    group.add(inner);
  }

  // ============ Yeux ============
  for (const dx of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), eyeMat);
    eye.position.set(dx, 0.90, 0.26);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 8), blackMat);
    pupil.position.set(dx, 0.90, 0.32);
    group.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(dx + 0.02, 0.94, 0.34);
    group.add(glint);
  }

  // ============ Museau : nez + bouche ============
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.05, 4), innerMat);
  nose.rotation.x = Math.PI;
  nose.position.set(0, 0.81, 0.32);
  group.add(nose);

  // ============ Moustaches ============
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 4), whiskMat);
      w.rotation.z = Math.PI / 2;
      w.rotation.y = side * (0.2 - i * 0.2);
      w.position.set(side * 0.26, 0.79 + i * 0.04, 0.22);
      group.add(w);
    }
  }

  return group;
}
