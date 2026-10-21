# Silhouette de la carte

## Source et méthode

- **Forme visée :** le gabarit « FUT » des cartes EA Sports FC, soit un écusson avec une arche haute, deux encoches concaves aux épaules, des flancs droits, des coins arrondis et une pointe basse.
- **Référence de mesure :** un visuel conceptuel de fans, publié par realsport101 dans l'article *FC 25 card designs*. Ce n'est pas un fichier officiel. Le point de départ de la recherche était le créateur de cartes de Futbin, qui reprend la même silhouette.
- **Méthode :**
  - les points d'appui (sommet, encoches, épaules, coins, pointe) ont été relevés à l'œil sur l'image agrandie, puis ramenés dans un repère 600 × 830 ;
  - le rapport 0,723 est celui de la référence mesurée ;
  - seule la moitié gauche est décrite, et la droite en est le miroir exact (le contrôle `npm run verifier` le vérifie).
- **Aucune** illustration, texture, logo ni tracé vectoriel d'EA n'a été importé : le chemin est entièrement redessiné en Bézier dans `src/silhouette.js`.

## Ce qui n'est pas garanti

- **Géométrie exacte non vérifiée.** Sans gabarit officiel vectoriel, l'écart avec une carte réelle n'est pas mesurable. Il est probablement de l'ordre de quelques unités sur 600, surtout dans la courbure des encoches et de l'arche. Pour une correspondance stricte, il suffit de remplacer les points de `points(r)` par des cotes relevées sur un gabarit dont on a les droits : tout le reste suit.
- **Décalage intérieur approximatif.** `cheminSilhouette(r)` rétrécit le contour point par point, avec des coefficients calibrés. Ce n'est pas un vrai offset de courbe. L'approximation suffit pour des filets décoratifs (r ≤ 15), mais pas pour une découpe mécanique.
- **Propriété intellectuelle.** La forme générale des cartes FUT peut être protégée comme élément distinctif (*trade dress*) ou par un dessin et modèle. Le brief impose cette silhouette ; avant toute commercialisation, faites valider ce point par un juriste. Le reste de la carte (matières, ornements, mise en page interne, typographie) est original.

## Utilisation

| Fonction | Usage |
| --- | --- |
| `cheminSilhouette(0)` | contour de découpe (clip-path, outil de découpe d'impression) |
| `cheminSilhouette(r)` | filets et joncs intérieurs |
| `repere(nom, r, cote)` | coordonnées d'un point remarquable, pour placer des ornements |
| `svgSilhouette()` | fichier SVG autonome (masque CSS, gabarit d'imprimeur) ; exporté dans `export/silhouette.svg` |
