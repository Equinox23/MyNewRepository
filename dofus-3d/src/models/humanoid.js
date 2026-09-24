import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, addEyes } from './kit.js';

// ===========================================================================
// Base d anatomie "sculptee" pour les heros (style Dofus chibi, mais avec
// une vraie silhouette plutot qu un empilement de boules) :
//  - buste en profil tourne (taille marquee, poitrine, epaules en pente),
//    legerement aplati d avant en arriere ;
//  - jambes et bras effiles en deux segments (genou / coude) ;
//  - mains avec pouce, bottes a bout pointu ;
//  - tete ovale avec machoire, menton et joues (pas une sphere parfaite).
// Les membres sont accroches a des pivots nommes (hanches, epaules, cou)
// transmis au rig d animation via group.userData.rig.
//
// Outils de modelage exportes : lathe, taper, bentCone, roundBox, cloth,
// strand... reutilises par chaque classe pour son costume.
// ===========================================================================

export { M };

export function place(mesh, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  return mesh;
}

// Solide de revolution a partir d un profil [[rayon, y], ...] (bas -> haut).
export function lathe(profile, mat, segs = 22, sz = 1) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y));
  const g = new THREE.LatheGeometry(pts, segs);
  if (sz !== 1) g.scale(1, 1, sz);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Segment de membre effile qui PEND sous son origine (0 -> -len).
