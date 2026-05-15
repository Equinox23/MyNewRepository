// Moteur audio procedural : tout est synthetise en direct via la Web
// Audio API (aucun fichier d asset, dans l esprit du reste du jeu).
// Style "doux & moderne" : oscillateurs sinus / triangle, filtres
// passe-bas, enveloppes douces et une legere reverb.
//
// API publique :
//   audio.resume()            -> a appeler sur le 1er geste utilisateur
//   audio.cast(category)      -> son de lancer de sort (attack/heal/...)
//   audio.sfx(name)           -> effet sonore ponctuel
//   audio.music('menu'|'combat'|null)
//   audio.setMuted(b) / setVolume(0..1) / isMuted() / getVolume()

const STORE_KEY = 'dofus3d.audio';

export class AudioEngine {
  constructor() {
    this.ok = false;
    this.muted = false;
    this.volume = 0.7;
    // Restaure les preferences memorisees.
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (typeof saved.muted === 'boolean') this.muted = saved.muted;
      if (typeof saved.volume === 'number') this.volume = saved.volume;
    } catch (_) { /* ignore */ }

    this._musicTrack = null;
    this._step = 0;
    this._nextStepTime = 0;
    this._musicTimer = null;

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this._buildGraph();
      this.ok = true;
    } catch (_) {
      this.ok = false;
    }
  }

  _buildGraph() {
    const ctx = this.ctx;
    // Chaine maitre : sfxBus + musicBus + reverb -> master -> sortie.
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.55;
    this.musicBus.connect(this.master);

    // Reverb : convolution sur une reponse impulsionnelle generee
    // (bruit decroissant) pour donner de l espace aux sons.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._makeImpulse(1.7, 2.6);
    const revGain = ctx.createGain();
    revGain.gain.value = 0.5;
    this.reverb.connect(revGain);
    revGain.connect(this.master);
    this.reverbIn = this.reverb;

    // Buffer de bruit blanc reutilise pour les impacts.
    this._noiseBuffer = this._makeNoise(1.0);

    this._applyGain(true);
  }

  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _makeImpulse(seconds, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  // ---- Reglages ----
  resume() {
    if (!this.ok) return;
    if (this.ctx.state !== 'running') this.ctx.resume();
    // (Re)lance la musique demandee une fois le contexte actif.
    if (this._musicTrack && !this._musicTimer) this._startScheduler();
  }

  _applyGain(instant) {
    if (!this.ok) return;
    const target = this.muted ? 0.0001 : Math.max(0.0001, this.volume);
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    if (instant) this.master.gain.setValueAtTime(target, t);
    else {
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), t);
      this.master.gain.exponentialRampToValueAtTime(target, t + 0.12);
    }
  }

  _save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ muted: this.muted, volume: this.volume }));
    } catch (_) { /* ignore */ }
  }

  setMuted(m) { this.muted = !!m; this._applyGain(); this._save(); }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); this._applyGain(); this._save(); }
  isMuted() { return this.muted; }
  getVolume() { return this.volume; }

  // ---- Briques de synthese ----
  _hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // Oscillateur enveloppe (sinus / triangle), filtre passe-bas optionnel,
  // glissando de hauteur optionnel, envoi reverb optionnel.
  _tone(o) {
    if (!this.ok) return;
    const ctx = this.ctx;
    const t = o.t != null ? o.t : ctx.currentTime;
    const dur = o.dur || 0.2;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.glideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.glideTo), t + dur);
    }
    const g = ctx.createGain();
    const peak = o.gain != null ? o.gain : 0.25;
    const atk = o.attack != null ? o.attack : 0.012;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let head = osc;
    if (o.cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(o.cutoff, t);
      if (o.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.cutoffTo), t + dur);
      head.connect(f);
      head = f;
    }
    head.connect(g);
    g.connect(o.bus === 'music' ? this.musicBus : this.sfxBus);
    if (o.reverb) {
      const rg = ctx.createGain();
      rg.gain.value = o.reverb;
      g.connect(rg);
      rg.connect(this.reverbIn);
    }
    osc.start(t);
    osc.stop(t + dur + 0.06);
  }

  // Salve de bruit filtre (impacts, souffles).
  _noise(o) {
    if (!this.ok) return;
    const ctx = this.ctx;
    const t = o.t != null ? o.t : ctx.currentTime;
    const dur = o.dur || 0.2;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    const g = ctx.createGain();
    const peak = o.gain != null ? o.gain : 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.cutoff || 800, t);
    if (o.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.cutoffTo), t + dur);
    if (o.q != null) f.Q.value = o.q;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    if (o.reverb) {
      const rg = ctx.createGain();
      rg.gain.value = o.reverb;
      g.connect(rg);
      rg.connect(this.reverbIn);
    }
    src.start(t);
    src.stop(t + dur + 0.06);
  }

  // ---- Effets sonores ----
  cast(category) {
    this.sfx('cast_' + (category || 'attack'));
  }

  sfx(name) {
    if (!this.ok || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'cast_attack':
        this._tone({ freq: 540, glideTo: 190, type: 'triangle', dur: 0.26, gain: 0.22, cutoff: 1700, reverb: 0.18 });
        this._noise({ dur: 0.12, gain: 0.10, cutoff: 2200, filter: 'bandpass', q: 1.2 });
        break;
      case 'cast_heal':
        [72, 76, 79].forEach((m, i) => this._tone({
          freq: this._hz(m), type: 'sine', dur: 0.5, gain: 0.13,
          attack: 0.02, reverb: 0.34, t: t + i * 0.07,
        }));
        break;
      case 'cast_boost':
        this._tone({ freq: 300, glideTo: 720, type: 'sine', dur: 0.34, gain: 0.16, reverb: 0.25 });
        this._tone({ freq: this._hz(88), type: 'triangle', dur: 0.4, gain: 0.06, attack: 0.04, reverb: 0.4, t: t + 0.06 });
        break;
      case 'cast_move':
        this._noise({ dur: 0.32, gain: 0.16, filter: 'bandpass', q: 0.8, cutoff: 380, cutoffTo: 1900, reverb: 0.2 });
        break;
      case 'cast_summon':
        this._tone({ freq: 110, glideTo: 220, type: 'sine', dur: 0.5, gain: 0.16, reverb: 0.3 });
        this._tone({ freq: this._hz(76), type: 'sine', dur: 0.7, gain: 0.1, attack: 0.005, reverb: 0.45, t: t + 0.12 });
        this._tone({ freq: this._hz(83), type: 'sine', dur: 0.7, gain: 0.07, attack: 0.005, reverb: 0.45, t: t + 0.12 });
        break;
      case 'hit':
        this._noise({ dur: 0.13, gain: 0.3, cutoff: 620, reverb: 0.12 });
        this._tone({ freq: 150, glideTo: 80, type: 'sine', dur: 0.16, gain: 0.26 });
        break;
      case 'heal':
        [84, 88, 91].forEach((m, i) => this._tone({
          freq: this._hz(m), type: 'sine', dur: 0.4, gain: 0.1,
          attack: 0.008, cutoff: 4000, reverb: 0.4, t: t + i * 0.08,
        }));
        break;
      case 'explosion':
        this._noise({ dur: 0.6, gain: 0.42, cutoff: 1500, cutoffTo: 90, reverb: 0.3 });
        this._tone({ freq: 130, glideTo: 55, type: 'sine', dur: 0.5, gain: 0.34, reverb: 0.2 });
        break;
      case 'death':
        this._tone({ freq: 300, glideTo: 78, type: 'sine', dur: 0.62, gain: 0.2, cutoff: 1400, reverb: 0.35 });
        break;
      case 'knockback':
        this._noise({ dur: 0.34, gain: 0.24, filter: 'bandpass', q: 0.7, cutoff: 1600, cutoffTo: 320, reverb: 0.2 });
        break;
      case 'summon':
        this._tone({ freq: this._hz(72), type: 'sine', dur: 0.7, gain: 0.13, attack: 0.004, reverb: 0.5 });
        this._tone({ freq: this._hz(84), type: 'sine', dur: 0.6, gain: 0.08, attack: 0.004, reverb: 0.5, t: t + 0.05 });
        break;
      case 'step':
        this._tone({ freq: 165, glideTo: 120, type: 'sine', dur: 0.07, gain: 0.06, cutoff: 600 });
        break;
      case 'turnPlayer':
        this._tone({ freq: this._hz(79), type: 'sine', dur: 0.22, gain: 0.16, reverb: 0.3 });
        this._tone({ freq: this._hz(84), type: 'sine', dur: 0.4, gain: 0.16, reverb: 0.35, t: t + 0.12 });
        break;
      case 'turnEnemy':
        this._tone({ freq: this._hz(64), type: 'triangle', dur: 0.22, gain: 0.13, cutoff: 1800, reverb: 0.3 });
        this._tone({ freq: this._hz(60), type: 'triangle', dur: 0.42, gain: 0.13, cutoff: 1500, reverb: 0.32, t: t + 0.12 });
        break;
      case 'victory':
        [72, 76, 79, 84].forEach((m, i) => this._tone({
          freq: this._hz(m), type: 'sine', dur: 0.55, gain: 0.15,
          attack: 0.01, reverb: 0.4, t: t + i * 0.13,
        }));
        break;
      case 'defeat':
        [69, 65, 60, 57].forEach((m, i) => this._tone({
          freq: this._hz(m), type: 'triangle', dur: 0.6, gain: 0.14,
          attack: 0.02, cutoff: 1600, reverb: 0.4, t: t + i * 0.17,
        }));
        break;
      case 'uiClick':
        this._tone({ freq: 430, type: 'sine', dur: 0.07, gain: 0.12, cutoff: 2600 });
        break;
      case 'uiSelect':
        this._tone({ freq: 540, type: 'sine', dur: 0.07, gain: 0.12, reverb: 0.12 });
        this._tone({ freq: 720, type: 'sine', dur: 0.12, gain: 0.11, reverb: 0.16, t: t + 0.06 });
        break;
      case 'uiError':
        this._tone({ freq: 200, type: 'triangle', dur: 0.1, gain: 0.13, cutoff: 1200 });
        this._tone({ freq: 150, type: 'triangle', dur: 0.16, gain: 0.13, cutoff: 1000, t: t + 0.09 });
        break;
      default:
        break;
    }
  }

  // ---- Musique ----
  music(track) {
    if (!this.ok) return;
    if (track === this._musicTrack) return;
    this._musicTrack = track || null;
    this._step = 0;
    if (!this._musicTrack) {
      this._stopScheduler();
      return;
    }
    if (this.ctx.state === 'running') this._startScheduler();
  }

  _startScheduler() {
    this._stopScheduler();
    this._nextStepTime = this.ctx.currentTime + 0.12;
    this._musicTimer = setInterval(() => this._scheduleMusic(), 60);
  }

  _stopScheduler() {
    if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
  }

  _scheduleMusic() {
    if (!this.ok || !this._musicTrack) return;
    const ctx = this.ctx;
    if (ctx.state !== 'running') { this._nextStepTime = ctx.currentTime + 0.12; return; }
    const tr = this._musicTrack === 'combat' ? this._combat : this._menu;
    while (this._nextStepTime < ctx.currentTime + 0.4) {
      const notes = tr.notes.call(this, this._step % tr.steps);
      for (const n of notes) this._tone({ ...n, bus: 'music', t: this._nextStepTime });
      this._step++;
      this._nextStepTime += tr.sps;
    }
  }

  // Boucle calme du menu : nappe d accords + melodie pentatonique sobre.
  get _menu() {
    const sps = 0.40;
    const chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
    const melody = { 4: 79, 10: 76, 16: 81, 22: 79, 26: 72, 30: 76 };
    return {
      sps, steps: 32,
      notes(step) {
        const out = [];
        if (step % 8 === 0) {
          const ch = chords[(step / 8) % 4];
          for (const m of ch) {
            out.push({ freq: this._hz(m), type: 'sine', dur: 8 * sps, attack: 0.55, gain: 0.05, reverb: 0.3 });
          }
        }
        if (melody[step] != null) {
          out.push({ freq: this._hz(melody[step]), type: 'triangle', dur: 0.85, attack: 0.03, gain: 0.055, cutoff: 2600, reverb: 0.4 });
        }
        return out;
      },
    };
  }

  // Boucle de combat : meme douceur mais rythmee (basse + arpege).
  get _combat() {
    const sps = 0.235;
    const chords = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];
    const arpSeq = [0, 1, 2, 1];
    return {
      sps, steps: 32,
      notes(step) {
        const out = [];
        const ch = chords[Math.floor(step / 8) % 4];
        if (step % 8 === 0) {
          for (const m of ch) {
            out.push({ freq: this._hz(m), type: 'sine', dur: 8 * sps, attack: 0.3, gain: 0.04, reverb: 0.25 });
          }
        }
        if (step % 2 === 0) {
          out.push({ freq: this._hz(ch[0] - 12), type: 'sine', dur: 0.22, attack: 0.005, gain: 0.13, cutoff: 420 });
        }
        const arpMidi = ch[arpSeq[step % 4]] + 12;
        out.push({ freq: this._hz(arpMidi), type: 'triangle', dur: 0.2, attack: 0.005, gain: 0.055, cutoff: 2800, reverb: 0.2 });
        return out;
      },
    };
  }
}
