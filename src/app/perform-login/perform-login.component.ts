import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
/* Models */
import { User } from '../shared/models/user';
/* Services */
import { SpotifyService } from '../shared/services/spotify.service';
import { StateService } from '../shared/services/state.service';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {
  user: User;
  accessTokenNew: string; // a new token from URL hash fragment params
  accessTokenStored: string; // an old token from localStorage
  availableToken: boolean;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private stateService: StateService
  ) {
    this.availableToken = true; // Default state
    this.cleanLocalStorage();
  }

  ngOnInit() {
    if (this.manageToken()) {
      this.spotifyService.getUserProfile()
        .subscribe(
          (user: User) => {
            console.log('User:', user);
            this.spotifyService.setUser(user);
            const state = {
              enabled: true
            };
            this.user = user;
            this.stateService.sendState(state);
          },
          error => {
            console.error('getUserProfile:', error);
            const state = {
              enabled: false,
              error: {
                code: error.error.status,
                message: `There is no available user, ${error.error.message}`
              }
            };
            this.stateService.sendState(state);
            window.localStorage.removeItem('access_token');
            this.spotifyService.sendToken(null);
            this.spotifyService.setUser(null);
            this.accessTokenStored = null;
            this.availableToken = false;
          }
        );
    } else {
      const state = {
        enabled: false,
        error: {
          message: 'There is no available token'
        }
      };
      this.stateService.sendState(state);
    }
  }

  private manageToken(): boolean {
    // The "fragment" is hash fragment, which we can access only as a string
    // Its presence means we're getting a callback from Spotify
    if (this.route.snapshot.fragment) {
      const params = this.route.snapshot.fragment.split('&');
      window.location.hash = '';
      for (const paramString of params) {
        const paramArray = paramString.split('=');
        if (paramArray[0] === 'access_token') {
          this.accessTokenNew = paramArray[1];
          window.localStorage.setItem('access_token', this.accessTokenNew);
        }
      }
    // Otherwise we get the locally-stored token
    } else if (window.localStorage.getItem('access_token')) {
      this.accessTokenStored = window.localStorage.getItem('access_token');
      this.spotifyService.setToken(this.accessTokenStored);
      this.spotifyService.sendToken(this.accessTokenStored);
      // Other otherwise we show the login button
    } else {
      this.availableToken = false;
      // Service should be alerted
      this.spotifyService.setToken(null);
    }
    return this.availableToken;
  }

  private cleanLocalStorage(): void {
    this.accessTokenNew = '';
    this.accessTokenStored = '';
  }

  authSpotify() {
    window.location.href  = this.spotifyService.getAuthUrl();
  }

  killToken() {
    window.localStorage.removeItem('access_token');
    this.accessTokenStored = null;
    this.availableToken = false;
    this.user = null;
  }
}
