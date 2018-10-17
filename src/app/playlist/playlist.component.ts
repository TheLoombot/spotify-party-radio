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
        },
        error => console.error('Playlist retrieves error: ', error)
      );
  }

  ngOnInit() { }

  removeTrack(track: any): void {
    console.warn('Remove Track:', track);
    this.playlistService.remove(track.key);
  }
}
