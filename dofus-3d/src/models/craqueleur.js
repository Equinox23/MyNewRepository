import * as THREE from 'three';
import { M, mesh, woolBlob, sculptSphere } from './kit.js';
import { rockBlob, rockCrack, crystal, spike, mark } from './monsterKitB.js';

// Craqueleur : golem de roche trapu et voute. Blocs tailles (facettes
// franches, pas de cailloux empiles) : enorme buste, epaules en dalles,
// avant-bras-massues qui frolent le sol, petite tete enfoncee a lourde
// arcade et machoire prognathe, yeux et fissures qui rougeoient, mousse
// et pousses sur le dos.
// Rig.js retrouve les membres par position : jambes, bras (epaule + poing)
// et tete sont des enfants directs ; tout le reste est dans `torso`.
// opts : palette / parure des variantes de boss (bosses.js).
//   stone, stoneLt, stoneDk, glow, moss (0..2), crystals (materiau),
//   horns (pointes de roche), seed.
export function buildCraqueleur(opts = {}) {
  const group = new THREE.Group();
  const seed = opts.seed || 3;
  let n = 0;
  // Un materiau par teinte (couleurs de sommet pour nuancer les facettes).
  const stone = M(opts.stone || 0x9c8c7a, { r: 0.95 });
  const stoneLt = M(opts.stoneLt || 0xbcab94, { r: 0.95 });
  const stoneDk = M(opts.stoneDk || 0x6e5e50, { r: 0.95 });
  const glowHex = opts.glow || 0xffb01e;
  const glow = new THREE.MeshBasicMaterial({ color: glowHex });
  const glowLt = new THREE.MeshBasicMaterial({ color: new THREE.Color(glowHex).lerp(new THREE.Color(0xffffff), 0.6) });
  const halo = new THREE.MeshBasicMaterial({ color: glowHex, transparent: true, opacity: 0.35 });
  const dark = M(0x1e140e, { r: 1 });
  const shard = M(opts.stoneDk || 0x6e5e50, { r: 0.95 });
  const mossAmt = opts.moss !== undefined ? opts.moss : 1;
  const moss = M(opts.mossColor || 0x5f9e36, { r: 0.95 });
  const mossLt = M(0x8ccc4e, { r: 0.9 });
  const stemMat = M(0x4f8a2c, { r: 0.95 });

  const rock = (r, mat, pos, scale, rot, o = {}) => {
    const m = rockBlob(r, mat, { seed: seed * 31 + (++n) * 17, scale, planes: o.planes || 14, cut: o.cut !== undefined ? o.cut : 0.6, flat: o.flat, tone: o.tone !== undefined ? o.tone : 0.22, ws: o.ws, hs: o.hs });
    m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    return m;
  };

  // ---- Jambes : deux piliers courts ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(rock(0.19, stoneDk, [0, 0.19, 0.02], [1, 1.02, 1.2], [0, s * 0.3, 0], { flat: 0.93, planes: 12 }));
    leg.position.set(s * 0.21, 0, 0);
    group.add(leg);
  }

  // ---- Buste voute ----
  const torso = new THREE.Group();
  const chest = rock(0.45, stone, [0, 0.68, -0.03], [1.16, 0.98, 0.9], [0.12, 0, 0], { planes: 18, cut: 0.62, ws: 44, hs: 32 });
  torso.add(chest);
  // Plaque ventrale plus claire + bassin sombre.
  torso.add(rock(0.24, stoneLt, [0, 0.5, 0.2], [1.25, 0.95, 0.72], [-0.1, 0, 0], { planes: 10, cut: 0.64 }));
  torso.add(rock(0.24, stoneDk, [0, 0.33, -0.03], [1.3, 0.7, 0.95], null, { planes: 10 }));
  // Fissures qui rougeoient sur le poitrail.
  torso.add(rockCrack(chest, [[-0.5, 0.25, 0.8], [-0.28, 0.42, 0.86], [-0.3, 0.6, 0.72], [-0.12, 0.72, 0.65]], glow, 0.016));
  torso.add(rockCrack(chest, [[-0.28, 0.42, 0.86], [-0.1, 0.36, 0.92]], glow, 0.011));
  torso.add(rockCrack(chest, [[0.62, 0.05, 0.78], [0.5, 0.3, 0.8], [0.6, 0.5, 0.62]], glow, 0.013));
  // Mousse sur les epaules et le dos, pousses.
  if (mossAmt > 0) {
    const m1 = woolBlob(0.3, moss, { lobes: 12, amp: 0.3, scale: [1.3, 0.42, 0.9], seed: 4, shade: 0.3, ws: 44, hs: 28 });
    m1.position.set(0, 1.04, -0.24);
    m1.rotation.x = -0.35;
    torso.add(m1);
    if (mossAmt > 1) {
      const m2 = woolBlob(0.2, moss, { lobes: 9, amp: 0.3, scale: [1.3, 0.5, 1], seed: 9, shade: 0.3, ws: 32, hs: 22 });
      m2.position.set(-0.05, 0.62, -0.42);
      m2.rotation.x = -1.2;
      torso.add(m2);
    }
    // Pousses a deux feuilles.
    for (const [x, y, z, a, k] of [[0.1, 1.12, -0.2, 0.25, 1], [-0.16, 1.08, -0.24, -0.4, 0.75]]) {
      const sprout = new THREE.Group();
      sprout.add(mark(spike([[0, 0, 0], [0.01, 0.07, 0], [0.0, 0.14, 0.01]], 0.014, stemMat, { steps: 6, segs: 6, pow: 0.3 })));
      for (const s of [-1, 1]) {
        const leaf = sculptSphere((d, out) => {
          const t = (d.x + 1) / 2;
          out.set(d.x * 0.055, d.y * 0.012 + 0.02 * Math.sin(Math.PI * t), d.z * 0.03 * Math.sin(Math.PI * Math.pow(t, 0.7)));
        }, mossLt, 12, 8);
        leaf.position.set(s * 0.05, 0.14, 0.01);
        leaf.rotation.z = s * 0.45;
        leaf.userData.noOutline = true;
        sprout.add(leaf);
      }
      sprout.position.set(x, y, z);
      sprout.rotation.z = a;
      sprout.scale.setScalar(k * 1.2);
      torso.add(sprout);
    }
  }
  // Cristaux (Craqueleur legendaire / ancien) sur le dos.
  if (opts.crystals) {
    for (const [x, y, z, rx, rz, len] of [[0, 1.0, -0.26, -0.55, 0.05, 0.5], [-0.2, 0.98, -0.28, -0.6, 0.5, 0.36], [0.2, 0.98, -0.3, -0.65, -0.45, 0.4],
      [0.07, 0.78, -0.4, -1.15, -0.2, 0.3], [-0.12, 0.72, -0.42, -1.25, 0.35, 0.26]]) {
      const c = crystal(len, len * 0.2, opts.crystals);
      c.position.set(x, y, z);
      c.rotation.set(rx, 0, rz);
      torso.add(c);
    }
  }
  group.add(torso);

  // ---- Bras : epaule en dalle, bras court, enorme poing ----
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.add(rock(0.25, stoneLt, [s * 0.47, 0.9, -0.02], [1.12, 0.82, 1.05], [0, 0, s * -0.35], { planes: 12, cut: 0.62 }));
    arm.add(rock(0.15, stoneDk, [s * 0.58, 0.62, 0.04], [0.95, 1.35, 0.95], [0.1, 0, s * 0.18], { planes: 10 }));
    const fist = rock(0.25, stone, [s * 0.63, 0.32, 0.13], [1, 1.08, 1.12], [0.2, s * 0.4, 0], { planes: 14, cut: 0.62 });
    arm.add(fist);
    // Phalanges : dalle claire a l avant du poing.
    arm.add(rock(0.13, stoneLt, [s * 0.6, 0.235, 0.34], [1.45, 0.85, 0.7], [0.25, s * 0.25, 0], { planes: 9, cut: 0.66 }));
    arm.add(rockCrack(fist, [[s * -0.3, 0.75, 0.55], [s * -0.1, 0.45, 0.85], [s * -0.35, 0.15, 0.9]], glow, 0.012));
    if (opts.horns) {
      // Eclats de roche dresses sur l epaule.
      for (const [dx, dz, len, a] of [[0.02, 0, 0.3, 0.35], [0.14, -0.1, 0.2, 0.7]]) {
        const sp = opts.crystals ? crystal(len * 1.25, len * 0.24, opts.crystals) : crystal(len * 1.3, len * 0.36, shard);
        sp.position.set(s * (0.44 + dx), 1.02, -0.04 + dz);
        sp.rotation.z = -s * a;
        arm.add(sp);
      }
    }
    group.add(arm);
  }

  // ---- Tete enfoncee entre les epaules ----
  const head = new THREE.Group();
  head.position.set(0, 1.01, 0.23);
  head.add(rock(0.23, stone, [0, 0.03, -0.02], [1.15, 0.95, 1], [0.15, 0, 0], { planes: 12, cut: 0.7 }));
  // Arcade lourde et froncee.
  head.add(rock(0.14, stoneDk, [0, 0.135, 0.07], [1.7, 0.42, 0.9], [0.3, 0, 0], { planes: 8, cut: 0.62 }));
  // Machoire prognathe + deux crocs de pierre.
  head.add(rock(0.16, stoneDk, [0, -0.16, 0.08], [1.4, 0.6, 1.05], [-0.1, 0, 0], { planes: 9, cut: 0.64 }));
  for (const s of [-1, 1]) {
    const tooth = rockBlob(0.034, stoneLt, { seed: 21, scale: [0.8, 1.4, 0.8], planes: 6, cut: 0.7, ws: 12, hs: 10 });
    tooth.position.set(s * 0.15, -0.085, 0.19);
    tooth.rotation.z = s * 0.15;
    tooth.userData.noOutline = true;
    head.add(tooth);
    // Orbite sombre + oeil en amande incandescente.
    head.add(mark(mesh(new THREE.SphereGeometry(0.075, 14, 10), dark, [s * 0.1, 0.03, 0.17], [1.25, 0.8, 0.5], [0, s * 0.3, s * 0.3])));
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), glow);
    eye.position.set(s * 0.1, 0.028, 0.195);
    eye.scale.set(1.3, 0.78, 0.5);
    eye.rotation.set(0, s * 0.3, s * 0.3);
    head.add(eye);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), glowLt);
    core.position.set(s * 0.092, 0.026, 0.218);
    head.add(core);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), halo);
    h.position.set(s * 0.1, 0.028, 0.19);
    h.scale.set(1.2, 0.8, 0.5);
    head.add(h);
  }
  group.add(head);

  group.userData.parts = { torso, head };
  return group;
}
