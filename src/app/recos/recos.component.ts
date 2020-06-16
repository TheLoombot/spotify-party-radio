import { Component, OnInit, OnDestroy } from '@angular/core';
/* RxJs */
import { debounceTime } from 'rxjs/operators';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';
import { SpotifyService } from '../shared/services/spotify.service';
/* Models */
import { Track } from '../shared/models/track';
import { StateService } from '../shared/services/state.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recos',
  templateUrl: './recos.component.html',
  styleUrls: ['./recos.component.css']
})
export class RecosComponent implements OnInit, OnDestroy {
  lastFivePlaylistRef;
  lastFiveSub: Subscription;
  recommendations: Array<Track>;
  recoError;
  clicked;
  seedTrackUris: string;

  constructor(
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService,
    private stateService: StateService,
    private titleService: Title
    ) {
  }

  ngOnInit() {
    this.seedTrackUris = '';
    this.lastFivePlaylistRef = this.playlistService.getLastTracks(5);
    this.lastFiveSub = this.lastFivePlaylistRef.valueChanges()
    .pipe(debounceTime(500))
    .subscribe(
      tracks => {
        this.seedTrackUris = '';
        for (const track in tracks) {
          if (tracks[track]['uri']) {
            this.seedTrackUris += `${tracks[track]['uri'].replace('spotify:track:', '')},`;
          }
        }
        this.refreshRecommendations(this.seedTrackUris);
      },
      error => {
        console.log('playlist retrieve error for recos:', error);
      }
      );

  }

  pushTrack(track: Object, i: number) {
    this.clicked = i;
    const user = this.spotifyService.getUser();
    this.playlistService.pushTrack(track, user);
  }

  /** Method to refresh recommended tracks based on seed tracks */
  refreshRecommendations(seedTracksUris?: string): void {
    if (!this.seedTrackUris) {
      console.warn('There were no seeds in playlist');

      //what the fuck does this line of code do?
      // this.seedTrackUris = this.recommendations.map(track => track.id).join();
      return;
    }
    if (this.spotifyService.isTokenAvailable()) {
      this.recommendations = null;
      this.spotifyService.getRecos(this.seedTrackUris)
      .subscribe(
        (reccomendations: any) => {
          this.recommendations = reccomendations.tracks as Array<Track>;
          this.clicked = -1;
        },
        error => {
          console.error(error);
          // Add error state here
          this.recoError = error.error.error;
          this.titleService.setTitle('Logged Out');
          this.stateService.sendError(`Error on refresh recos `, error.error.error.status);
        }
        );
    }
  }

  ngOnDestroy() {
    if (this.lastFiveSub) {
      this.lastFiveSub.unsubscribe();
    }
  }
}
