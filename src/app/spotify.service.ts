import { Injectable } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SpotifyService {

	authorizeURL = 'https://accounts.spotify.com/authorize';
	clientId = '7fafbce74b0b4d78868fbdc6d6b1858b';
	responseType = 'token';
	redirectURI = "https://" + window.location.hostname;
	scope = ['user-read-email',
	'user-read-currently-playing', 
	'user-modify-playback-state',
	'streaming',
	'user-read-playback-state',
	'user-read-private',
	'user-top-read',
	'user-read-email'].join('%20');

	baseUrl: string = 'https://api.spotify.com/v1';

	constructor(private http: HttpClient) { }

	user() { 
		return this.http.get(this.baseUrl + '/me');
	}

	getNowPlaying() { 
		return this.http.get(this.baseUrl + '/me/player/currently-playing');
	}

	getAuthUrl() {
		this.authorizeURL += "?" + "client_id=" + this.clientId;
		this.authorizeURL += "&response_type=" + this.responseType;
		this.authorizeURL += "&redirect_uri=" + this.redirectURI;
		this.authorizeURL += "&scope=" + this.scope;
		return this.authorizeURL;
	}

	search(terms: Observable<string>) {
		return terms.pipe(
			debounceTime(400),
			distinctUntilChanged()).pipe(switchMap(
				term => (term && term.trim().length > 0) ? 
				this.searchEntries(term)
				:
				this.searchEntries("lizzo")   // called when search is empty, replace this with recommended tracks
				))
		}

		searchEntries(term) {
			return this.http.get(this.baseUrl + "/search?type=track,album,artist&limit=5&q=" + term);
		}

		playTrack(uri: string) {
			let bodyObj = {
				"uris": [uri]
			}

			// console.log(new Date().getTime(), "attempting to play ", uri);

			return this.http.put(this.baseUrl + "/me/player/play", JSON.stringify(bodyObj))

		}

		seekTrack(offset: number) {
			if (offset < 2000) return of([]);
			console.log(new Date().getTime(), " seeking to position ", offset)
			return this.http.put(this.baseUrl + "/me/player/seek?position_ms=" + offset, null)
		}

	}
