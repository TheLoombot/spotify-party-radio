/* Core */
import { Component, OnInit } from '@angular/core';
/* RxJs */
import { Subscription } from 'rxjs';
/* Models */
import { User } from '../shared/models/user';
/* Services */
import { SpotifyService } from '../shared/services/spotify.service';

@Component({
  selector: 'app-perform-login',
  templateUrl: './perform-login.component.html',
  styleUrls: ['./perform-login.component.css']
})
export class PerformLoginComponent implements OnInit {

  constructor(
    private spotifyService: SpotifyService,
  ) {

  }

  ngOnInit() {
    
  }

  authSpotify() {
    window.location.href = this.spotifyService.getAuthUrl();
    return false;
  }

}
