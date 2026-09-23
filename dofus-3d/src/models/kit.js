import * as THREE from 'three';

// Petits outils partages par les modeles "facon Dofus" : materiaux,
// grands yeux expressifs, cornes enroulees, touffes de laine.

export const M = (color, o = {}) => new THREE.MeshStandardMaterial({
  color, roughness: o.r !== undefined ? o.r : 0.7, metalness: o.m || 0,
  emissive: o.emissive || 0x000000, emissiveIntensity: o.ei || 1,
});

export function mesh(geom, mat, pos, scale, rot) {
  const m = new THREE.Mesh(geom, mat);
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (scale) typeof scale === 'number' ? m.scale.setScalar(scale) : m.scale.set(scale[0], scale[1], scale[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  return m;
}

// Grands yeux "cartoon" : globe blanc ovale, grosse pupille sombre qui
// regarde legerement vers l avant, double reflet blanc. `opts` :
//   x, y, z  : centre entre les deux yeux ; spacing : ecart ;
//   size : rayon du globe ; iris : couleur de l iris (optionnel) ;
//   angry / sleepy : paupiere inclinee.
export function addEyes(group, opts = {}) {
  const size = opts.size || 0.08;
  const spacing = opts.spacing || size * 2.3;
  const white = M(opts.white || 0xffffff, { r: 0.3 });
  const pupil = M(opts.pupil || 0x1a1020, { r: 0.3 });
  const shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = opts.iris ? M(opts.iris, { r: 0.3 }) : null;
  const lidMat = opts.lid ? M(opts.lid) : null;
  const eyes = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    const globe = mesh(new THREE.SphereGeometry(size, 16, 12), white, [0, 0, 0], [1, 1.22, 0.62]);
    globe.castShadow = false;
    g.add(globe);
    if (irisMat) {
      const iris = new THREE.Mesh(new THREE.SphereGeometry(size * 0.66, 14, 10), irisMat);
      iris.position.set(side * -size * 0.08, -size * 0.05, size * 0.3);
      iris.scale.set(1, 1.2, 0.55);
      g.add(iris);
    }
    const p = new THREE.Mesh(new THREE.SphereGeometry(size * (irisMat ? 0.4 : 0.58), 12, 10), pupil);
    p.position.set(side * -size * 0.08, -size * 0.05, size * 0.4);
    p.scale.set(1, 1.2, 0.5);
    g.add(p);
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(size * 0.2, 8, 6), shine);
    s1.position.set(side * -size * 0.25 + size * 0.2, size * 0.3, size * 0.56);
    g.add(s1);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(size * 0.1, 6, 5), shine);
    s2.position.set(side * -size * 0.02 - size * 0.12, -size * 0.28, size * 0.58);
    g.add(s2);
    if (lidMat && (opts.angry || opts.sleepy)) {
      const lid = new THREE.Mesh(new THREE.SphereGeometry(size * 1.08, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), lidMat);
      lid.scale.set(1, 1.2, 0.7);
      lid.rotation.z = opts.angry ? side * 0.45 : 0;
      lid.rotation.x = opts.sleepy ? 0.5 : 0.15;
      g.add(lid);
    }
    g.position.set((opts.x || 0) + side * spacing / 2, opts.y || 0, opts.z || 0);
    if (opts.turn) g.rotation.y = side * opts.turn;
    group.add(g);
    eyes.push(g);
  }
  return eyes;
}

// Corne de belier enroulee : chapelet de spheres qui decroissent le long
// d une spirale (les contours toon dessinent les stries de la corne).
export function ramHorn(side, mat, o = {}) {
  const g = new THREE.Group();
  const n = o.segments || 11;
  const r0 = o.radius || 0.075;
  const R = o.curl || 0.16;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const a = k * Math.PI * 1.55;
    const rad = R * (1 - k * 0.45);
    const x = side * (Math.sin(a) * rad + k * 0.06);
    const y = Math.cos(a) * rad * 0.95 - rad * 0.3 + k * 0.02;
    const z = -Math.sin(a * 0.5) * 0.08 + k * 0.1;
    const s = new THREE.Mesh(new THREE.SphereGeometry(r0 * (1 - k * 0.62), 10, 8), mat);
    s.position.set(x, y, z);
    s.castShadow = true;
    g.add(s);
  }
  return g;
}

// Corne pointue legerement courbe (cones empiles).
export function spikeHorn(side, mat, o = {}) {
  const g = new THREE.Group();
  const len = o.length || 0.3;
  const r = o.radius || 0.06;
  const bend = o.bend !== undefined ? o.bend : 0.5;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, len * 0.5, 10), mat);
  base.position.y = len * 0.25;
  g.add(base);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 0.7, len * 0.6, 10), mat);
  tip.position.set(side * len * 0.12 * bend, len * 0.72, 0);
  tip.rotation.z = -side * bend * 0.6;
  g.add(tip);
  return g;
}

// Touffe de laine / pelage : grappe de boules douces.
export function fluff(mat, n, radius, spread, rng = Math.random) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * (0.75 + rng() * 0.5), 2), mat);
    s.position.set((rng() - 0.5) * spread, (rng() - 0.5) * spread * 0.6, (rng() - 0.5) * spread);
    s.castShadow = true;
    g.add(s);
  }
  return g;
}

// Bouche souriante / grimacante (demi-tore).
export function mouth(mat, width = 0.1, o = {}) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(width, o.thick || width * 0.18, 6, 16, Math.PI), mat);
  m.rotation.z = o.frown ? 0 : Math.PI;
  return m;
}
