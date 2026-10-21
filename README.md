# Match Point — cartes de tennis à collectionner

Fond de carte premium sur la silhouette FUT, décliné en quatre raretés qui ne diffèrent que par la matière. Aucune dépendance : JavaScript (modules ES) qui produit du SVG, utilisable dans le navigateur comme dans Node.

```
npm start          # aperçu comparatif → http://localhost:5173
npm run verifier   # contrôles automatiques
npm run export     # (-- --echelle 8 pour du 4800 × 6640) SVG + PNG haute définition dans export/
```

L'export PNG utilise un Chromium headless trouvé automatiquement : Playwright, Chrome ou Edge, ou le chemin indiqué par `CHROME_PATH`. 

## Architecture

| Fichier | Rôle |
| --- | --- |
| `src/silhouette.js` | **Géométrie seule** : contour, décalages intérieurs, zones réservées (`ZONES`). Voir [docs/silhouette.md](docs/silhouette.md). |
| `src/motifs.js` | Briques graphiques neutres : court en perspective, cordage, mailles, couture de balle, rosace, grains, dégradés. |
| `src/raretes.js` | **Matières** : une entrée par rareté (couleurs, filtres, ornements). Ne touche jamais à la géométrie. |
| `src/carte.js` | Assemblage : fond, puis photo, puis panneau, puis cadre, puis **données variables** (`creerCarte`). |
| `src/joueurs.js` | Joueurs fictifs de démonstration. |
| `index.html` | Comparaison côte à côte : bascules, inclinaison et reflet au survol, import de photo, téléchargement SVG. |
| `scripts/` | Serveur local, export, vérifications. |
| `essai/photo.html` | Test de l'emplacement photo avec une image synthétique. |

```js
import { creerCarte } from './src/carte.js';
const svg = creerCarte({
  rarete: 'elite',                 // classique | rare | elite | legende
  id: 'carte-42',                  // préfixe unique : plusieurs cartes sur une page sans conflit
  joueur: { nom: 'Nom', pays: 'FRA', note: 88, style: 'ATQ', classement: 5, main: 'D',   // main : D | G
            stats: { SER: 90, RET: 84, CDR: 88, REV: 85, VOL: 79, MEN: 87 },
            majeurs: [['dur', 2], ['terre', 0], ['gazon', 1], ['dur', 1]] },
  options: { donnees: true, photo: 'portrait.png', trajectoire: true },
});
```

Avec `donnees: false`, on obtient le fond vierge (`export/fond-*.svg`), qui sert ensuite de base dans un autre outil.

## Raretés

| Rareté | Surface | Matière | Lumière |
| --- | --- | --- | --- |
| Classique | Gazon | bandes de tonte, craie ivoire | jonc ivoire mat |
| Rare | Terre battue | grain double, lignes usées, traces de traîne | double jonc cuivre |
| Élite | Dur, session de nuit | résine sablée, projecteurs, trajectoire jaune optique | jonc chromé, reflet holo léger au survol |
| Légende | Court central | onyx, rosace guillochée, poussière d'or, pierres serties, numéro de série | or champagne, film holographique |

La perspective du court est calculée, et non dessinée à main levée. Le filet tombe exactement sur la bande qui sépare la photo des données : le joueur se tient « sur sa ligne de fond ».

## Ressources et licences

- **Police :** Barlow Condensed, sous licence SIL Open Font License, donc utilisable commercialement (`assets/fonts/OFL.txt`). Elle est embarquée en base64 dans les SVG exportés.
- **Graphismes :** tous les motifs sont générés par le code ; aucune image tierce.
- **Drapeaux :** versions simplifiées en bandes (l'Espagne est rendue sans ses armoiries).

## Limites connues

- La silhouette est **mesurée sur une image** et non sur un gabarit officiel (voir docs/silhouette.md).
- L'impression demande un passage en CMJN chez l'imprimeur : l'export est en RVB. Un fond perdu reste à ajouter selon le gabarit de l'imprimeur, par exemple en étendant `fond` au-delà de `cheminSilhouette(0)`.
- Les modes de fusion (`mix-blend-mode`) et les filtres `feTurbulence` sont fidèles dans les navigateurs, mais peuvent varier dans Illustrator ou Inkscape. Pour l'impression, utilisez de préférence les PNG.
