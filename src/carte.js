// Assemble une carte : silhouette (silhouette.js) + matériau (raretes.js) + données variables.
// Calques, du fond vers l'avant : matière, court, lumière, photo, filet, panneau, cadre, données.

import { LARGEUR, HAUTEUR, ZONES, cheminSilhouette } from './silhouette.js';
import {
  yMur, sol, zoneCourt, lignesCourt, balle, onde, losange, lineaire, radial,
  motifCordage, motifMailles, filtreOmbreTexte,
} from './motifs.js';
import { RARETES } from './raretes.js';

const f = (n) => +n.toFixed(2);
const echapper = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const POLICE = "'Barlow Condensed','Bahnschrift SemiCondensed','Arial Narrow',sans-serif";

export const STATS = ['SER', 'RET', 'CDR', 'REV', 'VOL', 'MEN'];
export const STATS_LIBELLES = { SER: 'Service', RET: 'Retour', CDR: 'Coup droit', REV: 'Revers', VOL: 'Volée', MEN: 'Mental' };

// Drapeaux simplifiés (bandes seules, sans armoiries).
const DRAPEAUX = {
  FRA: ['v', '#002654', '#ffffff', '#ce1126'], ITA: ['v', '#008c45', '#f4f5f0', '#cd212a'],
  BEL: ['v', '#000000', '#fdda24', '#ef3340'], IRL: ['v', '#169b62', '#ffffff', '#ff883e'],
  DEU: ['h', '#000000', '#dd0000', '#ffce00'], AUT: ['h', '#c8102e', '#ffffff', '#c8102e'],
  NLD: ['h', '#ae1c28', '#ffffff', '#21468b'], ESP: ['h1', '#aa151b', '#f1bf00', '#aa151b'],
};

function drapeau(code, cx, cy, u) {
  const d = DRAPEAUX[code];
  const L = 36, H = 24, x = cx - L / 2, y = cy - H / 2;
  if (!d) return `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="17" font-weight="700" letter-spacing="1">${echapper(code)}</text>`;
  const [sens, ...c] = d;
  const bandes = sens === 'v'
    ? c.map((col, i) => `<rect x="${f(x + (i * L) / 3)}" y="${y}" width="${f(L / 3 + 0.2)}" height="${H}" fill="${col}"/>`)
    : sens === 'h'
      ? c.map((col, i) => `<rect x="${x}" y="${f(y + (i * H) / 3)}" width="${L}" height="${f(H / 3 + 0.2)}" fill="${col}"/>`)
      : [`<rect x="${x}" y="${y}" width="${L}" height="${H}" fill="${c[0]}"/>`, `<rect x="${x}" y="${y + H / 4}" width="${L}" height="${H / 2}" fill="${c[1]}"/>`];
  return `<g clip-path="url(#${u('clipDrapeau')})">${bandes.join('')}</g>
<rect x="${x}" y="${y}" width="${L}" height="${H}" rx="3" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>`;
}

// Buste neutre, uniquement pour juger la lisibilité dans l'aperçu (jamais exporté par défaut).
function buste() {
  return `<g fill="#0b0b0b" fill-opacity=".5">
<ellipse cx="300" cy="262" rx="58" ry="72"/>
<path d="M266 318Q272 352 268 368L300 380L332 368Q328 352 334 318Z"/>
<path d="M120 516C124 440 176 404 252 386Q300 400 348 386C424 404 476 440 480 516Z"/></g>`;
}

const SURFACE_COULEUR = { dur: '#3f7fd6', terre: '#d06a3a', gazon: '#4f9a66' };

// Puces « majeurs » : un tournoi du Grand Chelem par surface, nombre de titres au centre.
function majeurs(liste, x, y0, th) {
  return liste.map(([surface, n], i) => {
    const y = y0 + i * 31;
    const vide = !n;
    return `<g opacity="${vide ? 0.38 : 1}">
<path d="${losange(x, y, 13)}" fill="${SURFACE_COULEUR[surface]}" stroke="${th.texte}" stroke-opacity=".7" stroke-width="1"/>
<text x="${x}" y="${y + 5.6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${n}</text></g>`;
  }).join('');
}

