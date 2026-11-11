import * as THREE from 'three';
import { toonGradient } from './Toon.js';

// ===========================================================================
// Terrain vivant : plateau en relief (ile aux flancs rocheux), eau animee
// (reflets, ecume sur les berges, chutes), herbe et feuillages au vent.
// ===========================================================================

// Horloge et force du vent partagees par tous les shaders du decor.
export const WIND = { uTime: { value: 0 }, uWind: { value: 1 } };

// Debord du plateau autour des cases de combat et hauteur des flancs.
export const RIM = 0.62;
export const DROP = 0.62;
// Avancee de l eau au-dela du bord (la ou elle tombe).
const LIP = 0.13;

const STYLE_EDGE = {
  forest:    { grass: 0x5f9c3c, earth: 0x6a4a2c, rock: 0x8a7458, rockDk: 0x5c4a38 },
  river:     { grass: 0x5c9a40, earth: 0x66492c, rock: 0x86786a, rockDk: 0x565048 },
  graveyard: { grass: 0x54563a, earth: 0x3a3430, rock: 0x5a5866, rockDk: 0x38364a },
  cliff:     { grass: 0xa8a05a, earth: 0x8a6a44, rock: 0xb09a78, rockDk: 0x7a6650 },
  swamp:     { grass: 0x4f7232, earth: 0x3c3420, rock: 0x565840, rockDk: 0x34382a },
};

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Contour du plateau : carre aux coins arrondis, centre sur `center`.
function outline(center, half, radius, perCorner = 8, perSide = 14) {
  const pts = [];
  const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
  for (let k = 0; k < 4; k++) {
    const [sx, sz] = corners[k];
    const cx = center + sx * (half - radius), cz = center + sz * (half - radius);
    const a0 = k * Math.PI / 2;
    for (let i = 0; i <= perCorner; i++) {
      const a = a0 + (i / perCorner) * Math.PI / 2;
      pts.push({ x: cx + Math.cos(a) * radius, z: cz + Math.sin(a) * radius, nx: Math.cos(a), nz: Math.sin(a) });
    }
    // Cote droit jusqu au coin suivant.
    const [nsx, nsz] = corners[(k + 1) % 4];
    const ex = center + nsx * (half - radius), ez = center + nsz * (half - radius);
    const a1 = a0 + Math.PI / 2;
    const p0 = { x: cx + Math.cos(a1) * radius, z: cz + Math.sin(a1) * radius };
    const p1 = { x: ex + Math.cos(a1) * radius, z: ez + Math.sin(a1) * radius };
    for (let i = 1; i < perSide; i++) {
      const t = i / perSide;
      pts.push({ x: p0.x + (p1.x - p0.x) * t, z: p0.z + (p1.z - p0.z) * t, nx: Math.cos(a1), nz: Math.sin(a1) });
    }
  }
  return pts;
}

// Dessus du plateau : eventail de triangles texture par la peinture du sol.
// La texture couvre `units` unites monde a partir de (-0.5 - margin).
export function buildIslandTop(n, texture, units, margin, y = 0.05) {
  const center = (n - 1) / 2, half = n / 2 + RIM;
  const pts = outline(center, half, 0.9);
  const pos = [center, y, center], uv = [], idx = [];
  const toUv = (x, z) => [(x + 0.5 + margin) / units, 1 - (z + 0.5 + margin) / units];
  uv.push(...toUv(center, center));
  for (const p of pts) { pos.push(p.x, y, p.z); uv.push(...toUv(p.x, p.z)); }
  for (let i = 0; i < pts.length; i++) idx.push(0, 1 + ((i + 1) % pts.length), 1 + i);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshToonMaterial({ map: texture, gradientMap: toonGradient(), transparent: true, alphaTest: 0.02, depthWrite: true }));
  mesh.receiveShadow = true;
  mesh.renderOrder = -1;
  mesh.raycast = () => {};
  return mesh;
}

