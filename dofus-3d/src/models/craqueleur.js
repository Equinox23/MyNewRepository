import * as THREE from 'three';
import { M, mesh } from './kit.js';

// Craqueleur facon Dofus : golem de roche trapu et voute. Enorme torse
// en rocher arrondi, petite tete enfoncee entre les epaules avec deux
// yeux jaunes lumineux, gros bras qui tombent jusqu au sol termines par
// des poings-rochers, mousse et petites pousses sur le dos.
export function buildCraqueleur() {
  const group = new THREE.Group();
  const rng = mulberry32(31415);

  const stone = M(0x9a8a78, { r: 0.95 });
  const stoneLt = M(0xb8a894, { r: 0.95 });
  const stoneDk = M(0x6a5a4a, { r: 0.95 });
  const crack = M(0x2a1a0c, { r: 1 });
  const moss = M(0x5a9a32, { r: 0.95 });
  const mossLt = M(0x86c24a, { r: 0.95 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfff27a });
  const eyeHalo = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.45 });

  const rock = (r, detail, amt) => {
    const g = new THREE.IcosahedronGeometry(r, detail);
    perturb(g, rng, amt);
    return g;
  };

  // -- Jambes : deux gros rochers courts --
  for (const sx of [-1, 1]) {
    group.add(mesh(rock(0.15, 1, 0.03), stoneDk, [sx * 0.17, 0.13, 0], [1, 0.9, 1.1]));
  }

  // -- Torse voute --
  group.add(mesh(rock(0.42, 2, 0.05), stone, [0, 0.6, -0.02], [1.15, 0.95, 0.95]));
  // Plaques de roche plus claires sur le ventre / les epaules.
  group.add(mesh(rock(0.24, 1, 0.03), stoneLt, [0, 0.5, 0.24], [1.2, 0.9, 0.6]));
  for (const sx of [-1, 1]) {
    group.add(mesh(rock(0.2, 1, 0.04), stoneLt, [sx * 0.36, 0.86, 0.02], [1.1, 0.8, 1]));
  }
  // Fissures sombres.
  for (const [x, y, z, rz, len] of [[-0.14, 0.62, 0.36, 0.5, 0.2], [0.16, 0.52, 0.37, -0.7, 0.16], [0.02, 0.72, 0.38, 0.1, 0.12]]) {
    const cr = new THREE.Mesh(new THREE.BoxGeometry(len, 0.018, 0.02), crack);
    cr.position.set(x, y, z);
    cr.rotation.z = rz;
    group.add(cr);
  }

  // -- Tete enfoncee entre les epaules --
  group.add(mesh(rock(0.2, 1, 0.03), stone, [0, 0.95, 0.18], [1.1, 0.85, 1]));
  // Arcade sourciliere lourde.
  group.add(mesh(new THREE.BoxGeometry(0.3, 0.06, 0.1), stoneDk, [0, 1.0, 0.32], null, [0.25, 0, 0]));
  // Yeux lumineux.
  for (const sx of [-1, 1]) {
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), eyeHalo);
    halo.position.set(sx * 0.075, 0.95, 0.35);
    group.add(halo);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), eyeMat);
    eye.position.set(sx * 0.075, 0.95, 0.37);
    eye.scale.set(1.3, 0.8, 0.6);
    group.add(eye);
  }
  // Bouche : fente sombre.
  group.add(mesh(new THREE.BoxGeometry(0.14, 0.02, 0.02), crack, [0, 0.86, 0.36]));

  // -- Bras massifs + poings-rochers --
  for (const sx of [-1, 1]) {
    group.add(mesh(rock(0.14, 1, 0.03), stoneDk, [sx * 0.5, 0.66, 0.04], [0.9, 1.3, 0.9], [0, 0, sx * 0.2]));
    group.add(mesh(rock(0.2, 1, 0.04), stone, [sx * 0.56, 0.26, 0.12], [1.05, 0.95, 1.1]));
    // Jointures plus claires.
    for (let k = 0; k < 3; k++) {
      group.add(mesh(rock(0.055, 0, 0.01), stoneLt, [sx * 0.5 + sx * k * 0.02, 0.3 + k * 0.05, 0.3], null));
    }
  }

  // -- Mousse et pousses sur le dos --
  for (const [x, y, z, s] of [[0, 0.98, -0.12, 0.16], [-0.2, 0.9, -0.2, 0.12], [0.22, 0.88, -0.18, 0.11], [0.36, 0.98, 0.0, 0.08]]) {
    group.add(mesh(new THREE.IcosahedronGeometry(s, 2), moss, [x, y, z], [1.2, 0.5, 1.1]));
  }
  for (const [x, z, a] of [[0.04, -0.14, 0.2], [-0.06, -0.16, -0.3]]) {
    const stem = mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.16, 5), moss, [x, 1.1, z], null, [0, 0, a]);
    group.add(stem);
    group.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), mossLt, [x - a * 0.08, 1.19, z], [1.4, 0.5, 0.9]));
  }

  return group;
}

// Deforme les sommets d une geometrie (en gardant les sommets partages
// soudes pour ne pas creer de trous).
function perturb(geom, rng, amt) {
  const pos = geom.attributes.position;
  const seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    let d = seen.get(key);
    if (!d) { d = [(rng() - 0.5) * amt, (rng() - 0.5) * amt, (rng() - 0.5) * amt]; seen.set(key, d); }
    pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2]);
  }
  geom.computeVertexNormals();
}

function mulberry32(seed) {
  let s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}
