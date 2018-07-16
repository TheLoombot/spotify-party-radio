import { Component, OnInit } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

/** Call the Firebase function that will initiate the Spotify auth flow
    TODO update this so it's not environment-specific */
  authSpotify() {
    window.location.href  = 'https://us-central1-poop-a1c0e.cloudfunctions.net/redirect';
  }

}
