import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere, tubeAlong } from './kit.js';
import { paint, ratio, smooth, gauss, line, decal, blob, feather } from './monsterKitA.js';

// Chaton Blanc : invocation de l Ecaflip. Chaton assis tout en rondeurs,
// grosse tete a bajoues touffues, immenses yeux verts, petit nez rose et
// bouche en "w", oreilles pointues a l interieur rose, une patte levee
// pour jouer, queue en point d interrogation, collier rouge a grelot.
export function buildChatonBlanc() {
  const group = new THREE.Group();

  const furHex = 0xf8f5ee;
  const fur = M(furHex, { r: 0.9 });
  const furEar = M(furHex, { r: 0.9 });
  const furTail = M(furHex, { r: 0.9 });
  const pink = M(0xf59ab0, { r: 0.6 });
  const cheekMat = M(0xf9c0c8, { r: 0.8 });
  const dark = M(0x4a342c, { r: 0.5 });
  const whisk = M(0x9a9088, { r: 0.6 });
  const red = M(0xd8322a, { r: 0.6 });
  const gold = M(0xffcf3a, { r: 0.3, m: 0.6 });

  // ---- Queue en point d interrogation (bout creme) ----
  const tail = tubeAlong([
    [0.02, 0.07, -0.2], [0.1, 0.07, -0.36], [0.22, 0.2, -0.43], [0.27, 0.42, -0.38], [0.2, 0.6, -0.32], [0.09, 0.62, -0.3],
  ], t => 0.05 * (1 - 0.25 * t) * Math.min(1, Math.sqrt(Math.max(0, 1 - t)) * 3.2 + 0.15), furTail, {
    steps: 44, segs: 12, shade: t => 1 - 0.16 * smooth(0.72, 0.9, t),
  });
  group.add(tail);

  // ---- Corps assis en poire ----
  const body = sculptSphere((d, out) => {
    const low = Math.max(0, -d.y), up = Math.max(0, d.y);
    const w = 1 + 0.12 * low - 0.38 * up * up;
    out.set(d.x * 0.225 * w, d.y * (d.y > 0 ? 0.3 : 0.27), d.z * 0.235 * w - 0.05 * low + 0.03 * up);
  }, fur, 36, 26);
  body.position.set(0, 0.27, -0.03);
  group.add(body);
  // Cuisses + pieds arriere qui depassent devant.
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(mesh(new THREE.SphereGeometry(0.13, 16, 12), fur, [s * 0.165, 0.14, -0.05], [0.85, 1.05, 1.2]));
    const foot = blob(0.062, 0.05, 0.115, fur, (d, out) => { if (d.y < 0) out.y *= 0.8; });
    foot.position.set(s * 0.21, 0.04, 0.12);
    foot.rotation.y = s * 0.3;
    leg.add(foot);
    group.add(leg);
  }
  // Patte avant droite posee.
  const pawR = new THREE.Group();
  pawR.add(loft([
    [0.42, 0.07, 0.07, 0, -0.07], [0.28, 0.058, 0.058, 0, -0.03], [0.12, 0.05, 0.05, 0, 0], [0.04, 0.058, 0.064, 0, 0.012], [0.0, 0.045, 0.05, 0, 0.014],
  ], fur, { segs: 14, sub: 4 }));
  pawR.position.set(0.085, 0, 0.17);
  group.add(pawR);
  // Patte avant gauche levee, coussinets roses visibles.
  const pawL = new THREE.Group();
  pawL.add(tubeAlong([[-0.06, 0.4, 0.06], [-0.15, 0.36, 0.2], [-0.215, 0.42, 0.3], [-0.225, 0.5, 0.33]], t => 0.062 - 0.012 * t, fur, { steps: 18, segs: 12 }));
  pawL.add(mesh(new THREE.SphereGeometry(0.068, 14, 10), fur, [-0.227, 0.515, 0.335], [1.05, 1, 0.9]));
  pawL.add(decal(mesh(new THREE.SphereGeometry(0.026, 10, 8), pink, [-0.227, 0.5, 0.392], [1.2, 0.9, 0.4])));
  for (const k of [-1, 0, 1]) {
    pawL.add(decal(mesh(new THREE.SphereGeometry(0.013, 8, 6), pink, [-0.227 + k * 0.03, 0.545 - Math.abs(k) * 0.008, 0.384], [1, 1.1, 0.5])));
  }
  group.add(pawL);

  // ---- Collier rouge + grelot ----
  const collar = mesh(new THREE.TorusGeometry(0.15, 0.027, 10, 28), red, [0, 0.515, 0.02], [1, 1, 1], [Math.PI / 2 + 0.12, 0, 0]);
  group.add(collar);
  const bell = mesh(new THREE.SphereGeometry(0.048, 14, 10), gold, [0, 0.47, 0.175]);
  group.add(bell);
  group.add(decal(mesh(new THREE.SphereGeometry(0.012, 8, 6), dark, [0, 0.452, 0.218])));

  // ---- Tete ----
  const head = new THREE.Group();
  head.position.set(0, 0.77, 0.07);
  const skull = sculptSphere((d, out) => {
    let x = d.x * 0.295, y = d.y * (d.y > 0 ? 0.235 : 0.225), z = d.z * 0.255;
    // Bajoues : touffes de poils en pointe vers le bas / l exterieur.
    const ck = gauss(Math.abs(d.x) - 0.86, 0.22) * gauss(d.y + 0.4, 0.26) * smooth(-0.6, 0.1, d.z);
    x += Math.sign(d.x) * 0.075 * ck; y -= 0.035 * ck;
    // Museau : deux petits coussins.
    const mz = gauss(Math.abs(d.x) - 0.13, 0.2) * gauss(d.y + 0.32, 0.2) * Math.max(0, d.z);
    z += 0.035 * mz;
    out.set(x, y, z);
  }, fur, 52, 36);
  head.add(skull);
  const eyes = addEyes(head, { x: 0, y: 0.015, z: 0.205, size: 0.092, spacing: 0.275, turn: 0.33, iris: 0x4fc79a });
  // Le globe garde son contour : il dessine l oeil sur le pelage blanc.
  for (const e of eyes) e.children.slice(1).forEach(o => { o.userData.noOutline = true; });
  const nz = blob(0.028, 0.019, 0.016, pink, (d, out) => { out.x *= 1 - 0.6 * Math.max(0, -d.y); }, 14, 10);
  nz.position.set(0, -0.062, 0.268);
  head.add(decal(nz));
  const my = -0.085, mz0 = 0.27;
  head.add(line([[0, my + 0.008, mz0], [0, my - 0.012, mz0 + 0.004]], 0.0065, dark));
  for (const s of [-1, 1]) {
    head.add(line([[0, my - 0.012, mz0 + 0.004], [s * 0.028, my - 0.032, mz0 + 0.002], [s * 0.06, my - 0.024, mz0 - 0.012], [s * 0.075, my - 0.008, mz0 - 0.024]], 0.0065, dark));
    head.add(decal(mesh(new THREE.SphereGeometry(0.05, 14, 10), cheekMat, [s * 0.2, -0.075, 0.18], [1.2, 0.7, 0.3], [0, s * 0.75, 0])));
    // Moustaches.
    for (const [dy, up] of [[0.0, 0.035], [-0.03, -0.02]]) {
      head.add(line([[s * 0.14, -0.085 + dy, 0.235], [s * 0.26, -0.08 + dy + up * 0.6, 0.22], [s * 0.4, -0.085 + dy + up, 0.17]], 0.0055, whisk, { taper: true }));
    }
  }
  // Petite langue qui depasse.
  head.add(decal(mesh(new THREE.SphereGeometry(0.02, 10, 8), pink, [0, my - 0.04, mz0 - 0.004], [1, 1.1, 0.5])));
  // Oreilles triangulaires, interieur rose peint.
  const pinkR = ratio(furHex, 0xf7a6b8);
  for (const s of [-1, 1]) {
    const ear = feather(0.25, 0.1, furEar, { thick: 0.04, base: 1.1, pw: 1.0, sharp: 1, cup: -0.1, ws: 26, hs: 22 });
    paint(ear, [[pinkR, (p, n) => smooth(0.2, 0.6, n.z) * smooth(0.078 * (1 - p.y / 0.25) + 0.012, 0.078 * (1 - p.y / 0.25) - 0.02, Math.abs(p.x)) * smooth(0.19, 0.14, p.y)]]);
    ear.position.set(s * 0.175, 0.13, -0.01);
    ear.rotation.set(-0.1, s * 0.3, -s * 0.42);
    head.add(ear);
  }
  head.rotation.z = -0.07;
  group.add(head);

  return group;
}
