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

  constructor (
    private cdr: ChangeDetectorRef,
    private stateService: StateService,
    private spotifyService: SpotifyService,
  ) {
    this.appEnabled = false; // Disable components
  }

  ngOnInit () {
    this.stateService.getState()
      .subscribe(
        (state: State) => {
          this.appEnabled = state.enabled;
        },
        error => console.error(error),
        () => {
          this.cdr.detectChanges();
        }
      );
  }
}

