import * as THREE from 'three';
import { sculptSphere, tubeAlong } from './kit.js';

// ===========================================================================
// Outils de sculpture partages par les monstres "serie B" (Chafer,
// Champignon, Craqueleur, Dragounet, boss, bombe) : roche taillee, voiles
// epais (capes, ailes, lames), couronnes, cristaux, flammes...
// ===========================================================================

const _a = new THREE.Color(), _b = new THREE.Color();
// Facteur de couleur de sommet pour obtenir `target` sur un materiau de
// couleur `base` (les couleurs de sommet multiplient celle du materiau).
export function vcol(target, base) {
  _a.set(target); _b.set(base);
  return [_a.r / Math.max(_b.r, 0.004), _a.g / Math.max(_b.g, 0.004), _a.b / Math.max(_b.b, 0.004)];
}
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Petit generateur pseudo-aleatoire reproductible.
export function rng(seed = 7) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// sculptSphere + couleurs de sommet : fn(dir, out) renvoie [r, g, b]
// (facteur multiplie par la couleur du materiau) ou rien (= 1, 1, 1).
export function paintSphere(fn, mat, ws = 48, hs = 36) {
  const cols = [];
  const m = sculptSphere((d, out) => {
    const c = fn(d, out) || [1, 1, 1];
    cols.push(c[0], c[1], c[2]);
  }, mat, ws, hs);
  m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  mat.vertexColors = true;
  return m;
}

// Rocher taille d une seule piece : sphere rabotee par des plans (facettes
// franches, aretes adoucies), chaque facette legerement nuancee.
// o.planes, o.cut (profondeur mini des tailles 0..1), o.scale [x, y, z],
// o.seed, o.tone (contraste des facettes), o.flat (aplatit le dessous).
// mesh.userData.surf(dir) renvoie le point de surface (repere du mesh).
export function rockBlob(r, mat, o = {}) {
  const n = o.planes || 14;
  const cut = o.cut !== undefined ? o.cut : 0.72;
  const sc = o.scale || [1, 1, 1];
  const tone = o.tone !== undefined ? o.tone : 0.16;
  const rnd = rng(o.seed || 5);
  const planes = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const rr = Math.sqrt(1 - y * y);
    const a = i * 2.399963 + (rnd() - 0.5) * 0.9;
    const c = new THREE.Vector3(Math.cos(a) * rr, y + (rnd() - 0.5) * 0.3, Math.sin(a) * rr).normalize();
    planes.push({ c, h: cut + rnd() * (0.95 - cut), t: 1 + (rnd() - 0.5) * 2 * tone });
  }
  if (o.flat) planes.push({ c: new THREE.Vector3(0, -1, 0), h: o.flat, t: 0.85 });
  const surf = (d, out = new THREE.Vector3()) => {
    let rr = 1, t = 1, hit = null;
    for (const p of planes) {
      const k = d.dot(p.c);
      if (k > 0.05) { const v = p.h / k; if (v < rr) { rr = v; t = p.t; hit = p; } }
    }
    out.set(d.x * rr * r * sc[0], d.y * rr * r * sc[1], d.z * rr * r * sc[2]);
    out.w_ = t;
    out.n_ = hit ? hit.c : d;
    return out;
  };
  const nrm = [];
  const m = paintSphere((d, out) => {
    surf(d, out);
    const t = out.w_;
    // Normale de la facette (aretes franches) ; transposee inverse de l echelle.
    const nn = out.n_;
    const nx = nn.x / sc[0], ny = nn.y / sc[1], nz = nn.z / sc[2];
    const l = Math.hypot(nx, ny, nz) || 1;
    nrm.push(nx / l, ny / l, nz / l);
    // Dessous un peu plus sombre (ancre le rocher au sol).
    const g = t * (0.9 + 0.1 * sstep(-0.9, 0.2, d.y));
    return [g, g, g * (1 - (1 - t) * 0.3)];
  }, mat, o.ws || 44, o.hs || 32);
  m.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  m.userData.surf = surf;
  return m;
}

