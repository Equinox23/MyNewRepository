import * as THREE from 'three';
import { M, mesh, loft, sculptSphere, tubeAlong, woolBlob } from './kit.js';
import { paintSphere, vcol, mix, sstep, bone, limb, spike, sheet, crownMesh, mark } from './monsterKitB.js';

// Chafer : fantassin squelette. Gros crane d une seule piece (orbites
// creuses ou luit une flamme, nez, dents peintes), machoire separee, cage
// thoracique sculptee (cotes en relief), colonne, bassin, os longs a
// tetes renflees, lambeaux de tissu, casque de fer cabosse, epauliere,
// rondache de bois et lance a pointe d os.
// `opts.royal` : Chafer Royal (couronne, cape en lambeaux a col de
// fourrure, epaulieres dorees, grande epee) -- voir chaferRoyal.js.
// Rig.js retrouve les membres par position : jambes, bras (avec arme /
// bouclier) et tete sont des enfants directs ; le reste est dans `torso`.
export function buildChafer(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const BONE = 0xece5cf;
  const boneMat = M(BONE, { r: 0.8 });
  const boneV = M(BONE, { r: 0.8 });       // pieces peintes (couleurs de sommet)
  const boneDk = M(0xcfc4a4, { r: 0.85 });
  const IRON = royal ? 0x4a4038 : 0x5a626c;
  const iron = M(IRON, { r: 0.5, m: 0.5 });
  const ironV = M(IRON, { r: 0.5, m: 0.5 });
  const gold = M(0xe2b035, { r: 0.35, m: 0.6 });
  const trim = royal ? gold : M(0x3a4048, { r: 0.55, m: 0.5 });
  const CLOTH = royal ? 0x8a1c22 : 0x4d5878;
  const cloth = M(CLOTH, { r: 0.9 });
  const clothPlain = M(CLOTH, { r: 0.9 });
  const WOOD = 0x8a5a32;
  const woodV = M(WOOD, { r: 0.85 });
  const wood = M(0x6e4526, { r: 0.85 });
  const eyeHex = royal ? 0xff4a3a : 0x6fe6ff;
  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeHex });
  const eyeCore = new THREE.MeshBasicMaterial({ color: new THREE.Color(eyeHex).lerp(new THREE.Color(0xffffff), 0.7) });
  const haloMat = new THREE.MeshBasicMaterial({ color: eyeHex, transparent: true, opacity: 0.3 });
  const cHole = vcol(0x1a1420, BONE);
  const cTooth = vcol(0xfffaf0, BONE);
  const cShade = vcol(0xc9bc98, BONE);

  // Lambeau de tissu : bas dechiquete, leger galbe.
  const rag = (w, h, o = {}) => sheet((u, v, out) => {
    const x = (u - 0.5) * w * (1 + (o.spread || 0.2) * v);
    const tooth = Math.abs(((u * (o.teeth || 3) + (o.phase || 0.3)) % 1) - 0.5) * 2;
    const len = h * (1 - (o.jag || 0.3) * tooth * (0.6 + 0.4 * Math.sin(u * 9 + (o.phase || 0))));
    out.set(x, -v * len, (o.curve || 0.05) * (1 - Math.pow(u * 2 - 1, 2)) + (o.flare || 0) * v * v + 0.012 * Math.sin(u * 11 + v * 5) * v);
  }, 16, 8, 0.012, cloth, { color: (u, v) => { const k = 1 - 0.3 * v * v; return [k, k, k]; } });

  // ---- Jambes : femur, tibia, pied osseux ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(bone([[s * 0.095, 0.56, 0], [s * 0.115, 0.31, 0.03]], 0.028, boneMat));
    leg.add(bone([[s * 0.115, 0.3, 0.03], [s * 0.12, 0.07, -0.01]], 0.025, boneMat, { knob: 0.6 }));
    const foot = sculptSphere((d, out) => {
      out.set(d.x * 0.06 * (1 + 0.3 * Math.max(0, d.z)), Math.max(d.y, -0.6) * 0.04 + 0.024, d.z * 0.115 + 0.045);
    }, boneDk, 16, 12);
    foot.position.set(s * 0.125, 0, 0);
    foot.rotation.y = s * 0.25;
    leg.add(foot);
    group.add(leg);
  }

  // ---- Tronc ----
  const torso = new THREE.Group();
  // Colonne a vertebres.
  torso.add(tubeAlong([[0, 0.52, -0.02], [0, 0.66, -0.04], [0, 0.85, -0.07], [0, 1.0, -0.045], [0, 1.09, -0.01]],
    t => 0.034 * (1 + 0.22 * Math.sin(t * 48)), boneDk, { steps: 60, segs: 10 }));
  // Bassin en papillon.
  const pelvis = sculptSphere((d, out) => {
    const ax = Math.abs(d.x);
    out.set(d.x * 0.175, d.y * 0.075 * (0.55 + 0.75 * ax) + 0.03 * ax, d.z * 0.1 * (0.8 + 0.3 * ax) - 0.01);
  }, boneMat, 28, 18);
  pelvis.position.set(0, 0.56, 0);
  torso.add(pelvis);
  // Cage thoracique : cotes en relief, vides sombres peints.
  const ribs = paintSphere((d, out) => {
    const up = Math.max(0, d.y);
    const w = 1 - 0.3 * up * up - 0.12 * Math.max(0, -d.y);
    let x = d.x * 0.2 * w, y = d.y * 0.2, z = d.z * 0.15 * w;
    // Cotes inclinees vers l avant-bas.
    const b = Math.sin((y + 0.3 * z + 0.02) * 46);
    let rib = sstep(-0.25, 0.25, b);
    const centre = 1 - sstep(0.035, 0.07, Math.abs(d.x) * 0.2);
    if (d.z > 0) rib = Math.max(rib, centre * sstep(-0.75, -0.55, d.y));   // sternum
    else rib = Math.max(rib, centre);                                       // rachis
    rib = Math.max(rib, sstep(0.72, 0.84, d.y));                            // haut ferme
    rib *= 1 - sstep(0.8, 0.9, -d.y);                                       // bas ouvert
    const k = 0.93 + 0.07 * rib;
    out.set(x * k, y + 0.86, z * k - 0.02);
    return mix(cHole, mix(cShade, [1, 1, 1], sstep(-0.6, 0.6, d.y + d.z * 0.5)), rib);
  }, boneV, 52, 52);
  torso.add(ribs);
  // Capuche / col en lambeaux autour du cou.
  const cowl = sheet((u, v, out) => {
    const a = u * Math.PI * 2 + Math.PI / 2;
    const tooth = Math.abs(((u * 7 + 0.2) % 1) - 0.5) * 2;
    const len = 0.16 * (1 - 0.4 * tooth);
    const r = 0.085 + 0.2 * Math.pow(v, 0.8);
    out.set(Math.cos(a) * r * 1.12, 1.06 - v * len - 0.03 * Math.sin(a) * v, Math.sin(a) * r * 0.8 - 0.02);
  }, 42, 6, 0.014, cloth, { color: (u, v) => { const k = 1 - 0.28 * v * v; return [k, k, k]; } });
  torso.add(cowl);
  // Pagne : ceinture + lambeaux devant et derriere.
  torso.add(loft([[0.585, 0.15, 0.105], [0.61, 0.16, 0.112], [0.635, 0.15, 0.105]], wood, { segs: 18, sub: 3 }));
  const front = rag(0.2, 0.32, { teeth: 2, phase: 0.25, jag: 0.4, curve: 0.03, flare: 0.03 });
  front.position.set(0, 0.6, 0.095);
  torso.add(front);
  const back = rag(0.26, 0.38, { teeth: 3, phase: 0.6, jag: 0.35, curve: -0.04, flare: -0.05 });
  back.position.set(0, 0.6, -0.1);
  back.rotation.y = Math.PI;
  torso.add(back);
  if (royal) {
    // Grande cape en lambeaux + col de fourrure.
    const cape = sheet((u, v, out) => {
      const x = (u - 0.5) * (0.5 + 0.34 * v);
      const tooth = Math.abs(((u * 5 + 0.4) % 1) - 0.5) * 2;
      const len = 0.92 * (1 - 0.2 * tooth * (0.6 + 0.4 * Math.sin(u * 13)));
      out.set(x, 1.06 - v * len, -0.13 - 0.1 * (1 - Math.pow(u * 2 - 1, 2)) - 0.16 * v * v + 0.02 * Math.sin(u * 14) * v);
    }, 24, 12, 0.016, cloth, { color: (u, v) => { const k = 1 - 0.35 * v * v; return [k, k, k]; } });
    torso.add(cape);
    const fur = woolBlob(0.16, M(0xf4ecd8, { r: 0.95 }), { lobes: 14, amp: 0.3, scale: [2.0, 0.6, 1.25], seed: 8, shade: 0.25, ws: 48, hs: 28 });
    fur.position.set(0, 1.04, -0.06);
    torso.add(fur);
  }
  group.add(torso);

  // ---- Bras ----
  const pauldron = (s, mat) => {
    const p = new THREE.Group();
    const dome = sculptSphere((d, out) => {
      out.set(d.x * 0.125, Math.max(d.y, -0.25) * 0.105, d.z * 0.125);
    }, mat, 22, 16);
    p.add(dome);
    p.add(spike([[0, 0.07, 0], [s * 0.015, 0.13, 0], [s * 0.035, 0.18, 0]], 0.035, trim, { steps: 8, segs: 8 }));
    p.position.set(s * 0.27, 1.01, -0.01);
    p.rotation.z = -s * 0.45;
    return p;
  };
  // Gauche : rondache.
  {
    const s = -1;
    const arm = new THREE.Group();
    arm.add(bone([[s * 0.24, 0.99, -0.01], [s * 0.31, 0.78, -0.03]], 0.026, boneMat));
    arm.add(bone([[s * 0.31, 0.77, -0.03], [s * 0.3, 0.6, 0.1]], 0.023, boneMat, { knob: 0.6 }));
    arm.add(mesh(new THREE.SphereGeometry(0.048, 12, 10), boneDk, [s * 0.3, 0.575, 0.125], [1, 1.1, 1]));
    arm.add(pauldron(s, royal ? gold : iron));
    const cIron = vcol(royal ? 0xe2b035 : 0x6a727c, WOOD);
    const cWoodDk = vcol(0x5e3a1e, WOOD);
    const shield = paintSphere((d, out) => {
      // Pole de la sphere = axe du bouclier (cercles nets).
      const rr = Math.hypot(d.x, d.z);
      const R = 0.215;
      out.set(d.x * R, -d.z * R, d.y * (0.03 + 0.03 * (1 - rr * rr)) + (d.y > 0 ? 0.04 * Math.exp(-rr * rr * 26) : 0));
      if (rr > 0.85 || rr < 0.25) return cIron;
      const plank = sstep(0.0, 0.1, Math.abs(Math.sin(d.x * 9.5)));
      return mix(cWoodDk, [1, 1, 1], plank);
    }, woodV, 44, 26);
    shield.position.set(s * 0.37, 0.66, 0.17);
    shield.rotation.set(-0.1, s * 0.5, 0.12);
    arm.add(shield);
    group.add(arm);
  }
  // Droit : lance (ou grande epee du roi).
  {
    const s = 1;
    const arm = new THREE.Group();
    arm.add(bone([[s * 0.24, 0.99, -0.01], [s * 0.31, 0.79, -0.04]], 0.026, boneMat));
    arm.add(bone([[s * 0.31, 0.78, -0.04], [s * 0.33, 0.64, 0.1]], 0.023, boneMat, { knob: 0.6 }));
    arm.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), boneDk, [s * 0.335, 0.615, 0.125], [1, 1.1, 1]));
    if (royal) arm.add(pauldron(s, gold));
    const weapon = new THREE.Group();
    if (royal) {
      // Grande epee ebrechee, dressee.
      weapon.add(limb([[0, -0.13, 0], [0, 0.07, 0]], 0.022, 0.022, wood, { steps: 8, segs: 8 }));
      weapon.add(mesh(new THREE.SphereGeometry(0.038, 10, 8), gold, [0, -0.14, 0]));
      weapon.add(limb([[-0.13, 0.1, 0], [0, 0.075, 0], [0.13, 0.1, 0]], 0.028, 0.028, gold, { steps: 10, segs: 8 }));
      const blade = sheet((u, v, out) => {
        const w = 0.07 * (1 - 0.1 * v) * (v > 0.84 ? 1 - Math.pow((v - 0.84) / 0.16, 1.6) : 1) - (u > 0.5 && Math.abs(v - 0.5) < 0.05 ? 0.02 : 0);
        out.set((u - 0.5) * 2 * w, 0.08 + v * 0.82, 0);
      }, 6, 22, (u) => 0.03 * (1 - Math.pow(Math.abs(u * 2 - 1), 1.5)) + 0.004, M(0xb8c0cc, { r: 0.35, m: 0.6 }));
      weapon.add(blade);
      weapon.position.set(0.34, 0.61, 0.15);
      weapon.rotation.set(0.1, 0.5, -0.12);
    } else {
      weapon.add(limb([[0.012, 0, 0], [-0.005, 0.5, 0], [0.006, 1.0, 0], [0, 1.2, 0]], 0.02, 0.018, wood, { steps: 20, segs: 8, cap: 0.03 }));
      // Pointe d os en feuille + ligature.
      const tip = sculptSphere((d, out) => {
        const t = (d.y + 1) / 2;
        const w = Math.sin(Math.PI * Math.pow(t, 0.55)) * (1 - 0.35 * t);
        out.set(d.x * 0.062 * w, t * 0.27, d.z * 0.022 * (0.4 + w));
      }, boneMat, 16, 16);
      tip.position.y = 1.17;
      weapon.add(tip);
      weapon.add(loft([[1.13, 0.028], [1.16, 0.034], [1.2, 0.028]], clothPlain, { segs: 10, sub: 2 }));
      weapon.position.set(0.345, 0.02, 0.15);
      weapon.rotation.set(0.02, 0.5, -0.03);
    }
    arm.add(weapon);
    group.add(arm);
  }

  // ---- Tete ----
  const head = new THREE.Group();
  head.position.set(0, 1.26, 0.025);
  const sockC = [-1, 1].map(s => new THREE.Vector3(s * 0.4, 0.02, 0.9).normalize());
  const skull = paintSphere((d, out) => {
    const low = Math.max(0, -d.y);
    let x = d.x * 0.265 * (1 - 0.4 * sstep(0.15, 0.85, low));
    let y = Math.max(d.y * 0.25, -0.185);
    let z = d.z * 0.27 - 0.015 + (d.z > 0 ? 0.03 * sstep(0.3, 0.8, low) * d.z : 0);
    let col = mix(cShade, [1, 1, 1], sstep(-0.9, 0.3, d.y + d.z * 0.4));
    let hole = 0;
    // Orbites en amande, inclinees (regard mauvais).
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, c = sockC[i];
      const dx = (d.x - c.x) * s, dy = d.y - c.y;
      const u = dx * 0.92 + dy * 0.38, v = -dx * 0.38 + dy * 0.92;
      if (d.z > 0) hole = Math.max(hole, 1 - sstep(0.78, 1, Math.hypot(u / 0.33, v / 0.27)));
    }
    // Nez : coeur renverse.
    if (d.z > 0) {
      const ny = d.y + 0.36;
      const m = Math.min(Math.hypot((Math.abs(d.x) - 0.04) / 0.058, (ny + 0.02) / 0.07), Math.hypot(d.x / 0.045, (ny - 0.05) / 0.07));
      hole = Math.max(hole, 1 - sstep(0.75, 1, m));
    }
    z -= 0.035 * hole;
    col = mix(col, cHole, hole);
    // Dents du haut peintes sur le bord de la machoire.
    if (d.z > 0.25 && y < -0.105) {
      const gap = 1 - sstep(0.08, 0.3, Math.abs(Math.sin(Math.atan2(d.x, d.z) * 5)));
      const edge = sstep(-0.105, -0.12, y);
      col = mix(col, mix(cTooth, cHole, gap), edge * sstep(0.25, 0.4, d.z));
    }
    out.set(x, y, z);
    return col;
  }, boneV, 68, 52);
  head.add(skull);
  // Machoire inferieure (dents peintes).
  const jaw = paintSphere((d, out) => {
    out.set(d.x * 0.15 * (1 - 0.22 * Math.max(0, d.z)), d.y * 0.052 + 0.012 * d.z, d.z * 0.155);
    if (d.z > 0.2 && d.y > 0.25) {
      const gap = 1 - sstep(0.08, 0.3, Math.abs(Math.sin(Math.atan2(d.x, d.z) * 5 + 1.57)));
      return mix(cTooth, cHole, gap);
    }
    return mix(cShade, [1, 1, 1], sstep(-0.5, 0.5, d.y));
  }, boneV, 40, 24);
  jaw.position.set(0, -0.245, 0.04);
  jaw.rotation.x = 0.1;
  head.add(jaw);
  // Flammes dans les orbites.
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), eyeMat);
    e.position.set(s * 0.1, 0.0, 0.205);
    e.scale.set(1, 1.15, 0.6);
    head.add(e);
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), eyeCore);
    c.position.set(s * 0.097, -0.004, 0.226);
    head.add(c);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), haloMat);
    h.position.set(s * 0.1, 0.0, 0.2);
    h.scale.set(1, 1, 0.5);
    head.add(h);
  }
  if (royal) {
    // Couronne d or a rubis.
    const crown = new THREE.Group();
    crown.add(crownMesh(0.185, 0.15, gold, { points: 6, flare: 0.22 }));
    const ruby = M(0xd82a3a, { r: 0.3, emissive: 0x6a0a14, ei: 0.6 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 2;
      crown.add(mark(mesh(new THREE.SphereGeometry(0.026, 8, 6), ruby, [Math.cos(a) * 0.192, 0.036, Math.sin(a) * 0.192])));
    }
    crown.position.set(0, 0.185, -0.02);
    crown.rotation.set(-0.08, 0, 0.06);
    head.add(crown);
  } else {
    // Casque de fer cabosse (bord releve, bande rivetee peinte) + pointe.
    const cDk = vcol(0x3a4048, IRON);
    const cRust = vcol(0x8a4a26, IRON);
    const helm = paintSphere((d, out) => {
      const yy = Math.max(d.y, -0.02);
      const rim = Math.exp(-Math.pow((d.y - 0.03) / 0.09, 2));
      const dent = Math.exp(-(Math.pow(d.x - 0.55, 2) + Math.pow(d.y - 0.6, 2) + Math.pow(d.z - 0.5, 2)) / 0.035);
      const r = 1 + 0.07 * rim - 0.07 * dent;
      out.set(d.x * 0.285 * r, yy * 0.235 * (1 - 0.05 * dent), d.z * 0.29 * r - 0.015);
      if (d.y < 0.13) return cDk;
      if (Math.abs(d.x) < 0.085) return cDk;
      const rust = Math.exp(-(Math.pow(d.x + 0.6, 2) + Math.pow(d.y - 0.45, 2) + Math.pow(d.z - 0.6, 2)) / 0.03);
      return mix([1, 1, 1], cRust, Math.min(1, rust * 1.3));
    }, ironV, 40, 26);
    helm.position.y = 0.115;
    helm.rotation.set(-0.1, 0, 0.1);
    head.add(helm);
    const sp = spike([[0, 0.3, -0.03], [-0.025, 0.39, -0.04], [-0.06, 0.45, -0.05]], 0.05, trim, { steps: 8, segs: 10 });
    head.add(sp);
  }
  group.add(head);

  return group;
}
