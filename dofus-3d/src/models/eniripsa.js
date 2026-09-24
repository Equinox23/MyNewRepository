import * as THREE from 'three';
import { M, mesh, addEyes, mouth } from './kit.js';

// Eniripsa facon Dofus : petite fee soigneuse chibi. Carre de cheveux
// roses avec frange, grands yeux bleus, robe blanche et rose a col
// coeur, petites ailes translucides dans le dos, baguette surmontee
// d un coeur tenue dans la main droite.
export function buildEniripsa() {
  const group = new THREE.Group();

  const skin = M(0xf8dcc0, { r: 0.8 });
  const skinDk = M(0xe8b898, { r: 0.8 });
  const hair = M(0xff7ab8, { r: 0.7 });
  const hairLt = M(0xffa8d0, { r: 0.7 });
  const dress = M(0xfdf6f8, { r: 0.8 });
  const dressPink = M(0xf05a9a, { r: 0.75 });
  const gold = M(0xf2c84a, { r: 0.35, m: 0.5 });
  const boot = M(0xd8407a, { r: 0.7 });
  const dark = M(0x2a1420, { r: 0.5 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xc8f0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.2,
    emissive: 0x4ab0d8, emissiveIntensity: 0.25,
  });

  // ---- Jambes + bottines ----
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.12, 14, 10), boot, [sx * 0.12, 0.1, 0.03], [1, 0.75, 1.25]));
    group.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.22, 10), skin, [sx * 0.12, 0.28, 0]));
  }

  // ---- Robe cloche blanche + ourlet rose ----
  group.add(mesh(new THREE.CylinderGeometry(0.22, 0.4, 0.42, 20), dress, [0, 0.55, 0]));
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 28), dressPink);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.35;
  group.add(hem);
  // Corsage rose + col en forme de coeur.
  group.add(mesh(new THREE.SphereGeometry(0.24, 16, 12), dressPink, [0, 0.78, 0], [1.05, 0.8, 0.9]));
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), gold);
  heart.position.set(0, 0.8, 0.21);
  heart.scale.set(1.2, 1, 0.5);
  group.add(heart);
  // Ceinture doree.
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.025, 6, 22), gold);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.68;
  group.add(belt);

  // ---- Bras fins + mains ----
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.26, 10), dress, [sx * 0.3, 0.66, 0.02], null, [0, 0, sx * 0.25]));
    group.add(mesh(new THREE.SphereGeometry(0.075, 12, 10), skin, [sx * 0.35, 0.52, 0.04]));
  }

  // ---- Baguette a coeur (main droite) ----
  const wand = new THREE.Group();
  wand.add(mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.62, 8), gold, [0, 0.3, 0]));
  const hTop = mesh(new THREE.SphereGeometry(0.08, 12, 10), dressPink, [0, 0.66, 0], [1.3, 1.1, 0.6]);
  wand.add(hTop);
  for (const sx of [-1, 1]) {
    const lobe = mesh(new THREE.SphereGeometry(0.055, 10, 8), dressPink, [sx * 0.045, 0.7, 0], [1, 1, 0.6]);
    wand.add(lobe);
  }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb0d8, transparent: true, opacity: 0.35 }));
  glow.position.y = 0.67;
  wand.add(glow);
  wand.position.set(0.44, 0.42, 0.1);
  wand.rotation.z = -0.2;
  group.add(wand);

  // ---- Ailes de fee (dans le dos) ----
  for (const sx of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.35, 0.5, 0.4, 0.45, 0.1);
    shape.bezierCurveTo(0.42, -0.05, 0.2, -0.05, 0, 0);
    shape.bezierCurveTo(0.2, -0.1, 0.35, -0.3, 0.2, -0.32);
    shape.bezierCurveTo(0.1, -0.33, 0.02, -0.15, 0, 0);
    const w = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), wingMat);
    w.position.set(sx * 0.08, 0.85, -0.2);
    w.rotation.set(0, sx > 0 ? -0.5 : Math.PI + 0.5, 0);
    group.add(w);
  }

  // ---- Tete ----
  group.add(mesh(new THREE.SphereGeometry(0.38, 24, 20), skin, [0, 1.14, 0]));
  addEyes(group, { x: 0, y: 1.12, z: 0.33, size: 0.1, spacing: 0.29, turn: 0.28, iris: 0x3a8ae8 });
  // Joues roses + petite bouche souriante.
  for (const sx of [-1, 1]) {
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), M(0xff9ab8));
    ch.position.set(sx * 0.22, 1.0, 0.3);
    ch.scale.set(1.3, 0.7, 0.5);
    group.add(ch);
  }
  const m = mouth(dark, 0.05, { thick: 0.014 });
  m.position.set(0, 0.98, 0.36);
  m.userData.noOutline = true;
  group.add(m);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), skinDk);
  nose.position.set(0, 1.05, 0.38);
  group.add(nose);

  // ---- Cheveux : carre rose + frange + meches ----
  const cap = mesh(new THREE.SphereGeometry(0.41, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, [0, 1.17, -0.01]);
  group.add(cap);
  // Frange.
  for (let i = -3; i <= 3; i++) {
    const f = mesh(new THREE.SphereGeometry(0.1, 10, 8), i % 2 ? hairLt : hair, [i * 0.075, 1.35 - Math.abs(i) * 0.02, 0.3 - Math.abs(i) * 0.03], [1, 0.8, 0.7]);
    group.add(f);
  }
  // Carre sur les cotes et derriere.
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.17, 14, 10), hair, [sx * 0.33, 1.04, -0.02], [0.7, 1.3, 1]));
  }
  group.add(mesh(new THREE.SphereGeometry(0.32, 16, 12), hair, [0, 1.05, -0.18], [1.15, 1.1, 0.8]));
  // Petit noeud dore dans les cheveux.
  for (const sx of [-1, 1]) {
    group.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), gold, [0.18 + sx * 0.06, 1.5, 0.1], [1.3, 0.8, 0.6], [0, 0, sx * 0.4]));
  }

  return group;
}
