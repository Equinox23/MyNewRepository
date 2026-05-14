// Portraits SVG generes pour chaque classe.
// Chaque fonction renvoie un objet { id, svg } ; la SVG est rendue
// en texture Phaser au preload (voir PreloaderScene).

const IOP = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="iopArmor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e74c3c"/>
      <stop offset="1" stop-color="#7c1f17"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.35"/>
  <!-- jambes -->
  <rect x="38" y="68" width="8" height="16" fill="#4a2a1a" stroke="#1a0d05" stroke-width="1"/>
  <rect x="50" y="68" width="8" height="16" fill="#4a2a1a" stroke="#1a0d05" stroke-width="1"/>
  <!-- bottes -->
  <rect x="36" y="82" width="12" height="6" rx="2" fill="#2a1610"/>
  <rect x="48" y="82" width="12" height="6" rx="2" fill="#2a1610"/>
  <!-- torse / armure -->
  <path d="M28 48 L34 44 L62 44 L68 48 L66 72 L30 72 Z" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2"/>
  <!-- ceinture -->
  <rect x="30" y="64" width="36" height="6" fill="#3a2310" stroke="#1a0d05" stroke-width="1"/>
  <circle cx="48" cy="67" r="2.5" fill="#f1c40f" stroke="#7a5d0a" stroke-width="0.5"/>
  <!-- bras gauche -->
  <ellipse cx="26" cy="56" rx="6" ry="10" fill="#c0392b" stroke="#3a0e09" stroke-width="2"/>
  <!-- bras droit (tient l epee) -->
  <ellipse cx="72" cy="56" rx="6" ry="10" fill="#c0392b" stroke="#3a0e09" stroke-width="2"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="14" fill="#f4d3a5" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- casque -->
  <path d="M34 30 Q34 14 48 12 Q62 14 62 30 L62 36 Q56 30 48 30 Q40 30 34 36 Z" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2"/>
  <path d="M44 12 L52 12 L50 4 L46 4 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="0.5"/>
  <!-- yeux -->
  <circle cx="42" cy="34" r="1.6" fill="#222"/>
  <circle cx="54" cy="34" r="1.6" fill="#222"/>
  <!-- bouche -->
  <path d="M42 40 Q48 43 54 40" stroke="#5a2a18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <!-- epee -->
  <rect x="78" y="20" width="3" height="40" fill="#dde2e6" stroke="#7a8590" stroke-width="0.8"/>
  <rect x="74" y="58" width="11" height="4" rx="1" fill="#8a6d3b" stroke="#3a2a14" stroke-width="0.8"/>
  <polygon points="78,20 81,20 79.5,12" fill="#dde2e6" stroke="#7a8590" stroke-width="0.8"/>
