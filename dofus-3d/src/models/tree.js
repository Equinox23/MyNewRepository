import * as THREE from 'three';

// Arbre facon foret d Amakna (Dofus) : tronc epais et tordu avec racines
// evasees, grosses boules de feuillage rondes et touffues, teintes vives
// (ombre verte profonde -> reflets jaune-vert). Pense pour le rendu toon.
// seed = entier, le meme seed donne le meme arbre.
// opts.compact : version plus basse pour les obstacles sur le plateau.
export function buildTree(seed = 0, opts = {}) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);
  const compact = !!opts.compact;

  const barkColors = [0x7a5230, 0x6b4526, 0x845a34];
  const leafPalettes = [
    [0x3f7d23, 0x5c9e2e, 0x86c23f],
    [0x4a8a26, 0x6aad34, 0x9acd4a],
    [0x3a7428, 0x559a34, 0x7fbf48],
    [0x5a8f24, 0x7cb032, 0xa8d052], // plus jaune (lisiere ensoleillee)
  ];
  const bark = new THREE.MeshStandardMaterial({ color: barkColors[Math.floor(rng() * barkColors.length)] });
  const barkDk = new THREE.MeshStandardMaterial({ color: 0x4e331c });
  const pal = leafPalettes[Math.floor(rng() * leafPalettes.length)];
  const leafMats = pal.map(c => new THREE.MeshStandardMaterial({ color: c }));

  const trunkH = compact ? 0.55 + rng() * 0.2 : 0.8 + rng() * 0.5;
  const trunkR = compact ? 0.11 : 0.13 + rng() * 0.05;
  const lean = (rng() - 0.5) * 0.25;

  // Tronc : deux troncons legerement coudes.
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.8, trunkR * 1.25, trunkH * 0.6, 10), bark);
  t1.position.y = trunkH * 0.3;
  t1.rotation.z = lean * 0.5;
  t1.castShadow = true;
  group.add(t1);
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.6, trunkR * 0.82, trunkH * 0.5, 10), bark);
  t2.position.set(-Math.sin(lean) * trunkH * 0.35, trunkH * 0.78, 0);
  t2.rotation.z = lean * 1.4;
  t2.castShadow = true;
  group.add(t2);
  const topX = t2.position.x - Math.sin(lean * 1.4) * trunkH * 0.25;
  const topY = trunkH;

  // Racines evasees au pied.
  const nRoots = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < nRoots; i++) {
    const a = (i / nRoots) * Math.PI * 2 + rng() * 0.6;
    const root = new THREE.Mesh(new THREE.ConeGeometry(trunkR * 0.55, trunkR * 2.6, 6), barkDk);
    root.position.set(Math.cos(a) * trunkR * 1.05, trunkR * 0.45, Math.sin(a) * trunkR * 1.05);
    root.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25);
    group.add(root);
  }

  // Branches courtes qui partent vers les boules de feuillage.
  const nBranch = compact ? 1 : 2;
  for (let i = 0; i < nBranch; i++) {
    const a = rng() * Math.PI * 2;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.25, trunkR * 0.45, 0.45, 7), bark);
    br.position.set(topX + Math.cos(a) * 0.14, topY - 0.05, Math.sin(a) * 0.14);
    br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    group.add(br);
  }

  // Feuillage : amas de boules rondes. Les plus hautes sont plus claires
  // (lumiere du soleil), les plus basses plus sombres.
  const crownR = compact ? 0.42 : 0.55 + rng() * 0.2;
  const crownY = topY + crownR * 0.55;
  const blobs = [];
  blobs.push({ x: 0, y: 0, z: 0, r: crownR });
  const n = compact ? 4 : 5 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.5;
    const d = crownR * (0.55 + rng() * 0.25);
    blobs.push({
      x: Math.cos(a) * d,
      y: (rng() - 0.45) * crownR * 0.7,
      z: Math.sin(a) * d,
      r: crownR * (0.5 + rng() * 0.25),
    });
  }
  blobs.push({ x: (rng() - 0.5) * 0.15, y: crownR * 0.55, z: (rng() - 0.5) * 0.15, r: crownR * 0.62 });
  for (const b of blobs) {
    const geom = new THREE.IcosahedronGeometry(b.r, 2);
    bump(geom, rng, b.r * 0.08);
    const shade = b.y > crownR * 0.3 ? 2 : b.y < -crownR * 0.1 ? 0 : 1;
    const m = new THREE.Mesh(geom, leafMats[shade]);
    m.position.set(topX + b.x, crownY + b.y, b.z);
    m.scale.y = 0.88;
    m.castShadow = true;
    group.add(m);
  }

  // Quelques fruits rouges / fleurs sur certains arbres.
  if (!compact && rng() > 0.6) {
    const fruitMat = new THREE.MeshStandardMaterial({ color: rng() > 0.5 ? 0xe0412c : 0xffe066 });
    for (let i = 0; i < 5; i++) {
      const a = rng() * Math.PI * 2;
      const fr = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), fruitMat);
      fr.position.set(topX + Math.cos(a) * crownR * 0.95, crownY + (rng() - 0.3) * crownR * 0.8, Math.sin(a) * crownR * 0.95);
      group.add(fr);
    }
  }

  return group;
}

// Petites bosses aleatoires pour casser la sphere parfaite.
function bump(geom, rng, amt) {
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();
  const seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    let k = seen.get(key);
    if (k === undefined) { k = 1 + (rng() - 0.5) * 2 * amt / v.length(); seen.set(key, k); }
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y, v.z);
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
