import { ChangeDetectionStrategy, Component, Signal, computed, signal } from '@angular/core';
import { produce } from 'immer';
import { GameState, BoardtoString, TileCoords, Turn } from '../data/reversi.definitions';
import { whereCanPlay } from '../data/reversi.game';
import { Matrix, initMatrix } from '../data/utils';
import { ReversiService } from './reversi.service';

export interface GameStateAll {
  readonly gameState: GameState;
  readonly listPlayable: readonly TileCoords[];
  readonly isPlayable: Matrix<boolean, 8, 8>;
  readonly scores: Readonly<{ Player1: number, Player2: number }>;
  readonly boardString: string;
  readonly winner: undefined | "Drawn" | Turn;
  readonly iaForPlayer1: boolean;
  readonly iaForPlayer2: boolean;
}

@Component({
  selector: 'app-partie',
  templateUrl: './partie.component.html',
  styleUrls: ['./partie.component.scss'],
  providers: [ReversiService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartieComponent {
  private readonly game: Signal<GameState>;
  readonly gameStateAll: Signal<GameStateAll>;

  readonly iaForPlayer1 = signal(false);
  readonly iaForPlayer2 = signal(false);

  readonly canPlay = computed<boolean>(() => {
    const gsa = this.gameStateAll();
    const turn = gsa.gameState.turn;
    return turn === "Player1" && !gsa.iaForPlayer1
        || turn === "Player2" && !gsa.iaForPlayer2;
  })

  constructor(readonly reversiService: ReversiService) {
    this.game = this.reversiService.sigGameState;
    this.gameStateAll = computed<GameStateAll>(() => ({
      gameState: this.game(),
      boardString: BoardtoString(this.game().board),
      listPlayable: [...whereCanPlay(this.game())],
      isPlayable: produce(initMatrix(() => false, 8, 8), (mutableMatrice: { [x: string]: { [x: string]: boolean; }; }) => {
        [...whereCanPlay(this.game())].forEach(
          (value: TileCoords)  => mutableMatrice[value[0]][value[1]] = true
          )
      }),
      scores: {Player1: this.calculScore("Player1", this.game()), Player2: this.calculScore("Player2", this.game())} ,
      winner: this.GetWinner(this.game()),
      iaForPlayer1: this.iaForPlayer1(),
      iaForPlayer2: this.iaForPlayer2()
    }))

  }

  GetWinner(gs: GameState) {
    let scorePlayer1: number = 0;
    let scorePlayer2: number = 0;
    let winner: undefined | "Drawn" | Turn;

    if ([...whereCanPlay(this.game())].length == 0) {
      scorePlayer1 = this.calculScore('Player1', gs);
      scorePlayer2 = this.calculScore('Player2', gs);
      winner = (scorePlayer1 > scorePlayer2)
      ? 'Player1'
      : (scorePlayer2 > scorePlayer1)
      ? 'Player2'
      : 'Drawn'; 
    }

    return winner;
  }

  calculScore(player: string, gs: GameState): number {
    let count = 0;
    for (const row of gs.board) {
      for (const col of row) {
        if (col == player) {
          count++;
        }
      }
    }
    return count;
  }



  play(coord: TileCoords): void {
    try {  
      if ((coord[0] >= 0 && coord[0] <= 8) && (coord[1] >= 0 && coord[1] <= 8)) {
        this.reversiService.play( coord as unknown as TileCoords)
      }
    } catch (error) {
      console.log('error: ', error);
    } 
  }

  /**
   * Mise à jour du status de l'IA pour le joueur player.
   * @param player Le joueur considéré
   * @param status Un booléen indiquant si le joueur doit être géré par l'IA ou non
   */
  changeBotPlayerStatus(player: Turn, status: boolean) {
    if (player === "Player1") {
      this.iaForPlayer1.set(status);
    } else {
      this.iaForPlayer2.set(status);
    }
  }

  reset(): void {
    this.reversiService.restart();
  }

}
