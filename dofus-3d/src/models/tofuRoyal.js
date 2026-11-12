import * as THREE from 'three';
import { buildTofu } from './tofu.js';
import { crown } from './monsterKitA.js';

// Tofu Royal : gros Tofu au plumage rouge royal et ventre dore, sourcils
// severes, longue queue en eventail, couronne d or posee de travers d ou
// sort sa houppette.
// Le Tofu agrandi reste le premier enfant du groupe (Rig.js anime ses
// pattes a travers ce sous-groupe).
export function buildTofuRoyal() {
  const group = new THREE.Group();

  const body = buildTofu({ royal: true });
  body.scale.setScalar(1.45);
  group.add(body);

  const c = crown(0.2, 0.2, { points: 5, flare: 0.28, valley: 0.45, cap: 0x8a1a2a });
  c.position.set(0.02, 1.16, 0.03);
  c.rotation.set(0.1, 0, -0.14);
  group.add(c);

  return group;
}
