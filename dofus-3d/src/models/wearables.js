import * as THREE from 'three';
import { M } from './kit.js';
import { bentCone, cloth, roundBox, taper, boot, strand } from './humanoid.js';

// ===========================================================================
// Equipement visible sur les heros : chaque panoplie a son propre style
// pour chaque emplacement (coiffe, cape, amulette, anneau, bottes).
// Les pieces s accrochent aux points d attache du modele (humanoid.js :
// group.userData.anchors) et suivent donc les animations des membres.
// ===========================================================================

const STYLE = {
  bouftou: { main: 0xf4efe4, accent: 0x8a6a3a, trim: 0xd8c8a8 },
  wabbit: { main: 0xf6f0ff, accent: 0xf07a1a, trim: 0x5aa832 },
  crapaud: { main: 0x5ab84a, accent: 0x2a5a1a, trim: 0xf2e060 },
  tofu: { main: 0xffd23a, accent: 0xe8762a, trim: 0xfff0a0 },
  chafer: { main: 0xe8e0c8, accent: 0x3a3430, trim: 0x8a1a1a },
  champignon: { main: 0xc8322a, accent: 0xf2e8d0, trim: 0x8a5a3a },
  craqueleur: { main: 0x9a8a78, accent: 0x7af0ff, trim: 0x5a9a32 },
  kwakwa: { main: 0x2a2438, accent: 0xff7a2a, trim: 0xffc06a },
  minotoror: { main: 0x6a3a1e, accent: 0xe8c14a, trim: 0xf0e6c8 },
};

function mats(family) {
  const st = STYLE[family] || STYLE.bouftou;
  const glow = family === 'craqueleur' || family === 'kwakwa';
  return {
    main: M(st.main, { r: family === 'chafer' ? 0.6 : 0.8 }),
    accent: M(st.accent, glow ? { r: 0.3, emissive: st.accent, ei: 0.35 } : { r: 0.6, m: family === 'minotoror' ? 0.5 : 0 }),
    trim: M(st.trim, { r: 0.7 }),
    dark: M(0x1a1020, { r: 0.5 }),
    white: M(0xffffff, { r: 0.4 }),
    pink: M(0xf5a0b8, { r: 0.7 }),
  };
}

const sphere = (r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  return m;
};

// Petit motif de panoplie (pendentif, boucle, decoration de cuir).
function emblem(family, k, s = 1) {
  const g = new THREE.Group();
  switch (family) {
    case 'bouftou':
      for (const [x, y] of [[-0.02, 0], [0.02, 0.012], [0, -0.02]]) g.add(sphere(0.025 * s, k.main, x * s, y * s, 0));
      break;
    case 'wabbit': {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.018 * s, 0.07 * s, 8), k.accent);
      c.rotation.x = Math.PI;
      g.add(c);
      const l = bentCone(0.008 * s, 0.03 * s, 0, 0, k.trim, 5, 2);
      l.position.y = 0.035 * s;
      g.add(l);
      break;
    }
    case 'crapaud':
      g.add(sphere(0.03 * s, k.main));
      for (const sx of [-1, 1]) { g.add(sphere(0.012 * s, k.white, sx * 0.015 * s, 0.02 * s, 0.015 * s)); g.add(sphere(0.006 * s, k.dark, sx * 0.015 * s, 0.021 * s, 0.025 * s)); }
      break;
    case 'tofu':
      for (const rz of [-0.4, 0, 0.4]) { const f = bentCone(0.014 * s, 0.07 * s, 0, 0.01, rz ? k.main : k.accent, 5, 3); f.rotation.z = rz; g.add(f); }
      break;
    case 'chafer':
      g.add(sphere(0.03 * s, k.main, 0, 0, 0, 1, 1.1, 0.9));
      for (const sx of [-1, 1]) g.add(sphere(0.009 * s, k.dark, sx * 0.012 * s, 0.004 * s, 0.024 * s));
      break;
    case 'champignon': {
      g.add(sphere(0.032 * s, k.main, 0, 0.012 * s, 0, 1, 0.6, 1));
      g.add(sphere(0.008 * s, k.accent, -0.012 * s, 0.03 * s, 0.01 * s));
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01 * s, 0.012 * s, 0.03 * s, 8), k.accent);
      st.position.y = -0.012 * s;
      g.add(st);
      break;
    }
    case 'craqueleur': {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.03 * s, 0), k.accent);
      c.scale.set(0.7, 1.5, 0.7);
      g.add(c);
      break;
    }
    case 'kwakwa': {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.028 * s, 0), k.accent);
      g.add(c);
      break;
    }
    case 'minotoror': {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.022 * s, 0.007 * s, 6, 14), k.accent);
      g.add(r);
      for (const sx of [-1, 1]) {
        const h = bentCone(0.01 * s, 0.05 * s, sx * 0.02 * s, 0, k.trim, 6, 3);
        h.position.set(sx * 0.02 * s, 0.01 * s, 0);
        h.rotation.z = -sx * 0.8;
        g.add(h);
      }
      break;
    }
  }
  return g;
}

