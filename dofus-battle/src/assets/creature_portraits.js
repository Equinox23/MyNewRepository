// Portraits SVG des creatures du bestiaire Dofus.
// Style chibi : grosses tetes / corps ronds, gros yeux, contours marques.

const BOUFTOU = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="bouftouBody" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#fff3a0"/>
      <stop offset="1" stop-color="#d4ac0d"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="30" ry="5" fill="#000" opacity="0.45"/>
  <!-- sabots -->
  <ellipse cx="32" cy="86" rx="5" ry="4" fill="#1a0d05"/>
  <ellipse cx="46" cy="88" rx="5" ry="4" fill="#1a0d05"/>
  <ellipse cx="60" cy="86" rx="5" ry="4" fill="#1a0d05"/>
  <!-- corps boule de laine -->
  <ellipse cx="48" cy="58" rx="34" ry="28" fill="url(#bouftouBody)" stroke="#7a5d0a" stroke-width="2.5"/>
  <!-- bouclettes -->
  <circle cx="22" cy="46" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="30" cy="36" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="44" cy="30" r="7" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="58" cy="32" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="70" cy="40" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="78" cy="54" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="74" cy="68" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="20" cy="64" r="6" fill="#fff3a0" stroke="#7a5d0a" stroke-width="1.5"/>
  <!-- masque facial sombre -->
  <ellipse cx="48" cy="58" rx="18" ry="13" fill="#2c1a08" stroke="#1a0d05" stroke-width="1.5"/>
  <!-- yeux furieux -->
  <ellipse cx="40" cy="56" rx="3.5" ry="4" fill="#e74c3c"/>
  <ellipse cx="56" cy="56" rx="3.5" ry="4" fill="#e74c3c"/>
  <ellipse cx="40" cy="55" rx="1.2" ry="1.5" fill="#fff"/>
  <ellipse cx="56" cy="55" rx="1.2" ry="1.5" fill="#fff"/>
  <!-- sourcils mechants -->
  <path d="M34 48 L44 52" stroke="#1a0d05" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M62 48 L52 52" stroke="#1a0d05" stroke-width="2.5" stroke-linecap="round"/>
  <!-- bouche / crocs -->
  <path d="M42 64 L46 68 L48 64 L50 68 L54 64" stroke="#fff" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <!-- cornes courbes -->
  <path d="M30 30 Q14 18 22 8 Q24 18 34 24 Z" fill="#ecf0f1" stroke="#2c1a08" stroke-width="2"/>
  <path d="M66 30 Q82 18 74 8 Q72 18 62 24 Z" fill="#ecf0f1" stroke="#2c1a08" stroke-width="2"/>
</svg>`;

const BOUFTOU_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="bouftouRBody" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#ffcc66"/>
      <stop offset="1" stop-color="#b9770e"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="32" ry="5" fill="#000" opacity="0.5"/>
  <ellipse cx="30" cy="88" rx="6" ry="4" fill="#1a0d05"/>
  <ellipse cx="48" cy="90" rx="6" ry="4" fill="#1a0d05"/>
  <ellipse cx="64" cy="88" rx="6" ry="4" fill="#1a0d05"/>
  <ellipse cx="48" cy="60" rx="36" ry="30" fill="url(#bouftouRBody)" stroke="#5a3a07" stroke-width="3"/>
  <circle cx="20" cy="46" r="8" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="30" cy="34" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="46" cy="28" r="8" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="60" cy="32" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="72" cy="40" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="80" cy="56" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="76" cy="70" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <circle cx="16" cy="64" r="7" fill="#ffd779" stroke="#5a3a07" stroke-width="1.5"/>
  <ellipse cx="48" cy="58" rx="20" ry="14" fill="#2c1a08" stroke="#1a0d05" stroke-width="1.5"/>
  <ellipse cx="40" cy="56" rx="4" ry="4.5" fill="#f1c40f"/>
  <ellipse cx="56" cy="56" rx="4" ry="4.5" fill="#f1c40f"/>
  <ellipse cx="40" cy="55" rx="1.4" ry="1.6" fill="#fff"/>
  <ellipse cx="56" cy="55" rx="1.4" ry="1.6" fill="#fff"/>
  <path d="M32 46 L44 52" stroke="#1a0d05" stroke-width="3" stroke-linecap="round"/>
  <path d="M64 46 L52 52" stroke="#1a0d05" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 66 L44 70 L48 66 L52 70 L56 66" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
  <!-- grandes cornes -->
  <path d="M26 28 Q8 14 18 4 Q20 16 32 22 Z" fill="#fdfefe" stroke="#2c1a08" stroke-width="2"/>
  <path d="M70 28 Q88 14 78 4 Q76 16 64 22 Z" fill="#fdfefe" stroke="#2c1a08" stroke-width="2"/>
  <!-- couronne -->
  <path d="M36 16 L40 6 L44 12 L48 4 L52 12 L56 6 L60 16 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1.5"/>
  <rect x="36" y="16" width="24" height="4" fill="#f39c12" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="48" cy="8" r="1.5" fill="#e74c3c"/>
</svg>`;

