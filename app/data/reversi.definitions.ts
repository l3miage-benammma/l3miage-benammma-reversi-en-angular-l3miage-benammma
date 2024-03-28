import { Signal } from '@angular/core';
import { IntRange, Matrix, Vector, toMatrix, toVector } from './utils';

export type Turn  = 'Player1' | 'Player2';                // Turn : Tour de jeu
export type C     = 'Empty' | Turn;                       // C : Contenu d'une case du plateau

export type Board = Matrix<C, 8, 8>;                      // Le plateau, une matrice 8x8 de C


export type TileCoords = readonly [                       // Une coordonnée de case
  line:   IntRange<0, 8>,                                 //   - ligne:   [0; 8[
  column: IntRange<0, 8>                                  //   - colonne: [0; 8[
]; 
export type PlayImpact = readonly TileCoords[];           // Une liste de coordonnées

export interface GameState {                              // Un état de jeu
    readonly board: Board;                                // L'état du plateau
    readonly turn: Turn;                                  // Le joueur pour qui c'est le tour de jouer
}

export interface ReversiModelInterface {                  // Le modèle du jeu Reversi, au sens MVP/MVC
    readonly sigGameState: Signal<GameState>              // Un signal de l'état courant du jeu
    play(coord: TileCoords): void;                        // Joueur courant joue en <i, j>
    restart(): void;                                      // Redémarre une partie à l'état initiale
}


/**
 * Fonctions dédiées à l'affichage au format texte
 */

export function cToString(c: C): string {                 // Convertit un contenu de case en caractère
	switch(c) {
		case 'Empty':   return " ";
		case 'Player1': return "X";
		case 'Player2': return "O";
	}
}

function LtoString(L: Vector<C, 8>): string {      // Convertit une ligne en chaîne de caractères
	return L.reduce((acc, c) => `${acc}${cToString(c)}`, '');
}

export function BoardtoString(b: Board): string {         // Convertit un plateau en chaîne de caractères
  const top = ["   |", ...Array.from({length: 8}, (_, i) => ` ${i} |`)].join('');
  const bot = ["   └", ...Array.from({length: 7}, () => `----`), "---┘"].join('');
  const sep = ["---+", ...Array.from({length: 8}, () => `---+`)].join('');
  return `${top}
${sep}
${b.map( (L, i) => ` ${i} |${L.map( c => ` ${cToString(c)} ` ).join("|")}|` ).join(`\n${sep}\n`)}
${bot}
`;
}
