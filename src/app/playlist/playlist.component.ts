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
          console.log(this.tracks);
        },
        error => {
          console.log('Playlist retrieves error: ', error);
        }
      );
  } 

  ngOnInit() { }

  removeTrack(track: any, i: number): void {
    // add 1 to the index because we slice off the first track
    i++;
    console.log('Clicked to remove track:', i);
    this.playlistSvc.remove(track.key, i);
  }
}
