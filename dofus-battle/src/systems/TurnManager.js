// Gere l ordre de jeu et les transitions de tours.

export class TurnManager {
  constructor(fighters) {
    // ordre par initiative descendante
    this.order = [...fighters].sort((a, b) => b.initiative - a.initiative);
    this.index = 0;
    this.round = 1;
  }

  current() {
    return this.order[this.index];
  }

  // Avance jusqu au prochain combattant vivant. Renvoie le nouveau current.
  advance() {
    let safety = 0;
    do {
      this.index++;
      if (this.index >= this.order.length) {
        this.index = 0;
        this.round++;
      }
      safety++;
      if (safety > this.order.length * 2) return null;
    } while (!this.current().alive);
    return this.current();
  }

  livingByTeam(team) {
    return this.order.filter(f => f.alive && f.team === team);
  }

  hasWinner() {
    const t1 = this.livingByTeam('player').length > 0;
    const t2 = this.livingByTeam('enemy').length > 0;
    if (!t1) return 'enemy';
    if (!t2) return 'player';
    return null;
  }
}
