import * as THREE from 'three';
import { buildTofu } from './tofu.js';

// Tofu Royal : Tofu agrandi, plumage vire au rouge royal, couronne
// doree et petite cape.
export function buildTofuRoyal() {
  const group = new THREE.Group();

  const body = buildTofu();
  body.scale.setScalar(1.45);
  // Teinte le plumage jaune en rouge royal.
  body.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.color) return;
    const c = o.material.color;
    // Jaune vif (0xf2c93a) et jaune sombre (0xd9a324) et ventre clair.
    if (c.r > 0.7 && c.g > 0.55 && c.b < 0.45) {
      o.material = o.material.clone();
      if (c.g > 0.72) o.material.color.setHex(0xe8b34a);  // ventre clair -> dore
      else if (c.g > 0.62) o.material.color.setHex(0xc0392b); // jaune vif -> rouge
      else o.material.color.setHex(0x8e2018);               // jaune sombre -> rouge fonce
    }
  });
  group.add(body);

  const gold = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.6, roughness: 0.3 });

  // Couronne au-dessus de la touffe (~0.95 * 1.45 ~ 1.38).
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.10, 12), gold);
  ring.position.y = 1.42;
  group.add(ring);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 6), gold);
    spike.position.set(Math.cos(a) * 0.19, 1.54, Math.sin(a) * 0.19);
    group.add(spike);
  }

  return group;
}
