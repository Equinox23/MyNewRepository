// Portraits SVG des creatures du bestiaire Dofus.
// Style chibi : boules de laine, gros bec, monstre de pierre, scarabee.

const BOUFTOU = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="bouftouBody" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#fff3a0"/>
      <stop offset="0.7" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="32" ry="5" fill="#000" opacity="0.5"/>
  <!-- sabots -->
  <ellipse cx="30" cy="86" rx="6" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <ellipse cx="46" cy="88" rx="6" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <ellipse cx="62" cy="86" rx="6" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <!-- corps boule de laine masse -->
  <ellipse cx="48" cy="58" rx="38" ry="30" fill="url(#bouftouBody)" stroke="#5a3a07" stroke-width="3"/>
  <!-- bouclettes -->
  <circle cx="20" cy="44" r="8" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="28" cy="32" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="40" cy="26" r="8" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="56" cy="26" r="8" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="68" cy="32" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="76" cy="44" r="8" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="80" cy="58" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="76" cy="72" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="68" cy="80" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="16" cy="58" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="20" cy="72" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="28" cy="80" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="2"/>
  <!-- masque facial sombre -->
  <ellipse cx="48" cy="58" rx="20" ry="14" fill="#1a0d05" stroke="#000" stroke-width="2"/>
  <ellipse cx="48" cy="58" rx="18" ry="12" fill="#2c1a08"/>
  <!-- yeux furieux rouges -->
  <ellipse cx="40" cy="54" rx="5" ry="5.5" fill="#fff" stroke="#000" stroke-width="2"/>
  <ellipse cx="56" cy="54" rx="5" ry="5.5" fill="#fff" stroke="#000" stroke-width="2"/>
  <ellipse cx="40" cy="55" rx="3" ry="3.5" fill="#c0392b"/>
  <ellipse cx="56" cy="55" rx="3" ry="3.5" fill="#c0392b"/>
  <circle cx="40" cy="54" r="1.5" fill="#1a0d05"/>
  <circle cx="56" cy="54" r="1.5" fill="#1a0d05"/>
  <circle cx="41" cy="53" r="0.6" fill="#fff"/>
  <circle cx="57" cy="53" r="0.6" fill="#fff"/>
  <!-- sourcils en V mechant -->
  <path d="M32 46 L46 52" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M64 46 L50 52" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
  <!-- bouche / crocs zig zag -->
  <path d="M38 64 L42 70 L46 64 L50 70 L54 64 L58 70" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  <!-- cornes courbes ivoire -->
  <path d="M28 26 Q10 16 16 4 Q20 16 32 22 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M28 26 Q24 18 22 12" stroke="#7a5d0a" stroke-width="1.2" fill="none" opacity="0.5"/>
  <path d="M68 26 Q86 16 80 4 Q76 16 64 22 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M68 26 Q72 18 74 12" stroke="#7a5d0a" stroke-width="1.2" fill="none" opacity="0.5"/>
