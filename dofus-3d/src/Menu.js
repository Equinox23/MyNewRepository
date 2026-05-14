// Menu de pre-combat : choix classe / combat / carte.
// V1 ne propose que Iop / Bouftou / Foret mais la structure est prete
// pour ajouter d autres options.

const CLASS_OPTIONS = [
  {
    id: 'iop',
    name: 'Iop',
    desc: 'Guerrier offensif (8 PA, 4 PM)',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff6b5b"/>
          <stop offset="1" stop-color="#7c1f17"/>
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <path d="M16 36 L14 56 L22 52 L32 36 Z" fill="#7c1f17" stroke="#3a0e09" stroke-width="1.5"/>
      <path d="M48 36 L50 56 L42 52 L32 36 Z" fill="#7c1f17" stroke="#3a0e09" stroke-width="1.5"/>
      <rect x="20" y="34" width="24" height="20" rx="3" fill="url(#iopGrad)" stroke="#3a0e09" stroke-width="2"/>
      <rect x="20" y="46" width="24" height="4" fill="#5a3a1a"/>
      <circle cx="32" cy="48" r="1.5" fill="#f1c40f"/>
      <circle cx="32" cy="24" r="13" fill="#f4d3a5" stroke="#3a0e09" stroke-width="2"/>
      <path d="M20 22 Q20 8 32 6 Q44 8 44 22 L44 28 Q38 22 32 22 Q26 22 20 28 Z" fill="url(#iopGrad)" stroke="#3a0e09" stroke-width="2"/>
      <polygon points="29 6, 35 6, 33 -2, 31 -2" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
      <circle cx="27" cy="26" r="2.5" fill="#fff" stroke="#3a0e09" stroke-width="1"/>
      <circle cx="37" cy="26" r="2.5" fill="#fff" stroke="#3a0e09" stroke-width="1"/>
      <circle cx="27" cy="27" r="1.4" fill="#1a2530"/>
      <circle cx="37" cy="27" r="1.4" fill="#1a2530"/>
      <rect x="50" y="14" width="3" height="28" fill="#ecf0f1" stroke="#37474f" stroke-width="1"/>
      <rect x="47" y="40" width="9" height="3" fill="#8a6d3b"/>
      <polygon points="50 14, 53 14, 51.5 9" fill="#ecf0f1" stroke="#37474f" stroke-width="0.8"/>
    </svg>`,
  },
  {
    id: 'osamodas',
    name: 'Osamodas',
    desc: 'Invocateur (8 PA, 4 PM, invoque un Craqueleur)',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="osaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#6aa548"/>
          <stop offset="1" stop-color="#234d18"/>
        </linearGradient>
        <radialGradient id="osaOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#a4e8b5"/>
          <stop offset="1" stop-color="#1a6e3a"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- cape brune fourrure -->
      <path d="M14 36 L12 58 L24 54 L32 36 Z" fill="#7a4f1e" stroke="#3a2310" stroke-width="1.5"/>
      <path d="M50 36 L52 58 L40 54 L32 36 Z" fill="#7a4f1e" stroke="#3a2310" stroke-width="1.5"/>
      <!-- tunique verte -->
      <rect x="20" y="34" width="24" height="20" rx="3" fill="url(#osaGrad)" stroke="#1a3d10" stroke-width="2"/>
      <!-- ceinture -->
      <rect x="20" y="46" width="24" height="4" fill="#5a3a1a"/>
      <rect x="30" y="44" width="4" height="8" fill="#d4a017"/>
      <!-- V doré sur torse -->
      <path d="M26 36 L32 44 L38 36" stroke="#d4a017" stroke-width="2" fill="none"/>
      <!-- col fourrure -->
      <ellipse cx="32" cy="33" rx="13" ry="3.5" fill="#cfa970" stroke="#7a4f1e" stroke-width="1"/>
      <!-- head -->
      <circle cx="32" cy="24" r="13" fill="#e5b88c" stroke="#3a2310" stroke-width="2"/>
      <!-- capuche brune avec oreilles -->
      <path d="M20 22 Q20 8 32 6 Q44 8 44 22 L44 28 Q38 22 32 22 Q26 22 20 28 Z" fill="#7a4f1e" stroke="#3a2310" stroke-width="2"/>
      <polygon points="22 4, 26 10, 17 9" fill="#7a4f1e" stroke="#3a2310" stroke-width="1.5"/>
      <polygon points="42 4, 38 10, 47 9" fill="#7a4f1e" stroke="#3a2310" stroke-width="1.5"/>
      <polygon points="22 6, 24 9, 20 9" fill="#cfa970"/>
      <polygon points="42 6, 40 9, 44 9" fill="#cfa970"/>
      <!-- yeux verts -->
      <circle cx="27" cy="26" r="2.5" fill="#fff" stroke="#3a2310" stroke-width="1"/>
      <circle cx="37" cy="26" r="2.5" fill="#fff" stroke="#3a2310" stroke-width="1"/>
      <circle cx="27" cy="27" r="1.4" fill="#2ecc71"/>
      <circle cx="37" cy="27" r="1.4" fill="#2ecc71"/>
      <!-- baton avec orbe vert -->
      <line x1="50" y1="48" x2="50" y2="10" stroke="#6a4a2a" stroke-width="2.5"/>
      <circle cx="50" cy="8" r="4" fill="url(#osaOrb)" stroke="#1a6e3a" stroke-width="1"/>
      <circle cx="48" cy="6" r="1.2" fill="#fff" opacity="0.7"/>
      <circle cx="50" cy="12" r="2" fill="#d4a017"/>
    </svg>`,
  },
];

