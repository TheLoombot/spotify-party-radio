import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
/* Models */
import { State } from './shared/models/state';
/* Services */
import { StateService } from './shared/services/state.service';
import { SpotifyService } from './shared/services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appEnabled: boolean;
  stationLoading: boolean;
  state: State;
  station: string;

  constructor (
    private cdr: ChangeDetectorRef,
    private stateService: StateService,
    private spotifyService: SpotifyService,
  ) {
    this.appEnabled = false; // Disable components
    this.stationLoading = true;
  }

  userOwnsStation(): boolean {
    if (this.station == this.spotifyService.getUserName()) return true;
    return false;
  }


  ngOnInit () {
    this.stateService.getState()
      .subscribe(
        (state: State) => {
          this.state = state;
          if (state.station) {
            this.station = state.station;
          }
          this.appEnabled = state.enabled;
          this.stationLoading = state.loading;
          // console.log('State obtained in app:', this.state);
        },
        error => console.error(error),
        () => {
          this.cdr.detectChanges();
        }
      );
  }
}

