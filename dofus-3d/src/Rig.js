import * as THREE from 'three';
import { VARIANTS } from './models/variants.js';

// "Rig" automatique des modeles procéduraux : les pieces de chaque modele
// (enfants directs du corps) sont reparties en jambes / bras / tete selon
// leur position, puis rattachees a des pivots (hanches, epaules, cou).
// On peut ensuite animer les membres (marche jambe apres jambe, bras qui
// balancent, coup d epee, bras leves pour lancer un sort...).
//
// Regles (humanoides) : un objet tenu tres a l exterieur (|x| >= weaponX)
// suit le bras de son cote ; au-dessus de headY -> tete ; sous hipY ->
// jambe ; |x| >= armX dans la bande [armLo, armHi] (et pas dans le dos)
// -> bras ; le reste = torse (fixe).

const RIGS = {
  iop:       { hip: 0.38, armX: 0.28, arm: [0.36, 0.76], head: 0.93, weaponX: 0.44, shoulderY: 0.74 },
  osamodas:  { hip: 0.38, armX: 0.28, arm: [0.35, 0.8], head: 0.95, weaponX: 0.44, shoulderY: 0.74 },
  roublard:  { hip: 0.38, armX: 0.28, arm: [0.36, 0.72], head: 0.95, weaponX: 0.44, shoulderY: 0.72 },
  ecaflip:   { hip: 0.38, armX: 0.28, arm: [0.35, 0.7], head: 0.95, weaponX: 0.44, shoulderY: 0.72 },
  pandawa:   { hip: 0.38, armX: 0.3, arm: [0.38, 0.82], head: 1.0, weaponX: 0.44, shoulderY: 0.8 },
  eniripsa:  { hip: 0.34, armX: 0.26, arm: [0.4, 0.8], head: 0.93, weaponX: 0.4, shoulderY: 0.76 },
  wabbit:    { hip: 0.26, armX: 0.2, arm: [0.32, 0.62], head: 0.66, weaponX: 0.36, shoulderY: 0.58 },
  xelor:     { hip: 0, armX: 0.28, arm: [0.5, 0.86], head: 0.94, weaponX: 0.44, shoulderY: 0.86 },
  chafer:    { hip: 0.45, armX: 0.2, arm: [0.5, 1.02], head: 1.04, weaponX: 0.44, shoulderY: 1.0 },
  craqueleur:{ hip: 0.25, armX: 0.42, arm: [0.15, 0.8], head: 0.88, weaponX: 9, shoulderY: 0.72 },
  // Quadrupedes / petites creatures : seulement les pattes.
  bouftou:   { quad: true, hip: 0.22 },
  tofu:      { hip: 0.26, legOnly: true },
  kwakwa:    { hip: 0.3, legOnly: true },
};
// Variantes "royales" : meme squelette (le modele est simplement agrandi).
const ALIAS = { chaferRoyal: 'chafer', bouftouRoyal: 'bouftou', tofuRoyal: 'tofu', waWabbit: 'wabbit', bouftouInvoc: 'bouftou', craqueleurSauvage: 'craqueleur', craqueleurLegendaire: 'craqueleur' };
// Variantes du bestiaire : squelette de leur modele de base.
for (const [id, v] of Object.entries(VARIANTS)) if (RIGS[v.base] || ALIAS[v.base]) ALIAS[id] = ALIAS[v.base] || v.base;

