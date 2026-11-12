import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, addEyes, loft, sculptSphere, tubeAlong } from './kit.js';

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

export { M, loft, sculptSphere, tubeAlong };

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

// Proportions "illustration" pour un heros termine : jambes allongees,
// tete un peu moins grosse (silhouette moins "jouet"). Tout ce qui n est
// pas une jambe est remonte d autant ; les ancres d equipement suivent.
export function restyleHero(group, o = {}) {
  const rig = group.userData.rig, anchors = group.userData.anchors;
  if (!rig || !anchors || group.userData.restyled) return group;
  group.userData.restyled = true;
  const stretch = o.legs !== undefined ? o.legs : 1.24;
  const lift = anchors.hipY * (stretch - 1);
  const upper = new THREE.Group();
  upper.position.y = lift;
  for (const c of [...group.children]) {
    if (c === rig.legL || c === rig.legR) continue;
    upper.add(c);
  }
  group.add(upper);
  for (const leg of [rig.legL, rig.legR]) {
    leg.scale.y = stretch;
    leg.position.y += lift;
  }
  rig.head.scale.setScalar(o.head !== undefined ? o.head : 0.88);
  anchors.body = upper;
  return group;
}

// ===========================================================================
// Anatomie "illustration" (refonte graphique, heros par heros) : memes
// pivots / ancres que buildHumanoid, mais des proportions plus adultes
// (environ 3,5 tetes) et des volumes d une seule piece : buste galbe,
// jambe et bras continus (plus de rotules en boule), poing ferme, botte
// montante, tete a machoire dessinee. Le visage se pose ensuite avec
// faceEyes / faceBrows / faceSmile / faceNose, qui suivent la surface.
// cfg : skin, top, bottom, boots, gloves, bootCuff, bracer (materiaux),
//       build (carrure), hipY, shoulderY, shoulderW, headR, headShape.
// ===========================================================================

// Tete : crane large, joues, machoire qui se resserre vers le menton.
export function heroHead(r, mat, o = {}) {
  const taper = o.taper !== undefined ? o.taper : 0.42;
  const chin = o.chin !== undefined ? o.chin : 0.1;
  return sculptSphere((d, out) => {
    let x = d.x, y = d.y, z = d.z;
    if (y < 0) {
      const k = -y;
      x *= 1 - taper * Math.pow(k, 1.6);
      z *= z > 0 ? 1 + 0.04 * k : 1 - 0.14 * k;
      y *= 1 + chin;
    } else {
      y *= 0.96;
    }
    x *= 1 + 0.05 * Math.exp(-Math.pow((d.y + 0.32) / 0.3, 2));
    z *= z > 0 ? 0.93 : 1.05;
    out.set(x * r * (o.wide || 1), y * r, z * r);
  }, mat, 40, 30);
}

// Poing ferme (gant) : origine au poignet, le poing pend dessous.
export function fist(mat, s = 1, side = 1) {
  const g = new THREE.Group();
  const f = sculptSphere((d, out) => {
    // Plus large aux phalanges (bas / avant), poignet resserre.
    const k = 1 - 0.22 * Math.max(0, d.y);
    out.set(d.x * 0.05 * s * k, d.y * 0.058 * s, (d.z * 0.056 + 0.006 * (1 - d.y)) * s * k);
  }, mat, 18, 14);
  f.position.y = -0.05 * s;
  g.add(f);
  const thumb = sculptSphere((d, out) => { out.set(d.x * 0.02 * s, d.y * 0.034 * s, d.z * 0.022 * s); }, mat, 10, 8);
  thumb.position.set(-side * 0.036 * s, -0.045 * s, 0.04 * s);
  thumb.rotation.set(0.5, 0, side * 0.5);
  thumb.userData.noOutline = true;
  g.add(thumb);
  return g;
}

