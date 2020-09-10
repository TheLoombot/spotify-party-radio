import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlaylistService } from '../shared/services/playlist.service';
import { Track } from '../shared/models/track';
import { SpotifyService } from '../shared/services/spotify.service';

@Component({
  selector: 'app-station-pool',
  templateUrl: './station-pool.component.html',
  styleUrls: ['./station-pool.component.css']
})
export class StationPoolComponent implements OnInit {

  @Input() currentStation: string;
  tracks: any[];
  trackSub;

  constructor(
  	private playlistService: PlaylistService,
    private spotifyService: SpotifyService,
  	) { }

  ngOnInit(): void {
    // ngOnChanges() is called on init! so nothing to do here
  }

  ngOnChanges(changes: SimpleChanges) {
    this.tuneToStation(changes['currentStation'].currentValue);
  }

  tuneToStation(stationName: string) {
    this.trackSub?.unsubscribe();
    this.trackSub = this.playlistService.getAllPreviousTracks()
    .subscribe(
      tracks => {
        // I don't know why we have to sort again here... 
        // for some reason orderByChild SOMETIMES returns the order wrong! :(
        this.tracks = tracks.sort((a, b) => a['index'] - b['index']);
        console.log(`Pool update, new size: ${this.tracks.length}`);
        // console.log(this.tracks);
      },
      error => console.error('Playlist retrieves error: ', error)
      );
  }

  moveUp2(i: number) {
    this.tracks.forEach((t, index) => {
      // console.log(`name: ${t.name}, index: ${index}`);
      if (index == (i-1)) {
        this.playlistService.updatePoolTrack(t.id, {index: index+1});
      } else if (index == i) {
        this.playlistService.updatePoolTrack(t.id, {index: index-1});
      } else {
        this.playlistService.updatePoolTrack(t.id, {index: index});
      }
    });
  }

  pushTrack(track: Track, i: number) {
    const user = this.spotifyService.getUserName();
    if (track.player) {
      delete track.player;
    }
    this.playlistService.pushTrack(track, user);
  }


}
