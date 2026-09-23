import * as THREE from 'three';

// Petits decors vegetaux facon Dofus : buissons ronds, touffes de fleurs,
// souches, champignons. Construits en primitives, stylises par Toon.js.

function mulberry32(seed) {
  let s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
}

const M = (color) => new THREE.MeshStandardMaterial({ color });

// Buisson : 3 a 5 boules de feuillage serrees, parfois des baies.
export function buildBush(seed = 0) {
  const g = new THREE.Group();
  const rng = mulberry32(seed);
  const pals = [
    [0x3f7d23, 0x62a432],
    [0x4a8a2a, 0x78b83c],
    [0x357026, 0x5a9a36],
  ];
  const pal = pals[Math.floor(rng() * pals.length)];
  const dk = M(pal[0]), lt = M(pal[1]);
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng();
    const r = 0.2 + rng() * 0.12;
    const d = i === 0 ? 0 : 0.18 + rng() * 0.08;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), i === 0 || rng() > 0.5 ? lt : dk);
    m.position.set(Math.cos(a) * d, r * 0.75 + (i === 0 ? 0.1 : 0), Math.sin(a) * d);
    m.scale.y = 0.85;
    m.castShadow = true;
    g.add(m);
  }
  if (rng() > 0.5) {
    const berry = M(rng() > 0.5 ? 0xd93a3a : 0x6a4ad0);
    for (let i = 0; i < 4; i++) {
      const a = rng() * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), berry);
      b.position.set(Math.cos(a) * 0.3, 0.2 + rng() * 0.2, Math.sin(a) * 0.3);
      g.add(b);
    }
  }
  return g;
}

// Touffe de fleurs : tiges + corolles colorees.
export function buildFlowerPatch(seed = 0) {
  const g = new THREE.Group();
  const rng = mulberry32(seed);
  const petals = [0xffffff, 0xfff06a, 0xff8fbf, 0xff6a4a, 0xb28cff, 0x7ec8ff];
  const petalMat = M(petals[Math.floor(rng() * petals.length)]);
  const heartMat = M(0xffc830);
  const stemMat = M(0x4f8a2a);
  const leafMat = M(0x5d9a32);
  const n = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < n; i++) {
    const x = (rng() - 0.5) * 0.6, z = (rng() - 0.5) * 0.6;
    const h = 0.12 + rng() * 0.14;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, h, 4), stemMat);
    stem.position.set(x, h / 2, z);
    g.add(stem);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), petalMat);
    fl.scale.y = 0.5;
    fl.position.set(x, h, z);
    g.add(fl);
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), heartMat);
    heart.position.set(x, h + 0.02, z);
    g.add(heart);
  }
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), leafMat);
  leaves.scale.set(1.6, 0.35, 1.3);
  leaves.position.y = 0.04;
  g.add(leaves);
  return g;
}

// Souche coupee : cylindre d ecorce + dessus clair avec cernes.
export function buildStump(seed = 0) {
  const g = new THREE.Group();
  const rng = mulberry32(seed);
  const bark = M(0x6b4526);
  const wood = M(0xd9b27a);
  const ring = M(0xa87c4a);
  const h = 0.28 + rng() * 0.12;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, h, 12), bark);
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 12), wood);
  top.position.y = h + 0.005;
  g.add(top);
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 4, 16), ring);
  r1.rotation.x = Math.PI / 2;
  r1.position.y = h + 0.018;
  g.add(r1);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + rng();
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), bark);
    root.position.set(Math.cos(a) * 0.3, 0.07, Math.sin(a) * 0.3);
    root.rotation.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3);
    g.add(root);
  }
  // Petit champignon sur le cote.
  if (rng() > 0.4) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8402a));
    cap.position.set(0.3, 0.12, 0.1);
    g.add(cap);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.1, 6), M(0xf2e6c8));
    st.position.set(0.3, 0.07, 0.1);
    g.add(st);
  }
  return g;
}

// Grappe de champignons (ambiance cimetiere / marais).
export function buildMushroomCluster(seed = 0) {
  const g = new THREE.Group();
  const rng = mulberry32(seed);
  const caps = [0xb05ad0, 0x7a5ab8, 0xd8402a, 0xc8a060];
  const capMat = M(caps[Math.floor(rng() * caps.length)]);
  const stemMat = M(0xefe2c4);
  const n = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const x = (rng() - 0.5) * 0.4, z = (rng() - 0.5) * 0.4;
    const h = 0.1 + rng() * 0.16;
    const r = 0.06 + rng() * 0.07;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.4, h, 6), stemMat);
    st.position.set(x, h / 2, z);
    g.add(st);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    cap.position.set(x, h - 0.01, z);
    cap.castShadow = true;
    g.add(cap);
  }
  return g;
}