const TOFU = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="tofuBody" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#bdc3c7"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="90" rx="22" ry="4" fill="#000" opacity="0.4"/>
  <!-- pattes -->
  <line x1="40" y1="80" x2="36" y2="88" stroke="#f1c40f" stroke-width="3" stroke-linecap="round"/>
  <line x1="56" y1="80" x2="60" y2="88" stroke="#f1c40f" stroke-width="3" stroke-linecap="round"/>
  <polygon points="30,86 42,86 36,92" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <polygon points="54,86 66,86 60,92" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <!-- corps boule -->
  <ellipse cx="48" cy="50" rx="30" ry="30" fill="url(#tofuBody)" stroke="#7f8c8d" stroke-width="2.5"/>
  <!-- ailes -->
  <path d="M20 50 Q10 60 14 76 Q22 70 26 60 Z" fill="#ffffff" stroke="#7f8c8d" stroke-width="2"/>
  <path d="M76 50 Q86 60 82 76 Q74 70 70 60 Z" fill="#ffffff" stroke="#7f8c8d" stroke-width="2"/>
  <!-- houpette -->
  <path d="M44 22 Q40 12 50 14 Q52 18 56 14 Q60 12 56 22 Z" fill="#ecf0f1" stroke="#7f8c8d" stroke-width="1.5"/>
  <!-- gros yeux -->
  <circle cx="36" cy="42" r="9" fill="#fff" stroke="#7f8c8d" stroke-width="2"/>
  <circle cx="60" cy="42" r="9" fill="#fff" stroke="#7f8c8d" stroke-width="2"/>
  <circle cx="36" cy="44" r="5" fill="#2c3e50"/>
  <circle cx="60" cy="44" r="5" fill="#2c3e50"/>
  <circle cx="37" cy="42" r="2" fill="#fff"/>
  <circle cx="61" cy="42" r="2" fill="#fff"/>
  <!-- bec orange -->
  <path d="M38 60 Q48 74 58 60 Q56 68 48 68 Q40 68 38 60 Z" fill="#f39c12" stroke="#7a4f0a" stroke-width="2"/>
  <line x1="48" y1="60" x2="48" y2="68" stroke="#7a4f0a" stroke-width="1.5"/>
