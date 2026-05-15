import * as THREE from 'three';
import { buildChafer } from './chafer.js';

// Chafer Royal : officier squelette. Chafer agrandi, teinte d armure
// plus sombre/doree, cape et couronne d officier sur le casque.
export function buildChaferRoyal() {
  const group = new THREE.Group();

  const body = buildChafer();
  body.scale.setScalar(1.4);
  // Repere les plaques d armure (gris) et les teinte en bronze sombre.
  body.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.color) return;
    const c = o.material.color;
    if (c.r > 0.18 && c.r < 0.30 && Math.abs(c.r - c.g) < 0.06) {
      o.material = o.material.clone();
      o.material.color.setHex(0x4a3a1c);
      o.material.metalness = 0.7;
    }
  });
  group.add(body);

  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.6, roughness: 0.3 });
  const capeMat = new THREE.MeshStandardMaterial({ color: 0x5a1414, roughness: 0.85, side: THREE.DoubleSide });

  // Couronne sur le sommet du casque (~1.42 * 1.4 = 1.99).
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.10, 12), gold);
  crownBase.position.y = 2.05;
  group.add(crownBase);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), gold);
    spike.position.set(Math.cos(a) * 0.17, 2.17, Math.sin(a) * 0.17);
    group.add(spike);
  }

  // Cape dans le dos.
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.25, 3, 3), capeMat);
  cape.position.set(0, 1.05, -0.36);
  cape.castShadow = true;
  group.add(cape);

  return group;
}
