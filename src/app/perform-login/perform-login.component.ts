import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../spotify.service';

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

  constructor(private route: ActivatedRoute,
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
  }

  this.spotify.user().subscribe(
    data => { 
      this.user = data
    },
    error => {
      window.localStorage.removeItem("access_token");
      this.accessTokenStored = null;
      this.hasToken = false;
    }
  )

}

authSpotify() {
  window.location.href  = this.spotify.getAuthUrl();
}

killToken() {
      window.localStorage.removeItem("access_token");
      this.accessTokenStored = null;
      this.hasToken = false;
      this.user = null;

}

}