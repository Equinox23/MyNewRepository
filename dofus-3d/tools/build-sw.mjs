// Regenere sw.js : liste de tous les fichiers du jeu a mettre en cache
// pour le mode hors ligne + numero de version (empreinte du contenu).
// A lancer apres chaque modification du jeu :  node tools/build-sw.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const include = ['index.html', 'manifest.webmanifest', 'src', 'vendor', 'icons'];
const files = [];
const walk = (rel) => {
  const abs = path.join(root, rel);
  const st = fs.statSync(abs);
  if (st.isDirectory()) {
    for (const f of fs.readdirSync(abs).sort()) walk(path.posix.join(rel, f));
  } else if (!path.basename(rel).startsWith('_')) {
    files.push(rel);
  }
};
include.forEach(walk);

const hash = crypto.createHash('sha1');
for (const f of files) hash.update(f).update(fs.readFileSync(path.join(root, f)));
const version = hash.digest('hex').slice(0, 10);

const template = fs.readFileSync(path.join(root, 'tools', 'sw.template.js'), 'utf8');
const out = template
  .replace('__VERSION__', version)
  .replace('__FILES__', JSON.stringify(['./', ...files.map(f => './' + f)], null, 2));
fs.writeFileSync(path.join(root, 'sw.js'), out);
console.log(`sw.js : ${files.length} fichiers, version ${version}`);
