import * as THREE from 'three';
import {
  M, buildHero, loft, sculptSphere, tubeAlong,
  faceEyes, faceBrows, faceSmile, faceNose, hairShell, hairSpike,
} from './humanoid.js';
import { woolBlob } from './kit.js';
import { band, torsoStrap, detail } from './heroKitA.js';

// Osamodas : dresseur de betes un peu sauvage, souriant. Bras nus,
// tunique verte sans manches a jupe courte et pan de cuir, col de
// fourrure, sangle de cuir, brassards et bottes a revers de fourrure,
// petites cornes claires, tignasse brune en bataille, queue ecailleuse,
// fouet enroule a la hanche et baton d invocation a orbe vert.
export function buildOsamodas() {
  const skin = M(0xeec39a, { r: 0.8 });
  const skinShade = M(0xd9a47a, { r: 0.8 });
  const tunic = M(0x58a03c, { r: 0.7 });
  const tunicDk = M(0x2f6a2a, { r: 0.8 });
  const brown = M(0x7a5228, { r: 0.85 });
  const brownDk = M(0x4a2e14, { r: 0.9 });
  const fur = M(0xe6cd9c, { r: 0.95 });
  const furBlob = M(0xe6cd9c, { r: 0.95 });
  const horn = M(0xf4e8cc, { r: 0.55 });
  const hornRing = M(0xf4e8cc, { r: 0.55 });
  const scale = M(0x4c9440, { r: 0.6 });
  const gold = M(0xf0c444, { r: 0.35, m: 0.5 });
  const hair = M(0x7a4a22, { r: 0.75 });
  const hairDk = M(0x4a2a10, { r: 0.75 });
  const dark = M(0x4a2414, { r: 0.6 });
  const orb = new THREE.MeshStandardMaterial({ color: 0x8cf09a, emissive: 0x2f9a48, emissiveIntensity: 1, roughness: 0.3 });

  const H = buildHero({
    skin, top: tunic, bottom: brown, boots: brownDk, gloves: skin,
    bootCuff: fur, bracer: brownDk, build: 0.97, headR: 0.215,
  });
  const { group, head, headR: hr, at } = H;
  group.userData.restyled = true; // proportions deja finales

  // ---- Col de fourrure pose sur les epaules ----
  const mantle = woolBlob(0.2, furBlob, { lobes: 30, amp: 0.3, scale: [1.2, 0.42, 0.88], seed: 11, ws: 64, hs: 40, shade: 0.2 });
  mantle.position.set(0, 1.01, -0.012);
  mantle.rotation.x = 0.16;
  group.add(mantle);

  // ---- Sangle de cuir en travers du buste ----
  group.add(torsoStrap(H, brown, { y: 0.865, slope: -1.05, w: 0.024, th: 0.009 }));

  // ---- Ceinture, boucle, jupe courte et pan de cuir ----
  group.add(loft([[0.652, 0.108, 0.084], [0.662, 0.14, 0.105], [0.7, 0.138, 0.103], [0.71, 0.108, 0.084]], brownDk, { segs: 20, sub: 3 }));
  const buckle = sculptSphere((d, out) => { out.set(d.x * 0.038, d.y * 0.038, d.z * 0.016); }, gold, 14, 10);
  buckle.position.set(0, 0.681, 0.104);
  group.add(buckle);
  const skirtRings = [[0.67, 0.118, 0.09], [0.62, 0.166, 0.124], [0.52, 0.19, 0.142], [0.47, 0.193, 0.145], [0.462, 0.15, 0.11]];
  group.add(loft(skirtRings, tunic, { segs: 22, sub: 4 }));
  group.add(loft([[0.492, 0.184, 0.136], [0.484, 0.201, 0.153], [0.462, 0.203, 0.155], [0.454, 0.17, 0.12]], tunicDk, { segs: 22, sub: 3 }));
  // Pan de cuir devant, termine en pointe.
  const flap = band((t) => {
    const y = 0.66 - t * 0.3;
    const z = 0.11 + 0.052 * Math.min(1, t * 2.4) + 0.012 * t;
    return { p: new THREE.Vector3(0, y, z), n: new THREE.Vector3(0, 0.12, 1).normalize(), w: 0.062 * Math.pow(1 - Math.max(0, (t - 0.55) / 0.45), 0.8) + 0.002, th: 0.008 };
  }, brown, { steps: 18, segs: 8, sq: 0.6 });
  group.add(flap);

  // ---- Fouet enroule a la hanche gauche ----
  const whip = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.017, 8, 22), brownDk);
  whip.position.set(-0.168, 0.6, 0.035);
  whip.rotation.set(0.15, Math.PI / 2 - 0.35, 0);
  whip.castShadow = true;
  group.add(whip);

  // ---- Queue ecailleuse terminee en fer de lance ----
  const tailPts = [[0, 0.6, -0.08], [0, 0.5, -0.24], [0.05, 0.4, -0.4], [0.17, 0.4, -0.52], [0.27, 0.5, -0.56], [0.31, 0.62, -0.53]];
  group.add(tubeAlong(tailPts, t => 0.05 * Math.pow(1 - t, 0.8) + 0.014, scale, { steps: 30, segs: 10 }));
  const tip = sculptSphere((d, out) => {
    const k = d.y > 0 ? 1 - d.y * 0.9 : 1 + d.y * 0.35;
    out.set(d.x * 0.055 * k, d.y * 0.085 + 0.03, d.z * 0.022);
  }, tunicDk, 14, 12);
  tip.position.set(0.315, 0.64, -0.525);
  tip.rotation.set(-0.25, 0.3, -0.35);
  group.add(tip);

  // ---- Visage : grands yeux verts, sourire franc, petit croc ----
  faceEyes(head, hr, at, { x: 0.4, y: 0.78, size: 0.23, iris: 0x3c9a44, lash: 0x3a1c0c, tilt: 0.03 });
  faceBrows(head, hr, at, hairDk, { y: 1.13, rise: 0.02, thick: 0.045 });
  faceNose(head, hr, at, skinShade, { y: 0.5 });
  faceSmile(head, hr, at, dark, { y: 0.27, width: 0.27, curve: 0.11 });
  const fang = detail(sculptSphere((d, out) => {
    out.set(d.x * hr * 0.035 * (1 + Math.min(0, d.y) * 0.8), d.y * hr * 0.06, d.z * hr * 0.03);
  }, M(0xffffff, { r: 0.4 }), 8, 6));
  fang.position.copy(at(hr * 0.15, hr * 0.235, hr * 0.012));
  head.add(fang);
  // Marques tribales sur les joues.
  for (const s of [-1, 1]) {
    for (const [y0, len] of [[0.5, 0.2], [0.38, 0.15]]) {
      const pts = [];
      for (let i = 0; i <= 4; i++) pts.push(at(s * hr * (0.62 + len * i / 4), hr * (y0 + 0.07 * i / 4), hr * 0.008));
      head.add(detail(tubeAlong(pts, t => hr * 0.026 * (0.5 + 0.5 * Math.sin(Math.PI * t)), scale, { steps: 8, segs: 6 })));
    }
  }

  // ---- Tignasse brune en bataille ----
  hairShell(head, hr, hair, { volume: 0.17, front: 0.5, nape: -0.62 });
  const mane = new THREE.Group();
  mane.name = 'classHat'; // masquee quand une coiffe est equipee
  head.add(mane);
  const spike = (dir, len, r, sweep, flat) => mane.add(hairSpike(head, hr, hair, dir, len, r, sweep, { flat }));
  spike([0.1, 1, 0.25], 0.2, 0.1, [0.5, 0.1, 0.5]);        // epi du dessus
  spike([-0.25, 1, -0.2], 0.2, 0.095, [-0.6, 0.1, -0.5]);
  spike([0.3, 0.9, -0.45], 0.22, 0.095, [0.5, 0, -0.8]);
  spike([-0.92, 0.3, -0.2], 0.2, 0.09, [-0.5, -0.9, 0]);   // cotes, tombants
  spike([0.92, 0.3, -0.2], 0.2, 0.09, [0.5, -0.9, 0]);
  spike([-0.6, 0.35, -0.7], 0.25, 0.1, [-0.3, -0.9, -0.2]); // criniere
  spike([0.6, 0.35, -0.7], 0.25, 0.1, [0.3, -0.9, -0.2]);
  spike([0, 0.55, -0.85], 0.26, 0.11, [0, -0.8, -0.4]);
  spike([0, -0.1, -1], 0.24, 0.1, [0, -1, 0.05]);
  // Meches du front.
  spike([-0.42, 0.58, 0.7], 0.14, 0.06, [-0.4, -1, 0.15]);
  spike([0.0, 0.68, 0.74], 0.15, 0.064, [0.25, -1, 0.15]);
  spike([0.42, 0.6, 0.68], 0.12, 0.055, [0.6, -0.8, 0.1]);

  // ---- Petites cornes claires, legerement annelees ----
  const c0 = new THREE.Vector3(0, hr * 0.88, 0);
  for (const s of [-1, 1]) {
    const d = new THREE.Vector3(s * 0.62, 0.76, 0.12).normalize();
    const p0 = c0.clone().addScaledVector(d, hr * 0.86);
    const pts = [p0, p0.clone().add(new THREE.Vector3(s * 0.05, 0.06, 0.005)), p0.clone().add(new THREE.Vector3(s * 0.105, 0.135, -0.01)),
      p0.clone().add(new THREE.Vector3(s * 0.12, 0.215, -0.05)), p0.clone().add(new THREE.Vector3(s * 0.095, 0.27, -0.1))];
    const wave = t => Math.sin(t * 5 * Math.PI * 2);
    head.add(tubeAlong(pts, t => (0.046 * Math.pow(1 - t, 0.8) + 0.005) * (1 + 0.06 * wave(t) * (1 - t)), hornRing, {
      steps: 36, segs: 10, shade: t => 1 - 0.16 * Math.max(0, -wave(t)) * (1 - t),
    }));
  }

  // ---- Baton d invocation : bois noueux, griffes de corne, orbe vert ----
  const staff = new THREE.Group();
  staff.add(tubeAlong([[0, -0.58, 0], [0.006, -0.2, 0], [-0.006, 0.2, 0], [0.004, 0.55, 0], [0, 0.8, 0]],
    t => 0.021 + 0.005 * Math.sin(t * 9) + (t > 0.9 ? (t - 0.9) * 0.12 : 0), brown, { steps: 26, segs: 9 }));
  const orbM = new THREE.Mesh(new THREE.SphereGeometry(0.068, 18, 14), orb);
  orbM.position.y = 0.9;
  staff.add(orbM);
  const halo = detail(new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 10), new THREE.MeshBasicMaterial({ color: 0x8cf09a, transparent: true, opacity: 0.22, depthWrite: false })));
  halo.position.y = 0.9;
  staff.add(halo);
  for (const s of [-1, 1]) {
    staff.add(tubeAlong([[s * 0.012, 0.79, 0], [s * 0.085, 0.83, 0], [s * 0.115, 0.92, 0], [s * 0.085, 1.01, 0], [s * 0.03, 1.045, 0]],
      t => 0.021 * Math.pow(1 - t, 0.7) + 0.004, horn, { steps: 18, segs: 8 }));
  }
  staff.position.set(0, -0.055, 0.02);
  staff.rotation.set(0.52, 0, -0.14);
  H.handR.add(staff);

  return group;
}