</svg>`;

const BOUFTOU_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="brBody" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#ffd779"/>
      <stop offset="0.6" stop-color="#e67e22"/>
      <stop offset="1" stop-color="#7c2d10"/>
    </radialGradient>
    <linearGradient id="brCrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff8dc"/>
      <stop offset="0.5" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="94" rx="36" ry="5" fill="#000" opacity="0.55"/>
  <ellipse cx="28" cy="88" rx="7" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <ellipse cx="48" cy="90" rx="7" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <ellipse cx="68" cy="88" rx="7" ry="5" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <!-- gros corps -->
  <ellipse cx="48" cy="58" rx="42" ry="33" fill="url(#brBody)" stroke="#4a1d05" stroke-width="3"/>
  <!-- bouclettes plus grosses -->
  <circle cx="16" cy="44" r="9" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="26" cy="30" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="38" cy="22" r="9" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="58" cy="22" r="9" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="70" cy="30" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="80" cy="44" r="9" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="84" cy="58" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="80" cy="74" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="70" cy="82" r="7" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="12" cy="58" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="16" cy="74" r="8" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <circle cx="26" cy="82" r="7" fill="#ffd779" stroke="#4a1d05" stroke-width="2"/>
  <!-- masque -->
  <ellipse cx="48" cy="58" rx="22" ry="15" fill="#1a0d05" stroke="#000" stroke-width="2"/>
  <ellipse cx="48" cy="58" rx="20" ry="13" fill="#2c1a08"/>
  <!-- yeux dores furieux -->
  <ellipse cx="40" cy="54" rx="6" ry="6" fill="#fff" stroke="#000" stroke-width="2"/>
  <ellipse cx="56" cy="54" rx="6" ry="6" fill="#000" stroke="#000" stroke-width="2"/>
  <ellipse cx="40" cy="54" rx="6" ry="6" fill="#fff" stroke="#000" stroke-width="2"/>
  <ellipse cx="56" cy="54" rx="6" ry="6" fill="#fff" stroke="#000" stroke-width="2"/>
  <ellipse cx="40" cy="55" rx="3.5" ry="4" fill="#f1c40f"/>
  <ellipse cx="56" cy="55" rx="3.5" ry="4" fill="#f1c40f"/>
  <circle cx="40" cy="54" r="2" fill="#1a0d05"/>
  <circle cx="56" cy="54" r="2" fill="#1a0d05"/>
  <circle cx="41" cy="53" r="0.8" fill="#fff"/>
  <circle cx="57" cy="53" r="0.8" fill="#fff"/>
  <!-- sourcils tres mechants -->
  <path d="M30 44 L46 52" stroke="#000" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 44 L50 52" stroke="#000" stroke-width="4" stroke-linecap="round"/>
  <!-- bouche / crocs -->
  <path d="M36 66 L40 72 L44 66 L48 72 L52 66 L56 72 L60 66" stroke="#fff" stroke-width="2.8" fill="none" stroke-linejoin="round"/>
  <!-- cornes immenses -->
  <path d="M24 26 Q2 12 12 -2 Q18 14 32 22 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M24 26 Q20 18 16 8" stroke="#7a5d0a" stroke-width="1.5" fill="none" opacity="0.6"/>
  <path d="M72 26 Q94 12 84 -2 Q78 14 64 22 Z" fill="#fdfefe" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M72 26 Q76 18 80 8" stroke="#7a5d0a" stroke-width="1.5" fill="none" opacity="0.6"/>
  <!-- couronne royale -->
  <path d="M34 14 L40 0 L46 12 L48 -4 L50 12 L56 0 L62 14 Z" fill="url(#brCrown)" stroke="#7a5d0a" stroke-width="2"/>
  <rect x="34" y="14" width="28" height="6" fill="#e67e22" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="48" cy="2" r="2" fill="#c0392b" stroke="#7a1a10" stroke-width="1"/>
  <circle cx="40" cy="6" r="1.5" fill="#3498db"/>
  <circle cx="56" cy="6" r="1.5" fill="#27ae60"/>
</svg>`;

