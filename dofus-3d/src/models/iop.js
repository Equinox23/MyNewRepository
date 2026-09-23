import * as THREE from 'three';
import { addEyes } from './kit.js';

// Iop : guerrier emblematique, style "chibi" facon Dofus -- tres
// grosse tete ronde, corps trapu et compact, larges epaulieres, casque
// dome a crete, grande epee tenue fierement.
export function buildIop() {
  const group = new THREE.Group();

  // ----- Palette -----
  const armor      = 0xc23a2b; // rouge guerrier
  const armorLight = 0xe8654f; // plaques claires
  const armorDark  = 0x7c1f17; // creux / ombres
  const skin       = 0xf3c98a; // teint hale
  const skinDark   = 0xd9a866;
  const gold       = 0xf2c40f;
  const goldDark   = 0x9a7a0c;
  const leather    = 0x4a2f18;
  const leatherDk  = 0x2c1b0d;
  const steel      = 0xdfe6ec;
  const steelDark  = 0x9aa4ad;
  const cloth      = 0x8c2018; // tunique sous l armure

  const M = (c, o = {}) => new THREE.MeshStandardMaterial({
    color: c, roughness: o.r !== undefined ? o.r : 0.6, metalness: o.m || 0,
  });
  const armorMat   = M(armor, { r: 0.5, m: 0.15 });
  const armorLtMat = M(armorLight, { r: 0.45, m: 0.15 });
  const armorDkMat = M(armorDark, { r: 0.6 });
  const skinMat    = M(skin, { r: 0.8 });
  const skinDkMat  = M(skinDark, { r: 0.8 });
  const goldMat    = M(gold, { r: 0.35, m: 0.6 });
  const goldDkMat  = M(goldDark, { r: 0.45, m: 0.5 });
  const leatherMat = M(leather, { r: 0.9 });
  const leatherDkMat = M(leatherDk, { r: 0.95 });
  const steelMat   = M(steel, { r: 0.25, m: 0.85 });
  const steelDkMat = M(steelDark, { r: 0.4, m: 0.7 });
  const clothMat   = M(cloth, { r: 0.85 });
  const blackMat   = M(0x1a1320, { r: 0.5 });
  const whiteMat   = M(0xfdfdfd, { r: 0.4 });
  const hairMat    = M(0xe0561c, { r: 0.7 });
  const hairLtMat  = M(0xff8a2a, { r: 0.7 });
  const hairDkMat  = M(0x8a2a0c, { r: 0.7 });

  // ============ JAMBES (courtes et trapues) ============
  for (const dx of [-0.15, 0.15]) {
    // Grosse botte arrondie.
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), armorDkMat);
    boot.scale.set(1.0, 0.72, 1.25);
    boot.position.set(dx, 0.12, 0.03);
    boot.castShadow = true;
    group.add(boot);
    // Liseré dore sur la botte.
    const bootRim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.028, 8, 16), goldMat);
    bootRim.rotation.x = Math.PI / 2;
    bootRim.position.set(dx, 0.21, 0.0);
    group.add(bootRim);
    // Jambe courte (cuissarde).
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.20, 12), clothMat);
    leg.position.set(dx, 0.32, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  // ============ TORSE (compact, large, bombe) ============
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 16), armorMat);
  torso.scale.set(1.15, 1.0, 0.92);
  torso.position.y = 0.62;
  torso.castShadow = true;
  group.add(torso);
  // Plastron clair (pectoraux bombes).
  const plate = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 14), armorLtMat);
  plate.scale.set(1.05, 0.78, 0.62);
  plate.position.set(0, 0.66, 0.16);
  group.add(plate);
  // Ceinture large en cuir + grosse boucle doree.
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.13, 18), leatherMat);
  belt.position.y = 0.44;
  group.add(belt);
  const beltEdgeT = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.022, 8, 22), leatherDkMat);
  beltEdgeT.rotation.x = Math.PI / 2;
  beltEdgeT.position.y = 0.50;
  group.add(beltEdgeT);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.15, 0.06), goldMat);
  buckle.position.set(0, 0.44, 0.30);
  group.add(buckle);
  // Etoile Iop gravee sur la boucle.
  const star = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.03, 5), goldDkMat);
  star.rotation.x = -Math.PI / 2;
  star.position.set(0, 0.44, 0.34);
  group.add(star);
  // Col d armure dore.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 10, 24), goldMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.84;
  group.add(collar);

  // ============ EPAULIERES (enormes, iconiques) ============
  for (const dx of [-0.34, 0.34]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), armorMat);
    pauldron.scale.set(1.1, 1.0, 1.1);
    pauldron.position.set(dx, 0.84, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    // Bord dore.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.032, 8, 20), goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(dx, 0.80, 0);
    group.add(ring);
    // Petite pointe sur l epauliere.
    const stud = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 8), goldDkMat);
    stud.position.set(dx * 1.18, 0.92, 0);
    stud.rotation.z = dx > 0 ? -0.5 : 0.5;
    group.add(stud);
  }

  // ============ BRAS (courts) + GANTS (gros poings) ============
  // Bras gauche : le long du corps.
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.26, 10), clothMat);
  armL.position.set(-0.34, 0.62, 0.02);
  armL.castShadow = true;
  group.add(armL);
  const bracerL = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.13, 12), armorMat);
  bracerL.position.set(-0.34, 0.52, 0.02);
  group.add(bracerL);
  const fistL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), armorLtMat);
  fistL.position.set(-0.34, 0.42, 0.04);
  fistL.castShadow = true;
  group.add(fistL);

  // Bras droit : leve, plie pour tenir l epee.
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 10), clothMat);
  armR.position.set(0.36, 0.66, 0.06);
  armR.rotation.x = -0.5;
  armR.castShadow = true;
  group.add(armR);
  const bracerR = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.14, 12), armorMat);
  bracerR.position.set(0.40, 0.52, 0.20);
  bracerR.rotation.x = -0.5;
  group.add(bracerR);
  const fistR = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), armorLtMat);
  fistR.position.set(0.42, 0.44, 0.30);
  fistR.castShadow = true;
  group.add(fistR);

  // ============ TETE (enorme, ronde -- cle du style chibi) ============
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 20), skinMat);
  head.position.y = 1.18;
  head.castShadow = true;
  group.add(head);
  // Menton / machoire legerement marquee.
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 12), skinDkMat);
  jaw.scale.set(1.0, 0.55, 0.85);
  jaw.position.set(0, 1.00, 0.06);
  group.add(jaw);

  // ----- Visage -----
  // Gros sourcils fronces (air determine, typique de l Iop).
  for (const dx of [-0.15, 0.15]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.07), hairDkMat);
    brow.position.set(dx, 1.29, 0.35);
    brow.rotation.z = dx > 0 ? 0.35 : -0.35;
    group.add(brow);
  }
  // Grands yeux cartoon, paupiere fronce.
  addEyes(group, { x: 0, y: 1.17, z: 0.365, size: 0.1, spacing: 0.3, turn: 0.28, iris: 0x8a4a1a, lid: skin, angry: true });
  // Petit nez + sourire en coin plein d assurance.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), skinDkMat);
  nose.position.set(0, 1.07, 0.4);
  group.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 14, Math.PI * 0.8), blackMat);
  mouth.rotation.z = Math.PI * 1.1;
  mouth.position.set(0.02, 1.0, 0.37);
  group.add(mouth);

  // ============ CHEVELURE : la crete en flamme de l Iop ============
  // Calotte de cheveux sur le crane.
  const scalp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
  scalp.position.set(0, 1.21, -0.02);
  scalp.scale.set(1, 0.9, 1);
  scalp.castShadow = true;
  group.add(scalp);
  // Meches en pointe, dressees vers le haut et rabattues vers l arriere.
  const spikes = [
    // x, y, z, longueur, rayon, inclinaison avant/arriere, laterale
    [0, 1.6, 0.14, 0.42, 0.12, -0.55, 0],
    [-0.14, 1.56, 0.08, 0.36, 0.1, -0.7, 0.35],
    [0.14, 1.56, 0.08, 0.36, 0.1, -0.7, -0.35],
    [0, 1.58, -0.08, 0.44, 0.13, -1.05, 0],
    [-0.2, 1.46, -0.12, 0.34, 0.1, -1.2, 0.6],
    [0.2, 1.46, -0.12, 0.34, 0.1, -1.2, -0.6],
    [0, 1.45, -0.26, 0.4, 0.12, -1.5, 0],
    [-0.3, 1.3, 0.06, 0.26, 0.08, -0.4, 1.0],
    [0.3, 1.3, 0.06, 0.26, 0.08, -0.4, -1.0],
  ];
  spikes.forEach(([x, y, z, len, rad, rx, rz], i) => {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(rad, len, 8), i % 3 === 0 ? hairLtMat : hairMat);
    sp.position.set(x, y, z);
    sp.rotation.set(rx, 0, rz);
    sp.castShadow = true;
    group.add(sp);
  });
  // Meche qui retombe sur le front.
  const fringe = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), hairMat);
  fringe.position.set(-0.08, 1.4, 0.36);
  fringe.rotation.set(2.3, 0, 0.3);
  group.add(fringe);
  // Bandeau dore sur le front.
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.04, 10, 30), goldMat);
  band.rotation.x = Math.PI / 2 - 0.12;
  band.position.set(0, 1.33, 0.0);
  group.add(band);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), M(0xe8322a, { r: 0.2, m: 0.3 }));
  gem.position.set(0, 1.36, 0.41);
  group.add(gem);

  // ============ CAPE ============
  const capeMat = new THREE.MeshStandardMaterial({ color: armorDark, roughness: 0.85, side: THREE.DoubleSide });
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.82, 5, 5), capeMat);
  const pos = cape.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    // Courbure : la cape s evase vers le bas.
    pos.setZ(i, pos.getZ(i) + Math.pow((y + 0.41) * -0.5, 2) * 0.18 - Math.abs(x) * 0.12);
  }
  cape.geometry.computeVertexNormals();
  cape.position.set(0, 0.62, -0.26);
  cape.castShadow = true;
  group.add(cape);
  // Attache de cape (deux disques dores aux epaules).
  for (const dx of [-0.18, 0.18]) {
    const clasp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), goldMat);
    clasp.rotation.x = Math.PI / 2;
    clasp.position.set(dx, 0.86, -0.16);
    group.add(clasp);
  }

  // ============ GRANDE EPEE (tenue dans le poing droit) ============
  const sword = new THREE.Group();
  // Lame large.
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.92, 0.045), steelMat);
  blade.position.y = 0.62;
  blade.castShadow = true;
  sword.add(blade);
  // Pointe.
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.20, 4), steelMat);
  tip.rotation.y = Math.PI / 4;
  tip.position.y = 1.18;
  sword.add(tip);
  // Gorge centrale (fuller).
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.80, 0.05), steelDkMat);
  fuller.position.y = 0.62;
  sword.add(fuller);
  // Garde large + quillons.
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.085, 0.10), goldMat);
  guard.position.y = 0.13;
  sword.add(guard);
  for (const dx of [-0.21, 0.21]) {
    const quillon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), goldDkMat);
    quillon.position.set(dx, 0.13, 0);
    sword.add(quillon);
  }
  // Poignee + pommeau.
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.20, 10), leatherMat);
  grip.position.y = 0.0;
  sword.add(grip);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), goldMat);
  pommel.position.y = -0.12;
  sword.add(pommel);
  // L epee est tenue par le poing droit, lame dressee vers le ciel.
  sword.position.set(0.42, 0.30, 0.30);
  sword.rotation.set(-0.12, 0, -0.14);
  group.add(sword);

  return group;
}
