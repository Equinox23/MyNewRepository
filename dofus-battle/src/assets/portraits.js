// Portraits SVG des classes jouables, style Dofus chibi :
// tete dominante, gros yeux ronds avec reflets, contours marques 3px,
// accessoires/armes iconiques, capes et detail vestimentaire.

const IOP = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="iopArmor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6b5b"/>
      <stop offset="0.6" stop-color="#c0392b"/>
      <stop offset="1" stop-color="#5a1410"/>
    </linearGradient>
    <linearGradient id="iopHelm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb699"/>
      <stop offset="0.5" stop-color="#e74c3c"/>
      <stop offset="1" stop-color="#7a1a10"/>
    </linearGradient>
    <linearGradient id="iopBlade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#8a99a8"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="4" fill="#000" opacity="0.5"/>
  <!-- cape rouge derriere -->
  <path d="M22 50 L18 88 L34 80 L46 50 Z" fill="#7c1f17" stroke="#3a0e09" stroke-width="2"/>
  <path d="M74 50 L78 88 L62 80 L50 50 Z" fill="#7c1f17" stroke="#3a0e09" stroke-width="2"/>
  <!-- jambes / bottes -->
  <rect x="36" y="70" width="10" height="14" fill="#5a3a1a" stroke="#1a0d05" stroke-width="2.5"/>
  <rect x="50" y="70" width="10" height="14" fill="#5a3a1a" stroke="#1a0d05" stroke-width="2.5"/>
  <ellipse cx="41" cy="86" rx="9" ry="5" fill="#2a1610" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="55" cy="86" rx="9" ry="5" fill="#2a1610" stroke="#1a0d05" stroke-width="2"/>
  <!-- bras gauche (poing serre) -->
  <ellipse cx="20" cy="58" rx="8" ry="11" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2.5"/>
  <ellipse cx="20" cy="66" rx="7" ry="6" fill="#f4d3a5" stroke="#3a0e09" stroke-width="2"/>
  <!-- bras droit tenant l epee -->
  <ellipse cx="76" cy="56" rx="8" ry="11" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="2.5"/>
  <!-- torse / armure plastron -->
  <path d="M26 52 L32 46 L64 46 L70 52 L67 74 L29 74 Z" fill="url(#iopArmor)" stroke="#3a0e09" stroke-width="3"/>
  <!-- emblem Iop dore (etoile) -->
  <polygon points="48,52 52,60 60,60 54,65 56,72 48,68 40,72 42,65 36,60 44,60" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.2"/>
  <!-- ceinture -->
  <rect x="26" y="66" width="44" height="5" fill="#3a2310" stroke="#1a0d05" stroke-width="1.5"/>
  <circle cx="48" cy="68.5" r="2.5" fill="#f1c40f" stroke="#7a5d0a" stroke-width="0.8"/>
  <!-- tete chibi -->
  <circle cx="48" cy="32" r="20" fill="#f4d3a5" stroke="#3a0e09" stroke-width="3"/>
  <!-- casque rouge avec cornes -->
  <path d="M28 30 Q28 4 48 2 Q68 4 68 30 L68 38 Q58 30 48 30 Q38 30 28 38 Z" fill="url(#iopHelm)" stroke="#3a0e09" stroke-width="3"/>
  <!-- joues du casque -->
  <ellipse cx="30" cy="34" rx="4" ry="6" fill="#7c1f17" stroke="#3a0e09" stroke-width="2"/>
  <ellipse cx="66" cy="34" rx="4" ry="6" fill="#7c1f17" stroke="#3a0e09" stroke-width="2"/>
  <!-- panache de plumes -->
  <path d="M46 4 L48 -6 L50 4 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <path d="M42 6 L46 -2 L46 8 Z" fill="#e74c3c" stroke="#7a1a10" stroke-width="1.2"/>
  <path d="M54 6 L50 -2 L50 8 Z" fill="#e74c3c" stroke="#7a1a10" stroke-width="1.2"/>
  <circle cx="48" cy="2" r="2.5" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <!-- yeux gros et determines -->
  <circle cx="40" cy="34" r="5" fill="#fff" stroke="#3a0e09" stroke-width="2"/>
  <circle cx="56" cy="34" r="5" fill="#fff" stroke="#3a0e09" stroke-width="2"/>
  <circle cx="40" cy="35" r="2.8" fill="#1a2530"/>
  <circle cx="56" cy="35" r="2.8" fill="#1a2530"/>
  <circle cx="41.5" cy="33.5" r="1.1" fill="#fff"/>
  <circle cx="57.5" cy="33.5" r="1.1" fill="#fff"/>
  <!-- sourcils ferocissimes -->
  <path d="M32 26 L44 30" stroke="#3a0e09" stroke-width="3" stroke-linecap="round"/>
  <path d="M64 26 L52 30" stroke="#3a0e09" stroke-width="3" stroke-linecap="round"/>
  <!-- bouche grognante -->
  <path d="M42 42 Q48 47 54 42" stroke="#3a0e09" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- crocs -->
  <polygon points="44,42 45,46 46,42" fill="#fff"/>
  <polygon points="50,42 51,46 52,42" fill="#fff"/>
  <!-- epee massive sur l epaule -->
  <rect x="76" y="6" width="10" height="50" rx="2" fill="url(#iopBlade)" stroke="#3a0e09" stroke-width="2.5"/>
  <line x1="81" y1="10" x2="81" y2="54" stroke="#8a99a8" stroke-width="1.2"/>
  <polygon points="76,6 86,6 81,-2" fill="url(#iopBlade)" stroke="#3a0e09" stroke-width="2"/>
  <rect x="72" y="54" width="18" height="5" rx="1.5" fill="#8a6d3b" stroke="#3a2a14" stroke-width="1.5"/>
  <rect x="79" y="58" width="4" height="8" fill="#5a3a1a" stroke="#2c1a08" stroke-width="1.2"/>
  <circle cx="81" cy="14" r="3" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
