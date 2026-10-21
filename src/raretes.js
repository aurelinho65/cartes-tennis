// Les quatre raretés. Chacune est un matériau (couleurs, grain, lumière) posé sur la même
// silhouette et la même mise en page ; aucune ne modifie la géométrie.

import {
  projeter, DIM, yMur, sol, zoneCourt, bandesTonte, rosace, losange, lineaire, radial,
  filtreGrain, filtrePaillettes, filtreUsure, TRAJECTOIRE,
} from './motifs.js';
import { repere, LARGEUR } from './silhouette.js';

const f = (n) => +n.toFixed(2);

// Traces de traîne sur terre battue : arcs concentriques aplatis par la perspective.
function traces() {
  let d = '';
  for (const [z, X] of [[2.5, 3.2], [5.2, 4.6], [8.4, 3.8], [10.6, 5.2]]) {
    const [x1, y1] = projeter(-X, z), [x2] = projeter(X, z), [, yc] = projeter(0, z + 1.6);
    d += `M${f(x1)} ${f(y1)}Q${f((x1 + x2) / 2)} ${f(2 * yc - y1)} ${f(x2)} ${f(y1)}`;
  }
  return d;
}

// Cônes de projecteurs (session de nuit).
function projecteurs(u) {
  const cone = (x, sens) => `M${x} -10L${x + sens * 34} -10L${x + sens * 230} ${yMur() + 60}L${x - sens * 30} ${yMur() + 60}Z`;
  return `<path d="${cone(70, 1)}${cone(530, -1)}" fill="url(#${u('cone')})" filter="url(#${u('flou')})" style="mix-blend-mode:screen"/>`;
}

// Trajectoire de balle : traînée effilée puis balle feutrée.
function trajectoire(u, couleur, feutre) {
  const [bx, by] = TRAJECTOIRE.balle;
  return `<g filter="url(#${u('lueurTraj')})">
<path d="${TRAJECTOIRE.chemin}" fill="none" stroke="url(#${u('traj')})" stroke-width="3" stroke-linecap="round"/>
<circle cx="${bx}" cy="${by}" r="8.5" fill="${feutre}"/>
<path d="M${bx - 5.3} ${by - 6.4}Q${bx - 1.2} ${by} ${bx - 5.3} ${by + 6.4}M${bx + 5.3} ${by - 6.4}Q${bx + 1.2} ${by} ${bx + 5.3} ${by + 6.4}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.1"/>
</g>`;
}

const defsTrajectoire = (u, couleur) =>
  lineaire(u('traj'), [[0, couleur, 0], [0.55, couleur, 0.35], [1, couleur, 0.95]], { x1: -12, y1: 132, x2: 352, y2: 70, unites: 'userSpaceOnUse' }) +
  `<filter id="${u('lueurTraj')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// Pierres serties dans les encoches (Légende).
function pierres(u) {
  return ['gauche', 'droite'].map((c) => {
    const [x, y] = repere('encoche', 7, c);
    return `<path d="${losange(x, y + 3, 6.5)}" fill="url(#${u('pierre')})" stroke="#fff3d0" stroke-width=".8"/>
<path d="${losange(x, y + 3, 2.2)}" fill="#fff" opacity=".85"/>`;
  }).join('');
}

export const RARETES = {
  classique: {
    nom: 'Classique', surface: 'Gazon', code: 'GAZ',
    fond: ['#2f6d4c', '#1b4732', '#0f2a1d'],
    mur: ['#0c2318', '#163b28'],
    sol: '#2b6747', court: '#2e6c4a',
    lignes: { couleur: '#efe9d4', opacite: 0.62 },
    panneau: ['#14382600', '#10301f', '#0b2116'],
    cordage: ['#e9f3e6', 0.05],
    filetBande: ['#f4f1e6', '#cfc8b2'],
    cadre: [[0, '#f6f1e1'], [0.35, '#d8cfb1'], [0.6, '#9a906f'], [1, '#e9e2c9']],
    filets: [{ r: 10, l: 1.1, o: 0.55 }],
    texte: '#f7f2e2', accent: '#ddd2ac', discret: '#a9b9a6',
    halo: ['#7fb38f', 0.32],
    defs: (u) => '',
    surSol: (u) => `<path d="${bandesTonte()}" fill="#4f8d64" opacity=".22"/>`,
    dessus: () => '',
  },

  rare: {
    nom: 'Rare', surface: 'Terre battue', code: 'TER',
    fond: ['#c8673a', '#9b4321', '#5b220e'],
    mur: ['#3a1609', '#5f2810'],
    sol: '#b85a30', court: '#be5f33',
    lignes: { couleur: '#f6ebdc', opacite: 0.78, usure: true },
    panneau: ['#5a241000', '#542210', '#341308'],
    cordage: ['#ffe2c8', 0.06],
    filetBande: ['#fff4e8', '#e0c7b0'],
    cadre: [[0, '#ffd9b3'], [0.3, '#d08550'], [0.62, '#7a3a18'], [1, '#f0b98a']],
    filets: [{ r: 9.5, l: 1.2, o: 0.75 }, { r: 14, l: 0.7, o: 0.45 }],
    texte: '#fff4e7', accent: '#f6c9a1', discret: '#e2a582',
    halo: ['#f2a575', 0.3],
    defs: (u) => filtreGrain(u('grain'), { frequence: '1.15', octaves: 3, couleur: [70, 22, 6], force: 0.9, graine: 5 }) +
      filtreGrain(u('grainClair'), { frequence: '2.3', octaves: 1, couleur: [255, 214, 180], force: 0.55, graine: 9 }) +
      filtreUsure(u('usure')),
    surSol: (u) => `<path d="${sol()}" fill="#000" filter="url(#${u('grain')})" opacity=".55"/>
