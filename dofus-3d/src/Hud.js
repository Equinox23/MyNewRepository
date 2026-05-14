// HUD DOM : panneau bas avec stats + barre de sorts.
// Chaque slot affiche le numero de touche (haut-gauche), un mini libelle
// (au centre) et le cout en PA (bas-droite). L emplacement actif est
// surligne en jaune. Les sorts qu on ne peut pas lancer (PA insuffisants)
// sont grises.
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
      #hud-panel .stats { min-width: 160px; }
      #hud-panel .name { font-size: 16px; color: #f1c40f; font-weight: bold; margin-bottom: 4px; }
      #hud-panel .bars { font-size: 12px; line-height: 1.4; }
      #hud-panel .bars span { display: inline-block; margin-right: 8px; }
      #hud-panel .bars .hp { color: #2ecc71; }
      #hud-panel .bars .pa { color: #3498db; }
      #hud-panel .bars .pm { color: #f39c12; }
      #hud-panel .bars .buff { color: #9b59b6; font-style: italic; }
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
      .spell .accent {
        position: absolute; inset: 4px;
        border-radius: 5px;
        opacity: 0.7;
      }
      .spell .key {
        position: absolute; top: 2px; left: 5px;
        font-size: 10px; font-weight: bold; color: #fff;
        text-shadow: 1px 1px 2px #000;
        z-index: 2;
      }
      .spell .short {
        position: relative; z-index: 2;
        font-size: 22px; font-weight: bold;
        text-shadow: 1px 1px 2px #000;
      }
      .spell .cost {
        position: absolute; bottom: 2px; right: 5px;
        font-size: 12px; font-weight: bold; color: #f1c40f;
        text-shadow: 1px 1px 2px #000;
        z-index: 2;
      }

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
      .rot-btn svg { width: 34px; height: 34px; display: block; }
    `;
    document.head.appendChild(css);

    const panel = document.createElement('div');
    panel.id = 'hud-panel';
    panel.innerHTML = `
      <div class="stats">
        <div class="name" id="hud-name">-</div>
        <div class="bars">
          <span class="hp">PV <span id="hud-hp">-</span></span>
          <span class="pa">PA <span id="hud-pa">-</span></span>
          <span class="pm">PM <span id="hud-pm">-</span></span>
        </div>
        <div class="bars" id="hud-buffs" style="margin-top: 2px;"></div>
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
      btn.title = `${spell.name}\n${spell.desc}\nPortee ${spell.range.min}-${spell.range.max}`;
      // Le numero de touche : 1..9 puis 0 pour slot 9.
      const keyLabel = idx < 9 ? String(idx + 1) : (idx === 9 ? '0' : `^${idx - 9}`);
      btn.innerHTML = `
        <div class="accent" style="background: ${spell.color};"></div>
        <div class="key">${keyLabel}</div>
        <div class="short">${spell.short}</div>
        <div class="cost">${spell.apCost} PA</div>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onSpellSlot && this.callbacks.onSpellSlot(idx);
      });
      this.spellBar.appendChild(btn);
      this.spellSlots.push({ btn, spell });
    });
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

    // Affichage des buffs actifs. b.duration inclut le tour de cast :
    // on affiche b.duration - 1 pour montrer ce qu il reste APRES ce
    // tour-ci (coherent avec la promesse du sort "pendant N tours").
    if (fighter.buffs && fighter.buffs.length) {
      this.buffsEl.innerHTML = fighter.buffs.map(b => {
        const remaining = Math.max(0, b.duration - 1);
        return `<span class="buff">+${Math.round((b.value || 0) * 100)}% ${b.stat} (${remaining}t restants)</span>`;
      }).join('  ');
    } else {
      this.buffsEl.innerHTML = '';
    }

    const isPlayer = fighter.team === 'player';
    this.btnMove.disabled = !isPlayer;
    this.btnEnd.disabled = !isPlayer;
    this.btnMove.classList.toggle('active', mode === 'move' && isPlayer);

    for (const slot of this.spellSlots) {
      const usable = isPlayer && fighter.pa >= slot.spell.apCost;
      slot.btn.disabled = !usable;
      slot.btn.classList.toggle('active',
        isPlayer && mode === 'spell' && selectedSpellId === slot.spell.id
      );
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