const TOFU = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="tofuBody" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.7" stop-color="#ecf0f1"/>
      <stop offset="1" stop-color="#7f8c8d"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="4.5" fill="#000" opacity="0.5"/>
  <!-- pattes -->
  <line x1="40" y1="80" x2="36" y2="88" stroke="#f1c40f" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="56" y1="80" x2="60" y2="88" stroke="#f1c40f" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M30 86 L42 86 L40 92 L36 94 L32 92 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <path d="M54 86 L66 86 L64 92 L60 94 L56 92 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <line x1="36" y1="88" x2="36" y2="92" stroke="#7a5d0a" stroke-width="1"/>
  <line x1="60" y1="88" x2="60" y2="92" stroke="#7a5d0a" stroke-width="1"/>
  <!-- corps tres rond -->
  <ellipse cx="48" cy="48" rx="34" ry="34" fill="url(#tofuBody)" stroke="#5d6d7e" stroke-width="3"/>
  <!-- ailes -->
  <path d="M14 48 Q2 58 6 80 Q18 72 24 60 Q22 56 14 48 Z" fill="#ffffff" stroke="#5d6d7e" stroke-width="2.5"/>
  <path d="M18 60 Q22 70 22 76" stroke="#5d6d7e" stroke-width="1.2" fill="none"/>
  <path d="M82 48 Q94 58 90 80 Q78 72 72 60 Q74 56 82 48 Z" fill="#ffffff" stroke="#5d6d7e" stroke-width="2.5"/>
  <path d="M78 60 Q74 70 74 76" stroke="#5d6d7e" stroke-width="1.2" fill="none"/>
  <!-- houpette -->
  <path d="M40 18 Q36 4 48 8 Q52 12 56 8 Q60 4 56 18 Z" fill="#ecf0f1" stroke="#5d6d7e" stroke-width="2"/>
  <!-- gros yeux ronds -->
  <circle cx="34" cy="42" r="11" fill="#fff" stroke="#5d6d7e" stroke-width="2.5"/>
  <circle cx="62" cy="42" r="11" fill="#fff" stroke="#5d6d7e" stroke-width="2.5"/>
  <circle cx="34" cy="44" r="7" fill="#1a2530"/>
  <circle cx="62" cy="44" r="7" fill="#1a2530"/>
  <circle cx="36" cy="41" r="2.5" fill="#fff"/>
  <circle cx="64" cy="41" r="2.5" fill="#fff"/>
  <circle cx="32" cy="46" r="1.2" fill="#fff"/>
  <circle cx="60" cy="46" r="1.2" fill="#fff"/>
  <!-- joues rosees -->
  <circle cx="22" cy="56" r="4.5" fill="#ff9bbd" opacity="0.6"/>
  <circle cx="74" cy="56" r="4.5" fill="#ff9bbd" opacity="0.6"/>
  <!-- bec orange enorme -->
  <path d="M34 62 Q48 80 62 62 Q58 72 48 72 Q38 72 34 62 Z" fill="#f39c12" stroke="#7a4f0a" stroke-width="2.5"/>
  <path d="M40 64 Q48 76 56 64" stroke="#7a4f0a" stroke-width="1.5" fill="none"/>
  <line x1="48" y1="62" x2="48" y2="72" stroke="#7a4f0a" stroke-width="1.5"/>
  <ellipse cx="40" cy="66" rx="2" ry="1" fill="#fff" opacity="0.4"/>