// ---------------------------------------------------------------------------
// COIFFE (repere de la tete : origine au sommet du crane)
// ---------------------------------------------------------------------------
function buildCoiffe(family, k, hr) {
  const g = new THREE.Group();
  const R = hr * 1.12;
  const dome = (mat, sy = 0.62, sr = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(R * sr, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    m.scale.set(1, sy, 1.05);
    m.castShadow = true;
    return m;
  };
  switch (family) {
    case 'bouftou': {
      // Bonnet de laine + petites cornes de belier enroulees.
      g.add(dome(k.main, 0.55));
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        g.add(sphere(R * 0.26, k.main, Math.cos(a) * R * 0.62, R * 0.35, Math.sin(a) * R * 0.62));
      }
      g.add(sphere(R * 0.34, k.main, 0, R * 0.55, 0));
      for (const sx of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.TorusGeometry(R * 0.22, R * 0.07, 8, 16, Math.PI * 1.6), k.accent);
        horn.position.set(sx * R * 0.95, R * 0.05, 0.02);
        horn.rotation.set(0, sx * Math.PI / 2, sx * 0.6);
        g.add(horn);
      }
      break;
    }
    case 'wabbit': {
      const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.92, R * 0.06, 8, 26), k.accent);
      band.rotation.x = Math.PI / 2;
      band.position.y = -R * 0.05;
      g.add(band);
      for (const sx of [-1, 1]) {
        const ear = sphere(R * 0.18, k.main, sx * R * 0.4, R * 0.75, -0.02, 0.8, 3.2, 0.5);
        ear.rotation.z = -sx * 0.2;
        g.add(ear);
        const inner = sphere(R * 0.1, k.pink, sx * R * 0.4, R * 0.75, 0.035, 0.7, 2.8, 0.4);
        inner.rotation.z = -sx * 0.2;
        g.add(inner);
      }
      const carrot = emblem('wabbit', k, 1.2);
      carrot.position.set(R * 0.6, 0, R * 0.7);
      carrot.rotation.z = 0.8;
      g.add(carrot);
      break;
    }
    case 'crapaud': {
      g.add(dome(k.main, 0.5));
      for (const sx of [-1, 1]) {
        g.add(sphere(R * 0.28, k.main, sx * R * 0.38, R * 0.4, R * 0.3));
        g.add(sphere(R * 0.2, k.white, sx * R * 0.38, R * 0.44, R * 0.45));
        g.add(sphere(R * 0.1, k.dark, sx * R * 0.38, R * 0.45, R * 0.6));
      }
      for (const [x, z] of [[-0.5, -0.5], [0.4, -0.6], [0.7, 0.1]]) g.add(sphere(R * 0.07, k.trim, x * R, R * 0.28, z * R));
      break;
    }
    case 'tofu': {
      g.add(dome(k.main, 0.5));
      for (let i = -2; i <= 2; i++) {
        const f = bentCone(R * 0.12, R * 0.9, 0, -R * 0.3, i % 2 ? k.trim : k.main, 6, 4);
        f.position.set(i * R * 0.12, R * 0.3, -R * 0.1);
        f.rotation.z = -i * 0.2;
        g.add(f);
      }
      const beak = new THREE.Mesh(new THREE.ConeGeometry(R * 0.16, R * 0.4, 8), k.accent);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, R * 0.1, R * 1.0);
      g.add(beak);
      break;
    }
    case 'chafer': {
      // Casque-crane.
      g.add(dome(k.main, 0.8));
      for (const sx of [-1, 1]) {
        g.add(sphere(R * 0.16, k.dark, sx * R * 0.3, R * 0.2, R * 0.82, 1, 1.1, 0.4));
        const h = bentCone(R * 0.1, R * 0.5, sx * R * 0.2, 0, k.main, 6, 3);
        h.position.set(sx * R * 0.6, R * 0.4, 0);
        h.rotation.z = -sx * 0.6;
        g.add(h);
      }
      const crest = roundBox(R * 0.12, R * 0.35, R * 1.2, R * 0.05, k.trim);
      crest.position.y = R * 0.6;
      g.add(crest);
      break;
    }
    case 'champignon': {
      const cap = sphere(R * 1.12, k.main, 0, R * 0.1, 0, 1, 0.5, 1);
      g.add(cap);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const rr = i % 2 ? 0.55 : 0.9;
        g.add(sphere(R * 0.13, k.accent, Math.cos(a) * R * rr, R * (i % 2 ? 0.55 : 0.4), Math.sin(a) * R * rr, 1, 0.5, 1));
      }
      g.add(sphere(R * 0.16, k.accent, 0, R * 0.64, 0, 1, 0.5, 1));
      break;
    }
    case 'craqueleur': {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(R * 0.22, 0), k.main);
        r.position.set(Math.cos(a) * R * 0.85, R * 0.05, Math.sin(a) * R * 0.85);
        r.rotation.set(a, a * 2, 0);
        g.add(r);
      }
      for (const [x, h] of [[-0.4, 0.5], [0, 0.8], [0.4, 0.55]]) {
        const c = new THREE.Mesh(new THREE.OctahedronGeometry(R * 0.2, 0), k.accent);
        c.scale.set(0.6, 1.8 * h + 0.6, 0.6);
        c.position.set(x * R, R * 0.35, R * 0.55);
        g.add(c);
      }
      break;
    }
    case 'kwakwa': {
      g.add(dome(k.main, 0.6));
      for (let i = 0; i < 6; i++) {
        const f = bentCone(R * 0.14, R * (1.2 - i * 0.1), 0, -R * 0.5, i % 2 ? k.trim : k.accent, 6, 4);
        f.position.set(0, R * 0.4, R * 0.4 - i * R * 0.18);
        f.rotation.x = -0.3 - i * 0.15;
        g.add(f);
      }
      break;
    }
    case 'minotoror': {
      g.add(dome(k.main, 0.7));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, R * 0.07, 8, 26), k.accent);
      rim.rotation.x = Math.PI / 2;
      g.add(rim);
      for (const sx of [-1, 1]) {
        const h = strand([[sx * R * 0.7, R * 0.3, 0], [sx * R * 1.3, R * 0.45, 0.02], [sx * R * 1.55, R * 0.95, 0.08]], R * 0.14, R * 0.03, k.trim, 14);
        g.add(h);
      }
      const ring = emblem('minotoror', k, 1.6);
      ring.position.set(0, R * 0.3, R * 0.95);
      g.add(ring);
      break;
    }
  }
  return g;
}

