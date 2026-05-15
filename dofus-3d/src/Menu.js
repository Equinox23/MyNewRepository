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
    id: 'roublard',
    name: 'Roublard',
    desc: 'Assassin / artificier (8 PA, 4 PM, init 13). Bombes en croix, tirs precis, esquive et acceleration.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="robGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a3a55"/>
          <stop offset="1" stop-color="#0a0e18"/>
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- cape sombre derriere -->
      <path d="M14 36 L10 60 L26 56 L32 36 Z" fill="#0a0e18" stroke="#000" stroke-width="1.5"/>
      <path d="M50 36 L54 60 L38 56 L32 36 Z" fill="#0a0e18" stroke="#000" stroke-width="1.5"/>
      <!-- torse cuir noir + plastron bleu -->
      <rect x="20" y="34" width="24" height="20" rx="3" fill="url(#robGrad)" stroke="#000" stroke-width="2"/>
      <!-- plastron metallique -->
      <path d="M22 36 L32 50 L42 36 Z" fill="#4a6080" stroke="#1a2030" stroke-width="1"/>
      <!-- ceinture + bombe -->
      <rect x="20" y="46" width="24" height="4" fill="#3a2412"/>
      <circle cx="46" cy="48" r="3" fill="#18191b" stroke="#000" stroke-width="0.8"/>
      <line x1="48" y1="46" x2="50" y2="42" stroke="#3a3025" stroke-width="1"/>
      <circle cx="50" cy="42" r="1.2" fill="#ffd166"/>
      <!-- fiole verte -->
      <rect x="16" y="46" width="3" height="6" fill="#6ee07a" opacity="0.85" stroke="#234d18" stroke-width="0.5"/>
      <!-- tete sombre dans capuche -->
      <circle cx="32" cy="24" r="13" fill="#eed6b3" stroke="#000" stroke-width="1.5"/>
      <!-- capuche profonde -->
      <path d="M18 22 Q18 6 32 4 Q46 6 46 22 L46 30 Q40 22 32 22 Q24 22 18 30 Z" fill="#111623" stroke="#000" stroke-width="2"/>
      <polygon points="32 -2, 50 8, 32 4 14 8" fill="#111623" stroke="#000" stroke-width="1"/>
      <!-- ombre sous capuche -->
      <ellipse cx="32" cy="22" rx="10" ry="6" fill="#000" opacity="0.65"/>
      <!-- yeux rouges qui brillent -->
      <circle cx="27" cy="22" r="1.8" fill="#ff5544"/>
      <circle cx="37" cy="22" r="1.8" fill="#ff5544"/>
      <circle cx="27" cy="22" r="3" fill="#ff5544" opacity="0.35"/>
      <circle cx="37" cy="22" r="3" fill="#ff5544" opacity="0.35"/>
      <!-- masque metal bas du visage -->
      <path d="M22 28 Q32 36 42 28 L42 32 Q32 40 22 32 Z" fill="#2a3a55" stroke="#000" stroke-width="1"/>
      <line x1="22" y1="32" x2="42" y2="32" stroke="#c0392b" stroke-width="1"/>
      <!-- dagues croisees au dos -->
      <line x1="14" y1="14" x2="22" y2="42" stroke="#c8cdd4" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="14" x2="42" y2="42" stroke="#c8cdd4" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="1.5" fill="#b8902a"/>
      <circle cx="50" cy="14" r="1.5" fill="#b8902a"/>
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
  {
    id: 'xelor',
    name: 'Xelor',
    desc: 'Maitre du temps (8 PA, 4 PM). Vole les PA des ennemis et les empeche d agir.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- robe bleu nuit -->
      <polygon points="32 28, 50 58, 14 58" fill="#1f2a55" stroke="#101737" stroke-width="2"/>
      <rect x="29" y="30" width="6" height="26" fill="#d9b44a"/>
      <!-- cadran horloge -->
      <circle cx="32" cy="40" r="8" fill="#6fd6ff" stroke="#d9b44a" stroke-width="2"/>
      <line x1="32" y1="40" x2="32" y2="35" stroke="#101737" stroke-width="1.5"/>
      <line x1="32" y1="40" x2="36" y2="42" stroke="#101737" stroke-width="1.5"/>
      <!-- tete -->
      <circle cx="32" cy="22" r="10" fill="#e7c9a6" stroke="#3a2a18" stroke-width="1.5"/>
      <circle cx="28" cy="22" r="1.6" fill="#6fd6ff"/>
      <circle cx="36" cy="22" r="1.6" fill="#6fd6ff"/>
      <!-- chapeau pointu large bord -->
      <ellipse cx="32" cy="13" rx="20" ry="3.5" fill="#101737"/>
      <path d="M20 13 Q30 -6 40 4 Q38 9 32 11 Z" fill="#1f2a55" stroke="#101737" stroke-width="1.5"/>
      <circle cx="40" cy="4" r="2.5" fill="#d9b44a"/>
    </svg>`,
  },
  {
    id: 'ecaflip',
    name: 'Ecaflip',
    desc: 'Joueur felin (8 PA, 4 PM). Mise sur la chance : degats tres variables et coups de poker.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- corps + gilet rouge -->
      <rect x="20" y="34" width="24" height="22" rx="4" fill="#d9803a" stroke="#7a4418" stroke-width="2"/>
      <path d="M22 34 L22 54 L32 50 L42 54 L42 34 Z" fill="#b02a2a" stroke="#7a1818" stroke-width="1.5"/>
      <circle cx="36" cy="40" r="1.5" fill="#e8c14a"/>
      <circle cx="36" cy="46" r="1.5" fill="#e8c14a"/>
      <!-- tete feline -->
      <circle cx="32" cy="22" r="13" fill="#d9803a" stroke="#7a4418" stroke-width="2"/>
      <polygon points="20 12, 24 2, 28 12" fill="#d9803a" stroke="#7a4418" stroke-width="1.5"/>
      <polygon points="44 12, 40 2, 36 12" fill="#d9803a" stroke="#7a4418" stroke-width="1.5"/>
      <ellipse cx="32" cy="26" rx="7" ry="5" fill="#f2dcb0"/>
      <polygon points="32 25, 30 28, 34 28" fill="#2a1a14"/>
      <ellipse cx="27" cy="20" rx="2.6" ry="3.4" fill="#3ad17a"/>
      <ellipse cx="37" cy="20" rx="2.6" ry="3.4" fill="#3ad17a"/>
      <!-- carte a jouer -->
      <rect x="42" y="30" width="14" height="20" rx="2" fill="#f6f0e0" stroke="#7a4418" stroke-width="1.5" transform="rotate(18 49 40)"/>
      <text x="49" y="44" font-size="10" font-weight="bold" text-anchor="middle" fill="#c0392b" transform="rotate(18 49 40)">A</text>
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
  {
    id: 'chafer',
    name: 'Patrouille de Chafers',
    desc: '3 Chafers + 1 Chafer Royal. Fantassins squelettes au corps a corps.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <!-- cage thoracique -->
      <rect x="26" y="30" width="12" height="20" rx="2" fill="#e9e3cf" stroke="#8a8268" stroke-width="1.5"/>
      <line x1="26" y1="36" x2="38" y2="36" stroke="#8a8268" stroke-width="1.5"/>
      <line x1="26" y1="42" x2="38" y2="42" stroke="#8a8268" stroke-width="1.5"/>
      <!-- crane -->
      <circle cx="32" cy="20" r="11" fill="#e9e3cf" stroke="#8a8268" stroke-width="1.5"/>
      <ellipse cx="27" cy="20" rx="3" ry="4" fill="#6fe6ff"/>
      <ellipse cx="37" cy="20" rx="3" ry="4" fill="#6fe6ff"/>
      <rect x="27" y="27" width="10" height="4" fill="#b8ad8e"/>
      <!-- casque a pointe -->
      <path d="M21 16 Q21 6 32 5 Q43 6 43 16 Z" fill="#3a4046" stroke="#23272c" stroke-width="1.5"/>
      <polygon points="30 5, 34 5, 32 -3" fill="#23272c"/>
      <!-- lance -->
      <line x1="48" y1="54" x2="44" y2="8" stroke="#b8ad8e" stroke-width="2.5"/>
      <polygon points="44 8, 41 14, 47 14" fill="#e9e3cf"/>
    </svg>`,
  },
  {
    id: 'tofu',
    name: 'Volee de Tofus',
    desc: '3 Tofus + 1 Tofu Royal. Oiseaux rapides et impulsifs.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="20" ry="3" fill="#000" opacity="0.4"/>
      <ellipse cx="22" cy="52" rx="4" ry="2" fill="#d9762a"/>
      <ellipse cx="42" cy="52" rx="4" ry="2" fill="#d9762a"/>
      <!-- corps rond -->
      <circle cx="32" cy="34" r="20" fill="#f2c93a" stroke="#b8841a" stroke-width="2"/>
      <ellipse cx="32" cy="40" rx="11" ry="9" fill="#fde89a"/>
      <!-- ailes -->
      <ellipse cx="12" cy="36" rx="6" ry="11" fill="#d9a324"/>
      <ellipse cx="52" cy="36" rx="6" ry="11" fill="#d9a324"/>
      <!-- touffe -->
      <polygon points="26 15, 32 2, 38 15" fill="#d9a324"/>
      <!-- yeux geants -->
      <circle cx="24" cy="30" r="8" fill="#fff" stroke="#b8841a" stroke-width="1.5"/>
      <circle cx="40" cy="30" r="8" fill="#fff" stroke="#b8841a" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="4" fill="#1a1a22"/>
      <circle cx="39" cy="32" r="4" fill="#1a1a22"/>
      <!-- bec -->
      <polygon points="32 38, 26 44, 38 44" fill="#e8762a" stroke="#a8551a" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'champignon',
    name: 'Colonie de Champignons',
    desc: '3 Champignons + 1 Champignon Royal. Empoisonnent a distance.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="20" ry="3" fill="#000" opacity="0.4"/>
      <!-- pied -->
      <path d="M22 56 L24 32 L40 32 L42 56 Z" fill="#e6dcc0" stroke="#b0a684" stroke-width="2"/>
      <ellipse cx="32" cy="40" rx="9" ry="3" fill="#c9a98c"/>
      <circle cx="28" cy="46" r="2" fill="#1a1a22"/>
      <circle cx="36" cy="46" r="2" fill="#1a1a22"/>
      <!-- chapeau -->
      <path d="M8 34 Q32 2 56 34 Z" fill="#8e3b34" stroke="#5a221e" stroke-width="2"/>
      <ellipse cx="20" cy="26" rx="4" ry="2.5" fill="#f3ead2"/>
      <ellipse cx="34" cy="18" rx="4.5" ry="3" fill="#f3ead2"/>
      <ellipse cx="44" cy="27" rx="3.5" ry="2.5" fill="#f3ead2"/>
      <!-- spores -->
      <circle cx="12" cy="14" r="2.5" fill="#9be86a"/>
      <circle cx="52" cy="12" r="2" fill="#9be86a"/>
      <circle cx="48" cy="6" r="1.5" fill="#9be86a"/>
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
  {
    id: 'cimetiere',
    name: 'Cimetiere',
    desc: 'Necropole de pierres tombales. Chafers +30% degats ici.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" fill="#4a4658"/>
      <rect x="0" y="40" width="64" height="24" fill="#2a2d24"/>
      <!-- lune -->
      <circle cx="50" cy="14" r="8" fill="#e6e2d0"/>
      <circle cx="46" cy="11" r="7" fill="#4a4658"/>
      <!-- croix -->
      <rect x="12" y="26" width="5" height="22" fill="#8b8d92"/>
      <rect x="6" y="32" width="17" height="5" fill="#8b8d92"/>
      <!-- dalle arrondie -->
      <path d="M28 48 L28 30 Q28 22 36 22 Q44 22 44 30 L44 48 Z" fill="#8b8d92" stroke="#5f6066" stroke-width="1.5"/>
      <rect x="34" y="30" width="4" height="10" fill="#5f6066"/>
      <rect x="32" y="33" width="8" height="3" fill="#5f6066"/>
      <!-- petite dalle -->
      <rect x="50" y="38" width="9" height="12" fill="#8b8d92" stroke="#5f6066" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'falaise',
    name: 'Falaise Venteuse',
    desc: 'Plateau rocheux balaye par le vent. Tofus +2 PA ici.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" fill="#bcd4e6"/>
      <rect x="0" y="44" width="64" height="20" fill="#6a5a3e"/>
      <!-- pics rocheux -->
      <polygon points="10 44, 20 14, 30 44" fill="#8a7a5a" stroke="#4a3e28" stroke-width="1.5"/>
      <polygon points="34 44, 46 22, 58 44" fill="#9a8a68" stroke="#4a3e28" stroke-width="1.5"/>
      <!-- rochers -->
      <ellipse cx="14" cy="50" rx="6" ry="4" fill="#7a6a4e" stroke="#3a3020" stroke-width="1"/>
      <ellipse cx="48" cy="52" rx="5" ry="3.5" fill="#7a6a4e" stroke="#3a3020" stroke-width="1"/>
      <!-- rafales de vent -->
      <path d="M6 16 Q18 12 26 18" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M4 26 Q16 22 22 28" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M38 10 Q50 6 58 12" stroke="#fff" stroke-width="2" fill="none" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'marais',
    name: 'Marais',
    desc: 'Marecage verdatre parseme de flaques. Champignons +1 PM ici.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="64" height="64" fill="#6e7a52"/>
      <rect x="0" y="38" width="64" height="26" fill="#2c3a1c"/>
      <!-- flaques verdatres -->
      <ellipse cx="18" cy="30" rx="12" ry="7" fill="#4a6a38" stroke="#2c3a1c" stroke-width="1.5"/>
      <ellipse cx="46" cy="46" rx="14" ry="8" fill="#42602f" stroke="#2c3a1c" stroke-width="1.5"/>
      <ellipse cx="40" cy="22" rx="9" ry="5" fill="#53703e" stroke="#2c3a1c" stroke-width="1"/>
      <!-- nenuphars -->
      <circle cx="16" cy="29" r="3.5" fill="#3b8a3a"/>
      <circle cx="44" cy="45" r="4" fill="#3b8a3a"/>
      <circle cx="44" cy="45" r="1.6" fill="#fff4c8"/>
      <!-- champignons epars -->
      <path d="M50 16 Q56 8 62 16 Z" fill="#8e3b34"/>
      <rect x="54" y="16" width="4" height="7" fill="#e6dcc0"/>
      <path d="M6 50 Q11 44 16 50 Z" fill="#8e3b34"/>
      <rect x="9" y="50" width="3.5" height="6" fill="#e6dcc0"/>
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

      /* Infobulle des options : description complete au survol souris
         ou au long-press tactile. */
      .menu-tooltip {
        position: fixed;
        background: rgba(8, 10, 18, 0.96);
        color: #fff;
        border: 2px solid #f1c40f;
        border-radius: 10px;
        padding: 8px 12px;
        font-family: "Trebuchet MS", sans-serif;
        font-size: 13px;
        max-width: 240px;
        pointer-events: none;
        z-index: 70;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        opacity: 0;
        transition: opacity 0.15s ease-out;
      }
      .menu-tooltip.show { opacity: 1; }
      .menu-tooltip .mt-name { font-size: 14px; font-weight: bold; color: #f1c40f; margin-bottom: 4px; }
      .menu-tooltip .mt-desc { color: #ddd; line-height: 1.35; font-style: italic; }

      /* ---- ADAPTATIONS MOBILE / TACTILE ---- */
      @media (pointer: coarse), (max-width: 768px) {
        #menu-root { padding: 12px 6px; overflow-x: hidden; }
        #menu-root .menu-title { font-size: 28px; letter-spacing: 2px; margin-bottom: 2px; }
        #menu-root .menu-subtitle { font-size: 12px; margin-bottom: 12px; }
        #menu-root .menu-step {
          width: 100%; box-sizing: border-box;
          padding: 8px 10px; margin-bottom: 8px;
        }
        #menu-root .menu-step h2 {
          font-size: 13px; margin-bottom: 6px; letter-spacing: 1px;
        }
        #menu-root .menu-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
          gap: 6px;
        }
        #menu-root .menu-option {
          min-width: 0; aspect-ratio: 1 / 1;
          padding: 6px 4px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        #menu-root .menu-option .icon {
          width: 56px; height: 56px;
          margin: 0 0 4px 0; float: none;
        }
        #menu-root .menu-option .opt-name {
          font-size: 12px; line-height: 1.15;
        }
        #menu-root .menu-option .opt-desc { display: none; }
        #menu-root .menu-option .opt-soon {
          font-size: 8px; top: 2px; right: 4px;
        }
        #menu-root #btn-start {
          margin-top: 8px; padding: 12px 40px;
          font-size: 18px; letter-spacing: 2px; border-width: 2px;
        }
      }
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

    // Tooltip : un seul element reutilise pour toutes les options.
    const tip = document.createElement('div');
    tip.className = 'menu-tooltip';
    document.body.appendChild(tip);
    this.tooltipEl = tip;

    // Click + hover (souris) + long-press (tactile).
    root.querySelectorAll('.menu-option').forEach(btn => {
      let lpTimer = null;
      let lpFired = false;

      btn.addEventListener('click', (e) => {
        if (lpFired) {
          // Le long-press a ete utilise pour afficher l infobulle :
          // on ne selectionne PAS l option dans ce cas (l utilisateur
          // demandait juste l info).
          lpFired = false;
          e.preventDefault();
          return;
        }
        if (btn.disabled) return;
        const key = btn.dataset.key;
        const value = btn.dataset.value;
        this.selection[key] = value;
        root.querySelectorAll(`.menu-option[data-key="${key}"]`).forEach(b => {
          b.classList.toggle('selected', b.dataset.value === value);
        });
      });

      // Souris : hover -> infobulle immediate.
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.showOptionTooltip(btn);
      });
      btn.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.hideOptionTooltip();
      });

      // Tactile : long-press 450ms.
      btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        lpFired = false;
        clearTimeout(lpTimer);
        lpTimer = setTimeout(() => {
          lpFired = true;
          this.showOptionTooltip(btn);
        }, 450);
      });
      const cancelLongPress = () => { clearTimeout(lpTimer); lpTimer = null; };
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') return;
        cancelLongPress();
      });
      btn.addEventListener('pointercancel', () => {
        cancelLongPress();
        if (lpFired) this.hideOptionTooltip();
      });
      btn.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') return;
        cancelLongPress();
        if (lpFired) {
          // Laisse le tooltip un peu visible avant de le masquer.
          setTimeout(() => this.hideOptionTooltip(), 1500);
        }
      });
    });

    root.querySelector('#btn-start').addEventListener('click', () => {
      this.onStart && this.onStart({ ...this.selection });
    });
  }

  showOptionTooltip(btn) {
    const tip = this.tooltipEl;
    if (!tip) return;
    const nameEl = btn.querySelector('.opt-name');
    const descEl = btn.querySelector('.opt-desc');
    if (!nameEl) return;
    tip.innerHTML = `
      <div class="mt-name">${nameEl.textContent}</div>
      ${descEl ? `<div class="mt-desc">${descEl.textContent}</div>` : ''}
    `;
    tip.classList.add('show');
    // Positionne en haut, recentre, clamp aux bords.
    tip.style.left = '0px'; tip.style.top = '0px';
    requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      let x = rect.left + rect.width / 2 - tipRect.width / 2;
      let y = rect.top - tipRect.height - 8;
      x = Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, x));
      if (y < 8) y = rect.bottom + 8;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    });
  }

  hideOptionTooltip() {
    if (this.tooltipEl) this.tooltipEl.classList.remove('show');
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
