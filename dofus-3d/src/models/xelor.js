import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place } from './humanoid.js';

// Xelor facon Dofus : maitre du temps momifie. Longue robe bleu nuit
// evasee a ourlet dore dentele, epaulettes en forme d engrenage, cadran
// d horloge sur la poitrine, tete et mains enroulees de bandelettes,
// regard cyan au fond d une fente d ombre, chapeau pointu courbe a large
// bord, baton surmonte d un sablier.
export function buildXelor() {
  const bandage = M(0xefe4c6, { r: 0.85 });
  const bandageDk = M(0xc8b48a, { r: 0.85 });
  const robe = M(0x24306a, { r: 0.8 });
  const robeDk = M(0x141a3e, { r: 0.85 });
  const robeLt = M(0x3e52a6, { r: 0.75 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const goldDk = M(0x9a7d28, { r: 0.45, m: 0.5 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xc8f6ff });
  const glowSoft = new THREE.MeshBasicMaterial({ color: 0x73e0ff, transparent: true, opacity: 0.35 });
  const dark = M(0x0a0a14, { r: 0.9 });

  const H = buildHumanoid({
    skin: bandage, top: robe, bottom: robeDk, boots: robeDk, gloves: bandage, sleeve: robe, forearm: robeLt,
    build: 0.96, headR: 0.29, eyes: false, noNose: true,
  });
  const { group, head, headR: hr } = H;

  // ---- Robe evasee jusqu au sol, ourlet dore dentele ----
  const skirt = lathe([[0.36, 0.02], [0.33, 0.08], [0.25, 0.26], [0.18, 0.44], [0.16, 0.5]], robe, 26, 0.9);
  group.add(skirt);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const tooth = bentCone(0.04, 0.06, 0, 0, gold, 4, 1);
    tooth.position.set(Math.cos(a) * 0.35, 0.02, Math.sin(a) * 0.32);
    tooth.rotation.set(Math.PI, 0, 0);
    tooth.scale.set(1, 1, 0.5);
    tooth.lookAt(0, 0.02, 0);
    tooth.rotateX(Math.PI / 2);
    group.add(tooth);
  }
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 30), gold);
  hem.rotation.x = Math.PI / 2;
  hem.scale.set(1, 0.9, 1);
  hem.position.y = 0.05;
  group.add(hem);
  // Bande centrale doree de la robe.
  group.add(place(roundBox(0.06, 0.42, 0.02, 0.01, goldDk), 0, 0.28, 0.27, -0.28));

  // ---- Cadran d horloge sur la poitrine ----
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 24), M(0xfff6d8, { r: 0.4 }));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.66, 0.16);
  group.add(dial);
  const dialRim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 24), gold);
  dialRim.position.set(0, 0.66, 0.175);
  group.add(dialRim);
  for (const [len, rot] of [[0.07, 0.4], [0.05, -1.4]]) {
    const hnd = roundBox(0.012, len, 0.008, 0.004, dark);
    hnd.geometry.translate(0, len / 2, 0);
    hnd.position.set(0, 0.66, 0.185);
    hnd.rotation.z = rot;
    group.add(hnd);
  }

  // ---- Epaulettes en engrenage ----
  for (const [arm, side] of [[H.armL, -1], [H.armR, 1]]) {
    const gear = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), gold);
    gear.add(disc);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const t = roundBox(0.035, 0.04, 0.03, 0.008, gold);
      t.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
      t.rotation.y = -a;
      gear.add(t);
    }
    gear.position.set(side * 0.03, 0.05, 0);
    gear.rotation.z = -side * 0.4;
    arm.add(gear);
    // Manche large evasee.
    const elbow = arm.children.find(c => c.isGroup);
    if (elbow) {
      const sleeve = lathe([[0.1, -0.13], [0.07, -0.02], [0.05, 0.02]], robeLt, 14);
      elbow.add(sleeve);
    }
  }

  // ---- Tete momifiee : bandelettes croisees + fente d ombre ----
  const cy = hr * 0.88;
  for (const [y, tilt] of [[1.25, 0.22], [1.05, -0.2], [0.72, 0.18], [0.52, -0.14], [0.3, 0.1]]) {
    const rr = Math.sqrt(Math.max(0.01, 1 - Math.pow((y * hr - cy) / (hr * 1.05), 2))) * hr * 1.06;
    const b = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.022, 6, 28), bandageDk);
    b.rotation.set(Math.PI / 2, tilt, 0);
    b.position.set(0, y * hr, 0);
    head.add(b);
  }
  const slit = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.72, 18, 10), dark);
  slit.scale.set(1.3, 0.38, 0.5);
  slit.position.set(0, hr * 0.92, hr * 0.72);
  head.add(slit);
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), glow);
    e.scale.set(1, 1.2, 0.5);
    e.position.set(sx * hr * 0.36, hr * 0.92, hr * 1.02);
    head.add(e);
    const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glowSoft);
    h2.position.set(sx * hr * 0.36, hr * 0.92, hr * 1.0);
    head.add(h2);
  }
  const loose = strand([[hr * 0.8, hr * 0.5, hr * 0.3], [hr * 1.1, hr * 0.2, hr * 0.2], [hr * 1.15, -hr * 0.2, hr * 0.1]], 0.02, 0.012, bandage, 10);
  head.add(loose);

  // ---- Chapeau pointu courbe a large bord ----
  const hat = new THREE.Group();
  const brim = lathe([[0.02, 0], [0.5, 0.0], [0.52, 0.025], [0.3, 0.05]], robeDk, 28);
  hat.add(brim);
  const brimRim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.022, 8, 32), gold);
  brimRim.rotation.x = Math.PI / 2;
  brimRim.position.y = 0.012;
  hat.add(brimRim);
  const cone = bentCone(0.3, 0.8, 0.22, -0.18, robe, 20, 10);
  cone.position.y = 0.03;
  hat.add(cone);
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 26), gold);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 0.1;
  hat.add(hatBand);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), glowSoft.clone());
  gem.material.opacity = 0.9;
  gem.position.set(0, 0.1, 0.3);
  hat.add(gem);
  const pompon = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), gold);
  pompon.position.set(0.22, 0.83, -0.18);
  hat.add(pompon);
  hat.position.y = hr * 1.55;
  hat.rotation.x = -0.1;
  hat.scale.setScalar(0.82);
  head.add(hat);

  // ---- Baton a sablier (main droite) ----
  const staff = new THREE.Group();
  staff.add(place(taper(0.022, 0.026, 1.2, M(0x5a3a20, { r: 0.85 })), 0, 0.92, 0));
  const glass = lathe([[0.02, 0], [0.07, 0.03], [0.06, 0.08], [0.012, 0.12], [0.06, 0.16], [0.07, 0.21], [0.02, 0.24]], new THREE.MeshStandardMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.55 }), 16);
  glass.position.y = 0.92;
  staff.add(glass);
  for (const y of [0.9, 1.17]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 14), gold);
    cap.position.y = y;
    staff.add(cap);
  }
  const sand = lathe([[0.01, 0], [0.05, 0.03], [0.012, 0.06]], M(0xf8d060), 12);
  sand.position.y = 0.92;
  staff.add(sand);
  staff.position.set(0, -0.1, 0.02);
  staff.rotation.set(0.2, 0, -0.08);
  H.handR.add(staff);

  // Les jambes disparaissent sous la robe : on les masque.
  H.legL.visible = false;
  H.legR.visible = false;
  return group;
}
