import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../shared/services/state.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stationpicker',
  templateUrl: './stationpicker.component.html',
  styleUrls: ['./stationpicker.component.css']
})
export class StationpickerComponent implements OnInit {

  currentStation: string;
  stationSub: Subscription;
  stations: Object;

  constructor(
    private stateService: StateService,
    private playlistService: PlaylistService,
    ) { }

  ngOnInit() {
    this.currentStation = this.playlistService.getStation();
    this.stationSub = this.playlistService.getAllStations()
    .subscribe(
      stations => {
        this.stations = stations;
        console.log(`Total stations: ${this.stations['length']}`);
        console.log(this.stations[0].lists.playlist);
      },
      error => console.error('Playlist retrieves error: ', error)
      );
  }


  setStation(stationKey) {
    this.stateService.sendState({ enabled: true, loading: true, station: stationKey });
    this.playlistService.setStation(stationKey);
    setTimeout(() => {
      this.stateService.sendState({ enabled: true, loading: false, station: stationKey });
    }, 1);
    this.currentStation = stationKey;
  }

  ngOnDestroy() {
    if (this.stationSub) {
      this.stationSub.unsubscribe();
    }
  }

}