</svg>`;

const CRA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craTunic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#48d1b8"/>
      <stop offset="1" stop-color="#0d6b59"/>
    </linearGradient>
    <linearGradient id="craHood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16a085"/>
      <stop offset="1" stop-color="#063a30"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="22" ry="4" fill="#000" opacity="0.5"/>
  <!-- cape verte -->
  <path d="M24 50 L20 88 L34 80 L42 50 Z" fill="#0d6b59" stroke="#063a30" stroke-width="2"/>
  <path d="M72 50 L76 88 L62 80 L54 50 Z" fill="#0d6b59" stroke="#063a30" stroke-width="2"/>
  <!-- jambes / bottes -->
  <rect x="36" y="70" width="10" height="14" fill="#3a2a14" stroke="#1a0d05" stroke-width="2.5"/>
  <rect x="50" y="70" width="10" height="14" fill="#3a2a14" stroke="#1a0d05" stroke-width="2.5"/>
  <ellipse cx="41" cy="86" rx="9" ry="5" fill="#1a0f08" stroke="#000" stroke-width="2"/>
  <ellipse cx="55" cy="86" rx="9" ry="5" fill="#1a0f08" stroke="#000" stroke-width="2"/>
  <!-- tunique courte -->
  <path d="M28 52 L34 46 L62 46 L68 52 L65 74 L31 74 Z" fill="url(#craTunic)" stroke="#063a30" stroke-width="3"/>
  <!-- ceinture cuir -->
  <rect x="28" y="64" width="40" height="5" fill="#5a3a1a" stroke="#1a0d05" stroke-width="1.5"/>
  <rect x="46" y="62" width="4" height="9" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.2"/>
  <!-- bras gauche tendu (tient l arc) -->
  <ellipse cx="18" cy="58" rx="6" ry="10" fill="#1abc9c" stroke="#063a30" stroke-width="2.5"/>
  <!-- bras droit tirant la corde -->
  <ellipse cx="72" cy="60" rx="6" ry="10" fill="#1abc9c" stroke="#063a30" stroke-width="2.5"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="20" fill="#f4d3a5" stroke="#063a30" stroke-width="3"/>
  <!-- oreilles pointues elfiques -->
  <path d="M28 32 L24 22 L30 30 Z" fill="#f4d3a5" stroke="#063a30" stroke-width="2"/>
  <path d="M68 32 L72 22 L66 30 Z" fill="#f4d3a5" stroke="#063a30" stroke-width="2"/>
  <!-- capuche verte -->
  <path d="M28 28 Q28 4 48 2 Q68 4 68 28 L62 36 L34 36 Z" fill="url(#craHood)" stroke="#063a30" stroke-width="3"/>
  <!-- plume sur capuche -->
  <path d="M62 6 Q72 0 70 12 Q66 14 62 12 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- yeux concentres -->
  <circle cx="40" cy="34" r="5" fill="#fff" stroke="#063a30" stroke-width="2"/>
  <circle cx="56" cy="34" r="5" fill="#fff" stroke="#063a30" stroke-width="2"/>
  <circle cx="40" cy="35" r="2.8" fill="#1a4d3a"/>
  <circle cx="56" cy="35" r="2.8" fill="#1a4d3a"/>
  <circle cx="41.5" cy="33.5" r="1.1" fill="#fff"/>
  <circle cx="57.5" cy="33.5" r="1.1" fill="#fff"/>
  <!-- sourcils -->
  <path d="M34 28 L42 30" stroke="#063a30" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M62 28 L54 30" stroke="#063a30" stroke-width="2.5" stroke-linecap="round"/>
  <!-- bouche neutre -->
  <path d="M44 44 L52 44" stroke="#063a30" stroke-width="2.5" stroke-linecap="round"/>
  <!-- carquois plein -->
  <rect x="66" y="40" width="9" height="22" rx="2" fill="#5a3a1a" stroke="#2a1a08" stroke-width="2"/>
  <line x1="68" y1="42" x2="68" y2="34" stroke="#cccccc" stroke-width="1.5"/>
  <line x1="71" y1="42" x2="71" y2="32" stroke="#cccccc" stroke-width="1.5"/>
  <line x1="73" y1="42" x2="73" y2="30" stroke="#cccccc" stroke-width="1.5"/>
  <polygon points="66,30 70,30 68,26" fill="#7a5826" stroke="#3a2a14" stroke-width="0.8"/>
  <polygon points="69,28 73,28 71,24" fill="#7a5826" stroke="#3a2a14" stroke-width="0.8"/>
  <polygon points="71,26 75,26 73,22" fill="#7a5826" stroke="#3a2a14" stroke-width="0.8"/>
  <!-- arc bande -->
  <path d="M10 22 Q-2 56 10 90" stroke="#8a6d3b" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M10 22 Q-2 56 10 90" stroke="#3a2a14" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="3,3"/>
  <line x1="10" y1="22" x2="10" y2="90" stroke="#ddd" stroke-width="1.2"/>
  <!-- fleche encochee tendue -->
  <line x1="10" y1="56" x2="38" y2="56" stroke="#8a6d3b" stroke-width="2"/>
  <polygon points="38,52 46,56 38,60" fill="#7a5826" stroke="#3a2a14" stroke-width="0.8"/>
  <polygon points="6,53 12,56 6,59" fill="#5a3a14"/>
</svg>`;

