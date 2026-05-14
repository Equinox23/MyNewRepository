// Portraits SVG des classes jouables. Style chibi : tete plus large que
// le corps, gros yeux ronds, contours marques, couleurs saturees.

const IOP = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="iopArmor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6b5b"/>
      <stop offset="1" stop-color="#7c1f17"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="22" ry="4" fill="#000" opacity="0.45"/>
  <!-- jambes / bottes -->
  <rect x="36" y="72" width="10" height="12" fill="#5a3a1a" stroke="#1a0d05" stroke-width="2"/>
  <rect x="50" y="72" width="10" height="12" fill="#5a3a1a" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="41" cy="86" rx="8" ry="4" fill="#2a1610" stroke="#1a0d05" stroke-width="1.5"/>
  <ellipse cx="55" cy="86" rx="8" ry="4" fill="#2a1610" stroke="#1a0d05" stroke-width="1.5"/>
  <!-- torse compact -->
  <path d="M28 52 L34 48 L62 48 L68 52 L66 76 L30 76 Z" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2.5"/>
  <!-- ceinture -->
  <rect x="28" y="66" width="40" height="6" fill="#5a3a1a" stroke="#1a0d05" stroke-width="1.5"/>
  <rect x="44" y="64" width="8" height="10" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- bras -->
  <ellipse cx="22" cy="58" rx="7" ry="11" fill="#c0392b" stroke="#3a0e09" stroke-width="2.5"/>
  <ellipse cx="74" cy="58" rx="7" ry="11" fill="#c0392b" stroke="#3a0e09" stroke-width="2.5"/>
  <!-- tete chibi (grosse) -->
  <circle cx="48" cy="32" r="18" fill="#f4d3a5" stroke="#3a0e09" stroke-width="2.5"/>
  <!-- casque -->
  <path d="M30 30 Q30 8 48 6 Q66 8 66 30 L66 38 Q58 28 48 28 Q38 28 30 38 Z" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2.5"/>
  <!-- plume de casque -->
  <path d="M44 6 L52 6 L50 -2 L46 -2 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <circle cx="48" cy="2" r="2" fill="#e74c3c" stroke="#7a1a10" stroke-width="1"/>
  <!-- yeux ronds -->
  <circle cx="40" cy="34" r="4" fill="#fff" stroke="#3a0e09" stroke-width="1.5"/>
  <circle cx="56" cy="34" r="4" fill="#fff" stroke="#3a0e09" stroke-width="1.5"/>
  <circle cx="40" cy="35" r="2.2" fill="#1a2530"/>
  <circle cx="56" cy="35" r="2.2" fill="#1a2530"/>
  <circle cx="41" cy="34" r="0.8" fill="#fff"/>
  <circle cx="57" cy="34" r="0.8" fill="#fff"/>
  <!-- sourcils mechants -->
  <path d="M34 28 L42 30" stroke="#3a0e09" stroke-width="2" stroke-linecap="round"/>
  <path d="M62 28 L54 30" stroke="#3a0e09" stroke-width="2" stroke-linecap="round"/>
  <!-- bouche -->
  <path d="M42 42 Q48 46 54 42" stroke="#3a0e09" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- epee tenue -->
  <rect x="78" y="18" width="4" height="42" fill="#ecf0f1" stroke="#2c3e50" stroke-width="1.5"/>
  <rect x="74" y="58" width="12" height="5" rx="1.5" fill="#8a6d3b" stroke="#3a2a14" stroke-width="1.5"/>
  <polygon points="78,18 82,18 80,10" fill="#ecf0f1" stroke="#2c3e50" stroke-width="1.5"/>
