import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { PlaylistService } from '../playlist.service';

@Component({
  selector: 'app-toptracks',
  templateUrl: './toptracks.component.html',
  styleUrls: ['./toptracks.component.css']
})
export class ToptracksComponent implements OnInit {
  topTracks;
  topTracksError;
  clicked = -1;

  constructor(private spotify: SpotifyService, private playlistSvc: PlaylistService) {
    this.spotify.getTopTracks()
    .subscribe(
      topTracks => {
        // console.log(data);
        this.topTracks = topTracks;
        this.clicked = -1;
      },
      error => {
        this.topTracksError = error.error.error;
      }
    );
  }

  ngOnInit() {
  }

  pushTrack(track: Object, i: number) {
    this.clicked = i;
    this.playlistSvc.pushTrack(track);
  }
}
