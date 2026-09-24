import * as THREE from 'three';
import { M, mesh, addEyes } from './kit.js';

// Wabbit facon Dofus : lapin bipede chibi au pelage blanc-gris, tres
// grandes oreilles dressees (interieur rose), deux enormes dents, gros
// pieds, petite queue pompon, carotte brandie dans la main droite.
// `opts.royal` : variante Wa Wabbit (cape rouge + couronne, carotte-sceptre).
export function buildWabbit(opts = {}) {
  const group = new THREE.Group();
  const royal = !!opts.royal;

  const fur = M(royal ? 0xf4f2ec : 0xe8e8ee, { r: 0.9 });
  const furDk = M(royal ? 0xd8d2c4 : 0xbfc0cc, { r: 0.9 });
  const pink = M(0xf5a0b8, { r: 0.7 });
  const tooth = M(0xffffff, { r: 0.3 });
  const nose = M(0xe8587a, { r: 0.5 });
  const carrot = M(0xf07a1a, { r: 0.7 });
  const leaf = M(0x5aa832, { r: 0.8 });
  const dark = M(0x2a1418, { r: 0.5 });

  // ---- Gros pieds + jambes ----
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.12, 14, 10), fur, [sx * 0.13, 0.07, 0.08], [0.9, 0.6, 1.6]));
    group.add(mesh(new THREE.SphereGeometry(0.1, 12, 10), furDk, [sx * 0.13, 0.2, -0.02], [1, 1.1, 1]));
  }

  // ---- Corps rond + ventre clair ----
  group.add(mesh(new THREE.SphereGeometry(0.26, 18, 14), fur, [0, 0.45, 0], [1, 1.05, 0.95]));
  group.add(mesh(new THREE.SphereGeometry(0.18, 14, 10), M(0xffffff, { r: 0.9 }), [0, 0.42, 0.13], [1, 1.1, 0.6]));
  // Queue pompon.
  group.add(mesh(new THREE.IcosahedronGeometry(0.09, 2), M(0xffffff, { r: 0.95 }), [0, 0.35, -0.27]));

  // ---- Bras + pattes ----
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 10), fur, [sx * 0.25, 0.5, 0.03], null, [0, 0, sx * 0.4]));
    group.add(mesh(new THREE.SphereGeometry(0.065, 10, 8), fur, [sx * 0.3, 0.4, 0.06]));
  }

  // ---- Carotte brandie (main droite) ----
  const c = new THREE.Group();
  const body = mesh(new THREE.ConeGeometry(royal ? 0.09 : 0.06, royal ? 0.62 : 0.36, 10), carrot, [0, 0, 0], null, [Math.PI, 0, 0]);
  c.add(body);
  for (let i = 0; i < 3; i++) {
    const l = mesh(new THREE.ConeGeometry(0.03, 0.18, 5), leaf, [(i - 1) * 0.03, (royal ? 0.36 : 0.24), 0], null, [0, 0, (i - 1) * 0.4]);
    c.add(l);
  }
  c.position.set(0.4, royal ? 0.62 : 0.5, 0.1);
  c.rotation.z = -0.5;
  group.add(c);

  // ---- Tete ronde ----
  const headY = 0.86;
  group.add(mesh(new THREE.SphereGeometry(0.28, 20, 16), fur, [0, headY, 0.02]));
  // Joues gonflees.
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.11, 12, 10), fur, [sx * 0.12, headY - 0.1, 0.18], [1.1, 0.85, 0.8]));
  }
  addEyes(group, { x: 0, y: headY + 0.05, z: 0.23, size: 0.075, spacing: 0.22, turn: 0.3, iris: royal ? 0xe8322a : 0xd8403a, lid: royal ? 0xf4f2ec : 0xe8e8ee, angry: true });
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), nose);
  n.position.set(0, headY - 0.05, 0.29);
  n.scale.set(1.3, 0.9, 0.8);
  group.add(n);
  // Deux enormes dents.
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.BoxGeometry(0.05, 0.08, 0.02), tooth, [sx * 0.028, headY - 0.17, 0.27]));
  }
  const mouthLine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.01), dark);
  mouthLine.position.set(0, headY - 0.125, 0.28);
  group.add(mouthLine);

  // ---- Grandes oreilles ----
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group();
    ear.add(mesh(new THREE.CapsuleGeometry(0.07, 0.36, 6, 12), fur, [0, 0.22, 0], [1, 1, 0.55]));
    ear.add(mesh(new THREE.CapsuleGeometry(0.04, 0.28, 4, 10), pink, [0, 0.22, 0.03], [1, 1, 0.3]));
    ear.position.set(sx * 0.12, headY + 0.2, -0.02);
    ear.rotation.z = -sx * 0.2;
    ear.rotation.x = -0.15;
    // Oreille gauche legerement pliee : petite touche espiegle.
    if (sx < 0) ear.rotation.z += 0.25;
    group.add(ear);
  }

  if (royal) {
    // Cape rouge bordee d hermine + couronne.
    const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.36, 0.5, 18, 1, true, Math.PI * 0.6, Math.PI * 0.8),
      new THREE.MeshStandardMaterial({ color: 0xb0202a, roughness: 0.8, side: THREE.DoubleSide }));
    cape.position.set(0, 0.44, -0.04);
    group.add(cape);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 20), M(0xffffff, { r: 0.95 }));
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.66;
    group.add(collar);
    const crownMat = M(0xffd24a, { r: 0.3, m: 0.6 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16, 1, true), crownMat);
    band.position.set(0, headY + 0.27, 0.02);
    group.add(band);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      group.add(mesh(new THREE.ConeGeometry(0.035, 0.1, 6), crownMat, [Math.cos(a) * 0.15, headY + 0.35, 0.02 + Math.sin(a) * 0.15]));
    }
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), M(0x3a9ae0, { r: 0.2 }));
    gem.position.set(0, headY + 0.28, 0.18);
    group.add(gem);
  }

  return group;
}

export function buildWaWabbit() {
  const group = new THREE.Group();
  const body = buildWabbit({ royal: true });
  body.scale.setScalar(1.45);
  group.add(body);
  return group;
}