// ---------------------------------------------------------------------------
// CAPE (repere du corps : origine en haut du dos)
// ---------------------------------------------------------------------------
function buildCape(family, k, b) {
  const g = new THREE.Group();
  const w = 0.4 * b, h = 0.6;
  const opts = { curve: 0.1, flare: 0.14, spread: 0.4, wave: 0.03, waves: 3 };
  if (family === 'chafer') { opts.wave = 0.07; opts.waves = 6; }
  if (family === 'craqueleur') {
    // Plaques de roche en guise de cape + cristaux.
    for (let r = 0; r < 3; r++) {
      for (let c = -1; c <= 1; c++) {
        const p = roundBox(0.12 * b, 0.13, 0.05, 0.02, k.main);
        p.position.set(c * 0.12 * b, -0.08 - r * 0.15, -0.04 - r * 0.04);
        p.rotation.set(0.15, c * -0.25, 0);
        g.add(p);
      }
    }
    const cr = emblem('craqueleur', k, 2.4);
    cr.position.set(0, -0.2, -0.14);
    g.add(cr);
    return g;
  }
  const cape = cloth(w, h, family === 'kwakwa' ? k.main : family === 'chafer' ? k.accent : k.main, opts);
  g.add(cape);
  const collar = roundBox(w * 1.02, 0.05, 0.06, 0.02, k.trim);
  collar.position.set(0, -0.01, 0.02);
  g.add(collar);
  // Surface approximative de la cape (pour poser les motifs dessus).
  const surf = (u, t) => new THREE.Vector3(u * w / 2 * (1 + opts.spread * t), -t * h, -(opts.curve) * (1 - u * u) * (0.5 + t) - opts.flare * t * t - 0.015);
  const deco = (obj, u, t) => { obj.position.copy(surf(u, t)); g.add(obj); };
  switch (family) {
    case 'bouftou':
      for (let i = -3; i <= 3; i++) deco(sphere(0.05, k.main), i / 3.3, 0.02);
      for (const [u, t] of [[-0.4, 0.5], [0.3, 0.35], [0.1, 0.75]]) deco(emblem('bouftou', k, 2), u, t);
      break;
    case 'wabbit':
      deco(emblem('wabbit', k, 1.8), 0, 0.45);
      break;
    case 'crapaud':
      for (const [u, t] of [[-0.5, 0.3], [0.4, 0.5], [-0.1, 0.8], [0.6, 0.85]]) deco(sphere(0.03, k.trim, 0, 0, 0, 1, 1, 0.4), u, t);
      break;
    case 'tofu':
      for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) {
        const f = bentCone(0.035, 0.16, 0, -0.03, (r + c) % 2 ? k.trim : k.main, 5, 3);
        f.rotation.x = Math.PI;
        deco(f, c / 2.6, 0.3 + r * 0.25);
      }
      break;
    case 'chafer':
      deco(emblem('chafer', k, 2.2), 0, 0.35);
      break;
    case 'champignon':
      for (const [u, t] of [[-0.5, 0.25], [0.35, 0.3], [0, 0.55], [-0.35, 0.8], [0.55, 0.75]]) deco(sphere(0.045, k.accent, 0, 0, 0, 1, 1, 0.3), u, t);
      break;
    case 'kwakwa':
      for (let c = -3; c <= 3; c++) {
        const f = bentCone(0.035, 0.18, 0, -0.05, c % 2 ? k.accent : k.trim, 5, 3);
        f.rotation.x = Math.PI;
        deco(f, c / 3.4, 0.9);
      }
      break;
    case 'minotoror': {
      for (let i = -3; i <= 3; i++) deco(sphere(0.055, k.main, 0, 0, 0, 1, 0.8, 0.8), i / 3.3, 0.02);
      const clasp = emblem('minotoror', k, 1.6);
      clasp.position.set(0, -0.02, 0.06);
      g.add(clasp);
      break;
    }
  }
  return g;
}