</svg>`;

const TOFU_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="trBody" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#fff8dc"/>
      <stop offset="0.7" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </radialGradient>
    <linearGradient id="trCrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff8dc"/>
      <stop offset="0.5" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="94" rx="26" ry="5" fill="#000" opacity="0.55"/>
  <line x1="40" y1="82" x2="36" y2="90" stroke="#7a5d0a" stroke-width="4" stroke-linecap="round"/>
  <line x1="56" y1="82" x2="60" y2="90" stroke="#7a5d0a" stroke-width="4" stroke-linecap="round"/>
  <path d="M28 88 L44 88 L40 94 L36 96 L32 94 Z" fill="#f1c40f" stroke="#5a3a07" stroke-width="1.5"/>
  <path d="M52 88 L68 88 L64 94 L60 96 L56 94 Z" fill="#f1c40f" stroke="#5a3a07" stroke-width="1.5"/>
  <!-- corps -->
  <ellipse cx="48" cy="50" rx="36" ry="36" fill="url(#trBody)" stroke="#7a5d0a" stroke-width="3"/>
  <!-- ailes plus grandes -->
  <path d="M12 50 Q-2 62 4 86 Q18 76 26 62 Q22 56 12 50 Z" fill="#ffeb99" stroke="#7a5d0a" stroke-width="2.5"/>
  <path d="M16 60 Q22 72 22 80" stroke="#7a5d0a" stroke-width="1.2" fill="none"/>
  <path d="M84 50 Q98 62 92 86 Q78 76 70 62 Q74 56 84 50 Z" fill="#ffeb99" stroke="#7a5d0a" stroke-width="2.5"/>
  <path d="M80 60 Q74 72 74 80" stroke="#7a5d0a" stroke-width="1.2" fill="none"/>
  <!-- yeux -->
  <circle cx="34" cy="44" r="12" fill="#fff" stroke="#7a5d0a" stroke-width="2.5"/>
  <circle cx="62" cy="44" r="12" fill="#fff" stroke="#7a5d0a" stroke-width="2.5"/>
  <circle cx="34" cy="46" r="8" fill="#1a2530"/>
  <circle cx="62" cy="46" r="8" fill="#1a2530"/>
  <circle cx="36" cy="43" r="3" fill="#fff"/>
  <circle cx="64" cy="43" r="3" fill="#fff"/>
  <circle cx="32" cy="48" r="1.5" fill="#fff"/>
  <circle cx="60" cy="48" r="1.5" fill="#fff"/>
  <!-- joues -->
  <circle cx="20" cy="58" r="5" fill="#ff9bbd" opacity="0.6"/>
  <circle cx="76" cy="58" r="5" fill="#ff9bbd" opacity="0.6"/>
  <!-- bec dore -->
  <path d="M32 64 Q48 84 64 64 Q60 74 48 74 Q36 74 32 64 Z" fill="#e67e22" stroke="#7a4f0a" stroke-width="2.5"/>
  <path d="M38 66 Q48 78 58 66" stroke="#7a4f0a" stroke-width="1.5" fill="none"/>
  <line x1="48" y1="64" x2="48" y2="74" stroke="#7a4f0a" stroke-width="1.5"/>
  <ellipse cx="38" cy="68" rx="2.5" ry="1.2" fill="#fff" opacity="0.4"/>
  <!-- couronne -->
  <path d="M24 14 L30 -2 L38 12 L48 -8 L58 12 L66 -2 L72 14 Z" fill="url(#trCrown)" stroke="#7a5d0a" stroke-width="2.5"/>
  <rect x="24" y="14" width="48" height="7" fill="#e67e22" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="48" cy="-3" r="2.5" fill="#c0392b" stroke="#7a1a10" stroke-width="1"/>
  <circle cx="36" cy="5" r="2" fill="#3498db"/>
  <circle cx="60" cy="5" r="2" fill="#27ae60"/>
</svg>`;

