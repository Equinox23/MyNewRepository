import * as THREE from 'three';
import { buildBouftou } from './bouftou.js';

// Bouftou Royal : la silhouette du Bouftou en plus grand, laine creme
// a reflets dores + une couronne d or a 5 epis sertis de gemmes.
export function buildBouftouRoyal() {
  const group = new THREE.Group();

  // Base : un Bouftou en version Royal (laine creme, cornes dorees),
  // agrandi pour le faire ressortir.
  const body = buildBouftou({ royal: true });
  body.scale.setScalar(1.4);
  group.add(body);

  // Couronne d or posee sur le toupet (y~1.02 sur le Bouftou normal).
  const crown = buildCrown();
  crown.position.set(0, 1.5, 0.1);
  crown.rotation.x = 0.12;
  group.add(crown);

  return group;
}

function buildCrown() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700, metalness: 0.65, roughness: 0.28,
  });

  // Bandeau
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 18, 1, false),
    goldMat
  );
  band.castShadow = true;
  group.add(band);

  // 5 epis avec gemmes alternees
  const gemColors = [0xc0392b, 0x3498db, 0x27ae60, 0x9b59b6, 0xf39c12];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.20, 6),
      goldMat
    );
    spike.position.set(Math.cos(angle) * 0.22, 0.16, Math.sin(angle) * 0.22);
    spike.castShadow = true;
    group.add(spike);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.035),
      new THREE.MeshStandardMaterial({
        color: gemColors[i], metalness: 0.5, roughness: 0.15,
      })
    );
    gem.position.set(Math.cos(angle) * 0.22, 0.28, Math.sin(angle) * 0.22);
    group.add(gem);
  }

  // Gros rubis central
  const ruby = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.07),
    new THREE.MeshStandardMaterial({
      color: 0xe74c3c, metalness: 0.6, roughness: 0.12,
    })
  );
  ruby.position.y = 0.18;
  ruby.castShadow = true;
  group.add(ruby);

  return group;
}
