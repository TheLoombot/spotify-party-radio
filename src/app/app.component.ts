import { Component, OnInit } from '@angular/core';
/* Models */
import { User } from './shared/models/user';
/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appEnabled: boolean;
  user: User;

  constructor (
    private spotifyService: SpotifyService,
    private router: Router,
  ) {
  }

  checkAuth() {
    this.spotifyService.getUserProfile()
    .subscribe(
      (user: User) => {
        this.user = user;
        this.appEnabled = true;
        console.log(`got a user object back ${this.user}`);
      },
      error => {
        console.error('getUserProfile:', error);
        this.appEnabled = false;
      }
      );
  }

  onDeactivate (componentRef) {
    console.log("DEACTIVATED!");
    this.checkAuth();
  }

  ngOnInit () {
    this.checkAuth();
  }
}

