import * as THREE from 'three';
import { buildIop } from './models/iop.js';
import { buildBouftou } from './models/bouftou.js';
import { buildBouftouRoyal } from './models/bouftouRoyal.js';
import { buildOsamodas } from './models/osamodas.js';
import { buildCraqueleur } from './models/craqueleur.js';
import { buildCrapaud } from './models/crapaud.js';
import { buildCrapaudChef } from './models/crapaudChef.js';
import { buildRoublard } from './models/roublard.js';
import { buildBombeRoublard } from './models/bombeRoublard.js';
import { buildDragounetRouge } from './models/dragounetRouge.js';
import { buildChatonBlanc } from './models/chatonBlanc.js';
import { buildPandawa } from './models/pandawa.js';
import { buildEniripsa } from './models/eniripsa.js';
import { buildWabbit, buildWaWabbit } from './models/wabbit.js';
import { buildXelor } from './models/xelor.js';
import { buildEcaflip } from './models/ecaflip.js';
import { buildChafer } from './models/chafer.js';
import { buildChaferRoyal } from './models/chaferRoyal.js';
import { buildTofu } from './models/tofu.js';
import { buildTofuRoyal } from './models/tofuRoyal.js';
import { buildChampignon } from './models/champignon.js';
import { buildChampignonRoyal } from './models/champignonRoyal.js';
import { HpBar3D } from './HpBar3D.js';
import { toonify } from './Toon.js';
import { rigModel, poseRig } from './Rig.js';

const BUILDERS = {
  iop: buildIop,
  osamodas: buildOsamodas,
  roublard: buildRoublard,
  xelor: buildXelor,
  ecaflip: buildEcaflip,
  bouftou: buildBouftou,
  bouftouRoyal: buildBouftouRoyal,
  craqueleur: buildCraqueleur,
  crapaud: buildCrapaud,
  crapaudChef: buildCrapaudChef,
  bombeRoublard: buildBombeRoublard,
  dragounetRouge: buildDragounetRouge,
  chatonBlanc: buildChatonBlanc,
  pandawa: buildPandawa,
  eniripsa: buildEniripsa,
  wabbit: buildWabbit,
  waWabbit: buildWaWabbit,
  chafer: buildChafer,
  chaferRoyal: buildChaferRoyal,
  tofu: buildTofu,
  tofuRoyal: buildTofuRoyal,
  champignon: buildChampignon,
  champignonRoyal: buildChampignonRoyal,
};

const WHITE = new THREE.Color(0xffffff);

const HP_BAR_Y = {
  iop: 1.95,
  osamodas: 2.00,
  roublard: 1.80,
  xelor: 2.35,
  ecaflip: 1.90,
  bouftou: 1.30,
  bouftouRoyal: 1.95,
  craqueleur: 1.55,
  crapaud: 1.10,
  crapaudChef: 1.80,
  bombeRoublard: 1.20,
  dragounetRouge: 1.40,
  chatonBlanc: 1.45,
  pandawa: 2.05,
  eniripsa: 1.9,
  wabbit: 1.65,
  waWabbit: 2.4,
  chafer: 1.85,
  chaferRoyal: 2.6,
  tofu: 1.05,
  tofuRoyal: 1.55,
  champignon: 1.45,
  champignonRoyal: 2.15,
};

export class Character3D {
  constructor(scene, classId, team, c, r) {
    this.scene = scene;
    this.classId = classId;
    this.team = team;
    this.c = c;
    this.r = r;
    this.facing = 0;
    this.idleOffset = Math.random() * Math.PI * 2;
    this.busy = false;

    const builder = BUILDERS[classId] || buildIop;
    // `group` = racine (position / orientation / cercles / barre de vie),
    // `body` = le modele seul, anime (respiration, sauts, recul...).
    this.group = new THREE.Group();
    this.body = builder();
    // Style Dofus : cel-shading + contour sombre.
    toonify(this.body, { width: 0.018, minRadius: 0.06 });
    this.group.add(this.body);
    // Pivots de membres (bras / jambes / tete) pour les animations.
    this.rig = rigModel(this.body, classId);
    this._materials = [];
    this.body.traverse(o => {
      if (o.isMesh && !o.userData.isOutline && o.material && o.material.emissive && !this._materials.includes(o.material)) {
        this._materials.push(o.material);
      }
    });
    this._baseEmissive = this._materials.map(m => m.emissive.clone());
    this.group.position.set(c, 0, r);
    scene.add(this.group);

    // Cercle d equipe au sol, facon Dofus : disque translucide + liseré
    // vif (bleu pour les allies, rouge pour les ennemis).
    const ringColor = team === 'player' ? 0x2f7de0 : 0xd8322a;
    const discMat = new THREE.MeshBasicMaterial({
      color: ringColor, transparent: true, opacity: 0.28, depthWrite: false,
    });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.058;
    disc.renderOrder = 2;
    this.group.add(disc);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor, transparent: true, opacity: 0.95, depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.43, 40), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    ring.renderOrder = 3;
    this.group.add(ring);
    this.teamRing = ring;