// ---------------------------------------------------------------------------
// AMULETTE (repere du corps : origine a la base du cou, devant)
// ---------------------------------------------------------------------------
function buildAmulette(family, k, b) {
  const g = new THREE.Group();
  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.1 * b, 0.008, 5, 24, Math.PI), M(0xd8b84a, { r: 0.35, m: 0.7 }));
  chain.rotation.set(Math.PI / 2 + 0.5, 0, Math.PI);
  chain.position.set(0, 0, -0.04 * b);
  g.add(chain);
  const pend = emblem(family, k, 1.3);
  pend.position.set(0, -0.08, 0.02);
  g.add(pend);
  return g;
}

// ---------------------------------------------------------------------------
// ANNEAU (repere de la main droite)
// ---------------------------------------------------------------------------
function buildAnneau(family, k) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 18), k.accent);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  const gem = emblem(family, k, 0.8);
  gem.position.set(0, 0, 0.05);
  g.add(gem);
  g.position.y = -0.08;
  return g;
}

// ---------------------------------------------------------------------------
// BOTTES (repere de chaque jambe : origine a la hanche)
// ---------------------------------------------------------------------------
function buildBotte(family, k, b, hipY, side) {
  const g = new THREE.Group();
  const bt = boot(family === 'chafer' ? k.accent : k.main, b * 1.14, { cuff: family === 'chafer' ? k.main : k.trim, toe: 0.12 });
  g.add(bt);
  const cuffY = 0.2 * b * 1.14;
  switch (family) {
    case 'bouftou':
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; g.add(sphere(0.035, k.main, Math.cos(a) * 0.09 * b, cuffY + 0.02, Math.sin(a) * 0.09 * b)); }
      break;
    case 'tofu':
    case 'kwakwa':
      for (const rz of [-0.6, 0, 0.6]) {
        const f = bentCone(0.025, 0.12, 0, 0, family === 'tofu' ? k.accent : k.accent, 5, 3);
        f.position.set(side * 0.08 * b, cuffY, 0);
        f.rotation.set(0, 0, -side * (0.9 + rz * 0.3));
        g.add(f);
      }
      break;
    case 'wabbit':
      g.add(sphere(0.06, k.main, 0, cuffY + 0.02, -0.02, 1.3, 0.8, 1.3));
      break;
    case 'crapaud':
      g.add(sphere(0.06, k.main, 0, 0.02, 0.14 * b, 1.4, 0.35, 1));
      break;
    case 'chafer':
      for (const z of [-0.05, 0.03]) {
        const s = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07, 6), k.main);
        s.position.set(side * 0.085 * b, cuffY - 0.04, z);
        s.rotation.z = -side * Math.PI / 2;
        g.add(s);
      }
      break;
    case 'champignon':
      for (const [x, y] of [[0.05, 0.1], [-0.04, 0.15], [0.02, 0.05]]) g.add(sphere(0.018, k.accent, x * b, y, 0.075 * b));
      break;
    case 'craqueleur':
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), i === 0 ? k.accent : k.main); r.position.set(Math.cos(a) * 0.09 * b, cuffY - 0.02, Math.sin(a) * 0.09 * b); g.add(r); }
      break;
    case 'minotoror': {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.09 * b, 0.012, 6, 18), k.accent);
      r.rotation.x = Math.PI / 2;
      r.position.y = cuffY - 0.06;
      g.add(r);
      break;
    }
  }
  g.position.y = -hipY;
  return g;
}

