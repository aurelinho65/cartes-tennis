// Exporte chaque rareté : fond seul et carte de démonstration, en SVG autonome et en PNG haute définition.
// Usage : npm run export [-- --echelle 4]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { creerCarte } from '../src/carte.js';
import { ORDRE } from '../src/raretes.js';
import { JOUEURS } from '../src/joueurs.js';
import { LARGEUR, HAUTEUR, svgSilhouette } from '../src/silhouette.js';
import { RACINE, policesEmbarquees, trouverChrome } from './commun.mjs';

const arg = process.argv.indexOf('--echelle');
const ECHELLE = arg > 0 ? Number(process.argv[arg + 1]) : 4;
const SORTIE = join(RACINE, 'export');
mkdirSync(SORTIE, { recursive: true });
const polices = policesEmbarquees();
const chrome = trouverChrome();

function png(source, cible, largeur, hauteur, echelle) {
  execFileSync(chrome, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--force-device-scale-factor=${echelle}`, '--default-background-color=00000000',
    `--window-size=${largeur},${hauteur}`, `--screenshot=${cible}`, pathToFileURL(source).href,
  ], { stdio: 'ignore' });
}

const fichiers = [];
writeFileSync(join(SORTIE, 'silhouette.svg'), svgSilhouette());
fichiers.push('silhouette.svg');

for (const r of ORDRE) {
  const variantes = {
    [`fond-${r}`]: creerCarte({ rarete: r, id: `fond-${r}`, options: { donnees: false } }),
    [`carte-${r}-demo`]: creerCarte({ rarete: r, id: `demo-${r}`, joueur: JOUEURS[r], options: { polices } }),
  };
  for (const [nom, svg] of Object.entries(variantes)) {
    const chemin = join(SORTIE, `${nom}.svg`);
    writeFileSync(chemin, svg);
    fichiers.push(`${nom}.svg`);
    if (chrome) { png(chemin, join(SORTIE, `${nom}.png`), LARGEUR, HAUTEUR, ECHELLE); fichiers.push(`${nom}.png`); }
  }
}

// Planche comparative : les quatre cartes côte à côte, avec et sans buste de test.
const marge = 40, ecart = 36, l = LARGEUR * 0.62, h = HAUTEUR * 0.62;
const planche = (buste) => {
  const cartes = ORDRE.map((r, i) =>
    `<div style="position:absolute;left:${marge + i * (l + ecart)}px;top:${marge}px;width:${l}px;height:${h}px">${creerCarte({
      rarete: r, id: `pl${buste ? 'b' : ''}-${r}`, joueur: JOUEURS[r], options: { polices, buste },
    }).replace(/width="600" height="830"/, `width="${l}" height="${h}"`)}</div>`).join('');
  return `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#16181c">${cartes}</body>`;
};
const W = Math.round(marge * 2 + 4 * l + 3 * ecart), H = Math.round(marge * 2 + h);
for (const [nom, buste] of [['planche', false], ['planche-buste', true]]) {
  const html = join(SORTIE, `${nom}.html`);
  writeFileSync(html, planche(buste));
  if (chrome) { png(html, join(SORTIE, `${nom}.png`), W, H, 2); fichiers.push(`${nom}.png`); }
}

console.log(`${fichiers.length} fichiers dans export/ (PNG ×${ECHELLE}${chrome ? '' : ' : Chromium introuvable, PNG ignorés'})`);
