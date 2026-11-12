import * as THREE from 'three';
import { M, buildHero, loft, sculptSphere, tubeAlong, lathe } from './humanoid.js';
import { band, surfaceOf, headBand, profile, detail } from './heroKitA.js';

// Xelor : petit mage du temps momifie. Tete et mains enroulees de
// bandelettes, deux yeux cyan qui luisent au fond d une fente d ombre,
// grand chapeau bleu pointu a la pointe recourbee, robe bleu nuit a
// galons dores qui tombe jusqu au sol, pelerine, manches evasees, cadran
// d horloge sur le ventre, baton surmonte d un sablier.
export function buildXelor() {
  const bandage = M(0xf2e8cc, { r: 0.85 });
  const bandageDk = M(0xcdb98c, { r: 0.85 });
  const robe = M(0x2c3c8c, { r: 0.75 });
  const robeDk = M(0x1c2458, { r: 0.85 });
  const robeLt = M(0x4660c0, { r: 0.7 });
  const gold = M(0xf0c444, { r: 0.35, m: 0.5 });
  const wood = M(0x6a4424, { r: 0.85 });
  const dark = M(0x10101e, { r: 0.9 });
  const glow = new THREE.MeshBasicMaterial({ color: 0x8ceeff });
  const glowCore = new THREE.MeshBasicMaterial({ color: 0xeaffff });
  const glowSoft = new THREE.MeshBasicMaterial({ color: 0x73e0ff, transparent: true, opacity: 0.28, depthWrite: false });

  const shape = { taper: 0.3, chin: 0.04 };
  const H = buildHero({
    skin: bandage, top: robe, bottom: robeDk, boots: robeDk, gloves: bandage, arm: robe,
    build: 0.93, headR: 0.22, ears: false, headShape: shape,
  });
  const { group, head, headR: hr, at } = H;
  group.userData.restyled = true; // proportions deja finales

  // ---- Robe evasee jusqu au sol, ourlet et galon central dores ----
  const skirtRings = [[0.75, 0.118, 0.09], [0.63, 0.16, 0.125], [0.36, 0.225, 0.19], [0.09, 0.3, 0.26], [0.03, 0.31, 0.27]];
  group.add(loft(skirtRings, robe, { segs: 26, sub: 5 }));
  group.add(loft([[0.105, 0.28, 0.24], [0.095, 0.309, 0.269], [0.04, 0.323, 0.283], [0.022, 0.3, 0.26]], gold, { segs: 26, sub: 3 }));
  const sk = profile(skirtRings);
  group.add(band((t) => {
    const y = 0.7 - t * 0.6;
    const z = sk(y)[1] + 0.004;
    const dz = (sk(y + 0.01)[1] - sk(y - 0.01)[1]) / 0.02;
    return { p: new THREE.Vector3(0, y, z), n: new THREE.Vector3(0, -dz, 1).normalize(), w: 0.03 + 0.022 * t, th: 0.008 };
  }, gold, { steps: 20, segs: 8, sq: 0.7 }));
  // Ceinture doree.
  group.add(loft([[0.69, 0.11, 0.09], [0.7, 0.142, 0.112], [0.745, 0.13, 0.102], [0.755, 0.1, 0.08]], gold, { segs: 22, sub: 3 }));

  // ---- Cadran d horloge ----
  const clock = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.016, 10, 28), gold);
  rim.castShadow = true;
  clock.add(rim);
  const face = detail(new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.016, 24), M(0xfff6dc, { r: 0.5 })));
  face.rotation.x = Math.PI / 2;
  clock.add(face);
  for (const [len, rot, wd] of [[0.05, -0.5, 0.012], [0.034, 1.25, 0.014]]) {
    const hnd = detail(new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.006), dark));
    hnd.geometry.translate(0, len / 2, 0);
    hnd.position.z = 0.011;
    hnd.rotation.z = rot;
    clock.add(hnd);
  }
  const pin = detail(new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), gold));
  pin.position.z = 0.012;
  clock.add(pin);
  clock.position.set(0, 0.795, 0.126);
  clock.rotation.x = -0.1;
  group.add(clock);

  // ---- Pelerine sur les epaules, bord dore ----
  group.add(loft([[0.915, 0.27, 0.15], [0.93, 0.292, 0.172], [0.985, 0.262, 0.158], [1.04, 0.17, 0.118], [1.075, 0.085, 0.08]], robeLt, { segs: 26, sub: 4 }));
  group.add(loft([[0.9, 0.262, 0.146], [0.908, 0.3, 0.18], [0.934, 0.3, 0.18], [0.942, 0.262, 0.146]], gold, { segs: 26, sub: 3 }));

  // ---- Manches evasees (suivent les bras), revers dore ----
  for (const [arm, s] of [[H.armL, -1], [H.armR, 1]]) {
    arm.add(loft([
      [-0.15, 0.05, 0.054, s * 0.026, 0], [-0.2, 0.064, 0.068, s * 0.034, 0.004], [-0.28, 0.084, 0.088, s * 0.04, 0.018],
      [-0.355, 0.1, 0.104, s * 0.044, 0.037], [-0.372, 0.092, 0.096, s * 0.045, 0.04],
    ], robe, { segs: 16, sub: 4 }));
    arm.add(loft([
      [-0.34, 0.09, 0.094, s * 0.043, 0.034], [-0.348, 0.106, 0.11, s * 0.044, 0.036],
      [-0.378, 0.108, 0.112, s * 0.045, 0.041], [-0.386, 0.09, 0.094, s * 0.045, 0.042],
    ], gold, { segs: 16, sub: 3 }));
  }

  // ---- Tete momifiee : fente d ombre + yeux lumineux ----
  const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const slit = sculptSphere((d, out) => {
    // Meme volume que heroHead, gonfle uniquement dans la fente.
    let x = d.x, y = d.y, z = d.z;
    if (y < 0) {
      const k = -y;
      x *= 1 - shape.taper * Math.pow(k, 1.6);
      z *= z > 0 ? 1 + 0.04 * k : 1 - 0.14 * k;
      y *= 1 + shape.chin;
    } else {
      y *= 0.96;
    }
    x *= 1 + 0.05 * Math.exp(-Math.pow((d.y + 0.32) / 0.3, 2));
    z *= z > 0 ? 0.93 : 1.05;
    const az = Math.atan2(Math.abs(d.x), d.z);
    const m = sm(1.3, 1.08, az) * sm(-0.37, -0.3, d.y + 0.05 * (1 - Math.cos(az))) * sm(0.2, 0.13, d.y - 0.05 * (1 - Math.cos(az)));
    const f = 0.88 + 0.135 * m;
    out.set(x * hr * f, y * hr * f, z * hr * f);
  }, dark, 120, 80);
  slit.position.y = hr * 0.88;
  slit.userData.noOutline = true;
  slit.castShadow = false;
  head.add(slit);
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    const p = at(s * hr * 0.37, hr * 0.8, hr * 0.022);
    g.position.copy(p);
    g.rotation.set(0, s * 0.42, -s * 0.12);
    const ball = (mat, w, h, z) => {
      const m = detail(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), mat));
      m.scale.set(w, h, hr * 0.04);
      m.position.z = z;
      return m;
    };
    g.add(ball(glowSoft, hr * 0.27, hr * 0.33, 0));
    g.add(ball(glow, hr * 0.17, hr * 0.235, hr * 0.012));
    const core = ball(glowCore, hr * 0.085, hr * 0.13, hr * 0.03);
    core.position.set(-s * hr * 0.02, hr * 0.03, hr * 0.03);
    g.add(core);
    head.add(g);
  }
  // Bandelettes : quelques tours inclines autour de la tete.
  const c0 = new THREE.Vector3(0, hr * 0.88, 0);
  const surf = surfaceOf(H.skull, c0);
  const wrap = (y, k, ph, w) => {
    const b = headBand(surf, bandageDk, { y, k, phase: ph, w: hr * (w || 0.06), th: hr * 0.022, lift: hr * 0.012, sq: 0.6 });
    b.userData.noOutline = true;
    head.add(b);
  };
  wrap(0.27, 0.07, 0.3, 0.07);
  wrap(-0.45, -0.07, 0.5, 0.07);
  wrap(-0.95, 0.16, 2.0, 0.055);
  wrap(0.72, -0.12, 1.2, 0.055);
  // Bandelettes defaites qui flottent derriere la tete.
  const l0 = surf(new THREE.Vector3(-0.7, -0.3, -0.65), 0.002);
  head.add(band((t) => {
    const p = l0.clone().add(new THREE.Vector3(-0.07 * Math.sin(t * 2.2), -0.24 * t, -0.1 * t + 0.025 * Math.sin(t * 7)));
    return { p, n: new THREE.Vector3(-0.6, 0.1, -0.8).normalize(), w: 0.024 * (1 - 0.35 * t), th: 0.005 };
  }, bandage, { steps: 16, segs: 8, sq: 0.6 }));
  // Tours de bandelettes au cou.
  group.add(loft([[1.055, 0.07, 0.068], [1.075, 0.09, 0.086], [1.105, 0.086, 0.084], [1.125, 0.066, 0.066]], bandageDk, { segs: 18, sub: 3 }));

  // ---- Grand chapeau pointu a large bord ----
  const hat = new THREE.Group();
  hat.name = 'classHat';
  const brim = sculptSphere((d, out) => {
    const r = Math.hypot(d.x, d.z);
    const a = Math.atan2(d.x, d.z);
    out.set(d.x * 0.375, d.y * 0.03 + 0.045 * r * r * (0.4 + Math.cos(a * 2) * 0.6) - 0.02 * r * r, d.z * 0.375);
  }, robe, 40, 16);
  hat.add(brim);
  hat.add(band((t) => {
    const a = t * Math.PI * 2;
    const x = Math.sin(a), z = Math.cos(a);
    const y = 0.045 * (0.4 + Math.cos(a * 2) * 0.6) - 0.02;
    return { p: new THREE.Vector3(x * 0.375, y, z * 0.375), n: new THREE.Vector3(x, 0, z), w: 0.02, th: 0.014 };
  }, gold, { steps: 48, segs: 8, closed: true, sq: 0 }));
  const tipPts = [[0, -0.01, 0], [0, 0.2, -0.012], [0, 0.4, -0.07], [0.03, 0.55, -0.19], [0.07, 0.6, -0.33], [0.1, 0.56, -0.43]];
  hat.add(tubeAlong(tipPts, t => 0.224 * Math.pow(1 - t, 0.9) + 0.016, robe, { steps: 40, segs: 22 }));
  hat.add(loft([[0.012, 0.2, 0.2], [0.022, 0.256, 0.256], [0.08, 0.244, 0.244, 0, -0.004], [0.09, 0.2, 0.2, 0, -0.004]], gold, { segs: 26, sub: 3 }));
  const gem = sculptSphere((d, out) => { out.set(d.x * 0.04, d.y * 0.048, d.z * 0.022); }, glow, 12, 10);
  gem.position.set(0, 0.05, 0.25);
  gem.castShadow = false;
  hat.add(gem);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), gold);
  bob.position.set(0.105, 0.545, -0.455);
  bob.castShadow = true;
  hat.add(bob);
  hat.position.set(0, hr * 1.36, -hr * 0.06);
  hat.rotation.x = -0.2;
  head.add(hat);

  // ---- Baton a sablier (main droite) ----
  const staff = new THREE.Group();
  staff.add(tubeAlong([[0, -0.56, 0], [0.004, -0.1, 0], [-0.004, 0.35, 0], [0, 0.74, 0]], () => 0.022, wood, { steps: 16, segs: 9 }));
  const cap = (y) => {
    const c = loft([[y - 0.022, 0.04, 0.04], [y - 0.014, 0.078, 0.078], [y + 0.014, 0.078, 0.078], [y + 0.022, 0.04, 0.04]], gold, { segs: 16, sub: 2 });
    staff.add(c);
  };
  cap(0.755);
  cap(1.005);
  const glassM = new THREE.MeshStandardMaterial({ color: 0xc8f0ff, transparent: true, opacity: 0.6, roughness: 0.2 });
  const glass = lathe([[0.02, 0], [0.066, 0.025], [0.058, 0.075], [0.014, 0.115], [0.058, 0.155], [0.066, 0.205], [0.02, 0.23]], glassM, 18);
  glass.position.y = 0.765;
  glass.userData.noOutline = true;
  staff.add(glass);
  const sand = detail(lathe([[0.01, 0], [0.05, 0.02], [0.03, 0.05], [0.006, 0.085]], M(0xf8d060, { r: 0.6 }), 12));
  sand.position.y = 0.775;
  staff.add(sand);
  const sand2 = detail(lathe([[0.006, 0], [0.04, 0.05], [0.044, 0.062], [0.01, 0.066]], M(0xf8d060, { r: 0.6 }), 12));
  sand2.position.y = 0.885;
  staff.add(sand2);
  staff.position.set(0, -0.055, 0.03);
  staff.rotation.set(0.56, 0, -0.16);
  H.handR.add(staff);

  return group;
}
