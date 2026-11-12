// ===========================================================================
// Exploration d une region (mode Aventure "monde ouvert").
// Le heros de tete se promene librement sur la carte de la region (pas de
// PM), ses compagnons le suivent. Des groupes de monstres attendent sur
// des cases : on les touche (ou on s arrete a cote) pour voir leur
// composition puis lancer le combat, sur cette meme carte.
//  - Chaque groupe appartient a une TRANCHE (une evolution de la famille).
//    Battre un groupe de la tranche k fait apparaitre la tranche k+1.
//  - Le portail du donjon s ouvre quand l avant-derniere tranche (les
//    chefs) est vaincue.
//  - Feu de camp : soigne l equipe (les PV se conservent d un combat a
//    l autre dans la region). Coffre : s ouvre toutes les 3 victoires.
//    Groupe rare (dore) : plus fort, lache un objet en plus.
// Une seule petite carte d information a l ecran a la fois.
// ===========================================================================

import * as THREE from 'three';
import { Character3D } from './Character3D.js';
import { bfs, pathTo } from './Path.js';
import { MAP_SIZE } from './Map3D.js';
import { toonify } from './Toon.js';
import { DEFS } from './Fighter.js';
import { getHero } from './Leveling.js';
import { getAvatar, getPortrait } from './Avatars.js';
import { equippedList, chestLoot, addItems, itemIcon, statLines, RARITY } from './Items.js';
import { bandComposition } from './Bestiary.js';
import { recordBand } from './Progress.js';
import { WORLD_ZONES, zoneProgress, bandStripHtml, diffInfo } from './WorldMap.js';
import { REVIVE_HP } from './Adventure.js';

const KEY = 'dofus3d.explore';
const GROUP_TARGET = 5;      // groupes visibles dans une region
const GROUP_LOW = 2;         // en dessous, de nouveaux groupes arrivent
export const CHEST_WINS = 3; // victoires pour ouvrir le coffre
const STEP_MS = 150;         // duree d un pas

function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { return {}; }
}
function saveAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (_) {}
}

const key = (c, r) => c + ',' + r;
const manhattan = (a, b) => Math.abs(a.c - b.c) + Math.abs(a.r - b.r);

function monsterIcon(id) {
  let url = null;
  try { url = getAvatar(id, 128); } catch (_) {}
  return url ? `<img src="${url}" alt="">` : '';
}
function heroIcon(id) {
  let url = null;
  try { url = getPortrait(id, 128, equippedList(id)); } catch (_) {}
  return url ? `<img src="${url}" alt="">` : '';
}

const ICONS = {
  map: '<svg viewBox="0 0 24 24"><path d="M2 5l6-2 8 2 6-2v16l-6 2-8-2-6 2z" fill="#e8d59a" stroke="#3a2408" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 3v16M16 5v16" stroke="#b89a5a" stroke-width="1.4"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 9h14l1.5 10a2 2 0 0 1-2 2.2H5.500a2 2 0 0 1-2-2.200z" fill="#b9783a" stroke="#3a2408" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.500 9V7a3.500 3.500 0 0 1 7 0v2" fill="none" stroke="#3a2408" stroke-width="1.800"/><rect x="10" y="12" width="4" height="3.500" rx="1" fill="#ffcf5a" stroke="#3a2408" stroke-width="1.200"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 4.500h6.500a2 2 0 0 1 1.500.700 2 2 0 0 1 1.500-.700H20v14h-6.500a2 2 0 0 0-1.500.700 2 2 0 0 0-1.500-.700H4z" fill="#7a4fb0" stroke="#22103a" stroke-width="1.600" stroke-linejoin="round"/><path d="M12 5.500v13.500" stroke="#22103a" stroke-width="1.400"/><path d="M15 9l1 2 2 .300-1.500 1.400.400 2-1.900-1-1.900 1 .400-2L12 11.300" fill="#ffcf5a"/></svg>',
};

// ---------------------------------------------------------------------------
// Decors 3D : portail du donjon, feu de camp, coffre.
// ---------------------------------------------------------------------------
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });

function buildGate(open) {
  const g = new THREE.Group();
  const stone = std(0x8d8a96), dark = std(0x5d5a68);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.1, 0.5), dark);
  base.position.y = 0.1;
  g.add(base);
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.25, 0.3), stone);
    p.position.set(sx * 0.38, 0.75, 0);
    g.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.38), dark);
    cap.position.set(sx * 0.38, 1.4, 0);
    g.add(cap);
  }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 8, 14, Math.PI), stone);
  arch.position.y = 1.42;
  g.add(arch);
  const keystone = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.34), std(open ? 0xffcf5a : 0x6d6a78));
  keystone.position.y = 1.82;
  g.add(keystone);
  // Voile du portail : violet lumineux s il est ouvert, pierre sombre sinon.
  const veilMat = new THREE.MeshBasicMaterial({ color: open ? 0xb46aff : 0x2c2a34, transparent: open, opacity: open ? 0.88 : 1, side: THREE.DoubleSide });
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.3), veilMat);
  veil.position.y = 0.8;
  g.add(veil);
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16, 0, Math.PI), veilMat);
  top.position.y = 1.44;
  g.add(top);
  if (!open) {
    for (const x of [-0.16, 0, 0.16]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.06), std(0x3a3842));
      bar.position.set(x, 0.85, 0.02);
      g.add(bar);
    }
  }
  toonify(g, { width: 0.02, minRadius: 0.1 });
  g.userData.veil = open ? veilMat : null;
  return g;
}

