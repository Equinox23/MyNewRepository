import * as THREE from 'three';

// Systeme d effets visuels.
// Chaque methode publique renvoie une Promise qui se resout quand l effet
// est termine ; les effets sont auto-nettoyes (geometrie / materiaux
// disposes) et se desinscrivent de la liste interne `active`.
//
// La boucle de rendu doit appeler `vfx.update(dt)` chaque frame pour faire
// avancer les anims et purger les effets termines.
export class VFX {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
  }

  update(dt) {
    const now = performance.now();
    this.active = this.active.filter(eff => {
      const alive = eff.tick(now, dt);
      if (!alive) eff.dispose();
      return alive;
    });
  }

  _add(eff) {
    this.active.push(eff);
    return eff.promise;
  }

  // ---------- HELPERS PRIVES ----------
  _cellPos(c, r, y = 0) { return new THREE.Vector3(c, y, r); }

  _disposeObj(obj) {
    obj.traverse(o => {
      if (o.isMesh || o.isPoints || o.isLine || o.isSprite) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      }
    });
  }

  _makeEffect({ duration, build, tick, finalize }) {
    const obj = build();
    if (obj) this.scene.add(obj);
    let elapsed = 0;
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    const eff = {
      obj,
      promise,
      tick: (_now, dt) => {
        elapsed += dt;
        const t = Math.min(1, elapsed / duration);
        try { tick && tick(t, obj); } catch (_) {}
        if (t >= 1) {
          try { finalize && finalize(obj); } catch (_) {}
          resolve();
          return false;
        }
        return true;
      },
      dispose: () => {
        if (obj && obj.parent) obj.parent.remove(obj);
        if (obj) this._disposeObj(obj);
      },
    };
    return this._add(eff);
  }

  // ---------- PROJECTILE BALISTIQUE ----------
  // Un projectile (sphere lumineuse + traine) qui suit un arc parabolique
  // entre les cellules from/to. `color` controle la couleur, `glow` le
  // halo, `radius` le rayon. La promesse se resout a l impact.
  projectile(from, to, opts = {}) {
    const color = opts.color || 0xffcc66;
    const glow = opts.glow !== undefined ? opts.glow : 0.7;
    const radius = opts.radius || 0.15;
    const height = opts.arcHeight || 1.6;
    const speed = opts.speed || 7.0; // cases / sec
    const startY = opts.startY !== undefined ? opts.startY : 0.9;
    const endY = opts.endY !== undefined ? opts.endY : 0.7;
    const dx = to.c - from.c, dz = to.r - from.r;
    const dist = Math.max(1, Math.hypot(dx, dz));
    const duration = Math.max(0.18, dist / speed);

    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), mat);
        grp.add(sphere);
        // Halo
        const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 * glow });
        const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 2.2, 10, 8), haloMat);
        grp.add(halo);
        // Traine : 6 petites copies fading
        const trail = [];
        for (let i = 0; i < 6; i++) {
          const tm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
          const t = new THREE.Mesh(new THREE.SphereGeometry(radius * (1 - i * 0.12), 8, 6), tm);
          trail.push(t);
          grp.add(t);
        }
        grp.userData = { trail };
        grp.position.copy(this._cellPos(from.c, from.r, startY));
        return grp;
      },
      tick: (t, grp) => {
        const x = from.c + (to.c - from.c) * t;
        const z = from.r + (to.r - from.r) * t;
        const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * height;
        grp.position.set(x, y, z);
        // Animer la traine : positions historiques.
        const trail = grp.userData.trail;
        if (!grp.userData.history) grp.userData.history = [];
        grp.userData.history.unshift(new THREE.Vector3(x, y, z));
        if (grp.userData.history.length > trail.length) grp.userData.history.pop();
        for (let i = 0; i < trail.length; i++) {
          const h = grp.userData.history[i];
          if (h) {
            trail[i].position.set(h.x - x, h.y - y, h.z - z);
            trail[i].material.opacity = (1 - i / trail.length) * 0.5;
          }
        }
      },
    });
  }

  // ---------- LAME DE FEU EN LIGNE ----------
  // Une grande lame enflammee qui se forme sur le caster et fonce le long
  // de la ligne de cases jusqu au bout. Cells = tableau de {c,r} dans l ordre.
  flameSword(caster, cells, opts = {}) {
    if (!cells || cells.length === 0) return Promise.resolve();
    const color = opts.color || 0xff5a1f;
    const colorCore = opts.colorCore || 0xffe27a;
    const last = cells[cells.length - 1];
    const first = cells[0];
    const dir = new THREE.Vector3(last.c - caster.c, 0, last.r - caster.r);
    const dirLen = dir.length();
    if (dirLen < 0.001) return Promise.resolve();
    dir.normalize();
    const angle = Math.atan2(dir.x, dir.z);
    // Longueur de la traine de feu : du premier jusqu au dernier + 1.
    const span = Math.max(1, dirLen + 0.5);
    const duration = Math.max(0.45, span * 0.10);

    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        // LAME : un parallelepipede long oriente le long de la ligne.
        const bladeMat = new THREE.MeshBasicMaterial({ color: colorCore, transparent: true, opacity: 1 });
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, span), bladeMat);
        // origin centre -> on translate de span/2 vers l avant.
        blade.position.set(0, 1.0, span / 2);
        grp.add(blade);
        // ENVELOPPE FLAMME : trois capsules emissives plus larges et translucides.
        for (let i = 0; i < 4; i++) {
          const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 - i * 0.1 });
          const flame = new THREE.Mesh(new THREE.BoxGeometry(0.35 + i * 0.15, 0.5 + i * 0.2, span * 0.96), m);
          flame.position.set(0, 1.0, span / 2);
          grp.add(flame);
        }
        // GARDE : croisillon au depart pour faire "epee".
        const guardMat = new THREE.MeshBasicMaterial({ color: 0xfff2a8 });
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.10), guardMat);
        guard.position.set(0, 1.0, 0.1);
        grp.add(guard);
        // POINTE : cone a l avant.
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xffe27a });
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.4, 12), tipMat);
        tip.rotation.x = Math.PI / 2;
        tip.position.set(0, 1.0, span);
        grp.add(tip);
        // Etincelles : petits points le long de la lame.
        const sparkGeom = new THREE.SphereGeometry(0.06, 6, 5);
        for (let i = 0; i < 16; i++) {
          const sm = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85 });
          const sp = new THREE.Mesh(sparkGeom, sm);
          sp.position.set(
            (Math.random() - 0.5) * 0.3,
            1.0 + (Math.random() - 0.5) * 0.4,
            Math.random() * span,
          );
          sp.userData = {
            baseY: sp.position.y,
            phase: Math.random() * Math.PI * 2,
          };
          grp.add(sp);
        }

        // Place le groupe sur le caster, oriente vers la ligne.
        grp.position.set(caster.c, 0, caster.r);
        grp.rotation.y = angle;
        return grp;
      },
      tick: (t, grp) => {
        // 0..0.25 : la lame "jaillit" du caster (scale Z anim).
        // 0.25..1.0 : decline puis disparait, avec un flash final.
        let scaleZ;
        let opacityMult;
        if (t < 0.25) {
          const k = t / 0.25;
          scaleZ = k;
          opacityMult = k;
        } else {
          const k = (t - 0.25) / 0.75;
          scaleZ = 1;
          opacityMult = 1 - k * 0.7;
        }
        grp.scale.set(1, 1, scaleZ);
        // Pulse blanc sur la lame core
        const pulse = 1 + Math.sin(t * Math.PI * 12) * 0.05;
        grp.children.forEach((ch, i) => {
          if (ch.material && ch.material.opacity !== undefined) {
            const baseOp = i === 0 ? 1 : ch.material.opacity;
            if (i < 5) ch.material.opacity = baseOp * opacityMult * pulse;
          }
        });
      },
    });
  }

  // ---------- IMPACT EXPLOSIF (croix / cone) ----------
  // Une onde de choc circulaire qui se propage depuis (c, r).
  shockwave(c, r, opts = {}) {
    const color = opts.color || 0xffb347;
    const radius = opts.radius || 1.6;
    const duration = opts.duration || 0.5;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.08, 24), mat);
          ring.rotation.x = -Math.PI / 2;
          ring.userData = { delay: i * 0.12 };
          grp.add(ring);
        }
        // Eclat central
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const flash = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), flashMat);
        flash.position.y = 0.4;
        grp.add(flash);
        grp.position.set(c, 0.04, r);
        return grp;
      },
      tick: (t, grp) => {
        grp.children.forEach((ch, i) => {
          if (i < 3) {
            const ringT = Math.max(0, Math.min(1, (t - ch.userData.delay) / (1 - ch.userData.delay)));
            const rad = ringT * radius;
            ch.scale.setScalar(Math.max(0.01, rad / 0.08));
            ch.material.opacity = 0.7 * (1 - ringT);
          } else {
            // Flash
            ch.material.opacity = Math.max(0, 0.9 - t * 1.5);
            ch.scale.setScalar(1 + t * 0.8);
          }
        });
      },
    });
  }

  // ---------- COUP D EPEE (lame qui balaye) ----------
  slashArc(target, dir = 1, opts = {}) {
    const color = opts.color || 0xffffff;
    const duration = opts.duration || 0.32;
    return this._makeEffect({
      duration,
      build: () => {
        const mat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.95, side: THREE.DoubleSide,
        });
        const arc = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 22, Math.PI * 1.2), mat);
        arc.rotation.x = -Math.PI / 2;
        arc.position.set(target.c, 0.9, target.r);
        arc.userData = { dir };
        return arc;
      },
      tick: (t, obj) => {
        obj.rotation.y = obj.userData.dir * (t * Math.PI * 1.4 - Math.PI * 0.7);
        obj.scale.setScalar(0.4 + t * 1.1);
        obj.material.opacity = 0.95 * (1 - t);
      },
    });
  }

  // ---------- MORSURE (crocs rouges) ----------
  bite(target, opts = {}) {
    const color = opts.color || 0xff3030;
    const duration = 0.45;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        for (let i = 0; i < 4; i++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 6), mat.clone());
          const a = (i / 4) * Math.PI * 2;
          claw.position.set(Math.cos(a) * 0.5, 0.7, Math.sin(a) * 0.5);
          claw.lookAt(0, 0.7, 0);
          claw.rotateX(Math.PI / 2);
          grp.add(claw);
        }
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        const k = t < 0.5 ? t * 2 : 1;
        const fadeIn = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
        grp.scale.setScalar(0.4 + k * 0.6);
        grp.rotation.y = t * Math.PI * 2;
        grp.children.forEach(c => c.material.opacity = 0.9 * fadeIn);
      },
    });
  }

  // ---------- COUP DE POING / FRAPPE EN CROIX ----------
  punchImpact(target, opts = {}) {
    const color = opts.color || 0xfff5c8;
    const duration = 0.36;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
        // 6 rayons cartoon style
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const ray = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.7, 6), mat.clone());
          ray.position.set(Math.cos(a) * 0.5, 0.8, Math.sin(a) * 0.5);
          ray.lookAt(Math.cos(a) * 3, 0.8, Math.sin(a) * 3);
          ray.rotateX(Math.PI / 2);
          grp.add(ray);
        }
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        grp.scale.setScalar(0.4 + t * 1.5);
        grp.children.forEach(c => c.material.opacity = 0.95 * (1 - t));
      },
    });
  }

  // ---------- TELEPORT / BOND ----------
  portal(c, r, opts = {}) {
    const color = opts.color || 0x6ee7b6;
    const duration = opts.duration || 0.6;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.3 + i * 0.08, 0.4 + i * 0.08, 24), mat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.02 + i * 0.05;
          grp.add(ring);
        }
        // Faisceau vertical
        const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.8, 16, 1, true), beamMat);
        beam.position.y = 0.9;
        grp.add(beam);
        grp.position.set(c, 0, r);
        return grp;
      },
      tick: (t, grp) => {
        grp.rotation.y = t * Math.PI * 2;
        const fade = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;
        grp.scale.setScalar(0.8 + t * 0.6);
        grp.children.forEach((ch, i) => {
          ch.material.opacity = (i === 3 ? 0.5 : 0.7) * fade;
        });
      },
    });
  }

  // ---------- SOIN (sparkles roses qui montent) ----------
  healSparkles(target, opts = {}) {
    const color = opts.color || 0xff8ec5;
    const count = opts.count || 14;
    const duration = 0.9;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
        for (let i = 0; i < count; i++) {
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat.clone());
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.45;
          s.position.set(Math.cos(a) * r, 0.1 + Math.random() * 0.4, Math.sin(a) * r);
          s.userData = {
            startY: s.position.y,
            riseTo: 1.6 + Math.random() * 0.5,
            delay: Math.random() * 0.3,
          };
          grp.add(s);
        }
        // Croix de soin centrale
        const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.12), crossMat);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.4), crossMat.clone());
        crossH.position.y = 1.4;
        crossV.position.y = 1.4;
        grp.add(crossH);
        grp.add(crossV);
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        grp.children.forEach((s, i) => {
          if (i >= grp.children.length - 2) {
            // Croix : pulse et fade out
            const fade = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
            s.material.opacity = 0.95 * Math.max(0, fade);
            s.scale.setScalar(0.5 + t * 0.7);
            return;
          }
          const u = s.userData;
          const localT = Math.max(0, Math.min(1, (t - u.delay) / Math.max(0.05, 1 - u.delay)));
          s.position.y = u.startY + (u.riseTo - u.startY) * localT;
          s.material.opacity = 0.95 * (1 - localT);
          s.scale.setScalar(1 + localT * 0.5);
        });
      },
    });
  }

  // ---------- BOUCLIER / DOME PROTECTEUR ----------
  shieldDome(target, opts = {}) {
    const color = opts.color || 0xf1c40f;
    const duration = 1.0;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
          wireframe: false,
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 18, 14), mat);
        sphere.position.y = 0.7;
        grp.add(sphere);
        const wireMat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.85, wireframe: true,
        });
        const wire = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 9), wireMat);
        wire.position.y = 0.7;
        grp.add(wire);
        // Rune en bas
        const runeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
        const rune = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.65, 24), runeMat);
        rune.rotation.x = -Math.PI / 2;
        rune.position.y = 0.04;
        grp.add(rune);
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        const fade = t < 0.2 ? t / 0.2 : 1 - Math.pow((t - 0.2) / 0.8, 2);
        grp.scale.setScalar(0.6 + t * 0.5);
        grp.rotation.y = t * Math.PI;
        grp.children.forEach((c, i) => {
          const base = i === 0 ? 0.4 : (i === 1 ? 0.85 : 0.85);
          c.material.opacity = base * Math.max(0, fade);
        });
      },
    });
  }

  // ---------- BUFF / AURA DOREE ----------
  buffAura(target, opts = {}) {
    const color = opts.color || 0xf1c40f;
    const duration = 0.9;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.3 + i * 0.05, 0.4 + i * 0.05, 24), mat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.05;
          ring.userData = { delay: i * 0.15 };
          grp.add(ring);
        }
        // Petites etoiles montantes
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        for (let i = 0; i < 8; i++) {
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), starMat.clone());
          const a = Math.random() * Math.PI * 2;
          const r = 0.2 + Math.random() * 0.3;
          s.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
          s.userData = { startY: s.position.y };
          grp.add(s);
        }
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        grp.children.forEach((c, i) => {
          if (i < 3) {
            const lt = Math.max(0, Math.min(1, (t - c.userData.delay) / Math.max(0.05, 1 - c.userData.delay)));
            c.scale.setScalar(1 + lt * 1.6);
            c.material.opacity = 0.7 * (1 - lt);
          } else {
            const u = c.userData;
            c.position.y = u.startY + t * 1.4;
            c.material.opacity = 0.9 * (1 - t);
          }
        });
      },
    });
  }

  // ---------- DEBUFF (fumee grise / nuage) ----------
  debuffCloud(target, opts = {}) {
    const color = opts.color || 0x6e6e6e;
    const duration = 0.7;
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mat);
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.3;
          puff.position.set(Math.cos(a) * r, 0.8 + Math.random() * 0.3, Math.sin(a) * r);
          puff.userData = { startY: puff.position.y };
          grp.add(puff);
        }
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        grp.children.forEach(c => {
          c.position.y = c.userData.startY + t * 0.6;
          c.scale.setScalar(1 + t * 1.2);
          c.material.opacity = 0.7 * (1 - t);
        });
      },
    });
  }

  // ---------- FLASH POSITION ----------
  flash(c, r, opts = {}) {
    const color = opts.color || 0xffffff;
    const duration = opts.duration || 0.4;
    return this._makeEffect({
      duration,
      build: () => {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), mat);
        m.position.set(c, 0.6, r);
        return m;
      },
      tick: (t, obj) => {
        obj.material.opacity = 0.9 * (1 - t);
        obj.scale.setScalar(0.4 + t * 1.5);
      },
    });
  }
}