const CRAQUELEUR = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craqBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c4a577"/>
      <stop offset="0.6" stop-color="#8a6d3b"/>
      <stop offset="1" stop-color="#3a2a18"/>
    </linearGradient>
    <radialGradient id="craqEye" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7c0"/>
      <stop offset="0.5" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="94" rx="34" ry="6" fill="#000" opacity="0.55"/>
  <!-- jambes massives -->
  <path d="M26 70 L42 70 L40 90 L28 90 Z" fill="#7a5d35" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M54 70 L70 70 L68 90 L56 90 Z" fill="#7a5d35" stroke="#1a0d05" stroke-width="2.5"/>
  <line x1="34" y1="72" x2="34" y2="88" stroke="#1a0d05" stroke-width="1.2"/>
  <line x1="62" y1="72" x2="62" y2="88" stroke="#1a0d05" stroke-width="1.2"/>
  <!-- corps bloc trapezoidal -->
  <path d="M14 24 L82 24 L86 76 L10 76 Z" fill="url(#craqBody)" stroke="#1a0d05" stroke-width="3"/>
  <!-- fissures profondes -->
  <path d="M22 30 L28 46 L20 60 L26 72" stroke="#1a0d05" stroke-width="2" fill="none"/>
  <path d="M70 30 Q66 42 72 56 L66 72" stroke="#1a0d05" stroke-width="2" fill="none"/>
  <path d="M48 70 L46 76" stroke="#1a0d05" stroke-width="1.5" fill="none"/>
  <path d="M40 28 L42 36" stroke="#1a0d05" stroke-width="1.2" fill="none"/>
  <path d="M56 28 L54 36" stroke="#1a0d05" stroke-width="1.2" fill="none"/>
  <!-- petites cailloux -->
  <circle cx="20" cy="40" r="2" fill="#5a3a18"/>
  <circle cx="76" cy="50" r="2" fill="#5a3a18"/>
  <circle cx="30" cy="66" r="1.5" fill="#5a3a18"/>
  <!-- bras -->
  <path d="M0 36 L14 36 L16 62 L2 62 Z" fill="#7a5d35" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M82 36 L96 36 L94 62 L80 62 Z" fill="#7a5d35" stroke="#1a0d05" stroke-width="2.5"/>
  <!-- poings rocheux -->
  <ellipse cx="8" cy="68" rx="11" ry="8" fill="#8a6d3b" stroke="#1a0d05" stroke-width="2.5"/>
  <ellipse cx="88" cy="68" rx="11" ry="8" fill="#8a6d3b" stroke="#1a0d05" stroke-width="2.5"/>
  <circle cx="5" cy="68" r="1.5" fill="#1a0d05" opacity="0.6"/>
  <circle cx="11" cy="72" r="1.5" fill="#1a0d05" opacity="0.6"/>
  <circle cx="85" cy="68" r="1.5" fill="#1a0d05" opacity="0.6"/>
  <circle cx="91" cy="72" r="1.5" fill="#1a0d05" opacity="0.6"/>
  <!-- yeux jaunes lumineux -->
  <ellipse cx="32" cy="42" rx="7" ry="6" fill="#1a0d05" stroke="#000" stroke-width="2"/>
  <ellipse cx="64" cy="42" rx="7" ry="6" fill="#1a0d05" stroke="#000" stroke-width="2"/>
  <ellipse cx="32" cy="42" rx="5" ry="4" fill="url(#craqEye)"/>
  <ellipse cx="64" cy="42" rx="5" ry="4" fill="url(#craqEye)"/>
  <circle cx="32" cy="42" r="2" fill="#e67e22"/>
  <circle cx="64" cy="42" r="2" fill="#e67e22"/>
  <circle cx="33" cy="41" r="0.7" fill="#fffac8"/>
  <circle cx="65" cy="41" r="0.7" fill="#fffac8"/>
  <!-- bouche taillee dents -->
  <rect x="34" y="56" width="28" height="8" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <polygon points="36,56 38,62 40,56" fill="#a98660"/>
  <polygon points="42,56 44,62 46,56" fill="#a98660"/>
  <polygon points="48,56 50,62 52,56" fill="#a98660"/>
  <polygon points="54,56 56,62 58,56" fill="#a98660"/>
  <!-- mousse / texture en haut -->
  <circle cx="20" cy="22" r="3" fill="#27ae60" opacity="0.7"/>
  <circle cx="80" cy="22" r="2.5" fill="#27ae60" opacity="0.7"/>
  <circle cx="48" cy="22" r="3" fill="#27ae60" opacity="0.7"/>
