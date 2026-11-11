import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Rendu "cartoon" facon Dofus : ombrage cel-shading en 3 paliers +
// contour sombre (technique de la coque inversee). Les modeles sont
// construits en MeshStandardMaterial, on les convertit apres coup.

// Rampe de lumiere : ombre / mi-ton / lumiere. Les paliers sont doux
// (pas de noir) pour garder les couleurs vives et chaudes de Dofus.
let _gradient = null;
export function toonGradient() {
  if (_gradient) return _gradient;
  // Rampe "peinte" : un aplat d ombre, un aplat de lumiere et une
  // transition courte mais douce entre les deux (plus de bandes dures
  // facon plastique).
  const N = 64;
  const data = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    const k = Math.min(1, Math.max(0, (x - 0.36) / 0.2));
    const e = k * k * (3 - 2 * k);
    const v = Math.round(132 + 123 * e);
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v; data[i * 4 + 3] = 255;
  }
  _gradient = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  _gradient.minFilter = THREE.LinearFilter;
  _gradient.magFilter = THREE.LinearFilter;
  _gradient.generateMipmaps = false;
  _gradient.needsUpdate = true;
  return _gradient;
}

// Convertit un materiau standard en MeshToonMaterial (en conservant
// couleur, emissif, texture, transparence).
export function toToonMaterial(m) {
  if (!m || m.isMeshToonMaterial || m.isMeshBasicMaterial) return m;
  if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return m;
  const color = m.color ? m.color.clone() : new THREE.Color(0xffffff);
  // Les pieces metalliques paraissent ternes sans reflets : on les eclaircit.
  if (m.metalness > 0.3) color.offsetHSL(0, 0.05, 0.06);
  const t = new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient(),
    map: m.map || null,
    transparent: m.transparent,
    opacity: m.opacity,
    side: m.side,
    depthWrite: m.depthWrite,
    vertexColors: m.vertexColors,
  });
  if (m.emissive) {
    t.emissive.copy(m.emissive);
    t.emissiveIntensity = m.emissiveIntensity;
  }
  t.name = m.name;
  paintedShading(t);
  return t;
}

// Finition "illustration" : les ombres tirent vers une teinte plus
// saturee et plus froide (au lieu de simplement s assombrir) et un fin
// liseré de lumiere souligne les silhouettes.
function paintedShading(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `{
        float lumB = max(dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15)), 0.04);
        float lumL = dot(outgoingLight - totalEmissiveRadiance, vec3(0.3, 0.55, 0.15));
        float lit = smoothstep(0.55, 1.0, lumL / lumB);
        vec3 deep = diffuseColor.rgb * diffuseColor.rgb * vec3(0.9, 0.82, 1.08) + diffuseColor.rgb * vec3(0.16, 0.1, 0.2);
        vec3 shadeCol = mix(deep * 1.15, outgoingLight, 0.45);
        outgoingLight = mix(shadeCol, outgoingLight, lit);
        float fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normalize(normal)), 0.0, 1.0), 3.0);
        outgoingLight += diffuseColor.rgb * fres * 0.35 * smoothstep(-0.2, 0.6, normalize(normal).y + 0.3);
      }
      #include <opaque_fragment>`
    );
  };
  mat.customProgramCacheKey = () => 'toon-painted';
}

