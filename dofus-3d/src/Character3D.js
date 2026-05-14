import * as THREE from 'three';
import { buildIop } from './models/iop.js';
import { buildBouftou } from './models/bouftou.js';
import { HpBar3D } from './HpBar3D.js';

const BUILDERS = {
  iop: buildIop,
  bouftou: buildBouftou,
};

// Hauteur de la barre de vie au-dessus du sol (par classe).
const HP_BAR_Y = {
  iop: 1.55,
  bouftou: 1.30,
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
    if (team === 'enemy') this.group.rotation.y = Math.PI; // face the player
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

  // Fait apparaitre un nombre flottant au-dessus du perso.
  popDamage(value, color = '#ff5577') {
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 32px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.strokeText('-' + value, 48, 24);
    ctx.fillStyle = color;
    ctx.fillText('-' + value, 48, 24);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.9, 0.45, 1);
    sprite.position.set(this.group.position.x, 1.6, this.group.position.z);
    sprite.renderOrder = 1000;
    this.scene.add(sprite);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      sprite.position.y = 1.6 + t * 0.9;
      sprite.material.opacity = 1 - t;
      if (t < 1) requestAnimationFrame(tick);
      else {
        this.scene.remove(sprite);
        sprite.material.map.dispose();
        sprite.material.dispose();
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
