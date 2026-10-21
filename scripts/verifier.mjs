// Contrôles automatiques : génération de chaque rareté, identifiants uniques, références
// url(#…) résolues, balises équilibrées, silhouette identique partout, polices présentes.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { creerCarte } from '../src/carte.js';
import { ORDRE } from '../src/raretes.js';
import { JOUEURS } from '../src/joueurs.js';
import { cheminSilhouette, svgSilhouette } from '../src/silhouette.js';
import { RACINE } from './commun.mjs';

let echecs = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ok ' : '  ÉCHEC'} ${msg}`); if (!cond) echecs++; };

function equilibre(svg) {
  const pile = [];
  const sansTexte = svg.replace(/<style[\s\S]*?<\/style>/g, '');
  for (const [, ferme, nom, auto] of sansTexte.matchAll(/<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g)) {
    if (auto) continue;
    if (!ferme) pile.push(nom);
    else if (pile.pop() !== nom) return false;
  }
  return pile.length === 0;
}

function controler(svg, etiquette) {
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const uniques = new Set(ids);
  ok(ids.length === uniques.size, `${etiquette} : ${ids.length} identifiants, tous uniques`);
  const refs = [...new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))];
  const manquants = refs.filter((r) => !uniques.has(r));
  ok(manquants.length === 0, `${etiquette} : ${refs.length} références url(#…) résolues${manquants.length ? ' — manquants : ' + manquants.join(', ') : ''}`);
  ok(equilibre(svg), `${etiquette} : balises équilibrées`);
  ok(!/NaN|undefined/.test(svg), `${etiquette} : aucune valeur NaN / undefined`);
  ok(svg.includes(`d="${cheminSilhouette()}"`), `${etiquette} : contour = silhouette de référence`);
  return ids;
}

console.log('Cartes');
const tous = [];
for (const r of ORDRE) {
  for (const donnees of [true, false]) {
    const id = `${r}-${donnees ? 'c' : 'f'}`;
    const svg = creerCarte({ rarete: r, id, joueur: JOUEURS[r], options: { donnees, buste: true, reperes: true } });
    tous.push(...controler(svg, `${r}${donnees ? '' : ' (fond seul)'}`));
  }
}
ok(new Set(tous).size === tous.length, 'Identifiants uniques entre cartes affichées sur la même page');

console.log('Silhouette');
const d = cheminSilhouette();
const nombres = d.match(/-?\d+(\.\d+)?/g).map(Number);
const xs = nombres.filter((_, i) => i % 2 === 0), ys = nombres.filter((_, i) => i % 2 === 1);
ok(Math.min(...xs) >= 0 && Math.max(...xs) <= 600 && Math.min(...ys) >= 0 && Math.max(...ys) <= 830, 'points dans le repère 600 × 830');
const pts = [];
for (let i = 0; i < nombres.length; i += 2) pts.push(`${nombres[i]},${nombres[i + 1]}`);
const sym = pts.every((p) => { const [x, y] = p.split(',').map(Number); return pts.some((q) => { const [a, b] = q.split(',').map(Number); return Math.abs(a - (600 - x)) < 0.02 && Math.abs(b - y) < 0.02; }); });
ok(sym, 'symétrie gauche / droite exacte');
ok(svgSilhouette().startsWith('<svg'), 'SVG de silhouette autonome');

console.log('Ressources');
for (const g of [500, 600, 700]) ok(existsSync(join(RACINE, 'assets/fonts', `barlow-condensed-${g}.woff2`)), `police Barlow Condensed ${g}`);
ok(existsSync(join(RACINE, 'assets/fonts/OFL.txt')), 'licence OFL des polices');

console.log(echecs ? `\n${echecs} échec(s).` : '\nTous les contrôles passent.');
process.exit(echecs ? 1 : 0);
