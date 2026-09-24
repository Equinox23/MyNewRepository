import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth, brows } from './humanoid.js';

// Ecaflip facon Dofus : chat joueur et flambeur. Tete feline (museau,
// joues rebondies, grandes oreilles pointues touffues), pelage roux raye,
// gilet de croupier bordeaux a boutons dores sur chemise creme, noeud
// papillon, pantalon court, longue queue annelee en S, carte a jouer
// geante dans la main droite et piece d or dans la gauche.
export function buildEcaflip() {
  const fur = M(0xe0873a, { r: 0.9 });
  const furDk = M(0xa8541e, { r: 0.9 });
  const cream = M(0xf6e2c0, { r: 0.85 });
  const vest = M(0x8a1a2a, { r: 0.75 });
  const vestDk = M(0x5a0e1a, { r: 0.8 });
  const shirt = M(0xf6f0e0, { r: 0.8 });
  const pants = M(0x2a2a40, { r: 0.85 });
  const gold = M(0xf2c030, { r: 0.35, m: 0.6 });
  const pink = M(0xf08aa0, { r: 0.7 });
  const nose = M(0x3a1a14, { r: 0.5 });

  const H = buildHumanoid({
    skin: fur, top: vest, bottom: pants, boots: furDk, gloves: fur, sleeve: shirt, forearm: shirt,
    build: 0.98, headR: 0.31, noNose: true, headShape: { jaw: 0.1, chin: 0.05, wide: 1.08 },
    eyes: { iris: 0x3ad17a, slit: true, lid: 0xe0873a, angry: true },
  });
  const { group, head, headR: hr } = H;

  // ---- Gilet de croupier : revers + boutons + chemise + noeud papillon ----
  const shirtFront = roundBox(0.1, 0.26, 0.03, 0.012, shirt);
  place(shirtFront, 0, 0.66, 0.145, -0.1);
  group.add(shirtFront);
  for (const sx of [-1, 1]) {
    const lapel = roundBox(0.06, 0.24, 0.02, 0.01, vestDk);
    place(lapel, sx * 0.075, 0.68, 0.15, -0.1, 0, -sx * 0.3);
    group.add(lapel);
  }
  for (let k = 0; k < 3; k++) {
    const bt = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), gold);
    bt.position.set(0, 0.52 + k * 0.07, 0.17 - k * 0.005);
    group.add(bt);
  }
  const bow = new THREE.Group();
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.07, 4), vestDk);
    w.rotation.z = sx * Math.PI / 2;
    w.position.x = sx * 0.035;
    bow.add(w);
  }
  bow.add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), gold));
  bow.position.set(0, 0.82, 0.14);
  group.add(bow);
  // Pans du gilet a l arriere.
  const tails = cloth(0.24, 0.2, vest, { curve: 0.06, flare: 0.04, spread: 0.2, wave: 0.01 });
  tails.position.set(0, 0.48, -0.12);
  group.add(tails);
  // Pelage : touffe sur le torse.
  const chestFur = bentCone(0.05, 0.08, 0, 0.03, cream, 5, 2);
  chestFur.position.set(0, 0.8, 0.12);
  chestFur.rotation.x = 2.8;
  group.add(chestFur);

  // ---- Queue annelee en S ----
  const tailPts = [[0, 0.42, -0.12], [0.05, 0.3, -0.3], [-0.05, 0.45, -0.46], [0.05, 0.7, -0.5], [0.16, 0.82, -0.42]];
  group.add(strand(tailPts, 0.045, 0.03, fur, 30));
  const curve = new THREE.CatmullRomCurve3(tailPts.map(p => new THREE.Vector3(...p)));
  for (let k = 1; k <= 5; k++) {
    const p = curve.getPointAt(k / 6);
    const ring = new THREE.Mesh(new THREE.SphereGeometry(0.043, 10, 8), furDk);
    ring.position.copy(p);
    ring.scale.set(1, 0.5, 1);
    group.add(ring);
  }
  const tipM = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), cream);
  tipM.position.set(0.16, 0.82, -0.42);
  group.add(tipM);

  // ---- Tete feline : museau, truffe, moustaches, rayures ----
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.5, 16, 12), cream);
  muzzle.scale.set(1.25, 0.72, 0.8);
  muzzle.position.set(0, hr * 0.52, hr * 0.78);
  head.add(muzzle);
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.3, 12, 10), cream);
    cheek.position.set(sx * hr * 0.55, hr * 0.5, hr * 0.62);
    cheek.scale.set(1.2, 0.8, 0.8);
    head.add(cheek);
    for (let k = 0; k < 3; k++) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.15, 4), cream);
      wh.rotation.z = Math.PI / 2 + sx * (0.1 + k * 0.14);
      wh.position.set(sx * hr * 0.78, hr * (0.55 - k * 0.07), hr * 0.75);
      head.add(wh);
    }
  }
  const tr = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), nose);
  tr.scale.set(1.3, 0.8, 0.9);
  tr.position.set(0, hr * 0.68, hr * 1.12);
  head.add(tr);
  faceMouth(head, hr, nose, { width: hr * 0.14, y: 0.42, arc: 0.95 });
  // Rayures sur le front.
  for (let k = -1; k <= 1; k++) {
    const st = roundBox(0.03, 0.11, 0.02, 0.01, furDk);
    st.position.set(k * 0.07, hr * 1.55, hr * 0.62);
    st.rotation.x = -0.6;
    head.add(st);
  }
  brows(head, hr, furDk, { y: 1.26, angle: 0.25 });

  // ---- Grandes oreilles pointues touffues ----
  for (const sx of [-1, 1]) {
    const ear = bentCone(0.12, 0.3, sx * 0.05, -0.04, fur, 4, 4);
    ear.position.set(sx * hr * 0.62, hr * 1.5, -0.02);
    ear.rotation.z = -sx * 0.32;
    ear.scale.set(1, 1, 0.55);
    head.add(ear);
    const inner = bentCone(0.07, 0.2, sx * 0.04, 0, pink, 4, 3);
    inner.position.set(sx * hr * 0.62, hr * 1.52, 0.035);
    inner.rotation.z = -sx * 0.32;
    inner.scale.set(1, 1, 0.3);
    head.add(inner);
    const tuft = bentCone(0.02, 0.1, sx * 0.03, 0, furDk, 4, 2);
    tuft.position.set(sx * hr * 0.62 + sx * 0.08, hr * 2.4, -0.03);
    tuft.rotation.z = -sx * 0.32;
    head.add(tuft);
  }

  // ---- Carte geante (main droite) ----
  const card = new THREE.Group();
  card.add(roundBox(0.16, 0.24, 0.012, 0.012, shirt));
  const pip = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), M(0xc8322a, { r: 0.5 }));
  pip.scale.set(1, 1.3, 0.3);
  pip.position.z = 0.01;
  card.add(pip);
  card.position.set(0, -0.18, 0.06);
  card.rotation.set(-0.3, 0.4, 0.3);
  H.handR.add(card);
  // ---- Piece d or (main gauche) ----
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 18), gold);
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, -0.2, 0.05);
  H.handL.add(coin);

  return group;
}
