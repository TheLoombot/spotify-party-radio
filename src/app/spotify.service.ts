import { Injectable } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class SpotifyService {

	baseUrl: string = 'https://api.spotify.com/v1';

	constructor(private http: HttpClient) { }

	user() { 
		return this.http.get(this.baseUrl + '/me');
	}

}
