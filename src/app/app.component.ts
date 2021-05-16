import { Component, OnInit } from '@angular/core';
/* Models */
import { User } from './shared/models/user';
/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from './shared/services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appEnabled: boolean;

  constructor (
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private router: Router,
    private stateService: StateService,
    ) {
  }

  ngOnInit () {
    this.stateService.getState().
    subscribe(
      state => {
        this.appEnabled = state['enabled'];
      }
      );
  }
}

