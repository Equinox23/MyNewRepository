import * as THREE from 'three';
import { M, loft } from './kit.js';
import { buildCrapaud } from './crapaud.js';

// Crapaud Chef : crapaud plus gros, vert sombre et couvert de verrues,
// regard mauvais aux yeux orange, coiffe d un haut-de-forme cabosse a
// ruban rouge et boucle doree pose de travers entre les yeux.
export function buildCrapaudChef() {
  const group = new THREE.Group();

  const body = buildCrapaud({ chef: true });
  body.scale.setScalar(1.4);
  group.add(body);

  const hat = buildTopHat();
  hat.position.set(-0.03, 0.93, 0.16);
  hat.rotation.set(-0.1, 0, 0.16);
  group.add(hat);

  return group;
}

// Haut-de-forme d une seule piece : bord releve, tube evase vers le haut.
function buildTopHat() {
  const g = new THREE.Group();
  const black = M(0x1c1a22, { r: 0.5 });
  const brim = loft([
    [0.0, 0.2, 0.2], [0.012, 0.31, 0.31], [0.035, 0.335, 0.335], [0.06, 0.325, 0.325], [0.065, 0.2, 0.2],
  ], black, { segs: 28, sub: 3 });
  g.add(brim);
  const tube = loft([
    [0.03, 0.2], [0.14, 0.195], [0.3, 0.215], [0.42, 0.25], [0.445, 0.245], [0.455, 0.18],
  ], black, { segs: 28, sub: 4 });
  g.add(tube);
  const rib = loft([[0.062, 0.207], [0.1, 0.205], [0.15, 0.203]], M(0xc0392b, { r: 0.6 }), { segs: 28, sub: 2 });
  rib.userData.noOutline = true;
  g.add(rib);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.085, 0.03), M(0xf2c230, { r: 0.3, m: 0.6 }));
  buckle.position.set(0, 0.106, 0.2);
  buckle.userData.noOutline = true;
  g.add(buckle);
  return g;
}
