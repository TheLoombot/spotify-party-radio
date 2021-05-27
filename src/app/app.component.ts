import { Component, OnInit } from '@angular/core';
/* Models */
import { User } from './shared/models/user';
/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { StateService } from './shared/services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  appEnabled: boolean = false;
  station: string; 

  constructor (
    private spotifyService: SpotifyService,
    private stateService: StateService,
    ) {
  }

  ngOnInit () {

    this.stateService.getState().
    subscribe(
      state => {
        console.log("STATE " + state['enabled']);
        this.appEnabled = state['enabled'];
      }
      );

    this.checkAuth();

  }

  onDeactivate (componentRef) {
    console.log("DEACTIVATED!");
    this.checkAuth();
  }

  checkAuth() {
    console.log("CHECKING auth");
    this.spotifyService.getUserProfile()
    .subscribe(
      (user: User) => {
        this.spotifyService.setUser(user);
        console.log("AUTHENTICATED AS " + user['display_name']);
        this.stateService.sendState(
          { enabled: true ,
          });
        this.station=user['display_name'];
      },
      error => {
        console.log("Check AUTH ERROR");
        console.error('getUserProfile:', error);
        this.appEnabled = false;
      }
      );
  }


}

