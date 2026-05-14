import * as THREE from 'three';
import { buildCrapaud } from './crapaud.js';

// Crapaud Chef : un crapaud plus gros, vert plus sombre, avec un chapeau
// haut-de-forme noir cercle d un ruban rouge.
export function buildCrapaudChef() {
  const group = new THREE.Group();

  // Base : crapaud scale 1.4, teinte plus sombre.
  const body = buildCrapaud();
  body.scale.setScalar(1.4);
  body.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.color) return;
    const c = o.material.color;
    // Repere les verts du corps et les fonce.
    if (c.r > 0.25 && c.g > 0.5 && c.b < 0.4) {
      o.material = o.material.clone();
      // Couleur courante = 0x4a8a3a ou 0x2f5a24 ou 0xccd66a (belly clair)
      if (c.b < 0.30) {
        // Vert principal -> plus sombre
        o.material.color.setHex(0x356a26);
      }
    }
  });
  group.add(body);

  // Chapeau haut de forme : cylindre fin noir + bord large + ruban rouge.
  const hat = buildTopHat();
  hat.position.y = 1.20;
  group.add(hat);

  return group;
}

function buildTopHat() {
  const g = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4, metalness: 0.1 });
  const ribbon = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.55, roughness: 0.3 });

  // Bord du chapeau (disque aplati)
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 24), black);
  brim.position.y = 0;
  brim.castShadow = true;
  g.add(brim);

  // Cylindre principal
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.36, 24), black);
  tube.position.y = 0.20;
  tube.castShadow = true;
  g.add(tube);

  // Sommet (legerement bombe)
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.04, 24), black);
  top.position.y = 0.40;
  g.add(top);

  // Ruban rouge a la base
  const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.07, 24), ribbon);
  rib.position.y = 0.06;
  g.add(rib);

  // Boucle doree devant
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), gold);
  buckle.position.set(0, 0.06, 0.22);
  g.add(buckle);

  return g;
}
