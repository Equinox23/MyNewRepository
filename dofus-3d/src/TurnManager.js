// Ordre d initiative et detection de fin de partie.
export class TurnManager {
  constructor(fighters) {
    this.order = [...fighters].sort((a, b) => b.initiative - a.initiative);
    this.index = 0;
    this.round = 1;
  }

  current() {
    return this.order[this.index];
  }

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

  hasWinner() {
    const players = this.order.filter(f => f.alive && f.team === 'player').length;
    const enemies = this.order.filter(f => f.alive && f.team === 'enemy').length;
    if (players === 0) return 'enemy';
    if (enemies === 0) return 'player';
    return null;
  }
}
