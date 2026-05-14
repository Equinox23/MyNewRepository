import * as THREE from 'three';

// Bombe posee par le Roublard : sphere noire metalisee, goulot
// metallique en haut, meche courbee avec etincelle qui brille.
export function buildBombeRoublard() {
  const group = new THREE.Group();

  const bombMat = new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.45, metalness: 0.55 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: 0.5, metalness: 0.7 });
  const fuseMat = new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.9 });
  const sparkMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xff8a00, emissiveIntensity: 1.1, roughness: 0.3 });
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xff8a00, transparent: true, opacity: 0.45 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xb0b8c0 });

  // Corps : sphere principale.
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), bombMat);
  body.position.y = 0.34;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Reflet metallique pour donner du relief.
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glintMat);
  glint.position.set(-0.13, 0.48, 0.18);
  group.add(glint);
  const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), glintMat);
  glint2.position.set(0.10, 0.30, 0.22);
  group.add(glint2);

  // Bandeau metal autour de l equateur de la bombe.
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 24), metalMat);
  belt.position.y = 0.34;
  belt.rotation.x = Math.PI / 2;
  group.add(belt);

  // Goulot metallique.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.10, 14), metalMat);
  neck.position.y = 0.70;
  group.add(neck);

  // Embout (cap superieur).
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 14), metalMat);
  cap.position.y = 0.77;
  group.add(cap);

  // Meche legerement courbee (3 segments).
  const fuse = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 8), fuseMat);
    seg.position.set(0.025 * i, 0.80 + i * 0.06, 0);
    seg.rotation.z = -0.35 - i * 0.06;
    fuse.add(seg);
  }
  group.add(fuse);

  // Etincelle avec halo : doit se voir bien dans la nuit / l ombre.
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), sparkMat);
  spark.position.set(0.09, 0.99, 0);
  group.add(spark);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), haloMat);
  halo.position.set(0.09, 0.99, 0);
  group.add(halo);

  return group;
}