const COMBAT_OPTIONS = [
  {
    id: 'bouftou',
    name: 'Meute de Bouftous',
    desc: '3 Bouftous + 1 Bouftou Royal',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <path d="M20 22 Q10 14 14 6 Q16 14 24 18 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="1.5"/>
      <path d="M44 22 Q54 14 50 6 Q48 14 40 18 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="1.5"/>
      <circle cx="32" cy="38" r="22" fill="#f1c40f" stroke="#5a3a07" stroke-width="2"/>
      <circle cx="14" cy="32" r="6" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <circle cx="22" cy="22" r="5" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <circle cx="42" cy="22" r="5" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <circle cx="50" cy="32" r="6" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <circle cx="14" cy="48" r="5" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <circle cx="50" cy="48" r="5" fill="#fff3a0" stroke="#5a3a07" stroke-width="1.5"/>
      <ellipse cx="32" cy="38" rx="14" ry="10" fill="#1a0d05"/>
      <circle cx="26" cy="36" r="2.8" fill="#e74c3c"/>
      <circle cx="38" cy="36" r="2.8" fill="#e74c3c"/>
      <circle cx="26" cy="36" r="4" fill="#e74c3c" opacity="0.35"/>
      <circle cx="38" cy="36" r="4" fill="#e74c3c" opacity="0.35"/>
      <path d="M26 44 L28 48 L30 44 L32 48 L34 44 L36 48 L38 44" stroke="#fff" stroke-width="1.5" fill="none"/>
      <path d="M22 6 L26 -2 L32 4 L38 -2 L42 6 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5" opacity="0.9"/>
    </svg>`,
  },
  {
    id: 'crapaud',
    name: 'Crapauds de la mare',
    desc: '3 Crapauds + 1 Chef (haut-de-forme). Aquatiques.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="crapBody" cx="50%" cy="40%" r="60%">
          <stop offset="0" stop-color="#73b550"/>
          <stop offset="1" stop-color="#2f5a24"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- body -->
      <ellipse cx="32" cy="42" rx="22" ry="14" fill="url(#crapBody)" stroke="#1a3010" stroke-width="2"/>
      <!-- legs -->
      <ellipse cx="10" cy="50" rx="6" ry="3" fill="#2f5a24"/>
      <ellipse cx="54" cy="50" rx="6" ry="3" fill="#2f5a24"/>
      <!-- belly -->
      <ellipse cx="32" cy="50" rx="14" ry="5" fill="#ccd66a"/>
      <!-- eyes -->
      <circle cx="22" cy="22" r="9" fill="#fff" stroke="#1a3010" stroke-width="2"/>
      <circle cx="42" cy="22" r="9" fill="#fff" stroke="#1a3010" stroke-width="2"/>
      <circle cx="22" cy="24" r="4" fill="#1a1a1a"/>
      <circle cx="42" cy="24" r="4" fill="#1a1a1a"/>
      <circle cx="20" cy="22" r="1.5" fill="#fff"/>
      <circle cx="40" cy="22" r="1.5" fill="#fff"/>
      <!-- mouth -->
      <path d="M14 42 Q32 50 50 42" stroke="#3a2010" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- top hat hint -->
      <ellipse cx="32" cy="14" rx="10" ry="2" fill="#141416"/>
      <rect x="26" y="2" width="12" height="12" fill="#141416"/>
      <rect x="26" y="11" width="12" height="3" fill="#c0392b"/>
    </svg>`,
  },
];

