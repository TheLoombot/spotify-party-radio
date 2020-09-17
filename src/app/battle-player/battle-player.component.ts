import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SpotifyService } from '../shared/services/spotify.service';
import { DeckService } from '../shared/services/deck.service';
import { interval, Subscription } from 'rxjs';
import { Track } from '../shared/models/track';
import { BattlePlayerService } from '../shared/services/battle-player.service';

@Component({
  selector: 'app-battle-player',
  templateUrl: './battle-player.component.html',
})
export class BattlePlayerComponent implements OnInit {

  @Input() battleId: string;
  @Input() user1: string;
  @Input() user2: string;
  progressSub: Subscription;
  progress: number = 0;
  deckSub1: Subscription;
  deckSub2: Subscription;
  deck1Tracks;
  deck2Tracks;
  nowPlaying: Track;
  battleSub: Subscription;


  constructor(
    private titleService: Title,
    private spotifyService: SpotifyService,
    private deckService: DeckService,
    private battlePlayerService: BattlePlayerService,
    ) { }

  ngOnInit(): void {
    this.progressSub = interval(1000)
    .subscribe(
      () => {
        if (this.nowPlaying) {
          this.progress = this.calcProgress(this.nowPlaying); // Update Progress
        }
      }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.battleSub && this.battleId) {
      this.battleSub = this.battlePlayerService.getBattle(this.battleId).subscribe(
        (object) => {
          this.user1 = object['user1'];
          this.user2 = object['user2'];
          this.nowPlaying = object['nowPlaying'];
        }
        );
    }

    if (!this.deckSub1 && this.user1) {
      this.deckSub1 = this.deckService.getDeckTracks(this.user1).subscribe(
        (tracks) => {
          this.deck1Tracks = tracks as Array<Track>;
          console.log(this.deck1Tracks);
        }
      );
    }    

    if (!this.deckSub2 && this.user2) {
      this.deckSub2 = this.deckService.getDeckTracks(this.user2).subscribe(
        (tracks) => {
          this.deck2Tracks = tracks as Array<Track>;
          console.log(this.deck2Tracks);
        }
      );
    }

  }

  private calcProgress(nowPlaying: Track): number {
    return Math.floor( 100 * ( 1 - (nowPlaying.expires_at - this.getTime() ) / nowPlaying.duration_ms) );
  }

  private getTime(): number {
    return new Date().getTime();
  }

  ngOnDestroy(): void {
    this.progressSub.unsubscribe();
    this.deckSub1.unsubscribe();
    this.deckSub2.unsubscribe();
    this.battleSub.unsubscribe();
  }

}
