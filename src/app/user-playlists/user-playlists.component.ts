import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { PlaylistService } from '../shared/services/playlist.service';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-user-playlists',
	templateUrl: './user-playlists.component.html',
	styleUrls: ['./user-playlists.component.css']
})
export class UserPlaylistsComponent implements OnInit {

	userPlaylistsEnabled: boolean;
	userPlaylists; 
	userPlaylistsError;
	showPlaylists: boolean;
	showTracks: boolean;
	playlistOffset$ = new Subject<number>();
	curPlaylistOffset = 0;
	curTracksOffset = 0;
	pageSize = 3;

	constructor(
		private spotifyService: SpotifyService,
		private playlistSvc: PlaylistService
		) 
	{ 
		this.userPlaylistsEnabled = this.spotifyService.isTokenAvailable();
		this.showPlaylists = true;
		this.showTracks = false;
	}

	ngOnInit(): void {

		this.playlistOffset$.next(this.curPlaylistOffset);

		if (this.userPlaylistsEnabled) {
			this.spotifyService.getUserPlaylists(this.playlistOffset$)
			.subscribe(
				userPlaylists => {
					this.userPlaylists = userPlaylists;
					// console.log(this.userPlaylists);
				},
				error => {
					this.userPlaylistsError = error.error.error;
				}
				);
		}

		this.playlistOffset$.next(this.curPlaylistOffset);
	}

	nextPlaylistPage() {
		this.curPlaylistOffset += this.pageSize;
		this.playlistOffset$.next(this.curPlaylistOffset);
	}

	prevPlaylistPage() {
		this.curPlaylistOffset -= this.pageSize;
		this.playlistOffset$.next(this.curPlaylistOffset);
	}

	clickedPlaylist(playlist: Object) {
		
	}

}
