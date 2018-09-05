import { Component, OnInit } from '@angular/core';
import { PlaylistService } from '../playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  tracks: Object;
  playBackResponseError: any;

  constructor(
    private playlistSvc: PlaylistService
  ) {
    playlistSvc.getAllTracks()
      .subscribe(
        data => {
          this.tracks = data;
          // console.log(this.tracks);
        },
        error => {
          console.log('Playlist retrieves error: ', error);
        }
      );
  }

  ngOnInit() { }

  removeTrack(track: any): void {
    console.log('Remove Track:', track);
    this.playlistSvc.remove(track.key);
  }
}