</svg>`;

const CRA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craTunic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1abc9c"/>
      <stop offset="1" stop-color="#0d6b59"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.35"/>
  <rect x="38" y="68" width="8" height="16" fill="#3a2a14" stroke="#1a0d05" stroke-width="1"/>
  <rect x="50" y="68" width="8" height="16" fill="#3a2a14" stroke="#1a0d05" stroke-width="1"/>
  <rect x="36" y="82" width="12" height="6" rx="2" fill="#1a0f08"/>
  <rect x="48" y="82" width="12" height="6" rx="2" fill="#1a0f08"/>
  <!-- tunique -->
  <path d="M28 50 L34 44 L62 44 L68 50 L64 76 L32 76 Z" fill="url(#craTunic)" stroke="#063a30" stroke-width="2"/>
  <!-- carquois (epaule) -->
  <rect x="62" y="40" width="8" height="20" rx="2" fill="#5a3a1a" stroke="#2a1a08" stroke-width="1"/>
  <line x1="64" y1="42" x2="64" y2="36" stroke="#cccccc" stroke-width="1"/>
  <line x1="67" y1="42" x2="67" y2="34" stroke="#cccccc" stroke-width="1"/>
  <polygon points="62,32 66,32 64,28" fill="#7a5826"/>
  <polygon points="65,30 69,30 67,26" fill="#7a5826"/>
  <!-- bras gauche (tend l arc) -->
  <ellipse cx="22" cy="58" rx="5" ry="9" fill="#1abc9c" stroke="#063a30" stroke-width="2"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="14" fill="#f4d3a5" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- capuche / bandeau -->
  <path d="M34 28 Q48 12 62 28 L62 34 L34 34 Z" fill="#0d6b59" stroke="#063a30" stroke-width="2"/>
  <path d="M30 30 L34 28 L34 34 L30 36 Z" fill="#063a30"/>
  <!-- yeux -->
  <circle cx="42" cy="36" r="1.6" fill="#222"/>
  <circle cx="54" cy="36" r="1.6" fill="#222"/>
  <path d="M44 42 L52 42" stroke="#5a2a18" stroke-width="1.4" stroke-linecap="round"/>
  <!-- arc -->
  <path d="M14 30 Q4 56 14 82" stroke="#8a6d3b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <line x1="14" y1="30" x2="14" y2="82" stroke="#ddd" stroke-width="0.8"/>
  <!-- fleche encochee -->
  <line x1="14" y1="56" x2="34" y2="56" stroke="#8a6d3b" stroke-width="1.6"/>
  <polygon points="34,53 40,56 34,59" fill="#7a5826"/>
</svg>`;

const ENIRIPSA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="eniRobe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f06292"/>
      <stop offset="1" stop-color="#a51149"/>
    </linearGradient>
    <radialGradient id="eniHeart" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffe0e8"/>
      <stop offset="1" stop-color="#e91e63"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.35"/>
  <!-- robe ample -->
  <path d="M22 86 L34 46 L62 46 L74 86 Z" fill="url(#eniRobe)" stroke="#5c0a2a" stroke-width="2"/>
  <!-- ceinture corde -->
  <path d="M30 70 Q48 74 66 70" stroke="#f1c40f" stroke-width="2" fill="none"/>
  <!-- bras -->
  <ellipse cx="26" cy="56" rx="5" ry="10" fill="#e91e63" stroke="#5c0a2a" stroke-width="2"/>
  <ellipse cx="70" cy="56" rx="5" ry="10" fill="#e91e63" stroke="#5c0a2a" stroke-width="2"/>
  <!-- cheveux long arriere -->
  <path d="M34 34 Q32 56 38 64 L40 32 Z" fill="#7a3a8c"/>
  <path d="M62 34 Q64 56 58 64 L56 32 Z" fill="#7a3a8c"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="14" fill="#f4d3a5" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- chapeau pointu -->
  <path d="M30 28 Q48 4 66 28 Z" fill="url(#eniRobe)" stroke="#5c0a2a" stroke-width="2"/>
  <circle cx="48" cy="6" r="3" fill="#f1c40f"/>
  <!-- yeux doux -->
  <circle cx="42" cy="34" r="1.6" fill="#3a2a4a"/>
  <circle cx="54" cy="34" r="1.6" fill="#3a2a4a"/>
  <path d="M42 40 Q48 44 54 40" stroke="#7a3a4a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <!-- baton avec coeur -->
  <line x1="76" y1="28" x2="76" y2="80" stroke="#8a6d3b" stroke-width="3" stroke-linecap="round"/>
  <path d="M70 26 Q67 18 72 18 Q76 18 76 24 Q76 18 80 18 Q85 18 82 26 Q78 32 76 34 Q74 32 70 26 Z" fill="url(#eniHeart)" stroke="#7a0e3a" stroke-width="1"/>