// Flancs du plateau : levre d herbe, terre, strates de roche, eboulis.
export function buildIslandSkirt(n, style) {
  const C = STYLE_EDGE[style] || STYLE_EDGE.forest;
  const center = (n - 1) / 2, half = n / 2 + RIM;
  const pts = outline(center, half, 0.9);
  const rings = [
    { y: 0.05, off: 0.0, col: C.grass, jit: 0 },
    { y: -0.03, off: 0.07, col: C.grass, jit: 0.02 },
    { y: -0.1, off: 0.0, col: C.earth, jit: 0.02 },
    { y: -0.3, off: -0.04, col: C.rock, jit: 0.06 },
    { y: -0.47, off: 0.03, col: C.rockDk, jit: 0.07 },
    { y: -DROP - 0.03, off: 0.2, col: C.rockDk, jit: 0.1 },
  ];
  const pos = [], col = [], idx = [];
  const c = new THREE.Color();
  const N = pts.length;
  for (let r = 0; r < rings.length; r++) {
    const R = rings[r];
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const j = (hash2(i * 1.7, r * 9.1) - 0.5) * 2 * R.jit;
      pos.push(p.x + p.nx * (R.off + j), R.y + (r >= 3 ? (hash2(i, r) - 0.5) * 0.05 : 0), p.z + p.nz * (R.off + j));
      c.setHex(R.col);
      // Colonnes de roche plus ou moins claires : strates irregulieres.
      const v = r >= 2 ? 0.82 + hash2(Math.floor(i / 2) * 3.3, r) * 0.36 : 0.94 + hash2(i, 5) * 0.12;
      col.push(c.r * v, c.g * v, c.b * v);
    }
  }
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < N; i++) {
      const a = r * N + i, b = r * N + (i + 1) % N, d = (r + 1) * N + i, e = (r + 1) * N + (i + 1) % N;
      idx.push(a, b, d, b, e, d);
    }
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g = g.toNonIndexed();
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() }));
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.raycast = () => {};
  return mesh;
}

