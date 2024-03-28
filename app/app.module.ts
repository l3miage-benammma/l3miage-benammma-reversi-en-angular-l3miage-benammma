import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { PartieComponent } from './partie/partie.component';
import { PlateauComponent } from './partie/plateau/plateau.component';
import { PlayerScoreComponent } from './partie/player-score/player-score.component';

@NgModule({
  declarations: [
    AppComponent,
    PartieComponent,
    PlateauComponent,
    PlayerScoreComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
