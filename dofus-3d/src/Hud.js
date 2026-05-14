import { spellEffectLines } from './Spells.js';
import { getAvatar } from './Avatars.js';

// HUD DOM : panneau bas avec stats + barre de sorts.
// Chaque slot affiche le numero de touche (haut-gauche), une icone SVG
// dessinee (centre, en blanc sur l accent de couleur du sort) et le
// cout en PA (bas-droite). Tooltip riche au survol de la souris.
export class Hud {
  constructor() {
    this.callbacks = {};
    this.spellSlots = [];
    this.build();
  }

  build() {
    const css = document.createElement('style');
    css.textContent = `
      /* ----- Panneau STATS (PA / PM / PDV du combattant actif) ----- */
      #hud-stats {
        position: fixed; left: 16px; bottom: 16px;
        background: rgba(12, 12, 20, 0.85);
        border: 2px solid #444a66;
        border-radius: 14px;
        padding: 12px 16px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        cursor: move;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      #hud-stats.dragging {
        cursor: grabbing; opacity: 0.9;
        box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f;
      }
      #hud-stats .name {
        font-size: 22px; color: #f1c40f; font-weight: bold;
        margin-bottom: 8px; letter-spacing: 0.5px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }
      #hud-stats .stat-row {
        display: flex; gap: 12px; align-items: center;
      }
      #hud-stats .stat-icon {
        position: relative;
        width: 80px; height: 80px;
        flex-shrink: 0;
      }
      #hud-stats .stat-icon svg {
        width: 100%; height: 100%; display: block;
        filter: drop-shadow(0 3px 5px rgba(0,0,0,0.55));
      }
      #hud-stats .stat-icon .value {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font: bold 22px "Trebuchet MS", sans-serif;
        color: #fff;
        text-shadow: 1px 1px 3px #000, 0 0 4px #000, 0 0 6px rgba(0,0,0,0.7);
        pointer-events: none;
        line-height: 1;
      }
      #hud-stats .stat-icon.stat-pm .value { transform: translateX(-5px); }
      #hud-stats .buffs { font-size: 13px; margin-top: 8px; line-height: 1.4; max-width: 280px; }
      #hud-stats .buff { color: #d6a3f0; font-style: italic; }

      /* ----- Panneau SORTS (barre de sorts) ----- */
      #hud-spells {
        position: fixed; left: 50%; bottom: 16px;
        transform: translateX(-50%);
        background: rgba(12, 12, 20, 0.85);
        border: 2px solid #444a66;
        border-radius: 14px;
        padding: 10px 12px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        cursor: move;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      #hud-spells.dragging {
        cursor: grabbing; opacity: 0.9;
        box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f;
      }
      #hud-spells button { cursor: pointer; }
      #hud-spells.dragging button { pointer-events: none; }

      .spell-bar { display: flex; gap: 5px; }
      .spell {
        position: relative;
        width: 58px; height: 58px;
        background: #1f2335;
        border: 2px solid #444a66;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      .spell:hover { border-color: #f1c40f; }
      .spell.active { border-color: #f1c40f; border-width: 3px; box-shadow: 0 0 12px #f1c40f; }
      .spell:disabled { opacity: 0.45; cursor: default; }
      .spell:disabled:hover { border-color: #444a66; }
      .spell.cooldown { opacity: 0.5; cursor: default; }
      .spell.cooldown .icon { opacity: 0.2; }
      .spell.cooldown .cost { opacity: 0.2; }
      .spell .cd-overlay {
        position: absolute; inset: 0;
        display: none;
        align-items: center; justify-content: center;
        font-size: 26px; font-weight: bold;
        color: #fff;
        text-shadow: 1px 1px 3px #000, 0 0 4px #000;
        z-index: 4;
      }
      .spell.cooldown .cd-overlay { display: flex; }
      .spell .accent {
        position: absolute; inset: 4px;
        border-radius: 5px;
        opacity: 0.85;
      }
      .spell .key {
        position: absolute; top: 2px; left: 5px;
        font-size: 10px; font-weight: bold; color: #fff;
        text-shadow: 1px 1px 2px #000;
        z-index: 3;
      }
      .spell .icon {
        position: relative; z-index: 2;
        width: 70%; height: 70%;
        color: #fff;
        filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.6));
      }
      .spell .icon svg { width: 100%; height: 100%; }
      .spell .cost {
        position: absolute; bottom: 2px; right: 5px;
        font-size: 12px; font-weight: bold; color: #fff;
        text-shadow: 1px 1px 2px #000;
        z-index: 3;
      }

      #spell-tooltip {
        position: fixed;
        background: rgba(8, 10, 18, 0.95);
        color: #fff;
        border: 2px solid #f1c40f;
        border-radius: 10px;
        padding: 10px 14px;
        font-family: "Trebuchet MS", sans-serif;
        font-size: 13px;
        max-width: 260px;
        pointer-events: none;
        z-index: 50;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        opacity: 0;
        transition: opacity 0.12s ease-out;
      }
      #spell-tooltip.show { opacity: 1; }
      #spell-tooltip .tip-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      #spell-tooltip .tip-desc { color: #ddd; margin-bottom: 8px; font-style: italic; }
      #spell-tooltip .tip-row { margin: 2px 0; }
      #spell-tooltip .tip-row .lbl { color: #f1c40f; margin-right: 4px; }
      #spell-tooltip .tip-effects .eff { color: #ff9bbd; font-weight: bold; }

      #end-overlay {
        position: fixed; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.7); color: #fff;
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
        width: 60px; height: 60px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #f1c40f;
        color: #f1c40f;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      .rot-btn:hover { background: rgba(241, 196, 15, 0.18); }
      .rot-btn:active { background: #f1c40f; color: #14182a; transform: translateY(-50%) scale(0.92); }
      #rot-left { left: 16px; }
      #rot-right { right: 16px; }
      #rot-recenter {
        position: fixed;
        top: 16px; right: 16px;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #3498db;
        color: #5dade2;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      #rot-recenter:hover { background: rgba(52, 152, 219, 0.2); }
      #rot-recenter:active { background: #3498db; color: #14182a; transform: scale(0.92); }
      #rot-recenter svg { width: 30px; height: 30px; display: block; }
      .rot-btn svg { width: 34px; height: 34px; display: block; }

      /* ----- Barre d ordre de jeu ----- */
      #turn-order {
        position: fixed; left: 50%; top: 16px; transform: translateX(-50%);
        display: flex; align-items: center; gap: 6px;
        background: rgba(12, 12, 20, 0.85);
        border: 2px solid #444a66; border-radius: 12px;
        padding: 8px 12px;
        font-family: "Trebuchet MS", sans-serif;
        color: #fff; z-index: 6;
        cursor: move; user-select: none; touch-action: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.55);
        pointer-events: auto;
      }
      #turn-order.dragging { opacity: 0.9; box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f; }
      #turn-order .to-title {
        font-size: 11px; color: #aaa; padding-right: 6px; border-right: 1px solid #444a66;
        margin-right: 4px; letter-spacing: 1px;
      }
      #turn-order .to-list { display: flex; gap: 6px; align-items: center; }
      .to-slot {
        position: relative; width: 58px; height: 76px;
        border-radius: 8px; background: #1f2335;
        border: 2px solid #444a66;
        display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
        padding: 2px 2px 2px; box-sizing: border-box;
        transition: border-color 0.15s, transform 0.15s;
      }
      .to-slot.active { border-color: #f1c40f; box-shadow: 0 0 12px #f1c40f; transform: translateY(-3px); }
      .to-slot.dead { opacity: 0.32; filter: grayscale(1); }
      .to-slot .to-avatar {
        width: 50px; height: 50px;
        background: radial-gradient(circle at 35% 30%, #3a4060 0%, #1a1d2c 80%);
        border-radius: 6px;
        margin-top: 2px;
        display: flex; align-items: flex-end; justify-content: center;
        overflow: hidden;
      }
      .to-slot .to-avatar img {
        width: 100%; height: 100%; object-fit: contain;
        image-rendering: -webkit-optimize-contrast;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
      }
      .to-slot .to-avatar.fallback {
        font-size: 26px; font-weight: bold;
        text-shadow: 1px 1px 2px #000, 0 0 3px #000;
      }
      .to-slot .to-name {
        font-size: 9px; color: #ddd; margin-top: 2px;
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .to-slot .to-hp {
        position: absolute; bottom: 2px; left: 3px; right: 3px;
        height: 4px; background: #3a0e09; border-radius: 2px; overflow: hidden;
      }
      .to-slot .to-hp .to-hp-fill {
        height: 100%; background: #e74c3c; transition: width 0.25s;
      }
      .to-slot .to-team-dot {
        position: absolute; top: 2px; right: 2px;
        width: 8px; height: 8px; border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.4); z-index: 2;
      }

      /* ----- Journal de combat ----- */
      #combat-log {
        position: fixed; right: 16px; bottom: 16px;
        width: 280px; max-height: 220px;
        background: rgba(12, 12, 20, 0.86);
        border: 2px solid #444a66; border-radius: 10px;
        padding: 8px 10px 10px;
        font-family: "Trebuchet MS", sans-serif;
        color: #fff; z-index: 4;
        cursor: move; user-select: none; touch-action: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.55);
        display: flex; flex-direction: column;
        pointer-events: auto;
      }
      #combat-log.dragging { opacity: 0.9; box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f; }
      #combat-log .cl-title {
        font-size: 11px; color: #aaa; letter-spacing: 1px;
        border-bottom: 1px solid #444a66; padding-bottom: 4px; margin-bottom: 4px;
      }
      #combat-log .cl-body {
        flex: 1; overflow-y: auto; cursor: default;
        font-size: 12px; line-height: 1.35;
        padding-right: 4px;
        scrollbar-width: thin; scrollbar-color: #444a66 transparent;
      }
      #combat-log .cl-body::-webkit-scrollbar { width: 6px; }
      #combat-log .cl-body::-webkit-scrollbar-thumb { background: #444a66; border-radius: 3px; }
      .cl-entry { margin-bottom: 1px; }
      .cl-entry.cast { color: #fff; }
      .cl-entry.attack { color: #ff8a73; }
      .cl-entry.heal { color: #f4a8c8; }
      .cl-entry.buff { color: #f1c40f; }
      .cl-entry.summon { color: #f39c12; }
      .cl-entry.death { color: #e74c3c; font-weight: bold; }
      .cl-entry.info { color: #9ec8ff; font-style: italic; }

      /* ----- Infobulle combattant (au survol) ----- */
      #fighter-info {
        position: fixed; left: 16px; top: 16px;
        width: 220px;
        background: rgba(12, 12, 20, 0.88);
        border: 2px solid #444a66; border-radius: 10px;
        padding: 8px 12px 10px;
        font-family: "Trebuchet MS", sans-serif;
        color: #fff; z-index: 6;
        cursor: move; user-select: none; touch-action: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.55);
        pointer-events: auto;
      }
      #fighter-info.dragging { opacity: 0.9; box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f; }
      #fighter-info.empty .fi-body { color: #777; font-style: italic; }
      #fighter-info .fi-title {
        font-size: 11px; color: #aaa; letter-spacing: 1px;
        border-bottom: 1px solid #444a66; padding-bottom: 3px; margin-bottom: 4px;
      }
      #fighter-info .fi-name { font-size: 15px; font-weight: bold; color: #f1c40f; margin-bottom: 4px; }
      #fighter-info .fi-team { font-size: 11px; color: #aaa; margin-bottom: 6px; }
      #fighter-info .fi-team.enemy { color: #ff8a73; }
      #fighter-info .fi-team.player { color: #6ee7b6; }
      #fighter-info .fi-row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
      #fighter-info .fi-row .lbl { color: #bbb; }
      #fighter-info .fi-row .val { font-weight: bold; }
      #fighter-info .fi-row .val.hp { color: #e74c3c; }
      #fighter-info .fi-row .val.pa { color: #5dade2; }
      #fighter-info .fi-row .val.pm { color: #6ee7b6; }
      #fighter-info .fi-buffs { font-size: 11px; color: #d6a3f0; margin-top: 4px; font-style: italic; line-height: 1.3; }

      /* ----- Bouton helper + panneau d aide ----- */
      #help-btn {
        position: fixed; top: 16px; right: 80px;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #f1c40f;
        color: #f1c40f;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
        font: bold 26px "Trebuchet MS", sans-serif;
      }
      #help-btn:hover { background: rgba(241, 196, 15, 0.18); }
      #help-btn:active { background: #f1c40f; color: #14182a; transform: scale(0.92); }
      #help-btn.active { background: #f1c40f; color: #14182a; }

      #help-panel {
        position: fixed; top: 80px; right: 16px;
        width: 320px;
        background: rgba(12, 12, 20, 0.95);
        border: 2px solid #f1c40f;
        border-radius: 12px;
        padding: 14px 18px 16px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        z-index: 6;
        box-shadow: 0 12px 32px rgba(0,0,0,0.7);
        display: none;
        cursor: move; user-select: none; touch-action: none;
      }
      #help-panel.show { display: block; }
      #help-panel.dragging { opacity: 0.9; box-shadow: 0 16px 36px rgba(0,0,0,0.85), 0 0 0 2px #f1c40f; }
      #help-panel .hp-title {
        font-size: 18px; font-weight: bold; color: #f1c40f;
        margin-bottom: 10px; letter-spacing: 1px;
        border-bottom: 1px solid #444a66; padding-bottom: 6px;
      }
      #help-panel .hp-section { font-size: 12px; color: #f1c40f; margin-top: 10px; margin-bottom: 4px; letter-spacing: 1px; }
      #help-panel .hp-row {
        display: flex; justify-content: space-between; align-items: center;
        font-size: 13px; padding: 3px 0; line-height: 1.3;
      }
      #help-panel .hp-key {
        background: #2c3e50; border: 1px solid #6a7090; border-radius: 5px;
        padding: 2px 8px; font-family: monospace; font-size: 12px; color: #f1c40f;
        margin-left: 8px; flex-shrink: 0;
      }
      #help-panel .hp-desc { color: #ddd; }
    `;
    document.head.appendChild(css);

    const heartSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ff7088"/>
            <stop offset="1" stop-color="#7c1f17"/>
          </linearGradient>
        </defs>
        <path d="M16 28 C2 18 2 7 9 7 C12 7 15 9 16 12 C17 9 20 7 23 7 C30 7 30 18 16 28 Z"
              fill="url(#hp-grad)" stroke="#3a0e09" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    const starSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pa-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7dc6f3"/>
            <stop offset="1" stop-color="#1a4d6e"/>
          </linearGradient>
        </defs>
        <polygon points="16 3 19.3 12 29 12.5 21.4 18.7 24 28 16 22.5 8 28 10.6 18.7 3 12.5 12.7 12"
                 fill="url(#pa-grad)" stroke="#0c2336" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    const arrowSvg = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pm-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6ee7b6"/>
            <stop offset="1" stop-color="#0d6b3e"/>
          </linearGradient>
        </defs>
        <polygon points="3 11 18 11 18 4 30 16 18 28 18 21 3 21"
                 fill="url(#pm-grad)" stroke="#063820" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;

    // Panneau STATS (grand) : nom + HP / PA / PM + buffs.
    const stats = document.createElement('div');
    stats.id = 'hud-stats';
    stats.innerHTML = `
      <div class="name" id="hud-name">-</div>
      <div class="stat-row">
        <div class="stat-icon stat-hp" title="Points de Vie">${heartSvg}<span class="value" id="hud-hp">-</span></div>
        <div class="stat-icon stat-pa" title="Points d Action">${starSvg}<span class="value" id="hud-pa">-</span></div>
        <div class="stat-icon stat-pm" title="Points de Mouvement">${arrowSvg}<span class="value" id="hud-pm">-</span></div>
      </div>
      <div class="buffs" id="hud-buffs"></div>
    `;
    document.body.appendChild(stats);
    this.statsEl = stats;

    // Panneau SORTS : juste la barre de sorts (plus de boutons Move / End).
    const spells = document.createElement('div');
    spells.id = 'hud-spells';
    spells.innerHTML = `<div class="spell-bar" id="spell-bar"></div>`;
    document.body.appendChild(spells);
    this.spellsEl = spells;

    const flash = document.createElement('div');
    flash.id = 'flash';
    document.body.appendChild(flash);
    this.flashEl = flash;

    this.nameEl = document.getElementById('hud-name');
    this.hpEl = document.getElementById('hud-hp');
    this.paEl = document.getElementById('hud-pa');
    this.pmEl = document.getElementById('hud-pm');
    this.buffsEl = document.getElementById('hud-buffs');
    this.spellBar = document.getElementById('spell-bar');

    this.buildTurnOrder();
    this.buildCombatLog();
    this.buildFighterInfo();
    this.buildRotationButtons();
    this.buildHelpPanel();
    this.makeDraggable(this.statsEl, 'dofus3d.statsPos');
    this.makeDraggable(this.spellsEl, 'dofus3d.spellsPos');
    this.makeDraggable(this.turnOrderEl, 'dofus3d.turnPos');
    this.makeDraggable(this.combatLogEl, 'dofus3d.logPos', {
      ignoreSelector: '.cl-body',
    });
    this.makeDraggable(this.fighterInfoEl, 'dofus3d.infoPos');
    this.makeDraggable(this.helpPanelEl, 'dofus3d.helpPos');
  }

