import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
/* RxJs */
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { combineLatest } from 'rxjs';
/* Models */
import { User } from '../models/user';
/* Others */
import { environment } from '../../../environments/environment';
import { StateService } from './state.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  token: string = null;
  private tokenSubject: Subject<any>;
  user: User;
  authorizeURL = 'https://accounts.spotify.com/authorize';
  clientId: string = environment.spotify.clientId;
  baseUrl: string = environment.spotify.apiURL;
  responseType: string = 'token';
  redirectURI = 'https://' + window.location.hostname + '/auth';
  
  scope = [
  'user-read-email',
  'user-read-currently-playing',
  'user-modify-playback-state',
  'streaming',
  'user-read-playback-state',
  'user-read-private',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative'
  ].join('%20');

  constructor(
    private http: HttpClient,
    private stateService: StateService,
    private router: Router,
  ) {

    if (window.localStorage.getItem('access_token')) {
      const accessTokenStored = window.localStorage.getItem('access_token');
      this.setToken(accessTokenStored);
    }
  }

  setToken(token: string): void {
    this.token = token;
    this.getUserProfile()
    .subscribe(
      (user: User) => {
        this.user = user;
        this.stateService.sendState({ enabled: true });
        if (this.router.url === '/auth' || this.router.url === '/') {
          this.router.navigate(["", this.getUserName() ]);
        } 
      },
      error => {
        console.error('getUserProfile:', error);
        this.stateService.sendError(`There is no available user, ${error.error.error.message}`, error.error.error.status);
        window.localStorage.removeItem('access_token');
        // this.accessTokenStored = null;
        // this.availableToken = false;
      }
      );
  }

  getToken(): string {
    return this.token;
  }

  clearToken(): void {
    this.pauseTrack()
    .subscribe(
      () => {},
      error => {
      }
      );
    this.stateService.sendError(`There is no available token`);
    this.token = null;
    window.localStorage.removeItem('access_token');
  }

  getUserName(): string {
    return (this.user.display_name || this.user.id);
  }

  getUser() {
    return this.user;
  }

  /** Get Current User's Profile */
  getUserProfile() {
    return this.http.get(this.baseUrl + '/me');
  }

  getNowPlaying() {
    return this.http.get(this.baseUrl + '/me/player/currently-playing');
  }

  getAuthUrl(): string {
    this.authorizeURL += '?' + 'client_id=' + this.clientId;
    this.authorizeURL += '&response_type=' + this.responseType;
    this.authorizeURL += '&redirect_uri=' + this.redirectURI;
    this.authorizeURL += '&scope=' + this.scope;
    return this.authorizeURL;
  }

  search(terms: Observable<string>, offset: Observable<number>) {
    return combineLatest(offset, terms.pipe(debounceTime(400), distinctUntilChanged()))
    .pipe(switchMap(([offset, term]) => (term && term.trim().length > 0) ?
      this.searchEntries(term, offset)
      :
      of([])
      ));
  }

  searchEntries(term: string, offset: number) {
    console.log(`🕵🏽‍♀️${term}, offset - ${offset}`);
    return this.http.get(this.baseUrl + '/search?type=track,album,artist&offset=' + offset + '&limit=3&q=' + term);
  }

  // I don't know why but for some reason on this request we have to be explicit
  // about the fields we want, track.album.images[] doesn't come down automatically :(
  getTracksForPlaylist(playlistId: Observable<string>, offset: Observable<number>) {
    return combineLatest(playlistId, offset)
    .pipe(switchMap(([playlistId, offset]) => (playlistId) ?
      this.http.get(this.baseUrl + '/playlists/' + playlistId + '/tracks?limit=3&fields=total,items(track(name,duration_ms,artists,id,uri,href,images,album(name,images,external_urls(spotify))))&offset=' + offset)
      :
      of([])
      ));
  }

  getUserPlaylists(offset: Observable<number>) { 
    return offset.pipe(switchMap(offset => this.http.get(this.baseUrl + '/me/playlists?limit=3&offset=' + offset)));
  }

  playTrack(uri: string) {
    const bodyObj = {
      'uris': [uri]
    };
    return this.http.put(this.baseUrl + '/me/player/play?device_id=a89872700dfd973914222c17041462a02ff3c6c0', JSON.stringify(bodyObj));
  }

  pauseTrack() {
    return this.http.put(this.baseUrl + '/me/player/pause', null);
  }

  seekTrack(offset: number) {
    if (offset < 2000) return of([]);
    console.log(`Seeking to position ${offset}`);
    return this.http.put(this.baseUrl + '/me/player/seek?position_ms=' + offset, null);
  }

  getRecos(ids: string) {
    if (ids) {
      return this.http.get(this.baseUrl + '/recommendations?limit=3&min_popularity=50&seed_tracks=' + ids);
    } else {
      return of([]);
    }
  }

  getTopTracks() {
    return this.http.get(this.baseUrl + '/me/top/tracks?limit=3&time_range=short_term');
  }

  getTrackById(id: string) {
    return this.http.get(this.baseUrl + '/tracks/' + id);
  }

}
