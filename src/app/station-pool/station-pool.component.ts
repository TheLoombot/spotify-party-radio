import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-station-pool',
  templateUrl: './station-pool.component.html',
  styleUrls: ['./station-pool.component.css']
})
export class StationPoolComponent implements OnInit {

  @Input() currentStation: string;
  tracks: Object;
  trackSub;

  constructor(
  	private playlistService: PlaylistService,
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
        this.tracks = tracks;
        console.log(`Pool update, new size: ${this.tracks['length']}`);
      },
      error => console.error('Playlist retrieves error: ', error)
      );
  }

}