const ENIRIPSA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="eniRobe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9bbd"/>
      <stop offset="0.6" stop-color="#e91e63"/>
      <stop offset="1" stop-color="#7a0e3a"/>
    </linearGradient>
    <linearGradient id="eniHat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff80a8"/>
      <stop offset="1" stop-color="#a51149"/>
    </linearGradient>
    <radialGradient id="eniHeart" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#fff0f4"/>
      <stop offset="0.5" stop-color="#ff5577"/>
      <stop offset="1" stop-color="#7a0e3a"/>
    </radialGradient>
    <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="26" ry="4.5" fill="#000" opacity="0.5"/>
  <!-- robe ample evasée -->
  <path d="M18 88 L34 46 L62 46 L78 88 Z" fill="url(#eniRobe)" stroke="#5c0a2a" stroke-width="3"/>
  <!-- volants robe -->
  <path d="M18 88 Q28 84 38 88 Q48 84 58 88 Q68 84 78 88" stroke="#5c0a2a" stroke-width="1.5" fill="none"/>
  <!-- ceinture corde doree -->
  <path d="M28 68 Q48 73 68 68" stroke="#f1c40f" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="48" cy="70" r="3" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.2"/>
  <!-- bras avec manches a froufrous -->
  <ellipse cx="22" cy="58" rx="7" ry="11" fill="#e91e63" stroke="#5c0a2a" stroke-width="2.5"/>
  <ellipse cx="22" cy="64" rx="8" ry="4" fill="#ff80a8" stroke="#5c0a2a" stroke-width="1.5"/>
  <ellipse cx="74" cy="58" rx="7" ry="11" fill="#e91e63" stroke="#5c0a2a" stroke-width="2.5"/>
  <ellipse cx="74" cy="64" rx="8" ry="4" fill="#ff80a8" stroke="#5c0a2a" stroke-width="1.5"/>
  <!-- cheveux long boucles -->
  <path d="M28 30 Q22 62 28 70 L36 30 Z" fill="#9b59b6" stroke="#5c2a6e" stroke-width="2"/>
  <path d="M68 30 Q74 62 68 70 L60 30 Z" fill="#9b59b6" stroke="#5c2a6e" stroke-width="2"/>
  <circle cx="26" cy="70" r="4" fill="#9b59b6" stroke="#5c2a6e" stroke-width="2"/>
  <circle cx="70" cy="70" r="4" fill="#9b59b6" stroke="#5c2a6e" stroke-width="2"/>
  <!-- tete -->
  <circle cx="48" cy="32" r="20" fill="#f4d3a5" stroke="#5c0a2a" stroke-width="3"/>
  <!-- frange -->
  <path d="M30 22 Q34 30 38 24 Q44 32 46 22 Q50 32 54 22 Q58 32 62 24 Q66 30 66 22 Q60 12 48 10 Q36 12 30 22 Z" fill="#9b59b6" stroke="#5c2a6e" stroke-width="2"/>
  <!-- chapeau pointu sorciere ample -->
  <path d="M22 22 Q48 -10 74 22 Z" fill="url(#eniHat)" stroke="#5c0a2a" stroke-width="3"/>
  <path d="M20 22 L76 22 L72 30 L24 30 Z" fill="#5c0a2a" stroke="#3a0518" stroke-width="2"/>
  <!-- ruban chapeau -->
  <rect x="38" y="22" width="20" height="4" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <!-- pompon -->
  <circle cx="48" cy="-4" r="4" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- yeux doux pleins de cils -->
  <circle cx="40" cy="34" r="5" fill="#fff" stroke="#5c0a2a" stroke-width="2"/>
  <circle cx="56" cy="34" r="5" fill="#fff" stroke="#5c0a2a" stroke-width="2"/>
  <circle cx="40" cy="35" r="2.8" fill="#3a2a4a"/>
  <circle cx="56" cy="35" r="2.8" fill="#3a2a4a"/>
  <circle cx="41.5" cy="33.5" r="1.2" fill="#fff"/>
  <circle cx="57.5" cy="33.5" r="1.2" fill="#fff"/>
  <path d="M35 30 L37 30" stroke="#3a2a4a" stroke-width="1.2"/>
  <path d="M59 30 L61 30" stroke="#3a2a4a" stroke-width="1.2"/>
  <!-- joues rosees -->
  <circle cx="34" cy="42" r="3" fill="#ff80a8" opacity="0.55"/>
  <circle cx="62" cy="42" r="3" fill="#ff80a8" opacity="0.55"/>
  <!-- bouche souriante -->
  <path d="M42 42 Q48 47 54 42" stroke="#7a3a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- baton avec gros coeur -->
  <line x1="84" y1="18" x2="84" y2="84" stroke="#8a6d3b" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="84" y1="20" x2="84" y2="80" stroke="#5a3a1a" stroke-width="1" stroke-dasharray="3,3"/>
  <path d="M74 18 Q70 6 80 6 Q84 6 84 14 Q84 6 88 6 Q98 6 94 18 Q88 28 84 32 Q80 28 74 18 Z" fill="url(#eniHeart)" stroke="#7a0e3a" stroke-width="2"/>
  <!-- etoile sur le coeur -->
  <polygon points="84,12 86,16 90,16 87,18 88,22 84,20 80,22 81,18 78,16 82,16" fill="#fff" opacity="0.85"/>
  <!-- etincelles autour -->
  <circle cx="14" cy="40" r="2" fill="url(#sparkle)"/>
  <circle cx="10" cy="60" r="1.5" fill="url(#sparkle)"/>
  <circle cx="88" cy="50" r="2" fill="url(#sparkle)"/>
  <polygon points="6,30 8,34 12,34 9,36 10,40 6,38 2,40 3,36 0,34 4,34" fill="#fff" opacity="0.6"/>
  <polygon points="92,72 93,75 96,75 94,76 95,79 92,77 89,79 90,76 88,75 91,75" fill="#fff" opacity="0.6"/>
