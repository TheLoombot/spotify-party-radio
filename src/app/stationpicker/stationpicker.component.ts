import { Component, OnInit } from '@angular/core';
import { StateService } from '../shared/services/state.service';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
  selector: 'app-stationpicker',
  templateUrl: './stationpicker.component.html',
  styleUrls: ['./stationpicker.component.css']
})
export class StationpickerComponent implements OnInit {

  currentStation: string;

  constructor(
    private stateService: StateService,
    private playlistService: PlaylistService,
    ) { }

  ngOnInit() {
    this.currentStation = 'loombot';
  }

  onClick() {
    if (this.currentStation == 'loombot') {
      this.currentStation = 'poop';
      this.stateService.sendState({ enabled: true, loading: true, station: "poop" });
      this.playlistService.setStation("poop");
      // I don't know why I need to delay this but if you run it immediately
      // then shit just don't work 
      setTimeout(() => {
        this.stateService.sendState({ enabled: true, loading: false, station: "poop" });
      }, 1);

    } else {
      this.currentStation = 'loombot';
      this.stateService.sendState({ enabled: true, loading: false, station: "loombot" });
    }

    console.log(`clicked for ${this.currentStation}`);

  }

}