// ---------------------------------------------------------------------------
// EAU
// ---------------------------------------------------------------------------
const WATER_VERT = `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const WATER_FRAG = `
precision highp float;
varying vec3 vWorld;
uniform float uTime; uniform vec2 uFlow; uniform sampler2D uDist; uniform float uSize;
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam; uniform float uMurky; uniform float uLight;
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
// Cellules de Voronoi : x = distance au bord de cellule, y = alea de cellule.
vec2 voronoi(vec2 x, float t) {
  vec2 n = floor(x), f = fract(x);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 o = hash22(n + g);
    vec2 r = g + 0.5 + 0.4 * sin(t + 6.2831 * o) - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; id = o.x; } else if (d < f2) { f2 = d; }
  }
  return vec2(sqrt(f2) - sqrt(f1), id);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash22(i).x, b = hash22(i + vec2(1.0, 0.0)).x, c = hash22(i + vec2(0.0, 1.0)).x, d = hash22(i + vec2(1.0, 1.0)).x;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main() {
  vec2 p = vWorld.xz;
  // 0 sur la berge -> 1 au large.
  float d = texture2D(uDist, (p + 0.5) / uSize).r;
  vec2 flow = uFlow * uTime;
  float wob = noise(p * 2.3 + vec2(uTime * 0.35, -uTime * 0.27));
  // Fond : du turquoise des hauts-fonds au bleu profond.
  vec3 col = mix(uShallow, uDeep, smoothstep(0.08, 0.85, d + (wob - 0.5) * 0.18));
  // Reflets : deux nappes de cellules qui glissent avec le courant.
  vec2 v1 = voronoi(p * 1.35 - flow * 0.55, uTime * 0.8);
  vec2 v2 = voronoi(p * 2.4 + 7.3 - flow * 0.9, uTime * 1.1 + 2.0);
  float lines = smoothstep(0.06, 0.0, v1.x) * 0.45 + smoothstep(0.05, 0.0, v2.x) * 0.22;
  col += (uFoam - col) * lines * mix(0.55, 0.22, uMurky);
  // Larges bandes claires qui derivent.
  float band = smoothstep(0.55, 0.9, noise(p * vec2(0.9, 0.9) - flow * 0.4 + 11.0));
  col = mix(col, uShallow * 1.12, band * 0.25);
  // Ecume : lisere blanc ondulant contre la berge + second lisere mobile.
  float edge = d + (wob - 0.5) * 0.09;
  float foam = smoothstep(0.17, 0.11, edge);
  float ring = smoothstep(0.035, 0.0, abs(edge - 0.27 - 0.05 * sin(uTime * 1.3 + p.x * 1.7 + p.y * 1.3)));
  col = mix(col, uFoam, clamp(foam + ring * 0.6, 0.0, 1.0) * mix(1.0, 0.45, uMurky));
  // Scintillements (depassent 1.0 : repris par le halo lumineux).
  float sp = pow(noise(p * 7.0 + vec2(uTime * 0.7, uTime * 0.5)), 30.0) * step(0.3, d);
  col += vec3(1.0, 1.0, 0.92) * sp * 22.0 * (1.0 - uMurky * 0.7);
  gl_FragColor = vec4(col * uLight, 0.94);
  #include <colorspace_fragment>
}`;

// Champ de distance a la berge (0 = terre, 1 = a deux cases ou plus).
function shoreTexture(grid) {
  const n = grid.length, res = 8, size = n * res;
  const data = new Uint8Array(size * size * 4);
  const isWater = (c, r) => c < 0 || r < 0 || c >= n || r >= n || grid[r][c] === 2 || grid[r][c] === 3;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5) / res, z = (py + 0.5) / res;
      const c0 = Math.floor(x), r0 = Math.floor(z);
      let best = 2.2;
      for (let r = r0 - 3; r <= r0 + 3; r++) {
        for (let c = c0 - 3; c <= c0 + 3; c++) {
          if (isWater(c, r)) continue;
          const dx = Math.max(c - x, 0, x - (c + 1)), dz = Math.max(r - z, 0, z - (r + 1));
          const dd = Math.hypot(dx, dz);
          if (dd < best) best = dd;
        }
      }
      const v = Math.round(Math.min(1, best / 2.2) * 255);
      const i = (py * size + px) * 4;
      data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Surface d eau unique couvrant toutes les cases d eau (et sous les ponts),
// prolongee jusqu au bord du plateau pour les cases en lisiere.
export function buildWater(grid, config, light = 1) {
  const n = grid.length;
  const wet = (c, r) => c >= 0 && r >= 0 && c < n && r < n && (grid[r][c] === 2 || grid[r][c] === 3);
  const pos = [], idx = [];
  const quad = (x0, z0, x1, z1) => {
    const b = pos.length / 3;
    pos.push(x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1);
    idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
  };
  let any = false;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!wet(c, r)) continue;
      any = true;
      const x0 = c - 0.5 - (c === 0 ? RIM + LIP : 0), x1 = c + 0.5 + (c === n - 1 ? RIM + LIP : 0);
      const z0 = r - 0.5 - (r === 0 ? RIM + LIP : 0), z1 = r + 0.5 + (r === n - 1 ? RIM + LIP : 0);
      quad(x0, z0, x1, z1);
    }
  }
  if (!any) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  const murky = !!config.murkyWater;
  const flow = config.flow || { x: 0.05, z: 0.04 };
  const mat = new THREE.ShaderMaterial({
    vertexShader: WATER_VERT, fragmentShader: WATER_FRAG, transparent: true, depthWrite: false,
    uniforms: {
      uTime: WIND.uTime, uFlow: { value: new THREE.Vector2(flow.x, flow.z) },
      uDist: { value: shoreTexture(grid) }, uSize: { value: n },
      uDeep: { value: new THREE.Color(murky ? 0x2c4424 : 0x1a6c9c) },
      uShallow: { value: new THREE.Color(murky ? 0x5c7c3a : 0x4cc4d8) },
      uFoam: { value: new THREE.Color(murky ? 0xb8cc8a : 0xf4fbff) },
      uMurky: { value: murky ? 1 : 0 }, uLight: { value: light },
    },
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.y = -0.03;
  mesh.renderOrder = -2;
  mesh.raycast = () => {};
  mesh.userData.baked = true;
  return mesh;
}

// Rideau d eau qui tombe (cascade et bords du plateau).
const FALL_FRAG = `
precision highp float;
varying vec2 vUv; varying vec3 vWorld;
uniform float uTime; uniform vec3 uColor; uniform vec3 uFoam; uniform float uLight;
float hash(float n) { return fract(sin(n) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0;
  return mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
}
void main() {
  float x = vWorld.x * 1.7 + vWorld.z * 1.7;
  float y = vWorld.y;
  // Filets d eau verticaux qui defilent vers le bas.
  float s1 = noise(vec2(x * 3.0, y * 1.4 + uTime * 2.6));
  float s2 = noise(vec2(x * 7.0 + 3.0, y * 2.6 + uTime * 4.2));
  float streak = smoothstep(0.5, 0.85, s1 * 0.65 + s2 * 0.45);
  vec3 col = mix(uColor, uFoam, streak * 0.8);
  // Levre blanche en haut, ecume en bas.
  col = mix(col, uFoam, smoothstep(0.88, 1.0, vUv.y) * 0.9);
  col = mix(col, uFoam, smoothstep(0.22, 0.0, vUv.y) * (0.6 + 0.4 * s2));
  gl_FragColor = vec4(col * uLight, 0.9);
  #include <colorspace_fragment>
}`;
const FALL_VERT = `
varying vec2 vUv; varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export function fallMaterial(murky = false, light = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: FALL_VERT, fragmentShader: FALL_FRAG, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: {
      uTime: WIND.uTime,
      uColor: { value: new THREE.Color(murky ? 0x4a6a34 : 0x3aa4d0) },
      uFoam: { value: new THREE.Color(murky ? 0xb8cc8a : 0xf2fbff) },
      uLight: { value: light },
    },
  });
}

