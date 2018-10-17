import { Component, OnInit } from '@angular/core';
/* RxJs */
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';
import { SpotifyService } from '../shared/services/spotify.service';

@Component({
  selector: 'app-recos',
  templateUrl: './recos.component.html',
  styleUrls: ['./recos.component.css']
})
export class RecosComponent implements OnInit {
  lastFivePlaylistRef;
  lastFiveTrackUris;
  recos;
  recoError;
  clicked;
  lastTrackPlaylistRef;
  lastTrack;
  RecoTracksEnabled: boolean;

  constructor(
    private spotifyService: SpotifyService,
    private playlistSvc: PlaylistService
  ) {
    this.lastFivePlaylistRef = playlistSvc.getLastTracks(5);
    this.lastFivePlaylistRef.valueChanges()
      .pipe(debounceTime(300))
      .subscribe(
        tracks => {
          this.lastFiveTrackUris = '';
          console.log(tracks);
          for (let track in tracks) {
            this.lastFiveTrackUris += tracks[track]['uri'].replace('spotify:track:','');
            this.lastFiveTrackUris += ',';
          }
          this.refreshRecos();
        },
        error => {
          console.log('playlist retrieve error for recos:', error);
        }
      );
  }

  ngOnInit() {
  }

  pushTrack(track: Object, i: number) {
    console.log('Push Recommended track:', track);
    this.clicked = i;
    this.playlistSvc.pushTrack(track, 'pablovem');
  }

  refreshRecos() {
    if (this.spotifyService.isTokenAvailable()) {
      this.spotifyService.getRecos(this.lastFiveTrackUris)
      .subscribe(
        data => {
          this.recos = data;
          console.log(data);
          this.clicked = -1;
        },
        error => {
          this.recoError = error.error.error;
        }
      );
    }
  }
}
