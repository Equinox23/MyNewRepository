import * as THREE from 'three';

// ===========================================================================
// Atmosphere de chaque carte : particules legeres animees en continu.
//   foret     : lucioles, pollen, feuilles qui tombent
//   cascade   : embruns au pied des chutes, pollen, quelques lucioles
//   cimetiere : nappes de brouillard, feux follets
//   falaise   : rafales de vent, poussiere, feuilles emportees
//   marais    : spores lumineuses qui montent, brume verdatre
// Tout est fait de sprites (une soixantaine au plus) : cout negligeable.
// ===========================================================================

function makeTexture(draw, size = 64) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  draw(cv.getContext('2d'), size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let TEX = null;
function textures() {
  if (TEX) return TEX;
  const glow = makeTexture((c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
  });
  const soft = makeTexture((c, s) => {
    // Nappe cotonneuse : plusieurs taches floues superposees.
    for (let i = 0; i < 9; i++) {
      const x = s * (0.3 + 0.4 * Math.abs(Math.sin(i * 12.9))), y = s * (0.35 + 0.3 * Math.abs(Math.sin(i * 78.2)));
      const r = s * (0.2 + 0.14 * Math.abs(Math.sin(i * 3.7)));
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, s, s);
    }
  }, 128);
  const streak = makeTexture((c, s) => {
    const g = c.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(s / 2, s / 2, s / 2, s * 0.035, 0, 0, Math.PI * 2); c.fill();
  }, 128);
  const leaf = makeTexture((c, s) => {
    c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(s * 0.12, s * 0.5);
    c.quadraticCurveTo(s * 0.5, s * 0.12, s * 0.9, s * 0.5);
    c.quadraticCurveTo(s * 0.5, s * 0.88, s * 0.12, s * 0.5);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(s * 0.12, s * 0.5); c.lineTo(s * 0.9, s * 0.5); c.stroke();
  });
  TEX = { glow, soft, streak, leaf };
  return TEX;
}

const rnd = (a, b) => a + Math.random() * (b - a);

export class Ambience {
  constructor(scene, mapSize = 15) {
    this.scene = scene;
    this.n = mapSize;
    this.group = new THREE.Group();
    this.group.name = 'ambience';
    scene.add(this.group);
    this.parts = [];
  }

  clear() {
    for (const p of this.parts) {
      this.group.remove(p.s);
      p.s.material.dispose();
    }
    this.parts = [];
  }

  _sprite(tex, color, opts = {}) {
    const mat = new THREE.SpriteMaterial({
      map: tex, color, transparent: true, opacity: 0,
      blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false, depthTest: opts.depthTest !== false,
    });
    // Couleur "sur-exposee" : reprise par le halo lumineux.
    if (opts.boost) mat.color.multiplyScalar(opts.boost);
    const s = new THREE.Sprite(mat);
    s.renderOrder = opts.order || 15;
    s.raycast = () => {};
    this.group.add(s);
    return s;
  }

  // Point aleatoire sur (et un peu autour de) la carte.
  _spot(margin = 3) {
    return { x: rnd(-margin, this.n - 1 + margin), z: rnd(-margin, this.n - 1 + margin) };
  }

