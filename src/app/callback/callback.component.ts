import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../shared/services/spotify.service';
import { StateService } from '../shared/services/state.service';

@Component({
	selector: 'app-callback',
	templateUrl: './callback.component.html',
	styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

	constructor(    
		private route: ActivatedRoute,
		private spotifyService: SpotifyService,
		private stateService: StateService,
		private router: Router,
		) { }

	ngOnInit(): void {
		if (this.route.snapshot.fragment) {
			console.log(`fragment in callback is ${this.route.snapshot.fragment}`);
			const params = this.route.snapshot.fragment.split('&');
			window.location.hash = '';
			for (const paramString of params) {
				const paramArray = paramString.split('=');
				if (paramArray[0] === 'access_token') {
					const accessToken = paramArray[1];
					window.localStorage.setItem('access_token', accessToken);
					this.spotifyService.setToken(accessToken);
				}
			}
		}
		this.router.navigate([""]);
	}

}