</svg>`;

const CRAQUELEUR_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="crqBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d4b591"/>
      <stop offset="0.6" stop-color="#a67c52"/>
      <stop offset="1" stop-color="#4a3318"/>
    </linearGradient>
    <linearGradient id="crqCrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dde2e6"/>
      <stop offset="1" stop-color="#7f8c8d"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="94" rx="38" ry="6" fill="#000" opacity="0.6"/>
  <path d="M24 70 L42 70 L40 92 L26 92 Z" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M54 70 L72 70 L70 92 L56 92 Z" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <line x1="33" y1="72" x2="33" y2="90" stroke="#1a0d05" stroke-width="1.5"/>
  <line x1="63" y1="72" x2="63" y2="90" stroke="#1a0d05" stroke-width="1.5"/>
  <!-- corps imposant -->
  <path d="M10 20 L86 20 L90 76 L6 76 Z" fill="url(#crqBody)" stroke="#1a0d05" stroke-width="3"/>
  <!-- fissures luminuses -->
  <path d="M20 28 L26 44 L18 60 L24 72" stroke="#1a0d05" stroke-width="2.5" fill="none"/>
  <path d="M72 28 Q68 42 74 56 L68 72" stroke="#1a0d05" stroke-width="2.5" fill="none"/>
  <path d="M48 68 L46 76" stroke="#f39c12" stroke-width="1.5" fill="none"/>
  <path d="M30 56 L34 64" stroke="#f39c12" stroke-width="1.5" fill="none" opacity="0.7"/>
  <path d="M64 56 L62 64" stroke="#f39c12" stroke-width="1.5" fill="none" opacity="0.7"/>
  <!-- bras massifs -->
  <path d="M-4 32 L12 32 L14 64 L-2 64 Z" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M84 32 L100 32 L98 64 L82 64 Z" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <ellipse cx="4" cy="70" rx="12" ry="9" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <ellipse cx="92" cy="70" rx="12" ry="9" fill="#a67c52" stroke="#1a0d05" stroke-width="2.5"/>
  <!-- yeux dores enormes -->
  <ellipse cx="32" cy="40" rx="8" ry="7" fill="#1a0d05" stroke="#000" stroke-width="2.5"/>
  <ellipse cx="64" cy="40" rx="8" ry="7" fill="#1a0d05" stroke="#000" stroke-width="2.5"/>
  <ellipse cx="32" cy="40" rx="6" ry="5" fill="#f1c40f"/>
  <ellipse cx="64" cy="40" rx="6" ry="5" fill="#f1c40f"/>
  <circle cx="32" cy="40" r="2.5" fill="#c0392b"/>
  <circle cx="64" cy="40" r="2.5" fill="#c0392b"/>
  <circle cx="33" cy="39" r="0.9" fill="#fffac8"/>
  <circle cx="65" cy="39" r="0.9" fill="#fffac8"/>
  <!-- bouche -->
  <rect x="32" y="54" width="32" height="10" fill="#1a0d05" stroke="#000" stroke-width="1.5"/>
  <polygon points="34,54 36,62 38,54" fill="#a98660"/>
  <polygon points="40,54 42,62 44,54" fill="#a98660"/>
  <polygon points="46,54 48,62 50,54" fill="#a98660"/>
  <polygon points="52,54 54,62 56,54" fill="#a98660"/>
  <polygon points="58,54 60,62 62,54" fill="#a98660"/>
  <!-- couronne de pierre -->
  <path d="M18 12 L24 -2 L32 10 L40 -6 L48 12 L56 -6 L64 10 L72 -2 L78 12 Z" fill="url(#crqCrown)" stroke="#2c3e50" stroke-width="2.5"/>
  <rect x="16" y="12" width="64" height="8" fill="#7f8c8d" stroke="#2c3e50" stroke-width="2.5"/>
  <circle cx="48" cy="0" r="3" fill="#c0392b" stroke="#7a1a10" stroke-width="1.5"/>
  <circle cx="32" cy="6" r="2.2" fill="#3498db"/>
  <circle cx="64" cy="6" r="2.2" fill="#27ae60"/>
</svg>`;

