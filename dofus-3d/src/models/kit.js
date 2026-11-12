import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

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
  // Les yeux gardent leurs couleurs quand une variante recolore le modele.
  white.name = 'eye'; pupil.name = 'eye';
  if (irisMat) irisMat.name = 'eye';
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
    // Pupille fendue (yeux de chat) ou ronde.
    if (opts.slit) p.scale.set(0.35, 1.9, 0.5);
    else p.scale.set(1, 1.2, 0.5);
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

// ===========================================================================
// Outils de sculpture "une seule piece" : moins de primitives empilees,
// donc moins de contours parasites et des silhouettes plus propres.
// ===========================================================================

const _cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

// Volume "loft" : empilement de sections elliptiques lissees (spline).
// rings = [[y, rx, rz, cx, cz], ...] (rz = rx, cx = cz = 0 par defaut).
// Sert aux bustes, membres galbes, bottes, pattes... d une seule piece.
// o.segs : facettes autour ; o.sub : subdivisions entre sections ;
// o.sq : 0..1 section plus "carree" (plastron, botte).
export function loft(rings, mat, o = {}) {
  const segs = o.segs || 20, sub = o.sub || 5, sq = o.sq || 0;
  let R = rings.map(r => [r[0], r[1], r[2] === undefined ? r[1] : r[2], r[3] || 0, r[4] || 0]);
  if (R[R.length - 1][0] < R[0][0]) R = R.reverse();
  const n = R.length;
  const rows = [];
  for (let i = 0; i < n - 1; i++) {
    const a = R[Math.max(0, i - 1)], b = R[i], c = R[i + 1], d = R[Math.min(n - 1, i + 2)];
    for (let s = 0; s < sub; s++) {
      const t = s / sub;
      const row = [0, 1, 2, 3, 4].map(k => _cr(a[k], b[k], c[k], d[k], t));
      // Pas de depassement de la spline en hauteur ni de rayon negatif.
      row[0] = Math.min(Math.max(row[0], b[0]), c[0]);
      row[1] = Math.max(row[1], Math.min(b[1], c[1]) * 0.9, 0.0005);
      row[2] = Math.max(row[2], Math.min(b[2], c[2]) * 0.9, 0.0005);
      rows.push(row);
    }
  }
  rows.push(R[n - 1]);
  const pos = [], idx = [];
  const e = 1 - sq * 0.5;
  const pw = v => Math.sign(v) * Math.pow(Math.abs(v), e);
  for (const [y, rx, rz, cx, cz] of rows) {
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      pos.push(cx + pw(Math.cos(a)) * rx, y, cz + pw(Math.sin(a)) * rz);
    }
  }
  const m = rows.length;
  for (let i = 0; i < m - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      const a = i * segs + j, b = (i + 1) * segs + j, c = i * segs + j1, d = (i + 1) * segs + j1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const lo = rows[0], hi = rows[m - 1];
  const cb = pos.length / 3; pos.push(lo[3], lo[0], lo[4]);
  const ct = cb + 1; pos.push(hi[3], hi[0], hi[4]);
  for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs;
    idx.push(cb, j, j1);
    idx.push(ct, (m - 1) * segs + j1, (m - 1) * segs + j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh_ = new THREE.Mesh(g, mat);
  mesh_.castShadow = true;
  return mesh_;
}

// Sphere lisse (sommets soudes) dont chaque sommet passe par fn(dir, out) :
// dir = direction unitaire, out = Vector3 a remplir (position finale).
export function sculptSphere(fn, mat, ws = 40, hs = 28) {
  let g = new THREE.SphereGeometry(1, ws, hs);
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  const d = new THREE.Vector3(), out = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    d.fromBufferAttribute(p, i).normalize();
    out.copy(d);
    fn(d, out, i);
    p.setXYZ(i, out.x, out.y, out.z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Masse de laine / nuage d une seule piece : sphere gonflee de gros lobes
// bombes (sillons marques entre les lobes, legerement ombres par couleur
// de sommet). o.lobes, o.amp (relief), o.scale [x, y, z], o.seed,
// o.shade (assombrissement des sillons, 0 = aucun).
export function woolBlob(radius, mat, o = {}) {
  const n = o.lobes || 24;
  const amp = o.amp !== undefined ? o.amp : 0.2;
  const sc = o.scale || [1, 1, 1];
  const shade = o.shade !== undefined ? o.shade : 0.2;
  let seed = o.seed || 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const spacing = Math.sqrt(4 * Math.PI / n);
  const lobes = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const rr = Math.sqrt(1 - y * y);
    const a = i * 2.399963 + (rnd() - 0.5) * 0.5;
    const c = new THREE.Vector3(Math.cos(a) * rr, y + (rnd() - 0.5) * 0.25, Math.sin(a) * rr).normalize();
    const w = spacing * (0.62 + rnd() * 0.16) * (o.width || 1);
    lobes.push({ c, k: 1 - Math.cos(w), h: 0.8 + rnd() * 0.35 });
  }
  const cols = [];
  const m = sculptSphere((d, out) => {
    let best = 0;
    for (const l of lobes) {
      const v = 1 - (1 - d.dot(l.c)) / l.k;
      if (v > 0) best = Math.max(best, Math.sqrt(v) * l.h);
    }
    const r = radius * (1 - amp * 0.45 + amp * best);
    out.set(d.x * r * sc[0], d.y * r * sc[1], d.z * r * sc[2]);
    const t = Math.min(1, best / 0.55);
    const s = 1 - shade * (1 - t * t * (3 - 2 * t));
    cols.push(s, s * (1 - (1 - s) * 0.25), s * (1 - (1 - s) * 0.6));
  }, mat, o.ws || 72, o.hs || 48);
  if (shade > 0) {
    m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    mat.vertexColors = true;
  }
  return m;
}

// Tube effile le long d une courbe quelconque ; rad(t) donne le rayon.
// Extremites fermees. Sert aux cornes, queues, meches epaisses.
export function tubeAlong(points, rad, mat, o = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2])));
  const steps = o.steps || 40, segs = o.segs || 10;
  const fr = curve.computeFrenetFrames(steps, false);
  const pos = [], idx = [];
  const c = new THREE.Vector3();
  const flat = o.flat || 1;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    curve.getPointAt(t, c);
    const r = Math.max(0.0005, rad(t));
    const N = fr.normals[i], B = fr.binormals[i];
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const cs = Math.cos(a) * r, sn = Math.sin(a) * r * flat;
      pos.push(c.x + N.x * cs + B.x * sn, c.y + N.y * cs + B.y * sn, c.z + N.z * cs + B.z * sn);
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      const a = i * segs + j, b = (i + 1) * segs + j, cc = i * segs + j1, d = (i + 1) * segs + j1;
      idx.push(a, cc, b, b, cc, d);
    }
  }
  const cols = [];
  if (o.shade) {
    for (let i = 0; i <= steps; i++) {
      const s = o.shade(i / steps);
      for (let j = 0; j < segs; j++) cols.push(s, s * (1 - (1 - s) * 0.3), s * (1 - (1 - s) * 0.7));
    }
    cols.push(1, 1, 1, 1, 1, 1);
  }
  const s0 = pos.length / 3; curve.getPointAt(0, c); pos.push(c.x, c.y, c.z);
  const s1 = s0 + 1; curve.getPointAt(1, c); pos.push(c.x, c.y, c.z);
  for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs;
    idx.push(s0, j1, j);
    idx.push(s1, steps * segs + j, steps * segs + j1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (cols.length) {
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    mat.vertexColors = true;
  }
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Corne de belier d une seule piece : tube annele enroule en spirale
// (part du crane vers l arriere, plonge et revient pointer vers l avant
// en s ecartant de la tete). o.radius, o.curl, o.turns, o.out, o.rings.
// Le materiau passe en couleurs de sommet (sillons ombres).
export function curledHorn(side, mat, o = {}) {
  const r0 = o.radius || 0.075;
  const R = o.curl || 0.16;
  const turns = o.turns || 1.05;
  const out = o.out !== undefined ? o.out : 0.16;
  const rings = o.rings || 9;
  const pts = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const a = k * turns * Math.PI * 2;
    const rad = R * (1 - k * 0.5);
    pts.push(new THREE.Vector3(side * (k * k * out + k * 0.03), Math.cos(a) * rad - R, -Math.sin(a) * rad));
  }
  const wave = t => Math.sin(t * rings * Math.PI * 2);
  return tubeAlong(pts, t => r0 * (1 - 0.86 * Math.pow(t, 1.4)) * (1 + 0.09 * wave(t)), mat, {
    steps: 90, segs: 12,
    // Sillons des anneaux legerement ombres.
    shade: t => 1 - 0.2 * Math.max(0, -wave(t)) * (1 - t * 0.5),
  });
}
