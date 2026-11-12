import * as THREE from 'three';
import { M, sculptSphere } from './kit.js';
import { buildBouftou } from './bouftou.js';
import { crown, smooth } from './monsterKitA.js';

// Bouftou Royal : le Bouftou en version royale (laine creme a reflets
// dores, grosses cornes d or) agrandi, coiffe d une couronne posee sur
// le toupet entre les cornes et couvert d un tapis de selle royal rouge
// a galon d or jete sur le dos.
// Le Bouftou agrandi reste le premier enfant du groupe (Rig.js anime ses
// pattes a travers ce sous-groupe).
export function buildBouftouRoyal() {
  const group = new THREE.Group();

  const S = 1.4;
  const body = buildBouftou({ royal: true });
  body.scale.setScalar(S);
  group.add(body);

  // ---- Cape : coque posee sur la toison, galon dore sur le bord ----
  const red = new THREE.Color(0xb3202c), goldC = new THREE.Color(0xf6c63a);
  const capeMat = M(0xb3202c, { r: 0.8 });
  const cols = [];
  const cape = sculptSphere((d, out) => {
    // Distance au bord : festons sur les flancs et la croupe, encolure
    // en biais derriere la tete.
    const a = Math.atan2(d.x, -d.z);
    const hang = 0.11 * Math.abs(Math.cos(a * 3.5));
    const sd = Math.min(d.y - 0.02 - hang, d.y * 0.6 - d.z * 0.8 + 0.22);
    const w = smooth(-0.05, 0.0, sd);
    const r = 0.43 * (0.8 + 0.43 * w);
    out.set(d.x * r * 1.04, d.y * r * 0.93, d.z * r * 1.1);
    const trim = smooth(0.17, 0.13, sd);
    const c = red.clone().lerp(goldC, trim);
    cols.push(c.r / red.r, c.g / red.g, c.b / red.b);
  }, capeMat, 120, 80);
  cape.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  capeMat.vertexColors = true;
  cape.position.set(0, 0.6 * S, -0.07 * S);
  cape.scale.setScalar(S);
  group.add(cape);

  // ---- Couronne sur le toupet, entre les cornes ----
  const c = crown(0.2, 0.2, { points: 5, flare: 0.26, valley: 0.45, cap: 0x8a1a2a });
  c.position.set(0, 1.4, 0.49);
  c.rotation.x = 0.16;
  group.add(c);

  return group;
}
