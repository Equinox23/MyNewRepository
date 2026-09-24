import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth, hairCap } from './humanoid.js';

// Eniripsa facon Dofus : fee soigneuse. Silhouette fine et elancee,
// robe a jupe en corolle a deux etages (blanc / rose) et corsage lace,
// manches bouffantes, collants et bottines roses, ailes de fee
// translucides nervurees, carre de cheveux roses avec frange et meches
// qui encadrent le visage, baguette a coeur.
export function buildEniripsa() {
  const skin = M(0xf8dcc0, { r: 0.8 });
  const hair = M(0xff7ab8, { r: 0.7 });
  const hairLt = M(0xffa8d0, { r: 0.7 });
  const dress = M(0xfdf6f8, { r: 0.8 });
  const pink = M(0xf05a9a, { r: 0.75 });
  const pinkDk = M(0xb8306a, { r: 0.75 });
  const gold = M(0xf2c84a, { r: 0.35, m: 0.5 });
  const tights = M(0xf6d0dc, { r: 0.8 });
  const dark = M(0x2a1420, { r: 0.5 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xc8f0ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, roughness: 0.2,
    emissive: 0x4ab0d8, emissiveIntensity: 0.25,
  });
  const veinMat = new THREE.MeshBasicMaterial({ color: 0x8ad8f0, transparent: true, opacity: 0.7 });

  const H = buildHumanoid({
    skin, top: pink, bottom: tights, boots: pink, gloves: skin, sleeve: dress, forearm: skin,
    build: 0.88, headR: 0.3, bootCuff: dress,
    eyes: { iris: 0x3a8ae8 },
  });
  const { group, head, headR: hr } = H;

  // ---- Jupe en corolle a deux etages ----
  const skirt1 = lathe([[0.34, 0.2], [0.3, 0.24], [0.22, 0.36], [0.16, 0.46]], dress, 26);
  group.add(skirt1);
  const skirt2 = lathe([[0.27, 0.32], [0.24, 0.36], [0.18, 0.43], [0.15, 0.48]], pink, 26);
  group.add(skirt2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const sc = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), pink);
    sc.scale.set(1, 0.5, 0.6);
    sc.position.set(Math.cos(a) * 0.335, 0.2, Math.sin(a) * 0.335);
    group.add(sc);
  }
  // Corsage lace + coeur dore.
  for (let k = 0; k < 3; k++) {
    const lace = roundBox(0.1, 0.012, 0.01, 0.004, dress);
    place(lace, 0, 0.56 + k * 0.06, 0.15, -0.1, 0, (k % 2 ? 0.3 : -0.3));
    group.add(lace);
  }
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), gold);
  heart.scale.set(1.3, 1, 0.5);
  heart.position.set(0, 0.79, 0.14);
  group.add(heart);
  // Manches bouffantes.
  for (const arm of [H.armL, H.armR]) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), dress);
    puff.scale.set(1, 0.9, 1);
    puff.position.y = -0.03;
    arm.add(puff);
  }

  // ---- Ailes de fee nervurees ----
  for (const sx of [-1, 1]) {
    for (const [scale, y, rot] of [[1, 0.84, 0.25], [0.7, 0.66, -0.35]]) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.12 * scale, 0.28 * scale, 0.42 * scale, 0.38 * scale, 0.46 * scale, 0.16 * scale);
      shape.bezierCurveTo(0.48 * scale, 0.02 * scale, 0.22 * scale, -0.04 * scale, 0, 0);
      const w = new THREE.Mesh(new THREE.ShapeGeometry(shape, 18), wingMat);
      w.position.set(sx * 0.05, y, -0.15);
      w.rotation.set(0, sx > 0 ? -0.6 : Math.PI + 0.6, sx * rot);
      group.add(w);
      const vein = new THREE.Mesh(new THREE.ShapeGeometry(shape, 18), veinMat);
      vein.scale.setScalar(0.6);
      vein.position.copy(w.position);
      vein.rotation.copy(w.rotation);
      vein.position.z -= 0.003;
      group.add(vein);
    }
  }

  // ---- Visage ----
  for (const sx of [-1, 1]) {
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M(0xff9ab8));
    ch.scale.set(1.3, 0.7, 0.5);
    ch.position.set(sx * hr * 0.66, hr * 0.62, hr * 0.8);
    head.add(ch);
  }
  faceMouth(head, hr, dark, { width: hr * 0.14, y: 0.5, arc: 0.85 });

  // ---- Carre rose : calotte, frange, meches qui encadrent le visage ----
  hairCap(head, hr, hair, { backTheta: 0.82, faceOpen: 1.1 });
  for (let i = -3; i <= 3; i++) {
    const f = bentCone(0.07, 0.16, i * 0.01, 0.06, i % 2 ? hairLt : hair, 6, 3);
    f.position.set(i * 0.07, hr * 1.58 - Math.abs(i) * 0.015, hr * 0.62);
    f.rotation.set(2.3, 0, i * 0.08);
    head.add(f);
  }
  for (const sx of [-1, 1]) {
    const lock = strand([[sx * hr * 0.9, hr * 1.3, hr * 0.3], [sx * hr * 1.02, hr * 0.8, hr * 0.35], [sx * hr * 0.9, hr * 0.3, hr * 0.4]], 0.06, 0.03, hair, 14);
    head.add(lock);
  }
  // Noeud dore dans les cheveux.
  for (const sx of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), gold);
    lobe.scale.set(1.3, 0.8, 0.6);
    lobe.rotation.z = sx * 0.4;
    lobe.position.set(hr * 0.55 + sx * 0.055, hr * 1.7, hr * 0.35);
    head.add(lobe);
  }

  // ---- Baguette a coeur (main droite) ----
  const wand = new THREE.Group();
  wand.add(place(taper(0.016, 0.02, 0.55, gold), 0, 0.55, 0));
  const hTop = new THREE.Group();
  for (const sx of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), pink);
    lobe.position.set(sx * 0.04, 0.02, 0);
    lobe.scale.z = 0.6;
    hTop.add(lobe);
  }
  const pt = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.1, 4), pink);
  pt.rotation.set(Math.PI, Math.PI / 4, 0);
  pt.scale.z = 0.55;
  pt.position.y = -0.04;
  hTop.add(pt);
  hTop.position.y = 0.62;
  wand.add(hTop);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb0d8, transparent: true, opacity: 0.3 }));
  glow.position.y = 0.62;
  wand.add(glow);
  wand.position.set(0, -0.1, 0.03);
  wand.rotation.set(0.4, 0, -0.35);
  H.handR.add(wand);

  return group;
}