  buildHelpPanel() {
    const btn = document.createElement('button');
    btn.id = 'help-btn';
    btn.textContent = '?';
    btn.title = 'Aide / raccourcis (H)';
    document.body.appendChild(btn);
    this.helpBtnEl = btn;

    const panel = document.createElement('div');
    panel.id = 'help-panel';
    panel.innerHTML = `
      <div class="hp-title">CONTROLES</div>

      <div class="hp-section">SORTS</div>
      <div class="hp-row"><span class="hp-desc">Sort 1 a 9</span><span class="hp-key">1 - 9</span></div>
      <div class="hp-row"><span class="hp-desc">Sort 10</span><span class="hp-key">0</span></div>
      <div class="hp-row"><span class="hp-desc">Sort 11 a 19 (2e ligne)</span><span class="hp-key">Ctrl + 1-9</span></div>

      <div class="hp-section">ACTIONS</div>
      <div class="hp-row"><span class="hp-desc">Mode deplacement</span><span class="hp-key">M</span></div>
      <div class="hp-row"><span class="hp-desc">Annuler / retour deplacement</span><span class="hp-key">Clic droit</span></div>
      <div class="hp-row"><span class="hp-desc">Annuler la selection</span><span class="hp-key">Echap</span></div>
      <div class="hp-row"><span class="hp-desc">Fin de tour</span><span class="hp-key">Espace</span></div>

      <div class="hp-section">CAMERA</div>
      <div class="hp-row"><span class="hp-desc">Zoom</span><span class="hp-key">Molette</span></div>
      <div class="hp-row"><span class="hp-desc">Rotation libre</span><span class="hp-key">Clic droit + drag</span></div>
      <div class="hp-row"><span class="hp-desc">Rotation 1/4</span><span class="hp-key">Boutons G/D</span></div>
      <div class="hp-row"><span class="hp-desc">Recentrer la camera</span><span class="hp-key">Bouton bleu</span></div>

      <div class="hp-section">INTERFACE</div>
      <div class="hp-row"><span class="hp-desc">Tous les panneaux sont</span><span class="hp-key">deplaçables</span></div>
      <div class="hp-row"><span class="hp-desc">Plein ecran</span><span class="hp-key">F</span></div>
      <div class="hp-row"><span class="hp-desc">Fermer cette aide</span><span class="hp-key">H / Echap</span></div>
    `;
    document.body.appendChild(panel);
    this.helpPanelEl = panel;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleHelp();
    });
  }

  toggleHelp(force) {
    const show = force === undefined ? !this.helpPanelEl.classList.contains('show') : force;
    this.helpPanelEl.classList.toggle('show', show);
    this.helpBtnEl.classList.toggle('active', show);
  }

  buildTurnOrder() {
    const el = document.createElement('div');
    el.id = 'turn-order';
    el.innerHTML = `
      <div class="to-title">TOUR</div>
      <div class="to-list" id="to-list"></div>
    `;
    document.body.appendChild(el);
    this.turnOrderEl = el;
    this.turnOrderListEl = el.querySelector('.to-list');
  }

  buildCombatLog() {
    const el = document.createElement('div');
    el.id = 'combat-log';
    el.innerHTML = `
      <div class="cl-title">JOURNAL</div>
      <div class="cl-body" id="cl-body"></div>
    `;
    document.body.appendChild(el);
    this.combatLogEl = el;
    this.combatLogBodyEl = el.querySelector('#cl-body');
    this._logEntries = [];
  }

  buildFighterInfo() {
    const el = document.createElement('div');
    el.id = 'fighter-info';
    el.classList.add('empty');
    el.innerHTML = `
      <div class="fi-title">INFO</div>
      <div class="fi-body">Survole un combattant.</div>
    `;
    document.body.appendChild(el);
    this.fighterInfoEl = el;
  }

  // Generic drag helper for any panel. Drag starts on any pointerdown
  // inside the panel except on a button, an input, or an explicitly
  // ignored selector (used by the combat log to keep its body scrollable).
  makeDraggable(panel, storageKey, opts = {}) {
    if (!panel) return;
    const ignoreSelector = opts.ignoreSelector || null;
    let drag = null;

    const onDown = (e) => {
      if (e.target.closest('button')) return;
      if (e.target.closest('input,textarea,select')) return;
      if (ignoreSelector && e.target.closest(ignoreSelector)) return;
      e.preventDefault();
      const rect = panel.getBoundingClientRect();
      drag = {
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      panel.classList.add('dragging');
    };

    const onMove = (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;
      e.preventDefault();
      let x = e.clientX - drag.offsetX;
      let y = e.clientY - drag.offsetY;
      const w = panel.offsetWidth;
      const margin = 60;
      x = Math.max(margin - w, Math.min(window.innerWidth - margin, x));
      y = Math.max(0, Math.min(window.innerHeight - 30, y));
      this.setPanelPos(panel, x, y);
    };

    const onEnd = (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;
      drag = null;
      panel.classList.remove('dragging');
      const rect = panel.getBoundingClientRect();
      try {
        localStorage.setItem(storageKey, JSON.stringify({ x: rect.left, y: rect.top }));
      } catch (_) {}
    };

    panel.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);
    window.addEventListener('blur', () => { drag = null; panel.classList.remove('dragging'); });

    this.restorePanelPosition(panel, storageKey);
  }

  setPanelPos(panel, x, y) {
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.bottom = 'auto';
    panel.style.right = 'auto';
    panel.style.transform = 'none';
  }

  restorePanelPosition(panel, storageKey) {
    let raw;
    try { raw = localStorage.getItem(storageKey); } catch (_) { return; }
    if (!raw) return;
    let pos;
    try { pos = JSON.parse(raw); } catch (_) { return; }
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
    const apply = () => {
      const w = panel.offsetWidth;
      if (w === 0) return;
      const margin = 60;
      const x = Math.max(margin - w, Math.min(window.innerWidth - margin, pos.x));
      const y = Math.max(0, Math.min(window.innerHeight - 30, pos.y));
      this.setPanelPos(panel, x, y);
    };
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 50);
  }

  buildRotationButtons() {
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
    left.id = 'rot-left'; left.className = 'rot-btn'; left.innerHTML = svgCcw;
    left.title = 'Tourner la map (1/4 de tour a gauche)';
    left.addEventListener('click', () => this.callbacks.onRotateLeft && this.callbacks.onRotateLeft());
    document.body.appendChild(left);
    const right = document.createElement('button');
    right.id = 'rot-right'; right.className = 'rot-btn'; right.innerHTML = svgCw;
    right.title = 'Tourner la map (1/4 de tour a droite)';
    right.addEventListener('click', () => this.callbacks.onRotateRight && this.callbacks.onRotateRight());
    document.body.appendChild(right);

    // Bouton recentrer : recadre la camera + angle/zoom d origine.
    const svgCenter = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="9"/>
        <line x1="16" y1="3" x2="16" y2="8"/>
        <line x1="16" y1="24" x2="16" y2="29"/>
        <line x1="3" y1="16" x2="8" y2="16"/>
        <line x1="24" y1="16" x2="29" y2="16"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>`;
    const center = document.createElement('button');
    center.id = 'rot-recenter'; center.innerHTML = svgCenter;
    center.title = 'Recentrer la camera (angle / zoom par defaut)';
    center.addEventListener('click', () => this.callbacks.onResetCamera && this.callbacks.onResetCamera());
    document.body.appendChild(center);
  }

  on(eventName, cb) {
    this.callbacks[eventName] = cb;
  }

  // (Re)construit la barre de sorts a partir des sorts du fighter actif.
  rebuildSpellBar(fighter) {
    this.spellBar.innerHTML = '';
    this.spellSlots = [];
    if (!fighter) return;
    fighter.spells.forEach((spell, idx) => {
      const btn = document.createElement('button');
      btn.className = 'spell';
      btn.dataset.slot = String(idx);
      // Numero de touche : 1..9 puis 0, sinon ^N pour les futurs Ctrl+N.
      const keyLabel = idx < 9 ? String(idx + 1) : (idx === 9 ? '0' : `^${idx - 9}`);
      btn.innerHTML = `
        <div class="accent" style="background: ${spell.color};"></div>
        <div class="key">${keyLabel}</div>
        <div class="icon">${spell.icon || ''}</div>
        <div class="cost">${spell.apCost} PA</div>
        <div class="cd-overlay"></div>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onSpellSlot && this.callbacks.onSpellSlot(idx);
      });
      // Tooltip riche au survol souris (pas sur touch, qui ne fait pas hover).
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.showTooltip(spell, btn);
      });
      btn.addEventListener('pointerleave', () => this.hideTooltip());
      this.spellBar.appendChild(btn);
      this.spellSlots.push({ btn, spell });
    });
  }

  ensureTooltip() {
    if (this.tooltipEl) return this.tooltipEl;
    const el = document.createElement('div');
    el.id = 'spell-tooltip';
    document.body.appendChild(el);
    this.tooltipEl = el;
    return el;
  }

  showTooltip(spell, anchorEl) {
    const el = this.ensureTooltip();
    const effectLines = spellEffectLines(spell);
    const losTxt = spell.needsLOS ? 'Requiert une ligne de vue' : 'Pas de vue requise';
    const rangeTxt = spell.range.min === spell.range.max
      ? `${spell.range.min} case${spell.range.min > 1 ? 's' : ''}`
      : `${spell.range.min} a ${spell.range.max} cases`;
    const cdLine = spell.cooldown
      ? `<div class="tip-row"><span class="lbl">Recharge :</span> ${spell.cooldown} tours</div>` : '';
    el.innerHTML = `
      <div class="tip-name" style="color: ${spell.color};">${spell.name}</div>
      <div class="tip-desc">${spell.desc}</div>
      <div class="tip-row tip-effects">${effectLines.map(l => `<div class="eff">${l}</div>`).join('')}</div>
      <div class="tip-row"><span class="lbl">Cout :</span> ${spell.apCost} PA</div>
      <div class="tip-row"><span class="lbl">Portee :</span> ${rangeTxt}</div>
      <div class="tip-row"><span class="lbl">Vue :</span> ${losTxt}</div>
      ${cdLine}
    `;
    el.classList.add('show');
    // Position au-dessus du bouton avec un peu de marge.
    const rect = anchorEl.getBoundingClientRect();
    // Forcer un layout pour pouvoir mesurer
    el.style.left = '0px'; el.style.top = '0px';
    const tipRect = el.getBoundingClientRect();
    let x = rect.left + rect.width / 2 - tipRect.width / 2;
    x = Math.max(8, Math.min(window.innerWidth - tipRect.width - 8, x));
    let y = rect.top - tipRect.height - 10;
    if (y < 8) y = rect.bottom + 10; // bascule en bas si pas la place en haut
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.classList.remove('show');
  }

  update(fighter, mode, selectedSpellId) {
    if (!fighter) return;
    // Reconstruit la barre si les sorts changent (fighter different).
    if (this._lastFighterId !== fighter.classId + fighter.team) {
      this.rebuildSpellBar(fighter);
      this._lastFighterId = fighter.classId + fighter.team;
    }
    this.nameEl.textContent = fighter.name + (fighter.team === 'player' ? '  (vous)' : '');
    this.hpEl.textContent = `${fighter.hp}/${fighter.maxHp}`;
    this.paEl.textContent = `${fighter.pa}/${fighter.maxPa}`;
    this.pmEl.textContent = `${fighter.pm}/${fighter.maxPm}`;

    // Affichage des buffs actifs. duration inclut le tour de cast : on
    // affiche duration - 1 pour le restant apres le tour en cours.
    if (fighter.buffs && fighter.buffs.length) {
      this.buffsEl.innerHTML = fighter.buffs.map(b => {
        const parts = [];
        if (b.damageMult) parts.push(`+${Math.round(b.damageMult * 100)}% degats`);
        if (b.bonusPa) parts.push(`+${b.bonusPa} PA`);
        if (b.bonusPm) parts.push(`+${b.bonusPm} PM`);
        if (b.shield) parts.push(`-${Math.round(b.shield * 100)}% degats reçus`);
        if (b.dot) parts.push(`Poison ${b.dot.min}-${b.dot.max}/tour`);
        if (parts.length === 0) return '';
        const tag = b.permanent ? '(carte)' : `(${Math.max(0, b.duration - 1)}t)`;
        return `<span class="buff">${parts.join(', ')} ${tag}</span>`;
      }).filter(s => s).join('  ');
    } else {
      this.buffsEl.innerHTML = '';
    }

    const isPlayer = fighter.team === 'player';
    // Un combattant avec un profil IA (Craqueleur invocation par ex.)
    // joue tout seul : le joueur ne peut pas le controler.
    const isAutonomous = !!fighter.def.ai;

    for (const slot of this.spellSlots) {
      const cd = (fighter.spellCooldowns && fighter.spellCooldowns[slot.spell.id]) || 0;
      const isAutonomous = !!fighter.def.ai;
      const usable = isPlayer && !isAutonomous && cd === 0 && fighter.pa >= slot.spell.apCost;
      slot.btn.disabled = !usable;
      slot.btn.classList.toggle('cooldown', cd > 0);
      slot.btn.classList.toggle('active',
        isPlayer && mode === 'spell' && selectedSpellId === slot.spell.id
      );
      // Affiche le compteur sur le slot.
      const cdEl = slot.btn.querySelector('.cd-overlay');
      if (cdEl) cdEl.textContent = cd > 0 ? String(cd) : '';
    }

    // Si l infobulle pointe vers le combattant actif, on rafraichit
    // ses stats en direct (PA/PM debites au fil des actions).
    if (this._infoFighter === fighter) this.renderFighterInfo();
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
      this._lastFighterId = null; // force rebuild de la barre
    });
  }

  flash(text, durationMs = 1400) {
    this.flashEl.textContent = text;
    this.flashEl.classList.add('show');
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => this.flashEl.classList.remove('show'), durationMs);
  }

  // ----- Ordre de jeu -----
  setTurnOrder(order, current) {
    if (!this.turnOrderListEl) return;
    this.turnOrderListEl.innerHTML = '';
    for (const f of order) {
      const slot = document.createElement('div');
      slot.className = 'to-slot';
      if (!f.alive) slot.classList.add('dead');
      if (f === current) slot.classList.add('active');
      const teamColor = f.team === 'player' ? '#27ae60' : '#c0392b';
      const ratio = Math.max(0, Math.min(1, f.hp / f.maxHp));
      const shortName = f.name.replace(/\s*\(Invoc\.\)\s*/, '');
      // Avatar 3D : snapshot du modele rendu en PNG (memoise).
      let avatarHtml;
      const dataUrl = (() => {
        try { return getAvatar(f.classId); } catch (_) { return null; }
      })();
      if (dataUrl) {
        avatarHtml = `<div class="to-avatar"><img src="${dataUrl}" alt="${shortName}"/></div>`;
      } else {
        const color = this.fighterColor(f);
        avatarHtml = `<div class="to-avatar fallback" style="color: ${color};">${shortName.charAt(0).toUpperCase()}</div>`;
      }
      slot.innerHTML = `
        <div class="to-team-dot" style="background: ${teamColor};"></div>
        ${avatarHtml}
        <div class="to-name">${shortName}</div>
        <div class="to-hp"><div class="to-hp-fill" style="width: ${ratio * 100}%;"></div></div>
      `;
      slot.title = `${f.name} - ${f.hp}/${f.maxHp} PV`;
      this.turnOrderListEl.appendChild(slot);
    }
  }

  fighterColor(f) {
    const map = {
      iop: '#e67e22',
      osamodas: '#a569bd',
      bouftou: '#d35400',
      bouftouRoyal: '#c0392b',
      craqueleur: '#a0522d',
      crapaud: '#5cb85c',
      crapaudChef: '#2e7d32',
    };
    return map[f.classId] || '#cccccc';
  }

  // ----- Journal de combat -----
  log(text, kind = 'cast') {
    if (!this.combatLogBodyEl) return;
    const entry = document.createElement('div');
    entry.className = `cl-entry ${kind}`;
    entry.textContent = text;
    this.combatLogBodyEl.appendChild(entry);
    this._logEntries.push(entry);
    while (this._logEntries.length > 100) {
      const old = this._logEntries.shift();
      old.remove();
    }
    this.combatLogBodyEl.scrollTop = this.combatLogBodyEl.scrollHeight;
  }

  clearLog() {
    if (!this.combatLogBodyEl) return;
    this.combatLogBodyEl.innerHTML = '';
    this._logEntries = [];
  }

  // ----- Infobulle d un combattant survole -----
  showFighterInfo(fighter) {
    if (!this.fighterInfoEl) return;
    this._infoFighter = fighter || null;
    this.renderFighterInfo();
  }

  renderFighterInfo() {
    if (!this.fighterInfoEl) return;
    const f = this._infoFighter;
    if (!f || !f.alive) {
      this.fighterInfoEl.classList.add('empty');
      this.fighterInfoEl.innerHTML = `
        <div class="fi-title">INFO</div>
        <div class="fi-body">Survole un combattant.</div>
      `;
      return;
    }
    this.fighterInfoEl.classList.remove('empty');
    const teamLabel = f.team === 'player' ? 'Allie' : 'Ennemi';
    const teamClass = f.team === 'player' ? 'player' : 'enemy';
    let buffsHtml = '';
    if (f.buffs && f.buffs.length) {
      const parts = f.buffs.map(b => {
        const bits = [];
        if (b.damageMult) bits.push(`+${Math.round(b.damageMult * 100)}% dgt`);
        if (b.bonusPa) bits.push(`+${b.bonusPa} PA`);
        if (b.bonusPm) bits.push(`+${b.bonusPm} PM`);
        if (b.shield) bits.push(`-${Math.round(b.shield * 100)}% reçus`);
        if (b.dot) bits.push(`Poison ${b.dot.min}-${b.dot.max}`);
        if (!bits.length) return '';
        const tag = b.permanent ? '(carte)' : `(${Math.max(0, b.duration - 1)}t)`;
        return bits.join(', ') + ' ' + tag;
      }).filter(Boolean);
      if (parts.length) buffsHtml = `<div class="fi-buffs">${parts.join(' / ')}</div>`;
    }
    this.fighterInfoEl.innerHTML = `
      <div class="fi-title">INFO</div>
      <div class="fi-name">${f.name}</div>
      <div class="fi-team ${teamClass}">${teamLabel}</div>
      <div class="fi-row"><span class="lbl">PV</span><span class="val hp">${f.hp} / ${f.maxHp}</span></div>
      <div class="fi-row"><span class="lbl">PA</span><span class="val pa">${f.pa} / ${f.maxPa}</span></div>
      <div class="fi-row"><span class="lbl">PM</span><span class="val pm">${f.pm} / ${f.maxPm}</span></div>
      ${buffsHtml}
    `;
  }
}
