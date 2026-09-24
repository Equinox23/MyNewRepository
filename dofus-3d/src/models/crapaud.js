import * as THREE from 'three';
import { addEyes, mouth as mouthArc } from './kit.js';

// Crapaud : grosse boule verte aplatie, gros yeux protruberants, 4 pattes,
// bouche large. Style cartoon assume.
export function buildCrapaud() {
  const group = new THREE.Group();

  const body = 0x4a8a3a;
  const bodyDark = 0x2f5a24;
  const belly = 0xccd66a;
  const eye = 0xffffff;
  const pupil = 0x1a1a1a;
  const mouth = 0x3a2010;

  const bodyMat = new THREE.MeshStandardMaterial({ color: body, roughness: 0.85, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: bodyDark, roughness: 0.9, flatShading: true });
  const bellyMat = new THREE.MeshStandardMaterial({ color: belly, roughness: 0.85, flatShading: true });
  const eyeMat = new THREE.MeshStandardMaterial({ color: eye, roughness: 0.4 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: pupil });

  // -- Corps : sphere aplatie --
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12), bodyMat);
  bodyMesh.position.y = 0.32;
  bodyMesh.scale.set(1.05, 0.7, 1.1);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // -- Ventre claire (sous le corps) --
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), bellyMat);
  bellyMesh.position.y = 0.18;
  bellyMesh.scale.set(0.95, 0.5, 0.95);
  group.add(bellyMesh);

  // -- Verrues (4 petites bosses sur le dos) --
  const wartMat = new THREE.MeshStandardMaterial({ color: bodyDark, roughness: 0.95, flatShading: true });
  for (const [dx, dz] of [[-0.18, -0.10], [0.18, -0.10], [-0.10, 0.18], [0.10, 0.18]]) {
    const wart = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), wartMat);
    wart.position.set(dx, 0.55, dz);
    group.add(wart);
  }

  // -- 4 pattes : ramassees avant et arriere --
  for (const [dx, dz, rotY] of [
    [-0.34, 0.20, 0.5],
    [0.34, 0.20, -0.5],
    [-0.32, -0.20, -0.4],
    [0.32, -0.20, 0.4],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.18, 8), darkMat);
    leg.position.set(dx, 0.09, dz);
    leg.rotation.z = rotY;
    leg.castShadow = true;
    group.add(leg);
    // Pied palme : disque vert aplati
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 6), darkMat);
    foot.position.set(dx + Math.sign(dx) * 0.04, 0.04, dz + Math.sign(dz) * 0.02);
    foot.scale.set(1.4, 0.35, 1.1);
    foot.castShadow = true;
    group.add(foot);
  }

  // -- Tete : leger renflement avant. En fait on assume que la tete fait
  //    partie du corps spheroide ; on ajoute juste les yeux qui sortent
  //    et la bouche tres large.

  // -- Yeux protruberants : bosses vertes surmontees de grands yeux
  //    dores a pupille horizontale, paupieres lourdes (air ronchon). --
  for (const dx of [-0.16, 0.16]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), bodyMat);
    socket.position.set(dx, 0.64, 0.14);
    socket.castShadow = true;
    group.add(socket);
  }
  addEyes(group, { x: 0, y: 0.67, z: 0.22, size: 0.105, spacing: 0.32, turn: 0.35, iris: 0xf0c020, lid: 0x4a8a2a, sleepy: true });

  // -- Grande bouche en sourire + langue rose --
  const mouthMat = new THREE.MeshStandardMaterial({ color: mouth, roughness: 0.95 });
  const m = mouthArc(mouthMat, 0.16, { thick: 0.016 });
  m.position.set(0, 0.44, 0.42);
  m.rotation.x = -0.5;
  m.userData.noOutline = true;
  group.add(m);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0xe05a7a, roughness: 0.6 }));
  tongue.position.set(0.08, 0.35, 0.42);
  tongue.scale.set(1, 0.5, 0.8);
  group.add(tongue);
  // Joues roses.
  for (const dx of [-0.26, 0.26]) {
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf08a8a }));
    ch.position.set(dx, 0.46, 0.33);
    ch.scale.set(1.2, 0.7, 0.5);
    group.add(ch);
  }

  return group;
}
