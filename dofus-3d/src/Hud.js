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
        display: flex; align-items: center; gap: 10px;
      }
      #hud-spells.dragging {
        cursor: grabbing; opacity: 0.9;
        box-shadow: 0 12px 32px rgba(0,0,0,0.8), 0 0 0 2px #f1c40f;
      }
      #hud-spells button { cursor: pointer; }
      #hud-spells.dragging button { pointer-events: none; }

      .spell-bar { display: flex; gap: 5px; }

      /* Bouton "FIN DE TOUR" : seulement sur mobile (pas de touche Espace). */
      #btn-end-mobile {
        display: none;
        background: #c0392b;
        border: 3px solid #7c1f17;
        color: #fff;
        font: bold 13px "Trebuchet MS", sans-serif;
        padding: 8px 14px;
        border-radius: 10px;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        white-space: nowrap;
      }
      #btn-end-mobile:disabled { opacity: 0.45; cursor: default; }
      #btn-end-mobile:active { background: #7c1f17; }
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
      .spell .icon img.summon-icon {
        width: 128%; height: 128%;
        margin: -14%;
        object-fit: contain;
        image-rendering: auto;
      }
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
      #end-overlay .sub { font-size: 18px; color: #ccc; margin-bottom: 16px; }
      #end-overlay .end-star {
        margin-bottom: 6px;
        filter: drop-shadow(0 4px 14px rgba(0,0,0,0.7));
        animation: end-star-pop 0.5s ease-out;
      }
      @keyframes end-star-pop {
        0% { transform: scale(0) rotate(-90deg); }
        70% { transform: scale(1.2) rotate(8deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      #end-overlay .end-star-label {
        font-size: 16px; font-weight: bold; letter-spacing: 1px;
        margin-bottom: 22px;
      }
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

      /* ----- Bouton parametres ----- */
      #settings-btn {
        position: fixed; top: 16px; right: 144px;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #95a5a6;
        color: #ecf0f1;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      #settings-btn svg { width: 28px; height: 28px; display: block; }
      #settings-btn:hover { background: rgba(149, 165, 166, 0.18); }
      #settings-btn:active { background: #95a5a6; color: #14182a; transform: scale(0.92); }
      #settings-btn.active { background: #95a5a6; color: #14182a; }

      #settings-panel {
        position: fixed; top: 80px; right: 16px;
        width: 260px;
        background: rgba(12, 12, 20, 0.95);
        border: 2px solid #95a5a6;
        border-radius: 12px;
        padding: 14px 16px 14px;
        color: #fff;
        font-family: "Trebuchet MS", sans-serif;
        z-index: 6;
        box-shadow: 0 12px 32px rgba(0,0,0,0.7);
        display: none;
        cursor: move; user-select: none; touch-action: none;
      }
      #settings-panel.show { display: block; }
      #settings-panel.dragging { opacity: 0.9; box-shadow: 0 16px 36px rgba(0,0,0,0.85), 0 0 0 2px #95a5a6; }
      #settings-panel .sp-title {
        font-size: 18px; font-weight: bold; color: #ecf0f1;
        margin-bottom: 10px; letter-spacing: 1px;
        border-bottom: 1px solid #444a66; padding-bottom: 6px;
      }
      #settings-panel .sp-section { font-size: 12px; color: #95a5a6; margin: 10px 0 4px; letter-spacing: 1px; }
      #settings-panel label {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; padding: 4px 0; cursor: pointer;
        color: #ddd;
      }
      #settings-panel label:hover { color: #fff; }
      #settings-panel input[type="checkbox"] {
        width: 16px; height: 16px; accent-color: #95a5a6; cursor: pointer;
      }
      #settings-panel .sp-hint { font-size: 11px; color: #888; font-style: italic; margin-top: 8px; }
      #settings-panel .sp-btn {
        display: block; width: 100%;
        margin-top: 4px; padding: 8px 10px;
        background: #2c3e50; border: 2px solid #6a7090;
        color: #ecf0f1; border-radius: 8px;
        font: bold 12px "Trebuchet MS", sans-serif;
        cursor: pointer; touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      #settings-panel .sp-btn:hover { background: #3b556e; }
      #settings-panel .sp-btn:active { background: #95a5a6; color: #14182a; }

      /* Indicateur "epingle" sur la fiche du combattant. */
      #fighter-info .fi-pin {
        position: absolute; top: 6px; right: 8px;
        width: 22px; height: 22px;
        border-radius: 50%;
        background: #f1c40f; color: #14182a;
        border: none;
        cursor: pointer;
        font: bold 14px "Trebuchet MS", sans-serif;
        display: none;
        align-items: center; justify-content: center;
        line-height: 1; padding: 0;
      }
      #fighter-info.pinned .fi-pin { display: flex; }
      #fighter-info.pinned { border-color: #f1c40f; box-shadow: 0 6px 18px rgba(0,0,0,0.6), 0 0 0 2px #f1c40f; }

      /* ----- Bouton menu / abandon ----- */
      #menu-btn {
        position: fixed; top: 16px; right: 208px;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: rgba(12, 12, 20, 0.78);
        border: 3px solid #e74c3c;
        color: #e74c3c;
        cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        z-index: 5;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        transition: background 0.15s, transform 0.1s;
      }
      #menu-btn svg { width: 28px; height: 28px; display: block; }
      #menu-btn:hover { background: rgba(231, 76, 60, 0.18); }
      #menu-btn:active { background: #e74c3c; color: #14182a; transform: scale(0.92); }

      #confirm-overlay {
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.72);
        z-index: 30;
        font-family: "Trebuchet MS", sans-serif;
      }
      #confirm-overlay .confirm-box {
        background: rgba(16, 16, 26, 0.98);
        border: 2px solid #e74c3c;
        border-radius: 12px;
        padding: 24px 28px;
        max-width: 360px; text-align: center;
        box-shadow: 0 16px 40px rgba(0,0,0,0.85);
      }
      #confirm-overlay .confirm-msg {
        color: #fff; font-size: 17px; line-height: 1.45; margin-bottom: 20px;
      }
      #confirm-overlay .confirm-actions {
        display: flex; gap: 12px; justify-content: center;
      }
      #confirm-overlay button {
        padding: 10px 22px; font-size: 16px; border-radius: 8px;
        font-family: inherit; font-weight: bold; cursor: pointer;
      }
      #confirm-overlay #confirm-no {
        background: #2c3e50; border: 2px solid #6a7090; color: #fff;
      }
      #confirm-overlay #confirm-yes {
        background: #e74c3c; border: 2px solid #922b21; color: #fff;
      }

      /* ----- ADAPTATIONS MOBILE ----- */
      @media (pointer: coarse), (max-width: 768px) {
        #btn-end-mobile { display: block; }
        #menu-btn { width: 40px; height: 40px; border-width: 2px; right: 156px; top: 12px; }
        #menu-btn svg { width: 22px; height: 22px; }
        .rot-btn { width: 44px; height: 44px; border-width: 2px; }
        .rot-btn svg { width: 24px; height: 24px; }
        #rot-recenter { width: 40px; height: 40px; border-width: 2px; top: 12px; right: 12px; }
        #rot-recenter svg { width: 22px; height: 22px; }
        #help-btn { width: 40px; height: 40px; border-width: 2px; font-size: 20px; right: 60px; top: 12px; }
        #settings-btn { width: 40px; height: 40px; border-width: 2px; right: 108px; top: 12px; }
        #settings-btn svg { width: 22px; height: 22px; }
        #help-panel { top: 60px; }
        #settings-panel { top: 60px; }
      }
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

    // Panneau SORTS : la barre de sorts + un bouton "Fin de tour"
    // affiche uniquement sur mobile (pas de touche Espace au tactile).
    const spells = document.createElement('div');
    spells.id = 'hud-spells';
    spells.innerHTML = `
      <div class="spell-bar" id="spell-bar"></div>
      <button id="btn-end-mobile" type="button">FIN DE TOUR</button>
    `;
    document.body.appendChild(spells);
    this.spellsEl = spells;
    this.btnEndMobile = document.getElementById('btn-end-mobile');
    this.btnEndMobile.addEventListener('click', () => this.callbacks.onEnd && this.callbacks.onEnd());

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
    this.buildSettingsPanel();
    this.buildMenuButton();
    this.makeDraggable(this.statsEl, 'dofus3d.statsPos');
    this.makeDraggable(this.spellsEl, 'dofus3d.spellsPos');
    this.makeDraggable(this.turnOrderEl, 'dofus3d.turnPos');
    this.makeDraggable(this.combatLogEl, 'dofus3d.logPos', {
      ignoreSelector: '.cl-body',
    });
    this.makeDraggable(this.fighterInfoEl, 'dofus3d.infoPos');
    this.makeDraggable(this.helpPanelEl, 'dofus3d.helpPos');
    this.makeDraggable(this.settingsPanelEl, 'dofus3d.settingsPos', {
      ignoreSelector: 'label,input',
    });
    // Restaure les visibilites memorisees.
    this.applyVisibility();
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

  // Bouton "retour au menu" : abandonne le combat apres confirmation.
  buildMenuButton() {
    const btn = document.createElement('button');
    btn.id = 'menu-btn';
    btn.title = 'Abandonner le combat et revenir au menu';
    btn.innerHTML = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15 L16 4 L28 15"/>
        <path d="M7 13 V27 H25 V13"/>
        <rect x="13" y="18" width="6" height="9"/>
      </svg>`;
    document.body.appendChild(btn);
    this.menuBtnEl = btn;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showConfirm(
        'Abandonner le combat et revenir au menu principal ?',
        () => this.callbacks.onAbandon && this.callbacks.onAbandon(),
      );
    });
  }

  // Petite fenetre de confirmation oui / non.
  showConfirm(message, onYes) {
    const old = document.getElementById('confirm-overlay');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-msg">${message}</div>
        <div class="confirm-actions">
          <button id="confirm-no" type="button">Annuler</button>
          <button id="confirm-yes" type="button">Abandonner</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('#confirm-no').addEventListener('click', close);
    overlay.querySelector('#confirm-yes').addEventListener('click', () => {
      close();
      if (onYes) onYes();
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  toggleHelp(force) {
    const show = force === undefined ? !this.helpPanelEl.classList.contains('show') : force;
    this.helpPanelEl.classList.toggle('show', show);
    this.helpBtnEl.classList.toggle('active', show);
  }

  // ----- Panneau parametres + bouton roue cranteee -----
  buildSettingsPanel() {
    const gearSvg = `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="4"/>
        <path d="M16 4 v3 M16 25 v3 M4 16 h3 M25 16 h3
                 M7.5 7.5 l2.1 2.1 M22.4 22.4 l2.1 2.1 M7.5 24.5 l2.1 -2.1 M22.4 9.6 l2.1 -2.1"/>
      </svg>`;
    const btn = document.createElement('button');
    btn.id = 'settings-btn';
    btn.innerHTML = gearSvg;
    btn.title = 'Parametres d affichage';
    document.body.appendChild(btn);
    this.settingsBtnEl = btn;

    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.innerHTML = `
      <div class="sp-title">PARAMETRES</div>
      <div class="sp-section">PANNEAUX VISIBLES</div>
      <label><input type="checkbox" data-target="stats" checked> Stats du combattant</label>
      <label><input type="checkbox" data-target="spells" checked> Barre de sorts</label>
      <label><input type="checkbox" data-target="turn" checked> Ordre du tour</label>
      <label><input type="checkbox" data-target="log" checked> Journal de combat</label>
      <label><input type="checkbox" data-target="info" checked> Infobulle combattant</label>
      <div class="sp-section">DISPOSITION</div>
      <button id="sp-reset-pos" type="button" class="sp-btn">Reinitialiser les positions</button>
      <div class="sp-hint">Astuce : pince a 2 doigts un panneau pour le redimensionner.</div>
    `;
    document.body.appendChild(panel);
    this.settingsPanelEl = panel;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSettings();
    });
    panel.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        this.setPanelVisible(input.dataset.target, input.checked);
      });
    });
    const resetBtn = panel.querySelector('#sp-reset-pos');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetPanelPositions();
      });
    }
  }

  // Vide les positions / scales memorisees et remet chaque panneau a
  // sa position CSS par defaut, a sa taille naturelle.
  resetPanelPositions() {
    const panels = [
      { el: this.statsEl, key: 'dofus3d.statsPos' },
      { el: this.spellsEl, key: 'dofus3d.spellsPos' },
      { el: this.turnOrderEl, key: 'dofus3d.turnPos' },
      { el: this.combatLogEl, key: 'dofus3d.logPos' },
      { el: this.fighterInfoEl, key: 'dofus3d.infoPos' },
      { el: this.helpPanelEl, key: 'dofus3d.helpPos' },
      { el: this.settingsPanelEl, key: 'dofus3d.settingsPos' },
    ];
    for (const { el, key } of panels) {
      if (!el) continue;
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(key + '.scale');
      } catch (_) {}
      // Reset des styles inline appliques par drag / pinch.
      el.style.left = '';
      el.style.top = '';
      el.style.bottom = '';
      el.style.right = '';
      el.style.transform = '';
      el.style.transformOrigin = '';
      delete el.dataset.scale;
    }
    this.flash('Disposition reinitialisee', 1200);
  }

  toggleSettings(force) {
    const show = force === undefined ? !this.settingsPanelEl.classList.contains('show') : force;
    this.settingsPanelEl.classList.toggle('show', show);
    this.settingsBtnEl.classList.toggle('active', show);
  }

  // Hash cle (target) -> element du panneau correspondant.
  _panelByTarget(target) {
    return ({
      stats: this.statsEl,
      spells: this.spellsEl,
      turn: this.turnOrderEl,
      log: this.combatLogEl,
      info: this.fighterInfoEl,
    })[target];
  }

  setPanelVisible(target, visible) {
    const el = this._panelByTarget(target);
    if (!el) return;
    el.style.display = visible ? '' : 'none';
    try { localStorage.setItem('dofus3d.vis.' + target, visible ? '1' : '0'); } catch (_) {}
  }

  applyVisibility() {
    for (const target of ['stats', 'spells', 'turn', 'log', 'info']) {
      let saved;
      try { saved = localStorage.getItem('dofus3d.vis.' + target); } catch (_) {}
      if (saved === '0') {
        this.setPanelVisible(target, false);
        const cb = this.settingsPanelEl && this.settingsPanelEl.querySelector(`input[data-target="${target}"]`);
        if (cb) cb.checked = false;
      }
    }
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
    const pointers = new Map();
    let drag = null;
    let pinch = null;

    const onDown = (e) => {
      if (e.target.closest('button')) return;
      if (e.target.closest('input,textarea,select')) return;
      if (ignoreSelector && e.target.closest(ignoreSelector)) return;
      e.preventDefault();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        // Bascule en mode pinch : on annule le drag eventuel.
        drag = null;
        panel.classList.remove('dragging');
        const arr = Array.from(pointers.values());
        const a = arr[0], b = arr[1];
        pinch = {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          scale: this._getScale(panel),
        };
      } else if (pointers.size === 1 && !pinch) {
        const rect = panel.getBoundingClientRect();
        drag = {
          pointerId: e.pointerId,
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
        };
        panel.classList.add('dragging');
      }
    };

    const onMove = (e) => {
      const p = pointers.get(e.pointerId);
      if (p) { p.x = e.clientX; p.y = e.clientY; }
      if (pinch && pointers.size >= 2) {
        e.preventDefault();
        const arr = Array.from(pointers.values());
        const a = arr[0], b = arr[1];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 1 && pinch.dist > 1) {
          const newScale = Math.max(0.45, Math.min(1.6, pinch.scale * (d / pinch.dist)));
          this._setScale(panel, newScale);
        }
        return;
      }
      if (drag && drag.pointerId === e.pointerId) {
        e.preventDefault();
        let x = e.clientX - drag.offsetX;
        let y = e.clientY - drag.offsetY;
        const scale = this._getScale(panel);
        const w = panel.offsetWidth * scale;
        const margin = 60;
        x = Math.max(margin - w, Math.min(window.innerWidth - margin, x));
        y = Math.max(0, Math.min(window.innerHeight - 30, y));
        this.setPanelPos(panel, x, y);
      }
    };

    const onEnd = (e) => {
      pointers.delete(e.pointerId);
      if (pinch && pointers.size < 2) {
        const scale = this._getScale(panel);
        try { localStorage.setItem(storageKey + '.scale', scale.toFixed(3)); } catch (_) {}
        pinch = null;
      }
      if (drag && drag.pointerId === e.pointerId) {
        drag = null;
        panel.classList.remove('dragging');
        const rect = panel.getBoundingClientRect();
        try {
          localStorage.setItem(storageKey, JSON.stringify({ x: rect.left, y: rect.top }));
        } catch (_) {}
      }
    };

    panel.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);
    window.addEventListener('blur', () => {
      drag = null; pinch = null; pointers.clear();
      panel.classList.remove('dragging');
    });

    this.restorePanelPosition(panel, storageKey);
  }

  // L echelle est conservee sur dataset.scale pour pouvoir la reappliquer
  // a chaque setPanelPos sans interferer avec les translations.
  _getScale(panel) {
    return parseFloat(panel.dataset.scale || '1') || 1;
  }
  _setScale(panel, scale) {
    panel.dataset.scale = String(scale);
    panel.style.transformOrigin = 'top left';
    panel.style.transform = `scale(${scale})`;
  }

  setPanelPos(panel, x, y) {
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.bottom = 'auto';
    panel.style.right = 'auto';
    // On conserve la scale (transform: scale(N)) et on annule la
    // translation centrale par defaut (translateX(-50%)).
    const scale = this._getScale(panel);
    panel.style.transformOrigin = 'top left';
    panel.style.transform = `scale(${scale})`;
  }

  restorePanelPosition(panel, storageKey) {
    // Restore scale en premier (sans modifier la position par defaut).
    let scaleRaw;
    try { scaleRaw = localStorage.getItem(storageKey + '.scale'); } catch (_) {}
    if (scaleRaw) {
      const s = parseFloat(scaleRaw);
      if (!isNaN(s) && s > 0) this._setScale(panel, s);
    }
    let raw;
    try { raw = localStorage.getItem(storageKey); } catch (_) { return; }
    if (!raw) return;
    let pos;
    try { pos = JSON.parse(raw); } catch (_) { return; }
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return;
    const apply = () => {
      const w = panel.offsetWidth * this._getScale(panel);
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
      // Sort d invocation : l icone represente la creature a invoquer
      // (snapshot 3D du modele) plutot qu un pictogramme generique.
      let iconHtml = spell.icon || '';
      const summonEff = spell.effects && spell.effects.find(e => e.type === 'summon');
      if (summonEff) {
        let avatar = null;
        try { avatar = getAvatar(summonEff.creatureId, 96); } catch (_) { avatar = null; }
        if (avatar) iconHtml = `<img class="summon-icon" src="${avatar}" alt="">`;
      }
      btn.innerHTML = `
        <div class="accent" style="background: ${spell.color};"></div>
        <div class="key">${keyLabel}</div>
        <div class="icon">${iconHtml}</div>
        <div class="cost">${spell.apCost} PA</div>
        <div class="cd-overlay"></div>
      `;
      // Long-press tactile : affiche l infobulle apres 450ms.
      // En cas de long-press, on supprime le clic suivant (l utilisateur
      // demandait juste l info, pas la selection du sort).
      let lpTimer = null;
      let lpFired = false;
      const cancelLp = () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } };

      btn.addEventListener('click', (e) => {
        if (lpFired) {
          lpFired = false;
          e.preventDefault();
          return;
        }
        this.callbacks.onSpellSlot && this.callbacks.onSpellSlot(idx);
      });
      // Souris : tooltip immediat au survol.
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.showTooltip(spell, btn);
      });
      btn.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') this.hideTooltip();
      });
      // Tactile : long-press 450ms.
      btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        lpFired = false;
        cancelLp();
        lpTimer = setTimeout(() => {
          lpFired = true;
          this.showTooltip(spell, btn);
        }, 450);
      });
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') return;
        cancelLp();
      });
      btn.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') return;
        cancelLp();
        if (lpFired) {
          // Laisse l infobulle un instant puis la masque.
          setTimeout(() => this.hideTooltip(), 1500);
        }
      });
      btn.addEventListener('pointercancel', () => {
        cancelLp();
        if (lpFired) this.hideTooltip();
      });
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
    // Max PA/PM "effectifs" : incluent les bonus en cours (3 Concentration
    // -> "11/11" et pas "11/8") pour que le joueur voie son cap reel.
    const effMaxPa = fighter.effectiveMaxPa !== undefined ? fighter.effectiveMaxPa : fighter.maxPa;
    const effMaxPm = fighter.effectiveMaxPm !== undefined ? fighter.effectiveMaxPm : fighter.maxPm;
    this.paEl.textContent = `${fighter.pa}/${effMaxPa}`;
    this.pmEl.textContent = `${fighter.pm}/${effMaxPm}`;

    // Affichage des buffs actifs. On agrege les damageMult non-permanents
    // en UNE seule ligne (3 x Concentration -> "+90% degats") plutot que
    // de multiplier les entrees identiques.
    if (fighter.buffs && fighter.buffs.length) {
      let aggDmgMult = 0;
      let aggDmgMultDuration = 0;
      const otherBuffs = [];
      for (const b of fighter.buffs) {
        if (b.damageMult && !b.permanent) {
          aggDmgMult += b.damageMult;
          aggDmgMultDuration = Math.max(aggDmgMultDuration, b.duration - 1);
        } else {
          otherBuffs.push(b);
        }
      }
      const lines = [];
      if (aggDmgMult > 0) {
        lines.push(`<span class="buff">+${Math.round(aggDmgMult * 100)}% degats (${Math.max(0, aggDmgMultDuration)}t)</span>`);
      }
      for (const b of otherBuffs) {
        const parts = [];
        if (b.damageMult) parts.push(`+${Math.round(b.damageMult * 100)}% degats`);
        if (b.bonusPa) parts.push(`${b.bonusPa > 0 ? '+' : ''}${b.bonusPa} PA`);
        if (b.bonusPm) parts.push(`${b.bonusPm > 0 ? '+' : ''}${b.bonusPm} PM`);
        if (b.shield) parts.push(`-${Math.round(b.shield * 100)}% degats reçus`);
        if (b.reflect) parts.push(`renvoie ${Math.round(b.reflect * 100)}% des degats`);
        if (b.dot) parts.push(`Poison ${b.dot.min}-${b.dot.max}/tour`);
        if (parts.length === 0) continue;
        const tag = b.permanent ? '(carte)' : `(${Math.max(0, b.duration - 1)}t)`;
        lines.push(`<span class="buff">${parts.join(', ')} ${tag}</span>`);
      }
      this.buffsEl.innerHTML = lines.join('  ');
    } else {
      this.buffsEl.innerHTML = '';
    }

    const isPlayer = fighter.team === 'player';
    // Un combattant avec un profil IA (Craqueleur invocation par ex.)
    // joue tout seul : le joueur ne peut pas le controler.
    const isAutonomous = !!fighter.def.ai;
    if (this.btnEndMobile) {
      this.btnEndMobile.disabled = !isPlayer || isAutonomous;
    }

    for (const slot of this.spellSlots) {
      const cd = (fighter.spellCooldowns && fighter.spellCooldowns[slot.spell.id]) || 0;
      const isAutonomous = !!fighter.def.ai;
      // Sort d invocation grise si la creature du meme type est en vie.
      const locked = isPlayer && this.isSpellLocked
        && this.isSpellLocked(fighter, slot.spell);
      const usable = isPlayer && !isAutonomous && !locked
        && cd === 0 && fighter.pa >= slot.spell.apCost;
      slot.btn.disabled = !usable;
      slot.btn.classList.toggle('cooldown', cd > 0);
      slot.btn.classList.toggle('active',
        isPlayer && mode === 'spell' && selectedSpellId === slot.spell.id
      );
      // Affiche le compteur sur le slot.
      const cdEl = slot.btn.querySelector('.cd-overlay');
      if (cdEl) cdEl.textContent = cd > 0 ? String(cd) : '';
    }

    // Si l infobulle pointe vers un combattant (epingle ou en survol),
    // on rafraichit ses stats en direct (PA / PM / PV mis a jour au fil
    // des sorts et des deplacements, meme si ce n est pas l actif).
    if (this._infoFighter) this.renderFighterInfo();
  }

  // Etoile SVG : 'gold', 'silver' ou 'empty'.
  starSvg(type, size = 90) {
    const fill = type === 'gold' ? '#f6c83e' : type === 'silver' ? '#cfd8dd' : '#3a3f4d';
    const stroke = type === 'gold' ? '#a87c12' : type === 'silver' ? '#8a949c' : '#5a6070';
    const shine = type === 'gold' ? '#fff0b8' : type === 'silver' ? '#ffffff' : '#4a505e';
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32 4, 40 24, 61 25, 44 39, 50 60, 32 48, 14 60, 20 39, 3 25, 24 24"
               fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="32 12, 36 25, 28 25" fill="${shine}" opacity="0.85"/>
    </svg>`;
  }

  showEnd(winner, onReplay, enemyLabel, starResult) {
    const label = enemyLabel || 'tes adversaires';
    const overlay = document.createElement('div');
    overlay.id = 'end-overlay';
    let starBlock = '';
    if (winner === 'player' && starResult) {
      const txt = starResult === 'gold'
        ? 'ETOILE D OR ! (carte maison du monstre)'
        : 'Etoile d argent';
      starBlock = `
        <div class="end-star">${this.starSvg(starResult, 110)}</div>
        <div class="end-star-label" style="color: ${starResult === 'gold' ? '#f6c83e' : '#cfd8dd'}">${txt}</div>
      `;
    }
    overlay.innerHTML = `
      <div class="title" style="color: ${winner === 'player' ? '#2ecc71' : '#e74c3c'}">
        ${winner === 'player' ? 'VICTOIRE' : 'DEFAITE'}
      </div>
      <div class="sub">${winner === 'player'
        ? `Tu as triomphe de ${label} !`
        : `${label} t ont vaincu...`}</div>
      ${starBlock}
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

  // ----- Infobulle d un combattant survole / epingle -----
  // Si un combattant est epingle (par clic), le hover est ignore et
  // l infobulle continue d afficher la cible epinglee.
  showFighterInfo(fighter) {
    if (!this.fighterInfoEl) return;
    if (this._pinnedFighter) return;
    this._infoFighter = fighter || null;
    this.renderFighterInfo();
  }

  pinFighterInfo(fighter) {
    if (!this.fighterInfoEl || !fighter) return;
    // Le pin reste colle : un second clic sur la meme cible ne la
    // depingle plus (seul le bouton X de l infobulle le fait). Cela
    // evite de perdre la cible quand on cast un sort dessus.
    this._pinnedFighter = fighter;
    this._infoFighter = fighter;
    this.renderFighterInfo();
  }

  unpinFighterInfo() {
    this._pinnedFighter = null;
    this._infoFighter = null;
    this.renderFighterInfo();
  }

  renderFighterInfo() {
    if (!this.fighterInfoEl) return;
    const f = this._infoFighter;
    const isPinned = !!this._pinnedFighter;
    this.fighterInfoEl.classList.toggle('pinned', isPinned);
    if (!f || !f.alive) {
      this.fighterInfoEl.classList.add('empty');
      this.fighterInfoEl.classList.remove('pinned');
      this.fighterInfoEl.innerHTML = `
        <div class="fi-title">INFO</div>
        <div class="fi-body">Survole ou clique un combattant.</div>
      `;
      // Si la cible epinglee n existe plus / est morte, on desepingle.
      if (isPinned && (!f || !f.alive)) this._pinnedFighter = null;
      return;
    }
    this.fighterInfoEl.classList.remove('empty');
    const teamLabel = f.team === 'player' ? 'Allie' : 'Ennemi';
    const teamClass = f.team === 'player' ? 'player' : 'enemy';
    let buffsHtml = '';
    if (f.buffs && f.buffs.length) {
      // Agregation des damageMult non-permanents en une seule ligne.
      let aggDmgMult = 0;
      let aggDmgMultDuration = 0;
      const otherBuffs = [];
      for (const b of f.buffs) {
        if (b.damageMult && !b.permanent) {
          aggDmgMult += b.damageMult;
          aggDmgMultDuration = Math.max(aggDmgMultDuration, b.duration - 1);
        } else {
          otherBuffs.push(b);
        }
      }
      const parts = [];
      if (aggDmgMult > 0) {
        parts.push(`+${Math.round(aggDmgMult * 100)}% dgt (${Math.max(0, aggDmgMultDuration)}t)`);
      }
      for (const b of otherBuffs) {
        const bits = [];
        if (b.damageMult) bits.push(`+${Math.round(b.damageMult * 100)}% dgt`);
        if (b.bonusPa) bits.push(`${b.bonusPa > 0 ? '+' : ''}${b.bonusPa} PA`);
        if (b.bonusPm) bits.push(`${b.bonusPm > 0 ? '+' : ''}${b.bonusPm} PM`);
        if (b.shield) bits.push(`-${Math.round(b.shield * 100)}% reçus`);
        if (b.reflect) bits.push(`renvoi ${Math.round(b.reflect * 100)}%`);
        if (b.dot) bits.push(`Poison ${b.dot.min}-${b.dot.max}`);
        if (!bits.length) continue;
        const tag = b.permanent ? '(carte)' : `(${Math.max(0, b.duration - 1)}t)`;
        parts.push(bits.join(', ') + ' ' + tag);
      }
      if (parts.length) buffsHtml = `<div class="fi-buffs">${parts.join(' / ')}</div>`;
    }
    const effMaxPa = f.effectiveMaxPa !== undefined ? f.effectiveMaxPa : f.maxPa;
    const effMaxPm = f.effectiveMaxPm !== undefined ? f.effectiveMaxPm : f.maxPm;
    // Affichage specifique aux bombes : pas de PA/PM, on montre le
    // fusible restant et les degats prevus a l explosion.
    let bodyRows;
    if (f.isBomb) {
      const fuseMax = (f.def && f.def.fuseMax) || 3;
      const remaining = Math.max(0, fuseMax - (f.bombAge || 0));
      const baseDmg = (f.def && f.def.bombDamage) || 50;
      const growth = (f.def && f.def.bombDamageGrowth) || 0;
      const nextDmg = Math.round(baseDmg * (1 + growth * (f.bombAge || 0)));
      bodyRows = `
        <div class="fi-row"><span class="lbl">PV</span><span class="val hp">${f.hp} / ${f.maxHp}</span></div>
        <div class="fi-row"><span class="lbl">Fusible</span><span class="val pm">${remaining} tour${remaining > 1 ? 's' : ''}</span></div>
        <div class="fi-row"><span class="lbl">Degats</span><span class="val hp">${nextDmg}</span></div>
      `;
    } else {
      bodyRows = `
        <div class="fi-row"><span class="lbl">PV</span><span class="val hp">${f.hp} / ${f.maxHp}</span></div>
        <div class="fi-row"><span class="lbl">PA</span><span class="val pa">${f.pa} / ${effMaxPa}</span></div>
        <div class="fi-row"><span class="lbl">PM</span><span class="val pm">${f.pm} / ${effMaxPm}</span></div>
      `;
    }
    this.fighterInfoEl.innerHTML = `
      <button class="fi-pin" type="button" title="Desepingler">x</button>
      <div class="fi-title">${isPinned ? 'INFO (epinglee)' : 'INFO'}</div>
      <div class="fi-name">${f.name}</div>
      <div class="fi-team ${teamClass}">${teamLabel}</div>
      ${bodyRows}
      ${buffsHtml}
    `;
    if (isPinned) {
      const pinBtn = this.fighterInfoEl.querySelector('.fi-pin');
      if (pinBtn) pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.unpinFighterInfo();
      });
    }
  }
}
