import { spellEffectLines } from './Spells.js';

// HUD DOM : panneau bas avec stats + barre de sorts.
// Chaque slot affiche le numero de touche (haut-gauche), une icone SVG
// dessinee (centre, en blanc sur l accent de couleur du sort) et le
// cout en PA (bas-droite). Tooltip riche au survol de la souris.
export class Hud {
  constructor() {
    this.callbacks = {};
    this.spellSlots = [];
    this.build();
  }

  build() {
    const css = document.createElement('style');
    css.textContent = `
      #hud-panel {
        position: fixed; left: 50%; bottom: 16px;
        transform: translateX(-50%);
        display: flex; align-items: center; gap: 14px;
        background: rgba(12, 12, 20, 0.85);
        border: 2px solid #444a66;
        border-radius: 14px;
        padding: 8px 14px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        max-width: 96vw;
        cursor: move;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      #hud-panel.dragging {
        cursor: grabbing;
        opacity: 0.9;
        box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f;
      }
      #hud-panel button { cursor: pointer; }
      #hud-panel.dragging button { pointer-events: none; }
      #hud-panel .stats { min-width: 180px; }
      #hud-panel .name { font-size: 16px; color: #f1c40f; font-weight: bold; margin-bottom: 4px; }
      #hud-panel .stat-row {
        display: flex; gap: 8px; align-items: center;
      }
      #hud-panel .stat-icon {
        position: relative;
        width: 46px; height: 46px;
        flex-shrink: 0;
      }
      #hud-panel .stat-icon svg {
        width: 100%; height: 100%; display: block;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));
      }
      #hud-panel .stat-icon .value {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font: bold 12px "Trebuchet MS", sans-serif;
        color: #fff;
        text-shadow: 1px 1px 2px #000, 0 0 3px #000, 0 0 4px rgba(0,0,0,0.7);
        pointer-events: none;
        line-height: 1;
      }
      #hud-panel .stat-icon.stat-pm .value { transform: translateX(-3px); }
      #hud-panel .buffs { font-size: 12px; margin-top: 4px; line-height: 1.4; }
      #hud-panel .buff { color: #d6a3f0; font-style: italic; }
      #hud-panel .actions { display: flex; gap: 6px; align-items: center; }
      #hud-panel .btn {
        background: #2c3e50; border: 2px solid #6a7090; color: #fff;
        padding: 8px 12px; font-size: 13px; font-family: inherit;
        font-weight: bold; border-radius: 8px;
        cursor: pointer; touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      #hud-panel .btn.active { background: #f1c40f; color: #14182a; border-color: #f1c40f; }
      #hud-panel .btn:disabled { opacity: 0.4; cursor: default; }
      #hud-panel .btn.end { background: #c0392b; border-color: #7c1f17; }

      .spell-bar { display: flex; gap: 5px; }
      .spell {
        position: relative;
        width: 58px; height: 58px;
        background: #1f2335;
        border: 2px solid #444a66;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      .spell:hover { border-color: #f1c40f; }
      .spell.active { border-color: #f1c40f; border-width: 3px; box-shadow: 0 0 12px #f1c40f; }
      .spell:disabled { opacity: 0.45; cursor: default; }
      .spell:disabled:hover { border-color: #444a66; }
      .spell.cooldown { opacity: 0.5; cursor: default; }
      .spell.cooldown .icon { opacity: 0.2; }
      .spell.cooldown .cost { opacity: 0.2; }
      .spell .cd-overlay {
        position: absolute; inset: 0;
        display: none;
        align-items: center; justify-content: center;
        font-size: 26px; font-weight: bold;
        color: #fff;
        text-shadow: 1px 1px 3px #000, 0 0 4px #000;
        z-index: 4;
      }
      .spell.cooldown .cd-overlay { display: flex; }
      .spell .accent {
        position: absolute; inset: 4px;
        border-radius: 5px;
        opacity: 0.85;
      }
      .spell .key {
        position: absolute; top: 2px; left: 5px;
        font-size: 10px; font-weight: bold; color: #fff;
        text-shadow: 1px 1px 2px #000;
        z-index: 3;
      }
      .spell .icon {
        position: relative; z-index: 2;
        width: 70%; height: 70%;
        color: #fff;
        filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.6));
      }
      .spell .icon svg { width: 100%; height: 100%; }
      .spell .cost {
        position: absolute; bottom: 2px; right: 5px;
        font-size: 12px; font-weight: bold; color: #fff;
        text-shadow: 1px 1px 2px #000;
        z-index: 3;
      }

      #spell-tooltip {
        position: fixed;
        background: rgba(8, 10, 18, 0.95);
        color: #fff;
        border: 2px solid #f1c40f;
        border-radius: 10px;
        padding: 10px 14px;
        font-family: "Trebuchet MS", sans-serif;
        font-size: 13px;
        max-width: 260px;
        pointer-events: none;
        z-index: 50;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        opacity: 0;
        transition: opacity 0.12s ease-out;
      }
      #spell-tooltip.show { opacity: 1; }
      #spell-tooltip .tip-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      #spell-tooltip .tip-desc { color: #ddd; margin-bottom: 8px; font-style: italic; }
      #spell-tooltip .tip-row { margin: 2px 0; }
      #spell-tooltip .tip-row .lbl { color: #f1c40f; margin-right: 4px; }
      #spell-tooltip .tip-effects .eff { color: #ff9bbd; font-weight: bold; }

      #end-overlay {
        position: fixed; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.7); color: #fff;
        z-index: 20;
        font-family: "Trebuchet MS", sans-serif;
      }
      #end-overlay .title { font-size: 64px; font-weight: bold; margin-bottom: 16px; }
      #end-overlay .sub { font-size: 18px; color: #ccc; margin-bottom: 24px; }
      #end-overlay button {
        background: #27ae60; border: 2px solid #145a32; color: #fff;
        padding: 12px 28px; font-size: 20px; border-radius: 8px;
        font-family: inherit; font-weight: bold; cursor: pointer;
      }

      #flash {
        position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.7); color: #f1c40f; padding: 8px 16px;
        border-radius: 8px; font-size: 14px; pointer-events: none;
        opacity: 0; transition: opacity 0.25s ease-out;
        font-family: "Trebuchet MS", sans-serif;
      }
      #flash.show { opacity: 1; }

      .rot-btn {
        position: fixed;
        top: 50%; transform: translateY(-50%);
        width: 60px; height: 60px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #f1c40f;
        color: #f1c40f;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      .rot-btn:hover { background: rgba(241, 196, 15, 0.18); }
      .rot-btn:active { background: #f1c40f; color: #14182a; transform: translateY(-50%) scale(0.92); }
      #rot-left { left: 16px; }
      #rot-right { right: 16px; }
      #rot-recenter {
        position: fixed;
        top: 16px; right: 16px;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #3498db;
        color: #5dade2;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      #rot-recenter:hover { background: rgba(52, 152, 219, 0.2); }
      #rot-recenter:active { background: #3498db; color: #14182a; transform: scale(0.92); }
      #rot-recenter svg { width: 30px; height: 30px; display: block; }
      .rot-btn svg { width: 34px; height: 34px; display: block; }
    `;
    document.head.appendChild(css);

    const heartSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ff7088"/>
            <stop offset="1" stop-color="#7c1f17"/>
          </linearGradient>
        </defs>
        <path d="M16 28 C2 18 2 7 9 7 C12 7 15 9 16 12 C17 9 20 7 23 7 C30 7 30 18 16 28 Z"
              fill="url(#hp-grad)" stroke="#3a0e09" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    const starSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pa-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7dc6f3"/>
            <stop offset="1" stop-color="#1a4d6e"/>
          </linearGradient>
        </defs>
        <polygon points="16 3 19.3 12 29 12.5 21.4 18.7 24 28 16 22.5 8 28 10.6 18.7 3 12.5 12.7 12"
                 fill="url(#pa-grad)" stroke="#0c2336" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    const arrowSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pm-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6ee7b6"/>
            <stop offset="1" stop-color="#0d6b3e"/>
          </linearGradient>
        </defs>
        <polygon points="3 11 18 11 18 4 30 16 18 28 18 21 3 21"
                 fill="url(#pm-grad)" stroke="#063820" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;

    const panel = document.createElement('div');
    panel.id = 'hud-panel';
    panel.innerHTML = `
      <div class="stats">
        <div class="name" id="hud-name">-</div>
        <div class="stat-row">
          <div class="stat-icon stat-hp" title="Points de Vie">${heartSvg}<span class="value" id="hud-hp">-</span></div>
          <div class="stat-icon stat-pa" title="Points d Action">${starSvg}<span class="value" id="hud-pa">-</span></div>
          <div class="stat-icon stat-pm" title="Points de Mouvement">${arrowSvg}<span class="value" id="hud-pm">-</span></div>
        </div>
        <div class="buffs" id="hud-buffs"></div>
      </div>
      <div class="actions">
        <button class="btn" id="btn-move">Deplacer (M)</button>
        <div class="spell-bar" id="spell-bar"></div>
        <button class="btn end" id="btn-end">Fin de tour (Esp)</button>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;

    const flash = document.createElement('div');
    flash.id = 'flash';
    document.body.appendChild(flash);
    this.flashEl = flash;

    this.nameEl = document.getElementById('hud-name');
    this.hpEl = document.getElementById('hud-hp');
    this.paEl = document.getElementById('hud-pa');
    this.pmEl = document.getElementById('hud-pm');
    this.buffsEl = document.getElementById('hud-buffs');
    this.btnMove = document.getElementById('btn-move');
    this.btnEnd = document.getElementById('btn-end');
    this.spellBar = document.getElementById('spell-bar');

    this.btnMove.addEventListener('click', () => this.callbacks.onMove && this.callbacks.onMove());
    this.btnEnd.addEventListener('click', () => this.callbacks.onEnd && this.callbacks.onEnd());

    this.buildRotationButtons();
    this.makePanelDraggable();
    this.restorePanelPosition();
  }

  // Permet de saisir le HUD sur une zone non-bouton et de le glisser
  // ou on veut. La position est sauvegardee dans localStorage.
  makePanelDraggable() {
    const panel = this.panel;
    let drag = null;

    const onDown = (e) => {
      // Si on commence sur un bouton (ou un de ses enfants), on laisse
      // le bouton recevoir le click normalement.
      if (e.target.closest('button')) return;
      e.preventDefault();
      const rect = panel.getBoundingClientRect();
      drag = {
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      panel.classList.add('dragging');
    };

    const onMove = (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;
      e.preventDefault();
      let x = e.clientX - drag.offsetX;
      let y = e.clientY - drag.offsetY;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      // Clamp : on laisse depasser legerement mais on garde toujours
      // le coeur du HUD dans le viewport (sinon plus moyen de le ratraper).
      const margin = 80;
      x = Math.max(margin - w, Math.min(window.innerWidth - margin, x));
      y = Math.max(0, Math.min(window.innerHeight - 30, y));
      this.setPanelPos(x, y);
    };

    const onEnd = (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;
      drag = null;
      panel.classList.remove('dragging');
      const rect = panel.getBoundingClientRect();
      try {
        localStorage.setItem('dofus3d.hudPos', JSON.stringify({
          x: rect.left, y: rect.top,
        }));
      } catch (_) {}
    };

    panel.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);
    window.addEventListener('blur', () => { drag = null; panel.classList.remove('dragging'); });
  }

  setPanelPos(x, y) {
    const p = this.panel;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.bottom = 'auto';
    p.style.transform = 'none';
  }

  restorePanelPosition() {
    let raw;
    try { raw = localStorage.getItem('dofus3d.hudPos'); } catch (_) { return; }
    if (!raw) return;
    let pos;
    try { pos = JSON.parse(raw); } catch (_) { return; }
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
    // On differe l application au prochain frame parce que le panel doit
    // d abord etre mesure (apres le 1er update -> rebuildSpellBar).
    const apply = () => {
      const w = this.panel.offsetWidth;
      const h = this.panel.offsetHeight;
      if (w === 0) return; // pas encore mesure, on reessaye au prochain frame
      const margin = 80;
      const x = Math.max(margin - w, Math.min(window.innerWidth - margin, pos.x));
      const y = Math.max(0, Math.min(window.innerHeight - 30, pos.y));
      this.setPanelPos(x, y);
    };
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 50);
  }

  buildRotationButtons() {
    const svgCcw = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M27 16 a11 11 0 1 0 -3.2 7.8"/>
        <polyline points="27 9 27 16 20 16"/>
      </svg>`;
    const svgCw = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 16 a11 11 0 1 1 3.2 7.8"/>
        <polyline points="5 9 5 16 12 16"/>
      </svg>`;
    const left = document.createElement('button');
    left.id = 'rot-left'; left.className = 'rot-btn'; left.innerHTML = svgCcw;
    left.title = 'Tourner la map (1/4 de tour a gauche)';
    left.addEventListener('click', () => this.callbacks.onRotateLeft && this.callbacks.onRotateLeft());
    document.body.appendChild(left);
    const right = document.createElement('button');
    right.id = 'rot-right'; right.className = 'rot-btn'; right.innerHTML = svgCw;
    right.title = 'Tourner la map (1/4 de tour a droite)';
    right.addEventListener('click', () => this.callbacks.onRotateRight && this.callbacks.onRotateRight());
    document.body.appendChild(right);

    // Bouton recentrer : recadre la camera + angle/zoom d origine.
    const svgCenter = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="9"/>
        <line x1="16" y1="3" x2="16" y2="8"/>
        <line x1="16" y1="24" x2="16" y2="29"/>
        <line x1="3" y1="16" x2="8" y2="16"/>
        <line x1="24" y1="16" x2="29" y2="16"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>`;
    const center = document.createElement('button');
    center.id = 'rot-recenter'; center.innerHTML = svgCenter;
    center.title = 'Recentrer la camera (angle / zoom par defaut)';
    center.addEventListener('click', () => this.callbacks.onResetCamera && this.callbacks.onResetCamera());
    document.body.appendChild(center);
  }