</svg>`;

const CRA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craTunic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2ed8b6"/>
      <stop offset="1" stop-color="#0d6b59"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="22" ry="4" fill="#000" opacity="0.45"/>
  <rect x="36" y="72" width="10" height="12" fill="#3a2a14" stroke="#1a0d05" stroke-width="2"/>
  <rect x="50" y="72" width="10" height="12" fill="#3a2a14" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="41" cy="86" rx="8" ry="4" fill="#1a0f08" stroke="#000" stroke-width="1.5"/>
  <ellipse cx="55" cy="86" rx="8" ry="4" fill="#1a0f08" stroke="#000" stroke-width="1.5"/>
  <!-- tunique -->
  <path d="M28 52 L34 48 L62 48 L68 52 L64 76 L32 76 Z" fill="url(#craTunic)" stroke="#063a30" stroke-width="2.5"/>
  <!-- ceinture cuir -->
  <rect x="30" y="64" width="36" height="5" fill="#5a3a1a" stroke="#1a0d05" stroke-width="1.2"/>
  <!-- bras tirant l arc -->
  <ellipse cx="22" cy="58" rx="6" ry="10" fill="#1abc9c" stroke="#063a30" stroke-width="2.5"/>
  <ellipse cx="74" cy="58" rx="6" ry="10" fill="#1abc9c" stroke="#063a30" stroke-width="2.5"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="18" fill="#f4d3a5" stroke="#063a30" stroke-width="2.5"/>
  <!-- capuche -->
  <path d="M30 28 Q30 8 48 6 Q66 8 66 30 L60 36 L36 36 Z" fill="#0d6b59" stroke="#063a30" stroke-width="2.5"/>
  <path d="M28 30 L32 28 L32 38 L28 40 Z" fill="#063a30"/>
  <!-- yeux -->
  <circle cx="40" cy="36" r="4" fill="#fff" stroke="#063a30" stroke-width="1.5"/>
  <circle cx="56" cy="36" r="4" fill="#fff" stroke="#063a30" stroke-width="1.5"/>
  <circle cx="40" cy="37" r="2.2" fill="#1a2530"/>
  <circle cx="56" cy="37" r="2.2" fill="#1a2530"/>
  <circle cx="41" cy="36" r="0.8" fill="#fff"/>
  <circle cx="57" cy="36" r="0.8" fill="#fff"/>
  <!-- sourcils concentres -->
  <path d="M34 32 L42 32" stroke="#063a30" stroke-width="2" stroke-linecap="round"/>
  <path d="M62 32 L54 32" stroke="#063a30" stroke-width="2" stroke-linecap="round"/>
  <!-- bouche -->
  <path d="M44 44 L52 44" stroke="#063a30" stroke-width="2" stroke-linecap="round"/>
  <!-- carquois sur dos -->
  <rect x="62" y="42" width="9" height="22" rx="2" fill="#5a3a1a" stroke="#2a1a08" stroke-width="1.5"/>
  <line x1="64" y1="42" x2="64" y2="34" stroke="#cccccc" stroke-width="1.2"/>
  <line x1="68" y1="42" x2="68" y2="32" stroke="#cccccc" stroke-width="1.2"/>
  <polygon points="62,30 66,30 64,26" fill="#7a5826"/>
  <polygon points="66,28 70,28 68,24" fill="#7a5826"/>
  <!-- arc -->
  <path d="M12 28 Q2 56 12 84" stroke="#8a6d3b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <line x1="12" y1="28" x2="12" y2="84" stroke="#ddd" stroke-width="1"/>
  <line x1="12" y1="56" x2="34" y2="56" stroke="#8a6d3b" stroke-width="1.8"/>
  <polygon points="34,52 42,56 34,60" fill="#7a5826" stroke="#3a2a14" stroke-width="0.5"/>
</svg>`;