const MAP_OPTIONS = [
  {
    id: 'foret',
    name: 'Foret',
    desc: 'Clairiere boisee. Bouftous +1 PM ici.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="42" width="64" height="22" fill="#3a6e3a"/>
      <line x1="6" y1="44" x2="6" y2="40" stroke="#2a5a2a" stroke-width="2"/>
      <line x1="20" y1="46" x2="20" y2="42" stroke="#2a5a2a" stroke-width="2"/>
      <line x1="50" y1="46" x2="50" y2="42" stroke="#2a5a2a" stroke-width="2"/>
      <rect x="0" y="0" width="64" height="42" fill="#88b07d"/>
      <rect x="29" y="32" width="6" height="14" fill="#5a3a1a" stroke="#2c1a08" stroke-width="1"/>
      <polygon points="32 8, 22 24, 42 24" fill="#2a5a2a" stroke="#063a0e" stroke-width="1.5"/>
      <polygon points="32 14, 24 28, 40 28" fill="#3a6e3a" stroke="#063a0e" stroke-width="1.5"/>
      <polygon points="32 20, 26 32, 38 32" fill="#4a8a3a" stroke="#063a0e" stroke-width="1.5"/>
      <rect x="9" y="36" width="4" height="10" fill="#5a3a1a"/>
      <polygon points="11 20, 5 36, 17 36" fill="#3a6e3a" stroke="#063a0e" stroke-width="1"/>
      <rect x="51" y="36" width="4" height="10" fill="#5a3a1a"/>
      <polygon points="53 22, 47 36, 59 36" fill="#3a6e3a" stroke="#063a0e" stroke-width="1"/>
      <ellipse cx="46" cy="46" rx="6" ry="3" fill="#7a6a5a" stroke="#1a0d05" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'cascade',
    name: 'Cascade',
    desc: 'Riviere serpentine + pont. Crapauds +30% degats ici.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" fill="#a4c4cc"/>
      <rect x="0" y="42" width="64" height="22" fill="#5a7050"/>
      <!-- riviere qui serpente -->
      <path d="M16 0 L24 18 L18 32 L26 46 L20 64 L40 64 L44 46 L36 32 L42 18 L34 0 Z" fill="#2b8aab" stroke="#1a5a72" stroke-width="1.5"/>
      <!-- pont au milieu -->
      <rect x="14" y="28" width="36" height="8" fill="#6e4a20" stroke="#3a2010" stroke-width="1.5"/>
      <line x1="20" y1="28" x2="20" y2="36" stroke="#3a2010" stroke-width="1"/>
      <line x1="32" y1="28" x2="32" y2="36" stroke="#3a2010" stroke-width="1"/>
      <line x1="44" y1="28" x2="44" y2="36" stroke="#3a2010" stroke-width="1"/>
      <!-- rocher -->
      <ellipse cx="8" cy="52" rx="5" ry="3" fill="#7a6a5a" stroke="#1a0d05" stroke-width="1"/>
      <ellipse cx="55" cy="56" rx="5" ry="3" fill="#7a6a5a" stroke="#1a0d05" stroke-width="1"/>
      <!-- vagues -->
      <line x1="24" y1="8" x2="32" y2="8" stroke="#eaf3f7" stroke-width="1"/>
      <line x1="20" y1="48" x2="28" y2="48" stroke="#eaf3f7" stroke-width="1"/>
    </svg>`,
  },
];

export class Menu {
  constructor(onStart) {
    this.onStart = onStart;
    this.selection = {
      classId: 'iop',
      combatId: 'bouftou',
      mapId: 'foret',
    };
    this.build();
  }

  build() {
    const css = document.createElement('style');
    css.textContent = `
      #menu-root {
        position: fixed; inset: 0;
        z-index: 60;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 24px;
        background: linear-gradient(180deg, #1a1f10 0%, #0a1006 100%);
        color: #fff;
        font-family: "Trebuchet MS", "Helvetica Neue", sans-serif;
        overflow: auto;
      }
      #menu-root .menu-title {
        font-size: 44px; font-weight: bold;
        color: #f1c40f;
        text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        letter-spacing: 4px;
        margin-bottom: 6px;
      }
      #menu-root .menu-subtitle {
        font-size: 14px; color: #cccccc;
        font-style: italic; margin-bottom: 22px;
      }
      #menu-root .menu-step {
        background: rgba(255,255,255,0.04);
        border: 2px solid #444a66;
        border-radius: 14px;
        padding: 12px 16px;
        margin-bottom: 14px;
        width: min(820px, 92vw);
      }
      #menu-root .menu-step h2 {
        margin: 0 0 10px 0;
        font-size: 16px; color: #f1c40f;
        text-transform: uppercase; letter-spacing: 2px;
      }
      #menu-root .menu-options {
        display: flex; flex-wrap: wrap; gap: 10px;
      }
      #menu-root .menu-option {
        position: relative;
        background: #1a1f2c;
        border: 2px solid #444a66;
        border-radius: 10px;
        padding: 10px;
        min-width: 180px;
        cursor: pointer;
        color: #fff;
        font-family: inherit;
        text-align: left;
        transition: transform 0.1s, border-color 0.15s, box-shadow 0.15s;
      }
      #menu-root .menu-option:hover:not(:disabled) {
        border-color: #f1c40f;
        transform: translateY(-2px);
      }
      #menu-root .menu-option.selected {
        border-color: #f1c40f;
        box-shadow: 0 0 14px rgba(241, 196, 15, 0.45);
      }
      #menu-root .menu-option:disabled {
        opacity: 0.4; cursor: not-allowed;
      }
      #menu-root .menu-option .icon {
        width: 64px; height: 64px;
        margin-right: 12px;
        float: left;
      }
      #menu-root .menu-option .icon svg { width: 100%; height: 100%; }
      #menu-root .menu-option .opt-name {
        font-size: 16px; font-weight: bold;
        color: #f1c40f;
      }
      #menu-root .menu-option .opt-desc {
        font-size: 12px; color: #cccccc; margin-top: 2px;
      }
      #menu-root .menu-option .opt-soon {
        position: absolute; top: 4px; right: 6px;
        font-size: 9px; color: #888;
        text-transform: uppercase;
      }
      #menu-root #btn-start {
        margin-top: 16px;
        padding: 14px 56px;
        font-size: 22px; font-weight: bold;
        font-family: inherit;
        background: linear-gradient(180deg, #2ecc71 0%, #145a32 100%);
        color: #fff;
        border: 3px solid #145a32;
        border-radius: 14px;
        cursor: pointer;
        letter-spacing: 4px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.5);
        transition: transform 0.1s;
      }
      #menu-root #btn-start:hover { transform: scale(1.04); }
    `;
    document.head.appendChild(css);

    const root = document.createElement('div');
    root.id = 'menu-root';
    root.innerHTML = `
      <div class="menu-title">DOFUS 3D</div>
      <div class="menu-subtitle">Choisis ta classe, ton combat et ta carte</div>
      ${this.renderStep('Classe', 'classId', CLASS_OPTIONS)}
      ${this.renderStep('Combat', 'combatId', COMBAT_OPTIONS)}
      ${this.renderStep('Carte', 'mapId', MAP_OPTIONS)}
      <button id="btn-start">COMBATTRE</button>
    `;
    document.body.appendChild(root);
    this.root = root;

    // Click handlers
    root.querySelectorAll('.menu-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const key = btn.dataset.key;
        const value = btn.dataset.value;
        this.selection[key] = value;
        // Mise a jour visuelle dans la meme step.
        root.querySelectorAll(`.menu-option[data-key="${key}"]`).forEach(b => {
          b.classList.toggle('selected', b.dataset.value === value);
        });
      });
    });

    root.querySelector('#btn-start').addEventListener('click', () => {
      this.onStart && this.onStart({ ...this.selection });
    });
  }

  renderStep(title, key, options) {
    return `
      <div class="menu-step">
        <h2>${title}</h2>
        <div class="menu-options">
          ${options.map(o => `
            <button class="menu-option ${o.id === this.selection[key] ? 'selected' : ''}"
                    data-key="${key}" data-value="${o.id}"
                    ${o.available ? '' : 'disabled'}>
              <div class="icon">${o.icon}</div>
              <div class="opt-name">${o.name}</div>
              <div class="opt-desc">${o.desc}</div>
              ${o.available ? '' : '<div class="opt-soon">bientot</div>'}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  show() {
    if (!this.root) return;
    this.root.style.display = 'flex';
  }

  hide() {
    if (!this.root) return;
    this.root.style.display = 'none';
  }
}
