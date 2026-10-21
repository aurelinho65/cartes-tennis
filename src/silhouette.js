// Géométrie de la carte : seule source de vérité pour la silhouette extérieure.
// Repère 600 × 830 (rapport 0,723), points relevés sur la référence décrite dans docs/silhouette.md.
// Toutes les raretés utilisent ce même chemin ; seuls les matériaux changent.

export const LARGEUR = 600;
export const HAUTEUR = 830;

// Zones réservées aux éléments variables (coordonnées dans le repère de la carte).
export const ZONES = {
  photo: { x: 92, y: 52, largeur: 440, hauteur: 468 },  // bas du portrait fondu jusqu'au filet
  note: { x: 118, y: 172 },                             // centre de la note globale
  filet: { y: 516 },                                     // bande « filet » : séparation photo / données
  nom: { x: 300, y: 566 },
  stats: { y: 618, x0: 112.5, pas: 75 },                 // 6 colonnes
  pied: { y: 724 },                                      // drapeau, surface, main
  embleme: { x: 300, y: 778 },
};

// Point du chemin, décalé vers l'intérieur de r unités.
// Le décalage est une approximation calibrée point par point (un vrai offset de Bézier
// n'est pas nécessaire pour des filets décoratifs de quelques unités).
function points(r) {
  return {
    sommet: [300, r],
    arcC1: [210, r],
    arcC2: [125 + 0.2 * r, 14 + r],
    encoche: [71.6 + 0.35 * r, 45.3 + 1.05 * r],
    encC1: [62 + 0.3 * r, 72 + 0.9 * r],
    encC2: [28 + 0.5 * r, 88.4 + r],
    epaule: [r, 88.4 + r],
    flanc: [r, 708 - 0.3 * r],
    coinC1: [r, 745 - 0.6 * r],
    coinC2: [14 + 0.7 * r, 760 - 0.95 * r],
    coin: [42 + 0.6 * r, 766 - 0.95 * r],
    basC1: [130, 786.5 - r],
    basC2: [250, 804 - 1.05 * r],
    pointe: [300, 829.5 - 1.15 * r],
  };
}

const f = (n) => +n.toFixed(2);
const pt = ([x, y]) => `${f(x)} ${f(y)}`;
const miroir = ([x, y]) => [LARGEUR - x, y];

// Chemin fermé de la silhouette, éventuellement rétréci de r unités (cadres, filets).
export function cheminSilhouette(r = 0) {
  const p = points(r);
  const m = (k) => pt(miroir(p[k]));
  const g = (k) => pt(p[k]);
  return [
    `M${g('sommet')}`,
    `C${m('arcC1')} ${m('arcC2')} ${m('encoche')}`,
    `C${m('encC1')} ${m('encC2')} ${m('epaule')}`,
    `L${m('flanc')}`,
    `C${m('coinC1')} ${m('coinC2')} ${m('coin')}`,
    `C${m('basC1')} ${m('basC2')} ${g('pointe')}`,
    `C${g('basC2')} ${g('basC1')} ${g('coin')}`,
    `C${g('coinC2')} ${g('coinC1')} ${g('flanc')}`,
    `L${g('epaule')}`,
    `C${g('encC2')} ${g('encC1')} ${g('encoche')}`,
    `C${g('arcC2')} ${g('arcC1')} ${g('sommet')}Z`,
  ].join('');
}

// Coordonnées utiles pour placer des ornements sur la silhouette.
export function repere(nom, r = 0, cote = 'gauche') {
  const p = points(r)[nom];
  return cote === 'droite' ? miroir(p) : p;
}

// Silhouette seule, prête pour un masque CSS (mask-image) ou un outil de découpe.
export function svgSilhouette({ remplissage = '#000' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}"><path d="${cheminSilhouette()}" fill="${remplissage}"/></svg>`;
}
