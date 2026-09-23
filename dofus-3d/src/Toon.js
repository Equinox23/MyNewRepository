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
  const data = new Uint8Array([
    120, 120, 120, 255,
    190, 190, 190, 255,
    255, 255, 255, 255,
  ]);
  _gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  _gradient.minFilter = THREE.NearestFilter;
  _gradient.magFilter = THREE.NearestFilter;
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
  return t;
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
  const outlineMat = outline ? makeOutlineMaterial(width, opts.color) : null;
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
    const hull = new THREE.Mesh(smoothedGeometry(mesh.geometry), outlineMat);
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
