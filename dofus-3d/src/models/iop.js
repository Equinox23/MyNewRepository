import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong, roundBox, cloth,
  faceEyes, faceBrows, faceSmile, faceNose, hairShell, hairSpike,
} from './humanoid.js';

// Iop : jeune guerrier sur de lui. Carrure en V (epaules larges, taille
// marquee), bras nus muscles, plastron rouge a col dore, epaulieres
// bombees doublees d or, jupe de plates a lisere dore, brassards et
// revers de bottes dores, cape rouge sombre. Tignasse orange a gros pics
// rejetes en arriere, regard determine et sourire en coin, grande epee
// a large lame dans la main droite.
export function buildIop() {
  const skin = M(0xf3c79c, { r: 0.8 });
  const skinShade = M(0xe2a87c, { r: 0.8 });
  const red = M(0xcf3526, { r: 0.55, m: 0.1 });
  const redDk = M(0x8a1f18, { r: 0.75 });
  const boot = M(0x6e2318, { r: 0.75 });
  const gold = M(0xf4c436, { r: 0.35, m: 0.5 });
  const leather = M(0x5e3a1e, { r: 0.85 });
  const steel = M(0xe6edf4, { r: 0.25, m: 0.8 });
  const steelDk = M(0x9aa8b6, { r: 0.35, m: 0.7 });
  const hair = M(0xf07a1e, { r: 0.7 });
  const hairDk = M(0x9a3a0e, { r: 0.7 });
  const dark = M(0x4a1c12, { r: 0.6 });

  const H = buildHero({
    skin, top: red, bottom: redDk, boots: boot, gloves: leather,
    bootCuff: gold, bracer: gold, build: 1.0, headR: 0.215,
  });
  const { group, head, headR: hr, at } = H;

  // ---- Plastron : col (gorgerin) dore + arete de poitrine ----
  const collar = loft([[1.0, 0.15, 0.11], [1.03, 0.176, 0.126], [1.06, 0.125, 0.1], [1.085, 0.075, 0.07]], gold, { segs: 20, sub: 3 });
  group.add(collar);
  const emblem = sculptSphere((d, out) => {
    // Losange bombe au centre de la poitrine.
    const k = 1 - Math.abs(d.y) * 0.75;
    out.set(d.x * 0.05 * k, d.y * 0.075, d.z * 0.02);
  }, gold, 14, 10);
  emblem.position.set(0, 0.915, 0.137);
  emblem.rotation.x = -0.08;
  group.add(emblem);

  // ---- Ceinture + boucle ----
  group.add(loft([[0.652, 0.11, 0.085], [0.662, 0.142, 0.107], [0.7, 0.14, 0.105], [0.71, 0.11, 0.085]], leather, { segs: 20, sub: 3 }));
  const buckle = roundBox(0.075, 0.062, 0.03, 0.012, gold);
  buckle.position.set(0, 0.681, 0.102);
  group.add(buckle);

  // ---- Jupe de plates d une piece, lisere dore ----
  group.add(loft([[0.67, 0.12, 0.09], [0.63, 0.165, 0.122], [0.55, 0.19, 0.14], [0.515, 0.195, 0.144], [0.507, 0.15, 0.11]], red, { segs: 22, sub: 4 }));
  group.add(loft([[0.527, 0.185, 0.135], [0.519, 0.203, 0.151], [0.497, 0.205, 0.153], [0.489, 0.17, 0.12]], gold, { segs: 22, sub: 3 }));

  // ---- Epaulieres bombees, doublure doree (suivent les bras) ----
  for (const [arm, side] of [[H.armL, -1], [H.armR, 1]]) {
    const dome = (rx, ry, rz, mat) => sculptSphere((d, out) => {
      out.set(d.x * rx, Math.max(d.y, -0.25) * ry, d.z * rz);
    }, mat, 22, 16);
    const plate = dome(0.116, 0.09, 0.112, red);
    plate.position.set(side * 0.018, 0.022, 0);
    plate.rotation.z = -side * 0.42;
    arm.add(plate);
    const rim = loft([[-0.034, 0.09, 0.086], [-0.024, 0.136, 0.13], [0.0, 0.132, 0.126], [0.014, 0.09, 0.086]], gold, { segs: 20, sub: 3 });
    rim.position.set(side * 0.018, 0.022, 0);
    rim.rotation.z = -side * 0.42;
    arm.add(rim);
  }

  // ---- Cape ----
  const cape = cloth(0.4, 0.74, redDk, { curve: 0.1, flare: 0.16, spread: 0.4, wave: 0.035, waves: 3 });
  cape.position.set(0, 1.04, -0.13);
  cape.rotation.x = 0.13;
  cape.name = 'classCape';
  group.add(cape);

  // ---- Visage ----
  faceEyes(head, hr, at, { x: 0.4, y: 0.78, size: 0.22, iris: 0x8a4e1c, lash: 0x4a1c12, tilt: 0.1 });
  faceBrows(head, hr, at, hairDk, { y: 1.13, rise: 0.13 });
  faceNose(head, hr, at, skinShade, { y: 0.5 });
  faceSmile(head, hr, at, dark, { y: 0.24, width: 0.24, curve: 0.08, tilt: 0.05, x: 0.03 });

  // ---- Tignasse : coque + gros pics rejetes en arriere ----
  hairShell(head, hr, hair, { volume: 0.14, front: 0.52 });
  const spikes = new THREE.Group();
  spikes.name = 'classHat'; // masques quand une coiffe est equipee
  head.add(spikes);
  const spike = (dir, len, r, sweep, flat) => spikes.add(hairSpike(head, hr, hair, dir, len, r, sweep, { flat }));
  spike([0, 1, 0.3], 0.3, 0.1, [0, 0.2, -1]);            // crete
  spike([-0.55, 0.9, 0.05], 0.25, 0.09, [-0.4, 0.1, -0.9]);
  spike([0.55, 0.9, 0.05], 0.25, 0.09, [0.4, 0.1, -0.9]);
  spike([0, 0.75, -0.7], 0.28, 0.1, [0, -0.3, -0.9]);    // arriere haut
  spike([-0.7, 0.4, -0.6], 0.22, 0.085, [-0.4, -0.5, -0.6]);
  spike([0.7, 0.4, -0.6], 0.22, 0.085, [0.4, -0.5, -0.6]);
  spike([0, 0.05, -1], 0.18, 0.09, [0, -0.9, -0.2]);     // nuque
  // Meches du front.
  spike([-0.3, 0.6, 0.75], 0.15, 0.062, [-0.5, -1, 0.1]);
  spike([0.15, 0.66, 0.74], 0.13, 0.058, [0.5, -1, 0.1]);

  // ---- Grande epee (main droite) ----
  const sword = new THREE.Group();
  const sh = new THREE.Shape();
  sh.moveTo(-0.046, 0);
  sh.lineTo(-0.058, 0.6);
  sh.quadraticCurveTo(-0.05, 0.78, 0, 0.9);
  sh.quadraticCurveTo(0.05, 0.78, 0.058, 0.6);
  sh.lineTo(0.046, 0);
  sh.closePath();
  const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.024, bevelSegments: 1, curveSegments: 8 });
  bg.translate(0, 0.1, -0.003);
  const blade = new THREE.Mesh(bg, steel);
  blade.castShadow = true;
  sword.add(blade);
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.56, 0.034), steelDk);
  fuller.position.y = 0.42;
  fuller.userData.noOutline = true;
  sword.add(fuller);
  // Garde recourbee vers la lame, fusee de cuir, pommeau.
  sword.add(tubeAlong([[-0.135, 0.112, 0], [-0.075, 0.09, 0], [0, 0.084, 0], [0.075, 0.09, 0], [0.135, 0.112, 0]],
    t => 0.016 + 0.014 * Math.sin(Math.PI * t), gold, { steps: 20, segs: 10 }));
  const grip = loft([[-0.085, 0.02, 0.02], [-0.07, 0.024, 0.024], [0.0, 0.021, 0.021], [0.08, 0.025, 0.025]], leather, { segs: 10, sub: 2 });
  grip.userData.noOutline = true;
  sword.add(grip);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), gold);
  pommel.position.y = -0.1;
  sword.add(pommel);
  // Tenue sur le cote, lame vers le haut et l exterieur (ne cache pas le visage).
  sword.position.set(0.0, -0.05, 0.01);
  sword.rotation.set(0.75, 0, -0.55);
  H.handR.add(sword);

  return group;
}
