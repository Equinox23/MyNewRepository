// Menu de pre-combat : selection guidee, etape par etape
// (classe -> combat -> carte), avec etoiles de progression.
import { getBestTier } from './Progress.js';
import { MONSTER_FAMILIES, COMBAT_FAMILY, tierComposition, MAX_TIER } from './Bestiary.js';
import { DEFS } from './Fighter.js';
import { SPELLS, spellEffectLines } from './Spells.js';
import { getHero, heroSpells, upgradeSpell, resetSpellPoints, heroStats, xpToNext, scaledSpell, summonBonus, UPGRADE_COST, MAX_LEVEL } from './Leveling.js';
import { spellIconFrame } from './SpellIcons.js';
import { getAvatar, getPortrait } from './Avatars.js';
import { DUNGEONS, dungeonClears, dungeonUnlocked } from './Adventure.js';
import { getInventory, equippedItems, equippedList, equip, unequip, discard, wornBy, itemIcon, SLOTS, SLOT_LABEL, RARITY, statLines, flatTotals, setBonus, setCounts, statsDiff, withSwap, FAMILIES, FAMILY_ORDER } from './Items.js';
import { setEmblem } from './ItemArt.js';

// Icone d un monstre / boss : portrait 3D (repli : pastille vide).
function monsterIcon(id) {
  let url = null;
  try { url = getAvatar(id, 128); } catch (_) {}
  return url ? `<img class="hero-portrait" src="${url}" alt="">` : '';
}


// Icone d une classe : portrait 3D du modele (repli sur le SVG).
function classIcon(o) {
  let url = null;
  try { url = getPortrait(o.id, 128, equippedList(o.id)); } catch (_) {}
  return url ? `<img class="hero-portrait" src="${url}" alt="${o.name}">` : o.icon;
}