</svg>`;

const SRAM = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sramCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5b7896"/>
      <stop offset="0.6" stop-color="#34495e"/>
      <stop offset="1" stop-color="#050a10"/>
    </linearGradient>
    <radialGradient id="sramEye" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffe2dd"/>
      <stop offset="0.5" stop-color="#e74c3c"/>
      <stop offset="1" stop-color="#7c1f17"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="26" ry="5" fill="#000" opacity="0.6"/>
  <!-- cape ample qui flotte -->
  <path d="M14 88 L26 38 L42 50 L48 88 L54 50 L70 38 L82 88 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="2.5"/>
  <!-- interieur cape -->
  <path d="M46 48 L48 88 L50 48 Z" fill="#1a2530"/>
  <!-- bras -->
  <ellipse cx="20" cy="62" rx="7" ry="12" fill="#1a2530" stroke="#050a10" stroke-width="2.5"/>
  <ellipse cx="76" cy="62" rx="7" ry="12" fill="#1a2530" stroke="#050a10" stroke-width="2.5"/>
  <!-- bandages aux poignets -->
  <rect x="13" y="70" width="14" height="3" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="1"/>
  <rect x="69" y="70" width="14" height="3" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="1"/>
  <!-- capuche tres profonde -->
  <path d="M22 44 Q22 -2 48 -2 Q74 -2 74 44 L64 36 L32 36 Z" fill="url(#sramCloak)" stroke="#050a10" stroke-width="3"/>
  <!-- pointe de capuche -->
  <path d="M48 -2 L44 -10 L52 -10 Z" fill="#050a10"/>
  <!-- ombre du visage -->
  <ellipse cx="48" cy="34" rx="17" ry="14" fill="#050a10"/>
  <!-- crane / masque -->
  <ellipse cx="48" cy="34" rx="13" ry="11" fill="#2c3e50" opacity="0.85"/>
  <!-- yeux rouges glow -->
  <circle cx="40" cy="32" r="6" fill="#e74c3c" opacity="0.35"/>
  <circle cx="56" cy="32" r="6" fill="#e74c3c" opacity="0.35"/>
  <circle cx="40" cy="32" r="4" fill="url(#sramEye)"/>
  <circle cx="56" cy="32" r="4" fill="url(#sramEye)"/>
  <circle cx="40" cy="31" r="1.5" fill="#fff7a0"/>
  <circle cx="56" cy="31" r="1.5" fill="#fff7a0"/>
  <!-- bouche/crocs vagues sous la capuche -->
  <path d="M42 42 L44 44 L46 42 L48 44 L50 42 L52 44 L54 42" stroke="#7f8c8d" stroke-width="1.2" fill="none"/>
  <!-- dagues croisees -->
  <g transform="translate(12 60) rotate(-30)">
    <rect x="-2.5" y="-16" width="5" height="24" fill="#cfd8dc" stroke="#37474f" stroke-width="1.2"/>
    <rect x="-2" y="-14" width="0.8" height="20" fill="#7f8c8d"/>
    <rect x="-6" y="6" width="12" height="5" fill="#5a3a1a" stroke="#2c1a08" stroke-width="1"/>
    <circle cx="0" cy="14" r="2.5" fill="#7d3c98" stroke="#4a235a" stroke-width="0.8"/>
    <polygon points="-2.5,-16 2.5,-16 0,-22" fill="#cfd8dc" stroke="#37474f" stroke-width="1"/>
  </g>
  <g transform="translate(84 60) rotate(30)">
    <rect x="-2.5" y="-16" width="5" height="24" fill="#cfd8dc" stroke="#37474f" stroke-width="1.2"/>
    <rect x="-2" y="-14" width="0.8" height="20" fill="#7f8c8d"/>
    <rect x="-6" y="6" width="12" height="5" fill="#5a3a1a" stroke="#2c1a08" stroke-width="1"/>
    <circle cx="0" cy="14" r="2.5" fill="#7d3c98" stroke="#4a235a" stroke-width="0.8"/>
    <polygon points="-2.5,-16 2.5,-16 0,-22" fill="#cfd8dc" stroke="#37474f" stroke-width="1"/>
  </g>
  <!-- aura ombrageuse -->
  <circle cx="48" cy="50" r="34" fill="#050a10" opacity="0.15"/>
</svg>`;

