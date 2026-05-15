import { Fighter } from './Fighter.js';
import { Character3D } from './Character3D.js';
import { TurnManager } from './TurnManager.js';
import { bfs, pathTo, hasLOS } from './Path.js';
import { SPELLS } from './Spells.js';
import { MAP_BOOSTS } from './Map3D.js';

export const COMBATS = {
  bouftou: {
    name: 'Meute de Bouftous',
    enemyComposition: ['bouftou', 'bouftou', 'bouftou', 'bouftouRoyal'],
  },
  crapaud: {
    name: 'Crapauds de la mare',
    enemyComposition: ['crapaud', 'crapaud', 'crapaud', 'crapaudChef'],
  },
};

const PLAYER_SPAWNS = [{ c: 3, r: 7 }, { c: 2, r: 5 }, { c: 2, r: 9 }];
const ENEMY_SPAWNS  = [{ c: 11, r: 7 }, { c: 12, r: 5 }, { c: 12, r: 9 }, { c: 13, r: 7 }];

export class Game {
  constructor({ scene3d, map3d, picker, hud, rangeOverlay, vfx }) {
    this.scene3d = scene3d;
    this.map3d = map3d;
    this.picker = picker;
    this.hud = hud;
    this.rangeOverlay = rangeOverlay;
    this.vfx = vfx;
    this.fighters = [];
    this.turn = null;
    this.mode = 'move';
    this.selectedSpellId = null;
    this.busy = false;
    this.ended = false;
    this.config = null;

    this.hud.on('onMove', () => this.setMode('move'));
    this.hud.on('onSpellSlot', (slot) => this.selectSpellSlot(slot));
    this.hud.on('onEnd', () => this.endTurn());
  }

  setup(config) {
    this.cleanup();
    this.config = config;
    this.ended = false;
    this.busy = false;
    this.mode = 'move';
    this.selectedSpellId = null;
    this.rangeOverlay && this.rangeOverlay.clear();

    // Rebuild la carte si necessaire (eau/pont/foret/cascade).
    if (config.mapId) this.map3d.rebuild(config.mapId);

    const playerClasses = config.playerClasses || ['iop'];
    const enemyComposition = config.enemyComposition
      || (COMBATS[config.combatId] && COMBATS[config.combatId].enemyComposition)
      || ['bouftou'];

    playerClasses.forEach((cls, i) => {
      const pos = PLAYER_SPAWNS[i % PLAYER_SPAWNS.length];
      const f = new Fighter(cls, 'player', pos.c, pos.r);
      f.character = new Character3D(this.scene3d.scene, cls, 'player', pos.c, pos.r);
      this.fighters.push(f);
    });
    enemyComposition.forEach((cls, i) => {
      const pos = ENEMY_SPAWNS[i % ENEMY_SPAWNS.length];
      const f = new Fighter(cls, 'enemy', pos.c, pos.r);
      f.character = new Character3D(this.scene3d.scene, cls, 'enemy', pos.c, pos.r);
      this.fighters.push(f);
    });

    // Boosts de map : applique des buffs permanents aux creatures concernees.
    this.applyMapBoosts(config.mapId);

    for (const f of this.fighters) {
      const other = this.fighters.find(o => o.alive && o.team !== f.team);
      if (other) f.character.faceToward(other.c, other.r);
    }

    this.turn = new TurnManager(this.fighters);
    this.refreshHpBars();
    this.hud.clearLog && this.hud.clearLog();
    this.hud.log && this.hud.log('Le combat commence !', 'info');
    this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
    this.startTurn();
  }

  applyMapBoosts(mapId) {
    const boosts = MAP_BOOSTS[mapId];
    if (!boosts) return;
    for (const f of this.fighters) {
      const boost = boosts[f.classId];
      if (!boost) continue;
      const buff = {
        permanent: true,
        duration: 9999,
        damageMult: boost.damageMult,
        bonusPa: boost.bonusPa,
        bonusPm: boost.bonusPm,
        shield: boost.shield,
      };
      f.buffs.push(buff);
      // Application immediate des bonus PA / PM.
      if (boost.bonusPa) f.pa += boost.bonusPa;
      if (boost.bonusPm) f.pm += boost.bonusPm;
    }
  }

  cleanup() {
    for (const f of this.fighters) {
      if (f.character && f.character.group) {
        this.scene3d.scene.remove(f.character.group);
      }
    }
    this.fighters = [];
    this.turn = null;
    this.busy = false;
    this.ended = false;
    this.rangeOverlay && this.rangeOverlay.clear();
    this.picker && this.picker.setHover(null);
  }

  // ---------- TOUR ----------
  async startTurn() {
    if (this.checkEnd()) return;
    const cur = this.turn.current();
    // 1) Appliquer les DoT actifs AVANT que la nouvelle ressource se
    //    rafraichisse (pour pouvoir mourir avant ses actions).
    let dotTotal = 0;
    for (const b of cur.buffs) {
      if (b.dot && cur.alive) {
        const dmg = b.dot.min + Math.floor(Math.random() * (b.dot.max - b.dot.min + 1));
        const actual = cur.takeDamage(dmg);
        dotTotal += actual;
      }
    }
    if (dotTotal > 0 && cur.character) {
      cur.character.popText('-' + dotTotal, '#c39bd3', {
        fontSize: 26, yStart: 1.6, yRise: 0.9, duration: 900, scaleX: 0.9, scaleY: 0.45,
      });
      cur.character.hpBar.setHp(cur.hp, cur.maxHp);
      this.hud.log && this.hud.log(`${cur.name} subit ${dotTotal} degats de poison`, 'attack');
    }
    if (!cur.alive) {
      // Le combattant meurt du poison : on declenche son anim et on
      // avance au combattant suivant.
      if (cur.character) cur.character.die();
      this.hud.log && this.hud.log(`${cur.name} succombe au poison !`, 'death');
      this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
      this.checkEnd();
      if (this.ended) return;
      this.turn.advance();
      this.startTurn();
      return;
    }
    if (this.checkEnd()) return;

    cur.startTurn();
    for (const f of this.fighters) f.character.setActive(f === cur);
    this.mode = 'move';
    this.selectedSpellId = null;
    cur._bombPlacedThisTurn = false;
    this.hud.update(cur, this.mode, null);
    this.hud.flash(`Tour ${this.turn.round}  -  ${cur.name}`, 1200);
    this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, cur);
    this.hud.log && this.hud.log(`Tour de ${cur.name}`, 'info');