function buildCampfire() {
  const g = new THREE.Group();
  const wood = std(0x7a4a22), rock = std(0x8a8a8a);
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), wood);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = i * Math.PI / 3;
    log.position.y = 0.12;
    g.add(log);
  }
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), rock);
    s.position.set(Math.cos(a) * 0.36, 0.09, Math.sin(a) * 0.36);
    g.add(s);
  }
  const flames = [];
  const cols = [0xff7a1a, 0xffc23a, 0xfff2a0];
  cols.forEach((col, i) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.2 - i * 0.055, 0.6 - i * 0.14, 7), new THREE.MeshBasicMaterial({ color: col }));
    f.position.y = 0.42 - i * 0.05;
    g.add(f);
    flames.push(f);
  });
  toonify(g, { width: 0.018, minRadius: 0.08 });
  g.userData.flames = flames;
  return g;
}

function buildChest() {
  const g = new THREE.Group();
  const wood = std(0x9a5a26), gold = std(0xffc94a, { metalness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.32, 0.42), wood);
  body.position.y = 0.22;
  g.add(body);
  const lid = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.62, 10, 1, false, 0, Math.PI), wood);
  top.rotation.z = Math.PI / 2;
  top.rotation.y = Math.PI / 2;
  lid.add(top);
  for (const x of [-0.2, 0.2]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.45), gold);
    band.position.set(x, 0.22, 0);
    g.add(band);
  }
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.05), gold);
  lock.position.set(0, 0.32, 0.22);
  g.add(lock);
  lid.position.y = 0.38;
  g.add(lid);
  toonify(g, { width: 0.018, minRadius: 0.08 });
  g.userData.lid = lid;
  return g;
}

// ---------------------------------------------------------------------------
export class Explore {
  constructor({ scene3d, map3d, picker, audio, onFight, onDungeon, onLeave, onOverlay }) {
    this.scene3d = scene3d;
    this.map3d = map3d;
    this.picker = picker;
    this.audio = audio || null;
    this.onFight = onFight;
    this.onDungeon = onDungeon;
    this.onLeave = onLeave;
    this.onOverlay = onOverlay;

    this.zone = null;      // index de la region exploree (null = hors exploration)
    this.z = null;
    this.fight = null;     // groupe en cours de combat
    this.covered = false;  // inventaire / grimoire ouverts par-dessus
    this.classes = [];
    this.hp = {};          // PV restants (ratio) par heros, conserves dans la region
    this.pos = null;       // case du heros de tete
    this.state = null;     // { groups, seq, wins } (sauvegarde par region)
    this.card = null;
    this._gen = 0;
    this._insets = [0, 0];
    this.objects = [];     // portail, feu, coffre : { kind, c, r, mesh, label }
    this.heroes = [];      // Character3D (tete + suiveurs)
    this.holders = new Map(); // id du groupe -> { holder, chars, labelY }
    this._buildDom();
    window.addEventListener('resize', () => { if (this.inRegion) this._measure(); });
  }

  get inRegion() { return this.zone !== null; }
  // Vrai quand le joueur peut se promener (ni combat, ni menu par-dessus).
  get active() { return this.zone !== null && !this.fight && !this.covered; }

  // ---------- Entree / sortie ----------
  enter(zoneIndex, classes, opts = {}) {
    const same = opts.keep && this._lastZone === zoneIndex;
    this._teardown();
    this.zone = zoneIndex;
    this._lastZone = zoneIndex;
    this.z = WORLD_ZONES[zoneIndex];
    this.classes = classes.slice();
    this.fight = null;
    this.covered = false;
    this.card = null;
    if (!same) { this.hp = {}; this.pos = null; }
    this.map3d.rebuild(this.z.mapId);
    const all = loadAll();
    this.state = all[this.z.combatId] || { groups: [], seq: 1, wins: 0 };
    this._layout();
    this._fillGroups(true);
    this._save();
    this._show();
    if (!same) this.toast(this._goalText(), 3200);
  }

  // Retour a la carte du monde.
  leave() {
    this._teardown();
    this.zone = null;
    this.fight = null;
    document.body.classList.remove('exploring');
    this.root.style.display = 'none';
    this.scene3d.setInsets(0, 0);
    this.onLeave && this.onLeave();
  }

  _show() {
    document.body.classList.add('exploring', 'in-menu');
    this.root.style.display = '';
    this._build3d();
    this._renderUi();
    this._frameCamera();
  }

  // Telephone tenu debout : la carte ne tient pas en largeur, la camera
  // recule un peu et suit le heros. En paysage, toute la carte est visible.
  _follows() { return window.innerHeight > window.innerWidth; }
  // La camera reste au-dessus de la carte (pas sur la foret autour).
  _camClamp(v) { return Math.max(4, Math.min(MAP_SIZE - 5, v)); }
  _frameCamera() {
    const s = this.scene3d;
    s.resetCamera();
    if (this._follows()) {
      s.distance = 27;
      s.target.x = this._camClamp(this.pos.c);
      s.target.z = this._camClamp(this.pos.r);
    }
    s.updateCamera();
  }

