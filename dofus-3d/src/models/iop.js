import * as THREE from 'three';

// Construit un Iop low-poly procedural et le renvoie sous forme de Group.
// L origine du group est le centre de la case (le perso pose ses pieds
// sur le sol y=0).
export function buildIop() {
  const group = new THREE.Group();

  const armorColor = 0xc0392b;
  const skinColor = 0xf4d3a5;
  const beltColor = 0x5a3a1a;
  const goldColor = 0xf1c40f;
  const capeColor = 0x7c1f17;
  const pantsColor = 0x3a2a14;
  const bootColor = 0x1a0d05;

  const bootGeom = new THREE.BoxGeometry(0.18, 0.1, 0.24);
  const bootMat = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.9 });
  for (const dx of [-0.12, 0.12]) {
    const boot = new THREE.Mesh(bootGeom, bootMat);
    boot.position.set(dx, 0.05, 0.04);
    boot.castShadow = true;
    group.add(boot);
  }

  const legGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10);
  const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(dx, 0.21, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  const torsoGeom = new THREE.CylinderGeometry(0.30, 0.22, 0.42, 14);
  const torsoMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.55 });
  const torso = new THREE.Mesh(torsoGeom, torsoMat);
  torso.position.y = 0.55;
  torso.castShadow = true;
  group.add(torso);

  const beltGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 14);
  const belt = new THREE.Mesh(beltGeom, new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.8 }));
  belt.position.y = 0.36;
  group.add(belt);
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.08, 0.04),
    new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.3, metalness: 0.6 })
  );
  buckle.position.set(0, 0.36, 0.30);
  group.add(buckle);

  const starGeom = new THREE.ConeGeometry(0.10, 0.04, 5);
  const star = new THREE.Mesh(starGeom, new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.5 }));
  star.position.set(0, 0.58, 0.28);
  star.rotation.x = Math.PI / 2;
  star.rotation.z = Math.PI;
  group.add(star);

  const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.40, 10);
  const armMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.55 });
  for (const dx of [-0.34, 0.34]) {
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(dx, 0.55, 0);
    arm.castShadow = true;
    group.add(arm);
  }
  const handGeom = new THREE.SphereGeometry(0.09, 10, 8);
  const handMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  for (const dx of [-0.34, 0.34]) {
    const hand = new THREE.Mesh(handGeom, handMat);
    hand.position.set(dx, 0.36, 0);
    hand.castShadow = true;
    group.add(hand);
  }

  const cape = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.66),
    new THREE.MeshStandardMaterial({ color: capeColor, side: THREE.DoubleSide, roughness: 0.75 })
  );
  cape.position.set(0, 0.55, -0.24);
  cape.rotation.x = 0.1;
  cape.castShadow = true;
  group.add(cape);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 14),
    new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 })
  );
  head.position.y = 0.95;
  head.castShadow = true;
  group.add(head);

  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.5 })
  );
  helm.position.y = 0.95;
  helm.castShadow = true;
  group.add(helm);

  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.022, 8, 24),
    new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.55 })
  );
  stripe.position.y = 0.91;
  stripe.rotation.x = Math.PI / 2;
  group.add(stripe);

  const feather = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.5, metalness: 0.4 })
  );
  feather.position.set(0, 1.22, 0);
  feather.rotation.z = 0.2;
  feather.castShadow = true;
  group.add(feather);

  const eyeGeom = new THREE.SphereGeometry(0.025, 8, 6);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  for (const dx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(eyeGeom, eyeMat);
    eye.position.set(dx, 0.96, 0.22);
    group.add(eye);
  }

  // Epee sur l epaule droite (visible meme en repos)
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.7, 0.015),
    new THREE.MeshStandardMaterial({ color: 0xdde3e8, roughness: 0.35, metalness: 0.7 })
  );
  blade.position.y = 0.5;
  blade.castShadow = true;
  sword.add(blade);
  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.05),
    new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.6 })
  );
  guard.position.y = 0.15;
  sword.add(guard);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 })
  );
  handle.position.y = 0.08;
  sword.add(handle);
  const pommel = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 8),
    new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.4, metalness: 0.6 })
  );
  pommel.position.y = 0.02;
  sword.add(pommel);
  sword.position.set(0.32, 0.72, -0.05);
  sword.rotation.z = -0.25;
  group.add(sword);

  return group;
}