  setStyle(style, info = {}) {
    this.clear();
    const T = textures();
    const add = (kind, count, make) => {
      for (let i = 0; i < count; i++) {
        const p = make(i);
        p.kind = kind;
        p.t = Math.random() * 10;
        this.parts.push(p);
      }
    };
    const firefly = (color, boost = 2.2) => () => {
      const o = this._spot(2);
      return { s: this._sprite(T.glow, color, { additive: true, boost }), x: o.x, y: rnd(0.4, 1.8), z: o.z, size: rnd(0.16, 0.26), sp: rnd(0.5, 1.2), ph: rnd(0, 6.28), r: rnd(0.4, 1.2) };
    };
    const mote = (color, op, size = [0.05, 0.1]) => () => {
      const o = this._spot(3);
      return { s: this._sprite(T.glow, color, {}), x: o.x, y: rnd(0.3, 3.2), z: o.z, size: rnd(size[0], size[1]), op, vx: rnd(-0.12, 0.12), vy: rnd(-0.03, 0.05), vz: rnd(-0.12, 0.12), ph: rnd(0, 6.28) };
    };
    const leaf = (colors, wind = 0) => () => {
      const o = this._spot(4);
      const s = this._sprite(T.leaf, colors[Math.floor(Math.random() * colors.length)], {});
      return { s, x: o.x, y: rnd(0.5, 5), z: o.z, size: rnd(0.13, 0.2), vy: rnd(0.35, 0.7), wind, ph: rnd(0, 6.28), spin: rnd(1.5, 4) };
    };
    const fog = (color, op, low = [0.15, 0.5]) => () => {
      const o = this._spot(4);
      return { s: this._sprite(T.soft, color, { depthTest: false, order: 14 }), x: o.x, y: rnd(low[0], low[1]), z: o.z, size: rnd(4.5, 7.5), op: op * rnd(0.6, 1), vx: rnd(0.08, 0.22) * (Math.random() < 0.5 ? -1 : 1), vz: rnd(-0.06, 0.06), ph: rnd(0, 6.28) };
    };
    switch (style) {
      case 'forest':
        add('firefly', 22, firefly(0xd8ff7a));
        add('mote', 26, mote(0xfff6c8, 0.55));
        add('leaf', 9, leaf([0x7cbf4e, 0x9ad85a, 0xe8b83a]));
        break;
      case 'river':
        add('mote', 20, mote(0xffffff, 0.5));
        add('firefly', 8, firefly(0xbff0ff, 1.8));
        add('leaf', 5, leaf([0x7cbf4e, 0xa8d86a]));
        // Embruns : au pied de la cascade et des chutes du bord du plateau.
        for (const f of info.mist || []) {
          add('mist', f.big ? 9 : 2, () => ({ s: this._sprite(T.soft, 0xffffff, { depthTest: false, order: 14 }), ox: f.x, oy: f.y, oz: f.z, spread: f.big ? 2.0 : 0.4, size: f.big ? rnd(1.6, 2.8) : rnd(0.7, 1.1), op: f.big ? 0.32 : 0.26, life: rnd(2.2, 4), x: f.x, y: f.y, z: f.z }));
        }
        break;
      case 'graveyard':
        add('fog', 16, fog(0xb8b4e8, 0.2));
        add('wisp', 7, () => {
          const o = this._spot(1);
          return { s: this._sprite(T.glow, 0x7affd8, { additive: true, boost: 2.6 }), halo: true, x: o.x, y: rnd(0.5, 1.1), z: o.z, size: rnd(0.3, 0.42), sp: rnd(0.25, 0.5), ph: rnd(0, 6.28), r: rnd(0.8, 2.2) };
        });
        add('mote', 12, mote(0xc8c0ff, 0.4));
        break;
      case 'cliff':
        add('gust', 9, () => ({ s: this._sprite(T.streak, 0xffffff, {}), x: 0, y: 0, z: 0, size: rnd(2.2, 4), op: rnd(0.22, 0.4), life: rnd(1.2, 2.2), delay: rnd(0, 6) }));
        add('mote', 22, mote(0xf4e2b8, 0.6, [0.04, 0.08]));
        add('leaf', 10, leaf([0xc8b45a, 0xa8964a, 0xd8a03a], 2.4));
        break;
      case 'swamp':
        add('spore', 30, () => {
          const o = this._spot(2);
          return { s: this._sprite(T.glow, 0xb4ff6a, { additive: true, boost: 1.9 }), x: o.x, y: rnd(0, 2.6), z: o.z, size: rnd(0.09, 0.17), vy: rnd(0.12, 0.3), ph: rnd(0, 6.28) };
        });
        add('fog', 12, fog(0xa8c878, 0.17));
        add('firefly', 6, firefly(0xe8ff9a, 1.8));
        break;
    }
  }

