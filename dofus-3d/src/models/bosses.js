import * as THREE from 'three';
import { M, mesh, addEyes, loft, sculptSphere, tubeAlong, woolBlob } from './kit.js';
import { paintSphere, vcol, mix, sstep, limb, spike, sheet, mark } from './monsterKitB.js';
import { buildCraqueleur } from './craqueleur.js';

// ===========================================================================
// Boss : Craqueleur Legendaire, Craqueleur Sauvage, Kwakwa, Minotoror.
// ===========================================================================

// Craqueleur Legendaire : colosse de roche bleu nuit herisse de cristaux
// lumineux (dos, epaules), fissures et regard turquoise. Meme squelette
// que le Craqueleur (modele de base agrandi dans un sous-groupe).
export function buildCraqueleurLegendaire() {
  const root = new THREE.Group();
  const crystal = new THREE.MeshStandardMaterial({
    color: 0x8af4ff, emissive: 0x2aa8d8, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.1,
  });
  const inner = buildCraqueleur({
    stone: 0x6c7492, stoneLt: 0x98a0bc, stoneDk: 0x454a66, glow: 0x66f2ff,
    moss: 0, crystals: crystal, horns: true, seed: 9,
  });
  inner.scale.setScalar(1.45);
  root.add(inner);
  return root;
}

// Craqueleur sauvage : roche sombre envahie de mousse, eclats de pierre
// dresses sur les epaules, regard de braise.
export function buildCraqueleurSauvage() {
  const root = new THREE.Group();
  const inner = buildCraqueleur({
    stone: 0x7c705e, stoneLt: 0x9c8e72, stoneDk: 0x4c4236, glow: 0xff5a1e,
    moss: 2, mossColor: 0x4a8a2e, horns: true, seed: 5,
  });
  inner.scale.setScalar(1.08);
  root.add(inner);
  return root;
}

