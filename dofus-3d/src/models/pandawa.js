import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong,
  faceEyes, faceSmile,
} from './humanoid.js';
import { makeAt, patch, ellipse, line, detail } from './heroKitB.js';

// Pandawa : lutteur bon vivant. Carrure large et ventre rond, pelage
// blanc, bras, jambes et oreilles noirs, taches autour des yeux, museau
// court et sourire tranquille. Tunique verte croisee a lisere clair,
// manches courtes, large ceinture rouge nouee, bandages aux poignets et
// aux chevilles. Baton de bambou dans la main gauche, gourde a la hanche.
export function buildPandawa() {
  const white = M(0xf6f1e6, { r: 0.9 });
  const black = M(0x2b2832, { r: 0.85 });
  const kimono = M(0x3f8a4e, { r: 0.75 });
  const kimonoLt = M(0x9bd06a, { r: 0.75 });
  const sash = M(0xcf3526, { r: 0.7 });
  const wrap = M(0xd9bf8c, { r: 0.9 });
  const wood = M(0xb07a3c, { r: 0.75 });
  const bamboo = M(0x8cc152, { r: 0.65 });
  const leafM = M(0x4f9a36, { r: 0.7 });
  const pink = M(0xf4a6b0, { r: 0.8 });
  const dark = M(0x1c1a22, { r: 0.6 });

  const b = 1.2;
  const H = buildHero({
    skin: white, top: kimono, bottom: black, boots: black, gloves: black, bootCuff: wrap, bracer: wrap, arm: black,
    build: b, headR: 0.24, ears: false, headShape: { taper: 0.2, chin: 0.0, wide: 1.13 },
  });
  const { group, head, headR: hr } = H;
  group.userData.restyled = true;

  // ---- Tunique : ventre rond, col croise sur le poitrail blanc ----
  const tunic = loft([
    [0.6, 0.17, 0.13], [0.68, 0.212, 0.172, 0, 0.012], [0.8, 0.226, 0.182, 0, 0.014], [0.92, 0.238, 0.166, 0, 0.006],
    [1.0, 0.236, 0.146], [1.045, 0.17, 0.118], [1.065, 0.09, 0.08],
  ], kimono, { segs: 26, sub: 5, sq: 0.12 });
  group.add(tunic);
  const atT = makeAt([H.torso, tunic]);
  group.add(patch(atT, [
    [-0.105, 1.045], [-0.07, 0.97], [-0.035, 0.9], [0.0, 0.835], [0.035, 0.9], [0.07, 0.97], [0.105, 1.045], [0, 1.058],
  ], white, { lift: 0.006, center: [0, 0.97] }));
  // Lisere : le pan droit passe par-dessus le gauche jusqu a la ceinture.
  group.add(line(atT, [[0.112, 1.05], [0.074, 0.97], [0.036, 0.9], [-0.01, 0.82], [-0.06, 0.755]], t => 0.016, kimonoLt, { lift: 0.012, flat: 0.6 }));
  group.add(line(atT, [[-0.112, 1.05], [-0.074, 0.97], [-0.036, 0.9], [0.0, 0.838]], t => 0.016, kimonoLt, { lift: 0.01, flat: 0.6 }));
  // Basque de la tunique + ourlet clair.
  group.add(loft([[0.68, 0.19, 0.15], [0.6, 0.238, 0.196], [0.5, 0.256, 0.21], [0.47, 0.258, 0.212], [0.462, 0.2, 0.16]], kimono, { segs: 26, sub: 4 }));
  group.add(loft([[0.486, 0.246, 0.202], [0.478, 0.268, 0.222], [0.452, 0.27, 0.224], [0.444, 0.22, 0.18]], kimonoLt, { segs: 26, sub: 3 }));
  // Manches courtes.
  for (const [arm, s] of [[H.armL, -1], [H.armR, 1]]) {
    const sleeve = loft([
      [0.07, 0.03, 0.03, -s * 0.03], [0.04, 0.1, 0.1, -s * 0.012], [-0.04, 0.108, 0.11, s * 0.006], [-0.105, 0.112, 0.114, s * 0.016], [-0.115, 0.08, 0.082, s * 0.018],
    ], kimono, { segs: 18, sub: 4 });
    arm.add(sleeve);
    arm.add(loft([[-0.092, 0.1, 0.102, s * 0.015], [-0.1, 0.119, 0.121, s * 0.016], [-0.122, 0.119, 0.121, s * 0.018], [-0.13, 0.085, 0.087, s * 0.019]], kimonoLt, { segs: 18, sub: 3 }));
  }

  // ---- Ceinture nouee, pans qui pendent ----
  group.add(loft([[0.655, 0.18, 0.15], [0.668, 0.232, 0.196, 0, 0.012], [0.745, 0.236, 0.198, 0, 0.013], [0.758, 0.19, 0.155]], sash, { segs: 26, sub: 3 }));
  const knot = sculptSphere((d, out) => { out.set(d.x * 0.05, d.y * 0.042, d.z * 0.036); }, sash, 14, 10);
  knot.position.set(0.1, 0.705, 0.205);
  group.add(knot);
  for (const [dx, len] of [[0.0, 0.2], [0.05, 0.16]]) {
    group.add(tubeAlong([[0.1, 0.7, 0.2], [0.1 + dx * 0.5, 0.7 - len * 0.5, 0.232], [0.1 + dx, 0.7 - len, 0.24]],
      t => 0.02 + 0.014 * t, sash, { steps: 10, segs: 8, flat: 0.35 }));
  }

  // ---- Tete de panda ----
  const cy = hr * 0.88;
  const muzzle = sculptSphere((d, out) => {
    out.set(d.x * hr * 0.46, d.y * hr * 0.3, d.z * hr * 0.33);
  }, white, 26, 18);
  muzzle.position.set(0, hr * 0.42, hr * 0.7);
  head.add(muzzle);
  const at = makeAt([H.skull, muzzle]);
  const atS = makeAt([H.skull]);
  for (const s of [-1, 1]) {
    // Oreilles rondes.
    const ear = sculptSphere((d, out) => { out.set(d.x * hr * 0.34, d.y * hr * 0.32, d.z * hr * 0.15); }, black, 18, 14);
    ear.position.set(s * hr * 0.76, cy + hr * 0.72, -hr * 0.08);
    ear.rotation.set(0, s * 0.2, -s * 0.5);
    head.add(ear);
    // Taches tombantes autour des yeux, joues roses.
    head.add(patch(atS, ellipse(s * hr * 0.43, hr * 0.84, hr * 0.235, hr * 0.33, s * 0.5), black, { lift: hr * 0.012 }));
    head.add(patch(atS, ellipse(s * hr * 0.74, hr * 0.42, hr * 0.13, hr * 0.085, 0, 14), pink, { lift: hr * 0.012, rings: 2 }));
  }
  faceEyes(head, hr, atS, { x: 0.41, y: 0.86, size: 0.165, tall: 1.15, iris: 0x7a4a1c, lash: 0x2b2832 });
  const nose = detail(sculptSphere((d, out) => {
    const w = 0.6 + 0.4 * Math.max(0, d.y + 0.4);
    out.set(d.x * hr * 0.15 * w, d.y * hr * 0.085, d.z * hr * 0.07);
  }, dark, 14, 10));
  nose.position.copy(at(0, hr * 0.55, -hr * 0.012));
  head.add(nose);
  head.add(line(at, [[0, hr * 0.48], [0, hr * 0.38]], t => hr * 0.014, dark, { lift: hr * 0.012, steps: 4 }));
  faceSmile(head, hr, at, dark, { y: 0.34, width: 0.25, curve: 0.11, thick: 0.026 });

  // Petit chignon noue (masque sous une coiffe).
  const bun = new THREE.Group();
  bun.name = 'classHat';
  const tuft = sculptSphere((d, out) => { out.set(d.x * hr * 0.24, d.y * hr * 0.2, d.z * hr * 0.24); }, black, 16, 12);
  tuft.position.set(0, cy + hr * 1.06, -hr * 0.12);
  bun.add(tuft);
  const tie = detail(new THREE.Mesh(new THREE.TorusGeometry(hr * 0.17, hr * 0.045, 8, 16), sash));
  tie.rotation.x = Math.PI / 2 - 0.25;
  tie.position.set(0, cy + hr * 0.95, -hr * 0.1);
  bun.add(tie);
  head.add(bun);

  // ---- Gourde pendue a la ceinture (hanche droite, derriere) ----
  const gourd = new THREE.Group();
  gourd.add(loft([[0, 0.02], [0.025, 0.075], [0.09, 0.1], [0.155, 0.074], [0.185, 0.05], [0.225, 0.064], [0.275, 0.05], [0.3, 0.03]], wood, { segs: 18, sub: 4 }));
  gourd.add(loft([[0.295, 0.028], [0.335, 0.03], [0.345, 0.018]], sash, { segs: 12, sub: 2 }));
  const rope = detail(new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.012, 8, 18), sash));
  rope.rotation.x = Math.PI / 2;
  rope.position.y = 0.185;
  gourd.add(rope);
  gourd.position.set(0.2, 0.42, -0.2);
  gourd.rotation.set(-0.15, 0, -0.25);
  group.add(gourd);

  // ---- Baton de bambou (main gauche) : une seule tige a noeuds ----
  const staff = new THREE.Group();
  const rings = [[-0.62, 0.02], [-0.6, 0.03]];
  for (let k = 0; k < 6; k++) {
    const y = -0.6 + k * 0.29;
    if (k > 0) rings.push([y - 0.016, 0.03], [y, 0.038], [y + 0.016, 0.03]);
    if (k < 5) rings.push([y + 0.145, 0.027]);
  }
  rings.push([0.87, 0.026]);
  staff.add(loft(rings, bamboo, { segs: 14, sub: 3 }));
  for (const [y, a, len] of [[0.56, -0.9, 0.2], [0.56, 0.7, 0.15]]) {
    const leaf = sculptSphere((d, out) => {
      out.set(d.x * 0.035 * (1 - 0.6 * Math.abs(d.y)), (d.y + 1) * len * 0.5, d.z * 0.008);
    }, leafM, 12, 10);
    leaf.position.set(0, y, 0);
    leaf.rotation.set(0, 0.4, a);
    staff.add(leaf);
  }
  staff.position.set(-0.01, -0.05, 0.03);
  staff.rotation.set(0.2, 0, 0.13);
  H.handL.add(staff);

  return group;
}
