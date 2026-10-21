// Briques graphiques réutilisables : court en perspective, cordage, couture de balle,
// guillochage, grains de matière. Aucune ne dépend d'une rareté précise.

import { LARGEUR, HAUTEUR, ZONES } from './silhouette.js';

const f = (n) => +n.toFixed(2);

// ---------------------------------------------------------------------------
// Court vu depuis l'autre côté du filet : le joueur se tient sur sa ligne de fond,
// le filet coïncide avec la bande qui sépare la photo des données.
// z = distance au filet en mètres, X = écart latéral au centre en mètres.
const HORIZON = 74.1, K = 2209.3, Z0 = 5, ECHELLE = 310;
export const DIM = { double: 5.485, simple: 4.115, service: 6.4, fond: 11.885, mur: 17 };

export function projeter(X, z) {
  const q = 1 / (z + Z0);
  return [LARGEUR / 2 + X * ECHELLE * q, HORIZON + K * q];
}

const quad = (X1, z1, X2, z2) =>
  `M${[projeter(X1, z1), projeter(X2, z1), projeter(X2, z2), projeter(X1, z2)].map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

export const yMur = () => projeter(0, DIM.mur)[1];

// Lignes réglementaires dessinées comme surfaces : leur épaisseur suit la perspective.
export function lignesCourt() {
  const { double: D, simple: S, service: SV, fond: F } = DIM;
  const l = 0.05, b = 0.1;
  return [
    quad(-D - l, 0, -D, F + b), quad(D, 0, D + l, F + b),           // couloirs (double)
    quad(-S - l, 0, -S, F + b), quad(S, 0, S + l, F + b),           // simple
    quad(-D - l, F, D + l, F + b),                                   // ligne de fond
    quad(-S, SV, S, SV + l),                                         // ligne de service
    quad(-l / 2, 0, l / 2, SV + l),                                  // ligne médiane de service
    quad(-l / 2, F - 0.12, l / 2, F),                                // marque centrale
  ].join('');
}

export const zoneCourt = () => quad(-DIM.double - 0.05, 0, DIM.double + 0.05, DIM.fond + 0.1);
export const sol = () => quad(-60, 0, 60, DIM.mur);

// Bandes de tonte du gazon, perpendiculaires au jeu.
export function bandesTonte(pas = 1.45) {
  let d = '';
  for (let z = 0, i = 0; z < DIM.mur; z += pas, i++) if (i % 2 === 0) d += quad(-60, z, 60, Math.min(z + pas, DIM.mur));
  return d;
}

// ---------------------------------------------------------------------------
// Couture de balle : deux arcs « )( » inscrits dans un cercle.
export function balle(cx, cy, r) {
  const a = (s) => `M${f(cx + s * 0.62 * r)} ${f(cy - 0.78 * r)}Q${f(cx + s * 0.08 * r)} ${f(cy)} ${f(cx + s * 0.62 * r)} ${f(cy + 0.78 * r)}`;
  return { cercle: `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`, couture: a(-1) + a(1) };
}

// Couture déroulée : onde de la balle, utilisée comme filet ornemental sous le nom.
export function onde(x1, x2, y, amplitude = 3.5, periodes = 2) {
  const n = periodes * 2, pas = (x2 - x1) / n;
  let d = `M${x1} ${y}`;
  for (let i = 0; i < n; i++) {
    const s = i % 2 ? 1 : -1, xa = x1 + i * pas;
    d += `C${f(xa + pas * 0.36)} ${f(y + s * amplitude * 1.33)} ${f(xa + pas * 0.64)} ${f(y + s * amplitude * 1.33)} ${f(xa + pas)} ${y}`;
  }
  return d;
}

// Guillochage : rosace de cercles décalés (moiré fin, entièrement vectoriel).
export function rosace(cx, cy, { n = 48, rayon = 120, decalage = 90 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    s += `<circle cx="${f(cx + Math.cos(a) * decalage)}" cy="${f(cy + Math.sin(a) * decalage)}" r="${rayon}"/>`;
  }
  return s;
}

// Losange (pierres, puces de palmarès).
export const losange = (cx, cy, r) => `M${f(cx)} ${f(cy - r)}L${f(cx + r)} ${f(cy)}L${f(cx)} ${f(cy + r)}L${f(cx - r)} ${f(cy)}Z`;

// ---------------------------------------------------------------------------
// Motifs <pattern> et filtres. u(nom) rend l'identifiant unique propre à la carte.

// Tamis de cordage : montants et travers qui passent alternativement dessus / dessous.
export function motifCordage(u, couleur, epaisseur = 1.1) {
  const p = 14, h = p / 2, g = 2.2;
  const st = `stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round"`;
  return `<pattern id="${u('cordage')}" width="${p}" height="${p}" patternUnits="userSpaceOnUse">
<path ${st} d="M${h / 2} 0V${h / 2 - g}M${h / 2} ${h / 2 + g}V${p}M${h * 1.5} 0V${p}"/>
<path ${st} d="M0 ${h / 2}H${p}M0 ${h * 1.5}H${h / 2 - g}M${h / 2 + g} ${h * 1.5}H${h * 1.5 - g}M${h * 1.5 + g} ${h * 1.5}H${p}"/>
</pattern>`;
}

