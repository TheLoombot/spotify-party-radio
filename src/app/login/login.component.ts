import { Component, OnInit } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  authorizeURL = 'https://accounts.spotify.com/authorize';
  clientId = '7fafbce74b0b4d78868fbdc6d6b1858b';
  responseType = 'token';
  redirectURI = "https://" + window.location.hostname;
  scope = ['user-read-email',
           'user-read-currently-playing', 
           'user-modify-playback-state',
           'streaming',
           'user-read-playback-state',
           'user-top-read',
           'user-read-email'].join('%20');


  constructor() { 
  }

  ngOnInit() {
    this.authorizeURL += "?" + "client_id=" + this.clientId;
    this.authorizeURL += "&response_type=" + this.responseType;
    this.authorizeURL += "&redirect_uri=" + this.redirectURI;
    this.authorizeURL += "&scope=" + this.scope;
  }

  authSpotify() {
    window.location.href  = this.authorizeURL;
  }

}