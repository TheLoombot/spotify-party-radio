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
	tracksOffset$ = new Subject<number>();
	curTracksOffset = 0;
	pageSize = 3;
	curPlaylistTracks;
	curPlaylist$ = new Subject<string>();
	curPlaylistName: string;
  clicked = -1;

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

		this.spotifyService.getTracksForPlaylist(this.curPlaylist$, this.tracksOffset$)
		.subscribe(
			tracks => {
				this.curPlaylistTracks = tracks;
				// console.log(this.curPlaylistTracks.items);
			},
			error => {
				this.userPlaylistsError = error.error.error;
			}
			);

		this.playlistOffset$.next(this.curPlaylistOffset);
		this.tracksOffset$.next(this.curTracksOffset);
		this.curPlaylist$.next('');
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
		this.curTracksOffset = 0;
		this.tracksOffset$.next(this.curTracksOffset);
		this.curPlaylistName = playlist['name'];
		this.curPlaylist$.next(playlist['id']);
		this.clicked = -1;
	}

	nextTracksPage() {
		this.curTracksOffset += this.pageSize;
		this.tracksOffset$.next(this.curTracksOffset);
		this.clicked = -1;
	}

	prevTracksPage() { 
		this.curTracksOffset -= this.pageSize;
		this.tracksOffset$.next(this.curTracksOffset);
		this.clicked = -1;
	}

	back() {
		this.curPlaylistTracks = null;
		this.curPlaylist$.next('');
		this.clicked = -1;
	}

	pushTrack(track: Object, i: number) {
	  const user = this.spotifyService.getUser();
	  this.clicked = i;
	  this.playlistSvc.pushTrack(track, user);
	}


}
