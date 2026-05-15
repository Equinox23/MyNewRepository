// Menu de pre-combat : selection guidee, etape par etape
// (classe -> combat -> carte), avec etoiles de progression.
import { getStar } from './Progress.js';

// Etoile SVG : 'gold' | 'silver' | 'empty'.
function starSvg(type, size = 26) {
  const fill = type === 'gold' ? '#f6c83e' : type === 'silver' ? '#d3dade' : 'none';
  const stroke = type === 'gold' ? '#a87c12' : type === 'silver' ? '#8a949c' : '#5b6072';
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32 5,40 24,61 26,45 40,50 60,32 49,14 60,19 40,3 26,24 24"
      fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/></svg>`;
}

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
    desc: '3 Bouftous + 1 Bouftou Royal. Foncent au corps a corps.',
    available: true,
    homeMap: 'foret',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bouW" cx="42%" cy="34%" r="72%">
          <stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#e6b41f"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="23" ry="3.5" fill="#000" opacity="0.35"/>
      <!-- cornes -->
      <path d="M16 24 Q6 18 9 7 Q14 15 22 19 Z" fill="#efe6cf" stroke="#1a0d05" stroke-width="1.6"/>
      <path d="M48 24 Q58 18 55 7 Q50 15 42 19 Z" fill="#efe6cf" stroke="#1a0d05" stroke-width="1.6"/>
      <!-- toison : amas de boules -->
      <circle cx="32" cy="38" r="22" fill="url(#bouW)" stroke="#5a3a07" stroke-width="2"/>
      <circle cx="13" cy="30" r="7" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="20" cy="20" r="6" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="44" cy="20" r="6" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="51" cy="30" r="7" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="14" cy="47" r="6.5" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="50" cy="47" r="6.5" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <circle cx="32" cy="53" r="6.5" fill="url(#bouW)" stroke="#5a3a07" stroke-width="1.4"/>
      <!-- museau sombre + yeux rouges -->
      <ellipse cx="32" cy="40" rx="13" ry="9.5" fill="#1c0f06"/>
      <circle cx="26" cy="37" r="3" fill="#ff5b4d"/>
      <circle cx="38" cy="37" r="3" fill="#ff5b4d"/>
      <circle cx="26" cy="37" r="5" fill="#ff5b4d" opacity="0.3"/>
      <circle cx="38" cy="37" r="5" fill="#ff5b4d" opacity="0.3"/>
      <path d="M25 45 L28 48 L31 45 L34 48 L37 45 L39 47" stroke="#fff" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'crapaud',
    name: 'Crapauds de la mare',
    desc: '3 Crapauds + 1 Chef coiffe. Aquatiques, crachent a distance.',
    available: true,
    homeMap: 'cascade',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="craB" cx="48%" cy="34%" r="70%">
          <stop offset="0" stop-color="#86c95e"/><stop offset="1" stop-color="#2c5421"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="23" ry="3.5" fill="#000" opacity="0.35"/>
      <!-- pattes -->
      <ellipse cx="11" cy="50" rx="7" ry="3.4" fill="#33602a"/>
      <ellipse cx="53" cy="50" rx="7" ry="3.4" fill="#33602a"/>
      <!-- corps -->
      <ellipse cx="32" cy="42" rx="23" ry="15" fill="url(#craB)" stroke="#16300d" stroke-width="2"/>
      <ellipse cx="32" cy="51" rx="15" ry="5.5" fill="#cfdc73"/>
      <!-- gros yeux globuleux -->
      <circle cx="21" cy="22" r="10" fill="#f4f7ea" stroke="#16300d" stroke-width="2"/>
      <circle cx="43" cy="22" r="10" fill="#f4f7ea" stroke="#16300d" stroke-width="2"/>
      <circle cx="22" cy="24" r="4.4" fill="#16140f"/>
      <circle cx="42" cy="24" r="4.4" fill="#16140f"/>
      <circle cx="20" cy="21" r="1.8" fill="#fff"/>
      <circle cx="40" cy="21" r="1.8" fill="#fff"/>
      <!-- bouche large -->
      <path d="M14 41 Q32 53 50 41" stroke="#22130a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <!-- haut-de-forme du chef -->
      <ellipse cx="32" cy="13" rx="11" ry="2.4" fill="#141416"/>
      <rect x="25.5" y="1" width="13" height="12" rx="1" fill="#1c1c1f"/>
      <rect x="25.5" y="9.5" width="13" height="3.2" fill="#c0392b"/>
    </svg>`,
  },
  {
    id: 'chafer',
    name: 'Patrouille de Chafers',
    desc: '3 Chafers + 1 Chafer Royal. Fantassins squelettes disciplines.',
    available: true,
    homeMap: 'cimetiere',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="#000" opacity="0.35"/>
      <!-- lance -->
      <line x1="50" y1="58" x2="45" y2="6" stroke="#9c8f6e" stroke-width="3" stroke-linecap="round"/>
      <polygon points="45 6, 41 15, 49 15" fill="#eee6cf" stroke="#8a8268" stroke-width="1.2"/>
      <!-- cage thoracique -->
      <path d="M24 28 Q24 50 32 52 Q40 50 40 28 Z" fill="#ece5cf" stroke="#8a8268" stroke-width="1.6"/>
      <path d="M25 33 H39 M25 39 H39 M26 45 H38" stroke="#8a8268" stroke-width="1.6"/>
      <!-- epaulieres -->
      <circle cx="22" cy="29" r="5" fill="#3a4046" stroke="#23272c" stroke-width="1.4"/>
      <circle cx="42" cy="29" r="5" fill="#3a4046" stroke="#23272c" stroke-width="1.4"/>
      <!-- crane -->
      <circle cx="32" cy="19" r="12" fill="#ece5cf" stroke="#8a8268" stroke-width="1.6"/>
      <ellipse cx="27" cy="20" rx="3.4" ry="4.4" fill="#6fe6ff"/>
      <ellipse cx="37" cy="20" rx="3.4" ry="4.4" fill="#6fe6ff"/>
      <ellipse cx="27" cy="20" rx="5.5" ry="6.5" fill="#6fe6ff" opacity="0.25"/>
      <ellipse cx="37" cy="20" rx="5.5" ry="6.5" fill="#6fe6ff" opacity="0.25"/>
      <path d="M27 27 H37 M29 27 V31 M32 27 V31 M35 27 V31" stroke="#b8ad8e" stroke-width="1.5"/>
      <!-- casque a pointe -->
      <path d="M20 15 Q20 3 32 3 Q44 3 44 15 Q38 9 32 9 Q26 9 20 15 Z" fill="#3a4046" stroke="#23272c" stroke-width="1.6"/>
      <polygon points="30 3, 34 3, 32 -5" fill="#23272c"/>
    </svg>`,
  },
  {
    id: 'tofu',
    name: 'Volee de Tofus',
    desc: '3 Tofus + 1 Tofu Royal. Oiseaux rapides et impulsifs.',
    available: true,
    homeMap: 'falaise',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tofB" cx="42%" cy="32%" r="72%">
          <stop offset="0" stop-color="#fce886"/><stop offset="1" stop-color="#e0ad21"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="#000" opacity="0.35"/>
      <!-- pattes -->
      <path d="M24 52 v6 M21 58 h6 M40 52 v6 M37 58 h6" stroke="#d9762a" stroke-width="2.4" stroke-linecap="round"/>
      <!-- ailes -->
      <ellipse cx="11" cy="36" rx="7" ry="13" fill="#d29a22"/>
      <ellipse cx="53" cy="36" rx="7" ry="13" fill="#d29a22"/>
      <!-- corps rond -->
      <circle cx="32" cy="34" r="21" fill="url(#tofB)" stroke="#a8781a" stroke-width="2"/>
      <ellipse cx="32" cy="41" rx="12" ry="10" fill="#fdeea6"/>
      <!-- touffe -->
      <path d="M25 14 Q28 1 31 13 M31 13 Q33 -1 36 13 M36 13 Q39 3 40 16" fill="none" stroke="#d29a22" stroke-width="3.2" stroke-linecap="round"/>
      <!-- yeux geants -->
      <circle cx="24" cy="31" r="8.5" fill="#fff" stroke="#a8781a" stroke-width="1.5"/>
      <circle cx="40" cy="31" r="8.5" fill="#fff" stroke="#a8781a" stroke-width="1.5"/>
      <circle cx="25" cy="33" r="4.4" fill="#1a1a22"/>
      <circle cx="39" cy="33" r="4.4" fill="#1a1a22"/>
      <circle cx="27" cy="31" r="1.6" fill="#fff"/>
      <circle cx="41" cy="31" r="1.6" fill="#fff"/>
      <!-- bec -->
      <polygon points="32 37, 25 44, 39 44" fill="#ec7d2a" stroke="#a8551a" stroke-width="1.2"/>
      <line x1="25" y1="44" x2="39" y2="44" stroke="#a8551a" stroke-width="1.2"/>
    </svg>`,
  },
  {
    id: 'champignon',
    name: 'Colonie de Champignons',
    desc: '3 Champignons + 1 Champignon Royal. Empoisonnent a distance.',
    available: true,
    homeMap: 'marais',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chaC" cx="44%" cy="26%" r="78%">
          <stop offset="0" stop-color="#b04f44"/><stop offset="1" stop-color="#5f241f"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="#000" opacity="0.35"/>
      <!-- spores qui flottent -->
      <circle cx="11" cy="15" r="3" fill="#9be86a" opacity="0.9"/>
      <circle cx="53" cy="12" r="2.4" fill="#9be86a" opacity="0.9"/>
      <circle cx="49" cy="5" r="1.6" fill="#9be86a" opacity="0.85"/>
      <!-- pied -->
      <path d="M23 56 Q24 34 32 33 Q40 34 41 56 Z" fill="#ece1c4" stroke="#aa9f7c" stroke-width="2"/>
      <ellipse cx="32" cy="38" rx="9.5" ry="3.4" fill="#c8a98a"/>
      <circle cx="28" cy="45" r="2.3" fill="#16140f"/>
      <circle cx="36" cy="45" r="2.3" fill="#16140f"/>
      <path d="M29 50 Q32 53 35 50" stroke="#16140f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- chapeau bombe -->
      <path d="M6 35 Q32 0 58 35 Q32 41 6 35 Z" fill="url(#chaC)" stroke="#4a1c18" stroke-width="2"/>
      <ellipse cx="19" cy="27" rx="4.6" ry="3" fill="#f3ead2"/>
      <ellipse cx="34" cy="17" rx="5.4" ry="3.4" fill="#f3ead2"/>
      <ellipse cx="45" cy="28" rx="4" ry="2.6" fill="#f3ead2"/>
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
  constructor(onStart, audio) {
    this.onStart = onStart;
    this.audio = audio || null;
    this.selection = {
      classId: 'iop',
      combatId: 'bouftou',
      mapId: 'foret',
    };
    this.step = 0; // 0 = classe, 1 = combat, 2 = carte
    this.steps = [
      { key: 'classId', title: 'Choisis ton heros', options: CLASS_OPTIONS },
      { key: 'combatId', title: 'Choisis ton combat', options: COMBAT_OPTIONS },
      { key: 'mapId', title: 'Choisis ton terrain', options: MAP_OPTIONS },
    ];
    this.build();
  }

  build() {
    const css = document.createElement('style');
    css.textContent = `
      #menu-root {
        position: fixed; inset: 0;
        z-index: 60;
        display: flex; flex-direction: column;
        align-items: center; justify-content: flex-start;
        padding: 20px 16px;
        background: radial-gradient(circle at 50% 18%, #2a3320 0%, #11160a 60%, #060903 100%);
        color: #fff;
        font-family: "Trebuchet MS", "Helvetica Neue", sans-serif;
        overflow: auto;
      }
      #menu-root .menu-title {
        font-size: 44px; font-weight: bold;
        color: #f1c40f;
        text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        letter-spacing: 5px;
        margin: 8px 0 4px;
      }
      #menu-root .menu-subtitle {
        font-size: 14px; color: #d6d6c4;
        margin-bottom: 14px; text-align: center;
      }
      #menu-root .menu-prog {
        display: inline-flex; align-items: center; gap: 4px;
        background: rgba(0,0,0,0.4); border: 1px solid #444a66;
        border-radius: 20px; padding: 2px 12px; margin-left: 8px;
        font-weight: bold; color: #fff;
      }
      #menu-root .menu-prog svg { vertical-align: middle; }

      /* Indicateur d etapes */
      #menu-root .menu-steps {
        display: flex; gap: 14px; align-items: center;
        margin-bottom: 16px;
      }
      #menu-root .menu-stepitem {
        display: flex; align-items: center; gap: 7px;
        font-size: 12px; letter-spacing: 1px; color: #7a8092;
        text-transform: uppercase;
      }
      #menu-root .menu-stepitem.active { color: #f1c40f; font-weight: bold; }
      #menu-root .menu-stepitem.done { color: #2ecc71; }
      #menu-root .menu-dot {
        width: 22px; height: 22px; border-radius: 50%;
        background: #2a2f42; border: 2px solid #444a66;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: bold; color: #7a8092;
      }
      #menu-root .menu-stepitem.active .menu-dot {
        background: #f1c40f; border-color: #f1c40f; color: #14182a;
        box-shadow: 0 0 10px rgba(241,196,15,0.6);
      }
      #menu-root .menu-stepitem.done .menu-dot {
        background: #2ecc71; border-color: #2ecc71; color: #0c2a16;
      }

      /* Scene de selection */
      #menu-root .menu-stage {
        width: min(880px, 96vw);
        background: rgba(255,255,255,0.035);
        border: 2px solid #444a66;
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 14px;
      }
      #menu-root .menu-stage-title {
        font-size: 17px; color: #f1c40f; font-weight: bold;
        text-transform: uppercase; letter-spacing: 2px;
        margin-bottom: 12px; text-align: center;
      }
      #menu-root .menu-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }
      #menu-root .menu-option {
        position: relative;
        background: linear-gradient(180deg, #1f2536 0%, #161a28 100%);
        border: 2px solid #444a66;
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
        color: #fff;
        font-family: inherit;
        text-align: left;
        transition: transform 0.1s, border-color 0.15s, box-shadow 0.15s;
        overflow: hidden;
      }
      #menu-root .menu-option:hover:not(:disabled) {
        border-color: #f1c40f;
        transform: translateY(-3px);
      }
      #menu-root .menu-option.selected {
        border-color: #f1c40f;
        box-shadow: 0 0 16px rgba(241, 196, 15, 0.5);
        background: linear-gradient(180deg, #2c3043 0%, #1d2233 100%);
      }
      #menu-root .menu-option:disabled { opacity: 0.4; cursor: not-allowed; }
      #menu-root .menu-option .icon {
        width: 66px; height: 66px;
        margin-right: 12px;
        float: left;
      }
      #menu-root .menu-option .icon svg { width: 100%; height: 100%; }
      #menu-root .menu-option .opt-name {
        font-size: 16px; font-weight: bold; color: #f1c40f;
        padding-right: 30px;
      }
      #menu-root .menu-option .opt-desc {
        font-size: 12px; color: #c7c7bd; margin-top: 3px;
      }
      #menu-root .menu-option .opt-soon {
        position: absolute; bottom: 4px; right: 8px;
        font-size: 9px; color: #888; text-transform: uppercase;
      }
      #menu-root .menu-option .opt-star {
        position: absolute; top: 6px; right: 6px;
        width: 30px; height: 30px;
        filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7));
      }
      #menu-root .menu-option .opt-star.gold { animation: starGlow 1.6s ease-in-out infinite; }
      @keyframes starGlow {
        0%,100% { filter: drop-shadow(0 0 1px rgba(246,200,62,0.4)); }
        50% { filter: drop-shadow(0 0 7px rgba(246,200,62,0.9)); }
      }
      #menu-root .menu-option .opt-startag {
        position: absolute; bottom: 6px; right: 8px;
        font-size: 9px; font-weight: bold; letter-spacing: 0.5px;
      }

      /* Barre de navigation */
      #menu-root .menu-nav {
        display: flex; gap: 16px; align-items: center;
      }
      #menu-root .menu-navbtn {
        padding: 13px 34px; font-size: 16px; font-weight: bold;
        font-family: inherit; letter-spacing: 1px;
        background: #2c3548; border: 2px solid #6a7090; color: #fff;
        border-radius: 12px; cursor: pointer;
        transition: transform 0.1s, background 0.15s;
      }
      #menu-root .menu-navbtn:hover { transform: scale(1.04); }
      #menu-root .menu-navbtn.primary { background: #3a4a8a; border-color: #6678c4; }
      #menu-root .menu-navbtn.fight {
        background: linear-gradient(180deg, #2ecc71 0%, #145a32 100%);
        border-color: #145a32; letter-spacing: 3px; font-size: 18px;
        padding: 13px 46px;
      }

      /* Infobulle des options */
      .menu-tooltip {
        position: fixed;
        background: rgba(8, 10, 18, 0.96);
        color: #fff;
        border: 2px solid #f1c40f;
        border-radius: 10px;
        padding: 8px 12px;
        font-family: "Trebuchet MS", sans-serif;
        font-size: 13px;
        max-width: 250px;
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
        #menu-root .menu-title { font-size: 28px; letter-spacing: 3px; margin: 2px 0; }
        #menu-root .menu-subtitle { font-size: 11px; margin-bottom: 10px; }
        #menu-root .menu-steps { gap: 8px; margin-bottom: 10px; }
        #menu-root .menu-stepitem { font-size: 0; gap: 0; }
        #menu-root .menu-dot { width: 26px; height: 26px; font-size: 13px; }
        #menu-root .menu-stage {
          width: 100%; box-sizing: border-box; padding: 10px;
        }
        #menu-root .menu-stage-title { font-size: 14px; margin-bottom: 8px; }
        #menu-root .menu-options {
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: 7px;
        }
        #menu-root .menu-option {
          aspect-ratio: 1 / 1; padding: 6px 4px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        #menu-root .menu-option .icon {
          width: 54px; height: 54px; margin: 0 0 3px 0; float: none;
        }
        #menu-root .menu-option .opt-name { font-size: 11px; line-height: 1.1; padding: 0; }
        #menu-root .menu-option .opt-desc { display: none; }
        #menu-root .menu-option .opt-star { width: 22px; height: 22px; top: 2px; right: 2px; }
        #menu-root .menu-option .opt-startag { display: none; }
        #menu-root .menu-navbtn { padding: 11px 22px; font-size: 14px; }
        #menu-root .menu-navbtn.fight { padding: 11px 30px; font-size: 16px; }
      }
    `;
    document.head.appendChild(css);

    const root = document.createElement('div');
    root.id = 'menu-root';
    root.innerHTML = `
      <div class="menu-title">DOFUS 3D</div>
      <div class="menu-subtitle" id="menu-sub"></div>
      <div class="menu-steps" id="menu-steps"></div>
      <div class="menu-stage" id="menu-stage"></div>
      <div class="menu-nav">
        <button class="menu-navbtn" id="menu-back">Retour</button>
        <button class="menu-navbtn primary" id="menu-next">Suivant</button>
      </div>
    `;
    document.body.appendChild(root);
    this.root = root;
    this.subEl = root.querySelector('#menu-sub');
    this.stepsEl = root.querySelector('#menu-steps');
    this.stageEl = root.querySelector('#menu-stage');
    this.backBtn = root.querySelector('#menu-back');
    this.nextBtn = root.querySelector('#menu-next');

    const tip = document.createElement('div');
    tip.className = 'menu-tooltip';
    document.body.appendChild(tip);
    this.tooltipEl = tip;

    this.backBtn.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiClick');
      this.goBack();
    });
    this.nextBtn.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiClick');
      this.goNext();
    });

    this.renderStage();
  }

  // Bilan global des etoiles (toutes classes x tous combats).
  globalProgress() {
    let gold = 0, silver = 0;
    for (const cls of CLASS_OPTIONS) {
      for (const cmb of COMBAT_OPTIONS) {
        const s = getStar(cls.id, cmb.id);
        if (s === 'gold') gold++;
        else if (s === 'silver') silver++;
      }
    }
    return { gold, silver, total: CLASS_OPTIONS.length * COMBAT_OPTIONS.length };
  }

  goNext() {
    if (this.step < 2) {
      // En passant a l etape "terrain", on propose par defaut la carte
      // maison du monstre choisi (bonus etoile d or).
      if (this.step === 1) {
        const combat = COMBAT_OPTIONS.find(c => c.id === this.selection.combatId);
        if (combat && combat.homeMap) this.selection.mapId = combat.homeMap;
      }
      this.step++;
      this.renderStage();
    } else {
      this.hideOptionTooltip();
      this.onStart && this.onStart({ ...this.selection });
    }
  }

  goBack() {
    if (this.step > 0) {
      this.step--;
      this.renderStage();
    }
  }

  // (Re)dessine l etape courante.
  renderStage() {
    const step = this.steps[this.step];
    const prog = this.globalProgress();

    this.subEl.innerHTML = `Selection guidee &mdash; etape ${this.step + 1} sur 3
      <span class="menu-prog">${starSvg('gold', 16)}${prog.gold}
        &nbsp;${starSvg('silver', 16)}${prog.silver}
        &nbsp;<span style="color:#9aa">/ ${prog.total}</span></span>`;

    this.stepsEl.innerHTML = this.steps.map((s, i) => {
      const cls = i === this.step ? 'active' : (i < this.step ? 'done' : '');
      const labels = ['Heros', 'Combat', 'Terrain'];
      return `<div class="menu-stepitem ${cls}">
        <div class="menu-dot">${i < this.step ? '&#10003;' : (i + 1)}</div>${labels[i]}</div>`;
    }).join('');

    this.stageEl.innerHTML = `
      <div class="menu-stage-title">${step.title}</div>
      <div class="menu-options">
        ${step.options.map(o => this.renderOption(step.key, o)).join('')}
      </div>
    `;
    this.wireOptions();

    this.backBtn.style.visibility = this.step === 0 ? 'hidden' : 'visible';
    this.nextBtn.textContent = this.step === 2 ? 'COMBATTRE' : 'Suivant';
    this.nextBtn.classList.toggle('fight', this.step === 2);
    this.nextBtn.classList.toggle('primary', this.step !== 2);
  }

  renderOption(key, o) {
    const selected = o.id === this.selection[key] ? 'selected' : '';
    let badge = '';
    if (key === 'combatId') {
      // Etoile de progression : meilleure obtenue avec le heros choisi.
      const star = getStar(this.selection.classId, o.id);
      badge = `<div class="opt-star ${star || ''}">${starSvg(star || 'empty', 30)}</div>`;
    } else if (key === 'mapId') {
      // Etoile indicative : or sur la carte maison du monstre choisi.
      const combat = COMBAT_OPTIONS.find(c => c.id === this.selection.combatId);
      const home = !!(combat && combat.homeMap === o.id);
      badge = `<div class="opt-star ${home ? 'gold' : ''}">${starSvg(home ? 'gold' : 'silver', 30)}</div>
        <div class="opt-startag" style="color:${home ? '#f6c83e' : '#cfd8dd'}">${home ? 'BONUS OR' : 'bonus argent'}</div>`;
    }
    return `
      <button class="menu-option ${selected}" data-key="${key}" data-value="${o.id}"
              ${o.available ? '' : 'disabled'}>
        ${badge}
        <div class="icon">${o.icon}</div>
        <div class="opt-name">${o.name}</div>
        <div class="opt-desc">${o.desc}</div>
        ${o.available ? '' : '<div class="opt-soon">bientot</div>'}
      </button>
    `;
  }

  wireOptions() {
    this.stageEl.querySelectorAll('.menu-option').forEach(btn => {
      let lpTimer = null;
      let lpFired = false;

      btn.addEventListener('click', (e) => {
        if (lpFired) { lpFired = false; e.preventDefault(); return; }
        if (btn.disabled) return;
        this.audio && this.audio.sfx('uiSelect');
        const key = btn.dataset.key;
        this.selection[key] = btn.dataset.value;
        this.stageEl.querySelectorAll('.menu-option').forEach(b => {
          b.classList.toggle('selected', b.dataset.value === btn.dataset.value);
        });
      });
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.showOptionTooltip(btn);
      });
      btn.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.hideOptionTooltip();
      });
      btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        lpFired = false;
        clearTimeout(lpTimer);
        lpTimer = setTimeout(() => { lpFired = true; this.showOptionTooltip(btn); }, 450);
      });
      const cancelLp = () => { clearTimeout(lpTimer); lpTimer = null; };
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') cancelLp();
      });
      btn.addEventListener('pointercancel', () => { cancelLp(); if (lpFired) this.hideOptionTooltip(); });
      btn.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') return;
        cancelLp();
        if (lpFired) setTimeout(() => this.hideOptionTooltip(), 1500);
      });
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

  show() {
    if (!this.root) return;
    // On revient toujours a la 1re etape et on rafraichit les etoiles
    // (la progression a pu changer apres un combat).
    this.step = 0;
    this.renderStage();
    this.root.style.display = 'flex';
  }

  hide() {
    if (!this.root) return;
    this.hideOptionTooltip();
    this.root.style.display = 'none';
  }
}