const SADIDA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="sadiBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#82e8a8"/>
      <stop offset="0.6" stop-color="#27ae60"/>
      <stop offset="1" stop-color="#08321a"/>
    </linearGradient>
    <radialGradient id="sadiMask" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#a67c52"/>
      <stop offset="1" stop-color="#3a2a18"/>
    </radialGradient>
    <radialGradient id="sadiEye" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7c0"/>
      <stop offset="0.6" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="4" fill="#000" opacity="0.5"/>
  <!-- corps tronc d arbre -->
  <path d="M26 86 L34 50 L62 50 L70 86 Z" fill="url(#sadiBody)" stroke="#08321a" stroke-width="3"/>
  <!-- texture ecorce -->
  <path d="M38 56 Q36 70 40 84" stroke="#08321a" stroke-width="1.4" fill="none"/>
  <path d="M58 56 Q60 70 56 84" stroke="#08321a" stroke-width="1.4" fill="none"/>
  <ellipse cx="48" cy="64" rx="4" ry="3" fill="#08321a" opacity="0.7"/>
  <ellipse cx="42" cy="76" rx="2.5" ry="2" fill="#08321a" opacity="0.5"/>
  <ellipse cx="56" cy="74" rx="2.5" ry="2" fill="#08321a" opacity="0.5"/>
  <!-- pousses sur les epaules -->
  <ellipse cx="32" cy="50" rx="4" ry="3" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <ellipse cx="64" cy="50" rx="4" ry="3" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <!-- bras lianes torsadees -->
  <path d="M28 52 Q12 60 18 82 Q22 86 20 82" stroke="#155a32" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M68 52 Q84 60 78 82 Q74 86 76 82" stroke="#155a32" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M16 64 Q12 66 14 70" stroke="#27ae60" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M80 64 Q84 66 82 70" stroke="#27ae60" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- mains type pousses -->
  <circle cx="18" cy="84" r="6" fill="#2ecc71" stroke="#08321a" stroke-width="2"/>
  <path d="M14 82 L12 76 L17 80 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <path d="M22 82 L24 76 L19 80 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <circle cx="78" cy="84" r="6" fill="#2ecc71" stroke="#08321a" stroke-width="2"/>
  <path d="M82 82 L84 76 L79 80 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <path d="M74 82 L72 76 L77 80 Z" fill="#27ae60" stroke="#08321a" stroke-width="1"/>
  <!-- masque rond en bois sculpte -->
  <circle cx="48" cy="32" r="20" fill="url(#sadiMask)" stroke="#3a2a18" stroke-width="3"/>
  <!-- grains de bois -->
  <path d="M32 24 Q34 36 32 44" stroke="#3a2a18" stroke-width="1.2" fill="none" opacity="0.7"/>
  <path d="M64 24 Q62 36 64 44" stroke="#3a2a18" stroke-width="1.2" fill="none" opacity="0.7"/>
  <!-- couronne de feuilles -->
  <path d="M22 28 Q14 12 32 16 Q30 26 26 30 Z" fill="#27ae60" stroke="#08321a" stroke-width="2"/>
  <path d="M74 28 Q82 12 64 16 Q66 26 70 30 Z" fill="#27ae60" stroke="#08321a" stroke-width="2"/>
  <path d="M36 10 Q48 -4 60 10 Q56 18 48 16 Q40 18 36 10 Z" fill="#2ecc71" stroke="#08321a" stroke-width="2"/>
  <line x1="48" y1="-2" x2="48" y2="14" stroke="#08321a" stroke-width="1.5"/>
  <ellipse cx="40" cy="6" rx="3" ry="5" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <ellipse cx="56" cy="6" rx="3" ry="5" fill="#27ae60" stroke="#08321a" stroke-width="1.5"/>
  <!-- yeux luminescents -->
  <ellipse cx="40" cy="32" rx="4.5" ry="5" fill="url(#sadiEye)" stroke="#3a2a18" stroke-width="1.5"/>
  <ellipse cx="56" cy="32" rx="4.5" ry="5" fill="url(#sadiEye)" stroke="#3a2a18" stroke-width="1.5"/>
  <circle cx="40" cy="32" r="2" fill="#3a2a18"/>
  <circle cx="56" cy="32" r="2" fill="#3a2a18"/>
  <circle cx="41" cy="31" r="0.7" fill="#fff"/>
  <circle cx="57" cy="31" r="0.7" fill="#fff"/>
  <!-- bouche sculptee -->
  <path d="M38 42 L58 42 L55 47 L41 47 Z" fill="#1a1108" stroke="#3a2a18" stroke-width="1.2"/>
  <line x1="42" y1="42" x2="42" y2="47" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="46" y1="42" x2="46" y2="47" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="50" y1="42" x2="50" y2="47" stroke="#6b4d2b" stroke-width="0.8"/>
  <line x1="54" y1="42" x2="54" y2="47" stroke="#6b4d2b" stroke-width="0.8"/>
</svg>`;

export const PORTRAITS = {
  iop: IOP,
  cra: CRA,
  eniripsa: ENIRIPSA,
  sram: SRAM,
  sadida: SADIDA,
};