</svg>`;

const TOFU_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="tofuRBody" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#fff8dc"/>
      <stop offset="1" stop-color="#d4a017"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="24" ry="5" fill="#000" opacity="0.45"/>
  <line x1="40" y1="82" x2="36" y2="90" stroke="#7a5d0a" stroke-width="3" stroke-linecap="round"/>
  <line x1="56" y1="82" x2="60" y2="90" stroke="#7a5d0a" stroke-width="3" stroke-linecap="round"/>
  <polygon points="28,88 44,88 36,94" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <polygon points="52,88 68,88 60,94" fill="#f1c40f" stroke="#7a5d0a" stroke-width="1"/>
  <ellipse cx="48" cy="52" rx="32" ry="32" fill="url(#tofuRBody)" stroke="#7a5d0a" stroke-width="3"/>
  <path d="M18 52 Q6 62 10 80 Q20 72 24 62 Z" fill="#ffeb99" stroke="#7a5d0a" stroke-width="2"/>
  <path d="M78 52 Q90 62 86 80 Q76 72 72 62 Z" fill="#ffeb99" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="36" cy="44" r="10" fill="#fff" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="60" cy="44" r="10" fill="#fff" stroke="#7a5d0a" stroke-width="2"/>
  <circle cx="36" cy="46" r="6" fill="#2c3e50"/>
  <circle cx="60" cy="46" r="6" fill="#2c3e50"/>
  <circle cx="37" cy="44" r="2" fill="#fff"/>
  <circle cx="61" cy="44" r="2" fill="#fff"/>
  <path d="M36 62 Q48 78 60 62 Q58 70 48 70 Q38 70 36 62 Z" fill="#e67e22" stroke="#7a4f0a" stroke-width="2"/>
  <line x1="48" y1="62" x2="48" y2="70" stroke="#7a4f0a" stroke-width="1.5"/>
  <!-- couronne -->
  <path d="M30 22 L34 8 L40 18 L48 4 L56 18 L62 8 L66 22 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="2"/>
  <rect x="30" y="22" width="36" height="5" fill="#d4a017" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="48" cy="10" r="2" fill="#e74c3c"/>
  <circle cx="38" cy="14" r="1.5" fill="#3498db"/>
  <circle cx="58" cy="14" r="1.5" fill="#3498db"/>
</svg>`;

const CRAQUELEUR = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craqBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a98660"/>
      <stop offset="1" stop-color="#5a3a18"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="32" ry="5" fill="#000" opacity="0.5"/>
  <!-- jambes -->
  <rect x="28" y="74" width="14" height="16" rx="2" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <rect x="54" y="74" width="14" height="16" rx="2" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <!-- corps massif -->
  <path d="M18 28 L78 28 L82 76 L14 76 Z" fill="url(#craqBody)" stroke="#2c1a08" stroke-width="3"/>
  <!-- fissures (large) -->
  <path d="M26 34 L32 50 L26 62 L30 74" stroke="#2c1a08" stroke-width="1.6" fill="none"/>
  <path d="M58 34 L52 46 L60 56 L52 68 L58 76" stroke="#2c1a08" stroke-width="1.6" fill="none"/>
  <path d="M68 38 L70 60 L66 74" stroke="#2c1a08" stroke-width="1.4" fill="none"/>
  <!-- bras -->
  <rect x="4" y="38" width="14" height="22" rx="3" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <rect x="78" y="38" width="14" height="22" rx="3" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <ellipse cx="11" cy="62" rx="9" ry="6" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <ellipse cx="85" cy="62" rx="9" ry="6" fill="#7a5d35" stroke="#2c1a08" stroke-width="2"/>
  <!-- yeux lumineux -->
  <ellipse cx="34" cy="44" rx="5" ry="4" fill="#fff7c0" stroke="#7a5d0a" stroke-width="1.5"/>
  <ellipse cx="62" cy="44" rx="5" ry="4" fill="#fff7c0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="34" cy="44" r="2" fill="#f1c40f"/>
  <circle cx="62" cy="44" r="2" fill="#f1c40f"/>
  <!-- bouche taillee -->
  <rect x="38" y="58" width="20" height="6" fill="#1a0d05" stroke="#2c1a08" stroke-width="1"/>
  <line x1="42" y1="58" x2="42" y2="64" stroke="#7a5d35" stroke-width="1"/>
  <line x1="48" y1="58" x2="48" y2="64" stroke="#7a5d35" stroke-width="1"/>
  <line x1="54" y1="58" x2="54" y2="64" stroke="#7a5d35" stroke-width="1"/>
