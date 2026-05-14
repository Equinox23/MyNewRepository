import * as THREE from 'three';

// Craqueleur : petit golem de pierre. Corps cube allonge avec
// vertices perturbes, bras massifs, tete cubique avec yeux jaunes
// brillants, plaque de mousse sur le crane.
export function buildCraqueleur() {
  const group = new THREE.Group();
  const rng = mulberry32(31415);

  const stone = 0x8a7868;
  const stoneDark = 0x5a4b3a;
  const stoneDeep = 0x2a1a0c;
  const eyeGlow = 0xfff066;
  const mossColor = 0x4a7a32;

  const stoneMat = new THREE.MeshStandardMaterial({ color: stone, roughness: 0.95, flatShading: true });
  const darkMat  = new THREE.MeshStandardMaterial({ color: stoneDark, roughness: 0.95, flatShading: true });
  const deepMat  = new THREE.MeshStandardMaterial({ color: stoneDeep, roughness: 1 });
  const eyeMat   = new THREE.MeshBasicMaterial({ color: eyeGlow });
  const eyeHalo  = new THREE.MeshBasicMaterial({ color: eyeGlow, transparent: true, opacity: 0.4 });
  const mossMat  = new THREE.MeshStandardMaterial({ color: mossColor, roughness: 0.95, flatShading: true });

  // -- 2 pattes courtes cubiques --
  for (const dx of [-0.16, 0.16]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.22), darkMat);
    leg.position.set(dx, 0.12, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // -- Corps : grand cube allonge, vertices perturbes --
  const bodyGeom = new THREE.BoxGeometry(0.68, 0.52, 0.54);
  perturb(bodyGeom, rng, 0.06);
  const body = new THREE.Mesh(bodyGeom, stoneMat);
  body.position.y = 0.56;
  body.castShadow = true;
  group.add(body);
  // Fissures (rectangles fins sombres incrustes)
  for (const [x, y, z, w, h] of [
    [-0.20, 0.62, 0.27, 0.22, 0.03],
    [0.18, 0.55, 0.27, 0.04, 0.18],
    [-0.10, 0.45, 0.27, 0.16, 0.025],
  ]) {
    const cr = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.005), deepMat);
    cr.position.set(x, y, z);
    group.add(cr);
  }

  // -- Petits cailloux sur les epaules --
  for (const [dx, dy, dz] of [[-0.30, 0.82, 0.08], [0.30, 0.82, 0.08], [0, 0.88, -0.10]]) {
    const r = 0.10 + rng() * 0.04;
    const g = new THREE.IcosahedronGeometry(r, 0);
    perturb(g, rng, 0.03);
    const s = new THREE.Mesh(g, stoneMat);
    s.position.set(dx, dy, dz);
    s.castShadow = true;
    group.add(s);
  }

  // -- Bras massifs (cube + poing icosahedre) --
  for (const dx of [-0.42, 0.42]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.20), stoneMat);
    arm.position.set(dx, 0.50, 0);
    arm.castShadow = true;
    group.add(arm);
    const fistGeom = new THREE.IcosahedronGeometry(0.14, 0);
    perturb(fistGeom, rng, 0.03);
    const fist = new THREE.Mesh(fistGeom, darkMat);
    fist.position.set(dx, 0.33, 0);
    fist.castShadow = true;
    group.add(fist);
  }

  // -- Tete cubique --
  const headGeom = new THREE.BoxGeometry(0.46, 0.34, 0.44);
  perturb(headGeom, rng, 0.04);
  const head = new THREE.Mesh(headGeom, stoneMat);
  head.position.y = 1.00;
  head.castShadow = true;
  group.add(head);

  // Yeux jaunes brillants (rectangles + halo)
  for (const dx of [-0.10, 0.10]) {
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeHalo);
    halo.position.set(dx, 1.02, 0.22);
    group.add(halo);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.045, 0.04), eyeMat);
    eye.position.set(dx, 1.02, 0.24);
    group.add(eye);
  }

  // Bouche : trait fissure sombre
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.04), deepMat);
  mouth.position.set(0, 0.90, 0.22);
  group.add(mouth);

  // -- Plaque de mousse sur le crane --
  const moss = new THREE.Mesh(
    new THREE.SphereGeometry(0.20, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45),
    mossMat
  );
  moss.position.y = 1.16;
  moss.scale.set(1, 0.55, 1);
  group.add(moss);
  // Petites herbes sur la mousse
  for (let i = 0; i < 4; i++) {
    const a = rng() * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 4), mossMat);
    blade.position.set(Math.cos(a) * 0.10, 1.22, Math.sin(a) * 0.10);
    blade.rotation.x = (rng() - 0.5) * 0.4;
    blade.rotation.z = (rng() - 0.5) * 0.4;
    group.add(blade);
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
