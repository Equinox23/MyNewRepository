import * as THREE from 'three';

// Petit arbre low-poly cartoon. Aleatoirement pin (3 cones empiles) ou
// feuillu (sphere fragmentee). seed = entier, le meme seed donne le
// meme arbre (utile pour reproduire la map d une partie a l autre).
export function buildTree(seed = 0) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);

  const trunkColors = [0x5a3a1a, 0x4a2a14, 0x6a4a28, 0x533515];
  const pineGreens  = [0x2a5e2a, 0x376e36, 0x488a3e, 0x3a7236];
  const leafyGreens = [0x4a7a32, 0x568f3e, 0x3f7028, 0x528a44];

  const isPine = rng() > 0.4;
  const trunkH = 0.45 + rng() * 0.45;
  const trunkR = 0.06 + rng() * 0.04;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.75, trunkR * 1.15, trunkH, 8),
    new THREE.MeshStandardMaterial({
      color: trunkColors[Math.floor(rng() * trunkColors.length)],
      roughness: 0.92, flatShading: true,
    })
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  if (isPine) {
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const r = 0.44 - i * 0.10;
      const h = 0.40;
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 7),
        new THREE.MeshStandardMaterial({
          color: pineGreens[(i + Math.floor(rng() * pineGreens.length)) % pineGreens.length],
          roughness: 0.9, flatShading: true,
        })
      );
      cone.position.y = trunkH + 0.03 + i * 0.24 + h / 2;
      cone.rotation.y = rng() * Math.PI * 2;
      cone.castShadow = true;
      group.add(cone);
    }
  } else {
    // Boule de feuillage : icosahedre detail 1, legerement deforme
    const fGeom = new THREE.IcosahedronGeometry(0.42 + rng() * 0.12, 1);
    const pos = fGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        pos.getX(i) + (rng() - 0.5) * 0.08,
        pos.getY(i) + (rng() - 0.5) * 0.08,
        pos.getZ(i) + (rng() - 0.5) * 0.08
      );
    }
    fGeom.computeVertexNormals();
    const foliage = new THREE.Mesh(
      fGeom,
      new THREE.MeshStandardMaterial({
        color: leafyGreens[Math.floor(rng() * leafyGreens.length)],
        roughness: 0.88, flatShading: true,
      })
    );
    foliage.position.y = trunkH + 0.32;
    foliage.scale.set(1, 0.85 + rng() * 0.2, 1);
    foliage.castShadow = true;
    group.add(foliage);

    // Petite accent foliage plus claire
    if (rng() > 0.5) {
      const accent = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({
          color: 0x6aa548, roughness: 0.9, flatShading: true,
        })
      );
      accent.position.set((rng() - 0.5) * 0.3, trunkH + 0.20, (rng() - 0.5) * 0.3);
      accent.castShadow = true;
      group.add(accent);
    }
  }

  return group;
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