export function taper(r0, r1, len, mat, segs = 12) {
  const g = new THREE.CylinderGeometry(r0, r1, len, segs, 3);
  g.translate(0, -len / 2, 0);
  // Leger renflement au milieu (muscle / tissu).
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = -p.getY(i) / len;
    const k = 1 + Math.sin(t * Math.PI) * 0.12;
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Cone courbe (meches de cheveux, cornes, oreilles, pointes) : base a
// l origine, pointe en haut, deviee de (bx, bz) en bout.
export function bentCone(r, h, bx, bz, mat, segs = 8, hs = 6) {
  const g = new THREE.ConeGeometry(r, h, segs, hs);
  g.translate(0, h / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / h;
    p.setX(i, p.getX(i) + bx * t * t);
    p.setZ(i, p.getZ(i) + bz * t * t);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Tube courbe effile le long de points (meche, queue, fouet, echarpe).
export function strand(points, r0, r1, mat, segs = 24) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
  const g = new THREE.TubeGeometry(curve, segs, 1, 8, false);
  // Rayon variable : on reecrit chaque anneau autour du point de la courbe.
  const pos = g.attributes.position;
  const ring = 9;
  const tmp = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const c = curve.getPointAt(t);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j < ring; j++) {
      const k = i * ring + j;
      if (k >= pos.count) break;
      tmp.fromBufferAttribute(pos, k).sub(c).normalize().multiplyScalar(r).add(c);
      pos.setXYZ(k, tmp.x, tmp.y, tmp.z);
    }
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Boite aux aretes arrondies (plaques d armure, ceintures, boucles).
export function roundBox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.castShadow = true;
  return m;
}

// Pan de tissu (cape, pans de manteau, tablier) : plan cintre, bas ondule.
// Il pend sous son origine, cintre vers l arriere (-z).
export function cloth(w, h, mat, o = {}) {
  const g = new THREE.PlaneGeometry(w, h, 10, 8);
  g.translate(0, -h / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const u = x / (w / 2);
    const t = -y / h;
    let z = -(o.curve || 0.12) * (1 - u * u) * (0.5 + t);
    z -= (o.flare || 0.1) * t * t;
    const wave = Math.sin(u * Math.PI * (o.waves || 2)) * (o.wave || 0.03) * t;
    p.setXYZ(i, x * (1 + (o.spread || 0.25) * t), y + wave, z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.material.side = THREE.DoubleSide;
  m.castShadow = true;
  return m;
}

// Tete ovale : sphere deformee (machoire vers l avant, menton, joues,
// crane un peu allonge vers l arriere).
export function headMesh(r, mat, o = {}) {
  const g = new THREE.SphereGeometry(r, 28, 22);
  const p = g.attributes.position;
  const jaw = o.jaw !== undefined ? o.jaw : 0.18;
  const chin = o.chin !== undefined ? o.chin : 0.12;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) / r, y = p.getY(i) / r, z = p.getZ(i) / r;
    if (y < 0) {
      const k = -y;
      z *= 1 + jaw * k * (z > 0 ? 1 : 0.3);
      x *= 1 - chin * k * k;
      y *= 1 + chin * 0.6;
    } else {
      z *= 1 - 0.06 * y;
    }
    if (z < 0) z *= 1.08; // arriere du crane
    x *= o.wide || 1;
    p.setXYZ(i, x * r, y * r, z * r);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

// Main : paume arrondie + pouce. Origine au poignet, la main pend.
export function hand(mat, s = 1, side = 1) {
  const g = new THREE.Group();
  const palm = roundBox(0.1 * s, 0.1 * s, 0.07 * s, 0.03 * s, mat);
  palm.position.y = -0.05 * s;
  g.add(palm);
  const fingers = roundBox(0.095 * s, 0.05 * s, 0.075 * s, 0.024 * s, mat);
  fingers.position.set(0, -0.105 * s, 0.01 * s);
  fingers.rotation.x = 0.35;
  g.add(fingers);
  const thumb = taper(0.022 * s, 0.018 * s, 0.06 * s, mat, 8);
  thumb.position.set(-side * 0.05 * s, -0.04 * s, 0.03 * s);
  thumb.rotation.set(0.4, 0, -side * 0.8);
  g.add(thumb);
  return g;
}

// Botte a bout pointu (legerement relevee), origine a la cheville.
export function boot(mat, s = 1, o = {}) {
  const g = new THREE.Group();
  const shaft = taper(0.075 * s, 0.07 * s, 0.1 * s, mat, 12);
  shaft.position.y = 0.1 * s;
  g.add(shaft);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.075 * s, 14, 10), mat);
  foot.scale.set(1, 0.62, 1.7);
  foot.position.set(0, 0.035 * s, 0.05 * s);
  foot.castShadow = true;
  g.add(foot);
  const toe = bentCone(0.05 * s, (o.toe || 0.11) * s, 0, 0.0, mat, 10, 3);
  toe.rotation.x = Math.PI / 2 - 0.25;
  toe.position.set(0, 0.035 * s, 0.13 * s);
  g.add(toe);
  if (o.cuff) {
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.095 * s, 0.085 * s, 0.05 * s, 14), o.cuff);
    cuff.position.y = 0.19 * s;
    cuff.castShadow = true;
    g.add(cuff);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Corps de base. cfg :
//   skin, top, bottom, boots, gloves (materiaux)
//   build : 1 = normal, >1 costaud, <1 fin ; height : echelle verticale
//   eyes : options addEyes (iris, lid, angry...) ; headR ; noNose
// Renvoie { group, rig: {legL, legR, armL, armR, head}, torso, headTop,
//           handL, handR (points d attache) }.
// ---------------------------------------------------------------------------
export function buildHumanoid(cfg) {
  const group = new THREE.Group();
  const b = cfg.build || 1;
  const skin = cfg.skin, top = cfg.top, bottom = cfg.bottom, boots = cfg.boots;
  const gloves = cfg.gloves || skin;
  const hipY = 0.44, shoulderY = 0.8;

  // ---- Bassin / hanches ----
  const pelvis = lathe([[0.02, 0], [0.13 * b, 0.02], [0.155 * b, 0.08], [0.15 * b, 0.12]], bottom, 20, 0.82);
  pelvis.position.y = hipY - 0.06;
  group.add(pelvis);

  // ---- Buste : taille fine, poitrine, epaules en pente ----
  const torso = lathe([
    [0.14 * b, 0], [0.128 * b, 0.06], [0.15 * b, 0.14], [0.19 * b, 0.23],
    [0.195 * b, 0.28], [0.16 * b, 0.33], [0.09 * b, 0.37], [0.05, 0.38],
  ], top, 24, 0.78);
  torso.position.y = hipY + 0.02;
  group.add(torso);
  // Cou.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12), skin);
  neck.position.y = 0.85;
  group.add(neck);

  // ---- Jambes (pivot a la hanche) ----
  const legs = {};
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.085 * b, hipY, 0);
    const thigh = taper(0.075 * b, 0.062 * b, 0.2, bottom);
    leg.add(thigh);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.062 * b, 12, 10), bottom);
    knee.position.y = -0.2;
    leg.add(knee);
    const shin = taper(0.06 * b, 0.05 * b, 0.14, bottom);
    shin.position.y = -0.2;
    leg.add(shin);
    const bt = boot(boots, b, { cuff: cfg.bootCuff, toe: cfg.toe });
    bt.position.y = -hipY;
    bt.position.z = 0;
    leg.add(bt);
    group.add(leg);
    legs[side] = leg;
  }

  // ---- Bras (pivot a l epaule) ----
  const arms = {}, hands = {};
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.215 * b, shoulderY, 0);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.068 * b, 14, 10), cfg.sleeve || top);
    shoulder.scale.set(1, 0.9, 0.9);
    shoulder.castShadow = true;
    arm.add(shoulder);
    const upper = taper(0.058 * b, 0.048 * b, 0.17, cfg.sleeve || top);
    upper.rotation.z = side * 0.12;
    arm.add(upper);
    const elbow = new THREE.Group();
    elbow.position.set(side * 0.02, -0.17, 0);
    const fore = taper(0.048 * b, 0.04 * b, 0.15, cfg.forearm || cfg.sleeve || top);
    fore.rotation.x = -0.18;
    elbow.add(fore);
    const hd = hand(gloves, 1.05 * b, side);
    hd.position.set(0, -0.15, 0.03);
    hd.rotation.x = -0.18;
    elbow.add(hd);
    arm.add(elbow);
    group.add(arm);
    arms[side] = arm;
    hands[side] = hd;
  }

  // ---- Tete (pivot au cou) ----
  const head = new THREE.Group();
  head.position.set(0, 0.88, 0);
  const hr = cfg.headR || 0.3;
  const skull = headMesh(hr, skin, cfg.headShape || {});
  skull.position.y = hr * 0.88;
  head.add(skull);
  if (!cfg.noNose) {
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), cfg.noseMat || skin);
    nose.scale.set(1, 0.9, 1.1);
    nose.position.set(0, hr * 0.72, hr * 0.98);
    head.add(nose);
  }
  if (cfg.ears) {
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), skin);
      ear.scale.set(0.45, 1, 0.8);
      ear.position.set(side * hr * 0.98, hr * 0.85, -0.01);
      head.add(ear);
    }
  }
  if (cfg.eyes !== false) {
    addEyes(head, { x: 0, y: hr * 0.9, z: hr * 0.84, size: hr * 0.3, spacing: hr * 0.92, turn: 0.32, ...(cfg.eyes || {}) });
  }
  group.add(head);

  group.userData.rig = { legL: legs[-1], legR: legs[1], armL: arms[-1], armR: arms[1], head };
  // Points d attache de l equipement (coiffe, cape, amulette, anneau, bottes).
  group.userData.anchors = { head, hr, b, hipY, shoulderY, legL: legs[-1], legR: legs[1], handR: hands[1], body: group };
  return {
    group, torso, head, headR: hr, headTop: 0.88 + hr * 1.9,
    handL: hands[-1], handR: hands[1], armL: arms[-1], armR: arms[1], legL: legs[-1], legR: legs[1],
  };
}

