import { Component, OnInit } from '@angular/core';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  tracks: Object;

  constructor(
    private playlistService: PlaylistService
  ) {
    playlistService.getAllTracks()
      .subscribe(
        tracks => {
          this.tracks = tracks;
          console.log('Playlist update:', this.tracks['length'], 'tracks');
        },
        error => console.error('Playlist retrieves error: ', error)
      );
  }

  ngOnInit() { }

  removeTrack(track: any, i: number): void {
    // add 1 to the index because we slice off the first track
    i++;
    console.log('Clicked to remove track:', i);
    console.warn('Remove Track:', track);
    this.playlistService.remove(track.key, i);
  }
}
