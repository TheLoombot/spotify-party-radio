import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SpotifyService } from '../spotify.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css'],
  providers: [SpotifyService]
})
export class PerformLoginComponent implements OnInit {

  user: Object;

  accessTokenNew: string;        // a new token from URL hash fragment params
  accessTokenStored: string;     // an old token from localStorage
  hasToken = true;

  authorizeURL = 'https://accounts.spotify.com/authorize';
  clientId = '7fafbce74b0b4d78868fbdc6d6b1858b';
  responseType = 'token';
  redirectURI = "https://" + window.location.hostname;
  scope = ['user-read-email',
  'user-read-currently-playing', 
  'user-modify-playback-state',
  'streaming',
  'user-read-playback-state',
  'user-read-private',
  'user-top-read',
  'user-read-email'].join('%20');

  constructor(private route: ActivatedRoute,
    public http: HttpClient,
    private spotify: SpotifyService
    ) { }

  ngOnInit() {
    // The "fragment" is hash fragment, which we can access only as a string
    // Its presence means we're getting a callback from Spotify
    if (this.route.snapshot.fragment) {
      const params = this.route.snapshot.fragment.split("&");

      window.location.hash = "";
      for (let paramString of params) {
        let paramArray = paramString.split("=");
        if (paramArray[0]=="access_token") {
          this.accessTokenNew = paramArray[1];
          window.localStorage.setItem("access_token", this.accessTokenNew);
        }
      }
    // Otherwise we get the locally-stored token
  } else if (window.localStorage.getItem("access_token")) {
    this.accessTokenStored = window.localStorage.getItem("access_token"); 
    // Other otherwise we show the login button
  } else { 
    this.hasToken = false;
    this.authorizeURL += "?" + "client_id=" + this.clientId;
    this.authorizeURL += "&response_type=" + this.responseType;
    this.authorizeURL += "&redirect_uri=" + this.redirectURI;
    this.authorizeURL += "&scope=" + this.scope;
  }

  this.spotify.user().subscribe(
    data => this.user = data
  ) 

}

authSpotify() {
  window.location.href  = this.authorizeURL;
}


}