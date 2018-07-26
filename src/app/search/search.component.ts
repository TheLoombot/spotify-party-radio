import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	providers: [SpotifyService]
})
export class SearchComponent implements OnInit {

	results: Object;
	searchTerm$ = new Subject<string>();
	playBackResponse;

	constructor(private spotify: SpotifyService) { 
		this.spotify.search(this.searchTerm$)
		.subscribe(data => {
			this.results = data
			console.log(this.results)
		},
		error => {
			console.log("search error")
		}
		);
	}

	ngOnInit() {
	}

	playTrack(uri: string) {
		this.spotify.playTrack(uri)
		.subscribe(response => {
			this.playBackResponse = response
		}, 
		error => {
			this.playBackResponse = error.error.error.message
		}
		)
	}

}