</svg>`;

const SRAM = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sramCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34495e"/>
      <stop offset="1" stop-color="#0a1218"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.45"/>
  <!-- cape exterieure -->
  <path d="M20 86 L30 40 L66 40 L76 86 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="2"/>
  <!-- ouverture cape -->
  <path d="M44 42 L48 80 L52 42 Z" fill="#1a2530"/>
  <!-- bras -->
  <ellipse cx="22" cy="58" rx="5" ry="11" fill="#1a2530" stroke="#050a10" stroke-width="2"/>
  <ellipse cx="74" cy="58" rx="5" ry="11" fill="#1a2530" stroke="#050a10" stroke-width="2"/>
  <!-- capuche -->
  <path d="M26 44 Q26 14 48 12 Q70 14 70 44 L62 36 L34 36 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="2"/>
  <!-- visage cache (ombre) -->
  <ellipse cx="48" cy="36" rx="12" ry="10" fill="#050a10"/>
  <!-- yeux rouges glow -->
  <circle cx="42" cy="34" r="2.4" fill="#e74c3c"/>
  <circle cx="54" cy="34" r="2.4" fill="#e74c3c"/>
  <circle cx="42" cy="34" r="3.6" fill="#e74c3c" opacity="0.3"/>
  <circle cx="54" cy="34" r="3.6" fill="#e74c3c" opacity="0.3"/>
  <!-- dagues croisees -->
  <g transform="translate(18 64) rotate(-25)">
    <rect x="-1.5" y="-12" width="3" height="20" fill="#cfd8dc" stroke="#37474f" stroke-width="0.5"/>
    <rect x="-4" y="6" width="8" height="3" fill="#5a3a1a"/>
  </g>
  <g transform="translate(78 64) rotate(25)">
    <rect x="-1.5" y="-12" width="3" height="20" fill="#cfd8dc" stroke="#37474f" stroke-width="0.5"/>
    <rect x="-4" y="6" width="8" height="3" fill="#5a3a1a"/>
  </g>
</svg>`;

const SADIDA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sadiBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2ecc71"/>
      <stop offset="1" stop-color="#155a32"/>
    </linearGradient>
    <radialGradient id="sadiEye" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7c0"/>
      <stop offset="1" stop-color="#f1c40f"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.35"/>
  <!-- corps tronc -->
  <path d="M30 84 L34 48 L62 48 L66 84 Z" fill="url(#sadiBody)" stroke="#08321a" stroke-width="2"/>
  <!-- texture ecorce -->
  <line x1="42" y1="56" x2="42" y2="80" stroke="#08321a" stroke-width="1" opacity="0.5"/>
  <line x1="54" y1="56" x2="54" y2="80" stroke="#08321a" stroke-width="1" opacity="0.5"/>
  <!-- bras lianes -->
  <path d="M28 50 Q14 58 22 78" stroke="#155a32" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M68 50 Q82 58 74 78" stroke="#155a32" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- masque bois -->
  <ellipse cx="48" cy="32" rx="14" ry="15" fill="#6b4d2b" stroke="#3a2a18" stroke-width="2"/>
  <!-- feuilles autour de la tete -->
  <path d="M28 30 Q22 18 36 22 Q34 30 30 32 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <path d="M68 30 Q74 18 60 22 Q62 30 66 32 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <path d="M38 12 Q48 4 58 12 Q54 20 48 18 Q42 20 38 12 Z" fill="#2ecc71" stroke="#08321a" stroke-width="1"/>
  <path d="M48 4 L48 18" stroke="#08321a" stroke-width="1"/>
  <!-- yeux luminescents -->
  <circle cx="42" cy="32" r="2.4" fill="url(#sadiEye)"/>
  <circle cx="54" cy="32" r="2.4" fill="url(#sadiEye)"/>
  <!-- bouche sculptee -->
  <path d="M42 40 L54 40 L52 44 L44 44 Z" fill="#1a1108"/>
  <line x1="46" y1="40" x2="46" y2="44" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="50" y1="40" x2="50" y2="44" stroke="#6b4d2b" stroke-width="0.8"/>
</svg>`;

export const PORTRAITS = {
  iop: IOP,
  cra: CRA,
  eniripsa: ENIRIPSA,
  sram: SRAM,
  sadida: SADIDA,
};
