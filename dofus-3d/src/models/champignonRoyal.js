import * as THREE from 'three';
import { buildChampignon } from './champignon.js';

// Champignon Royal : vieux roi mycelien. Champignon agrandi (sous-groupe
// mis a l echelle), chapeau pourpre a verrues dorees, couronne de
// travers a spores lumineuses, collerette d or et grosse moustache.
export function buildChampignonRoyal() {
  const group = new THREE.Group();
  const body = buildChampignon({ royal: true });
  body.scale.setScalar(1.4);
  group.add(body);
  return group;
}
