import * as THREE from 'three';

// ===========================================================================
// Outils de modelage partages par l Osamodas, le Roublard et le Xelor
// (refonte "illustration" sur buildHero) :
//  - profile  : rayon d un volume loft a une hauteur donnee ;
//  - band     : ruban epais le long d un chemin (bandouliere, bandeau,
//               bandelettes, col, galon) ;
//  - surfaceOf: point de la surface d un maillage dans une direction
//               (pour poser un ruban sur la tete ou les cheveux) ;
//  - openSkirt: pan de manteau ouvert devant ;
//  - torsoRadius / torsoStrap : sangle en travers du buste de buildHero.
// ===========================================================================

const _cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

// Interpole des sections [[y, rx, rz, cx, cz], ...] comme kit.loft :
// renvoie f(y) -> [rx, rz, cx, cz].
export function profile(rings) {
  let R = rings.map(r => [r[0], r[1], r[2] === undefined ? r[1] : r[2], r[3] || 0, r[4] || 0]);
  if (R[R.length - 1][0] < R[0][0]) R = R.reverse();
  const n = R.length;
  return (y) => {
    if (y <= R[0][0]) return R[0].slice(1);
    if (y >= R[n - 1][0]) return R[n - 1].slice(1);
    let i = 0;
    while (i < n - 2 && y > R[i + 1][0]) i++;
    const a = R[Math.max(0, i - 1)], b = R[i], c = R[i + 1], d = R[Math.min(n - 1, i + 2)];
    const t = (y - b[0]) / (c[0] - b[0]);
    const out = [1, 2, 3, 4].map(k => _cr(a[k], b[k], c[k], d[k], t));
    out[0] = Math.max(out[0], Math.min(b[1], c[1]) * 0.9, 0.0005);
    out[1] = Math.max(out[1], Math.min(b[2], c[2]) * 0.9, 0.0005);
    return out;
  };
}