const SCARA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="scaraShell" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#d2b4de"/>
      <stop offset="0.5" stop-color="#9b59b6"/>
      <stop offset="1" stop-color="#4a235a"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="30" ry="5" fill="#000" opacity="0.5"/>
  <!-- pattes (6) -->
  <path d="M22 56 L4 60" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M22 68 L2 74" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M30 80 L24 92" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M74 56 L92 60" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M74 68 L94 74" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M66 80 L72 92" stroke="#1a0d05" stroke-width="3" stroke-linecap="round" fill="none"/>
  <circle cx="4" cy="60" r="2" fill="#1a0d05"/>
  <circle cx="2" cy="74" r="2" fill="#1a0d05"/>
  <circle cx="24" cy="92" r="2" fill="#1a0d05"/>
  <circle cx="92" cy="60" r="2" fill="#1a0d05"/>
  <circle cx="94" cy="74" r="2" fill="#1a0d05"/>
  <circle cx="72" cy="92" r="2" fill="#1a0d05"/>
  <!-- coque -->
  <ellipse cx="48" cy="62" rx="32" ry="28" fill="url(#scaraShell)" stroke="#1a0d05" stroke-width="3"/>
  <!-- separation coque verticale -->
  <line x1="48" y1="36" x2="48" y2="88" stroke="#1a0d05" stroke-width="3"/>
  <!-- reflets coque -->
  <ellipse cx="34" cy="50" rx="9" ry="6" fill="#e8daef" opacity="0.75"/>
  <ellipse cx="62" cy="50" rx="9" ry="6" fill="#e8daef" opacity="0.75"/>
  <ellipse cx="34" cy="68" rx="5" ry="3" fill="#d2b4de" opacity="0.5"/>
  <ellipse cx="62" cy="68" rx="5" ry="3" fill="#d2b4de" opacity="0.5"/>
  <!-- marbrures -->
  <path d="M36 78 Q40 80 38 84" stroke="#4a235a" stroke-width="1.2" fill="none" opacity="0.8"/>
  <path d="M60 78 Q56 80 58 84" stroke="#4a235a" stroke-width="1.2" fill="none" opacity="0.8"/>
  <!-- tete -->
  <ellipse cx="48" cy="30" rx="17" ry="13" fill="#5b2c6f" stroke="#1a0d05" stroke-width="2.5"/>
  <!-- antennes -->
  <path d="M36 22 Q28 6 34 0" stroke="#1a0d05" stroke-width="2.5" fill="none"/>
  <path d="M60 22 Q68 6 62 0" stroke="#1a0d05" stroke-width="2.5" fill="none"/>
  <circle cx="34" cy="0" r="3" fill="#9b59b6" stroke="#1a0d05" stroke-width="1.5"/>
  <circle cx="62" cy="0" r="3" fill="#9b59b6" stroke="#1a0d05" stroke-width="1.5"/>
  <!-- yeux composes -->
  <ellipse cx="40" cy="30" rx="5" ry="6" fill="#fff" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="56" cy="30" rx="5" ry="6" fill="#fff" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="40" cy="31" rx="3" ry="3.5" fill="#1a0d05"/>
  <ellipse cx="56" cy="31" rx="3" ry="3.5" fill="#1a0d05"/>
  <circle cx="41" cy="30" r="0.8" fill="#fff"/>
  <circle cx="57" cy="30" r="0.8" fill="#fff"/>
  <!-- mandibules -->
  <path d="M40 38 L36 46 L46 42 Z" fill="#1a0d05" stroke="#000" stroke-width="1"/>
  <path d="M56 38 L60 46 L50 42 Z" fill="#1a0d05" stroke="#000" stroke-width="1"/>