// Fissure (lumineuse ou sombre) posee a la surface d un rockBlob : suite
// de directions [x, y, z] ; le trait suit le relief.
export function rockCrack(rock, dirs, mat, r = 0.012) {
  const pts = [];
  const d = new THREE.Vector3();
  for (let i = 0; i < dirs.length - 1; i++) {
    for (let k = 0; k < 5; k++) {
      const t = k / 5;
      d.set(dirs[i][0] + (dirs[i + 1][0] - dirs[i][0]) * t, dirs[i][1] + (dirs[i + 1][1] - dirs[i][1]) * t, dirs[i][2] + (dirs[i + 1][2] - dirs[i][2]) * t).normalize();
      pts.push(rock.userData.surf(d).clone().multiplyScalar(1.004));
    }
  }
  const L = dirs[dirs.length - 1];
  pts.push(rock.userData.surf(d.set(L[0], L[1], L[2]).normalize()).clone().multiplyScalar(1.004));
  const t = tubeAlong(pts, k => r * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, Math.max(0, k)))), mat, { steps: pts.length * 2, segs: 5 });
  t.userData.noOutline = true;
  t.castShadow = false;
  t.position.copy(rock.position);
  t.rotation.copy(rock.rotation);
  t.scale.copy(rock.scale);
  return t;
}

// Voile epais d une seule piece (cape, lambeau, membrane d aile, lame) :
// fn(u, v, out) place chaque point (u, v dans 0..1) ; les deux faces
// sont ecartees de `thick` et cousues sur les bords (le contour toon
// fonctionne, pas de DoubleSide). o.color(u, v) -> [r, g, b] optionnel.
export function sheet(fn, nu, nv, thick, mat, o = {}) {
  const W = nu + 1, H = nv + 1;
  const P = [];
  const v = new THREE.Vector3();
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { fn(i / nu, j / nv, v); P.push(v.clone()); }
  const at = (i, j) => P[Math.min(H - 1, Math.max(0, j)) * W + Math.min(W - 1, Math.max(0, i))];
  const pos = [], cols = [];
  const du = new THREE.Vector3(), dv = new THREE.Vector3(), nn = new THREE.Vector3();
  const N = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    du.subVectors(at(i + 1, j), at(i - 1, j));
    dv.subVectors(at(i, j + 1), at(i, j - 1));
    nn.crossVectors(du, dv);
    if (nn.lengthSq() < 1e-14) nn.set(0, 0, 1); else nn.normalize();
    N.push(nn.clone());
  }
  for (const s of [0.5, -0.5]) {
    for (let k = 0; k < P.length; k++) {
      const th = typeof thick === 'function' ? thick((k % W) / nu, Math.floor(k / W) / nv) : thick;
      pos.push(P[k].x + N[k].x * th * s, P[k].y + N[k].y * th * s, P[k].z + N[k].z * th * s);
      if (o.color) { const c = o.color((k % W) / nu, Math.floor(k / W) / nv, s > 0); cols.push(c[0], c[1], c[2]); }
    }
  }
  const idx = [];
  const F = (i, j) => j * W + i, B = (i, j) => P.length + j * W + i;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    idx.push(F(i, j), F(i + 1, j), F(i, j + 1), F(i + 1, j), F(i + 1, j + 1), F(i, j + 1));
    idx.push(B(i, j), B(i, j + 1), B(i + 1, j), B(i + 1, j), B(i, j + 1), B(i + 1, j + 1));
  }
  for (let i = 0; i < nu; i++) {
    idx.push(F(i, 0), B(i, 0), F(i + 1, 0), F(i + 1, 0), B(i, 0), B(i + 1, 0));
    idx.push(F(i, nv), F(i + 1, nv), B(i, nv), F(i + 1, nv), B(i + 1, nv), B(i, nv));
  }
  for (let j = 0; j < nv; j++) {
    idx.push(F(0, j), F(0, j + 1), B(0, j), F(0, j + 1), B(0, j + 1), B(0, j));
    idx.push(F(nu, j), B(nu, j), F(nu, j + 1), F(nu, j + 1), B(nu, j), B(nu, j + 1));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (o.color) { g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); mat.vertexColors = true; }
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Tube aux bouts arrondis (membre, doigt, os simple). r0 -> r1.
export function limb(points, r0, r1, mat, o = {}) {
  const cap = o.cap !== undefined ? o.cap : 0.14;
  return tubeAlong(points, t => {
    let r = r0 + (r1 - r0) * t;
    if (o.bulge) r *= 1 + o.bulge * Math.sin(Math.PI * t);
    if (t < cap && !o.openStart) r *= Math.sqrt(1 - Math.pow(1 - t / cap, 2));
    if (t > 1 - cap && !o.openEnd) r *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + cap) / cap, 2)));
    return r;
  }, mat, { steps: o.steps || 22, segs: o.segs || 12, flat: o.flat });
}