export function creerCarte({ rarete = 'classique', joueur = null, id = 'carte', options = {} } = {}) {
  const th = RARETES[rarete];
  if (!th) throw new Error(`Rareté inconnue : ${rarete}`);
  const o = { donnees: true, buste: false, reperes: false, trajectoire: true, polices: '', photo: null, ...options };
  const u = (nom) => `${id}-${nom}`;
  const yF = ZONES.filet.y;
  const contour = cheminSilhouette();

  // --- Définitions -----------------------------------------------------------
  const defs = [
    `<clipPath id="${u('clip')}"><path d="${contour}"/></clipPath>`,
    `<clipPath id="${u('haut')}"><rect width="${LARGEUR}" height="${yF}"/></clipPath>`,
    `<clipPath id="${u('clipDrapeau')}"><rect x="${300 - 136}" y="${ZONES.pied.y - 12}" width="36" height="24" rx="3"/></clipPath>`,
    lineaire(u('fond'), th.fond.map((c, i) => [i / (th.fond.length - 1), c])),
    lineaire(u('mur'), [[0, th.mur[0]], [1, th.mur[1]]], { y1: 0, y2: yMur(), unites: 'userSpaceOnUse' }),
    lineaire(u('fonduCourt'), [[0, '#fff', 0], [0.42, '#fff', 0.55], [1, '#fff', 1]], { y1: 90, y2: yF, unites: 'userSpaceOnUse' }),
    `<mask id="${u('masqueCourt')}"><rect width="${LARGEUR}" height="${yF}" fill="url(#${u('fonduCourt')})"/></mask>`,
    lineaire(u('panneau'), th.panneau.map((c, i) => [i / (th.panneau.length - 1), c.slice(0, 7), c.length > 7 ? 0 : 1]),
      { y1: yF, y2: HAUTEUR, unites: 'userSpaceOnUse' }),
    lineaire(u('cadre'), th.cadre, { x1: 0, y1: 0, x2: LARGEUR, y2: HAUTEUR, unites: 'userSpaceOnUse' }),
    lineaire(u('bande'), [[0, th.filetBande[0]], [1, th.filetBande[1]]]),
    lineaire(u('reflet'), [[0, '#fff', 0], [0.42, '#fff', 0], [0.5, '#fff', 0.13], [0.58, '#fff', 0], [1, '#fff', 0]],
      { x1: 0, y1: 0, x2: 1, y2: 0.62 }),
    radial(u('halo'), [[0, th.halo[0], th.halo[1]], [1, th.halo[0], 0]], { cx: 300, cy: 280, r: 230, unites: 'userSpaceOnUse' }),
    radial(u('vignette'), [[0.55, '#000', 0], [1, '#000', 0.55]], { cx: 300, cy: 380, r: 520, unites: 'userSpaceOnUse' }),
    lineaire(u('fonduPhoto'), [[0, '#fff'], [0.8, '#fff'], [1, '#fff', 0]], { y1: ZONES.photo.y, y2: yF, unites: 'userSpaceOnUse' }),
    `<mask id="${u('masquePhoto')}"><rect x="0" y="0" width="${LARGEUR}" height="${yF}" fill="url(#${u('fonduPhoto')})"/></mask>`,
    motifCordage(u, th.cordage[0]),
    motifMailles(u, th.filetBande[0]),
    filtreOmbreTexte(u('ombre'), 0.55),
    th.defs(u),
  ];
  if (o.polices) defs.unshift(`<style>${o.polices}</style>`);

  // --- Fond : matière, court en perspective, lumière ---------------------------
  const lignes = `<path d="${lignesCourt()}" fill="${th.lignes.couleur}" opacity="${th.lignes.opacite}"${th.lignes.usure ? ` filter="url(#${u('usure')})"` : ''}/>`;
  const court = `<g clip-path="url(#${u('haut')})">
<rect width="${LARGEUR}" height="${f(yMur() + 1)}" fill="url(#${u('mur')})"/>
<g mask="url(#${u('masqueCourt')})">
<path d="${sol()}" fill="${th.sol}"/><path d="${zoneCourt()}" fill="${th.court}"/>
${th.surSol(u)}
${lignes}
</g>
<rect y="${f(yMur() - 1)}" width="${LARGEUR}" height="2.2" fill="${th.lignes.couleur}" opacity=".12"/>
</g>`;

  const lumiere = `<rect width="${LARGEUR}" height="${yF}" fill="url(#${u('halo')})"/>`;

  const photo = o.photo
    ? `<g mask="url(#${u('masquePhoto')})"><image href="${echapper(o.photo)}" x="${ZONES.photo.x}" y="${ZONES.photo.y}" width="${ZONES.photo.largeur}" height="${ZONES.photo.hauteur}" preserveAspectRatio="xMidYMax slice"/></g>`
    : '';

  // --- Bande de filet et panneau de données -----------------------------------
  const panneau = `<rect y="${yF}" width="${LARGEUR}" height="${HAUTEUR - yF}" fill="url(#${u('panneau')})"/>
<rect y="${yF}" width="${LARGEUR}" height="${HAUTEUR - yF}" fill="url(#${u('cordage')})" opacity="${f(th.cordage[1] * 1.3)}"/>
<rect y="${yF + 5}" width="${LARGEUR}" height="16" fill="url(#${u('mailles')})" opacity=".14"/>
<rect y="${yF - 4}" width="${LARGEUR}" height="9" fill="url(#${u('bande')})"/>
<rect y="${yF - 4}" width="${LARGEUR}" height="1.4" fill="#fff" opacity=".7"/>
<rect y="${yF + 5}" width="${LARGEUR}" height="5" fill="#000" opacity=".28"/>`;

  // --- Cadre : jonc métallique + filets intérieurs ------------------------------
  const cadre = `<path d="${contour}" fill="none" stroke="url(#${u('cadre')})" stroke-width="13"/>
<path d="${cheminSilhouette(6.5)}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1"/>
${th.filets.map(({ r, l, o: op }) => `<path d="${cheminSilhouette(r)}" fill="none" stroke="url(#${u('cadre')})" stroke-width="${l}" opacity="${op}"/>`).join('')}
${th.pierres ? th.pierres(u) : ''}`;

  // --- Données variables ------------------------------------------------------
  let donnees = '';
  if (o.donnees && joueur) {
    const j = joueur;
    const { x: nx, y: ny } = ZONES.note;
    const s = ZONES.stats;
    const colonnes = STATS.map((k, i) => {
      const x = s.x0 + i * s.pas;
      const sep = i ? `<rect x="${f(x - s.pas / 2 - 0.5)}" y="${s.y + 4}" width="1" height="48" fill="${th.accent}" opacity=".22"/>` : '';
      return `${sep}<text x="${x}" y="${s.y + 14}" text-anchor="middle" font-size="16" font-weight="600" letter-spacing="1.6" fill="${th.accent}">${k}</text>
<text x="${x}" y="${s.y + 52}" text-anchor="middle" font-size="40" font-weight="700" fill="${th.texte}">${j.stats[k]}</text>`;
    }).join('');
    const emb = balle(ZONES.embleme.x, ZONES.embleme.y - 4, 10.5);
    const pied = ZONES.pied.y;
    donnees = `<g font-family="${POLICE}" fill="${th.texte}">
<g filter="url(#${u('ombre')})">
<text x="${nx}" y="${ny + 30}" text-anchor="middle" font-size="92" font-weight="700" letter-spacing="-2">${j.note}</text>
<text x="${nx}" y="${ny + 62}" text-anchor="middle" font-size="27" font-weight="600" letter-spacing="2.5" fill="${th.accent}">${echapper(j.style)}</text>
<rect x="${nx - 22}" y="${ny + 76}" width="44" height="1.4" fill="${th.accent}" opacity=".7"/>
<text x="${nx}" y="${ny + 104}" text-anchor="middle" font-size="25" font-weight="700">N°${j.classement}</text>
<text x="${nx}" y="${ny + 121}" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="2.4" fill="${th.accent}">MONDE</text>
<text x="${LARGEUR - nx}" y="${ny - 34}" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="2.4" fill="${th.accent}">MAJEURS</text>
${majeurs(j.majeurs, LARGEUR - nx, ny - 6, th)}
</g>
<text x="${ZONES.nom.x}" y="${ZONES.nom.y}" text-anchor="middle" font-size="46" font-weight="700" letter-spacing="3.5">${echapper(j.nom.toUpperCase())}</text>
<path d="${onde(244, 356, ZONES.nom.y + 17, 3, 2)}" fill="none" stroke="${th.accent}" stroke-width="1.5" opacity=".8"/>
${colonnes}
<rect x="96" y="${pied - 32}" width="408" height="1" fill="${th.accent}" opacity=".22"/>
${drapeau(j.pays, 300 - 118, pied, u)}
<text x="300" y="${pied + 6.5}" text-anchor="middle" font-size="18" font-weight="600" letter-spacing="2.2" fill="${th.accent}">${echapper(th.surface.toUpperCase())}</text>
<text x="${300 + 118}" y="${pied + 6.5}" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="1.5">${j.main === 'G' ? 'GAUCHER' : 'DROITIER'}</text>
<g fill="none" stroke="${th.accent}" stroke-width="1.3" opacity=".9"><path d="${emb.cercle}"/><path d="${emb.couture}"/></g>
${th.serie && j.serie ? `<text x="300" y="${ZONES.embleme.y + 25}" text-anchor="middle" font-size="12" font-weight="600" letter-spacing="1.6" fill="${th.accent}">${echapper(j.serie)}</text>` : ''}
</g>`;
  }

  // --- Repères (aperçu) ---------------------------------------------------------
  const p = ZONES.photo;
  const reperes = o.reperes
    ? `<g fill="none" stroke="#ff3b8d" stroke-width="1.2" stroke-dasharray="6 4"><rect x="${p.x}" y="${p.y}" width="${p.largeur}" height="${p.hauteur}"/>
<path d="M300 ${p.y}V${yF}"/></g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="${LARGEUR}" height="${HAUTEUR}" data-rarete="${rarete}">
<defs>${defs.join('\n')}</defs>
<g clip-path="url(#${u('clip')})">
<path d="${contour}" fill="url(#${u('fond')})"/>
${court}
${th.dessus(u, o)}
${lumiere}
${o.buste ? buste() : ''}
${photo}
${panneau}
<rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#${u('vignette')})"/>
${th.film ? `<rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#${u('holo')})" opacity=".1" style="mix-blend-mode:overlay"/>` : ''}
<rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#${u('reflet')})" style="mix-blend-mode:soft-light"/>
${cadre}
</g>
${donnees}
${reperes}
</svg>`;
}
