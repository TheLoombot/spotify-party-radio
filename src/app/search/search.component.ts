import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { Subject } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	providers: [SpotifyService]
})
export class SearchComponent implements OnInit {

	results: Object;
	searchTerm$ = new Subject<string>();
	searchError;
	playlist;  

	constructor(private spotify: SpotifyService, db: AngularFireDatabase) { 
		this.spotify.search(this.searchTerm$)
		.subscribe(data => {
			this.results = data
			console.log(this.results)
		},
		error => {
			this.searchError = error.error.error.message
		}
		);

		// should probably be a playlist service instead of doing the db calls from here
		this.playlist = db.list('Playlist');

	}

	ngOnInit() {
	}

	pushTrack(track: Object) {

		// IDE hates all this shit because track isn't properly typed?
		console.log("pushing track", track["uri"]);

		console.log("album name", track["album"]["name"]);

		let uri = track["uri"]

		// use itemsRef.set('key-of-some-data', { size: newSize }); 
		// instead of push() so that we can set the URI as our own custom key
		// instead of push()'s automatic key
		// ... we want this so it's easy to check for presence of a given
		// track in the current play list (for search results)
		let playlistEntry = 
			{
				"albumName" : track["album"]["name"],
				"artistName" : track["artists"][0]["name"]
				"expiresAt" : 23,
				"imageUrl" : track["album"]["images"][2]["url"],
				"trackName" : track["name"],
				"uri" : track["uri"]
			}

		this.playlist.push(playlistEntry);

	}


}