  // Retire tout ce que l exploration a pose dans la scene.
  _teardown() {
    this._gen++;
    this._running = false;
    this._pending = null;
    for (const h of this.heroes) this.scene3d.scene.remove(h.group);
    this.heroes = [];
    for (const g of this.holders.values()) this.scene3d.scene.remove(g.holder);
    this.holders.clear();
    for (const o of this.objects) if (o.mesh) { this.scene3d.scene.remove(o.mesh); o.mesh = null; }
    this.picker.setHover(null);
    this.labelsEl.innerHTML = '';
    this._labels = [];
  }

  _save() {
    const all = loadAll();
    all[this.z.combatId] = this.state;
    saveAll(all);
  }

  // ---------- Terrain ----------
  _grid() { return this.map3d.getData(); }
  _walkable(c, r) {
    if (c < 0 || r < 0 || c >= MAP_SIZE || r >= MAP_SIZE) return false;
    const t = this._grid()[r][c];
    return t === 0 || t === 3;
  }
  _floor(c, r) { return this._walkable(c, r) && this._grid()[r][c] === 0; }
  _occupied(except = null) {
    const s = new Set();
    for (const o of this.objects) s.add(key(o.c, o.r));
    for (const g of this.state.groups) if (g !== except) s.add(key(g.c, g.r));
    return s;
  }
  _bfs(from, occupied = this._occupied()) {
    return bfs(this._grid(), occupied, from, 999, (c, r) => !this._walkable(c, r));
  }
  // Une case peut recevoir un objet / un groupe si elle ne coupe aucun
  // chemin : toutes les autres cases restent accessibles depuis l entree.
  _keepsPaths(c, r) {
    const occ = this._occupied();
    const before = this._bfs(this.entrance, occ).dist.size;
    occ.add(key(c, r));
    return this._bfs(this.entrance, occ).dist.size === before - 1;
  }
  _nearestFloor(ac, ar, ok) {
    let best = null, bd = 1e9;
    for (let r = 0; r < MAP_SIZE; r++) for (let c = 0; c < MAP_SIZE; c++) {
      if (!this._floor(c, r)) continue;
      const d = Math.abs(c - ac) + Math.abs(r - ar);
      if (d < bd && (!ok || ok(c, r))) { bd = d; best = { c, r }; }
    }
    return best;
  }

  // Emplacements fixes de la region : entree (ouest), feu de camp a cote,
  // portail du donjon a l est, coffre dans un coin.
  _layout() {
    this.objects = [];
    this.entrance = this._nearestFloor(2, 7) || { c: 0, r: 0 };
    const place = (kind, ac, ar) => {
      const reach = this._bfs(this.entrance).dist;
      const t = this._nearestFloor(ac, ar, (c, r) => reach.has(key(c, r))
        && !(c === this.entrance.c && r === this.entrance.r)
        && !this.objects.some(o => manhattan(o, { c, r }) < 2)
        && this._keepsPaths(c, r));
      if (t) this.objects.push({ kind, c: t.c, r: t.r, mesh: null });
    };
    place('camp', 1, 9);
    place('gate', 13, 7);
    place('chest', 12, 1);
    if (!this.pos || !this._walkable(this.pos.c, this.pos.r) || this._occupied().has(key(this.pos.c, this.pos.r))) {
      this.pos = { ...this.entrance };
    }
  }

  // ---------- Groupes de monstres ----------
  _heroLevel() {
    return Math.max(1, ...this.classes.map(id => getHero(id).level));
  }
  _comp(g) {
    const comp = bandComposition(this.z.family, g.band, g.size, this.classes.length);
    // Groupe rare : un monstre de l evolution de la tranche en plus.
    if (g.rare) comp.push(this.z.bands[g.band - 1].id);
    return comp;
  }
  _groupInfo(g) {
    const comp = this._comp(g);
    const lvs = comp.map(id => DEFS[id].level);
    const min = Math.min(...lvs), max = Math.max(...lvs);
    const avg = lvs.reduce((a, b) => a + b, 0) / lvs.length;
    const diff = diffInfo(avg + (comp.length - 2 - this.classes.length) * 1.2 - this._heroLevel());
    return { comp, min, max, range: min === max ? `${min}` : `${min}-${max}`, diff };
  }

  _freeTile() {
    const reach = this._bfs(this.entrance).dist;
    const occ = this._occupied();
    const cands = [];
    for (let r = 0; r < MAP_SIZE; r++) for (let c = 0; c < MAP_SIZE; c++) {
      if (!this._floor(c, r) || !reach.has(key(c, r)) || occ.has(key(c, r))) continue;
      const t = { c, r };
      const dh = Math.min(manhattan(t, this.pos), manhattan(t, this.entrance));
      const dg = Math.min(99, ...this.state.groups.map(g => manhattan(g, t)));
      const dob = Math.min(99, ...this.objects.map(o => manhattan(o, t)));
      // Pas colle au heros, ni aux autres groupes, ni aux decors.
      const score = Math.min(dh - 1, dg, dob + 1);
      cands.push({ c, r, score });
    }
    cands.sort((a, b) => b.score - a.score);
    // Parmi les cases bien degagees, on tire au hasard.
    const good = cands.filter(t => t.score >= 3);
    const pool = good.length >= 4 ? good : cands.slice(0, 8);
    for (let n = 0; n < 12 && pool.length; n++) {
      const i = Math.floor(Math.random() * pool.length);
      const t = pool.splice(i, 1)[0];
      if (this._keepsPaths(t.c, t.r)) return t;
    }
    return null;
  }

