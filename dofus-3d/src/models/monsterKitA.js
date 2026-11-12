import * as THREE from 'three';
import { M, sculptSphere, tubeAlong } from './kit.js';

// Outils communs aux monstres "ronds" (tofu, wabbit, crapaud, chaton,
// bouftou royal) : peinture par couleur de sommet (ventre clair, taches),
// traits du visage, pattes palmees, plumes, couronne d une seule piece.

export const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const gauss = (x, w) => Math.exp(-(x * x) / (w * w));

// Rapport (espace lineaire) entre une couleur cible et la couleur du
// materiau : sert de multiplicateur de couleur de sommet.
export function ratio(baseHex, targetHex) {
  const b = new THREE.Color(baseHex), t = new THREE.Color(targetHex);
  return [t.r / Math.max(b.r, 1e-3), t.g / Math.max(b.g, 1e-3), t.b / Math.max(b.b, 1e-3)];
}

// Peint un mesh par couleurs de sommet. layers = [[rgb, poids(p, n)], ...]
// appliques dans l ordre (p = position locale, n = normale). Le materiau
// du mesh passe en vertexColors : il ne doit servir qu a des meshes peints.
export function paint(m, layers) {
  const g = m.geometry, p = g.attributes.position, nr = g.attributes.normal;
  const cols = new Float32Array(p.count * 3);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); n.fromBufferAttribute(nr, i);
    let r = 1, gg = 1, b = 1;
    for (const [c, w] of layers) {
      const k = Math.min(1, Math.max(0, w(v, n)));
      r += (c[0] - r) * k; gg += (c[1] - gg) * k; b += (c[2] - b) * k;
    }
    cols[i * 3] = r; cols[i * 3 + 1] = gg; cols[i * 3 + 2] = b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  m.material.vertexColors = true;
  return m;
}

// Ellipsoide lisse (sommets soudes), eventuellement retouche par fn(d, out).
export function blob(rx, ry, rz, mat, fn, ws = 28, hs = 20) {
  return sculptSphere((d, out) => {
    out.set(d.x * rx, d.y * ry, d.z * rz);
    if (fn) fn(d, out);
  }, mat, ws, hs);
}

// Plastron (ventre, gorge) : coque du meme volume que le corps, a peine
// decollee la ou weight(d, out) vaut 1 et rentree dedans ailleurs. Un
// materiau a part : les variantes le recolorent comme le reste.
export function shell(shape, weight, mat, ws = 48, hs = 34, push = 0.005) {
  const m = sculptSphere((d, out) => {
    shape(d, out);
    const w = Math.min(1, Math.max(0, weight(d, out)));
    out.addScaledVector(d, -0.03 + (0.03 + push) * w);
  }, mat, ws, hs);
  m.userData.noOutline = true;
  m.castShadow = false;
  return m;
}

// Trait fin (bouche, sourcil, moustache) : jamais de contour ni d ombre.
export function line(pts, r, mat, o = {}) {
  const t = tubeAlong(pts, o.taper ? (k => r * (0.35 + 0.65 * Math.sin(Math.PI * k))) : (() => r), mat, { steps: o.steps || 16, segs: 6 });
  t.userData.noOutline = true;
  t.castShadow = false;
  return t;
}

// Petit detail colle sur une surface (joue, truffe...) sans contour.
export function decal(m) {
  m.userData.noOutline = true;
  m.castShadow = false;
  return m;
}

// Patte palmee / pied d oiseau d une seule piece, posee au sol (y = 0),
// doigts vers +z. o.len (longueur des doigts), o.back (talon), o.toes
// (angles des doigts en radians), o.toeW (finesse), o.web (0 = doigts
// separes, 1 = palme pleine), o.thick.
export function webFoot(mat, o = {}) {
  const len = o.len || 0.12, back = o.back !== undefined ? o.back : len * 0.35;
  const toes = o.toes || [-0.6, 0, 0.6];
  const toeW = o.toeW || 0.22, web = o.web !== undefined ? o.web : 0.55;
  const thick = o.thick || 0.022;
  return sculptSphere((d, out) => {
    const h = Math.sqrt(d.x * d.x + d.z * d.z);
    const a = Math.atan2(d.x, d.z);
    let toe = 0;
    for (const t of toes) toe = Math.max(toe, gauss(a - t, toeW));
    const fwd = smooth(-0.35, 0.45, Math.cos(a));
    const R = fwd * len * (web + (1 - web) * toe) + (1 - fwd) * back;
    const hh = Math.pow(h, 0.8);
    // Plus epais au talon, s affine vers le bout des doigts.
    const y = thick * (d.y + 1) * (1 - 0.45 * fwd * hh);
    out.set(Math.sin(a) * R * hh, y, Math.cos(a) * R * hh);
  }, mat, o.ws || 56, o.hs || 14);
}