</svg>`;

const CRAQUELEUR_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="craqRBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c8a070"/>
      <stop offset="1" stop-color="#6b4d2b"/>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="34" ry="6" fill="#000" opacity="0.55"/>
  <rect x="26" y="74" width="16" height="16" rx="2" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <rect x="54" y="74" width="16" height="16" rx="2" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <path d="M14 26 L82 26 L86 76 L10 76 Z" fill="url(#craqRBody)" stroke="#2c1a08" stroke-width="3"/>
  <path d="M22 32 L30 50 L22 64 L28 74" stroke="#2c1a08" stroke-width="2" fill="none"/>
  <path d="M62 32 L54 46 L62 58 L54 72" stroke="#2c1a08" stroke-width="2" fill="none"/>
  <path d="M70 36 L72 60 L68 74" stroke="#2c1a08" stroke-width="1.6" fill="none"/>
  <!-- bras puissants -->
  <rect x="0" y="38" width="16" height="26" rx="3" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <rect x="80" y="38" width="16" height="26" rx="3" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <ellipse cx="8" cy="66" rx="10" ry="7" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <ellipse cx="88" cy="66" rx="10" ry="7" fill="#a67c52" stroke="#2c1a08" stroke-width="2"/>
  <!-- yeux dores -->
  <ellipse cx="34" cy="42" rx="6" ry="5" fill="#fff7c0" stroke="#7a5d0a" stroke-width="1.5"/>
  <ellipse cx="62" cy="42" rx="6" ry="5" fill="#fff7c0" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="34" cy="42" r="2.4" fill="#e67e22"/>
  <circle cx="62" cy="42" r="2.4" fill="#e67e22"/>
  <rect x="36" y="56" width="24" height="8" fill="#1a0d05" stroke="#2c1a08" stroke-width="1"/>
  <line x1="42" y1="56" x2="42" y2="64" stroke="#a67c52" stroke-width="1"/>
  <line x1="48" y1="56" x2="48" y2="64" stroke="#a67c52" stroke-width="1"/>
  <line x1="54" y1="56" x2="54" y2="64" stroke="#a67c52" stroke-width="1"/>
  <!-- couronne de pierre -->
  <path d="M22 16 L28 4 L36 14 L48 2 L60 14 L68 4 L74 16 Z" fill="#bdc3c7" stroke="#2c3e50" stroke-width="2"/>
  <rect x="22" y="16" width="52" height="6" fill="#7f8c8d" stroke="#2c3e50" stroke-width="2"/>
  <circle cx="48" cy="6" r="2" fill="#e74c3c"/>
</svg>`;

const SCARA = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="scaraShell" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#bb8fce"/>
      <stop offset="1" stop-color="#5b2c6f"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="28" ry="5" fill="#000" opacity="0.45"/>
  <!-- pattes -->
  <path d="M22 56 L6 64" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M22 68 L4 76" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M74 56 L90 64" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M74 68 L92 76" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M32 80 L26 92" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M64 80 L70 92" stroke="#2c1a08" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- coque (corps) -->
  <ellipse cx="48" cy="60" rx="30" ry="26" fill="url(#scaraShell)" stroke="#2c1a08" stroke-width="2.5"/>
  <!-- partition coque -->
  <line x1="48" y1="38" x2="48" y2="84" stroke="#2c1a08" stroke-width="2.5"/>
  <!-- reflets coque -->
  <ellipse cx="34" cy="50" rx="7" ry="5" fill="#d2b4de" opacity="0.7"/>
  <ellipse cx="62" cy="50" rx="7" ry="5" fill="#d2b4de" opacity="0.7"/>
  <ellipse cx="36" cy="70" rx="3" ry="2" fill="#d2b4de" opacity="0.5"/>
  <ellipse cx="60" cy="70" rx="3" ry="2" fill="#d2b4de" opacity="0.5"/>
  <!-- tete -->
  <ellipse cx="48" cy="32" rx="16" ry="12" fill="#6c3483" stroke="#2c1a08" stroke-width="2.5"/>
  <!-- antennes -->
  <path d="M38 24 Q30 10 36 6" stroke="#2c1a08" stroke-width="2.5" fill="none"/>
  <path d="M58 24 Q66 10 60 6" stroke="#2c1a08" stroke-width="2.5" fill="none"/>
  <circle cx="36" cy="6" r="2.5" fill="#2c1a08"/>
  <circle cx="60" cy="6" r="2.5" fill="#2c1a08"/>
  <!-- yeux -->
  <ellipse cx="40" cy="32" rx="4" ry="5" fill="#fff" stroke="#2c1a08" stroke-width="1.5"/>
  <ellipse cx="56" cy="32" rx="4" ry="5" fill="#fff" stroke="#2c1a08" stroke-width="1.5"/>
  <circle cx="40" cy="34" r="2" fill="#2c1a08"/>
  <circle cx="56" cy="34" r="2" fill="#2c1a08"/>
  <!-- mandibules -->
  <path d="M42 40 L40 46 L46 44 Z" fill="#2c1a08"/>
  <path d="M54 40 L56 46 L50 44 Z" fill="#2c1a08"/>
