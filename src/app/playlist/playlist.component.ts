import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SpotifyService } from '../spotify.service';
import { PlaylistService } from '../playlist.service';

@Component({
	selector: 'app-playlist',
	templateUrl: './playlist.component.html',
	styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {

	tracks: Object;
	playBackResponseError; 

	constructor(private spotify: SpotifyService, private playlistSvc: PlaylistService ) { 
		playlistSvc.getAllTracks().valueChanges().subscribe 
		(data => {
			this.tracks = data
			// console.log(this.tracks)
		},
		error => {
			console.log("playlist retrieve error: ", error)
		}
		);
	}

	ngOnInit() {

	}

}
