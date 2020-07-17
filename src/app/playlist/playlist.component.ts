import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
/* Services */
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {

  @Input() currentStation: string;
  tracks: Object;
  trackSub;

  constructor(
    private playlistService: PlaylistService
    ) {
  }

  ngOnInit() {
    // ngOnChanges() is called on init! so nothing to do here
  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.trackSub?.unsubscribe();
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
    console.log(`Clicked to remove ${track.name}`);
    this.playlistService.remove(track.key, i);
    if (track.player) {
      this.playlistService.saveTrack(track);
    }
  }

  ngOnDestroy() {
    this.trackSub.unsubscribe();
  }

}
