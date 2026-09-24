import * as THREE from 'three';
import { M, mesh, addEyes } from './kit.js';
import { buildCraqueleur } from './craqueleur.js';
import { buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth, brows } from './humanoid.js';

// ===========================================================================
// Boss : Craqueleur Legendaire, Kwakwa, Minotoror.
// ===========================================================================

// Craqueleur Legendaire : golem geant couvert de cristaux lumineux, une
// couronne de mousse et des yeux rouges. Meme squelette que le Craqueleur
// (le modele de base est agrandi dans un sous-groupe).
export function buildCraqueleurLegendaire() {
  const root = new THREE.Group();
  const inner = buildCraqueleur();
  const crystal = new THREE.MeshStandardMaterial({
    color: 0x7af0ff, emissive: 0x2aa8d8, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.1,
  });
  const crystalDk = new THREE.MeshStandardMaterial({
    color: 0x3a8ad8, emissive: 0x1a4a9a, emissiveIntensity: 0.6, roughness: 0.3,
  });
  // Grappes de cristaux sur le dos et les epaules.
  const spots = [
    [0, 1.0, -0.2, -0.5, 0, 0, 0.16], [-0.18, 0.95, -0.24, -0.6, 0, 0.4, 0.12], [0.2, 0.92, -0.25, -0.6, 0, -0.4, 0.13],
    [-0.4, 0.98, 0, 0, 0, 0.7, 0.1], [0.42, 0.98, 0, 0, 0, -0.7, 0.11], [0.08, 0.78, -0.36, -1.0, 0, -0.2, 0.1],
    [-0.1, 0.7, -0.38, -1.1, 0, 0.3, 0.09],
  ];
  for (const [x, y, z, rx, ry, rz, h] of spots) {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(h * 0.95, 0), crystal);
    c.scale.set(0.6, 2.1, 0.6);
    c.position.set(x * 1.1, y + 0.05, z - 0.08);
    c.rotation.set(rx, ry, rz);
    c.castShadow = true;
    inner.add(c);
    const c2 = new THREE.Mesh(new THREE.OctahedronGeometry(h * 0.6, 0), crystalDk);
    c2.scale.set(0.6, 1.8, 0.6);
    c2.position.set(x * 1.1 + 0.07, y, z - 0.06);
    c2.rotation.set(rx + 0.3, ry, rz - 0.4);
    inner.add(c2);
  }
  inner.scale.setScalar(1.45);
  root.add(inner);
  return root;
}

// Craqueleur sauvage : variante un peu plus sombre du Craqueleur.
export function buildCraqueleurSauvage() {
  const root = new THREE.Group();
  const inner = buildCraqueleur();
  inner.traverse(o => {
    if (o.isMesh && o.material && o.material.color && !o.material.isMeshBasicMaterial) {
      o.material = o.material.clone();
      o.material.color.multiplyScalar(0.82);
    }
  });
  inner.scale.setScalar(1.08);
  root.add(inner);
  return root;
}