export function buildHero(cfg) {
  const group = new THREE.Group();
  const b = cfg.build || 1;
  const { skin, top, bottom, boots } = cfg;
  const gloves = cfg.gloves || skin;
  const hipY = cfg.hipY || 0.6, shoulderY = cfg.shoulderY || 1.0;
  const sw = cfg.shoulderW || 0.235 * b;
  const H = shoulderY - hipY;
  const ty = t => hipY + t * H;

  // ---- Bassin ----
  const pelvis = loft([
    [hipY - 0.13, 0.03, 0.03], [hipY - 0.1, 0.12 * b, 0.095 * b], [hipY - 0.03, 0.152 * b, 0.11 * b],
    [hipY + 0.05, 0.14 * b, 0.1 * b], [hipY + 0.09, 0.09 * b, 0.07 * b],
  ], bottom, { segs: 20, sub: 4 });
  group.add(pelvis);

  // ---- Buste : taille marquee, cage thoracique, epaules ----
  const torso = loft([
    [ty(0.08), 0.1 * b, 0.08 * b], [ty(0.16), 0.13 * b, 0.096 * b], [ty(0.3), 0.132 * b, 0.097 * b],
    [ty(0.56), 0.168 * b, 0.118 * b], [ty(0.82), 0.2 * b, 0.132 * b, 0, 0.006], [ty(1.0), 0.2 * b, 0.118 * b],
    [ty(1.11), 0.13 * b, 0.095 * b], [ty(1.19), 0.06, 0.06],
  ], top, { segs: 24, sub: 5, sq: 0.15 });
  group.add(torso);
  const neck = loft([[shoulderY + 0.02, 0.062, 0.062], [shoulderY + 0.07, 0.054, 0.056], [shoulderY + 0.13, 0.056, 0.058]], skin, { segs: 14, sub: 3 });
  group.add(neck);

  // ---- Jambes (pivot a la hanche) : pantalon + botte montante ----
  const legs = {};
  const L = hipY;
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.1 * b, hipY, 0);
    leg.add(loft([
      [0.03, 0.03, 0.03], [-0.02, 0.086 * b, 0.092 * b], [-L * 0.23, 0.082 * b, 0.088 * b],
      [-L * 0.45, 0.062 * b, 0.066 * b, 0, 0.006], [-L * 0.6, 0.066 * b, 0.07 * b, 0, -0.008], [-L * 0.74, 0.05 * b, 0.052 * b],
    ], bottom, { segs: 16, sub: 5 }));
    // Tige de botte (revers evase) + pied.
    const top_ = -L * 0.56;
    leg.add(loft([
      [top_ + 0.012, 0.06 * b, 0.064 * b, 0, -0.004], [top_, 0.084 * b, 0.088 * b, 0, -0.006], [top_ - 0.05, 0.074 * b, 0.078 * b, 0, -0.006],
      [-L + 0.09, 0.056 * b, 0.06 * b, 0, 0], [-L + 0.03, 0.06 * b, 0.068 * b, 0, 0.008], [-L, 0.058 * b, 0.066 * b, 0, 0.01],
    ], boots, { segs: 16, sub: 4 }));
    const foot = sculptSphere((d, out) => {
      // Semelle plate, bout arrondi un peu releve.
      const y = Math.max(d.y, -0.55);
      out.set(d.x * 0.07 * b * (1 - 0.2 * Math.max(0, d.z)), y * 0.062 * b + Math.max(0, d.z) * 0.012, d.z * 0.125 * b);
    }, boots, 20, 14);
    foot.position.set(0, -L + 0.034 * b, 0.05 * b);
    leg.add(foot);
    if (cfg.bootCuff) {
      leg.add(loft([
        [top_ + 0.016, 0.07 * b, 0.074 * b, 0, -0.005], [top_ + 0.006, 0.092 * b, 0.096 * b, 0, -0.006],
        [top_ - 0.03, 0.086 * b, 0.09 * b, 0, -0.006], [top_ - 0.04, 0.07 * b, 0.074 * b, 0, -0.006],
      ], cfg.bootCuff, { segs: 16, sub: 3 }));
    }
    group.add(leg);
    legs[side] = leg;
  }

  // ---- Bras (pivot a l epaule) : un seul volume, coude legerement plie ----
  const arms = {}, hands = {};
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * sw, shoulderY, 0);
    const s = side;
    arm.add(loft([
      [0.045, 0.02, 0.02, -s * 0.01], [0.012, 0.07 * b, 0.074 * b, 0], [-0.1, 0.066 * b, 0.07 * b, s * 0.018],
      [-0.2, 0.05 * b, 0.054 * b, s * 0.034, 0.002], [-0.27, 0.056 * b, 0.058 * b, s * 0.04, 0.016], [-0.375, 0.036 * b, 0.038 * b, s * 0.045, 0.042],
    ], cfg.arm || skin, { segs: 14, sub: 5 }));
    if (cfg.bracer) {
      arm.add(loft([
        [-0.212, 0.04 * b, 0.044 * b, s * 0.035, 0.004], [-0.222, 0.062 * b, 0.065 * b, s * 0.036, 0.006], [-0.28, 0.064 * b, 0.066 * b, s * 0.04, 0.018],
        [-0.355, 0.049 * b, 0.051 * b, s * 0.044, 0.037], [-0.365, 0.03 * b, 0.032 * b, s * 0.045, 0.039],
      ], cfg.bracer, { segs: 14, sub: 3 }));
    }
    const hd = fist(gloves, 1.08 * b, side);
    hd.position.set(s * 0.046, -0.365, 0.045);
    hd.rotation.x = -0.2;
    arm.add(hd);
    group.add(arm);
    arms[side] = arm;
    hands[side] = hd;
  }

  // ---- Tete (pivot au cou) ----
  const head = new THREE.Group();
  head.position.set(0, shoulderY + 0.085, 0);
  const hr = cfg.headR || 0.215;
  const skull = heroHead(hr, skin, cfg.headShape || {});
  skull.position.y = hr * 0.88;
  head.add(skull);
  if (cfg.ears !== false) {
    for (const side of [-1, 1]) {
      const ear = sculptSphere((d, out) => { out.set(d.x * hr * 0.11, d.y * hr * 0.27, d.z * hr * 0.2); }, skin, 12, 10);
      ear.position.set(side * hr * 0.98, hr * 0.78, -hr * 0.06);
      ear.rotation.set(0, side * 0.5, -side * 0.12);
      head.add(ear);
    }
  }
  // Point de la surface du visage a (x, y) dans le repere de la tete.
  const ray = new THREE.Raycaster();
  const from = new THREE.Vector3(), dir = new THREE.Vector3(0, 0, -1);
  const at = (x, y, lift = 0) => {
    skull.updateMatrix();
    skull.matrixWorld.copy(skull.matrix);
    ray.set(from.set(x, y, 5), dir);
    const hit = ray.intersectObject(skull, false)[0];
    const p = hit ? hit.point.clone() : new THREE.Vector3(x, y, 0);
    p.z += lift;
    return p;
  };

  group.add(head);
  group.userData.rig = { legL: legs[-1], legR: legs[1], armL: arms[-1], armR: arms[1], head };
  group.userData.anchors = { head, hr, b, hipY, shoulderY, legL: legs[-1], legR: legs[1], handR: hands[1], body: group };
  return {
    group, torso, pelvis, head, skull, at, headR: hr, headTop: head.position.y + hr * 1.9, hipY, shoulderY, build: b,
    handL: hands[-1], handR: hands[1], armL: arms[-1], armR: arms[1], legL: legs[-1], legR: legs[1],
  };
}