const ENIRIPSA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="eniRobe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff80a8"/>
      <stop offset="1" stop-color="#a51149"/>
    </linearGradient>
    <radialGradient id="eniHeart" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffe0e8"/>
      <stop offset="1" stop-color="#e91e63"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="4" fill="#000" opacity="0.45"/>
  <!-- robe -->
  <path d="M20 88 L34 46 L62 46 L76 88 Z" fill="url(#eniRobe)" stroke="#5c0a2a" stroke-width="2.5"/>
  <!-- ceinture en corde -->
  <path d="M28 70 Q48 74 68 70" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- bras -->
  <ellipse cx="22" cy="56" rx="6" ry="10" fill="#e91e63" stroke="#5c0a2a" stroke-width="2.5"/>
  <ellipse cx="74" cy="56" rx="6" ry="10" fill="#e91e63" stroke="#5c0a2a" stroke-width="2.5"/>
  <!-- cheveux longs -->
  <path d="M30 30 Q26 58 32 66 L36 32 Z" fill="#9b59b6"/>
  <path d="M66 30 Q70 58 64 66 L60 32 Z" fill="#9b59b6"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="18" fill="#f4d3a5" stroke="#5c0a2a" stroke-width="2.5"/>
  <!-- chapeau pointu sorciere -->
  <path d="M30 24 Q48 -2 66 24 Z" fill="url(#eniRobe)" stroke="#5c0a2a" stroke-width="2.5"/>
  <path d="M28 22 L68 22 L66 28 L30 28 Z" fill="#5c0a2a"/>
  <circle cx="48" cy="2" r="3" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <!-- yeux doux -->
  <circle cx="40" cy="34" r="4" fill="#fff" stroke="#5c0a2a" stroke-width="1.5"/>
  <circle cx="56" cy="34" r="4" fill="#fff" stroke="#5c0a2a" stroke-width="1.5"/>
  <circle cx="40" cy="35" r="2.2" fill="#3a2a4a"/>
  <circle cx="56" cy="35" r="2.2" fill="#3a2a4a"/>
  <circle cx="41" cy="34" r="0.8" fill="#fff"/>
  <circle cx="57" cy="34" r="0.8" fill="#fff"/>
  <!-- sourcils doux -->
  <path d="M36 28 L43 30" stroke="#7a3a4a" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M60 28 L53 30" stroke="#7a3a4a" stroke-width="1.5" stroke-linecap="round"/>
  <!-- bouche souriante -->
  <path d="M42 42 Q48 46 54 42" stroke="#7a3a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- baton avec coeur -->
  <line x1="80" y1="22" x2="80" y2="82" stroke="#8a6d3b" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M72 20 Q68 12 76 12 Q80 12 80 18 Q80 12 84 12 Q92 12 88 20 Q84 28 80 30 Q76 28 72 20 Z" fill="url(#eniHeart)" stroke="#7a0e3a" stroke-width="1.5"/>
</svg>`;

const SRAM = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sramCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a6075"/>
      <stop offset="1" stop-color="#0a1218"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="5" fill="#000" opacity="0.55"/>
  <!-- cape -->
  <path d="M18 88 L30 42 L66 42 L78 88 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="2.5"/>
  <path d="M44 44 L48 82 L52 44 Z" fill="#1a2530"/>
  <!-- bras -->
  <ellipse cx="22" cy="60" rx="6" ry="11" fill="#1a2530" stroke="#050a10" stroke-width="2.5"/>
  <ellipse cx="74" cy="60" rx="6" ry="11" fill="#1a2530" stroke="#050a10" stroke-width="2.5"/>
  <!-- capuche tres large -->
  <path d="M22 42 Q22 4 48 2 Q74 4 74 42 L64 36 L32 36 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="2.5"/>
  <!-- ombre du visage -->
  <ellipse cx="48" cy="36" rx="16" ry="13" fill="#050a10"/>
  <!-- yeux rouges glow -->
  <circle cx="40" cy="34" r="3.5" fill="#e74c3c"/>
  <circle cx="56" cy="34" r="3.5" fill="#e74c3c"/>
  <circle cx="40" cy="34" r="5" fill="#e74c3c" opacity="0.35"/>
  <circle cx="56" cy="34" r="5" fill="#e74c3c" opacity="0.35"/>
  <circle cx="40" cy="33" r="1" fill="#fff7a0"/>
  <circle cx="56" cy="33" r="1" fill="#fff7a0"/>
  <!-- dagues croisees -->
  <g transform="translate(14 64) rotate(-25)">
    <rect x="-2" y="-14" width="4" height="22" fill="#cfd8dc" stroke="#37474f" stroke-width="0.8"/>
    <rect x="-5" y="6" width="10" height="4" fill="#5a3a1a" stroke="#2c1a08" stroke-width="0.5"/>
    <polygon points="-2,-14 2,-14 0,-18" fill="#cfd8dc" stroke="#37474f" stroke-width="0.5"/>
  </g>
  <g transform="translate(82 64) rotate(25)">
    <rect x="-2" y="-14" width="4" height="22" fill="#cfd8dc" stroke="#37474f" stroke-width="0.8"/>
    <rect x="-5" y="6" width="10" height="4" fill="#5a3a1a" stroke="#2c1a08" stroke-width="0.5"/>
    <polygon points="-2,-14 2,-14 0,-18" fill="#cfd8dc" stroke="#37474f" stroke-width="0.5"/>
  </g>
</svg>`;

const SADIDA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sadiBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5fe39d"/>
      <stop offset="1" stop-color="#155a32"/>
    </linearGradient>
    <radialGradient id="sadiEye" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7c0"/>
      <stop offset="1" stop-color="#f1c40f"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="22" ry="4" fill="#000" opacity="0.45"/>
  <!-- corps tronc -->
  <path d="M28 86 L34 48 L62 48 L68 86 Z" fill="url(#sadiBody)" stroke="#08321a" stroke-width="2.5"/>
  <!-- texture ecorce -->
  <line x1="40" y1="58" x2="38" y2="82" stroke="#08321a" stroke-width="1.2" opacity="0.5"/>
  <line x1="56" y1="58" x2="58" y2="82" stroke="#08321a" stroke-width="1.2" opacity="0.5"/>
  <ellipse cx="48" cy="68" rx="3" ry="2" fill="#08321a" opacity="0.5"/>
  <!-- bras lianes -->
  <path d="M28 50 Q12 62 18 80" stroke="#155a32" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M68 50 Q84 62 78 80" stroke="#155a32" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="18" cy="82" r="5" fill="#27ae60" stroke="#08321a" stroke-width="2"/>
  <circle cx="78" cy="82" r="5" fill="#27ae60" stroke="#08321a" stroke-width="2"/>
  <!-- masque rond -->
  <circle cx="48" cy="32" r="18" fill="#6b4d2b" stroke="#3a2a18" stroke-width="2.5"/>
  <!-- feuilles couronne -->
  <path d="M24 30 Q18 14 34 18 Q32 28 28 32 Z" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <path d="M72 30 Q78 14 62 18 Q64 28 68 32 Z" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <path d="M36 10 Q48 -2 60 10 Q56 18 48 16 Q40 18 36 10 Z" fill="#2ecc71" stroke="#08321a" stroke-width="1.5"/>
  <line x1="48" y1="0" x2="48" y2="14" stroke="#08321a" stroke-width="1.5"/>
  <!-- yeux luminescents -->
  <ellipse cx="40" cy="32" rx="4" ry="4.5" fill="url(#sadiEye)" stroke="#3a2a18" stroke-width="1"/>
  <ellipse cx="56" cy="32" rx="4" ry="4.5" fill="url(#sadiEye)" stroke="#3a2a18" stroke-width="1"/>
  <circle cx="40" cy="32" r="1.6" fill="#3a2a18"/>
  <circle cx="56" cy="32" r="1.6" fill="#3a2a18"/>
  <!-- bouche sculptee -->
  <path d="M40 42 L56 42 L54 46 L42 46 Z" fill="#1a1108"/>
  <line x1="44" y1="42" x2="44" y2="46" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="48" y1="42" x2="48" y2="46" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="52" y1="42" x2="52" y2="46" stroke="#6b4d2b" stroke-width="0.8"/>
</svg>`;

export const PORTRAITS = {
  iop: IOP,
  cra: CRA,
  eniripsa: ENIRIPSA,
  sram: SRAM,
  sadida: SADIDA,
};