  _addGroup(band, size, rare = false) {
    const t = this._freeTile();
    if (!t) return null;
    const g = { id: this.state.seq++, band, size, c: t.c, r: t.r };
    if (rare) g.rare = true;
    this.state.groups.push(g);
    return g;
  }

  // Complete les groupes de la region : toujours un groupe de la tranche
  // la plus haute accessible, le reste reparti sur les tranches connues.
  _fillGroups(force = false) {
    const st = this.state;
    const pr = zoneProgress(this.z);
    const top = Math.min(pr.total, pr.best + 1);
    // Sauvegarde ancienne / carte modifiee : on ecarte les groupes mal places.
    const seen = new Set(this.objects.map(o => key(o.c, o.r)));
    st.groups = st.groups.filter(g => {
      const k = key(g.c, g.r);
      if (!this._floor(g.c, g.r) || seen.has(k) || g.band > pr.total) return false;
      seen.add(k);
      return true;
    });
    for (const g of st.groups) if (g.c === this.pos.c && g.r === this.pos.r) this.pos = { ...this.entrance };
    const normal = () => st.groups.filter(g => !g.rare);
    const before = st.groups.length;
    if (!normal().some(g => g.band === top)) this._addGroup(top, Math.random() < 0.5 ? 0 : 1);
    if (force || normal().length <= GROUP_LOW) {
      let guard = 0;
      while (normal().length < GROUP_TARGET && guard++ < 12) {
        let band;
        if (top > 1 && !normal().some(g => g.band === top - 1)) band = top - 1;
        else band = 1 + Math.floor(Math.max(Math.random(), Math.random()) * top);
        if (!this._addGroup(band, Math.floor(Math.random() * 3))) break;
      }
      // Parfois, un groupe rare (dore) rode dans la region.
      if (pr.best >= 1 && !st.groups.some(g => g.rare) && Math.random() < 0.4) this._addGroup(top, 2, true);
    }
    return st.groups.length - before;
  }

  // ---------- Scene 3D ----------
  _hideExtras(ch, keepRing = false) {
    for (const child of ch.group.children) {
      if (child === ch.body) continue;
      child.visible = keepRing && child !== ch.hpBar.sprite && child !== ch.turnRing;
    }
  }

  _build3d() {
    const scene = this.scene3d.scene;
    // Heros : celui de tete sur sa case, les autres juste derriere.
    const taken = new Set([key(this.pos.c, this.pos.r)]);
    const occ = this._occupied();
    this.trail = [];
    this.heroes = this.classes.map((cls, i) => {
      let t = this.pos;
      if (i > 0) {
        t = this._nearestFloor(this.pos.c, this.pos.r, (c, r) => !taken.has(key(c, r)) && !occ.has(key(c, r))) || this.pos;
        taken.add(key(t.c, t.r));
        this.trail.push({ ...t });
      }
      const ch = new Character3D(scene, cls, 'player', t.c, t.r);
      try { ch.wearEquipment(equippedList(cls)); } catch (_) {}
      this._hideExtras(ch, i === 0);
      if (i > 0) ch.group.scale.setScalar(0.88);
      return ch;
    });
    this.lead = this.heroes[0];

    for (const g of this.state.groups) this._buildGroup(g);
    const pr = zoneProgress(this.z);
    for (const o of this.objects) {
      o.mesh = o.kind === 'gate' ? buildGate(pr.dungeonOpen) : o.kind === 'camp' ? buildCampfire() : buildChest();
      o.mesh.position.set(o.c, 0.05, o.r);
      // Le portail fait face a la camera.
      if (o.kind === 'gate') o.mesh.rotation.y = Math.PI / 4;
      if (o.kind === 'chest') o.mesh.rotation.y = -Math.PI / 4;
      scene.add(o.mesh);
    }
    this._faceAll();
    this._buildLabels();
  }

