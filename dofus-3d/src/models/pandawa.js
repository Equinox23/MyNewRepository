import * as THREE from 'three';
import { M, buildHumanoid, lathe, taper, bentCone, roundBox, cloth, strand, place, faceMouth } from './humanoid.js';

// Pandawa facon Dofus : maitre bambouseur bon vivant. Carrure trapue,
// kimono ouvert a bords brodes sur un ventre blanc, large ceinture nouee
// dont les pans pendent, bras et jambes noirs, tete de panda (oreilles
// rondes, taches autour des yeux, museau), gourde de lait de bambou dans
// le dos et long baton de bambou.
export function buildPandawa() {
  const white = M(0xf2eee4, { r: 0.9 });
  const black = M(0x24222a, { r: 0.85 });
  const kimono = M(0x3a7a4a, { r: 0.8 });
  const kimonoLt = M(0x6aaa5a, { r: 0.8 });
  const sash = M(0xc8322a, { r: 0.75 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.5 });
  const wood = M(0x9a6232, { r: 0.8 });
  const bamboo = M(0x7ab04a, { r: 0.7 });
  const bambooDk = M(0x4a7a2a, { r: 0.75 });
  const pink = M(0xf09aa8, { r: 0.8 });

  const H = buildHumanoid({
    skin: white, top: white, bottom: black, boots: black, gloves: black, sleeve: black, forearm: black,
    build: 1.2, headR: 0.33, noNose: true, headShape: { jaw: 0.08, chin: 0.02, wide: 1.1 },
    eyes: { iris: 0x6a3a1a, lid: 0x24222a, sleepy: true },
  });
  const { group, head, headR: hr } = H;

  // ---- Ventre rond blanc sous un kimono ouvert ----
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), white);
  belly.scale.set(1.05, 1, 0.8);
  belly.position.set(0, 0.56, 0.06);
  belly.castShadow = true;
  group.add(belly);
  for (const sx of [-1, 1]) {
    const panel = cloth(0.2, 0.44, kimono, { curve: -0.05, flare: 0.02, spread: 0.12, wave: 0.01 });
    panel.position.set(sx * 0.13, 0.84, 0.13);
    panel.rotation.set(-0.12, sx * 0.35, 0);
    group.add(panel);
    const trim = roundBox(0.035, 0.42, 0.02, 0.01, kimonoLt);
    place(trim, sx * 0.09, 0.64, 0.19, -0.12, 0, sx * 0.12);
    group.add(trim);
  }
  const back = cloth(0.4, 0.46, kimono, { curve: 0.12, flare: 0.05, spread: 0.2, wave: 0.02 });
  back.position.set(0, 0.84, -0.12);
  group.add(back);
  // Ceinture nouee + pans.
  const belt = lathe([[0.235, 0], [0.245, 0.045], [0.235, 0.09]], sash, 22, 0.85);
  belt.position.y = 0.37;
  group.add(belt);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), sash);
  knot.position.set(0.1, 0.41, 0.2);
  group.add(knot);
  for (const [dx, rz] of [[0.08, 0.15], [0.13, -0.1]]) {
    const end = cloth(0.05, 0.2, sash, { curve: 0.01, flare: 0.02, spread: 0.3, wave: 0.01 });
    end.position.set(dx, 0.4, 0.2);
    end.rotation.set(-0.2, 0, rz);
    group.add(end);
  }

  // ---- Tete de panda ----
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), black);
    ear.scale.set(1, 1, 0.6);
    ear.position.set(sx * hr * 0.78, hr * 1.66, -0.02);
    head.add(ear);
    const patch = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.3, 14, 10), black);
    patch.scale.set(0.8, 1.15, 0.45);
    patch.rotation.z = sx * 0.55;
    patch.position.set(sx * hr * 0.38, hr * 0.92, hr * 0.8);
    head.add(patch);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), pink);
    cheek.scale.set(1.3, 0.7, 0.5);
    cheek.position.set(sx * hr * 0.68, hr * 0.55, hr * 0.78);
    head.add(cheek);
  }
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.42, 16, 12), white);
  muzzle.scale.set(1.2, 0.72, 0.75);
  muzzle.position.set(0, hr * 0.52, hr * 0.8);
  head.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), black);
  nose.scale.set(1.4, 0.9, 0.9);
  nose.position.set(0, hr * 0.66, hr * 1.1);
  head.add(nose);
  faceMouth(head, hr, black, { width: hr * 0.15, y: 0.4, arc: 0.95 });
  // Petit chignon noue sur le crane.
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), black);
  bun.position.set(0, hr * 1.9, -0.05);
  head.add(bun);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), sash);
  tie.rotation.x = Math.PI / 2;
  tie.position.set(0, hr * 1.82, -0.05);
  head.add(tie);

  // ---- Gourde de lait de bambou dans le dos ----
  const gourd = lathe([[0.02, 0], [0.1, 0.04], [0.12, 0.12], [0.07, 0.2], [0.09, 0.28], [0.06, 0.35], [0.03, 0.38]], wood, 16);
  gourd.position.set(0.08, 0.46, -0.22);
  gourd.rotation.z = -0.3;
  group.add(gourd);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), sash);
  cork.position.set(0.19, 0.83, -0.22);
  cork.rotation.z = -0.3;
  group.add(cork);
  const strap = roundBox(0.035, 0.52, 0.02, 0.01, sash);
  place(strap, 0, 0.66, 0.2, 0.1, 0, -0.65);
  group.add(strap);

  // ---- Baton de bambou (main gauche) ----
  const staff = new THREE.Group();
  for (let k = 0; k < 5; k++) {
    const seg = taper(0.028, 0.03, 0.27, bamboo, 10);
    seg.position.y = 1.0 - k * 0.27;
    staff.add(seg);
    const node = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 5, 12), bambooDk);
    node.rotation.x = Math.PI / 2;
    node.position.y = 1.0 - k * 0.27;
    staff.add(node);
  }
  const leaf = bentCone(0.04, 0.18, 0.1, 0, bambooDk, 4, 3);
  leaf.position.set(0, 1.0, 0);
  leaf.rotation.z = -0.6;
  leaf.scale.set(1, 1, 0.25);
  staff.add(leaf);
  staff.position.set(0, -0.1, 0.02);
  staff.rotation.set(0.2, 0, 0.1);
  H.handL.add(staff);

  return group;
}
