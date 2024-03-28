import { produce } from "immer";
import { Board, C, GameState, PlayImpact, TileCoords, Turn } from "./reversi.definitions";
import { Vector, initMatrix } from "./utils";

const emptyBoard: Board = produce(initMatrix(() => `Empty` satisfies C as C, 8, 8), M => {
    M = M.map<Vector<C, 8>>(L => L.map<C>(c => c));
});

const initialBoard: Board = produce(emptyBoard, draft => {
    draft[4][3] = draft[3][4] = 'Player1';
    draft[3][3] = draft[4][4] = 'Player2';
});

export const initialGameState: GameState = produce({ board: emptyBoard, turn: 'Player2' } satisfies GameState as GameState, draft => {
    draft.board = initialBoard;
    draft.turn = 'Player1';
});

/**
 * Liste les positions de pions pris si le joueur courant joue en <line, column>.
 * @param gs L'état de jeu courant.
 * @param line La ligne où le joueur courant joue.
 * @param column La colonne où le joueur courant joue.
 * @returns liste des positions de pions pris si le joueur courant joue en <line, column>.
 */
export function PionsTakenIfPlayAt(gs: GameState, line: number, column: number): PlayImpact {
    if (gs.board.at(line)?.at(column) !== 'Empty')
        return [] as PlayImpact;

    type DELTA = -1 | 0 | 1;
    type DIRECTION = { [k in DELTA]: k extends 0 ? [k, Exclude<DELTA, 0>] : [k, DELTA] }[DELTA];

    const directions: DIRECTION[] = [
      [1, -1], [1, 0], [1, 1],
      [0, -1], [0, 1], 
      [-1, -1], [-1, 0], [-1, 1]
    ]
    const adversaire: Turn = gs.turn === 'Player1' ? 'Player2' : 'Player1';

    return directions.reduce(
        (L, [dx, dy]) => {
            let X = line as TileCoords[0];
            let Y = column as TileCoords[1];
            let Ltmp: TileCoords[] = [];
            while (X + dx >= 0 && Y + dy >= 0 && gs.board.at(X + dx)?.at(Y + dy) === adversaire) {
                Ltmp.push([X += dx, Y += dy] as TileCoords);
            }
            if (X + dx >= 0 && Y + dy >= 0 && gs.board.at(X + dx)?.at(Y + dy) === gs.turn && Ltmp.length > 0) {
                L.push(...Ltmp);
            }
            return L;
        },
        [] as TileCoords[]
    ); // fin reduce
}

 /**
   * Liste les positions pour lesquels le joueur courant pourra prendre des pions adverse.
   * Il s'agit donc des coups possibles pour le joueur courant.
   * @param gs L'état de jeu courant.
   * @returns liste des positions jouables par le joueur courant.
   */
 export function whereCanPlay(gs: GameState): readonly TileCoords[] {
    const L: TileCoords[] = []; [].forEach
    gs.board.forEach( (line, i) => line.forEach( (c, j) => {
      if (PionsTakenIfPlayAt(gs, i, j).length > 0) {
        L.push( [i, j] );
      }
    }));

    return L;
  }

  /**
   * Le joueur courant pose un pion en i,j.
   * Si le coup n'est pas possible (aucune position de prise), alors le pion n'est pas joué et le tour ne change pas.
   * Sinon les positions sont prises et le tour de jeu change.
   * @param gs L'état de jeu courant.
   * @param line L'indice de la ligne où poser le pion.
   * @param column L'indice de la colonen où poser le pion.
   * @returns Le nouvel état de jeu si le joueur courant joue en i,j, l'ancien état si il ne peut pas jouer en i,j
   */
  export function tryPlay(gs: GameState, line: number, column: number): GameState {
    const L = PionsTakenIfPlayAt(gs, line, column);
    if (L.length > 0) {
      let ngs = produce(gs, ngs => {
        ngs.turn = gs.turn == "Player1" ? "Player2" : "Player1";
        const LT = [...L, [line, column] ] as readonly TileCoords[];
        LT.forEach( ([i, j]) => {
          try {
            ngs.board[i][j] = gs.turn
          } catch(err) {
            console.error(`tryPlay: erreur en [${i}, ${j}]`, line, column, L);
            throw err;
          }
        });
      });
      
      // If opponent player cannot play, then current player plays again
      if (whereCanPlay(ngs).length === 0) {
        ngs = produce(ngs, draft => {draft.turn = gs.turn;} );
      }
      return ngs;
    } else {
      return gs;
    }
  }

  