  _buildGroup(g) {
    const comp = this._comp(g).slice().sort((a, b) => DEFS[b].level - DEFS[a].level);
    const holder = new THREE.Group();
    holder.position.set(g.c, 0, g.r);
    // Le meneur au centre, un ou deux suivants en retrait.
    const shown = comp.length >= 4 ? 3 : Math.min(2, comp.length);
    const spots = shown === 1 ? [[0, 0, 0.9]] : shown === 2 ? [[-0.14, 0.1, 0.82], [0.3, -0.24, 0.58]]
      : [[0, 0.12, 0.82], [-0.34, -0.22, 0.56], [0.34, -0.22, 0.56]];
    const chars = [];
    let labelY = 1.4;
    for (let i = 0; i < shown; i++) {
      const ch = new Character3D(this.scene3d.scene, comp[i], 'enemy', 0, 0);
      this.scene3d.scene.remove(ch.group);
      this._hideExtras(ch);
      ch.group.position.set(spots[i][0], 0, spots[i][1]);
      ch.group.scale.setScalar(spots[i][2]);
      if (i === 0) labelY = ch.hpBar.sprite.position.y * spots[i][2] + 0.12;
      holder.add(ch.group);
      chars.push(ch);
    }
    if (g.rare) {
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 28), new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: 0.9, depthWrite: false }));
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.07;
      holder.add(halo);
    }
    this.scene3d.scene.add(holder);
    this.holders.set(g.id, { holder, chars, labelY });
  }

  // Les groupes regardent le heros.
  _faceAll() {
    if (!this.lead) return;
    const p = this.lead.group.position;
    for (const g of this.state.groups) {
      const h = this.holders.get(g.id);
      if (h) h.holder.rotation.y = Math.atan2(p.x - g.c, p.z - g.r);
    }
  }

  // ---------- Interface ----------
  _buildDom() {
    const root = document.createElement('div');
    root.id = 'explore-root';
    root.style.display = 'none';
    root.innerHTML = `
      <div class="ex-labels"></div>
      <div class="ex-top"></div>
      <div class="ex-toast"></div>
      <div class="ex-card"></div>
      <div class="ex-bar">
        <div class="ex-team"></div>
        <div class="ex-btns">
          <button class="ex-btn" data-a="map">${ICONS.map}<span>Carte</span></button>
          <button class="ex-btn" data-a="inventory">${ICONS.bag}<span>Sac</span></button>
          <button class="ex-btn" data-a="grimoire">${ICONS.book}<span>Sorts</span></button>
        </div>
      </div>`;
    document.body.appendChild(root);
    this.root = root;
    this.topEl = root.querySelector('.ex-top');
    this.labelsEl = root.querySelector('.ex-labels');
    this.toastEl = root.querySelector('.ex-toast');
    this.cardEl = root.querySelector('.ex-card');
    this.barEl = root.querySelector('.ex-bar');
    this.teamEl = root.querySelector('.ex-team');
    root.querySelectorAll('.ex-btn').forEach(b => b.addEventListener('click', () => {
      if (!this.active) return;
      this.audio && this.audio.sfx('uiClick');
      const a = b.dataset.a;
      if (a === 'map') this.leave();
      else this._openOverlay(a);
    }));
    this.labelsEl.addEventListener('click', (e) => {
      const el = e.target.closest('.ex-label');
      if (!el || !this.active) return;
      const thing = this._thingById(el.dataset.id);
      if (thing) { this.audio && this.audio.sfx('uiSelect'); this._interact(thing); }
    });
    this.cardEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || !this.active) return;
      this.audio && this.audio.sfx('uiClick');
      const act = b.dataset.act;
      if (act === 'close') this.closeCard();
      else if (act === 'fight') this._startFight();
      else if (act === 'dungeon') this._startDungeon();
    });
  }

  // Inventaire / grimoire : le menu s ouvre par-dessus, puis on revient.
  _openOverlay(view) {
    if (!this.onOverlay) return;
    this.closeCard();
    this.covered = true;
    this.root.style.display = 'none';
    this.onOverlay(view, () => {
      this.covered = false;
      document.body.classList.add('exploring', 'in-menu');
      this.root.style.display = '';
      // L equipement a pu changer : on rhabille les heros.
      this.heroes.forEach((ch, i) => { try { ch.wearEquipment(equippedList(this.classes[i])); } catch (_) {} });
      this._renderUi();
    });
  }

  _goalText() {
    const z = this.z, pr = zoneProgress(z);
    if (pr.complete) return 'Region terminee ! Tu peux continuer a t entrainer ici.';
    if (pr.best < pr.total - 1) return `But : battre un groupe mene par ${z.bands[pr.best].name}`;
    if (!pr.dungeonDone) return `But : entrer dans le donjon et vaincre ${DEFS[z.dungeon.boss].name}`;
    return `But : battre le groupe de ${z.bands[pr.total - 1].name}`;
  }

  _renderUi() {
    const z = this.z, pr = zoneProgress(z);
    this.topEl.innerHTML = `
      <div class="ex-head"><b>${z.name}</b><span>${this._goalText()}</span></div>
      <div class="ex-bands evo-strip">${bandStripHtml(z, monsterIcon, pr.best)}
        <span class="evo-arrow">&#9654;</span>
        <span class="evo-i dg ${pr.dungeonDone ? 'done' : pr.dungeonOpen ? 'cur' : 'lock'}" title="Donjon">${monsterIcon(z.dungeon.boss)}<i>Donjon</i>${pr.dungeonDone ? '<u>&#10003;</u>' : ''}</span>
      </div>`;
    this.teamEl.innerHTML = this.classes.map(cls => {
      const r = this.hp[cls] === undefined ? 1 : this.hp[cls];
      const col = r > 0.5 ? '#7fd34a' : r > 0.25 ? '#ffb02a' : '#ff5a4a';
      return `<span class="ex-hero">${heroIcon(cls)}<i>${getHero(cls).level}</i><em><b style="width:${Math.round(r * 100)}%;background:${col}"></b></em></span>`;
    }).join('');
    this._renderCard();
    this._refreshLabels();
    this._measure();
  }

  // Hauteurs prises par le bandeau et la barre : la camera recentre la carte.
  _measure() {
    const t = this.topEl.getBoundingClientRect(), b = this.barEl.getBoundingClientRect();
    const portrait = window.innerHeight > window.innerWidth;
    // En paysage la barre du bas n occupe que les coins.
    this._insets = [Math.round(t.bottom), portrait ? Math.round(window.innerHeight - b.top) : 0];
    this._barH = Math.round(window.innerHeight - b.top);
  }

  _thingById(id) {
    if (!this.state) return null;
    if (id[0] === 'g') return this.state.groups.find(g => 'g' + g.id === id) || null;
    return this.objects.find(o => o.kind === id) || null;
  }
  _thingAt(c, r) {
    return this.state.groups.find(g => g.c === c && g.r === r) || this.objects.find(o => o.c === c && o.r === r) || null;
  }

  _buildLabels() {
    this._labels = [];
    const mk = (id, cls, y, thing) => {
      const el = document.createElement('button');
      el.className = 'ex-label ' + cls;
      el.dataset.id = id;
      this.labelsEl.appendChild(el);
      this._labels.push({ el, thing, y, v: new THREE.Vector3() });
    };
    this.labelsEl.innerHTML = '';
    for (const g of this.state.groups) mk('g' + g.id, 'grp' + (g.rare ? ' rare' : ''), this.holders.get(g.id).labelY, g);
    for (const o of this.objects) mk(o.kind, 'obj ' + o.kind, o.kind === 'gate' ? 2.1 : 0.95, o);
    this._refreshLabels();
  }

  _refreshLabels() {
    if (!this._labels) return;
    const pr = zoneProgress(this.z);
    for (const l of this._labels) {
      const t = l.thing;
      if (t.kind === 'gate') {
        l.el.innerHTML = pr.dungeonDone ? 'Donjon &#10003;' : pr.dungeonOpen ? 'Donjon' : 'Donjon ferme';
        l.el.classList.toggle('open', pr.dungeonOpen);
      } else if (t.kind === 'camp') {
        l.el.textContent = 'Repos';
      } else if (t.kind === 'chest') {
        const ready = this.state.wins >= CHEST_WINS;
        l.el.textContent = ready ? 'Coffre !' : `Coffre ${this.state.wins}/${CHEST_WINS}`;
        l.el.classList.toggle('open', ready);
      } else {
        const info = this._groupInfo(t);
        l.el.style.setProperty('--c', info.diff.color);
        l.el.innerHTML = `${t.rare ? '<s>&#9733;</s>' : ''}<b>x${info.comp.length}</b>Niv. ${info.range}`;
        l.el.classList.toggle('sel', !!(this.card && this.card.thing === t));
      }
      l.w = 0;
    }
  }

  toast(text, ms = 2600) {
    this.toastEl.innerHTML = text;
    this.toastEl.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.remove('show'), ms);
  }

  closeCard() {
    if (!this.card) return;
    this.card = null;
    this._renderCard();
    this._refreshLabels();
  }

  _openCard(thing, extra = null) {
    this.card = { thing, extra };
    this.toastEl.classList.remove('show');
    this._renderCard();
    this._refreshLabels();
  }

  _renderCard() {
    const card = this.card;
    this.cardEl.classList.toggle('show', !!card);
    if (!card) { this.cardEl.innerHTML = ''; return; }
    const z = this.z, t = card.thing;
    const close = '<button class="ex-x" data-act="close" aria-label="Fermer">&#10005;</button>';
    if (t.kind === 'gate') {
      const pr = zoneProgress(z), d = z.dungeon;
      const diff = diffInfo(d.level - this._heroLevel());
      this.cardEl.innerHTML = `${close}
        <div class="ex-crow"><div class="ex-faces">${monsterIcon(d.boss)}</div>
          <div class="ex-ctxt"><b>${d.name}</b>
          <span>${d.rooms.length} salles a la suite, puis ${DEFS[d.boss].name} (niv. ${d.level}). Un coffre attend au bout.</span>
          <span style="color:${diff.color}">${diff.label} pour ton equipe${pr.dungeonDone ? ' - deja vaincu' : ''}</span></div></div>
        ${pr.dungeonOpen ? '<button class="ex-go dungeon" data-act="dungeon">ENTRER DANS LE DONJON</button>'
          : `<div class="ex-lock">Portail ferme : bats d abord un groupe mene par ${z.bands[pr.total - 2].name}.</div>`}`;
      return;
    }
    if (t.kind === 'chest') {
      const it = card.extra;
      const R = RARITY[it.rarity] || { color: '#fff', label: '' };
      this.cardEl.innerHTML = `${close}
        <div class="ex-crow"><div class="ex-item">${itemIcon(it, 48)}</div>
          <div class="ex-ctxt"><b>Coffre ouvert !</b>
          <span style="color:${R.color}">${it.name} (${R.label}, niv. ${it.level})</span>
          <span>${statLines(it.stats).join(' - ')}</span></div></div>
        <button class="ex-go" data-act="close">DANS LE SAC</button>`;
      return;
    }
    const info = this._groupInfo(t);
    const band = z.bands[t.band - 1];
    const faces = info.comp.slice().sort((a, b) => DEFS[b].level - DEFS[a].level)
      .map(id => `<span class="ex-face">${monsterIcon(id)}<i>${DEFS[id].level}</i></span>`).join('');
    const hurt = this.classes.some(c => (this.hp[c] === undefined ? 1 : this.hp[c]) < 0.5);
    this.cardEl.innerHTML = `${close}
      <div class="ex-ctxt"><b>${t.rare ? '&#9733; Groupe rare' : 'Groupe'} : ${band.name}</b>
        <span>Evolution ${t.band} / ${z.bands.length} - niv. ${info.range} - <em style="color:${info.diff.color}">${info.diff.label}</em>${t.rare ? ' - objet en plus' : ''}</span></div>
      <div class="ex-facerow">${faces}</div>
      ${hurt ? '<div class="ex-lock">Equipe blessee : repose-toi au feu de camp avant de combattre.</div>' : ''}
      <button class="ex-go" data-act="fight">COMBATTRE</button>`;
  }

  // ---------- Deplacement ----------
  onHover(x, y) {
    const hit = this.picker.pick(x, y);
    if (!hit || this._running) { if (!this._running) this.picker.setHover(null); return false; }
    const thing = this._thingAt(hit.c, hit.r);
    this.picker.setHover(hit.c, hit.r, !thing && !this._walkable(hit.c, hit.r));
    return !!(thing && !thing.kind);
  }

  onTap(x, y) {
    if (!this.active) return;
    const hit = this.picker.pick(x, y);
    if (!hit) { this.closeCard(); return; }
    const thing = this._thingAt(hit.c, hit.r);
    if (thing) { this.audio && this.audio.sfx('uiSelect'); this._interact(thing); return; }
    this.closeCard();
    if (!this._walkable(hit.c, hit.r)) return;
    this._goTo({ c: hit.c, r: hit.r }, null);
  }

  // Va a cote d une chose (groupe, portail, coffre, feu) puis agit.
  _interact(thing) {
    if (manhattan(thing, this.pos) === 1 && !this._running) { this._use(thing); return; }
    const res = this._bfs(this.pos);
    let best = null, bd = 1e9;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = thing.c + dc, r = thing.r + dr;
      const d = res.dist.get(key(c, r));
      if (d !== undefined && d < bd) { bd = d; best = { c, r }; }
    }
    if (!best) { this.toast('Impossible d aller jusque-la.'); return; }
    this.closeCard();
    this._goTo(best, thing);
  }

  _goTo(to, thing) {
    this._pending = { to, thing };
    this.picker.setHover(to.c, to.r);
    this._run();
  }

  async _run() {
    if (this._running) return;
    this._running = true;
    const gen = this._gen;
    while (this._pending && gen === this._gen) {
      const job = this._pending;
      this._pending = null;
      const path = pathTo(this._bfs(this.pos), job.to);
      if (!path) continue;
      let cut = false;
      for (let i = 1; i < path.length; i++) {
        const prev = this.pos;
        this.pos = { c: path[i].c, r: path[i].r };
        this._moveFollowers(prev);
        await this.lead.moveTo(path[i].c, path[i].r, STEP_MS);
        if (gen !== this._gen) return;
        if (this._pending) { cut = true; break; }
      }
      if (cut) continue;
      this.picker.setHover(null);
      this._faceAll();
      if (job.thing) {
        this.lead.faceToward(job.thing.c, job.thing.r);
        this._use(job.thing);
      } else {
        // Arret a cote d un groupe : sa carte s ouvre toute seule.
        const near = this.state.groups.find(g => manhattan(g, this.pos) === 1);
        if (near) this._use(near);
      }
    }
    if (gen === this._gen) this._running = false;
  }

  // Les compagnons suivent a la queue leu leu.
  _moveFollowers(leadPrev) {
    let target = leadPrev;
    for (let i = 1; i < this.heroes.length; i++) {
      const old = this.trail[i - 1];
      this.trail[i - 1] = { ...target };
      if (old.c !== target.c || old.r !== target.r) this.heroes[i].moveTo(target.c, target.r, STEP_MS);
      target = old;
    }
  }

  _use(thing) {
    if (!this.active) return;
    if (thing.kind === 'camp') {
      const hurt = this.classes.some(c => (this.hp[c] === undefined ? 1 : this.hp[c]) < 1);
      this.hp = {};
      this.closeCard();
      if (hurt) { this.audio && this.audio.sfx('heal'); this._renderUi(); }
      this.toast(hurt ? 'Feu de camp : toute l equipe est soignee.' : 'Feu de camp : l equipe est deja en pleine forme.');
      return;
    }
    if (thing.kind === 'chest') {
      if (this.state.wins < CHEST_WINS) {
        const n = CHEST_WINS - this.state.wins;
        this.closeCard();
        this.toast(`Coffre scelle : encore ${n} victoire${n > 1 ? 's' : ''} dans la region.`);
        return;
      }
      this.state.wins = 0;
      const pr = zoneProgress(this.z);
      const items = addItems(chestLoot(this.z.family, this.z.bands[Math.max(0, pr.best - 1)].level, 1));
      this._save();
      this.audio && this.audio.sfx('victory');
      this._openCard(thing, items[0]);
      return;
    }
    this._openCard(thing);
  }

  // ---------- Combats ----------
  _startFight() {
    const g = this.card && this.card.thing;
    if (!g || g.kind) return;
    const comp = this._comp(g);
    this.card = null;
    this._renderCard();
    this.fight = g;
    this._teardown();
    document.body.classList.remove('exploring', 'in-menu');
    this.root.style.display = 'none';
    this.onFight({
      playerClasses: this.classes.slice(),
      enemyComposition: comp,
      combatId: this.z.combatId,
      mapId: this.z.mapId,
      hp: { ...this.hp },
    });
  }

  // Fin du combat : victoire = le groupe disparait, la tranche est validee ;
  // defaite ou fuite = retour au camp, equipe soignee.
  endFight(res) {
    const g = this.fight;
    this.fight = null;
    if (!g || this.zone === null) return;
    const z = this.z, st = this.state;
    const msgs = [];
    if (res && res.winner === 'player') {
      st.groups = st.groups.filter(x => x !== g && x.id !== g.id);
      st.wins = Math.min(CHEST_WINS, (st.wins || 0) + 1);
      const before = zoneProgress(z);
      const isNew = recordBand(z.combatId, g.band, z.tierThresholds);
      const after = zoneProgress(z);
      for (const h of res.heroes || []) this.hp[h.classId] = h.alive ? Math.max(0.05, h.hpRatio) : REVIVE_HP;
      if (g.rare) {
        const items = addItems(chestLoot(z.family, z.bands[g.band - 1].level, 1));
        if (items[0]) msgs.push(`&#9733; Butin rare : <b style="color:${(RARITY[items[0].rarity] || {}).color || '#fff'}">${items[0].name}</b>`);
      }
      if (isNew && after.best < after.total) msgs.push(`Nouvelle evolution : des groupes menes par <b>${z.bands[after.best].name}</b> arrivent !`);
      if (isNew && after.best >= after.total) msgs.push('Toutes les evolutions de la region sont vaincues !');
      if (after.dungeonOpen && !before.dungeonOpen) msgs.push('Le portail du donjon s ouvre !');
      const added = this._fillGroups(false);
      if (added > 0 && !isNew) msgs.push('De nouveaux groupes arrivent dans la region.');
      if (st.wins >= CHEST_WINS) msgs.push('Le coffre de la region peut etre ouvert !');
      if (!msgs.length && this.classes.some(c => (this.hp[c] || 1) < 0.5)) msgs.push('Equipe blessee : le feu de camp soigne tout le monde.');
    } else {
      this.hp = {};
      this.pos = { ...this.entrance };
      msgs.push(res && res.fled ? 'Tu as fui : retour au camp, equipe soignee.' : 'Equipe vaincue... Retour au camp, tout le monde est soigne.');
    }
    this._save();
    this._show();
    if (msgs.length) this.toast(msgs.join('<br>'), 2600 + msgs.length * 1400);
  }

  _startDungeon() {
    const pr = zoneProgress(this.z);
    if (!pr.dungeonOpen) return;
    const zone = this.zone, classes = this.classes.slice(), id = this.z.dungeon.id;
    this.card = null;
    this._teardown();
    // Le donjon prend la main (salles enchainees) ; on reviendra ici apres.
    this.zone = null;
    document.body.classList.remove('exploring', 'in-menu');
    this.root.style.display = 'none';
    this.scene3d.setInsets(0, 0);
    this.onDungeon(id, classes, zone);
  }

  // ---------- Boucle ----------
  update(dt, time) {
    if (this.zone === null || this.fight) return;
    for (const h of this.heroes) h.update(dt, time);
    for (const g of this.holders.values()) for (const ch of g.chars) ch.update(dt, time);
    for (const o of this.objects) {
      if (!o.mesh) continue;
      if (o.kind === 'camp') {
        o.mesh.userData.flames.forEach((f, i) => {
          const s = 1 + Math.sin(time * (9 + i * 3) + i) * 0.14;
          f.scale.set(1 / s, s, 1 / s);
        });
      } else if (o.kind === 'gate' && o.mesh.userData.veil) {
        o.mesh.userData.veil.opacity = 0.72 + Math.sin(time * 2.2) * 0.16;
      } else if (o.kind === 'chest') {
        const ready = this.state.wins >= CHEST_WINS;
        o.mesh.position.y = 0.05 + (ready ? Math.abs(Math.sin(time * 3)) * 0.08 : 0);
        o.mesh.userData.lid.rotation.x = ready ? -0.25 - Math.sin(time * 3) * 0.12 : 0;
      }
    }
    if (this.covered) return;
    const s = this.scene3d;
    s.setInsets(this._insets[0], this._insets[1]);
    // La camera accompagne le heros pendant qu il marche.
    if (this._running && this.lead && this._follows()) {
      const k = Math.min(1, dt * 3.5), p = this.lead.group.position;
      s.target.x += (this._camClamp(p.x) - s.target.x) * k;
      s.target.z += (this._camClamp(p.z) - s.target.z) * k;
      s.updateCamera();
    }
    // Etiquettes flottantes au-dessus des groupes et des decors. Hors de
    // l ecran, elles restent collees au bord : on sait ou aller.
    const w = window.innerWidth, h = window.innerHeight;
    const y0 = this._insets[0] + 30, y1 = h - (this._barH || 0) - 6;
    const edge = [];
    for (const l of this._labels || []) {
      l.v.set(l.thing.c, l.y, l.thing.r);
      const p = s.worldToScreen(l.v);
      const hw = (l.w || (l.w = l.el.offsetWidth / 2 || 40)) + 4;
      l.x = Math.max(hw, Math.min(w - hw, p.x));
      l.sy = Math.max(y0, Math.min(y1, p.y));
      const off = l.x !== p.x || l.sy !== p.y;
      if (off !== l.off) { l.off = off; l.el.classList.toggle('off', off); }
      if (off) edge.push(l);
    }
    // Les etiquettes collees au bord ne se chevauchent pas.
    edge.sort((a, b) => a.sy - b.sy);
    for (let i = 1; i < edge.length; i++) {
      const a = edge[i - 1], b = edge[i];
      if (Math.abs(a.x - b.x) < a.w + b.w + 8 && b.sy - a.sy < 28) b.sy = a.sy + 28;
    }
    for (const l of this._labels || []) {
      l.el.style.transform = `translate(${Math.round(l.x)}px, ${Math.round(l.sy)}px) translate(-50%, -100%)`;
    }
  }
}
