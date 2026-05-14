import * as THREE from 'three';
import { buildIop } from './models/iop.js';
import { buildBouftou } from './models/bouftou.js';
import { buildBouftouRoyal } from './models/bouftouRoyal.js';
import { buildOsamodas } from './models/osamodas.js';
import { buildCraqueleur } from './models/craqueleur.js';
import { HpBar3D } from './HpBar3D.js';

const BUILDERS = {
  iop: buildIop,
  osamodas: buildOsamodas,
  bouftou: buildBouftou,
  bouftouRoyal: buildBouftouRoyal,
  craqueleur: buildCraqueleur,
};

const HP_BAR_Y = {
  iop: 1.55,
  osamodas: 1.55,
  bouftou: 1.30,
  bouftouRoyal: 1.95,
  craqueleur: 1.55,
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
    this.group = builder();
    this.group.position.set(c, 0, r);
    scene.add(this.group);

    // Anneau d equipe au sol
    const ringColor = team === 'player' ? 0x2ecc71 : 0xe74c3c;
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor, transparent: true, opacity: 0.6, depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.42, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
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
    if (this.busy) return;
    // Idle subtil
    this.group.position.y = Math.sin(time * 1.6 + this.idleOffset) * 0.035;
    // L anneau du tour pulse
    if (this.turnRing.visible) {
      const pulse = 0.85 + Math.sin(time * 3) * 0.15;
      this.turnRing.material.opacity = pulse;
    }
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
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.position.x = c;
          this.group.position.z = r;
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
      const lungeDist = 0.45;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // Aller-retour en sinus
        const offset = Math.sin(t * Math.PI) * lungeDist;
        this.group.position.x = sx + ux * offset;
        this.group.position.z = sz + uz * offset;
        if (t < 1) requestAnimationFrame(step);
        else {
          this.group.position.x = sx;
          this.group.position.z = sz;
          this.busy = false;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
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
    ctx.font = `bold ${fontSize}px "Trebuchet MS", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, 80, 28);
    ctx.fillStyle = color;
    ctx.fillText(text, 80, 28);
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
      sprite.position.y = yStart + t * yRise;
      sprite.material.opacity = 1 - t;
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
    this.popText('-' + amount, color, {
      fontSize: 22,
      dx: isPm ? -0.42 : 0.42,
      yStart: 1.35,
      yRise: 0.7,
      duration: 850,
      scaleX: 0.85,
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

  // Animation de mort : le perso s effondre (scale.y -> 0) + alpha.
  die(duration = 600) {
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
