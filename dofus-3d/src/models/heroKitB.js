import * as THREE from 'three';
import { tubeAlong } from './kit.js';

// ===========================================================================
// Outils partages par les heros "animaux / fee" (Ecaflip, Pandawa,
// Eniripsa) refondus sur buildHero :
//  - makeAt   : fonction de surface (x, y) -> point de la face avant d un
//               ou plusieurs maillages (crane + museau, buste + tunique) ;
//  - patch    : motif plat epousant une surface (tache de pelage, plastron
//               de chemise, joue rose) : pas de contour, pas d ombre ;
//  - ellipse  : contour d ellipse pour patch ;
//  - line     : trait epais epousant une surface (lisere, bouche, rayure) ;
//  - heart    : coeur bombe ; detail : marque un maillage "sans contour".
// ===========================================================================

export const detail = (m) => { m.userData.noOutline = true; m.castShadow = false; return m; };

// Les maillages doivent partager le meme repere parent ; le point renvoye
// est exprime dans ce repere.
export function makeAt(meshes) {
  const ray = new THREE.Raycaster();
  const from = new THREE.Vector3(), dir = new THREE.Vector3(0, 0, -1);
  return (x, y, lift = 0) => {
    for (const m of meshes) { m.updateMatrix(); m.matrixWorld.copy(m.matrix); }
    ray.set(from.set(x, y, 5), dir);
    const hit = ray.intersectObjects(meshes, false)[0];
    const p = hit ? hit.point.clone() : new THREE.Vector3(x, y, 0);
    p.z += lift;
    return p;
  };
}

export function ellipse(cx, cy, rx, ry, rot = 0, n = 22) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

// outline : contour ferme [[x, y], ...] dans le sens trigonometrique (vu
// de face). o.lift : decollement ; o.rings : anneaux concentriques.
export function patch(at, outline, mat, o = {}) {
  const lift = o.lift !== undefined ? o.lift : 0.004, rings = o.rings || 4;
  const n = outline.length;
  let cx = 0, cy = 0;
  for (const p of outline) { cx += p[0] / n; cy += p[1] / n; }
  if (o.center) { cx = o.center[0]; cy = o.center[1]; }
  const pos = [], idx = [];
  const push = (v) => pos.push(v.x, v.y, v.z);
  push(at(cx, cy, lift));
  for (let k = 1; k <= rings; k++) {
    const t = k / rings;
    for (let i = 0; i < n; i++) {
      push(at(cx + (outline[i][0] - cx) * t, cy + (outline[i][1] - cy) * t, k === rings ? lift * 0.25 : lift));
    }
  }
  for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + (i + 1) % n);
  for (let k = 1; k < rings; k++) {
    const a0 = 1 + (k - 1) * n, b0 = 1 + k * n;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(a0 + i, b0 + i, b0 + j, a0 + i, b0 + j, a0 + j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return detail(new THREE.Mesh(g, mat));
}

// Trait sur une surface : pts = [[x, y], ...], r = rayon ou fonction de t.
export function line(at, pts, r, mat, o = {}) {
  const lift = o.lift !== undefined ? o.lift : 0.004;
  const P = pts.map(p => at(p[0], p[1], lift));
  const rad = typeof r === 'function' ? r : (t) => r * (0.5 + 0.5 * Math.sin(Math.PI * t));
  return detail(tubeAlong(P, rad, mat, { steps: o.steps || 18, segs: 6, flat: o.flat || 1 }));
}

// Coeur bombe (largeur ~ s), centre a l origine, face vers +z.
export function heart(s, depth, mat) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.48 * s);
  sh.bezierCurveTo(-0.95 * s, 0.1 * s, -0.5 * s, 0.72 * s, 0, 0.26 * s);
  sh.bezierCurveTo(0.5 * s, 0.72 * s, 0.95 * s, 0.1 * s, 0, -0.48 * s);
  const bev = Math.min(depth * 0.9, s * 0.12);
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 12 });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}
