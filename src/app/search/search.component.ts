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
	lastTrack;

	constructor(private spotify: SpotifyService, db: AngularFireDatabase) { 
		this.spotify.search(this.searchTerm$)
		.subscribe(data => {
			this.results = data
			// console.log(this.results)
		},
		error => {
			this.searchError = error.error.error
		}
		);

		// should probably be a playlist service instead of doing the db calls from here
		this.playlist = db.list('Playlist', ref => ref.limitToLast(1));

		this.playlist.snapshotChanges().subscribe
		(data => {
			if (data[0]) {
				this.lastTrack = data[0].payload.val()
				// console.log("yes last track: ", this.lastTrack)
			} else {
				// console.log("no last track  ");
			}
		},
		error => {
			console.log("playlist retrieve error: ", error)
		})


	}

	ngOnInit() {
	}

	pushTrack(track: Object) {

		console.log("pushing track", track["uri"]);

		// Could in theory create an interface for this object to use dot notation instead?
		let uri = track["uri"]

		let lastTrackExpiresAt;

		// console.log("this last track ", this.lastTrack)

		if (this.lastTrack) {
			lastTrackExpiresAt = this.lastTrack["expiresAt"]
		} else { 
			lastTrackExpiresAt = new Date().getTime();
		}

		// use itemsRef.set('key-of-some-data', { value: SomeValue }); 
		// instead of push() so that we can set the URI as our own custom key
		// instead of push()'s automatic key
		// ... we want this so it's easy to check for presence of a given
		// track in the current play list (for search results to know if a track is already in list)
		let playlistEntry = 
		{
			"albumName" : track["album"]["name"],
			"artistName" : track["artists"][0]["name"],
			"addedAt" : new Date().getTime(),
			"duration" : track["duration_ms"],
			"expiresAt" : lastTrackExpiresAt + track["duration_ms"] + 1000,  // introducing some fudge here
			"imageUrl" : track["album"]["images"][2]["url"],
			"trackName" : track["name"],
			"uri" : track["uri"]
		}



		this.playlist.push(playlistEntry);

	}


}
