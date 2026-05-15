import * as THREE from 'three';
import { buildChampignon } from './champignon.js';

// Champignon Royal : Champignon agrandi, chapeau pourpre royal, et une
// couronne d epines sporiferes.
export function buildChampignonRoyal() {
  const group = new THREE.Group();

  const body = buildChampignon();
  body.scale.setScalar(1.4);
  // Teinte le chapeau rouge-brun en pourpre royal.
  body.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.color) return;
    const c = o.material.color;
    if (c.r > 0.35 && c.r < 0.62 && c.g < 0.30 && c.b < 0.28) {
      o.material = o.material.clone();
      o.material.color.setHex(c.r > 0.5 ? 0x6c3aa8 : 0x4a2374);
    }
  });
  group.add(body);

  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.55, roughness: 0.35 });
  const sporeMat = new THREE.MeshStandardMaterial({ color: 0x9be86a, emissive: 0x4a8a2a, emissiveIntensity: 0.6, roughness: 0.6 });

  // Couronne posee sur le chapeau (sommet ~1.06 * 1.4 ~ 1.48).
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.10, 14), gold);
  band.position.y = 1.54;
  group.add(band);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), gold);
    spike.position.set(Math.cos(a) * 0.21, 1.66, Math.sin(a) * 0.21);
    group.add(spike);
    // Petite spore lumineuse au bout d une epine sur deux
    if (i % 2 === 0) {
      const spore = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), sporeMat);
      spore.position.set(Math.cos(a) * 0.21, 1.76, Math.sin(a) * 0.21);
      group.add(spore);
    }
  }

  return group;
}
