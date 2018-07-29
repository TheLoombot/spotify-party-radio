import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { SpotifyService } from '../spotify.service';

@Component({
	selector: 'app-playlist',
	templateUrl: './playlist.component.html',
	styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {

	tracks: Object;
	playBackResponseError; 

	constructor(private spotify: SpotifyService, db: AngularFireDatabase) { 
		db.list('Playlist').valueChanges().subscribe 
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

	playTrack(uri: string) {
		this.spotify.playTrack(uri)
		.subscribe(response => {
			this.playBackResponseError = response
		}, 
		error => {
			this.playBackResponseError = error.error.error
			console.log("play back error ", this.playBackResponseError)
		}
		)
	}


}