// Attache l equipement `items` au modele `model` (heros construit sur
// humanoid.js). Renvoie la liste des objets 3D ajoutes.
export function attachWearables(model, items = []) {
  let anchors = model.userData && model.userData.anchors;
  if (!anchors) model.traverse(o => { if (!anchors && o.userData && o.userData.anchors) anchors = o.userData.anchors; });
  if (!anchors || !items.length) return [];
  const { head, hr, b, hipY, shoulderY, legL, legR, handR, body } = anchors;
  const added = [];
  const put = (parent, obj) => { obj.userData.wearable = true; parent.add(obj); added.push(obj); };
  for (const it of items) {
    const k = mats(it.family);
    if (it.slot === 'coiffe') {
      const c = buildCoiffe(it.family, k, hr);
      c.position.set(0, hr * 1.7, 0);
      put(head, c);
      model.traverse(o => { if (o.name === 'classHat') o.visible = false; });
    } else if (it.slot === 'cape') {
      const c = buildCape(it.family, k, b);
      c.position.set(0, shoulderY + 0.05, -0.15 * b);
      c.rotation.x = 0.1;
      put(body, c);
      model.traverse(o => { if (o.name === 'classCape') o.visible = false; });
    } else if (it.slot === 'amulette') {
      const a = buildAmulette(it.family, k, b);
      a.position.set(0, shoulderY + 0.01, 0.13 * b);
      put(body, a);
    } else if (it.slot === 'anneau') {
      if (handR) put(handR, buildAnneau(it.family, k));
    } else if (it.slot === 'bottes') {
      if (legL) put(legL, buildBotte(it.family, k, b, hipY, -1));
      if (legR) put(legR, buildBotte(it.family, k, b, hipY, 1));
    }
  }
  return added;
}

// Retire l equipement precedemment attache (et rend la coiffe / cape de
// classe visibles).
export function detachWearables(model) {
  const rm = [];
  model.traverse(o => { if (o.userData && o.userData.wearable) rm.push(o); });
  for (const o of rm) o.parent && o.parent.remove(o);
  model.traverse(o => { if (o.name === 'classHat' || o.name === 'classCape') o.visible = true; });
}