const _detail = (m) => { m.userData.noOutline = true; m.castShadow = false; return m; };

// Yeux dessines poses sur le visage : blanc en amande, iris colore,
// pupille, reflet et trait de paupiere superieure. `at` = fonction de
// surface renvoyee par buildHero. o : x, y (en rayons de tete), size,
// iris, lash (couleurs), tilt (inclinaison : + = regard determine).
export function faceEyes(head, hr, at, o = {}) {
  const w = hr * (o.size || 0.2), h = w * (o.tall || 1.2);
  const white = M(0xffffff, { r: 0.4 }), iris = M(o.iris || 0x7a4a1c, { r: 0.4 }), pupil = M(0x1a1016, { r: 0.4 });
  const lash = M(o.lash || 0x3a1c10, { r: 0.6 });
  white.name = iris.name = pupil.name = 'eye';
  const shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ex = hr * (o.x || 0.4), ey = hr * (o.y || 0.8);
  const out = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    const p = at(side * ex, ey);
    const e = hr * 0.08;
    const n = new THREE.Vector3(-(at(side * ex + e, ey).z - at(side * ex - e, ey).z) / (2 * e) * 0.6, -(at(side * ex, ey + e).z - at(side * ex, ey - e).z) / (2 * e) * 0.5, 1).normalize();
    g.position.copy(p);
    g.lookAt(p.clone().add(n));
    g.rotateZ(-side * (o.tilt || 0));
    const ball = (r, mat, x, y, z, sx, sy, sz) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      return _detail(m);
    };
    g.add(ball(1, white, 0, 0, -w * 0.12, w, h, w * 0.3));
    const lx = -side * w * 0.12, ly = -h * 0.06;
    g.add(ball(1, iris, lx, ly, -w * 0.02, h * 0.66, h * 0.7, w * 0.26));
    g.add(ball(1, pupil, lx, ly, w * 0.06, h * 0.36, h * 0.42, w * 0.2));
    g.add(ball(1, shine, lx + w * 0.26, ly + h * 0.3, w * 0.2, h * 0.16, h * 0.16, w * 0.08));
    // Trait de paupiere : plus epais au milieu, petite pointe exterieure.
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (1.02 - (i / 8) * 1.1);
      pts.push([Math.cos(a) * w * 1.04 * side, Math.sin(a) * h * 1.0 + h * 0.02, w * 0.16 - Math.abs(Math.cos(a)) * w * 0.14]);
    }
    g.add(_detail(tubeAlong(pts, t => hr * 0.012 + hr * 0.028 * Math.sin(Math.PI * Math.min(1, t * 1.15)), lash, { steps: 16, segs: 6 })));
    head.add(g);
    out.push(g);
  }
  return out;
}

