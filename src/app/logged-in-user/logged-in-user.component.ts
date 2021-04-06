import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-logged-in-user',
  templateUrl: './logged-in-user.component.html',
  styleUrls: ['./logged-in-user.component.css']
})
export class LoggedInUserComponent implements OnInit {

	isLocalhost: boolean;
	user;
  userName: string;
  accessToken: string;

  constructor(
  	private spotifyService: SpotifyService,
    private titleService: Title,
  	) { }

  ngOnInit(): void {
  	if (location.hostname === 'localhost') {
  	  this.isLocalhost = true;
  	}

  	this.user = this.spotifyService.getUser();
    this.userName = this.spotifyService.getUserName();

  }

  signOut() {
    console.warn('Removing Token');
    this.titleService.setTitle('Logged Out');
    this.spotifyService.clearToken();
  }


}