// Kwakwa : grand oiseau-corbeau elementaire. Corps sombre, ventre, crete,
// bouts d ailes et queue teintes par l element du moment (materiaux
// exposes via userData.tintMats pour que le combat puisse les recolorer).
export function buildKwakwa() {
  const group = new THREE.Group();
  const dark = M(0x2a2438, { r: 0.8 });
  const darkLt = M(0x4a4060, { r: 0.8 });
  const tint = M(0xff7a2a, { r: 0.55, emissive: 0x6a2a08, ei: 0.6 });
  const tintLt = M(0xffc06a, { r: 0.55, emissive: 0x6a3a08, ei: 0.4 });
  const beak = M(0xf2c030, { r: 0.4 });
  const leg = M(0xd8902a, { r: 0.6 });

  // Pattes (sous la hanche 0.3) avec serres.
  for (const sx of [-1, 1]) {
    const l = new THREE.Group();
    l.add(place(taper(0.03, 0.022, 0.3, leg, 8), 0, 0.34, 0));
    for (const rz of [-0.5, 0, 0.5]) {
      const toe = bentCone(0.02, 0.12, 0, 0.03, leg, 6, 2);
      toe.rotation.set(Math.PI / 2 - 0.2, rz, 0);
      toe.position.set(0, 0.03, 0.01);
      l.add(toe);
    }
    const back = bentCone(0.018, 0.08, 0, 0, leg, 6, 2);
    back.rotation.set(-Math.PI / 2 + 0.3, 0, 0);
    back.position.set(0, 0.03, -0.01);
    l.add(back);
    l.position.set(sx * 0.13, 0, 0);
    group.add(l);
  }
  // Corps en goutte (lathe).
  const body = lathe([[0.05, 0.3], [0.26, 0.38], [0.36, 0.55], [0.36, 0.72], [0.3, 0.9], [0.18, 1.02], [0.06, 1.06]], dark, 24, 0.9);
  group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), tintLt);
  belly.scale.set(1, 1.2, 0.55);
  belly.position.set(0, 0.62, 0.2);
  group.add(belly);
  // Ailes repliees (pans de plumes superposes).
  for (const sx of [-1, 1]) {
    const w = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const f = bentCone(0.12 - k * 0.015, 0.55 - k * 0.06, 0, -0.08, k === 0 ? tint : (k % 2 ? darkLt : dark), 8, 4);
      f.scale.set(1, 1, 0.35);
      f.rotation.set(Math.PI - 0.25 - k * 0.08, 0, sx * (0.12 + k * 0.05));
      f.position.set(0, 0, -k * 0.02);
      w.add(f);
    }
    w.position.set(sx * 0.36, 0.86, -0.04);
    w.rotation.y = sx * 0.2;
    group.add(w);
  }
  // Queue en eventail.
  for (let k = -2; k <= 2; k++) {
    const f = bentCone(0.07, 0.5, 0, -0.18, Math.abs(k) === 2 ? tint : dark, 8, 4);
    f.scale.set(1, 1, 0.3);
    f.rotation.set(-2.2, k * 0.25, 0);
    f.position.set(k * 0.05, 0.45, -0.28);
    group.add(f);
  }
  // Tete.
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), dark);
  skull.scale.set(1, 0.95, 1.05);
  skull.castShadow = true;
  head.add(skull);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 10), beak);
  bk.rotation.x = Math.PI / 2 + 0.25;
  bk.position.set(0, -0.04, 0.3);
  bk.castShadow = true;
  head.add(bk);
  addEyes(head, { x: 0, y: 0.05, z: 0.18, size: 0.07, spacing: 0.2, turn: 0.4, iris: 0xff5a1a, lid: 0x2a2438, angry: true });
  // Crete elementaire.
  for (let k = 0; k < 5; k++) {
    const c = bentCone(0.05, 0.28 - k * 0.03, 0, -0.14, k % 2 ? tintLt : tint, 6, 4);
    c.position.set(0, 0.16, 0.06 - k * 0.07);
    c.rotation.x = -0.4 - k * 0.2;
    head.add(c);
  }
  head.position.set(0, 1.18, 0.04);
  group.add(head);
  // Aura elementaire (anneau flottant).
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 6, 30), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.6 }));
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.08;
  aura.userData.noOutline = true;
  group.add(aura);
  // Materiaux recolores selon l element (le nom survit a la conversion toon).
  tint.name = 'elementTint';
  tintLt.name = 'elementTintLt';
  aura.material.name = 'elementTintBasic';
  return group;
}