export function rigModel(body, classId) {
  // Modeles construits sur la base d anatomie (humanoid.js) : pivots
  // nommes fournis directement.
  if (body.userData && body.userData.rig) {
    const r = body.userData.rig;
    return { scale: 1, quad: false, legL: r.legL, legR: r.legR, armL: r.armL, armR: r.armR, head: r.head };
  }
  const key = ALIAS[classId] || classId;
  const cfg = RIGS[key];
  if (!cfg) return null;
  // Les variantes royales enveloppent le modele de base dans un groupe
  // mis a l echelle : on travaille sur ce sous-groupe.
  let root = body;
  let scale = 1;
  if (ALIAS[classId] && body.children.length && body.children[0].isGroup && (body.children[0].scale.x !== 1 || body.children.length === 1)) {
    root = body.children[0];
    scale = root.scale.x;
  }
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const box = new THREE.Box3();
  const center = new THREE.Vector3();

  const parts = { legL: [], legR: [], armL: [], armR: [], head: [], legs: [[], [], [], []] };
  for (const child of root.children.slice()) {
    box.setFromObject(child).applyMatrix4(inv);
    box.getCenter(center);
    const { x, y, z } = center;
    const side = x < 0 ? 'L' : 'R';
    if (cfg.quad) {
      if (y < cfg.hip) {
        const idx = (z >= 0 ? 0 : 2) + (x < 0 ? 0 : 1);
        parts.legs[idx].push(child);
      }
      continue;
    }
    if (cfg.legOnly) {
      if (y < cfg.hip) parts['leg' + side].push(child);
      continue;
    }
    if (Math.abs(x) >= cfg.weaponX && y < cfg.head + 0.3) parts['arm' + side].push(child);
    else if (y >= cfg.head) parts.head.push(child);
    else if (cfg.hip && y < cfg.hip && Math.abs(x) > 0.05) parts['leg' + side].push(child);
    else if (Math.abs(x) >= cfg.armX && y >= cfg.arm[0] && y <= cfg.arm[1] && z > -0.15) parts['arm' + side].push(child);
  }

  const makePivot = (children, px, py, pz) => {
    if (!children.length) return null;
    const pivot = new THREE.Group();
    pivot.position.set(px, py, pz);
    root.add(pivot);
    pivot.updateMatrixWorld(true);
    for (const c of children) pivot.attach(c);
    return pivot;
  };
  const avgX = (list) => list.reduce((s, c) => {
    box.setFromObject(c).applyMatrix4(inv);
    return s + box.getCenter(center).x;
  }, 0) / list.length;

  const rig = { scale, quad: !!cfg.quad };
  if (cfg.quad) {
    rig.legs = parts.legs.map(list => list.length ? makePivot(list, avgX(list), cfg.hip, list.length ? (box.setFromObject(list[0]).applyMatrix4(inv), box.getCenter(center).z) : 0) : null);
    return rig;
  }
  rig.legL = makePivot(parts.legL, parts.legL.length ? avgX(parts.legL) : 0, cfg.hip, 0);
  rig.legR = makePivot(parts.legR, parts.legR.length ? avgX(parts.legR) : 0, cfg.hip, 0);
  if (!cfg.legOnly) {
    const sy = cfg.shoulderY;
    rig.armL = makePivot(parts.armL, -cfg.armX - 0.04, sy, 0);
    rig.armR = makePivot(parts.armR, cfg.armX + 0.04, sy, 0);
    rig.head = makePivot(parts.head, 0, cfg.head - 0.08, 0);
  }
  return rig;
}

// Applique une pose au rig. Tous les angles en radians (0 = pose neutre).
//   legSwing : balancement des jambes (+ = jambe gauche en avant)
//   armSwing : balancement des bras en opposition
//   armL / armR : rotation.x additionnelle de chaque bras (- = vers l avant / le haut)
//   armOut : ecartement lateral des bras ; headTilt / headTurn
export function poseRig(rig, p = {}) {
  if (!rig) return;
  if (rig.quad) {
    const s = p.legSwing || 0;
    const [fl, fr, bl, br] = rig.legs;
    if (fl) fl.rotation.x = s;
    if (br) br.rotation.x = s;
    if (fr) fr.rotation.x = -s;
    if (bl) bl.rotation.x = -s;
    return;
  }
  const ls = p.legSwing || 0;
  if (rig.legL) rig.legL.rotation.x = -ls;
  if (rig.legR) rig.legR.rotation.x = ls;
  const as = p.armSwing || 0;
  const out = p.armOut || 0;
  if (rig.armL) { rig.armL.rotation.x = as + (p.armL || 0); rig.armL.rotation.z = -out; }
  if (rig.armR) { rig.armR.rotation.x = -as + (p.armR || 0); rig.armR.rotation.z = out; }
  if (rig.head) { rig.head.rotation.x = p.headTilt || 0; rig.head.rotation.y = p.headTurn || 0; rig.head.rotation.z = p.headRoll || 0; }
}