// Sourcils epais qui suivent le front. o : y, inner, outer (rayons de
// tete), rise (pente : + = fronces / determines), thick.
export function faceBrows(head, hr, at, mat, o = {}) {
  const y = hr * (o.y || 1.1), x0 = hr * (o.inner || 0.14), x1 = hr * (o.outer || 0.66);
  const rise = hr * (o.rise !== undefined ? o.rise : 0.12);
  const th = hr * (o.thick || 0.05);
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const x = side * (x0 + (x1 - x0) * t);
      const yy = y - rise * (1 - t) + hr * 0.07 * Math.sin(t * Math.PI) - rise * 0.5 * t * t;
      pts.push(at(x, yy, hr * 0.03));
    }
    head.add(_detail(tubeAlong(pts, t => th * (1.1 - 0.75 * t), mat, { steps: 12, segs: 6 })));
  }
}

// Bouche en trait : sourire (curve > 0), en coin si tilt != 0.
export function faceSmile(head, hr, at, mat, o = {}) {
  const w = hr * (o.width || 0.24), y = hr * (o.y || 0.32);
  const curve = hr * (o.curve !== undefined ? o.curve : 0.07);
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const u = -1 + (i / 8) * 2;
    const x = (o.x || 0) * hr + u * w;
    pts.push(at(x, y + curve * u * u + (o.tilt || 0) * hr * u, hr * 0.012));
  }
  const m = _detail(tubeAlong(pts, t => hr * (o.thick || 0.028) * (0.45 + 0.55 * Math.sin(Math.PI * t)), mat, { steps: 16, segs: 6 }));
  head.add(m);
  return m;
}

// Petit nez releve (ton de peau ombre).
export function faceNose(head, hr, at, mat, o = {}) {
  const p = at(0, hr * (o.y || 0.56));
  const n = _detail(sculptSphere((d, out) => {
    out.set(d.x * hr * 0.1 * (1 - 0.3 * Math.max(0, d.y)), d.y * hr * 0.1, d.z * hr * 0.15 + Math.max(0, -d.y) * hr * 0.02);
  }, mat, 14, 10));
  n.position.set(0, p.y, p.z - hr * 0.03);
  head.add(n);
  return n;
}

// Chevelure d une seule piece : coque epaisse sur le crane, ligne de
// front, pattes devant les oreilles et nuque. o.volume (epaisseur),
// o.front (hauteur de la ligne de front), o.nape.
export function hairShell(head, hr, mat, o = {}) {
  const vol = o.volume !== undefined ? o.volume : 0.12;
  const front = o.front !== undefined ? o.front : 0.5;
  const nape = o.nape !== undefined ? o.nape : -0.55;
  const sm = (a, b_, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b_ - a))); return t * t * (3 - 2 * t); };
  const m = sculptSphere((d, out) => {
    // Ligne de cheveux selon l orientation (devant haut, cotes, nuque).
    const line = d.z > 0 ? -0.05 + (front + 0.05) * sm(0.15, 0.62, d.z) : -0.05 + (nape + 0.05) * sm(0, 0.55, -d.z);
    const k = sm(line - 0.04, line + 0.1, d.y);
    const r = hr * (0.9 + k * (0.13 + vol * (0.55 + 0.45 * Math.max(0, d.y))));
    out.set(d.x * r, d.y * r * 0.98, d.z * r * (d.z < 0 ? 1.06 : 0.97));
  }, mat, 72, 48);
  m.position.y = hr * 0.88;
  head.add(m);
  return m;
}

// Meche / pic de cheveux : part du crane dans la direction `dir`, puis
// s incline vers `sweep`. Renvoie le maillage (deja ajoute a la tete).
export function hairSpike(head, hr, mat, dir, len, r, sweep = [0, 0, 0], o = {}) {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const s = new THREE.Vector3(sweep[0], sweep[1], sweep[2]);
  const c = new THREE.Vector3(0, hr * 0.88, 0);
  const p = (k, sk) => c.clone().addScaledVector(d, hr * 0.78 + len * k).addScaledVector(s, len * sk);
  const pts = [p(0, 0), p(0.3, 0.02), p(0.62, 0.2), p(1, 0.62)];
  const m = tubeAlong(pts, t => r * Math.pow(1 - t, 0.75) * (1 + 0.25 * Math.sin(Math.PI * Math.min(1, t * 2.2))), mat, { steps: 18, segs: 9, flat: o.flat || 1 });
  head.add(m);
  return m;
}
