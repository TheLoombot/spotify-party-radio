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


	constructor(private spotify: SpotifyService) { 
		this.spotify.search(this.searchTerm$)
		.subscribe(data => {
			this.results = data
		},
		error => {
			console.log("error!!! why doesn't it recover in this condition??")
		}
		);
	}

	ngOnInit() {
	}

}