// Plume / feuille / oreille : lame galbee dont la base est a l origine et
// la pointe vers +y. o.bend courbe la pointe vers -z, o.cup creuse la lame.
export function feather(len, width, mat, o = {}) {
  const thick = o.thick || width * 0.3;
  const bend = o.bend || 0, pw = o.pw || 0.75, cup = o.cup || 0;
  return sculptSphere((d, out) => {
    const t = (d.y + 1) / 2;
    const prof = Math.pow(Math.sin(Math.PI * Math.pow(t, pw)), o.sharp || 0.8);
    const base = o.base ? Math.max(prof, o.base * (1 - t)) : prof;
    const x = d.x * width * base;
    out.set(x, t * len, d.z * thick * (0.35 + 0.65 * base) - bend * t * t * len + cup * (x * x) / width);
  }, mat, o.ws || 18, o.hs || 16);
}

// Couronne d une seule piece (bandeau + pointes), posee sur y = 0.
// o.points, o.flare (evasement), o.valley (hauteur des creux 0..1),
// o.gems : couleurs des gemmes du bandeau ; o.cap : couleur du bonnet.
export function crown(r, h, o = {}) {
  const g = new THREE.Group();
  const gold = o.mat || M(0xffcf3a, { r: 0.3, m: 0.6 });
  const points = o.points || 5, flare = o.flare !== undefined ? o.flare : 0.2;
  const valley = o.valley !== undefined ? o.valley : 0.5, thick = o.thick || r * 0.12;
  const segs = points * 14;
  const pos = [], idx = [];
  const tipPos = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2 + Math.PI / 2;
    const ph = (i / segs * points) % 1;
    const tri = 1 - Math.abs(2 * ph - 1);
    const top = h * (valley + (1 - valley) * Math.pow(tri, 1.25));
    const ro = r * (1 + flare * top / h);
    const c = Math.cos(a), s = Math.sin(a);
    pos.push(c * r, 0, s * r, c * ro, top, s * ro, c * (ro - thick), top, s * (ro - thick), c * (r - thick), 0, s * (r - thick));
    if (tri > 0.999) tipPos.push([c * ro, top, s * ro]);
  }
  const quad = (a, b, c, d) => idx.push(a, b, c, b, d, c);
  for (let i = 0; i < segs; i++) {
    const p = i * 4, q = ((i + 1) % segs) * 4;
    quad(p, p + 1, q, q + 1);
    quad(p + 1, p + 2, q + 1, q + 2);
    quad(p + 2, p + 3, q + 2, q + 3);
    quad(p + 3, p, q + 3, q);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const band = new THREE.Mesh(geo, gold);
  band.castShadow = true;
  g.add(band);
  // Perles au bout des pointes.
  for (const [x, y, z] of tipPos) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r * 0.11, 10, 8), gold);
    b.position.set(x, y + r * 0.04, z);
    b.userData.noOutline = true;
    g.add(b);
  }
  // Gemmes serties dans le bandeau, sous chaque pointe.
  const gems = o.gems || [0xd8322a, 0x3a8ae0, 0x3ac86a, 0x3a8ae0, 0xd8322a];
  for (let i = 0; i < points; i++) {
    const a = ((i + 0.5) / points) * Math.PI * 2 + Math.PI / 2;
    const gm = new THREE.Mesh(new THREE.SphereGeometry(r * 0.13, 10, 8), M(gems[i % gems.length], { r: 0.2 }));
    const rr = r * (1 + flare * 0.3);
    gm.position.set(Math.cos(a) * rr, h * 0.3, Math.sin(a) * rr);
    gm.scale.set(1, 1.25, 1);
    gm.rotation.y = -a + Math.PI / 2;
    gm.userData.noOutline = true;
    g.add(gm);
  }
  if (o.cap !== undefined) {
    const cap = blob(r * 0.93, h * 0.75, r * 0.93, M(o.cap, { r: 0.85 }), null, 20, 12);
    cap.position.y = h * 0.3;
    cap.userData.noOutline = true;
    g.add(cap);
  }
  return g;
}
