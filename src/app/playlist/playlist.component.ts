import { Component, OnInit, OnDestroy } from '@angular/core';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {


  tracks: Object;
  trackSub;

  constructor(
    private playlistService: PlaylistService
    ) {
  }

  ngOnInit() {

    this.trackSub = this.playlistService.getAllTracks()
    .subscribe(
      tracks => {
        this.tracks = tracks;
        console.log(`Playlist update, new size: ${this.tracks['length']}`);
      },
      error => console.error('Playlist retrieves error: ', error)
      );

  }

  removeTrack(track: any, i: number): void {
    // add 1 to the index because we slice off the first track
    i++;
    console.log('Clicked to remove track:', i);
    // console.warn('Remove Track:', track);
    this.playlistService.remove(track.key, i);
  }

  ngOnDestroy() {
    this.trackSub.unsubscribe();
  }

}
