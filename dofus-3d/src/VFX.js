import * as THREE from 'three';

// Systeme d effets visuels facon Dofus : sprites lumineux en melange
// additif (lueurs, etincelles, etoiles, fumee), glyphes runiques au sol,
// eclats d impact en etoile, projectiles avec traine scintillante et
// petit tremblement de camera sur les gros coups.
//
// Chaque methode publique renvoie une Promise qui se resout quand l effet
// est termine ; les effets sont auto-nettoyes et se desinscrivent de la
// liste interne `active`. La boucle de rendu appelle `vfx.update(dt)`.

// ---------------------------------------------------------------------------
// Textures procedurales (canvas), creees une seule fois.
// ---------------------------------------------------------------------------
const TEX = {};
function canvasTex(size, draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  draw(ctx, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function tex(name) {
  if (TEX[name]) return TEX[name];
  const s = 128, h = s / 2;
  switch (name) {
    case 'glow':
      TEX.glow = canvasTex(s, (ctx) => {
        const g = ctx.createRadialGradient(h, h, 0, h, h, h);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.2)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      });
      break;
    case 'star': // etincelle a 4 branches
      TEX.star = canvasTex(s, (ctx) => {
        const g = ctx.createRadialGradient(h, h, 0, h, h, h * 0.4);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#fff';
        for (const [w, l] of [[0.09, 1], [0.05, 0.62]]) {
          for (let k = 0; k < (l === 1 ? 2 : 2); k++) {
            ctx.save();
            ctx.translate(h, h);
            ctx.rotate(k * Math.PI / 2 + (l === 1 ? 0 : Math.PI / 4));
            ctx.beginPath();
            ctx.moveTo(0, -h * l); ctx.lineTo(h * w, 0); ctx.lineTo(0, h * l); ctx.lineTo(-h * w, 0);
            ctx.closePath(); ctx.fill();
            ctx.restore();
          }
        }
      });
      break;
    case 'spark': // trainee allongee
      TEX.spark = canvasTex(s, (ctx) => {
        const g = ctx.createLinearGradient(0, h, s, h);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.7, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(h, h, h, h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      });
      break;
    case 'smoke':
      TEX.smoke = canvasTex(s, (ctx) => {
        for (let i = 0; i < 6; i++) {
          const x = h + (Math.random() - 0.5) * h * 0.6, y = h + (Math.random() - 0.5) * h * 0.6;
          const g = ctx.createRadialGradient(x, y, 0, x, y, h * 0.6);
          g.addColorStop(0, 'rgba(255,255,255,0.55)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
        }
      });
      break;
    case 'ring':
      TEX.ring = canvasTex(s, (ctx) => {
        const g = ctx.createRadialGradient(h, h, h * 0.55, h, h, h);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.55, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      });
      break;
    case 'burst': // eclat d impact en etoile cartoon
      TEX.burst = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        const n = 10;
        ctx.beginPath();
        for (let i = 0; i < n * 2; i++) {
          const a = (i / (n * 2)) * Math.PI * 2;
          const r = i % 2 === 0 ? H * (0.85 + (i % 4 === 0 ? 0.12 : 0)) : H * 0.38;
          ctx.lineTo(H + Math.cos(a) * r, H + Math.sin(a) * r);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(H, H, 0, H, H, H);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
        g.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = g; ctx.fill();
      });
      break;
    case 'glyph': // cercle runique au sol (glyphe de lancement)
      TEX.glyph = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(H, H, H * 0.92, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(H, H, H * 0.78, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(H, H, H * 0.42, 0, Math.PI * 2); ctx.stroke();
        // Runes entre les deux cercles.
        ctx.font = `bold ${S * 0.07}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ';
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.save();
          ctx.translate(H + Math.cos(a) * H * 0.85, H + Math.sin(a) * H * 0.85);
          ctx.rotate(a + Math.PI / 2);
          ctx.fillText(runes[i], 0, 0);
          ctx.restore();
        }
        // Etoile a 6 branches (deux triangles).
        ctx.lineWidth = 3;
        for (let k = 0; k < 2; k++) {
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 + k * Math.PI / 3 - Math.PI / 2;
            ctx.lineTo(H + Math.cos(a) * H * 0.76, H + Math.sin(a) * H * 0.76);
          }
          ctx.closePath(); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(H, H, H * 0.12, 0, Math.PI * 2); ctx.fill();
      });
      break;
    case 'heart':
      TEX.heart = canvasTex(s, (ctx) => {
        ctx.translate(h, h * 1.05);
        ctx.scale(s / 36, s / 36);
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.bezierCurveTo(-16, -1, -9, -14, 0, -6);
        ctx.bezierCurveTo(9, -14, 16, -1, 0, 10);
        ctx.fillStyle = '#fff'; ctx.fill();
      });
      break;
    case 'cross':
      TEX.cross = canvasTex(s, (ctx) => {
        ctx.fillStyle = '#fff';
        const w = s * 0.24;
        ctx.fillRect(h - w / 2, s * 0.14, w, s * 0.72);
        ctx.fillRect(s * 0.14, h - w / 2, s * 0.72, w);
      });
      break;
    case 'slash': // croissant de lame
      TEX.slash = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        ctx.beginPath();
        ctx.arc(H, H * 1.25, H * 0.9, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(H, H * 1.5, H * 0.95, Math.PI * 1.82, Math.PI * 1.18, true);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, S, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.5, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0.3)');
        ctx.fillStyle = g; ctx.fill();
      });
      break;
    case 'drop':
      TEX.drop = canvasTex(s, (ctx) => {
        ctx.beginPath();
        ctx.moveTo(h, s * 0.08);
        ctx.bezierCurveTo(h + s * 0.34, s * 0.5, h + s * 0.3, s * 0.9, h, s * 0.9);
        ctx.bezierCurveTo(h - s * 0.3, s * 0.9, h - s * 0.34, s * 0.5, h, s * 0.08);
        const g = ctx.createRadialGradient(h - 10, s * 0.6, 2, h, s * 0.6, s * 0.4);
        g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0.6)');
        ctx.fillStyle = g; ctx.fill();
      });
      break;
    case 'feather':
      TEX.feather = canvasTex(s, (ctx) => {
        ctx.translate(h, h); ctx.rotate(-0.6);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.42);
        ctx.bezierCurveTo(s * 0.22, -s * 0.2, s * 0.16, s * 0.25, 0, s * 0.4);
        ctx.bezierCurveTo(-s * 0.16, s * 0.25, -s * 0.22, -s * 0.2, 0, -s * 0.42);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = 'rgba(120,120,120,0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, -s * 0.38); ctx.lineTo(0, s * 0.46); ctx.stroke();
      });
      break;
    case 'leaf':
      TEX.leaf = canvasTex(s, (ctx) => {
        ctx.translate(h, h); ctx.rotate(0.5);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.4);
        ctx.quadraticCurveTo(s * 0.3, 0, 0, s * 0.4);
        ctx.quadraticCurveTo(-s * 0.3, 0, 0, -s * 0.4);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, -s * 0.36); ctx.lineTo(0, s * 0.36); ctx.stroke();
      });
      break;
    case 'bubble':
      TEX.bubble = canvasTex(s, (ctx) => {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.06;
        ctx.beginPath(); ctx.arc(h, h, s * 0.4, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(h - s * 0.14, h - s * 0.16, s * 0.1, s * 0.06, -0.7, 0, Math.PI * 2); ctx.fill();
      });
      break;
    case 'claw':
      TEX.claw = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        for (let i = -1; i <= 1; i++) {
          ctx.save();
          ctx.translate(H + i * S * 0.2, H);
          ctx.rotate(-0.5);
          const g = ctx.createLinearGradient(0, -H, 0, H);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(0, 0, S * 0.035, H * 0.85, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      });
      break;
    case 'clock':
      TEX.clock = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(H, H, H * 0.88, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(H, H, H * 0.74, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(H + Math.cos(a) * H * 0.62, H + Math.sin(a) * H * 0.62);
          ctx.lineTo(H + Math.cos(a) * H * (i % 3 === 0 ? 0.46 : 0.54), H + Math.sin(a) * H * (i % 3 === 0 ? 0.46 : 0.54));
          ctx.lineWidth = i % 3 === 0 ? 8 : 4; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(H, H, H * 0.07, 0, Math.PI * 2); ctx.fill();
      });
      break;
    case 'hand': // aiguille d horloge (pointe vers le haut du canvas)
      TEX.hand = canvasTex(s, (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(h, s * 0.06); ctx.lineTo(h + s * 0.05, h); ctx.lineTo(h, h + s * 0.06); ctx.lineTo(h - s * 0.05, h);
        ctx.closePath(); ctx.fill();
      });
      break;
    case 'word': // bulle de parole (sorts de mots de l Eniripsa)
      TEX.word = canvasTex(s, (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(h, h * 0.9, s * 0.42, s * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath(); ctx.moveTo(h - 10, h * 1.4); ctx.lineTo(h - 24, s * 0.95); ctx.lineTo(h + 6, h * 1.45); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(h + i * 20, h * 0.9, 6, 0, Math.PI * 2); ctx.fill(); }
      });
      break;
    case 'wheel':
      TEX.wheel = canvasTex(256, (ctx, S) => {
        const H = S / 2;
        const cols = ['#e8322a', '#f8d040', '#3a9ae0', '#62b83a', '#9a4ad0', '#ff8a2a', '#e8322a', '#f8d040'];
        for (let i = 0; i < 8; i++) {
          ctx.beginPath(); ctx.moveTo(H, H);
          ctx.arc(H, H, H * 0.92, (i / 8) * Math.PI * 2, ((i + 1) / 8) * Math.PI * 2);
          ctx.closePath(); ctx.fillStyle = cols[i]; ctx.fill();
          ctx.strokeStyle = '#3a2208'; ctx.lineWidth = 4; ctx.stroke();
        }
        ctx.lineWidth = 12; ctx.strokeStyle = '#c8820a';
        ctx.beginPath(); ctx.arc(H, H, H * 0.92, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd24a';
        ctx.beginPath(); ctx.arc(H, H, H * 0.16, 0, Math.PI * 2); ctx.fill();
      });
      break;
  }
  return TEX[name];
}

// Melange additif seulement pour les lueurs : le reste reste en melange
// normal pour garder des couleurs franches meme sur l herbe claire.
function spriteMat(name, color, opts = {}) {
  const additive = opts.additive !== undefined ? opts.additive : name === 'glow';
  return new THREE.SpriteMaterial({
    map: tex(name),
    color: new THREE.Color(color),
    transparent: true,
    depthWrite: false,
    blending: additive && !opts.normal ? THREE.AdditiveBlending : THREE.NormalBlending,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    rotation: opts.rotation || 0,
    // Les effets passent devant les modeles (sinon un eclat centre sur la
    // cible serait cache a l interieur de son corps).
    depthTest: opts.depthTest !== undefined ? opts.depthTest : false,
  });
}

function planeMat(name, color, opts = {}) {
  const additive = opts.additive !== undefined ? opts.additive : name === 'glow';
  return new THREE.MeshBasicMaterial({
    map: tex(name),
    color: new THREE.Color(color),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: additive && !opts.normal ? THREE.AdditiveBlending : THREE.NormalBlending,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  });
}

function mkSprite(mat) {
  const sp = new THREE.Sprite(mat);
  sp.renderOrder = 20;
  return sp;
}

const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const lighten = (hex, k = 0.5) => new THREE.Color(hex).lerp(new THREE.Color(0xffffff), k).getHex();

export class VFX {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
    // Callback optionnel (branche par main.js) : tremblement de camera.
    this.onShake = null;
  }

  update(dt) {
    const now = performance.now();
    this.active = this.active.filter(eff => {
      const alive = eff.tick(now, dt);
      if (!alive) eff.dispose();
      return alive;
    });
  }

  shake(intensity = 0.12, duration = 0.25) {
    if (this.onShake) this.onShake(intensity, duration);
  }

  _add(eff) {
    this.active.push(eff);
    return eff.promise;
  }

  _cellPos(c, r, y = 0) { return new THREE.Vector3(c, y, r); }

  _disposeObj(obj) {
    obj.traverse(o => {
      if (o.isMesh || o.isPoints || o.isLine || o.isSprite) {
        if (o.geometry && !o.isSprite) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      }
    });
  }

  // `tick(t, obj, sec, dt)` : t normalise 0..1, sec = temps ecoule.
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
        try { tick && tick(t, obj, elapsed, dt); } catch (_) {}
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

  // ---------- EMETTEUR DE PARTICULES GENERIQUE ----------
  // Gerbe de sprites : chaque particule a une vitesse, une duree de vie,
  // une taille qui evolue, une gravite. `pos` = Vector3 monde.
  burst(pos, o = {}) {
    const count = o.count || 16;
    const life = o.life || 0.7;
    const texName = o.tex || 'star';
    const colors = Array.isArray(o.color) ? o.color : [o.color || 0xffffff];
    const gravity = o.gravity !== undefined ? o.gravity : -2.5;
    const speed = o.speed || [1.2, 2.6];
    const size = o.size || [0.18, 0.35];
    const upward = o.upward !== undefined ? o.upward : 0.8;
    const spread = o.spread !== undefined ? o.spread : 1;
    const drag = o.drag !== undefined ? o.drag : 1.5;
    const duration = life * 1.35 + (o.delaySpread || 0);
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < count; i++) {
          const m = spriteMat(texName, colors[i % colors.length], { normal: o.normalBlend, rotation: Math.random() * Math.PI * 2 });
          const sp = mkSprite(m);
          const a = Math.random() * Math.PI * 2;
          const hor = rand(0.2, 1) * spread;
          const v = rand(speed[0], speed[1]);
          sp.userData = {
            vx: Math.cos(a) * hor * v,
            vy: (upward + rand(-0.3, 0.6)) * v,
            vz: Math.sin(a) * hor * v,
            life: life * rand(0.6, 1.15),
            delay: Math.random() * (o.delaySpread || 0),
            s0: rand(size[0], size[1]),
            spin: rand(-4, 4),
          };
          sp.position.set(
            (Math.random() - 0.5) * (o.jitter || 0),
            (Math.random() - 0.5) * (o.jitter || 0) * 0.5,
            (Math.random() - 0.5) * (o.jitter || 0),
          );
          sp.scale.setScalar(0.001);
          grp.add(sp);
        }
        grp.position.copy(pos);
        return grp;
      },
      tick: (_t, grp, sec, dt) => {
        for (const sp of grp.children) {
          const u = sp.userData;
          const lt = (sec - u.delay) / u.life;
          if (lt < 0) continue;
          if (lt >= 1) { sp.visible = false; continue; }
          const k = Math.exp(-drag * dt);
          u.vx *= k; u.vz *= k; u.vy = u.vy * k + gravity * dt;
          sp.position.x += u.vx * dt;
          sp.position.y += u.vy * dt;
          sp.position.z += u.vz * dt;
          const grow = o.grow !== undefined ? o.grow : 0;
          const pop = lt < 0.15 ? lt / 0.15 : 1;
          sp.scale.setScalar(u.s0 * pop * (1 + grow * lt));
          sp.material.opacity = (o.opacity || 1) * (1 - lt * lt);
          sp.material.rotation += u.spin * dt;
        }
      },
    });
  }

  // Sprite unique qui grossit et s efface (flash / eclat).
  _pop(pos, texName, color, o = {}) {
    const duration = o.duration || 0.35;
    return this._makeEffect({
      duration,
      build: () => {
        const sp = mkSprite(spriteMat(texName, color, { rotation: o.rotation !== undefined ? o.rotation : Math.random() * Math.PI }));
        sp.position.copy(pos);
        sp.scale.setScalar(0.01);
        return sp;
      },
      tick: (t, sp) => {
        const s = (o.from || 0.3) + ((o.to || 1.6) - (o.from || 0.3)) * easeOut(t);
        sp.scale.setScalar(s);
        sp.material.opacity = (o.opacity || 1) * (t < 0.2 ? 1 : 1 - (t - 0.2) / 0.8);
        if (o.spin) sp.material.rotation += o.spin * 0.016;
      },
    });
  }

  // Disque texture pose au sol (glyphe, anneau).
  _ground(c, r, texName, color, o = {}) {
    const duration = o.duration || 0.8;
    return this._makeEffect({
      duration,
      build: () => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat(texName, color, { normal: o.normalBlend }));
        m.rotation.x = -Math.PI / 2;
        m.position.set(c, o.y !== undefined ? o.y : 0.08, r);
        m.renderOrder = 6;
        m.scale.setScalar(0.01);
        return m;
      },
      tick: (t, m) => {
        const s0 = o.from !== undefined ? o.from : 0.4;
        const s1 = o.to !== undefined ? o.to : 1.6;
        const s = s0 + (s1 - s0) * easeOut(Math.min(1, t * (o.growSpeed || 1.4)));
        m.scale.set(s, s, s);
        m.rotation.z += (o.spin || 0) * 0.016;
        const fin = o.fadeIn || 0.15;
        const fade = t < fin ? t / fin : 1 - Math.pow((t - fin) / (1 - fin), o.fadePow || 2);
        m.material.opacity = (o.opacity || 1) * Math.max(0, fade);
      },
    });
  }

  // ---------- GLYPHE DE LANCEMENT ----------
  // Cercle runique qui s illumine et tourne sous le lanceur, avec une
  // colonne d etincelles : signe distinctif d un sort lance dans Dofus.
  castGlyph(c, r, opts = {}) {
    const color = opts.color || 0x7fd0ff;
    this._ground(c, r, 'glow', color, { from: 1.0, to: 2.2, duration: 0.7, opacity: 0.9 });
    this._ground(c, r, 'glyph', color, { from: 0.8, to: 1.7, duration: 0.85, spin: 2.2, opacity: 1, fadeIn: 0.2 });
    this._ground(c, r, 'glyph', lighten(color, 0.7), { from: 0.6, to: 1.6, duration: 0.85, spin: -1.5, opacity: 0.55, fadeIn: 0.2 });
    this.burst(new THREE.Vector3(c, 0.15, r), {
      tex: 'star', color: [color, lighten(color, 0.5), 0xffffff], count: 18,
      speed: [0.8, 1.8], upward: 2.2, spread: 0.35, gravity: 0.4, life: 0.8, size: [0.18, 0.34], jitter: 0.8,
    });
    this._pop(new THREE.Vector3(c, 0.9, r), 'glow', color, { from: 0.8, to: 2.2, duration: 0.5, opacity: 0.8 });
    return new Promise(res => setTimeout(res, opts.wait !== undefined ? opts.wait : 180));
  }

  // ---------- IMPACT GENERIQUE ----------
  // Eclat en etoile + gerbe d etincelles + anneau au sol.
  impact(c, r, opts = {}) {
    const color = opts.color || 0xffd166;
    const y = opts.y || 0.7;
    const big = !!opts.big;
    const p = new THREE.Vector3(c, y, r);
    this._pop(p, 'glow', color, { from: 0.8, to: big ? 3 : 2.2, duration: 0.4, opacity: 1 });
    this._pop(p, 'burst', color, { from: 0.4, to: big ? 2.4 : 1.7, duration: big ? 0.36 : 0.28 });
    this._pop(p, 'burst', 0xffffff, { from: 0.2, to: big ? 1.4 : 1.0, duration: big ? 0.3 : 0.22 });
    this.burst(p, {
      tex: opts.tex || 'spark', color: [color, lighten(color, 0.5), 0xffffff], count: big ? 22 : 14,
      speed: big ? [2.5, 5] : [1.8, 3.8], upward: 0.5, gravity: -5, life: 0.45, size: [0.2, 0.42],
    });
    this._ground(c, r, 'ring', color, { from: 0.3, to: big ? 2.6 : 1.6, duration: 0.45, opacity: 0.8, fadeIn: 0.05, fadePow: 1 });
    if (big) this.shake(0.14, 0.28);
    return new Promise(res => setTimeout(res, 120));
  }

  // ---------- EFFETS PROPRES A CHAQUE SORT ----------
  // Appele au lancement (en parallele des effets generiques). `delay`
  // (ms) = temps estime avant l impact (projectile en vol).
  signature(spellId, caster, target) {
    const tc = target || caster;
    const dist = Math.hypot(tc.c - caster.c, tc.r - caster.r);
    const delay = dist > 1.5 ? (dist / 7) * 1000 + 60 : 120;
    const at = (ms, fn) => setTimeout(fn, ms);
    const V = (p, y) => new THREE.Vector3(p.c, y, p.r);
    switch (spellId) {
      case 'concentration': // aura de flammes rouges
        this.burst(V(caster, 0.2), { tex: 'glow', color: [0xff4a10, 0xff8a2a, 0xffd040], count: 26, speed: [0.3, 0.8], upward: 2, spread: 0.4, gravity: 1.2, life: 0.8, size: [0.3, 0.5], jitter: 0.7, delaySpread: 0.4 });
        break;
      case 'precipitation': // traits de vitesse + eclair
        this.burst(V(caster, 0.8), { tex: 'spark', color: [0xffe060, 0xffffff], count: 18, speed: [3, 5], upward: 0, gravity: 0, life: 0.35, size: [0.5, 0.8], drag: 1 });
        this._pop(V(caster, 1.6), 'star', 0xfff27a, { from: 0.4, to: 2, duration: 0.4 });
        break;
      case 'roueChance': this._spinningDisc(caster, 'wheel', { y: 2.1, size: 1.1, duration: 1.2, spin: 14 }); break;
      case 'pileOuFace':
        at(delay, () => {
          this._coinFlip(tc);
        });
        break;
      case 'horloge':
      case 'aiguille':
        at(delay, () => this._clockDial(tc, { color: 0x4ab0ff, reverse: false }));
        break;
      case 'ralentissement':
        at(delay, () => {
          this._clockDial(tc, { color: 0x7a8aff, reverse: true });
          this.burst(V(tc, 1.4), { tex: 'glow', color: [0xf8d060, 0xffe8a0], count: 16, speed: [0.05, 0.2], upward: -1, gravity: -2, life: 0.8, size: [0.08, 0.14], jitter: 0.3, delaySpread: 0.5 });
        });
        break;
      case 'vaguePandawa':
        at(delay, () => {
          this._ground(tc.c, tc.r, 'ring', 0x4ab0ff, { from: 0.4, to: 4.2, duration: 0.7, opacity: 1, fadeIn: 0.05, fadePow: 1 });
          this._ground(tc.c, tc.r, 'ring', 0xd8f4ff, { from: 0.3, to: 3.2, duration: 0.6, opacity: 0.8, fadeIn: 0.05 });
          this.burst(V(tc, 0.2), { tex: 'drop', color: [0x4ab0ff, 0xbfeaff, 0xffffff], count: 30, speed: [1.8, 3.4], upward: 1.4, spread: 1.2, gravity: -7, life: 0.8, size: [0.14, 0.26] });
        });
        break;
      case 'bourrasque':
        at(delay, () => this._whirl(tc, { color: 0xe2ffb0, tex: 'spark', leaves: true }));
        break;
      case 'sporeToxique':
      case 'nuageDeSpores':
        at(delay, () => {
          this.burst(V(tc, 0.6), { tex: 'smoke', color: 0x9a4ad0, normalBlend: true, count: 14, speed: [0.4, 1.2], upward: 0.5, gravity: 0.2, life: 1.1, size: [0.5, 0.8], grow: 1.3, opacity: 0.75, jitter: 0.8 });
          this.burst(V(tc, 0.6), { tex: 'glow', color: [0xd8a8ff, 0xb46ae8], count: 20, speed: [0.3, 0.9], upward: 0.8, gravity: 0.3, life: 1, size: [0.08, 0.14], jitter: 1 });
        });
        break;
      case 'picole':
        this.burst(V(caster, 1.0), { tex: 'bubble', color: [0xffe0a0, 0xffc8e0, 0xffffff], count: 14, speed: [0.2, 0.6], upward: 2, spread: 0.6, gravity: 0.6, life: 1, size: [0.12, 0.24], jitter: 0.4, delaySpread: 0.5 });
        break;
      case 'laitDeBambou':
        at(delay, () => {
          this.burst(V(tc, 1.4), { tex: 'drop', color: [0xffffff, 0xfffaf0], count: 16, speed: [0.3, 0.9], upward: -0.5, gravity: -5, life: 0.7, size: [0.1, 0.18], jitter: 0.5 });
          this.burst(V(tc, 0.3), { tex: 'leaf', color: [0x6ab83a, 0x9ad85a], count: 10, speed: [0.5, 1.2], upward: 1.6, gravity: -0.8, life: 1, size: [0.16, 0.26], normalBlend: true });
        });
        break;
      case 'invisibilite':
        this.burst(V(caster, 0.5), { tex: 'smoke', color: 0xc8c8d8, normalBlend: true, count: 18, speed: [0.8, 1.8], upward: 0.4, gravity: 0, life: 0.9, size: [0.5, 0.8], grow: 1.5, opacity: 0.85, drag: 3 });
        this.burst(V(caster, 0.8), { tex: 'star', color: 0xffffff, count: 10, speed: [1, 2], upward: 0.5, gravity: 0, life: 0.5, size: [0.12, 0.2] });
        break;
      case 'coupDeBec':
      case 'bourrasqueFeathers':
        at(delay, () => this.burst(V(tc, 0.8), { tex: 'feather', color: [0xffffff, 0xfff2c0], count: 12, speed: [1, 2.2], upward: 1, gravity: -1.2, life: 1, size: [0.2, 0.32], normalBlend: true, drag: 2.5 }));
        break;
      case 'griffeFeline':
      case 'coupDeGriffe':
        at(delay, () => {
          this._pop(V(tc, 0.85), 'claw', 0xff5a4a, { from: 0.6, to: 1.6, duration: 0.35, rotation: -0.3 });
          this._pop(V(tc, 0.85), 'claw', 0xffffff, { from: 0.4, to: 1.2, duration: 0.3, rotation: -0.3 });
        });
        break;
      case 'tirPandatak':
        at(delay, () => {
          this.burst(V(tc, 0.9), { tex: 'star', color: [0xfff27a, 0xffffff], count: 12, speed: [2, 3.5], upward: 0.4, gravity: -3, life: 0.5, size: [0.2, 0.34] });
          this.burst(V(tc, 0.1), { tex: 'smoke', color: 0xb8a078, normalBlend: true, count: 8, speed: [1, 2], upward: 0.2, gravity: 0, life: 0.6, size: [0.35, 0.5], grow: 1.2, opacity: 0.7, drag: 3 });
        });
        break;
      case 'dragoflamme':
        break; // gere par le projectile de feu
      case 'poserBombe':
        at(delay, () => {
          this.burst(V(tc, 0.3), { tex: 'smoke', color: 0x9a9aa8, normalBlend: true, count: 8, speed: [0.6, 1.2], upward: 0.4, gravity: 0, life: 0.6, size: [0.35, 0.5], grow: 1.2, opacity: 0.7, drag: 3 });
          this.burst(V(tc, 0.6), { tex: 'spark', color: [0xffd040, 0xff8a2a], count: 10, speed: [1.5, 2.5], upward: 1, gravity: -4, life: 0.4, size: [0.16, 0.26] });
        });
        break;
      case 'pulsar':
        at(delay, () => {
          for (let i = 0; i < 3; i++) at(i * 110, () => this._ground(tc.c, tc.r, 'ring', i % 2 ? 0xffd040 : 0xff7a2a, { from: 0.3, to: 2.6, duration: 0.5, opacity: 1, fadeIn: 0.05, fadePow: 1 }));
        });
        break;
      case 'momification':
        this._whirl(caster, { color: 0xf0e6cc, tex: 'spark', normal: true });
        break;
      case 'devouement':
        this.burst(V(caster, 0.2), { tex: 'spark', color: [0xffe060, 0xffffff], count: 20, speed: [2, 3], upward: 3, spread: 0.15, gravity: 0, life: 0.6, size: [0.4, 0.7], jitter: 1.4, drag: 2 });
        this._ground(caster.c, caster.r, 'ring', 0xffd040, { from: 0.5, to: 5, duration: 0.8, opacity: 0.9, fadeIn: 0.05, fadePow: 1 });
        break;
      case 'piqureMotivante':
        at(delay, () => this.burst(V(tc, 1.0), { tex: 'star', color: [0x8ae04a, 0xe2ffb0, 0xffffff], count: 16, speed: [0.8, 1.8], upward: 1.2, gravity: 0, life: 0.7, size: [0.14, 0.24] }));
        break;
      case 'frappeCraqueleur':
        at(delay, () => this._rockDebris(tc, 10));
        break;
      case 'bond':
      case 'bondDuFelin':
        this.burst(V(caster, 0.1), { tex: 'smoke', color: 0xc8b890, normalBlend: true, count: 10, speed: [1, 2], upward: 0.3, gravity: 0, life: 0.6, size: [0.35, 0.55], grow: 1.3, opacity: 0.7, drag: 3 });
        break;
      case 'motSoignant':
      case 'motDeReconstitution':
        this.burst(V(caster, 1.2), { tex: 'word', color: 0xffc8e0, count: 3, speed: [0.3, 0.6], upward: 1.5, gravity: 0.3, life: 0.8, size: [0.3, 0.4], normalBlend: true });
        break;
      case 'motStimulant':
        at(delay, () => this.burst(V(tc, 1.0), { tex: 'star', color: [0xffd040, 0xffffff], count: 18, speed: [1, 2], upward: 1.5, gravity: 0, life: 0.7, size: [0.16, 0.28] }));
        break;
      case 'motDeFrayeur':
        at(delay, () => {
          this._pop(V(tc, 1.7), 'word', 0xd8a8ff, { from: 0.4, to: 1.2, duration: 0.6, rotation: 0 });
          this.burst(V(tc, 0.9), { tex: 'smoke', color: 0x6a3a9a, normalBlend: true, count: 8, speed: [0.8, 1.6], upward: 0.3, gravity: 0, life: 0.6, size: [0.35, 0.5], grow: 1.2, opacity: 0.7, drag: 3 });
        });
        break;
      case 'morsureWabbit':
        at(delay, () => this.burst(V(tc, 0.8), { tex: 'star', color: [0xffffff, 0xffc8d8], count: 10, speed: [1.5, 2.5], upward: 0.3, gravity: -2, life: 0.4, size: [0.16, 0.26] }));
        break;
      case 'carotteGeante':
        at(delay, () => this.burst(V(tc, 0.3), { tex: 'leaf', color: [0x5aa832, 0x9ad85a], count: 12, speed: [1.2, 2.2], upward: 1.4, gravity: -3, life: 0.8, size: [0.18, 0.28], normalBlend: true }));
        break;
      case 'colereDeIop':
        at(delay, () => {
          this.impact(tc.c, tc.r, { color: 0xff5a1f, big: true });
          this.burst(V(tc, 0.3), { tex: 'glow', color: [0xff4a10, 0xffb040, 0xffe27a], count: 30, speed: [2, 4], upward: 1.2, gravity: -2, life: 0.7, size: [0.3, 0.6], grow: 0.6 });
          this.shake(0.22, 0.4);
        });
        break;
      case 'criDeLaBete':
        for (let i = 0; i < 3; i++) at(i * 140, () => this._ground(caster.c, caster.r, 'ring', 0xffd040, { from: 0.4, to: 6, duration: 0.6, opacity: 0.9, fadeIn: 0.05, fadePow: 1 }));
        break;
      case 'trefle':
        at(delay, () => this.burst(V(tc, 1), { tex: 'leaf', color: [0x3a9a2a, 0x8ae04a], count: 14, speed: [0.6, 1.4], upward: 1.4, gravity: -0.5, life: 0.9, size: [0.18, 0.28], normalBlend: true }));
        break;
      case 'fourberie':
      case 'reflexes':
        this.burst(V(caster, 0.6), { tex: 'spark', color: [0xe2ffb0, 0xffffff], count: 14, speed: [2, 3.5], upward: 0.2, gravity: 0, life: 0.35, size: [0.4, 0.6] });
        break;
      case 'rembobinage':
        this._clockDial(caster, { color: 0x8ae04a, reverse: true });
        break;
      case 'motDEnvol':
        this.burst(V(caster, 0.4), { tex: 'feather', color: [0xffffff, 0xffd0e8], count: 12, speed: [0.8, 1.6], upward: 1.2, gravity: -0.6, life: 0.9, size: [0.2, 0.3], normalBlend: true, drag: 2 });
        break;
      case 'pression':
        at(delay, () => this._pop(V(tc, 0.9), 'slash', 0xffe08a, { from: 1.2, to: 2.4, duration: 0.3, rotation: 0.8 }));
        break;
    }
  }

  // Disque texture qui tourne en l air (roue de la fortune...).
  _spinningDisc(p, texName, o = {}) {
    const duration = o.duration || 1;
    return this._makeEffect({
      duration,
      build: () => {
        const sp = mkSprite(spriteMat(texName, 0xffffff, { additive: false }));
        sp.position.set(p.c, o.y || 1.8, p.r);
        sp.scale.setScalar(0.01);
        return sp;
      },
      tick: (t, sp) => {
        const k = t < 0.2 ? t / 0.2 : 1;
        sp.scale.setScalar((o.size || 1) * easeOut(k));
        sp.material.rotation += (o.spin || 10) * 0.016 * (1 - t * 0.8);
        sp.material.opacity = t > 0.8 ? (1 - t) / 0.2 : 1;
        if (t > 0.75 && !sp.userData.burst) {
          sp.userData.burst = true;
          this.burst(sp.position.clone(), { tex: 'star', color: [0xffd040, 0xffffff], count: 14, speed: [1.2, 2.4], upward: 0.3, gravity: -1, life: 0.6, size: [0.16, 0.28] });
        }
      },
    });
  }

  // Piece qui tournoie au-dessus de la cible puis retombe (Pile ou Face).
  _coinFlip(p) {
    return this._makeEffect({
      duration: 0.9,
      build: () => {
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), new THREE.MeshToonMaterial({ color: 0xffc830, emissive: 0x6a4a00 }));
        coin.position.set(p.c, 1.4, p.r);
        return coin;
      },
      tick: (t, coin) => {
        coin.position.y = 1.4 + Math.sin(t * Math.PI) * 0.9;
        coin.rotation.x = t * Math.PI * 8;
        if (t > 0.9 && !coin.userData.done) {
          coin.userData.done = true;
          this._pop(coin.position.clone(), 'star', 0xffd040, { from: 0.4, to: 1.6, duration: 0.35 });
        }
      },
    });
  }

  // Cadran d horloge au sol dont l aiguille tourne (sorts du Xelor).
  _clockDial(p, o = {}) {
    const color = o.color || 0x4ab0ff;
    const duration = 0.95;
    this._ground(p.c, p.r, 'clock', color, { from: 0.8, to: 1.5, duration, opacity: 1, fadeIn: 0.15 });
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (const [len, w] of [[0.62, 1], [0.42, 1.4]]) {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22 * w, len * 1.1), planeMat('hand', lighten(color, 0.4), { additive: false }));
          m.rotation.x = -Math.PI / 2;
          m.position.y = 0.1;
          const pivot = new THREE.Group();
          m.position.z = -len * 0.35;
          pivot.add(m);
          grp.add(pivot);
        }
        grp.position.set(p.c, 0, p.r);
        return grp;
      },
      tick: (t, grp) => {
        const dir = o.reverse ? 1 : -1;
        grp.children[0].rotation.y = dir * t * Math.PI * 4;
        grp.children[1].rotation.y = dir * t * Math.PI * 0.6;
        const op = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
        grp.children.forEach(pv => { pv.children[0].material.opacity = op; });
        const s = 0.8 + easeOut(Math.min(1, t * 1.4)) * 0.7;
        grp.scale.setScalar(s);
      },
    });
  }

  // Tourbillon de traits (vent, bandelettes).
  _whirl(p, o = {}) {
    return this._makeEffect({
      duration: 1.0,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 16; i++) {
          const sp = mkSprite(spriteMat(i % 4 === 0 && o.leaves ? 'leaf' : o.tex || 'spark', i % 4 === 0 && o.leaves ? 0x6ab83a : o.color || 0xffffff, { additive: false }));
          sp.userData = { a0: (i / 16) * Math.PI * 2, h0: (i % 4) * 0.35, s: rand(0.3, 0.55) };
          sp.scale.setScalar(0.001);
          grp.add(sp);
        }
        grp.position.set(p.c, 0, p.r);
        return grp;
      },
      tick: (t, grp) => {
        for (const sp of grp.children) {
          const u = sp.userData;
          const a = u.a0 + t * Math.PI * 5;
          const rad = 0.65 - t * 0.2;
          sp.position.set(Math.cos(a) * rad, 0.2 + u.h0 + t * 0.6, Math.sin(a) * rad);
          sp.material.rotation = -a + Math.PI / 2;
          sp.scale.setScalar(u.s * (t < 0.15 ? t / 0.15 : 1));
          sp.material.opacity = t > 0.7 ? (1 - t) / 0.3 : 1;
        }
      },
    });
  }

  // Eclats de roche qui volent (frappe sismique).
  _rockDebris(p, n = 8) {
    return this._makeEffect({
      duration: 0.9,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshToonMaterial({ color: 0x8a7a66 });
        for (let i = 0; i < n; i++) {
          const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.06, 0.13), 0), mat);
          const a = Math.random() * Math.PI * 2;
          const v = rand(1.5, 3);
          m.userData = { vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: rand(2.5, 4.5) };
          grp.add(m);
        }
        grp.position.set(p.c, 0.1, p.r);
        return grp;
      },
      tick: (t, grp, sec) => {
        for (const m of grp.children) {
          const u = m.userData;
          m.position.set(u.vx * sec, Math.max(0, u.vy * sec - 4.9 * sec * sec), u.vz * sec);
          m.rotation.x += 0.2; m.rotation.y += 0.15;
          m.scale.setScalar(t > 0.8 ? (1 - t) / 0.2 : 1);
        }
      },
    });
  }

  // ---------- PROJECTILE BALISTIQUE ----------
  // Boule lumineuse (coeur blanc + halo colore) sur un arc parabolique,
  // traine d etincelles et eclat a l impact. `opts.kind` personnalise :
  // 'rock' (vrai caillou), 'spit' (goutte), 'feather' (plume), 'heal'
  // (coeurs), sinon orbe magique. La promesse se resout a l impact.
  projectile(from, to, opts = {}) {
    const color = opts.color || 0xffcc66;
    const radius = opts.radius || 0.15;
    const height = opts.arcHeight || 1.6;
    const speed = opts.speed || 7.0; // cases / sec
    const startY = opts.startY !== undefined ? opts.startY : 0.9;
    const endY = opts.endY !== undefined ? opts.endY : 0.7;
    const kind = opts.kind || 'orb';
    const dx = to.c - from.c, dz = to.r - from.r;
    const dist = Math.max(1, Math.hypot(dx, dz));
    const duration = Math.max(0.22, dist / speed);
    let lastEmit = 0;

    const p = this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        if (kind === 'rock') {
          const g = new THREE.IcosahedronGeometry(radius * 1.5, 0);
          const rock = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: 0x8a7a66 }));
          grp.add(rock);
          grp.userData.spinner = rock;
        } else if (kind === 'barrel') {
          // Tonneau qui roule (Karcham).
          const barrel = new THREE.Group();
          const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 14), new THREE.MeshToonMaterial({ color: 0x9a6232 }));
          wood.rotation.z = Math.PI / 2;
          barrel.add(wood);
          for (const x of [-0.13, 0.13]) {
            const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.025, 6, 16), new THREE.MeshToonMaterial({ color: 0x8a8a96 }));
            hoop.rotation.y = Math.PI / 2;
            hoop.position.x = x;
            barrel.add(hoop);
          }
          barrel.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
          grp.add(barrel);
          grp.userData.roller = barrel;
        } else if (kind === 'coin') {
          const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), new THREE.MeshToonMaterial({ color: 0xffc830, emissive: 0x6a4a00 }));
          grp.add(coin);
          grp.userData.spinner = coin;
        } else if (kind === 'carrot') {
          const car = new THREE.Group();
          const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.8, radius * 4, 10), new THREE.MeshToonMaterial({ color: 0xf07a1a }));
          cone.rotation.x = Math.PI;
          car.add(cone);
          for (let i = 0; i < 3; i++) {
            const lf = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.3, radius * 1.6, 5), new THREE.MeshToonMaterial({ color: 0x5aa832 }));
            lf.position.set((i - 1) * radius * 0.35, radius * 2.6, 0);
            lf.rotation.z = (i - 1) * 0.4;
            car.add(lf);
          }
          grp.add(car);
          grp.userData.spinner = car;
        } else if (kind === 'needle') {
          const n = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.6, 6), new THREE.MeshToonMaterial({ color: 0xffd24a, emissive: 0x6a4a00 }));
          n.rotation.x = Math.PI / 2;
          const holder = new THREE.Group();
          holder.add(n);
          holder.lookAt(dx, 0, dz);
          grp.add(holder);
        } else {
          const coreTex = { spit: 'drop', heal: 'heart', feather: 'feather', fire: 'glow', word: 'word' }[kind] || 'glow';
          const core = mkSprite(spriteMat(coreTex, kind === 'orb' ? 0xffffff : lighten(color, 0.3)));
          core.scale.setScalar(radius * (kind === 'orb' ? 3.2 : 3.6));
          grp.add(core);
          grp.userData.core = core;
        }
        const halo = mkSprite(spriteMat('glow', color, { opacity: kind === 'rock' ? 0.25 : 1 }));
        halo.scale.setScalar(radius * 8);
        if (kind === 'orb') {
          // Orbe coloree bien visible (en plus du halo additif).
          const orb = mkSprite(spriteMat('glow', color, { additive: false }));
          orb.scale.setScalar(radius * 4.5);
          grp.add(orb);
        }
        grp.add(halo);
        grp.userData.halo = halo;
        grp.position.copy(this._cellPos(from.c, from.r, startY));
        return grp;
      },
      tick: (t, grp, sec) => {
        const x = from.c + dx * t;
        const z = from.r + dz * t;
        const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * height;
        grp.position.set(x, y, z);
        const u = grp.userData;
        if (u.spinner) { u.spinner.rotation.x += 0.3; u.spinner.rotation.y += 0.2; }
        if (u.roller) { u.roller.children.forEach(ch => { ch.rotation.x -= 0.35; }); grp.position.y = 0.3 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.25; }
        if (u.core && kind === 'feather') u.core.material.rotation = Math.sin(t * 12) * 0.6;
        if (u.halo) u.halo.material.rotation += 0.1;
        if (u.core && kind === 'spit') {
          // La goutte s oriente dans le sens de la chute.
          u.core.material.rotation = t < 0.5 ? Math.PI : 0;
        }
        // Traine : petites etincelles semees le long du trajet.
        if (kind === 'fire' && sec - lastEmit > 0.02) {
          lastEmit = sec;
          this.burst(new THREE.Vector3(x, y, z), {
            tex: 'glow', color: [0xffe27a, 0xff8a2a, 0xff4a10], count: 3, speed: [0.2, 0.7],
            upward: 1, gravity: 1.5, life: 0.4, size: [0.3, 0.55], grow: 0.5,
          });
        } else if (kind === 'barrel' && sec - lastEmit > 0.05) {
          lastEmit = sec;
          this.burst(new THREE.Vector3(x, 0.1, z), {
            tex: 'smoke', color: 0xb8a078, normalBlend: true, count: 1, speed: [0.1, 0.3],
            gravity: 0, life: 0.5, size: [0.3, 0.45], grow: 1, opacity: 0.6,
          });
        } else if (kind !== 'rock' && kind !== 'barrel' && kind !== 'coin' && kind !== 'needle' && kind !== 'carrot' && sec - lastEmit > 0.03) {
          lastEmit = sec;
          this.burst(new THREE.Vector3(x, y, z), {
            tex: kind === 'heal' ? 'heart' : 'star', color: [color, lighten(color, 0.5), 0xffffff], count: 3,
            speed: [0.1, 0.5], upward: 0, gravity: -0.6, life: 0.45, size: [radius * 1.2, radius * 2.2],
          });
        } else if (kind === 'rock' && sec - lastEmit > 0.05) {
          lastEmit = sec;
          this.burst(new THREE.Vector3(x, y, z), {
            tex: 'smoke', color: 0x8a7a66, normalBlend: true, count: 1, speed: [0.05, 0.2],
            gravity: 0, life: 0.4, size: [0.25, 0.35], grow: 1, opacity: 0.5,
          });
        }
      },
    });
    return p.then(() => {
      if (opts.noImpact) return;
      if (kind === 'rock') {
        this.burst(new THREE.Vector3(to.c, endY, to.r), {
          tex: 'smoke', color: 0x9a8a70, normalBlend: true, count: 8, speed: [0.6, 1.4],
          gravity: -0.5, life: 0.6, size: [0.35, 0.55], grow: 1.2, opacity: 0.7,
        });
        this.shake(0.1, 0.2);
      } else if (kind === 'spit') {
        this.burst(new THREE.Vector3(to.c, endY, to.r), {
          tex: 'drop', color: [color, lighten(color, 0.4)], count: 12, speed: [1.2, 2.6],
          upward: 1, gravity: -7, life: 0.55, size: [0.12, 0.22],
        });
        this._ground(to.c, to.r, 'glow', color, { from: 0.4, to: 1.2, duration: 0.7, opacity: 0.6 });
      } else if (kind === 'heal') {
        // L impact de soin est gere par healSparkles.
      } else {
        this.impact(to.c, to.r, { color, y: endY });
      }
    });
  }

  // ---------- LAME DE FEU EN LIGNE (Epee Divine) ----------
  // Une epee de lumiere doree se forme sur le lanceur et file le long de
  // la ligne, en semant flammes et etincelles.
  flameSword(caster, cells, opts = {}) {
    if (!cells || cells.length === 0) return Promise.resolve();
    const color = opts.color || 0xff7a1f;
    const colorCore = opts.colorCore || 0xfff0a0;
    const last = cells[cells.length - 1];
    const dir = new THREE.Vector3(last.c - caster.c, 0, last.r - caster.r);
    const dirLen = dir.length();
    if (dirLen < 0.001) return Promise.resolve();
    dir.normalize();
    const angle = Math.atan2(dir.x, dir.z);
    const span = Math.max(1, dirLen + 0.5);
    const duration = Math.max(0.55, span * 0.09);
    let lastEmit = 0;

    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const sword = new THREE.Group();
        // Lame : plan vertical texture "spark" etire + coeur blanc.
        const bladeGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), planeMat('spark', color));
        bladeGlow.rotation.y = Math.PI / 2;
        const blade = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.28), planeMat('spark', colorCore));
        blade.rotation.y = Math.PI / 2;
        const bladeFlat = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.4), planeMat('spark', color, { opacity: 0.8 }));
        bladeFlat.rotation.x = -Math.PI / 2;
        bladeFlat.rotation.z = Math.PI / 2;
        sword.add(bladeGlow, blade, bladeFlat);
        const halo = mkSprite(spriteMat('glow', color));
        halo.scale.setScalar(1.4);
        sword.add(halo);
        const tip = mkSprite(spriteMat('star', 0xffffff));
        tip.scale.setScalar(0.9);
        tip.position.z = 0.7;
        sword.add(tip);
        sword.position.y = 0.9;
        grp.add(sword);
        grp.userData.sword = sword;
        grp.position.set(caster.c, 0, caster.r);
        grp.rotation.y = angle;
        return grp;
      },
      tick: (t, grp, sec) => {
        const sword = grp.userData.sword;
        const d = easeOut(t) * span;
        sword.position.z = d;
        sword.children.forEach(ch => { if (ch.material) ch.material.opacity = t > 0.85 ? (1 - t) / 0.15 : 1; });
        if (sec - lastEmit > 0.025) {
          lastEmit = sec;
          const wx = caster.c + Math.sin(angle) * d, wz = caster.r + Math.cos(angle) * d;
          this.burst(new THREE.Vector3(wx, 0.9, wz), {
            tex: 'glow', color: [color, 0xffb040, 0xff4a10], count: 3, speed: [0.2, 0.8],
            upward: 1.2, gravity: 1.2, life: 0.5, size: [0.3, 0.55], grow: 0.4,
          });
        }
      },
    });
  }

  // ---------- ONDE DE CHOC (frappe au sol, explosion) ----------
  shockwave(c, r, opts = {}) {
    const color = opts.color || 0xffb347;
    const radius = opts.radius || 1.6;
    const duration = opts.duration || 0.55;
    this._ground(c, r, 'ring', color, { from: 0.3, to: radius * 2.2, duration, opacity: 1, fadeIn: 0.05, fadePow: 1.3 });
    this._ground(c, r, 'ring', lighten(color, 0.5), { from: 0.2, to: radius * 1.5, duration: duration * 0.8, opacity: 0.8, fadeIn: 0.05 });
    this._pop(new THREE.Vector3(c, 0.5, r), 'burst', lighten(color, 0.4), { from: 0.4, to: 1.8, duration: 0.3 });
    // Poussiere / debris qui jaillissent.
    this.burst(new THREE.Vector3(c, 0.15, r), {
      tex: 'smoke', color: 0xb8a078, normalBlend: true, count: 14, speed: [1.5, 3.2],
      upward: 0.35, gravity: -1, life: 0.7, size: [0.35, 0.6], grow: 1.4, opacity: 0.7, drag: 3,
    });
    this.burst(new THREE.Vector3(c, 0.3, r), {
      tex: 'spark', color: [color, 0xffffff], count: 12, speed: [2.5, 4.5],
      upward: 0.7, gravity: -6, life: 0.45, size: [0.2, 0.35],
    });
    this.shake(0.16, 0.3);
    return new Promise(res => setTimeout(res, duration * 1000));
  }

  // ---------- COUP D EPEE (croissant de lame) ----------
  slashArc(target, dir = 1, opts = {}) {
    const color = opts.color || 0xfff4d0;
    const duration = opts.duration || 0.3;
    const p = this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        for (let i = 0; i < 2; i++) {
          const sp = mkSprite(spriteMat('slash', i === 0 ? color : 0xffc040, { opacity: i === 0 ? 1 : 0.7 }));
          sp.scale.setScalar(i === 0 ? 1.5 : 1.9);
          grp.add(sp);
        }
        grp.position.set(target.c, 0.85, target.r);
        return grp;
      },
      tick: (t, grp) => {
        grp.children.forEach((sp, i) => {
          sp.material.rotation = dir * (-0.9 + t * 1.8) + i * 0.2;
          sp.material.opacity = (i === 0 ? 1 : 0.7) * (1 - t * t);
          sp.scale.setScalar((i === 0 ? 1.3 : 1.7) * (0.7 + t * 0.5));
        });
      },
    });
    this.impact(target.c, target.r, { color: 0xffe08a, y: 0.8 });
    return p;
  }

  // ---------- MORSURE (machoires qui claquent) ----------
  bite(target, opts = {}) {
    const color = opts.color || 0xffffff;
    const duration = 0.42;
    const p = this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshToonMaterial({ color });
        for (const side of [1, -1]) {
          const jaw = new THREE.Group();
          for (let i = 0; i < 4; i++) {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), mat);
            fang.position.set(-0.3 + i * 0.2, -side * 0.12, 0);
            fang.rotation.z = side > 0 ? Math.PI : 0;
            jaw.add(fang);
          }
          jaw.userData.side = side;
          grp.add(jaw);
        }
        grp.position.set(target.c, 0.8, target.r);
        grp.lookAt(target.c + 10, 0.8, target.r + 10);
        return grp;
      },
      tick: (t, grp) => {
        const close = t < 0.45 ? t / 0.45 : 1;
        grp.children.forEach(j => { j.position.y = j.userData.side * (0.45 * (1 - close)); });
        grp.scale.setScalar(t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1);
      },
    });
    setTimeout(() => this.impact(target.c, target.r, { color: 0xff4a3a, y: 0.8 }), 180);
    return p;
  }

  // ---------- COUP DE POING ----------
  punchImpact(target, opts = {}) {
    const color = opts.color || 0xfff5c8;
    return this.impact(target.c, target.r, { color, y: 0.7, big: true });
  }

  // ---------- TELEPORT / BOND ----------
  portal(c, r, opts = {}) {
    const color = opts.color || 0x6ee7b6;
    const duration = opts.duration || 0.65;
    this._ground(c, r, 'glyph', color, { from: 0.5, to: 1.3, duration, spin: 3, opacity: 0.95 });
    this.burst(new THREE.Vector3(c, 0.1, r), {
      tex: 'star', color: [color, lighten(color, 0.6), 0xffffff], count: 18,
      speed: [0.8, 1.8], upward: 2.5, spread: 0.3, gravity: 0.5, life: 0.7, size: [0.14, 0.28], jitter: 0.6,
    });
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 2.4, 20, 1, true),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
        );
        beam.position.y = 1.2;
        grp.add(beam);
        grp.position.set(c, 0, r);
        return grp;
      },
      tick: (t, grp) => {
        const beam = grp.children[0];
        beam.scale.set(1 - t * 0.6, 0.3 + easeOut(t) * 0.9, 1 - t * 0.6);
        beam.material.opacity = 0.5 * (t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7);
      },
    });
  }

  // ---------- SOIN (coeurs et croix qui montent) ----------
  healSparkles(target, opts = {}) {
    const color = opts.color || 0xff7ab8;
    const p = new THREE.Vector3(target.c, 0.2, target.r);
    this._ground(target.c, target.r, 'glyph', 0x7dffb0, { from: 0.6, to: 1.2, duration: 0.9, spin: 1.5, opacity: 0.8 });
    this.burst(p, {
      tex: 'heart', color: [color, 0xffb0d8], count: 8, speed: [0.3, 0.7], upward: 2.2,
      spread: 0.5, gravity: 0.8, life: 0.9, size: [0.2, 0.32], jitter: 0.6, delaySpread: 0.3,
    });
    this.burst(p, {
      tex: 'cross', color: [0x7dffb0, 0xd8ffe8], count: 6, speed: [0.3, 0.6], upward: 2.4,
      spread: 0.4, gravity: 0.8, life: 0.8, size: [0.16, 0.26], jitter: 0.7, delaySpread: 0.4,
    });
    this.burst(p, {
      tex: 'star', color: 0xffffff, count: 10, speed: [0.3, 0.8], upward: 2, spread: 0.6,
      gravity: 0.5, life: 0.7, size: [0.1, 0.18], jitter: 0.8, delaySpread: 0.3,
    });
    return this._pop(new THREE.Vector3(target.c, 0.8, target.r), 'glow', 0x9dffc0, { from: 0.8, to: 2.2, duration: 0.9, opacity: 0.6 });
  }

  // ---------- BOUCLIER / DOME PROTECTEUR ----------
  shieldDome(target, opts = {}) {
    const color = opts.color || 0xf1c40f;
    const duration = 1.0;
    this._ground(target.c, target.r, 'glyph', color, { from: 0.6, to: 1.4, duration, spin: 1.2, opacity: 0.9 });
    this.burst(new THREE.Vector3(target.c, 0.7, target.r), {
      tex: 'star', color: [color, 0xffffff], count: 12, speed: [0.8, 1.4], upward: 0.3, gravity: 0,
      life: 0.6, size: [0.14, 0.24], drag: 4,
    });
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), mat);
        sphere.position.y = 0.7;
        grp.add(sphere);
        const wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.77, 1)),
          new THREE.LineBasicMaterial({ color: lighten(color, 0.5), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        wire.position.y = 0.7;
        grp.add(wire);
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        const fade = t < 0.2 ? t / 0.2 : 1 - Math.pow((t - 0.2) / 0.8, 2);
        const s = t < 0.2 ? 0.3 + easeOut(t / 0.2) * 0.8 : 1.1 - (t - 0.2) * 0.15;
        grp.scale.setScalar(s);
        grp.rotation.y = t * Math.PI;
        grp.children[0].material.opacity = 0.3 * Math.max(0, fade);
        grp.children[1].material.opacity = 0.9 * Math.max(0, fade);
      },
    });
  }

  // ---------- BUFF / AURA ----------
  // Spirale d etincelles qui monte autour de la cible + glyphe au sol.
  buffAura(target, opts = {}) {
    const color = opts.color || 0xf1c40f;
    const duration = 1.0;
    this._ground(target.c, target.r, 'glyph', color, { from: 0.6, to: 1.3, duration, spin: 2, opacity: 0.9 });
    this._ground(target.c, target.r, 'glow', color, { from: 0.8, to: 1.6, duration: 0.8, opacity: 0.5 });
    return this._makeEffect({
      duration,
      build: () => {
        const grp = new THREE.Group();
        const n = 18;
        for (let i = 0; i < n; i++) {
          const sp = mkSprite(spriteMat(i % 3 === 0 ? 'star' : 'glow', i % 2 ? color : lighten(color, 0.6)));
          sp.userData = { a0: (i / n) * Math.PI * 6, delay: (i / n) * 0.45, s: rand(0.14, 0.26) };
          sp.scale.setScalar(0.001);
          grp.add(sp);
        }
        grp.position.set(target.c, 0, target.r);
        return grp;
      },
      tick: (t, grp) => {
        for (const sp of grp.children) {
          const u = sp.userData;
          const lt = Math.max(0, Math.min(1, (t - u.delay) / 0.55));
          if (lt <= 0 || lt >= 1) { sp.visible = false; continue; }
          sp.visible = true;
          const a = u.a0 + lt * Math.PI * 2;
          const rad = 0.5 - lt * 0.2;
          sp.position.set(Math.cos(a) * rad, 0.1 + lt * 1.7, Math.sin(a) * rad);
          sp.scale.setScalar(u.s * (lt < 0.2 ? lt / 0.2 : 1));
          sp.material.opacity = 1 - lt * lt;
        }
      },
    });
  }

  // ---------- DEBUFF (volutes sombres + etoiles qui tournent) ----------
  debuffCloud(target, opts = {}) {
    const color = opts.color || 0x6e6e6e;
    const p = new THREE.Vector3(target.c, 0.8, target.r);
    this.burst(p, {
      tex: 'smoke', color, normalBlend: true, count: 10, speed: [0.3, 0.9], upward: 0.6,
      gravity: 0.3, life: 0.9, size: [0.4, 0.65], grow: 1, opacity: 0.8, jitter: 0.4,
    });
    this.burst(p, {
      tex: 'star', color: [lighten(color, 0.4), 0xffffff], count: 8, speed: [0.5, 1], upward: 0.4,
      gravity: 0.2, life: 0.8, size: [0.12, 0.2],
    });
    return this._ground(target.c, target.r, 'ring', color, { from: 1.4, to: 0.5, duration: 0.8, opacity: 0.8 });
  }

  // ---------- FLASH POSITION (touche) ----------
  flash(c, r, opts = {}) {
    const color = opts.color || 0xffffff;
    const duration = opts.duration || 0.35;
    return this._pop(new THREE.Vector3(c, 0.7, r), 'burst', lighten(color, 0.3), { from: 0.3, to: 1.4, duration });
  }
}
