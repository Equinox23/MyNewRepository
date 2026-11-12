import * as THREE from 'three';
import { buildChafer } from './chafer.js';

// Chafer Royal : roi squelette. Chafer agrandi (sous-groupe mis a
// l echelle, meme squelette d animation), couronne a rubis, cape pourpre
// en lambeaux a col de fourrure, epaulieres et rondache dorees, grande
// epee, orbites rougeoyantes.
export function buildChaferRoyal() {
  const group = new THREE.Group();
  const body = buildChafer({ royal: true });
  body.scale.setScalar(1.4);
  group.add(body);
  return group;
}