</svg>`;

const SCARA_ROYAL = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="scaraRShell" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#ec7063"/>
      <stop offset="1" stop-color="#7b241c"/>
    </radialGradient>
  </defs>
  <ellipse cx="48" cy="92" rx="30" ry="6" fill="#000" opacity="0.5"/>
  <path d="M20 56 L4 64" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M20 70 L2 78" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M76 56 L92 64" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M76 70 L94 78" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M30 82 L24 94" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M66 82 L72 94" stroke="#2c1a08" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="48" cy="62" rx="32" ry="28" fill="url(#scaraRShell)" stroke="#2c1a08" stroke-width="3"/>
  <line x1="48" y1="38" x2="48" y2="88" stroke="#2c1a08" stroke-width="3"/>
  <ellipse cx="34" cy="52" rx="8" ry="5" fill="#f5b7b1" opacity="0.7"/>
  <ellipse cx="62" cy="52" rx="8" ry="5" fill="#f5b7b1" opacity="0.7"/>
  <ellipse cx="36" cy="72" rx="3" ry="2" fill="#f5b7b1" opacity="0.5"/>
  <ellipse cx="60" cy="72" rx="3" ry="2" fill="#f5b7b1" opacity="0.5"/>
  <ellipse cx="48" cy="32" rx="18" ry="13" fill="#a93226" stroke="#2c1a08" stroke-width="2.5"/>
  <path d="M36 24 Q28 10 34 4" stroke="#2c1a08" stroke-width="3" fill="none"/>
  <path d="M60 24 Q68 10 62 4" stroke="#2c1a08" stroke-width="3" fill="none"/>
  <circle cx="34" cy="4" r="3" fill="#2c1a08"/>
  <circle cx="62" cy="4" r="3" fill="#2c1a08"/>
  <ellipse cx="40" cy="32" rx="4.5" ry="5.5" fill="#fff" stroke="#2c1a08" stroke-width="1.5"/>
  <ellipse cx="56" cy="32" rx="4.5" ry="5.5" fill="#fff" stroke="#2c1a08" stroke-width="1.5"/>
  <circle cx="40" cy="34" r="2.4" fill="#e74c3c"/>
  <circle cx="56" cy="34" r="2.4" fill="#e74c3c"/>
  <path d="M40 42 L38 50 L46 46 Z" fill="#2c1a08"/>
  <path d="M56 42 L58 50 L50 46 Z" fill="#2c1a08"/>
  <!-- couronne -->
  <path d="M30 18 L36 4 L42 14 L48 0 L54 14 L60 4 L66 18 Z" fill="#f1c40f" stroke="#7a5d0a" stroke-width="2"/>
  <rect x="30" y="18" width="36" height="5" fill="#d4a017" stroke="#7a5d0a" stroke-width="1.5"/>
  <circle cx="48" cy="6" r="2" fill="#9b59b6"/>
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
