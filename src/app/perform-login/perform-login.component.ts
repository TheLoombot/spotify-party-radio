/* Core */
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
/* RxJs */
import { Subscription } from 'rxjs';
/* Models */
import { User } from '../shared/models/user';
import { State } from '../shared/models/state';
/* Services */
import { SpotifyService } from '../shared/services/spotify.service';
import { StateService } from '../shared/services/state.service';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {
  availableToken: boolean;
  isLocalhost: boolean;
  user: User;
  username: string;
  accessTokenNew: string; // a new token from URL hash fragment params
  accessTokenStored: string; // an old token from localStorage
  stateSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
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
            this.username = this.user.display_name ? this.user.display_name : this.user.id;
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

    this.stateSubscription = this.stateService.getState()
    .subscribe(
      (state: State) => {
        console.log('State obtained in app:', state);
        this.availableToken = state.enabled;
      },
      error => console.error(error),
      () => {
        this.cdr.detectChanges();
      }
    );
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
