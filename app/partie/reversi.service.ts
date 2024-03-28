import { Injectable, Signal, WritableSignal, signal, computed } from '@angular/core';
import { GameState, ReversiModelInterface, TileCoords } from '../data/reversi.definitions';
import { initialGameState, tryPlay } from '../data/reversi.game';

@Injectable({
  providedIn: 'root'
})
export class ReversiService implements ReversiModelInterface  {
  private readonly _sigGameState: WritableSignal<GameState> = signal<GameState>(initialGameState);
  readonly sigGameState: Signal<GameState> = computed( () => this._sigGameState() );

  constructor() {}

  play(coord: TileCoords): void {
    this._sigGameState.update( () => tryPlay(this.sigGameState(), coord[0], coord[1]));
  }

  restart(): void {
    this._sigGameState.set(initialGameState);
  }
}