</svg>`;

const SCARA_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="srShell" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#f5b7b1"/>
      <stop offset="0.5" stop-color="#c0392b"/>
      <stop offset="1" stop-color="#581818"/>
    </radialGradient>
    <linearGradient id="srCrown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff8dc"/>
      <stop offset="0.5" stop-color="#f1c40f"/>
      <stop offset="1" stop-color="#7a5d0a"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="94" rx="32" ry="6" fill="#000" opacity="0.55"/>
  <path d="M20 56 L2 60" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M20 70 L0 76" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M28 82 L22 96" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M76 56 L94 60" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M76 70 L96 76" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M68 82 L74 96" stroke="#1a0d05" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="2" cy="60" r="2.5" fill="#1a0d05"/>
  <circle cx="0" cy="76" r="2.5" fill="#1a0d05"/>
  <circle cx="22" cy="96" r="2.5" fill="#1a0d05"/>
  <circle cx="94" cy="60" r="2.5" fill="#1a0d05"/>
  <circle cx="96" cy="76" r="2.5" fill="#1a0d05"/>
  <circle cx="74" cy="96" r="2.5" fill="#1a0d05"/>
  <!-- coque rouge -->
  <ellipse cx="48" cy="62" rx="34" ry="30" fill="url(#srShell)" stroke="#1a0d05" stroke-width="3"/>
  <line x1="48" y1="34" x2="48" y2="90" stroke="#1a0d05" stroke-width="3"/>
  <ellipse cx="34" cy="50" rx="10" ry="6" fill="#fadbd8" opacity="0.75"/>
  <ellipse cx="62" cy="50" rx="10" ry="6" fill="#fadbd8" opacity="0.75"/>
  <ellipse cx="34" cy="68" rx="5" ry="3" fill="#f5b7b1" opacity="0.6"/>
  <ellipse cx="62" cy="68" rx="5" ry="3" fill="#f5b7b1" opacity="0.6"/>
  <path d="M36 78 Q40 80 38 84" stroke="#7b241c" stroke-width="1.4" fill="none" opacity="0.8"/>
  <path d="M60 78 Q56 80 58 84" stroke="#7b241c" stroke-width="1.4" fill="none" opacity="0.8"/>
  <!-- tete -->
  <ellipse cx="48" cy="32" rx="18" ry="14" fill="#922b21" stroke="#1a0d05" stroke-width="2.5"/>
  <path d="M34 22 Q26 4 32 -2" stroke="#1a0d05" stroke-width="3" fill="none"/>
  <path d="M62 22 Q70 4 64 -2" stroke="#1a0d05" stroke-width="3" fill="none"/>
  <circle cx="32" cy="-2" r="3.5" fill="#c0392b" stroke="#1a0d05" stroke-width="1.5"/>
  <circle cx="64" cy="-2" r="3.5" fill="#c0392b" stroke="#1a0d05" stroke-width="1.5"/>
  <!-- yeux -->
  <ellipse cx="40" cy="32" rx="5.5" ry="6.5" fill="#fff" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="56" cy="32" rx="5.5" ry="6.5" fill="#fff" stroke="#1a0d05" stroke-width="2"/>
  <ellipse cx="40" cy="33" rx="3" ry="3.8" fill="#f1c40f"/>
  <ellipse cx="56" cy="33" rx="3" ry="3.8" fill="#f1c40f"/>
  <circle cx="40" cy="33" r="1.5" fill="#1a0d05"/>
  <circle cx="56" cy="33" r="1.5" fill="#1a0d05"/>
  <circle cx="41" cy="32" r="0.7" fill="#fff"/>
  <circle cx="57" cy="32" r="0.7" fill="#fff"/>
  <!-- mandibules grandes -->
  <path d="M38 40 L32 50 L46 44 Z" fill="#1a0d05" stroke="#000" stroke-width="1"/>
  <path d="M58 40 L64 50 L50 44 Z" fill="#1a0d05" stroke="#000" stroke-width="1"/>
  <!-- couronne -->
  <path d="M30 14 L36 -2 L42 12 L48 -6 L54 12 L60 -2 L66 14 Z" fill="url(#srCrown)" stroke="#7a5d0a" stroke-width="2.5"/>
  <rect x="30" y="14" width="36" height="7" fill="#e67e22" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="48" cy="-2" r="2.5" fill="#9b59b6" stroke="#5c2a6e" stroke-width="1.2"/>
</svg>`;

export const CREATURE_PORTRAITS = {
  bouftou: BOUFTOU,
  bouftouRoyal: BOUFTOU_ROYAL,
  tofu: TOFU,
  tofuRoyal: TOFU_ROYAL,
  craqueleur: CRAQUELEUR,
  craqueleurRoyal: CRAQUELEUR_ROYAL,
  scara: SCARA,
  scaraRoyal: SCARA_ROYAL,
};
