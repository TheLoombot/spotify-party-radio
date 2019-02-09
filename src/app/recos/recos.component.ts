import { Component, OnInit, OnDestroy } from '@angular/core';
/* RxJs */
import { debounceTime } from 'rxjs/operators';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';
import { SpotifyService } from '../shared/services/spotify.service';
/* Models */
import { Track } from '../shared/models/track';

@Component({
  selector: 'app-recos',
  templateUrl: './recos.component.html',
  styleUrls: ['./recos.component.css']
})
export class RecosComponent implements OnInit, OnDestroy {
  lastFivePlaylistRef;
  recommendations: Array<Track>;
  recoError;
  clicked;

  constructor(
    private spotifyService: SpotifyService,
    private playlistService: PlaylistService
  ) {
    this.lastFivePlaylistRef = playlistService.getLastTracks(5);
    this.lastFivePlaylistRef.valueChanges()
      .pipe(debounceTime(2000))
      .subscribe(
        tracks => {
          let seedTracksUris = '';
          for (const track in tracks) {
            if (tracks[track]['uri']) {
              seedTracksUris += `${tracks[track]['uri'].replace('spotify:track:', '')},`;
            }
          }
          this.refreshRecommendations(seedTracksUris);
        },
        error => {
          console.log('playlist retrieve error for recos:', error);
        }
      );
  }

  ngOnInit() {
  }

  pushTrack(track: Object, i: number) {
    // console.log('Push Recommended track:', track);
    this.clicked = i;
    const user = this.spotifyService.getUser();
    this.playlistService.pushTrack(track, user.display_name || user.id);
  }

  /** Method to refresh recommended tracks based on seed tracks */
  refreshRecommendations(seedTracksUris: string): void {
    if (!seedTracksUris) {
      seedTracksUris = this.recommendations.map(track => track.id).join();
    }
    if (this.spotifyService.isTokenAvailable()) {
      this.spotifyService.getRecos(seedTracksUris)
        .subscribe(
          (reccomendations: any) => {
            this.recommendations = reccomendations.tracks as Array<Track>;
            this.clicked = -1;
          },
          error => {
            console.error(error);
            // Add error state here
            this.recoError = error.error.error;
          }
        );
    }
  }

  ngOnDestroy() {
  }
}