// Mailles du filet (losanges fins).
export function motifMailles(u, couleur) {
  return `<pattern id="${u('mailles')}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<path d="M0 0H9M0 0V9" stroke="${couleur}" stroke-width="0.7"/></pattern>`;
}

// Grain générique : bruit fractal recoloré, découpé à la forme qui le porte.
export function filtreGrain(id, { frequence = '0.9', octaves = 2, couleur = [0, 0, 0], force = 1, graine = 3 } = {}) {
  const [r, g, b] = couleur.map((c) => f(c / 255));
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${frequence}" numOctaves="${octaves}" seed="${graine}" result="b"/>
<feColorMatrix in="b" type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${f(force)} 0 0 0 ${f(-force * 0.35)}"/>
<feComposite in2="SourceAlpha" operator="in"/></filter>`;
}

// Paillettes : bruit seuillé (sable de résine d'un court en dur, poussière d'or).
export function filtrePaillettes(id, { frequence = 1.6, couleur = [255, 255, 255], seuil = 0.9, graine = 7 } = {}) {
  const [r, g, b] = couleur.map((c) => f(c / 255));
  const table = Array.from({ length: 20 }, (_, i) => (i / 20 >= seuil ? 1 : 0)).join(' ');
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="turbulence" baseFrequency="${frequence}" numOctaves="1" seed="${graine}"/>
<feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 1.4 0 0 0 0"/>
<feComponentTransfer><feFuncA type="discrete" tableValues="${table}"/></feComponentTransfer>
<feComposite in2="SourceAlpha" operator="in"/></filter>`;
}

// Usure : ronge légèrement les lignes (craie sur terre battue).
export function filtreUsure(id, { frequence = 1.1, force = 2.2 } = {}) {
  return `<filter id="${id}" x="-2%" y="-2%" width="104%" height="104%">
<feTurbulence type="fractalNoise" baseFrequency="${frequence}" numOctaves="2" seed="11" result="b"/>
<feColorMatrix in="b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${force} 0 0 0 ${f(-force * 0.32)}" result="m"/>
<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>`;
}

export function filtreOmbreTexte(id, opacite = 0.5) {
  return `<filter id="${id}" x="-20%" y="-30%" width="140%" height="160%">
<feDropShadow dx="0" dy="1.6" stdDeviation="1.8" flood-color="#000" flood-opacity="${opacite}"/></filter>`;
}

export function filtreLueur(id, couleur, ecart = 3) {
  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
<feGaussianBlur in="SourceAlpha" stdDeviation="${ecart}" result="f"/>
<feFlood flood-color="${couleur}"/><feComposite in2="f" operator="in" result="l"/>
<feMerge><feMergeNode in="l"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

// ---------------------------------------------------------------------------
// Dégradés.
export function lineaire(id, arrets, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, unites } = {}) {
  const u = unites ? ` gradientUnits="${unites}"` : '';
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${u}>${arrets
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`)
    .join('')}</linearGradient>`;
}

export function radial(id, arrets, { cx = 0.5, cy = 0.5, r = 0.5, unites, fx, fy } = {}) {
  const u = unites ? ` gradientUnits="${unites}"` : '';
  const foyer = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${foyer}${u}>${arrets
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`)
    .join('')}</radialGradient>`;
}

// Trajectoire de balle : parabole passant derrière le joueur, balle en haut à droite.
export const TRAJECTOIRE = {
  chemin: 'M-12 132C84 84 214 54 352 70',
  balle: [352, 70],
};

export { LARGEUR, HAUTEUR, ZONES };
