// HUD DOM : panneau bas avec le combattant actif (nom, PV, PA, PM),
// boutons d action (Deplacer / Attaquer / Fin de tour), overlay de fin
// de partie, journal mini de l action courante.
export class Hud {
  constructor() {
    this.callbacks = {};
    this.build();
  }

  build() {
    // CSS injecte (evite de polluer index.html avec des regles specifiques)
    const css = document.createElement('style');
    css.textContent = `
      #hud-panel {
        position: fixed; left: 50%; bottom: 16px;
        transform: translateX(-50%);
        display: flex; align-items: center; gap: 18px;
        background: rgba(12, 12, 20, 0.85);
        border: 2px solid #444a66;
        border-radius: 14px;
        padding: 10px 18px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        max-width: 96vw;
      }
      #hud-panel .stats { min-width: 180px; }
      #hud-panel .name { font-size: 18px; color: #f1c40f; font-weight: bold; margin-bottom: 4px; }
      #hud-panel .bars { font-size: 13px; line-height: 1.4; }
      #hud-panel .bars span { display: inline-block; margin-right: 10px; }
      #hud-panel .hp { color: #2ecc71; } #hud-panel .pa { color: #3498db; } #hud-panel .pm { color: #f39c12; }
      #hud-panel .actions { display: flex; gap: 8px; }
      #hud-panel button {
        background: #2c3e50;
        border: 2px solid #6a7090;
        color: #fff;
        padding: 10px 14px;
        font-size: 14px;
        font-family: inherit;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      #hud-panel button:hover { border-color: #f1c40f; }
      #hud-panel button.active { background: #f1c40f; color: #1a1a2e; border-color: #f1c40f; }
      #hud-panel button:disabled { opacity: 0.4; cursor: default; }
      #hud-panel button.end { background: #c0392b; border-color: #7c1f17; }

      #end-overlay {
        position: fixed; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
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
        width: 64px; height: 64px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #f1c40f;
        color: #f1c40f;
        cursor: pointer;
        pointer-events: auto;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s ease-out, transform 0.1s ease-out;
      }
      .rot-btn:hover { background: rgba(241, 196, 15, 0.18); }
      .rot-btn:active { background: #f1c40f; color: #14182a; transform: translateY(-50%) scale(0.92); }
      #rot-left { left: 16px; }
      #rot-right { right: 16px; }
      .rot-btn svg { width: 36px; height: 36px; display: block; }
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
      </div>
      <div class="actions">
        <button id="btn-move" class="active">Deplacer</button>
        <button id="btn-attack">Attaquer</button>
        <button id="btn-end" class="end">Fin de tour</button>
      </div>
    `;
    document.body.appendChild(panel);

    const flash = document.createElement('div');
    flash.id = 'flash';
    document.body.appendChild(flash);
    this.flashEl = flash;

    this.panel = panel;
    this.nameEl = document.getElementById('hud-name');
    this.hpEl = document.getElementById('hud-hp');
    this.paEl = document.getElementById('hud-pa');
    this.pmEl = document.getElementById('hud-pm');
    this.btnMove = document.getElementById('btn-move');
    this.btnAttack = document.getElementById('btn-attack');
    this.btnEnd = document.getElementById('btn-end');

    this.btnMove.addEventListener('click', () => this.callbacks.onMove && this.callbacks.onMove());
    this.btnAttack.addEventListener('click', () => this.callbacks.onAttack && this.callbacks.onAttack());
    this.btnEnd.addEventListener('click', () => this.callbacks.onEnd && this.callbacks.onEnd());

    this.buildRotationButtons();
  }

  buildRotationButtons() {
    // Fleche circulaire SVG, miroir gauche/droite.
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
    left.id = 'rot-left'; left.className = 'rot-btn';
    left.title = 'Tourner la map (1/4 de tour a gauche)';
    left.innerHTML = svgCcw;
    left.addEventListener('click', () => this.callbacks.onRotateLeft && this.callbacks.onRotateLeft());
    document.body.appendChild(left);

    const right = document.createElement('button');
    right.id = 'rot-right'; right.className = 'rot-btn';
    right.title = 'Tourner la map (1/4 de tour a droite)';
    right.innerHTML = svgCw;
    right.addEventListener('click', () => this.callbacks.onRotateRight && this.callbacks.onRotateRight());
    document.body.appendChild(right);
  }

  on(eventName, cb) {
    this.callbacks[eventName] = cb;
  }

  update(fighter, mode) {
    if (!fighter) return;
    this.nameEl.textContent = fighter.name + (fighter.team === 'player' ? '  (vous)' : '');
    this.hpEl.textContent = `${fighter.hp}/${fighter.maxHp}`;
    this.paEl.textContent = `${fighter.pa}/${fighter.maxPa}`;
    this.pmEl.textContent = `${fighter.pm}/${fighter.maxPm}`;
    const isPlayer = fighter.team === 'player';
    this.btnMove.disabled = !isPlayer;
    this.btnAttack.disabled = !isPlayer || fighter.pa < (fighter.def.attack.apCost || 999);
    this.btnEnd.disabled = !isPlayer;
    this.btnMove.classList.toggle('active', mode === 'move' && isPlayer);
    this.btnAttack.classList.toggle('active', mode === 'attack' && isPlayer);
    this.btnAttack.textContent = isPlayer
      ? `Attaquer (${fighter.def.attack.name}, ${fighter.def.attack.apCost} PA)`
      : 'Attaquer';
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
    });
  }

  flash(text, durationMs = 1400) {
    this.flashEl.textContent = text;
    this.flashEl.classList.add('show');
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => this.flashEl.classList.remove('show'), durationMs);
  }
}
