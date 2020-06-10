import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';

@Component({
	selector: 'app-user-playlists',
	templateUrl: './user-playlists.component.html',
	styleUrls: ['./user-playlists.component.css']
})
export class UserPlaylistsComponent implements OnInit {

  userPlaylistsEnabled: boolean;
  userPlaylists; 
  userPlaylistsError;
  
	constructor(
		private spotifyService: SpotifyService,
		private playlistSvc: PlaylistService
		) 
	{ 
		this.userPlaylistsEnabled = this.spotifyService.isTokenAvailable();
	}

	ngOnInit(): void {

		if (this.userPlaylistsEnabled) {
		  this.spotifyService.getUserPlaylists()
		    .subscribe(
		      userPlaylists => {
		        this.userPlaylists = userPlaylists;
		      },
		      error => {
		        this.userPlaylistsError = error.error.error;
		      }
		    );
		}


	}

	clickedPlaylist(playlist: Object) {
		
	}

}