// Ruban epais. fn(t) -> { p, n, w, th } : centre, normale sortante,
// demi-largeur (dans le plan de la surface) et demi-epaisseur.
// o.steps, o.segs, o.closed (boucle), o.sq (section plus rectangulaire).
export function band(fn, mat, o = {}) {
  const steps = o.steps || 40, segs = o.segs || 8, closed = !!o.closed;
  const e = 1 - (o.sq !== undefined ? o.sq : 0.5) * 0.5;
  const pw = v => Math.sign(v) * Math.pow(Math.abs(v), e);
  const S = [];
  const count = closed ? steps : steps + 1;
  for (let i = 0; i < count; i++) S.push(fn(i / steps));
  const pos = [], idx = [];
  const tan = new THREE.Vector3(), up = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = S[closed ? (i - 1 + count) % count : Math.max(0, i - 1)];
    const b = S[closed ? (i + 1) % count : Math.min(count - 1, i + 1)];
    const s = S[i];
    tan.subVectors(b.p, a.p).normalize();
    up.crossVectors(s.n, tan).normalize();
    const w = Math.max(0.0004, s.w), th = Math.max(0.0004, s.th !== undefined ? s.th : o.thick || 0.008);
    for (let j = 0; j < segs; j++) {
      const ang = (j / segs) * Math.PI * 2;
      const cu = pw(Math.cos(ang)) * w, cn = pw(Math.sin(ang)) * th;
      pos.push(s.p.x + up.x * cu + s.n.x * cn, s.p.y + up.y * cu + s.n.y * cn, s.p.z + up.z * cu + s.n.z * cn);
    }
  }
  const rows = closed ? count : count - 1;
  for (let i = 0; i < rows; i++) {
    const i1 = (i + 1) % count;
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      const a = i * segs + j, b = i1 * segs + j, c = i * segs + j1, d = i1 * segs + j1;
      idx.push(a, c, b, b, c, d);
    }
  }
  if (!closed) {
    const s0 = pos.length / 3; pos.push(S[0].p.x, S[0].p.y, S[0].p.z);
    const s1 = s0 + 1; const L = S[count - 1]; pos.push(L.p.x, L.p.y, L.p.z);
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      idx.push(s0, j1, j);
      idx.push(s1, (count - 1) * segs + j, (count - 1) * segs + j1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Surface d un (ou plusieurs) maillage(s) freres : f(dir, lift) renvoie le
// point le plus exterieur dans la direction `dir` depuis `center`, dans le
// repere du parent des maillages (la tete).
export function surfaceOf(meshes, center) {
  const list = Array.isArray(meshes) ? meshes : [meshes];
  const ray = new THREE.Raycaster();
  const d = new THREE.Vector3(), o = new THREE.Vector3();
  return (dir, lift = 0) => {
    d.copy(dir).normalize();
    o.copy(center).addScaledVector(d, 5);
    let best = 0.05;
    for (const m of list) {
      m.updateMatrix();
      m.matrixWorld.copy(m.matrix);
      ray.set(o, d.clone().negate());
      const hit = ray.intersectObject(m, false)[0];
      if (hit) best = Math.max(best, 5 - hit.distance);
    }
    return center.clone().addScaledVector(d, best + lift);
  };
}

// Ruban ferme autour de la tete : anneau a la hauteur relative `y`
// (direction, -1..1), incline de `k` (devant plus haut si k > 0).
export function headBand(surf, mat, o = {}) {
  const y = o.y || 0, k = o.k || 0, ph = o.phase || 0;
  const dir = new THREE.Vector3();
  const fn = (t) => {
    const a = t * Math.PI * 2;
    dir.set(Math.cos(a), y + k * Math.sin(a + ph), Math.sin(a)).normalize();
    const p = surf(dir, o.lift || 0.004);
    const n = dir.clone();
    return { p, n, w: o.w || 0.02, th: o.th || 0.006 };
  };
  return band(fn, mat, { steps: o.steps || 56, segs: 8, closed: true, sq: o.sq });
}

// Pan de manteau / jupe ouverte devant : sections [[y, rx, rz, cx, cz]],
// ouverture `gap` (radians) centree sur +z. o.wave : ondulation de l ourlet.
export function openSkirt(rings, mat, o = {}) {
  const f = profile(rings);
  const ys = rings.map(r => r[0]);
  const y0 = Math.max(...ys), y1 = Math.min(...ys);
  const rows = o.rows || 14, cols = o.cols || 36;
  const gap = o.gap !== undefined ? o.gap : 1.2;
  const pos = [], idx = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const y = y0 + (y1 - y0) * t;
    const [rx, rz, cx, cz] = f(y);
    for (let j = 0; j <= cols; j++) {
      const u = j / cols;
      const phi = gap / 2 + u * (Math.PI * 2 - gap);
      const k = 1 + (o.wave || 0) * t * Math.sin(u * Math.PI * 2 * (o.waves || 5));
      // Les bords de l ouverture s ecartent un peu vers le bas.
      const open = (o.flare || 0) * t * Math.pow(Math.abs(u * 2 - 1), 6);
      pos.push(cx + Math.sin(phi) * rx * k * (1 + open), y, cz + Math.cos(phi) * rz * k);
    }
  }
  const W = cols + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * W + j, b = (i + 1) * W + j, c = i * W + j + 1, d = (i + 1) * W + j + 1;
      idx.push(a, b, c, c, b, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.material.side = THREE.DoubleSide;
  m.castShadow = true;
  return m;
}

// Rayons du buste de buildHero a la hauteur y (memes sections que
// humanoid.buildHero) : renvoie [rx, rz].
export function torsoRadius(H) {
  const b = H.build, hipY = H.hipY, sh = H.shoulderY, h = sh - hipY;
  const ty = t => hipY + t * h;
  const f = profile([
    [ty(0.08), 0.1 * b, 0.08 * b], [ty(0.16), 0.13 * b, 0.096 * b], [ty(0.3), 0.132 * b, 0.097 * b],
    [ty(0.56), 0.168 * b, 0.118 * b], [ty(0.82), 0.2 * b, 0.132 * b], [ty(1.0), 0.2 * b, 0.118 * b],
    [ty(1.11), 0.13 * b, 0.095 * b], [ty(1.19), 0.06, 0.06],
  ]);
  return y => f(y);
}

// Chemin d une sangle en travers du buste : plan incline y = yc + slope * x
// coupe avec le buste. Renvoie path(a) -> { p, n } (a = angle, pi/2 = devant).
export function torsoPath(H, yc, slope, lift = 0.006) {
  const R = torsoRadius(H);
  return (a) => {
    const cx = Math.cos(a), sz = Math.sin(a);
    let y = yc;
    for (let i = 0; i < 8; i++) y = yc + slope * cx * R(y)[0];
    const [rx, rz] = R(y);
    const p = new THREE.Vector3(cx * (rx + lift), y, sz * (rz + lift));
    const n = new THREE.Vector3(cx / rx, 0, sz / rz).normalize();
    return { p, n };
  };
}

export function torsoStrap(H, mat, o = {}) {
  const path = torsoPath(H, o.y !== undefined ? o.y : 0.87, o.slope !== undefined ? o.slope : 1.1, o.lift);
  return band((t) => {
    const s = path(t * Math.PI * 2);
    return { p: s.p, n: s.n, w: o.w || 0.026, th: o.th || 0.01 };
  }, mat, { steps: 56, segs: 8, closed: true, sq: 0.6 });
}

// Detail sans contour ni ombre portee.
export const detail = (m) => { m.userData.noOutline = true; m.castShadow = false; return m; };
