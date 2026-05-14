import * as THREE from 'three';

// Bloc rocheux : un icosahedre principal deforme + 1 ou 2 petits cailloux
// autour, parfois une plaque de mousse au sommet.
export function buildRock(seed = 0) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);

  const stoneColors = [0x7a6a5a, 0x6a5b4a, 0x8a7868, 0x59503e];
  const baseColor = stoneColors[Math.floor(rng() * stoneColors.length)];

  // Roche principale
  const mainGeom = new THREE.IcosahedronGeometry(0.36, 0);
  perturb(mainGeom, rng, 0.18);
  const main = new THREE.Mesh(
    mainGeom,
    new THREE.MeshStandardMaterial({
      color: baseColor, roughness: 0.95, flatShading: true,
    })
  );
  main.position.y = 0.28;
  main.scale.set(1.15, 0.88, 1.0);
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  // Petits cailloux
  const n = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const r = 0.10 + rng() * 0.07;
    const g = new THREE.IcosahedronGeometry(r, 0);
    perturb(g, rng, 0.06);
    const small = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        color: baseColor - 0x101010, roughness: 0.95, flatShading: true,
      })
    );
    const angle = rng() * Math.PI * 2;
    const dist = 0.30 + rng() * 0.10;
    small.position.set(Math.cos(angle) * dist, r * 0.9, Math.sin(angle) * dist);
    small.rotation.set(rng() * 2, rng() * 2, rng() * 2);
    small.castShadow = true;
    group.add(small);
  }

  // Plaque de mousse sur le sommet (50% des rochers)
  if (rng() > 0.5) {
    const moss = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({
        color: 0x4a7a32, roughness: 0.95, flatShading: true,
      })
    );
    moss.position.y = 0.5;
    moss.scale.set(1.05, 0.45, 1.05);
    group.add(moss);
  }

  return group;
}

function perturb(geom, rng, amount) {
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + (rng() - 0.5) * amount,
      pos.getY(i) + (rng() - 0.5) * amount,
      pos.getZ(i) + (rng() - 0.5) * amount
    );
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
