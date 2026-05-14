import * as THREE from 'three';
import { buildBouftou } from './bouftou.js';

// Bouftou Royal : la silhouette du Bouftou normal en plus grand, plus
// dore + une couronne d or a 5 epis sertis de gemmes posee sur la tete.
export function buildBouftouRoyal() {
  const group = new THREE.Group();

  // Base : un Bouftou ordinaire, scale 1.4 pour le faire ressortir.
  const body = buildBouftou();
  body.scale.setScalar(1.4);
  // Teinte plus doree : on recolore uniquement le jaune / fluffy de la
  // laine (les masques noirs, yeux rouges et cornes blanches restent
  // identifies par leurs valeurs RGB caracteristiques).
  body.traverse(o => {
    if (!o.isMesh || !o.material || !o.material.color) return;
    const c = o.material.color;
    // Repere la palette laine claire / jaune dans buildBouftou
    // (0xf1c40f vif et 0xfff3a0 clair) et la pousse vers un or plus vif.
    const isMainYellow = Math.abs(c.r - 0.945) < 0.05 && Math.abs(c.g - 0.769) < 0.05 && c.b < 0.20;
    const isLight = c.r > 0.95 && c.g > 0.85 && c.b > 0.50;
    if (isMainYellow) {
      o.material = o.material.clone();
      o.material.color.setHex(0xffc000);
    } else if (isLight) {
      o.material = o.material.clone();
      o.material.color.setHex(0xffe066);
    }
  });
  group.add(body);

  // Couronne d or posee au-dessus de la tete (qui se trouve a ~y=0.95
  // sur le Bouftou non-scale, soit ~1.33 apres scale 1.4).
  const crown = buildCrown();
  crown.position.y = 1.42;
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
