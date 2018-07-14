import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  client_id = "7fafbce74b0b4d78868fbdc6d6b1858b";
  response_type = "token";
  redirect_uri = "https://poop-a1c0e.firebaseapp.com/redirect";
  authorizationUrl = "https://accounts.spotify.com/authorize?"; 


  constructor() { }

  ngOnInit() {
    this.authorizationUrl += "&client_id=" + this.client_id; 
    this.authorizationUrl += "&response_type=" + this.response_type;
    this.authorizationUrl += "&redirect_uri=" + this.redirect_uri;
    this.authorizationUrl += "&scope=streaming";

  }

  authSpotify() {
    window.open(this.authorizationUrl);
  }

}