    // Vieillit toutes les bombes appartenant au combattant actif. Si
    // une bombe atteint son fusible, elle explose avant que le joueur
    // ne joue son tour.
    await this._processOwnedBombsTurnStart(cur);
    if (this.ended) return;
    if (!cur.alive) {
      // Le Roublard a saute sur sa propre bombe : on avance.
      if (cur.character) cur.character.die();
      this.hud.log && this.hud.log(`${cur.name} meurt dans l explosion !`, 'death');
      this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
      if (this.checkEnd()) return;
      this.turn.advance();
      this.startTurn();
      return;
    }
    this.refreshRangeOverlay();
    if (cur.def.ai) {
      this.busy = true;
      setTimeout(() => this.runAI(), 700);
    } else {
      this.busy = false;
    }
  }

  endTurn() {
    if (this.busy || this.ended) return;
    this._advanceTurn();
  }

  _advanceTurn() {
    if (this.ended) return;
    this.turn.advance();
    this.startTurn();
  }

  setMode(mode) {
    if (this.busy) return;
    const cur = this.turn.current();
    if (cur.team !== 'player' || cur.def.ai) return;
    this.mode = mode;
    if (mode !== 'spell') this.selectedSpellId = null;
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  selectSpellSlot(slot) {
    if (this.busy) return;
    const cur = this.turn.current();
    if (cur.team !== 'player' || cur.def.ai) return;
    const spell = cur.spells[slot];
    if (!spell) return;
    if (cur.isOnCooldown(spell.id)) {
      this.hud.flash(`${spell.name} en recharge (${cur.spellCooldowns[spell.id]} tours)`, 900);
      return;
    }
    if (spell.apCost > cur.pa) {
      this.hud.flash('Pas assez de PA pour ' + spell.name, 900);
      return;
    }
    if (spell.target === 'self') {
      this.busy = true;
      this.castSelf(cur, spell).finally(() => {
        this.busy = false;
        if (!this.checkEnd()) {
          this.refreshRangeOverlay();
          this.hud.update(cur, this.mode, this.selectedSpellId);
        }
      });
      return;
    }
    this.selectedSpellId = spell.id;
    this.mode = 'spell';
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  async castSelf(caster, spell) {
    caster.pa -= spell.apCost;
    if (spell.cooldown) caster.setCooldown(spell.id, spell.cooldown);
    caster.character.popCost(spell.apCost, 'pa');
    this.hud.update(caster, this.mode, this.selectedSpellId);
    // Aura immediate au lancer d un sort sur soi-meme (concentration, etc.).
    if (this.vfx) {
      const color = parseInt(spell.color.slice(1), 16);
      this.vfx.buffAura({ c: caster.c, r: caster.r }, { color });
    }
    await this.applySpellEffects(caster, spell, { c: caster.c, r: caster.r });
  }

  async onTileTap(c, r, pointerType = 'mouse') {
    if (this.busy || this.ended) return;
    const cur = this.turn.current();
    if (cur.team !== 'player' || cur.def.ai) return;
    const isTouch = pointerType && pointerType !== 'mouse';
    if (this.mode === 'move') {
      // En mode deplacement, on bloque les cases inutilisables.
      if (this.map3d.isBlockedFor(c, r, cur)) return;
      await this.tryMove(c, r);
    } else if (this.mode === 'spell') {
      await this.tryCastSpell(c, r, isTouch);
    }
  }

  // ---------- DEPLACEMENT ----------
  async tryMove(c, r) {
    const cur = this.turn.current();
    if (c === cur.c && r === cur.r) return;
    const occ = this.computeOccupied(cur);
    const blocked = (cc, rr) => this.map3d.isBlockedFor(cc, rr, cur);
    const result = bfs(this.map3d.getData(), occ, { c: cur.c, r: cur.r }, cur.pm, blocked);
    const path = pathTo(result, { c, r });
    if (!path || path.length <= 1) {
      this.hud.flash('Hors de portee', 800);
      return;
    }
    const cost = path.length - 1;
    if (cost > cur.pm) return;
    this.busy = true;
    this.picker.setHover(null);
    cur.character.popCost(cost, 'pm');
    for (const step of path.slice(1)) {
      cur.pm--;
      this.hud.update(cur, this.mode, this.selectedSpellId);
      this.refreshRangeOverlay();
      await cur.character.moveTo(step.c, step.r, 170);
      cur.c = step.c;
      cur.r = step.r;
    }
    this.busy = false;
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  // ---------- SORTS (joueur) ----------
  async tryCastSpell(c, r, isTouch = false) {
    const cur = this.turn.current();
    const spell = SPELLS[this.selectedSpellId];
    if (!spell) return;
    const reason = this.validateSpellTarget(cur, spell, c, r);
    if (reason) {
      this.hud.flash(reason, 900);
      // Sur mobile, taper une case non ciblable equivaut au clic droit
      // PC : on revient en mode deplacement (etat de base).
      if (isTouch) this.setMode('move');
      return;
    }
    cur.pa -= spell.apCost;
    if (spell.cooldown) cur.setCooldown(spell.id, spell.cooldown);
    cur.character.popCost(spell.apCost, 'pa');
    this.hud.update(cur, this.mode, this.selectedSpellId);
    this.busy = true;
    this.picker.setHover(null);
    this.rangeOverlay.clear();
    await this.applySpellEffects(cur, spell, { c, r });
    this.busy = false;
    if (this.checkEnd()) return;
    this.selectedSpellId = null;
    this.mode = 'move';
    this.refreshRangeOverlay();
    this.hud.update(cur, this.mode, this.selectedSpellId);
  }

  validateSpellTarget(caster, spell, c, r) {
    const dist = Math.abs(caster.c - c) + Math.abs(caster.r - r);
    if (dist < spell.range.min || dist > spell.range.max) return 'Hors de portee';
    if (this.map3d.isWall(c, r)) return 'Mur';
    const blockers = this.bombBlockers();
    if (spell.needsLOS && !hasLOS(this.map3d.getData(), caster.c, caster.r, c, r, blockers)) return 'Pas de vue';
    if (spell.area && spell.area.type === 'line') {
      const dc = c - caster.c, dr = r - caster.r;
      if (dc !== 0 && dr !== 0) return 'Doit etre en ligne droite';
    }
    const targetFighter = this.fighters.find(f => f.alive && f.c === c && f.r === r);
    if (spell.target === 'self' && targetFighter !== caster) return 'Cible : soi-meme';
    if (spell.target === 'enemy' && (!targetFighter || targetFighter.team === caster.team)) return 'Pas d ennemi';
    if (spell.target === 'ally') {
      if (!targetFighter || targetFighter.team !== caster.team) return 'Pas d allie';
      if (spell.targetFilter === 'bomb' && !targetFighter.isBomb) return 'Cible : une bombe';
    }
    if (spell.target === 'tile') {
      const isPlace = spell.effects.some(e => e.type === 'placeBomb' || e.type === 'moveBomb');
      const needsEmpty = spell.effects.some(e =>
        e.type === 'teleport' || e.type === 'summon' || e.type === 'placeBomb' || e.type === 'moveBomb'
      );
      if (needsEmpty && targetFighter) return 'Case occupee';
      if (spell.effects.some(e => e.type === 'summon')) {
        if (this.map3d.isWater(c, r)) return 'Pas dans l eau';
      }
      if (spell.effects.some(e => e.type === 'teleport')) {
        if (this.map3d.isBlockedFor(c, r, caster)) return 'Inaccessible';
      }
      if (isPlace) {
        // Bombe : ne peut etre posee que sur du sol / pont (pas mur ni eau).
        if (this.map3d.isWater(c, r) && !this.map3d.isBridge(c, r)) return 'Pas dans l eau';
      }
      if (spell.effects.some(e => e.type === 'placeBomb')) {
        const myBombs = this.fighters.filter(f => f.alive && f.isBomb && f.bombOwner === caster);
        if (myBombs.length >= 2) return 'Max 2 bombes deja en place';
        if (caster._bombPlacedThisTurn) return 'Deja une bombe posee ce tour';
      }
      if (spell.effects.some(e => e.type === 'moveBomb')) {
        const myBombs = this.fighters.filter(f => f.alive && f.isBomb && f.bombOwner === caster);
        if (myBombs.length === 0) return 'Aucune bombe a deplacer';
      }
    }
    return null;
  }

  // Set des positions des bombes (utilise pour bloquer la LOS).
  bombBlockers() {
    const s = new Set();
    for (const f of this.fighters) {
      if (f.alive && f.isBomb) s.add(`${f.c},${f.r}`);
    }
    return s;
  }

  async applySpellEffects(caster, spell, target) {
    for (const effect of spell.effects) {
      await this.applyEffect(effect, caster, spell, target);
      if (this.ended) return;
    }
  }

  async applyEffect(effect, caster, spell, target) {
    switch (effect.type) {
      case 'damage': {
        let cells;
        if (spell.area && spell.area.type === 'line') {
          cells = this.lineCells(caster, target, spell.area.length, !!spell.area.piercing);
        } else if (spell.area && spell.area.type === 'cross') {
          cells = this.crossCells(target.c, target.r, spell.area.size);
        } else if (spell.area && spell.area.type === 'circle') {
          cells = this.circleCells(target.c, target.r, spell.area.radius);
        } else {
          cells = [{ c: target.c, r: target.r }];
        }
        const firstCell = cells[0] || target;
        const dist = Math.abs(caster.c - firstCell.c) + Math.abs(caster.r - firstCell.r);
        const isLine = spell.area && spell.area.type === 'line';
        const isCross = spell.area && spell.area.type === 'cross';
        const isCircle = spell.area && spell.area.type === 'circle';
        const isRanged = dist > 1 && !isLine && !isCircle;

        // VFX d entree selon le pattern du sort.
        let lunge = null;
        if (isLine) {
          // Epee de feu : la lame jaillit du caster et parcourt les cases.
          caster.character.faceToward(firstCell.c, firstCell.r);
          this.vfx && this.vfx.flameSword(caster, cells);
          // Le temps que la lame se forme, attendre un peu avant les impacts.
          await new Promise(r => setTimeout(r, 200));
        } else if (isCross) {
          // Frappe craqueleur (legacy croix) : onde de choc + lunge leger.
          lunge = caster.character.lungeTo(firstCell.c, firstCell.r, 280);
          this.vfx && this.vfx.shockwave(target.c, target.r, { color: 0xb88455, radius: 1.8 });
          this.vfx && this.vfx.punchImpact({ c: target.c, r: target.r });
          await new Promise(r => setTimeout(r, 180));
        } else if (isCircle) {
          // Frappe sismique en zone : le craqueleur plonge sur la case
          // cible (corps a corps) puis une grosse onde de choc se
          // propage tout autour.
          lunge = caster.character.lungeTo(firstCell.c, firstCell.r, 300);
          const radius = (spell.area && spell.area.radius) || 2;
          this.vfx && this.vfx.shockwave(target.c, target.r, {
            color: 0xb88455, radius: radius + 0.8, duration: 0.7,
          });
          this.vfx && this.vfx.punchImpact({ c: target.c, r: target.r });
          await new Promise(r => setTimeout(r, 220));
        } else if (isRanged) {
          // Projectile selon le sort (crachat = vert, generique = orange).
          caster.character.faceToward(target.c, target.r);
          const id = spell.id || '';
          let projColor = 0xffcc66;
          let glow = 0.8;
          let arcHeight = 1.6;
          if (id === 'crachat') { projColor = 0x88dd55; arcHeight = 1.3; }
          else if (id === 'crachatEmpoisonne') { projColor = 0xb471dd; arcHeight = 1.3; }
          else if (id === 'lancerRocher') { projColor = 0x7c6655; glow = 0.4; arcHeight = 1.8; }
          if (this.vfx) {
            await this.vfx.projectile(
              { c: caster.c, r: caster.r },
              { c: target.c, r: target.r },
              { color: projColor, glow, arcHeight },
            );
          }
          this.vfx && this.vfx.flash(target.c, target.r, { color: projColor });
        } else {
          // Corps a corps : on plonge sur la cible + arc tranchant.
          lunge = caster.character.lungeTo(firstCell.c, firstCell.r, 320);
          // Iop pression / morsure : effet melee.
          const id = spell.id || '';
          if (this.vfx) {
            if (id === 'morsureBouftou' || id === 'morsureRoyale') {
              this.vfx.bite({ c: target.c, r: target.r });
            } else {
              this.vfx.slashArc({ c: target.c, r: target.r }, 1);
            }
          }
          await new Promise(r => setTimeout(r, 180));
        }

        const dying = [];
        let touched = 0;
        // Pour la ligne, on echelonne les impacts pour suivre la lame.
        const cellDelay = isLine ? 70 : 0;
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          if (cellDelay && i > 0) await new Promise(r => setTimeout(r, cellDelay));
          const tf = this.fighters.find(f => f.alive && f.c === cell.c && f.r === cell.r);
          if (!tf) continue;
          if (tf === caster) continue;
          const base = effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1));
          const dmg = Math.round(base * caster.damageMultiplier());
          const actual = tf.takeDamage(dmg);
          tf.character.popDamage(actual);
          tf.character.hpBar.setHp(tf.hp, tf.maxHp);
          // Flash d impact sur la cible
          if (this.vfx) this.vfx.flash(cell.c, cell.r, { color: 0xffd166, duration: 0.3 });
          this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} : ${tf.name} subit ${actual} degats`, 'attack');
          if (!tf.alive) dying.push(tf);
          touched++;
        }
        if (touched === 0) {
          this.hud.log && this.hud.log(`${caster.name} lance ${spell.name} (sans cible)`, 'cast');
        }
        if (lunge) await lunge;
        for (const d of dying) {
          this.hud.log && this.hud.log(`${d.name} est vaincu !`, 'death');
          await d.character.die();
        }
        if (dying.length) this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
        return;
      }
      case 'heal':
      case 'heal_percent': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        // Projectile rose de soin si la cible est a distance.
        if (caster !== tf && this.vfx) {
          const d = Math.abs(caster.c - tf.c) + Math.abs(caster.r - tf.r);
          if (d >= 1) {
            caster.character.faceToward(tf.c, tf.r);
            await this.vfx.projectile(
              { c: caster.c, r: caster.r },
              { c: tf.c, r: tf.r },
              { color: 0xff8ec5, glow: 1, radius: 0.18, arcHeight: 1.8 },
            );
          }
        }
        if (this.vfx) this.vfx.healSparkles({ c: tf.c, r: tf.r });
        const amt = effect.type === 'heal'
          ? effect.min + Math.floor(Math.random() * (effect.max - effect.min + 1))
          : Math.round(tf.maxHp * (effect.percent || 0));
        const healed = tf.heal(amt);
        tf.character.popHeal(healed);
        tf.character.hpBar.setHp(tf.hp, tf.maxHp);
        tf.character.flashGlow(0xe91e63, 700);
        this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} : ${tf.name} regagne ${healed} PV`, 'heal');
        await new Promise(r => setTimeout(r, 500));
        return;
      }
      case 'teleport': {
        if (this.vfx) this.vfx.portal(caster.c, caster.r, { color: 0x6ee7b6 });
        await new Promise(r => setTimeout(r, 120));
        await caster.character.teleportTo(target.c, target.r);
        caster.c = target.c;
        caster.r = target.r;
        if (this.vfx) this.vfx.portal(target.c, target.r, { color: 0x6ee7b6 });
        this.hud.log && this.hud.log(`${caster.name} se teleporte (${spell.name})`, 'cast');
        return;
      }
      case 'buff': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        const buffColorHex = parseInt(spell.color.slice(1), 16);
        // Si la cible est a distance et n est pas le caster, on lance un
        // projectile (un crachat-bouclier pour Peau Dure, une etincelle
        // doree pour les autres boosts).
        if (caster !== tf && this.vfx) {
          const d = Math.abs(caster.c - tf.c) + Math.abs(caster.r - tf.r);
          if (d >= 1) {
            caster.character.faceToward(tf.c, tf.r);
            const isShield = !!effect.shield;
            const projColor = isShield
              ? (spell.id === 'peauDure' ? 0x88dd55 : 0xf1c40f)
              : buffColorHex;
            await this.vfx.projectile(
              { c: caster.c, r: caster.r },
              { c: tf.c, r: tf.r },
              { color: projColor, glow: 0.8, radius: 0.16, arcHeight: 1.3 },
            );
          }
        }
        // VFX d application sur la cible.
        if (this.vfx) {
          if (effect.shield) this.vfx.shieldDome({ c: tf.c, r: tf.r }, { color: buffColorHex });
          else this.vfx.buffAura({ c: tf.c, r: tf.r }, { color: buffColorHex });
        }
        const buff = {
          duration: (effect.duration || 1) + 1,
          damageMult: effect.damageMult,
          bonusPa: effect.bonusPa,
          bonusPm: effect.bonusPm,
          shield: effect.shield,
        };
        tf.buffs.push(buff);
        if (effect.bonusPa) tf.pa += effect.bonusPa;
        if (effect.bonusPm) tf.pm += effect.bonusPm;
        tf.character.flashGlow(buffColorHex, 900);
        this.hud.flash(`${spell.name} appliquee a ${tf.name}`, 1200);
        this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} sur ${tf.name}`, 'buff');
        if (this.turn.current() === tf) this.hud.update(tf, this.mode, this.selectedSpellId);
        await new Promise(r => setTimeout(r, 400));
        return;
      }
      case 'debuff_pm': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        // VFX : rocher qui vole jusqu a la cible puis nuage de poussiere.
        if (this.vfx && caster !== tf) {
          caster.character.faceToward(tf.c, tf.r);
          await this.vfx.projectile(
            { c: caster.c, r: caster.r },
            { c: tf.c, r: tf.r },
            { color: 0x7c6655, glow: 0.4, radius: 0.20, arcHeight: 1.8 },
          );
          this.vfx.debuffCloud({ c: tf.c, r: tf.r }, { color: 0x9a8a78 });
        }
        const before = tf.pm;
        tf.pm = Math.max(0, tf.pm - (effect.value || 0));
        const lost = before - tf.pm;
        if (lost > 0) {
          tf.character.popText('-' + lost + ' PM', '#74e69b', {
            fontSize: 22, dx: -0.45, yStart: 1.35, scaleX: 1.1, scaleY: 0.42,
          });
          tf.character.flashGlow(0x7a6b5a, 500);
          this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} : ${tf.name} perd ${lost} PM`, 'buff');
        }
        if (this.turn.current() === tf) this.hud.update(tf, this.mode, this.selectedSpellId);
        await new Promise(r => setTimeout(r, 400));
        return;
      }
      case 'debuff_pa': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        if (this.vfx && caster !== tf) {
          // Le projectile du debuff_pa du crachat n est pas envoye ici
          // car il a deja ete envoye par l effet 'damage' du meme sort.
        }
        const before = tf.pa;
        tf.pa = Math.max(0, tf.pa - (effect.value || 0));
        const lost = before - tf.pa;
        if (lost > 0) {
          tf.character.popText('-' + lost + ' PA', '#7ec6ff', {
            fontSize: 22, dx: 0.45, yStart: 1.35, scaleX: 1.1, scaleY: 0.42,
          });
          tf.character.flashGlow(0x2980b9, 500);
          this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} : ${tf.name} perd ${lost} PA`, 'buff');
        }
        if (this.turn.current() === tf) this.hud.update(tf, this.mode, this.selectedSpellId);
        await new Promise(r => setTimeout(r, 300));
        return;
      }
      case 'dot': {
        const tf = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (!tf) return;
        // VFX : crachat empoisonne (boule violette).
        if (this.vfx && caster !== tf) {
          caster.character.faceToward(tf.c, tf.r);
          await this.vfx.projectile(
            { c: caster.c, r: caster.r },
            { c: tf.c, r: tf.r },
            { color: 0xb471dd, glow: 1, radius: 0.18, arcHeight: 1.4 },
          );
          this.vfx.debuffCloud({ c: tf.c, r: tf.r }, { color: 0x9b59b6 });
        }
        tf.buffs.push({
          duration: (effect.duration || 1) + 1,
          dot: { min: effect.min, max: effect.max },
        });
        tf.character.popText('POISON', '#c39bd3', {
          fontSize: 18, yStart: 1.5, yRise: 0.7, scaleX: 1.1, scaleY: 0.4,
        });
        tf.character.flashGlow(0x9b59b6, 700);
        this.hud.log && this.hud.log(`${caster.name} -> ${spell.name} : ${tf.name} empoisonne`, 'buff');
        await new Promise(r => setTimeout(r, 400));
        return;
      }
      case 'summon': {
        const occupied = this.fighters.find(f => f.alive && f.c === target.c && f.r === target.r);
        if (occupied) return;
        if (this.map3d.isWall(target.c, target.r)) return;
        // VFX : portail magique a l emplacement d apparition.
        if (this.vfx) this.vfx.portal(target.c, target.r, { color: 0xf1c40f, duration: 0.9 });
        await new Promise(r => setTimeout(r, 200));
        const summon = new Fighter(effect.creatureId, caster.team, target.c, target.r);
        summon.character = new Character3D(this.scene3d.scene, effect.creatureId, caster.team, target.c, target.r);
        const closestEnemy = this.fighters
          .filter(f => f.alive && f.team !== caster.team)
          .sort((a, b) =>
            (Math.abs(a.c - target.c) + Math.abs(a.r - target.r)) -
            (Math.abs(b.c - target.c) + Math.abs(b.r - target.r))
          )[0];
        if (closestEnemy) summon.character.faceToward(closestEnemy.c, closestEnemy.r);
        this.fighters.push(summon);
        // L invocation joue juste apres son invocateur.
        this.turn.addFighter(summon, caster);
        summon.character.group.scale.setScalar(0.01);
        await new Promise(resolve => {
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / 450);
            const e = t * t;
            summon.character.group.scale.setScalar(0.01 + 0.99 * e);
            if (t < 1) requestAnimationFrame(tick);
            else { summon.character.group.scale.setScalar(1); resolve(); }
          };
          requestAnimationFrame(tick);
        });
        caster.character.flashGlow(parseInt(spell.color.slice(1), 16), 900);
        this.hud.log && this.hud.log(`${caster.name} invoque ${summon.name}`, 'summon');
        this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
        return;
      }
      case 'placeBomb': {
        // Pose une bombe sur la case visee.
        const bomb = new Fighter('bombeRoublard', caster.team, target.c, target.r);
        bomb.character = new Character3D(this.scene3d.scene, 'bombeRoublard', caster.team, target.c, target.r);
        bomb.bombOwner = caster;
        bomb.bombAge = 0;
        bomb.character.setBombFuse(bomb.def.fuseMax);
        this.fighters.push(bomb);
        caster._bombPlacedThisTurn = true;
        // VFX de pose : petit portail rouge + apparition zoom.
        if (this.vfx) this.vfx.portal(target.c, target.r, { color: 0xc0392b, duration: 0.55 });
        bomb.character.group.scale.setScalar(0.01);
        await new Promise(resolve => {
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / 350);
            const e = t * t;
            bomb.character.group.scale.setScalar(0.01 + 0.99 * e);
            if (t < 1) requestAnimationFrame(tick);
            else { bomb.character.group.scale.setScalar(1); resolve(); }
          };
          requestAnimationFrame(tick);
        });
        caster.character.flashGlow(0xc0392b, 600);
        this.hud.log && this.hud.log(`${caster.name} pose une bombe (50 PV)`, 'summon');
        return;
      }
      case 'moveBomb': {
        // Trouve la bombe du caster la plus proche de la case visee.
        const myBombs = this.fighters.filter(f =>
          f.alive && f.isBomb && f.bombOwner === caster
        );
        if (myBombs.length === 0) return;
        myBombs.sort((a, b) =>
          (Math.abs(a.c - target.c) + Math.abs(a.r - target.r)) -
          (Math.abs(b.c - target.c) + Math.abs(b.r - target.r))
        );
        const bomb = myBombs[0];
        // VFX : petit portail au depart et a l arrivee + teleport.
        if (this.vfx) {
          this.vfx.portal(bomb.c, bomb.r, { color: 0xc0392b, duration: 0.4 });
          this.vfx.portal(target.c, target.r, { color: 0xc0392b, duration: 0.4 });
        }
        await bomb.character.teleportTo(target.c, target.r);
        bomb.c = target.c;
        bomb.r = target.r;
        this.hud.log && this.hud.log(`${caster.name} alimente sa bombe -> (${target.c},${target.r})`, 'cast');
        return;
      }
      case 'detonateBomb': {
        // Le joueur a clique sur une de ses bombes ; on l explose.
        const bomb = this.fighters.find(f =>
          f.alive && f.isBomb && f.c === target.c && f.r === target.r &&
          f.bombOwner === caster
        );
        if (!bomb) {
          this.hud.log && this.hud.log(`${caster.name} : pas de bombe ici`, 'cast');
          return;
        }
        caster.character.flashGlow(0xff5a1f, 500);
        await this.explodeBomb(bomb);
        return;
      }
    }
  }

  // Fait exploser une bombe : VFX, degats en zone (rayon 2 Manhattan),
  // touche allies ET ennemis, et declenche en chaîne toute bombe
  // touchee dans le rayon de l explosion.
  async explodeBomb(bomb) {
    if (!bomb || !bomb.alive || bomb._exploding) return;
    bomb._exploding = true;
    // Aire : on supporte 'circle' (par defaut) ou ancien 'cross'.
    const area = bomb.def.bombArea || { type: 'circle', radius: 2 };
    let cells;
    if (area.type === 'circle') {
      cells = this.circleCells(bomb.c, bomb.r, area.radius || 2);
    } else {
      cells = this.crossCells(bomb.c, bomb.r, area.size || 1);
    }
    const baseDmg = bomb.def.bombDamage || 50;
    const growth = bomb.def.bombDamageGrowth || 0;
    const dmg = Math.round(baseDmg * (1 + growth * bomb.bombAge));
    const radiusVfx = (area.type === 'circle') ? ((area.radius || 2) + 0.6) : 2.4;

    // VFX : grosse onde de choc dimensionnee au rayon + flash central.
    if (this.vfx) {
      this.vfx.shockwave(bomb.c, bomb.r, { color: 0xff5a1f, radius: radiusVfx, duration: 0.75 });
      this.vfx.flash(bomb.c, bomb.r, { color: 0xffd166, duration: 0.5 });
    }
    this.hud.log && this.hud.log(`Bombe explose : ${dmg} degats en zone`, 'attack');
    // Retire la bombe immediatement : elle ne se prend pas ses propres degats.
    bomb.alive = false;
    if (bomb.character) bomb.character.die();
    await new Promise(r => setTimeout(r, 180));

    const dying = [];
    const chained = [];
    for (const cell of cells) {
      const tf = this.fighters.find(f =>
        f.alive && f.c === cell.c && f.r === cell.r
      );
      if (!tf || tf === bomb) continue;
      if (tf.isBomb) {
        // Chain : la bombe touchee n encaisse pas, elle explose a son tour.
        if (!tf._exploding) chained.push(tf);
        continue;
      }
      // Allies comme ennemis : pas de filtre de team.
      const actual = tf.takeDamage(dmg);
      tf.character.popDamage(actual);
      tf.character.hpBar.setHp(tf.hp, tf.maxHp);
      if (this.vfx) this.vfx.flash(cell.c, cell.r, { color: 0xff8a00, duration: 0.3 });
      this.hud.log && this.hud.log(`${tf.name} subit ${actual} degats`, 'attack');
      if (!tf.alive) dying.push(tf);
    }
    for (const d of dying) {
      this.hud.log && this.hud.log(`${d.name} est vaincu !`, 'death');
      await d.character.die();
    }
    if (dying.length) this.hud.setTurnOrder && this.hud.setTurnOrder(this.turn.order, this.turn.current());
    if (this.checkEnd()) return;

    // Explosions en chaîne (apres un petit decalage pour le rendu).
    for (const c of chained) {
      if (this.ended) return;
      await new Promise(r => setTimeout(r, 220));
      await this.explodeBomb(c);
    }
  }

  // Au debut du tour d un combattant, on vieillit toutes ses bombes
  // posees. Quand l age atteint le fusible, la bombe explose avant
  // qu il ne joue son tour.
  async _processOwnedBombsTurnStart(owner) {
    if (!owner) return;
    const myBombs = this.fighters.filter(f =>
      f.alive && f.isBomb && f.bombOwner === owner
    );
    if (myBombs.length === 0) return;
    for (const bomb of myBombs) {
      bomb.bombAge = (bomb.bombAge || 0) + 1;
      const fuseMax = (bomb.def && bomb.def.fuseMax) || 3;
      const remaining = Math.max(0, fuseMax - bomb.bombAge);
      if (bomb.character && bomb.character.setBombFuse) {
        bomb.character.setBombFuse(remaining);
      }
      // Si la bombe est l element epingle dans le panneau info, on
      // rafraichit l affichage (fusible + degats prevus a jour).
      if (this.hud._infoFighter === bomb && this.hud.renderFighterInfo) {
        this.hud.renderFighterInfo();
      }
      if (bomb.bombAge >= fuseMax) {
        this.busy = true;
        await this.explodeBomb(bomb);
        this.busy = false;
        if (this.ended) return;
      }
    }
  }

  // Ligne droite depuis la case cible (`target`) dans la direction
  // caster->target. `piercing` : si true, traverse les murs.
  // `length` : nombre de cases. -1 = jusqu au bord de la carte.
  lineCells(caster, target, length, piercing = false) {
    const dc = Math.sign(target.c - caster.c);
    const dr = Math.sign(target.r - caster.r);
    if (dc === 0 && dr === 0) return [];
    const max = length < 0 ? 999 : length;
    const cells = [];
    for (let i = 0; i < max; i++) {
      const cc = target.c + dc * i;
      const cr = target.r + dr * i;
      if (!this.map3d.inBounds(cc, cr)) break;
      if (!piercing && this.map3d.isWall(cc, cr)) break;
      cells.push({ c: cc, r: cr });
    }
    return cells;
  }

  crossCells(centerC, centerR, size) {
    const cells = [{ c: centerC, r: centerR }];
    for (let i = 1; i <= size; i++) {
      cells.push({ c: centerC + i, r: centerR });
      cells.push({ c: centerC - i, r: centerR });
      cells.push({ c: centerC, r: centerR + i });
      cells.push({ c: centerC, r: centerR - i });
    }
    return cells.filter(c => this.map3d.inBounds(c.c, c.r) && !this.map3d.isWall(c.c, c.r));
  }

  // Cercle / disque (distance Manhattan <= radius) autour d une case.
  // Pour radius=2 ça donne 13 cases.
  circleCells(centerC, centerR, radius) {
    const cells = [];
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.abs(dc) + Math.abs(dr) > radius) continue;
        cells.push({ c: centerC + dc, r: centerR + dr });
      }
    }
    return cells.filter(c => this.map3d.inBounds(c.c, c.r) && !this.map3d.isWall(c.c, c.r));
  }

  refreshRangeOverlay() {
    this.rangeOverlay.clear();
    if (!this.turn || this.busy) return;
    const cur = this.turn.current();
    if (!cur || cur.team !== 'player' || cur.def.ai) return;

    if (this.mode === 'move') {
      const occ = this.computeOccupied(cur);
      const blocked = (c, r) => this.map3d.isBlockedFor(c, r, cur);
      const result = bfs(this.map3d.getData(), occ, { c: cur.c, r: cur.r }, cur.pm, blocked);
      const tiles = [];
      for (const [key, d] of result.dist.entries()) {
        if (d === 0) continue;
        const [c, r] = key.split(',').map(Number);
        tiles.push({ c, r });
      }
      this.rangeOverlay.paint(tiles, 0x6ee7b6, 0.30);
      return;
    }

    if (this.mode === 'spell' && this.selectedSpellId) {
      const spell = SPELLS[this.selectedSpellId];
      if (!spell) return;
      const tiles = [];
      if (spell.area && spell.area.type === 'line') {
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          for (let i = 1; i <= spell.range.max; i++) {
            const c = cur.c + dc * i;
            const r = cur.r + dr * i;
            if (!this.map3d.inBounds(c, r)) break;
            if (this.map3d.isWall(c, r)) break;
            tiles.push({ c, r });
          }
        }
      } else {
        for (let dc = -spell.range.max; dc <= spell.range.max; dc++) {
          for (let dr = -spell.range.max; dr <= spell.range.max; dr++) {
            const d = Math.abs(dc) + Math.abs(dr);
            if (d < spell.range.min || d > spell.range.max) continue;
            const c = cur.c + dc;
            const r = cur.r + dr;
            if (!this.map3d.inBounds(c, r)) continue;
            if (this.map3d.isWall(c, r)) continue;
            tiles.push({ c, r });
          }
        }
      }
      const color = parseInt(spell.color.replace('#', ''), 16);
      this.rangeOverlay.paint(tiles, color, 0.33);
    }
  }

  // ---------- IA ----------
  async runAI() {
    if (this.ended) return;
    const ai = this.turn.current();
    const profile = ai.def.ai || 'aggressive';
    if (profile === 'aggressive') await this.runAggressive(ai);
    else if (profile === 'fearful') await this.runFearful(ai);
    if (this.ended) return;
    this.busy = false;
    this._advanceTurn();
  }

  async runAggressive(ai) {
    if (ai.spells.some(s => s.effects.some(e => e.type === 'heal' || e.type === 'heal_percent'))) {
      const healed = await this.aiTryHeal(ai);
      if (this.ended) return;
      if (healed) await this.aiPause(450);
    }
    let target = this.pickWeakestTarget(ai);
    if (!target) return;
    const attackSpells = ai.spells.filter(s =>
      !ai.isOnCooldown(s.id) &&
      s.effects.some(e => e.type === 'damage' || e.type === 'debuff_pm' || e.type === 'debuff_pa' || e.type === 'dot') &&
      (s.target === 'enemy' || s.target === 'tile')
    );
    if (attackSpells.length === 0) return;
    const shortestRange = attackSpells.reduce((m, s) => Math.min(m, s.range.max), Infinity);

    // Verifie si une cible est en attack-range atteignable en `pm` pas
    // depuis la position actuelle de l ai (utilise BFS).
    const isReachableForAttack = (tgt) => {
      const occ = this.computeOccupied(ai);
      const blocked = (c, r) => this.map3d.isBlockedFor(c, r, ai);
      const myResult = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, ai.pm, blocked);
      for (let dc = -shortestRange; dc <= shortestRange; dc++) {
        for (let dr = -shortestRange; dr <= shortestRange; dr++) {
          if (Math.abs(dc) + Math.abs(dr) > shortestRange) continue;
          const key = `${tgt.c + dc},${tgt.r + dr}`;
          if (myResult.dist.has(key)) return true;
        }
      }
      return false;
    };

    // Si le hero choisi est hors d atteinte ce tour mais qu une bombe
    // ou invocation ennemie est, elle, atteignable (typiquement une
    // bombe qui bloque le passage), on bascule la cible dessus.
    if (!isReachableForAttack(target)) {
      const secondaries = this.fighters
        .filter(f => f.alive && f.team !== ai.team && (f.isBomb || f.isSummon))
        .map(f => ({ f, d: Math.abs(ai.c - f.c) + Math.abs(ai.r - f.r) }))
        .sort((a, b) => a.d - b.d);
      for (const { f } of secondaries) {
        if (isReachableForAttack(f)) {
          target = f;
          this.hud.log && this.hud.log(`${ai.name} cible ${f.name} (route bloquee)`, 'info');
          break;
        }
      }
    }

    if (ai.pm > 0) {
      const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
      if (dist > shortestRange) {
        await this.aiApproach(ai, target, shortestRange);
        await this.aiPause(500);
      }
    }
    if (this.ended) return;

    await this.aiAttackLoop(ai, target, attackSpells);
    if (this.ended) return;

    // Apres avoir attaque : on cherche toujours a se rapprocher d un
    // VRAI personnage (ni bombe ni invocation) pour pouvoir le frapper
    // au prochain tour, plutot que de passer son tour sur place.
    await this.aiRepositionTowardHero(ai, attackSpells);
  }

  // Repositionnement post-attaque : approche le hero le plus proche
  // pour etre a portee au tour suivant. Pour une IA a distance, on
  // garde un ecart ideal ; pour une IA de melee on colle la cible.
  async aiRepositionTowardHero(ai, attackSpells) {
    if (ai.pm <= 0) return;
    const heroes = this.fighters
      .filter(f => f.alive && !f.isBomb && !f.isSummon && f.team !== ai.team)
      .map(f => ({ f, d: Math.abs(ai.c - f.c) + Math.abs(ai.r - f.r) }))
      .sort((a, b) => a.d - b.d);
    if (heroes.length === 0) return;
    const hero = heroes[0].f;
    const maxRange = attackSpells.reduce((m, s) => Math.max(m, s.range.max), 0);
    // Deja a portee de tir d un hero : inutile de bouger.
    if (this.usableSpellsOn(ai, hero, attackSpells.map(s => ({ ...s, apCost: 0 }))).length > 0) {
      return;
    }
    await this.aiPause(400);
    if (maxRange > 1) {
      await this.aiPositionAtRange(ai, hero, Math.max(maxRange - 1, 3), maxRange);
    } else {
      await this.aiApproach(ai, hero, 1);
    }
  }

  // IA peureuse : essaie de tirer le plus loin possible (proche du max
  // range) tout en gardant la ligne de vue. Garde aussi un "tour de
  // soutien" : pose des boucliers sur les allies pas encore proteges.
  async runFearful(ai) {
    // 1. Bouclier prioritaire sur allies
    if (ai.spells.some(s => s.effects.some(e => e.type === 'buff' && e.shield) && s.target === 'ally')) {
      const cast = await this.aiTryShield(ai);
      if (this.ended) return;
      if (cast) await this.aiPause(400);
    }

    const target = this.pickWeakestTarget(ai);
    if (!target) return;
    const attackSpells = ai.spells.filter(s =>
      !ai.isOnCooldown(s.id) &&
      s.effects.some(e => e.type === 'damage' || e.type === 'debuff_pm' || e.type === 'debuff_pa' || e.type === 'dot') &&
      (s.target === 'enemy' || s.target === 'tile')
    );
    if (attackSpells.length === 0) return;
    const maxRange = attackSpells.reduce((m, s) => Math.max(m, s.range.max), 0);

    // 2. Repositionnement : ideal = max-1, sans aller plus pres que 3
    if (ai.pm > 0) {
      const ideal = Math.max(maxRange - 1, 3);
      const moved = await this.aiPositionAtRange(ai, target, ideal, maxRange);
      if (this.ended) return;
      if (moved) await this.aiPause(500);
    }

    await this.aiAttackLoop(ai, target, attackSpells);
    if (this.ended) return;

    // Post-attaque : se rapprocher d un vrai personnage pour etre a
    // portee de tir au prochain tour (au lieu de passer son tour).
    await this.aiRepositionTowardHero(ai, attackSpells);
  }

  aiPause(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async aiAttackLoop(ai, mainTarget, attackSpells) {
    let first = true;
    while (ai.alive) {
      // Choix de la cible de cette passe :
      //  1. Une bombe / invocation en portee qu on peut ACHEVER ce tour
      //     (nettoyage : exception a la priorite "frapper un hero").
      //  2. Sinon la cible principale (un hero en priorite) si attaquable.
      //  3. Sinon, en dernier recours, une bombe / invocation en portee.
      let pick = this.findSecondaryInRange(ai, attackSpells, true);
      if (!pick) {
        if (mainTarget && mainTarget.alive &&
            this.usableSpellsOn(ai, mainTarget, attackSpells).length > 0) {
          pick = mainTarget;
        } else {
          pick = this.findSecondaryInRange(ai, attackSpells, false);
        }
      }
      if (!pick) break;
      const usable = this.usableSpellsOn(ai, pick, attackSpells);
      if (usable.length === 0) break;
      // Preference stricte : portee la plus COURTE d abord (le Craqueleur
      // choisit Frappe range 1 plutot que Lancer Rocher range 6 si les
      // deux sont utilisables). En cas d egalite, meilleur score.
      usable.sort((a, b) => {
        if (a.range.max !== b.range.max) return a.range.max - b.range.max;
        return spellScore(b) - spellScore(a);
      });
      const spell = usable[0];
      if (!first) await this.aiPause(350);
      first = false;
      ai.pa -= spell.apCost;
      if (spell.cooldown) ai.setCooldown(spell.id, spell.cooldown);
      ai.character.popCost(spell.apCost, 'pa');
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await this.applySpellEffects(ai, spell, { c: pick.c, r: pick.r });
      if (this.checkEnd()) return;
    }
  }

  async aiTryHeal(ai) {
    const healSpells = ai.spells.filter(s =>
      !ai.isOnCooldown(s.id) &&
      s.effects.some(e => e.type === 'heal' || e.type === 'heal_percent') &&
      s.target === 'ally'
    );
    if (healSpells.length === 0) return false;
    const wounded = this.fighters.filter(f =>
      f.alive && f.team === ai.team && f !== ai && f.hp < f.maxHp * 0.7
    ).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    if (wounded.length === 0) return false;
    for (const target of wounded) {
      for (const spell of healSpells) {
        if (ai.pa < spell.apCost) continue;
        const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
        if (dist < spell.range.min || dist > spell.range.max) continue;
        if (spell.needsLOS && !hasLOS(this.map3d.getData(), ai.c, ai.r, target.c, target.r, this.bombBlockers())) continue;
        ai.pa -= spell.apCost;
        if (spell.cooldown) ai.setCooldown(spell.id, spell.cooldown);
        ai.character.popCost(spell.apCost, 'pa');
        this.hud.update(ai, this.mode, this.selectedSpellId);
        await this.applySpellEffects(ai, spell, { c: target.c, r: target.r });
        return true;
      }
    }
    return false;
  }

  async aiTryShield(ai) {
    let anyCast = false;
    while (true) {
      const shieldSpells = ai.spells.filter(s =>
        !ai.isOnCooldown(s.id) &&
        s.effects.some(e => e.type === 'buff' && e.shield) &&
        s.target === 'ally' &&
        ai.pa >= s.apCost
      );
      if (shieldSpells.length === 0) return anyCast;
      const candidates = this.fighters.filter(f =>
        f.alive && f.team === ai.team && f !== ai && !f.buffs.some(b => b.shield)
      ).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      if (candidates.length === 0) return anyCast;
      let cast = false;
      for (const target of candidates) {
        for (const spell of shieldSpells) {
          const dist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
          if (dist < spell.range.min || dist > spell.range.max) continue;
          if (spell.needsLOS && !hasLOS(this.map3d.getData(), ai.c, ai.r, target.c, target.r, this.bombBlockers())) continue;
          if (anyCast) await this.aiPause(350);
          ai.pa -= spell.apCost;
          if (spell.cooldown) ai.setCooldown(spell.id, spell.cooldown);
          ai.character.popCost(spell.apCost, 'pa');
          this.hud.update(ai, this.mode, this.selectedSpellId);
          await this.applySpellEffects(ai, spell, { c: target.c, r: target.r });
          cast = true;
          anyCast = true;
          break;
        }
        if (cast) break;
      }
      if (!cast) return anyCast;
      if (this.ended) return anyCast;
    }
  }

  pickWeakestTarget(ai) {
    // Priorite stricte : les VRAIS personnages d abord (ni bombe ni
    // invocation). Les monstres ne s acharnent sur les invocations /
    // bombes que s il ne reste plus aucun hero a frapper.
    const sortWeak = (list) => list.sort((a, b) => {
      if (a.hp !== b.hp) return a.hp - b.hp;
      const da = Math.abs(ai.c - a.c) + Math.abs(ai.r - a.r);
      const db = Math.abs(ai.c - b.c) + Math.abs(ai.r - b.r);
      return da - db;
    });
    const all = this.fighters.filter(f => f.alive && f.team !== ai.team);
    let pool = all.filter(f => !f.isBomb && !f.isSummon);  // vrais heros
    if (pool.length === 0) pool = all.filter(f => f.isSummon); // invocations
    if (pool.length === 0) pool = all;                          // bombes
    if (pool.length === 0) return null;
    sortWeak(pool);
    return pool[0];
  }

  // Sorts d attaque utilisables sur une cible depuis la position de l ai
  // (PA suffisants, dans la portee, ligne de vue si requise).
  usableSpellsOn(ai, tgt, attackSpells) {
    return attackSpells.filter(s => {
      if (s.apCost > ai.pa) return false;
      const d = Math.abs(ai.c - tgt.c) + Math.abs(ai.r - tgt.r);
      if (d < s.range.min || d > s.range.max) return false;
      if (s.needsLOS && !hasLOS(this.map3d.getData(), ai.c, ai.r, tgt.c, tgt.r, this.bombBlockers())) return false;
      return true;
    });
  }

  // Cible secondaire (bombe ou invocation ennemie) attaquable depuis la
  // position courante. Si `mustKill` est vrai, ne retient que celles
  // qu un sort utilisable peut achever ce tour. Renvoie la plus proche.
  findSecondaryInRange(ai, attackSpells, mustKill = false) {
    const secondaries = this.fighters
      .filter(f => f.alive && f.team !== ai.team && (f.isBomb || f.isSummon))
      .map(f => ({ f, d: Math.abs(ai.c - f.c) + Math.abs(ai.r - f.r) }))
      .sort((a, b) => a.d - b.d);
    for (const { f } of secondaries) {
      const usable = this.usableSpellsOn(ai, f, attackSpells);
      if (usable.length === 0) continue;
      if (mustKill) {
        const maxDmg = Math.max(...usable.map(maxDamageOf));
        if (f.hp > maxDmg) continue;
      }
      return f;
    }
    return null;
  }

  async aiApproach(ai, target, range) {
    const occ = this.computeOccupied(ai);
    const blocked = (c, r) => this.map3d.isBlockedFor(c, r, ai);
    // 1. BFS depuis l IA (toutes contraintes : terrain + allies/ennemis).
    const myResult = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, 999, blocked);
    // 2. BFS depuis la cible avec UNIQUEMENT les contraintes de terrain
    //    (pas les autres combattants). Donne la distance topologique
    //    "ideale" : pour la carte cascade, ça force le passage par le
    //    pont meme si les goals immediats sont bloques par des allies.
    const emptyOcc = new Set();
    const tResult = bfs(this.map3d.getData(), emptyOcc, { c: target.c, r: target.r }, 999, blocked);

    // 3. Choix de la case cible :
    //    a) En priorite, une case dans la portee d attaque (Manhattan)
    //       avec la distance ai la plus courte.
    //    b) Sinon, la case atteignable qui minimise la distance
    //       topologique a la cible (sans la traversee des autres
    //       combattants) -> ça force le passage par le pont sur Cascade
    //       au lieu d aller dans des culs-de-sac est/ouest.
    let inRangeGoal = null;
    let inRangeMyDist = Infinity;
    let approachGoal = null;
    let approachTDist = Infinity;
    let approachMyDist = Infinity;
    for (const [key, d] of myResult.dist.entries()) {
      if (d === 0) continue;
      const [c, r] = key.split(',').map(Number);
      const manhattan = Math.abs(c - target.c) + Math.abs(r - target.r);
      const td = tResult.dist.has(key) ? tResult.dist.get(key) : Infinity;
      if (manhattan <= range) {
        if (d < inRangeMyDist) {
          inRangeMyDist = d;
          inRangeGoal = { c, r };
        }
      } else if (td !== Infinity && (td < approachTDist || (td === approachTDist && d < approachMyDist))) {
        approachTDist = td;
        approachMyDist = d;
        approachGoal = { c, r };
      }
    }
    const bestGoal = inRangeGoal || approachGoal;
    if (!bestGoal) return false;
    const fullPath = pathTo(myResult, bestGoal);
    if (!fullPath || fullPath.length <= 1) return false;
    const maxSteps = Math.min(ai.pm, fullPath.length - 1);
    if (maxSteps === 0) return false;
    ai.character.popCost(maxSteps, 'pm');
    const steps = fullPath.slice(1, maxSteps + 1);
    for (const step of steps) {
      ai.pm--;
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await ai.character.moveTo(step.c, step.r, 220);
      ai.c = step.c;
      ai.r = step.r;
    }
    return true;
  }

  // Positionne le combattant a la distance ideale de la cible (1 case
  // de moins que max range, plancher 3), avec ligne de vue obligatoire.
  async aiPositionAtRange(ai, target, idealDist, maxDist) {
    const occ = this.computeOccupied(ai);
    const blocked = (c, r) => this.map3d.isBlockedFor(c, r, ai);
    const result = bfs(this.map3d.getData(), occ, { c: ai.c, r: ai.r }, ai.pm, blocked);
    const scoreDist = (d) => {
      if (d > maxDist) return 1000 + d;
      if (d < 1) return 200 - d;
      return Math.abs(d - idealDist);
    };
    let best = { c: ai.c, r: ai.r };
    const initialDist = Math.abs(ai.c - target.c) + Math.abs(ai.r - target.r);
    let bestScore = scoreDist(initialDist);
    for (const [key, d] of result.dist.entries()) {
      const [c, r] = key.split(',').map(Number);
      const distToTarget = Math.abs(c - target.c) + Math.abs(r - target.r);
      if (distToTarget > maxDist) continue;
      // On veut conserver une ligne de vue sur la cible
      if (!hasLOS(this.map3d.getData(), c, r, target.c, target.r, this.bombBlockers())) continue;
      const s = scoreDist(distToTarget);
      if (s < bestScore) { bestScore = s; best = { c, r }; }
    }
    if (best.c === ai.c && best.r === ai.r) return false;
    const path = pathTo(result, best);
    if (!path || path.length <= 1) return false;
    const steps = path.slice(1);
    if (steps.length === 0) return false;
    ai.character.popCost(steps.length, 'pm');
    for (const step of steps) {
      ai.pm--;
      this.hud.update(ai, this.mode, this.selectedSpellId);
      await ai.character.moveTo(step.c, step.r, 220);
      ai.c = step.c;
      ai.r = step.r;
    }
    return true;
  }

  // ---------- HELPERS ----------
  computeOccupied(exclude) {
    const occ = new Set();
    for (const f of this.fighters) {
      if (!f.alive) continue;
      if (exclude && f === exclude) continue;
      occ.add(`${f.c},${f.r}`);
    }
    return occ;
  }

  refreshHpBars() {
    for (const f of this.fighters) f.character.hpBar.setHp(f.hp, f.maxHp);
  }

  checkEnd() {
    const winner = this.turn ? this.turn.hasWinner() : null;
    if (winner && !this.ended) {
      this.ended = true;
      this.busy = true;
      const combat = this.config && COMBATS[this.config.combatId];
      const enemyLabel = combat ? combat.name : 'tes adversaires';
      setTimeout(() => this.hud.showEnd(winner, () => {
        if (this.onEnd) this.onEnd();
      }, enemyLabel), 600);
      return true;
    }
    return false;
  }
}

function spellScore(spell) {
  let score = 0;
  for (const e of spell.effects) {
    if (e.type === 'damage') score += (e.min + e.max) / 2;
    if (e.type === 'debuff_pm') score += (e.value || 0) * 3;
    if (e.type === 'debuff_pa') score += (e.value || 0) * 4;
    if (e.type === 'dot') score += ((e.min + e.max) / 2) * (e.duration || 1);
  }
  return score;
}

// Degats max qu un sort peut infliger d un coup (sert a estimer si une
// bombe / invocation peut etre achevee ce tour).
function maxDamageOf(spell) {
  let dmg = 0;
  for (const e of spell.effects) {
    if (e.type === 'damage') dmg += e.max;
    if (e.type === 'dot') dmg += e.max * (e.duration || 1);
  }
  return dmg;
}