// Kwakwa : grand corbeau elementaire. Corps sombre et dodu, ailes
// entrouvertes a remiges teintees, queue en eventail, gros bec crochu,
// regard mauvais, crete et collerette de plumes-flammes. Les pieces
// teintees par l element portent des materiaux nommes elementTint /
// elementTintLt / elementTintBasic (recolores par le combat).
// Rig : seules les pattes (enfants directs sous la hanche) sont animees.
export function buildKwakwa() {
  const group = new THREE.Group();
  const DARK = 0x2e2742;
  const dark = M(DARK, { r: 0.8 });
  const darkV = M(DARK, { r: 0.8 });
  const darkW = M(DARK, { r: 0.8 });
  const mkTint = () => { const m = M(0xff7a2a, { r: 0.55, emissive: 0x6a2a08, ei: 0.6 }); m.name = 'elementTint'; return m; };
  const mkTintLt = () => { const m = M(0xffc06a, { r: 0.55, emissive: 0x6a3a08, ei: 0.4 }); m.name = 'elementTintLt'; return m; };
  const tint = mkTint(), tintV = mkTint(), tintLt = mkTintLt();
  const beak = M(0xf6c02c, { r: 0.4 });
  const legMat = M(0xe0962a, { r: 0.6 });
  const claw = M(0x3a2a20, { r: 0.4 });
  const cLt = vcol(0x51466e, DARK);

  // ---- Pattes : culotte de plumes, tarse, serres ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.add(sculptSphere((d, out) => {
      const t = (1 - d.y) / 2;
      out.set(d.x * 0.1 * (1 - 0.5 * t * t), d.y * 0.11 + 0.34, d.z * 0.11 * (1 - 0.5 * t * t));
    }, dark, 18, 14));
    leg.add(limb([[0, 0.3, 0], [0, 0.16, -0.015], [0, 0.04, 0.01]], 0.034, 0.03, legMat, { steps: 10, segs: 10, cap: 0.1 }));
    for (const a of [-0.55, 0, 0.55]) {
      const dx = Math.sin(a), dz = Math.cos(a);
      leg.add(limb([[0, 0.035, 0], [dx * 0.08, 0.03, dz * 0.08], [dx * 0.15, 0.022, dz * 0.15]], 0.03, 0.022, legMat, { steps: 8, segs: 8, cap: 0.2 }));
      leg.add(mark(spike([[dx * 0.15, 0.03, dz * 0.15], [dx * 0.19, 0.03, dz * 0.19], [dx * 0.215, 0.006, dz * 0.215]], 0.02, claw, { steps: 6, segs: 6 })));
    }
    leg.add(limb([[0, 0.035, 0], [0, 0.03, -0.07]], 0.028, 0.02, legMat, { steps: 6, segs: 8, cap: 0.25 }));
    leg.position.set(s * 0.15, 0, 0.02);
    leg.rotation.y = s * 0.25;
    group.add(leg);
  }

  // ---- Corps dodu (poitrail bombe, croupe relevee) ----
  const bodyG = new THREE.Group();
  const body = paintSphere((d, out) => {
    const up = Math.max(0, d.y), dn = Math.max(0, -d.y);
    const w = 1 - 0.3 * up * up - 0.12 * dn * dn;
    out.set(d.x * 0.37 * w, 0.7 + d.y * (d.y > 0 ? 0.42 : 0.36), d.z * 0.37 * w + 0.05 * up - 0.03 - 0.05 * dn);
    // Dos legerement plus clair (reflets du plumage).
    return mix([1, 1, 1], cLt, sstep(0.2, 0.9, -d.z + d.y * 0.4) * 0.8);
  }, darkV, 48, 40);
  bodyG.add(body);
  // Plastron de plumes clair.
  const bib = sculptSphere((d, out) => {
    const up = Math.max(0, d.y);
    out.set(d.x * 0.26 * (1 - 0.25 * up), d.y * 0.33, d.z * 0.16);
  }, mkTintLt(), 28, 22);
  bib.position.set(0, 0.63, 0.215);
  bib.rotation.x = -0.1;
  bodyG.add(bib);
  // Queue en eventail : rectrices sombres sur plumes teintees.
  const fan = (len, wid, mat, n, zoff) => {
    const m = sheet((u, v, out) => {
      const a = (u - 0.5) * wid;
      const feather = Math.abs(Math.sin(u * Math.PI * n));
      const L = len * (0.82 + 0.18 * Math.pow(feather, 0.6)) * (1 - 0.25 * Math.pow(Math.abs(u * 2 - 1), 2));
      const r = 0.06 + v * L;
      out.set(Math.sin(a) * r, 0.05 * Math.cos(a) * v * v, -Math.cos(a) * r);
    }, 30, 8, 0.016, mat);
    m.position.set(0, 0.52, -0.3 + zoff);
    m.rotation.x = 0.4;
    return m;
  };
  bodyG.add(fan(0.62, 1.3, tint, 5, -0.012));
  const tailTop = fan(0.44, 1.0, dark, 4, 0.012);
  tailTop.position.y += 0.02;
  bodyG.add(tailTop);
  // Ailes entrouvertes : couvertures sombres + remiges teintees.
  for (const s of [-1, 1]) {
    const wing = new THREE.Group();
    const layer = (span, chord, mat, n, z) => sheet((u, v, out) => {
      const feather = Math.pow(Math.abs(Math.sin(u * Math.PI * n)), 0.6);
      const c = chord * (0.45 + 0.55 * Math.sin(Math.PI * Math.pow(u, 0.6)) + 0.25 * u) * (0.84 + 0.16 * feather);
      out.set(u * span, 0.06 * Math.sin(Math.PI * u) - v * c - 0.25 * u * u * span, z - 0.1 * u * u - 0.05 * Math.sin(Math.PI * v) * (1 - u));
    }, 30, 8, 0.02, mat);
    wing.add(layer(0.62, 0.52, tintV, 5, -0.02));
    wing.add(layer(0.5, 0.36, darkW, 4, 0.012));
    wing.add(layer(0.5, 0.36, darkW, 4, -0.05));
    wing.scale.x = s;
    wing.position.set(s * 0.27, 0.98, -0.08);
    wing.rotation.set(0.1, s * 0.35, s * -0.3);
    bodyG.add(wing);
  }
  // Collerette de plumes-flammes autour du cou.
  const ruff = woolBlob(0.17, tintLt, { lobes: 12, amp: 0.34, scale: [1.45, 0.55, 1.35], seed: 3, shade: 0.2, ws: 44, hs: 26 });
  ruff.position.set(0, 1.04, -0.05);
  ruff.rotation.x = 0.32;
  bodyG.add(ruff);
  // Aura elementaire (anneau flottant).
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 6, 36), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.6 }));
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.08;
  aura.userData.noOutline = true;
  aura.material.name = 'elementTintBasic';
  bodyG.add(aura);

  // ---- Tete ----
  const head = new THREE.Group();
  head.position.set(0, 1.26, 0.08);
  head.add(sculptSphere((d, out) => {
    const k = d.z > 0 ? Math.exp(-Math.pow((d.y + 0.1) / 0.5, 2)) * Math.exp(-Math.pow(d.x / 0.6, 2)) : 0;
    out.set(d.x * 0.25 * (1 - 0.1 * Math.max(0, -d.y)), d.y * 0.23, d.z * 0.25 + 0.04 * k * d.z);
  }, dark, 36, 28));
  // Gros bec crochu (mandibule superieure recourbee + inferieure).
  head.add(spike([[0, -0.005, 0.17], [0, 0.0, 0.32], [0, -0.05, 0.43], [0, -0.13, 0.47]], 0.105, beak, { steps: 22, segs: 14, pow: 0.75, flat: 0.8 }));
  head.add(spike([[0, -0.085, 0.16], [0, -0.1, 0.28], [0, -0.105, 0.37]], 0.07, M(0xd89a1e, { r: 0.45 }), { steps: 12, segs: 12, pow: 0.7, flat: 0.6 }));
  for (const s of [-1, 1]) {
    head.add(mark(mesh(new THREE.SphereGeometry(0.013, 8, 6), claw, [s * 0.04, 0.035, 0.335], [1, 0.7, 1.4])));
  }
  const eyes = addEyes(head, { x: 0, y: 0.06, z: 0.185, size: 0.075, spacing: 0.235, turn: 0.5, iris: 0xffd21e, lid: DARK, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  // Crete de plumes-flammes rabattue vers l arriere.
  for (const [x, z, len, r, m, lean] of [[0, 0.08, 0.34, 0.075, tint, 0.2], [0, -0.03, 0.4, 0.085, tintLt2(), 0.5], [0, -0.13, 0.3, 0.075, tint, 0.9],
    [-0.09, 0.0, 0.24, 0.06, tint, 0.5], [0.09, 0.0, 0.24, 0.06, tint, 0.5]]) {
    const dy = Math.cos(lean), dz = -Math.sin(lean);
    head.add(spike([[x, 0.16, z], [x * 1.4, 0.16 + dy * len * 0.5, z + dz * len * 0.5 + 0.03], [x * 1.9, 0.16 + dy * len * 0.85, z + dz * len - 0.04], [x * 2.0, 0.16 + dy * len * 0.95, z + dz * len * 1.35 - 0.06]],
      r, m, { steps: 14, segs: 10, pow: 0.6, flat: 0.5 }));
  }
  function tintLt2() { return mkTintLt(); }
  bodyG.add(head);
  group.add(bodyG);

  return group;
}

// Minotoror : colosse mi-homme mi-taureau. Buste en V enorme, petites
// hanches, jambes a sabots, avant-bras de forgeron a brassards d or, tete
// de taureau (mufle clair, naseaux, anneau d or, grandes cornes, regard
// rouge sous une arcade lourde), criniere sombre, pagne rouge et enorme
// hache a double tranchant. Pivots d animation fournis (userData.rig).
export function buildMinotoror() {
  const FUR = 0x7e4c2a;
  const fur = M(FUR, { r: 0.9 });
  const furV = M(FUR, { r: 0.9 });
  const furDk = M(0x4a2a16, { r: 0.9 });
  const hoof = M(0x241408, { r: 0.6 });
  const hornMat = M(0xf2e8cc, { r: 0.5 });
  const leather = M(0x5a3418, { r: 0.85 });
  const cloth = M(0x9a1e1e, { r: 0.8 });
  const gold = M(0xe8c14a, { r: 0.35, m: 0.6 });
  const steel = M(0xb4bec9, { r: 0.3, m: 0.7 });
  const steelV = M(0xb4bec9, { r: 0.3, m: 0.7 });
  const dark = M(0x1a0c08, { r: 0.5 });
  const cMuzzle = vcol(0xd2a682, FUR);
  const cChest = vcol(0x9a6238, FUR);
  const cDk = vcol(0x5a3219, FUR);

  const group = new THREE.Group();

  // ---- Jambes (pivot a la hanche) : cuisse epaisse, jarret, sabot ----
  const legs = {};
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.13, 0.5, 0);
    leg.add(loft([
      [0.04, 0.12, 0.13, 0, 0],
      [-0.1, 0.13, 0.14, s * 0.01, 0.01],
      [-0.24, 0.095, 0.105, s * 0.015, 0.0],
      [-0.36, 0.07, 0.078, s * 0.015, -0.02],
      [-0.44, 0.085, 0.092, s * 0.015, 0.0],
    ], furDk, { segs: 16, sub: 5 }));
    leg.add(loft([
      [-0.425, 0.086, 0.094, s * 0.015, 0.0],
      [-0.46, 0.098, 0.115, s * 0.015, 0.02],
      [-0.497, 0.105, 0.13, s * 0.015, 0.03],
      [-0.5, 0.08, 0.1, s * 0.015, 0.03],
    ], hoof, { segs: 16, sub: 3 }));
    group.add(leg);
    legs[s] = leg;
  }

  // ---- Buste en V ----
  const torso = paintSphere((d, out) => {
    const W = 0.31 * (1 + 0.34 * d.y), D = 0.215 * (1 + 0.2 * d.y);
    const q = v => Math.sign(v) * Math.pow(Math.abs(v), 0.85);
    out.set(q(d.x) * W, 0.8 + d.y * 0.42, q(d.z) * D + 0.02 * Math.max(0, d.y));
    // Poitrail et ventre plus clairs, sillon des pectoraux.
    const m = sstep(0.3, 0.5, d.z - Math.abs(d.x) * 0.25);
    const pec = Math.exp(-Math.pow((d.y - 0.12) / 0.045, 2)) + Math.exp(-Math.pow(d.x / 0.03, 2)) * sstep(0.1, 0.2, d.y);
    return mix(mix([1, 1, 1], cChest, m), cDk, Math.min(1, pec) * m * 0.8);
  }, furV, 56, 48);
  group.add(torso);
  // Queue a toupet.
  group.add(limb([[0, 0.5, -0.17], [0, 0.42, -0.32], [0.03, 0.26, -0.4], [0.05, 0.16, -0.37]], 0.03, 0.02, fur, { steps: 16, segs: 8, cap: 0.05 }));
  const tuft = woolBlob(0.06, furDk, { lobes: 5, amp: 0.3, scale: [0.8, 1.3, 0.8], seed: 2, shade: 0, ws: 16, hs: 12 });
  tuft.position.set(0.055, 0.12, -0.36);
  group.add(tuft);
  // Ceinture a boucle d or + pagne en lambeaux.
  group.add(loft([[0.44, 0.215, 0.165], [0.48, 0.23, 0.175], [0.52, 0.225, 0.17]], leather, { segs: 22, sub: 3 }));
  const buckle = sculptSphere((d, out) => { out.set(d.x * 0.07, d.y * 0.055, d.z * 0.025); }, gold, 14, 10);
  buckle.position.set(0, 0.48, 0.178);
  group.add(buckle);
  const rag = (w, h, teeth, phase, sgn) => sheet((u, v, out) => {
    const tooth = Math.abs(((u * teeth + phase) % 1) - 0.5) * 2;
    const len = h * (1 - 0.3 * tooth);
    out.set((u - 0.5) * w * (1 + 0.25 * v), -v * len, sgn * (0.04 * (1 - Math.pow(u * 2 - 1, 2)) + 0.05 * v * v));
  }, 14, 8, 0.014, cloth, { color: (u, v) => { const k = 1 - 0.3 * v * v; return [k, k, k]; } });
  const front = rag(0.24, 0.3, 2, 0.25, 1);
  front.position.set(0, 0.46, 0.16);
  group.add(front);
  const back = rag(0.34, 0.34, 3, 0.6, 1);
  back.position.set(0, 0.46, -0.16);
  back.rotation.y = Math.PI;
  group.add(back);
  // Criniere sombre sur la nuque et les epaules.
  const mane = woolBlob(0.25, furDk, { lobes: 16, amp: 0.34, scale: [1.5, 0.75, 0.95], seed: 12, shade: 0, ws: 48, hs: 30 });
  mane.position.set(0, 1.17, -0.07);
  mane.rotation.x = -0.25;
  group.add(mane);

  // ---- Bras (pivot a l epaule) ----
  const arms = {};
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.4, 1.02, 0);
    // Deltoide + bras + avant-bras de forgeron d une seule piece.
    arm.add(tubeAlong([[s * -0.04, 0.03, 0], [s * 0.03, -0.02, 0], [s * 0.07, -0.25, -0.01], [s * 0.075, -0.4, 0.05], [s * 0.07, -0.5, 0.1]], t => {
      const r = 0.135 * Math.exp(-Math.pow((t - 0.12) / 0.2, 2)) + 0.095 + 0.03 * Math.exp(-Math.pow((t - 0.72) / 0.16, 2));
      return r * (t < 0.08 ? Math.sqrt(1 - Math.pow(1 - t / 0.08, 2)) : 1) * (t > 0.93 ? 0.8 : 1);
    }, fur, { steps: 34, segs: 14 }));
    // Brassard d or.
    arm.add(tubeAlong([[s * 0.076, -0.33, 0.022], [s * 0.073, -0.42, 0.06], [s * 0.07, -0.5, 0.1]], t => 0.098 + 0.04 * Math.pow(Math.sin(Math.PI * t), 0.35), gold, { steps: 12, segs: 14 }));
    // Poing.
    const fist = sculptSphere((d, out) => {
      out.set(d.x * 0.1, d.y * 0.1, d.z * 0.115 + 0.01 * Math.max(0, d.z));
    }, furDk, 18, 14);
    fist.position.set(s * 0.07, -0.56, 0.13);
    arm.add(fist);
    group.add(arm);
    arms[s] = arm;
  }
  // Epauliere de cuir cloutee (epaule gauche).
  const pad = sculptSphere((d, out) => { out.set(d.x * 0.17, Math.max(d.y, -0.2) * 0.13, d.z * 0.17); }, leather, 22, 16);
  pad.position.set(-0.04, 0.07, 0);
  pad.rotation.z = 0.35;
  arms[-1].add(pad);
  for (const [x, z] of [[-0.11, 0.05], [-0.03, 0.1], [-0.05, -0.06]]) {
    arms[-1].add(mark(spike([[x, 0.17, z], [x * 1.2, 0.24, z * 1.2]], 0.028, steel, { steps: 4, segs: 8 })));
  }

  // ---- Tete de taureau (pivot au cou) ----
  const head = new THREE.Group();
  head.position.set(0, 1.19, 0.1);
  const skull = paintSphere((d, out) => {
    const low = Math.max(0, -d.y);
    let x = d.x * 0.265 * (1 - 0.18 * low), y = d.y * 0.245, z = d.z * 0.23;
    let k = 0;
    if (d.z > 0) {
      // Mufle long et large, arcade marquee.
      k = Math.exp(-Math.pow((d.y + 0.42) / 0.42, 2)) * Math.exp(-Math.pow(d.x / 0.7, 2));
      z += 0.2 * k * d.z;
      y -= 0.05 * k;
      z += 0.035 * Math.exp(-Math.pow((d.y - 0.32) / 0.14, 2)) * Math.exp(-Math.pow(d.x / 0.75, 2));
    }
    out.set(x, y + 0.255, z);
    return mix(mix([1, 1, 1], cDk, sstep(0.3, 0.9, d.y) * 0.5), cMuzzle, sstep(0.52, 0.66, k));
  }, furV, 56, 44);
  head.add(skull);
  // Naseaux, anneau d or, moue.
  for (const s of [-1, 1]) {
    head.add(mark(mesh(new THREE.SphereGeometry(0.032, 10, 8), dark, [s * 0.078, 0.16, 0.378], [1.1, 0.75, 0.5], [0.2, s * 0.35, s * 0.3])));
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 20), gold);
  ring.position.set(0, 0.095, 0.395);
  ring.rotation.x = 0.15;
  ring.castShadow = true;
  head.add(ring);
  head.add(mark(tubeAlong([[-0.15, 0.075, 0.275], [-0.08, 0.06, 0.35], [0, 0.066, 0.372], [0.08, 0.06, 0.35], [0.15, 0.075, 0.275]], t => 0.011 * (0.4 + 0.6 * Math.sin(Math.PI * t)), dark, { steps: 14, segs: 6 })));
  // Petits yeux rouges sous l arcade.
  const eyes = addEyes(head, { x: 0, y: 0.31, z: 0.205, size: 0.062, spacing: 0.215, turn: 0.35, iris: 0xe0281e, lid: 0x4a2a16, angry: true });
  for (const e of eyes) e.traverse(o => { o.userData.noOutline = true; });
  for (const s of [-1, 1]) {
    // Sourcils epais.
    head.add(mark(limb([[s * 0.035, 0.365, 0.245], [s * 0.1, 0.4, 0.235], [s * 0.185, 0.41, 0.18]], 0.026, 0.018, furDk, { steps: 10, segs: 8, cap: 0.25 })));
    // Grandes cornes annelees.
    head.add(spike([[s * 0.19, 0.4, -0.02], [s * 0.36, 0.44, -0.02], [s * 0.47, 0.57, 0.03], [s * 0.45, 0.72, 0.1]], 0.085, hornMat, {
      steps: 30, segs: 12, pow: 0.65, shade: t => (t > 0.72 ? 0.55 : 1) - 0.14 * Math.max(0, Math.sin(t * 30)) * (1 - t),
    }));
    // Oreilles en feuille.
    const ear = sculptSphere((d, out) => {
      const t = (d.x * s + 1) / 2;
      out.set(d.x * 0.1, d.y * 0.05 * Math.sin(Math.PI * Math.pow(t, 0.6)) , d.z * 0.02 + 0.02 * Math.sin(Math.PI * t));
    }, fur, 14, 10);
    ear.position.set(s * 0.3, 0.27, -0.04);
    ear.rotation.set(0, s * -0.3, s * -0.35);
    head.add(ear);
  }
  // Toupet entre les cornes.
  const lock = woolBlob(0.1, furDk, { lobes: 6, amp: 0.34, scale: [1.3, 0.7, 1], seed: 4, shade: 0, ws: 24, hs: 16 });
  lock.position.set(0, 0.47, 0.06);
  head.add(lock);
  group.add(head);

  // ---- Hache a double tranchant (main droite) ----
  const axe = new THREE.Group();
  axe.add(limb([[0, -0.4, 0], [0.005, 0.2, 0], [0, 0.78, 0]], 0.03, 0.027, leather, { steps: 16, segs: 10, cap: 0.03 }));
  for (const s of [-1, 1]) {
    const blade = sheet((u, v, out) => {
      // u : du manche vers le fil ; v : de bas en haut du croissant.
      const a = (v - 0.5) * 2.0;
      const r = 0.05 + u * (0.27 + 0.05 * Math.cos(a * 1.6));
      out.set(s * (Math.cos(a) * r - 0.02), 0.62 + Math.sin(a) * r * (0.55 + 0.75 * u), 0);
    }, 8, 18, (u) => 0.045 * (1 - u) + 0.004, steelV, { color: (u) => { const k = u > 0.8 ? 1.25 : 0.92; return [k, k, k]; } });
    axe.add(blade);
  }
  axe.add(loft([[0.53, 0.05], [0.56, 0.06], [0.68, 0.06], [0.71, 0.05]], gold, { segs: 12, sub: 2 }));
  axe.add(spike([[0, 0.78, 0], [0, 0.9, 0]], 0.04, steel, { steps: 4, segs: 8 }));
  axe.position.set(0.085, -0.56, 0.15);
  axe.rotation.set(0.12, 0.35, -0.1);
  arms[1].add(axe);

  group.userData.rig = { legL: legs[-1], legR: legs[1], armL: arms[-1], armR: arms[1], head };
  // Agrandi : le Minotoror domine le plateau.
  const root = new THREE.Group();
  group.scale.setScalar(1.22);
  root.add(group);
  root.userData.rig = group.userData.rig;
  return root;
}
