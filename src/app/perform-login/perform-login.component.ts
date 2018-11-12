/* Core */
import { Component, OnInit, Input } from '@angular/core';
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
  isLocalhost: boolean;
  user: User;
  accessTokenNew: string; // a new token from URL hash fragment params
  accessTokenStored: string; // an old token from localStorage
  availableToken: boolean;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private stateService: StateService
  ) {
    this.isLocalhost = false; // Default state
    this.availableToken = true; // Default state
    this.cleanLocalStorage();
  }

  ngOnInit() {
    if (location.hostname === 'localhost') {
      this.isLocalhost = true;
    }
    if (this.manageToken()) {
      this.spotifyService.getUserProfile()
        .subscribe(
          (user: User) => {
            console.log('User:', user);
            this.spotifyService.setUser(user);
            this.user = user;
            this.stateService.sendState({ enabled: true });
          },
          error => {
            console.error('getUserProfile:', error);
            this.stateService.sendError(`There is no available user, ${error.error.error.message}`, error.error.error.status);
            window.localStorage.removeItem('access_token');
            this.spotifyService.sendToken(null);
            this.spotifyService.setUser(null);
            this.accessTokenStored = null;
            this.availableToken = false;
          }
        );
    } else {
      this.stateService.sendError('There is no available token');
    }
  }

  /** Method to manage Spotify token within the application */
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

  /** Method to clean token from local storage */
  private cleanLocalStorage(): void {
    this.accessTokenNew = '';
    this.accessTokenStored = '';
  }

  authSpotify() {
    window.location.href = this.spotifyService.getAuthUrl();
  }

  /** Method kill token */
  killToken() {
    console.warn('Removing Token');
    this.stateService.sendError(`There is no available token`);
    window.localStorage.removeItem('access_token');
    this.accessTokenStored = null;
    this.availableToken = false;
    this.user = null;
  }
}