// Materiau de contour : on pousse chaque sommet le long de sa normale
// (en espace vue, epaisseur constante quelle que soit l echelle du mesh)
// et on ne dessine que les faces arrieres.
export function makeOutlineMaterial(width = 0.022, color = 0x1c1208) {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  mat.userData.outlineWidth = { value: width };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.outlineWidth = mat.userData.outlineWidth;
    shader.vertexShader = 'uniform float outlineWidth;\n' + shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec3 outlineN = normalize(normalMatrix * normal);
      mvPosition.xyz += outlineN * outlineWidth;
      gl_Position = projectionMatrix * mvPosition;`
    );
  };
  mat.customProgramCacheKey = () => 'toon-outline';
  return mat;
}

// Couleur du trait pour une piece : sa teinte, tres assombrie, quantifiee
// pour limiter le nombre de materiaux.
const _hsl = { h: 0, s: 0, l: 0 };
export function outlineTint(color) {
  const c = new THREE.Color(0x1c1208);
  if (!color) return c;
  color.getHSL(_hsl);
  const h = Math.round(_hsl.h * 24) / 24;
  const s = Math.min(0.75, Math.round(_hsl.s * 4) / 4 * 0.9);
  const l = 0.06 + Math.round(_hsl.l * 4) / 4 * 0.09;
  return c.setHSL(h, s, l);
}

// Normales lissees (sommets fusionnes) : evite que le contour ne se
// fende sur les aretes vives des cubes / cones.
const _smoothCache = new WeakMap();
function smoothedGeometry(geom) {
  if (_smoothCache.has(geom)) return _smoothCache.get(geom);
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', geom.attributes.position.clone());
  if (geom.index) g.setIndex(geom.index.clone());
  g = mergeVertices(g, 1e-3);
  g.computeVertexNormals();
  _smoothCache.set(geom, g);
  return g;
}

function worldRadius(mesh) {
  const g = mesh.geometry;
  if (!g.boundingSphere) g.computeBoundingSphere();
  const s = new THREE.Vector3();
  mesh.getWorldScale(s);
  return g.boundingSphere.radius * Math.max(s.x, s.y, s.z);
}

// Applique le style cartoon a un modele : materiaux toon + contour sur
// les pieces assez grosses (les yeux, liseres fins restent sans contour
// pour ne pas devenir des taches noires).
export function toonify(root, opts = {}) {
  const width = opts.width !== undefined ? opts.width : 0.022;
  const minRadius = opts.minRadius !== undefined ? opts.minRadius : 0.07;
  const outline = opts.outline !== false;
  const matCache = new Map();
  // Contour teinte : une version tres sombre de la couleur de la piece
  // (comme le trait des illustrations Dofus) plutot qu un noir uniforme.
  const outlineCache = new Map();
  const outlineFor = (mat) => {
    if (opts.color !== undefined) {
      if (!outlineCache.has('fixed')) outlineCache.set('fixed', makeOutlineMaterial(width, opts.color));
      return outlineCache.get('fixed');
    }
    const c = outlineTint(mat.color);
    const key = c.getHex();
    if (!outlineCache.has(key)) outlineCache.set(key, makeOutlineMaterial(width, c));
    return outlineCache.get(key);
  };
  root.updateMatrixWorld(true);
  const meshes = [];
  root.traverse(o => { if (o.isMesh && !o.userData.isOutline) meshes.push(o); });
  for (const mesh of meshes) {
    const src = mesh.material;
    if (Array.isArray(src)) continue;
    let conv = matCache.get(src);
    if (!conv) {
      conv = toToonMaterial(src);
      matCache.set(src, conv);
      if (conv !== src) src.dispose();
    }
    mesh.material = conv;
    if (!outline || conv.isMeshBasicMaterial || conv.transparent || mesh.userData.noOutline) continue;
    if (!mesh.geometry || !mesh.geometry.attributes.position) continue;
    if (worldRadius(mesh) < minRadius) continue;
    const hull = new THREE.Mesh(smoothedGeometry(mesh.geometry), outlineFor(conv));
    hull.userData.isOutline = true;
    hull.castShadow = false;
    hull.receiveShadow = false;
    hull.raycast = () => {};
    mesh.add(hull);
  }
  return root;
}

// Fusionne un ensemble de decors statiques en quelques gros meshes (un
// par couleur) + un seul mesh de contour : divise drastiquement le
// nombre de draw calls (indispensable sur mobile avec des centaines
// d arbres autour du plateau).
export function bakeStatic(objects, opts = {}) {
  const width = opts.width !== undefined ? opts.width : 0.03;
  const minRadius = opts.minRadius !== undefined ? opts.minRadius : 0.06;
  const byColor = new Map();
  const outlineParts = [];
  for (const obj of objects) {
    obj.updateMatrixWorld(true);
    obj.traverse(o => {
      if (!o.isMesh || o.userData.isOutline || Array.isArray(o.material)) return;
      const m = o.material;
      if (m.transparent || m.map) return;
      const hex = m.color ? m.color.getHex() : 0xffffff;
      const key = hex + (m.emissive ? '_' + m.emissive.getHex() : '');
      let g = new THREE.BufferGeometry();
      g.setAttribute('position', o.geometry.attributes.position.clone());
      if (o.geometry.attributes.normal) g.setAttribute('normal', o.geometry.attributes.normal.clone());
      if (o.geometry.index) g.setIndex(o.geometry.index.clone());
      if (!g.index) g = mergeVertices(g, 1e-6);
      if (!g.attributes.normal) g.computeVertexNormals();
      g.applyMatrix4(o.matrixWorld);
      if (!byColor.has(key)) byColor.set(key, { mat: m, geoms: [] });
      byColor.get(key).geoms.push(g);
      if (worldRadius(o) >= minRadius) {
        const og = smoothedGeometry(o.geometry).clone();
        og.applyMatrix4(o.matrixWorld);
        outlineParts.push(og);
      }
    });
  }
  const out = new THREE.Group();
  for (const { mat, geoms } of byColor.values()) {
    const merged = mergeGeometries(geoms, false);
    geoms.forEach(g => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, toToonMaterial(mat));
    mesh.castShadow = !!opts.castShadow;
    mesh.receiveShadow = !!opts.receiveShadow;
    mesh.raycast = () => {};
    out.add(mesh);
  }
  if (outlineParts.length) {
    const merged = mergeGeometries(outlineParts, false);
    outlineParts.forEach(g => g.dispose());
    if (merged) {
      const hull = new THREE.Mesh(merged, makeOutlineMaterial(width, opts.color));
      hull.raycast = () => {};
      out.add(hull);
    }
  }
  // Libere les objets source (geometries / materiaux).
  for (const obj of objects) {
    obj.traverse(o => {
      if (o.isMesh && !o.userData.isOutline) {
        o.geometry.dispose();
        if (o.material && !Array.isArray(o.material)) o.material.dispose();
      }
    });
  }
  return out;
}