// Bouche en arc (sourire / moue) collee au visage.
export function faceMouth(head, hr, mat, o = {}) {
  const w = o.width || hr * 0.2;
  const m = new THREE.Mesh(new THREE.TorusGeometry(w, o.thick || 0.012, 6, 14, Math.PI * (o.arc || 0.9)), mat);
  m.rotation.z = Math.PI + (o.tilt || 0) + (Math.PI * (1 - (o.arc || 0.9))) / 2;
  if (o.frown) m.rotation.z = (o.tilt || 0) + (Math.PI * (1 - (o.arc || 0.9))) / 2;
  m.position.set(o.x || 0, hr * (o.y || 0.5), hr * 1.02);
  m.userData.noOutline = true;
  head.add(m);
  return m;
}

// Sourcils (petites barres inclinees).
export function brows(head, hr, mat, o = {}) {
  for (const side of [-1, 1]) {
    const br = roundBox(hr * 0.34, hr * 0.07, hr * 0.08, hr * 0.03, mat);
    br.position.set(side * hr * 0.3, hr * (o.y || 1.22), hr * 0.93);
    br.rotation.z = side * (o.angle !== undefined ? o.angle : 0.3);
    br.userData.noOutline = true;
    head.add(br);
  }
}

// Chevelure de base : calotte sur le dessus + arriere du crane jusqu a la
// nuque (evite la tete "chauve" vue de dos). o.front : frange (0..1).
export function hairCap(head, hr, mat, o = {}) {
  const cy = hr * 0.88;
  const top = new THREE.Mesh(new THREE.SphereGeometry(hr * 1.05, 24, 14, 0, Math.PI * 2, 0, Math.PI * (o.topTheta || 0.42)), mat);
  top.position.y = cy + hr * 0.02;
  top.rotation.x = o.tilt !== undefined ? o.tilt : -0.12;
  top.castShadow = true;
  head.add(top);
  // Enveloppe tout le crane sauf un coin devant (le visage).
  const open = o.faceOpen || 1.0;
  const back = new THREE.Mesh(new THREE.SphereGeometry(hr * 1.07, 24, 14, Math.PI / 2 + open, Math.PI * 2 - open * 2, 0, Math.PI * (o.backTheta || 0.78)), mat);
  back.scale.set(1, 1, 1.1);
  back.position.set(0, cy, -hr * 0.03);
  back.castShadow = true;
  head.add(back);
  return { top, back };
}
