import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SpotifyService } from '../shared/services/spotify.service';
import { DeckService } from '../shared/services/deck.service';
import { interval, Subscription, combineLatest } from 'rxjs';
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
  decks = {};
  nowPlaying: Track;
  currentDJ: string;

  combSub: Subscription;

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

    console.log(`input battleid ${this.battleId}, input user1 ${this.user1}, input user2 ${this.user2} in OnInit`);
  }

  ngOnChanges(changes: SimpleChanges): void {

    console.log(changes);

    const deck1$ = this.deckService.getDeckTracks(this.user1);
    const deck2$ = this.deckService.getDeckTracks(this.user2);
    const battle$ = this.battlePlayerService.getBattle(this.battleId);

    if (this.battleId && this.user1 && this.user2) {
      this.combSub = combineLatest(deck1$, deck2$, battle$).subscribe(
        ([deck1, deck2, battle]) => {
          this.decks[this.user1] = deck1 as Array<Track>;
          this.decks[this.user2] = deck2 as Array<Track>;
          this.nowPlaying = battle['nowplaying'];
          if (this.nowPlaying) {
            // this.checkTrackPlayback();
            console.log(this.nowPlaying);
          } else {
            this.fetchTrack();
          }
        }
        );
    }



    // if (!this.deckSub1 && this.user1) {
    //   this.deckSub1 = this.deckService.getDeckTracks(this.user1).subscribe(
    //     (tracks) => {
    //       this.decks[this.user1] = tracks as Array<Track>;
    //       // console.log(this.decks);
    //     }
    //     );
    // }    

    // if (!this.deckSub2 && this.user2) {
    //   this.deckSub2 = this.deckService.getDeckTracks(this.user2).subscribe(
    //     (tracks) => {
    //       this.decks[this.user2] = tracks as Array<Track>;
    //       console.log(this.decks);
    //     }
    //     );
    // }

    // if (!this.battleSub && this.battleId) {
    //   this.battleSub = this.battlePlayerService.getBattle(this.battleId).subscribe(
    //     (object) => {
    //       this.nowPlaying = object['nowplaying'];
    //       if (this.nowPlaying) {
    //         // this.checkTrackPlayback();
    //       } else {
    //         this.fetchTrack();
    //       }
    //     }
    //     );
    // }

  }

  switchDJs() {
    if (this.currentDJ === this.user1) {
      this.currentDJ = this.user2;
    } else {
      this.currentDJ = this.user1;
    }
    console.log(`switched to DJ ${this.currentDJ}`);
  }

  fetchTrack() {
    this.switchDJs();
    console.log(this.decks);
    const track = this.decks[this.currentDJ][0];
    // this.deckService.removeFromPool(this.currentDJ, track.id);
    this.battlePlayerService.pushTrack(this.battleId, track);
  }

  private calcProgress(nowPlaying: Track): number {
    return Math.floor( 100 * ( 1 - (nowPlaying.expires_at - this.getTime() ) / nowPlaying.duration_ms) );
  }

  private getTime(): number {
    return new Date().getTime();
  }

  ngOnDestroy(): void {
    this.progressSub.unsubscribe();
    this.combSub.unsubscribe();
  }

  }