    // Anneau jaune (visible quand c est son tour)
    const turnMat = new THREE.MeshBasicMaterial({
      color: 0xf1c40f, transparent: true, opacity: 0.85, depthWrite: false,
    });
    const turn = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.52, 32), turnMat);
    turn.rotation.x = -Math.PI / 2;
    turn.position.y = 0.07;
    turn.visible = false;
    this.group.add(turn);
    this.turnRing = turn;

    // Barre de vie au-dessus de la tete
    this.hpBar = new HpBar3D(team);
    this.hpBar.sprite.position.y = HP_BAR_Y[classId] || 1.4;
    this.group.add(this.hpBar.sprite);
  }

  setActive(active) {
    this.turnRing.visible = active;
  }

  update(dt, time) {
    // L anneau du tour pulse
    if (this.turnRing.visible) {
      const pulse = 0.85 + Math.sin(time * 3) * 0.15;
      this.turnRing.material.opacity = pulse;
    }
    if (this.busy || this._anim) return;
    // Respiration : leger ecrasement / etirement (squash & stretch).
    const b = Math.sin(time * 2.4 + this.idleOffset);
    this.body.scale.set(1 - b * 0.018, 1 + b * 0.03, 1 - b * 0.018);
    this.body.position.y = 0;
    this.body.rotation.set(0, 0, Math.sin(time * 1.2 + this.idleOffset) * 0.02);
    // Bras qui bougent legerement, tete qui regarde autour.
    poseRig(this.rig, {
      armSwing: b * 0.05,
      armOut: 0.06 + b * 0.03,
      headTilt: Math.sin(time * 0.9 + this.idleOffset) * 0.05,
      headTurn: Math.sin(time * 0.5 + this.idleOffset * 2) * 0.12,
    });
  }

  // Petite animation "procedurale" du corps pendant `duration` ms :
  // fn(t) recoit t in [0,1] et modifie this.body. Remet la pose a zero.
  _animate(duration, fn) {
    this._anim = true;
    return new Promise(resolve => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        fn(t);
        if (t < 1) requestAnimationFrame(step);
        else {
          this.body.scale.set(1, 1, 1);
          this.body.position.set(0, 0, 0);
          this.body.rotation.set(0, 0, 0);
          poseRig(this.rig, {});
          this._anim = false;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // Pose de lancement de sort : accroupi, puis bond etire vers le haut.
  castPose() {
    return this._animate(420, (t) => {
      if (t < 0.3) {
        const k = t / 0.3;
        this.body.scale.set(1 + 0.12 * k, 1 - 0.18 * k, 1 + 0.12 * k);
        poseRig(this.rig, { armL: -0.4 * k, armR: -0.4 * k, armOut: 0.2 * k, headTilt: 0.15 * k, legSwing: 0 });
      } else {
        const k = (t - 0.3) / 0.7;
        const hop = Math.sin(k * Math.PI);
        this.body.position.y = hop * 0.28;
        const st = Math.sin(Math.min(1, k * 2) * Math.PI) * 0.16;
        this.body.scale.set(1 - st * 0.5, 1 + st, 1 - st * 0.5);
        this.body.rotation.x = -hop * 0.15;
        // Bras leves vers le ciel pour canaliser le sort.
        const up = Math.sin(Math.min(1, k * 1.4) * Math.PI);
        poseRig(this.rig, { armL: -0.4 - 2.2 * up, armR: -0.4 - 2.2 * up, armOut: 0.2 + 0.35 * up, headTilt: -0.25 * up, legSwing: 0.25 * hop });
      }
    });
  }

  // Reaction a un coup : flash blanc, recul et tremblement.
  hitReact() {
    const mats = this._materials;
    const base = this._baseEmissive;
    return this._animate(380, (t) => {
      const f = t < 0.5 ? 1 - t * 2 : 0;
      for (let i = 0; i < mats.length; i++) {
        mats[i].emissive.copy(base[i]).lerp(WHITE, f * 0.85);
      }
      const k = Math.sin(t * Math.PI);
      this.body.rotation.x = k * 0.28;
      this.body.position.z = -k * 0.12;
      this.body.position.x = Math.sin(t * 40) * 0.04 * (1 - t);
      this.body.scale.set(1 + k * 0.08, 1 - k * 0.1, 1 + k * 0.08);
      poseRig(this.rig, { armL: 0.7 * k, armR: 0.7 * k, armOut: 0.6 * k, headTilt: -0.35 * k, legSwing: 0.2 * k });
    }).then(() => {
      for (let i = 0; i < mats.length; i++) mats[i].emissive.copy(base[i]);
    });
  }

  setTile(c, r) {
    this.c = c;
    this.r = r;
    this.group.position.x = c;
    this.group.position.z = r;
  }

  // Oriente le perso vers une case cible (visuellement, le sprite "front"
  // est l axe +Z). atan2(dx, dz) donne 0 quand on regarde +Z, +PI/2 pour +X.
  faceToward(c, r) {
    const dx = c - this.group.position.x;
    const dz = r - this.group.position.z;
    if (Math.abs(dx) + Math.abs(dz) < 0.001) return;
    this.facing = Math.atan2(dx, dz);
    this.group.rotation.y = this.facing;
  }

  // Glisse vers une case adjacente.
  moveTo(c, r, duration = 200) {
    return new Promise(resolve => {
      this.busy = true;
      const sx = this.group.position.x;
      const sz = this.group.position.z;
      const dx = c - sx;
      const dz = r - sz;
      this.c = c;
      this.r = r;
      if (Math.abs(dx) + Math.abs(dz) > 0.001) {
        this.facing = Math.atan2(dx, dz);
        this.group.rotation.y = this.facing;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.group.position.x = sx + dx * e;
        this.group.position.z = sz + dz * e;
        // Demarche sautillante facon Dofus : petit bond par case, corps
        // penche en avant, ecrasement a l atterrissage.
        const hop = Math.sin(t * Math.PI);
        this.body.position.y = hop * 0.13;
        this.body.rotation.x = 0.12 * hop;
        const land = t > 0.8 ? Math.sin((t - 0.8) / 0.2 * Math.PI) * 0.1 : 0;
        this.body.scale.set(1 + land, 1 - land * 1.2 + hop * 0.05, 1 + land);
        // Un pas par case : jambes et bras en opposition (on alterne la
        // jambe de depart d une case a l autre).
        const stride = Math.sin(t * Math.PI) * (this._stepSide = this._stepSide || 1);
        poseRig(this.rig, { legSwing: stride * 0.75, armSwing: stride * 0.6, armOut: 0.08, headTilt: 0.06 });
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.position.x = c;
          this.group.position.z = r;
          this.body.position.y = 0;
          this.body.rotation.x = 0;
          this.body.scale.set(1, 1, 1);
          this._stepSide = -(this._stepSide || 1);
          poseRig(this.rig, {});
          this.busy = false;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // Animation d attaque : se tourne vers la cible, fait un coup en
  // avant puis revient. dx, dz = vecteur unitaire vers la cible.
  lungeTo(targetC, targetR, duration = 350) {
    return new Promise(resolve => {
      this.busy = true;
      const sx = this.group.position.x;
      const sz = this.group.position.z;
      const dx = targetC - sx;
      const dz = targetR - sz;
      const len = Math.hypot(dx, dz) || 1;
      const ux = dx / len, uz = dz / len;
      this.facing = Math.atan2(dx, dz);
      this.group.rotation.y = this.facing;
      const lungeDist = 0.5;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // Prise d elan (recul + ecrasement) puis frappe rapide vers
        // l avant et retour.
        let offset, lean, sq;
        if (t < 0.3) {
          const k = t / 0.3;
          offset = -0.12 * k; lean = -0.22 * k; sq = 0.1 * k;
        } else if (t < 0.55) {
          const k = (t - 0.3) / 0.25;
          offset = -0.12 + (lungeDist + 0.12) * (1 - (1 - k) * (1 - k)); lean = -0.22 + 0.62 * k; sq = 0.1 - 0.25 * k;
        } else {
          const k = (t - 0.55) / 0.45;
          offset = lungeDist * (1 - k); lean = 0.4 * (1 - k); sq = -0.15 * (1 - k);
        }
        this.group.position.x = sx + ux * offset;
        this.group.position.z = sz + uz * offset;
        this.body.rotation.x = lean;
        this.body.scale.set(1 + sq, 1 - sq, 1 + sq);
        // Bras arme : leve haut pendant l elan, puis abattu devant soi.
        let strike;
        if (t < 0.3) strike = -2.6 * (t / 0.3);
        else if (t < 0.55) strike = -2.6 + 2.9 * ((t - 0.3) / 0.25);
        else strike = 0.3 * (1 - (t - 0.55) / 0.45);
        poseRig(this.rig, { armR: strike, armL: -strike * 0.25, legSwing: lean * 0.9, headTilt: lean * 0.4 });
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.position.x = sx;
          this.group.position.z = sz;
          this.body.rotation.x = 0;
          this.body.scale.set(1, 1, 1);
          poseRig(this.rig, {});
          this.busy = false;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // Affiche un compteur de tours restants sur une bombe (sprite
  // attache au groupe, persistant entre les frames).
  setBombFuse(turnsLeft) {
    const text = String(Math.max(0, turnsLeft));
    if (!this._fuseSprite) {
      const canvas = document.createElement('canvas');
      canvas.width = 96; canvas.height = 96;
      this._fuseCanvas = canvas;
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      this._fuseTex = tex;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.7, 0.7, 1);
      sprite.position.set(0, (HP_BAR_Y[this.classId] || 1.4) + 0.35, 0);
      sprite.renderOrder = 1001;
      this.group.add(sprite);
      this._fuseSprite = sprite;
    }
    const canvas = this._fuseCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pastille rouge.
    ctx.beginPath();
    ctx.arc(48, 48, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fff0c8';
    ctx.stroke();
    // Chiffre.
    ctx.font = 'bold 56px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, 48, 50);
    ctx.fillStyle = '#fff';
    ctx.fillText(text, 48, 50);
    this._fuseTex.needsUpdate = true;
  }

  // Texte flottant au-dessus du perso, generique.
  popText(text, color = '#ffffff', options = {}) {
    const fontSize = options.fontSize || 32;
    const dx = options.dx || 0;
    const yStart = options.yStart || 1.6;
    const yRise = options.yRise || 0.9;
    const duration = options.duration || 900;
    const scaleX = options.scaleX || 1.0;
    const scaleY = options.scaleY || 0.5;
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 56;
    const ctx = canvas.getContext('2d');
    ctx.font = `600 ${fontSize}px Fredoka, "Trebuchet MS", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#1a0c02';
    ctx.strokeText(text, 80, 29);
    // Degrade vertical clair -> couleur (chiffres "bonbon" facon Dofus).
    const grad = ctx.createLinearGradient(0, 12, 0, 44);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, color);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillText(text, 80, 29);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scaleX, scaleY, 1);
    sprite.position.set(this.group.position.x + dx, yStart, this.group.position.z);
    sprite.renderOrder = 1000;
    this.scene.add(sprite);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Apparition "pop" (rebond) puis montee et fondu.
      const pop = t < 0.12 ? 0.5 + (t / 0.12) * 0.8 : t < 0.25 ? 1.3 - ((t - 0.12) / 0.13) * 0.3 : 1;
      sprite.scale.set(scaleX * pop, scaleY * pop, 1);
      sprite.position.y = yStart + (1 - (1 - t) * (1 - t)) * yRise;
      sprite.material.opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      if (t < 1) requestAnimationFrame(tick);
      else {
        this.scene.remove(sprite);
        tex.dispose();
        mat.dispose();
      }
    };
    requestAnimationFrame(tick);
  }

  // Pop chiffre de degats : "-15" en rouge.
  popDamage(value, color = '#ff5577') {
    this.popText('-' + value, color);
    if (value > 0 && !this._dying) this.hitReact();
  }

  // Pop "+30" en vert pour les soins.
  popHeal(value) {
    this.popText('+' + value, '#7dffa0');
  }

  // Pop de cout de ressource: '-N' decale a droite (PA bleu etoile)
  // ou gauche (PM vert fleche). Plus petit que les degats pour ne pas
  // dominer visuellement les coups recus.
  popCost(amount, type) {
    if (!amount) return;
    const isPm = type === 'pm';
    const color = isPm ? '#74e69b' : '#7ec6ff';
    const label = '-' + amount + (isPm ? ' PM' : ' PA');
    this.popText(label, color, {
      fontSize: 22,
      dx: isPm ? -0.45 : 0.45,
      yStart: 1.35,
      yRise: 0.7,
      duration: 900,
      scaleX: 1.1,
      scaleY: 0.42,
    });
  }

  // Teleportation : le perso se pince verticalement (disparaitre dans
  // une colonne lumineuse), apparait a la nouvelle case en s etirant.
  // Idee : scale.x/z -> 0, scale.y -> 2 ; puis snap ; puis l inverse.
  teleportTo(c, r) {
    return new Promise(resolve => {
      this.busy = true;
      const phase1 = 200;
      const phase2 = 250;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        if (elapsed < phase1) {
          const t = elapsed / phase1;
          const e = t * t;
          this.group.scale.set(1 - 0.85 * e, 1 + 1.2 * e, 1 - 0.85 * e);
          this.group.position.y = e * 0.3;
          requestAnimationFrame(tick);
        } else if (elapsed < phase1 + phase2) {
          // Snap des qu on entre en phase 2.
          if (this.c !== c || this.r !== r) {
            this.c = c;
            this.r = r;
            this.group.position.x = c;
            this.group.position.z = r;
          }
          const t = (elapsed - phase1) / phase2;
          const e = 1 - (1 - t) * (1 - t);
          this.group.scale.set(0.15 + 0.85 * e, 2.2 - 1.2 * e, 0.15 + 0.85 * e);
          this.group.position.y = 0.3 * (1 - e);
          requestAnimationFrame(tick);
        } else {
          this.group.scale.set(1, 1, 1);
          this.group.position.set(c, 0, r);
          this.busy = false;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  // Petit anneau colore qui se diffuse sous le perso : feedback buff /
  // sort lance sur soi-meme.
  flashGlow(colorHex = 0xf1c40f, duration = 900) {
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex, transparent: true, opacity: 0.75, depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.62, 32), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(this.group.position.x, 0.09, this.group.position.z);
    ring.renderOrder = 10;
    this.scene.add(ring);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const s = 1 + t * 1.4;
      ring.scale.set(s, s, 1);
      // Suit le perso s il bouge (pour les buffs lances apres deplacement)
      ring.position.x = this.group.position.x;
      ring.position.z = this.group.position.z;
      mat.opacity = 0.75 * (1 - t);
      if (t < 1) requestAnimationFrame(tick);
      else {
        this.scene.remove(ring);
        ring.geometry.dispose();
        mat.dispose();
      }
    };
    requestAnimationFrame(tick);
  }

  // Invisibilite : masque completement le modele (et sa barre de vie).
  // Le combattant reste present sur sa case et peut donc etre touche si
  // l on vise celle-ci.
  setGhost(on) {
    if (this._ghost === on) return;
    this._ghost = on;
    this.group.visible = !on;
  }

  // Animation de mort : le perso s effondre (scale.y -> 0) + alpha.
  die(duration = 600) {
    this._dying = true;
    return new Promise(resolve => {
      this.busy = true;
      this.turnRing.visible = false;
      const start = performance.now();
      const startScaleY = this.group.scale.y;
      // Rendre tous les materiaux transparents pour pouvoir fader.
      const materials = [];
      this.group.traverse((obj) => {
        if (obj.isMesh || obj.isSprite) {
          const m = obj.material;
          if (m && !m.transparent) {
            m.transparent = true;
            m.depthWrite = false;
          }
          if (m) materials.push(m);
        }
      });
      this.hpBar.sprite.visible = false;
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = t * t;
        this.group.scale.y = startScaleY * (1 - 0.7 * e);
        for (const m of materials) m.opacity = 1 - t;
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.visible = false;
          this.busy = false;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }
}