// Minotoror : colosse mi-homme mi-taureau. Base humanoide costaude,
// tete de taureau (mufle, anneau dore, cornes), criniere, pagne, brassards,
// et une enorme hache a double tranchant.
export function buildMinotoror() {
  const fur = M(0x7a4a2a, { r: 0.9 });
  const furDk = M(0x4a2a16, { r: 0.9 });
  const muzzleMat = M(0xc89a7a, { r: 0.8 });
  const horn = M(0xf0e6c8, { r: 0.6 });
  const leather = M(0x5a3418, { r: 0.85 });
  const cloth2 = M(0x8a1a1a, { r: 0.8 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const steel = M(0xaab4c0, { r: 0.3, m: 0.8 });
  const dark = M(0x100808, { r: 0.5 });

  const H = buildHumanoid({
    skin: fur, top: fur, bottom: furDk, boots: furDk, gloves: furDk, sleeve: fur, forearm: fur,
    build: 1.35, headR: 0.3, noNose: true, headShape: { jaw: 0.3, chin: 0.02, wide: 1.1 },
    eyes: { iris: 0xd8322a, lid: 0x4a2a16, angry: true },
  });
  const { group, head, headR: hr } = H;

  // Torse muscle : pectoraux + abdos.
  for (const sx of [-1, 1]) {
    const pec = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), fur);
    pec.scale.set(1.2, 0.8, 0.6);
    pec.position.set(sx * 0.11, 0.72, 0.12);
    group.add(pec);
  }
  for (let k = 0; k < 2; k++) {
    for (const sx of [-1, 1]) {
      const ab = roundBox(0.08, 0.06, 0.04, 0.02, fur);
      ab.position.set(sx * 0.05, 0.56 + k * 0.07, 0.15);
      group.add(ab);
    }
  }
  // Pagne + ceinture a boucle doree.
  const belt = lathe([[0.2, 0], [0.21, 0.04], [0.2, 0.08]], leather, 22, 0.85);
  belt.position.y = 0.41;
  group.add(belt);
  group.add(place(roundBox(0.1, 0.08, 0.03, 0.01, gold), 0, 0.45, 0.18));
  const front = cloth(0.2, 0.26, cloth2, { curve: -0.02, flare: -0.02, spread: 0.2, wave: 0.02 });
  front.position.set(0, 0.42, 0.16);
  group.add(front);
  const back = cloth(0.3, 0.3, cloth2, { curve: 0.08, flare: 0.05, spread: 0.2, wave: 0.02 });
  back.position.set(0, 0.42, -0.14);
  group.add(back);
  // Brassards dores et epaulette de cuir cloutee.
  for (const arm of [H.armL, H.armR]) {
    const elbow = arm.children.find(c => c.isGroup);
    if (elbow) {
      const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.08, 14), gold);
      bracer.position.y = -0.1;
      elbow.add(bracer);
    }
  }
  const pad = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), leather);
  pad.position.set(0, 0.02, 0);
  H.armL.add(pad);
  for (let k = 0; k < 3; k++) {
    const stud = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 6), steel);
    stud.position.set(-0.04 + k * 0.04, 0.12, 0.02);
    H.armL.add(stud);
  }
  // Criniere sur la nuque et les epaules.
  for (let k = 0; k < 7; k++) {
    const a = -1.2 + k * 0.4;
    const m = bentCone(0.07, 0.2, 0, -0.08, furDk, 6, 3);
    m.position.set(Math.sin(a) * 0.14, 0.86, -Math.cos(a) * 0.1 - 0.02);
    m.rotation.set(-2.4, a, 0);
    group.add(m);
  }

  // Tete de taureau : mufle, narines, anneau, cornes, oreilles, touffe.
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.55, 16, 12), muzzleMat);
  muzzle.scale.set(1.25, 0.8, 0.9);
  muzzle.position.set(0, hr * 0.45, hr * 0.8);
  head.add(muzzle);
  for (const sx of [-1, 1]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), dark);
    n.scale.set(1, 0.7, 0.5);
    n.position.set(sx * hr * 0.2, hr * 0.5, hr * 1.27);
    head.add(n);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16), gold);
  ring.position.set(0, hr * 0.3, hr * 1.25);
  head.add(ring);
  faceMouth(head, hr, dark, { width: hr * 0.2, y: 0.2, arc: 0.7, frown: true });
  brows(head, hr, furDk, { y: 1.22, angle: 0.5 });
  for (const sx of [-1, 1]) {
    const h = strand([[sx * hr * 0.75, hr * 1.35, 0], [sx * hr * 1.3, hr * 1.5, 0.02], [sx * hr * 1.55, hr * 1.9, 0.1], [sx * hr * 1.45, hr * 2.25, 0.18]], 0.07, 0.012, horn, 18);
    head.add(h);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), fur);
    ear.scale.set(1.4, 0.5, 0.8);
    ear.position.set(sx * hr * 1.02, hr * 1.1, -0.02);
    ear.rotation.z = sx * -0.4;
    head.add(ear);
  }
  const tuft = bentCone(0.08, 0.14, 0, 0.06, furDk, 6, 3);
  tuft.position.set(0, hr * 1.7, 0.05);
  head.add(tuft);

  // Hache a double tranchant (main droite).
  const axe = new THREE.Group();
  axe.add(place(taper(0.028, 0.032, 1.1, leather), 0, 0.8, 0));
  for (const sx of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.12);
    shape.quadraticCurveTo(sx * 0.2, -0.22, sx * 0.3, -0.02);
    shape.quadraticCurveTo(sx * 0.32, 0.12, sx * 0.22, 0.26);
    shape.quadraticCurveTo(sx * 0.14, 0.12, 0, 0.12);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 1, curveSegments: 8 });
    g.translate(0, 0, -0.015);
    const blade = new THREE.Mesh(g, steel);
    blade.position.y = 0.72;
    blade.castShadow = true;
    axe.add(blade);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10), gold);
  cap.position.y = 0.72;
  axe.add(cap);
  axe.position.set(0, -0.1, 0.03);
  axe.rotation.set(0.25, 0, -0.1);
  H.handR.add(axe);

  // Agrandi : le Minotoror domine le plateau.
  const root = new THREE.Group();
  group.scale.setScalar(1.22);
  root.add(group);
  root.userData.rig = group.userData.rig;
  return root;
}
