import { Component, OnInit } from '@angular/core';
/* Services */
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-toptracks',
  templateUrl: './toptracks.component.html',
  styleUrls: ['./toptracks.component.css']
})
export class ToptracksComponent implements OnInit {
  topTracks;
  topTracksError;
  clicked = -1;
  topTracksEnabled: boolean;

  constructor(
    private spotifyService: SpotifyService,
    private playlistSvc: PlaylistService
  ) {
    this.topTracksEnabled = this.spotifyService.isTokenAvailable();
  }

  ngOnInit() {
    if (this.topTracksEnabled) {
      this.spotifyService.getTopTracks()
        .subscribe(
          topTracks => {
            this.topTracks = topTracks;
            this.clicked = -1;
          },
          error => {
            this.topTracksError = error.error.error;
          }
        );
    }
  }

  pushTrack(track: Object, i: number) {
    const user = this.spotifyService.getUser();
    this.clicked = i;
    this.playlistSvc.pushTrack(track, user.display_name || user.id);
  }
}
