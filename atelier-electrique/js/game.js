/* =====================================================================
 * game.js — Logique du jeu et interface
 * ===================================================================== */
const Game = (() => {
  const $ = (s) => document.querySelector(s);
  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = (v) => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const MODES = ['OFF', 'V~', 'V=', 'Ω', '🔊'];
  const TICK = 0.1; // s de simulation par pas

  let L = null;   // niveau courant
  let S = null;   // état de la partie
  let timer = null;
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem('atelier-progress') || '{}'); } catch (e) { progress = {}; }
  const saveProgress = () => { try { localStorage.setItem('atelier-progress', JSON.stringify(progress)); } catch (e) { /* ignore */ } };

  /* ------------------------------------------------------------------ */
  /* Construction d'une partie                                           */
  /* ------------------------------------------------------------------ */
  function defaultState(type) {
    switch (type) {
      case 'prise': case 'pile': return { plugged: false };
      case 'interrupteur': case 'porte': return { on: false };
      case 'commutateur': return { pos: 0 };
      case 'thermostat': return { tripped: false, trips: 0 };
      case 'resistance': return { T: 20, Ts: 20 };
      case 'fusible': case 'thermofusible': return { blown: false, revealed: false };
      default: return {};
    }
  }

  function makeInst(c) {
    const def = TYPES[c.type];
    return {
      id: c.id, type: c.type, def, label: c.label || def.short,
      x: c.x, y: c.y, rot: c.rot || 0,
      params: { ...(c.params || {}) },
      state: { ...defaultState(c.type), ...(c.state || {}) },
      fault: null, origFault: null, replaced: false, inspected: false, out: 0, P: 0, I: {},
    };
  }

  function startLevel(levelId, forceScenario) {
    L = LEVELS.find((l) => l.id === levelId);
    const comps = {};
    L.comps.forEach((c) => { comps[c.id] = makeInst(c); });
    const idx = forceScenario != null ? forceScenario : Math.floor(Math.random() * L.scenarios.length);
    const sc = L.scenarios[idx];
    Object.entries(sc.faults).forEach(([id, code]) => {
      comps[id].fault = code; comps[id].origFault = code;
      const f = comps[id].def.faults[code];
      comps[id].inspectReveal = Math.random() < (f ? f.visible : 0);
    });
    S = {
      comps, order: L.comps.map((c) => c.id), scenario: sc, scenarioIdx: idx,
      probes: { red: null, black: null }, nextProbe: 'red', mode: 'OFF',
      cost: 0, measurements: 0, safety: 0, hints: 0, hintIdx: 0, xray: false,
      log: [], selected: null, lastMeasureKey: '', safetyFlag: false, reading: '- - -',
      testing: false, events: [], finished: false, startTime: Date.now(),
    };
    S.optimalCost = computeOptimalCost();
    log(`🧰 Appareil reçu : ${L.name}. ${sc.symptom}`);
    showScreen('game');
    buildStatic();
    renderAll();
    if (timer) clearInterval(timer);
    timer = setInterval(() => { tick(TICK); renderDynamic(); }, TICK * 1000);
    openModal(`
      <h2>${L.icon} ${esc(L.name)}</h2>
      <p class="intro">${esc(L.intro)}</p>
      <div class="symptom"><b>Le client :</b> ${esc(sc.symptom)}</div>
      <p class="muted">Diagnostiquez la panne avec le multimètre, remplacez la pièce défectueuse, puis lancez le <b>test final</b>. Chaque pièce coûte de l'argent : ne remplacez pas au hasard !</p>
      <div class="modal-actions"><button class="btn primary" onclick="Game.closeModal()">À l'atelier !</button></div>`);
  }

  function cheapestPart(inst, strict) {
    const candidates = STOCK.filter((p) => p.type === inst.type && (!strict || Object.keys(p.params).every((k) => inst.params[k] === undefined || inst.params[k] === p.params[k])));
    if (!candidates.length) return null;
    return candidates.reduce((a, b) => (a.price <= b.price ? a : b));
  }
  function computeOptimalCost() {
    let c = 0;
    Object.values(S.comps).forEach((inst) => {
      if (inst.origFault) { const p = cheapestPart(inst, true) || cheapestPart(inst, false); if (p) c += p.price; }
    });
    return c;
  }

  function log(msg) {
    S.log.unshift({ t: Date.now(), msg });
    if (S.log.length > 60) S.log.pop();
  }

  /* ------------------------------------------------------------------ */
  /* Géométrie                                                           */
  /* ------------------------------------------------------------------ */
  function rotPt(x, y, rot) {
    switch (((rot % 360) + 360) % 360) {
      case 90: return [-y, x];
      case 180: return [-x, -y];
      case 270: return [y, -x];
      default: return [x, y];
    }
  }
  function pinPos(ref) {
    const [cid, pid] = ref.split('.');
    const inst = S.comps[cid];
    const pin = inst.def.pins.find((p) => p.id === pid);
    const [dx, dy] = rotPt(pin.x, pin.y, inst.rot);
    return [inst.x + dx, inst.y + dy];
  }
  function allPins() {
    const out = [];
    Object.values(S.comps).forEach((inst) => inst.def.pins.forEach((p) => out.push(`${inst.id}.${p.id}`)));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Simulation                                                          */
  /* ------------------------------------------------------------------ */
  function buildPrims() {
    const prims = [];
    Object.values(S.comps).forEach((inst) => {
      inst.def.prims(inst).forEach((p) => prims.push({ ...p, a: `${inst.id}.${p.a}`, b: `${inst.id}.${p.b}`, comp: inst }));
    });
    L.wires.forEach((w) => {
      const a = w[0], b = w[w.length - 1];
      if (typeof a !== 'string' || typeof b !== 'string') { console.error('Fil mal défini (doit relier deux bornes) :', w); return; }
      prims.push({ kind: 'wire', a, b });
    });
    return prims;
  }

  function nominalPower(inst) {
    const p = inst.params;
    if (p.P) return p.P;
    if (p.R) { const Vn = p.Vn || p.V || 230; return (Vn * Vn) / p.R; }
    return 1;
  }

  function tick(dt) {
    const prims = buildPrims();
    const res = Sim.analyze(prims, { ground: L.ground, nodes: allPins() });
    S.prims = prims; S.res = res;
    const powered = prims.some((p) => p.kind === 'V');
    S.powered = powered;

    // Puissances et courants par composant
    Object.values(S.comps).forEach((inst) => { inst.P = 0; inst.I = {}; });
    prims.forEach((p) => {
      if (!p.comp || p.kind !== 'R') return;
      const i = res.current(p);
      p.comp.I[p.tag || 'x'] = i;
      if (p.tag === 'load' || p.tag === 'main') p.comp.P += i * i * p.value;
    });

    // Sorties (lumière, chaleur, rotation...)
    Object.values(S.comps).forEach((inst) => {
      const d = inst.def;
      let out = 0;
      if (d.output) {
        out = Math.min(1.5, inst.P / nominalPower(inst));
        if (inst.type === 'moteur' && inst.fault === 'bloque') out = 0;
        if (inst.type === 'moteur_async') {
          const ia = Math.abs(inst.I.aux || 0);
          if (ia < 0.06) out = Math.min(out, 0.08); // vibre sans tourner
        }
        if (inst.type === 'moteur' || inst.type === 'moteur_async') {
          // inertie mécanique
          inst.spin = (inst.spin || 0) + (out - (inst.spin || 0)) * Math.min(1, dt * 2.5);
          out = inst.spin;
        }
      }
      inst.out = out;
      // fusible
      if (inst.type === 'fusible' && !inst.state.blown && inst.fault !== 'grille') {
        const i = Math.abs(inst.I.x || 0);
        if (i > inst.params.I * 1.5) {
          inst.state.blown = true;
          inst.state.blownAt = S.testing ? 'test' : 'jeu';
          event(`💥 Le fusible ${inst.label} (${inst.params.I} A) a grillé : ${i.toFixed(1)} A le traversaient !`);
        }
      }
    });

    // Thermique : résistances chauffantes.
    // T  = température du corps de chauffe ; Ts = température vue par le
    // thermostat (boîtier), qui suit T avec un retard. Sans ventilation, la
    // chaleur se concentre : le corps de chauffe monte beaucoup plus vite.
    Object.values(S.comps).forEach((inst) => {
      if (inst.type !== 'resistance') return;
      let cool = 0.02; let heatK = 15;
      if (inst.params.cooledBy) {
        const m = S.comps[inst.params.cooledBy];
        if (m && m.out > 0.5) cool += 0.15; else heatK = 60;
      }
      const heat = Math.min(1.5, inst.out) * heatK;
      inst.state.T += dt * (heat - (inst.state.T - 20) * cool);
      if (inst.state.Ts === undefined) inst.state.Ts = 20;
      inst.state.Ts += dt * 0.6 * (inst.state.T - inst.state.Ts);
    });
    // Thermostats (lisent Ts) et fusibles thermiques (collés au corps de chauffe : lisent T)
    Object.values(S.comps).forEach((inst) => {
      if (inst.type === 'thermostat') {
        const s = S.comps[inst.params.sensor]; const T = s ? (s.state.Ts ?? s.state.T) : 20;
        if (!inst.state.tripped && T > inst.params.T) { inst.state.tripped = true; if (inst.fault !== 'colle' && inst.fault !== 'ouvert') inst.state.trips++; }
        else if (inst.state.tripped && T < inst.params.T - 15) inst.state.tripped = false;
      }
      if (inst.type === 'thermofusible' && !inst.state.blown && inst.fault !== 'grille') {
        const s = S.comps[inst.params.sensor]; const T = s ? s.state.T : 20;
        if (T > inst.params.T) {
          inst.state.blown = true;
          inst.state.blownAt = S.testing ? 'test' : 'jeu';
          event(`🔥 Le fusible thermique ${inst.label} (${inst.params.T} °C) a déclenché : la résistance a atteint ${Math.round(T)} °C !`);
        }
      }
    });

    updateMeter(prims, res, powered);
  }

  function event(msg) {
    S.events.push(msg);
    if (!S.testing) log(msg);
  }

  /* ------------------------------------------------------------------ */
  /* Multimètre                                                          */
  /* ------------------------------------------------------------------ */
  function updateMeter(prims, res, powered) {
    const { red, black } = S.probes;
    const mode = S.mode;
    let reading = '- - -';
    let cls = '';
    if (mode !== 'OFF' && red && black) {
      if (mode === 'V~' || mode === 'V=') {
        let v = res.V(red) - res.V(black);
        if (mode === 'V=' && L.ac) v = 0;           // un voltmètre DC lit 0 sur du 230 V~
        if (mode === 'V~') v = Math.abs(v);
        if (Math.abs(v) < 0.05) v = 0;
        reading = (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2)) + (mode === 'V~' ? ' V~' : ' V=');
        if (Math.abs(v) > 30) cls = 'hot';
      } else {
        if (powered) {
          reading = 'ERR ⚠';
          cls = 'err';
          if (!S.safetyFlag) {
            S.safetyFlag = true; S.safety++;
            log('⚠ Mesure en Ω sur un circuit SOUS TENSION : le multimètre a souffert ! Débranchez toujours avant de mesurer une résistance.');
            toast('⚠ Jamais d\'ohmmètre sous tension ! Débranchez d\'abord.', 'warn');
          }
        } else {
          const R = Sim.resistanceBetween(prims, red, black);
          if (mode === 'Ω') reading = fmtOhm(R);
          else reading = R < 50 ? 'BIP 🔊 ' + fmtOhm(R) : 'OL (pas de continuité)';
          if (R < 50) cls = 'cont';
        }
      }
      // Une mesure est comptée quand l'affichage est resté stable ~1 s
      const key = `${mode}|${red}|${black}|${powered ? 1 : 0}`;
      if (key !== S.pendingKey) { S.pendingKey = key; S.pendingSince = Date.now(); }
      else if (key !== S.lastMeasureKey && (S.testing || Date.now() - S.pendingSince > 900)) {
        S.lastMeasureKey = key;
        if (!S.testing) {
          S.measurements++;
          if (reading !== 'ERR ⚠') log(`📟 ${mode} entre ${pinName(red)} et ${pinName(black)} : ${reading}`);
        }
      }
    } else {
      S.lastMeasureKey = ''; S.pendingKey = '';
    }
    if (!(mode === 'Ω' || mode === '🔊') || !powered || !(red && black)) S.safetyFlag = false;
    S.reading = reading; S.readingCls = cls;
  }

  function pinName(ref) {
    const [cid, pid] = ref.split('.');
    const inst = S.comps[cid];
    return `${inst ? inst.label : cid}·${pid}`;
  }

  /* ------------------------------------------------------------------ */
  /* Actions du joueur                                                   */
  /* ------------------------------------------------------------------ */
  function setMode(m) { S.mode = m; tick(0); renderDynamic(); }
  function pickProbe(which) { S.nextProbe = which; renderDynamic(); }
  function clearProbes() { S.probes = { red: null, black: null }; S.nextProbe = 'red'; renderDynamic(); }
  function clickPin(ref) {
    if (S.probes[S.nextProbe] === ref) { S.probes[S.nextProbe] = null; }
    else {
      // une borne ne peut pas recevoir les deux pointes
      const other = S.nextProbe === 'red' ? 'black' : 'red';
      if (S.probes[other] === ref) S.probes[other] = null;
      S.probes[S.nextProbe] = ref;
    }
    S.nextProbe = S.nextProbe === 'red' ? 'black' : 'red';
    tick(0); renderDynamic();
  }
  function selectComp(id) { S.selected = id; renderPanel(); renderDynamic(); }
  function actuate(id) {
    const inst = S.comps[id];
    if (!inst.def.control) return;
    inst.def.control.toggle(inst.state);
    log(`🖱 ${inst.label} : ${describeState(inst)}`);
    tick(0); renderAll();
  }
  function describeState(inst) {
    const s = inst.state;
    if (inst.type === 'prise') return s.plugged ? 'branchée — SOUS TENSION' : 'débranchée';
    if (inst.type === 'pile') return s.plugged ? 'pile en place' : 'pile retirée';
    if (inst.type === 'commutateur') return `position ${s.pos}`;
    if (inst.type === 'porte') return s.on ? 'porte fermée' : 'porte ouverte';
    if ('on' in s) return s.on ? 'ON' : 'OFF';
    return '';
  }
  function inspect(id) {
    const inst = S.comps[id];
    inst.inspected = true;
    let txt;
    const f = inst.fault ? inst.def.faults[inst.fault] : null;
    if (inst.state.blown && (inst.type === 'fusible')) { inst.state.revealed = true; txt = 'Le filament du fusible est coupé : il a grillé.'; inst.visibleDamage = true; }
    else if (f && inst.inspectReveal) { txt = f.inspect; inst.visibleDamage = true; inst.state.revealed = true; }
    else if (f) { txt = 'Rien d\'anormal à l\'œil nu… mais une panne peut être invisible : mesurez !'; }
    else txt = 'Rien d\'anormal visuellement.';
    inst.inspectText = txt;
    log(`🔍 Inspection de ${inst.label} : ${txt}`);
    renderAll();
  }
  function openReplace(id) {
    const inst = S.comps[id];
    if (inst.def.fixed) return;
    if (S.powered && L.ac) { toast('⚠ Débranchez l\'appareil avant de remplacer une pièce !', 'warn'); return; }
    const parts = STOCK.filter((p) => p.type === inst.type);
    openModal(`
      <h2>🔧 Remplacer : ${esc(inst.label)}</h2>
      <p class="muted">Pièce actuelle : ${esc(inst.def.name)} ${paramsText(inst.params)}. Choisissez la pièce de rechange dans le stock. Une pièce inadaptée peut ne pas fonctionner… ou être dangereuse.</p>
      <div class="stock">${parts.map((p, i) => `
        <button class="stock-item" onclick="Game.replace('${id}', ${STOCK.indexOf(p)})">
          <span class="stock-icon">${inst.def.icon}</span>
          <span class="stock-label">${esc(p.label)}</span>
          <span class="stock-price">${eur(p.price)}</span>
        </button>`).join('')}</div>
      <div class="modal-actions"><button class="btn" onclick="Game.closeModal()">Annuler</button></div>`);
  }
  function paramsText(p) {
    const parts = [];
    if (p.P) parts.push(`${p.P} W`);
    if (p.I) parts.push(`${p.I} A`);
    if (p.T) parts.push(`${p.T} °C`);
    if (p.C) parts.push(`${p.C} µF`);
    if (p.R && !p.P) parts.push(fmtOhm(p.R));
    return parts.length ? `(${parts.join(', ')})` : '';
  }
  function replace(id, stockIdx) {
    const inst = S.comps[id]; const part = STOCK[stockIdx];
    const wasFaulty = !!inst.fault || inst.state.blown;
    inst.params = { ...inst.params, ...part.params };
    inst.fault = null; inst.replaced = true; inst.visibleDamage = false; inst.inspectText = null;
    inst.state = { ...defaultState(inst.type), ...pickControls(inst.state) };
    inst.spin = 0;
    S.cost += part.price;
    log(`🔧 ${inst.label} remplacé par « ${part.label} » (${eur(part.price)})${wasFaulty ? '' : ' — cette pièce était pourtant bonne…'}`);
    closeModal();
    tick(0); renderAll();
  }
  function pickControls(s) {
    const keep = {};
    ['on', 'pos', 'plugged'].forEach((k) => { if (k in s) keep[k] = s[k]; });
    return keep;
  }

  function hint() {
    const remaining = Object.values(S.comps).filter((i) => i.fault || i.state.blown);
    if (!remaining.length) { toast('✅ Aucune panne restante : lancez le test final !', 'ok'); return; }
    S.hints++;
    const inst = remaining[S.hintIdx % remaining.length]; S.hintIdx++;
    const f = inst.fault ? inst.def.faults[inst.fault] : null;
    const txt = f ? f.hint : `Un ${inst.def.short.toLowerCase()} a grillé pendant le fonctionnement : vérifiez-le à l'ohmmètre et cherchez pourquoi.`;
    log(`💡 Indice : ${txt}`);
    openModal(`<h2>💡 Indice</h2><p>${esc(txt)}</p><p class="muted">Les indices réduisent votre score.</p><div class="modal-actions"><button class="btn primary" onclick="Game.closeModal()">OK</button></div>`);
  }
  function toggleXray() {
    S.xray = !S.xray;
    if (S.xray && !S.xrayUsed) { S.xrayUsed = true; S.hints++; log('👁 Mode « voir les tensions » activé (compte comme un indice).'); }
    renderAll();
  }

  /* ------------------------------------------------------------------ */
  /* Test final                                                          */
  /* ------------------------------------------------------------------ */
  function runTests() {
    if (S.finished) return;
    const results = [];
    const allOk = runTestsCore(results);
    const remaining = Object.values(S.comps).filter((i) => i.fault || i.state.blown);
    if (allOk) finish(results); else showTestReport(results, remaining);
  }
  function runTestsCore(results) {
    S.testing = true; S.events = [];
    const source = Object.values(S.comps).find((i) => i.type === 'prise' || i.type === 'pile');
    const saved = {};
    Object.values(S.comps).forEach((i) => { saved[i.id] = { ...i.state }; });
    L.tests.forEach((t) => {
      Object.entries(t.controls).forEach(([id, st]) => Object.assign(S.comps[id].state, st));
      source.state.plugged = true;
      Object.values(S.comps).forEach((i) => { if (i.type === 'thermostat') { i.state.trips = 0; } if (i.type === 'resistance') { i.state.T = 20; i.state.Ts = 20; } i.spin = 0; });
      const evBefore = S.events.length;
      const maxOut = {};
      for (let k = 0; k < 400; k++) { // 40 s simulées
        tick(TICK);
        Object.keys(t.expect).forEach((id) => { maxOut[id] = Math.max(maxOut[id] || 0, S.comps[id].out); });
      }
      const details = [];
      let ok = true;
      Object.entries(t.expect).forEach(([id, exp]) => {
        const inst = S.comps[id];
        if (exp === 'on') { const good = maxOut[id] > 0.5; ok = ok && good; details.push(`${good ? '✔' : '✘'} ${inst.label} : ${outText(inst, maxOut[id])}`); }
        else if (exp === 'off') { const good = maxOut[id] < 0.05; ok = ok && good; details.push(`${good ? '✔' : '✘'} ${inst.label} : ${good ? 'à l\'arrêt (normal)' : 'fonctionne alors qu\'il devrait être arrêté !'}`); }
        else if (exp === 'regule') { const good = inst.state.trips >= 1 && !S.events.slice(evBefore).some((e) => e.includes('thermique')); ok = ok && good; details.push(`${good ? '✔' : '✘'} ${inst.label} : ${inst.state.trips >= 1 ? `a coupé ${inst.state.trips} fois à ${inst.params.T} °C` : 'n\'a jamais coupé'}`); }
      });
      const evs = S.events.slice(evBefore);
      if (evs.length) { ok = false; evs.forEach((e) => details.push('✘ ' + e)); }
      results.push({ name: t.name, ok, details });
    });
    // remettre l'état
    Object.values(S.comps).forEach((i) => { Object.assign(i.state, pickControls(saved[i.id])); });
    source.state.plugged = false;
    S.testing = false;
    const remaining = Object.values(S.comps).filter((i) => i.fault || i.state.blown);
    const allOk = results.every((r) => r.ok) && remaining.length === 0;
    log(allOk ? '✅ Test final réussi !' : '❌ Test final : des points ne fonctionnent pas.');
    tick(0); renderAll();
    return allOk;
  }
  function outText(inst, v) {
    const k = inst.def.output.kind;
    const pct = Math.round(Math.min(1, v) * 100);
    if (v < 0.05) return k === 'light' ? 'reste éteint' : k === 'heat' ? 'ne chauffe pas' : k === 'spin' ? 'ne tourne pas' : 'ne s\'ouvre pas';
    if (v < 0.5) return k === 'spin' && v <= 0.09 ? 'vibre / ronronne sans tourner' : `faible (${pct} %)`;
    return k === 'light' ? `éclaire (${pct} %)` : k === 'heat' ? `chauffe (${pct} %)` : k === 'spin' ? `tourne (${pct} %)` : 'ouverte';
  }
  function showTestReport(results, remaining) {
    openModal(`
      <h2>🧪 Rapport de test</h2>
      ${results.map((r) => `<div class="test ${r.ok ? 'ok' : 'ko'}"><div class="test-name">${r.ok ? '✅' : '❌'} ${esc(r.name)}</div><ul>${r.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')}
      ${results.every((r) => r.ok) && remaining.length ? `<p class="warn">Tout semble fonctionner, mais une pièce défectueuse reste en place (elle ne perturbe pas le test). Cherchez encore.</p>` : ''}
      <p class="muted">L'appareil a été remis hors tension. Continuez le diagnostic.</p>
      <div class="modal-actions"><button class="btn primary" onclick="Game.closeModal()">Continuer</button></div>`);
  }

  function finish() {
    S.finished = true;
    const issues = [];
    let stars = 3;
    if (L.fuse) {
      const f = S.comps[L.fuse.id];
      if (f.params.I > L.fuse.I) { issues.push(`⚠ Fusible de ${f.params.I} A à la place de ${L.fuse.I} A : il ne protège plus l'appareil. Dangereux !`); stars--; }
      else if (f.params.I < L.fuse.I) issues.push(`ℹ Fusible de ${f.params.I} A à la place de ${L.fuse.I} A : il tient, mais risque de déclencher pour rien.`);
    }
    if (S.safety > 0) { issues.push(`⚠ ${S.safety} erreur(s) de sécurité (mesure en Ω sous tension).`); stars--; }
    const waste = S.cost - S.optimalCost;
    if (waste > 0.01) { issues.push(`💸 ${eur(waste)} dépensés en pièces qui n'étaient pas en panne.`); if (waste > S.optimalCost * 0.5 + 1) stars--; }
    if (S.hints > 0) { issues.push(`💡 ${S.hints} indice(s) utilisé(s).`); if (S.hints >= 2) stars--; }
    stars = Math.max(1, stars);
    progress[L.id] = Math.max(progress[L.id] || 0, stars);
    saveProgress();
    const mins = Math.round((Date.now() - S.startTime) / 6000) / 10;
    const next = LEVELS[LEVELS.indexOf(L) + 1];
    openModal(`
      <h2>🎉 Appareil réparé !</h2>
      <div class="stars big">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div class="lesson"><b>Ce qu'il fallait comprendre :</b> ${esc(S.scenario.lesson)}</div>
      <table class="stats">
        <tr><td>Pièces dépensées</td><td>${eur(S.cost)} <span class="muted">(minimum : ${eur(S.optimalCost)})</span></td></tr>
        <tr><td>Mesures effectuées</td><td>${S.measurements}</td></tr>
        <tr><td>Temps</td><td>${mins} min</td></tr>
      </table>
      ${issues.length ? `<ul class="issues">${issues.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p class="ok">Réparation propre, économe et sûre. Bravo !</p>'}
      <div class="modal-actions">
        <button class="btn" onclick="Game.startLevel('${L.id}')">🔁 Autre panne</button>
        ${next ? `<button class="btn primary" onclick="Game.startLevel('${next.id}')">Suivant : ${next.icon} ${esc(next.name)}</button>` : ''}
        <button class="btn" onclick="Game.menu()">Menu</button>
      </div>`);
  }

  /* ------------------------------------------------------------------ */
  /* Rendu                                                               */
  /* ------------------------------------------------------------------ */
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  }
  function menu() {
    if (timer) { clearInterval(timer); timer = null; }
    closeModal();
    showScreen('menu');
    el('levels').innerHTML = LEVELS.map((l) => `
      <button class="level-card" onclick="Game.startLevel('${l.id}')">
        <div class="level-icon">${l.icon}</div>
        <div class="level-name">${esc(l.name)}</div>
        <div class="level-diff">${'⚡'.repeat(l.difficulty)}</div>
        <div class="stars">${progress[l.id] ? '★'.repeat(progress[l.id]) + '☆'.repeat(3 - progress[l.id]) : '☆☆☆'}</div>
        <div class="level-parts">${[...new Set(l.comps.map((c) => TYPES[c.type].short))].slice(1).join(' · ')}</div>
      </button>`).join('');
  }

  function buildStatic() {
    const view = L.view || [0, 0, 820, 460];
    const svg = el('schematic');
    svg.setAttribute('viewBox', view.join(' '));
  }

  function wirePath(w) {
    const pts = w.map((p) => (typeof p === 'string' ? pinPos(p) : p));
    return 'M' + pts.map((p) => p.join(',')).join(' L');
  }

  function nodeClass(ref) {
    if (!S.xray || !S.res) return '';
    const v = S.res.V(ref);
    const g = S.res.find(L.ground);
    if (S.res.find(ref) === g) return 'n-gnd';
    const ref0 = L.ac ? 230 : 4.5;
    if (Math.abs(v) > ref0 * 0.3) return 'n-hot';
    if (Math.abs(v) > ref0 * 0.02) return 'n-mid';
    return 'n-float';
  }

  function renderSvg() {
    const parts = [];
    // fils
    L.wires.forEach((w) => {
      parts.push(`<path class="wire ${nodeClass(w[0])}" d="${wirePath(w)}"/>`);
    });
    // composants
    S.order.forEach((id) => {
      const inst = S.comps[id];
      let inner = inst.def.draw(inst);
      if (inst.rot) inner = inner.replace(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g, (m, x, y) => `<text x="${x}" y="${y}" transform="rotate(${-inst.rot} ${x} ${y})"`);
      const sel = S.selected === id ? 'selected' : '';
      const bad = inst.visibleDamage ? 'damaged' : '';
      parts.push(`<g class="comp ${sel} ${bad} ${inst.replaced ? 'replaced' : ''}" data-id="${id}">
        <rect class="hit" x="${inst.x - 48}" y="${inst.y - 48}" width="96" height="96" rx="10"/>
        <g transform="translate(${inst.x},${inst.y}) rotate(${inst.rot})">${inner}</g>
        <text class="comp-label" x="${inst.x}" y="${inst.y + (inst.rot ? 58 : 50)}">${esc(inst.label)}</text>
        ${inst.visibleDamage ? `<text class="damage-mark" x="${inst.x + 30}" y="${inst.y - 34}">⚠</text>` : ''}
        ${inst.replaced ? `<text class="new-mark" x="${inst.x - 36}" y="${inst.y - 34}">✦</text>` : ''}
      </g>`);
    });
    // bornes
    S.order.forEach((id) => {
      const inst = S.comps[id];
      inst.def.pins.forEach((p) => {
        const ref = `${id}.${p.id}`;
        const [x, y] = pinPos(ref);
        const probe = S.probes.red === ref ? 'red' : S.probes.black === ref ? 'black' : '';
        parts.push(`<g class="pin ${probe} ${nodeClass(ref)}" data-pin="${ref}">
          <circle class="pin-hit" cx="${x}" cy="${y}" r="15"/>
          <circle class="pin-dot" cx="${x}" cy="${y}" r="5"/>
          ${probe ? `<circle class="probe-ring" cx="${x}" cy="${y}" r="10"/><text class="probe-txt" x="${x}" y="${y - 16}">${probe === 'red' ? 'V+' : 'COM'}</text>` : ''}
        </g>`);
      });
    });
    el('schematic').innerHTML = parts.join('');
  }

  function renderHeader() {
    el('hud-level').textContent = `${L.icon} ${L.name}`;
    el('hud-cost').textContent = eur(S.cost);
    el('hud-meas').textContent = S.measurements;
    const badge = el('hud-power');
    badge.textContent = S.powered ? '⚡ SOUS TENSION' : '○ hors tension';
    badge.className = 'badge ' + (S.powered ? 'on' : 'off');
    el('btn-xray').classList.toggle('active', S.xray);
  }

  function renderMeter() {
    el('meter-display').textContent = S.reading;
    el('meter-display').className = 'meter-display ' + (S.readingCls || '');
    el('meter-modes').innerHTML = MODES.map((m) => `<button class="mode ${S.mode === m ? 'active' : ''}" onclick="Game.setMode('${m}')">${m}</button>`).join('');
    const pr = (which, label) => `<button class="probe-btn ${which} ${S.nextProbe === which ? 'next' : ''}" onclick="Game.pickProbe('${which}')"><span class="probe-dot"></span>${label} : <b>${S.probes[which] ? esc(pinName(S.probes[which])) : '—'}</b></button>`;
    el('meter-probes').innerHTML = pr('red', 'Rouge (V/Ω)') + pr('black', 'Noir (COM)') + `<button class="btn small" onclick="Game.clearProbes()">Retirer</button>`;
    el('meter-help').textContent = S.mode === 'OFF' ? 'Choisissez un mode, puis touchez deux bornes du schéma.' : (S.mode.startsWith('V') ? 'Voltmètre : appareil branché, en parallèle de ce que vous mesurez.' : 'Ohmmètre : appareil DÉBRANCHÉ, sinon danger.');
  }

  function renderConstat() {
    const outs = Object.values(S.comps).filter((i) => i.def.output);
    el('symptom').textContent = S.scenario.symptom;
    el('outputs').innerHTML = outs.map((i) => {
      const v = i.out;
      const cls = v > 0.5 ? 'on' : v > 0.05 ? 'weak' : 'off';
      return `<div class="out ${cls}"><span>${i.def.icon} ${esc(i.label)}</span><span>${esc(outText(i, v))}</span></div>`;
    }).join('');
  }

  function renderPanel() {
    const box = el('selected');
    if (!S.selected) { box.innerHTML = '<p class="muted">Touchez un composant du schéma pour l\'examiner, l\'actionner ou le remplacer. Touchez une borne (point) pour y poser une pointe du multimètre.</p>'; return; }
    const inst = S.comps[S.selected];
    const d = inst.def;
    box.innerHTML = `
      <div class="sel-head"><span class="sel-icon">${d.icon}</span><div><div class="sel-name">${esc(inst.label)}</div><div class="muted">${esc(d.name)} ${paramsText(inst.params)}</div></div></div>
      <p class="sel-role">${d.fiche.role}</p>
      <div class="sel-actions">
        ${d.control ? `<button class="btn primary" onclick="Game.actuate('${inst.id}')">${d.control.label(inst.state)}</button>` : ''}
        <button class="btn" onclick="Game.inspect('${inst.id}')">🔍 Inspecter</button>
        ${d.fixed ? '' : `<button class="btn" onclick="Game.openReplace('${inst.id}')">🔧 Remplacer…</button>`}
        <button class="btn" onclick="Game.showFiche('${inst.type}')">📖 Fiche</button>
      </div>
      ${inst.inspectText ? `<div class="inspect ${inst.visibleDamage ? 'bad' : ''}">🔍 ${esc(inst.inspectText)}</div>` : ''}
      ${inst.type === 'resistance' && inst.state.T > 40 ? `<div class="muted">Température : ${Math.round(inst.state.T)} °C</div>` : ''}`;
  }

  function renderLog() {
    el('log').innerHTML = S.log.slice(0, 12).map((e) => `<li>${esc(e.msg)}</li>`).join('');
  }

  function renderAll() { renderSvg(); renderHeader(); renderMeter(); renderConstat(); renderPanel(); renderLog(); }
  function renderDynamic() {
    if (!S || S.finished && !document.hidden) { if (!S) return; }
    renderSvg(); renderHeader(); renderMeter(); renderConstat(); renderLog();
    if (S.selected) { const inst = S.comps[S.selected]; if (inst.type === 'resistance') renderPanel(); }
  }

  /* ------------------------------------------------------------------ */
  /* Fiches / encyclopédie                                                */
  /* ------------------------------------------------------------------ */
  function ficheHtml(type) {
    const d = TYPES[type];
    const inst = { params: { V: 230, P: 60, I: 5, T: 100, C: 2, R: 100 }, state: { on: true, plugged: true, pos: 1, T: 20 }, out: 1, fault: null };
    return `
      <div class="fiche">
        <div class="fiche-head"><span class="sel-icon">${d.icon}</span><h3>${esc(d.name)}</h3></div>
        <svg class="fiche-sym" viewBox="-60 -60 120 120"><g>${d.draw(inst)}</g></svg>
        <p><b>Rôle :</b> ${d.fiche.role}</p>
        <p><b>Comment le tester :</b> ${d.fiche.test}</p>
        <p><b>Pannes fréquentes :</b> ${d.fiche.pannes}</p>
        ${d.fiche.formule ? `<p class="formule">📐 ${esc(d.fiche.formule)}</p>` : ''}
        ${Object.keys(d.faults).length ? `<p class="muted">Pannes simulées dans le jeu : ${Object.values(d.faults).map((f) => esc(f.label)).join(' · ')}</p>` : ''}
      </div>`;
  }
  function showFiche(type) {
    openModal(`${ficheHtml(type)}<div class="modal-actions"><button class="btn" onclick="Game.showEncyclo()">📚 Toutes les fiches</button><button class="btn primary" onclick="Game.closeModal()">Fermer</button></div>`);
  }
  function showEncyclo(type) {
    const types = Object.keys(TYPES);
    const cur = type || 'multimetre';
    const body = cur === 'multimetre'
      ? `<div class="fiche"><div class="fiche-head"><span class="sel-icon">${FICHE_MULTIMETRE.icon}</span><h3>${FICHE_MULTIMETRE.name}</h3></div>${FICHE_MULTIMETRE.sections.map(([t, b]) => `<p><b>${t} :</b> ${b}</p>`).join('')}</div>`
      : ficheHtml(cur);
    openModal(`
      <h2>📚 Encyclopédie</h2>
      <div class="encyclo">
        <div class="encyclo-list">
          <button class="enc ${cur === 'multimetre' ? 'active' : ''}" onclick="Game.showEncyclo('multimetre')">📟 Le multimètre</button>
          ${types.map((t) => `<button class="enc ${cur === t ? 'active' : ''}" onclick="Game.showEncyclo('${t}')">${TYPES[t].icon} ${esc(TYPES[t].short)}</button>`).join('')}
        </div>
        <div class="encyclo-body">${body}</div>
      </div>
      <div class="modal-actions"><button class="btn primary" onclick="Game.closeModal()">Fermer</button></div>`, 'wide');
  }

  /* ------------------------------------------------------------------ */
  /* Modales & toasts                                                    */
  /* ------------------------------------------------------------------ */
  function openModal(html, cls) {
    el('modal-box').innerHTML = html;
    el('modal-box').className = 'modal-box ' + (cls || '');
    el('modal').classList.add('open');
  }
  function closeModal() { el('modal').classList.remove('open'); }
  let toastTimer = null;
  function toast(msg, cls) {
    const t = el('toast');
    t.textContent = msg; t.className = 'toast show ' + (cls || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 3500);
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    const svg = el('schematic');
    svg.addEventListener('click', (e) => {
      const pin = e.target.closest('.pin');
      if (pin) { clickPin(pin.dataset.pin); return; }
      const comp = e.target.closest('.comp');
      if (comp) { selectComp(comp.dataset.id); return; }
    });
    el('modal').addEventListener('click', (e) => { if (e.target === el('modal')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    menu();
  }

  /* Hooks de test (non utilisés par l'interface) */
  function _runTestsSilent() {
    const saveOpen = openModal; // on neutralise les modales pendant le test
    const results = [];
    const r = runTestsCore(results);
    return { results, allOk: r };
  }
  return { _state: () => S, _runTestsSilent, init, menu, startLevel, setMode, pickProbe, clearProbes, actuate, inspect, openReplace, replace, hint, toggleXray, runTests, showFiche, showEncyclo, closeModal, selectComp };
})();

window.addEventListener('DOMContentLoaded', Game.init);