// Chutes d eau la ou la riviere atteint le bord du plateau. `skip` : cotes
// a ignorer ('n', 's', 'w', 'e'). Renvoie { group, feet } (pieds de chute).
export function buildEdgeFalls(grid, config, skip = [], light = 1) {
  const n = grid.length;
  const wet = (c, r) => grid[r][c] === 2 || grid[r][c] === 3;
  const group = new THREE.Group();
  const mat = fallMaterial(!!config.murkyWater, light);
  const foamMat = new THREE.MeshBasicMaterial({ color: config.murkyWater ? 0xb8cc8a : 0xf2fbff, transparent: true, opacity: 0.75, depthWrite: false });
  const feet = [];
  const h = DROP + 0.02;
  const add = (x, z, rotY) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, h), mat);
    m.position.set(x, -0.03 - h / 2, z);
    m.rotation.y = rotY;
    m.raycast = () => {};
    group.add(m);
    const foam = new THREE.Mesh(new THREE.CircleGeometry(0.62, 14), foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(x + Math.sin(rotY) * 0.25, -DROP + 0.012, z + Math.cos(rotY) * 0.25);
    foam.scale.set(1, 0.7, 1);
    group.add(foam);
    feet.push({ x: foam.position.x, y: -DROP, z: foam.position.z });
  };
  const e = n / 2 + RIM + LIP, c0 = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    if (!skip.includes('s') && wet(i, n - 1)) add(i, c0 + e, 0);
    if (!skip.includes('n') && wet(i, 0)) add(i, c0 - e, Math.PI);
    if (!skip.includes('e') && wet(n - 1, i)) add(c0 + e, i, Math.PI / 2);
    if (!skip.includes('w') && wet(0, i)) add(c0 - e, i, -Math.PI / 2);
  }
  group.userData.baked = true;
  return { group, feet };
}

// ---------------------------------------------------------------------------
// HERBE : un seul maillage instancie, anime par le vent dans le shader.
// ---------------------------------------------------------------------------
const GRASS_VERT = `
uniform float uTime; uniform float uWind;
varying vec3 vColor;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  float h = clamp(position.y / 0.28, 0.0, 1.0);
  float ph = wp.x * 0.85 + wp.z * 1.15;
  float gust = sin(uTime * 0.8 + wp.x * 0.25 + wp.z * 0.18);
  float sway = (sin(uTime * 2.4 + ph) * 0.06 + gust * 0.07) * uWind;
  wp.x += sway * h * h;
  wp.z += sway * 0.6 * h * h;
  vColor = instanceColor * mix(0.62, 1.18, h);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const GRASS_FRAG = `