  update(dt, time) {
    const n = this.n;
    const wrap = (p, m = 4) => {
      if (p.x < -m) p.x += n + 2 * m - 1; else if (p.x > n - 1 + m) p.x -= n + 2 * m - 1;
      if (p.z < -m) p.z += n + 2 * m - 1; else if (p.z > n - 1 + m) p.z -= n + 2 * m - 1;
    };
    for (const p of this.parts) {
      p.t += dt;
      const s = p.s, m = s.material;
      switch (p.kind) {
        case 'firefly':
        case 'wisp': {
          // Errance en boucles + clignotement.
          const a = p.t * p.sp + p.ph;
          s.position.set(p.x + Math.cos(a) * p.r + Math.sin(a * 2.3) * 0.3, p.y + Math.sin(a * 1.7) * 0.25, p.z + Math.sin(a * 0.8) * p.r);
          const blink = p.kind === 'wisp' ? 0.75 + 0.25 * Math.sin(p.t * 6 + p.ph) : Math.max(0, Math.sin(p.t * 1.6 + p.ph * 3));
          m.opacity = blink;
          const k = p.size * (0.8 + 0.3 * blink) * (p.kind === 'wisp' ? 1 + 0.15 * Math.sin(p.t * 9) : 1);
          s.scale.set(k, p.kind === 'wisp' ? k * 1.5 : k, 1);
          break;
        }
        case 'mote': {
          p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
          if (p.y > 3.4) p.y = 0.3; else if (p.y < 0.2) p.y = 3.2;
          wrap(p, 3);
          s.position.set(p.x + Math.sin(p.t * 0.7 + p.ph) * 0.2, p.y, p.z);
          m.opacity = p.op * (0.5 + 0.5 * Math.sin(p.t * 1.3 + p.ph));
          s.scale.setScalar(p.size);
          break;
        }
        case 'leaf': {
          p.y -= p.vy * dt;
          p.x += (Math.sin(p.t * 1.3 + p.ph) * 0.5 - p.wind) * dt;
          p.z += (Math.cos(p.t * 1.1 + p.ph) * 0.4 + p.wind * 0.35) * dt;
          if (p.y < 0.05) { p.y = rnd(3.5, 5.5); const o = this._spot(4); p.x = o.x; p.z = o.z; }
          wrap(p, 4);
          s.position.set(p.x, p.y, p.z);
          m.rotation = p.t * p.spin;
          m.opacity = Math.min(1, p.y * 2) * 0.9;
          s.scale.set(p.size, p.size * (0.4 + 0.6 * Math.abs(Math.sin(p.t * p.spin * 0.7))), 1);
          break;
        }
        case 'fog': {
          p.x += p.vx * dt; p.z += p.vz * dt;
          wrap(p, 5);
          s.position.set(p.x, p.y, p.z);
          m.opacity = p.op * (0.65 + 0.35 * Math.sin(p.t * 0.35 + p.ph));
          s.scale.set(p.size, p.size * 0.42, 1);
          break;
        }
        case 'mist': {
          const k = (p.t % p.life) / p.life;
          if (p.t >= p.life && k < dt / p.life + 0.02) {
            p.x = p.ox + rnd(-p.spread, p.spread); p.z = p.oz + rnd(-0.3, 0.5);
          }
          s.position.set(p.x, p.oy + 0.15 + k * 1.3, p.z + k * 0.5);
          m.opacity = p.op * Math.sin(k * Math.PI);
          const z = p.size * (0.6 + k * 0.9);
          s.scale.set(z, z * 0.7, 1);
          break;
        }
        case 'gust': {
          // Trainee de vent qui traverse la carte d est en ouest.
          const tt = p.t - p.delay;
          if (tt < 0) { m.opacity = 0; break; }
          const k = tt / p.life;
          if (k >= 1) { p.t = 0; p.delay = rnd(0.5, 5); p.z0 = rnd(-2, n + 1); p.y0 = rnd(0.5, 3); p.x0 = rnd(4, n + 3); m.opacity = 0; break; }
          if (p.x0 === undefined) { p.z0 = rnd(-2, n + 1); p.y0 = rnd(0.5, 3); p.x0 = rnd(4, n + 3); }
          s.position.set(p.x0 - k * 9, p.y0 + Math.sin(k * 6 + p.z0) * 0.25, p.z0 + k * 3);
          m.opacity = p.op * Math.sin(k * Math.PI);
          m.rotation = 0.32;
          s.scale.set(p.size, p.size * 0.35, 1);
          break;
        }
        case 'spore': {
          p.y += p.vy * dt;
          if (p.y > 3) { p.y = 0; const o = this._spot(2); p.x = o.x; p.z = o.z; }
          s.position.set(p.x + Math.sin(p.t * 0.9 + p.ph) * 0.25, p.y, p.z + Math.cos(p.t * 0.7 + p.ph) * 0.25);
          m.opacity = Math.min(1, p.y * 1.5) * Math.min(1, (3 - p.y) * 1.2) * (0.6 + 0.4 * Math.sin(p.t * 2.2 + p.ph));
          s.scale.setScalar(p.size);
          break;
        }
      }
    }
  }
}