  on(eventName, cb) {
    this.callbacks[eventName] = cb;
  }

  // (Re)construit la barre de sorts a partir des sorts du fighter actif.
  rebuildSpellBar(fighter) {
    this.spellBar.innerHTML = '';
    this.spellSlots = [];
    if (!fighter) return;
    fighter.spells.forEach((spell, idx) => {
      const btn = document.createElement('button');
      btn.className = 'spell';
      btn.dataset.slot = String(idx);
      // Numero de touche : 1..9 puis 0, sinon ^N pour les futurs Ctrl+N.
      const keyLabel = idx < 9 ? String(idx + 1) : (idx === 9 ? '0' : `^${idx - 9}`);
      btn.innerHTML = `
        <div class="accent" style="background: ${spell.color};"></div>
        <div class="key">${keyLabel}</div>
        <div class="icon">${spell.icon || ''}</div>
        <div class="cost">${spell.apCost} PA</div>
        <div class="cd-overlay"></div>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onSpellSlot && this.callbacks.onSpellSlot(idx);
      });
      // Tooltip riche au survol souris (pas sur touch, qui ne fait pas hover).
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.showTooltip(spell, btn);
      });
      btn.addEventListener('pointerleave', () => this.hideTooltip());
      this.spellBar.appendChild(btn);
      this.spellSlots.push({ btn, spell });
    });
  }

  ensureTooltip() {
    if (this.tooltipEl) return this.tooltipEl;
    const el = document.createElement('div');
    el.id = 'spell-tooltip';
    document.body.appendChild(el);
    this.tooltipEl = el;
    return el;
  }

  showTooltip(spell, anchorEl) {
    const el = this.ensureTooltip();
    const effectLines = spellEffectLines(spell);
    const losTxt = spell.needsLOS ? 'Requiert une ligne de vue' : 'Pas de vue requise';
    const rangeTxt = spell.range.min === spell.range.max
      ? `${spell.range.min} case${spell.range.min > 1 ? 's' : ''}`
      : `${spell.range.min} a ${spell.range.max} cases`;
    const cdLine = spell.cooldown
      ? `<div class="tip-row"><span class="lbl">Recharge :</span> ${spell.cooldown} tours</div>` : '';
    el.innerHTML = `
      <div class="tip-name" style="color: ${spell.color};">${spell.name}</div>
      <div class="tip-desc">${spell.desc}</div>
      <div class="tip-row tip-effects">${effectLines.map(l => `<div class="eff">${l}</div>`).join('')}</div>
      <div class="tip-row"><span class="lbl">Cout :</span> ${spell.apCost} PA</div>
      <div class="tip-row"><span class="lbl">Portee :</span> ${rangeTxt}</div>
      <div class="tip-row"><span class="lbl">Vue :</span> ${losTxt}</div>
      ${cdLine}
    `;
    el.classList.add('show');
    // Position au-dessus du bouton avec un peu de marge.
    const rect = anchorEl.getBoundingClientRect();
    // Forcer un layout pour pouvoir mesurer
    el.style.left = '0px'; el.style.top = '0px';
    const tipRect = el.getBoundingClientRect();
    let x = rect.left + rect.width / 2 - tipRect.width / 2;
    x = Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, x));
    let y = rect.top - tipRect.height - 10;
    if (y < 8) y = rect.bottom + 10; // bascule en bas si pas la place en haut
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.classList.remove('show');
  }

  update(fighter, mode, selectedSpellId) {
    if (!fighter) return;
    // Reconstruit la barre si les sorts changent (fighter different).
    if (this._lastFighterId !== fighter.classId + fighter.team) {
      this.rebuildSpellBar(fighter);
      this._lastFighterId = fighter.classId + fighter.team;
    }
    this.nameEl.textContent = fighter.name + (fighter.team === 'player' ? '  (vous)' : '');
    this.hpEl.textContent = `${fighter.hp}/${fighter.maxHp}`;
    this.paEl.textContent = `${fighter.pa}/${fighter.maxPa}`;
    this.pmEl.textContent = `${fighter.pm}/${fighter.maxPm}`;

    // Affichage des buffs actifs. duration inclut le tour de cast : on
    // affiche duration - 1 pour le restant apres le tour en cours.
    if (fighter.buffs && fighter.buffs.length) {
      this.buffsEl.innerHTML = fighter.buffs.map(b => {
        const parts = [];
        if (b.damageMult) parts.push(`+${Math.round(b.damageMult * 100)}% degats`);
        if (b.bonusPa) parts.push(`+${b.bonusPa} PA`);
        if (b.bonusPm) parts.push(`+${b.bonusPm} PM`);
        if (b.shield) parts.push(`-${Math.round(b.shield * 100)}% degats reçus`);
        if (b.dot) parts.push(`Poison ${b.dot.min}-${b.dot.max}/tour`);
        if (parts.length === 0) return '';
        const tag = b.permanent ? '(carte)' : `(${Math.max(0, b.duration - 1)}t)`;
        return `<span class="buff">${parts.join(', ')} ${tag}</span>`;
      }).filter(s => s).join('  ');
    } else {
      this.buffsEl.innerHTML = '';
    }

    const isPlayer = fighter.team === 'player';
    // Un combattant avec un profil IA (Craqueleur invocation par ex.)
    // joue tout seul : le joueur ne peut pas le controler.
    const isAutonomous = !!fighter.def.ai;
    const canControl = isPlayer && !isAutonomous;
    this.btnMove.disabled = !canControl;
    this.btnEnd.disabled = !canControl;
    this.btnMove.classList.toggle('active', mode === 'move' && canControl);

    for (const slot of this.spellSlots) {
      const cd = (fighter.spellCooldowns && fighter.spellCooldowns[slot.spell.id]) || 0;
      const isAutonomous = !!fighter.def.ai;
      const usable = isPlayer && !isAutonomous && cd === 0 && fighter.pa >= slot.spell.apCost;
      slot.btn.disabled = !usable;
      slot.btn.classList.toggle('cooldown', cd > 0);
      slot.btn.classList.toggle('active',
        isPlayer && mode === 'spell' && selectedSpellId === slot.spell.id
      );
      // Affiche le compteur sur le slot.
      const cdEl = slot.btn.querySelector('.cd-overlay');
      if (cdEl) cdEl.textContent = cd > 0 ? String(cd) : '';
    }
  }

  showEnd(winner, onReplay) {
    const overlay = document.createElement('div');
    overlay.id = 'end-overlay';
    overlay.innerHTML = `
      <div class="title" style="color: ${winner === 'player' ? '#2ecc71' : '#e74c3c'}">
        ${winner === 'player' ? 'VICTOIRE' : 'DEFAITE'}
      </div>
      <div class="sub">${winner === 'player' ? 'Tu as terrasse le Bouftou !' : 'Le Bouftou t a vaincu...'}</div>
      <button id="btn-replay">REJOUER</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById('btn-replay').addEventListener('click', () => {
      overlay.remove();
      onReplay && onReplay();
      this._lastFighterId = null; // force rebuild de la barre
    });
  }

  flash(text, durationMs = 1400) {
    this.flashEl.textContent = text;
    this.flashEl.classList.add('show');
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => this.flashEl.classList.remove('show'), durationMs);
  }
}
