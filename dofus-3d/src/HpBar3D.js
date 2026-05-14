import * as THREE from 'three';

// Barre de vie 3D au-dessus de la tete d un combattant.
// Implementee avec un Sprite + CanvasTexture pour qu elle face toujours
// la camera et qu on puisse y dessiner le texte hp/maxHp.
export class HpBar3D {
  constructor(team) {
    this.team = team;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 36;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.material = new THREE.SpriteMaterial({
      map: this.texture, transparent: true, depthTest: false,
    });
    this.sprite = new THREE.Sprite(this.material);
    this.sprite.scale.set(1.1, 0.25, 1);
    this.sprite.renderOrder = 999;
    this.hp = 1;
    this.maxHp = 1;
    this.draw();
  }

  setHp(hp, maxHp) {
    this.hp = Math.max(0, hp);
    this.maxHp = maxHp;
    this.draw();
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Fond noir avec un peu d arrondi
    ctx.fillStyle = 'rgba(20, 20, 28, 0.92)';
    roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill();

    // Bordure couleur d equipe
    ctx.strokeStyle = this.team === 'player' ? '#2ecc71' : '#e74c3c';
    ctx.lineWidth = 3;
    roundRect(ctx, 2, 2, w - 4, h - 4, 6);
    ctx.stroke();

    // Barre remplie : toujours rouge, conformement a la demande joueur.
    const ratio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = '#e74c3c';
    roundRect(ctx, 4, 4, (w - 8) * ratio, h - 8, 4);
    ctx.fill();

    // Texte hp / maxHp avec outline
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(`${this.hp} / ${this.maxHp}`, w / 2, h / 2);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${this.hp} / ${this.maxHp}`, w / 2, h / 2);

    this.texture.needsUpdate = true;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 1 || h < 1) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