// Pre-calcule les portraits pendant que l ecran d accueil est affiche,
// un par tranche d inactivite, pour que l ecran de selection s ouvre net.
function warmPortraits() {
  const ids = CLASS_OPTIONS.map(o => o.id);
  const idle = window.requestIdleCallback || (cb => setTimeout(cb, 60));
  const next = () => {
    const id = ids.shift();
    if (!id) return;
    try { getPortrait(id, 128, equippedList(id)); } catch (_) {}
    idle(next);
  };
  idle(next);
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
  {
    id: 'pandawa',
    name: 'Pandawa',
    desc: 'Bambouseur fetard (8 PA, 4 PM, 110 PV). Coups puissants, vagues en zone et soins au lait de bambou.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="22" ry="3" fill="#000" opacity="0.4"/>
      <line x1="9" y1="52" x2="13" y2="12" stroke="#6aa84a" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="13" cy="12" rx="4" ry="2.4" fill="#4f8a32" transform="rotate(-35 13 12)"/>
      <ellipse cx="26" cy="55" rx="6.5" ry="4.5" fill="#262329"/>
      <ellipse cx="38" cy="55" rx="6.5" ry="4.5" fill="#262329"/>
      <rect x="19" y="33" width="26" height="22" rx="9" fill="#f1ede1" stroke="#3a3038" stroke-width="2"/>
      <ellipse cx="32" cy="46" rx="8" ry="9" fill="#fbf8ef"/>
      <circle cx="17" cy="40" r="6.5" fill="#262329"/>
      <circle cx="47" cy="40" r="6.5" fill="#262329"/>
      <rect x="40" y="38" width="16" height="19" rx="3" fill="#8a5a2b" stroke="#4a2f12" stroke-width="1.6" transform="rotate(14 48 47)"/>
      <line x1="41" y1="43" x2="56" y2="47" stroke="#b9893f" stroke-width="1.6" transform="rotate(14 48 47)"/>
      <line x1="40" y1="51" x2="55" y2="55" stroke="#b9893f" stroke-width="1.6" transform="rotate(14 48 47)"/>
      <circle cx="32" cy="20" r="15" fill="#f1ede1" stroke="#3a3038" stroke-width="2"/>
      <circle cx="20" cy="7" r="6.5" fill="#262329"/>
      <circle cx="44" cy="7" r="6.5" fill="#262329"/>
      <ellipse cx="26" cy="19" rx="4.6" ry="6.4" fill="#262329" transform="rotate(-22 26 19)"/>
      <ellipse cx="38" cy="19" rx="4.6" ry="6.4" fill="#262329" transform="rotate(22 38 19)"/>
      <circle cx="26" cy="19" r="2.1" fill="#fff"/>
      <circle cx="38" cy="19" r="2.1" fill="#fff"/>
      <ellipse cx="32" cy="26" rx="5.5" ry="4" fill="#fbf8ef"/>
      <circle cx="32" cy="24.5" r="1.8" fill="#16121a"/>
      <circle cx="22" cy="27" r="2.6" fill="#e88a8a" opacity="0.8"/>
      <circle cx="42" cy="27" r="2.6" fill="#e88a8a" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'eniripsa',
    name: 'Eniripsa',
    desc: 'Fee soigneuse (8 PA, 4 PM, 90 PV). Mots qui blessent, soignent, effraient et galvanisent.',
    available: true,
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="20" ry="3" fill="#000" opacity="0.4"/>
      <path d="M22 30 Q6 18 8 34 Q12 44 24 38 Z" fill="#c8f0ff" opacity="0.8" stroke="#4ab0d8" stroke-width="1.4"/>
      <path d="M42 30 Q58 18 56 34 Q52 44 40 38 Z" fill="#c8f0ff" opacity="0.8" stroke="#4ab0d8" stroke-width="1.4"/>
      <path d="M22 56 L26 36 L38 36 L42 56 Z" fill="#fdf6f8" stroke="#b8406a" stroke-width="1.6"/>
      <path d="M22 56 L42 56" stroke="#f05a9a" stroke-width="3"/>
      <rect x="25" y="32" width="14" height="8" rx="4" fill="#f05a9a"/>
      <line x1="48" y1="50" x2="52" y2="26" stroke="#f2c84a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M52 27 C47 23 48 18 51 19 C52 19 52 20 52.5 21 C53 20 53.5 19 54.5 19 C57 19 57 23 52 27 Z" fill="#f05a9a" stroke="#8a1a4a" stroke-width="1"/>
      <circle cx="32" cy="20" r="13" fill="#f8dcc0" stroke="#8a4a3a" stroke-width="1.6"/>
      <path d="M18 22 Q16 6 32 6 Q48 6 46 22 Q44 14 32 14 Q20 14 18 22 Z" fill="#ff7ab8" stroke="#b8406a" stroke-width="1.6"/>
      <ellipse cx="18" cy="24" rx="3.5" ry="7" fill="#ff7ab8"/>
      <ellipse cx="46" cy="24" rx="3.5" ry="7" fill="#ff7ab8"/>
      <ellipse cx="27" cy="21" rx="3" ry="3.8" fill="#fff" stroke="#2a1420" stroke-width="1"/>
      <ellipse cx="37" cy="21" rx="3" ry="3.8" fill="#fff" stroke="#2a1420" stroke-width="1"/>
      <circle cx="27.3" cy="21.6" r="2" fill="#3a8ae8"/><circle cx="37.3" cy="21.6" r="2" fill="#3a8ae8"/>
      <circle cx="27.8" cy="20.6" r="0.8" fill="#fff"/><circle cx="37.8" cy="20.6" r="0.8" fill="#fff"/>
      <path d="M29 27 Q32 29.5 35 27" stroke="#2a1420" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="26" r="2" fill="#ff9ab8" opacity="0.8"/><circle cx="42" cy="26" r="2" fill="#ff9ab8" opacity="0.8"/>
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
          <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfc8ba"/>
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
  {
    id: 'wabbit',
    name: 'Terrier des Wabbits',
    desc: '3 Wabbits + 1 Wa Wabbit. Lapins rapides : morsures et carottes lancees.',
    available: true,
    homeMap: 'foret',
    icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="#000" opacity="0.35"/>
      <ellipse cx="22" cy="14" rx="5" ry="13" fill="#e8e8ee" stroke="#5a5a6a" stroke-width="1.6" transform="rotate(-12 22 14)"/>
      <ellipse cx="22" cy="14" rx="2.4" ry="9" fill="#f5a0b8" transform="rotate(-12 22 14)"/>
      <ellipse cx="42" cy="14" rx="5" ry="13" fill="#e8e8ee" stroke="#5a5a6a" stroke-width="1.6" transform="rotate(14 42 14)"/>
      <ellipse cx="42" cy="14" rx="2.4" ry="9" fill="#f5a0b8" transform="rotate(14 42 14)"/>
      <ellipse cx="32" cy="48" rx="13" ry="11" fill="#e8e8ee" stroke="#5a5a6a" stroke-width="1.6"/>
      <circle cx="32" cy="32" r="13" fill="#e8e8ee" stroke="#5a5a6a" stroke-width="1.6"/>
      <ellipse cx="27" cy="30" rx="3" ry="3.8" fill="#fff" stroke="#2a1418" stroke-width="1"/>
      <ellipse cx="37" cy="30" rx="3" ry="3.8" fill="#fff" stroke="#2a1418" stroke-width="1"/>
      <circle cx="27" cy="30.6" r="2" fill="#d8403a"/><circle cx="37" cy="30.6" r="2" fill="#d8403a"/>
      <ellipse cx="32" cy="35.5" rx="2.2" ry="1.6" fill="#e8587a"/>
      <rect x="29.3" y="38" width="2.6" height="5" fill="#fff" stroke="#5a5a6a" stroke-width="0.8"/>
      <rect x="32.1" y="38" width="2.6" height="5" fill="#fff" stroke="#5a5a6a" stroke-width="0.8"/>
      <path d="M46 56 L54 36 L57 38 Z" fill="#f07a1a" stroke="#8a3a0a" stroke-width="1.2"/>
      <path d="M55 36 L52 29 M56 36 L58 29 M55.5 36 L55 28" stroke="#5aa832" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'craqueleurLegendaire', name: 'Grotte des Craqueleurs', boss: true,
    desc: 'BOSS - Golem de cristal : enracine ses cibles. Craint l eau, resiste a la terre.',
    available: true, homeMap: 'falaise',
    get icon() { return monsterIcon('craqueleurLegendaire'); },
  },
  {
    id: 'kwakwa', name: 'Canopee des Kwaks', boss: true,
    desc: 'BOSS - Change d element a chaque tour : tres resistant a son element, faible a l oppose.',
    available: true, homeMap: 'cascade',
    get icon() { return monsterIcon('kwakwa'); },
  },
  {
    id: 'minotoror', name: 'Labyrinthe du Minotoror', boss: true,
    desc: 'BOSS - Charge en ligne droite et tacle tres fort. Evite de rester aligne !',
    available: true, homeMap: 'cimetiere',
    get icon() { return monsterIcon('minotoror'); },
  },
];

const MAP_NAME = { foret: 'Foret', cascade: 'Cascade', cimetiere: 'Cimetiere', falaise: 'Falaise', marais: 'Marais' };

// Description des combats a partir du bestiaire (membres et niveaux, carte).
for (const o of COMBAT_OPTIONS) {
  const fam = MONSTER_FAMILIES[COMBAT_FAMILY[o.id]];
  if (!fam) continue;
  const members = [...new Set(fam.members)].map(id => `${DEFS[id].name} (niv. ${DEFS[id].level})`);
  o.desc = `${MAP_NAME[fam.map]} - ${members.join(', ')}.`;
  delete o.homeMap;
}

export class Menu {
  constructor(onStart, audio) {
    warmPortraits();
    this.onStart = onStart;
    this.audio = audio || null;
    this.mode = null;        // 'solo' | 'multi'
    this.view = 'home';      // 'home' | 'steps'
    this.selection = {
      classIds: ['iop'],
      combatId: 'bouftou',
      tier: 1,
    };
    this.step = 0; // 0 = classe(s), 1 = combat, 2 = niveau, 3 = carte
    this.normalSteps = [
      { key: 'class', label: 'Heros', title: 'Choisis ton heros', options: CLASS_OPTIONS },
      { key: 'combatId', label: 'Combat', title: 'Choisis ton combat', options: COMBAT_OPTIONS },
      { key: 'tier', label: 'Palier', title: 'Choisis le palier : nombre et composition du groupe', options: [] },
    ];
    this.adventureSteps = [
      { key: 'class', label: 'Heros', title: 'Choisis tes heros', options: CLASS_OPTIONS },
      { key: 'dungeon', label: 'Donjon', title: 'Choisis ton donjon', options: [] },
    ];
    this.steps = this.normalSteps;
    this.selection.dungeonId = DUNGEONS[0].id;
    this.invClass = 'iop';
    this.invSelected = null;
    this.grimoireClass = 'iop';
    this.build();
  }

  // Nombre max de heros selectionnables selon le mode.
  maxHeroes() { return this.mode === 'solo' ? 1 : 3; }

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
      #menu-root .menu-option .icon .hero-portrait {
        width: 100%; height: 100%; object-fit: contain; border-radius: 50%;
        background: radial-gradient(circle at 50% 40%, #4a5470 0%, #232838 75%);
        box-shadow: inset 0 0 0 2px rgba(241,196,15,0.45);
      }
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
      #menu-root .menu-option .opt-num {
        position: absolute; top: 6px; left: 6px;
        width: 22px; height: 22px; border-radius: 50%;
        background: #f1c40f; color: #14182a;
        font-size: 13px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.6);
      }

      /* Ecran d accueil : choix du mode */
      #menu-root .menu-modes {
        display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;
        padding: 10px 0;
      }
      #menu-root .menu-mode {
        width: 230px;
        background: linear-gradient(180deg, #1f2536 0%, #161a28 100%);
        border: 2px solid #444a66; border-radius: 16px;
        padding: 22px 16px; cursor: pointer; color: #fff;
        font-family: inherit; text-align: center;
        transition: transform 0.1s, border-color 0.15s, box-shadow 0.15s;
      }
      #menu-root .menu-mode:hover {
        border-color: #f1c40f; transform: translateY(-4px);
        box-shadow: 0 0 18px rgba(241, 196, 15, 0.4);
      }
      #menu-root .menu-mode .mm-icon { height: 72px; margin-bottom: 8px; }
      #menu-root .menu-mode .mm-icon svg { height: 100%; }
      #menu-root .menu-mode .mm-name {
        font-size: 19px; font-weight: bold; color: #f1c40f; margin-bottom: 4px;
      }
      #menu-root .menu-mode .mm-desc { font-size: 12px; color: #c7c7bd; line-height: 1.35; }
      @media (pointer: coarse), (max-width: 768px) {
        #menu-root .menu-mode { width: 30%; padding: 12px 6px; }
        #menu-root .menu-mode .mm-icon { height: 52px; }
        #menu-root .menu-mode .mm-name { font-size: 15px; }
        #menu-root .menu-mode .mm-desc { display: none; }
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
        <button class="menu-navbtn grimoire" id="menu-grimoire">Grimoire</button>
        <button class="menu-navbtn grimoire" id="menu-inventory">Inventaire</button>
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
    this.grimoireBtn = root.querySelector('#menu-grimoire');
    this.inventoryBtn = root.querySelector('#menu-inventory');
    this.inventoryBtn.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiClick');
      this.grimoireReturn = this.view;
      if (this.selection.classIds[0]) this.invClass = this.selection.classIds[0];
      this.view = 'inventory';
      this.render();
    });
    this.grimoireBtn.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiClick');
      this.grimoireReturn = this.view;
      if (this.selection.classIds[0]) this.grimoireClass = this.selection.classIds[0];
      this.view = 'grimoire';
      this.render();
    });

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

    this.render();
  }

  // Affiche soit l ecran d accueil (mode), soit la selection guidee.
  render() {
    if (this.view === 'home') this.renderHome();
    else if (this.view === 'grimoire') this.renderGrimoire();
    else if (this.view === 'inventory') this.renderInventory();
    else this.renderStage();
    if (this.inventoryBtn) {
      this.inventoryBtn.style.display = (this.view === 'home' || (this.view === 'steps' && this.step === 0)) ? '' : 'none';
    }
  }

  // Ecran d accueil : choix Solo / Multi.
  renderHome() {
    const soloIcon = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="11" fill="#f1c40f"/>
      <path d="M14 56 Q14 36 32 36 Q50 36 50 56 Z" fill="#f1c40f"/></svg>`;
    const multiIcon = `<svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="24" r="9" fill="#6678c4"/>
      <path d="M6 56 Q6 40 20 40 Q34 40 34 56 Z" fill="#6678c4"/>
      <circle cx="76" cy="24" r="9" fill="#6678c4"/>
      <path d="M62 56 Q62 40 76 40 Q90 40 90 56 Z" fill="#6678c4"/>
      <circle cx="48" cy="18" r="12" fill="#f1c40f"/>
      <path d="M30 58 Q30 36 48 36 Q66 36 66 58 Z" fill="#f1c40f"/></svg>`;
    const advIcon = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 58 V26 L32 8 L56 26 V58 Z" fill="#6a5a42" stroke="#241208" stroke-width="3"/>
      <path d="M22 58 V38 Q32 26 42 38 V58 Z" fill="#1a120a" stroke="#241208" stroke-width="3"/>
      <path d="M26 30 L32 14 L38 30" fill="#f1c40f" stroke="#241208" stroke-width="2"/>
      <circle cx="16" cy="36" r="3" fill="#ffb02a"/><circle cx="48" cy="36" r="3" fill="#ffb02a"/></svg>`;
    this.subEl.innerHTML = 'Choisis ton mode de jeu';
    this.stepsEl.innerHTML = '';
    this.stageEl.innerHTML = `
      <div class="menu-stage-title">Mode de jeu</div>
      <div class="menu-modes">
        <button class="menu-mode" data-mode="solo">
          <div class="mm-icon">${soloIcon}</div>
          <div class="mm-name">Mode Solo</div>
          <div class="mm-desc">Un seul heros a controler. Combat classique.</div>
        </button>
        <button class="menu-mode" data-mode="multi">
          <div class="mm-icon">${multiIcon}</div>
          <div class="mm-name">Mode Multi</div>
          <div class="mm-desc">Jusqu a 3 heros a controler. Les combats s etoffent en consequence.</div>
        </button>
        <button class="menu-mode adventure" data-mode="aventure">
          <div class="mm-icon">${advIcon}</div>
          <div class="mm-name">Aventure</div>
          <div class="mm-desc">Donjons : une suite de salles sans soin complet, un boss et son coffre au bout. 1 a 3 heros.</div>
        </button>
      </div>
    `;
    this.stageEl.querySelectorAll('.menu-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio && this.audio.sfx('uiSelect');
        this.mode = btn.dataset.mode;
        this.steps = this.mode === 'aventure' ? this.adventureSteps : this.normalSteps;
        if (this.mode === 'solo' && this.selection.classIds.length > 1) {
          this.selection.classIds = [this.selection.classIds[0]];
        }
        this.view = 'steps';
        this.step = 0;
        this.renderStage();
      });
    });
    this.backBtn.style.visibility = 'hidden';
    this.nextBtn.style.display = 'none';
    this.grimoireBtn.style.display = '';
  }


  goNext() {
    if (this.view !== 'steps') return;
    if (this.step < this.steps.length - 1) {
      // L etape "heros" exige au moins un personnage selectionne.
      if (this.step === 0 && this.selection.classIds.length === 0) {
        this.audio && this.audio.sfx('uiError');
        return;
      }
      // En passant a l etape "terrain", on propose par defaut la carte
      // maison du monstre choisi (bonus etoile d or).
      if (this.step === 1 && this.mode !== 'aventure') {
        // Palier propose : le plus haut debloque qui reste adapte au heros.
        this.selection.tier = this.recommendedTier();
      }
      this.step++;
      this.renderStage();
    } else if (this.mode === 'aventure') {
      this.hideOptionTooltip();
      this.onStart && this.onStart({
        playerClasses: this.selection.classIds.slice(),
        adventure: { dungeonId: this.selection.dungeonId },
      });
    } else {
      this.hideOptionTooltip();
      this.onStart && this.onStart({
        playerClasses: this.selection.classIds.slice(),
        combatId: this.selection.combatId,
        tier: this.selection.tier,
      });
    }
  }

  goBack() {
    if (this.view === 'grimoire' || this.view === 'inventory') {
      this.view = this.grimoireReturn || 'home';
      this.render();
      return;
    }
    if (this.step > 0) {
      this.step--;
      this.renderStage();
    } else {
      // Depuis la 1re etape, on revient a l ecran d accueil (choix du mode).
      this.view = 'home';
      this.render();
    }
  }

  // ---------- Paliers de monstres ----------
  heroLevelForTiers() {
    return Math.max(...this.selection.classIds.map(id => getHero(id).level), 1);
  }

  // Palier conseille : le plus haut debloque dont les monstres ne
  // depassent pas (en moyenne) le niveau du heros + 1.
  recommendedTier() {
    const best = getBestTier(this.selection.combatId);
    const lv = this.heroLevelForTiers();
    let rec = 1;
    for (let t = 1; t <= Math.min(best + 1, MAX_TIER); t++) {
      const comp = tierComposition(COMBAT_FAMILY[this.selection.combatId], t, this.selection.classIds.length);
      const avg = comp.reduce((a, id) => a + DEFS[id].level, 0) / comp.length;
      if (avg + (comp.length - 3) * 1.2 - lv <= 1) rec = t;
    }
    return rec;
  }

  tierOptions() {
    const best = getBestTier(this.selection.combatId);
    const rec = this.recommendedTier();
    const lv = this.heroLevelForTiers();
    const fam = COMBAT_FAMILY[this.selection.combatId];
    const opts = [];
    for (let t = 1; t <= MAX_TIER; t++) {
      const comp = tierComposition(fam, t, this.selection.classIds.length);
      const levels = comp.map(id => DEFS[id].level);
      const total = levels.reduce((a, b) => a + b, 0);
      const avg = total / comp.length;
      const diff = avg + (comp.length - 3) * 1.2 - lv;
      const color = diff <= -3 ? '#8fd0ff' : diff <= 1 ? '#9ad85a' : diff <= 4 ? '#ffcf5a' : '#ff6a5a';
      const label = diff <= -3 ? 'Facile' : diff <= 1 ? 'Adapte' : diff <= 4 ? 'Difficile' : 'Tres dur';
      const beaten = t <= best;
      // Resume de la composition : "2 x Bouftou (1), 1 x Chef de Guerre (4)".
      const counts = {};
      for (const id of comp) counts[id] = (counts[id] || 0) + 1;
      const compTxt = Object.entries(counts).map(([id, n]) => `${n} x ${DEFS[id].name} (${DEFS[id].level})`).join(', ');
      opts.push({
        id: 't' + t,
        name: `Palier ${t}`,
        desc: `${comp.length} monstres - ${label}${beaten ? ' - vaincu' : ''} : ${compTxt}`,
        faces: Object.keys(counts),
        available: t <= best + 1,
        lockedLabel: 'bats le palier precedent',
        recommended: t === rec,
        icon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 4 L56 14 L56 32 Q56 50 32 60 Q8 50 8 32 L8 14 Z" fill="${color}" stroke="#241208" stroke-width="3"/>
          <text x="32" y="42" font-size="26" font-weight="700" text-anchor="middle" fill="#241208" font-family="Fredoka, sans-serif">${t}</text>
          ${beaten ? '<circle cx="50" cy="12" r="9" fill="#6aa533" stroke="#241208" stroke-width="2"/><path d="M45 12 L49 16 L55 8" stroke="#fff" stroke-width="2.6" fill="none"/>' : ''}
        </svg>`,
      });
    }
    return opts;
  }

  // ---------- Donjons (mode Aventure) ----------
  dungeonOptions() {
    const lv = this.heroLevelForTiers();
    return DUNGEONS.map((d, i) => {
      const unlocked = dungeonUnlocked(i);
      const diff = d.level - lv;
      const label = diff <= -4 ? 'Facile' : diff <= 1 ? 'Adapte' : diff <= 4 ? 'Difficile' : 'Tres dur';
      return {
        id: d.id, name: d.name,
        desc: `Monstres niv. ${d.minLevel} a ${d.level} (${label}) - ${d.rooms.length} salles - boss : ${DEFS[d.boss].name} niv. ${d.level}. ${d.desc}`,
        available: unlocked, lockedLabel: 'termine le donjon precedent',
        clears: dungeonClears(d.id),
        get icon() { return monsterIcon(d.boss); },
      };
    });
  }

  // ---------- Inventaire : equipement des heros ----------
  renderInventory() {
    const cls = this.invClass;
    const hero = getHero(cls);
    const inv = getInventory();
    const eq = equippedItems(cls, inv);
    const worn = equippedList(cls, inv);
    const totals = flatTotals(worn);
    const counts = setCounts(worn);
    const heroName = DEFS[cls].name;
    this.subEl.innerHTML = 'Inventaire : equipe tes heros et complete tes panoplies';
    this.stepsEl.innerHTML = '';
    const tabs = CLASS_OPTIONS.map(o => `<button class="gr-tab ${o.id === cls ? 'active' : ''}" data-cls="${o.id}" title="${o.name}">
      <div class="gr-tab-icon">${classIcon(o)}</div><div class="gr-tab-lv">${getHero(o.id).level}</div></button>`).join('');
    // Apercu 3D du heros avec son equipement.
    let preview = '';
    try { preview = getAvatar(cls, 160, null, worn) || ''; } catch (_) {}
    const slots = SLOTS.map(sl => {
      const it = eq[sl];
      return `<button class="inv-slot ${it ? 'filled' : ''} ${this.invSelected && it && it.id === this.invSelected ? 'sel' : ''}" data-slot="${sl}" ${it ? `data-item="${it.id}"` : ''}>
        ${it ? itemIcon(it, 50) : `<div class="inv-empty">${SLOT_LABEL[sl]}</div>`}${it && hero.level < it.req ? `<div class="inv-lvl bad">Niv. ${it.req}</div>` : ''}</button>`;
    }).join('');
    const totLines = statsDiff({}, totals.flat).map(r => `<div>+${r.to} ${r.label}</div>`).join('') || 'Aucun';
    const setLines = totals.sets.map(st => `<div class="inv-setact">${setEmblem(st.family, 16)} ${FAMILIES[st.family].set} (${st.count}/5)${st.bonus.special ? ` <b>${st.bonus.special.name}</b>` : ''}</div>`).join('');

    // Detail + comparatif de l objet selectionne.
    const sel = this.invSelected && inv.items.find(i => i.id === this.invSelected);
    let detail = '<div class="inv-hint">Clique un objet pour voir ses statistiques et le comparer a ton equipement.</div>';
    if (sel) {
      const R = RARITY[sel.rarity];
      const w = wornBy(sel.id, inv);
      const cur = eq[sel.slot];
      const onMe = w === cls;
      let cmp = '';
      if (!onMe) {
        const rows = statsDiff(cur ? cur.stats : {}, sel.stats);
        const after = flatTotals(withSwap(cls, sel, inv));
        const tot = statsDiff(totals.flat, after.flat).filter(r => r.diff !== 0);
        const row = (r) => `<tr><td>${r.label}</td><td>${r.from || '-'}</td><td>${r.to || '-'}</td><td class="${r.diff > 0 ? 'up' : r.diff < 0 ? 'down' : ''}">${r.diff > 0 ? '+' : ''}${r.diff || '='}</td></tr>`;
        const specGain = after.specials.filter(x => !totals.specials.includes(x));
        const specLoss = totals.specials.filter(x => !after.specials.includes(x));
        const specName = (id) => { const f = Object.values(FAMILIES).find(ff => ff.special.id === id); return f ? f.special.name : id; };
        cmp = `<div class="inv-cmp">
          <div class="inv-tt">${cur ? `Comparaison avec ${cur.name} (${RARITY[cur.rarity].label})` : 'Emplacement vide'}</div>
          <table class="cmp-t"><tr><th>Objet</th><th>Equipe</th><th>Nouveau</th><th>Ecart</th></tr>${rows.map(row).join('')}</table>
          <div class="inv-tt" style="margin-top:6px">Total du heros (panoplies comprises)</div>
          ${tot.length ? `<table class="cmp-t"><tr><th>Stat</th><th>Avant</th><th>Apres</th><th>Ecart</th></tr>${tot.map(row).join('')}</table>` : '<div class="inv-hint">Aucun changement</div>'}
          ${specGain.map(x => `<div class="cmp-spec up">+ Effet ${specName(x)}</div>`).join('')}${specLoss.map(x => `<div class="cmp-spec down">- Effet ${specName(x)}</div>`).join('')}
        </div>`;
      }
      detail = `<div class="inv-detail">
        <div class="inv-dh">${itemIcon(sel, 60)}<div>
          <div class="inv-dname" style="color:${R.color}">${sel.name}</div>
          <div class="inv-dmeta">${R.label} - ${SLOT_LABEL[sel.slot]} - <span class="${hero.level < sel.req ? 'req-bad' : 'req-ok'}">niveau ${sel.req} requis</span> - ${FAMILIES[sel.family].set}${w ? ` - porte par ${DEFS[w] ? DEFS[w].name : w}` : ''}</div>
        </div></div>
        <div class="inv-dstats">${statLines(sel.stats).map(l => `<div>${l}</div>`).join('')}</div>
        ${hero.level < sel.req ? `<div class="req-warn">${heroName} est niveau ${hero.level} : cet objet demande le niveau ${sel.req}${wornBy(sel.id, inv) === cls ? ' (porte mais inactif)' : ''}.</div>` : ''}
        ${cmp}
        <div class="inv-dbtns">
          ${onMe ? `<button class="menu-navbtn" id="inv-unequip">Retirer</button>` : `<button class="menu-navbtn primary" id="inv-equip" ${hero.level < sel.req ? 'disabled' : ''}>${hero.level < sel.req ? `Niveau ${sel.req} requis` : `Equiper sur ${heroName}`}</button>`}
          <button class="menu-navbtn" id="inv-discard">Jeter</button>
        </div></div>`;
    }

    // Sac trie par panoplie, avec les bonus de chaque panoplie.
    const groups = FAMILY_ORDER.map(fam => {
      const items = inv.items.filter(i => i.family === fam)
        .sort((a, b) => (SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)) || (RARITY[b.rarity].rank - RARITY[a.rarity].rank));
      if (!items.length) return '';
      const F = FAMILIES[fam];
      const n = counts[fam] || 0;
      const tiers = [2, 3, 4, 5].map(k => {
        const bnz = setBonus(fam, k);
        const txt = statLines(bnz.stats).join(', ') + (bnz.special ? ` + <b>${bnz.special.name}</b> : ${bnz.special.desc}` : '');
        return `<div class="set-tier ${n >= k ? 'on' : ''}"><span>${k} obj.</span> ${txt}</div>`;
      }).join('');
      const open = this.invOpenSet === fam;
      return `<div class="inv-set">
        <button class="inv-set-h" data-set="${fam}">${setEmblem(fam, 24)}<b>${F.set}</b><span class="inv-set-lv">niv. ${F.level}</span>
          <span class="inv-set-n ${n ? 'on' : ''}">${n}/5 sur ${heroName}</span><span class="inv-set-more">${open ? 'masquer les bonus' : 'voir les bonus'}</span></button>
        ${open ? `<div class="set-tiers">${tiers}</div>` : ''}
        <div class="inv-bag">${items.map(it => {
          const ww = wornBy(it.id, inv);
          return `<button class="inv-item ${this.invSelected === it.id ? 'sel' : ''} ${hero.level < it.req ? 'locked' : ''}" data-item="${it.id}" title="${it.name} (${RARITY[it.rarity].label})">
            ${itemIcon(it, 48)}<div class="inv-lvl ${hero.level < it.req ? 'bad' : ''}">${it.req}</div>${ww ? `<div class="inv-worn">${DEFS[ww] ? DEFS[ww].name : ww}</div>` : ''}</button>`;
        }).join('')}</div>
      </div>`;
    }).join('') || '<div class="inv-none">Ton sac est vide : bats des monstres pour obtenir du butin !</div>';

    this.stageEl.innerHTML = `
      <div class="gr-tabs">${tabs}</div>
      <div class="inv-wrap">
        <div class="inv-left">
          <div class="inv-hero">${preview ? `<img class="inv-preview" src="${preview}" alt="">` : ''}<div><b>${heroName}</b><span>Niveau ${hero.level}</span></div></div>
          <div class="inv-slots">${slots}</div>
          <div class="inv-total"><div class="inv-tt">Bonus d equipement</div>${totLines}${setLines ? `<div class="inv-tt" style="margin-top:6px">Panoplies actives</div>${setLines}` : ''}</div>
        </div>
        <div class="inv-right">
          ${detail}
          <div class="inv-tt" style="margin-top:8px">Sac (${inv.items.length} objets) - trie par panoplie</div>
          ${groups}
        </div>
      </div>`;
    this.stageEl.querySelectorAll('.gr-tab').forEach(b => b.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiSelect');
      this.invClass = b.dataset.cls;
      this.renderInventory();
    }));
    this.stageEl.querySelectorAll('.inv-item, .inv-slot.filled').forEach(b => b.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiSelect');
      this.invSelected = b.dataset.item;
      this.renderInventory();
    }));
    this.stageEl.querySelectorAll('.inv-set-h').forEach(b => b.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiClick');
      this.invOpenSet = this.invOpenSet === b.dataset.set ? null : b.dataset.set;
      this.renderInventory();
    }));
    const eqBtn = this.stageEl.querySelector('#inv-equip');
    if (eqBtn) eqBtn.addEventListener('click', () => {
      const err = equip(cls, sel.id, hero.level);
      this.audio && this.audio.sfx(err ? 'uiError' : 'cast_boost');
      this.renderInventory();
    });
    const unBtn = this.stageEl.querySelector('#inv-unequip');
    if (unBtn) unBtn.addEventListener('click', () => {
      unequip(cls, sel.slot);
      this.audio && this.audio.sfx('uiClick');
      this.renderInventory();
    });
    const dBtn = this.stageEl.querySelector('#inv-discard');
    if (dBtn) dBtn.addEventListener('click', () => {
      discard(sel.id);
      this.invSelected = null;
      this.audio && this.audio.sfx('uiClick');
      this.renderInventory();
    });
    this.backBtn.style.visibility = 'visible';
    this.nextBtn.style.display = 'none';
    this.grimoireBtn.style.display = 'none';
  }

  // ---------- Grimoire : progression d un heros et de ses sorts ----------
  renderGrimoire() {
    const cls = this.grimoireClass;
    const def = DEFS[cls];
    const hero = getHero(cls);
    const st = heroStats(def, hero.level);
    const need = xpToNext(hero.level);
    const pct = hero.level >= MAX_LEVEL ? 100 : Math.round(hero.xp / need * 100);
    this.subEl.innerHTML = 'Grimoire : ameliore tes sorts avec tes points';
    this.stepsEl.innerHTML = '';
    const tabs = CLASS_OPTIONS.map(o => {
      const h = getHero(o.id);
      return `<button class="gr-tab ${o.id === cls ? 'active' : ''}" data-cls="${o.id}" title="${o.name}">
        <div class="gr-tab-icon">${classIcon(o)}</div><div class="gr-tab-lv">${h.level}</div>${h.points > 0 ? '<div class="gr-tab-dot"></div>' : ''}</button>`;
    }).join('');
    const spells = heroSpells(cls, def.spellIds).map(e => {
      const sp = e.spell;
      if (!sp) return '';
      const summon = sp.effects.find(x => x.type === 'summon');
      let icon = sp.paintedIcon || '';
      if (summon) {
        let av = null;
        try { av = getAvatar(summon.creatureId, 96); } catch (_) {}
        icon = spellIconFrame(sp) + (av ? `<img class="gr-summon" src="${av}" alt="">` : '');
      }
      const lvShown = Math.max(1, e.level);
      const cur = scaledSpell(sp, lvShown);
      const pips = [1, 2, 3].map(n => `<i class="${n <= e.level ? 'on' : ''}"></i>`).join('');
      const metaOf = (x) => {
        const r = x.range ? (x.range.max === 0 ? 'Soi-meme' : `Portee ${x.range.min}-${x.range.max}`) : '';
        return `${x.apCost} PA - ${r}${x.cooldown ? ` - Recharge ${x.cooldown}` : ''}`;
      };
      // Previsualisation des 3 paliers du sort (actuel en surbrillance).
      const tiers = [1, 2, 3].map(n => {
        const x = scaledSpell(sp, n);
        let extra = '';
        if (summon && DEFS[summon.creatureId]) {
          const cd = DEFS[summon.creatureId];
          const hs = heroStats(cd, hero.level);
          const sb = summonBonus(n);
          extra = `<div class="gr-tier-sum">${DEFS[summon.creatureId].name} : ${Math.round(hs.hp * sb.mult)} PV - ${cd.pa + sb.pa} PA - ${cd.pm + sb.pm} PM - degats +${Math.round((hs.damage * sb.mult - 1) * 100)}%</div>`;
        }
        const costTxt = n === 1 ? 'de base' : `${UPGRADE_COST[n - 1]} pt${UPGRADE_COST[n - 1] > 1 ? 's' : ''}`;
        const state = !e.unlocked ? 'future' : n < e.level ? 'past' : n === e.level ? 'current' : 'future';
        return `<div class="gr-tier ${state}">
          <div class="gr-tier-h">Niv. ${n}${state === 'current' ? ' <b>actuel</b>' : ''}<span>${costTxt}</span></div>
          <div class="gr-tier-meta">${metaOf(x)}</div>
          <div class="gr-tier-lines">${spellEffectLines(x).join('<br>')}</div>
          ${extra}
        </div>`;
      }).join('');
      let action;
      if (!e.unlocked) action = `<div class="gr-lock">Debloque au niveau ${e.unlockAt}</div>`;
      else if (e.level >= 3) action = `<div class="gr-max">Niveau max</div>`;
      else action = `<button class="gr-up" data-spell="${e.id}" ${e.canUpgrade ? '' : 'disabled'}>Ameliorer (${e.cost} pt${e.cost > 1 ? 's' : ''})</button>`;
      return `<div class="gr-spell ${e.unlocked ? '' : 'locked'}">
        <div class="gr-icon">${icon}</div>
        <div class="gr-body">
          <div class="gr-name">${sp.name} <span class="gr-pips">${pips}</span></div>
          <div class="gr-meta">${metaOf(cur)}</div>
          <div class="gr-desc">${sp.desc || ''}</div>
          <div class="gr-tiers">${tiers}</div>
        </div>
        <div class="gr-action">${action}</div>
      </div>`;
    }).join('');
    this.stageEl.innerHTML = `
      <div class="gr-tabs">${tabs}</div>
      <div class="gr-head">
        <div class="gr-title">${def.name} <span>${def.role}</span></div>
        <div class="gr-level">Niveau ${hero.level}${hero.level >= MAX_LEVEL ? ' (max)' : ''}</div>
        <div class="gr-xp"><div class="gr-xp-fill" style="width:${pct}%"></div></div>
        <div class="gr-xpnum">${hero.level >= MAX_LEVEL ? 'Niveau maximum' : `${hero.xp} / ${need} XP`}</div>
        <div class="gr-stats"><span>PV ${st.hp}</span><span>PA ${st.pa}</span><span>PM ${st.pm}</span><span>Degats +${Math.round((st.damage - 1) * 100)}%</span>
          <span class="gr-points">${hero.points} point${hero.points > 1 ? 's' : ''} de sort</span>
          <button class="gr-reset" id="gr-reset">Rendre les points</button></div>
      </div>
      <div class="gr-spells">${spells}</div>
      <div class="gr-help">Chaque niveau rapporte 1 point de sort (2 aux niveaux 5, 10, 15, 20). Ameliorer un sort : niveau 1 &rarr; 2 = 1 point, 2 &rarr; 3 = 2 points.</div>
    `;
    this.stageEl.querySelectorAll('.gr-tab').forEach(b => b.addEventListener('click', () => {
      this.audio && this.audio.sfx('uiSelect');
      this.grimoireClass = b.dataset.cls;
      this.renderGrimoire();
    }));
    this.stageEl.querySelectorAll('.gr-up').forEach(b => b.addEventListener('click', () => {
      if (upgradeSpell(cls, b.dataset.spell, def.spellIds)) {
        this.audio && this.audio.sfx('cast_boost');
      } else {
        this.audio && this.audio.sfx('uiError');
      }
      this.renderGrimoire();
    }));
    const reset = this.stageEl.querySelector('#gr-reset');
    if (reset) reset.addEventListener('click', () => {
      resetSpellPoints(cls);
      this.audio && this.audio.sfx('uiClick');
      this.renderGrimoire();
    });
    this.backBtn.style.visibility = 'visible';
    this.nextBtn.style.display = 'none';
    this.grimoireBtn.style.display = 'none';
  }

  // (Re)dessine l etape courante.
  renderStage() {
    const step = this.steps[this.step];

    if (step.key === 'tier') step.options = this.tierOptions();
    if (step.key === 'dungeon') step.options = this.dungeonOptions();
    this.subEl.innerHTML = `Selection guidee &mdash; etape ${this.step + 1} sur ${this.steps.length}`;

    this.stepsEl.innerHTML = this.steps.map((s, i) => {
      const cls = i === this.step ? 'active' : (i < this.step ? 'done' : '');
      return `<div class="menu-stepitem ${cls}">
        <div class="menu-dot">${i < this.step ? '&#10003;' : (i + 1)}</div>${s.label}</div>`;
    }).join('');

    let title = step.title;
    if (step.key === 'class') {
      title = this.mode !== 'solo'
        ? `Choisis tes heros (${this.selection.classIds.length}/3)`
        : 'Choisis ton heros';
    }
    this.stageEl.innerHTML = `
      <div class="menu-stage-title">${title}</div>
      <div class="menu-options">
        ${step.options.map(o => this.renderOption(step.key, o)).join('')}
      </div>
    `;
    this.wireOptions();

    // La 1re etape garde "Retour" : il ramene a l ecran d accueil.
    this.backBtn.style.visibility = 'visible';
    this.nextBtn.style.display = '';
    const last = this.step === this.steps.length - 1;
    this.nextBtn.textContent = last ? (this.mode === 'aventure' ? 'ENTRER' : 'COMBATTRE') : 'Suivant';
    this.nextBtn.classList.toggle('fight', last);
    this.nextBtn.classList.toggle('primary', !last);
    this.grimoireBtn.style.display = this.step === 0 ? '' : 'none';
  }

  renderOption(key, o) {
    let selected = '';
    let badge = '';
    if (key === 'class') {
      const idx = this.selection.classIds.indexOf(o.id);
      if (idx >= 0) {
        selected = 'selected';
        // En multi, un pastille numerotee indique l ordre de selection.
        if (this.mode !== 'solo') badge = `<div class="opt-num">${idx + 1}</div>`;
      }
      const hero = getHero(o.id);
      badge += `<div class="opt-lv">Niv. ${hero.level}${hero.points > 0 ? ` <span class="opt-pts">+${hero.points}</span>` : ''}</div>`;
    } else if (key === 'dungeon') {
      if (o.id === this.selection.dungeonId) selected = 'selected';
      if (o.clears) badge = `<div class="opt-startag" style="color:#9ad85a">TERMINE x${o.clears}</div>`;
    } else if (key === 'tier') {
      if (o.id === 't' + this.selection.tier) selected = 'selected';
      if (o.recommended) badge = '<div class="opt-startag" style="color:#9ad85a">CONSEILLE</div>';
    } else if (key === 'combatId') {
      if (o.id === this.selection.combatId) selected = 'selected';
      // Etoile de progression : meilleure obtenue avec le 1er heros choisi.
      // Meilleur palier vaincu sur ce combat.
      const bt = getBestTier(o.id);
      badge = `<div class="opt-tierbadge ${bt ? 'on' : ''}">${bt ? `Palier ${bt}/10` : 'Nouveau'}</div>`;
    }
    return `
      <button class="menu-option ${selected}" data-key="${key}" data-value="${o.id}"
              ${o.available ? '' : 'disabled'}>
        ${badge}
        <div class="icon">${key === 'class' ? classIcon(o) : o.icon}</div>
        <div class="opt-name">${o.name}</div>
        <div class="opt-desc">${o.desc}</div>
        ${o.faces ? `<div class="opt-faces">${o.faces.map(id => { let u = null; try { u = getAvatar(id, 96); } catch (_) {} return u ? `<img src="${u}" title="${DEFS[id].name}">` : ''; }).join('')}</div>` : ''}
        ${o.available ? '' : `<div class="opt-soon">${o.lockedLabel || 'bientot'}</div>`}
      </button>
    `;
  }

  // Ajoute / retire un heros de la selection (mode multi : 1 a 3).
  _toggleClass(id) {
    if (this.maxHeroes() === 1) {
      this.selection.classIds = [id];
      this.audio && this.audio.sfx('uiSelect');
      return;
    }
    const ids = this.selection.classIds;
    const idx = ids.indexOf(id);
    if (idx >= 0) {
      if (ids.length > 1) {
        ids.splice(idx, 1);
        this.audio && this.audio.sfx('uiClick');
      } else {
        this.audio && this.audio.sfx('uiError'); // au moins 1 heros
      }
    } else if (ids.length < 3) {
      ids.push(id);
      this.audio && this.audio.sfx('uiSelect');
    } else {
      this.audio && this.audio.sfx('uiError'); // 3 heros maximum
    }
  }

  wireOptions() {
    this.stageEl.querySelectorAll('.menu-option').forEach(btn => {
      let lpTimer = null;
      let lpFired = false;

      btn.addEventListener('click', (e) => {
        if (lpFired) { lpFired = false; e.preventDefault(); return; }
        if (btn.disabled) return;
        const key = btn.dataset.key;
        const value = btn.dataset.value;
        if (key === 'class') {
          this._toggleClass(value);
        } else if (key === 'tier') {
          this.audio && this.audio.sfx('uiSelect');
          this.selection.tier = parseInt(value.slice(1), 10);
        } else if (key === 'dungeon') {
          this.audio && this.audio.sfx('uiSelect');
          this.selection.dungeonId = value;
        } else {
          this.audio && this.audio.sfx('uiSelect');
          this.selection[key] = value;
        }
        // On redessine l etape : met a jour les selections, le compteur
        // de heros et les etoiles dependant du choix.
        this.hideOptionTooltip();
        this.renderStage();
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
    // On revient toujours a l ecran d accueil (choix du mode) et on
    // rafraichit les etoiles (la progression a pu changer apres un combat).
    this.view = 'home';
    this.step = 0;
    document.body.classList.add('in-menu');
    this.render();
    this.root.style.display = 'flex';
  }

  hide() {
    if (!this.root) return;
    this.hideOptionTooltip();
    this.root.style.display = 'none';
    document.body.classList.remove('in-menu');
  }
}