// Os long : diaphyse fine, tetes renflees aux deux bouts.
export function bone(points, r, mat, o = {}) {
  const k = o.knob !== undefined ? o.knob : 0.75;
  return tubeAlong(points, t => {
    const e = Math.exp(-Math.pow(t / 0.13, 2)) + Math.exp(-Math.pow((1 - t) / 0.13, 2));
    let rr = r * (1 + k * e);
    const c = 0.06;
    if (t < c) rr *= Math.sqrt(1 - Math.pow(1 - t / c, 2));
    if (t > 1 - c) rr *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + c) / c, 2)));
    return rr;
  }, mat, { steps: o.steps || 26, segs: o.segs || 10 });
}

// Pointe / corne / griffe courbe : base en points[0], effilee jusqu au bout.
export function spike(points, r, mat, o = {}) {
  const m = tubeAlong(points, t => r * Math.pow(1 - t, o.pow || 0.8) + 0.002, mat, { steps: o.steps || 16, segs: o.segs || 10, flat: o.flat, shade: o.shade });
  return m;
}

// Couronne d une seule piece : bandeau evase a pointes.
// o.points, o.flare, o.thick, o.band (part du bandeau sous les pointes).
export function crownMesh(r, h, mat, o = {}) {
  const n = o.points || 5, flare = o.flare !== undefined ? o.flare : 0.22, th = o.thick || r * 0.12;
  const band = o.band !== undefined ? o.band : 0.42;
  const segs = n * 10;
  const pos = [], idx = [];
  for (let j = 0; j < segs; j++) {
    const a = (j / segs) * Math.PI * 2;
    const f = (j / segs * n) % 1;
    const tri = 1 - Math.abs(f - 0.5) * 2;
    const top = h * (band + (1 - band) * Math.pow(tri, 1.25));
    const c = Math.cos(a), s = Math.sin(a);
    const ro = r * (1 + flare * top / h), ri = ro - th;
    pos.push(c * r, 0, s * r, c * ro, top, s * ro, c * ri, top, s * ri, c * (r - th), 0, s * (r - th));
  }
  for (let j = 0; j < segs; j++) {
    const a = j * 4, b = ((j + 1) % segs) * 4;
    for (let k = 0; k < 4; k++) {
      const k1 = (k + 1) % 4;
      idx.push(a + k, a + k1, b + k, b + k, a + k1, b + k1);
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

// Cristal : prisme hexagonal a pointe, facettes franches. Base a l origine.
export function crystal(len, r, mat) {
  const pts = [new THREE.Vector2(0.0001, 0), new THREE.Vector2(r * 0.72, len * 0.04), new THREE.Vector2(r, len * 0.62), new THREE.Vector2(0.0001, len)];
  let g = new THREE.LatheGeometry(pts, 6);
  g = g.toNonIndexed();
  g.deleteAttribute('uv');
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Flamme / goutte : base ronde, pointe ondulee vers le haut.
export function flame(r, h, mat, o = {}) {
  const m = sculptSphere((d, out) => {
    const t = (d.y + 1) / 2;
    const w = Math.sin(Math.PI * Math.pow(1 - t, 0.62)) * (0.35 + 0.65 * (1 - t));
    out.set(d.x * r * w + (o.lean || 0) * t * t, -r * 0.55 + t * h + (t < 0.2 ? 0 : 0), d.z * r * w * (o.depth || 0.8) + (o.sway || 0) * Math.sin(t * 4) * t);
  }, mat, 16, 14);
  m.castShadow = false;
  return m;
}

// Yeux lumineux simples (orbite sombre + braise). Renvoie les meshes.
export function mark(m) { m.userData.noOutline = true; m.castShadow = false; return m; }