<path d="${sol()}" fill="#000" filter="url(#${u('grainClair')})" opacity=".35"/>
<path d="${traces()}" fill="none" stroke="#e48c5c" stroke-width="5" stroke-linecap="round" opacity=".22"/>`,
    dessus: () => '',
  },

  elite: {
    nom: 'Élite', surface: 'Dur', code: 'DUR',
    fond: ['#143f84', '#0b2658', '#050e29'],
    mur: ['#040b20', '#0a1b44'],
    sol: '#123c78', court: '#1b5bab',
    lignes: { couleur: '#f2f6ff', opacite: 0.82 },
    panneau: ['#081a3e00', '#081a3e', '#040b22'],
    cordage: ['#cfe0ff', 0.06],
    filetBande: ['#ffffff', '#c9d3e4'],
    cadre: [[0, '#ffffff'], [0.22, '#b8c3d3'], [0.45, '#55627a'], [0.7, '#e8edf5'], [1, '#8d99ad']],
    filets: [{ r: 9.5, l: 1.3, o: 0.8 }, { r: 14, l: 0.6, o: 0.5 }],
    texte: '#f3f7ff', accent: '#d7f34a', discret: '#8fa6cf',
    halo: ['#5d8fe0', 0.38],
    defs: (u) => filtrePaillettes(u('sable'), { frequence: 1.7, seuil: 0.86, graine: 4 }) +
      lineaire(u('cone'), [[0, '#e4edff', 0.22], [1, '#e4edff', 0]]) + `<filter id="${u('flou')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>` +
      defsTrajectoire(u, '#d7f34a'),
    surSol: (u) => `<path d="${zoneCourt()}" fill="#000" filter="url(#${u('sable')})" opacity=".16"/>`,
    dessus: (u, opts) => projecteurs(u) + (opts.trajectoire ? trajectoire(u, '#d7f34a', '#d7f34a') : ''),
  },

  legende: {
    nom: 'Légende', surface: 'Court central', code: 'CTL',
    fond: ['#24211c', '#12110e', '#060606'],
    mur: ['#050505', '#121110'],
    sol: '#141310', court: '#1a1814',
    lignes: { couleur: '#e9c57a', opacite: 0.55 },
    panneau: ['#0b0a0800', '#0d0c0a', '#050504'],
    cordage: ['#f3d9a0', 0.07],
    filetBande: ['#fbefd2', '#c9a35e'],
    cadre: [[0, '#fff3cf'], [0.2, '#f1d48f'], [0.42, '#a87a32'], [0.6, '#6b4a1b'], [0.8, '#e9c77d'], [1, '#b8893b']],
    filets: [{ r: 9, l: 1.4, o: 0.95 }, { r: 13.5, l: 0.8, o: 0.7 }],
    texte: '#fbf0d6', accent: '#ecc97f', discret: '#b49a6a',
    halo: ['#c9a35e', 0.24],
    serie: true,
    defs: (u) => lineaire(u('holo'), [[0, '#ff8ad8'], [0.2, '#8fd4ff'], [0.4, '#b6ffb0'], [0.6, '#fff1a0'], [0.8, '#ffb38a'], [1, '#c9a0ff']],
      { x1: 0, y1: 0, x2: LARGEUR, y2: 830, unites: 'userSpaceOnUse' }) +
      radial(u('pierre'), [[0, '#fffbe8'], [0.45, '#f1d48f'], [1, '#7a5520']], { cx: 0.35, cy: 0.3, r: 0.8 }) +
      filtrePaillettes(u('poussiere'), { frequence: 1.3, couleur: [243, 217, 160], seuil: 0.9, graine: 12 }) +
      defsTrajectoire(u, '#f1d48f'),
    surSol: (u) => `<g fill="none" stroke="#e9c57a" stroke-width=".5" opacity=".11">${rosace(300, 290, { n: 72, rayon: 118, decalage: 118 })}</g>`,
    dessus: (u, opts) => (opts.trajectoire ? trajectoire(u, '#f1d48f', '#f3d9a0') : '') +
      `<rect width="600" height="516" fill="#000" filter="url(#${u('poussiere')})" opacity=".35"/>`,
    film: true,
    pierres,
  },
};

export const ORDRE = ['classique', 'rare', 'elite', 'legende'];