precision highp float;
uniform float uLight;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor * uLight, 1.0);
  #include <colorspace_fragment>
}`;

function bladeGeometry() {
  // Brin effile en 3 troncons, legerement courbe.
  const w = 0.05, hs = [0, 0.1, 0.2, 0.28], ws = [1, 0.8, 0.5, 0.0], zs = [0, 0.01, 0.035, 0.07];
  const pos = [], idx = [];
  for (let i = 0; i < 4; i++) pos.push(-w * ws[i] / 2, hs[i], zs[i], w * ws[i] / 2, hs[i], zs[i]);
  for (let i = 0; i < 3; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// `spots` : [{ x, z, n, spread, scale }] touffes a planter.
export function buildGrass(spots, colors, light = 1, seed = 1) {
  let total = 0;
  for (const s of spots) total += s.n;
  if (!total) return null;
  const mat = new THREE.ShaderMaterial({
    vertexShader: GRASS_VERT, fragmentShader: GRASS_FRAG, side: THREE.DoubleSide,
    uniforms: { uTime: WIND.uTime, uWind: WIND.uWind, uLight: { value: light } },
  });
  const mesh = new THREE.InstancedMesh(bladeGeometry(), mat, total);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const col = new THREE.Color();
  let k = 0;
  for (const s of spots) {
    for (let i = 0; i < s.n; i++) {
      const a = hash2(s.x * 3.1 + i, s.z * 5.7 + seed) * Math.PI * 2;
      const d = Math.sqrt(hash2(s.x + i * 1.3, s.z - i * 2.1 + seed)) * s.spread;
      p.set(s.x + Math.cos(a) * d, s.y !== undefined ? s.y : 0.05, s.z + Math.sin(a) * d);
      e.set((hash2(i, s.x + s.z) - 0.5) * 0.5, hash2(s.z + i, s.x) * Math.PI * 2, (hash2(s.x - i, s.z) - 0.5) * 0.5);
      q.setFromEuler(e);
      const h = (0.7 + hash2(i * 7.7, s.x * s.z + 1.0) * 0.8) * (s.scale || 1);
      sc.set(h * 0.9 + 0.3, h, h * 0.9 + 0.3);
      m.compose(p, q, sc);
      mesh.setMatrixAt(k, m);
      col.setHex(colors[Math.floor(hash2(i + 0.5, s.x * 2.0 + s.z) * colors.length) % colors.length]);
      mesh.setColorAt(k, col);
      k++;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.raycast = () => {};
  mesh.userData.baked = true;
  return mesh;
}

// ---------------------------------------------------------------------------
// VENT sur le decor fusionne (arbres, buissons, roseaux) : les sommets
// oscillent d autant plus qu ils sont hauts. S applique aussi au contour.
// ---------------------------------------------------------------------------
const SWAY = `
  {
    float swayH = clamp(transformed.y - 0.45, 0.0, 3.2);
    float swayP = transformed.x * 0.33 + transformed.z * 0.27;
    float swayG = sin(uTime * 0.8 + transformed.x * 0.12 + transformed.z * 0.1);
    transformed.x += (sin(uTime * 1.5 + swayP) * 0.028 + swayG * 0.03) * swayH * uWind;
    transformed.z += (cos(uTime * 1.2 + swayP * 1.3) * 0.02 + swayG * 0.018) * swayH * uWind;
  }`;

export function applyWind(root) {
  root.traverse(o => {
    if (!o.isMesh || !o.material || o.material.userData.windy) return;
    const mat = o.material;
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader, renderer) => {
      if (prev) prev.call(mat, shader, renderer);
      shader.uniforms.uTime = WIND.uTime;
      shader.uniforms.uWind = WIND.uWind;
      shader.vertexShader = 'uniform float uTime;\nuniform float uWind;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>', '#include <begin_vertex>\n' + SWAY);
    };
    const prevKey = mat.customProgramCacheKey ? mat.customProgramCacheKey() : '';
    mat.customProgramCacheKey = () => prevKey + '-wind';
    mat.userData.windy = true;
    mat.needsUpdate = true;
  });
}
