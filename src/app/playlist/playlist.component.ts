import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-playlist',
	templateUrl: './playlist.component.html',
	styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {

	tracks: Object;

	constructor(db: AngularFireDatabase) { 
		db.list('Playlist').valueChanges().subscribe 
		(data => {
			this.tracks = data
			console.log(this.tracks)
		},
		error => {
			console.log("playlist retrieve error")
		}
		);
	}

	ngOnInit() {

	}

}
