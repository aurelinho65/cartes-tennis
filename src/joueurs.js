// Joueurs fictifs de démonstration (noms inventés, aucune personne réelle visée).
// majeurs : [surface, titres] dans l'ordre de la saison (dur, terre, gazon, dur).
export const JOUEURS = {
  classique: {
    nom: 'Roux', pays: 'FRA', note: 74, style: 'CPL', classement: 41, main: 'D',
    stats: { SER: 72, RET: 70, CDR: 76, REV: 71, VOL: 68, MEN: 74 },
    majeurs: [['dur', 0], ['terre', 0], ['gazon', 0], ['dur', 0]],
  },
  rare: {
    nom: 'Ferrer', pays: 'ESP', note: 83, style: 'CTR', classement: 12, main: 'G',
    stats: { SER: 76, RET: 86, CDR: 88, REV: 80, VOL: 70, MEN: 87 },
    majeurs: [['dur', 0], ['terre', 1], ['gazon', 0], ['dur', 0]],
  },
  elite: {
    nom: 'Kessler', pays: 'AUT', note: 89, style: 'ATQ', classement: 3, main: 'D',
    stats: { SER: 93, RET: 84, CDR: 91, REV: 86, VOL: 82, MEN: 88 },
    majeurs: [['dur', 2], ['terre', 0], ['gazon', 1], ['dur', 1]],
  },
  legende: {
    nom: 'Dorval', pays: 'FRA', note: 95, style: 'S&V', classement: 1, main: 'D',
    stats: { SER: 96, RET: 90, CDR: 92, REV: 93, VOL: 97, MEN: 95 },
    majeurs: [['dur', 4], ['terre', 2], ['gazon', 6], ['dur', 3]],
    serie: 'N° 01 / 100',
  },
};
